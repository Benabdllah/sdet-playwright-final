/**
 * ============================================================================
 * ULTIMATE SDET JEST CONFIGURATION (FINAL) +++++
 * ============================================================================
 * Comprehensive Jest configuration for Software Development Engineer in Test
 * Integrated with Playwright, Cucumber, API testing, and coverage analysis
 * Production-ready with advanced features and best practices
 * ============================================================================
 */

module.exports = {
  // ============================================================================
  // PROJECT CONFIGURATION
  // ============================================================================
  
  /** Display name for the test suite */
  displayName: 'SDET-PW-Practice',

  /** Test environment - node for API tests, jsdom for browser simulation */
  testEnvironment: 'node',

  /** Root directory for test resolution */
  rootDir: '../../',

  /** Project root directory */
  roots: ['<rootDir>/src', '<rootDir>/scripts'],

  /** Module name mapper for path aliases */
  moduleNameMapper: {
    '^@api/(.*)$': '<rootDir>/src/api/$1',
    '^@components/(.*)$': '<rootDir>/src/components/$1',
    '^@config/(.*)$': '<rootDir>/src/config/$1',
    '^@constants/(.*)$': '<rootDir>/src/constants/$1',
    '^@data/(.*)$': '<rootDir>/src/data/$1',
    '^@fixtures/(.*)$': '<rootDir>/src/fixtures/$1',
    '^@helpers/(.*)$': '<rootDir>/src/helpers/$1',
    '^@pages/(.*)$': '<rootDir>/src/pages/$1',
    '^@types/(.*)$': '<rootDir>/src/types/$1',
    '^@utils/(.*)$': '<rootDir>/src/utils/$1',
    '^@tests/(.*)$': '<rootDir>/src/tests/$1',
  },

  /** Module file extensions */
  moduleFileExtensions: [
    'ts',
    'tsx',
    'js',
    'jsx',
    'json',
    'node',
    'mjs',
  ],

  // ============================================================================
  // TRANSFORMER CONFIGURATION
  // ============================================================================

  /** TypeScript transformer configuration */
  transform: {
    '^.+\\.tsx?$': ['ts-jest', {
      tsconfig: '<rootDir>/tsconfig.build.json',
      isolatedModules: true,
      babelConfig: '<rootDir>/.babelrc',
    }],
  },

  /** Files to not transform */
  transformIgnorePatterns: [
    'node_modules/(?!(@playwright|@cucumber|@babel|@angular|@types)/)',
    String.raw`\.pnp\.js$`,
  ],

  // ============================================================================
  // TEST EXECUTION CONFIGURATION
  // ============================================================================

  /** Test file patterns - ONLY unit and API tests, NOT Playwright E2E tests */
  testMatch: [
    '<rootDir>/src/tests/unit/**/*.{spec,test}.{js,jsx,ts,tsx}',
    '<rootDir>/src/tests/api/**/*.{spec,test}.{js,jsx,ts,tsx}',
    '<rootDir>/src/**/__tests__/**/*.{js,jsx,ts,tsx}',
  ],

  /** Test path ignore patterns - exclude Playwright E2E tests */
  testPathIgnorePatterns: [
    '/node_modules/',
    '<rootDir>/src/tests/e2e/',           // 🚫 Playwright E2E tests
    '<rootDir>/src/tests/features/',       // 🚫 Cucumber BDD features
    '<rootDir>/src/tests/integration/',    // 🚫 Integration tests
    '<rootDir>/src/tests/visual/',         // 🚫 Visual regression
    '<rootDir>/src/tests/performance/',    // 🚫 Performance tests
    '<rootDir>/src/tests/security/',       // 🚫 Security tests
    '<rootDir>/src/tests/accessibility/',  // 🚫 Accessibility tests
  ],

  /** Test timeout in milliseconds */
  testTimeout: 30000,

  /** Jest bail on first failure */
  bail: process.env.CI ? 1 : 0,

  /** Verbose output */
  verbose: true,

  /** Detect open handles (node processes) */
  detectOpenHandles: true,

  /** Force exit after test suite finishes */
  forceExit: false,

  /** Number of workers for parallel execution */
  maxWorkers: process.env.CI ? '1' : '50%',

  // ============================================================================
  // SETUP & TEARDOWN
  // ============================================================================

  /** Setup files after environment */
  setupFilesAfterEnv: [
    '<rootDir>/config/jest/setup.ts',
    '<rootDir>/config/jest/matchers.ts',
  ],

  /** Setup files */
  setupFiles: [
    '<rootDir>/config/jest/envSetup.ts',
  ],

  /** Global setup file */
  globalSetup: '<rootDir>/config/jest/globalSetup.ts',

  /** Global teardown file */
  globalTeardown: '<rootDir>/config/jest/globalTeardown.ts',

  // ============================================================================
  // COVERAGE CONFIGURATION
  // ============================================================================

  /** Collect coverage metrics */
  collectCoverage: process.env.COVERAGE === 'true',

  /** Coverage directory */
  coverageDirectory: '<rootDir>/test-results/coverage',

  /** Coverage reporters */
  coverageReporters: [
    'text',
    'text-summary',
    'lcov',
    'html',
    'json',
    'json-summary',
    'cobertura',
    'clover',
  ],

  /** Coverage path ignore patterns */
  coveragePathIgnorePatterns: [
    '/node_modules/',
    '/dist/',
    '/build/',
    String.raw`\.config\.`,
    'jest.config',
    'webpack.config',
    '__mocks__',
    '__fixtures__',
    '__tests__',
    String.raw`\.d\.ts$`,
  ],

  /** Coverage thresholds */
  coverageThreshold: {
    global: {
      branches: 60,
      functions: 60,
      lines: 60,
      statements: 60,
    },
    './src/api/': {
      branches: 70,
      functions: 70,
      lines: 70,
      statements: 70,
    },
    './src/utils/': {
      branches: 80,
      functions: 80,
      lines: 80,
      statements: 80,
    },
  },

  // ============================================================================
  // TESTING LIBRARIES CONFIGURATION
  // ============================================================================

  /** Test path whitelist patterns */
  testPathWhitelist: [
    '<rootDir>/src/',
  ],

  // ============================================================================
  // WATCH MODE CONFIGURATION
  // ============================================================================

  /** Watch plugins for watch mode */
  watchPlugins: [
    'jest-watch-typeahead/filename',
    'jest-watch-typeahead/testname',
  ],

  /** Notify mode for watch */
  notify: true,

  /** Notify threshold */
  notifyMode: 'failure-change',

  // ============================================================================
  // REPORTER CONFIGURATION
  // ============================================================================

  /** Reporters */
  reporters: [
    'default',
    [
      'jest-junit',
      {
        outputDirectory: '<rootDir>/test-results/junit',
        outputName: 'junit.xml',
        classNameTemplate: '{classname}',
        titleTemplate: '{title}',
        ancestorSeparator: ' › ',
        usePathAsClassName: true,
        suiteName: 'SDET Jest Tests',
      },
    ],
    [
      'jest-html-reporters',
      {
        publicPath: '<rootDir>/test-results/jest-html',
        filename: 'index.html',
        pageTitle: 'SDET Jest Test Report',
        expand: true,
        openReport: false,
      },
    ],
    [
      'jest-allure',
      {
        outputPath: '<rootDir>/allure-results',
        resultDir: '<rootDir>/allure-results',
        useHash: true,
        suiteTitle: true,
      },
    ],
  ],

  // ============================================================================
  // SNAPSHOT CONFIGURATION
  // ============================================================================

  /** Snapshot serializers */
  snapshotSerializers: [
    'jest-serializer-html',
  ],

  /** Update snapshots flag */
  updateSnapshot: process.env.UPDATE_SNAPSHOTS === 'true',

  /** Snapshot format options */
  snapshotFormat: {
    printBasicPrototype: false,
    escapeString: false,
    printFunctionName: true,
  },

  // ============================================================================
  // ENVIRONMENT VARIABLES & GLOBALS
  // ============================================================================

  /** Environment variables */
  preset: 'ts-jest',

  // ============================================================================
  // ADVANCED OPTIONS
  // ============================================================================

  /** Clear mocks between tests */
  clearMocks: true,

  /** Restore mocks between tests */
  restoreMocks: true,

  /** Reset mocks between tests */
  resetMocks: true,

  /** Reset modules between tests */
  resetModules: true,

  /** Restore all mocks between tests */
  restoreAllMocks: true,

  /** Custom test environment */
  testEnvironmentOptions: {
    NODE_ENV: 'test',
    url: process.env.BASE_URL || 'http://localhost:3000',
  },

  /** Error on deprecated APIs */
  errorOnDeprecated: true,

  /** Expand expected/received in snapshots */
  expand: true,

  // ============================================================================
  // CI/CD SPECIFIC CONFIGURATION
  // ============================================================================

  ...(process.env.CI && {
    ci: true,
    maxWorkers: 1,
    bail: 1,
    testTimeout: 60000,
  }),

  // ============================================================================
  // CONSOLE OUTPUT CONFIGURATION
  // ============================================================================

  /** Silence logs below specific level in jest */
  logHeapUsage: true,

  // ============================================================================
  // ADDITIONAL PROJECT SETTINGS
  // ============================================================================

  /** Collect coverage from ignored files */
  collectCoverageFrom: [
    'src/**/*.{ts,tsx,js,jsx}',
    '!src/**/*.d.ts',
    '!src/**/__tests__/**',
    '!src/**/__mocks__/**',
    '!src/**/index.ts',
    '!src/**/*.spec.ts',
    '!src/**/*.test.ts',
    '!src/**/*.stories.ts',
    '!src/**/fixtures/**',
  ],

  /** Jest cache directory */
  cacheDirectory: '<rootDir>/.jest-cache',
};
