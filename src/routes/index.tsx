import { useEffect, useMemo, useRef, useState, type ReactNode } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { LiveNetwork } from "@/components/circuit/LiveNetwork";
import { StatusDot } from "@/components/circuit/primitives";
import { DEMO_DATA } from "@/lib/circuit/data.js";
import { MatchingEngine } from "@/lib/circuit/matching-engine.js";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "CIRCUIT — Live Network for Unused Truck Capacity" },
      {
        name: "description",
        content:
          "Trucks are already moving. CIRCUIT finds the empty space inside them and matches unused freight capacity with businesses that need transport.",
      },
      { property: "og:title", content: "CIRCUIT — Live Network for Unused Truck Capacity" },
      {
        property: "og:description",
        content:
          "CIRCUIT detects unused capacity in trucks already on the road and matches it with live demand.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Landing,
});

/* ── Derived from the existing CIRCUIT dataset + engines (never hardcoded) ── */
function useGoldenMatch() {
  const [score, setScore] = useState<number | null>(null);
  const cap = useMemo(
    () => (DEMO_DATA.capacities as any[]).find((c) => c.id === "CAP-042"),
    [],
  );
  const demand = useMemo(
    () => (DEMO_DATA.demands as any[]).find((d) => d.id === "DEM-1001"),
    [],
  );
  useEffect(() => {
    if (!cap || !demand) return;
    try {
      const r = MatchingEngine.calculateMatchScore(
        cap,
        demand,
        DEMO_DATA.business.reliabilityScore,
      );
      setScore(Math.round(r?.totalScore ?? 0));
    } catch {
      setScore(null);
    }
  }, [cap, demand]);
  const value = cap && demand ? Math.min(demand.budget, cap.minPrice + 1800) : 0;
  return { cap, demand, score, value };
}

function Reveal({ children, className }: { children: ReactNode; className?: string }) {
  const ref = useRef<HTMLDivElement>(null);
  const [on, setOn] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const io = new IntersectionObserver(
      ([e]) => e && e.isIntersecting && setOn(true),
      { threshold: 0.25 },
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);
  return (
    <div
      ref={ref}
      className={`${className ?? ""} transition-all duration-700 ${
        on ? "translate-y-0 opacity-100" : "translate-y-4 opacity-0"
      }`}
    >
      {children}
    </div>
  );
}

function Rail({ total, load }: { total: number; load: number }) {
  const blocks = 10;
  const filled = Math.round((load / total) * blocks);
  return (
    <div className="flex gap-[3px]" aria-hidden>
      {Array.from({ length: blocks }).map((_, i) => (
        <span
          key={i}
          className={`h-3 flex-1 ${i < filled ? "bg-signal-green" : "bg-signal-amber/25"}`}
        />
      ))}
    </div>
  );
}

function SectionTag({ n, t }: { n: string; t: string }) {
  return (
    <div className="flex items-baseline gap-3">
      <span className="font-mono text-[10px] tracking-[0.24em] text-signal-green">
        SECTION {n}
      </span>
      <span className="label-sys">{t}</span>
    </div>
  );
}

