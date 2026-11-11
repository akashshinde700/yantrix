"""
Yantrix Technology website -- deploy this repo to the CloudPanel VPS that
serves https://www.yantrixtechnology.com (189.72.144.215).

Production shape:
  - Next.js 16 standalone build, PM2 process `yantrix`, port 3000
  - PM2 runs  <APP>/.next/standalone/server.js  with cwd = .next/standalone
  - MySQL database `yantrix` (CloudPanel). The app creates its own tables
    (CREATE TABLE IF NOT EXISTS), so there is no migration step.
  - Env comes from <APP>/.env, copied to .next/standalone/.env on every
    deploy. The first deploy writes it from your local .env (DATABASE_URL
    pointed at the server database, a fresh ADMIN_SESSION_SECRET,
    CONTENT_STORE=mysql). After that the server's .env is the source of truth
    and this script never rewrites it.

  The build happens in a separate staging dir so the live app keeps running,
  then the new .next is swapped in. The old .next is kept under
  ~/backups/releases/ for --rollback.

Run:
  python deploy.py              # build in staging, swap, restart, health check
  python deploy.py --check      # read-only status of the live site
  python deploy.py --rollback   # put the previous release back
  python deploy.py --stage      # upload + type check + build in staging only
                                #   (live site untouched)
  python deploy.py --push-data  # copy site content, admin accounts and media
                                #   (photos) from the LOCAL MySQL database to the
                                #   server. Refuses if the server already has
                                #   content, unless --force is also given.
                                #   Enquiries and the audit log are not copied.
  python deploy.py --set-admin EMAIL --name NAME --role editor
                                # create an admin on the live site, or reset an
                                #   existing one's password (asked for, or from
                                #   ADMIN_SET_PASSWORD; only the hash is sent)

Credentials come from deploy_config.yantrix.json (gitignored) next to this
script, or the file named by DEPLOY_CONFIG. Keys:
  site_password     the site user's SSH password (required)
  host_key_sha256   the server's SSH host key fingerprint (required; checked
                    before the password is sent)
  db_name / db_user / db_password   the CloudPanel database (first deploy)

A full deploy dumps the server database to ~/backups/predeploy/ first and
stops if the dump fails.
"""

import base64
import getpass
import hashlib
import json
import os
import secrets
import subprocess
import sys
import tempfile
import time
import urllib.parse

import paramiko

LOCAL_ROOT = os.path.dirname(os.path.abspath(__file__))
CONFIG_PATH = os.environ.get("DEPLOY_CONFIG") or os.path.join(LOCAL_ROOT, "deploy_config.yantrix.json")

ARGS = sys.argv[1:]
CHECK_ONLY = "--check" in ARGS
ROLLBACK = "--rollback" in ARGS
STAGE_ONLY = "--stage" in ARGS
PUSH_DATA = "--push-data" in ARGS
SET_ADMIN = "--set-admin" in ARGS
FORCE = "--force" in ARGS

# -- Config ---------------------------------------------------
CFG = {
    "host": "189.72.144.215",
    "site_user": "yantrixtechnology",
    "site_password": "",  # config file only -- never commit a password
    "site_domain": "www.yantrixtechnology.com",
    "app_port": 3000,
    "pm2_name": "yantrix",
    "keep_releases": 3,
    "host_key_sha256": "",
    "db_name": "yantrix",
    "db_user": "",
    "db_password": "",
}
if not os.path.isfile(CONFIG_PATH):
    print(f"[ERROR] {CONFIG_PATH} not found.", flush=True)
    sys.exit(1)
with open(CONFIG_PATH, "r", encoding="utf-8") as _f:
    CFG.update(json.load(_f))

HOST = CFG["host"]
SITE_USER = CFG["site_user"]
SITE_PASSWORD = CFG["site_password"]
SITE_DOMAIN = CFG["site_domain"]
APP_PORT = int(CFG["app_port"])
PM2_NAME = CFG["pm2_name"]
KEEP_RELEASES = int(CFG["keep_releases"])
HOST_KEY_SHA256 = CFG["host_key_sha256"].strip().removeprefix("SHA256:").rstrip("=")

SITE_HOME = f"/home/{SITE_USER}"
APP = f"{SITE_HOME}/htdocs/{SITE_DOMAIN}"
STANDALONE = f"{APP}/.next/standalone"
STAGING = f"{SITE_HOME}/tmp/deploy-staging"
RELEASES = f"{SITE_HOME}/backups/releases"
DB_BACKUPS = f"{SITE_HOME}/backups/predeploy"

