import api from './api';
import { useAuthStore } from '../store/authStore';

interface RegisterData {
  email: string;
  password: string;
  name: string;
}

interface LoginData {
  email: string;
  password: string;
}

interface AuthResponse {
  success: boolean;
  message?: string;
  data: {
    user: {
      id: string;
      email: string;
      username: string;
      name: string;
    };
    token: string;
  };
}

export const authService = {
  
  async register(data: RegisterData): Promise<AuthResponse> {
    const response = await api.post<AuthResponse>('/auth/register', data);

    if (response.data.success) {
      const { user, token } = response.data.data;
      useAuthStore.getState().login(user, token);
    }

    return response.data;
  },

  
  async login(data: LoginData): Promise<AuthResponse> {
    const response = await api.post<AuthResponse>('/auth/login', data);

    if (response.data.success) {
      const { user, token } = response.data.data;
      useAuthStore.getState().login(user, token);
    }

    return response.data;
  },

  
  async logout(): Promise<void> {
    try {
      await api.post('/auth/logout');
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      useAuthStore.getState().logout();
    }
  },

  
  async getCurrentUser() {
    const response = await api.get('/auth/me');
    return response.data;
  },
};
