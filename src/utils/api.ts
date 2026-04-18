import {
  ApiResponse,
  AuthResponse,
  ForgotPasswordData,
  Job,
  JobApplication,
  Notification,
  LoginCredentials,
  Payment,
  ResetPasswordData,
  SslCommerzInitData,
  User,
} from "@/types";
import axios, { AxiosInstance, InternalAxiosRequestConfig } from "axios";

function resolveApiBaseUrl(): string {
  if (process.env.NEXT_PUBLIC_API_URL) {
    return process.env.NEXT_PUBLIC_API_URL;
  }
  if (typeof window !== "undefined") {
    return `${window.location.origin}/api`;
  }
  return "http://127.0.0.1:5000/api";
}

function readStoredToken(): string | null {
  if (typeof window === "undefined") return null;
  const t = localStorage.getItem("token");
  if (!t || t === "undefined" || t === "null") return null;
  return t;
}

class ApiClient {
  private client: AxiosInstance;

  constructor() {
    this.client = axios.create({
      headers: {
        "Content-Type": "application/json",
      },
    });

    // Add auth token to requests
    this.client.interceptors.request.use((config: InternalAxiosRequestConfig) => {
      config.baseURL = resolveApiBaseUrl();
      const token = readStoredToken();
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
      return config;
    });

    // Handle token expiration
    this.client.interceptors.response.use(
      (response) => response,
      (error) => {
        if (axios.isAxiosError(error) && error.response?.status === 401) {
          localStorage.removeItem("token");
          localStorage.removeItem("user");
          window.location.href = "/login";
        }
        return Promise.reject(error);
      },
    );
  }

  private normalizeResponse<T>(payload: unknown): ApiResponse<T> {
    const data = payload as
      | ApiResponse<T>
      | { error?: string; message?: string; token?: string; user?: unknown };

    if (typeof data === "object" && data !== null && "success" in data) {
      return data as ApiResponse<T>;
    }

    if (
      typeof data === "object" &&
      data !== null &&
      "token" in data &&
      "user" in data
    ) {
      return {
        success: true,
        message: "Request successful",
        data: data as T,
      };
    }

    if (typeof data === "object" && data !== null && "error" in data) {
      return {
        success: false,
        message: (data.error as string) || "Request failed",
      };
    }

    return {
      success: true,
      message: "Request successful",
      data: data as T,
    };
  }

  private extractErrorMessage(error: unknown): string {
    if (axios.isAxiosError(error)) {
      const payload = error.response?.data as
        | { error?: string; message?: string }
        | undefined;
      return (
        payload?.message || payload?.error || error.message || "Request failed"
      );
    }
    if (error instanceof Error) return error.message;
    return "Request failed";
  }