NVM_INIT = f'export NVM_DIR="{SITE_HOME}/.nvm"; [ -s "$NVM_DIR/nvm.sh" ] && . "$NVM_DIR/nvm.sh"'

# Written by the app at runtime, relative to .next/standalone (JSON-store
# fallback only; production keeps everything in MySQL).
RUNTIME_DIRS = ["data"]

# Copied into the standalone dir on every deploy, so a key missing here is a key
# missing in production. Checked by name only; values are never read back.
REQUIRED_ENV = ["DATABASE_URL", "ADMIN_SESSION_SECRET", "ADMIN_EMAIL", "ADMIN_PASSWORD"]
# "name" in package.json -- proves the remote dir is this app.
APP_MARKER = '"name": "yantrix-technology"'

# Source that gets uploaded. Everything else (node_modules, .next, .env,
# deploy files, docs, videos, student photos) stays local.
UPLOAD_DIRS = ["src", "public", "db"]
UPLOAD_FILES = [
    "package.json", "package-lock.json", "next.config.ts", "tsconfig.json",
    "tailwind.config.ts", "postcss.config.mjs", "eslint.config.mjs",
    "components.json", "next-env.d.ts",
]
SKIP_DIRS = {"node_modules", ".next", "__pycache__", "uploads"}
SKIP_EXTS = {".log", ".pid", ".tsbuildinfo", ".pyc"}


# -- helpers --------------------------------------------------
def p(text=""):
    try:
        print(text, flush=True)
    except UnicodeEncodeError:
        enc = sys.stdout.encoding or "ascii"
        print(str(text).encode(enc, "replace").decode(enc), flush=True)


def banner(title):
    p("\n" + "=" * 64 + f"\n{title}\n" + "=" * 64)


def run(ssh, command, timeout=600, check=False, quiet=False):
    if not quiet:
        p(f"\n[CMD] {command}")
    # pipefail: `cmd | tail` must fail when cmd fails, or a broken build slips through.
    _, stdout, stderr = ssh.exec_command(f"{NVM_INIT}; set -o pipefail; {command}", timeout=timeout)
    out = stdout.read().decode("utf-8", "replace")
    err = stderr.read().decode("utf-8", "replace")
    code = stdout.channel.recv_exit_status()
    if not quiet:
        p(out.rstrip())
        if err.strip():
            p(err.rstrip())
        p(f"[exit {code}]")
    if check and code != 0:
        raise RuntimeError(f"remote command failed ({code}): {command}")
    return out, err, code


def fingerprint(key):
    return base64.b64encode(hashlib.sha256(key.asbytes()).digest()).decode().rstrip("=")


class PinnedHostKey(paramiko.MissingHostKeyPolicy):
    # paramiko consults this before authenticating, so a server with the wrong
    # key never receives the password.
    def missing_host_key(self, client, hostname, key):
        fp = fingerprint(key)
        if fp != HOST_KEY_SHA256:
            raise paramiko.SSHException(f"host key mismatch for {hostname}: server presented SHA256:{fp}")


def connect():
    c = paramiko.SSHClient()
    c.set_missing_host_key_policy(PinnedHostKey())
    c.connect(HOST, username=SITE_USER, password=SITE_PASSWORD, timeout=30,
              look_for_keys=False, allow_agent=False)
    return c


def read_local_env():
    env = {}
    path = os.path.join(LOCAL_ROOT, ".env")
    if not os.path.isfile(path):
        return env
    with open(path, "r", encoding="utf-8") as f:
        for line in f:
            line = line.strip()
            if not line or line.startswith("#") or "=" not in line:
                continue
            k, v = line.split("=", 1)
            env[k.strip()] = v.strip()
    return env


def server_env_text():
    """The first-deploy server .env: local settings, server database, new secret."""
    if not (CFG["db_user"] and CFG["db_password"] and CFG["db_name"]):
        raise RuntimeError(f"db_user / db_password / db_name missing in {CONFIG_PATH}")
    local = read_local_env()
    url = "mysql://%s:%s@127.0.0.1:3306/%s" % (
        urllib.parse.quote(CFG["db_user"], safe=""),
        urllib.parse.quote(CFG["db_password"], safe=""),
        CFG["db_name"],
    )
    env = dict(local)
    env["DATABASE_URL"] = url
    env["ADMIN_SESSION_SECRET"] = secrets.token_urlsafe(48)
    env["CONTENT_STORE"] = "mysql"
    missing = [k for k in ("ADMIN_EMAIL", "ADMIN_PASSWORD") if not env.get(k)]
    if missing:
        raise RuntimeError(f"local .env is missing {', '.join(missing)} -- needed for the first admin account")
    lines = ["# Yantrix production env -- written by deploy.py on the first deploy.",
             "# This file is the source of truth now; deploy.py never rewrites it."]
    lines += [f"{k}={v}" for k, v in env.items()]
    return "\n".join(lines) + "\n"


