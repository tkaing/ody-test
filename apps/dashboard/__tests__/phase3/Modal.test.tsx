import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { Text } from "react-native";
import { Modal } from "@/components/ui/Modal";

describe("Phase 3 — Modal", () => {
  it("rendu du contenu quand visible=true", () => {
    render(
      <Modal visible={true} onClose={() => {}}>
        <Text>Contenu de la modal</Text>
      </Modal>
    );
    expect(screen.getByText("Contenu de la modal")).toBeInTheDocument();
  });

  it("affichage du titre", () => {
    render(
      <Modal visible={true} onClose={() => {}} title="Créer une commande">
        <Text>Corps</Text>
      </Modal>
    );
    expect(screen.getByText("Créer une commande")).toBeInTheDocument();
  });

  it("contenu non visible quand visible=false", () => {
    render(
      <Modal visible={false} onClose={() => {}}>
        <Text>Caché</Text>
      </Modal>
    );
    expect(screen.queryByText("Caché")).not.toBeInTheDocument();
  });

  it("fermeture via bouton close — onClose appelé", () => {
    const onClose = vi.fn();
    render(
      <Modal visible={true} onClose={onClose} title="Modal test">
        <Text>Corps</Text>
      </Modal>
    );
    fireEvent.click(screen.getByLabelText("Fermer"));
    expect(onClose).toHaveBeenCalledOnce();
  });

  it("rendu du footer", () => {
    render(
      <Modal visible={true} onClose={() => {}} footer={<Text>Footer action</Text>}>
        <Text>Corps</Text>
      </Modal>
    );
    expect(screen.getByText("Footer action")).toBeInTheDocument();
  });
});
