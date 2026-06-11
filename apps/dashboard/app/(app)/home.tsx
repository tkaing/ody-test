import { ScrollView, StyleSheet, Text, View } from "react-native";
import { useGetHomeSummary } from "@ody/api-client";
import { formatPrice } from "@ody/shared";
import { KpiCard } from "@/components/home/KpiCard";
import { PopularItemsList } from "@/components/home/PopularItemsList";
import { Card } from "@/components/ui";
import { ErrorState, LoadingState } from "@/components/states";
import { colors, spacing, fontSize, fontWeight } from "@/constants/tokens";

export default function HomeScreen() {
  const { data, isLoading, isError, refetch } = useGetHomeSummary();

  if (isLoading) return <LoadingState message="Chargement des KPIs…" />;
  if (isError) return <ErrorState onRetry={() => { void refetch(); }} />;

  return (
    <ScrollView
      style={styles.scroll}
      contentContainerStyle={styles.container}
    >
      <Text style={styles.pageTitle}>Tableau de bord</Text>

      <View style={styles.kpiGrid}>
        <KpiCard
          label="Commandes totales"
          value={String(data?.totalOrders ?? 0)}
          icon="receipt-outline"
          iconColor={colors.ui.interactive}
        />
        <KpiCard
          label="Chiffre d'affaires"
          value={formatPrice(data?.revenue ?? 0)}
          icon="cash-outline"
          iconColor={colors.semantic.success.icon}
        />
        <KpiCard
          label="En attente"
          value={String(data?.pendingCount ?? 0)}
          icon="time-outline"
          iconColor={colors.semantic.warning.icon}
        />
        <KpiCard
          label="Items populaires"
          value={String(data?.popularItems.length ?? 0)}
          icon="star-outline"
          iconColor={colors.semantic.info.icon}
        />
      </View>

      <Card variant="default" padding="md" style={styles.popularSection}>
        <Text style={styles.sectionTitle}>Items les plus vendus</Text>
        <PopularItemsList items={data?.popularItems ?? []} />
      </Card>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  scroll: {
    flex: 1,
    backgroundColor: colors.ui.background,
  },
  container: {
    padding: spacing[6],
    gap: spacing[6],
  },
  pageTitle: {
    fontSize: fontSize["2xl"],
    fontWeight: fontWeight.bold,
    color: colors.ui.textPrimary,
  },
  kpiGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: spacing[4],
  },
  popularSection: {
    gap: spacing[4],
  },
  sectionTitle: {
    fontSize: fontSize.lg,
    fontWeight: fontWeight.semibold,
    color: colors.ui.textPrimary,
  },
});