def ensure_server_env(ssh):
    _, _, code = run(ssh, f"test -f {APP}/.env", quiet=True)
    if code == 0:
        p(f"  server .env present ({APP}/.env) -- left as is")
        return
    p(f"  no {APP}/.env -- writing it from the local .env (server database, new session secret)")
    text = server_env_text()
    sftp = ssh.open_sftp()
    try:
        with sftp.open(f"{APP}/.env", "w") as f:
            f.write(text)
        sftp.chmod(f"{APP}/.env", 0o600)
    finally:
        sftp.close()


def verify_target(ssh):
    """Refuse to touch a site that isn't Yantrix, or whose .env would break login."""
    out, _, code = run(ssh, f"cat {APP}/package.json 2>/dev/null", quiet=True)
    if code != 0:
        # No package.json: only acceptable for a fresh CloudPanel site (first deploy).
        out, _, _ = run(ssh, f"ls -A {APP} 2>/dev/null | grep -vxE '\\.well-known|\\.env|\\.gitignore' || true",
                        quiet=True)
        if out.strip():
            raise RuntimeError(f"{APP} has files but no package.json -- not a Yantrix site?")
    elif APP_MARKER not in out:
        raise RuntimeError(f"{APP} is not the Yantrix site -- check site_user/site_domain in {CONFIG_PATH}")
    out, _, _ = run(ssh, "pm2 jlist 2>/dev/null", quiet=True)
    try:
        procs = {x["name"]: x["pm2_env"].get("pm_cwd") for x in json.loads(out or "[]")}
    except (ValueError, KeyError, TypeError):
        procs = {}
    if PM2_NAME in procs and procs[PM2_NAME] != STANDALONE:
        raise RuntimeError(f"PM2 process {PM2_NAME} runs from {procs[PM2_NAME]}, not {STANDALONE}")
    missing = [k for k in REQUIRED_ENV
               if run(ssh, f"grep -qE '^{k}=.+' {APP}/.env", quiet=True)[2] != 0]
    if missing:
        raise RuntimeError(f"{APP}/.env is missing {', '.join(missing)} -- add it on the server first")
    p(f"  target verified: {SITE_USER}@{HOST} {APP} (pm2 {PM2_NAME})")


# Runs on the server as the site user: reads DATABASE_URL from the given .env,
# writes the credentials to a 0600 defaults-file (never argv, never stdout) and
# dumps to <dest>.tmp, renaming only after mysqldump and gzip both succeed.
DUMP_PY = r'''
import os, subprocess, sys, tempfile, urllib.parse as u
env, dest = sys.argv[1], sys.argv[2]
url = next(l.split("=", 1)[1].strip().strip('"').strip("'") for l in open(env) if l.startswith("DATABASE_URL="))
p = u.urlparse(url)
fd, cnf = tempfile.mkstemp(); os.chmod(cnf, 0o600)
os.write(fd, ("[client]\nuser=%s\npassword=%s\nhost=%s\nport=%s\n" % (
    u.unquote(p.username or ""), u.unquote(p.password or ""), p.hostname, p.port or 3306)).encode()); os.close(fd)
try:
    with open(dest + ".tmp", "wb") as out:
        os.chmod(dest + ".tmp", 0o600)
        d = subprocess.Popen(["mysqldump", "--defaults-extra-file=" + cnf, "--single-transaction", "--quick",
                              "--routines", "--triggers", "--no-tablespaces", p.path.lstrip("/")],
                             stdout=subprocess.PIPE, stderr=subprocess.PIPE)
        g = subprocess.run(["gzip", "-c"], stdin=d.stdout, stdout=out)
        d.stdout.close(); err = d.stderr.read().decode(errors="replace"); d.wait()
    if d.returncode or g.returncode:
        os.remove(dest + ".tmp"); sys.exit("mysqldump failed: " + err[-400:])
    os.rename(dest + ".tmp", dest)
finally:
    os.remove(cnf)
'''


