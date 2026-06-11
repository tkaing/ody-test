import { Ionicons } from "@expo/vector-icons";
import {
  KeyboardAvoidingView,
  Modal as RNModal,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { colors, fontSize, fontWeight, radius, shadow, spacing } from "@/constants/tokens";

type Props = {
  visible: boolean;
  onClose: () => void;
  title?: string;
  children: React.ReactNode;
  footer?: React.ReactNode;
  size?: "sm" | "md" | "lg";
};

export function Modal({ visible, onClose, title, children, footer, size = "md" }: Props) {
  return (
    <RNModal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
      statusBarTranslucent
    >
      <KeyboardAvoidingView style={styles.overlay} behavior="padding">
        <Pressable style={StyleSheet.absoluteFill} onPress={onClose} />
        <View style={[styles.dialog, sizeStyles[size]]}>
          {title && (
            <View style={styles.header}>
              <Text style={styles.title}>{title}</Text>
              <Pressable
                onPress={onClose}
                style={styles.closeButton}
                accessibilityLabel="Fermer"
                accessibilityRole="button"
              >
                <Ionicons name="close" size={20} color={colors.ui.textSecondary} />
              </Pressable>
            </View>
          )}
          <ScrollView
            style={styles.body}
            contentContainerStyle={styles.bodyContent}
            keyboardShouldPersistTaps="handled"
          >
            {children}
          </ScrollView>
          {footer && <View style={styles.footer}>{footer}</View>}
        </View>
      </KeyboardAvoidingView>
    </RNModal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.4)",
    justifyContent: "center",
    alignItems: "center",
    padding: spacing[6],
  },
  dialog: {
    backgroundColor: colors.ui.surface,
    borderRadius: radius.xl,
    ...shadow.lg,
    maxHeight: "85%",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: spacing[6],
    paddingTop: spacing[6],
    paddingBottom: spacing[4],
    borderBottomWidth: 1,
    borderBottomColor: colors.ui.border,
  },
  title: {
    fontSize: fontSize.lg,
    fontWeight: fontWeight.semibold,
    color: colors.ui.textPrimary,
    flex: 1,
  },
  closeButton: {
    padding: spacing[1],
    marginLeft: spacing[3],
    borderRadius: radius.md,
  },
  body: {
    flexShrink: 1,
  },
  bodyContent: {
    padding: spacing[6],
    gap: spacing[4],
  },
  footer: {
    flexDirection: "row",
    justifyContent: "flex-end",
    gap: spacing[3],
    paddingHorizontal: spacing[6],
    paddingBottom: spacing[6],
    paddingTop: spacing[4],
    borderTopWidth: 1,
    borderTopColor: colors.ui.border,
  },
});

const sizeStyles = StyleSheet.create({
  sm: { width: 400 },
  md: { width: 560 },
  lg: { width: 720 },
});
