"use client";
import { useMemo, useState } from "react";
import { Copy, Check } from "lucide-react";
import ReactMarkdown from "react-markdown";
import rehypeRaw from "rehype-raw";
import { useWorkspaceStore } from "./WorkspaceStoreContext";
import { ui } from "@/lib/labels";
import styles from "./DocumentViewer.module.css";

const TOKEN = /\{\{\s*([\w.-]+)\s*\}\}/g;

/**
 * Visualizador de Documentos rico, agnóstico. 
 * Substitui o antigo PromptCanvas. Renderiza markdown e preenche variáveis via WorkspaceContext.
 */
export function DocumentViewer({ body }: { body: string }) {
  const [copied, setCopied] = useState(false);
  const { session } = useWorkspaceStore();
  const step = session.currentStep || 1;
  const documentProperties = session.progress?.[step]?.variables || {};

  const getResolvedValue = (name: string) => {
    return documentProperties[name] || (session as any)[name];
  };

  const filledTextForCopy = useMemo(() => {
    TOKEN.lastIndex = 0;
    return body.replace(TOKEN, (_all, name) => getResolvedValue(name) || `{{${name}}}`);
  }, [body, documentProperties, session]);

  const markdownText = useMemo(() => {
    TOKEN.lastIndex = 0;
    return body.replace(TOKEN, (_all, name) => {
      const val = getResolvedValue(name);
      if (val) {
        return `<span class="${styles.filled}">${val}</span>`;
      }
      return `<span class="${styles.token}">{{${name}}}</span>`;
    });
  }, [body, documentProperties, session]);

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(filledTextForCopy);
      setCopied(true);
      setTimeout(() => setCopied(false), 1600);
    } catch {
      /* ignora */
    }
  };

  return (
    <div className={styles.documentViewer}>
      <button 
        type="button" 
        className={styles.copyBtn} 
        onClick={copy} 
        title="Copiar prompt"
      >
        {copied ? <Check size={16} /> : <Copy size={16} />}
      </button>
      <div className={styles.prose}>
        <ReactMarkdown rehypePlugins={[rehypeRaw]}>{markdownText}</ReactMarkdown>
      </div>
    </div>
  );
}
