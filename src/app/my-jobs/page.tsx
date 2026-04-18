"use client";

import { Job } from "@/types";
import { apiClient, getAuthToken, getUser } from "@/utils/api";
import { Briefcase, Loader2, MapPin, Plus } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import toast from "react-hot-toast";

export default function MyJobsPage() {
  const router = useRouter();
  const [jobs, setJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!getAuthToken()) {
      router.replace("/login");
      return;
    }
    const u = getUser();
    if (u?.role !== "employer") {
      router.replace("/jobs");
      return;
    }

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
  }, [router]);

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
      </div>
    );
  }

  return (
    <div className="min-h-screen py-10">
      <div className="max-w-4xl mx-auto px-4">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">My job posts</h1>
            <p className="text-gray-600 mt-1">
              Manage listings you have published.
            </p>
          </div>
          <Link
            href="/post-job"
            className="inline-flex items-center justify-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            <Plus className="h-4 w-4" />
            Post a job
          </Link>
        </div>

        {jobs.length === 0 ? (
          <div className="bg-white rounded-lg shadow p-8 text-center text-gray-600">
            <Briefcase className="h-12 w-12 mx-auto text-gray-300 mb-3" />
            <p className="mb-4">You have not posted any jobs yet.</p>
            <Link
              href="/post-job"
              className="text-blue-600 font-medium hover:underline"
            >
              Post your first job
            </Link>
          </div>
        ) : (
          <ul className="space-y-4">
            {jobs.map((job) => (
              <li
                key={job._id}
                className="bg-white rounded-lg shadow border border-gray-200 p-5 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3"
              >
                <div>
                  <h2 className="text-lg font-semibold text-gray-900">
                    <Link
                      href={`/jobs/${job._id}`}
                      className="hover:text-blue-600"
                    >
                      {job.title}
                    </Link>
                  </h2>
                  <p className="text-gray-600 text-sm">{job.company}</p>
                  <p className="text-gray-500 text-sm flex items-center gap-1 mt-1">
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
                    className="text-sm font-medium text-blue-600 hover:underline"
                  >
                    View applicants
                  </Link>
                  <Link
                    href={`/jobs/${job._id}`}
                    className="text-sm text-slate-600 hover:underline"
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
