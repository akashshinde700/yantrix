/**
 * Schema for the Yantrix content store.
 *
 * Documentation only — the application creates and migrates these tables
 * itself on first use (see src/lib/content/mysql-store.ts, which is the single
 * source of truth). Keep this file in sync with that SCHEMA array; running it
 * by hand against an existing database is harmless because every statement is
 * CREATE TABLE IF NOT EXISTS.
 */

CREATE TABLE IF NOT EXISTS site_content (
     id TINYINT PRIMARY KEY,
     data JSON NOT NULL,
     updated_at DATETIME(3) NOT NULL
   ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS enquiries (
     id VARCHAR(36) PRIMARY KEY,
     name VARCHAR(255) NOT NULL,
     email VARCHAR(255) NOT NULL,
     mobile VARCHAR(50) NOT NULL,
     course VARCHAR(255) NOT NULL,
     message TEXT NULL,
     status VARCHAR(20) NOT NULL DEFAULT 'new',
     notes TEXT NOT NULL,
     source VARCHAR(50) NOT NULL DEFAULT 'website',
     created_at DATETIME(3) NOT NULL,
     updated_at DATETIME(3) NOT NULL,
     INDEX idx_enquiries_created (created_at)
   ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS admins (
     id VARCHAR(36) PRIMARY KEY,
     name VARCHAR(255) NOT NULL,
     email VARCHAR(255) NOT NULL UNIQUE,
     password_hash VARCHAR(255) NOT NULL,
     role VARCHAR(20) NOT NULL,
     active TINYINT(1) NOT NULL DEFAULT 1,
     created_at DATETIME(3) NOT NULL,
     last_login_at DATETIME(3) NULL,
     session_version INT NOT NULL DEFAULT 0
   ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS audit_log (
     id VARCHAR(36) PRIMARY KEY,
     actor_email VARCHAR(255) NOT NULL,
     action VARCHAR(100) NOT NULL,
     target VARCHAR(255) NOT NULL,
     created_at DATETIME(3) NOT NULL,
     INDEX idx_audit_created (created_at)
   ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS media (
     id VARCHAR(36) PRIMARY KEY,
     mime VARCHAR(60) NOT NULL,
     data MEDIUMBLOB NOT NULL,
     created_at DATETIME(3) NOT NULL
   ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- ─────────────────────────────────────────────────────────────────────────────
-- Migrations applied automatically to databases created by an older version.
-- Running them twice is harmless; the app checks information_schema first.
--
--   ALTER TABLE admins ADD COLUMN session_version INT NOT NULL DEFAULT 0;
--     (session generation — bumped on password change / deactivation so tokens
--      issued earlier stop working)
-- ─────────────────────────────────────────────────────────────────────────────
