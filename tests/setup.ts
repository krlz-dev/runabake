/**
 * Vitest setup file
 * Runs before all tests
 */

// Mock browser APIs if needed
global.performance = global.performance || {
  now: () => Date.now(),
};

// Add custom matchers or global test utilities here
