/**
 * Jest Test Setup
 *
 * This file runs before each test file.
 * Use it to set up global test configuration.
 */

import dotenv from 'dotenv';

// Load test environment variables
dotenv.config({ path: '.env.test' });

// Set test environment
process.env.NODE_ENV = 'test';
process.env.JWT_SECRET = 'test-jwt-secret-for-testing-only-min-32-chars';
process.env.JWT_EXPIRES_IN = '1h';

// Increase timeout for async operations
jest.setTimeout(10000);

// Global beforeAll
beforeAll(() => {
  // Suppress console.log during tests (optional)
  // jest.spyOn(console, 'log').mockImplementation(() => {});
});

// Global afterAll
afterAll(async () => {
  // Clean up any resources
});

// Custom matchers (optional)
expect.extend({
  toBeWithinRange(received: number, floor: number, ceiling: number) {
    const pass = received >= floor && received <= ceiling;
    if (pass) {
      return {
        message: () =>
          `expected ${received} not to be within range ${floor} - ${ceiling}`,
        pass: true,
      };
    } else {
      return {
        message: () =>
          `expected ${received} to be within range ${floor} - ${ceiling}`,
        pass: false,
      };
    }
  },
});

// Type declaration for custom matchers
declare global {
  // eslint-disable-next-line @typescript-eslint/no-namespace
  namespace jest {
    interface Matchers<R> {
      toBeWithinRange(floor: number, ceiling: number): R;
    }
  }
}
