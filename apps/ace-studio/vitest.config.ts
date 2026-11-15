/** @module vitest-config @remarks Pure boundary tests run without a GPU or browser. @internal */
import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    environment: "node",
    include: ["tests/unit/**/*.test.ts"],
    isolate: true,
    clearMocks: true
  }
});
