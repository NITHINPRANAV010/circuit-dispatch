import { useEffect, useState, type ReactNode } from "react";
import { Link, useNavigate, useRouterState } from "@tanstack/react-router";
import {
  Activity,
  BarChart3,
  Menu,
  Package,
  Receipt,
  Route as RouteIcon,
  Settings,
  Signal,
  Truck,
  X,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useCircuit } from "@/lib/circuit/useCircuit";
import { StatusDot } from "./primitives";

const NAV: { group: string; items: { to: string; label: string; icon: typeof Truck }[] }[] = [
  {
    group: "OPERATIONS",
    items: [
      { to: "/dashboard", label: "Overview", icon: Activity },
      { to: "/capacity", label: "Capacity", icon: Truck },
      { to: "/demand", label: "Demand", icon: Package },
      { to: "/matches", label: "Matches", icon: Signal },
      { to: "/network", label: "Network", icon: RouteIcon },
    ],
  },
  {
    group: "FINANCE",
    items: [
      { to: "/transactions", label: "Transactions", icon: Receipt },
      { to: "/analytics", label: "Analytics", icon: BarChart3 },
    ],
  },
  {
    group: "SYSTEM",
    items: [{ to: "/settings", label: "Settings", icon: Settings }],
  },
];

function Clock() {
  const [now, setNow] = useState<Date | null>(null);
  useEffect(() => {
    setNow(new Date());
    const t = setInterval(() => setNow(new Date()), 30_000);
    return () => clearInterval(t);
  }, []);
  if (!now) return <span className="label-sys">—</span>;
  const day = now.toLocaleDateString("en-IN", { weekday: "long" }).toUpperCase();
  const date = now
    .toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" })
    .toUpperCase();
  const time = now.toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit", hour12: false });
  return (
    <span className="label-sys">
      {day} · {date} · {time} IST
    </span>
  );
}

export function AppShell({
  section,
  page,
  actions,
  children,
}: {
  section: string;
  page: string;
  actions?: ReactNode;
  children: ReactNode;
}) {
  const { ready, State } = useCircuit();
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);
  const pathname = useRouterState({ select: (s) => s.location.pathname });

  useEffect(() => {
    if (!ready) return;
    if (!State.getUser()) navigate({ to: "/login" });
  }, [ready, State, navigate, pathname]);

  useEffect(() => {
    setOpen(false);
  }, [pathname]);

  return (
    <div className="min-h-screen bg-background">
      <div className="mx-auto flex min-h-screen w-full">
        {/* Sidebar */}
        <aside
          className={cn(
            "fixed inset-y-0 left-0 z-40 w-56 shrink-0 border-r border-border bg-surface transition-transform lg:sticky lg:top-0 lg:h-screen lg:translate-x-0",
            open ? "translate-x-0" : "-translate-x-full",
          )}
        >
          <div className="flex h-14 items-center justify-between border-b border-border px-4">
            <Link to="/dashboard" className="font-mono text-sm tracking-[0.24em] text-foreground">
              CIRCUIT
            </Link>
            <button
              type="button"
              aria-label="Close navigation"
              onClick={() => setOpen(false)}
              className="text-muted-foreground lg:hidden"
            >
              <X className="size-4" />
            </button>
          </div>

          <nav className="px-2 py-4">
            {NAV.map((group) => (
              <div key={group.group} className="mb-5">
                <div className="label-sys px-2 pb-2">{group.group}</div>
                <ul className="space-y-px">
                  {group.items.map((item) => {
                    const active = pathname === item.to || pathname.startsWith(`${item.to}/`);
                    const Icon = item.icon;
                    return (
                      <li key={item.to}>
                        <Link
                          to={item.to}
                          className={cn(
                            "flex items-center gap-2.5 rounded-[4px] border-l-2 px-2 py-1.5 text-[13px] transition-colors",
                            active
                              ? "border-signal-green bg-elevated text-foreground"
                              : "border-transparent text-muted-foreground hover:bg-elevated hover:text-foreground",
                          )}
                        >
                          <Icon className="size-3.5 shrink-0" aria-hidden />
                          <span className="truncate">{item.label}</span>
                        </Link>
                      </li>
                    );
                  })}
                </ul>
              </div>
            ))}
          </nav>

          <div className="absolute inset-x-0 bottom-0 border-t border-border px-4 py-3">
            <div className="flex items-center gap-2">
              <StatusDot />
              <span className="label-sys">CIRCUIT MONITORING</span>
            </div>
            <button
              type="button"
              onClick={() => {
                State.logout();
                navigate({ to: "/login" });
              }}
              className="mt-2 font-mono text-[10px] uppercase tracking-[0.14em] text-muted-foreground hover:text-signal-red"
            >
              End session
            </button>
          </div>
        </aside>

        {open && (
          <button
            type="button"
            aria-label="Close navigation overlay"
            className="fixed inset-0 z-30 bg-background/70 lg:hidden"
            onClick={() => setOpen(false)}
          />
        )}

        {/* Main */}
        <div className="min-w-0 flex-1">
          <header className="sticky top-0 z-20 grid grid-cols-[minmax(0,1fr)_auto] items-center gap-4 border-b border-border bg-background/95 px-4 py-3 backdrop-blur sm:px-6">
            <div className="flex min-w-0 items-center gap-3">
              <button
                type="button"
                aria-label="Open navigation"
                onClick={() => setOpen(true)}
                className="text-muted-foreground lg:hidden"
              >
                <Menu className="size-4" />
              </button>
              <div className="min-w-0">
                <h1 className="truncate font-mono text-[13px] uppercase tracking-[0.2em] text-foreground">
                  {section} / {page}
                </h1>
                <Clock />
              </div>
            </div>
            <div className="flex shrink-0 items-center gap-3">{actions}</div>
          </header>

          <main className="px-4 py-5 sm:px-6 sm:py-6">{children}</main>
        </div>
      </div>
    </div>
  );
}
