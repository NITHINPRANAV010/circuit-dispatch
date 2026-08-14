import { useEffect, useRef, useState, type ReactNode } from "react";
import { cn } from "@/lib/utils";

/* ── Text / layout primitives ─────────────────────────── */

export function SysLabel({ children, className }: { children: ReactNode; className?: string }) {
  return <div className={cn("label-sys", className)}>{children}</div>;
}

export function Mono({ children, className }: { children: ReactNode; className?: string }) {
  return <span className={cn("font-mono tabular-nums", className)}>{children}</span>;
}

export function Panel({
  title,
  meta,
  children,
  className,
  bodyClassName,
}: {
  title?: ReactNode;
  meta?: ReactNode;
  children: ReactNode;
  className?: string;
  bodyClassName?: string;
}) {
  return (
    <section className={cn("border border-border bg-surface rounded-lg", className)}>
      {(title || meta) && (
        <header className="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-3 border-b border-border px-4 py-2.5">
          <div className="label-sys truncate">{title}</div>
          {meta ? <div className="label-sys shrink-0">{meta}</div> : null}
        </header>
      )}
      <div className={cn("p-4", bodyClassName)}>{children}</div>
    </section>
  );
}

export function StatusDot({ tone = "green" }: { tone?: "green" | "cyan" | "amber" | "red" }) {
  const map = {
    green: "bg-signal-green",
    cyan: "bg-signal-cyan",
    amber: "bg-signal-amber",
    red: "bg-signal-red",
  } as const;
  return <span aria-hidden className={cn("inline-block size-1.5 rounded-full signal-pulse", map[tone])} />;
}

export function Stat({
  label,
  value,
  hint,
  tone,
}: {
  label: string;
  value: ReactNode;
  hint?: string;
  tone?: "green" | "cyan" | "amber" | "default";
}) {
  const toneClass =
    tone === "green"
      ? "text-signal-green"
      : tone === "cyan"
        ? "text-signal-cyan"
        : tone === "amber"
          ? "text-signal-amber"
          : "text-foreground";
  return (
    <div className="min-w-0 px-4 py-3">
      <div className="label-sys truncate">{label}</div>
      <div className={cn("mt-1.5 font-mono text-xl tabular-nums", toneClass)}>{value}</div>
      {hint ? <div className="mt-1 text-[10px] text-muted-foreground">{hint}</div> : null}
    </div>
  );
}

/* ── Count-up ─────────────────────────────────────────── */

export function CountUp({
  value,
  decimals = 0,
  prefix = "",
  suffix = "",
}: {
  value: number;
  decimals?: number;
  prefix?: string;
  suffix?: string;
}) {
  const [shown, setShown] = useState(0);
  const raf = useRef<number | null>(null);

  useEffect(() => {
    const start = performance.now();
    const from = 0;
    const duration = 650;
    const tick = (now: number) => {
      const t = Math.min(1, (now - start) / duration);
      const eased = 1 - Math.pow(1 - t, 3);
      setShown(from + (value - from) * eased);
      if (t < 1) raf.current = requestAnimationFrame(tick);
    };
    raf.current = requestAnimationFrame(tick);
    return () => {
      if (raf.current) cancelAnimationFrame(raf.current);
    };
  }, [value]);

  const formatted =
    decimals > 0
      ? shown.toFixed(decimals)
      : Math.round(shown).toLocaleString("en-IN");

  return (
    <span className="tabular-nums">
      {prefix}
      {formatted}
      {suffix}
    </span>
  );
}

/* ── Capacity rail ────────────────────────────────────── */

export function CapacityRail({
  total,
  load,
  segments = 10,
  vehicleId,
  compact = false,
}: {
  total: number;
  load: number;
  segments?: number;
  vehicleId?: string;
  compact?: boolean;
}) {
  const safeTotal = total > 0 ? total : 1;
  const open = Math.max(0, total - load);
  const filled = Math.round((load / safeTotal) * segments);

  return (
    <div className="min-w-0">
      {(vehicleId || !compact) && (
        <div className="mb-1.5 flex items-baseline justify-between gap-3">
          <span className="font-mono text-xs text-foreground">{vehicleId}</span>
          <span className="label-sys shrink-0">{total.toFixed(1)}T TOTAL</span>
        </div>
      )}
      <div
        className="flex gap-[2px]"
        role="img"
        aria-label={`${load} tonnes loaded of ${total} tonnes, ${open} tonnes open`}
      >
        {Array.from({ length: segments }).map((_, i) => (
          <div
            key={i}
            className={cn(
              "h-4 flex-1 rounded-[2px] border",
              i < filled
                ? "border-signal-cyan/50 bg-signal-cyan/70"
                : "border-border bg-signal-green/10",
            )}
            style={{ animation: `reveal-up 0.35s ${i * 22}ms both` }}
          />
        ))}
      </div>
      <div className="mt-1.5 flex items-baseline justify-between gap-3">
        <span className="font-mono text-[10px] text-signal-cyan">{load.toFixed(1)}T LOADED</span>
        <span className="font-mono text-[10px] text-signal-green">{open.toFixed(1)}T OPEN</span>
      </div>
    </div>
  );
}

/* ── Route line ───────────────────────────────────────── */

