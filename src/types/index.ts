export interface UserProfile {
  headline?: string;
  bio?: string;
  phone?: string;
  location?: string;
  skills?: string[];
  linkedIn?: string;
  github?: string;
  portfolio?: string;
  resumeUrl?: string;
}

export interface User {
  _id: string;
  name: string;
  email: string;
  role: "jobseeker" | "employer" | "admin";
  isVerified: boolean;
  photo?: string;
  profile?: UserProfile;
  createdAt?: string;
  updatedAt?: string;
}

export interface Job {
  _id: string;
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
  requirements: string[];
  benefits: string[];
  employer: User;
  applications: JobApplication[];
  status: "active" | "closed" | "draft";
  createdAt: string;
  updatedAt: string;
}

export interface JobApplication {
  _id: string;
  job: Job;
  applicant: User;
  resume: string;
  coverLetter?: string;
  status: "pending" | "reviewed" | "shortlisted" | "rejected" | "accepted";
  createdAt: string;
  updatedAt: string;
}

export interface AuthResponse {
  user: User;
  token: string;
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterCredentials {
  name: string;
  email: string;
  password: string;
  confirmPassword: string;
  /** Set via account-type UI before submit */
  role?: "jobseeker" | "employer";
  photo?: File;
}

/** Register form fields handled by react-hook-form (role is separate state). */
export type RegisterFormFields = Pick<
  RegisterCredentials,
  "name" | "email" | "password" | "confirmPassword"
>;

export interface ForgotPasswordData {
  email: string;
}

export interface ResetPasswordData {
  token: string;
  password: string;
  confirmPassword: string;
}

export interface ApiResponse<T = unknown> {
  success: boolean;
  message: string;
  data?: T;
  error?: string;
}
