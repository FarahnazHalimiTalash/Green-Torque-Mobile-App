"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";

import type { Action } from "./actions";
import type { ShopState, StaffAccount } from "./types";

type SafeStaff = Omit<StaffAccount, "password">;

type ShopContextValue = {
  ready: boolean;
  staff: SafeStaff | null;
  state: ShopState | null;
  error: string;
  signIn: (email: string, password: string) => Promise<void>;
  signOut: () => void;
  act: (action: Action) => Promise<void>;
  refresh: () => Promise<void>;
};

const ShopContext = createContext<ShopContextValue | null>(null);
const STORAGE_KEY = "green-torque.staff";

export function ShopProvider({ children }: { children: React.ReactNode }) {
  const [ready, setReady] = useState(false);
  const [staff, setStaff] = useState<SafeStaff | null>(null);
  const [state, setState] = useState<ShopState | null>(null);
  const [error, setError] = useState("");

  const refresh = useCallback(async () => {
    const response = await fetch("/api/state");
    const data = (await response.json()) as ShopState;
    setState(data);
  }, []);

  useEffect(() => {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      setStaff(JSON.parse(raw) as SafeStaff);
    }
    refresh()
      .catch(() => setError("Could not load shop data."))
      .finally(() => setReady(true));
  }, [refresh]);

  useEffect(() => {
    if (!staff) return;
    const timer = setInterval(() => {
      refresh().catch(() => undefined);
    }, 4000);
    return () => clearInterval(timer);
  }, [refresh, staff]);

  const signIn = useCallback(async (email: string, password: string) => {
    setError("");
    const response = await fetch("/api/auth", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password, kind: "staff" }),
    });
    const data = await response.json();
    if (!response.ok) {
      throw new Error(data.error ?? "Could not sign in.");
    }
    setStaff(data.user);
    setState(data.state);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data.user));
  }, []);

  const signOut = useCallback(() => {
    localStorage.removeItem(STORAGE_KEY);
    setStaff(null);
  }, []);

  const act = useCallback(
    async (action: Action) => {
      const response = await fetch("/api/actions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(action),
      });
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error ?? "Could not save.");
      }
      setState(data.state);
    },
    [],
  );

  const value = useMemo(
    () => ({ ready, staff, state, error, signIn, signOut, act, refresh }),
    [act, error, ready, refresh, signIn, signOut, staff, state],
  );

  return <ShopContext.Provider value={value}>{children}</ShopContext.Provider>;
}

export function useShop() {
  const value = useContext(ShopContext);
  if (!value) throw new Error("useShop must be used inside ShopProvider");
  return value;
}
