import { ScrollView, StyleSheet, Text, View } from "react-native";
import { useState, useEffect } from "react";
import { useGetSettings, usePatchSettings } from "@ody/api-client";
import { Button, Card, Input, TextArea, Toggle, useToast } from "@/components/ui";
import { ErrorState, LoadingState } from "@/components/states";
import { colors, spacing, fontSize, fontWeight } from "@/constants/tokens";

export default function SettingsScreen() {
  const { data, isLoading, isError, refetch } = useGetSettings();
  const patchSettings = usePatchSettings();
  const { show } = useToast();

  const [restaurantName, setRestaurantName] = useState("");
  const [prepTime, setPrepTime] = useState("");
  const [autoAccept, setAutoAccept] = useState(false);
  const [isOpen, setIsOpen] = useState(true);
  const [openingHours, setOpeningHours] = useState("");

  useEffect(() => {
    if (data) {
      setRestaurantName(data.restaurantName);
      setPrepTime(String(data.prepTime));
      setAutoAccept(data.autoAccept);
      setIsOpen(data.isOpen);
      setOpeningHours(data.openingHours);
    }
  }, [data]);

  if (isLoading) return <LoadingState message="Chargement des paramètres…" />;
  if (isError) return <ErrorState onRetry={() => { void refetch(); }} />;

  function handleSave() {
    const prepTimeNum = parseInt(prepTime, 10);
    if (!restaurantName.trim()) {
      show("Le nom du restaurant est requis.", "error");
      return;
    }
    if (isNaN(prepTimeNum) || prepTimeNum <= 0) {
      show("Le temps de préparation doit être un nombre positif.", "error");
      return;
    }
    patchSettings.mutate(
      { data: { restaurantName, prepTime: prepTimeNum, autoAccept, isOpen, openingHours } },
      {
        onSuccess: () => { show("Paramètres enregistrés.", "success"); },
        onError: () => { show("Échec de la mise à jour.", "error"); },
      }
    );
  }

  return (
    <ScrollView style={styles.scroll} contentContainerStyle={styles.container}>
      <Text style={styles.pageTitle}>Paramètres</Text>

      <Card variant="default" padding="md" style={styles.section}>
        <Text style={styles.sectionTitle}>Informations du restaurant</Text>
        <Input
          label="Nom du restaurant"
          value={restaurantName}
          onChangeText={setRestaurantName}
          placeholder="Mon Restaurant"
        />
      </Card>

      <Card variant="default" padding="md" style={styles.section}>
        <Text style={styles.sectionTitle}>Gestion des commandes</Text>
        <Input
          label="Temps de préparation (minutes)"
          value={prepTime}
          onChangeText={setPrepTime}
          keyboardType="numeric"
          placeholder="15"
        />
        <View style={styles.toggleRow}>
          <View style={styles.toggleInfo}>
            <Text style={styles.toggleLabel}>Acceptation automatique</Text>
            <Text style={styles.toggleHint}>
              Confirme automatiquement les nouvelles commandes
            </Text>
          </View>
          <Toggle value={autoAccept} onChange={setAutoAccept} />
        </View>
      </Card>

      <Card variant="default" padding="md" style={styles.section}>
        <Text style={styles.sectionTitle}>Disponibilité</Text>
        <View style={styles.toggleRow}>
          <View style={styles.toggleInfo}>
            <Text style={styles.toggleLabel}>Restaurant ouvert</Text>
            <Text style={styles.toggleHint}>
              Désactivez pour arrêter les nouvelles commandes
            </Text>
          </View>
          <Toggle value={isOpen} onChange={setIsOpen} />
        </View>
        <TextArea
          label="Horaires d'ouverture"
          value={openingHours}
          onChangeText={setOpeningHours}
          placeholder={"Lun-Ven : 11h-22h\nSam-Dim : 12h-23h"}
          rows={3}
        />
      </Card>

      <Button
        variant="primary"
        size="md"
        onPress={handleSave}
        loading={patchSettings.isPending}
      >
        Enregistrer
      </Button>
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
  pageTitle: {
    fontSize: fontSize["2xl"],
    fontWeight: fontWeight.bold,
    color: colors.ui.textPrimary,
  },
  section: {
    gap: spacing[4],
  },
  sectionTitle: {
    fontSize: fontSize.md,
    fontWeight: fontWeight.semibold,
    color: colors.ui.textPrimary,
    marginBottom: spacing[1],
  },
  toggleRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  toggleInfo: {
    flex: 1,
    marginRight: spacing[4],
  },
  toggleLabel: {
    fontSize: fontSize.sm,
    fontWeight: fontWeight.medium,
    color: colors.ui.textPrimary,
  },
  toggleHint: {
    fontSize: fontSize.xs,
    color: colors.ui.textSecondary,
    marginTop: spacing["0.5"],
  },
});
