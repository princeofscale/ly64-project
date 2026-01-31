import axios, { AxiosError, InternalAxiosRequestConfig } from 'axios';
import { useAuthStore } from '../store/authStore';
import toast from 'react-hot-toast';

const API_BASE_URL = import.meta.env.VITE_API_URL || '/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// ==========================================
// Token Refresh Logic
// ==========================================

let isRefreshing = false;
let failedQueue: Array<{
  resolve: (token: string) => void;
  reject: (error: Error) => void;
}> = [];

const processQueue = (error: Error | null, token: string | null = null) => {
  failedQueue.forEach((prom) => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve(token!);
    }
  });
  failedQueue = [];
};

/**
 * Refresh access token using refresh token
 */
async function refreshAccessToken(): Promise<string | null> {
  const { refreshToken, setTokens, logout } = useAuthStore.getState();

  if (!refreshToken) {
    return null;
  }

  try {
    // Use axios directly to avoid interceptor loops
    const response = await axios.post(`${API_BASE_URL}/auth/refresh`, {
      refreshToken,
    });

    if (response.data.success) {
      const { accessToken, refreshToken: newRefreshToken, expiresIn } = response.data.data;
      setTokens(accessToken, newRefreshToken, expiresIn);
      return accessToken;
    }

    return null;
  } catch (error) {
    console.error('[API] Token refresh failed:', error);
    logout();
    return null;
  }
}

// ==========================================
// Request Interceptor
// ==========================================

api.interceptors.request.use(
  async (config: InternalAxiosRequestConfig) => {
    const authStore = useAuthStore.getState();
    const { token, shouldRefreshToken, isRefreshing: storeRefreshing } = authStore;

    // Skip refresh logic for auth endpoints
    const isAuthEndpoint = config.url?.includes('/auth/');

    if (token && !isAuthEndpoint) {
      // Proactively refresh token if it's about to expire (2 min before)
      if (shouldRefreshToken() && !storeRefreshing && !isRefreshing) {
        isRefreshing = true;
        authStore.setRefreshing(true);

        try {
          const newToken = await refreshAccessToken();
          if (newToken) {
            config.headers.Authorization = `Bearer ${newToken}`;
          }
        } finally {
          isRefreshing = false;
          authStore.setRefreshing(false);
        }
      } else {
        config.headers.Authorization = `Bearer ${token}`;
      }
    }

    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// ==========================================
// Response Interceptor
// ==========================================

api.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const originalRequest = error.config as InternalAxiosRequestConfig & { _retry?: boolean };

    // Handle 401 errors - attempt token refresh
    if (error.response?.status === 401 && !originalRequest._retry) {
      const authStore = useAuthStore.getState();
      const { refreshToken } = authStore;

      // Skip if no refresh token or it's an auth endpoint
      const isAuthEndpoint = originalRequest.url?.includes('/auth/');
      if (!refreshToken || isAuthEndpoint) {
        authStore.logout();
        window.location.href = '/login';
        return Promise.reject(error);
      }

      // If already refreshing, queue this request
      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          failedQueue.push({
            resolve: (token: string) => {
              originalRequest.headers.Authorization = `Bearer ${token}`;
              resolve(api(originalRequest));
            },
            reject: (err: Error) => {
              reject(err);
            },
          });
        });
      }

      originalRequest._retry = true;
      isRefreshing = true;
      authStore.setRefreshing(true);

      try {
        const newToken = await refreshAccessToken();

        if (newToken) {
          originalRequest.headers.Authorization = `Bearer ${newToken}`;
          processQueue(null, newToken);
          return api(originalRequest);
        } else {
          processQueue(new Error('Token refresh failed'), null);
          authStore.logout();
          window.location.href = '/login';
          return Promise.reject(error);
        }
      } catch (refreshError) {
        processQueue(refreshError as Error, null);
        authStore.logout();
        window.location.href = '/login';
        return Promise.reject(refreshError);
      } finally {
        isRefreshing = false;
        authStore.setRefreshing(false);
      }
    }

    // Handle diagnostic requirement
    if (error.response?.status === 403 && (error.response?.data as any)?.requiresDiagnostic) {
      toast.error('Завершите входную диагностику для доступа к этой функции');
      window.location.href = '/diagnostic';
    }

    return Promise.reject(error);
  }
);

// ==========================================
// Test API methods
// ==========================================

export const testApi = {
  async getTests(params?: { subject?: string; examType?: string; isDiagnostic?: boolean }) {
    const response = await api.get('/tests', { params });
    return response.data;
  },

  async startTest(testId: string) {
    const response = await api.post(`/tests/${testId}/start`);
    return response.data;
  },

  async submitTest(testId: string, answers: Array<{ questionId: string; answer: string }>, questionsOrder: string[]) {
    const response = await api.post(`/tests/${testId}/submit`, { answers, questionsOrder });
    return response.data;
  },

  async getTestResults(testId: string) {
    const response = await api.get(`/tests/${testId}/results`);
    return response.data;
  },
};

// ==========================================
// Auth API methods
// ==========================================

export const authApi = {
  /**
   * Logout from current device
   */
  async logout() {
    const { refreshToken } = useAuthStore.getState();
    try {
      await api.post('/auth/logout', { refreshToken });
    } catch (error) {
      console.error('[Auth] Logout error:', error);
    }
  },

  /**
   * Logout from all devices
   */
  async logoutAll() {
    try {
      const response = await api.post('/auth/logout-all');
      return response.data;
    } catch (error) {
      console.error('[Auth] Logout all error:', error);
      throw error;
    }
  },

  /**
   * Get active sessions
   */
  async getSessions() {
    const response = await api.get('/auth/sessions');
    return response.data;
  },
};

export default api;
