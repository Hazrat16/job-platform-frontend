"use client";

import { ThemeToggle } from "@/components/ThemeToggle";
import { cn } from "@/lib/cn";
import { User as UserType } from "@/types";
import { apiClient, getUser, removeAuthToken, removeUser } from "@/utils/api";
import {
  Bell,
  Briefcase,
  ChevronDown,
  Menu,
  Plus,
  Search,
  Sparkles,
  User,
  Wallet,
  X,
} from "lucide-react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";

const navLinkClass =
  "rounded-xl px-3 py-2 text-sm font-medium text-fg-muted transition-all hover:bg-card-muted hover:text-foreground hover:shadow-sm focus:outline-none focus-visible:ring-2 focus-visible:ring-accent/40 focus-visible:ring-offset-2 focus-visible:ring-offset-background";

export default function Navbar() {
  const [user, setUser] = useState<UserType | null>(null);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [unreadNotifications, setUnreadNotifications] = useState(0);
  const router = useRouter();
  const pathname = usePathname();
  const userMenuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const currentUser = getUser();
    setUser(currentUser);
  }, []);

  useEffect(() => {
    if (!user) {
      setUnreadNotifications(0);
      return;
    }
    let cancelled = false;
    const refresh = async () => {
      const res = await apiClient.getNotifications({ limit: 1 });
      if (cancelled || !res.success) return;
      if (typeof res.meta?.unreadCount === "number") {
        setUnreadNotifications(res.meta.unreadCount);
      }
    };
    void refresh();
    const interval = setInterval(refresh, 45_000);
    return () => {
      cancelled = true;
      clearInterval(interval);
    };
  }, [user, pathname]);

  useEffect(() => {
    if (!userMenuOpen) return;
    const onPointerDown = (e: PointerEvent) => {
      if (userMenuRef.current?.contains(e.target as Node)) return;
      setUserMenuOpen(false);
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setUserMenuOpen(false);
    };
    document.addEventListener("pointerdown", onPointerDown);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("pointerdown", onPointerDown);
      document.removeEventListener("keydown", onKey);
    };
  }, [userMenuOpen]);

  const handleLogout = async () => {
    try {
      await apiClient.logout();
    } catch {
      // ignore network errors on logout; local cleanup still applies
    }
    removeUser();
    removeAuthToken();
    setUser(null);
    setIsMenuOpen(false);
    setUserMenuOpen(false);
    router.push("/login");
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      router.push(`/jobs?search=${encodeURIComponent(searchQuery.trim())}`);
      setSearchQuery("");
    }
  };

  const searchInputClass =
    "w-full rounded-xl border border-input-border bg-input py-2.5 pl-10 pr-4 text-sm text-foreground shadow-inner shadow-foreground/5 ring-1 ring-border/40 transition-all placeholder:text-fg-subtle focus:border-accent focus:bg-card focus:outline-none focus:ring-2 focus:ring-accent/25";

  return (
    <nav
      className="sticky top-0 z-50 border-b border-border bg-card/95 shadow-sm backdrop-blur-md backdrop-saturate-150"
      aria-label="Main"
    >
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between gap-3">
          <Link
            href="/"
            className="group flex shrink-0 items-center gap-2.5 rounded-xl py-1 focus:outline-none focus-visible:ring-2 focus-visible:ring-accent/50 focus-visible:ring-offset-2 focus-visible:ring-offset-background"
          >
            <span className="flex h-10 w-10 items-center justify-center rounded-2xl bg-gradient-to-br from-accent via-accent-end to-hold text-white shadow-lg shadow-accent/30 ring-2 ring-card transition-transform duration-300 group-hover:scale-[1.03] dark:shadow-black/40">
              <Briefcase className="h-5 w-5" aria-hidden />
            </span>
            <span className="text-lg font-extrabold tracking-tight sm:text-xl">
              <span className="text-foreground">Job</span>
              <span className="bg-gradient-to-r from-accent via-accent-end to-hold bg-clip-text text-transparent dark:from-accent-end dark:via-accent dark:to-hold">
                Platform
              </span>
            </span>
          </Link>

          <div className="mx-4 hidden max-w-md flex-1 md:block">
            <form onSubmit={handleSearch} className="w-full">
              <div className="relative">
                <Search
                  className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-fg-subtle"
                  aria-hidden
                />
                <input
                  type="search"
                  name="q"
                  placeholder="Search jobs by title or company…"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className={searchInputClass}
                  aria-label="Search jobs"
                />
              </div>
            </form>
          </div>

          <div className="hidden items-center gap-1 md:flex">
            <Link href="/jobs" className={navLinkClass}>
              Browse Jobs
            </Link>
            <ThemeToggle className="mx-0.5" />

            {user && (
              <Link
                href="/resume-fit"
                className={`${navLinkClass} inline-flex items-center gap-1.5 text-link`}
              >
                <Sparkles className="h-4 w-4 shrink-0 text-link-soft" aria-hidden />
                Resume fit
              </Link>
            )}

            {user ? (
              <>
                {user.role === "employer" && (
                  <Link
                    href="/post-job"
                    className="ml-1 inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-accent to-accent-end px-4 py-2 text-sm font-semibold text-white shadow-lg shadow-accent/25 transition-all hover:brightness-110 hover:shadow-accent/35 focus:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 focus-visible:ring-offset-background dark:shadow-foreground/50"
                  >
                    <Plus className="h-4 w-4" aria-hidden />
                    Post Job
                  </Link>
                )}

                <Link
                  href="/notifications"
                  className="relative ml-1 rounded-xl p-2 text-fg-muted transition-all hover:bg-card hover:text-foreground hover:shadow-sm focus:outline-none focus-visible:ring-2 focus-visible:ring-accent/40 focus-visible:ring-offset-2 focus-visible:ring-offset-background"
                  aria-label={`Notifications${unreadNotifications > 0 ? `, ${unreadNotifications} unread` : ""}`}
                >
                  <Bell className="h-5 w-5" aria-hidden />
                  {unreadNotifications > 0 && (
                    <span className="absolute right-0.5 top-0.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-gradient-to-r from-accent to-accent-end px-1 text-[10px] font-bold text-white shadow-sm">
                      {unreadNotifications > 99 ? "99+" : unreadNotifications}
                    </span>
                  )}
                </Link>

                <div className="relative ml-1" ref={userMenuRef}>
                  <button
                    type="button"
                    onClick={() => setUserMenuOpen((o) => !o)}
                    aria-expanded={userMenuOpen}
                    aria-haspopup="menu"
                    className="flex items-center gap-1.5 rounded-xl border border-transparent px-3 py-2 text-sm font-medium text-fg-muted transition-all hover:border-border hover:bg-card hover:shadow-sm focus:outline-none focus-visible:ring-2 focus-visible:ring-accent/40 focus-visible:ring-offset-2 focus-visible:ring-offset-background"
                  >
                    <User className="h-5 w-5 text-fg-subtle" aria-hidden />
                    <span className="max-w-[10rem] truncate">{user.name}</span>
                    <ChevronDown
                      className={cn(
                        "h-4 w-4 text-fg-subtle transition-transform",
                        userMenuOpen && "rotate-180",
                      )}
                      aria-hidden
                    />
                  </button>

                  {userMenuOpen && (
                    <div
                      role="menu"
                      className="absolute right-0 mt-2 w-56 overflow-hidden rounded-2xl border border-border bg-popover/95 py-1 shadow-2xl shadow-foreground/10 ring-1 ring-border backdrop-blur-xl dark:shadow-black/50"
                    >
                      <Link
                        role="menuitem"
                        href="/profile"
                        className="block px-4 py-2.5 text-sm text-fg-muted hover:bg-card-muted"
                        onClick={() => setUserMenuOpen(false)}
                      >
                        Profile
                      </Link>
                      <Link
                        role="menuitem"
                        href="/resume-fit"
                        className="flex items-center gap-2 px-4 py-2.5 text-sm text-link hover:bg-accent-muted"
                        onClick={() => setUserMenuOpen(false)}
                      >
                        <Sparkles className="h-4 w-4 text-link-soft" aria-hidden />
                        Resume fit (AI)
                      </Link>
                      <Link
                        role="menuitem"
                        href="/notifications"
                        className="block px-4 py-2.5 text-sm text-fg-muted hover:bg-card-muted"
                        onClick={() => setUserMenuOpen(false)}
                      >
                        Notifications
                        {unreadNotifications > 0 && (
                          <span className="ml-2 rounded-full bg-accent-muted px-2 py-0.5 text-xs font-semibold text-link">
                            {unreadNotifications > 99 ? "99+" : unreadNotifications}
                          </span>
                        )}
                      </Link>
                      <Link
                        role="menuitem"
                        href="/notifications/preferences"
                        className="block px-4 py-2.5 text-sm text-fg-muted hover:bg-card-muted"
                        onClick={() => setUserMenuOpen(false)}
                      >
                        Notification Preferences
                      </Link>
                      <Link
                        role="menuitem"
                        href="/applications"
                        className="block px-4 py-2.5 text-sm text-fg-muted hover:bg-card-muted"
                        onClick={() => setUserMenuOpen(false)}
                      >
                        My Applications
                      </Link>
                      {user.role === "jobseeker" && (
                        <Link
                          role="menuitem"
                          href="/saved-jobs"
                          className="block px-4 py-2.5 text-sm text-fg-muted hover:bg-card-muted"
                          onClick={() => setUserMenuOpen(false)}
                        >
                          Saved Jobs
                        </Link>
                      )}
                      {user.role === "employer" && (
                        <Link
                          role="menuitem"
                          href="/my-jobs"
                          className="block px-4 py-2.5 text-sm text-fg-muted hover:bg-card-muted"
                          onClick={() => setUserMenuOpen(false)}
                        >
                          My Jobs
                        </Link>
                      )}
                      {user.role === "employer" && (
                        <Link
                          role="menuitem"
                          href="/payments"
                          className="flex items-center gap-2 px-4 py-2.5 text-sm text-fg-muted hover:bg-card-muted"
                          onClick={() => setUserMenuOpen(false)}
                        >
                          <Wallet className="h-4 w-4 text-fg-subtle" aria-hidden />
                          Payments (BDT)
                        </Link>
                      )}
                      <button
                        type="button"
                        role="menuitem"
                        onClick={handleLogout}
                        className="block w-full px-4 py-2.5 text-left text-sm text-destructive hover:bg-destructive-muted"
                      >
                        Sign Out
                      </button>
                    </div>
                  )}
                </div>
              </>
            ) : (
              <div className="ml-2 flex items-center gap-2">
                <Link href="/login" className={navLinkClass}>
                  Sign In
                </Link>
                <Link
                  href="/register"
                  className="rounded-xl bg-gradient-to-r from-accent to-accent-end px-4 py-2 text-sm font-semibold text-white shadow-lg shadow-accent/25 transition-all hover:brightness-110 focus:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 focus-visible:ring-offset-background dark:shadow-foreground/50"
                >
                  Sign Up
                </Link>
              </div>
            )}
          </div>

          <div className="flex items-center gap-2 md:hidden">
            <ThemeToggle />
            <button
              type="button"
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="rounded-lg p-2.5 text-fg-muted hover:bg-card-muted focus:outline-none focus-visible:ring-2 focus-visible:ring-accent/40"
              aria-expanded={isMenuOpen}
              aria-controls="mobile-nav"
              aria-label={isMenuOpen ? "Close menu" : "Open menu"}
            >
              {isMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>
          </div>
        </div>

        {isMenuOpen && (
          <div
            id="mobile-nav"
            className="border-t border-border pb-4 pt-2 md:hidden"
          >
            <form onSubmit={handleSearch} className="mb-3 px-1">
              <div className="relative">
                <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-fg-subtle" />
                <input
                  type="search"
                  placeholder="Search jobs…"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className={searchInputClass}
                  aria-label="Search jobs"
                />
              </div>
            </form>

            <div className="flex flex-col gap-0.5 px-1">
              <Link
                href="/jobs"
                className="rounded-lg px-3 py-3 text-base font-medium text-foreground hover:bg-card-muted"
                onClick={() => setIsMenuOpen(false)}
              >
                Browse Jobs
              </Link>

              {user && (
                <Link
                  href="/resume-fit"
                  className="flex items-center gap-2 rounded-lg px-3 py-3 text-base font-medium text-link hover:bg-accent-muted"
                  onClick={() => setIsMenuOpen(false)}
                >
                  <Sparkles className="h-5 w-5 shrink-0" aria-hidden />
                  Resume fit (AI)
                </Link>
              )}

              {user ? (
                <>
                  {user.role === "employer" && (
                    <Link
                      href="/post-job"
                      className="mx-1 rounded-xl bg-gradient-to-r from-accent to-accent-end px-3 py-3 text-center text-base font-semibold text-white shadow-md shadow-accent/20"
                      onClick={() => setIsMenuOpen(false)}
                    >
                      Post Job
                    </Link>
                  )}
                  <Link
                    href="/profile"
                    className="rounded-lg px-3 py-3 text-base font-medium text-foreground hover:bg-card-muted"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    Profile
                  </Link>
                  <Link
                    href="/notifications"
                    className="rounded-lg px-3 py-3 text-base font-medium text-foreground hover:bg-card-muted"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    Notifications
                    {unreadNotifications > 0 && (
                      <span className="ml-2 rounded-full bg-accent-muted px-2 py-0.5 text-xs font-semibold text-link">
                        {unreadNotifications > 99 ? "99+" : unreadNotifications}
                      </span>
                    )}
                  </Link>
                  <Link
                    href="/applications"
                    className="rounded-lg px-3 py-3 text-base font-medium text-foreground hover:bg-card-muted"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    My Applications
                  </Link>
                  {user.role === "jobseeker" && (
                    <Link
                      href="/saved-jobs"
                      className="rounded-lg px-3 py-3 text-base font-medium text-foreground hover:bg-card-muted"
                      onClick={() => setIsMenuOpen(false)}
                    >
                      Saved Jobs
                    </Link>
                  )}
                  {user.role === "employer" && (
                    <Link
                      href="/my-jobs"
                      className="rounded-lg px-3 py-3 text-base font-medium text-foreground hover:bg-card-muted"
                      onClick={() => setIsMenuOpen(false)}
                    >
                      My Jobs
                    </Link>
                  )}
                  {user.role === "employer" && (
                    <Link
                      href="/payments"
                      className="rounded-lg px-3 py-3 text-base font-medium text-foreground hover:bg-card-muted"
                      onClick={() => setIsMenuOpen(false)}
                    >
                      Payments (BDT)
                    </Link>
                  )}
                  <button
                    type="button"
                    onClick={handleLogout}
                    className="w-full rounded-lg px-3 py-3 text-left text-base font-medium text-destructive hover:bg-destructive-muted"
                  >
                    Sign Out
                  </button>
                </>
              ) : (
                <>
                  <Link
                    href="/login"
                    className="rounded-lg px-3 py-3 text-base font-medium text-foreground hover:bg-card-muted"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    Sign In
                  </Link>
                  <Link
                    href="/register"
                    className="mx-1 rounded-xl bg-gradient-to-r from-accent to-accent-end px-3 py-3 text-center text-base font-semibold text-white shadow-md shadow-accent/20"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    Sign Up
                  </Link>
                </>
              )}
            </div>
          </div>
        )}
      </div>
    </nav>
  );
}
