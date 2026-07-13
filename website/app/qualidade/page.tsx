import fs from "node:fs";
import path from "node:path";
import { QualityDashboard, type QualityRun } from "./QualityDashboard";

// Read the generated quality reports fresh on every request (dev tool surface).
export const dynamic = "force-dynamic";

export const metadata = {
  title: "Qualidade Científica — RL-01 | ResearchAI Hub",
  description: "Dashboard de qualidade científica dos artefactos produzidos pelo protocolo RL-01.",
};

function loadRuns(): QualityRun[] {
  const dir = path.join(process.cwd(), "quality", "runs");
  if (!fs.existsSync(dir)) return [];
  return fs
    .readdirSync(dir)
    .filter((f) => f.endsWith(".json"))
    .map((f) => {
      try {
        return JSON.parse(fs.readFileSync(path.join(dir, f), "utf8")) as QualityRun;
      } catch {
        return null;
      }
    })
    .filter((r): r is QualityRun => !!r)
    .sort((a, b) => (a.timestamp < b.timestamp ? 1 : -1));
}

export default function QualidadePage() {
  return <QualityDashboard runs={loadRuns()} />;
}
