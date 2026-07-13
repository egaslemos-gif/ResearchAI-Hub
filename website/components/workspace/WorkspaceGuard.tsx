"use client";

import React from "react";
import { useRouter } from "next/navigation";
import { useWorkspaceStore } from "./WorkspaceStoreContext";
import { isWorkspaceReady } from "@/lib/WorkspaceFactory";
import styles from "./WorkspaceGuard.module.css";

/* ============================================================
   WorkspaceGuard — REGRA 7: Guard clause in all protocols

   If workspace is not READY (or COMPLETED with data),
   do not render the protocol. Show error + redirect link.

   This protects every protocol from consuming an invalid workspace,
   even if a future bug allows navigation past the gate.
   ============================================================ */

interface WorkspaceGuardProps {
  children: React.ReactNode;
}

export function WorkspaceGuard({ children }: WorkspaceGuardProps) {
  const { activeWorkspace, ready } = useWorkspaceStore();
  const router = useRouter();

  if (!ready) {
    return (
      <div className={styles.guardContainer}>
        <div className={styles.guardCard}>
          <span className={styles.guardIcon}>⏳</span>
          <span className={styles.guardTitle}>A carregar…</span>
        </div>
      </div>
    );
  }

  if (!isWorkspaceReady(activeWorkspace)) {
    return (
      <div className={styles.guardContainer}>
        <div className={styles.guardCard}>
          <span className={styles.guardIcon}>⚠</span>
          <span className={styles.guardTitle}>Workspace inválido</span>
          <span className={styles.guardText}>
            Não existe uma investigação válida ativa. Crie ou escolha uma investigação para começar.
          </span>
          <div style={{ display: "flex", gap: "var(--space-3)", flexWrap: "wrap", justifyContent: "center" }}>
            <button
              className={styles.guardButton}
              onClick={() => router.push("/competencias/revisao-da-literatura")}
            >
              Criar ou escolher investigação
            </button>
            <button
              className={styles.guardButton}
              style={{ background: "transparent", color: "var(--color-text-muted)" }}
              onClick={() => router.push("/")}
            >
              ← Início
            </button>
          </div>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}
