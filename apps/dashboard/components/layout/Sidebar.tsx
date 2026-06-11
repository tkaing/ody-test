import { Ionicons } from "@expo/vector-icons";
import { Link, usePathname } from "expo-router";
import { StyleSheet, Text, View } from "react-native";
import { colors, fontSize, fontWeight, layout, radius, spacing } from "@/constants/tokens";

type NavItem = {
  label: string;
  href: string;
  icon: keyof typeof Ionicons.glyphMap;
  iconActive: keyof typeof Ionicons.glyphMap;
};

const NAV_ITEMS: NavItem[] = [
  { label: "Accueil", href: "/(app)/home", icon: "home-outline", iconActive: "home" },
  { label: "Commandes", href: "/(app)/orders", icon: "receipt-outline", iconActive: "receipt" },
  { label: "CRM", href: "/(app)/crm", icon: "people-outline", iconActive: "people" },
  { label: "Menu", href: "/(app)/menu", icon: "restaurant-outline", iconActive: "restaurant" },
  { label: "Paramètres", href: "/(app)/settings", icon: "settings-outline", iconActive: "settings" },
];

export function Sidebar() {
  const pathname = usePathname();

  return (
    <View style={styles.container}>
      <View style={styles.logoContainer}>
        <Text style={styles.logoText}>Ody</Text>
        <Text style={styles.logoSubtext}>Dashboard</Text>
      </View>

      <View style={styles.nav}>
        {NAV_ITEMS.map((item) => {
          const isActive = pathname.startsWith(item.href.replace("/(app)", ""));
          return (
            <Link key={item.href} href={item.href as never} style={styles.linkWrapper}>
              <View style={[styles.navItem, isActive && styles.navItemActive]}>
                <Ionicons
                  name={isActive ? item.iconActive : item.icon}
                  size={18}
                  color={isActive ? colors.ui.sidebarActive : colors.ui.sidebarText}
                  style={styles.navIcon}
                />
                <Text style={[styles.navLabel, isActive && styles.navLabelActive]}>
                  {item.label}
                </Text>
              </View>
            </Link>
          );
        })}
      </View>

      <View style={styles.footer}>
        <Link href="/(app)/ui-library" style={styles.linkWrapper}>
          <View style={styles.devLink}>
            <Ionicons name="color-palette-outline" size={14} color={colors.ui.sidebarText} />
            <Text style={styles.devLinkText}>UI Library</Text>
          </View>
        </Link>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: layout.sidebarWidth,
    backgroundColor: colors.ui.sidebarBg,
    paddingVertical: spacing[6],
    flexShrink: 0,
  },
  logoContainer: {
    paddingHorizontal: spacing[6],
    marginBottom: spacing[8],
  },
  logoText: {
    fontSize: fontSize["2xl"],
    fontWeight: fontWeight.bold,
    color: colors.ui.sidebarActive,
    letterSpacing: -0.5,
  },
  logoSubtext: {
    fontSize: fontSize.xs,
    fontWeight: fontWeight.medium,
    color: colors.ui.sidebarText,
    textTransform: "uppercase",
    letterSpacing: 1,
  },
  nav: {
    flex: 1,
    gap: spacing[0.5],
    paddingHorizontal: spacing[3],
  },
  linkWrapper: {
    textDecorationLine: "none",
  },
  navItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: spacing[2],
    paddingHorizontal: spacing[3],
    borderRadius: radius.md,
    gap: spacing[3],
  },
  navItemActive: {
    backgroundColor: colors.ui.sidebarActiveBg,
  },
  navIcon: {
    width: 18,
  },
  navLabel: {
    fontSize: fontSize.sm,
    fontWeight: fontWeight.medium,
    color: colors.ui.sidebarText,
  },
  navLabelActive: {
    color: colors.ui.sidebarActive,
    fontWeight: fontWeight.semibold,
  },
  footer: {
    paddingHorizontal: spacing[6],
    paddingTop: spacing[4],
    borderTopWidth: 1,
    borderTopColor: colors.neutral[800],
  },
  devLink: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing[2],
  },
  devLinkText: {
    fontSize: fontSize.xs,
    color: colors.ui.sidebarText,
    fontWeight: fontWeight.medium,
  },
});
