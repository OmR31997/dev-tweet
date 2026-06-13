import type { Config } from "jest";

const config: Config = {
  testEnvironment: "jsdom",
  setupFilesAfterEnv: ["<rootDir>/jest.setup.ts"],
  testMatch: [
    "<rootDir>/src/**/__tests__/**/*.(test|spec).[jt]s?(x)",
    "<rootDir>/src/**/*.(test|spec).[jt]s?(x)",
  ],
  testPathIgnorePatterns: ["/node_modules/", "/.next/", "/out/"],
  moduleNameMapper: {
    "^@/(.*)$": "<rootDir>/src/$1",
    "\\.(css|less|scss|sass)$": "<rootDir>/src/__mocks__/styleMock.ts",
  },
  transform: {
    "^.+\\.(ts|tsx|js|jsx)$": [
      "babel-jest",
      { presets: ["next/babel"] },
    ],
  },
  collectCoverageFrom: [
    "src/**/*.{ts,tsx}",
    "!src/**/*.d.ts",
    "!src/**/__mocks__/**",
  ],
  coverageDirectory: "coverage",
};

export default config;
