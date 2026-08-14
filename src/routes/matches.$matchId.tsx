import { useState } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { Check, X } from "lucide-react";
import { AppShell } from "@/components/circuit/AppShell";
import {
  CapacityRail,
  EmptyState,
  MatchIndex,
  Panel,
  RouteLine,
  ScoreBars,
  StatusDot,
  inr,
} from "@/components/circuit/primitives";
import { useCircuit } from "@/lib/circuit/useCircuit";
import { MatchingEngine } from "@/lib/circuit/matching-engine.js";

export const Route = createFileRoute("/matches/$matchId")({
  head: () => ({
    meta: [
      { title: "Match Detail — CIRCUIT Route Allocation" },
      {
        name: "description",
        content:
          "Route-first match detail: capacity allocation, match index breakdown and estimated value before acceptance.",
      },
      { property: "og:title", content: "Match Detail — CIRCUIT" },
      {
        property: "og:description",
        content: "Capacity allocation, match index breakdown and estimated value.",
      },
    ],
  }),
  component: MatchDetailPage,
});

function MatchDetailPage() {
  const { matchId } = Route.useParams();
  const { ready, State } = useCircuit();
  const [confirmed, setConfirmed] = useState<any>(null);

  if (!ready) {
    return (
      <AppShell section="MATCH" page="DETAIL">
        <div className="label-sys">LOADING MATCH…</div>
      </AppShell>
    );
  }

  const match = State.getMatchById(matchId);

  if (!match) {
    return (
      <AppShell section="MATCH" page="DETAIL">
        <EmptyState
          title="MATCH NOT FOUND"
          lines={["This match is no longer in the active register.", "Run the match engine again."]}
        />
      </AppShell>
    );
  }

  const cap = match.capacity;
  const dem = match.demand;
  const distance = MatchingEngine.getDistance(cap.source, cap.destination);
  const utilBefore = Math.round((cap.currentLoad / cap.totalCapacity) * 100);
  const utilAfter = Math.min(
    100,
    Math.round(((cap.currentLoad + dem.requiredCapacity) / cap.totalCapacity) * 100),
  );

  function accept() {
    const res = State.acceptMatch(match.id);
    if (res) setConfirmed(res);
  }

  if (confirmed) {
    return (
      <AppShell section="MATCH" page="CONFIRMED">
        <div className="mx-auto max-w-2xl space-y-4 reveal-up">
          <section className="border border-signal-green/50 bg-surface rounded-lg">
            <header className="flex items-center gap-2 border-b border-border px-4 py-2.5">
              <StatusDot />
              <span className="font-mono text-[10px] uppercase tracking-[0.18em] text-signal-green">
                MATCH CONFIRMED
              </span>
            </header>
            <div className="space-y-5 p-5">
              <div className="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-3">
                <span className="font-mono text-lg">{cap.vehicleId}</span>
                <span className="label-sys text-signal-green">● CONFIRMED</span>
              </div>
              <RouteLine
                origin={cap.source}
                destination={cap.destination}
                distanceKm={distance}
                note={`${dem.requiredCapacity.toFixed(1)}T ALLOCATED`}
              />
              <div className="grid grid-cols-2 border border-border">
                <div className="border-r border-border px-4 py-3">
                  <div className="label-sys">ESTIMATED VALUE</div>
                  <div className="font-mono text-xl text-signal-green">
                    {inr(match.estimatedRevenue)}
                  </div>
                </div>
                <div className="px-4 py-3">
                  <div className="label-sys">CAPACITY UTILIZATION</div>
                  <div className="font-mono text-xl">
                    {utilBefore}% <span className="text-muted-foreground">→</span>{" "}
                    <span className="text-signal-green">{utilAfter}%</span>
                  </div>
                </div>
              </div>
              <div className="border border-border px-4 py-3">
                <div className="label-sys">TRANSACTION</div>
                <div className="font-mono text-sm">{confirmed.transaction.id}</div>
              </div>
              <div className="flex flex-wrap gap-2">
                <Link
                  to="/transactions"
                  className="rounded-[4px] bg-signal-green px-4 py-2 font-mono text-[10px] uppercase tracking-[0.18em] text-background"
                >
                  View ledger →
                </Link>
                <Link
                  to="/dashboard"
                  className="rounded-[4px] border border-border px-4 py-2 font-mono text-[10px] uppercase tracking-[0.18em] text-foreground hover:border-signal-green hover:text-signal-green"
                >
                  Back to overview
                </Link>
              </div>
            </div>
          </section>
        </div>
      </AppShell>
    );
  }

  return (
    <AppShell section="MATCH" page={`${cap.vehicleId} / ${dem.id}`}>
      <div className="grid gap-4 xl:grid-cols-[minmax(0,1.3fr)_minmax(0,1fr)]">
        <div className="min-w-0 space-y-4">
          <Panel title="ROUTE ALLOCATION" meta={`${distance} KM`}>
            <RouteLine
              origin={cap.source}
              destination={cap.destination}
              distanceKm={distance}
              note={`${(cap.unusedCapacity ?? 0).toFixed(1)}T AVAILABLE`}
            />
            <div className="mt-5">
              <CapacityRail
                vehicleId={cap.vehicleId}
                total={cap.totalCapacity}
                load={cap.currentLoad}
              />
            </div>
            <div className="mt-4 grid grid-cols-3 border border-border">
              <div className="border-r border-border px-3 py-2">
                <div className="label-sys">TOTAL</div>
                <div className="font-mono text-sm">{cap.totalCapacity.toFixed(1)} T</div>
              </div>
              <div className="border-r border-border px-3 py-2">
                <div className="label-sys">REQUIRED</div>
                <div className="font-mono text-sm text-signal-cyan">
                  {dem.requiredCapacity.toFixed(1)} T
                </div>
              </div>
              <div className="px-3 py-2">
                <div className="label-sys">AVAILABLE</div>
                <div className="font-mono text-sm text-signal-green">
                  {(cap.unusedCapacity ?? 0).toFixed(1)} T
                </div>
              </div>
            </div>
          </Panel>

          <Panel title="WHY CIRCUIT RECOMMENDS THIS" meta="EXPLAINABILITY">
            <ul className="space-y-2">
              {match.explanation.map((item: any) => (
                <li key={item.text} className="flex items-start gap-2 text-xs leading-relaxed">
                  {item.type === "check" ? (
                    <Check className="mt-0.5 size-3.5 shrink-0 text-signal-green" aria-hidden />
                  ) : (
                    <X className="mt-0.5 size-3.5 shrink-0 text-signal-red" aria-hidden />
                  )}
                  <span className={item.type === "check" ? "text-foreground" : "text-muted-foreground"}>
                    {item.text}
                  </span>
                </li>
              ))}
            </ul>
          </Panel>
        </div>

        <div className="min-w-0 space-y-4">
          <Panel title="MATCH INDEX" meta={String(match.status).toUpperCase()}>
            <MatchIndex score={match.totalScore} label={match.label} />
            <div className="mt-5 border-t border-border pt-4">
              <ScoreBars breakdown={match.breakdown} />
            </div>
          </Panel>

          <Panel title="ESTIMATED VALUE" meta="DEMO CALCULATION">
            <dl className="space-y-2 font-mono text-xs">
              <div className="flex justify-between">
                <dt className="text-muted-foreground">SUPPLIER REVENUE</dt>
                <dd className="text-signal-green">{inr(match.estimatedRevenue)}</dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-muted-foreground">CUSTOMER BUDGET</dt>
                <dd>{inr(dem.budget)}</dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-muted-foreground">CIRCUIT FEE</dt>
                <dd>{inr(match.platformFee)}</dd>
              </div>
              <div className="flex justify-between border-t border-border pt-2">
                <dt className="text-muted-foreground">CO₂ AVOIDED (EST.)</dt>
                <dd>{match.co2Avoided} KG</dd>
              </div>
            </dl>

            {match.status === "pending" ? (
              <div className="mt-5 flex flex-wrap gap-2">
                <button
                  type="button"
                  onClick={accept}
                  className="rounded-[4px] bg-signal-green px-5 py-2.5 font-mono text-[11px] uppercase tracking-[0.18em] text-background transition-opacity hover:opacity-90"
                >
                  Accept match →
                </button>
                <button
                  type="button"
                  onClick={() => State.rejectMatch(match.id)}
                  className="rounded-[4px] border border-border px-4 py-2.5 font-mono text-[11px] uppercase tracking-[0.18em] text-muted-foreground hover:border-signal-red hover:text-signal-red"
                >
                  Dismiss
                </button>
              </div>
            ) : (
              <div className="mt-5 label-sys text-signal-cyan">
                MATCH {String(match.status).toUpperCase()}
              </div>
            )}
          </Panel>
        </div>
      </div>
    </AppShell>
  );
}
