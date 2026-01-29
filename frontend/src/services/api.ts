import axios from 'axios';
import { useAuthStore } from '../store/authStore';
import toast from 'react-hot-toast';

const API_BASE_URL = import.meta.env.VITE_API_URL || '/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

api.interceptors.request.use(
  (config) => {
    const token = useAuthStore.getState().token;
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      useAuthStore.getState().logout();
      window.location.href = '/login';
    }

    // Handle diagnostic requirement
    if (error.response?.status === 403 && error.response?.data?.requiresDiagnostic) {
      toast.error('Завершите входную диагностику для доступа к этой функции');
      window.location.href = '/diagnostic';
    }

    return Promise.reject(error);
  }
);

// Test API methods
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

export default api;
