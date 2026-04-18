"use client";

import { JobApplication } from "@/types";
import { apiClient } from "@/utils/api";
import Link from "next/link";
import { useEffect, useState } from "react";
import toast from "react-hot-toast";

const statusColors: Record<string, string> = {
  pending: "bg-amber-50 text-amber-900 ring-1 ring-amber-100",
  reviewed: "bg-sky-50 text-sky-900 ring-1 ring-sky-100",
  shortlisted: "bg-violet-50 text-violet-900 ring-1 ring-violet-100",
  rejected: "bg-red-50 text-red-800 ring-1 ring-red-100",
  accepted: "bg-emerald-50 text-emerald-900 ring-1 ring-emerald-100",
};

export default function ApplicationsPage() {
  const [applications, setApplications] = useState<JobApplication[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadApplications = async () => {
      try {
        const response = await apiClient.getMyApplications();
        if (!response.success) {
          toast.error(response.message || "Failed to load applications");
          return;
        }
        setApplications(response.data || []);
      } finally {
        setLoading(false);
      }
    };

    void loadApplications();
  }, []);

  return (
    <div className="min-h-[calc(100vh-4rem)] py-10">
      <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold tracking-tight text-slate-900">My applications</h1>
          <p className="mt-1 text-slate-600">
            Track roles you have applied to and open the listing anytime.
          </p>
        </div>

        {loading ? (
          <div className="space-y-3" aria-busy="true" aria-label="Loading applications">
            {[0, 1, 2].map((i) => (
              <div
                key={i}
                className="h-24 animate-pulse rounded-2xl border border-slate-200/80 bg-white shadow-sm"
              />
            ))}
          </div>
        ) : applications.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-slate-200 bg-white px-6 py-12 text-center text-slate-600">
            <p className="mb-4">You have not applied to any jobs yet.</p>
            <Link
              href="/jobs"
              className="inline-flex rounded-xl bg-blue-600 px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-blue-700"
            >
              Browse jobs
            </Link>
          </div>
        ) : (
          <ul className="space-y-4">
            {applications.map((application) => (
              <li
                key={application._id}
                className="flex flex-col gap-4 rounded-2xl border border-slate-200/80 bg-white p-5 shadow-sm transition-shadow hover:shadow-md sm:flex-row sm:items-center sm:justify-between"
              >
                <div className="min-w-0">
                  <h2 className="text-lg font-semibold text-slate-900">
                    {application.job?.title ?? "Job"}
                  </h2>
                  <p className="text-slate-600">{application.job?.company}</p>
                  <p className="mt-1 text-sm text-slate-500">
                    Applied {new Date(application.createdAt).toLocaleDateString()}
                  </p>
                </div>
                <div className="flex shrink-0 flex-wrap items-center gap-3">
                  <span
                    className={`inline-flex rounded-full px-3 py-1 text-xs font-medium capitalize ${
                      statusColors[application.status] || "bg-slate-100 text-slate-700 ring-1 ring-slate-200"
                    }`}
                  >
                    {application.status}
                  </span>
                  <Link
                    href={`/jobs/${application.job?._id}`}
                    className="text-sm font-semibold text-blue-600 hover:text-blue-800"
                  >
                    View job →
                  </Link>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
