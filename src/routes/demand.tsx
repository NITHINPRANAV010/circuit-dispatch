import { useState } from "react";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { AppShell } from "@/components/circuit/AppShell";
import { Panel, RouteLine, inr, timeOf, dateOf } from "@/components/circuit/primitives";
import { useCircuit } from "@/lib/circuit/useCircuit";
import { MatchingEngine } from "@/lib/circuit/matching-engine.js";

export const Route = createFileRoute("/demand")({
  head: () => ({
    meta: [
      { title: "Demand Requests — CIRCUIT Freight Tickets" },
      {
        name: "description",
        content:
          "Raise freight demand tickets and run the CIRCUIT match engine against available truck capacity.",
      },
      { property: "og:title", content: "Demand Requests — CIRCUIT" },
      {
        property: "og:description",
        content: "Raise freight demand tickets and run the CIRCUIT match engine.",
      },
    ],
  }),
  component: DemandPage,
});

const today = () => new Date().toISOString().slice(0, 10);

const FIELD =
  "w-full rounded-[4px] border border-border bg-background px-3 py-2 font-mono text-sm text-foreground outline-none focus:border-signal-cyan";

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block min-w-0">
      <span className="label-sys">{label}</span>
      <span className="mt-1.5 block">{children}</span>
    </label>
  );
}

