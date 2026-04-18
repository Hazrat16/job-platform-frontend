"use client";

import { AuthResponse, RegisterFormFields } from "@/types";
import { apiClient, setAuthToken, setUser } from "@/utils/api";
import {
  AlertCircle,
  Briefcase,
  Eye,
  EyeOff,
  Lock,
  Mail,
  Upload,
  User,
  X,
} from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useForm } from "react-hook-form";
import toast from "react-hot-toast";

export default function RegisterPage() {
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedPhoto, setSelectedPhoto] = useState<File | null>(null);
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);
  /** Kept outside react-hook-form so role cannot be overwritten by form internals. */
  const [accountRole, setAccountRole] = useState<
    "jobseeker" | "employer" | null
  >(null);
  const router = useRouter();

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<RegisterFormFields>({
    defaultValues: {
      name: "",
      email: "",
      password: "",
      confirmPassword: "",
    },
  });

  const password = watch("password");

  const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        // 5MB limit
        toast.error("Photo size must be less than 5MB");
        return;
      }

      if (!file.type.startsWith("image/")) {
        toast.error("Please select an image file");
        return;
      }

      setSelectedPhoto(file);
      const reader = new FileReader();
      reader.onload = () => {
        setPhotoPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const removePhoto = () => {
    setSelectedPhoto(null);
    setPhotoPreview(null);
  };

  const onSubmit = async (data: RegisterFormFields) => {
    setIsLoading(true);
    try {
      if (accountRole !== "jobseeker" && accountRole !== "employer") {
        toast.error("Please select whether you are a job seeker or an employer.");
        return;
      }

      const formData = new FormData();
      formData.append("name", data.name);
      formData.append("email", data.email);
      formData.append("password", data.password);
      formData.append("role", accountRole);

      if (selectedPhoto) {
        formData.append("photo", selectedPhoto);
      }

      const response = await apiClient.register(formData);

      const auth = response.data as AuthResponse | undefined;
      const hasSession = Boolean(
        response.success && auth?.token && auth?.user,
      );

      if (hasSession && auth) {
        setAuthToken(auth.token);
        setUser(auth.user);
        toast.success("Registration successful! Welcome to JobPlatform.");
        if (auth.user.role === "employer") {
          router.push("/my-jobs");
        } else {
          router.push("/jobs");
        }
      } else if (response.success) {
        toast.success(
          "Account created. Check your email to verify, then sign in.",
        );
        router.push("/login");
      } else {
        toast.error(response.message || "Registration failed");
      }
    } catch (error: unknown) {
      const errorMessage =
        error instanceof Error
          ? error.message
          : "An error occurred during registration";
      toast.error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="relative flex min-h-screen flex-col justify-center overflow-hidden py-12 sm:px-6 lg:px-8">
      <div
        className="pointer-events-none absolute -left-24 top-1/4 h-72 w-72 rounded-full bg-violet-400/20 blur-3xl"
        aria-hidden
      />
      <div
        className="pointer-events-none absolute -right-20 bottom-1/4 h-80 w-80 rounded-full bg-blue-400/20 blur-3xl"
        aria-hidden
      />
      <div className="relative sm:mx-auto sm:w-full sm:max-w-md">
        <div className="flex justify-center">
          <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-indigo-600 via-blue-600 to-cyan-500 text-white shadow-xl shadow-indigo-500/30 ring-2 ring-white/50">
            <svg
              className="h-8 w-8 text-white"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2-2v2m8 0V6a2 2 0 012 2v6a2 2 0 01-2 2H8a2 2 0 01-2-2V8a2 2 0 012-2z"
              />
            </svg>
          </div>
        </div>
        <h2 className="mt-6 text-center text-3xl font-extrabold tracking-tight text-slate-900">
          Create your account
        </h2>
        <p className="mt-2 text-center text-sm text-slate-600">
          Or{" "}
          <Link
            href="/login"
            className="font-semibold text-indigo-600 underline-offset-4 hover:text-indigo-700 hover:underline"
          >
            sign in to your existing account
          </Link>
        </p>
      </div>

      <div className="relative mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="rounded-3xl border border-white/70 bg-white/80 px-4 py-8 shadow-2xl shadow-indigo-950/10 ring-1 ring-slate-900/5 backdrop-blur-xl sm:px-10">
          <form className="space-y-6" onSubmit={handleSubmit(onSubmit)}>
            {/* Full Name */}
            <div>
              <label
                htmlFor="name"
                className="block text-sm font-medium text-gray-700"
              >
                Full Name
              </label>
              <div className="mt-1 relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <User className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  {...register("name", {
                    required: "Full name is required",
                    minLength: {
                      value: 2,
                      message: "Name must be at least 2 characters",
                    },
                  })}
                  id="name"
                  type="text"
                  autoComplete="name"
                  className={`appearance-none block w-full pl-10 pr-3 py-2 border rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm ${
                    errors.name ? "border-red-300" : "border-gray-300"
                  }`}
                  placeholder="Enter your full name"
                />
              </div>
              {errors.name && (
                <div className="mt-2 flex items-center text-sm text-red-600">
                  <AlertCircle className="h-4 w-4 mr-1" />
                  {errors.name.message}
                </div>
              )}
            </div>

            {/* Email */}
            <div>
              <label
                htmlFor="email"
                className="block text-sm font-medium text-gray-700"
              >
                Email address
              </label>
              <div className="mt-1 relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Mail className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  {...register("email", {
                    required: "Email is required",
                    pattern: {
                      value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                      message: "Invalid email address",
                    },
                  })}
                  id="email"
                  type="email"
                  autoComplete="email"
                  className={`appearance-none block w-full pl-10 pr-3 py-2 border rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm ${
                    errors.email ? "border-red-300" : "border-gray-300"
                  }`}
                  placeholder="Enter your email"
                />
              </div>
              {errors.email && (
                <div className="mt-2 flex items-center text-sm text-red-600">
                  <AlertCircle className="h-4 w-4 mr-1" />
                  {errors.email.message}
                </div>
              )}
            </div>

            {/* Account type: React state only (not RHF) — value sent is exactly what you pick */}
            <div>
              <span
                id="account-type-label"
                className="block text-sm font-medium text-gray-700"
              >
                Account type
              </span>
              <p className="text-xs text-gray-500 mt-0.5 mb-2">
                Choose one — this controls whether you apply to jobs or post them.
              </p>
              <div
                className="grid grid-cols-1 sm:grid-cols-2 gap-3"
                role="group"
                aria-labelledby="account-type-label"
              >
                <button
                  type="button"
                  onClick={() => setAccountRole("jobseeker")}
                  className={`relative flex rounded-lg border p-4 text-left shadow-sm transition ring-offset-2 focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                    accountRole === "jobseeker"
                      ? "border-blue-600 ring-2 ring-blue-500 bg-blue-50"
                      : "border-gray-300 bg-white hover:border-gray-400"
                  }`}
                >
                  <div className="flex flex-1">
                    <div className="flex flex-col">
                      <div className="flex items-center">
                        <Briefcase className="h-5 w-5 text-blue-600" />
                        <span className="ml-3 block text-sm font-medium text-gray-900">
                          Job seeker
                        </span>
                      </div>
                      <p className="mt-1 text-xs text-gray-500">
                        I want to find and apply for jobs
                      </p>
                    </div>
                  </div>
                  {accountRole === "jobseeker" ? (
                    <span className="text-blue-600 text-sm font-semibold" aria-hidden>
                      ✓
                    </span>
                  ) : null}
                </button>

                <button
                  type="button"
                  onClick={() => setAccountRole("employer")}
                  className={`relative flex rounded-lg border p-4 text-left shadow-sm transition ring-offset-2 focus:outline-none focus:ring-2 focus:ring-green-500 ${
                    accountRole === "employer"
                      ? "border-green-600 ring-2 ring-green-500 bg-green-50"
                      : "border-gray-300 bg-white hover:border-gray-400"
                  }`}
                >
                  <div className="flex flex-1">
                    <div className="flex flex-col">
                      <div className="flex items-center">
                        <svg
                          className="h-5 w-5 text-green-600"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                          aria-hidden="true"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"
                          />
                        </svg>
                        <span className="ml-3 block text-sm font-medium text-gray-900">
                          Employer (hiring)
                        </span>
                      </div>
                      <p className="mt-1 text-xs text-gray-500">
                        I want to post jobs and review applicants
                      </p>
                    </div>
                  </div>
                  {accountRole === "employer" ? (
                    <span className="text-green-600 text-sm font-semibold" aria-hidden>
                      ✓
                    </span>
                  ) : null}
                </button>
              </div>
              <div className="mt-3">
                <label
                  htmlFor="role-select"
                  className="block text-xs font-medium text-gray-600 mb-1"
                >
                  Or choose from list
                </label>
                <select
                  id="role-select"
                  name="account-type-select"
                  autoComplete="off"
                  value={accountRole ?? ""}
                  onChange={(e) => {
                    const v = e.target.value;
                    if (v === "jobseeker" || v === "employer") {
                      setAccountRole(v);
                    } else {
                      setAccountRole(null);
                    }
                  }}
                  className="block w-full max-w-md text-sm border border-gray-300 rounded-md px-3 py-2 bg-white"
                >
                  <option value="">Select account type…</option>
                  <option value="jobseeker">Job seeker</option>
                  <option value="employer">Employer (hiring)</option>
                </select>
              </div>
            </div>

            {/* Password */}
            <div>
              <label
                htmlFor="password"
                className="block text-sm font-medium text-gray-700"
              >
                Password
              </label>
              <div className="mt-1 relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Lock className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  {...register("password", {
                    required: "Password is required",
                    minLength: {
                      value: 5,
                      message: "Password must be at least 5 characters",
                    },
                  })}
                  id="password"
                  type={showPassword ? "text" : "password"}
                  autoComplete="new-password"
                  className={`appearance-none block w-full pl-10 pr-10 py-2 border rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm ${
                    errors.password ? "border-red-300" : "border-gray-300"
                  }`}
                  placeholder="Create a password"
                />
                <button
                  type="button"
                  className="absolute inset-y-0 right-0 pr-3 flex items-center"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? (
                    <EyeOff className="h-5 w-5 text-gray-400 hover:text-gray-500" />
                  ) : (
                    <Eye className="h-5 w-5 text-gray-400 hover:text-gray-500" />
                  )}
                </button>
              </div>
              {errors.password && (
                <div className="mt-2 flex items-center text-sm text-red-600">
                  <AlertCircle className="h-4 w-4 mr-1" />
                  {errors.password.message}
                </div>
              )}
            </div>

            {/* Confirm Password */}
            <div>
              <label
                htmlFor="confirmPassword"
                className="block text-sm font-medium text-gray-700"
              >
                Confirm Password
              </label>
              <div className="mt-1 relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Lock className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  {...register("confirmPassword", {
                    required: "Please confirm your password",
                    validate: (value) =>
                      value === password || "Passwords do not match",
                  })}
                  id="confirmPassword"
                  type={showConfirmPassword ? "text" : "password"}
                  autoComplete="new-password"
                  className={`appearance-none block w-full pl-10 pr-10 py-2 border rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm ${
                    errors.confirmPassword
                      ? "border-red-300"
                      : "border-gray-300"
                  }`}
                  placeholder="Confirm your password"
                />
                <button
                  type="button"
                  className="absolute inset-y-0 right-0 pr-3 flex items-center"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                >
                  {showConfirmPassword ? (
                    <EyeOff className="h-5 w-5 text-gray-400 hover:text-gray-500" />
                  ) : (
                    <Eye className="h-5 w-5 text-gray-400 hover:text-gray-500" />
                  )}
                </button>
              </div>
              {errors.confirmPassword && (
                <div className="mt-2 flex items-center text-sm text-red-600">
                  <AlertCircle className="h-4 w-4 mr-1" />
                  {errors.confirmPassword.message}
                </div>
              )}
            </div>

            {/* Profile Photo */}
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Profile Photo (Optional)
              </label>
              <div className="mt-1">
                {photoPreview ? (
                  <div className="relative inline-block">
                    <Image
                      src={photoPreview}
                      alt="Profile preview"
                      width={80}
                      height={80}
                      className="h-20 w-20 rounded-full object-cover border-2 border-gray-300"
                    />
                    <button
                      type="button"
                      onClick={removePhoto}
                      className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  </div>
                ) : (
                  <div className="flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed rounded-md">
                    <div className="space-y-1 text-center">
                      <Upload className="mx-auto h-12 w-12 text-gray-400" />
                      <div className="flex text-sm text-gray-600">
                        <label
                          htmlFor="photo-upload"
                          className="relative cursor-pointer bg-white rounded-md font-medium text-blue-600 hover:text-blue-500 focus-within:outline-none focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-blue-500"
                        >
                          <span>Upload a file</span>
                          <input
                            id="photo-upload"
                            name="photo-upload"
                            type="file"
                            accept="image/*"
                            className="sr-only"
                            onChange={handlePhotoChange}
                          />
                        </label>
                        <p className="pl-1">or drag and drop</p>
                      </div>
                      <p className="text-xs text-gray-500">
                        PNG, JPG, GIF up to 5MB
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </div>

            <div>
              <button
                type="submit"
                disabled={isLoading}
                className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isLoading ? (
                  <div className="flex items-center">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Creating account...
                  </div>
                ) : (
                  "Create account"
                )}
              </button>
            </div>
          </form>

          <div className="mt-6">
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-300" />
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-2 bg-white text-gray-500">
                  Already have an account?
                </span>
              </div>
            </div>

            <div className="mt-6">
              <Link
                href="/login"
                className="w-full flex justify-center py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                Sign in
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
