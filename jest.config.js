const nextJest = require('next/jest');

const createJestConfig = nextJest({
  // Provide the path to your Next.js app to load next.config.js and .env files
  dir: './',
});

const ignoredArtifacts = [
  '<rootDir>/.next/',
  '<rootDir>/.netlify/',
  '<rootDir>/.worktrees/',
  '<rootDir>/coverage/',
  '<rootDir>/playwright-report/',
  '<rootDir>/test-results/',
];

// Add any custom config to be passed to Jest
const customJestConfig = {
  setupFilesAfterEnv: ['<rootDir>/jest.setup.ts'],
  moduleNameMapper: {
    // Handle module aliases (this will be automatically configured for you based on your tsconfig.json paths)
    '^@/(.*)$': '<rootDir>/$1',
    '^until-async$': '<rootDir>/tests/shims/until-async.js',
  },
  testEnvironment: 'jest-environment-jsdom',
  testMatch: [
    '<rootDir>/tests/**/*.test.{js,jsx,ts,tsx}',
    '<rootDir>/tests/**/*.spec.{js,jsx,ts,tsx}',
    '<rootDir>/lib/**/__tests__/**/*.{js,jsx,ts,tsx}',
  ],
  testPathIgnorePatterns: [
    '<rootDir>/tests/e2e/',
    '<rootDir>/node_modules/',
    ...ignoredArtifacts,
  ],
  modulePathIgnorePatterns: ignoredArtifacts,
  watchPathIgnorePatterns: ignoredArtifacts,
  coveragePathIgnorePatterns: [
    '<rootDir>/tests/e2e/',
    ...ignoredArtifacts,
  ],
  coverageReporters: ['text', 'lcov', 'clover', 'json-summary'],
  coverageThreshold: {
    global: {
      statements: 5,
      lines: 5,
      functions: 0,
      branches: 0,
    },
  },
  transformIgnorePatterns: [
    'node_modules/(?!(@sentry|uuid|nanoid|msw|until-async|@open-draft|headers-polyfill|is-node-process|strict-event-emitter|outvariant)/)',
  ],
  testEnvironmentOptions: {
    url: 'http://localhost:3000',
  },
  moduleFileExtensions: ['ts', 'tsx', 'js', 'jsx', 'json', 'node'],
  collectCoverageFrom: [
    'pages/**/*.{js,jsx,ts,tsx}',
    'components/**/*.{js,jsx,ts,tsx}',
    'lib/**/*.{js,jsx,ts,tsx}',
    '!**/*.d.ts',
    '!**/node_modules/**',
    '!**/.next/**',
    '!**/coverage/**',
    '!**/.worktrees/**',
    '!**/jest.config.js',
  ],
};

// createJestConfig is exported this way to ensure that next/jest can load the Next.js config which is async
module.exports = createJestConfig(customJestConfig);
