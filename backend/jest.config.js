/** @type {import('ts-jest').JestConfigWithTsJest} */
module.exports = {
  preset: "ts-jest",
  testEnvironment: "node",
  rootDir: "src",
  moduleFileExtensions: ["js", "json", "ts"],
  testRegex: ".*\\.spec\\.ts$",
  transform: {
    "^.+\\.ts$": [
      "ts-jest",
      {
        tsconfig: "<rootDir>/../tsconfig.json",
        isolatedModules: true,
        useESM: false,
        diagnostics: {
          ignoreCodes: [151001],
        },
      },
    ],
  },
  collectCoverageFrom: [
    "**/*.ts",
    "!**/*.dto.ts",
    "!**/*.entity.ts",
    "!**/*.module.ts",
    "!**/*.controller.ts",
  ],
  coverageDirectory: "../coverage",
  moduleNameMapper: {
    "^@stashy/shared$": ["<rootDir>/../../shared/dist", "<rootDir>/../../shared/src"],
    "^@stashy/shared/(.*)$": ["<rootDir>/../../shared/dist/$1", "<rootDir>/../../shared/src/$1"],
  },
  globalSetup: "<rootDir>/test/global-setup.ts",
  globalTeardown: "<rootDir>/test/global-teardown.ts",
  testTimeout: 30000,
  setupFilesAfterEnv: ["<rootDir>/test/jest-setup.ts"],
};
