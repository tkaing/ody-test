import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { Input } from "@/components/ui/Input";

describe("Phase 3 — Input", () => {
  it("affichage du label", () => {
    render(<Input label="Nom du client" />);
    expect(screen.getByText("Nom du client")).toBeInTheDocument();
  });

  it("affichage du message d'erreur", () => {
    render(<Input label="Email" error="Format invalide" />);
    expect(screen.getByText("Format invalide")).toBeInTheDocument();
  });

  it("affichage du hint quand pas d'erreur", () => {
    render(<Input label="Email" hint="Ex: contact@restaurant.fr" />);
    expect(screen.getByText("Ex: contact@restaurant.fr")).toBeInTheDocument();
  });

  it("hint masqué si erreur présente", () => {
    render(<Input label="Email" hint="Optionnel" error="Requis" />);
    expect(screen.queryByText("Optionnel")).not.toBeInTheDocument();
    expect(screen.getByText("Requis")).toBeInTheDocument();
  });

  it("saisie contrôlée — onChange appelé", () => {
    const onChangeText = vi.fn();
    render(<Input value="" onChangeText={onChangeText} placeholder="Saisir…" />);
    fireEvent.change(screen.getByPlaceholderText("Saisir…"), {
      target: { value: "Bonjour" },
    });
    expect(onChangeText).toHaveBeenCalledWith("Bonjour");
  });

  it("affiche la valeur contrôlée", () => {
    render(<Input value="Jean Dupont" onChangeText={() => {}} />);
    expect(screen.getByDisplayValue("Jean Dupont")).toBeInTheDocument();
  });
});
