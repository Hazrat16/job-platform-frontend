"use client";

import { User as UserType } from "@/types";
import { getUser } from "@/utils/api";
import {
  ArrowRight,
  Briefcase,
  Globe,
  LayoutDashboard,
  Search,
  Shield,
  TrendingUp,
  Users,
} from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";

export default function HomePage() {
  const [user, setUser] = useState<UserType | null>(null);

  useEffect(() => {
    setUser(getUser());
  }, []);

  return (
    <div className="min-h-screen">
      <div className="relative overflow-hidden">
        <div
          className="pointer-events-none absolute inset-0 opacity-[0.4]"
          aria-hidden
          style={{
            backgroundImage: `linear-gradient(rgba(15, 23, 42, 0.03) 1px, transparent 1px),
              linear-gradient(90deg, rgba(15, 23, 42, 0.03) 1px, transparent 1px)`,
            backgroundSize: "48px 48px",
          }}
        />
        <div className="absolute -right-24 top-20 h-[420px] w-[420px] rounded-full bg-gradient-to-br from-indigo-400/30 via-blue-400/20 to-cyan-300/25 blur-3xl" />
        <div className="absolute -left-32 bottom-0 h-[360px] w-[360px] rounded-full bg-gradient-to-tr from-violet-400/25 via-indigo-300/15 to-transparent blur-3xl" />

        <div className="relative mx-auto max-w-7xl px-4 py-20 sm:px-6 sm:py-28 lg:px-8">
          <div className="text-center">
            <p className="mb-5 inline-flex items-center gap-2 rounded-full border border-indigo-200/60 bg-white/70 px-4 py-1.5 text-xs font-semibold uppercase tracking-[0.2em] text-indigo-700 shadow-sm shadow-indigo-500/10 backdrop-blur-md sm:text-sm">
              Hiring &amp; job search
            </p>
            <h1 className="mx-auto max-w-4xl text-4xl font-extrabold tracking-tight text-slate-900 md:text-5xl lg:text-6xl lg:leading-[1.08]">
              Find your next role or{" "}
              <span className="relative inline-block">
                <span className="bg-gradient-to-r from-indigo-600 via-blue-600 to-cyan-600 bg-clip-text text-transparent">
                  hire with clarity
                </span>
                <span
                  className="absolute -bottom-1 left-0 right-0 mx-auto h-1 max-w-[12rem] rounded-full bg-gradient-to-r from-indigo-500/60 via-blue-500/50 to-cyan-500/40 blur-[2px]"
                  aria-hidden
                />
              </span>
            </h1>
            <p className="mx-auto mb-12 mt-6 max-w-2xl text-lg leading-relaxed text-slate-600 md:text-xl">
              Search real listings, save jobs, and manage applications—without noisy clutter or
              guesswork.
            </p>
            <div className="flex flex-col justify-center gap-3 sm:flex-row sm:gap-4">
              <Link
                href="/jobs"
                className="inline-flex items-center justify-center rounded-2xl bg-gradient-to-r from-indigo-600 to-blue-600 px-8 py-4 text-base font-semibold text-white shadow-xl shadow-indigo-500/25 transition-all hover:from-indigo-500 hover:to-blue-500 hover:shadow-indigo-500/35 focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-400 focus-visible:ring-offset-2"
              >
                <Search className="mr-2 h-5 w-5" aria-hidden />
                Browse jobs
              </Link>
              {!user ? (
                <Link
                  href="/register"
                  className="inline-flex items-center justify-center rounded-2xl border border-white/70 bg-white/80 px-8 py-4 text-base font-semibold text-slate-800 shadow-lg shadow-slate-900/5 backdrop-blur-md transition-all hover:border-indigo-200/80 hover:bg-white hover:shadow-xl focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500/40 focus-visible:ring-offset-2"
                >
                  <Briefcase className="mr-2 h-5 w-5 text-indigo-600" aria-hidden />
                  Create account
                </Link>
              ) : user.role === "employer" ? (
                <Link
                  href="/my-jobs"
                  className="inline-flex items-center justify-center rounded-2xl border border-white/70 bg-white/80 px-8 py-4 text-base font-semibold text-slate-800 shadow-lg shadow-slate-900/5 backdrop-blur-md transition-all hover:border-indigo-200/80 hover:bg-white hover:shadow-xl focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500/40 focus-visible:ring-offset-2"
                >
                  <LayoutDashboard className="mr-2 h-5 w-5 text-indigo-600" aria-hidden />
                  My jobs
                </Link>
              ) : (
                <Link
                  href="/profile"
                  className="inline-flex items-center justify-center rounded-2xl border border-white/70 bg-white/80 px-8 py-4 text-base font-semibold text-slate-800 shadow-lg shadow-slate-900/5 backdrop-blur-md transition-all hover:border-indigo-200/80 hover:bg-white hover:shadow-xl focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500/40 focus-visible:ring-offset-2"
                >
                  <Users className="mr-2 h-5 w-5 text-indigo-600" aria-hidden />
                  Your profile
                </Link>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="relative py-20 sm:py-24">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mb-16 text-center">
            <h2 className="mb-4 text-3xl font-extrabold tracking-tight text-slate-900 md:text-4xl">
              Built for a calm workflow
            </h2>
            <p className="mx-auto max-w-2xl text-lg text-slate-600">
              Straightforward tools for candidates and hiring teams—no hype, just what you need
              to move faster.
            </p>
          </div>

          <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
            {[
              {
                icon: Search,
                color: "from-blue-500 to-indigo-600",
                title: "Search & filters",
                body: "Narrow roles by keyword, location, type, and salary so you spend less time scrolling and more time applying.",
              },
              {
                icon: Users,
                color: "from-emerald-500 to-teal-600",
                title: "Structured profiles",
                body: "Résumé upload, experience, and education in one profile—ready when you apply or share with employers.",
              },
              {
                icon: TrendingUp,
                color: "from-violet-500 to-purple-600",
                title: "Saved jobs",
                body: "Bookmark listings and return when you are ready—your shortlist stays in sync across sessions.",
              },
              {
                icon: Shield,
                color: "from-amber-500 to-orange-600",
                title: "Account safety",
                body: "Email verification and secure sessions help keep accounts and applications trustworthy.",
              },
              {
                icon: Globe,
                color: "from-sky-500 to-blue-600",
                title: "Remote-friendly",
                body: "Location fields and listings work well for on-site, hybrid, and remote roles.",
              },
              {
                icon: Briefcase,
                color: "from-indigo-500 to-blue-600",
                title: "Applications in one place",
                body: "Track where you have applied and follow up from a single applications list.",
              },
            ].map((item) => (
              <div
                key={item.title}
                className="group rounded-3xl border border-white/60 bg-white/65 p-8 text-center shadow-lg shadow-slate-900/[0.04] ring-1 ring-slate-900/[0.03] backdrop-blur-md transition-all duration-300 hover:-translate-y-0.5 hover:border-indigo-200/50 hover:bg-white/85 hover:shadow-xl hover:shadow-indigo-500/10"
              >
                <div
                  className={`mx-auto mb-5 flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br ${item.color} text-white shadow-lg shadow-slate-900/15`}
                >
                  <item.icon className="h-7 w-7" aria-hidden />
                </div>
                <h3 className="mb-2 text-lg font-bold text-slate-900">{item.title}</h3>
                <p className="text-sm leading-relaxed text-slate-600">{item.body}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="relative border-y border-white/50 bg-white/50 py-16 shadow-inner shadow-slate-900/5 backdrop-blur-md">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {[
              {
                title: "Clear listings",
                body: "Titles, salary bands, and requirements at a glance.",
              },
              {
                title: "Profile completeness",
                body: "Hints nudge job seekers toward a stronger profile.",
              },
              {
                title: "Employer tools",
                body: "Post roles and review applicants without extra noise.",
              },
              {
                title: "Responsive UI",
                body: "Skeleton states and layouts that work on every screen.",
              },
            ].map((item) => (
              <div
                key={item.title}
                className="rounded-2xl border border-slate-200/50 bg-gradient-to-br from-white/90 to-slate-50/80 p-6 shadow-md shadow-slate-900/5 ring-1 ring-white/80"
              >
                <h3 className="mb-2 font-bold text-slate-900">{item.title}</h3>
                <p className="text-sm leading-relaxed text-slate-600">{item.body}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="relative overflow-hidden bg-gradient-to-br from-indigo-700 via-blue-700 to-cyan-700 py-20 sm:py-28">
        <div
          className="pointer-events-none absolute inset-0 opacity-30"
          aria-hidden
          style={{
            backgroundImage: `radial-gradient(circle at 20% 30%, white 0%, transparent 45%),
              radial-gradient(circle at 80% 70%, rgba(255,255,255,0.35) 0%, transparent 40%)`,
          }}
        />
        <div className="relative mx-auto max-w-7xl px-4 text-center sm:px-6 lg:px-8">
          <h2 className="mb-4 text-3xl font-extrabold tracking-tight text-white md:text-4xl">
            {user ? "Welcome back" : "Ready when you are"}
          </h2>
          <p className="mx-auto mb-10 max-w-xl text-lg text-indigo-100">
            {user
              ? user.role === "employer"
                ? "Manage listings and applicants from your dashboard."
                : "Keep exploring roles, saved jobs, and your applications in one place."
              : "Create a free account to post jobs, apply, or save listings for later."}
          </p>
          <div className="flex flex-col justify-center gap-3 sm:flex-row sm:gap-4">
            {!user ? (
              <>
                <Link
                  href="/register"
                  className="inline-flex items-center justify-center rounded-2xl bg-white px-8 py-4 text-base font-semibold text-indigo-700 shadow-xl shadow-slate-900/15 transition-all hover:bg-indigo-50 focus:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2 focus-visible:ring-offset-indigo-700"
                >
                  Get started
                  <ArrowRight className="ml-2 h-5 w-5" aria-hidden />
                </Link>
                <Link
                  href="/jobs"
                  className="inline-flex items-center justify-center rounded-2xl border-2 border-white/40 bg-white/10 px-8 py-4 text-base font-semibold text-white backdrop-blur-sm transition-all hover:bg-white/15 focus:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2 focus-visible:ring-offset-indigo-700"
                >
                  Browse jobs
                </Link>
              </>
            ) : user.role === "employer" ? (
              <>
                <Link
                  href="/post-job"
                  className="inline-flex items-center justify-center rounded-2xl bg-white px-8 py-4 text-base font-semibold text-indigo-700 shadow-xl shadow-slate-900/15 transition-all hover:bg-indigo-50 focus:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2 focus-visible:ring-offset-indigo-700"
                >
                  Post a job
                  <ArrowRight className="ml-2 h-5 w-5" aria-hidden />
                </Link>
                <Link
                  href="/my-jobs"
                  className="inline-flex items-center justify-center rounded-2xl border-2 border-white/40 bg-white/10 px-8 py-4 text-base font-semibold text-white backdrop-blur-sm transition-all hover:bg-white/15 focus:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2 focus-visible:ring-offset-indigo-700"
                >
                  My jobs
                </Link>
              </>
            ) : (
              <>
                <Link
                  href="/jobs"
                  className="inline-flex items-center justify-center rounded-2xl bg-white px-8 py-4 text-base font-semibold text-indigo-700 shadow-xl shadow-slate-900/15 transition-all hover:bg-indigo-50 focus:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2 focus-visible:ring-offset-indigo-700"
                >
                  Browse jobs
                  <ArrowRight className="ml-2 h-5 w-5" aria-hidden />
                </Link>
                <Link
                  href="/applications"
                  className="inline-flex items-center justify-center rounded-2xl border-2 border-white/40 bg-white/10 px-8 py-4 text-base font-semibold text-white backdrop-blur-sm transition-all hover:bg-white/15 focus:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2 focus-visible:ring-offset-indigo-700"
                >
                  My applications
                </Link>
              </>
            )}
          </div>
        </div>
      </div>

      <footer className="relative border-t border-white/10 bg-slate-950 py-14 text-white">
        <div
          className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-indigo-400/50 to-transparent"
          aria-hidden
        />
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 gap-10 md:grid-cols-4">
            <div>
              <div className="mb-4 flex items-center gap-2">
                <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-indigo-500 to-cyan-400 text-white shadow-lg">
                  <Briefcase className="h-5 w-5" aria-hidden />
                </span>
                <span className="text-xl font-extrabold tracking-tight">JobPlatform</span>
              </div>
              <p className="text-sm leading-relaxed text-slate-400">
                Connecting talented professionals with amazing opportunities worldwide.
              </p>
            </div>

            <div>
              <h3 className="mb-4 text-sm font-bold uppercase tracking-wider text-slate-300">
                For job seekers
              </h3>
              <ul className="space-y-2.5 text-sm text-slate-400">
                <li>
                  <Link href="/jobs" className="transition-colors hover:text-white">
                    Browse Jobs
                  </Link>
                </li>
                <li>
                  <Link
                    href={user ? "/profile" : "/register"}
                    className="transition-colors hover:text-white"
                  >
                    {user ? "Your profile" : "Create Profile"}
                  </Link>
                </li>
                <li>
                  <Link href="/applications" className="transition-colors hover:text-white">
                    My Applications
                  </Link>
                </li>
              </ul>
            </div>

            <div>
              <h3 className="mb-4 text-sm font-bold uppercase tracking-wider text-slate-300">
                For employers
              </h3>
              <ul className="space-y-2.5 text-sm text-slate-400">
                <li>
                  <Link href="/post-job" className="transition-colors hover:text-white">
                    Post a Job
                  </Link>
                </li>
                <li>
                  <Link
                    href={user?.role === "employer" ? "/my-jobs" : "/register"}
                    className="transition-colors hover:text-white"
                  >
                    {user?.role === "employer" ? "My jobs" : "Create Account"}
                  </Link>
                </li>
                <li>
                  <Link href="/my-jobs" className="transition-colors hover:text-white">
                    Manage Jobs
                  </Link>
                </li>
              </ul>
            </div>

            <div>
              <h3 className="mb-4 text-sm font-bold uppercase tracking-wider text-slate-300">
                Company
              </h3>
              <ul className="space-y-2.5 text-sm text-slate-400">
                <li>
                  <Link href="/about" className="transition-colors hover:text-white">
                    About Us
                  </Link>
                </li>
                <li>
                  <Link href="/contact" className="transition-colors hover:text-white">
                    Contact
                  </Link>
                </li>
                <li>
                  <Link href="/privacy" className="transition-colors hover:text-white">
                    Privacy Policy
                  </Link>
                </li>
              </ul>
            </div>
          </div>

          <div className="mt-12 border-t border-slate-800/80 pt-8 text-center text-sm text-slate-500">
            <p>&copy; 2026 JobPlatform. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
