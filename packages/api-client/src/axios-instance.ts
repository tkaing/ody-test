import axios from "axios";
import type { AxiosRequestConfig } from "axios";

const API_BASE_URL = process.env["EXPO_PUBLIC_API_URL"] ?? "http://localhost:8787";

const instance = axios.create({
  baseURL: API_BASE_URL,
  headers: { "Content-Type": "application/json" },
});

export const axiosInstance = <T>(config: AxiosRequestConfig): Promise<T> => {
  return instance(config).then((res) => res.data as T);
};
