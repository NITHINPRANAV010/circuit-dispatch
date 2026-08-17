import { useState, type ReactNode } from "react";

const CITY_POS: Record<string, { x: number; y: number }> = {
  Chennai: { x: 730, y: 180 },
  Bangalore: { x: 330, y: 245 },
  Coimbatore: { x: 240, y: 400 },
  Hyderabad: { x: 150, y: 80 },
  Madurai: { x: 500, y: 405 },
  Pondicherry: { x: 650, y: 320 },
};

export interface NetworkEdge {
  id: string;
  from: string;
  to: string;
  openTonnes: number;
  vehicleId: string;
  matched?: boolean;
  totalCapacity?: number | undefined;
  currentLoad?: number | undefined;
  opportunity?: number | undefined;
  distanceKm?: number | undefined;
}

export function NetworkMap({
  edges,
  footer,
  height = 320,
}: {
  edges: NetworkEdge[];
  footer?: ReactNode;
  height?: number;
}) {
  const [activeId, setActiveId] = useState<string | null>(null);
  const used = new Set<string>();
  edges.forEach((e) => {
    used.add(e.from);
    used.add(e.to);
  });

  const selected = edges.find((e) => e.id === activeId) ?? null;

  return (
    <div className="relative">
      <svg
        viewBox="60 40 800 400"
        style={{ maxHeight: height * 1.6 }}
        className="h-auto w-full"
        role="img"
        aria-label="CIRCUIT capacity network: active routes and open capacity"
      >
        <defs>
          <pattern id="netgrid" width="45" height="45" patternUnits="userSpaceOnUse">
            <path d="M45 0H0V45" fill="none" stroke="var(--border)" strokeWidth="0.6" opacity="0.5" />
          </pattern>
        </defs>
        <rect x="60" y="40" width="800" height="400" fill="url(#netgrid)" />

        {edges.map((e, i) => {
          const a = CITY_POS[e.from];
          const b = CITY_POS[e.to];
          if (!a || !b) return null;
          const mx = (a.x + b.x) / 2;
          const my = (a.y + b.y) / 2;
          const stroke = e.matched ? "var(--signal-cyan)" : "var(--signal-green)";
          const isActive = e.id === activeId;
          const dim = activeId !== null && !isActive;
          return (
            <g
              key={e.id}
              tabIndex={0}
              role="button"
              aria-label={`Route ${e.from} to ${e.to}, vehicle ${e.vehicleId}, ${e.openTonnes.toFixed(1)} tonnes open`}
              className="cursor-pointer outline-none"
              opacity={dim ? 0.32 : 1}
              onMouseEnter={() => setActiveId(e.id)}
              onMouseLeave={() => setActiveId((v) => (v === e.id ? null : v))}
              onFocus={() => setActiveId(e.id)}
              onBlur={() => setActiveId((v) => (v === e.id ? null : v))}
              onClick={() => setActiveId((v) => (v === e.id ? null : e.id))}
            >
              <line
                x1={a.x}
                y1={a.y}
                x2={b.x}
                y2={b.y}
                stroke="transparent"
                strokeWidth="18"
              />
              <line x1={a.x} y1={a.y} x2={b.x} y2={b.y} stroke="var(--border)" strokeWidth="2" />
              <line
                x1={a.x}
                y1={a.y}
                x2={b.x}
                y2={b.y}
                stroke={stroke}
                strokeWidth={isActive ? 2.6 : 1.5}
                className="route-dash"
                style={{ animationDelay: `${i * 180}ms` }}
              />
              <rect
                x={mx - 46}
                y={my - 22}
                width="92"
                height="18"
                fill="var(--surface)"
                stroke={isActive ? stroke : "var(--border)"}
              />
              <text
                x={mx}
                y={my - 9}
                textAnchor="middle"
                fill={stroke}
                fontSize="10"
                fontFamily="var(--font-mono)"
                letterSpacing="1"
              >
                {e.openTonnes.toFixed(1)}T OPEN
              </text>
              <text
                x={mx}
                y={my + 12}
                textAnchor="middle"
                fill="var(--muted-foreground)"
                fontSize="9"
                fontFamily="var(--font-mono)"
                letterSpacing="1"
              >
                {e.vehicleId.toUpperCase()}
              </text>
            </g>
          );
        })}

        {Object.entries(CITY_POS).map(([city, p]) => {
          const active = used.has(city);
          return (
            <g key={city}>
              <circle
                cx={p.x}
                cy={p.y}
                r={active ? 5 : 3}
                fill={active ? "var(--signal-green)" : "var(--border)"}
              />
              {active && (
                <circle
                  cx={p.x}
                  cy={p.y}
                  r="11"
                  fill="none"
                  stroke="var(--signal-green)"
                  strokeWidth="0.8"
                  opacity="0.5"
                />
              )}
              <text
                x={p.x}
                y={p.y + 24}
                textAnchor="middle"
                fill={active ? "var(--foreground)" : "var(--muted-foreground)"}
                fontSize="11"
                fontFamily="var(--font-mono)"
                letterSpacing="1.5"
              >
                {city.toUpperCase()}
              </text>
            </g>
          );
        })}
      </svg>

      <div className="mt-2 border-t border-border pt-2">
        {selected ? (
          <dl className="grid grid-cols-2 gap-x-4 gap-y-2 sm:grid-cols-3 lg:grid-cols-6">
            <Field label="TRUCK" value={selected.vehicleId.toUpperCase()} />
            <Field
              label="ROUTE"
              value={`${selected.from.toUpperCase()} → ${selected.to.toUpperCase()}`}
            />
            <Field
              label="TOTAL"
              value={selected.totalCapacity != null ? `${selected.totalCapacity.toFixed(1)}T` : "—"}
            />
            <Field
              label="LOADED"
              value={selected.currentLoad != null ? `${selected.currentLoad.toFixed(1)}T` : "—"}
              tone="text-signal-cyan"
            />
            <Field label="OPEN" value={`${selected.openTonnes.toFixed(1)}T`} tone="text-signal-green" />
            <Field
              label="OPPORTUNITY"
              value={selected.opportunity != null ? `${selected.opportunity}%` : "—"}
              tone="text-signal-amber"
            />
          </dl>
        ) : (
          <p className="label-sys">HOVER OR SELECT A LANE FOR VEHICLE DETAIL</p>
        )}
      </div>
      {footer}
    </div>
  );
}

function Field({ label, value, tone }: { label: string; value: string; tone?: string }) {
  return (
    <div className="min-w-0">
      <dt className="label-sys truncate">{label}</dt>
      <dd className={`truncate font-mono text-xs tabular-nums ${tone ?? "text-foreground"}`}>
        {value}
      </dd>
    </div>
  );
}
