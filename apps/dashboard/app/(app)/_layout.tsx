import { Slot } from "expo-router";
import { StyleSheet, View } from "react-native";
import { Sidebar } from "@/components/layout/Sidebar";
import { colors } from "@/constants/tokens";

export default function AppLayout() {
  return (
    <View style={styles.container}>
      <Sidebar />
      <View style={styles.content}>
        <Slot />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    flexDirection: "row",
    backgroundColor: colors.ui.background,
  },
  content: {
    flex: 1,
    overflow: "hidden",
  },
});
