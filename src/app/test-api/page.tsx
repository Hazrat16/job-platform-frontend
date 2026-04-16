"use client";

import { apiClient } from "@/utils/api";
import { useState } from "react";

export default function TestApiPage() {
  const [healthStatus, setHealthStatus] = useState<string>("");
  const [isLoading, setIsLoading] = useState(false);

  const testHealthCheck = async () => {
    setIsLoading(true);
    try {
      const response = await apiClient.healthCheck();
      if (response.success) {
        setHealthStatus(`✅ Success: ${response.message}`);
      } else {
        setHealthStatus(`❌ Error: ${response.message}`);
      }
    } catch (error) {
      setHealthStatus(
        `❌ Exception: ${
          error instanceof Error ? error.message : "Unknown error"
        }`
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <div className="flex justify-center">
          <div className="w-12 h-12 bg-blue-600 rounded-lg flex items-center justify-center">
            <svg
              className="w-8 h-8 text-white"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
          </div>
        </div>
        <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
          API Connection Test
        </h2>
        <p className="mt-2 text-center text-sm text-gray-600">
          Test the connection to your backend API
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10">
          <div className="space-y-6">
            <div>
              <button
                onClick={testHealthCheck}
                disabled={isLoading}
                className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isLoading ? (
                  <div className="flex items-center">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Testing...
                  </div>
                ) : (
                  "Test API Connection"
                )}
              </button>
            </div>

            {healthStatus && (
              <div className="mt-4 p-4 rounded-md bg-gray-50">
                <p className="text-sm text-gray-700 whitespace-pre-wrap">
                  {healthStatus}
                </p>
              </div>
            )}

            <div className="text-sm text-gray-600">
              <p className="mb-2">This will test the connection to:</p>
              <p className="font-mono bg-gray-100 p-2 rounded">
                http://localhost:5000/api/test
              </p>
              <p className="mt-2 text-xs">
                Make sure your backend server is running on port 5000
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

