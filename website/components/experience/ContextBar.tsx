"use client";

import { usePathname } from "next/navigation";
import { useWorkspaceStore } from "@/components/workspace/WorkspaceStoreContext";
import { ChevronRight } from "lucide-react";
import styles from "./ContextBar.module.css";

export function ContextBar() {
  const { session, ready } = useWorkspaceStore();
  const pathname = usePathname();

  if (!ready || (session.status !== "READY" && session.status !== "COMPLETED") || !session.researchTopic) {
    return null;
  }

  // Lógica simplificada de Breadcrumb
  const segments = [];
  segments.push("Investigação");

  // Determinar Protocolo
  let protocolLabel = "";
  if (pathname.includes("/RL-01") || pathname.includes("/revisao-da-literatura")) {
    protocolLabel = "Revisão da Literatura";
  }
  
  if (protocolLabel) {
    segments.push(protocolLabel);
  }

  // Determinar Passo
  const stepMatch = pathname.match(/passo\/(\d+)/);
  if (stepMatch) {
    segments.push(`Passo ${stepMatch[1]}`);
    if (protocolLabel === "Revisão da Literatura") {
      const stepNum = parseInt(stepMatch[1], 10);
      const prCode = `PR-${String(stepNum).padStart(3, '0')}`;
      segments.push(prCode);
    }
  } else if (pathname.endsWith("/checklist")) {
    segments.push("Checklist");
  }

  return (
    <div className={styles.bar}>
      <div className={styles.content}>
        {segments.map((segment, index) => (
          <div key={index} className={styles.segment}>
            <span className={styles.label}>{segment}</span>
            {index < segments.length - 1 && (
              <ChevronRight size={12} className={styles.separator} />
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
