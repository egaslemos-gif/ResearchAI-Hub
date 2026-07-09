import type { Metadata } from "next";
import { getCompetencies } from "@/lib/content";
import { ui } from "@/lib/labels";
import { PageHeader } from "@/components/ui/PageHeader";
import { CatalogGrid, EmptyState } from "@/components/ui/CatalogGrid";
import { CompetencyCard } from "@/components/ui/CompetencyCard";

export const metadata: Metadata = { title: ui.nav.competencies };

export default function CompetenciasPage() {
  const competencies = getCompetencies();
  return (
    <div className="container-wide">
      <PageHeader
        title={ui.home.competenciesTitle}
        subtitle={ui.home.competenciesSubtitle}
      />
      {competencies.length > 0 ? (
        <CatalogGrid>
          {competencies.map((c) => (
            <CompetencyCard key={c.slug} c={c} />
          ))}
        </CatalogGrid>
      ) : (
        <EmptyState>Ainda não há competências publicadas.</EmptyState>
      )}
    </div>
  );
}
