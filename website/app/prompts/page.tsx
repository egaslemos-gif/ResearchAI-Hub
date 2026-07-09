import type { Metadata } from "next";
import { getPrompts } from "@/lib/content";
import { ui } from "@/lib/labels";
import { PageHeader } from "@/components/ui/PageHeader";
import { CatalogGrid, EmptyState } from "@/components/ui/CatalogGrid";
import { PromptCard } from "@/components/ui/PromptCard";

export const metadata: Metadata = { title: ui.home.promptsTitle };

export default function PromptsPage() {
  const prompts = getPrompts();
  return (
    <div className="container-wide">
      <PageHeader title={ui.home.promptsTitle} subtitle={ui.home.promptsSubtitle} />
      {prompts.length > 0 ? (
        <CatalogGrid>
          {prompts.map((p) => (
            <PromptCard key={p.id} p={p} />
          ))}
        </CatalogGrid>
      ) : (
        <EmptyState>A biblioteca de prompts está vazia.</EmptyState>
      )}
    </div>
  );
}
