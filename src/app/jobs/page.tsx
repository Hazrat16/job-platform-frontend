"use client";

import { Job } from "@/types";
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
import { useSearchParams } from "next/navigation";
import { Suspense, useCallback, useEffect, useState } from "react";

// Mock data for demonstration - replace with actual API calls
const mockJobs: Job[] = [
  {
    _id: "1",
    title: "Senior Frontend Developer",
    company: "TechCorp Inc.",
    location: "San Francisco, CA",
    type: "full-time",
    salary: { min: 120000, max: 180000, currency: "USD" },
    description:
      "We are looking for a talented Senior Frontend Developer to join our team...",
    requirements: [
      "React",
      "TypeScript",
      "5+ years experience",
      "Team leadership",
    ],
    benefits: [
      "Health insurance",
      "Remote work",
      "Stock options",
      "Flexible hours",
    ],
    employer: {
      _id: "emp1",
      name: "TechCorp Inc.",
      email: "hr@techcorp.com",
      role: "employer",
      isVerified: true,
      createdAt: "2024-01-01",
      updatedAt: "2024-01-01",
    },
    applications: [],
    status: "active",
    createdAt: "2024-01-15",
    updatedAt: "2024-01-15",
  },
  {
    _id: "2",
    title: "UX/UI Designer",
    company: "Design Studio",
    location: "New York, NY",
    type: "full-time",
    salary: { min: 80000, max: 120000, currency: "USD" },
    description: "Join our creative team as a UX/UI Designer...",
    requirements: [
      "Figma",
      "Adobe Creative Suite",
      "3+ years experience",
      "Portfolio",
    ],
    benefits: [
      "Creative environment",
      "Professional development",
      "Health benefits",
    ],
    employer: {
      _id: "emp2",
      name: "Design Studio",
      email: "careers@designstudio.com",
      role: "employer",
      isVerified: true,
      createdAt: "2024-01-01",
      updatedAt: "2024-01-01",
    },
    applications: [],
    status: "active",
    createdAt: "2024-01-10",
    updatedAt: "2024-01-10",
  },
  {
    _id: "3",
    title: "DevOps Engineer",
    company: "CloudTech Solutions",
    location: "Remote",
    type: "full-time",
    salary: { min: 100000, max: 150000, currency: "USD" },
    description:
      "We need a DevOps Engineer to help us scale our infrastructure...",
    requirements: ["AWS", "Docker", "Kubernetes", "4+ years experience"],
    benefits: [
      "Remote work",
      "Competitive salary",
      "Learning budget",
      "Flexible hours",
    ],
    employer: {
      _id: "emp3",
      name: "CloudTech Solutions",
      email: "jobs@cloudtech.com",
      role: "employer",
      isVerified: true,
      createdAt: "2024-01-01",
      updatedAt: "2024-01-01",
    },
    applications: [],
    status: "active",
    createdAt: "2024-01-05",
    updatedAt: "2024-01-05",
  },
];

function JobsPageContent() {
  const searchParams = useSearchParams();
  const [filteredJobs, setFilteredJobs] = useState<Job[]>(mockJobs);
  const [searchQuery, setSearchQuery] = useState(
    searchParams.get("search") || ""
  );
  const [selectedLocation, setSelectedLocation] = useState("");
  const [selectedType, setSelectedType] = useState("");
  const [selectedSalary, setSelectedSalary] = useState("");
  const [showFilters, setShowFilters] = useState(false);
  const [savedJobs, setSavedJobs] = useState<string[]>([]);

  const filterJobs = useCallback(() => {
    let filtered = mockJobs;

    if (searchQuery) {
      filtered = filtered.filter(
        (job) =>
          job.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
          job.company.toLowerCase().includes(searchQuery.toLowerCase()) ||
          job.description.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    if (selectedLocation) {
      filtered = filtered.filter((job) =>
        job.location.toLowerCase().includes(selectedLocation.toLowerCase())
      );
    }

    if (selectedType) {
      filtered = filtered.filter((job) => job.type === selectedType);
    }

    if (selectedSalary) {
      const [min] = selectedSalary.split("-").map(Number);
      filtered = filtered.filter((job) => job.salary.min >= min);
    }

    setFilteredJobs(filtered);
  }, [searchQuery, selectedLocation, selectedType, selectedSalary]);

  useEffect(() => {
    filterJobs();
  }, [filterJobs]);

  const toggleSavedJob = (jobId: string) => {
    setSavedJobs((prev) =>
      prev.includes(jobId)
        ? prev.filter((id) => id !== jobId)
        : [...prev, jobId]
    );
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
                  Showing {filteredJobs.length} of {mockJobs.length} jobs
                </p>
                <div className="flex items-center space-x-2">
                  <span className="text-sm text-gray-500">Sort by:</span>
                  <select className="text-sm border border-gray-300 rounded-md px-2 py-1">
                    <option>Most Recent</option>
                    <option>Salary: High to Low</option>
                    <option>Salary: Low to High</option>
                    <option>Company Name</option>
                  </select>
                </div>
              </div>
            </div>

            <div className="space-y-4">
              {filteredJobs.length > 0 ? (
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
                              onClick={() => toggleSavedJob(job._id)}
                              className={`p-2 rounded-full transition-colors ${
                                savedJobs.includes(job._id)
                                  ? "text-blue-600 bg-blue-100"
                                  : "text-gray-400 hover:text-blue-600 hover:bg-blue-50"
                              }`}
                            >
                              {savedJobs.includes(job._id) ? (
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
                <button className="px-6 py-3 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 transition-colors">
                  Load More Jobs
                </button>
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
