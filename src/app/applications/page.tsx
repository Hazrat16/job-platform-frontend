"use client";

import { JobApplication } from "@/types";
import { apiClient } from "@/utils/api";
import Link from "next/link";
import { useEffect, useState } from "react";
import toast from "react-hot-toast";

const statusColors: Record<string, string> = {
  pending: "bg-yellow-100 text-yellow-800",
  reviewed: "bg-blue-100 text-blue-800",
  shortlisted: "bg-purple-100 text-purple-800",
  rejected: "bg-red-100 text-red-800",
  accepted: "bg-green-100 text-green-800",
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
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-6">My Applications</h1>

        {loading ? (
          <div className="text-gray-500">Loading applications...</div>
        ) : applications.length === 0 ? (
          <div className="bg-white p-6 rounded-lg shadow text-gray-600">
            No applications yet.{" "}
            <Link href="/jobs" className="text-blue-600 hover:underline">
              Browse jobs
            </Link>
            .
          </div>
        ) : (
          <div className="space-y-4">
            {applications.map((application) => (
              <div
                key={application._id}
                className="bg-white rounded-lg shadow p-5 flex items-center justify-between gap-4"
              >
                <div>
                  <h2 className="text-lg font-semibold text-gray-900">
                    {application.job?.title}
                  </h2>
                  <p className="text-gray-600">{application.job?.company}</p>
                  <p className="text-sm text-gray-500 mt-1">
                    Applied on {new Date(application.createdAt).toLocaleDateString()}
                  </p>
                </div>
                <div className="flex items-center gap-3">
                  <span
                    className={`px-3 py-1 rounded-full text-xs font-medium ${
                      statusColors[application.status] || "bg-gray-100 text-gray-700"
                    }`}
                  >
                    {application.status}
                  </span>
                  <Link
                    href={`/jobs/${application.job?._id}`}
                    className="text-blue-600 hover:underline text-sm"
                  >
                    View Job
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
