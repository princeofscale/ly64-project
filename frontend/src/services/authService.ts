import { useAuthStore } from '../store/authStore';

import api, { authApi } from './api';

interface RegisterData {
  email: string;
  password: string;
  name: string;
  status?: string;
  currentGrade?: number;
  desiredDirection?: string;
  motivation?: string;
  agreedToTerms?: boolean;
}

interface LoginData {
  email: string;
  password: string;
}

interface User {
  id: string;
  email: string;
  username: string;
  name: string;
  avatar?: string;
  desiredDirection?: string;
  diagnosticCompleted?: boolean;
  role?: string;
}

interface AuthResponse {
  success: boolean;
  message?: string;
  data: {
    user: User;
    accessToken: string;
    refreshToken: string;
    expiresIn: number;
  };
}

export const authService = {
  /**
   * Register new user
   */
  async register(data: RegisterData): Promise<AuthResponse> {
    const response = await api.post<AuthResponse>('/auth/register', data);

    if (response.data.success) {
      const { user, accessToken, refreshToken, expiresIn } = response.data.data;
      useAuthStore.getState().login(user, accessToken, refreshToken, expiresIn);
    }

    return response.data;
  },

  /**
   * Login user
   */
  async login(data: LoginData): Promise<AuthResponse> {
    const response = await api.post<AuthResponse>('/auth/login', data);

    if (response.data.success) {
      const { user, accessToken, refreshToken, expiresIn } = response.data.data;
      useAuthStore.getState().login(user, accessToken, refreshToken, expiresIn);
    }

    return response.data;
  },

  /**
   * Logout from current device
   */
  async logout(): Promise<void> {
    try {
      await authApi.logout();
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      useAuthStore.getState().logout();
    }
  },

  /**
   * Logout from all devices
   */
  async logoutAll(): Promise<void> {
    try {
      await authApi.logoutAll();
    } finally {
      useAuthStore.getState().logout();
    }
  },

  /**
   * Get active sessions
   */
  async getSessions() {
    return authApi.getSessions();
  },

  /**
   * Get current user data
   */
  async getCurrentUser() {
    const response = await api.get('/auth/me');
    return response.data;
  },
};
