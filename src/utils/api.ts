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
    // Use relative URLs - Next.js rewrites will proxy to backend
    this.baseURL = "/api";
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
    try {
      const response = await this.client.post("/auth/register", data, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      // Handle the actual response structure from backend
      if (
        response.data.message &&
        response.data.message.includes("Check email to verify")
      ) {
        return {
          success: true,
          message: response.data.message,
          data: undefined,
        };
      }

      return {
        success: true,
        message: "Registration successful",
        data: response.data,
      };
    } catch (error: any) {
      return {
        success: false,
        message: error.response?.data?.error || "Registration failed",
        error: error.response?.data?.error || "Registration failed",
      };
    }
  }

  async login(
    credentials: LoginCredentials
  ): Promise<ApiResponse<AuthResponse>> {
    try {
      const response = await this.client.post("/auth/login", credentials);

      // Handle the actual response structure from backend
      if (response.data.token && response.data.user) {
        return {
          success: true,
          message: "Login successful",
          data: {
            token: response.data.token,
            user: response.data.user,
          },
        };
      }

      return {
        success: false,
        message: "Invalid response format",
        error: "Invalid response format",
      };
    } catch (error: any) {
      return {
        success: false,
        message: error.response?.data?.error || "Login failed",
        error: error.response?.data?.error || "Login failed",
      };
    }
  }

  async forgotPassword(data: ForgotPasswordData): Promise<ApiResponse> {
    try {
      const response = await this.client.post("/auth/forgot-password", data);
      return {
        success: true,
        message: response.data.message || "Password reset link sent",
      };
    } catch (error: any) {
      return {
        success: false,
        message: error.response?.data?.error || "Failed to send reset link",
        error: error.response?.data?.error || "Failed to send reset link",
      };
    }
  }

  async resetPassword(data: ResetPasswordData): Promise<ApiResponse> {
    try {
      const response = await this.client.post("/auth/reset-password", {
        token: data.token,
        newPassword: data.password,
      });
      return {
        success: true,
        message: response.data.message || "Password reset successful",
      };
    } catch (error: any) {
      return {
        success: false,
        message: error.response?.data?.error || "Password reset failed",
        error: error.response?.data?.error || "Password reset failed",
      };
    }
  }

  async verifyEmail(token: string): Promise<ApiResponse> {
    try {
      const response = await this.client.get(
        `/auth/verify-email?token=${token}`
      );
      return {
        success: true,
        message: response.data.message || "Email verified successfully",
      };
    } catch (error: any) {
      return {
        success: false,
        message: error.response?.data?.error || "Email verification failed",
        error: error.response?.data?.error || "Email verification failed",
      };
    }
  }

  async uploadProfilePhoto(
    photo: File
  ): Promise<ApiResponse<{ photo: string }>> {
    try {
      const formData = new FormData();
      formData.append("photo", photo);

      const response = await this.client.post("/auth/upload-photo", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      return {
        success: true,
        message: response.data.message || "Profile photo updated",
        data: {
          photo: response.data.photo || response.data.url,
        },
      };
    } catch (error: any) {
      return {
        success: false,
        message: error.response?.data?.error || "Failed to upload photo",
        error: error.response?.data?.error || "Failed to upload photo",
      };
    }
  }

  // User endpoints
  async getCurrentUser(): Promise<ApiResponse<User>> {
    try {
      const response = await this.client.get("/auth/protected");
      return {
        success: true,
        message: "User data retrieved",
        data: response.data.user,
      };
    } catch (error: any) {
      return {
        success: false,
        message: error.response?.data?.error || "Failed to get user data",
        error: error.response?.data?.error || "Failed to get user data",
      };
    }
  }

  // File upload endpoints
  async uploadImage(file: File): Promise<ApiResponse<{ url: string }>> {
    try {
      const formData = new FormData();
      formData.append("file", file);

      const response = await this.client.post("/upload/image", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      return {
        success: true,
        message: response.data.message || "Image uploaded successfully",
        data: {
          url: response.data.url,
        },
      };
    } catch (error: any) {
      return {
        success: false,
        message: error.response?.data?.error || "Failed to upload image",
        error: error.response?.data?.error || "Failed to upload image",
      };
    }
  }

  // Chat endpoints
  async sendChatMessage(
    senderId: string,
    receiverId: string,
    message: string
  ): Promise<ApiResponse> {
    try {
      const response = await this.client.post("/chat", {
        senderId,
        receiverId,
        message,
      });

      return {
        success: true,
        message: "Message sent successfully",
      };
    } catch (error: any) {
      return {
        success: false,
        message: error.response?.data?.error || "Failed to send message",
        error: error.response?.data?.error || "Failed to send message",
      };
    }
  }

  // Job endpoints (to be implemented when backend adds them)
  async getJobs(params?: Record<string, unknown>): Promise<ApiResponse<Job[]>> {
    try {
      const response = await this.client.get("/jobs", { params });
      return {
        success: true,
        message: "Jobs retrieved successfully",
        data: response.data,
      };
    } catch (error: any) {
      return {
        success: false,
        message: error.response?.data?.error || "Failed to fetch jobs",
        error: error.response?.data?.error || "Failed to fetch jobs",
      };
    }
  }

  async getJob(id: string): Promise<ApiResponse<Job>> {
    try {
      const response = await this.client.get(`/jobs/${id}`);
      return {
        success: true,
        message: "Job retrieved successfully",
        data: response.data,
      };
    } catch (error: any) {
      return {
        success: false,
        message: error.response?.data?.error || "Failed to fetch job",
        error: error.response?.data?.error || "Failed to fetch job",
      };
    }
  }

  async createJob(jobData: Partial<Job>): Promise<ApiResponse<Job>> {
    try {
      const response = await this.client.post("/jobs", jobData);
      return {
        success: true,
        message: "Job created successfully",
        data: response.data,
      };
    } catch (error: any) {
      return {
        success: false,
        message: error.response?.data?.error || "Failed to create job",
        error: error.response?.data?.error || "Failed to create job",
      };
    }
  }

  async updateJob(
    id: string,
    jobData: Partial<Job>
  ): Promise<ApiResponse<Job>> {
    try {
      const response = await this.client.put(`/jobs/${id}`, jobData);
      return {
        success: true,
        message: "Job updated successfully",
        data: response.data,
      };
    } catch (error: any) {
      return {
        success: false,
        message: error.response?.data?.error || "Failed to update job",
        error: error.response?.data?.error || "Failed to update job",
      };
    }
  }

  async deleteJob(id: string): Promise<ApiResponse> {
    try {
      const response = await this.client.delete(`/jobs/${id}`);
      return {
        success: true,
        message: "Job deleted successfully",
      };
    } catch (error: any) {
      return {
        success: false,
        message: error.response?.data?.error || "Failed to delete job",
        error: error.response?.data?.error || "Failed to delete job",
      };
    }
  }

  // Job Application endpoints
  async applyForJob(
    jobId: string,
    applicationData: FormData
  ): Promise<ApiResponse<JobApplication>> {
    try {
      const response = await this.client.post(
        `/jobs/${jobId}/apply`,
        applicationData,
        {
          headers: { "Content-Type": "multipart/form-data" },
        }
      );

      return {
        success: true,
        message: "Application submitted successfully",
        data: response.data,
      };
    } catch (error: any) {
      return {
        success: false,
        message: error.response?.data?.error || "Failed to submit application",
        error: error.response?.data?.error || "Failed to submit application",
      };
    }
  }

  async getMyApplications(): Promise<ApiResponse<JobApplication[]>> {
    try {
      const response = await this.client.get("/applications");
      return {
        success: true,
        message: "Applications retrieved successfully",
        data: response.data,
      };
    } catch (error: any) {
      return {
        success: false,
        message: error.response?.data?.error || "Failed to fetch applications",
        error: error.response?.data?.error || "Failed to fetch applications",
      };
    }
  }

  async getJobApplications(
    jobId: string
  ): Promise<ApiResponse<JobApplication[]>> {
    try {
      const response = await this.client.get(`/jobs/${jobId}/applications`);
      return {
        success: true,
        message: "Job applications retrieved successfully",
        data: response.data,
      };
    } catch (error: any) {
      return {
        success: false,
        message:
          error.response?.data?.error || "Failed to fetch job applications",
        error:
          error.response?.data?.error || "Failed to fetch job applications",
      };
    }
  }

  async updateApplicationStatus(
    applicationId: string,
    status: string
  ): Promise<ApiResponse<JobApplication>> {
    try {
      const response = await this.client.patch(
        `/applications/${applicationId}`,
        {
          status,
        }
      );

      return {
        success: true,
        message: "Application status updated successfully",
        data: response.data,
      };
    } catch (error: any) {
      return {
        success: false,
        message:
          error.response?.data?.error || "Failed to update application status",
        error:
          error.response?.data?.error || "Failed to update application status",
      };
    }
  }

  // Health check endpoint
  async healthCheck(): Promise<ApiResponse> {
    try {
      const response = await this.client.get("/test");
      return {
        success: true,
        message: response.data.message || "API is healthy",
      };
    } catch (error: any) {
      return {
        success: false,
        message: "API health check failed",
        error: "API health check failed",
      };
    }
  }
}

export const apiClient = new ApiClient();

// Helper functions
export const setAuthToken = (token: string) => {
  localStorage.setItem("token", token);
};

export const getAuthToken = () => {
  localStorage.getItem("token");
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
