import { defineConfig } from "vitest/config";
import react from "@vitejs/plugin-react";
import tsconfigPaths from "vite-tsconfig-paths";

export default defineConfig({
  plugins: [react(), tsconfigPaths()],
  test: {
    // Unit/integration suites live under test/. E2E specs live under e2e/ and
    // are driven by Playwright (playwright.config.ts), not Vitest — scope the
    // include so the two runners never pick up each other's files.
    include: ["test/**/*.{test,spec}.{ts,tsx}"],
    environment: "jsdom",
    setupFiles: ["./test/setup.ts"],
    globals: true,
    server: {
      deps: {
        inline: ["zod"],
      },
    },
  },
});
