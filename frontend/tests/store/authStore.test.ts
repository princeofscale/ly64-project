/* eslint-disable */
/**
 * AuthStore Tests
 *
 * Tests for the Zustand auth store including:
 * - Initial state
 * - Login/logout actions
 * - Token management
 * - Token expiration checks
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { act } from '@testing-library/react';

import { useAuthStore } from '../../src/store/authStore';

// Mock user data
const mockUser = {
  id: 'user-123',
  email: 'test@example.com',
  name: 'Test User',
  username: 'testuser',
  avatar: 'https://example.com/avatar.jpg',
  desiredDirection: 'PROGRAMMING',
  role: 'USER',
};

describe('AuthStore', () => {
  beforeEach(() => {
    // Reset store state before each test
    act(() => {
      useAuthStore.setState({
        user: null,
        token: null,
        refreshToken: null,
        tokenExpiresAt: null,
        isAuthenticated: false,
        isLoading: false,
        isRefreshing: false,
        _hasHydrated: false,
      });
    });
  });

  describe('initial state', () => {
    it('should have null user initially', () => {
      const { user } = useAuthStore.getState();
      expect(user).toBeNull();
    });

    it('should not be authenticated initially', () => {
      const { isAuthenticated } = useAuthStore.getState();
      expect(isAuthenticated).toBe(false);
    });

    it('should have null token initially', () => {
      const { token } = useAuthStore.getState();
      expect(token).toBeNull();
    });

    it('should have null refreshToken initially', () => {
      const { refreshToken } = useAuthStore.getState();
      expect(refreshToken).toBeNull();
    });

    it('should not be loading initially', () => {
      const { isLoading } = useAuthStore.getState();
      expect(isLoading).toBe(false);
    });

    it('should not be refreshing initially', () => {
      const { isRefreshing } = useAuthStore.getState();
      expect(isRefreshing).toBe(false);
    });
  });

  describe('setUser', () => {
    it('should set user and authenticate', () => {
      act(() => {
        useAuthStore.getState().setUser(mockUser);
      });

      const { user, isAuthenticated } = useAuthStore.getState();
      expect(user).toEqual(mockUser);
      expect(isAuthenticated).toBe(true);
    });
  });

  describe('setToken', () => {
    it('should set token', () => {
      const testToken = 'test-access-token';

      act(() => {
        useAuthStore.getState().setToken(testToken);
      });

      const { token } = useAuthStore.getState();
      expect(token).toBe(testToken);
    });
  });

  describe('setTokens', () => {
    it('should set access and refresh tokens', () => {
      const accessToken = 'access-token-123';
      const refreshToken = 'refresh-token-456';
      const expiresIn = 900; // 15 minutes

      act(() => {
        useAuthStore.getState().setTokens(accessToken, refreshToken, expiresIn);
      });

      const state = useAuthStore.getState();
      expect(state.token).toBe(accessToken);
      expect(state.refreshToken).toBe(refreshToken);
      expect(state.tokenExpiresAt).toBeGreaterThan(Date.now());
    });

    it('should calculate correct expiration time', () => {
      const expiresIn = 3600; // 1 hour
      const before = Date.now();

      act(() => {
        useAuthStore.getState().setTokens('token', 'refresh', expiresIn);
      });

      const { tokenExpiresAt } = useAuthStore.getState();
      const expectedMin = before + expiresIn * 1000;
      const expectedMax = Date.now() + expiresIn * 1000;

      expect(tokenExpiresAt).toBeGreaterThanOrEqual(expectedMin);
      expect(tokenExpiresAt).toBeLessThanOrEqual(expectedMax);
    });
  });

  describe('login', () => {
    it('should set user and tokens on login', () => {
      const accessToken = 'access-123';
      const refreshToken = 'refresh-456';
      const expiresIn = 900;

      act(() => {
        useAuthStore.getState().login(mockUser, accessToken, refreshToken, expiresIn);
      });

      const state = useAuthStore.getState();
      expect(state.user).toEqual(mockUser);
      expect(state.token).toBe(accessToken);
      expect(state.refreshToken).toBe(refreshToken);
      expect(state.isAuthenticated).toBe(true);
      expect(state.isLoading).toBe(false);
    });

    it('should set isLoading to false on login', () => {
      // First set loading to true
      act(() => {
        useAuthStore.getState().setLoading(true);
      });

      expect(useAuthStore.getState().isLoading).toBe(true);

      // Then login
      act(() => {
        useAuthStore.getState().login(mockUser, 'token', 'refresh', 900);
      });

      expect(useAuthStore.getState().isLoading).toBe(false);
    });
  });

  describe('logout', () => {
    it('should clear all auth state on logout', () => {
      // First login
      act(() => {
        useAuthStore.getState().login(mockUser, 'token', 'refresh', 900);
      });

      expect(useAuthStore.getState().isAuthenticated).toBe(true);

      // Then logout
      act(() => {
        useAuthStore.getState().logout();
      });

      const state = useAuthStore.getState();
      expect(state.user).toBeNull();
      expect(state.token).toBeNull();
      expect(state.refreshToken).toBeNull();
      expect(state.tokenExpiresAt).toBeNull();
      expect(state.isAuthenticated).toBe(false);
      expect(state.isLoading).toBe(false);
    });
  });

  describe('setLoading', () => {
    it('should set loading state to true', () => {
      act(() => {
        useAuthStore.getState().setLoading(true);
      });

      expect(useAuthStore.getState().isLoading).toBe(true);
    });

    it('should set loading state to false', () => {
      act(() => {
        useAuthStore.getState().setLoading(true);
        useAuthStore.getState().setLoading(false);
      });

      expect(useAuthStore.getState().isLoading).toBe(false);
    });
  });

  describe('setRefreshing', () => {
    it('should set refreshing state', () => {
      act(() => {
        useAuthStore.getState().setRefreshing(true);
      });

      expect(useAuthStore.getState().isRefreshing).toBe(true);

      act(() => {
        useAuthStore.getState().setRefreshing(false);
      });

      expect(useAuthStore.getState().isRefreshing).toBe(false);
    });
  });

  describe('isTokenExpired', () => {
    it('should return true when no tokenExpiresAt', () => {
      const isExpired = useAuthStore.getState().isTokenExpired();
      expect(isExpired).toBe(true);
    });

    it('should return false when token is not expired', () => {
      act(() => {
        useAuthStore.getState().setTokens('token', 'refresh', 3600); // 1 hour
      });

      const isExpired = useAuthStore.getState().isTokenExpired();
      expect(isExpired).toBe(false);
    });

    it('should return true when token is expired', () => {
      act(() => {
        useAuthStore.setState({
          tokenExpiresAt: Date.now() - 1000, // 1 second ago
        });
      });

      const isExpired = useAuthStore.getState().isTokenExpired();
      expect(isExpired).toBe(true);
    });
  });

  describe('shouldRefreshToken', () => {
    it('should return false when no tokenExpiresAt', () => {
      const shouldRefresh = useAuthStore.getState().shouldRefreshToken();
      expect(shouldRefresh).toBe(false);
    });

    it('should return false when token is fresh', () => {
      act(() => {
        useAuthStore.getState().setTokens('token', 'refresh', 3600); // 1 hour
      });

      const shouldRefresh = useAuthStore.getState().shouldRefreshToken();
      expect(shouldRefresh).toBe(false);
    });

    it('should return true when token expires within 2 minutes', () => {
      act(() => {
        useAuthStore.setState({
          tokenExpiresAt: Date.now() + 60 * 1000, // 1 minute from now
        });
      });

      const shouldRefresh = useAuthStore.getState().shouldRefreshToken();
      expect(shouldRefresh).toBe(true);
    });

    it('should return true when token expires exactly at 2 minutes', () => {
      act(() => {
        useAuthStore.setState({
          tokenExpiresAt: Date.now() + 2 * 60 * 1000, // exactly 2 minutes
        });
      });

      const shouldRefresh = useAuthStore.getState().shouldRefreshToken();
      expect(shouldRefresh).toBe(true);
    });
  });

  describe('setHasHydrated', () => {
    it('should set _hasHydrated state', () => {
      expect(useAuthStore.getState()._hasHydrated).toBe(false);

      act(() => {
        useAuthStore.getState().setHasHydrated(true);
      });

      expect(useAuthStore.getState()._hasHydrated).toBe(true);
    });
  });

  describe('user data', () => {
    it('should store all user properties', () => {
      const fullUser = {
        id: 'full-user-id',
        email: 'full@example.com',
        name: 'Full Name',
        username: 'fulluser',
        avatar: 'https://example.com/avatar.png',
        desiredDirection: 'ROBOTICS',
        role: 'ADMIN',
      };

      act(() => {
        useAuthStore.getState().login(fullUser, 'token', 'refresh', 900);
      });

      const { user } = useAuthStore.getState();
      expect(user?.id).toBe('full-user-id');
      expect(user?.email).toBe('full@example.com');
      expect(user?.name).toBe('Full Name');
      expect(user?.username).toBe('fulluser');
      expect(user?.avatar).toBe('https://example.com/avatar.png');
      expect(user?.desiredDirection).toBe('ROBOTICS');
      expect(user?.role).toBe('ADMIN');
    });

    it('should handle user without optional fields', () => {
      const minimalUser = {
        id: 'minimal-id',
        email: 'minimal@example.com',
        name: 'Minimal',
        username: 'minimal',
      };

      act(() => {
        useAuthStore.getState().login(minimalUser, 'token', 'refresh', 900);
      });

      const { user } = useAuthStore.getState();
      expect(user?.id).toBe('minimal-id');
      expect(user?.avatar).toBeUndefined();
      expect(user?.desiredDirection).toBeUndefined();
      expect(user?.role).toBeUndefined();
    });
  });
});
