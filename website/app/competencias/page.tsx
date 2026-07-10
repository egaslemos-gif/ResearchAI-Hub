import type { Metadata } from "next";
import { ui } from "@/lib/labels";
import { PageHeader } from "@/components/ui/PageHeader";
import { EcosystemGrid } from "@/components/home/EcosystemGrid";

export const metadata: Metadata = { title: ui.nav.competencies };

export default function CompetenciasPage() {
  return (
    <div className="container-wide">
      <PageHeader
        title="Percursos de Investigação"
        subtitle="Escolhe o que precisas de fazer e a plataforma guia-te, passo a passo, até um resultado concreto."
      />
      <EcosystemGrid />
    </div>
  );
}
