"use client";

import { Job } from "@/types";
import { apiClient } from "@/utils/api";
import { BookmarkX, Briefcase, MapPin } from "lucide-react";
import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import toast from "react-hot-toast";

export default function SavedJobsPage() {
  const [jobs, setJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(true);
  const [removingId, setRemovingId] = useState<string | null>(null);

  const loadSaved = useCallback(async () => {
    setLoading(true);
    try {
      const response = await apiClient.getSavedJobs();
      if (!response.success) {
        toast.error(response.message || "Failed to load saved jobs");
        setJobs([]);
        return;
      }
      setJobs(response.data || []);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadSaved();
  }, [loadSaved]);

  const handleUnsave = async (jobId: string) => {
    setRemovingId(jobId);
    try {
      const response = await apiClient.unsaveJob(jobId);
      if (!response.success) {
        toast.error(response.message || "Could not remove job");
        return;
      }
      setJobs((prev) => prev.filter((j) => j._id !== jobId));
      toast.success("Removed from saved jobs");
    } finally {
      setRemovingId(null);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Saved Jobs</h1>
        <p className="text-gray-600 mb-6">
          Jobs you bookmarked from the browse list. Sign in as a job seeker to use this list.
        </p>

        {loading ? (
          <div className="text-gray-500">Loading saved jobs...</div>
        ) : jobs.length === 0 ? (
          <div className="bg-white p-6 rounded-lg shadow text-gray-600">
            No saved jobs yet.{" "}
            <Link href="/jobs" className="text-blue-600 hover:underline">
              Browse jobs
            </Link>{" "}
            and tap the bookmark icon on a listing.
          </div>
        ) : (
          <div className="space-y-4">
            {jobs.map((job) => (
              <div
                key={job._id}
                className="bg-white rounded-lg shadow p-5 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4"
              >
                <div>
                  <h2 className="text-lg font-semibold text-gray-900">
                    <Link href={`/jobs/${job._id}`} className="hover:text-blue-600">
                      {job.title}
                    </Link>
                  </h2>
                  <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-gray-600 text-sm mt-1">
                    <span className="flex items-center gap-1">
                      <Briefcase className="h-4 w-4" />
                      {job.company}
                    </span>
                    <span className="flex items-center gap-1">
                      <MapPin className="h-4 w-4" />
                      {job.location}
                    </span>
                  </div>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <Link
                    href={`/jobs/${job._id}`}
                    className="px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-md hover:bg-blue-700"
                  >
                    View
                  </Link>
                  <button
                    type="button"
                    onClick={() => void handleUnsave(job._id)}
                    disabled={removingId === job._id}
                    className="inline-flex items-center gap-1 px-3 py-2 text-sm font-medium text-gray-700 border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50"
                    title="Remove from saved"
                  >
                    <BookmarkX className="h-4 w-4" />
                    {removingId === job._id ? "..." : "Unsave"}
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
