import { useState } from "react";
import { ScrollView, StyleSheet, Text, View } from "react-native";
import {
  Badge,
  Button,
  Card,
  Input,
  Modal,
  Select,
  Skeleton,
  SkeletonCard,
  SkeletonRow,
  StatusIndicator,
  Table,
  TextArea,
  useToast,
} from "@/components/ui";
import { EmptyState } from "@/components/states/EmptyState";
import { ErrorState } from "@/components/states/ErrorState";
import { LoadingState } from "@/components/states/LoadingState";
import { colors, fontSize, fontWeight, layout, spacing } from "@/constants/tokens";
import type { Column } from "@/components/ui";
import type { OrderStatus } from "@ody/types";

const ORDER_STATUSES: OrderStatus[] = [
  "pending",
  "confirmed",
  "preparing",
  "ready",
  "completed",
  "cancelled",
];

type SampleRow = { id: string; name: string; status: string; amount: string };
const TABLE_COLUMNS: Column<SampleRow>[] = [
  { key: "id", header: "ID", width: 60 },
  { key: "name", header: "Nom", flex: 2 },
  { key: "status", header: "Statut", flex: 1 },
  { key: "amount", header: "Montant", flex: 1, align: "right" },
];
const TABLE_DATA: SampleRow[] = [
  { id: "#1", name: "Commande 1", status: "En attente", amount: "42,00 €" },
  { id: "#2", name: "Commande 2", status: "Terminée", amount: "18,50 €" },
  { id: "#3", name: "Commande 3", status: "Annulée", amount: "0,00 €" },
];

