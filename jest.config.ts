/** @type {import('ts-jest/dist/types').InitialOptionsTsJest} */
export default {
  preset: "ts-jest",
  testEnvironment: "node",
  setupFilesAfterEnv: ["@relmify/jest-fp-ts"],
}
