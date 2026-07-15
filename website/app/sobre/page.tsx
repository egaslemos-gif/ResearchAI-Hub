import { ProtocolLayout } from "@/components/layouts/Layouts";

export default function SobrePage() {
  return (
    <ProtocolLayout>
      <div style={{ padding: "2rem", maxWidth: "800px", margin: "0 auto", color: "var(--color-text)", fontFamily: "var(--font-primary)" }}>
        <h1 style={{ fontSize: "2.5rem", fontWeight: 800, marginBottom: "1rem" }}>Sobre a Plataforma</h1>
        <p style={{ fontSize: "1.125rem", color: "var(--color-text-muted)", marginBottom: "3rem" }}>
          Visão e Missão do ResearchAI Hub.
        </p>

        <section style={{ marginBottom: "2rem" }}>
          <h2 style={{ fontSize: "1.5rem", fontWeight: 700, marginBottom: "1rem" }}>O que é?</h2>
          <p style={{ lineHeight: 1.6, color: "var(--color-text-muted)" }}>
            O ResearchAI Hub é um Sistema Operativo de Investigação Científica. O seu objectivo é providenciar protocolos rigorosos que asseguram a integridade metodológica no uso de Inteligência Artificial para a investigação científica.
          </p>
        </section>

        <section style={{ marginBottom: "2rem" }}>
          <h2 style={{ fontSize: "1.5rem", fontWeight: 700, marginBottom: "1rem" }}>Evidence First Manifesto</h2>
          <p style={{ lineHeight: 1.6, color: "var(--color-text-muted)" }}>
            Acreditamos que a metodologia científica vem primeiro. O Evidence First Manifesto estabelece que qualquer plataforma de apoio à investigação não deve ser uma "caixa preta". O investigador precisa de total controlo e transparência sobre o processo, usando a IA como assistente avançado de processamento, e não como co-autor independente.
          </p>
        </section>

        <section style={{ marginBottom: "2rem" }}>
          <h2 style={{ fontSize: "1.5rem", fontWeight: 700, marginBottom: "1rem" }}>Independência de Modelo (BYIA)</h2>
          <p style={{ lineHeight: 1.6, color: "var(--color-text-muted)" }}>
            Através da filosofia Bring Your Own Intelligence Engine, a plataforma não retém nem processa internamente os dados nos seus próprios modelos, permitindo a total portabilidade e privacidade.
          </p>
        </section>
      </div>
    </ProtocolLayout>
  );
}
