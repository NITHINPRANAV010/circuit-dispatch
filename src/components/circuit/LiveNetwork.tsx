import { useEffect, useMemo, useState } from "react";
import { DEMO_DATA } from "@/lib/circuit/data.js";
import { MatchingEngine } from "@/lib/circuit/matching-engine.js";
import { OpportunityPredictor } from "@/lib/circuit/opportunity-predictor.js";

/* ── Stylised South-India node layout (visual clarity over geo accuracy) ── */
const CITY: Record<string, { x: number; y: number; anchor: "start" | "end" | "middle" }> = {
  Hyderabad: { x: 300, y: 70, anchor: "middle" },
  Chennai: { x: 760, y: 250, anchor: "start" },
  Bangalore: { x: 420, y: 300, anchor: "end" },
  Coimbatore: { x: 290, y: 450, anchor: "end" },
  Madurai: { x: 470, y: 560, anchor: "middle" },
  Kochi: { x: 230, y: 590, anchor: "start" },
};

/** Low-opacity background lattice — depth only, no data. */
const BACKDROP: Array<[string, string]> = [
  ["Coimbatore", "Kochi"],
  ["Kochi", "Madurai"],
  ["Bangalore", "Coimbatore"],
  ["Madurai", "Chennai"],
  ["Hyderabad", "Chennai"],
];

const MOBILE_CITIES = new Set(["Chennai", "Bangalore", "Coimbatore"]);

type Lane = {
  id: string;
  vehicle: string;
  short: string;
  from: string;
  to: string;
  total: number;
  load: number;
  open: number;
  departure: string;
  opportunity: number;
  primary: boolean;
  delay: number;
  duration: number;
};

const shortId = (v: string) => `TRK-${String(v).replace(/\D/g, "").padStart(3, "0")}`;

function hhmm(iso?: string) {
  if (!iso) return "--:--";
  const d = new Date(iso);
  return `${String(d.getHours()).padStart(2, "0")}:${String(d.getMinutes()).padStart(2, "0")}`;
}

/* ── Timeline of the signature moment (ms offsets in a 20s loop) ── */
const CYCLE = 20000;
const T_SCAN = 6000;
const T_DETECT = 8200;
const T_DEMAND = 11000;
const T_MATCH = 13800;