  // Auth endpoints
  async register(data: FormData): Promise<ApiResponse<AuthResponse>> {
    try {
      const response = await this.client.post("/auth/register", data, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      return this.normalizeResponse<AuthResponse>(response.data);
    } catch (error) {
      return { success: false, message: this.extractErrorMessage(error) };
    }
  }

  async login(
    credentials: LoginCredentials,
  ): Promise<ApiResponse<AuthResponse>> {
    try {
      const response = await this.client.post("/auth/login", credentials);
      return this.normalizeResponse<AuthResponse>(response.data);
    } catch (error) {
      return { success: false, message: this.extractErrorMessage(error) };
    }
  }

  async forgotPassword(data: ForgotPasswordData): Promise<ApiResponse> {
    try {
      const response = await this.client.post("/auth/forgot-password", data);
      return this.normalizeResponse(response.data);
    } catch (error) {
      return { success: false, message: this.extractErrorMessage(error) };
    }
  }

  async resetPassword(data: ResetPasswordData): Promise<ApiResponse> {
    try {
      const response = await this.client.post("/auth/reset-password", data);
      return this.normalizeResponse(response.data);
    } catch (error) {
      return { success: false, message: this.extractErrorMessage(error) };
    }
  }

  async verifyEmail(token: string): Promise<ApiResponse> {
    try {
      const response = await this.client.get(
        `/auth/verify-email?token=${token}`,
      );
      return this.normalizeResponse(response.data);
    } catch (error) {
      return { success: false, message: this.extractErrorMessage(error) };
    }
  }

  async uploadProfilePhoto(
    photo: File,
  ): Promise<ApiResponse<{ photo: string; user: User }>> {
    const formData = new FormData();
    formData.append("photo", photo);

    try {
      const response = await this.client.post("/auth/upload-photo", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      return this.normalizeResponse<{ photo: string; user: User }>(response.data);
    } catch (error) {
      return { success: false, message: this.extractErrorMessage(error) };
    }
  }

  async getProfile(): Promise<ApiResponse<User>> {
    try {
      const response = await this.client.get("/profile");
      return this.normalizeResponse<User>(response.data);
    } catch (error) {
      return { success: false, message: this.extractErrorMessage(error) };
    }
  }

  async updateProfile(payload: {
    name?: string;
    profile?: Record<string, unknown>;
  }): Promise<ApiResponse<User>> {
    try {
      const response = await this.client.patch("/profile", payload);
      return this.normalizeResponse<User>(response.data);
    } catch (error) {
      return { success: false, message: this.extractErrorMessage(error) };
    }
  }

  async uploadProfileResume(
    file: File,
  ): Promise<ApiResponse<{ resumeUrl: string; user: User }>> {
    const formData = new FormData();
    formData.append("resume", file);
    try {
      const response = await this.client.post("/profile/resume", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      return this.normalizeResponse<{ resumeUrl: string; user: User }>(
        response.data,
      );
    } catch (error) {
      return { success: false, message: this.extractErrorMessage(error) };
    }
  }

  // User endpoints (same as getProfile; kept for backward compatibility)
  async getCurrentUser(): Promise<ApiResponse<User>> {
    return this.getProfile();
  }

  // Job endpoints (to be implemented when backend adds them)
  async getJobs(params?: Record<string, unknown>): Promise<ApiResponse<Job[]>> {
    try {
      const response = await this.client.get("/jobs", { params });
      return this.normalizeResponse<Job[]>(response.data);
    } catch (error) {
      return { success: false, message: this.extractErrorMessage(error) };
    }
  }

  async getMyJobs(): Promise<ApiResponse<Job[]>> {
    try {
      const response = await this.client.get("/jobs/mine");
      return this.normalizeResponse<Job[]>(response.data);
    } catch (error) {
      return { success: false, message: this.extractErrorMessage(error) };
    }
  }

  async getJob(id: string): Promise<ApiResponse<Job>> {
    try {
      const response = await this.client.get(`/jobs/${id}`);
      return this.normalizeResponse<Job>(response.data);
    } catch (error) {
      return { success: false, message: this.extractErrorMessage(error) };
    }
  }

  async createJob(jobData: Partial<Job>): Promise<ApiResponse<Job>> {
    try {
      const response = await this.client.post("/jobs", jobData);
      return this.normalizeResponse<Job>(response.data);
    } catch (error) {
      return { success: false, message: this.extractErrorMessage(error) };
    }
  }

  async updateJob(
    id: string,
    jobData: Partial<Job>,
  ): Promise<ApiResponse<Job>> {
    try {
      const response = await this.client.put(`/jobs/${id}`, jobData);
      return this.normalizeResponse<Job>(response.data);
    } catch (error) {
      return { success: false, message: this.extractErrorMessage(error) };
    }
  }

  async deleteJob(id: string): Promise<ApiResponse> {
    try {
      const response = await this.client.delete(`/jobs/${id}`);
      return this.normalizeResponse(response.data);
    } catch (error) {
      return { success: false, message: this.extractErrorMessage(error) };
    }
  }

  // Job Application endpoints
  async applyForJob(
    jobId: string,
    applicationData: FormData,
  ): Promise<ApiResponse<JobApplication>> {
    try {
      const response = await this.client.post(
        `/jobs/${jobId}/apply`,
        applicationData,
        {
          headers: { "Content-Type": "multipart/form-data" },
        },
      );
      return this.normalizeResponse<JobApplication>(response.data);
    } catch (error) {
      return { success: false, message: this.extractErrorMessage(error) };
    }
  }

  async getMyApplications(): Promise<ApiResponse<JobApplication[]>> {
    try {
      const response = await this.client.get("/applications");
      return this.normalizeResponse<JobApplication[]>(response.data);
    } catch (error) {
      return { success: false, message: this.extractErrorMessage(error) };
    }
  }

  async getJobApplications(
    jobId: string,
  ): Promise<ApiResponse<JobApplication[]>> {
    try {
      const response = await this.client.get(`/jobs/${jobId}/applications`);
      return this.normalizeResponse<JobApplication[]>(response.data);
    } catch (error) {
      return { success: false, message: this.extractErrorMessage(error) };
    }
  }

  async updateApplicationStatus(
    applicationId: string,
    status: string,
  ): Promise<ApiResponse<JobApplication>> {
    try {
      const response = await this.client.patch(
        `/applications/${applicationId}`,
        {
          status,
        },
      );
      return this.normalizeResponse<JobApplication>(response.data);
    } catch (error) {
      return { success: false, message: this.extractErrorMessage(error) };
    }
  }

  async getSavedJobs(): Promise<ApiResponse<Job[]>> {
    try {
      const response = await this.client.get("/saved-jobs");
      return this.normalizeResponse<Job[]>(response.data);
    } catch (error) {
      return { success: false, message: this.extractErrorMessage(error) };
    }
  }

  async saveJob(jobId: string): Promise<ApiResponse<{ jobId: string }>> {
    try {
      const response = await this.client.post("/saved-jobs", { jobId });
      return this.normalizeResponse<{ jobId: string }>(response.data);
    } catch (error) {
      return { success: false, message: this.extractErrorMessage(error) };
    }
  }

  async unsaveJob(jobId: string): Promise<ApiResponse<{ jobId: string }>> {
    try {
      const response = await this.client.delete(`/saved-jobs/${jobId}`);
      return this.normalizeResponse<{ jobId: string }>(response.data);
    } catch (error) {
      return { success: false, message: this.extractErrorMessage(error) };
    }
  }

  async getNotifications(params?: {
    limit?: number;
    unreadOnly?: boolean;
  }): Promise<ApiResponse<Notification[]>> {
    try {
      const response = await this.client.get("/notifications", { params });
      return this.normalizeResponse<Notification[]>(response.data);
    } catch (error) {
      return { success: false, message: this.extractErrorMessage(error) };
    }
  }

  async markNotificationRead(
    notificationId: string,
  ): Promise<ApiResponse<Notification>> {
    try {
      const response = await this.client.patch(
        `/notifications/${notificationId}/read`,
      );
      return this.normalizeResponse<Notification>(response.data);
    } catch (error) {
      return { success: false, message: this.extractErrorMessage(error) };
    }
  }

  async markAllNotificationsRead(): Promise<ApiResponse> {
    try {
      const response = await this.client.post("/notifications/read-all");
      return this.normalizeResponse(response.data);
    } catch (error) {
      return { success: false, message: this.extractErrorMessage(error) };
    }
  }

  async initSslCommerzPayment(
    amount: number,
  ): Promise<ApiResponse<SslCommerzInitData>> {
    try {
      const response = await this.client.post("/payments/sslcommerz/init", {
        amount,
      });
      return this.normalizeResponse<SslCommerzInitData>(response.data);
    } catch (error) {
      return { success: false, message: this.extractErrorMessage(error) };
    }
  }

  async getMyPayments(): Promise<ApiResponse<Payment[]>> {
    try {
      const response = await this.client.get("/payments/me");
      return this.normalizeResponse<Payment[]>(response.data);
    } catch (error) {
      return { success: false, message: this.extractErrorMessage(error) };
    }
  }
}

export const apiClient = new ApiClient();

// Helper functions
export const setAuthToken = (token: string) => {
  if (!token || token === "undefined") {
    localStorage.removeItem("token");
    return;
  }
  localStorage.setItem("token", token);
};

export const getAuthToken = () => {
  return readStoredToken();
};

export const removeAuthToken = () => {
  localStorage.removeItem("token");
  localStorage.removeItem("user");
};

export const setUser = (user: User) => {
  try {
    const s = JSON.stringify(user);
    if (!s || s === "undefined") {
      localStorage.removeItem("user");
      return;
    }
    localStorage.setItem("user", s);
  } catch {
    localStorage.removeItem("user");
  }
};

export const getUser = (): User | null => {
  if (typeof window === "undefined") return null;
  const raw = localStorage.getItem("user");
  if (!raw || raw === "undefined" || raw === "null") {
    return null;
  }
  try {
    const parsed = JSON.parse(raw) as unknown;
    if (
      !parsed ||
      typeof parsed !== "object" ||
      !("_id" in parsed) ||
      !("email" in parsed) ||
      !("role" in parsed)
    ) {
      localStorage.removeItem("user");
      return null;
    }
    return parsed as User;
  } catch {
    localStorage.removeItem("user");
    return null;
  }
};

export const removeUser = () => {
  localStorage.removeItem("user");
};