def backup_db(ssh, env_file, stamp):
    dest = f"{DB_BACKUPS}/{stamp}.sql.gz"
    run(ssh, f"mkdir -p {DB_BACKUPS} && chmod 700 {DB_BACKUPS}", check=True)
    _, stdout, stderr = ssh.exec_command(f"python3 - {env_file} {dest}", timeout=900)
    stdout.channel.sendall(DUMP_PY.encode()); stdout.channel.shutdown_write()
    out, err = stdout.read().decode("utf-8", "replace"), stderr.read().decode("utf-8", "replace")
    if stdout.channel.recv_exit_status() != 0:
        raise RuntimeError(f"database backup failed -- deploy stopped: {(out + err).strip()[-400:]}")
    # A real dump ends with mysqldump's completion line; a truncated one doesn't.
    out, _, code = run(ssh, f"stat -c %s {dest} && zcat {dest} | tail -1 | grep -q 'Dump completed'", quiet=True)
    if code != 0:
        raise RuntimeError(f"database backup {dest} is incomplete -- deploy stopped")
    p(f"  database backup: {dest} ({int(out.split()[0]) / 1024:.0f} KB gz, verified complete)")
    return dest


def sftp_mkdirs(sftp, remote_dir):
    cur = ""
    for part in remote_dir.strip("/").split("/"):
        cur += "/" + part
        try:
            sftp.stat(cur)
        except FileNotFoundError:
            sftp.mkdir(cur)


def sftp_put(sftp, local, remote):
    # Windows runs out of socket buffer space (WinError 10055) partway through
    # a few hundred rapid puts; backing off and retrying clears it.
    for attempt in range(4):
        try:
            sftp.put(local, remote)
            return
        except OSError as ex:
            if attempt == 3:
                raise
            p(f"  [retry {attempt + 1}] {os.path.basename(local)}: {ex}")
            time.sleep(1.5 * (attempt + 1))


def upload_source(sftp, remote_root):
    count = 0
    for name in UPLOAD_FILES:
        local = os.path.join(LOCAL_ROOT, name)
        if os.path.isfile(local):
            sftp_put(sftp, local, f"{remote_root}/{name}")
            count += 1
    for top in UPLOAD_DIRS:
        base = os.path.join(LOCAL_ROOT, top)
        if not os.path.isdir(base):
            continue
        for root, dirs, files in os.walk(base):
            dirs[:] = [d for d in dirs if d not in SKIP_DIRS]
            rel = os.path.relpath(root, LOCAL_ROOT).replace(os.sep, "/")
            rdir = f"{remote_root}/{rel}"
            sftp_mkdirs(sftp, rdir)
            for fn in files:
                if os.path.splitext(fn)[1] in SKIP_EXTS:
                    continue
                sftp_put(sftp, os.path.join(root, fn), f"{rdir}/{fn}")
                count += 1
                if count % 100 == 0:
                    p(f"  ... {count} files")
    p(f"  {count} files -> {remote_root}")
    return count


def http_status(ssh, url, insecure=False, host_header=None):
    header = f"-H 'Host: {host_header}' " if host_header else ""
    out, _, _ = run(ssh, f"curl -s{'k' if insecure else ''} {header}-o /dev/null -w '%{{http_code}}' "
                         f"--max-time 25 {url} || true", quiet=True)
    return out.strip() or "no response"


def copy_runtime(ssh, src_standalone, dst_standalone):
    for d in RUNTIME_DIRS:
        run(ssh, f"if [ -d {src_standalone}/{d} ]; then mkdir -p {dst_standalone}/{d} && "
                 f"cp -a {src_standalone}/{d}/. {dst_standalone}/{d}/; fi", check=True)


def health(ssh):
    time.sleep(8)
    local = http_status(ssh, f"http://127.0.0.1:{APP_PORT}/")
    login = http_status(ssh, f"http://127.0.0.1:{APP_PORT}/admin/login")
    # Through nginx on this box, whatever public DNS says (--resolve keeps SNI right).
    out, _, _ = run(ssh, f"curl -sk --resolve {SITE_DOMAIN}:443:127.0.0.1 -o /dev/null -w '%{{http_code}}' "
                         f"--max-time 25 https://{SITE_DOMAIN}/ || true", quiet=True)
    via_nginx = out.strip() or "no response"
    p(f"[local]  GET 127.0.0.1:{APP_PORT}/            -> {local}")
    p(f"[local]  GET 127.0.0.1:{APP_PORT}/admin/login -> {login}")
    p(f"[nginx]  GET https://{SITE_DOMAIN}/ (on this server) -> {via_nginx}")
    return local == "200" and login == "200"


