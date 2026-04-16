"use client";

import { apiClient } from "@/utils/api";
import { AlertCircle, CheckCircle2, Loader2 } from "lucide-react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";

type Status = "idle" | "loading" | "success" | "error";

export default function VerifyEmailPage() {
  const searchParams = useSearchParams();
  const token = searchParams.get("token") || searchParams.get("emailToken");
  const [status, setStatus] = useState<Status>("idle");
  const [message, setMessage] = useState<string>("");

  useEffect(() => {
    const verify = async () => {
      if (!token) {
        setStatus("error");
        setMessage(
          "Verification token is missing. Please use the full link from your email."
        );
        return;
      }

      setStatus("loading");
      const res = await apiClient.verifyEmail(token);

      if (res.success) {
        setStatus("success");
        setMessage(
          res.message || "Your email has been verified successfully."
        );
      } else {
        setStatus("error");
        setMessage(
          res.message ||
            "Email verification failed. The link may be invalid or expired."
        );
      }
    };

    verify();
  }, [token]);

  const isLoading = status === "loading" || status === "idle";

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <div className="flex justify-center">
          <div
            className={`w-12 h-12 rounded-lg flex items-center justify-center ${
              status === "success"
                ? "bg-green-600"
                : status === "error"
                ? "bg-red-600"
                : "bg-blue-600"
            }`}
          >
            {status === "success" ? (
              <CheckCircle2 className="w-8 h-8 text-white" />
            ) : status === "error" ? (
              <AlertCircle className="w-8 h-8 text-white" />
            ) : (
              <Loader2 className="w-8 h-8 text-white animate-spin" />
            )}
          </div>
        </div>
        <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
          {status === "success"
            ? "Email Verified"
            : status === "error"
            ? "Verification Problem"
            : "Verifying your email"}
        </h2>
        <p className="mt-2 text-center text-sm text-gray-600">
          {isLoading
            ? "Please wait while we verify your email address..."
            : message}
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10">
          {status === "success" && (
            <div className="space-y-4 text-center">
              <p className="text-gray-700">
                Your account is now active. You can sign in to the platform
                using your email and password.
              </p>
              <Link
                href="/login"
                className="w-full inline-flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                Go to Login
              </Link>
            </div>
          )}

          {status === "error" && (
            <div className="space-y-4 text-center">
              <p className="text-gray-700">
                If the link has expired, you can request a new verification or
                try logging in again to trigger a new email, depending on how
                the backend is configured.
              </p>
              <div className="flex flex-col gap-3">
                <Link
                  href="/login"
                  className="w-full inline-flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                >
                  Back to Login
                </Link>
                <Link
                  href="/register"
                  className="w-full inline-flex justify-center py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                >
                  Create a new account
                </Link>
              </div>
            </div>
          )}

          {isLoading && (
            <div className="text-center text-sm text-gray-500">
              This will only take a moment.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

