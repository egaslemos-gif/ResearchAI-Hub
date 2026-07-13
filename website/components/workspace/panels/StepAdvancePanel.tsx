"use client";

import React from "react";
import { useStepData } from "../StepDataContext";
import { StepAdvance } from "../../experience/StepAdvance";

export function StepAdvancePanel() {
  const data = useStepData();

  return (
    <StepAdvance
      slug={data.slug}
      step={data.stepOrder}
      prevHref={data.prevHref}
      nextHref={data.nextHref}
      isLast={data.isLast}
    />
  );
}
