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
    <div className="container-wide" style={{ paddingBottom: 'var(--space-12)' }}>
      <PageHeader title={ui.home.promptsTitle} subtitle={ui.home.promptsSubtitle} />
      
      <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-10)' }}>
        
        {/* Section: Continuar */}
        <section>
          <h2 className="overline" style={{ marginBottom: 'var(--space-4)' }}>Continuar de onde parou</h2>
          <EmptyState>Nenhum prompt em execução no momento.</EmptyState>
        </section>

        {/* Section: Recentes */}
        <section>
          <h2 className="overline" style={{ marginBottom: 'var(--space-4)' }}>Recentes</h2>
          {prompts.length > 0 ? (
            <CatalogGrid>
              {prompts.slice(0, 1).map((p) => (
                <PromptCard key={p.id} p={p} />
              ))}
            </CatalogGrid>
          ) : (
            <EmptyState>Histórico vazio.</EmptyState>
          )}
        </section>

        {/* Section: Explorar (Destaques/Recomendações) */}
        <section>
          <h2 className="overline" style={{ marginBottom: 'var(--space-4)' }}>Explorar Sugestões</h2>
          {prompts.length > 0 ? (
            <CatalogGrid>
              {prompts.slice(1, 3).map((p) => (
                <PromptCard key={p.id} p={p} />
              ))}
            </CatalogGrid>
          ) : (
            <EmptyState>Nenhuma sugestão disponível.</EmptyState>
          )}
        </section>

        {/* Section: Todos */}
        <section>
          <h2 className="overline" style={{ marginBottom: 'var(--space-4)' }}>Todos os Prompts</h2>
          {prompts.length > 0 ? (
            <CatalogGrid>
              {prompts.map((p) => (
                <PromptCard key={p.id} p={p} />
              ))}
            </CatalogGrid>
          ) : (
            <EmptyState>A biblioteca de prompts está vazia.</EmptyState>
          )}
        </section>

      </div>
    </div>
  );
}
