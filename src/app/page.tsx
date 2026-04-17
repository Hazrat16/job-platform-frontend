"use client";

import {
  ArrowRight,
  Briefcase,
  Globe,
  Search,
  Shield,
  TrendingUp,
  Users,
} from "lucide-react";
import Link from "next/link";

export default function HomePage() {
  return (
    <div className="min-h-screen bg-white">
      <div className="relative overflow-hidden bg-gradient-to-br from-slate-50 via-blue-50/80 to-indigo-100/90">
        <div className="mx-auto max-w-7xl px-4 py-20 sm:px-6 sm:py-24 lg:px-8">
          <div className="text-center">
            <p className="mb-4 text-sm font-semibold uppercase tracking-wide text-blue-700">
              Hiring & job search in one place
            </p>
            <h1 className="mb-6 text-4xl font-bold tracking-tight text-slate-900 md:text-5xl lg:text-6xl">
              Find your next role or
              <span className="mt-1 block text-blue-600">hire with clarity</span>
            </h1>
            <p className="mx-auto mb-10 max-w-2xl text-lg leading-relaxed text-slate-600 md:text-xl">
              Search real listings, save jobs, and manage applications—without noisy clutter
              or guesswork.
            </p>
            <div className="flex flex-col justify-center gap-3 sm:flex-row sm:gap-4">
              <Link
                href="/jobs"
                className="inline-flex items-center justify-center rounded-xl bg-blue-600 px-8 py-3.5 text-base font-semibold text-white shadow-sm transition-colors hover:bg-blue-700 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2"
              >
                <Search className="mr-2 h-5 w-5" aria-hidden />
                Browse jobs
              </Link>
              <Link
                href="/register"
                className="inline-flex items-center justify-center rounded-xl border border-slate-200 bg-white/90 px-8 py-3.5 text-base font-semibold text-slate-800 shadow-sm backdrop-blur transition-colors hover:border-slate-300 hover:bg-white focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2"
              >
                <Briefcase className="mr-2 h-5 w-5 text-blue-600" aria-hidden />
                Create account
              </Link>
            </div>
          </div>
        </div>

        {/* Background decoration */}
        <div className="absolute top-0 right-0 -mt-4 -mr-4">
          <div className="w-96 h-96 bg-blue-200 rounded-full opacity-20"></div>
        </div>
        <div className="absolute bottom-0 left-0 -mb-4 -ml-4">
          <div className="w-64 h-64 bg-indigo-200 rounded-full opacity-20"></div>
        </div>
      </div>

      {/* Features Section */}
      <div className="bg-white py-20 sm:py-24">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mb-14 text-center">
            <h2 className="mb-3 text-3xl font-bold tracking-tight text-slate-900 md:text-4xl">
              Built for a calm workflow
            </h2>
            <p className="mx-auto max-w-2xl text-lg text-slate-600">
              Straightforward tools for candidates and hiring teams—no hype, just what you
              need to move faster.
            </p>
          </div>

          <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
            <div className="rounded-2xl border border-slate-200/80 bg-slate-50/50 p-8 text-center shadow-sm transition-shadow hover:shadow-md">
              <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-blue-100">
                <Search className="h-7 w-7 text-blue-600" aria-hidden />
              </div>
              <h3 className="mb-2 text-lg font-semibold text-slate-900">Search & filters</h3>
              <p className="text-sm leading-relaxed text-slate-600">
                Narrow roles by keyword, location, type, and salary so you spend less time
                scrolling and more time applying.
              </p>
            </div>

            <div className="rounded-2xl border border-slate-200/80 bg-slate-50/50 p-8 text-center shadow-sm transition-shadow hover:shadow-md">
              <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-emerald-100">
                <Users className="h-7 w-7 text-emerald-700" aria-hidden />
              </div>
              <h3 className="mb-2 text-lg font-semibold text-slate-900">Structured profiles</h3>
              <p className="text-sm leading-relaxed text-slate-600">
                Résumé upload, experience, and education in one profile—ready when you
                apply or share with employers.
              </p>
            </div>

            <div className="rounded-2xl border border-slate-200/80 bg-slate-50/50 p-8 text-center shadow-sm transition-shadow hover:shadow-md">
              <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-violet-100">
                <TrendingUp className="h-7 w-7 text-violet-700" aria-hidden />
              </div>
              <h3 className="mb-2 text-lg font-semibold text-slate-900">Saved jobs</h3>
              <p className="text-sm leading-relaxed text-slate-600">
                Bookmark listings and return when you are ready—your shortlist stays in
                sync across sessions.
              </p>
            </div>

            <div className="rounded-2xl border border-slate-200/80 bg-slate-50/50 p-8 text-center shadow-sm transition-shadow hover:shadow-md">
              <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-amber-100">
                <Shield className="h-7 w-7 text-amber-800" aria-hidden />
              </div>
              <h3 className="mb-2 text-lg font-semibold text-slate-900">Account safety</h3>
              <p className="text-sm leading-relaxed text-slate-600">
                Email verification and secure sessions help keep accounts and applications
                trustworthy.
              </p>
            </div>

            <div className="rounded-2xl border border-slate-200/80 bg-slate-50/50 p-8 text-center shadow-sm transition-shadow hover:shadow-md">
              <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-sky-100">
                <Globe className="h-7 w-7 text-sky-700" aria-hidden />
              </div>
              <h3 className="mb-2 text-lg font-semibold text-slate-900">Remote-friendly</h3>
              <p className="text-sm leading-relaxed text-slate-600">
                Location fields and listings work well for on-site, hybrid, and remote
                roles.
              </p>
            </div>

            <div className="rounded-2xl border border-slate-200/80 bg-slate-50/50 p-8 text-center shadow-sm transition-shadow hover:shadow-md">
              <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-indigo-100">
                <Briefcase className="h-7 w-7 text-indigo-700" aria-hidden />
              </div>
              <h3 className="mb-2 text-lg font-semibold text-slate-900">Applications in one place</h3>
              <p className="text-sm leading-relaxed text-slate-600">
                Track where you have applied and follow up from a single applications list.
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="border-y border-slate-200/80 bg-slate-50 py-16">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {[
              { title: "Clear listings", body: "Titles, salary bands, and requirements at a glance." },
              { title: "Profile completeness", body: "Hints nudge job seekers toward a stronger profile." },
              { title: "Employer tools", body: "Post roles and review applicants without extra noise." },
              { title: "Fast UI", body: "Skeleton states and responsive layouts on every screen." },
            ].map((item) => (
              <div
                key={item.title}
                className="rounded-xl border border-slate-200/60 bg-white p-6 shadow-sm"
              >
                <h3 className="mb-2 font-semibold text-slate-900">{item.title}</h3>
                <p className="text-sm leading-relaxed text-slate-600">{item.body}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* CTA Section */}
      <div className="bg-blue-600 py-20 sm:py-24">
        <div className="mx-auto max-w-7xl px-4 text-center sm:px-6 lg:px-8">
          <h2 className="mb-4 text-3xl font-bold tracking-tight text-white md:text-4xl">
            Ready when you are
          </h2>
          <p className="mx-auto mb-10 max-w-xl text-lg text-blue-100">
            Create a free account to post jobs, apply, or save listings for later.
          </p>
          <div className="flex flex-col justify-center gap-3 sm:flex-row sm:gap-4">
            <Link
              href="/register"
              className="inline-flex items-center justify-center rounded-xl bg-white px-8 py-3.5 text-base font-semibold text-blue-700 shadow-sm transition-colors hover:bg-slate-50 focus:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2 focus-visible:ring-offset-blue-600"
            >
              Get started
              <ArrowRight className="ml-2 h-5 w-5" aria-hidden />
            </Link>
            <Link
              href="/jobs"
              className="inline-flex items-center justify-center rounded-xl border border-white/80 px-8 py-3.5 text-base font-semibold text-white transition-colors hover:bg-blue-700 focus:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2 focus-visible:ring-offset-blue-600"
            >
              Browse jobs
            </Link>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div>
              <div className="flex items-center mb-4">
                <Briefcase className="h-8 w-8 text-blue-400 mr-2" />
                <span className="text-xl font-bold">JobPlatform</span>
              </div>
              <p className="text-gray-400">
                Connecting talented professionals with amazing opportunities
                worldwide.
              </p>
            </div>

            <div>
              <h3 className="text-lg font-semibold mb-4">For Job Seekers</h3>
              <ul className="space-y-2 text-gray-400">
                <li>
                  <Link
                    href="/jobs"
                    className="hover:text-white transition-colors"
                  >
                    Browse Jobs
                  </Link>
                </li>
                <li>
                  <Link
                    href="/register"
                    className="hover:text-white transition-colors"
                  >
                    Create Profile
                  </Link>
                </li>
                <li>
                  <Link
                    href="/applications"
                    className="hover:text-white transition-colors"
                  >
                    My Applications
                  </Link>
                </li>
              </ul>
            </div>

            <div>
              <h3 className="text-lg font-semibold mb-4">For Employers</h3>
              <ul className="space-y-2 text-gray-400">
                <li>
                  <Link
                    href="/post-job"
                    className="hover:text-white transition-colors"
                  >
                    Post a Job
                  </Link>
                </li>
                <li>
                  <Link
                    href="/register"
                    className="hover:text-white transition-colors"
                  >
                    Create Account
                  </Link>
                </li>
                <li>
                  <Link
                    href="/my-jobs"
                    className="hover:text-white transition-colors"
                  >
                    Manage Jobs
                  </Link>
                </li>
              </ul>
            </div>

            <div>
              <h3 className="text-lg font-semibold mb-4">Company</h3>
              <ul className="space-y-2 text-gray-400">
                <li>
                  <Link
                    href="/about"
                    className="hover:text-white transition-colors"
                  >
                    About Us
                  </Link>
                </li>
                <li>
                  <Link
                    href="/contact"
                    className="hover:text-white transition-colors"
                  >
                    Contact
                  </Link>
                </li>
                <li>
                  <Link
                    href="/privacy"
                    className="hover:text-white transition-colors"
                  >
                    Privacy Policy
                  </Link>
                </li>
              </ul>
            </div>
          </div>

          <div className="mt-8 border-t border-gray-800 pt-8 text-center text-gray-400">
            <p>&copy; 2026 JobPlatform. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