function Landing() {
  const { cap, demand, score, value } = useGoldenMatch();
  const open = cap ? cap.unusedCapacity : 6;

  return (
    <div className="min-h-screen bg-background text-foreground">
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
        {/* ── HERO ─────────────────────────────────────────── */}
        <section className="grid gap-10 py-14 lg:grid-cols-[minmax(0,0.82fr)_minmax(0,1.18fr)] lg:items-center lg:py-20">
          <div className="min-w-0 reveal-up">
            <div className="label-sys text-signal-red">● LIVE NETWORK ANOMALY</div>
            <h1 className="mt-4 text-4xl font-semibold leading-[1.03] tracking-tight sm:text-6xl">
              <span className="font-mono text-signal-green">{open}</span> TONNES
              <br />
              ARE LEAVING EMPTY.
            </h1>
            <p className="mt-6 max-w-md text-sm leading-relaxed text-muted-foreground">
              CIRCUIT finds unused capacity in trucks already on the road and matches it with
              businesses that need transportation.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link
                to="/login"
                className="rounded-[4px] bg-signal-green px-5 py-2.5 font-mono text-[11px] uppercase tracking-[0.18em] text-background transition-opacity hover:opacity-90"
              >
                Enter circuit →
              </Link>
              <a
                href="#how"
                className="rounded-[4px] border border-border px-5 py-2.5 font-mono text-[11px] uppercase tracking-[0.18em] transition-colors hover:border-signal-cyan hover:text-signal-cyan"
              >
                See how it works
              </a>
            </div>
            <p className="mt-10 max-w-xs font-mono text-sm leading-relaxed tracking-[0.06em] text-muted-foreground">
              DON&apos;T LET CAPACITY
              <br />
              TRAVEL EMPTY.
            </p>
          </div>

          <div className="min-w-0">
            <LiveNetwork />
          </div>
        </section>

        {/* ── SCROLL STORY ─────────────────────────────────── */}
        <section id="how" className="border-t border-border">
          {/* 01 */}
          <Reveal className="grid gap-8 py-16 lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)] lg:items-center">
            <div>
              <SectionTag n="01" t="THE PROBLEM" />
              <h2 className="mt-4 text-2xl font-semibold tracking-tight sm:text-3xl">
                EMPTY CAPACITY
                <br />
                IS INVISIBLE WASTE.
              </h2>
              <p className="mt-4 max-w-md text-sm leading-relaxed text-muted-foreground">
                Diesel is paid for the whole truck. Half of it moves air, invisible to every
                dispatch board on the network.
              </p>
            </div>
            <div className="grid gap-px border border-border bg-border">
              {(DEMO_DATA.capacities as any[]).slice(0, 3).map((c) => (
                <div key={c.id} className="bg-surface px-4 py-3">
                  <div className="flex items-center justify-between font-mono text-[11px]">
                    <span>TRK-{String(c.vehicleId).replace(/\D/g, "").padStart(3, "0")}</span>
                    <span className="label-sys">
                      {c.source.toUpperCase()} → {c.destination.toUpperCase()}
                    </span>
                  </div>
                  <div className="mt-2">
                    <Rail total={c.totalCapacity} load={c.currentLoad} />
                  </div>
                  <div className="mt-2 flex justify-between font-mono text-[10px] tracking-[0.14em]">
                    <span className="text-signal-green">{c.currentLoad}T LOADED</span>
                    <span className="text-signal-amber">{c.unusedCapacity}T OPEN</span>
                  </div>
                </div>
              ))}
            </div>
          </Reveal>

          {/* 02 */}
          <Reveal className="grid gap-8 border-t border-border py-16 lg:grid-cols-2 lg:items-center">
            <div>
              <SectionTag n="02" t="DETECTION" />
              <h2 className="mt-4 text-2xl font-semibold tracking-tight sm:text-3xl">
                CIRCUIT DETECTS IT.
              </h2>
              <p className="mt-4 max-w-md text-sm leading-relaxed text-muted-foreground">
                The forecast model reads each lane&apos;s history and flags capacity that is likely
                to travel empty — before departure.
              </p>
            </div>
            <div className="border border-signal-cyan/40 bg-surface px-5 py-6">
              <div className="font-mono text-[10px] tracking-[0.24em] text-signal-cyan">
                CAPACITY SIGNAL
              </div>
              <div className="mt-1 font-mono text-2xl tracking-[0.08em] text-signal-cyan">
                DETECTED
              </div>
              <div className="mt-4 border-t border-border pt-4 font-mono text-[11px] text-muted-foreground">
                TRK-042 · {cap?.source?.toUpperCase()} → {cap?.destination?.toUpperCase()}
                <span className="ml-2 text-signal-amber">{open}T OPEN</span>
              </div>
            </div>
          </Reveal>

          {/* 03 */}
          <Reveal className="grid gap-8 border-t border-border py-16 lg:grid-cols-2 lg:items-center">
            <div>
              <SectionTag n="03" t="DEMAND" />
              <h2 className="mt-4 text-2xl font-semibold tracking-tight sm:text-3xl">
                DEMAND APPEARS.
              </h2>
              <p className="mt-4 max-w-md text-sm leading-relaxed text-muted-foreground">
                A shipper posts cargo on the same lane. CIRCUIT sees both sides of the movement at
                once.
              </p>
            </div>
            <div className="border border-signal-amber/40 bg-surface px-5 py-6 font-mono">
              <div className="text-[10px] tracking-[0.24em] text-signal-amber">
                DEMAND {demand?.id?.replace("DEM-", "#")}
              </div>
              <div className="mt-2 text-sm">
                {demand?.source?.toUpperCase()} → {demand?.destination?.toUpperCase()}
              </div>
              <div className="mt-1 text-sm text-muted-foreground">
                {demand?.requiredCapacity}T REQUIRED · {demand?.cargoType?.toUpperCase()}
              </div>
            </div>
          </Reveal>

          {/* 04 */}
          <Reveal className="grid gap-8 border-t border-border py-16 lg:grid-cols-2 lg:items-center">
            <div>
              <SectionTag n="04" t="MATCHING" />
              <h2 className="mt-4 text-2xl font-semibold tracking-tight sm:text-3xl">
                CIRCUIT CONNECTS THEM.
              </h2>
              <p className="mt-4 max-w-md text-sm leading-relaxed text-muted-foreground">
                Six weighted signals — capacity, route, timing, price, cargo and reliability —
                resolve into one explainable index.
              </p>
            </div>
            <div className="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-4 border border-border bg-surface px-5 py-6">
              <div className="font-mono text-[11px] leading-relaxed">
                <div>TRK-042</div>
                <div className="text-muted-foreground">+</div>
                <div>DEMAND #1001</div>
              </div>
              <div className="text-right">
                <div className="font-mono text-4xl text-signal-green">{score ?? "—"}</div>
                <div className="label-sys">/ 100 MATCH</div>
              </div>
            </div>
          </Reveal>

          {/* 05 */}
          <Reveal className="grid gap-8 border-t border-border py-16 lg:grid-cols-2 lg:items-center">
            <div>
              <SectionTag n="05" t="VALUE" />
              <h2 className="mt-4 text-2xl font-semibold tracking-tight sm:text-3xl">
                EMPTY CAPACITY
                <br />
                BECOMES VALUE.
              </h2>
            </div>
            <div className="grid grid-cols-3 gap-px border border-border bg-border font-mono">
              <div className="bg-surface px-4 py-5">
                <div className="label-sys">OPEN</div>
                <div className="mt-1 text-xl text-signal-amber">{open}T</div>
              </div>
              <div className="bg-surface px-4 py-5">
                <div className="label-sys">MATCHED</div>
                <div className="mt-1 text-xl text-signal-cyan">
                  {demand?.requiredCapacity}T
                </div>
              </div>
              <div className="bg-surface px-4 py-5">
                <div className="label-sys">EST. VALUE</div>
                <div className="mt-1 text-xl text-signal-green">
                  ₹{value.toLocaleString("en-IN")}
                </div>
              </div>
            </div>
          </Reveal>
        </section>

        <section className="grid gap-6 border-t border-border py-16 lg:grid-cols-[minmax(0,1fr)_auto] lg:items-end">
          <h2 className="text-2xl font-semibold tracking-tight sm:text-3xl">
            DON&apos;T LET CAPACITY TRAVEL EMPTY.
          </h2>
          <Link
            to="/login"
            className="justify-self-start rounded-[4px] bg-signal-green px-5 py-2.5 font-mono text-[11px] uppercase tracking-[0.18em] text-background transition-opacity hover:opacity-90"
          >
            Enter circuit →
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
