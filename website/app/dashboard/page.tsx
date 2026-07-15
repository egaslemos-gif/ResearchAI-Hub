import { getTools, getPrompts } from "@/lib/content";
import { WorkspaceManager } from "@/components/home/WorkspaceManager";
import { EcosystemGrid } from "@/components/home/EcosystemGrid";
import { ArtifactsPanel } from "@/components/home/ArtifactsPanel";
import { RecentActivityPanel } from "@/components/home/RecentActivityPanel";
import { RoadmapPanel } from "@/components/home/RoadmapPanel";
import { ProtocolLayout } from "@/components/layouts/Layouts";
import styles from "./dashboard.module.css";

export default function DashboardPage() {
  const tools = getTools();
  const prompts = getPrompts();

  return (
    <ProtocolLayout>
      <div className={styles.pageContent}>
        <WorkspaceManager />

        <section className={styles.section}>
          <div className={styles.sectionHead}>
            <div>
              <h2 className={styles.sectionTitle}>Protocolos Ativos</h2>
            </div>
          </div>
          <EcosystemGrid />
        </section>

        <ArtifactsPanel />
        
        <RecentActivityPanel />
        
        <RoadmapPanel />
      </div>
    </ProtocolLayout>
  );
}
