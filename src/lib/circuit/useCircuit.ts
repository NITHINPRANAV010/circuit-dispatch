import { useCallback, useEffect, useState } from "react";
import { State } from "@/lib/circuit/state.js";

let initialised = false;

const EVENTS = [
  "state:reset",
  "auth:login",
  "auth:logout",
  "role:change",
  "capacity:added",
  "capacity:updated",
  "demand:added",
  "matches:updated",
  "match:accepted",
  "match:rejected",
  "transactions:updated",
];

let listenersBound = false;
const bumpers = new Set<() => void>();

function bindListeners() {
  if (listenersBound) return;
  listenersBound = true;
  EVENTS.forEach((evt) => State.subscribe(evt, () => bumpers.forEach((fn) => fn())));
}

/** Boots the CIRCUIT state module on the client and re-renders on any mutation. */
export function useCircuit() {
  const [ready, setReady] = useState(false);
  const [version, setVersion] = useState(0);

  useEffect(() => {
    if (!initialised) {
      State.init();
      initialised = true;
    }
    bindListeners();
    const bump = () => setVersion((v) => v + 1);
    bumpers.add(bump);
    setReady(true);
    return () => {
      bumpers.delete(bump);
    };
  }, []);

  const refresh = useCallback(() => setVersion((v) => v + 1), []);

  return { ready, version, refresh, State };
}

export { State };
