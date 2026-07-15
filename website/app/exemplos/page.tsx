import { ProtocolLayout } from "@/components/layouts/Layouts";
import { Icon } from "@/components/ui/Icon";
import Link from "next/link";

export default function ExemplosPage() {
  return (
    <ProtocolLayout>
      <div style={{ padding: "2rem", maxWidth: "800px", margin: "0 auto", color: "var(--color-text)", fontFamily: "var(--font-primary)" }}>
        <h1 style={{ fontSize: "2.5rem", fontWeight: 800, marginBottom: "1rem" }}>Exemplos</h1>
        <p style={{ fontSize: "1.125rem", color: "var(--color-text-muted)", marginBottom: "3rem" }}>
          Veja como a plataforma transforma um tópico inicial numa Revisão da Literatura estruturada.
        </p>

        <div style={{ border: "1px solid var(--color-border)", borderRadius: "12px", overflow: "hidden", marginBottom: "2rem" }}>
          <div style={{ background: "var(--color-surface-hover)", padding: "1.5rem", borderBottom: "1px solid var(--color-border)" }}>
            <h2 style={{ fontSize: "1.25rem", fontWeight: 600, marginBottom: "0.5rem" }}>Exemplo 1: Ética e Cidadania Digital</h2>
            <p style={{ color: "var(--color-text-muted)", fontSize: "0.9375rem" }}>
              <strong>Tópico Inicial:</strong> O impacto das redes sociais na cidadania digital dos jovens moçambicanos.
            </p>
          </div>
          
          <div style={{ padding: "1.5rem", background: "var(--color-surface)" }}>
            <h3 style={{ fontSize: "1rem", fontWeight: 600, marginBottom: "1rem", display: "flex", alignItems: "center", gap: "0.5rem" }}>
              <Icon name="arrow-down" size={16} color="var(--color-text-subtle)" />
              1. Definição do Tema
            </h3>
            <div style={{ background: "var(--color-bg)", padding: "1rem", borderRadius: "6px", fontSize: "0.875rem", fontFamily: "var(--font-mono)", marginBottom: "1.5rem", border: "1px dashed var(--color-border)" }}>
              "O impacto das redes sociais na cidadania digital dos jovens moçambicanos."
            </div>

            <h3 style={{ fontSize: "1rem", fontWeight: 600, marginBottom: "1rem", display: "flex", alignItems: "center", gap: "0.5rem" }}>
              <Icon name="arrow-down" size={16} color="var(--color-text-subtle)" />
              2. Pergunta Científica
            </h3>
            <div style={{ background: "var(--color-bg)", padding: "1rem", borderRadius: "6px", fontSize: "0.875rem", fontFamily: "var(--font-mono)", marginBottom: "1.5rem", border: "1px dashed var(--color-border)" }}>
              - Quais são as principais competências de cidadania digital desenvolvidas pelos jovens?<br/>
              - Como o uso das redes sociais influencia a perceção ética?
            </div>
            
            <h3 style={{ fontSize: "1rem", fontWeight: 600, marginBottom: "1rem", display: "flex", alignItems: "center", gap: "0.5rem" }}>
              <Icon name="arrow-down" size={16} color="var(--color-text-subtle)" />
              3 e 4. Pesquisa e Sintaxe
            </h3>
            <div style={{ background: "var(--color-bg)", padding: "1rem", borderRadius: "6px", fontSize: "0.875rem", fontFamily: "var(--font-mono)", marginBottom: "1.5rem", border: "1px dashed var(--color-border)" }}>
              ("Digital citizenship" OR "Digital ethics") AND ("Social media" OR "Social networks") AND "Youth"
            </div>

            <h3 style={{ fontSize: "1rem", fontWeight: 600, marginBottom: "1rem", display: "flex", alignItems: "center", gap: "0.5rem" }}>
              <Icon name="arrow-down" size={16} color="var(--color-text-subtle)" />
              5, 6 e 7. Seleção, Fichas e Tabela Comparativa
            </h3>
            <div style={{ background: "var(--color-bg)", padding: "1rem", borderRadius: "6px", fontSize: "0.875rem", fontFamily: "var(--font-mono)", marginBottom: "1.5rem", border: "1px dashed var(--color-border)" }}>
              [Extração de 10 artigos relevantes, síntese das contribuições e agrupamento em matriz comparativa.]
            </div>

            <h3 style={{ fontSize: "1rem", fontWeight: 600, marginBottom: "1rem", display: "flex", alignItems: "center", gap: "0.5rem" }}>
              <Icon name="arrow-down" size={16} color="var(--color-text-subtle)" />
              8, 9 e 10. Lacunas, Síntese e Documento Final
            </h3>
            <p style={{ color: "var(--color-text-muted)", fontSize: "0.9375rem" }}>
              A partir da tabela, o investigador identifica lacunas (Passo 8), redige a síntese integrativa (Passo 9) e compila o Documento Final metodologicamente estruturado.
            </p>
          </div>
        </div>
      </div>
    </ProtocolLayout>
  );
}
