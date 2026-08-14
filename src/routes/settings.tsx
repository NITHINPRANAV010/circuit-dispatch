import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { AppShell } from "@/components/circuit/AppShell";
import { Panel, StatusDot } from "@/components/circuit/primitives";
import { useCircuit } from "@/lib/circuit/useCircuit";

export const Route = createFileRoute("/settings")({
  head: () => ({
    meta: [
      { title: "System Settings — CIRCUIT Console" },
      {
        name: "description",
        content:
          "Operator profile, role context and demo network controls for the CIRCUIT capacity exchange console.",
      },
      { property: "og:title", content: "System Settings — CIRCUIT" },
      {
        property: "og:description",
        content: "Operator profile, role context and demo network controls.",
      },
    ],
  }),
  component: SettingsPage,
});

function SettingsPage() {
  const { ready, State } = useCircuit();
  const navigate = useNavigate();

  if (!ready) {
    return (
      <AppShell section="SYSTEM" page="SETTINGS">
        <div className="label-sys">LOADING SYSTEM…</div>
      </AppShell>
    );
  }

  const user = State.getUser();
  const role = State.getRole();

  return (
    <AppShell section="SYSTEM" page="SETTINGS">
      <div className="grid gap-4 xl:grid-cols-2">
        <Panel title="OPERATOR" meta="SESSION CONTEXT">
          <dl className="space-y-3 font-mono text-xs">
            <div className="grid grid-cols-[minmax(0,1fr)_auto] gap-3">
              <dt className="label-sys">NAME</dt>
              <dd className="truncate">{user?.name ?? "GUEST OPERATOR"}</dd>
            </div>
            <div className="grid grid-cols-[minmax(0,1fr)_auto] gap-3">
              <dt className="label-sys">EMAIL</dt>
              <dd className="truncate">{user?.email ?? "—"}</dd>
            </div>
            <div className="grid grid-cols-[minmax(0,1fr)_auto] gap-3">
              <dt className="label-sys">ROLE</dt>
              <dd className="text-signal-green">{String(role ?? "supplier").toUpperCase()}</dd>
            </div>
          </dl>

          <div className="mt-5 border-t border-border pt-4">
            <div className="label-sys mb-2">SWITCH ROLE</div>
            <div className="flex gap-2">
              {["supplier", "customer"].map((r) => (
                <button
                  key={r}
                  type="button"
                  onClick={() => State.setRole(r)}
                  className={`rounded-[4px] border px-3 py-1.5 font-mono text-[10px] uppercase tracking-[0.16em] transition-colors ${
                    role === r
                      ? "border-signal-green text-signal-green"
                      : "border-border text-muted-foreground hover:border-signal-green hover:text-signal-green"
                  }`}
                >
                  {r}
                </button>
              ))}
            </div>
          </div>
        </Panel>

        <Panel title="DEMO NETWORK" meta="DATA CONTROLS">
          <div className="flex items-center gap-2">
            <StatusDot />
            <span className="label-sys">LOCAL STORE ACTIVE</span>
          </div>
          <p className="mt-3 text-xs leading-relaxed text-muted-foreground">
            CIRCUIT runs on a local demo network. Resetting restores the seeded fleet, demand
            tickets and ledger to their original state.
          </p>
          <div className="mt-5 flex flex-wrap gap-2">
            <button
              type="button"
              onClick={() => {
                State.resetDemoData();
                navigate({ to: "/dashboard" });
              }}
              className="rounded-[4px] border border-border px-4 py-2 font-mono text-[10px] uppercase tracking-[0.18em] hover:border-signal-amber hover:text-signal-amber"
            >
              Reset demo network
            </button>
            <button
              type="button"
              onClick={() => {
                State.logout();
                navigate({ to: "/login" });
              }}
              className="rounded-[4px] border border-border px-4 py-2 font-mono text-[10px] uppercase tracking-[0.18em] text-muted-foreground hover:border-signal-red hover:text-signal-red"
            >
              End session
            </button>
          </div>
        </Panel>
      </div>
    </AppShell>
  );
}
