"use client";

import { Job } from "@/types";
import { apiClient, getUser } from "@/utils/api";
import { Building2, DollarSign, MapPin } from "lucide-react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { useEffect, useState } from "react";
import toast from "react-hot-toast";

export default function JobDetailsPage() {
  const params = useParams<{ id: string }>();
  const [job, setJob] = useState<Job | null>(null);
  const [loading, setLoading] = useState(true);
  const currentUser = getUser();

  useEffect(() => {
    const loadJob = async () => {
      try {
        const response = await apiClient.getJob(params.id);
        if (!response.success || !response.data) {
          toast.error(response.message || "Failed to fetch job details");
          return;
        }
        setJob(response.data);
      } finally {
        setLoading(false);
      }
    };

    if (params.id) void loadJob();
  }, [params.id]);

  if (loading) {
    return <div className="p-8 text-center text-fg-subtle">Loading job...</div>;
  }

  if (!job) {
    return <div className="p-8 text-center text-red-500">Job not found</div>;
  }

  return (
    <div className="min-h-screen py-8">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-card shadow rounded-lg p-8 space-y-6">
          <div className="space-y-3">
            <h1 className="text-3xl font-bold text-foreground">{job.title}</h1>
            <div className="flex flex-wrap gap-4 text-fg-muted">
              <span className="inline-flex items-center gap-1">
                <Building2 className="h-4 w-4" />
                {job.company}
              </span>
              <span className="inline-flex items-center gap-1">
                <MapPin className="h-4 w-4" />
                {job.location}
              </span>
              <span className="inline-flex items-center gap-1">
                <DollarSign className="h-4 w-4" />
                {job.salary.currency}
                {job.salary.min.toLocaleString()} - {job.salary.currency}
                {job.salary.max.toLocaleString()}
              </span>
            </div>
          </div>

          <div>
            <h2 className="text-xl font-semibold text-foreground mb-2">
              Description
            </h2>
            <p className="text-fg-muted whitespace-pre-line">{job.description}</p>
          </div>

          <div>
            <h2 className="text-xl font-semibold text-foreground mb-2">
              Requirements
            </h2>
            <ul className="list-disc pl-5 space-y-1 text-fg-muted">
              {job.requirements.map((item, idx) => (
                <li key={`${item}-${idx}`}>{item}</li>
              ))}
            </ul>
          </div>

          <div>
            <h2 className="text-xl font-semibold text-foreground mb-2">Benefits</h2>
            <ul className="list-disc pl-5 space-y-1 text-fg-muted">
              {job.benefits.map((item, idx) => (
                <li key={`${item}-${idx}`}>{item}</li>
              ))}
            </ul>
          </div>

          <div className="flex gap-3 pt-2">
            <Link
              href="/jobs"
              className="px-5 py-2 border border-border-strong rounded-md text-fg-muted hover:bg-card-muted"
            >
              Back to Jobs
            </Link>
            {currentUser?.role === "jobseeker" && (
              <Link
                href={`/jobs/${job._id}/apply`}
                className="px-5 py-2 rounded-md bg-blue-600 text-white hover:bg-blue-700"
              >
                Apply Now
              </Link>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
