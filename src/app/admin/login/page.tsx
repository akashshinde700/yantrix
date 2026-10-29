import { redirect } from "next/navigation";
import { getSessionAdmin } from "@/lib/admin/auth";
import { LoginForm } from "@/components/admin/login-form";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Admin sign in | Yantrix",
  robots: { index: false, follow: false },
};

export default async function AdminLoginPage() {
  const admin = await getSessionAdmin();
  if (admin) redirect("/admin");

  return (
    <div className="flex min-h-screen items-center justify-center bg-space px-4 py-10">
      <div className="w-full max-w-md">
        <div className="mb-6 text-center">
          <span className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-brand-600 via-brand-800 to-space text-lg font-black text-white ring-1 ring-cyber-400/30">
            Y
          </span>
          <h1 className="mt-4 text-2xl font-extrabold text-white">Admin panel</h1>
          <p className="mt-1 text-sm text-slate-400">
            Sign in to manage the Yantrix Technology website.
          </p>
        </div>
        <LoginForm />
      </div>
    </div>
  );
}
