import { ProtocolLayout } from "@/components/layouts/Layouts";
import { Icon } from "@/components/ui/Icon";
import Link from "next/link";

export default function ComoFuncionaPage() {
  const steps = [
    { title: "Criar Investigação", icon: "folder-plus", desc: "No Dashboard, inicie um novo Workspace, indicando o tema e a área." },
    { title: "Selecionar Protocolo", icon: "book-open", desc: "Selecione o protocolo apropriado, como por exemplo, a Revisão da Literatura (RL-01)." },
    { title: "Ler as Instruções do Passo", icon: "info", desc: "Compreenda o objectivo metodológico de cada etapa, sem se preocupar com estética." },
    { title: "Copiar Prompt Científico", icon: "copy", desc: "Copie o prompt estandardizado gerado automaticamente com os seus dados inseridos." },
    { title: "Executar na sua IA Favorita", icon: "bot", desc: "Utilize ChatGPT, Claude, Gemini ou outro modelo da sua preferência. Cole o prompt e obtenha a resposta." },
    { title: "Colar Resposta", icon: "clipboard-paste", desc: "Retorne ao Hub e cole a resposta integral do modelo na área de submissão." },
    { title: "Validar Metodologia", icon: "check-circle", desc: "Analise a saída. Edite o documento diretamente no editor. O motor garante as validações mínimas." },
    { title: "Aceitar e Guardar", icon: "save", desc: "Confirme a qualidade da resposta. O artefacto científico é gerado e fica salvo." },
    { title: "Avançar", icon: "arrow-right", desc: "Siga para a etapa seguinte. O contexto acumula-se de forma inteligente." },
    { title: "Exportar", icon: "download", desc: "Após o último passo e a checklist de qualidade, exporte todos os resultados num formato integral." }
  ];

  return (
    <ProtocolLayout>
      <div style={{ padding: "2rem", maxWidth: "800px", margin: "0 auto", color: "var(--color-text)", fontFamily: "var(--font-primary)" }}>
        <div style={{ marginBottom: "2rem" }}>
          <Link href="/docs" style={{ color: "var(--color-text-muted)", textDecoration: "none", display: "inline-flex", alignItems: "center", gap: "0.5rem", fontSize: "0.875rem" }}>
            <Icon name="arrow-left" size={16} /> Voltar ao Centro de Conhecimento
          </Link>
        </div>
        
        <h1 style={{ fontSize: "2.5rem", fontWeight: 800, marginBottom: "1rem" }}>Como Funciona</h1>
        <p style={{ fontSize: "1.125rem", color: "var(--color-text-muted)", marginBottom: "3rem" }}>
          Fluxo de trabalho e funcionamento do Protocol Driven Research (BYIA).
        </p>

        <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
          {steps.map((step, index) => (
            <div key={index} style={{ display: "flex", alignItems: "flex-start", gap: "1.5rem", background: "var(--color-surface)", padding: "1.5rem", borderRadius: "8px", border: "1px solid var(--color-border)", position: "relative" }}>
              <div style={{ width: "40px", height: "40px", borderRadius: "50%", background: "var(--color-surface-hover)", display: "flex", alignItems: "center", justifyContent: "center", color: "var(--color-primary)", flexShrink: 0, border: "1px solid var(--color-border)" }}>
                <Icon name={step.icon as any} size={20} />
              </div>
              <div>
                <h3 style={{ fontSize: "1.125rem", fontWeight: 600, marginBottom: "0.5rem", display: "flex", alignItems: "center", gap: "0.5rem" }}>
                  <span style={{ fontSize: "0.875rem", color: "var(--color-text-subtle)", fontWeight: 500 }}>Passo {index + 1}</span>
                  {step.title}
                </h3>
                <p style={{ color: "var(--color-text-muted)", lineHeight: 1.5, fontSize: "0.9375rem" }}>{step.desc}</p>
              </div>
              
              {index < steps.length - 1 && (
                <div style={{ position: "absolute", bottom: "-1rem", left: "2.25rem", width: "2px", height: "1rem", background: "var(--color-border)" }} />
              )}
            </div>
          ))}
        </div>
      </div>
    </ProtocolLayout>
  );
}
