import { ProtocolLayout } from "@/components/layouts/Layouts";
import { Icon } from "@/components/ui/Icon";

export default function ReleaseNotesPage() {
  return (
    <ProtocolLayout>
      <div style={{ padding: "2rem", maxWidth: "800px", margin: "0 auto", color: "var(--color-text)", fontFamily: "var(--font-primary)" }}>
        <h1 style={{ fontSize: "2.5rem", fontWeight: 800, marginBottom: "1rem" }}>Release Notes</h1>
        <p style={{ fontSize: "1.125rem", color: "var(--color-text-muted)", marginBottom: "3rem" }}>
          Registo de atualizações e estado da plataforma.
        </p>

        <div style={{ background: "var(--color-surface)", padding: "2rem", borderRadius: "8px", border: "1px solid var(--color-border)", marginBottom: "2rem", position: "relative", overflow: "hidden" }}>
          <div style={{ position: "absolute", top: 0, left: 0, width: "4px", height: "100%", background: "var(--color-primary)" }} />
          
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "1.5rem" }}>
            <div>
              <h2 style={{ fontSize: "1.5rem", fontWeight: 700, display: "flex", alignItems: "center", gap: "0.5rem" }}>
                MVP 1.0 <span style={{ fontSize: "0.875rem", padding: "4px 8px", background: "rgba(var(--color-primary-rgb), 0.1)", color: "var(--color-primary)", borderRadius: "4px" }}>Validation Sprint Approved</span>
              </h2>
              <p style={{ color: "var(--color-text-muted)", marginTop: "0.5rem" }}>Training Ready Release</p>
            </div>
            <div style={{ fontSize: "0.875rem", color: "var(--color-text-subtle)", fontFamily: "var(--font-mono)" }}>
              Julho 2024
            </div>
          </div>

          <div style={{ marginBottom: "1.5rem" }}>
            <h3 style={{ fontSize: "1rem", fontWeight: 600, marginBottom: "0.5rem", color: "var(--color-text)" }}>Objetivo do MVP</h3>
            <p style={{ color: "var(--color-text-muted)", lineHeight: 1.5, fontSize: "0.9375rem" }}>
              Esta versão estabelece a fundação do ResearchAI Hub, focando-se em demonstrar a viabilidade do conceito Evidence First através do primeiro protocolo de investigação (Revisão da Literatura).
            </p>
          </div>

          <div style={{ marginBottom: "1.5rem" }}>
            <h3 style={{ fontSize: "1rem", fontWeight: 600, marginBottom: "0.5rem", color: "var(--color-text)" }}>Funcionalidades Disponíveis</h3>
            <ul style={{ color: "var(--color-text-muted)", lineHeight: 1.6, fontSize: "0.9375rem", paddingLeft: "1.2rem" }}>
              <li><strong>Protocolo RL-01:</strong> Fluxo metodológico completo para Revisão da Literatura.</li>
              <li><strong>Bring Your Own Intelligence Engine (BYIA):</strong> Suporte agnóstico para utilização com qualquer LLM.</li>
              <li><strong>Research Identity Local:</strong> Criação anónima de sessão com Researcher ID persistente (local).</li>
              <li><strong>Exportação:</strong> Compilação e exportação de todos os artefactos em documento final.</li>
            </ul>
          </div>

          <div style={{ marginBottom: "1.5rem" }}>
            <h3 style={{ fontSize: "1rem", fontWeight: 600, marginBottom: "0.5rem", color: "var(--color-text)" }}>Limitações Conhecidas</h3>
            <ul style={{ color: "var(--color-text-muted)", lineHeight: 1.6, fontSize: "0.9375rem", paddingLeft: "1.2rem" }}>
              <li>O histórico de Workspaces antigos e sessões terminadas não está visível num ecrã central (limitação temporária).</li>
              <li>A persistência é exclusivamente local. A limpeza dos dados do navegador resulta na perda da investigação.</li>
            </ul>
          </div>

          <div>
            <h3 style={{ fontSize: "1rem", fontWeight: 600, marginBottom: "0.5rem", color: "var(--color-text)" }}>Protocolos Planeados</h3>
            <p style={{ color: "var(--color-text-muted)", lineHeight: 1.5, fontSize: "0.9375rem" }}>
              Projeto de Investigação (PJ-01), Metodologia (MC-01), Ética (ET-01), Análise de Dados (DA-01) - Consulte a página <a href="/roadmap" style={{ color: "var(--color-primary)" }}>Roadmap</a>.
            </p>
          </div>
        </div>
      </div>
    </ProtocolLayout>
  );
}