def ensure_reboot_resurrect(ssh):
    # PM2 has no system service for a site user; bring the saved list back on boot.
    line = f"@reboot bash -lc '{NVM_INIT}; pm2 resurrect' >/dev/null 2>&1"
    run(ssh, f"(crontab -l 2>/dev/null | grep -v 'pm2 resurrect'; echo \"{line}\") | crontab -", check=True)


# -- data -----------------------------------------------------
EXPORT_JS = r'''
const mysql = require("mysql2/promise");
(async () => {
  const c = await mysql.createConnection(process.env.LOCAL_DATABASE_URL);
  const out = {};
  for (const t of ["site_content", "admins", "media"]) {
    const [rows] = await c.query(`SELECT * FROM ${t}`);
    out[t] = rows.map((r) => {
      const o = {};
      for (const [k, v] of Object.entries(r)) {
        if (Buffer.isBuffer(v)) o[k] = { $b64: v.toString("base64") };
        else if (v instanceof Date) o[k] = { $date: v.toISOString() };
        else if (v !== null && typeof v === "object") o[k] = { $json: JSON.stringify(v) };
        else o[k] = v;
      }
      return o;
    });
  }
  process.stdout.write(JSON.stringify(out));
  await c.end();
})().catch((e) => { console.error(e.message); process.exit(1); });
'''

# Runs on the server with the app's own mysql2. Replaces site_content, admins
# and media in one transaction; enquiries and the audit log are left alone.
IMPORT_JS = r'''
const fs = require("fs");
const mysql = require("mysql2/promise");
const env = Object.fromEntries(fs.readFileSync(process.argv[2], "utf8").split("\n")
  .filter((l) => /^[A-Z_]+=/.test(l)).map((l) => [l.slice(0, l.indexOf("=")), l.slice(l.indexOf("=") + 1).replace(/^"|"$/g, "")]));
const data = JSON.parse(fs.readFileSync(process.argv[3], "utf8"));
const force = process.argv[4] === "force";
const val = (v) => v && typeof v === "object"
  ? ("$b64" in v ? Buffer.from(v.$b64, "base64") : "$date" in v ? new Date(v.$date) : v.$json)
  : v;
(async () => {
  const c = await mysql.createConnection(env.DATABASE_URL);
  const [[{ n }]] = await c.query("SELECT COUNT(*) n FROM site_content");
  const [[{ e }]] = await c.query("SELECT COUNT(*) e FROM enquiries");
  if (n > 0 && !force) {
    console.error("server already has site content -- rerun with --push-data --force to replace it");
    process.exit(2);
  }
  await c.beginTransaction();
  try {
    for (const t of ["site_content", "admins", "media"]) {
      const [cols] = await c.query(`SHOW COLUMNS FROM ${t}`);
      const have = new Set(cols.map((x) => x.Field));
      await c.query(`DELETE FROM ${t}`);
      for (const row of data[t]) {
        const keys = Object.keys(row).filter((k) => have.has(k));
        await c.query(`INSERT INTO ${t} (${keys.map((k) => "`" + k + "`").join(",")}) VALUES (${keys.map(() => "?").join(",")})`,
          keys.map((k) => val(row[k])));
      }
      console.log(`${t}: ${data[t].length} rows`);
    }
    await c.commit();
  } catch (err) { await c.rollback(); throw err; }
  console.log(`enquiries kept: ${e}`);
  await c.end();
})().catch((err) => { console.error(err.message); process.exit(1); });
'''


# Runs on the server with the app's own mysql2: creates the admin, or for an
# existing email sets the new password, role and re-activates it. Bumping
# session_version signs that account out everywhere.
SET_ADMIN_JS = r'''
const fs = require("fs");
const crypto = require("crypto");
const mysql = require("mysql2/promise");
const env = Object.fromEntries(fs.readFileSync(process.argv[2], "utf8").split("\n")
  .filter((l) => /^[A-Z_]+=/.test(l)).map((l) => [l.slice(0, l.indexOf("=")), l.slice(l.indexOf("=") + 1).replace(/^"|"$/g, "")]));
const a = JSON.parse(fs.readFileSync(process.argv[3], "utf8"));
(async () => {
  const c = await mysql.createConnection(env.DATABASE_URL);
  const [r] = await c.query(
    `INSERT INTO admins (id, name, email, password_hash, role, active, created_at, session_version)
     VALUES (?, ?, ?, ?, ?, 1, NOW(3), 0)
     ON DUPLICATE KEY UPDATE password_hash = VALUES(password_hash), role = VALUES(role),
       name = VALUES(name), active = 1, session_version = session_version + 1`,
    [crypto.randomUUID(), a.name, a.email, a.hash, a.role]);
  console.log(r.affectedRows === 1 ? `created ${a.email} (${a.role})` : `updated ${a.email} (${a.role})`);
  await c.end();
})().catch((e) => { console.error(e.message); process.exit(1); });
'''


