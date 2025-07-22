/** @type {import('jest').Config} */
module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  roots: ['<rootDir>/src', '<rootDir>/tests'],
  moduleFileExtensions: ['ts', 'js', 'json'],
  testMatch: ['**/*.test.ts'],
  collectCoverageFrom: ['src/**/*.{ts,js}'],
  coverageDirectory: 'coverage',
  verbose: true,
}; 