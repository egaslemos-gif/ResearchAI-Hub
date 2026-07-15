"use client";
import { FileText, Download, ChevronRight } from "lucide-react";
import styles from "./ArtifactsPanel.module.css";
import Link from "next/link";
import { useWorkspaceStore } from "@/components/workspace/WorkspaceStoreContext";

const ARTIFACT_LABELS: Record<string, string> = {
  "tema": "Tema de Investigação",
  "pergunta": "Pergunta de Investigação",
  "article-list": "Lista de Artigos",
  "selection": "Seleção de Estudos",
  "reading-cards": "Fichas de Leitura",
  "comparison-table": "Tabela Comparativa",
  "gaps": "Lacunas Identificadas",
  "synthesis": "Síntese Temática",
  "review": "Revisão da Literatura",
  "export": "Documento Exportado",
};

export function ArtifactsPanel({ variant = "home" }: { variant?: "home" | "sidebar" }) {
  const { activeWorkspace } = useWorkspaceStore();

  const artifacts = activeWorkspace?.artifacts ?? {};
  const entries = Object.entries(artifacts).sort(([a], [b]) => Number(a) - Number(b));

  return (
    <div className={`${styles.wrapper} ${variant === "sidebar" ? styles.sidebarVariant : ""}`}>
      {variant === "home" ? (
        <div className={styles.header}>
          <div className={styles.titleBlock}>
            <h2 className={styles.title}>Os meus artefactos</h2>
            <span className={styles.subtitle}>
              {entries.length > 0
                ? `${entries.length} artefacto${entries.length === 1 ? "" : "s"} na investigação ativa`
                : "Nenhum artefacto gerado ainda"}
            </span>
          </div>
          <Link href="/competencias" className={styles.viewAll}>
            Ver todos <ChevronRight size={14} />
          </Link>
        </div>
      ) : (
        <div className={styles.sidebarHeader}>
          <h3 className={styles.sidebarTitle}>Artefactos do Protocolo</h3>
          <span className={styles.subtitle}>
            {entries.length} artefacto(s) gerado(s)
          </span>
        </div>
      )}

      <div className={variant === "sidebar" ? styles.list : styles.grid}>
        {variant === "sidebar" ? (
          // MVP:
          // Sidebar fixa para RL-01.
          // Após MVP será alimentada pelo workflow.json.
          Array.from({ length: 10 }).map((_, i) => {
            const step = i + 1;
            const artifact = artifacts[step];
            const currentStep = activeWorkspace?.currentStep || 1;
            
            // Determinar tipo/nome baseado no passo
            const stepTypes: Record<number, string> = {
              1: "tema", 2: "pergunta", 3: "article-list", 4: "selection", 
              5: "reading-cards", 6: "comparison-table", 7: "gaps", 
              8: "synthesis", 9: "review", 10: "export"
            };
            const type = stepTypes[step];
            const label = ARTIFACT_LABELS[type] || `Passo ${step}`;
            
            // Determinar estado
            let statusIcon = "○";
            let statusColor = "var(--color-text-muted)";
            if (artifact) {
              statusIcon = "✓";
              statusColor = "var(--color-success)";
            } else if (step === currentStep) {
              statusIcon = "⚠";
              statusColor = "var(--color-warning)";
            }

            return (
              <div key={step} className={styles.card} style={{ opacity: artifact ? 1 : step === currentStep ? 0.9 : 0.6 }}>
                <div className={styles.iconWrap} style={{ color: statusColor, fontSize: "1.2rem", fontWeight: "bold", display: "flex", alignItems: "center", justifyContent: "center", width: "24px" }}>
                  {statusIcon}
                </div>
                <div className={styles.info}>
                  <span className={styles.artTitle} style={{ color: artifact ? "var(--color-text)" : "var(--color-text-muted)" }}>{label}</span>
                </div>
                {activeWorkspace?.protocolSlug && (
                  <Link href={`/competencias/${activeWorkspace.protocolSlug}/passo/${step}`} className={styles.consultarBtn}>
                    {artifact ? "Consultar" : step === currentStep ? "Continuar" : "Pendente"}
                  </Link>
                )}
              </div>
            );
          })
        ) : entries.length === 0 ? (
          <div style={{ padding: "var(--space-4)", color: "var(--color-text-muted)", fontSize: "0.8125rem" }}>
            Inicie um protocolo para gerar artefactos.
          </div>
        ) : (
          entries.map(([step, artifact]) => {
            const label = ARTIFACT_LABELS[artifact.type] || artifact.type;
            const data = artifact.data as { createdAt?: string };
            const date = data?.createdAt
              ? new Date(data.createdAt).toLocaleDateString("pt-PT", { day: "numeric", month: "short" })
              : "";
            return (
              <div key={step} className={styles.card}>
                <div className={styles.iconWrap}>
                  <FileText size={20} className={styles.icon} />
                </div>
                <div className={styles.info}>
                  <span className={styles.artTitle}>{label}</span>
                  <span className={styles.artMeta}>Passo {step} • {date}</span>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