def scrypt_hash(password):
    """Same format as src/lib/admin/auth.ts hashPassword: scrypt:<salt hex>:<key hex>."""
    salt = secrets.token_hex(16)
    key = hashlib.scrypt(password.encode(), salt=salt.encode(), n=16384, r=8, p=1, dklen=64)
    return f"scrypt:{salt}:{key.hex()}"


def set_admin(ssh):
    """python deploy.py --set-admin EMAIL [--name NAME] [--role owner|editor|viewer]
    The password is read from ADMIN_SET_PASSWORD or asked for; only its hash leaves this PC."""
    def arg(flag, default=None):
        return ARGS[ARGS.index(flag) + 1] if flag in ARGS and ARGS.index(flag) + 1 < len(ARGS) else default
    email = (arg("--set-admin") or "").strip().lower()
    role = arg("--role", "editor")
    name = arg("--name") or email.split("@")[0].replace(".", " ").title()
    if "@" not in email or role not in ("owner", "editor", "viewer"):
        raise RuntimeError("usage: python deploy.py --set-admin EMAIL [--name NAME] [--role owner|editor|viewer]")
    password = os.environ.get("ADMIN_SET_PASSWORD") or getpass.getpass(f"Password for {email}: ")
    if len(password) < 8:
        raise RuntimeError("password must be at least 8 characters")
    banner(f"Admin account: {email} ({role})")
    stamp = time.strftime("%Y%m%d-%H%M%S")
    remote_dir = f"{SITE_HOME}/tmp/set-admin-{stamp}"
    run(ssh, f"mkdir -p {remote_dir} && chmod 700 {remote_dir}", check=True)
    sftp = ssh.open_sftp()
    try:
        with sftp.open(f"{remote_dir}/admin.json", "w") as f:
            f.write(json.dumps({"email": email, "name": name, "role": role, "hash": scrypt_hash(password)}))
        with sftp.open(f"{remote_dir}/set-admin.cjs", "w") as f:
            f.write(SET_ADMIN_JS)
    finally:
        sftp.close()
    try:
        run(ssh, f"NODE_PATH={STANDALONE}/node_modules:{STAGING}/node_modules node {remote_dir}/set-admin.cjs {APP}/.env "
                 f"{remote_dir}/admin.json", check=True)
    finally:
        run(ssh, f"rm -rf {remote_dir}", quiet=True)


def push_data(ssh):
    banner("Copy local content, admins and media to the server")
    local_url = read_local_env().get("DATABASE_URL", "").strip('"')
    if not local_url:
        raise RuntimeError("local .env has no DATABASE_URL")
    with tempfile.TemporaryDirectory() as tmp:
        js = os.path.join(tmp, "export.cjs")
        with open(js, "w", encoding="utf-8") as f:
            f.write(EXPORT_JS)
        res = subprocess.run(["node", js], cwd=LOCAL_ROOT, capture_output=True,
                             env={**os.environ, "LOCAL_DATABASE_URL": local_url,
                                  "NODE_PATH": os.path.join(LOCAL_ROOT, "node_modules")})
        if res.returncode != 0:
            raise RuntimeError("local export failed: " + res.stderr.decode(errors="replace")[-400:])
        dump = os.path.join(tmp, "data.json")
        with open(dump, "wb") as f:
            f.write(res.stdout)
        p(f"  exported {len(res.stdout) / 1024:.0f} KB from the local database")
        stamp = time.strftime("%Y%m%d-%H%M%S")
        backup_db(ssh, f"{APP}/.env", stamp)
        remote_dir = f"{SITE_HOME}/tmp/push-data-{stamp}"
        run(ssh, f"mkdir -p {remote_dir} && chmod 700 {remote_dir}", check=True)
        sftp = ssh.open_sftp()
        try:
            sftp_put(sftp, dump, f"{remote_dir}/data.json")
            with sftp.open(f"{remote_dir}/import.cjs", "w") as f:
                f.write(IMPORT_JS)
        finally:
            sftp.close()
    try:
        # node resolves require() from the script's folder, so point it at the app's modules
        run(ssh, f"NODE_PATH={STANDALONE}/node_modules:{STAGING}/node_modules "
                 f"node {remote_dir}/import.cjs {APP}/.env {remote_dir}/data.json "
                 f"{'force' if FORCE else 'safe'}", check=True)
    finally:
        run(ssh, f"rm -rf {remote_dir}", quiet=True)
    # the app caches content for 30 s; restart so the copy shows at once
    run(ssh, f"pm2 restart {PM2_NAME} 2>&1 | cat", check=True)
    health(ssh)


