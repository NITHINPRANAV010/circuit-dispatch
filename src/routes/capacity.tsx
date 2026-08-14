import { useState } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { AppShell } from "@/components/circuit/AppShell";
import {
  CapacityRail,
  Panel,
  RouteLine,
  StatusDot,
  inr,
  timeOf,
} from "@/components/circuit/primitives";
import { useCircuit } from "@/lib/circuit/useCircuit";
import { MatchingEngine } from "@/lib/circuit/matching-engine.js";
import { OpportunityPredictor } from "@/lib/circuit/opportunity-predictor.js";

export const Route = createFileRoute("/capacity")({
  head: () => ({
    meta: [
      { title: "Capacity Register — CIRCUIT Freight Manifest" },
      {
        name: "description",
        content:
          "Register available vehicle capacity as a digital freight manifest and let CIRCUIT forecast unused tonnage.",
      },
      { property: "og:title", content: "Capacity Register — CIRCUIT" },
      {
        property: "og:description",
        content: "Register vehicle capacity and forecast unused tonnage with CIRCUIT.",
      },
    ],
  }),
  component: CapacityPage,
});

const today = () => new Date().toISOString().slice(0, 10);

const FIELD =
  "w-full rounded-[4px] border border-border bg-background px-3 py-2 font-mono text-sm text-foreground outline-none focus:border-signal-cyan";

function Field({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <label className="block min-w-0">
      <span className="label-sys">{label}</span>
      <span className="mt-1.5 block">{children}</span>
    </label>
  );
}

