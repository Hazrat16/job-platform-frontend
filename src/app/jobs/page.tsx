"use client";

import { Job } from "@/types";
import { apiClient, getUser } from "@/utils/api";
import {
  Bookmark,
  BookmarkPlus,
  Briefcase,
  Calendar,
  DollarSign,
  Filter,
  MapPin,
  Search,
  X,
} from "lucide-react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense, useCallback, useEffect, useState } from "react";
import toast from "react-hot-toast";

function JobsPageContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [filteredJobs, setFilteredJobs] = useState<Job[]>([]);
  const [allJobsCount, setAllJobsCount] = useState(0);
  const [searchQuery, setSearchQuery] = useState(
    searchParams.get("search") || ""
  );
  const [selectedLocation, setSelectedLocation] = useState("");
  const [selectedType, setSelectedType] = useState("");
  const [selectedSalary, setSelectedSalary] = useState("");
  const [showFilters, setShowFilters] = useState(false);
  const [savedJobIds, setSavedJobIds] = useState<string[]>([]);
  const [bookmarkBusyId, setBookmarkBusyId] = useState<string | null>(null);
  const [sortBy, setSortBy] = useState("recent");
  const [loading, setLoading] = useState(false);

  const filterJobs = useCallback(() => {
    const fetchJobs = async () => {
      try {
        setLoading(true);
        const salaryParts = selectedSalary
          ? selectedSalary.split("-").map((val) => parseInt(val, 10))
          : [];
        const minSalary = salaryParts[0];
        const maxSalary = salaryParts[1];

        const response = await apiClient.getJobs({
          search: searchQuery || undefined,
          location: selectedLocation || undefined,
          type: selectedType || undefined,
          minSalary: Number.isFinite(minSalary) ? minSalary : undefined,
          maxSalary: Number.isFinite(maxSalary) ? maxSalary : undefined,
          sort: sortBy,
          limit: 20,
        });

        if (!response.success) {
          toast.error(response.message || "Failed to load jobs");
          return;
        }

        setFilteredJobs(response.data || []);
        setAllJobsCount((response.data || []).length);
      } catch {
        toast.error("Failed to load jobs");
      } finally {
        setLoading(false);
      }
    };

    void fetchJobs();
  }, [searchQuery, selectedLocation, selectedType, selectedSalary, sortBy]);

  useEffect(() => {
    filterJobs();
  }, [filterJobs]);

  useEffect(() => {
    const user = getUser();
    if (user?.role !== "jobseeker") {
      setSavedJobIds([]);
      return;
    }
    let cancelled = false;
    void (async () => {
      const response = await apiClient.getSavedJobs();
      if (cancelled || !response.success || !response.data) return;
      setSavedJobIds(response.data.map((j) => j._id));
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const toggleSavedJob = async (jobId: string) => {
    const user = getUser();
    if (!user) {
      toast.error("Sign in to save jobs");
      router.push("/login");
      return;
    }
    if (user.role !== "jobseeker") {
      toast.error("Only job seekers can save jobs");
      return;
    }
    if (bookmarkBusyId) return;

    const isSaved = savedJobIds.includes(jobId);
    setBookmarkBusyId(jobId);
    try {
      if (isSaved) {
        const response = await apiClient.unsaveJob(jobId);
        if (!response.success) {
          toast.error(response.message || "Could not unsave job");
          return;
        }
        setSavedJobIds((prev) => prev.filter((id) => id !== jobId));
        toast.success("Removed from saved jobs");
      } else {
        const response = await apiClient.saveJob(jobId);
        if (!response.success) {
          toast.error(response.message || "Could not save job");
          return;
        }
        setSavedJobIds((prev) =>
          prev.includes(jobId) ? prev : [...prev, jobId],
        );
        toast.success("Job saved");
      }
    } finally {
      setBookmarkBusyId(null);
    }
  };

  const clearFilters = () => {
    setSearchQuery("");
    setSelectedLocation("");
    setSelectedType("");
    setSelectedSalary("");
  };

  const formatSalary = (salary: Job["salary"]) => {
    return `${salary.currency}${salary.min.toLocaleString()} - ${
      salary.currency
    }${salary.max.toLocaleString()}`;
  };

  const getJobTypeColor = (type: string) => {
    const colors = {
      "full-time": "bg-emerald-50 text-emerald-800 ring-1 ring-emerald-100",
      "part-time": "bg-sky-50 text-sky-800 ring-1 ring-sky-100",
      contract: "bg-violet-50 text-violet-800 ring-1 ring-violet-100",
      internship: "bg-amber-50 text-amber-900 ring-1 ring-amber-100",
    };
    return colors[type as keyof typeof colors] || "bg-slate-100 text-slate-700 ring-1 ring-slate-200";
  };

  const fieldClass =
    "w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm text-slate-900 shadow-sm transition-shadow focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20";

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="border-b border-slate-200/80 bg-white">
        <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
          <h1 className="text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl">
            Find your next role
          </h1>
          <p className="mt-2 max-w-2xl text-slate-600">
            Filter by keywords, location, and salary. Save jobs when you are signed in as a
            job seeker.
          </p>
        </div>
      </div>

      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 gap-8 lg:grid-cols-4">
          <div className="lg:col-span-1">
            <div className="sticky top-24 rounded-2xl border border-slate-200/80 bg-white p-6 shadow-sm">
              <div className="mb-4 flex items-center justify-between">
                <h2 className="text-base font-semibold text-slate-900">Filters</h2>
                <button
                  type="button"
                  onClick={() => setShowFilters(!showFilters)}
                  className="rounded-lg p-2 text-slate-500 transition-colors hover:bg-slate-100 hover:text-slate-800 lg:hidden"
                  aria-expanded={showFilters}
                  aria-controls="job-filters"
                  aria-label={showFilters ? "Hide filters" : "Show filters"}
                >
                  {showFilters ? (
                    <X className="h-5 w-5" />
                  ) : (
                    <Filter className="h-5 w-5" />
                  )}
                </button>
              </div>

              <div
                id="job-filters"
                className={`lg:block ${showFilters ? "block" : "hidden"}`}
              >
                <div className="mb-6">
                  <label
                    htmlFor="search"
                    className="mb-2 block text-sm font-medium text-slate-700"
                  >
                    Search
                  </label>
                  <div className="relative">
                    <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                    <input
                      type="text"
                      id="search"
                      placeholder="Job title, company…"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className={`${fieldClass} pl-10`}
                    />
                  </div>
                </div>

                <div className="mb-6">
                  <label
                    htmlFor="location"
                    className="mb-2 block text-sm font-medium text-slate-700"
                  >
                    Location
                  </label>
                  <input
                    type="text"
                    id="location"
                    placeholder="City, state, or remote"
                    value={selectedLocation}
                    onChange={(e) => setSelectedLocation(e.target.value)}
                    className={fieldClass}
                  />
                </div>

                <div className="mb-6">
                  <label
                    htmlFor="type"
                    className="mb-2 block text-sm font-medium text-slate-700"
                  >
                    Job type
                  </label>
                  <select
                    id="type"
                    value={selectedType}
                    onChange={(e) => setSelectedType(e.target.value)}
                    className={fieldClass}
                  >
                    <option value="">All Types</option>
                    <option value="full-time">Full Time</option>
                    <option value="part-time">Part Time</option>
                    <option value="contract">Contract</option>
                    <option value="internship">Internship</option>
                  </select>
                </div>

                <div className="mb-6">
                  <label
                    htmlFor="salary"
                    className="mb-2 block text-sm font-medium text-slate-700"
                  >
                    Salary range
                  </label>
                  <select
                    id="salary"
                    value={selectedSalary}
                    onChange={(e) => setSelectedSalary(e.target.value)}
                    className={fieldClass}
                  >
                    <option value="">All Salaries</option>
                    <option value="0-50000">$0 - $50,000</option>
                    <option value="50000-100000">$50,000 - $100,000</option>
                    <option value="100000-150000">$100,000 - $150,000</option>
                    <option value="150000-200000">$150,000 - $200,000</option>
                    <option value="200000-999999">$200,000+</option>
                  </select>
                </div>

                {/* Clear Filters */}
                {(searchQuery ||
                  selectedLocation ||
                  selectedType ||
                  selectedSalary) && (
                  <button
                    type="button"
                    onClick={clearFilters}
                    className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-2.5 text-sm font-medium text-slate-700 transition-colors hover:bg-slate-100"
                  >
                    Clear all filters
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* Job Listings */}
          <div className="lg:col-span-3">
            <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <p className="text-sm text-slate-600">
                <span className="font-semibold text-slate-900">{filteredJobs.length}</span>{" "}
                {filteredJobs.length === 1 ? "job" : "jobs"}
                {allJobsCount > 0 && (
                  <span className="text-slate-500"> in this list</span>
                )}
              </p>
              <div className="flex items-center gap-2">
                <label htmlFor="sort-jobs" className="text-sm text-slate-500">
                  Sort
                </label>
                <select
                  id="sort-jobs"
                  className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                >
                    <option value="recent">Most Recent</option>
                    <option value="salary_desc">Salary: High to Low</option>
                    <option value="salary_asc">Salary: Low to High</option>
                  </select>
                </div>
            </div>

            <div className="space-y-4">
              {loading ? (
                <div className="space-y-4" aria-busy="true" aria-label="Loading jobs">
                  {[0, 1, 2, 3].map((i) => (
                    <div
                      key={i}
                      className="animate-pulse rounded-2xl border border-slate-200/80 bg-white p-6 shadow-sm"
                    >
                      <div className="mb-3 h-5 w-2/3 max-w-md rounded-lg bg-slate-200" />
                      <div className="mb-4 flex gap-2">
                        <div className="h-4 w-24 rounded bg-slate-100" />
                        <div className="h-4 w-28 rounded bg-slate-100" />
                      </div>
                      <div className="mb-2 h-3 w-full rounded bg-slate-100" />
                      <div className="h-3 w-full max-w-lg rounded bg-slate-100 opacity-90" />
                    </div>
                  ))}
                </div>
              ) : filteredJobs.length > 0 ? (
                filteredJobs.map((job) => (
                  <article
                    key={job._id}
                    className="group rounded-2xl border border-slate-200/80 bg-white p-6 shadow-sm transition-all duration-200 hover:border-slate-300 hover:shadow-md"
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div className="min-w-0 flex-1">
                        <div className="mb-2 flex flex-wrap items-center gap-2 sm:gap-3">
                          <h2 className="text-lg font-semibold text-slate-900 sm:text-xl">
                            <Link
                              href={`/jobs/${job._id}`}
                              className="transition-colors hover:text-blue-600 focus:outline-none focus-visible:text-blue-600"
                            >
                              {job.title}
                            </Link>
                          </h2>
                          <span
                            className={`inline-flex shrink-0 items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${getJobTypeColor(
                              job.type,
                            )}`}
                          >
                            {job.type
                              .replace("-", " ")
                              .replace(/\b\w/g, (l) => l.toUpperCase())}
                          </span>
                        </div>

                        <div className="mb-3 flex flex-wrap gap-x-4 gap-y-2 text-sm text-slate-600">
                          <div className="flex items-center gap-1">
                            <Briefcase className="h-4 w-4 shrink-0 text-slate-400" />
                            <span>{job.company}</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <MapPin className="h-4 w-4 shrink-0 text-slate-400" />
                            <span>{job.location}</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <DollarSign className="h-4 w-4 shrink-0 text-slate-400" />
                            <span>{formatSalary(job.salary)}</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <Calendar className="h-4 w-4 shrink-0 text-slate-400" />
                            <span>
                              {new Date(job.createdAt).toLocaleDateString()}
                            </span>
                          </div>
                        </div>

                        <p className="mb-4 line-clamp-2 text-slate-600">{job.description}</p>

                        <div className="mb-4 flex flex-wrap gap-2">
                          {job.requirements.slice(0, 3).map((req, index) => (
                            <span
                              key={index}
                              className="rounded-lg bg-slate-100 px-2 py-1 text-xs font-medium text-slate-700"
                            >
                              {req}
                            </span>
                          ))}
                          {job.requirements.length > 3 && (
                            <span className="rounded-lg bg-slate-100 px-2 py-1 text-xs font-medium text-slate-600">
                              +{job.requirements.length - 3} more
                            </span>
                          )}
                        </div>

                        <div className="flex flex-col gap-4 border-t border-slate-100 pt-4 sm:flex-row sm:items-center sm:justify-between">
                          <div className="flex min-w-0 flex-wrap items-center gap-x-2 gap-y-1 text-sm">
                            <span className="font-medium text-slate-500">Benefits</span>
                            {job.benefits.slice(0, 2).map((benefit, index) => (
                              <span key={index} className="text-emerald-700">
                                {benefit}
                              </span>
                            ))}
                          </div>

                          <div className="flex shrink-0 items-center justify-end gap-2">
                            <button
                              type="button"
                              onClick={() => void toggleSavedJob(job._id)}
                              disabled={bookmarkBusyId === job._id}
                              aria-label={
                                savedJobIds.includes(job._id)
                                  ? "Remove from saved jobs"
                                  : "Save job"
                              }
                              className={`rounded-full p-2.5 transition-colors disabled:opacity-50 ${
                                savedJobIds.includes(job._id)
                                  ? "bg-blue-50 text-blue-600"
                                  : "text-slate-400 hover:bg-blue-50 hover:text-blue-600"
                              }`}
                            >
                              {savedJobIds.includes(job._id) ? (
                                <Bookmark className="h-5 w-5 fill-current" />
                              ) : (
                                <BookmarkPlus className="h-5 w-5" />
                              )}
                            </button>

                            <Link
                              href={`/jobs/${job._id}`}
                              className="inline-flex items-center rounded-xl bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-blue-700 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2"
                            >
                              View details
                            </Link>
                          </div>
                        </div>
                      </div>
                    </div>
                  </article>
                ))
              ) : (
                <div className="rounded-2xl border border-dashed border-slate-200 bg-white px-6 py-14 text-center">
                  <Search className="mx-auto mb-4 h-14 w-14 text-slate-300" />
                  <h3 className="text-lg font-semibold text-slate-900">No jobs match</h3>
                  <p className="mx-auto mt-2 max-w-md text-slate-600">
                    Loosen filters or clear search to see more roles.
                  </p>
                  <button
                    type="button"
                    onClick={clearFilters}
                    className="mt-6 inline-flex rounded-xl bg-blue-600 px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-blue-700"
                  >
                    Clear filters
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function JobsPageFallback() {
  return (
    <div className="min-h-screen bg-slate-50 px-4 py-10 sm:px-6">
      <div className="mx-auto max-w-7xl space-y-4">
        <div className="h-10 max-w-md animate-pulse rounded-xl bg-slate-200" />
        <div className="h-24 animate-pulse rounded-2xl bg-white shadow-sm" />
        <div className="grid gap-8 lg:grid-cols-4">
          <div className="hidden h-64 animate-pulse rounded-2xl bg-white shadow-sm lg:block" />
          <div className="space-y-4 lg:col-span-3">
            {[0, 1, 2].map((i) => (
              <div
                key={i}
                className="h-40 animate-pulse rounded-2xl border border-slate-200/80 bg-white"
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

export default function JobsPage() {
  return (
    <Suspense fallback={<JobsPageFallback />}>
      <JobsPageContent />
    </Suspense>
  );
}
