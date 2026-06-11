import { ScrollView, StyleSheet, Text, View } from "react-native";
import { useState, useEffect, useRef } from "react";
import { useGetCustomers } from "@ody/api-client";
import { CustomerRow } from "@/components/crm/CustomerRow";
import { Input } from "@/components/ui";
import { EmptyState, ErrorState, LoadingState } from "@/components/states";
import { colors, spacing, fontSize, fontWeight } from "@/constants/tokens";

export default function CrmScreen() {
  const [search, setSearch] = useState("");
  const [debouncedQ, setDebouncedQ] = useState("");
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (timerRef.current) clearTimeout(timerRef.current);
    timerRef.current = setTimeout(() => { setDebouncedQ(search); }, 300);
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [search]);

  const { data, isLoading, isError, refetch } = useGetCustomers(
    debouncedQ ? { q: debouncedQ } : undefined
  );

  return (
    <ScrollView style={styles.scroll} contentContainerStyle={styles.container}>
      <View style={styles.header}>
        <Text style={styles.pageTitle}>Clients</Text>
        <Text style={styles.count}>{data?.length ?? 0} client(s)</Text>
      </View>

      <Input
        placeholder="Rechercher par nom ou email…"
        value={search}
        onChangeText={setSearch}
        leftIcon="search-outline"
      />

      {isLoading ? (
        <LoadingState message="Chargement des clients…" />
      ) : isError ? (
        <ErrorState onRetry={() => { void refetch(); }} />
      ) : data?.length === 0 ? (
        <EmptyState
          icon="people-outline"
          title="Aucun client"
          description={
            debouncedQ ? "Aucun résultat pour cette recherche." : undefined
          }
        />
      ) : (
        <View style={styles.list}>
          {data?.map((customer) => (
            <CustomerRow key={customer.id} customer={customer} />
          ))}
        </View>
      )}
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
    gap: spacing[5],
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  pageTitle: {
    fontSize: fontSize["2xl"],
    fontWeight: fontWeight.bold,
    color: colors.ui.textPrimary,
  },
  count: {
    fontSize: fontSize.sm,
    color: colors.ui.textSecondary,
  },
  list: {
    gap: spacing[3],
  },
});