function CapacityPage() {
  const { ready, State } = useCircuit();
  const [form, setForm] = useState({
    vehicleId: "",
    vehicleType: "Heavy Goods Vehicle",
    regNo: "",
    source: "Chennai",
    destination: "Bangalore",
    totalCapacity: "10",
    currentLoad: "4",
    departureDate: today(),
    departureTime: "22:00",
    arrivalDate: today(),
    arrivalTime: "06:00",
    minPrice: "6000",
    driverName: "",
    notes: "",
  });
  const [analysis, setAnalysis] = useState<{ capacity: any; prediction: any } | null>(null);

  const set = (k: string, v: string) => setForm((f) => ({ ...f, [k]: v }));

  if (!ready) {
    return (
      <AppShell section="CAPACITY" page="REGISTER">
        <div className="label-sys">LOADING MANIFEST…</div>
      </AppShell>
    );
  }

  const capacities = State.getCapacities();

  function submit(e: React.FormEvent) {
    e.preventDefault();
    const created = State.addCapacity(form);
    setAnalysis({ capacity: created, prediction: OpportunityPredictor.predict(created) });
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  return (
    <AppShell section="CAPACITY" page="NEW ENTRY">
      <div className="grid gap-4 xl:grid-cols-[minmax(0,1.5fr)_minmax(0,1fr)]">
        <div className="min-w-0 space-y-4">
          <Panel title="REGISTER AVAILABLE VEHICLE" meta="DIGITAL FREIGHT MANIFEST">
            <form onSubmit={submit} className="space-y-6">
              <fieldset className="space-y-3">
                <legend className="label-sys mb-2 border-b border-border pb-1 w-full">
                  01 — VEHICLE IDENTIFICATION
                </legend>
                <div className="grid gap-3 sm:grid-cols-2">
                  <Field label="TRUCK ID">
                    <input
                      className={FIELD}
                      required
                      placeholder="Truck #42"
                      value={form.vehicleId}
                      onChange={(e) => set("vehicleId", e.target.value)}
                    />
                  </Field>
                  <Field label="VEHICLE TYPE">
                    <select
                      className={FIELD}
                      value={form.vehicleType}
                      onChange={(e) => set("vehicleType", e.target.value)}
                    >
                      <option>Heavy Goods Vehicle</option>
                      <option>Medium Goods Vehicle</option>
                      <option>Light Goods Vehicle</option>
                      <option>Refrigerated Truck</option>
                    </select>
                  </Field>
                  <Field label="REGISTRATION">
                    <input
                      className={FIELD}
                      placeholder="TN-09-AX-4271"
                      value={form.regNo}
                      onChange={(e) => set("regNo", e.target.value)}
                    />
                  </Field>
                  <Field label="DRIVER">
                    <input
                      className={FIELD}
                      value={form.driverName}
                      onChange={(e) => set("driverName", e.target.value)}
                    />
                  </Field>
                </div>
              </fieldset>

              <fieldset className="space-y-3">
                <legend className="label-sys mb-2 border-b border-border pb-1 w-full">
                  02 — CAPACITY
                </legend>
                <div className="grid gap-3 sm:grid-cols-3">
                  <Field label="TOTAL CAPACITY (T)">
                    <input
                      type="number"
                      step="0.1"
                      min="0.1"
                      required
                      className={FIELD}
                      value={form.totalCapacity}
                      onChange={(e) => set("totalCapacity", e.target.value)}
                    />
                  </Field>
                  <Field label="CURRENT LOAD (T)">
                    <input
                      type="number"
                      step="0.1"
                      min="0"
                      required
                      className={FIELD}
                      value={form.currentLoad}
                      onChange={(e) => set("currentLoad", e.target.value)}
                    />
                  </Field>
                  <Field label="MINIMUM PRICE (₹)">
                    <input
                      type="number"
                      step="100"
                      min="0"
                      required
                      className={FIELD}
                      value={form.minPrice}
                      onChange={(e) => set("minPrice", e.target.value)}
                    />
                  </Field>
                </div>
                <div className="border border-border p-3">
                  <CapacityRail
                    vehicleId={form.vehicleId || "UNASSIGNED"}
                    total={parseFloat(form.totalCapacity) || 0}
                    load={parseFloat(form.currentLoad) || 0}
                  />
                </div>
              </fieldset>

              <fieldset className="space-y-3">
                <legend className="label-sys mb-2 border-b border-border pb-1 w-full">
                  03 — ROUTE
                </legend>
                <div className="grid gap-3 sm:grid-cols-2">
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
                </div>
              </fieldset>

              <fieldset className="space-y-3">
                <legend className="label-sys mb-2 border-b border-border pb-1 w-full">
                  04 — SCHEDULE
                </legend>
                <div className="grid gap-3 sm:grid-cols-4">
                  <Field label="DEPARTURE DATE">
                    <input
                      type="date"
                      required
                      className={FIELD}
                      value={form.departureDate}
                      onChange={(e) => set("departureDate", e.target.value)}
                    />
                  </Field>
                  <Field label="DEPARTURE">
                    <input
                      type="time"
                      required
                      className={FIELD}
                      value={form.departureTime}
                      onChange={(e) => set("departureTime", e.target.value)}
                    />
                  </Field>
                  <Field label="ARRIVAL DATE">
                    <input
                      type="date"
                      className={FIELD}
                      value={form.arrivalDate}
                      onChange={(e) => set("arrivalDate", e.target.value)}
                    />
                  </Field>
                  <Field label="ARRIVAL">
                    <input
                      type="time"
                      className={FIELD}
                      value={form.arrivalTime}
                      onChange={(e) => set("arrivalTime", e.target.value)}
                    />
                  </Field>
                </div>
              </fieldset>

              <button
                type="submit"
                className="rounded-[4px] bg-signal-green px-5 py-2.5 font-mono text-[11px] uppercase tracking-[0.18em] text-background transition-opacity hover:opacity-90"
              >
                Register capacity →
              </button>
            </form>
          </Panel>

          <Panel title="REGISTERED CAPACITY" meta={`${capacities.length} ENTRIES`}>
            <ul className="space-y-3">
              {capacities.map((c: any) => (
                <li key={c.id} className="border border-border p-3">
                  <div className="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-3">
                    <span className="truncate font-mono text-xs">{c.vehicleId}</span>
                    <span
                      className={`label-sys shrink-0 ${
                        c.status === "matched" ? "text-signal-cyan" : "text-signal-amber"
                      }`}
                    >
                      {String(c.status).toUpperCase()}
                    </span>
                  </div>
                  <div className="mt-3">
                    <RouteLine
                      origin={c.source}
                      destination={c.destination}
                      distanceKm={MatchingEngine.getDistance(c.source, c.destination)}
                      active={c.status !== "matched"}
                    />
                  </div>
                  <div className="mt-3">
                    <CapacityRail total={c.totalCapacity} load={c.currentLoad} compact />
                  </div>
                  <div className="mt-2 flex flex-wrap gap-x-5 gap-y-1 font-mono text-[10px] text-muted-foreground">
                    <span>DEP {timeOf(c.departureDatetime)}</span>
                    <span>ARR {timeOf(c.expectedArrival)}</span>
                    <span>MIN {inr(c.minPrice)}</span>
                  </div>
                </li>
              ))}
            </ul>
          </Panel>
        </div>

        {/* Analysis */}
        <div className="min-w-0">
          <Panel
            title="CIRCUIT ANALYSIS"
            meta={
              <span className="flex items-center gap-1.5">
                <StatusDot tone="cyan" /> LIVE
              </span>
            }
          >
            {!analysis ? (
              <p className="text-xs leading-relaxed text-muted-foreground">
                Register a vehicle to run the utilization forecast. CIRCUIT compares historical
                route utilization against the declared load to estimate unused tonnage.
              </p>
            ) : (
              <div className="space-y-5 reveal-up">
                <div>
                  <div className="label-sys">UTILIZATION FORECAST</div>
                  <div className="mt-2 space-y-2">
                    {[
                      { l: "CURRENT", v: analysis.prediction.currentUtil, c: "bg-signal-cyan" },
                      { l: "PREDICTED", v: analysis.prediction.predictedUtil, c: "bg-signal-green" },
                    ].map((r) => (
                      <div key={r.l} className="grid grid-cols-[76px_minmax(0,1fr)_40px] items-center gap-3">
                        <span className="label-sys">{r.l}</span>
                        <div className="h-2 border border-border bg-elevated">
                          <div className={`h-full ${r.c} rail-fill`} style={{ width: `${r.v}%` }} />
                        </div>
                        <span className="font-mono text-[11px]">{r.v}%</span>
                      </div>
                    ))}
                  </div>
                  <svg viewBox="0 0 120 28" className="mt-3 h-7 w-full" aria-hidden>
                    <polyline
                      fill="none"
                      stroke="var(--signal-cyan)"
                      strokeWidth="1.2"
                      points={(analysis.capacity.historicalUtil as number[])
                        .map((v, i, arr) => `${(i / (arr.length - 1)) * 118 + 1},${28 - (v / 100) * 26}`)
                        .join(" ")}
                    />
                  </svg>
                </div>

                <div className="grid grid-cols-2 border border-border">
                  <div className="border-r border-border px-3 py-2">
                    <div className="label-sys">OPEN CAPACITY</div>
                    <div className="font-mono text-lg text-signal-green">
                      {(analysis.capacity.unusedCapacity ?? 0).toFixed(1)} T
                    </div>
                  </div>
                  <div className="px-3 py-2">
                    <div className="label-sys">OPPORTUNITY</div>
                    <div className="font-mono text-lg text-signal-amber">
                      {analysis.prediction.opportunityProbability}%
                    </div>
                  </div>
                  <div className="col-span-2 border-t border-border px-3 py-2">
                    <div className="label-sys">ESTIMATED VALUE</div>
                    <div className="font-mono text-lg">{inr(analysis.prediction.estimatedRevenue)}</div>
                  </div>
                </div>

                <div className="border-t border-border pt-3">
                  <div className="label-sys">SIGNAL</div>
                  <p className="mt-1.5 text-xs leading-relaxed text-muted-foreground">
                    Historical route utilization indicates a high probability of unused capacity on
                    this lane. {analysis.prediction.summary}.
                  </p>
                </div>

                <Link
                  to="/demand"
                  className="inline-flex rounded-[4px] border border-signal-green px-4 py-2 font-mono text-[10px] uppercase tracking-[0.18em] text-signal-green transition-colors hover:bg-signal-green hover:text-background"
                >
                  Find demand →
                </Link>
              </div>
            )}
          </Panel>
        </div>
      </div>
    </AppShell>
  );
}
