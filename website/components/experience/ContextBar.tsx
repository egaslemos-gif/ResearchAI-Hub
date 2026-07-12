"use client";

import { usePathname } from "next/navigation";
import { useResearchSession } from "@/components/workspace/ResearchSessionContext";
import { ChevronRight } from "lucide-react";
import styles from "./ContextBar.module.css";

export function ContextBar() {
  const { session, ready } = useResearchSession();
  const pathname = usePathname();

  if (!ready || session.status !== "active" || !session.researchTopic) {
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
    if (protocolLabel === "Revisão da Literatura" && stepMatch[1] === "1") {
      segments.push("PR-001");
    } else if (protocolLabel === "Revisão da Literatura" && stepMatch[1] === "2") {
      segments.push("PR-002");
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
