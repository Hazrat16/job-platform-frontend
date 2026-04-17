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
      "full-time": "bg-green-100 text-green-800",
      "part-time": "bg-blue-100 text-blue-800",
      contract: "bg-purple-100 text-purple-800",
      internship: "bg-yellow-100 text-yellow-800",
    };
    return colors[type as keyof typeof colors] || "bg-gray-100 text-gray-800";
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Find Your Next Opportunity
          </h1>
          <p className="text-gray-600">
            Discover thousands of job opportunities with all the information you
            need
          </p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Filters Sidebar */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow p-6 sticky top-8">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold text-gray-900">Filters</h2>
                <button
                  onClick={() => setShowFilters(!showFilters)}
                  className="lg:hidden p-2 text-gray-400 hover:text-gray-600"
                >
                  {showFilters ? (
                    <X className="h-5 w-5" />
                  ) : (
                    <Filter className="h-5 w-5" />
                  )}
                </button>
              </div>

              <div className={`lg:block ${showFilters ? "block" : "hidden"}`}>
                {/* Search */}
                <div className="mb-6">
                  <label
                    htmlFor="search"
                    className="block text-sm font-medium text-gray-700 mb-2"
                  >
                    Search
                  </label>
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <input
                      type="text"
                      id="search"
                      placeholder="Job title, company..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>
                </div>

                {/* Location */}
                <div className="mb-6">
                  <label
                    htmlFor="location"
                    className="block text-sm font-medium text-gray-700 mb-2"
                  >
                    Location
                  </label>
                  <input
                    type="text"
                    id="location"
                    placeholder="City, state, or remote"
                    value={selectedLocation}
                    onChange={(e) => setSelectedLocation(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>

                {/* Job Type */}
                <div className="mb-6">
                  <label
                    htmlFor="type"
                    className="block text-sm font-medium text-gray-700 mb-2"
                  >
                    Job Type
                  </label>
                  <select
                    id="type"
                    value={selectedType}
                    onChange={(e) => setSelectedType(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="">All Types</option>
                    <option value="full-time">Full Time</option>
                    <option value="part-time">Part Time</option>
                    <option value="contract">Contract</option>
                    <option value="internship">Internship</option>
                  </select>
                </div>

                {/* Salary Range */}
                <div className="mb-6">
                  <label
                    htmlFor="salary"
                    className="block text-sm font-medium text-gray-700 mb-2"
                  >
                    Salary Range
                  </label>
                  <select
                    id="salary"
                    value={selectedSalary}
                    onChange={(e) => setSelectedSalary(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
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
                    onClick={clearFilters}
                    className="w-full px-4 py-2 text-sm font-medium text-gray-600 bg-gray-100 rounded-md hover:bg-gray-200 transition-colors"
                  >
                    Clear All Filters
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* Job Listings */}
          <div className="lg:col-span-3">
            <div className="mb-6">
              <div className="flex items-center justify-between">
                <p className="text-gray-600">
                  Showing {filteredJobs.length} of {allJobsCount} jobs
                </p>
                <div className="flex items-center space-x-2">
                  <span className="text-sm text-gray-500">Sort by:</span>
                  <select
                    className="text-sm border border-gray-300 rounded-md px-2 py-1"
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value)}
                  >
                    <option value="recent">Most Recent</option>
                    <option value="salary_desc">Salary: High to Low</option>
                    <option value="salary_asc">Salary: Low to High</option>
                  </select>
                </div>
              </div>
            </div>

            <div className="space-y-4">
              {loading ? (
                <div className="text-center py-12 text-gray-500">Loading jobs...</div>
              ) : filteredJobs.length > 0 ? (
                filteredJobs.map((job) => (
                  <div
                    key={job._id}
                    className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow"
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center space-x-3 mb-2">
                          <h3 className="text-xl font-semibold text-gray-900 hover:text-blue-600">
                            <Link href={`/jobs/${job._id}`}>{job.title}</Link>
                          </h3>
                          <span
                            className={`px-2 py-1 text-xs font-medium rounded-full ${getJobTypeColor(
                              job.type
                            )}`}
                          >
                            {job.type
                              .replace("-", " ")
                              .replace(/\b\w/g, (l) => l.toUpperCase())}
                          </span>
                        </div>

                        <div className="flex items-center space-x-4 text-gray-600 mb-3">
                          <div className="flex items-center">
                            <Briefcase className="h-4 w-4 mr-1" />
                            <span>{job.company}</span>
                          </div>
                          <div className="flex items-center">
                            <MapPin className="h-4 w-4 mr-1" />
                            <span>{job.location}</span>
                          </div>
                          <div className="flex items-center">
                            <DollarSign className="h-4 w-4 mr-1" />
                            <span>{formatSalary(job.salary)}</span>
                          </div>
                          <div className="flex items-center">
                            <Calendar className="h-4 w-4 mr-1" />
                            <span>
                              {new Date(job.createdAt).toLocaleDateString()}
                            </span>
                          </div>
                        </div>

                        <p className="text-gray-600 mb-4 line-clamp-2">
                          {job.description}
                        </p>

                        <div className="flex flex-wrap gap-2 mb-4">
                          {job.requirements.slice(0, 3).map((req, index) => (
                            <span
                              key={index}
                              className="px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded-md"
                            >
                              {req}
                            </span>
                          ))}
                          {job.requirements.length > 3 && (
                            <span className="px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded-md">
                              +{job.requirements.length - 3} more
                            </span>
                          )}
                        </div>

                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-2">
                            <span className="text-sm text-gray-500">
                              Benefits:
                            </span>
                            {job.benefits.slice(0, 2).map((benefit, index) => (
                              <span
                                key={index}
                                className="text-sm text-green-600"
                              >
                                {benefit}
                              </span>
                            ))}
                          </div>

                          <div className="flex items-center space-x-3">
                            <button
                              type="button"
                              onClick={() => void toggleSavedJob(job._id)}
                              disabled={bookmarkBusyId === job._id}
                              aria-label={
                                savedJobIds.includes(job._id)
                                  ? "Remove from saved jobs"
                                  : "Save job"
                              }
                              className={`p-2 rounded-full transition-colors disabled:opacity-50 ${
                                savedJobIds.includes(job._id)
                                  ? "text-blue-600 bg-blue-100"
                                  : "text-gray-400 hover:text-blue-600 hover:bg-blue-50"
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
                              className="px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-md hover:bg-blue-700 transition-colors"
                            >
                              View Details
                            </Link>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-12">
                  <div className="text-gray-400 mb-4">
                    <Search className="h-16 w-16 mx-auto" />
                  </div>
                  <h3 className="text-lg font-medium text-gray-900 mb-2">
                    No jobs found
                  </h3>
                  <p className="text-gray-600 mb-4">
                    Try adjusting your search criteria or filters to find more
                    opportunities.
                  </p>
                  <button
                    onClick={clearFilters}
                    className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
                  >
                    Clear Filters
                  </button>
                </div>
              )}
            </div>

            {/* Load More */}
            {filteredJobs.length > 0 && (
              <div className="text-center mt-8">
                <p className="text-sm text-gray-500">
                  Pagination ready from backend (`page`/`limit`) for next iteration.
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default function JobsPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <JobsPageContent />
    </Suspense>
  );
}
