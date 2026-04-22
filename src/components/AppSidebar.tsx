"use client";

import { apiClient, getUser, removeAuthToken, removeUser } from "@/utils/api";
import {
  Bell,
  Briefcase,
  ChevronLeft,
  ChevronRight,
  FileSearch,
  FolderHeart,
  Home,
  LayoutDashboard,
  LogOut,
  Settings2,
  Shield,
  SunMoon,
  UserCircle2,
  Wallet,
} from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { ThemeToggle } from "./ThemeToggle";
import { useRouter } from "next/navigation";

type SidebarItem = {
  href: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
};

const STORAGE_KEY = "ui.sidebar.collapsed";

export default function AppSidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const [collapsed, setCollapsed] = useState(false);
  const [role, setRole] = useState<"jobseeker" | "employer" | "admin" | null>(null);
  const [hasUser, setHasUser] = useState(false);

  useEffect(() => {
    const raw = localStorage.getItem(STORAGE_KEY);
    setCollapsed(raw === "1");
    const user = getUser();
    setRole(user?.role ?? null);
    setHasUser(Boolean(user));
  }, []);

  const primaryItems = useMemo<SidebarItem[]>(() => {
    const base: SidebarItem[] = [
      { href: "/", label: "Home", icon: Home },
      { href: "/jobs", label: "Browse Jobs", icon: Briefcase },
      { href: "/profile", label: "Profile", icon: UserCircle2 },
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

  const secondaryItems = useMemo<SidebarItem[]>(() => {
    const base: SidebarItem[] = [
      { href: "/notifications", label: "Notifications", icon: Bell },
      { href: "/settings", label: "Settings", icon: Settings2 },
    ];
    if (role === "employer") {
      base.push({ href: "/payments", label: "Payments", icon: Wallet });
    }
    return base;
  }, [role]);

  const profileSectionItems = useMemo<SidebarItem[]>(() => {
    if (!pathname.startsWith("/profile")) return [];
    return [
      { href: "/profile#basics", label: "Profile: Basics", icon: UserCircle2 },
      { href: "/profile#summary", label: "Profile: Summary", icon: FileSearch },
      { href: "/profile#skills", label: "Profile: Skills", icon: Briefcase },
      { href: "/profile#experience", label: "Profile: Experience", icon: LayoutDashboard },
      { href: "/profile#education", label: "Profile: Education", icon: LayoutDashboard },
      { href: "/profile#links", label: "Profile: Links", icon: Settings2 },
      { href: "/profile#sessions", label: "Profile: Sessions", icon: Shield },
    ];
  }, [pathname]);

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
        <nav className="flex-1 space-y-2 overflow-y-auto p-2">
          {primaryItems.map((item) => {
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
          {profileSectionItems.length > 0 && !collapsed && (
            <p className="px-3 pt-2 text-[11px] font-semibold uppercase tracking-wide text-fg-subtle">
              Profile sections
            </p>
          )}
          {profileSectionItems.map((item) => {
            const active = pathname === item.href;
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

          {secondaryItems.map((item) => {
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
        <div className="border-t border-border p-2">
          <div className="mb-2 flex items-center gap-2 rounded-xl px-2 py-1.5 text-fg-muted">
            <SunMoon className="h-4 w-4 shrink-0" />
            {!collapsed && <span className="text-sm">Theme</span>}
            <ThemeToggle className="ml-auto" />
          </div>
          {hasUser ? (
            <button
              type="button"
              className="flex w-full items-center gap-2 rounded-xl px-3 py-2 text-sm text-destructive hover:bg-destructive-muted"
              onClick={async () => {
                try {
                  await apiClient.logout();
                } catch {}
                removeUser();
                removeAuthToken();
                router.push("/login");
              }}
            >
              <LogOut className="h-4 w-4 shrink-0" />
              {!collapsed && <span>Sign out</span>}
            </button>
          ) : (
            <Link
              href="/login"
              className="flex items-center gap-2 rounded-xl px-3 py-2 text-sm text-fg-muted hover:bg-card-muted hover:text-foreground"
            >
              <UserCircle2 className="h-4 w-4 shrink-0" />
              {!collapsed && <span>Sign in</span>}
            </Link>
          )}
        </div>
      </div>
    </aside>
  );
}
