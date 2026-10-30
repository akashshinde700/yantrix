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
          <img src="/brand/yantrix-wordmark-dark.svg" alt="Yantrix" width={190} height={53} className="mx-auto h-[53px] w-auto" />
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
