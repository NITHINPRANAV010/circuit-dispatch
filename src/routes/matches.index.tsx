import { useEffect, useState } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { AppShell } from "@/components/circuit/AppShell";
import {
  CapacityRail,
  EmptyState,
  EngineLoader,
  Panel,
  RouteLine,
  ScoreBars,
  inr,
} from "@/components/circuit/primitives";
import { useCircuit } from "@/lib/circuit/useCircuit";
import { MatchingEngine } from "@/lib/circuit/matching-engine.js";

export const Route = createFileRoute("/matches/")({
  validateSearch: (search: Record<string, unknown>): { demand?: string } =>
    typeof search["demand"] === "string" ? { demand: search["demand"] } : {},
  head: () => ({
    meta: [
      { title: "Match Engine Results — CIRCUIT Match Index" },
      {
        name: "description",
        content:
          "Run the CIRCUIT match engine and review explainable match index scores across capacity and demand.",
      },
      { property: "og:title", content: "Match Engine Results — CIRCUIT" },
      {
        property: "og:description",
        content: "Explainable match index scores across capacity and demand.",
      },
    ],
  }),
  component: MatchesPage,
});

function MatchesPage() {
  const { ready, State, version } = useCircuit();
  const search = Route.useSearch();
  const [demandId, setDemandId] = useState<string | undefined>(search.demand);
  const [running, setRunning] = useState(false);
  const [ran, setRan] = useState(false);

  useEffect(() => {
    if (search.demand) setDemandId(search.demand);
  }, [search.demand]);

  const demands = ready ? State.getDemands() : [];
  const selected =
    demandId ?? (demands.find((d: any) => d.status === "searching")?.id as string | undefined);

  useEffect(() => {
    if (!ready || !selected || ran) return;
    setRunning(true);
    const t = setTimeout(() => {
      State.findMatches(selected);
      setRunning(false);
      setRan(true);
    }, 900);
    return () => clearTimeout(t);
  }, [ready, selected, ran, State]);

  if (!ready) {
    return (
      <AppShell section="MATCHES" page="ENGINE">
        <div className="label-sys">LOADING ENGINE…</div>
      </AppShell>
    );
  }

  const capacities = State.getCapacities();
  const allMatches = State.getMatches();
  const matches = selected
    ? allMatches.filter((m: any) => m.demandId === selected)
    : allMatches;
  const demand = selected ? State.getDemandById(selected) : null;

  void version;

  return (
    <AppShell
      section="MATCHES"
      page="ENGINE RESULTS"
      actions={
        <select
          aria-label="Select demand ticket"
          className="rounded-[4px] border border-border bg-surface px-2 py-1.5 font-mono text-[11px] text-foreground"
          value={selected ?? ""}
          onChange={(e) => {
            setDemandId(e.target.value);
            setRan(false);
          }}
        >
          {demands.map((d: any) => (
            <option key={d.id} value={d.id}>
              {d.id} · {d.source} → {d.destination}
            </option>
          ))}
        </select>
      }
    >
      {demand && (
        <Panel title={`DEMAND / ${demand.id}`} meta={String(demand.status).toUpperCase()} className="mb-4">
          <div className="grid gap-4 sm:grid-cols-[minmax(0,1fr)_auto] sm:items-center">
            <RouteLine
              origin={demand.source}
              destination={demand.destination}
              distanceKm={MatchingEngine.getDistance(demand.source, demand.destination)}
              note={`${demand.requiredCapacity}T REQUIRED`}
            />
            <div className="flex gap-6">
              <div>
                <div className="label-sys">CARGO</div>
                <div className="font-mono text-sm">{demand.cargoType}</div>
              </div>
              <div>
                <div className="label-sys">BUDGET</div>
                <div className="font-mono text-sm">{inr(demand.budget)}</div>
              </div>
            </div>
          </div>
        </Panel>
      )}

      {running ? (
        <EngineLoader
          lines={[
            `${capacities.length * 26} capacity signals`,
            `${demands.length * 14} demand signals`,
            `${capacities.length * 3} route combinations`,
          ]}
        />
      ) : matches.length === 0 ? (
        <EmptyState
          title="NO ACTIVE OPPORTUNITIES"
          lines={[
            "CIRCUIT is monitoring your available capacity.",
            "New opportunities will appear when compatible demand is detected.",
          ]}
        />
      ) : (
        <ul className="grid gap-4 lg:grid-cols-2">
          {matches.map((m: any) => (
            <li key={m.id}>
              <Panel
                title={`${m.capacity.vehicleId} / ${m.demandId}`}
                meta={String(m.status).toUpperCase()}
              >
                <div className="grid grid-cols-[minmax(0,1fr)_auto] items-start gap-4">
                  <div className="min-w-0 space-y-4">
                    <RouteLine
                      origin={m.capacity.source}
                      destination={m.capacity.destination}
                      distanceKm={MatchingEngine.getDistance(
                        m.capacity.source,
                        m.capacity.destination,
                      )}
                    />
                    <CapacityRail
                      total={m.capacity.totalCapacity}
                      load={m.capacity.currentLoad}
                      compact
                    />
                  </div>
                  <div className="shrink-0 text-right">
                    <div className="label-sys">MATCH INDEX</div>
                    <div
                      className={`font-mono text-3xl leading-none ${
                        m.totalScore >= 90
                          ? "text-signal-green"
                          : m.totalScore >= 80
                            ? "text-signal-cyan"
                            : "text-signal-amber"
                      }`}
                    >
                      {m.totalScore}
                    </div>
                    <div className="label-sys mt-1">/ 100</div>
                  </div>
                </div>

                <div className="mt-4 border-t border-border pt-4">
                  <ScoreBars breakdown={m.breakdown} />
                </div>

                <div className="mt-4 grid grid-cols-[minmax(0,1fr)_auto] items-center gap-3 border-t border-border pt-3">
                  <span className="font-mono text-sm text-signal-green">
                    {inr(m.estimatedRevenue)}
                  </span>
                  <Link
                    to="/matches/$matchId"
                    params={{ matchId: m.id }}
                    className="rounded-[4px] border border-border px-3 py-1.5 font-mono text-[10px] uppercase tracking-[0.16em] transition-colors hover:border-signal-green hover:text-signal-green"
                  >
                    Match detail →
                  </Link>
                </div>
              </Panel>
            </li>
          ))}
        </ul>
      )}
    </AppShell>
  );
}
