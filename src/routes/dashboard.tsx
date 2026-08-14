import { createFileRoute, Link } from "@tanstack/react-router";
import { Zap } from "lucide-react";
import { AppShell } from "@/components/circuit/AppShell";
import { NetworkMap, type NetworkEdge } from "@/components/circuit/NetworkMap";
import {
  CapacityRail,
  CountUp,
  EmptyState,
  Panel,
  RouteLine,
  Stat,
  StatusDot,
  inr,
} from "@/components/circuit/primitives";
import { useCircuit } from "@/lib/circuit/useCircuit";
import { MatchingEngine } from "@/lib/circuit/matching-engine.js";

export const Route = createFileRoute("/dashboard")({
  head: () => ({
    meta: [
      { title: "Operations Overview — CIRCUIT Capacity Console" },
      {
        name: "description",
        content:
          "Live operations overview: capacity network, detected opportunities and utilization across your fleet.",
      },
      { property: "og:title", content: "Operations Overview — CIRCUIT" },
      {
        property: "og:description",
        content: "Live capacity network, detected opportunities and fleet utilization.",
      },
    ],
  }),
  component: DashboardPage,
});

function DashboardPage() {
  const { ready, State } = useCircuit();

  if (!ready) {
    return (
      <AppShell section="OPERATIONS" page="OVERVIEW">
        <div className="label-sys">LOADING SIGNALS…</div>
      </AppShell>
    );
  }

  const metrics = State.getDashboardMetrics();
  const capacities = State.getCapacities();
  const opportunities = State.getOpportunities();
  const top = opportunities[0];

  const edges: NetworkEdge[] = capacities.slice(0, 5).map((c: any) => ({
    id: c.id,
    from: MatchingEngine.normalizeCity(c.source),
    to: MatchingEngine.normalizeCity(c.destination),
    openTonnes: c.unusedCapacity ?? c.totalCapacity - c.currentLoad,
    vehicleId: c.vehicleId,
    matched: c.status === "matched",
  }));

  return (
    <AppShell
      section="OPERATIONS"
      page="OVERVIEW"
      actions={
        <div className="flex items-center gap-2">
          <StatusDot />
          <span className="label-sys hidden sm:block">CIRCUIT MONITORING</span>
        </div>
      }
    >
      {/* KPI rail */}
      <div className="grid grid-cols-2 divide-border border border-border bg-surface sm:grid-cols-3 lg:grid-cols-5 lg:divide-x rounded-lg">
        <Stat label="POTENTIAL REVENUE" value={<CountUp value={metrics.potentialRevenue} prefix="₹" />} tone="green" />
        <Stat label="CAPACITY RECOVERED" value={<CountUp value={metrics.capacityRecovered} suffix="%" />} tone="cyan" />
        <Stat label="ACTIVE VEHICLES" value={<CountUp value={metrics.activeCapacity} />} />
        <Stat label="CIRCUIT MATCHES" value={<CountUp value={metrics.aiMatches} />} tone="amber" />
        <Stat
          label="CO₂ AVOIDED"
          value={<CountUp value={metrics.co2Avoided} decimals={1} suffix=" KG" />}
          hint="Estimated · demo calculation"
        />
      </div>

      {/* Network centerpiece */}
      <Panel
        className="mt-4"
        title="CAPACITY NETWORK"
        meta={`${edges.length} ACTIVE LANES`}
        bodyClassName="p-2 sm:p-4"
      >
        <NetworkMap edges={edges} />
      </Panel>

      <div className="mt-4 grid gap-4 lg:grid-cols-[minmax(0,1.4fr)_minmax(0,1fr)]">
        {/* Opportunity signal */}
        {top ? (
          <section className="border border-signal-amber/40 bg-surface rounded-lg">
            <header className="flex items-center gap-2 border-b border-border px-4 py-2.5">
              <Zap className="size-3.5 text-signal-amber" aria-hidden />
              <span className="font-mono text-[10px] uppercase tracking-[0.18em] text-signal-amber">
                OPPORTUNITY DETECTED
              </span>
            </header>
            <div className="space-y-4 p-4">
              <div className="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-4">
                <span className="truncate font-mono text-sm">{top.capacity.vehicleId}</span>
                <span className="label-sys shrink-0">
                  {top.capacity.source.toUpperCase()} → {top.capacity.destination.toUpperCase()}
                </span>
              </div>
              <RouteLine
                origin={top.capacity.source}
                destination={top.capacity.destination}
                distanceKm={MatchingEngine.getDistance(top.capacity.source, top.capacity.destination)}
                note={`${(top.capacity.unusedCapacity ?? 0).toFixed(1)}T OPEN`}
              />
              <div className="grid grid-cols-3 border border-border">
                <div className="border-r border-border px-3 py-2">
                  <div className="label-sys">OPEN</div>
                  <div className="font-mono text-sm text-signal-green">
                    {(top.capacity.unusedCapacity ?? 0).toFixed(1)}T
                  </div>
                </div>
                <div className="border-r border-border px-3 py-2">
                  <div className="label-sys">OPPORTUNITY</div>
                  <div className="font-mono text-sm text-signal-amber">
                    {top.prediction.opportunityProbability}%
                  </div>
                </div>
                <div className="px-3 py-2">
                  <div className="label-sys">EST. VALUE</div>
                  <div className="font-mono text-sm">{inr(top.estimatedRevenue)}</div>
                </div>
              </div>
              <p className="text-xs leading-relaxed text-muted-foreground">
                Demand signal expected on this route. {top.prediction.summary}.
              </p>
              <Link
                to="/matches"
                className="inline-flex rounded-[4px] border border-signal-amber px-4 py-2 font-mono text-[10px] uppercase tracking-[0.18em] text-signal-amber transition-colors hover:bg-signal-amber hover:text-background"
              >
                Review match →
              </Link>
            </div>
          </section>
        ) : (
          <EmptyState
            title="NO ACTIVE OPPORTUNITIES"
            lines={[
              "CIRCUIT is monitoring your available capacity.",
              "New opportunities appear when compatible demand is detected.",
            ]}
          />
        )}

        {/* Utilization */}
        <Panel title="UTILIZATION" meta="FLEET">
          <div className="flex items-baseline gap-3">
            <span className="font-mono text-4xl text-signal-green">
              <CountUp value={metrics.utilizationAfter} suffix="%" />
            </span>
            <span className="label-sys">AFTER CIRCUIT</span>
          </div>
          <div className="mt-4 space-y-3">
            {[
              { label: "BEFORE", value: metrics.utilizationBefore, tone: "bg-signal-red/70" },
              { label: "AFTER", value: metrics.utilizationAfter, tone: "bg-signal-green" },
            ].map((row) => (
              <div key={row.label} className="grid grid-cols-[64px_minmax(0,1fr)_40px] items-center gap-3">
                <span className="label-sys">{row.label}</span>
                <div className="h-2 border border-border bg-elevated">
                  <div className={`h-full ${row.tone} rail-fill`} style={{ width: `${row.value}%` }} />
                </div>
                <span className="font-mono text-[11px]">{row.value}%</span>
              </div>
            ))}
          </div>

          <div className="mt-5 space-y-4 border-t border-border pt-4">
            {capacities.slice(0, 2).map((c: any) => (
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
