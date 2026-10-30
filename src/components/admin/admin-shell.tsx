"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  BarChart3,
  BookOpen,
  ChevronRight,
  ExternalLink,
  HelpCircle,
  LayoutDashboard,
  Layers,
  LogOut,
  Mail,
  Menu,
  Search,
  Settings,
  Sparkles,
  Users,
  X,
  UserRound,
  Award,
  Send,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import type { PublicAdmin } from "@/lib/content/types";

import { canWrite, isOwner } from "@/lib/admin/permissions";
import { AdminRoleProvider } from "@/components/admin/role-context";

/**
 * `write` entries are the only screens a read-only viewer has any business in;
 * everything else is hidden for them instead of rendering buttons the API will
 * reject with 403.
 */
const NAV: { href: string; label: string; icon: typeof LayoutDashboard; write?: boolean; owner?: boolean }[] = [
  { href: "/admin", label: "Dashboard", icon: LayoutDashboard },
  { href: "/admin/hero", write: true, label: "Hero slides", icon: Sparkles },
  { href: "/admin/courses", write: true, label: "Courses", icon: BookOpen },
  { href: "/admin/faqs", write: true, label: "FAQs", icon: HelpCircle },
  { href: "/admin/trainers", write: true, label: "Trainers", icon: UserRound },
  { href: "/admin/placed-students", write: true, label: "Placed students", icon: Award },
  { href: "/admin/sections", write: true, label: "Page sections", icon: Layers },
  { href: "/admin/pages", write: true, label: "Pages & navigation", icon: BarChart3 },
  { href: "/admin/seo", write: true, label: "SEO · AEO · GEO", icon: Search },
  { href: "/admin/enquiries", label: "Enquiries", icon: Mail },
  { href: "/admin/email", write: true, label: "Email notifications", icon: Send },
  { href: "/admin/admins", label: "Admin users", icon: Users, owner: true },
  { href: "/admin/settings", write: true, label: "Site settings", icon: Settings },
];

export function AdminShell({
  admin,
  children,
}: {
  admin: PublicAdmin;
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const router = useRouter();
  const [open, setOpen] = useState(false);

  const logout = async () => {
    await fetch("/api/admin/logout", { method: "POST" });
    router.push("/admin/login");
    router.refresh();
  };

  const nav = (
    <nav className="space-y-1">
      {NAV.filter((item) => (item.owner ? isOwner(admin.role) : item.write ? canWrite(admin.role) : true)).map((item) => {
        const active = item.href === "/admin" ? pathname === item.href : pathname.startsWith(item.href);
        return (
          <Link
            key={item.href}
            href={item.href}
            onClick={() => setOpen(false)}
            className={cn(
              "flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-semibold transition-colors",
              active
                ? "bg-white text-brand-800 shadow-sm"
                : "text-slate-300 hover:bg-white/5 hover:text-white"
            )}
          >
            <item.icon className="h-4 w-4 shrink-0" aria-hidden="true" />
            <span className="flex-1">{item.label}</span>
            {active ? <ChevronRight className="h-3.5 w-3.5" /> : null}
          </Link>
        );
      })}
    </nav>
  );

  return (
    <div className="min-h-screen bg-slate-100 lg:flex">
      {/* Sidebar */}
      <aside
        className={cn(
          "fixed inset-y-0 left-0 z-40 w-72 shrink-0 overflow-y-auto bg-space p-4 transition-transform lg:static lg:translate-x-0",
          open ? "translate-x-0" : "-translate-x-full"
        )}
      >
        <div className="flex items-center justify-between px-2 py-3">
          <Link href="/admin" className="flex items-center gap-2.5">
            <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-brand-600 via-brand-800 to-space text-sm font-black text-white ring-1 ring-cyber-400/30">
              Y
            </span>
            <span className="text-sm font-extrabold text-white">
              Yantrix <span className="text-cyber-300">Admin</span>
            </span>
          </Link>
          <button
            className="text-slate-400 hover:text-white lg:hidden"
            onClick={() => setOpen(false)}
            aria-label="Close menu"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="mt-4">{nav}</div>

        <div className="mt-6 space-y-2 border-t border-white/10 pt-4">
          <a
            href="/"
            target="_blank"
            rel="noreferrer"
            className="flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-semibold text-slate-300 transition-colors hover:bg-white/5 hover:text-white"
          >
            <ExternalLink className="h-4 w-4" /> View website
          </a>
          <button
            onClick={logout}
            className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-semibold text-slate-300 transition-colors hover:bg-white/5 hover:text-white"
          >
            <LogOut className="h-4 w-4" /> Sign out
          </button>
        </div>

        <div className="mt-6 rounded-xl bg-white/5 p-3 text-xs text-slate-300 ring-1 ring-white/10">
          <p className="font-bold text-white">{admin.name}</p>
          <p className="mt-0.5 break-all">{admin.email}</p>
          <p className="mt-1.5 inline-flex rounded-full bg-cyber-500/15 px-2 py-0.5 font-semibold capitalize text-cyber-200">
            {admin.role}
          </p>
        </div>
      </aside>

      {open ? (
        <div
          className="fixed inset-0 z-30 bg-space/60 lg:hidden"
          onClick={() => setOpen(false)}
          aria-hidden="true"
        />
      ) : null}

      {/* Main */}
      <div className="min-w-0 flex-1">
        <header className="sticky top-0 z-20 flex items-center gap-3 border-b border-slate-200 bg-white/90 px-4 py-3 backdrop-blur lg:hidden">
          <Button
            variant="outline"
            size="icon"
            className="h-9 w-9"
            onClick={() => setOpen(true)}
            aria-label="Open menu"
          >
            <Menu className="h-4 w-4" />
          </Button>
          <span className="text-sm font-extrabold text-ink">Yantrix Admin</span>
        </header>
        <main className="mx-auto max-w-6xl p-4 sm:p-6 lg:p-8">
          <AdminRoleProvider role={admin.role}>{children}</AdminRoleProvider>
        </main>
      </div>
    </div>
  );
}
