"use client";

import { apiClient } from "@/utils/api";
import {
  AlertCircle,
  Briefcase,
  Calendar,
  DollarSign,
  FileText,
  MapPin,
  Plus,
  X,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useFieldArray, useForm } from "react-hook-form";
import toast from "react-hot-toast";

interface JobFormData {
  title: string;
  company: string;
  location: string;
  type: "full-time" | "part-time" | "contract" | "internship";
  salary: {
    min: number;
    max: number;
    currency: string;
  };
  description: string;
  requirements: { value: string }[];
  benefits: { value: string }[];
}

export default function PostJobPage() {
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const {
    register,
    control,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<JobFormData>({
    defaultValues: {
      title: "",
      company: "",
      location: "",
      type: "full-time",
      salary: {
        min: 0,
        max: 0,
        currency: "USD",
      },
      description: "",
      requirements: [{ value: "" }],
      benefits: [{ value: "" }],
    },
  });

  const {
    fields: requirementFields,
    append: appendRequirement,
    remove: removeRequirement,
  } = useFieldArray({
    control,
    name: "requirements",
  });

  const {
    fields: benefitFields,
    append: appendBenefit,
    remove: removeBenefit,
  } = useFieldArray({
    control,
    name: "benefits",
  });

  const onSubmit = async (data: JobFormData) => {
    setIsLoading(true);
    try {
      // Transform the data for API submission
      const transformedData = {
        ...data,
        requirements: data.requirements.map((req) => req.value).filter(Boolean),
        benefits: data.benefits.map((ben) => ben.value).filter(Boolean),
      };

      // Call the actual API
      const response = await apiClient.createJob(transformedData);

      if (response.success && response.data) {
        toast.success("Job posted successfully!");
        reset();
        router.push("/my-jobs");
      } else {
        toast.error(response.message || "Failed to post job");
      }
    } catch (error) {
      const errorMessage =
        error instanceof Error
          ? error.message
          : "Failed to post job. Please try again.";
      toast.error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Post a New Job
          </h1>
          <p className="text-gray-600">
            Fill out the form below to post your job opportunity. Be as detailed
            as possible to attract the right candidates.
          </p>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
          {/* Basic Information */}
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-6 flex items-center">
              <Briefcase className="h-5 w-5 mr-2 text-blue-600" />
              Basic Information
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Job Title */}
              <div className="md:col-span-2">
                <label
                  htmlFor="title"
                  className="block text-sm font-medium text-gray-700 mb-2"
                >
                  Job Title *
                </label>
                <input
                  {...register("title", { required: "Job title is required" })}
                  type="text"
                  id="title"
                  placeholder="e.g., Senior Frontend Developer"
                  className={`w-full px-3 py-2 border rounded-md focus:ring-blue-500 focus:border-blue-500 ${
                    errors.title ? "border-red-300" : "border-gray-300"
                  }`}
                />
                {errors.title && (
                  <div className="mt-1 flex items-center text-sm text-red-600">
                    <AlertCircle className="h-4 w-4 mr-1" />
                    {errors.title.message}
                  </div>
                )}
              </div>

              {/* Company */}
              <div>
                <label
                  htmlFor="company"
                  className="block text-sm font-medium text-gray-700 mb-2"
                >
                  Company Name *
                </label>
                <input
                  {...register("company", {
                    required: "Company name is required",
                  })}
                  type="text"
                  id="company"
                  placeholder="Your company name"
                  className={`w-full px-3 py-2 border rounded-md focus:ring-blue-500 focus:border-blue-500 ${
                    errors.company ? "border-red-300" : "border-gray-300"
                  }`}
                />
                {errors.company && (
                  <div className="mt-1 flex items-center text-sm text-red-600">
                    <AlertCircle className="h-4 w-4 mr-1" />
                    {errors.company.message}
                  </div>
                )}
              </div>

              {/* Location */}
              <div>
                <label
                  htmlFor="location"
                  className="block text-sm font-medium text-gray-700 mb-2"
                >
                  Location *
                </label>
                <div className="relative">
                  <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <input
                    {...register("location", {
                      required: "Location is required",
                    })}
                    type="text"
                    id="location"
                    placeholder="e.g., San Francisco, CA or Remote"
                    className={`w-full pl-10 pr-3 py-2 border rounded-md focus:ring-blue-500 focus:border-blue-500 ${
                      errors.location ? "border-red-300" : "border-gray-300"
                    }`}
                  />
                </div>
                {errors.location && (
                  <div className="mt-1 flex items-center text-sm text-red-600">
                    <AlertCircle className="h-4 w-4 mr-1" />
                    {errors.location.message}
                  </div>
                )}
              </div>

              {/* Job Type */}
              <div>
                <label
                  htmlFor="type"
                  className="block text-sm font-medium text-gray-700 mb-2"
                >
                  Job Type *
                </label>
                <select
                  {...register("type", { required: "Job type is required" })}
                  id="type"
                  className={`w-full px-3 py-2 border rounded-md focus:ring-blue-500 focus:border-blue-500 ${
                    errors.type ? "border-red-300" : "border-gray-300"
                  }`}
                >
                  <option value="full-time">Full Time</option>
                  <option value="part-time">Part Time</option>
                  <option value="contract">Contract</option>
                  <option value="internship">Internship</option>
                </select>
                {errors.type && (
                  <div className="mt-1 flex items-center text-sm text-red-600">
                    <AlertCircle className="h-4 w-4 mr-1" />
                    {errors.type.message}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Salary Information */}
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-6 flex items-center">
              <DollarSign className="h-5 w-5 mr-2 text-green-600" />
              Salary Information
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div>
                <label
                  htmlFor="salaryMin"
                  className="block text-sm font-medium text-gray-700 mb-2"
                >
                  Minimum Salary *
                </label>
                <input
                  {...register("salary.min", {
                    required: "Minimum salary is required",
                    min: { value: 0, message: "Salary must be positive" },
                  })}
                  type="number"
                  id="salaryMin"
                  placeholder="50000"
                  className={`w-full px-3 py-2 border rounded-md focus:ring-blue-500 focus:border-blue-500 ${
                    errors.salary?.min ? "border-red-300" : "border-gray-300"
                  }`}
                />
                {errors.salary?.min && (
                  <div className="mt-1 flex items-center text-sm text-red-600">
                    <AlertCircle className="h-4 w-4 mr-1" />
                    {errors.salary.min.message}
                  </div>
                )}
              </div>

              <div>
                <label
                  htmlFor="salaryMax"
                  className="block text-sm font-medium text-gray-700 mb-2"
                >
                  Maximum Salary *
                </label>
                <input
                  {...register("salary.max", {
                    required: "Maximum salary is required",
                    min: { value: 0, message: "Salary must be positive" },
                  })}
                  type="number"
                  id="salaryMax"
                  placeholder="80000"
                  className={`w-full px-3 py-2 border rounded-md focus:ring-blue-500 focus:border-blue-500 ${
                    errors.salary?.max ? "border-red-300" : "border-gray-300"
                  }`}
                />
                {errors.salary?.max && (
                  <div className="mt-1 flex items-center text-sm text-red-600">
                    <AlertCircle className="h-4 w-4 mr-1" />
                    {errors.salary.max.message}
                  </div>
                )}
              </div>

              <div>
                <label
                  htmlFor="currency"
                  className="block text-sm font-medium text-gray-700 mb-2"
                >
                  Currency *
                </label>
                <select
                  {...register("salary.currency", {
                    required: "Currency is required",
                  })}
                  id="currency"
                  className={`w-full px-3 py-2 border rounded-md focus:ring-blue-500 focus:border-blue-500 ${
                    errors.salary?.currency
                      ? "border-red-300"
                      : "border-gray-300"
                  }`}
                >
                  <option value="USD">USD ($)</option>
                  <option value="EUR">EUR (€)</option>
                  <option value="GBP">GBP (£)</option>
                  <option value="CAD">CAD (C$)</option>
                  <option value="AUD">AUD (A$)</option>
                </select>
                {errors.salary?.currency && (
                  <div className="mt-1 flex items-center text-sm text-red-600">
                    <AlertCircle className="h-4 w-4 mr-1" />
                    {errors.salary.currency.message}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Job Description */}
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-6 flex items-center">
              <FileText className="h-5 w-5 mr-2 text-purple-600" />
              Job Description
            </h2>

            <div>
              <label
                htmlFor="description"
                className="block text-sm font-medium text-gray-700 mb-2"
              >
                Detailed Description *
              </label>
              <textarea
                {...register("description", {
                  required: "Job description is required",
                  minLength: {
                    value: 100,
                    message: "Description must be at least 100 characters",
                  },
                })}
                id="description"
                rows={6}
                placeholder="Provide a detailed description of the role, responsibilities, and what makes this position exciting..."
                className={`w-full px-3 py-2 border rounded-md focus:ring-blue-500 focus:border-blue-500 ${
                  errors.description ? "border-red-300" : "border-gray-300"
                }`}
              />
              {errors.description && (
                <div className="mt-1 flex items-center text-sm text-red-600">
                  <AlertCircle className="h-4 w-4 mr-1" />
                  {errors.description.message}
                </div>
              )}
              <p className="mt-1 text-sm text-gray-500">
                Minimum 100 characters. Be specific about responsibilities and
                expectations.
              </p>
            </div>
          </div>

          {/* Requirements */}
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-6 flex items-center">
              <AlertCircle className="h-5 w-5 mr-2 text-orange-600" />
              Requirements & Skills
            </h2>

            <div className="space-y-4">
              {requirementFields.map((field, index) => (
                <div key={field.id} className="flex items-center space-x-3">
                  <input
                    {...register(`requirements.${index}.value` as const, {
                      required: "Requirement is required",
                    })}
                    type="text"
                    placeholder="e.g., 3+ years of React experience"
                    className={`flex-1 px-3 py-2 border rounded-md focus:ring-blue-500 focus:border-blue-500 ${
                      errors.requirements?.[index]?.value
                        ? "border-red-300"
                        : "border-gray-300"
                    }`}
                  />
                  {requirementFields.length > 1 && (
                    <button
                      type="button"
                      onClick={() => removeRequirement(index)}
                      className="p-2 text-red-600 hover:text-red-800 hover:bg-red-50 rounded-md"
                    >
                      <X className="h-5 w-5" />
                    </button>
                  )}
                </div>
              ))}

              <button
                type="button"
                onClick={() => appendRequirement({ value: "" })}
                className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                <Plus className="h-4 w-4 mr-2" />
                Add Requirement
              </button>
            </div>
          </div>

          {/* Benefits */}
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-6 flex items-center">
              <Calendar className="h-5 w-5 mr-2 text-green-600" />
              Benefits & Perks
            </h2>

            <div className="space-y-4">
              {benefitFields.map((field, index) => (
                <div key={field.id} className="flex items-center space-x-3">
                  <input
                    {...register(`benefits.${index}.value` as const, {
                      required: "Benefit is required",
                    })}
                    type="text"
                    placeholder="e.g., Health insurance, Remote work, Stock options"
                    className={`flex-1 px-3 py-2 border rounded-md focus:ring-blue-500 focus:border-blue-500 ${
                      errors.benefits?.[index]?.value
                        ? "border-red-300"
                        : "border-gray-300"
                    }`}
                  />
                  {benefitFields.length > 1 && (
                    <button
                      type="button"
                      onClick={() => removeBenefit(index)}
                      className="p-2 text-red-600 hover:text-red-800 hover:bg-red-50 rounded-md"
                    >
                      <X className="h-5 w-5" />
                    </button>
                  )}
                </div>
              ))}

              <button
                type="button"
                onClick={() => appendBenefit({ value: "" })}
                className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                <Plus className="h-4 w-4 mr-2" />
                Add Benefit
              </button>
            </div>
          </div>

          {/* Submit Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-end">
            <button
              type="button"
              onClick={() => router.back()}
              className="px-6 py-3 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isLoading}
              className="px-6 py-3 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {isLoading ? (
                <div className="flex items-center">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Posting Job...
                </div>
              ) : (
                "Post Job"
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
