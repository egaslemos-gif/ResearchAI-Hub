"use client";
import { useRouter } from "next/navigation";
import { useResearchSession } from "@/components/workspace/ResearchSessionContext";
import { Button } from "@/components/ui/Button";
import { Icon } from "@/components/ui/Icon";
import { ui } from "@/lib/labels";
import styles from "./StepAdvance.module.css";

/** Barra de acção do passo: marca o passo como concluído e avança. */
export function StepAdvance({
  slug,
  step,
  prevHref,
  nextHref,
  isLast,
}: {
  slug: string;
  step: number;
  prevHref: string;
  nextHref: string;
  isLast: boolean;
}) {
  const router = useRouter();
  const { updateSession, advanceStepState } = useResearchSession();

  const advance = () => {
    advanceStepState(step, "Completed");
    if (!isLast) {
      updateSession({ currentStep: step + 1 });
    }
    router.push(nextHref);
  };

  return (
    <div className={styles.bar}>
      <Button variant="ghost" href={prevHref}>
        <Icon name="arrow-left" size={16} />
        {ui.actions.previous}
      </Button>
      <Button variant="primary" onClick={advance}>
        {isLast ? ui.actions.finishToChecklist : ui.actions.next}
        <Icon name="arrow-right" size={16} />
      </Button>
    </div>
  );
}
