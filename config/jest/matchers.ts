/**
 * ============================================================================
 * JEST CUSTOM MATCHERS
 * ============================================================================
 * Define custom Jest matchers for SDET testing
 */
import { expect } from '@jest/globals';
expect.extend({
  /**
   * Check if value is a valid URL
   */
  toBeValidUrl(received: any) {
    try {
      new URL(received);
      return {
        pass: true,
        message: () => `expected ${received} not to be a valid URL`,
      };
    } catch {
      return {
        pass: false,
        message: () => `expected ${received} to be a valid URL`,
      };
    }
  },

  /**
   * Check if value is a valid email
   */
  toBeValidEmail(received: any) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const pass = emailRegex.test(received);
    return {
      pass,
      message: () =>
        pass
          ? `expected ${received} not to be a valid email`
          : `expected ${received} to be a valid email`,
    };
  },

  /**
   * Check if array contains object with matching properties
   */
  toContainObject(
    received: Record<string, any>[],
    expected: Record<string, any>
  ) {
    const pass = received.some((item) => {
      return Object.keys(expected).every((key) => {
        return item[key] === expected[key];
      });
    });

    return {
      pass,
      message: () =>
        pass
          ? `expected array not to contain object matching ${JSON.stringify(expected)}`
          : `expected array to contain object matching ${JSON.stringify(expected)}`,
    };
  },

  /**
   * Check if number is within range
   */
  toBeWithinRange(received: any, floor: number, ceiling: number) {
    const pass = received >= floor && received <= ceiling;
    return {
      pass,
      message: () =>
        pass
          ? `expected ${received} not to be within range ${floor} - ${ceiling}`
          : `expected ${received} to be within range ${floor} - ${ceiling}`,
    };
  },

  /**
   * Check if object has property with value
   */
  toHavePropertyWithValue(received: any, property: string, value: any) {
    const pass = received[property] === value;
    return {
      pass,
      message: () =>
        pass
          ? `expected ${JSON.stringify(received)} not to have ${property} equal to ${value}`
          : `expected ${JSON.stringify(received)} to have ${property} equal to ${value}`,
    };
  },

  /**
   * Check if array includes all values
   */
  toIncludeAllValues(received: any[], expected: any[]) {
    const pass = expected.every((item) => received.includes(item));
    return {
      pass,
      message: () =>
        pass
          ? `expected array not to include all values from ${JSON.stringify(expected)}`
          : `expected array to include all values from ${JSON.stringify(expected)}`,
    };
  },

  /**
   * Check if string matches pattern with flags
   */
  toMatchPattern(received: string, pattern: RegExp) {
    const pass = pattern.test(received);
    return {
      pass,
      message: () =>
        pass
          ? `expected ${received} not to match pattern ${pattern}`
          : `expected ${received} to match pattern ${pattern}`,
    };
  },

  /**
   * Check if promise rejects with error message
   */
  async toRejectWithMessage(
    promise: Promise<any>,
    expectedMessage: string
  ) {
    try {
      await promise;
      return {
        pass: false,
        message: () => `expected promise to reject`,
      };
    } catch (error: any) {
      const errorMessage = error?.message || String(error);
      const pass = errorMessage.includes(expectedMessage);
      return {
        pass,
        message: () =>
          pass
            ? `expected promise not to reject with message containing ${expectedMessage}`
            : `expected promise to reject with message containing ${expectedMessage}, but got ${errorMessage}`,
      };
    }
  },

  /**
   * Check if object is deeply frozen
   */
  toBeDeepFrozen(received: any) {
    const isDeepFrozen = (obj: any): boolean => {
      if (!Object.isFrozen(obj)) {
        return false;
      }
      for (const key in obj) {
        if (obj.hasOwnProperty(key) && typeof obj[key] === 'object') {
          if (!isDeepFrozen(obj[key])) {
            return false;
          }
        }
      }
      return true;
    };

    const pass = isDeepFrozen(received);
    return {
      pass,
      message: () =>
        pass
          ? `expected object not to be deep frozen`
          : `expected object to be deep frozen`,
    };
  },

  /**
   * Check if function was called with specific arguments (async-safe)
   */
  toHaveBeenCalledWithAsync(
    received: jest.Mock,
    ...expectedArgs: any[]
  ) {
    const calls = received.mock.calls;
    const pass = calls.some((call) => {
      return expectedArgs.every((arg, index) => {
        return JSON.stringify(call[index]) === JSON.stringify(arg);
      });
    });

    return {
      pass,
      message: () =>
        pass
          ? `expected mock not to have been called with ${JSON.stringify(expectedArgs)}`
          : `expected mock to have been called with ${JSON.stringify(expectedArgs)}`,
    };
  },

  /**
   * Check if performance metric is within threshold
   */
  toMeetPerformanceThreshold(received: number, threshold: number) {
    const pass = received <= threshold;
    return {
      pass,
      message: () =>
        pass
          ? `expected ${received}ms not to meet performance threshold of ${threshold}ms`
          : `expected ${received}ms to meet performance threshold of ${threshold}ms`,
    };
  },
});

export {};
