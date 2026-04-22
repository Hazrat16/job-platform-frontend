"use client";

import { getUser } from "@/utils/api";
import {
  Briefcase,
  ChevronLeft,
  ChevronRight,
  FileSearch,
  FolderHeart,
  Gavel,
  Home,
  LayoutDashboard,
  Shield,
  UserCircle2,
} from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useMemo, useState } from "react";

type SidebarItem = {
  href: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
};

const STORAGE_KEY = "ui.sidebar.collapsed";

export default function AppSidebar() {
  const pathname = usePathname();
  const [collapsed, setCollapsed] = useState(false);
  const [role, setRole] = useState<"jobseeker" | "employer" | "admin" | null>(null);

  useEffect(() => {
    const raw = localStorage.getItem(STORAGE_KEY);
    setCollapsed(raw === "1");
    setRole(getUser()?.role ?? null);
  }, []);

  const items = useMemo<SidebarItem[]>(() => {
    const base: SidebarItem[] = [
      { href: "/", label: "Home", icon: Home },
      { href: "/jobs", label: "Browse Jobs", icon: Briefcase },
      { href: "/profile", label: "Profile", icon: UserCircle2 },
      { href: "/terms", label: "Terms", icon: Gavel },
    ];
    if (role === "jobseeker") {
      base.splice(2, 0, { href: "/applications", label: "My Applications", icon: LayoutDashboard });
      base.splice(3, 0, { href: "/saved-jobs", label: "Saved Jobs", icon: FolderHeart });
      base.splice(4, 0, { href: "/resume-fit", label: "Resume Fit", icon: FileSearch });
    }
    if (role === "employer") {
      base.splice(2, 0, { href: "/my-jobs", label: "My Jobs", icon: LayoutDashboard });
      base.splice(3, 0, { href: "/post-job", label: "Post Job", icon: Briefcase });
    }
    if (role === "admin") {
      base.splice(2, 0, { href: "/admin", label: "Admin Panel", icon: Shield });
    }
    return base;
  }, [role]);

  const hiddenOnRoutes = ["/login", "/register", "/forgot-password", "/reset-password"];
  if (hiddenOnRoutes.some((r) => pathname.startsWith(r))) return null;

  return (
    <aside
      className={`hidden border-r border-border bg-card md:block ${
        collapsed ? "w-20" : "w-64"
      } transition-all duration-200`}
    >
      <div className="flex h-[calc(100vh-4rem)] flex-col">
        <div className="flex items-center justify-between border-b border-border px-3 py-3">
          {!collapsed ? (
            <p className="text-xs font-semibold uppercase tracking-wide text-fg-subtle">
              Navigation
            </p>
          ) : (
            <span />
          )}
          <button
            type="button"
            onClick={() => {
              const next = !collapsed;
              setCollapsed(next);
              localStorage.setItem(STORAGE_KEY, next ? "1" : "0");
            }}
            className="rounded-lg border border-border p-1.5 text-fg-muted hover:bg-card-muted"
            aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
          >
            {collapsed ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
          </button>
        </div>
        <nav className="flex-1 space-y-1 p-2">
          {items.map((item) => {
            const active = pathname === item.href || pathname.startsWith(`${item.href}/`);
            const Icon = item.icon;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center gap-2 rounded-xl px-3 py-2 text-sm transition-colors ${
                  active
                    ? "bg-accent-muted text-foreground"
                    : "text-fg-muted hover:bg-card-muted hover:text-foreground"
                }`}
                title={collapsed ? item.label : undefined}
              >
                <Icon className="h-4 w-4 shrink-0" />
                {!collapsed && <span>{item.label}</span>}
              </Link>
            );
          })}
        </nav>
      </div>
    </aside>
  );
}
