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
    <div className="container-wide" style={{ paddingBottom: 'var(--space-12)' }}>
      <PageHeader title="Ferramentas" subtitle="O seu ambiente de execução cognitivo." />
      
      <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-10)' }}>
        
        {/* Section: Continuar */}
        <section>
          <h2 className="overline" style={{ marginBottom: 'var(--space-4)' }}>Continuar de onde parou</h2>
          <EmptyState>Nenhuma ferramenta em execução no momento.</EmptyState>
        </section>

        {/* Section: Recentes */}
        <section>
          <h2 className="overline" style={{ marginBottom: 'var(--space-4)' }}>Recentes</h2>
          {tools.length > 0 ? (
            <CatalogGrid>
              {tools.slice(0, 1).map((t) => (
                <ToolCard key={t.slug} t={t} />
              ))}
            </CatalogGrid>
          ) : (
            <EmptyState>Histórico vazio.</EmptyState>
          )}
        </section>

        {/* Section: Explorar (Destaques/Recomendações) */}
        <section>
          <h2 className="overline" style={{ marginBottom: 'var(--space-4)' }}>Explorar Sugestões</h2>
          {tools.length > 0 ? (
            <CatalogGrid>
              {tools.slice(1, 3).map((t) => (
                <ToolCard key={t.slug} t={t} />
              ))}
            </CatalogGrid>
          ) : (
            <EmptyState>Nenhuma sugestão disponível.</EmptyState>
          )}
        </section>

        {/* Section: Todos */}
        <section>
          <h2 className="overline" style={{ marginBottom: 'var(--space-4)' }}>Todas as Ferramentas</h2>
          {tools.length > 0 ? (
            <CatalogGrid>
              {tools.map((t) => (
                <ToolCard key={t.slug} t={t} />
              ))}
            </CatalogGrid>
          ) : (
            <EmptyState>Ainda não há ferramentas publicadas.</EmptyState>
          )}
        </section>

      </div>
    </div>
  );
}
