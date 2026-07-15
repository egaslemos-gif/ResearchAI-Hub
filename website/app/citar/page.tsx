import { ProtocolLayout } from "@/components/layouts/Layouts";

export default function CitarPage() {
  return (
    <ProtocolLayout>
      <div style={{ padding: "2rem", maxWidth: "800px", margin: "0 auto", color: "var(--color-text)", fontFamily: "var(--font-primary)" }}>
        <h1 style={{ fontSize: "2.5rem", fontWeight: 800, marginBottom: "1rem" }}>Como Citar</h1>
        <p style={{ fontSize: "1.125rem", color: "var(--color-text-muted)", marginBottom: "3rem" }}>
          Apoie o ResearchAI Hub citando-o nos seus trabalhos académicos.
        </p>

        <div style={{ background: "var(--color-surface)", padding: "1.5rem", borderRadius: "8px", border: "1px solid var(--color-border)", marginBottom: "2rem" }}>
          <h2 style={{ fontSize: "1.25rem", fontWeight: 600, marginBottom: "1rem" }}>APA (7th Edition)</h2>
          <p style={{ fontFamily: "var(--font-mono)", fontSize: "0.875rem", background: "var(--color-surface-hover)", padding: "1rem", borderRadius: "4px" }}>
            Lemos, E. (2024). ResearchAI Hub: Protocol Driven Research Platform (Versão MVP 1.0) [Software]. Universidade Licungo.
          </p>
        </div>

        <div style={{ background: "var(--color-surface)", padding: "1.5rem", borderRadius: "8px", border: "1px solid var(--color-border)", marginBottom: "2rem" }}>
          <h2 style={{ fontSize: "1.25rem", fontWeight: 600, marginBottom: "1rem" }}>BibTeX</h2>
          <pre style={{ fontFamily: "var(--font-mono)", fontSize: "0.875rem", background: "var(--color-surface-hover)", padding: "1rem", borderRadius: "4px", overflowX: "auto" }}>
{`@software{researchai_hub_2024,
  author = {Lemos, Egas},
  title = {ResearchAI Hub: Protocol Driven Research Platform},
  month = {Jul},
  year = {2024},
  publisher = {Universidade Licungo},
  version = {MVP 1.0}
}`}
          </pre>
        </div>
      </div>
    </ProtocolLayout>
  );
}
