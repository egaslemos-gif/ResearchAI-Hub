import { ProtocolLayout } from "@/components/layouts/Layouts";
import Link from "next/link";

export default function DocsPage() {
  return (
    <ProtocolLayout>
      <div style={{ padding: "2rem", maxWidth: "800px", margin: "0 auto", color: "var(--color-text)", fontFamily: "var(--font-primary)" }}>
        <h1 style={{ fontSize: "2.5rem", fontWeight: 800, marginBottom: "1rem" }}>Centro de Conhecimento</h1>
        <p style={{ fontSize: "1.125rem", color: "var(--color-text-muted)", marginBottom: "3rem" }}>
          Documentação oficial do ResearchAI Hub orientada a investigadores.
        </p>

        <section style={{ marginBottom: "3rem" }}>
          <h2 style={{ fontSize: "1.5rem", fontWeight: 700, borderBottom: "1px solid var(--color-border)", paddingBottom: "0.5rem", marginBottom: "1.5rem" }}>
            1. Introdução
          </h2>
          <p style={{ lineHeight: 1.6, color: "var(--color-text-muted)" }}>
            O ResearchAI Hub é um Sistema Operativo de Investigação Científica (SROS). A plataforma guia os investigadores metodologicamente, passo a passo, assegurando que o método prevalece sobre a estética. Toda a execução segue a metodologia <strong>Evidence First</strong> e o conceito de <strong>Protocol Driven Research</strong>.
          </p>
        </section>

        <section style={{ marginBottom: "3rem" }}>
          <h2 style={{ fontSize: "1.5rem", fontWeight: 700, borderBottom: "1px solid var(--color-border)", paddingBottom: "0.5rem", marginBottom: "1.5rem" }}>
            2. Como Começar
          </h2>
          <p style={{ lineHeight: 1.6, color: "var(--color-text-muted)" }}>
            Para iniciar, dirija-a ao <Link href="/dashboard" style={{ color: "var(--color-primary)" }}>Dashboard</Link> e crie o seu Workspace. Terá de inserir um tópico de investigação e a sua área de estudo. De imediato, poderá abrir o protocolo RL-01 (Revisão da Literatura).
          </p>
        </section>

        <section style={{ marginBottom: "3rem" }}>
          <h2 style={{ fontSize: "1.5rem", fontWeight: 700, borderBottom: "1px solid var(--color-border)", paddingBottom: "0.5rem", marginBottom: "1.5rem" }}>
            3. Como Funciona
          </h2>
          <p style={{ lineHeight: 1.6, color: "var(--color-text-muted)" }}>
            A plataforma desenha o fluxo ideal de passos. Pode consultar um guia visual na página <Link href="/docs/como-funciona" style={{ color: "var(--color-primary)" }}>Como Funciona</Link>. Em cada passo: lê as instruções, copia o Prompt, executa no seu próprio LLM e introduz a resposta validada.
          </p>
        </section>

        <section style={{ marginBottom: "3rem" }}>
          <h2 style={{ fontSize: "1.5rem", fontWeight: 700, borderBottom: "1px solid var(--color-border)", paddingBottom: "0.5rem", marginBottom: "1.5rem" }}>
            4. O que é o BYIA?
          </h2>
          <p style={{ lineHeight: 1.6, color: "var(--color-text-muted)" }}>
            O **Bring Your Own Intelligence Engine (BYIA)** é a garantia de independência. O ResearchAI Hub produz metodologias (Prompts), mas o motor analítico (ChatGPT, Claude, Gemini) é o seu. Esta abordagem preserva a sua privacidade, controlo e garante o acesso aos modelos mais avançados sem constrangimentos de plataforma.
          </p>
        </section>

        <section style={{ marginBottom: "3rem" }}>
          <h2 style={{ fontSize: "1.5rem", fontWeight: 700, borderBottom: "1px solid var(--color-border)", paddingBottom: "0.5rem", marginBottom: "1.5rem" }}>
            5. Researcher ID
          </h2>
          <p style={{ lineHeight: 1.6, color: "var(--color-text-muted)" }}>
            O sistema gera automaticamente um **Researcher ID** local. Este identificador anónimo garante que todas as suas investigações fiquem ligadas entre sessões e constem nos documentos exportados para validar a autoria, sem necessidade de registo cloud.
          </p>
        </section>

        <section style={{ marginBottom: "3rem" }}>
          <h2 style={{ fontSize: "1.5rem", fontWeight: 700, borderBottom: "1px solid var(--color-border)", paddingBottom: "0.5rem", marginBottom: "1.5rem" }}>
            6. Durante a Formação (FAQ Rápido)
          </h2>
          <ul style={{ lineHeight: 1.8, color: "var(--color-text-muted)", paddingLeft: "1.5rem" }}>
            <li><strong>Se fechar o navegador perco o trabalho?</strong> Não. O estado fica guardado no seu armazenamento local.</li>
            <li><strong>Posso utilizar ChatGPT/Claude/Gemini?</strong> Sim, o modo BYIA permite utilizar qualquer Inteligência Artificial da sua preferência.</li>
            <li><strong>Posso editar manualmente?</strong> Sim. O hub encoraja o investigador a editar a resposta da IA. O investigador tem sempre a última palavra.</li>
            <li><strong>Posso voltar atrás?</strong> Sim. Os artefactos ficam guardados e pode revisitar um passo anterior, mas deve proceder com cautela pois isso invalida os passos subsequentes.</li>
            <li><strong>Como recuperar uma investigação?</strong> Através da gestão de Workspaces no Dashboard Principal (disponível brevemente, na versão atual recarregue a aba).</li>
            <li><strong>Como sei que terminei um passo?</strong> O passo só avança quando um documento/artefacto é validado e o botão "Aceitar" é pressionado.</li>
          </ul>
        </section>
        
        <section style={{ marginBottom: "3rem" }}>
          <h2 style={{ fontSize: "1.5rem", fontWeight: 700, borderBottom: "1px solid var(--color-border)", paddingBottom: "0.5rem", marginBottom: "1.5rem" }}>
            7. Exportação
          </h2>
          <p style={{ lineHeight: 1.6, color: "var(--color-text-muted)" }}>
            No último passo (PR-010), após o preenchimento da Checklist Final de Qualidade, a plataforma gera um compilado de todos os artefactos em formato final, anexando o seu Researcher ID, pronto para ser descarregado ou copiado.
          </p>
        </section>
      </div>
    </ProtocolLayout>
  );
}
