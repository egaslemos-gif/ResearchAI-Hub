"use client";

import React from "react";
import { useStepData } from "../workspace/StepDataContext";
import { TemaArtifactEditor } from "./TemaArtifactEditor";
import { PerguntaArtifactEditor } from "./PerguntaArtifactEditor";
import { ArticleListEditor } from "./ArticleListEditor";
import { SelectionEditor } from "./SelectionEditor";
import { ReadingCardsEditor } from "./ReadingCardsEditor";
import { ComparisonTableEditor } from "./ComparisonTableEditor";
import { GapsEditor } from "./GapsEditor";
import { SynthesisEditor } from "./SynthesisEditor";
import { ReviewEditor } from "./ReviewEditor";
import { ExportEditor } from "./ExportEditor";

export function ArtifactEditorDispatcher() {
  const data = useStepData();

  switch (data.stepOrder) {
    case 1:
      return <TemaArtifactEditor stepOrder={data.stepOrder} />;
    case 2:
      return <PerguntaArtifactEditor stepOrder={data.stepOrder} />;
    case 3:
      return <ArticleListEditor stepOrder={data.stepOrder} />;
    case 4:
      return <SelectionEditor stepOrder={data.stepOrder} />;
    case 5:
      return <ReadingCardsEditor stepOrder={data.stepOrder} />;
    case 6:
      return <ComparisonTableEditor stepOrder={data.stepOrder} />;
    case 7:
      return <GapsEditor stepOrder={data.stepOrder} />;
    case 8:
      return <SynthesisEditor stepOrder={data.stepOrder} />;
    case 9:
      return <ReviewEditor stepOrder={data.stepOrder} />;
    case 10:
      return <ExportEditor stepOrder={data.stepOrder} />;
    default:
      return (
        <div style={{ padding: "var(--space-4)", color: "var(--color-text-muted)", fontSize: "0.75rem" }}>
          Editor de artefactos para o passo {data.stepOrder} será implementado na próxima fase.
        </div>
      );
  }
}
