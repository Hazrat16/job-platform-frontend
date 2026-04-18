"use client";

import { User as UserType } from "@/types";
import { cn } from "@/lib/cn";
import { apiClient, getUser, removeAuthToken, removeUser } from "@/utils/api";
import {
  Bell,
  Briefcase,
  ChevronDown,
  Menu,
  Plus,
  Search,
  User,
  Wallet,
  X,
} from "lucide-react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";

const navLinkClass =
  "rounded-lg px-3 py-2 text-sm font-medium text-slate-600 transition-colors hover:bg-slate-100 hover:text-slate-900 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2";

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

  const handleLogout = () => {
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
    "w-full rounded-xl border border-slate-200 bg-white py-2.5 pl-10 pr-4 text-sm text-slate-900 shadow-sm transition-shadow placeholder:text-slate-400 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20";

  return (
    <nav
      className="sticky top-0 z-50 border-b border-slate-200/80 bg-white/85 backdrop-blur-md shadow-sm"
      aria-label="Main"
    >
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between gap-3">
          <Link
            href="/"
            className="flex shrink-0 items-center gap-2 rounded-lg py-1 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2"
          >
            <Briefcase className="h-8 w-8 text-blue-600" aria-hidden />
            <span className="text-lg font-bold tracking-tight text-slate-900 sm:text-xl">
              JobPlatform
            </span>
          </Link>

          <div className="mx-4 hidden max-w-md flex-1 md:block">
            <form onSubmit={handleSearch} className="w-full">
              <div className="relative">
                <Search
                  className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400"
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

            {user ? (
              <>
                {user.role === "employer" && (
                  <Link
                    href="/post-job"
                    className="ml-1 inline-flex items-center gap-2 rounded-xl bg-blue-600 px-4 py-2 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-blue-700 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2"
                  >
                    <Plus className="h-4 w-4" aria-hidden />
                    Post Job
                  </Link>
                )}

                <Link
                  href="/notifications"
                  className="relative ml-1 rounded-lg p-2 text-slate-600 transition-colors hover:bg-slate-100 hover:text-slate-900 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2"
                  aria-label={`Notifications${unreadNotifications > 0 ? `, ${unreadNotifications} unread` : ""}`}
                >
                  <Bell className="h-5 w-5" aria-hidden />
                  {unreadNotifications > 0 && (
                    <span className="absolute right-0.5 top-0.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-blue-600 px-1 text-[10px] font-bold text-white">
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
                    className="flex items-center gap-1.5 rounded-lg px-3 py-2 text-sm font-medium text-slate-700 transition-colors hover:bg-slate-100 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2"
                  >
                    <User className="h-5 w-5 text-slate-500" aria-hidden />
                    <span className="max-w-[10rem] truncate">{user.name}</span>
                    <ChevronDown
                      className={cn(
                        "h-4 w-4 text-slate-400 transition-transform",
                        userMenuOpen && "rotate-180",
                      )}
                      aria-hidden
                    />
                  </button>

                  {userMenuOpen && (
                    <div
                      role="menu"
                      className="absolute right-0 mt-1 w-52 overflow-hidden rounded-xl border border-slate-200/90 bg-white py-1 shadow-lg shadow-slate-200/60"
                    >
                      <Link
                        role="menuitem"
                        href="/profile"
                        className="block px-4 py-2.5 text-sm text-slate-700 hover:bg-slate-50"
                        onClick={() => setUserMenuOpen(false)}
                      >
                        Profile
                      </Link>
                      <Link
                        role="menuitem"
                        href="/notifications"
                        className="block px-4 py-2.5 text-sm text-slate-700 hover:bg-slate-50"
                        onClick={() => setUserMenuOpen(false)}
                      >
                        Notifications
                        {unreadNotifications > 0 && (
                          <span className="ml-2 rounded-full bg-blue-100 px-2 py-0.5 text-xs font-semibold text-blue-800">
                            {unreadNotifications > 99 ? "99+" : unreadNotifications}
                          </span>
                        )}
                      </Link>
                      <Link
                        role="menuitem"
                        href="/applications"
                        className="block px-4 py-2.5 text-sm text-slate-700 hover:bg-slate-50"
                        onClick={() => setUserMenuOpen(false)}
                      >
                        My Applications
                      </Link>
                      {user.role === "jobseeker" && (
                        <Link
                          role="menuitem"
                          href="/saved-jobs"
                          className="block px-4 py-2.5 text-sm text-slate-700 hover:bg-slate-50"
                          onClick={() => setUserMenuOpen(false)}
                        >
                          Saved Jobs
                        </Link>
                      )}
                      {user.role === "employer" && (
                        <Link
                          role="menuitem"
                          href="/my-jobs"
                          className="block px-4 py-2.5 text-sm text-slate-700 hover:bg-slate-50"
                          onClick={() => setUserMenuOpen(false)}
                        >
                          My Jobs
                        </Link>
                      )}
                      {user.role === "employer" && (
                        <Link
                          role="menuitem"
                          href="/payments"
                          className="flex items-center gap-2 px-4 py-2.5 text-sm text-slate-700 hover:bg-slate-50"
                          onClick={() => setUserMenuOpen(false)}
                        >
                          <Wallet className="h-4 w-4 text-slate-500" aria-hidden />
                          Payments (BDT)
                        </Link>
                      )}
                      <button
                        type="button"
                        role="menuitem"
                        onClick={handleLogout}
                        className="block w-full px-4 py-2.5 text-left text-sm text-red-700 hover:bg-red-50"
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
                  className="rounded-xl bg-blue-600 px-4 py-2 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-blue-700 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2"
                >
                  Sign Up
                </Link>
              </div>
            )}
          </div>

          <div className="flex md:hidden">
            <button
              type="button"
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="rounded-lg p-2.5 text-slate-600 hover:bg-slate-100 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500"
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
            className="border-t border-slate-100 pb-4 pt-2 md:hidden"
          >
            <form onSubmit={handleSearch} className="mb-3 px-1">
              <div className="relative">
                <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
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
                className="rounded-lg px-3 py-3 text-base font-medium text-slate-800 hover:bg-slate-50"
                onClick={() => setIsMenuOpen(false)}
              >
                Browse Jobs
              </Link>

              {user ? (
                <>
                  {user.role === "employer" && (
                    <Link
                      href="/post-job"
                      className="rounded-lg px-3 py-3 text-base font-medium text-blue-700 hover:bg-blue-50"
                      onClick={() => setIsMenuOpen(false)}
                    >
                      Post Job
                    </Link>
                  )}
                  <Link
                    href="/profile"
                    className="rounded-lg px-3 py-3 text-base font-medium text-slate-800 hover:bg-slate-50"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    Profile
                  </Link>
                  <Link
                    href="/notifications"
                    className="rounded-lg px-3 py-3 text-base font-medium text-slate-800 hover:bg-slate-50"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    Notifications
                    {unreadNotifications > 0 && (
                      <span className="ml-2 rounded-full bg-blue-100 px-2 py-0.5 text-xs font-semibold text-blue-800">
                        {unreadNotifications > 99 ? "99+" : unreadNotifications}
                      </span>
                    )}
                  </Link>
                  <Link
                    href="/applications"
                    className="rounded-lg px-3 py-3 text-base font-medium text-slate-800 hover:bg-slate-50"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    My Applications
                  </Link>
                  {user.role === "jobseeker" && (
                    <Link
                      href="/saved-jobs"
                      className="rounded-lg px-3 py-3 text-base font-medium text-slate-800 hover:bg-slate-50"
                      onClick={() => setIsMenuOpen(false)}
                    >
                      Saved Jobs
                    </Link>
                  )}
                  {user.role === "employer" && (
                    <Link
                      href="/my-jobs"
                      className="rounded-lg px-3 py-3 text-base font-medium text-slate-800 hover:bg-slate-50"
                      onClick={() => setIsMenuOpen(false)}
                    >
                      My Jobs
                    </Link>
                  )}
                  {user.role === "employer" && (
                    <Link
                      href="/payments"
                      className="rounded-lg px-3 py-3 text-base font-medium text-slate-800 hover:bg-slate-50"
                      onClick={() => setIsMenuOpen(false)}
                    >
                      Payments (BDT)
                    </Link>
                  )}
                  <button
                    type="button"
                    onClick={handleLogout}
                    className="w-full rounded-lg px-3 py-3 text-left text-base font-medium text-red-700 hover:bg-red-50"
                  >
                    Sign Out
                  </button>
                </>
              ) : (
                <>
                  <Link
                    href="/login"
                    className="rounded-lg px-3 py-3 text-base font-medium text-slate-800 hover:bg-slate-50"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    Sign In
                  </Link>
                  <Link
                    href="/register"
                    className="rounded-lg px-3 py-3 text-base font-semibold text-blue-700 hover:bg-blue-50"
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
