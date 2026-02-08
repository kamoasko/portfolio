import axios, { AxiosInstance, AxiosRequestConfig, AxiosError } from "axios";
import { ApiResponse } from "../types";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

class ApiService {
  private client: AxiosInstance;
  private accessToken: string | null = null;
  private refreshToken: string | null = null;

  constructor() {
    this.client = axios.create({
      baseURL: API_BASE_URL,
      withCredentials: true,
    });

    // Request interceptor - add access token
    this.client.interceptors.request.use((config) => {
      if (this.accessToken) {
        config.headers.Authorization = `Bearer ${this.accessToken}`;
      }
      return config;
    });

    // Response interceptor - handle token refresh
    this.client.interceptors.response.use(
      (response) => response,
      async (error: AxiosError) => {
        const originalRequest = error.config as AxiosRequestConfig & {
          _retry?: boolean;
        };

        if (error.response?.status === 401 && !originalRequest._retry) {
          originalRequest._retry = true;

          try {
            const response = await this.client.post("/auth/refresh", {
              refreshToken: this.refreshToken,
            });

            const { accessToken } = response.data.data;
            this.accessToken = accessToken;

            if (originalRequest.headers) {
              originalRequest.headers.Authorization = `Bearer ${accessToken}`;
            }

            return this.client(originalRequest);
          } catch {
            this.clearTokens();
            window.location.href = "/login";
          }
        }

        return Promise.reject(error);
      },
    );
  }

  setTokens(accessToken: string, refreshToken: string) {
    this.accessToken = accessToken;
    this.refreshToken = refreshToken;
    localStorage.setItem("refreshToken", refreshToken);
  }

  getAccessToken(): string | null {
    return this.accessToken;
  }

  clearTokens() {
    this.accessToken = null;
    this.refreshToken = null;
    localStorage.removeItem("refreshToken");
  }

  loadTokensFromStorage() {
    const refreshToken = localStorage.getItem("refreshToken");
    if (refreshToken) {
      this.refreshToken = refreshToken;
    }
  }

  // Auth endpoints
  async register(
    email: string,
    username: string,
    password: string,
    passwordConfirm: string,
  ) {
    const response = await this.client.post<ApiResponse<any>>(
      "/auth/register",
      {
        email,
        username,
        password,
        passwordConfirm,
      },
    );
    return response.data;
  }

  async login(email: string, password: string) {
    const response = await this.client.post<ApiResponse<any>>("/auth/login", {
      email,
      password,
    });
    return response.data;
  }

  async logout() {
    try {
      await this.client.post<ApiResponse<null>>("/auth/logout");
    } finally {
      this.clearTokens();
    }
  }

  async getMe() {
    const response = await this.client.get<ApiResponse<any>>("/auth/me");
    return response.data;
  }

  // Projects endpoints
  async getProjects(published?: boolean, skip?: number, limit?: number) {
    const params: any = {};
    if (published !== undefined) params.published = published;
    if (skip !== undefined) params.skip = skip;
    if (limit !== undefined) params.limit = limit;

    const response = await this.client.get<ApiResponse<any>>("/projects", {
      params,
    });
    return response.data;
  }

  async getProject(id: string) {
    const response = await this.client.get<ApiResponse<any>>(`/projects/${id}`);
    return response.data;
  }

  async createProject(data: any) {
    const response = await this.client.post<ApiResponse<any>>(
      "/projects",
      data,
    );
    return response.data;
  }

  async updateProject(id: string, data: any) {
    const response = await this.client.put<ApiResponse<any>>(
      `/projects/${id}`,
      data,
    );
    return response.data;
  }

  async deleteProject(id: string) {
    const response = await this.client.delete<ApiResponse<null>>(
      `/projects/${id}`,
    );
    return response.data;
  }

  async toggleProjectPublish(id: string) {
    const response = await this.client.patch<ApiResponse<any>>(
      `/projects/${id}/publish`,
    );
    return response.data;
  }

  async reorderProjects(projects: Array<{ id: string; order: number }>) {
    const response = await this.client.patch<ApiResponse<any>>(
      "/projects/reorder",
      {
        projects,
      },
    );
    return response.data;
  }

  // Content endpoints
  async getContent(type: string) {
    const response = await this.client.get<ApiResponse<any>>(
      `/content/${type}`,
    );
    return response.data;
  }

  async updateContent(type: string, data: any) {
    const response = await this.client.put<ApiResponse<any>>(
      `/content/${type}`,
      data,
    );
    return response.data;
  }

  async getSkills() {
    const response = await this.client.get<ApiResponse<any>>("/content/skills");
    return response.data;
  }

  async updateSkills(skills: any[]) {
    const response = await this.client.put<ApiResponse<any>>(
      "/content/skills/update",
      {
        skills,
      },
    );
    return response.data;
  }

  // Messages endpoints
  async getMessages(
    isRead?: boolean,
    isArchived?: boolean,
    skip?: number,
    limit?: number,
  ) {
    const params: any = {};
    if (isRead !== undefined) params.isRead = isRead;
    if (isArchived !== undefined) params.isArchived = isArchived;
    if (skip !== undefined) params.skip = skip;
    if (limit !== undefined) params.limit = limit;

    const response = await this.client.get<ApiResponse<any>>("/messages", {
      params,
    });
    return response.data;
  }

  async getMessage(id: string) {
    const response = await this.client.get<ApiResponse<any>>(`/messages/${id}`);
    return response.data;
  }

  async markMessageAsRead(id: string) {
    const response = await this.client.patch<ApiResponse<any>>(
      `/messages/${id}/read`,
    );
    return response.data;
  }

  async replyToMessage(id: string, reply: string) {
    const response = await this.client.patch<ApiResponse<any>>(
      `/messages/${id}/reply`,
      {
        reply,
      },
    );
    return response.data;
  }

  async archiveMessage(id: string) {
    const response = await this.client.patch<ApiResponse<any>>(
      `/messages/${id}/archive`,
    );
    return response.data;
  }

  async deleteMessage(id: string) {
    const response = await this.client.delete<ApiResponse<null>>(
      `/messages/${id}`,
    );
    return response.data;
  }

  // Telemetry endpoints
  async getAnalytics(startDate?: string, endDate?: string, eventName?: string) {
    const params: any = {};
    if (startDate) params.startDate = startDate;
    if (endDate) params.endDate = endDate;
    if (eventName) params.eventName = eventName;

    const response = await this.client.get<ApiResponse<any>>(
      "/telemetry/analytics",
      { params },
    );
    return response.data;
  }

  async getTelemetrySummary() {
    const response =
      await this.client.get<ApiResponse<any>>("/telemetry/summary");
    return response.data;
  }
}

export const apiService = new ApiService();
