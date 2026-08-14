import { createFileRoute } from "@tanstack/react-router";
import { AppShell } from "@/components/circuit/AppShell";
import { CapacityRail, Panel, Stat, inr } from "@/components/circuit/primitives";
import { useCircuit } from "@/lib/circuit/useCircuit";

export const Route = createFileRoute("/analytics")({
  head: () => ({
    meta: [
      { title: "Utilization Analytics — CIRCUIT Network Report" },
      {
        name: "description",
        content:
          "Network utilization recovery, recovered revenue and CO₂ avoided across the CIRCUIT capacity exchange.",
      },
      { property: "og:title", content: "Utilization Analytics — CIRCUIT" },
      {
        property: "og:description",
        content: "Utilization recovery, recovered revenue and CO₂ avoided across the network.",
      },
    ],
  }),
  component: AnalyticsPage,
});

function AnalyticsPage() {
  const { ready, State } = useCircuit();

  if (!ready) {
    return (
      <AppShell section="ANALYTICS" page="REPORT">
        <div className="label-sys">LOADING REPORT…</div>
      </AppShell>
    );
  }

  const m = State.getDashboardMetrics();
  const capacities = State.getCapacities();

  return (
    <AppShell section="ANALYTICS" page="UTILIZATION REPORT">
      <div className="mb-4 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <Stat label="RECOVERED REVENUE" value={inr(m.potentialRevenue)} tone="green" />
        <Stat label="CAPACITY RECOVERED" value={`+${m.capacityRecovered}%`} tone="cyan" />
        <Stat label="CO₂ AVOIDED" value={`${m.co2Avoided} KG`} />
        <Stat label="SUCCESSFUL MATCHES" value={String(m.successfulMatches)} />
      </div>

      <div className="grid gap-4 xl:grid-cols-[minmax(0,1fr)_minmax(0,1fr)]">
        <Panel title="UTILIZATION SHIFT" meta="BEFORE / AFTER CIRCUIT">
          <div className="space-y-6">
            {[
              { label: "BEFORE CIRCUIT", value: m.utilizationBefore, tone: "amber" as const },
              { label: "AFTER CIRCUIT", value: m.utilizationAfter, tone: "green" as const },
            ].map((row) => (
              <div key={row.label}>
                <div className="grid grid-cols-[minmax(0,1fr)_auto] items-baseline gap-3">
                  <span className="label-sys truncate">{row.label}</span>
                  <span
                    className={`shrink-0 font-mono text-xl ${
                      row.tone === "green" ? "text-signal-green" : "text-signal-amber"
                    }`}
                  >
                    {row.value}%
                  </span>
                </div>
                <div className="mt-2 h-2 w-full overflow-hidden rounded-[2px] bg-background">
                  <div
                    className={`h-full ${
                      row.tone === "green" ? "bg-signal-green" : "bg-signal-amber"
                    }`}
                    style={{ width: `${row.value}%` }}
                  />
                </div>
              </div>
            ))}
            <p className="border-t border-border pt-4 font-mono text-[11px] leading-relaxed text-muted-foreground">
              CIRCUIT reclaims {m.capacityRecovered}% of previously empty payload across{" "}
              {m.activeCapacity} active vehicles, worth {inr(m.platformRevenue)} in platform revenue.
            </p>
          </div>
        </Panel>

        <Panel title="FLEET LOAD PROFILE" meta={`${capacities.length} VEHICLES`}>
          <div className="space-y-5">
            {capacities.map((c: any) => (
              <CapacityRail
                key={c.id}
                vehicleId={c.vehicleId}
                total={c.totalCapacity}
                load={c.currentLoad}
              />
            ))}
          </div>
        </Panel>
      </div>
    </AppShell>
  );
}