export default function UILibraryScreen() {
  const [modalOpen, setModalOpen] = useState(false);
  const [inputValue, setInputValue] = useState("");
  const [selectValue, setSelectValue] = useState<string | undefined>();
  const { show } = useToast();

  return (
    <ScrollView style={styles.screen} contentContainerStyle={styles.content}>
      <Text style={styles.pageTitle}>UI Library</Text>
      <Text style={styles.pageSubtitle}>Tokens, composants et états — Phase 3</Text>

      <Section title="Couleurs">
        <View style={styles.colorGrid}>
          {Object.entries(colors.semantic).map(([name, value]) => (
            <View key={name} style={styles.colorGroup}>
              <View style={[styles.colorSwatch, { backgroundColor: value.bg, borderColor: value.border, borderWidth: 1 }]} />
              <Text style={styles.colorLabel}>{name}</Text>
            </View>
          ))}
          {[50, 200, 400, 600, 800].map((shade) => (
            <View key={shade} style={styles.colorGroup}>
              <View style={[styles.colorSwatch, { backgroundColor: (colors.neutral as Record<number, string>)[shade] }]} />
              <Text style={styles.colorLabel}>neutral-{shade}</Text>
            </View>
          ))}
          {[100, 300, 500, 700, 900].map((shade) => (
            <View key={shade} style={styles.colorGroup}>
              <View style={[styles.colorSwatch, { backgroundColor: (colors.primary as Record<number, string>)[shade] }]} />
              <Text style={styles.colorLabel}>primary-{shade}</Text>
            </View>
          ))}
        </View>
      </Section>

      <Section title="Boutons">
        <View style={styles.row}>
          <Button variant="primary" onPress={() => {}}>Primary</Button>
          <Button variant="secondary" onPress={() => {}}>Secondary</Button>
          <Button variant="ghost" onPress={() => {}}>Ghost</Button>
          <Button variant="destructive" onPress={() => {}}>Destructive</Button>
        </View>
        <View style={styles.row}>
          <Button size="sm" onPress={() => {}}>Small</Button>
          <Button size="md" onPress={() => {}}>Medium</Button>
          <Button size="lg" onPress={() => {}}>Large</Button>
        </View>
        <View style={styles.row}>
          <Button leftIcon="add-outline" onPress={() => {}}>Avec icône</Button>
          <Button loading onPress={() => {}}>Chargement</Button>
          <Button disabled onPress={() => {}}>Désactivé</Button>
        </View>
      </Section>

      <Section title="Badges & Statuts">
        <View style={styles.row}>
          <Badge variant="default">Default</Badge>
          <Badge variant="success">Success</Badge>
          <Badge variant="warning">Warning</Badge>
          <Badge variant="error">Error</Badge>
          <Badge variant="info">Info</Badge>
          <Badge variant="neutral">Neutral</Badge>
        </View>
        <View style={styles.row}>
          {ORDER_STATUSES.map((s) => (
            <StatusIndicator key={s} status={s} />
          ))}
        </View>
      </Section>

      <Section title="Formulaires">
        <View style={styles.formGrid}>
          <Input
            label="Nom du restaurant"
            placeholder="Ex: Le Bistrot Parisien"
            value={inputValue}
            onChangeText={setInputValue}
            hint="Visible dans les reçus clients"
          />
          <Input
            label="Champ en erreur"
            value=""
            onChangeText={() => {}}
            error="Ce champ est requis"
          />
          <Input
            label="Avec icône"
            leftIcon="search-outline"
            placeholder="Rechercher…"
          />
          <Select
            label="Statut"
            placeholder="Choisir un statut…"
            options={[
              { value: "pending", label: "En attente" },
              { value: "confirmed", label: "Confirmée" },
              { value: "completed", label: "Terminée" },
            ]}
            value={selectValue}
            onChange={setSelectValue}
          />
          <TextArea label="Notes" placeholder="Observations…" rows={3} />
        </View>
      </Section>

      <Section title="Table">
        <Table
          columns={TABLE_COLUMNS}
          data={TABLE_DATA}
          keyExtractor={(item) => item.id}
        />
      </Section>

      <Section title="Modal">
        <Button variant="secondary" onPress={() => { setModalOpen(true); }}>
          Ouvrir la modal
        </Button>
        <Modal
          visible={modalOpen}
          onClose={() => { setModalOpen(false); }}
          title="Exemple de modal"
          footer={
            <>
              <Button variant="ghost" onPress={() => { setModalOpen(false); }}>Annuler</Button>
              <Button variant="primary" onPress={() => { setModalOpen(false); }}>Confirmer</Button>
            </>
          }
        >
          <Text style={styles.bodyText}>
            Le contenu de la modal s'affiche ici. Elle gère le scroll, le clavier et se ferme en cliquant sur l'overlay.
          </Text>
          <Input label="Champ dans la modal" placeholder="Valeur…" />
        </Modal>
      </Section>

      <Section title="Toast">
        <View style={styles.row}>
          <Button variant="secondary" onPress={() => { show("Opération réussie !", "success"); }}>
            Success
          </Button>
          <Button variant="secondary" onPress={() => { show("Une erreur est survenue.", "error"); }}>
            Error
          </Button>
          <Button variant="secondary" onPress={() => { show("Attention, vérifiez les données.", "warning"); }}>
            Warning
          </Button>
          <Button variant="secondary" onPress={() => { show("Mise à jour disponible.", "info"); }}>
            Info
          </Button>
        </View>
      </Section>

      <Section title="Skeleton">
        <View style={styles.skeletonGrid}>
          <Skeleton variant="line" />
          <Skeleton variant="line" width="60%" />
          <Skeleton variant="block" />
          <View style={styles.row}>
            <Skeleton variant="avatar" />
            <View style={{ flex: 1, gap: spacing[2] }}>
              <Skeleton variant="line" width="70%" />
              <Skeleton variant="line" width="40%" />
            </View>
          </View>
          <SkeletonRow columns={3} />
          <SkeletonCard />
        </View>
      </Section>

      <Section title="États">
        <View style={styles.statesGrid}>
          <Card padding="none" style={styles.stateCard}>
            <LoadingState message="Chargement des commandes…" />
          </Card>
          <Card padding="none" style={styles.stateCard}>
            <EmptyState
              icon="receipt-outline"
              title="Aucune commande"
              description="Les commandes du jour apparaîtront ici."
              action={<Button size="sm" onPress={() => {}}>Créer une commande</Button>}
            />
          </Card>
          <Card padding="none" style={styles.stateCard}>
            <ErrorState
              title="Impossible de charger les données"
              message="Vérifiez votre connexion et réessayez."
              onRetry={() => {}}
            />
          </Card>
        </View>
      </Section>
    </ScrollView>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <View style={sectionStyles.container}>
      <Text style={sectionStyles.title}>{title}</Text>
      <View style={sectionStyles.body}>{children}</View>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: colors.ui.background,
  },
  content: {
    maxWidth: layout.contentMaxWidth,
    padding: layout.pageGutter,
    gap: spacing[8],
  },
  pageTitle: {
    fontSize: fontSize["3xl"],
    fontWeight: fontWeight.bold,
    color: colors.ui.textPrimary,
  },
  pageSubtitle: {
    fontSize: fontSize.base,
    color: colors.ui.textSecondary,
    marginTop: -spacing[6],
  },
  row: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: spacing[3],
    alignItems: "center",
  },
  colorGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: spacing[4],
  },
  colorGroup: {
    alignItems: "center",
    gap: spacing[1],
  },
  colorSwatch: {
    width: 40,
    height: 40,
    borderRadius: 8,
  },
  colorLabel: {
    fontSize: 10,
    color: colors.ui.textSecondary,
  },
  formGrid: {
    gap: spacing[4],
    maxWidth: 480,
  },
  skeletonGrid: {
    gap: spacing[3],
    maxWidth: 480,
  },
  statesGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: spacing[4],
  },
  stateCard: {
    width: 280,
    height: 200,
  },
  bodyText: {
    fontSize: fontSize.base,
    color: colors.ui.textSecondary,
    lineHeight: 22,
  },
});

const sectionStyles = StyleSheet.create({
  container: {
    gap: spacing[4],
  },
  title: {
    fontSize: fontSize.xl,
    fontWeight: fontWeight.semibold,
    color: colors.ui.textPrimary,
    paddingBottom: spacing[2],
    borderBottomWidth: 1,
    borderBottomColor: colors.ui.border,
  },
  body: {
    gap: spacing[4],
  },
});
