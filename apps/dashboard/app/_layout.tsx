import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Stack } from "expo-router";
import React from "react";
import { ToastProvider } from "@/components/ui";

// Patch SSR : useLayoutEffect de @react-navigation/core ne fonctionne pas
// côté serveur avec Expo Router static output — on le remplace par useEffect.
if (typeof document === "undefined") {
  React.useLayoutEffect = React.useEffect;
}

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 30,
      retry: 1,
    },
  },
});

export default function RootLayout() {
  return (
    <QueryClientProvider client={queryClient}>
      <ToastProvider>
        <Stack screenOptions={{ headerShown: false }} />
      </ToastProvider>
    </QueryClientProvider>
  );
}
