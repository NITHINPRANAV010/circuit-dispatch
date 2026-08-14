import { createFileRoute } from "@tanstack/react-router";
import { AppShell } from "@/components/circuit/AppShell";
import { EmptyState, Panel, RouteLine, Stat, dateOf, inr, timeOf } from "@/components/circuit/primitives";
import { useCircuit } from "@/lib/circuit/useCircuit";
import { MatchingEngine } from "@/lib/circuit/matching-engine.js";

export const Route = createFileRoute("/transactions")({
  head: () => ({
    meta: [
      { title: "Transaction Ledger — CIRCUIT Settlements" },
      {
        name: "description",
        content:
          "Confirmed capacity trades, settlement value and platform fees recorded in the CIRCUIT ledger.",
      },
      { property: "og:title", content: "Transaction Ledger — CIRCUIT" },
      {
        property: "og:description",
        content: "Confirmed capacity trades, settlement value and platform fees.",
      },
    ],
  }),
  component: TransactionsPage,
});

function splitRoute(route: string): [string, string] {
  const parts = String(route ?? "").split("→");
  return [(parts[0] ?? "").trim(), (parts[1] ?? "").trim()];
}

function TransactionsPage() {
  const { ready, State } = useCircuit();

  if (!ready) {
    return (
      <AppShell section="LEDGER" page="TRANSACTIONS">
        <div className="label-sys">LOADING LEDGER…</div>
      </AppShell>
    );
  }

  const txs = State.getTransactions();
  const gross = txs.reduce((s: number, t: any) => s + (t.amount ?? 0), 0);
  const fees = txs.reduce((s: number, t: any) => s + (t.platformFee ?? 0), 0);
  const tonnes = txs.reduce((s: number, t: any) => s + (t.capacity ?? 0), 0);

  return (
    <AppShell section="LEDGER" page="TRANSACTIONS">
      <div className="mb-4 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <Stat label="SETTLED VALUE" value={inr(gross)} tone="green" />
        <Stat label="PLATFORM FEES" value={inr(fees)} />
        <Stat label="CAPACITY TRADED" value={`${tonnes.toFixed(1)} T`} tone="cyan" />
        <Stat label="TRANSACTIONS" value={String(txs.length)} />
      </div>

      <Panel title="SETTLEMENT REGISTER" meta={`${txs.length} RECORDS`}>
        {txs.length === 0 ? (
          <EmptyState
            title="LEDGER EMPTY"
            lines={[
              "No capacity trades have been confirmed yet.",
              "Accept a match to record the first settlement.",
            ]}
          />
        ) : (
          <ul className="divide-y divide-border">
            {txs.map((t: any) => {
              const [from, to] = splitRoute(t.route);
              return (
                <li key={t.id} className="py-4 first:pt-0 last:pb-0">
                  <div className="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-3">
                    <span className="truncate font-mono text-xs text-muted-foreground">
                      {t.id} · {t.customer}
                    </span>
                    <span className="label-sys shrink-0 text-signal-green">
                      ● {String(t.status).toUpperCase()}
                    </span>
                  </div>
                  <div className="mt-3 grid gap-4 lg:grid-cols-[minmax(0,1.4fr)_minmax(0,1fr)] lg:items-center">
                    <RouteLine
                      origin={from}
                      destination={to}
                      distanceKm={MatchingEngine.getDistance(from, to)}
                      note={`${t.vehicleId} · ${Number(t.capacity ?? 0).toFixed(1)}T`}
                    />
                    <div className="grid grid-cols-3 gap-3 font-mono text-xs">
                      <div>
                        <div className="label-sys">AMOUNT</div>
                        <div className="text-signal-green">{inr(t.amount)}</div>
                      </div>
                      <div>
                        <div className="label-sys">FEE</div>
                        <div>{inr(t.platformFee)}</div>
                      </div>
                      <div>
                        <div className="label-sys">DATE</div>
                        <div>
                          {dateOf(t.date)} {timeOf(t.date)}
                        </div>
                      </div>
                    </div>
                  </div>
                </li>
              );
            })}
          </ul>
        )}
      </Panel>
    </AppShell>
  );
}