# -- modes ----------------------------------------------------
def check(ssh):
    banner(f"Live status: {SITE_DOMAIN}")
    verify_target(ssh)
    run(ssh, f"uptime; df -h {SITE_HOME} | tail -1; node -v")
    run(ssh, "pm2 list 2>&1 | cat")
    run(ssh, f"cat {STANDALONE}/.next/BUILD_ID 2>/dev/null; echo; ls -la --time-style=long-iso {STANDALONE}/server.js")
    run(ssh, f"ls -1t {RELEASES} 2>/dev/null | head")
    run(ssh, f"pm2 logs {PM2_NAME} --err --lines 15 --nostream 2>&1 | cat")
    health(ssh)


def rollback(ssh):
    banner("Rollback to previous release")
    verify_target(ssh)
    out, _, _ = run(ssh, f"ls -1t {RELEASES} 2>/dev/null | grep -v rolledback | head -1", quiet=True)
    prev = out.strip()
    if not prev:
        raise RuntimeError(f"no release in {RELEASES}")
    prev_dir = f"{RELEASES}/{prev}"
    p(f"  restoring {prev_dir}")
    stamp = time.strftime("%Y%m%d-%H%M%S")
    run(ssh, f"pm2 stop {PM2_NAME} 2>&1 | cat")
    copy_runtime(ssh, STANDALONE, f"{prev_dir}/standalone")
    run(ssh, f"mv {APP}/.next {RELEASES}/next-{stamp}-rolledback && mv {prev_dir} {APP}/.next", check=True)
    run(ssh, f"pm2 restart {PM2_NAME} 2>&1 | cat", check=True)
    if not health(ssh):
        raise RuntimeError(f"rolled-back release {prev} is not healthy either -- check pm2 logs {PM2_NAME}")


