"use client";

import { Job } from "@/types";
import { apiClient, getUser } from "@/utils/api";
import {
  AlertCircle,
  ArrowLeft,
  Bookmark,
  BookmarkPlus,
  Briefcase,
  Calendar,
  DollarSign,
  MapPin,
  Send,
  User,
} from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import toast from "react-hot-toast";

interface JobApplicationForm {
  coverLetter: string;
  resume: File | null;
}

export default function JobDetailsPage({ params }: { params: { id: string } }) {
  const [job, setJob] = useState<Job | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isApplying, setIsApplying] = useState(false);
  const [showApplicationForm, setShowApplicationForm] = useState(false);
  const [savedJobs, setSavedJobs] = useState<string[]>([]);
  const [showPassword, setShowPassword] = useState(false);
  const router = useRouter();
  const currentUser = getUser();

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
    reset,
  } = useForm<JobApplicationForm>();

  const resume = watch("resume");

  useEffect(() => {
    fetchJob();
    // Load saved jobs from localStorage
    const saved = localStorage.getItem("savedJobs");
    if (saved) {
      setSavedJobs(JSON.parse(saved));
    }
  }, [params.id]);

  const fetchJob = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await apiClient.getJob(params.id);
      if (response.success && response.data) {
        setJob(response.data);
      } else {
        setError(response.message || "Failed to fetch job");
        toast.error(response.message || "Failed to fetch job");
      }
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : "Failed to fetch job";
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const toggleSavedJob = (jobId: string) => {
    const newSavedJobs = savedJobs.includes(jobId)
      ? savedJobs.filter((id) => id !== jobId)
      : [...savedJobs, jobId];

    setSavedJobs(newSavedJobs);
    localStorage.setItem("savedJobs", JSON.stringify(newSavedJobs));

    if (savedJobs.includes(jobId)) {
      toast.success("Job removed from saved jobs");
    } else {
      toast.success("Job saved to your list");
    }
  };

  const handleApply = async (data: JobApplicationForm) => {
    if (!currentUser) {
      toast.error("Please log in to apply for jobs");
      router.push("/login");
      return;
    }

    if (!data.resume) {
      toast.error("Please upload your resume");
      return;
    }

    setIsApplying(true);
    try {
      const formData = new FormData();
      formData.append("resume", data.resume);
      if (data.coverLetter) {
        formData.append("coverLetter", data.coverLetter);
      }

      const response = await apiClient.applyForJob(params.id, formData);

      if (response.success) {
        toast.success("Application submitted successfully!");
        setShowApplicationForm(false);
        reset();
        // Refresh job data to show updated application count
        fetchJob();
      } else {
        toast.error(response.message || "Failed to submit application");
      }
    } catch (error: unknown) {
      const errorMessage =
        error instanceof Error ? error.message : "Failed to submit application";
      toast.error(errorMessage);
    } finally {
      setIsApplying(false);
    }
  };

  const formatSalary = (salary: Job["salary"]) => {
    return `${salary.currency}${salary.min.toLocaleString()} - ${
      salary.currency
    }${salary.max.toLocaleString()}`;
  };

  const getJobTypeColor = (type: string) => {
    const colors = {
      "full-time": "bg-green-100 text-green-800",
      "part-time": "bg-blue-100 text-blue-800",
      contract: "bg-purple-100 text-purple-800",
      internship: "bg-yellow-100 text-yellow-800",
    };
    return colors[type as keyof typeof colors] || "bg-gray-100 text-gray-800";
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading job details...</p>
        </div>
      </div>
    );
  }

  if (error || !job) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="text-red-500 mb-4">
            <AlertCircle className="h-16 w-16 mx-auto" />
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            Error loading job
          </h3>
          <p className="text-gray-600 mb-4">{error || "Job not found"}</p>
          <div className="space-x-4">
            <button
              onClick={fetchJob}
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
            >
              Try Again
            </button>
            <Link
              href="/jobs"
              className="px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 transition-colors"
            >
              Back to Jobs
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Link
                href="/jobs"
                className="text-blue-600 hover:text-blue-700 transition-colors"
              >
                <ArrowLeft className="h-6 w-6" />
              </Link>
              <div>
                <h1 className="text-3xl font-bold text-gray-900">
                  {job.title}
                </h1>
                <p className="text-gray-600">{job.company}</p>
              </div>
            </div>
            <div className="flex items-center space-x-3">
              <button
                onClick={() => toggleSavedJob(job._id)}
                className={`p-3 rounded-full transition-colors ${
                  savedJobs.includes(job._id)
                    ? "text-blue-600 bg-blue-100"
                    : "text-gray-400 hover:text-blue-600 hover:bg-blue-50"
                }`}
              >
                {savedJobs.includes(job._id) ? (
                  <Bookmark className="h-6 w-6 fill-current" />
                ) : (
                  <BookmarkPlus className="h-6 w-6" />
                )}
              </button>
              {currentUser && currentUser.role === "jobseeker" && (
                <button
                  onClick={() => setShowApplicationForm(!showApplicationForm)}
                  className="px-6 py-3 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
                >
                  Apply Now
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-8">
            {/* Job Overview */}
            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center space-x-3 mb-4">
                <span
                  className={`px-3 py-1 text-sm font-medium rounded-full ${getJobTypeColor(
                    job.type
                  )}`}
                >
                  {job.type
                    .replace("-", " ")
                    .replace(/\b\w/g, (l) => l.toUpperCase())}
                </span>
                <span className="text-sm text-gray-500">
                  Posted {new Date(job.createdAt).toLocaleDateString()}
                </span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                <div className="flex items-center text-gray-600">
                  <Briefcase className="h-5 w-5 mr-2" />
                  <span>{job.company}</span>
                </div>
                <div className="flex items-center text-gray-600">
                  <MapPin className="h-5 w-5 mr-2" />
                  <span>{job.location}</span>
                </div>
                <div className="flex items-center text-gray-600">
                  <DollarSign className="h-5 w-5 mr-2" />
                  <span>{formatSalary(job.salary)}</span>
                </div>
              </div>

              <div className="prose max-w-none">
                <h3 className="text-lg font-semibold text-gray-900 mb-3">
                  Job Description
                </h3>
                <p className="text-gray-700 whitespace-pre-wrap">
                  {job.description}
                </p>
              </div>
            </div>

            {/* Requirements */}
            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                <AlertCircle className="h-5 w-5 mr-2 text-orange-600" />
                Requirements & Skills
              </h3>
              <ul className="space-y-2">
                {job.requirements.map((req, index) => (
                  <li key={index} className="flex items-start">
                    <span className="w-2 h-2 bg-blue-600 rounded-full mt-2 mr-3 flex-shrink-0"></span>
                    <span className="text-gray-700">{req}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Benefits */}
            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                <Calendar className="h-5 w-5 mr-2 text-green-600" />
                Benefits & Perks
              </h3>
              <ul className="space-y-2">
                {job.benefits.map((benefit, index) => (
                  <li key={index} className="flex items-start">
                    <span className="w-2 h-2 bg-green-600 rounded-full mt-2 mr-3 flex-shrink-0"></span>
                    <span className="text-gray-700">{benefit}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Application Form */}
            {showApplicationForm && (
              <div className="bg-white rounded-lg shadow p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                  <Send className="h-5 w-5 mr-2 text-blue-600" />
                  Apply for this Position
                </h3>
                <form
                  onSubmit={handleSubmit(handleApply)}
                  className="space-y-6"
                >
                  {/* Resume Upload */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Resume/CV *
                    </label>
                    <div className="flex items-center space-x-3">
                      <input
                        type="file"
                        accept=".pdf,.doc,.docx"
                        {...register("resume", {
                          required: "Resume is required",
                        })}
                        className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-medium file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                      />
                    </div>
                    {errors.resume && (
                      <div className="mt-1 flex items-center text-sm text-red-600">
                        <AlertCircle className="h-4 w-4 mr-1" />
                        {errors.resume.message}
                      </div>
                    )}
                    <p className="mt-1 text-sm text-gray-500">
                      Accepted formats: PDF, DOC, DOCX (Max 5MB)
                    </p>
                  </div>

                  {/* Cover Letter */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Cover Letter (Optional)
                    </label>
                    <textarea
                      {...register("coverLetter")}
                      rows={6}
                      placeholder="Tell us why you're interested in this position and why you'd be a great fit..."
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>

                  {/* Submit Buttons */}
                  <div className="flex space-x-3">
                    <button
                      type="submit"
                      disabled={isApplying}
                      className="px-6 py-3 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    >
                      {isApplying ? (
                        <div className="flex items-center">
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                          Submitting...
                        </div>
                      ) : (
                        "Submit Application"
                      )}
                    </button>
                    <button
                      type="button"
                      onClick={() => setShowApplicationForm(false)}
                      className="px-6 py-3 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 transition-colors"
                    >
                      Cancel
                    </button>
                  </div>
                </form>
              </div>
            )}
          </div>

          {/* Sidebar */}
          <div className="lg:col-span-1">
            <div className="space-y-6">
              {/* Company Info */}
              <div className="bg-white rounded-lg shadow p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                  <User className="h-5 w-5 mr-2 text-blue-600" />
                  About the Company
                </h3>
                <div className="space-y-3">
                  <div>
                    <p className="text-sm font-medium text-gray-700">Company</p>
                    <p className="text-gray-900">{job.company}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-700">
                      Location
                    </p>
                    <p className="text-gray-900">{job.location}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-700">
                      Job Type
                    </p>
                    <p className="text-gray-900 capitalize">
                      {job.type.replace("-", " ")}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-700">
                      Salary Range
                    </p>
                    <p className="text-gray-900">{formatSalary(job.salary)}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-700">Posted</p>
                    <p className="text-gray-900">
                      {new Date(job.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                </div>
              </div>

              {/* Quick Actions */}
              <div className="bg-white rounded-lg shadow p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">
                  Quick Actions
                </h3>
                <div className="space-y-3">
                  {currentUser && currentUser.role === "jobseeker" ? (
                    <button
                      onClick={() =>
                        setShowApplicationForm(!showApplicationForm)
                      }
                      className="w-full px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
                    >
                      {showApplicationForm ? "Hide Application" : "Apply Now"}
                    </button>
                  ) : (
                    <div className="text-center py-4">
                      <p className="text-sm text-gray-600 mb-3">
                        Please log in as a job seeker to apply
                      </p>
                      <Link
                        href="/login"
                        className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
                      >
                        Sign In
                      </Link>
                    </div>
                  )}

                  <button
                    onClick={() => toggleSavedJob(job._id)}
                    className={`w-full px-4 py-2 rounded-md transition-colors ${
                      savedJobs.includes(job._id)
                        ? "bg-blue-100 text-blue-700 border border-blue-300"
                        : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                    }`}
                  >
                    {savedJobs.includes(job._id) ? "Saved" : "Save Job"}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
