import "@testing-library/jest-dom";
import { vi } from "vitest";

vi.mock("@expo/vector-icons", () => ({
  Ionicons: () => null,
}));

vi.mock("expo-router", () => ({
  Link: ({ children }: { children: React.ReactNode }) => children,
  usePathname: () => "/home",
  Redirect: () => null,
  Slot: () => null,
  Stack: () => null,
}));

vi.mock("expo-constants", () => ({
  default: { expoConfig: {} },
}));