export function LiveNetwork() {
  const [mounted, setMounted] = useState(false);
  const [hover, setHover] = useState<string | null>(null);
  const [phase, setPhase] = useState(0);

  useEffect(() => setMounted(true), []);

  useEffect(() => {
    if (!mounted) return;
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduce) {
      setPhase(4);
      return;
    }
    const start = Date.now();
    const id = window.setInterval(() => {
      const t = (Date.now() - start) % CYCLE;
      setPhase(t > T_MATCH ? 4 : t > T_DEMAND ? 3 : t > T_DETECT ? 2 : t > T_SCAN ? 1 : 0);
    }, 200);
    return () => window.clearInterval(id);
  }, [mounted]);

  /* All visual data is derived from the existing CIRCUIT demo dataset. */
  const lanes: Lane[] = useMemo(() => {
    const caps = (DEMO_DATA.capacities as any[]).filter(
      (c) => CITY[c.source] && CITY[c.destination],
    );
    return caps.map((c, i) => {
      const open = c.unusedCapacity ?? c.totalCapacity - c.currentLoad;
      let opportunity = 0;
      try {
        opportunity = Math.round(OpportunityPredictor.predict(c)?.opportunityProbability ?? 0);
      } catch {
        opportunity = 0;
      }
      return {
        id: c.id,
        vehicle: c.vehicleId,
        short: shortId(c.vehicleId),
        from: c.source,
        to: c.destination,
        total: c.totalCapacity,
        load: c.currentLoad,
        open,
        departure: hhmm(c.departureDatetime),
        opportunity,
        primary: c.id === "CAP-042",
        delay: -(i * 4.5),
        duration: 26 + i * 3,
      };
    });
  }, []);

  const hero = lanes.find((l) => l.primary) ?? lanes[0];
  const demand = (DEMO_DATA.demands as any[]).find((d) => d.id === "DEM-1001");

  const matchScore = useMemo(() => {
    if (!mounted) return null;
    const cap = (DEMO_DATA.capacities as any[]).find((c) => c.id === "CAP-042");
    if (!cap || !demand) return null;
    try {
      const r = MatchingEngine.calculateMatchScore(cap, demand, DEMO_DATA.business.reliabilityScore);
      return Math.round(r?.totalScore ?? r?.score ?? 0);
    } catch {
      return null;
    }
  }, [mounted, demand]);

  const totals = useMemo(
    () => ({
      routes: lanes.length,
      vehicles: lanes.length + (DEMO_DATA.transactions as any[]).length + 2,
      open: lanes.reduce((s, l) => s + l.open, 0),
    }),
    [lanes],
  );

  const nodes = Object.entries(CITY);
  const active = hover ? lanes.find((l) => l.id === hover) : null;

  return (
    <div className="relative">
      {/* Live system header */}
      <div className="flex flex-wrap items-center gap-x-5 gap-y-2 border border-border bg-surface px-4 py-2.5">
        <span className="font-mono text-[10px] tracking-[0.24em] text-signal-green">
          CIRCUIT NETWORK
        </span>
        <span className="flex items-center gap-1.5 font-mono text-[10px] tracking-[0.18em] text-muted-foreground">
          <span className="signal-pulse inline-block size-1.5 rounded-full bg-signal-green" />
          LIVE MONITORING
        </span>
        <span className="label-sys">
          {String(totals.routes).padStart(2, "0")} ACTIVE ROUTES
        </span>
        <span className="label-sys">{totals.vehicles} VEHICLES</span>
        <span className="label-sys text-signal-amber">
          {totals.open.toFixed(0)}T OPEN CAPACITY
        </span>
        <span className="label-sys ml-auto hidden sm:inline">DEMO NETWORK</span>
      </div>

      <div className="relative border border-t-0 border-border bg-surface/40">
        <svg
          viewBox="140 10 790 630"
          className="h-auto w-full"
          role="img"
          aria-label="Live CIRCUIT logistics network: trucks moving between South Indian cities with open capacity signals"
        >
          <defs>
            <pattern id="ln-grid" width="48" height="48" patternUnits="userSpaceOnUse">
              <path
                d="M48 0H0V48"
                fill="none"
                stroke="var(--border)"
                strokeWidth="0.6"
                opacity="0.55"
              />
            </pattern>
          </defs>
          <rect x="140" y="10" width="790" height="630" fill="url(#ln-grid)" />

          {/* depth layer — inactive lattice */}
          {BACKDROP.map(([a, b]) => {
            const p = CITY[a]!;
            const q = CITY[b]!;
            return (
              <line
                key={`${a}-${b}`}
                x1={p.x}
                y1={p.y}
                x2={q.x}
                y2={q.y}
                stroke="var(--border)"
                strokeWidth="1"
                opacity="0.55"
              />
            );
          })}

          {/* active lanes */}
          {lanes.map((l) => {
            const a = CITY[l.from]!;
            const b = CITY[l.to]!;
            const on = hover === l.id;
            const secondary = !l.primary && !MOBILE_CITIES.has(l.from);
            return (
              <line
                key={`lane-${l.id}`}
                className={secondary ? "hidden sm:inline" : undefined}
                x1={a.x}
                y1={a.y}
                x2={b.x}
                y2={b.y}
                stroke={l.primary ? "var(--signal-green)" : "var(--muted-foreground)"}
                strokeWidth={on || l.primary ? 1.4 : 1}
                opacity={on ? 0.9 : l.primary ? 0.55 : 0.35}
              />
            );
          })}

          {/* match link: capacity ↔ demand on the same lane */}
          {hero && phase >= 4 && (
            <line
              className="ln-match"
              x1={CITY[hero.from]!.x}
              y1={CITY[hero.from]!.y}
              x2={CITY[hero.to]!.x}
              y2={CITY[hero.to]!.y}
              stroke="var(--signal-cyan)"
              strokeWidth="2"
              opacity="0.9"
            />
          )}

          {/* city nodes */}
          {nodes.map(([name, p]) => {
            const dim = !MOBILE_CITIES.has(name);
            return (
              <g key={name} className={dim ? "hidden sm:inline" : undefined}>
                <circle cx={p.x} cy={p.y} r="3.5" fill="var(--signal-green)" opacity="0.9" />
                <circle
                  cx={p.x}
                  cy={p.y}
                  r="9"
                  fill="none"
                  stroke="var(--signal-green)"
                  strokeWidth="0.8"
                  opacity="0.3"
                />
                <text
                  x={p.anchor === "end" ? p.x - 14 : p.anchor === "start" ? p.x + 14 : p.x}
                  y={p.y - 16}
                  textAnchor={p.anchor}
                  fill="var(--muted-foreground)"
                  fontSize="11"
                  letterSpacing="1.6"
                  style={{ fontFamily: "var(--font-mono)" }}
                >
                  {name.toUpperCase()}
                </text>
              </g>
            );
          })}

          {/* moving vehicles */}
          {lanes.map((l) => {
            const a = CITY[l.from]!;
            const b = CITY[l.to]!;
            const angle = (Math.atan2(b.y - a.y, b.x - a.x) * 180) / Math.PI;
            const on = hover === l.id;
            const secondary = !l.primary && !MOBILE_CITIES.has(l.from);
            const detecting = l.primary && phase >= 1 && phase < 4;
            return (
              <g
                key={`truck-${l.id}`}
                className={`ln-truck ${secondary ? "hidden sm:inline" : ""}`}
                style={
                  {
                    "--x1": `${a.x}px`,
                    "--y1": `${a.y}px`,
                    "--x2": `${b.x}px`,
                    "--y2": `${b.y}px`,
                    animationDuration: `${l.duration}s`,
                    animationDelay: `${l.delay}s`,
                    animationPlayState: on ? "paused" : "running",
                  } as React.CSSProperties
                }
              >
                <g
                  tabIndex={0}
                  role="button"
                  aria-label={`${l.short}, ${l.from} to ${l.to}, ${l.open} tonnes open capacity`}
                  className="cursor-pointer outline-none"
                  onMouseEnter={() => setHover(l.id)}
                  onMouseLeave={() => setHover((v) => (v === l.id ? null : v))}
                  onFocus={() => setHover(l.id)}
                  onBlur={() => setHover((v) => (v === l.id ? null : v))}
                >
                  <circle r="20" fill="transparent" />
                  {detecting && (
                    <circle
                      className="ln-scan"
                      r="14"
                      fill="none"
                      stroke="var(--signal-cyan)"
                      strokeWidth="1"
                    />
                  )}
                  <g transform={`rotate(${angle})`}>
                    {/* line-style logistics vehicle */}
                    <rect
                      x="-11"
                      y="-5"
                      width="14"
                      height="10"
                      fill="var(--background)"
                      stroke={l.open > 0 ? "var(--signal-amber)" : "var(--muted-foreground)"}
                      strokeWidth="1.2"
                    />
                    <rect
                      x="3"
                      y="-4"
                      width="7"
                      height="9"
                      fill="var(--background)"
                      stroke={l.open > 0 ? "var(--signal-amber)" : "var(--muted-foreground)"}
                      strokeWidth="1.2"
                    />
                    <circle cx="-6" cy="6" r="1.6" fill="var(--muted-foreground)" />
                    <circle cx="6" cy="6" r="1.6" fill="var(--muted-foreground)" />
                  </g>
                  <text
                    x="0"
                    y="-16"
                    textAnchor="middle"
                    fontSize="10"
                    letterSpacing="1.2"
                    fill="var(--foreground)"
                    style={{ fontFamily: "var(--font-mono)" }}
                  >
                    {l.short}
                  </text>
                  {l.open > 0 && (
                    <text
                      x="0"
                      y="24"
                      textAnchor="middle"
                      fontSize="10"
                      letterSpacing="1.2"
                      fill={l.primary ? "var(--signal-green)" : "var(--signal-amber)"}
                      style={{ fontFamily: "var(--font-mono)" }}
                    >
                      {l.open}T OPEN
                    </text>
                  )}
                </g>
              </g>
            );
          })}
        </svg>

        {/* Detection / demand / match narration — overlay, JetBrains Mono */}
        {hero && (
          <div className="pointer-events-none absolute inset-x-3 bottom-3 flex flex-wrap items-end gap-2">
            {phase >= 1 && (
              <div className="border border-signal-cyan/40 bg-background/85 px-3 py-2 w-[190px]">
                <div className="font-mono text-[10px] tracking-[0.18em] text-signal-cyan">
                  {phase === 1 ? "SCANNING LANE…" : "CAPACITY SIGNAL DETECTED"}
                </div>
                <div className="mt-1 font-mono text-[11px]">
                  {hero.short} · {hero.open}T OPEN
                </div>
              </div>
            )}
            {phase >= 3 && demand && (
              <div className="border border-signal-amber/40 bg-background/85 px-3 py-2 w-[190px]">
                <div className="font-mono text-[10px] tracking-[0.18em] text-signal-amber">
                  DEMAND {demand.id.replace("DEM-", "#")}
                </div>
                <div className="mt-1 font-mono text-[11px] text-muted-foreground">
                  {demand.source.toUpperCase()} → {demand.destination.toUpperCase()}
                </div>
                <div className="font-mono text-[11px]">{demand.requiredCapacity}T REQUIRED</div>
              </div>
            )}
            {phase >= 4 && (
              <div className="border border-signal-green/50 bg-background/90 px-3 py-2 w-[170px]">
                <div className="font-mono text-[10px] tracking-[0.18em] text-muted-foreground">
                  CIRCUIT MATCH
                </div>
                <div className="mt-1 font-mono text-2xl text-signal-green">
                  {matchScore ?? "—"} <span className="text-sm text-muted-foreground">/ 100</span>
                </div>
                <div className="font-mono text-[10px] tracking-[0.18em] text-signal-green">
                  EXCELLENT
                </div>
              </div>
            )}
          </div>
        )}

        {/* Lightweight truck tooltip */}
        {active && (
          <div className="pointer-events-none absolute right-3 top-3 w-[210px] border border-border bg-background/95 px-3 py-2.5">
            <div className="font-mono text-[11px] tracking-[0.18em] text-signal-green">
              {active.short}
            </div>
            <div className="mt-0.5 font-mono text-[10px] tracking-[0.14em] text-muted-foreground">
              {active.from.toUpperCase()} → {active.to.toUpperCase()}
            </div>
            <dl className="mt-2 space-y-1 font-mono text-[11px]">
              <Row k="TOTAL" v={`${active.total}T`} />
              <Row k="LOADED" v={`${active.load}T`} />
              <Row k="OPEN" v={`${active.open}T`} tone="text-signal-amber" />
              <Row k="DEPARTURE" v={active.departure} />
            </dl>
            <div className="mt-2 border-t border-border pt-2">
              <div className="label-sys">MATCH POTENTIAL</div>
              <div className="font-mono text-lg text-signal-amber">
                {mounted ? `${active.opportunity}%` : "—"}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function Row({ k, v, tone }: { k: string; v: string; tone?: string }) {
  return (
    <div className="flex items-center justify-between gap-3">
      <dt className="text-muted-foreground">{k}</dt>
      <dd className={tone}>{v}</dd>
    </div>
  );
}
