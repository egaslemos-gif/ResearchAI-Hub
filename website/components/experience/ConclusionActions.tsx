"use client";
import { useRouter } from "next/navigation";
import { useResearchContext } from "@/lib/researchContext";
import { Button } from "@/components/ui/Button";
import { ui } from "@/lib/labels";

export function ConclusionActions() {
  const { context, ready, clearContext } = useResearchContext();
  const router = useRouter();

  const handleNew = () => {
    if (confirm("Isto irá limpar o contexto da investigação actual. Pretende continuar?")) {
      clearContext();
      router.push("/competencias");
    }
  };

  const hasContext = ready && context.status === "active";

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
