"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useWorkspaceStore } from "@/components/workspace/WorkspaceStoreContext";
import { Button } from "@/components/ui/Button";
import { Icon } from "@/components/ui/Icon";
import { MoreHorizontal, Plus, Archive, Copy, Trash2, Play } from "lucide-react";
import { EXECUTION_CATALOG, ENGINE_CATEGORY_LABELS, getEngineActionLabel, type ExecutionProviderConfig } from "@/lib/ScientificExecutionEngine";
import { validateWorkspaceInput } from "@/lib/WorkspaceFactory";
import styles from "./WorkspaceManager.module.css";

export function WorkspaceManager() {
  const {
    workspaces,
    activeWorkspace,
    ready,
    createWorkspace,
    setActiveWorkspace,
    archiveWorkspace,
    duplicateWorkspace,
    deleteWorkspace,
  } = useWorkspaceStore();
  const router = useRouter();
  const [menuId, setMenuId] = useState<string | null>(null);
  const [showCreate, setShowCreate] = useState(false);

  // Close dropdown when clicking outside
  useEffect(() => {
    if (!menuId) return;
    const handleClickOutside = () => setMenuId(null);
    document.addEventListener("click", handleClickOutside);
    return () => document.removeEventListener("click", handleClickOutside);
  }, [menuId]);
  const [newTitle, setNewTitle] = useState("");
  const [newArea, setNewArea] = useState("");
  const [newLevel, setNewLevel] = useState("mestrado");
  const [execProvider, setExecProvider] = useState<ExecutionProviderConfig>({ type: "cloud", assistantId: "researchai-cloud" });

  if (!ready) return null;

  const activeWorkspaces = workspaces.filter((w) => w.status === "READY" || w.status === "COMPLETED");
  const archivedWorkspaces = workspaces.filter((w) => w.status === "ARCHIVED");

  const handleCreate = () => {
    try {
      createWorkspace({
        title: newTitle,
        protocolSlug: "revisao-da-literatura",
        studyArea: newArea,
        academicLevel: newLevel,
        researchTopic: newTitle,
        executionProvider: execProvider,
      });
    } catch (e) {
      console.error("[WorkspaceManager] Failed to create workspace:", e);
      return;
    }
    setShowCreate(false);
    setNewTitle("");
    setNewArea("");
    // Delay navigation to ensure React state is committed
    setTimeout(() => {
      router.push(`/competencias/revisao-da-literatura/passo/1`);
    }, 50);
  };

  const formValidation = validateWorkspaceInput({
    title: newTitle,
    protocolSlug: "revisao-da-literatura",
    studyArea: newArea,
    researchTopic: newTitle,
    academicLevel: newLevel,
    executionProvider: execProvider,
  });
  const canCreate = formValidation.valid;

  const handleResume = (id: string, protocolSlug: string, step: number) => {
    setActiveWorkspace(id);
    router.push(`/competencias/${protocolSlug}/passo/${step}`);
  };

  const handleDuplicate = (id: string) => {
    duplicateWorkspace(id);
    setMenuId(null);
  };

  const handleArchive = (id: string) => {
    archiveWorkspace(id);
    setMenuId(null);
  };

  const handleDelete = (id: string) => {
    if (confirm("Eliminar este workspace? Esta ação não pode ser desfeita.")) {
      deleteWorkspace(id);
    }
    setMenuId(null);
  };

  return (
    <div className={styles.wrapper}>
      <div className={styles.header}>
        <div>
          <h2 className={styles.title}>As minhas investigações</h2>
          <span className={styles.subtitle}>
            {activeWorkspaces.length} ativa{activeWorkspaces.length === 1 ? "" : "s"}
            {archivedWorkspaces.length > 0 && ` · ${archivedWorkspaces.length} arquivada${archivedWorkspaces.length === 1 ? "" : "s"}`}
          </span>
        </div>
        <Button variant="primary" size="sm" onClick={() => setShowCreate(!showCreate)}>
          <Plus size={16} /> Nova investigação
        </Button>
      </div>

      {showCreate && (
        <div className={styles.createForm}>
          <div className={styles.formRow}>
            <input
              className={styles.input}
              type="text"
              placeholder="Tema de investigação"
              value={newTitle}
              onChange={(e) => setNewTitle(e.target.value)}
            />
            <input
              className={styles.input}
              type="text"
              placeholder="Área de estudo (ex: Educação, Saúde, Tecnologia)"
              value={newArea}
              onChange={(e) => setNewArea(e.target.value)}
            />
          </div>
          <select
            className={styles.select}
            value={newLevel}
            onChange={(e) => setNewLevel(e.target.value)}
          >
            <option value="licenciatura">Licenciatura</option>
            <option value="mestrado">Mestrado</option>
            <option value="doutoramento">Doutoramento</option>
          </select>

          <div className={styles.executionProfiles}>
            <span className={styles.profilesLabel}>Ambiente de Trabalho</span>
            {(["cloud", "external", "local"] as const).map((catType) => {
              const catEngines = EXECUTION_CATALOG.filter((e) => e.type === catType);
              if (catEngines.length === 0) return null;
              return (
                <div key={catType} className={styles.profileCategory}>
                  <span className={styles.profileCategoryLabel}>{ENGINE_CATEGORY_LABELS[catType]}</span>
                  <div className={styles.profilesGrid}>
                    {catEngines.map((engine) => (
                      <button
                        key={engine.id}
                        className={`${styles.profileCard} ${execProvider.assistantId === engine.id ? styles.profileCardActive : ""}`}
                        onClick={() => setExecProvider({ type: engine.type, assistantId: engine.id })}
                        type="button"
                      >
                        <span className={styles.profileIcon}>{engine.icon}</span>
                        <span className={styles.profileTitle}>{engine.label}</span>
                        <span className={styles.profileSubtitle}>{engine.description}</span>
                        {engine.models && engine.models.length > 0 && (
                          <span className={styles.profileModels}>{engine.models.join(" · ")}</span>
                        )}
                        {engine.capabilities && engine.capabilities.length > 0 && (
                          <span className={styles.profileCapabilities}>
                            {engine.capabilities.map((c) => (
                              <span key={c} className={styles.capabilityTag}>✔ {c}</span>
                            ))}
                          </span>
                        )}
                        {engine.recommended && (
                          <span className={styles.profileBadge}>✓ Recomendado</span>
                        )}
                        <span className={styles.profileAction}>{getEngineActionLabel(engine.id)}</span>
                      </button>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>

          <div className={styles.createActions}>
            <Button variant="secondary" size="sm" onClick={() => setShowCreate(false)}>Cancelar</Button>
            <Button variant="primary" size="sm" onClick={handleCreate} disabled={!canCreate}>Criar e começar</Button>
          </div>
          {!canCreate && (newTitle || newArea) && (
            <div className={styles.validationHint}>
              {formValidation.errors[0]}
            </div>
          )}
        </div>
      )}

      {activeWorkspaces.length === 0 && !showCreate && (
        <div className={styles.empty}>
          <span className={styles.emptyTitle}>Nenhuma investigação ativa</span>
          <span className={styles.emptyText}>Crie uma nova investigação para começar a usar os protocolos.</span>
        </div>
      )}

      <div className={styles.list}>
        {activeWorkspaces.map((ws) => {
          const stepCount = Object.keys(ws.progress || {}).length;
          const completedSteps = Object.values(ws.progress || {}).filter(p => p.status === "Completed").length;
          const progress = stepCount > 0 ? Math.round((completedSteps / 10) * 100) : 0;

          return (
            <div key={ws.id} className={`${styles.card} ${ws.id === activeWorkspace?.id ? styles.cardActive : ""}`}>
              <div className={styles.cardMain} onClick={() => handleResume(ws.id, ws.protocolSlug || "revisao-da-literatura", ws.currentStep || 1)}>
                <div className={styles.cardIcon}>
                  <Play size={18} />
                </div>
                <div className={styles.cardInfo}>
                  <span className={styles.cardTitle}>{ws.title}</span>
                  <span className={styles.cardMeta}>
                    {ws.studyArea && `${ws.studyArea} · `}
                    Passo {ws.currentStep || 1} de 10 · {progress}% concluído
                  </span>
                  <div className={styles.progressBar}>
                    <div className={styles.progressFill} style={{ width: `${progress}%` }} />
                  </div>
                </div>
              </div>
              <div className={styles.cardActions}>
                <button
                  className={styles.menuBtn}
                  onClick={(e) => { e.stopPropagation(); setMenuId(menuId === ws.id ? null : ws.id); }}
                  aria-label="Mais opções"
                >
                  <MoreHorizontal size={18} />
                </button>
                {menuId === ws.id && (
                  <div className={styles.dropdown} onClick={(e) => e.stopPropagation()}>
                    <button className={styles.dropdownItem} onClick={() => handleDuplicate(ws.id)}>
                      <Copy size={14} /> Duplicar
                    </button>
                    <button className={styles.dropdownItem} onClick={() => handleArchive(ws.id)}>
                      <Archive size={14} /> Arquivar
                    </button>
                    <button className={`${styles.dropdownItem} ${styles.dropdownDanger}`} onClick={() => handleDelete(ws.id)}>
                      <Trash2 size={14} /> Eliminar
                    </button>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {archivedWorkspaces.length > 0 && (
        <details className={styles.archivedSection}>
          <summary className={styles.archivedHeader}>
            Arquivadas ({archivedWorkspaces.length})
          </summary>
          <div className={styles.list}>
            {archivedWorkspaces.map((ws) => (
              <div key={ws.id} className={`${styles.card} ${styles.cardArchived}`}>
                <div className={styles.cardInfo}>
                  <span className={styles.cardTitle}>{ws.title}</span>
                  <span className={styles.cardMeta}>Arquivada em {new Date(ws.updatedAt).toLocaleDateString("pt-PT")}</span>
                </div>
                <div className={styles.cardActions}>
                  <button
                    className={styles.menuBtn}
                    onClick={(e) => { e.stopPropagation(); setMenuId(menuId === ws.id ? null : ws.id); }}
                    aria-label="Mais opções"
                  >
                    <MoreHorizontal size={18} />
                  </button>
                  {menuId === ws.id && (
                    <div className={styles.dropdown} onClick={(e) => e.stopPropagation()}>
                      <button className={styles.dropdownItem} onClick={() => handleDelete(ws.id)}>
                        <Trash2 size={14} /> Eliminar
                      </button>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </details>
      )}
    </div>
  );
}
