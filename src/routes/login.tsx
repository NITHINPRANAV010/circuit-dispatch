import { useEffect, useState } from "react";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useCircuit } from "@/lib/circuit/useCircuit";
import { StatusDot } from "@/components/circuit/primitives";

export const Route = createFileRoute("/login")({
  head: () => ({
    meta: [
      { title: "Access CIRCUIT — Operations Sign In" },
      {
        name: "description",
        content: "Sign in to the CIRCUIT capacity intelligence console to monitor unused freight capacity.",
      },
      { property: "og:title", content: "Access CIRCUIT — Operations Sign In" },
      {
        property: "og:description",
        content: "Sign in to the CIRCUIT capacity intelligence console.",
      },
    ],
  }),
  component: LoginPage,
});

function LoginPage() {
  const { ready, State } = useCircuit();
  const navigate = useNavigate();
  const [mode, setMode] = useState<"login" | "register">("login");
  const [email, setEmail] = useState("ops@velofreight.in");
  const [password, setPassword] = useState("circuit");
  const [businessName, setBusinessName] = useState("");
  const [businessType, setBusinessType] = useState("Logistics Provider");

  useEffect(() => {
    if (ready && State.getUser()) navigate({ to: "/dashboard" });
  }, [ready, State, navigate]);

  function submit(e: React.FormEvent) {
    e.preventDefault();
    State.login(
      email,
      password,
      mode === "register" ? businessName : undefined,
      mode === "register" ? businessType : undefined,
    );
    navigate({ to: "/dashboard" });
  }

  const field =
    "w-full rounded-[4px] border border-border bg-background px-3 py-2 font-mono text-sm text-foreground outline-none focus:border-signal-cyan";

  return (
    <div className="grid min-h-screen lg:grid-cols-[minmax(0,1fr)_460px]">
      <div className="relative hidden overflow-hidden border-r border-border lg:block">
        <div className="grid-field absolute inset-0" aria-hidden />
        <div className="relative flex h-full flex-col justify-between p-10">
          <div className="font-mono text-sm tracking-[0.3em]">CIRCUIT</div>
          <div>
            <div className="label-sys">CAPACITY INTELLIGENCE</div>
            <p className="mt-3 max-w-md text-3xl leading-tight font-medium">
              Don&apos;t let capacity travel empty.
            </p>
            <div className="mt-8 space-y-1.5 font-mono text-[11px] tracking-[0.18em] text-muted-foreground">
              <div>UNUSED</div>
              <div>DETECTED</div>
              <div>PREDICTED</div>
              <div>MATCHED</div>
              <div className="text-signal-green">MONETIZED</div>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <StatusDot />
            <span className="label-sys">CIRCUIT MONITORING</span>
          </div>
        </div>
      </div>

      <div className="flex items-center justify-center px-6 py-14">
        <div className="w-full max-w-sm">
          <div className="label-sys">ACCESS / {mode === "login" ? "SIGN IN" : "REGISTER"}</div>
          <h1 className="mt-2 font-mono text-lg tracking-[0.16em] text-foreground">
            OPERATIONS CONSOLE
          </h1>

          <div className="mt-6 flex border border-border">
            {(["login", "register"] as const).map((m) => (
              <button
                key={m}
                type="button"
                onClick={() => setMode(m)}
                className={`flex-1 py-2 font-mono text-[10px] uppercase tracking-[0.18em] ${
                  mode === m ? "bg-elevated text-foreground" : "text-muted-foreground"
                }`}
              >
                {m}
              </button>
            ))}
          </div>

          <form onSubmit={submit} className="mt-6 space-y-4">
            {mode === "register" && (
              <>
                <div>
                  <label className="label-sys" htmlFor="bname">
                    BUSINESS NAME
                  </label>
                  <input
                    id="bname"
                    className={`${field} mt-1.5`}
                    value={businessName}
                    onChange={(e) => setBusinessName(e.target.value)}
                    required
                  />
                </div>
                <div>
                  <label className="label-sys" htmlFor="btype">
                    BUSINESS TYPE
                  </label>
                  <select
                    id="btype"
                    className={`${field} mt-1.5`}
                    value={businessType}
                    onChange={(e) => setBusinessType(e.target.value)}
                  >
                    <option>Logistics Provider</option>
                    <option>Manufacturer</option>
                    <option>Distributor</option>
                  </select>
                </div>
              </>
            )}
            <div>
              <label className="label-sys" htmlFor="email">
                EMAIL
              </label>
              <input
                id="email"
                type="email"
                className={`${field} mt-1.5`}
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
            <div>
              <label className="label-sys" htmlFor="password">
                PASSCODE
              </label>
              <input
                id="password"
                type="password"
                className={`${field} mt-1.5`}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>
            <button
              type="submit"
              className="w-full rounded-[4px] bg-signal-green px-4 py-2.5 font-mono text-[11px] uppercase tracking-[0.18em] text-background transition-opacity hover:opacity-90"
            >
              Enter circuit →
            </button>
          </form>

          <p className="mt-4 font-mono text-[10px] leading-relaxed tracking-wide text-muted-foreground">
            DEMO ENVIRONMENT · ANY CREDENTIALS ACCEPTED
          </p>
        </div>
      </div>
    </div>
  );
}
