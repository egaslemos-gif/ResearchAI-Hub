"use client";
import { useRouter } from "next/navigation";
import { useResearchSession } from "@/components/workspace/ResearchSessionContext";
import { Button } from "@/components/ui/Button";
import { ui } from "@/lib/labels";

export function ConclusionActions() {
  const { session, ready, updateSession } = useResearchSession();
  const router = useRouter();

  const handleNew = () => {
    updateSession({ status: "completed" });
    router.push("/");
  };

  const hasContext = ready && session?.status === "active";

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