def deploy(ssh):
    stamp = time.strftime("%Y%m%d-%H%M%S")

    banner("[1] Preflight")
    run(ssh, "node -v; npm -v; command -v pm2 >/dev/null || npm install -g pm2 2>&1 | tail -3", check=True)
    run(ssh, f"mkdir -p {APP}", check=True)
    ensure_server_env(ssh)
    verify_target(ssh)
    run(ssh, f"df -h {SITE_HOME} | tail -1")
    _, _, code = run(ssh, f"test -f {STANDALONE}/server.js && pm2 describe {PM2_NAME} >/dev/null")
    first = code != 0
    if first:
        p("  first deploy -- PM2 process will be created")

    banner("[2] Upload source to staging")
    # node_modules is kept between deploys so npm install is incremental.
    run(ssh, f"mkdir -p {STAGING} && cd {STAGING} && "
             f"find . -mindepth 1 -maxdepth 1 ! -name node_modules -exec rm -rf {{}} +", check=True)
    sftp = ssh.open_sftp()
    try:
        n = upload_source(sftp, STAGING)
    finally:
        sftp.close()
    if n < 50:
        raise RuntimeError(f"only {n} files uploaded -- aborting")
    run(ssh, f"cp {APP}/.env {STAGING}/.env && chmod 600 {STAGING}/.env", check=True)

    if not STAGE_ONLY:
        banner("[2b] Database backup")
        backup_db(ssh, f"{APP}/.env", stamp)

    banner("[3] npm install")
    run(ssh, f"cd {STAGING} && npm install --no-audit --no-fund 2>&1 | tail -15", timeout=1800, check=True)

    if STAGE_ONLY:
        banner("[3b] Type check")
        run(ssh, f"cd {STAGING} && npx tsc --noEmit -p . 2>&1 | tail -40", timeout=1200, check=True)

    banner("[4] next build (staging -- live app keeps running)")
    run(ssh, f"cd {STAGING} && NODE_OPTIONS=--max-old-space-size=3072 npm run build 2>&1 | tail -40",
        timeout=2400, check=True)
    run(ssh, f"test -f {STAGING}/.next/standalone/server.js", check=True)
    # Next loads .env from the standalone dir at runtime; don't rely on file
    # tracing to have copied it.
    run(ssh, f"cp {STAGING}/.env {STAGING}/.next/standalone/.env && "
             f"chmod 600 {STAGING}/.next/standalone/.env", check=True)

    if STAGE_ONLY:
        banner("[STAGED] build OK -- live site not changed")
        return

    banner("[5] Swap release")
    run(ssh, f"mkdir -p {RELEASES}", check=True)
    if first:
        run(ssh, f"rm -rf {APP}/.next && mv {STAGING}/.next {APP}/.next", check=True)
    else:
        run(ssh, f"pm2 stop {PM2_NAME} 2>&1 | cat", check=True)
        # Copied after the stop so nothing written mid-deploy is lost.
        copy_runtime(ssh, STANDALONE, f"{STAGING}/.next/standalone")
        run(ssh, f"mv {APP}/.next {RELEASES}/next-{stamp} && mv {STAGING}/.next {APP}/.next", check=True)
    # Keep the htdocs source in step with what is running.
    run(ssh, f"cd {APP} && rm -rf {' '.join(UPLOAD_DIRS)} && cd {STAGING} && "
             f"for f in {' '.join(UPLOAD_DIRS + UPLOAD_FILES)}; do [ -e $f ] && cp -a $f {APP}/; done; true",
        check=True)
    if first:
        run(ssh, f"cd {STANDALONE} && PORT={APP_PORT} HOSTNAME=127.0.0.1 NODE_ENV=production TZ=Asia/Kolkata "
                 f"pm2 start server.js --name {PM2_NAME} 2>&1 | cat", check=True)
    else:
        run(ssh, f"cd {STANDALONE} && PORT={APP_PORT} HOSTNAME=127.0.0.1 TZ=Asia/Kolkata NODE_ENV=production "
                 f"pm2 restart {PM2_NAME} --update-env 2>&1 | cat", check=True)
    run(ssh, "pm2 save 2>&1 | cat")
    ensure_reboot_resurrect(ssh)

    banner("[6] Health check")
    if not health(ssh):
        if first:
            run(ssh, f"pm2 logs {PM2_NAME} --lines 40 --nostream 2>&1 | cat")
            raise RuntimeError("first release failed health check (nothing to roll back to)")
        p("[WARN] new release not answering -- rolling back")
        run(ssh, f"pm2 logs {PM2_NAME} --lines 30 --nostream 2>&1 | cat")
        rollback(ssh)
        raise RuntimeError("deploy rolled back: new release failed health check")

    run(ssh, f"cd {RELEASES} && ls -1t | tail -n +{KEEP_RELEASES + 1} | xargs -r rm -rf")
    banner("[SUCCESS]")
    p(f"  URL      : https://{SITE_DOMAIN}")
    p(f"  Previous : {RELEASES}/next-{stamp}  (python deploy.py --rollback)")
    p(f"  DB dump  : {DB_BACKUPS}/{stamp}.sql.gz")


def main():
    if not SITE_PASSWORD:
        p(f"[ERROR] site_password is empty in {CONFIG_PATH}.")
        sys.exit(1)
    if not HOST_KEY_SHA256:
        p(f"[ERROR] host_key_sha256 is not set in {CONFIG_PATH}. Confirm it on the server:\n"
          f"        ssh-keygen -lf /etc/ssh/ssh_host_ed25519_key.pub")
        sys.exit(1)
    p(f"[CONFIG] {CONFIG_PATH}")
    if not CHECK_ONLY and not os.path.isfile(os.path.join(LOCAL_ROOT, "public", "brand", "yantrix-logo.svg")):
        p("[ERROR] public/ is missing locally -- deploying would ship a site with no logo.")
        sys.exit(1)

    p(f"[CONNECT] {SITE_USER}@{HOST}")
    ssh = connect()
    try:
        if CHECK_ONLY:
            check(ssh)
        elif ROLLBACK:
            rollback(ssh)
        elif PUSH_DATA:
            verify_target(ssh)
            push_data(ssh)
        elif SET_ADMIN:
            verify_target(ssh)
            set_admin(ssh)
        else:
            deploy(ssh)
    except Exception as e:
        p(f"\n[ERROR] {e}")
        sys.exit(1)
    finally:
        ssh.close()


if __name__ == "__main__":
    main()
