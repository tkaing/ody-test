import { Ionicons } from "@expo/vector-icons";
import { createContext, useCallback, useContext, useEffect, useRef, useState } from "react";
import { Animated, Pressable, StyleSheet, Text, View } from "react-native";
import { colors, fontSize, fontWeight, radius, shadow, spacing } from "@/constants/tokens";

type ToastVariant = "success" | "error" | "warning" | "info";

type ToastItem = {
  id: string;
  message: string;
  variant: ToastVariant;
};

type ToastContextValue = {
  show: (message: string, variant?: ToastVariant) => void;
};

const ToastContext = createContext<ToastContextValue>({ show: () => {} });

export function useToast() {
  return useContext(ToastContext);
}

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<ToastItem[]>([]);
  const idRef = useRef(0);

  const dismiss = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const show = useCallback((message: string, variant: ToastVariant = "info") => {
    const id = String(++idRef.current);
    setToasts((prev) => [...prev, { id, message, variant }]);
    setTimeout(() => { dismiss(id); }, 4000);
  }, [dismiss]);

  return (
    <ToastContext.Provider value={{ show }}>
      {children}
      <View style={styles.container} pointerEvents="box-none">
        {toasts.map((toast) => (
          <ToastItem key={toast.id} toast={toast} onDismiss={() => { dismiss(toast.id); }} />
        ))}
      </View>
    </ToastContext.Provider>
  );
}

function ToastItem({ toast, onDismiss }: { toast: ToastItem; onDismiss: () => void }) {
  const translateY = useRef(new Animated.Value(-20)).current;
  const opacity = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(translateY, { toValue: 0, duration: 200, useNativeDriver: true }),
      Animated.timing(opacity, { toValue: 1, duration: 200, useNativeDriver: true }),
    ]).start();
  }, [translateY, opacity]);

  const config = TOAST_CONFIG[toast.variant];

  return (
    <Animated.View style={[styles.toast, config.style, { opacity, transform: [{ translateY }] }]}>
      <Ionicons name={config.icon} size={16} color={config.iconColor} />
      <Text style={[styles.message, { color: config.textColor }]} numberOfLines={3}>
        {toast.message}
      </Text>
      <Pressable onPress={onDismiss} style={styles.closeBtn} accessibilityLabel="Fermer">
        <Ionicons name="close" size={14} color={config.textColor} />
      </Pressable>
    </Animated.View>
  );
}

const TOAST_CONFIG: Record<
  ToastVariant,
  {
    style: object;
    icon: keyof typeof Ionicons.glyphMap;
    iconColor: string;
    textColor: string;
  }
> = {
  success: {
    style: { backgroundColor: colors.semantic.success.bg, borderColor: colors.semantic.success.border },
    icon: "checkmark-circle",
    iconColor: colors.semantic.success.icon,
    textColor: colors.semantic.success.text,
  },
  error: {
    style: { backgroundColor: colors.semantic.error.bg, borderColor: colors.semantic.error.border },
    icon: "alert-circle",
    iconColor: colors.semantic.error.icon,
    textColor: colors.semantic.error.text,
  },
  warning: {
    style: { backgroundColor: colors.semantic.warning.bg, borderColor: colors.semantic.warning.border },
    icon: "warning",
    iconColor: colors.semantic.warning.icon,
    textColor: colors.semantic.warning.text,
  },
  info: {
    style: { backgroundColor: colors.semantic.info.bg, borderColor: colors.semantic.info.border },
    icon: "information-circle",
    iconColor: colors.semantic.info.icon,
    textColor: colors.semantic.info.text,
  },
};

const styles = StyleSheet.create({
  container: {
    position: "absolute",
    top: spacing[6],
    right: spacing[6],
    gap: spacing[2],
    zIndex: 9999,
    maxWidth: 380,
  },
  toast: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: spacing[3],
    paddingHorizontal: spacing[4],
    paddingVertical: spacing[3],
    borderRadius: radius.lg,
    borderWidth: 1,
    ...shadow.md,
  },
  message: {
    flex: 1,
    fontSize: fontSize.sm,
    fontWeight: fontWeight.medium,
    lineHeight: 20,
  },
  closeBtn: {
    padding: spacing[0.5],
    marginTop: 1,
  },
});
