import axios from 'axios';
import {
  HealthCheckResponse,
  SystemInfoResponse,
  TokenResponse,
  LoginRequest,
  RegisterRequest,
  User,
  UserProfileUpdate,
  ChatSessionSummary,
  ChatSession,
  ChatMessage,
} from '../types';

export const getApiBaseUrl = (): string => {
  const custom = localStorage.getItem('custom_api_url');
  if (custom && custom.trim()) {
    return `${custom.trim().replace(/\/+$/, '')}/api/v1`;
  }
  if (import.meta.env.VITE_API_URL) {
    return `${import.meta.env.VITE_API_URL.replace(/\/+$/, '')}/api/v1`;
  }
  return '/api/v1';
};

const apiClient = axios.create({
  baseURL: getApiBaseUrl(),
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 10000,
});

// Intercept requests to dynamically resolve baseURL and inject JWT Bearer token
apiClient.interceptors.request.use(
  (config) => {
    config.baseURL = getApiBaseUrl();
    const token = localStorage.getItem('access_token');
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    // If request payload is FormData, do not set application/json or naked multipart/form-data.
    // Removing Content-Type allows the browser/Axios to automatically inject the boundary.
    if (config.data instanceof FormData && config.headers) {
      if (typeof (config.headers as any).delete === 'function') {
        (config.headers as any).delete('Content-Type');
      } else {
        delete (config.headers as any)['Content-Type'];
      }
    }
    return config;
  },
  (error) => Promise.reject(error)
);

export const getHealthCheck = async (): Promise<HealthCheckResponse> => {
  const response = await apiClient.get<HealthCheckResponse>('/health');
  return response.data;
};

export const getSystemInfo = async (): Promise<SystemInfoResponse> => {
  const response = await apiClient.get<SystemInfoResponse>('/health/system-info');
  return response.data;
};

// Milestone 2 Auth API methods
export const loginUser = async (data: LoginRequest): Promise<TokenResponse> => {
  const response = await apiClient.post<TokenResponse>('/auth/login', data);
  return response.data;
};

export const registerUser = async (data: RegisterRequest): Promise<TokenResponse> => {
  const response = await apiClient.post<TokenResponse>('/auth/register', data);
  return response.data;
};

export const getProfile = async (): Promise<User> => {
  const response = await apiClient.get<User>('/auth/me');
  return response.data;
};

export const updateProfile = async (data: UserProfileUpdate): Promise<User> => {
  const response = await apiClient.put<User>('/auth/me', data);
  return response.data;
};

// Milestone 3 Chat & Legal Triage API methods
export const createChatSession = async (
  title?: string,
  domain_category?: string
): Promise<ChatSession> => {
  const response = await apiClient.post<ChatSession>('/chat/sessions', {
    title: title || 'New Legal Consultation',
    domain_category: domain_category || null,
  });
  return response.data;
};

export const getChatSessions = async (): Promise<ChatSessionSummary[]> => {
  const response = await apiClient.get<ChatSessionSummary[]>('/chat/sessions');
  return response.data;
};

export const getChatSessionHistory = async (sessionId: number): Promise<ChatSession> => {
  const response = await apiClient.get<ChatSession>(`/chat/sessions/${sessionId}`);
  return response.data;
};

export const sendChatMessage = async (
  sessionId: number,
  content: string,
  language?: string
): Promise<ChatMessage> => {
  const apiKey = localStorage.getItem('ai_api_key') || '';
  const provider = localStorage.getItem('ai_provider') || 'gemini';
  const response = await apiClient.post<ChatMessage>(`/chat/sessions/${sessionId}/message`, {
    content,
    role: 'user',
    language: language || 'en',
    api_key: apiKey || undefined,
    provider: provider,
  });
  return response.data;
};

export const deleteChatSession = async (
  sessionId: number
): Promise<{ success: boolean; message: string }> => {
  const response = await apiClient.delete(`/chat/sessions/${sessionId}`);
  return response.data;
};

export default apiClient;
