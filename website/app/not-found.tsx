import { Button } from "@/components/ui/Button";
import { ui } from "@/lib/labels";
import styles from "./not-found.module.css";

export default function NotFound() {
  return (
    <div className={styles.wrap}>
      <span className="overline">404</span>
      <h1 className={styles.title}>Página não encontrada</h1>
      <p className={styles.text}>
        O conteúdo que procuras não existe ou ainda não está disponível.
      </p>
      <Button href="/" size="lg">
        {ui.actions.backHome}
      </Button>
    </div>
  );
}
