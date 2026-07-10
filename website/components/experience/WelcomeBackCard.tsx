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
      <div className={styles.iconWrap}>
        <Icon name="microscope" size={24} />
      </div>
      <div className={styles.content}>
        <h2 className={styles.title}>Bem-vindo novamente.</h2>
        <p className={styles.text}>
          Encontrámos uma investigação em curso sobre <strong>{context.researchTopic}</strong> 
          {context.studyArea ? ` na área de ${context.studyArea}` : ""}.
        </p>
        <div className={styles.actions}>
          <Button variant="primary" onClick={handleContinue}>
            <Icon name="play" size={16} /> Continuar
          </Button>
          <Button variant="secondary" onClick={handleNew}>
            Nova investigação
          </Button>
        </div>
      </div>
    </div>
  );
}
