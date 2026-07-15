"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { useWorkspaceStore } from "@/components/workspace/WorkspaceStoreContext";
import { Button } from "@/components/ui/Button";
import { Icon } from "@/components/ui/Icon";
import { Plus, FolderOpen, X } from "lucide-react";
import { EXECUTION_CATALOG, ENGINE_CATEGORY_LABELS, getEngineActionLabel, type ExecutionProviderConfig } from "@/lib/ScientificExecutionEngine";
import { validateWorkspaceInput } from "@/lib/WorkspaceFactory";
import styles from "./StartProtocolButton.module.css";

interface StartProtocolButtonProps {
  slug: string;
  step?: number;
  variant?: "primary" | "secondary";
  size?: "sm" | "md" | "lg";
  label?: string;
  showIcon?: boolean;
}

export function StartProtocolButton({
  slug,
  step = 1,
  variant = "primary",
  size = "md",
  label = "Começar Guia Prático",
  showIcon = true,
}: StartProtocolButtonProps) {
  const router = useRouter();
  const {
    workspaces,
    activeWorkspace,
    ready,
    createWorkspace,
    setActiveWorkspace,
  } = useWorkspaceStore();
  const [showGate, setShowGate] = useState(false);
  const [showCreate, setShowCreate] = useState(false);
  const [newTitle, setNewTitle] = useState("");
  const [newArea, setNewArea] = useState("");
  const [newLevel, setNewLevel] = useState("mestrado");
  const [execProvider, setExecProvider] = useState<ExecutionProviderConfig>({ type: "cloud", assistantId: "researchai-cloud" });

  const targetHref = `/competencias/${slug}/passo/${step}`;

  const handleClick = () => {
    if (!ready) return;

    // If there's an active workspace, navigate directly
    if (activeWorkspace && (activeWorkspace.status === "READY" || activeWorkspace.status === "COMPLETED")) {
      router.push(targetHref);
      return;
    }

    // No active workspace — show gate
    setShowGate(true);
  };

  const handleSelectExisting = (id: string) => {
    setActiveWorkspace(id);
    setShowGate(false);
    router.push(targetHref);
  };

  const handleCreate = () => {
    try {
      const newId = createWorkspace({
        title: newTitle,
        protocolSlug: slug,
        studyArea: newArea,
        academicLevel: newLevel,
        researchTopic: newTitle,
        executionProvider: execProvider,
      });
      setActiveWorkspace(newId);
    } catch (e) {
      console.error("[StartProtocolButton] Failed to create workspace:", e);
      return;
    }
    setShowCreate(false);
    setShowGate(false);
    setNewTitle("");
    setNewArea("");
    // Delay navigation to ensure React state is committed
    setTimeout(() => {
      router.push(targetHref);
    }, 50);
  };

  const formValidation = validateWorkspaceInput({
    title: newTitle,
    protocolSlug: slug,
    studyArea: newArea,
    researchTopic: newTitle,
    academicLevel: newLevel,
    executionProvider: execProvider,
  });
  const canCreate = formValidation.valid;

  const availableWorkspaces = workspaces.filter((w) => w.status === "READY" || w.status === "COMPLETED");

  return (
    <>
      <Button variant={variant} size={size} onClick={handleClick}>
        {label}
        {showIcon && <Icon name="arrow-right" size={size === "lg" ? 18 : 16} />}
      </Button>

      {showGate && (
        <div className={styles.overlay} onClick={() => setShowGate(false)}>
          <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
            <button className={styles.closeBtn} onClick={() => setShowGate(false)}>
              <X size={20} />
            </button>

            {!showCreate ? (
              <>
                <h2 className={styles.modalTitle}>Investigação</h2>
                <p className={styles.modalDesc}>
                  Não existe nenhuma investigação ativa. Escolha uma existente ou crie uma nova.
                </p>

                <div className={styles.options}>
                  <button className={styles.optionBtn} onClick={() => setShowCreate(true)}>
                    <Plus size={20} />
                    <span>Criar nova investigação</span>
                  </button>

                  {availableWorkspaces.length > 0 && (
                    <div className={styles.existingList}>
                      <span className={styles.existingLabel}>Investigações existentes</span>
                      {availableWorkspaces.map((ws) => (
                        <button
                          key={ws.id}
                          className={styles.existingItem}
                          onClick={() => handleSelectExisting(ws.id)}
                        >
                          <FolderOpen size={16} />
                          <div className={styles.existingInfo}>
                            <span className={styles.existingTitle}>{ws.title}</span>
                            <span className={styles.existingMeta}>
                              {ws.studyArea || "Sem área"} · Passo {ws.currentStep || 1}
                            </span>
                          </div>
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              </>
            ) : (
              <>
                <h2 className={styles.modalTitle}>Nova investigação</h2>
                <div className={styles.form}>
                  <div className={styles.formRow}>
                    <input
                      className={styles.input}
                      type="text"
                      placeholder="Tema de investigação"
                      value={newTitle}
                      onChange={(e) => setNewTitle(e.target.value)}
                      autoFocus
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

                  <div className={styles.formActions}>
                    <Button variant="secondary" size="sm" onClick={() => setShowCreate(false)}>
                      Voltar
                    </Button>
                    <Button
                      variant="primary"
                      size="sm"
                      onClick={handleCreate}
                      disabled={!canCreate}
                    >
                      Criar e começar
                    </Button>
                  </div>
                  {!canCreate && (newTitle || newArea) && (
                    <div className={styles.validationHint}>
                      {formValidation.errors[0]}
                    </div>
                  )}
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </>
  );
}
