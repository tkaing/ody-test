import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { Badge } from "@/components/ui/Badge";
import { StatusIndicator } from "@/components/ui/StatusIndicator";
import type { OrderStatus } from "@ody/types";

describe("Phase 3 — Badge", () => {
  it("rendu du texte enfant", () => {
    render(<Badge>En attente</Badge>);
    expect(screen.getByText("En attente")).toBeInTheDocument();
  });

  it("rendu variant success", () => {
    render(<Badge variant="success">Validé</Badge>);
    expect(screen.getByText("Validé")).toBeInTheDocument();
  });

  it("rendu variant warning", () => {
    render(<Badge variant="warning">Attention</Badge>);
    expect(screen.getByText("Attention")).toBeInTheDocument();
  });

  it("rendu variant error", () => {
    render(<Badge variant="error">Erreur</Badge>);
    expect(screen.getByText("Erreur")).toBeInTheDocument();
  });

  it("rendu variant info", () => {
    render(<Badge variant="info">Info</Badge>);
    expect(screen.getByText("Info")).toBeInTheDocument();
  });

  it("rendu variant neutral", () => {
    render(<Badge variant="neutral">Neutre</Badge>);
    expect(screen.getByText("Neutre")).toBeInTheDocument();
  });
});

describe("Phase 3 — StatusIndicator", () => {
  const statuses: Array<{ status: OrderStatus; label: string }> = [
    { status: "pending", label: "En attente" },
    { status: "confirmed", label: "Confirmée" },
    { status: "preparing", label: "En préparation" },
    { status: "ready", label: "Prête" },
    { status: "completed", label: "Terminée" },
    { status: "cancelled", label: "Annulée" },
  ];

  statuses.forEach(({ status, label }) => {
    it(`rendu statut ${status} → affiche "${label}"`, () => {
      render(<StatusIndicator status={status} />);
      expect(screen.getByText(label)).toBeInTheDocument();
    });
  });
});
