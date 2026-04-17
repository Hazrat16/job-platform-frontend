import {
  ApiResponse,
  AuthResponse,
  ForgotPasswordData,
  Job,
  JobApplication,
  LoginCredentials,
  ResetPasswordData,
  User,
} from "@/types";
import axios, { AxiosInstance } from "axios";

class ApiClient {
  private client: AxiosInstance;
  private baseURL: string;

  constructor() {
    this.baseURL =
      process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api";
    this.client = axios.create({
      baseURL: this.baseURL,
      headers: {
        "Content-Type": "application/json",
      },
    });

    // Add auth token to requests
    this.client.interceptors.request.use((config) => {
      const token = localStorage.getItem("token");
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
  ): Promise<ApiResponse<{ photo: string }>> {
    const formData = new FormData();
    formData.append("photo", photo);

    try {
      const response = await this.client.post("/auth/upload-photo", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      return this.normalizeResponse<{ photo: string }>(response.data);
    } catch (error) {
      return { success: false, message: this.extractErrorMessage(error) };
    }
  }

  // User endpoints
  async getCurrentUser(): Promise<ApiResponse<User>> {
    try {
      const response = await this.client.get("/auth/protected");
      return this.normalizeResponse<User>(response.data);
    } catch (error) {
      return { success: false, message: this.extractErrorMessage(error) };
    }
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
}

export const apiClient = new ApiClient();

// Helper functions
export const setAuthToken = (token: string) => {
  localStorage.setItem("token", token);
};

export const getAuthToken = () => {
  return localStorage.getItem("token");
};

export const removeAuthToken = () => {
  localStorage.removeItem("token");
  localStorage.removeItem("user");
};

export const setUser = (user: User) => {
  localStorage.setItem("user", JSON.stringify(user));
};

export const getUser = (): User | null => {
  const user = localStorage.getItem("user");
  return user ? JSON.parse(user) : null;
};

export const removeUser = () => {
  localStorage.removeItem("user");
};
