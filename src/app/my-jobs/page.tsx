"use client";

import { Job } from "@/types";
import { apiClient, getAuthToken, getUser } from "@/utils/api";
import { useAuthGuard } from "@/hooks/useAuthGuard";
import { Briefcase, Loader2, MapPin, Plus } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import toast from "react-hot-toast";

export default function MyJobsPage() {
  const router = useRouter();
  const { ready } = useAuthGuard({ roles: ["employer"] });
  const [jobs, setJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!ready) {
      return;
    }
    if (!getAuthToken() || getUser()?.role !== "employer") return;

    const load = async () => {
      const res = await apiClient.getMyJobs();
      if (!res.success) {
        toast.error(res.message || "Could not load your jobs");
        setLoading(false);
        return;
      }
      setJobs(res.data ?? []);
      setLoading(false);
    };

    void load();
  }, [ready, router]);

  if (!ready || loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-accent" />
      </div>
    );
  }

  return (
    <div className="min-h-screen py-10">
      <div className="max-w-4xl mx-auto px-4">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
          <div>
            <h1 className="text-2xl font-bold text-foreground">My job posts</h1>
            <p className="text-fg-muted mt-1">
              Manage listings you have published.
            </p>
          </div>
          <Link
            href="/post-job"
            className="inline-flex items-center justify-center gap-2 rounded-lg bg-gradient-to-r from-accent to-accent-end px-4 py-2 text-white transition-all hover:brightness-110"
          >
            <Plus className="h-4 w-4" />
            Post a job
          </Link>
        </div>

        {jobs.length === 0 ? (
          <div className="bg-card rounded-lg shadow p-8 text-center text-fg-muted">
            <Briefcase className="mx-auto mb-3 h-12 w-12 text-fg-subtle" />
            <p className="mb-4">You have not posted any jobs yet.</p>
            <Link
              href="/post-job"
              className="text-accent font-medium hover:underline"
            >
              Post your first job
            </Link>
          </div>
        ) : (
          <ul className="space-y-4">
            {jobs.map((job) => (
              <li
                key={job._id}
                className="bg-card rounded-lg shadow border border-border p-5 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3"
              >
                <div>
                  <h2 className="text-lg font-semibold text-foreground">
                    <Link
                      href={`/jobs/${job._id}`}
                      className="hover:text-accent"
                    >
                      {job.title}
                    </Link>
                  </h2>
                  <p className="text-fg-muted text-sm">{job.company}</p>
                  <p className="text-fg-subtle text-sm flex items-center gap-1 mt-1">
                    <MapPin className="h-3.5 w-3.5" />
                    {job.location}
                    <span className="mx-2">·</span>
                    <span className="capitalize">{job.status}</span>
                    <span className="mx-2">·</span>
                    <span>
                      {job.applicationCount ?? 0}{" "}
                      {(job.applicationCount ?? 0) === 1 ? "applicant" : "applicants"}
                    </span>
                  </p>
                </div>
                <div className="flex shrink-0 flex-col items-end gap-2 sm:flex-row sm:items-center">
                  <Link
                    href={`/my-jobs/${job._id}/applications`}
                    className="text-sm font-medium text-accent hover:underline"
                  >
                    View applicants
                  </Link>
                  <Link
                    href={`/jobs/${job._id}`}
                    className="text-sm text-fg-muted hover:underline"
                  >
                    Public listing
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
