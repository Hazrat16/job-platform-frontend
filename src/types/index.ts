export interface ExperienceItem {
  _id?: string;
  title: string;
  company: string;
  location?: string;
  startDate?: string;
  endDate?: string;
  current?: boolean;
  description?: string;
}

export interface EducationItem {
  _id?: string;
  school: string;
  degree: string;
  field?: string;
  startYear?: string;
  endYear?: string;
  current?: boolean;
  description?: string;
}

export interface ProfileCompleteness {
  percent: number;
  sections: {
    basics: boolean;
    summary: boolean;
    skills: boolean;
    experience: boolean;
    education: boolean;
    resume: boolean;
    links: boolean;
  };
  missingTips: string[];
}

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
  experience?: ExperienceItem[];
  education?: EducationItem[];
}

export interface User {
  _id: string;
  name: string;
  email: string;
  role: "jobseeker" | "employer" | "admin";
  isVerified: boolean;
  photo?: string;
  profile?: UserProfile;
  /** Present when role is jobseeker; computed on the server from profile fields. */
  profileCompleteness?: ProfileCompleteness | null;
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
  /** Set on employer “my jobs” list from the server. */
  applicationCount?: number;
  status: "active" | "closed" | "draft";
  createdAt: string;
  updatedAt: string;
}

export interface JobApplication {
  _id: string;
  job: Pick<Job, "_id" | "title" | "company" | "status"> & { employer?: string };
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

export type NotificationType = "application_received" | "application_status";

export interface Notification {
  _id: string;
  userId: string;
  type: NotificationType;
  title: string;
  body: string;
  read: boolean;
  href?: string;
  metadata?: Record<string, unknown>;
  createdAt: string;
  updatedAt: string;
}

export interface ApiResponse<T = unknown> {
  success: boolean;
  message: string;
  data?: T;
  error?: string;
  meta?: {
    unreadCount?: number;
    [key: string]: unknown;
  };
}

export type PaymentStatus = "pending" | "completed" | "failed" | "cancelled";

export interface Payment {
  _id: string;
  user: string;
  tranId: string;
  amount: number;
  currency: string;
  status: PaymentStatus;
  purpose?: string;
  valId?: string;
  sessionKey?: string;
  bankTranId?: string;
  createdAt: string;
  updatedAt: string;
}

export interface SslCommerzInitData {
  gatewayUrl: string;
  tranId: string;
}

export interface ResumeFitBilingualText {
  en: string;
  bn: string;
}

export interface ResumeFitBilingualLists {
  en: string[];
  bn: string[];
}

export interface ResumeFitAnalysis {
  matchPercent: number;
  atsScore: {
    overall: number;
    keywordAlignment: number;
    structureClarity: number;
    roleFitSummary: ResumeFitBilingualText;
  };
  missingSkills: ResumeFitBilingualLists;
  suggestions: ResumeFitBilingualLists;
  summary: ResumeFitBilingualText;
  rejectionLikelyReasons: ResumeFitBilingualLists;
}

export interface ResumeFitRewrite {
  improvedCv: ResumeFitBilingualText;
  changeHighlights: ResumeFitBilingualLists;
}
