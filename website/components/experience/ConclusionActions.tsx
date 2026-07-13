"use client";
import { useRouter } from "next/navigation";
import { useWorkspaceStore } from "@/components/workspace/WorkspaceStoreContext";
import { Button } from "@/components/ui/Button";
import { ui } from "@/lib/labels";

export function ConclusionActions() {
  const { session, ready, updateSession } = useWorkspaceStore();
  const router = useRouter();

  const handleNew = () => {
    updateSession({ status: "COMPLETED" });
    // Leva ao ponto de criação/escolha, para que "Nova Investigação" realmente inicie uma.
    router.push("/competencias/revisao-da-literatura");
  };

  const hasContext = ready && (session?.status === "READY" || session?.status === "COMPLETED");

  return (
    <div style={{ display: "flex", gap: "12px", flexWrap: "wrap", justifyContent: "center", marginTop: "24px" }}>
      <Button href="/" size="lg">
        {ui.actions.backHome}
      </Button>
      {hasContext ? (
        <Button variant="secondary" size="lg" onClick={handleNew}>
          Nova Investigação
        </Button>
      ) : (
        <Button href="/competencias" variant="secondary" size="lg">
          {ui.actions.viewCompetencies}
        </Button>
      )}
    </div>
  );
}