export function RouteLine({
  origin,
  destination,
  distanceKm,
  note,
  active = true,
}: {
  origin: string;
  destination: string;
  distanceKm?: number;
  note?: string;
  active?: boolean;
}) {
  return (
    <div className="min-w-0">
      <div className="grid grid-cols-[minmax(0,1fr)_auto_minmax(0,1fr)] items-center gap-3">
        <span className="truncate font-mono text-xs uppercase tracking-wider text-foreground">
          {origin}
        </span>
        <span className="label-sys shrink-0">
          {distanceKm ? `${distanceKm} KM` : "ROUTE"}
        </span>
        <span className="truncate text-right font-mono text-xs uppercase tracking-wider text-foreground">
          {destination}
        </span>
      </div>
      <svg viewBox="0 0 200 12" className="mt-2 h-3 w-full" aria-hidden preserveAspectRatio="none">
        <line x1="3" y1="6" x2="197" y2="6" stroke="var(--border)" strokeWidth="1" />
        {active && (
          <line
            x1="3"
            y1="6"
            x2="197"
            y2="6"
            stroke="var(--signal-green)"
            strokeWidth="1.5"
            className="route-dash"
          />
        )}
        <circle cx="4" cy="6" r="3" fill="var(--signal-green)" />
        <circle cx="196" cy="6" r="3" fill="var(--background)" stroke="var(--signal-green)" strokeWidth="1.5" />
      </svg>
      {note ? (
        <div className="mt-1.5 text-center font-mono text-[10px] tracking-wider text-signal-green">
          {note}
        </div>
      ) : null}
    </div>
  );
}

/* ── Match index + score bars ─────────────────────────── */

const SCORE_ROWS: { key: string; label: string }[] = [
  { key: "capacityScore", label: "CAPACITY" },
  { key: "routeScore", label: "ROUTE" },
  { key: "timeScore", label: "TIME" },
  { key: "priceScore", label: "PRICE" },
  { key: "distanceScore", label: "DISTANCE" },
  { key: "reliabilityScore", label: "RELIABILITY" },
];

export function MatchIndex({ score, label }: { score: number; label: string }) {
  const tone =
    score >= 90 ? "text-signal-green" : score >= 80 ? "text-signal-cyan" : "text-signal-amber";
  return (
    <div className="reveal-up">
      <div className="label-sys">CIRCUIT MATCH INDEX</div>
      <div className="mt-1 flex items-baseline gap-2">
        <span className={cn("font-mono text-4xl leading-none tabular-nums", tone)}>
          <CountUp value={score} />
        </span>
        <span className="font-mono text-sm text-muted-foreground">/ 100</span>
      </div>
      <div className={cn("mt-1 font-mono text-[11px] uppercase tracking-[0.18em]", tone)}>
        {label.replace(" Match", "")}
      </div>
    </div>
  );
}

export function ScoreBars({ breakdown }: { breakdown: Record<string, number> }) {
  return (
    <div className="space-y-2">
      {SCORE_ROWS.map((row, i) => {
        const v = breakdown[row.key] ?? 0;
        return (
          <div key={row.key} className="grid grid-cols-[92px_minmax(0,1fr)_32px] items-center gap-3">
            <span className="label-sys truncate">{row.label}</span>
            <div className="h-2 w-full border border-border bg-elevated">
              <div
                className="h-full bg-signal-cyan rail-fill"
                style={{ width: `${v}%`, animationDelay: `${i * 60}ms` }}
              />
            </div>
            <span className="font-mono text-[11px] tabular-nums text-foreground">{v}</span>
          </div>
        );
      })}
    </div>
  );
}

/* ── Operational states ───────────────────────────────── */

export function EmptyState({ title, lines }: { title: string; lines: string[] }) {
  return (
    <div className="border border-dashed border-border bg-surface/50 px-6 py-10 text-center rounded-lg">
      <div className="font-mono text-xs uppercase tracking-[0.18em] text-foreground">{title}</div>
      {lines.map((l) => (
        <p key={l} className="mx-auto mt-2 max-w-sm text-xs leading-relaxed text-muted-foreground">
          {l}
        </p>
      ))}
    </div>
  );
}

export function EngineLoader({ lines }: { lines: string[] }) {
  return (
    <div className="border border-border bg-surface p-6 rounded-lg">
      <div className="flex items-center gap-2">
        <StatusDot tone="cyan" />
        <span className="font-mono text-[11px] uppercase tracking-[0.18em] text-signal-cyan">
          CIRCUIT MATCH ENGINE
        </span>
      </div>
      <div className="mt-4 space-y-1.5">
        <div className="label-sys">COMPARING</div>
        {lines.map((l, i) => (
          <div
            key={l}
            className="font-mono text-xs text-foreground reveal-up"
            style={{ animationDelay: `${i * 120}ms` }}
          >
            {l}
          </div>
        ))}
      </div>
      <div className="mt-4 h-[2px] w-full overflow-hidden bg-elevated">
        <div className="h-full w-1/3 bg-signal-cyan rail-fill" />
      </div>
      <div className="mt-2 font-mono text-[10px] tracking-[0.2em] text-muted-foreground">
        CALCULATING...
      </div>
    </div>
  );
}

/* ── Formatting helpers ───────────────────────────────── */

export const inr = (n: number) => `₹${Math.round(n).toLocaleString("en-IN")}`;

export const timeOf = (iso?: string) => {
  if (!iso) return "--:--";
  const d = new Date(iso);
  return Number.isNaN(d.getTime())
    ? "--:--"
    : d.toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit", hour12: false });
};

export const dateOf = (iso?: string) => {
  if (!iso) return "--";
  const d = new Date(iso);
  return Number.isNaN(d.getTime())
    ? "--"
    : d.toLocaleDateString("en-IN", { day: "2-digit", month: "short" }).toUpperCase();
};

export const cityCode = (c: string) => (c || "").slice(0, 3).toUpperCase();
