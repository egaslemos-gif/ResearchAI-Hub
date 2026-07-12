"use client";
import { FileText, Download, ChevronRight } from "lucide-react";
import styles from "./ArtifactsPanel.module.css";
import Link from "next/link";

const MOCK_ARTIFACTS = [
  { id: "art-01", title: "Matriz de Extração de Dados", protocol: "Revisão da Literatura", date: "Hoje", size: "12 KB" },
  { id: "art-02", title: "Equação de Pesquisa Refinada", protocol: "Revisão da Literatura", date: "Ontem", size: "4 KB" },
  { id: "art-03", title: "Draft da Secção 1", protocol: "Escrita Científica", date: "Há 3 dias", size: "45 KB" },
];

export function ArtifactsPanel() {
  return (
    <div className={styles.wrapper}>
      <div className={styles.header}>
        <div className={styles.titleBlock}>
          <h2 className={styles.title}>Os meus artefactos</h2>
          <span className={styles.subtitle}>Ficheiros gerados pelas ferramentas e protocolos</span>
        </div>
        <Link href="/competencias" className={styles.viewAll}>
          Ver todos <ChevronRight size={14} />
        </Link>
      </div>

      <div className={styles.grid}>
        {MOCK_ARTIFACTS.map((art) => (
          <div key={art.id} className={styles.card}>
            <div className={styles.iconWrap}>
              <FileText size={20} className={styles.icon} />
            </div>
            <div className={styles.info}>
              <span className={styles.artTitle}>{art.title}</span>
              <span className={styles.artMeta}>{art.protocol} • {art.date}</span>
            </div>
            <button className={styles.downloadBtn} aria-label="Descarregar artefacto">
              <Download size={16} />
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