function DemandPage() {
  const { ready, State } = useCircuit();
  const navigate = useNavigate();
  const [form, setForm] = useState({
    cargoType: "Textiles",
    requiredCapacity: "4",
    source: "Chennai",
    destination: "Bangalore",
    pickupDate: today(),
    pickupTime: "18:00",
    deliveryDate: today(),
    deliveryTime: "23:00",
    budget: "8000",
    specialRequirements: "",
    contactPerson: "",
    contactPhone: "",
  });

  const set = (k: string, v: string) => setForm((f) => ({ ...f, [k]: v }));

  if (!ready) {
    return (
      <AppShell section="DEMAND" page="REQUESTS">
        <div className="label-sys">LOADING REQUESTS…</div>
      </AppShell>
    );
  }

  const demands = State.getDemands();

  function submit(e: React.FormEvent) {
    e.preventDefault();
    const created = State.addDemand(form);
    navigate({ to: "/matches", search: { demand: created.id } });
  }

  return (
    <AppShell section="DEMAND" page="NEW REQUEST">
      <div className="grid gap-4 xl:grid-cols-[minmax(0,1.4fr)_minmax(0,1fr)]">
        <Panel title="FREIGHT REQUEST TICKET" meta="DEMAND / NEW REQUEST">
          <form onSubmit={submit} className="space-y-6">
            <fieldset className="grid gap-3 sm:grid-cols-3">
              <legend className="label-sys mb-2 w-full border-b border-border pb-1">
                01 — CARGO
              </legend>
              <Field label="CARGO TYPE">
                <input
                  className={FIELD}
                  required
                  value={form.cargoType}
                  onChange={(e) => set("cargoType", e.target.value)}
                />
              </Field>
              <Field label="REQUIRED CAPACITY (T)">
                <input
                  type="number"
                  step="0.1"
                  min="0.1"
                  required
                  className={FIELD}
                  value={form.requiredCapacity}
                  onChange={(e) => set("requiredCapacity", e.target.value)}
                />
              </Field>
              <Field label="BUDGET (₹)">
                <input
                  type="number"
                  step="100"
                  min="0"
                  required
                  className={FIELD}
                  value={form.budget}
                  onChange={(e) => set("budget", e.target.value)}
                />
              </Field>
            </fieldset>

            <fieldset className="grid gap-3 sm:grid-cols-2">
              <legend className="label-sys mb-2 w-full border-b border-border pb-1">
                02 — ROUTE
              </legend>
              <Field label="ORIGIN">
                <input
                  className={FIELD}
                  required
                  value={form.source}
                  onChange={(e) => set("source", e.target.value)}
                />
              </Field>
              <Field label="DESTINATION">
                <input
                  className={FIELD}
                  required
                  value={form.destination}
                  onChange={(e) => set("destination", e.target.value)}
                />
              </Field>
            </fieldset>

            <fieldset className="grid gap-3 sm:grid-cols-4">
              <legend className="label-sys mb-2 w-full border-b border-border pb-1">
                03 — WINDOW
              </legend>
              <Field label="PICKUP DATE">
                <input
                  type="date"
                  required
                  className={FIELD}
                  value={form.pickupDate}
                  onChange={(e) => set("pickupDate", e.target.value)}
                />
              </Field>
              <Field label="PICKUP TIME">
                <input
                  type="time"
                  required
                  className={FIELD}
                  value={form.pickupTime}
                  onChange={(e) => set("pickupTime", e.target.value)}
                />
              </Field>
              <Field label="DELIVERY DATE">
                <input
                  type="date"
                  required
                  className={FIELD}
                  value={form.deliveryDate}
                  onChange={(e) => set("deliveryDate", e.target.value)}
                />
              </Field>
              <Field label="DELIVERY TIME">
                <input
                  type="time"
                  required
                  className={FIELD}
                  value={form.deliveryTime}
                  onChange={(e) => set("deliveryTime", e.target.value)}
                />
              </Field>
            </fieldset>

            <fieldset className="grid gap-3 sm:grid-cols-3">
              <legend className="label-sys mb-2 w-full border-b border-border pb-1">
                04 — HANDLING
              </legend>
              <Field label="SPECIAL REQUIREMENTS">
                <input
                  className={FIELD}
                  value={form.specialRequirements}
                  onChange={(e) => set("specialRequirements", e.target.value)}
                />
              </Field>
              <Field label="CONTACT PERSON">
                <input
                  className={FIELD}
                  value={form.contactPerson}
                  onChange={(e) => set("contactPerson", e.target.value)}
                />
              </Field>
              <Field label="CONTACT PHONE">
                <input
                  className={FIELD}
                  value={form.contactPhone}
                  onChange={(e) => set("contactPhone", e.target.value)}
                />
              </Field>
            </fieldset>

            <button
              type="submit"
              className="rounded-[4px] bg-signal-green px-5 py-2.5 font-mono text-[11px] uppercase tracking-[0.18em] text-background transition-opacity hover:opacity-90"
            >
              Run match engine →
            </button>
          </form>
        </Panel>

        <Panel title="OPEN DEMAND" meta={`${demands.length} TICKETS`}>
          <ul className="space-y-3">
            {demands.map((d: any) => (
              <li key={d.id} className="border border-border p-3">
                <div className="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-3">
                  <span className="truncate font-mono text-xs">{d.id}</span>
                  <span
                    className={`label-sys shrink-0 ${
                      d.status === "matched" ? "text-signal-cyan" : "text-signal-amber"
                    }`}
                  >
                    {String(d.status).toUpperCase()}
                  </span>
                </div>
                <div className="mt-3">
                  <RouteLine
                    origin={d.source}
                    destination={d.destination}
                    distanceKm={MatchingEngine.getDistance(d.source, d.destination)}
                    note={`${d.requiredCapacity}T CARGO`}
                    active={d.status !== "matched"}
                  />
                </div>
                <div className="mt-3 grid grid-cols-3 gap-2 font-mono text-[10px] text-muted-foreground">
                  <span>PICKUP {dateOf(d.pickupDatetime)} · {timeOf(d.pickupDatetime)}</span>
                  <span>{d.cargoType?.toUpperCase()}</span>
                  <span className="text-right text-foreground">{inr(d.budget)}</span>
                </div>
                <button
                  type="button"
                  onClick={() => navigate({ to: "/matches", search: { demand: d.id } })}
                  className="mt-3 rounded-[4px] border border-border px-3 py-1.5 font-mono text-[10px] uppercase tracking-[0.16em] text-foreground transition-colors hover:border-signal-green hover:text-signal-green"
                >
                  Find match →
                </button>
              </li>
            ))}
          </ul>
        </Panel>
      </div>
    </AppShell>
  );
}
