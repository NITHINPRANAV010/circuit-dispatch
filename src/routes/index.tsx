import { createFileRoute, Link } from "@tanstack/react-router";
import { CapacityRail, CountUp, RouteLine, StatusDot } from "@/components/circuit/primitives";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "CIRCUIT — Unused Logistics Capacity Exchange" },
      {
        name: "description",
        content:
          "CIRCUIT turns empty truck payload into revenue: AI matching of unused freight capacity with live demand across the network.",
      },
      { property: "og:title", content: "CIRCUIT — Unused Logistics Capacity Exchange" },
      {
        property: "og:description",
        content: "Turn empty truck payload into revenue with AI-matched freight capacity.",
      },
    ],
  }),
  component: Landing,
});

const PROOF = [
  { k: "AVG. FLEET UTILIZATION", v: "62%", tone: "text-signal-amber" },
  { k: "PAYLOAD LEAVING EMPTY", v: "6.0 T", tone: "text-signal-red" },
  { k: "RECOVERABLE / TRIP", v: "₹8,400", tone: "text-signal-green" },
  { k: "MATCH LATENCY", v: "< 2 S", tone: "text-signal-cyan" },
];

const STEPS = [
  { n: "01", t: "DECLARE CAPACITY", d: "A truck posts its lane and committed payload. CIRCUIT computes the unused tonnage." },
  { n: "02", t: "PREDICT OPPORTUNITY", d: "The forecast model scores how likely that capacity is to travel empty." },
  { n: "03", t: "MATCH DEMAND", d: "Six weighted signals resolve compatible cargo into one explainable Match Index." },
  { n: "04", t: "CREATE VALUE", d: "Accept the match: utilization rises and the trade settles in the ledger." },
];

function Landing() {
  return (
    <div className="min-h-screen bg-background text-foreground grid-bg">
      <header className="border-b border-border">
        <div className="mx-auto grid max-w-6xl grid-cols-[minmax(0,1fr)_auto] items-center gap-4 px-5 py-4">
          <div className="flex min-w-0 items-center gap-3">
            <span className="shrink-0 font-mono text-sm tracking-[0.3em] text-signal-green">
              CIRCUIT
            </span>
            <span className="label-sys truncate">CAPACITY EXCHANGE</span>
          </div>
          <div className="flex shrink-0 items-center gap-3">
            <StatusDot />
            <Link
              to="/login"
              className="rounded-[4px] border border-border px-3 py-1.5 font-mono text-[10px] uppercase tracking-[0.18em] transition-colors hover:border-signal-green hover:text-signal-green"
            >
              Console access
            </Link>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-6xl px-5">
        <section className="grid gap-10 py-20 lg:grid-cols-[minmax(0,1.15fr)_minmax(0,1fr)] lg:items-center">
          <div className="min-w-0 reveal-up">
            <div className="label-sys text-signal-red">● LIVE NETWORK ANOMALY</div>
            <h1 className="mt-4 text-4xl font-semibold leading-[1.05] tracking-tight sm:text-6xl">
              <span className="font-mono text-signal-green">
                <CountUp value={6} />
              </span>{" "}
              TONNES ARE
              <br />
              LEAVING EMPTY
            </h1>
            <p className="mt-6 max-w-xl text-sm leading-relaxed text-muted-foreground">
              Every dispatch out of Chennai carries paid diesel and unpaid air. CIRCUIT is the
              exchange layer that finds the freight to fill it — before the truck moves.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link
                to="/dashboard"
                className="rounded-[4px] bg-signal-green px-5 py-2.5 font-mono text-[11px] uppercase tracking-[0.18em] text-background transition-opacity hover:opacity-90"
              >
                Open operations console →
              </Link>
            </div>
            <dl className="mt-12 grid grid-cols-2 gap-px border border-border bg-border sm:grid-cols-4">
              {PROOF.map((p) => (
                <div key={p.k} className="bg-surface px-4 py-3">
                  <dt className="label-sys truncate">{p.k}</dt>
                  <dd className={`mt-1 font-mono text-lg ${p.tone}`}>{p.v}</dd>
                </div>
              ))}
            </dl>
          </div>

          <div className="min-w-0 space-y-4 rounded-lg border border-border bg-surface p-5">
            <div className="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-3">
              <span className="label-sys truncate">TRK-042 · LIVE MANIFEST</span>
              <span className="label-sys shrink-0 text-signal-amber">UNDERLOADED</span>
            </div>
            <CapacityRail vehicleId="TRK-042" total={10} load={4} />
            <div className="border-t border-border pt-4">
              <RouteLine origin="Chennai" destination="Bangalore" distanceKm={346} note="6.0T OPEN" />
            </div>
            <div className="grid grid-cols-2 gap-px border border-border bg-border">
              <div className="bg-surface px-4 py-3">
                <div className="label-sys">MATCH INDEX</div>
                <div className="mt-1 font-mono text-2xl text-signal-green">93</div>
              </div>
              <div className="bg-surface px-4 py-3">
                <div className="label-sys">EST. VALUE</div>
                <div className="mt-1 font-mono text-2xl">₹7,800</div>
              </div>
            </div>
          </div>
        </section>

        <section className="border-t border-border py-16">
          <h2 className="label-sys">HOW THE EXCHANGE RUNS</h2>
          <div className="mt-6 grid gap-px border border-border bg-border sm:grid-cols-2 lg:grid-cols-4">
            {STEPS.map((s) => (
              <article key={s.n} className="bg-surface p-6">
                <div className="font-mono text-xs text-signal-green">{s.n}</div>
                <h3 className="mt-3 font-mono text-sm tracking-wide">{s.t}</h3>
                <p className="mt-2 text-xs leading-relaxed text-muted-foreground">{s.d}</p>
              </article>
            ))}
          </div>
        </section>

        <section className="grid gap-6 border-t border-border py-16 lg:grid-cols-[minmax(0,1fr)_auto] lg:items-end">
          <h2 className="text-2xl font-semibold tracking-tight sm:text-3xl">
            DON&apos;T LET CAPACITY TRAVEL EMPTY.
          </h2>
          <Link
            to="/dashboard"
            className="justify-self-start rounded-[4px] bg-signal-green px-5 py-2.5 font-mono text-[11px] uppercase tracking-[0.18em] text-background transition-opacity hover:opacity-90"
          >
            Open operations console →
          </Link>
        </section>
      </main>

      <footer className="border-t border-border">
        <div className="mx-auto grid max-w-6xl grid-cols-[minmax(0,1fr)_auto] items-center gap-4 px-5 py-6">
          <span className="label-sys truncate">CIRCUIT · CAPACITY EXCHANGE · DEMO NETWORK</span>
          <Link to="/dashboard" className="label-sys shrink-0 text-signal-green">
            CONSOLE →
          </Link>
        </div>
      </footer>
    </div>
  );
}
