import react from "@vitejs/plugin-react";
import path from "path";
import { defineConfig } from "vitest/config";

export default defineConfig({
  plugins: [react()],
  test: {
    environment: "jsdom",
    globals: true,
    setupFiles: ["./vitest.setup.ts"],
    server: {
      deps: {
        inline: [/react-native-web/],
      },
    },
  },
  resolve: {
    alias: {
      "react-native": "react-native-web",
      "@": path.resolve(__dirname, "."),
      "@ody/types": path.resolve(__dirname, "../../packages/types/src/index.ts"),
      "@ody/shared": path.resolve(__dirname, "../../packages/shared/src/index.ts"),
    },
  },
});
