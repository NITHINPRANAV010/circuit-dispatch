import { createFileRoute } from "@tanstack/react-router";
import { AppShell } from "@/components/circuit/AppShell";
import { CapacityRail, Panel, Stat } from "@/components/circuit/primitives";
import { NetworkMap, type NetworkEdge } from "@/components/circuit/NetworkMap";
import { useCircuit } from "@/lib/circuit/useCircuit";

export const Route = createFileRoute("/network")({
  head: () => ({
    meta: [
      { title: "Capacity Network — CIRCUIT Route Map" },
      {
        name: "description",
        content:
          "Live SVG view of active lanes, open payload and matched capacity across the CIRCUIT logistics network.",
      },
      { property: "og:title", content: "Capacity Network — CIRCUIT" },
      {
        property: "og:description",
        content: "Live view of active lanes, open payload and matched capacity.",
      },
    ],
  }),
  component: NetworkPage,
});

function NetworkPage() {
  const { ready, State } = useCircuit();

  if (!ready) {
    return (
      <AppShell section="NETWORK" page="ROUTE MAP">
        <div className="label-sys">LOADING NETWORK…</div>
      </AppShell>
    );
  }

  const capacities = State.getCapacities();
  const edges: NetworkEdge[] = capacities.map((c: any) => ({
    id: c.id,
    from: c.source,
    to: c.destination,
    openTonnes: Math.max(0, c.totalCapacity - c.currentLoad),
    vehicleId: c.vehicleId,
    matched: c.status === "matched",
  }));

  const openTonnes = edges.reduce((s, e) => s + e.openTonnes, 0);
  const matched = edges.filter((e) => e.matched).length;

  return (
    <AppShell section="NETWORK" page="ROUTE MAP">
      <div className="mb-4 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <Stat label="ACTIVE LANES" value={String(edges.length)} tone="cyan" />
        <Stat label="OPEN PAYLOAD" value={`${openTonnes.toFixed(1)} T`} tone="green" />
        <Stat label="MATCHED LANES" value={String(matched)} />
        <Stat label="NODES" value={String(new Set(edges.flatMap((e) => [e.from, e.to])).size)} />
      </div>

      <Panel title="CAPACITY NETWORK" meta="SOUTH INDIA CORRIDOR" className="mb-4">
        <NetworkMap edges={edges} height={420} />
      </Panel>

      <Panel title="LANE REGISTER" meta={`${edges.length} LANES`}>
        <div className="grid gap-5 lg:grid-cols-2">
          {capacities.map((c: any) => (
            <div key={c.id} className="border border-border p-4">
              <div className="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-3">
                <span className="truncate font-mono text-xs">
                  {c.source} → {c.destination}
                </span>
                <span
                  className={`label-sys shrink-0 ${
                    c.status === "matched" ? "text-signal-cyan" : "text-signal-green"
                  }`}
                >
                  {String(c.status).toUpperCase()}
                </span>
              </div>
              <div className="mt-3">
                <CapacityRail
                  vehicleId={c.vehicleId}
                  total={c.totalCapacity}
                  load={c.currentLoad}
                />
              </div>
            </div>
          ))}
        </div>
      </Panel>
    </AppShell>
  );
}
