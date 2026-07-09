import type { Metadata } from "next";
import { getTools } from "@/lib/content";
import { ui } from "@/lib/labels";
import { PageHeader } from "@/components/ui/PageHeader";
import { CatalogGrid, EmptyState } from "@/components/ui/CatalogGrid";
import { ToolCard } from "@/components/ui/ToolCard";

export const metadata: Metadata = { title: ui.nav.tools };

export default function FerramentasPage() {
  const tools = getTools();
  return (
    <div className="container-wide">
      <PageHeader title={ui.home.toolsTitle} subtitle={ui.home.toolsSubtitle} />
      {tools.length > 0 ? (
        <CatalogGrid>
          {tools.map((t) => (
            <ToolCard key={t.slug} t={t} />
          ))}
        </CatalogGrid>
      ) : (
        <EmptyState>Ainda não há ferramentas publicadas.</EmptyState>
      )}
    </div>
  );
}
