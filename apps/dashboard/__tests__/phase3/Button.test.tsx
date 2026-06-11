import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { Button } from "@/components/ui/Button";

describe("Phase 3 — Button", () => {
  it("rendu variant primary", () => {
    render(<Button variant="primary" onPress={() => {}}>Confirmer</Button>);
    expect(screen.getByText("Confirmer")).toBeInTheDocument();
  });

  it("rendu variant secondary", () => {
    render(<Button variant="secondary" onPress={() => {}}>Annuler</Button>);
    expect(screen.getByText("Annuler")).toBeInTheDocument();
  });

  it("rendu variant ghost", () => {
    render(<Button variant="ghost" onPress={() => {}}>Ignorer</Button>);
    expect(screen.getByText("Ignorer")).toBeInTheDocument();
  });

  it("rendu variant destructive", () => {
    render(<Button variant="destructive" onPress={() => {}}>Supprimer</Button>);
    expect(screen.getByText("Supprimer")).toBeInTheDocument();
  });

  it("état disabled — le bouton ne déclenche pas onPress", () => {
    const onPress = vi.fn();
    render(<Button disabled onPress={onPress}>Désactivé</Button>);
    fireEvent.click(screen.getByRole("button"));
    expect(onPress).not.toHaveBeenCalled();
  });

  it("état loading — affiche le spinner (progressbar)", () => {
    render(<Button loading onPress={() => {}}>Soumettre</Button>);
    expect(screen.getByRole("progressbar")).toBeInTheDocument();
  });

  it("callback onPress déclenché au clic", () => {
    const onPress = vi.fn();
    render(<Button onPress={onPress}>Cliquer</Button>);
    fireEvent.click(screen.getByRole("button"));
    expect(onPress).toHaveBeenCalledOnce();
  });
});
