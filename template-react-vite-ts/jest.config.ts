import type { Config } from '@jest/types';

const config: Config.InitialOptions = {
  roots: ['<rootDir>/src/', '<rootDir>/tests/'],
  verbose: true,
  testEnvironment: 'jsdom',
  testMatch: ['<rootDir>/tests/**/*.test.tsx'],
  transform: {
    '.+\\.(ts|tsx)$': 'babel-jest',
  },
  setupFilesAfterEnv: ['<rootDir>/setupAfterEnv.ts'],
  moduleNameMapper: {
    '@components/(.*)': '<rootDir>/src/components/$1',
    '@helpers/(.*)': '<rootDir>/src/helpers/$1',
    '@hooks/(.*)': '<rootDir>/src/hooks/$1',
    '@constants': '<rootDir>/src/constants.ts',
    '@utils': '<rootDir>/src/utils.ts',
  },
};

export default config;
