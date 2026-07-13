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

export function ArtifactsPanel() {
  const { activeWorkspace } = useWorkspaceStore();

  const artifacts = activeWorkspace?.artifacts ?? {};
  const entries = Object.entries(artifacts).sort(([a], [b]) => Number(a) - Number(b));

  return (
    <div className={styles.wrapper}>
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

      <div className={styles.grid}>
        {entries.length === 0 ? (
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
                  <span className={styles.artMeta}>Passo {step} · {date}</span>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
