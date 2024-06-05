import type { Config } from '@jest/types';

const config: Config.InitialOptions = {
  rootDir: __dirname,
  preset: 'ts-jest',
  testEnvironment: 'jsdom',
  testMatch: ['**/src/tests/unit/**/*.test.ts'],
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/src/$1',
  },
  transform: {
    '^.+\\.tsx?$': 'babel-jest',
    '^.+\\.js?$': 'babel-jest',
    '^.+\\.module.js$': 'jest-transform-stub',
  },
  transformIgnorePatterns: [
    "node_modules/(?!(htm)/)"
  ],
  moduleFileExtensions: ["ts", "tsx", "js", "jsx", "json", "node"]
};

export default config;