"use client";

import React from "react";
import styles from "./PromptCard.module.css";
import { ResearchMarkdown } from "../ResearchDocument/MarkdownEngine/ResearchMarkdown";

interface PromptViewerProps {
  content: string; // This should be the resolved content
}

export function PromptViewer({ content }: PromptViewerProps) {
  return (
    <div className={styles.viewer}>
      <ResearchMarkdown content={content} />
    </div>
  );
}
