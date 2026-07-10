"use client";
import { useRouter } from "next/navigation";
import { useResearchContext } from "@/lib/researchContext";
import { Button } from "@/components/ui/Button";
import { Icon } from "@/components/ui/Icon";
import styles from "./WelcomeBackCard.module.css";

export function WelcomeBackCard() {
  const { context, ready, clearContext } = useResearchContext();
  const router = useRouter();

  if (!ready || context.status !== "active" || !context.researchTopic) {
    return null;
  }

  const handleContinue = () => {
    // Se tivermos guardado o protocolId, podíamos redireccionar directamente para ele.
    // O fallback é ir para o protocolo principal ou a página de competências.
    const url = context.protocolId ? `/competencias/${context.protocolId}` : "/competencias";
    router.push(url);
  };

  const handleNew = () => {
    if (confirm("Ao iniciar uma nova investigação, o contexto actual será substituído. Pretende continuar?")) {
      clearContext();
      router.push("/competencias");
    }
  };

  return (
    <div className={styles.card}>
      <div className={styles.meta}>
        <span className="overline">Investigação Atual</span>
      </div>
      <div className={styles.content}>
        <h2 className={styles.title}>{context.researchTopic}</h2>
        {context.studyArea && (
          <p className={styles.subtitle}>{context.studyArea}</p>
        )}
      </div>
      <div className={styles.actions}>
        <Button variant="primary" onClick={handleContinue}>
          <Icon name="play" size={16} /> Continuar
        </Button>
        <Button variant="secondary" onClick={handleNew}>
          Nova investigação
        </Button>
      </div>
    </div>
  );
}
