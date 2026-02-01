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

let isRefreshing = false;
let refreshPromise: Promise<string | null> | null = null;
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


async function refreshAccessToken(): Promise<string | null> {
  const { refreshToken, setTokens, logout } = useAuthStore.getState();

  if (!refreshToken) {
    return null;
  }

  try {
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


api.interceptors.request.use(
  async (config: InternalAxiosRequestConfig) => {
    const authStore = useAuthStore.getState();
    const { token, shouldRefreshToken, isRefreshing: storeRefreshing } = authStore;

    const isAuthEndpoint = config.url?.includes('/auth/');

    if (token && !isAuthEndpoint) {
      if (shouldRefreshToken() && !storeRefreshing && !isRefreshing) {
        isRefreshing = true;
        authStore.setRefreshing(true);

        // Create and store the refresh promise
        refreshPromise = refreshAccessToken().finally(() => {
          isRefreshing = false;
          authStore.setRefreshing(false);
          refreshPromise = null;
        });

        const newToken = await refreshPromise;
        if (newToken) {
          config.headers.Authorization = `Bearer ${newToken}`;
        }
      } else if (isRefreshing && refreshPromise) {
        // Wait for the ongoing refresh to complete
        const newToken = await refreshPromise;
        if (newToken) {
          config.headers.Authorization = `Bearer ${newToken}`;
        }
      } else {
        config.headers.Authorization = `Bearer ${token}`;
      }
    }

    return config;
  },
  (error: any) => {
    return Promise.reject(error);
  }
);

api.interceptors.response.use(
  (response: any) => response,
  async (error: AxiosError) => {
    const originalRequest = error.config as InternalAxiosRequestConfig & { _retry?: boolean };

    if (error.response?.status === 401 && !originalRequest._retry) {
      const authStore = useAuthStore.getState();
      const { refreshToken } = authStore;

      const isAuthEndpoint = originalRequest.url?.includes('/auth/');
      if (!refreshToken || isAuthEndpoint) {
        authStore.logout();
        window.location.href = '/login';
        return Promise.reject(error);
      }

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

      // Create and store the refresh promise
      refreshPromise = refreshAccessToken().finally(() => {
        isRefreshing = false;
        authStore.setRefreshing(false);
        refreshPromise = null;
      });

      try {
        const newToken = await refreshPromise;

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
      }
    }

    return Promise.reject(error);
  }
);

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

export const authApi = {
  async logout() {
    const { refreshToken } = useAuthStore.getState();
    try {
      await api.post('/auth/logout', { refreshToken });
    } catch (error) {
      console.error('[Auth] Logout error:', error);
    }
  },

  async logoutAll() {
    try {
      const response = await api.post('/auth/logout-all');
      return response.data;
    } catch (error) {
      console.error('[Auth] Logout all error:', error);
      throw error;
    }
  },

  async getSessions() {
    const response = await api.get('/auth/sessions');
    return response.data;
  },
};

export default api;
