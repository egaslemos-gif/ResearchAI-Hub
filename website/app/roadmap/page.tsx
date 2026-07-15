import { ProtocolLayout } from "@/components/layouts/Layouts";
import { RESEARCH_NEEDS } from "@/lib/researchNeeds";
import { Icon } from "@/components/ui/Icon";

export default function RoadmapPage() {
  const upcoming = RESEARCH_NEEDS.filter(n => n.status !== "available");

  return (
    <ProtocolLayout>
      <div style={{ padding: "2rem", maxWidth: "800px", margin: "0 auto", color: "var(--color-text)", fontFamily: "var(--font-primary)" }}>
        <h1 style={{ fontSize: "2.5rem", fontWeight: 800, marginBottom: "1rem" }}>Roadmap</h1>
        <p style={{ fontSize: "1.125rem", color: "var(--color-text-muted)", marginBottom: "3rem" }}>
          Protocolos científicos e competências planeadas para futuras versões.
        </p>

        <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
          {upcoming.map((need) => (
            <div key={need.id} style={{ display: "flex", alignItems: "flex-start", gap: "1.5rem", background: "var(--color-surface)", padding: "1.5rem", borderRadius: "8px", border: "1px dashed var(--color-border)" }}>
              <div style={{ width: "40px", height: "40px", borderRadius: "50%", background: "var(--color-surface-hover)", display: "flex", alignItems: "center", justifyContent: "center", color: "var(--color-text-subtle)", flexShrink: 0 }}>
                <Icon name={need.iconName as any} size={20} />
              </div>
              <div>
                <h3 style={{ fontSize: "1.125rem", fontWeight: 600, marginBottom: "0.5rem" }}>{need.title}</h3>
                <p style={{ color: "var(--color-text-muted)", lineHeight: 1.5, fontSize: "0.9375rem", marginBottom: "1rem" }}>{need.description}</p>
                <span style={{ fontSize: "0.75rem", padding: "4px 10px", borderRadius: "999px", border: "1px dashed var(--color-border)", color: "var(--color-text-subtle)", fontWeight: 600, letterSpacing: "0.05em" }}>PLANEADO</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </ProtocolLayout>
  );
}
