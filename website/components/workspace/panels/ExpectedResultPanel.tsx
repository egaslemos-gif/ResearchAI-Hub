"use client";

import React from "react";
import { useStepData } from "../StepDataContext";
import styles from "./panels.module.css";

export function ExpectedResultPanel() {
  const data = useStepData();

  if (!data.stepExpectedOutput) return null;

  return (
    <div className={styles.expectedResultPanel}>
      <span className={styles.expectedResultLabel}>Resultado esperado</span>
      <p className={styles.expectedResultText}>{data.stepExpectedOutput}</p>
      {data.stepOutputs.length > 0 && (
        <div className={styles.expectedResultOutputs}>
          <span className={styles.expectedResultOutputsLabel}>Outputs</span>
          {data.stepOutputs.map((out, i) => (
            <span key={i} className={styles.expectedResultOutputTag}>{out}</span>
          ))}
        </div>
      )}
    </div>
  );
}
