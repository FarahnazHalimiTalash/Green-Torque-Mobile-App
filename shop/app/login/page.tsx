"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

import { Button, Field, inputClass } from "@/components/ui";
import { ShopProvider, useShop } from "@/lib/shop-context";
import { subAdminHome } from "@/lib/staff";

function staffHome(role: string) {
  return role === "sub_admin" ? subAdminHome() : "/";
}

function LoginForm() {
  const { signIn, staff, ready } = useShop();
  const router = useRouter();

  useEffect(() => {
    if (ready && staff) router.replace(staffHome(staff.role));
  }, [ready, router, staff]);
  const [email, setEmail] = useState("advisor@greentorque.demo");
  const [password, setPassword] = useState("shop123");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function onSubmit(event: React.FormEvent) {
    event.preventDefault();
    setError("");
    setLoading(true);
    try {
      const user = await signIn(email, password);
      router.replace(staffHome(user.role));
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not sign in.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="flex min-h-screen items-center justify-center p-6">
      <form
        onSubmit={onSubmit}
        className="w-full max-w-md rounded-[28px] border border-gt-border bg-gt-card p-8 shadow-[0_16px_40px_rgba(7,20,15,0.08)]"
      >
        <div className="mb-5 inline-flex rounded-2xl bg-gt-header px-3 py-2">
          <img
            src="/logo.png"
            alt="Green Torque Hybrid/EV Repair"
            width={220}
            height={58}
            className="h-12 w-auto"
          />
        </div>
        <h1 className="mb-6 mt-2 text-[34px] font-extrabold leading-tight tracking-tight text-gt-text">Sign in</h1>
        <div className="grid gap-4">
          <Field label="Email">
            <input className={inputClass} value={email} onChange={(event) => setEmail(event.target.value)} />
          </Field>
          <Field label="Password">
            <input
              className={inputClass}
              type="password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
            />
          </Field>
          {error ? <p className="text-sm text-gt-danger">{error}</p> : null}
          <Button type="submit" disabled={loading}>
            {loading ? "Signing in…" : "Sign in"}
          </Button>
        </div>
      </form>
    </main>
  );
}

export default function LoginPage() {
  return (
    <ShopProvider>
      <LoginForm />
    </ShopProvider>
  );
}
