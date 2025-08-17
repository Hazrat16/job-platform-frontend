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
    this.baseURL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001";
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
      }
    );
  }

  // Auth endpoints
  async register(data: FormData): Promise<ApiResponse<AuthResponse>> {
    const response = await this.client.post("/auth/register", data, {
      headers: { "Content-Type": "multipart/form-data" },
    });
    return response.data;
  }

  async login(
    credentials: LoginCredentials
  ): Promise<ApiResponse<AuthResponse>> {
    const response = await this.client.post("/auth/login", credentials);
    return response.data;
  }

  async forgotPassword(data: ForgotPasswordData): Promise<ApiResponse> {
    const response = await this.client.post("/auth/forgot-password", data);
    return response.data;
  }

  async resetPassword(data: ResetPasswordData): Promise<ApiResponse> {
    const response = await this.client.post("/auth/reset-password", data);
    return response.data;
  }

  async verifyEmail(token: string): Promise<ApiResponse> {
    const response = await this.client.get(`/auth/verify-email?token=${token}`);
    return response.data;
  }

  async uploadProfilePhoto(
    photo: File
  ): Promise<ApiResponse<{ photo: string }>> {
    const formData = new FormData();
    formData.append("photo", photo);

    const response = await this.client.post("/auth/upload-photo", formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });
    return response.data;
  }

  // User endpoints
  async getCurrentUser(): Promise<ApiResponse<User>> {
    const response = await this.client.get("/auth/protected");
    return response.data;
  }

  // Job endpoints (to be implemented when backend adds them)
  async getJobs(params?: Record<string, unknown>): Promise<ApiResponse<Job[]>> {
    const response = await this.client.get("/jobs", { params });
    return response.data;
  }

  async getJob(id: string): Promise<ApiResponse<Job>> {
    const response = await this.client.get(`/jobs/${id}`);
    return response.data;
  }

  async createJob(jobData: Partial<Job>): Promise<ApiResponse<Job>> {
    const response = await this.client.post("/jobs", jobData);
    return response.data;
  }

  async updateJob(
    id: string,
    jobData: Partial<Job>
  ): Promise<ApiResponse<Job>> {
    const response = await this.client.put(`/jobs/${id}`, jobData);
    return response.data;
  }

  async deleteJob(id: string): Promise<ApiResponse> {
    const response = await this.client.delete(`/jobs/${id}`);
    return response.data;
  }

  // Job Application endpoints
  async applyForJob(
    jobId: string,
    applicationData: FormData
  ): Promise<ApiResponse<JobApplication>> {
    const response = await this.client.post(
      `/jobs/${jobId}/apply`,
      applicationData,
      {
        headers: { "Content-Type": "multipart/form-data" },
      }
    );
    return response.data;
  }

  async getMyApplications(): Promise<ApiResponse<JobApplication[]>> {
    const response = await this.client.get("/applications");
    return response.data;
  }

  async getJobApplications(
    jobId: string
  ): Promise<ApiResponse<JobApplication[]>> {
    const response = await this.client.get(`/jobs/${jobId}/applications`);
    return response.data;
  }

  async updateApplicationStatus(
    applicationId: string,
    status: string
  ): Promise<ApiResponse<JobApplication>> {
    const response = await this.client.patch(`/applications/${applicationId}`, {
      status,
    });
    return response.data;
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
