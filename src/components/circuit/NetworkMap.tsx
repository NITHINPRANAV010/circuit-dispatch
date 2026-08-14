import type { ReactNode } from "react";

const CITY_POS: Record<string, { x: number; y: number }> = {
  Chennai: { x: 640, y: 250 },
  Bangalore: { x: 380, y: 210 },
  Coimbatore: { x: 330, y: 350 },
  Hyderabad: { x: 420, y: 60 },
  Madurai: { x: 470, y: 420 },
  Pondicherry: { x: 620, y: 330 },
};

export interface NetworkEdge {
  id: string;
  from: string;
  to: string;
  openTonnes: number;
  vehicleId: string;
  matched?: boolean;
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
  const used = new Set<string>();
  edges.forEach((e) => {
    used.add(e.from);
    used.add(e.to);
  });

  return (
    <div className="relative">
      <svg
        viewBox="0 0 900 470"
        style={{ height }}
        className="w-full"
        role="img"
        aria-label="CIRCUIT capacity network: active routes and open capacity"
      >
        <defs>
          <pattern id="netgrid" width="45" height="45" patternUnits="userSpaceOnUse">
            <path d="M45 0H0V45" fill="none" stroke="var(--border)" strokeWidth="0.6" opacity="0.5" />
          </pattern>
        </defs>
        <rect width="900" height="470" fill="url(#netgrid)" />

        {edges.map((e, i) => {
          const a = CITY_POS[e.from];
          const b = CITY_POS[e.to];
          if (!a || !b) return null;
          const mx = (a.x + b.x) / 2;
          const my = (a.y + b.y) / 2;
          const stroke = e.matched ? "var(--signal-cyan)" : "var(--signal-green)";
          return (
            <g key={e.id}>
              <line x1={a.x} y1={a.y} x2={b.x} y2={b.y} stroke="var(--border)" strokeWidth="2" />
              <line
                x1={a.x}
                y1={a.y}
                x2={b.x}
                y2={b.y}
                stroke={stroke}
                strokeWidth="1.5"
                className="route-dash"
                style={{ animationDelay: `${i * 180}ms` }}
              />
              <rect
                x={mx - 46}
                y={my - 22}
                width="92"
                height="18"
                fill="var(--surface)"
                stroke="var(--border)"
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
      {footer}
    </div>
  );
}
