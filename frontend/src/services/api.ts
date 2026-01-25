import axios from 'axios';
import { useAuthStore } from '../store/authStore';

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
    return Promise.reject(error);
  }
);

// Test API methods
export const testApi = {
  // Get all tests with optional filters
  getTests: async (params?: {
    subject?: string;
    examType?: string;
    isDiagnostic?: boolean;
  }) => {
    const response = await api.get('/tests', { params });
    return response.data;
  },

  // Start a test (get randomized questions)
  startTest: async (testId: string) => {
    const response = await api.get(`/tests/${testId}/start`);
    return response.data;
  },

  // Submit test answers
  submitTest: async (
    testId: string,
    answers: Array<{ questionId: string; answer: string }>,
    questionsOrder: string[]
  ) => {
    const response = await api.post(`/tests/${testId}/submit`, {
      answers,
      questionsOrder,
    });
    return response.data;
  },

  // Get test results
  getTestResults: async (testId: string) => {
    const response = await api.get(`/tests/${testId}/results`);
    return response.data;
  },
};

export default api;
