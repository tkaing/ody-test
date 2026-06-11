import { defineConfig } from "orval";

export default defineConfig({
  ody: {
    input: {
      target: "../../services/backend/openapi.json",
    },
    output: {
      mode: "tags-split",
      target: "./src/generated",
      schemas: "./src/model",
      client: "react-query",
      httpClient: "axios",
      clean: true,
      override: {
        mutator: {
          path: "./src/axios-instance.ts",
          name: "axiosInstance",
        },
      },
    },
  },
});
