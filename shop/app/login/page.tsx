"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

import { Button, Field, inputClass } from "@/components/ui";
import { ShopProvider, useShop } from "@/lib/shop-context";

function LoginForm() {
  const { signIn, staff, ready } = useShop();
  const router = useRouter();

  useEffect(() => {
    if (ready && staff) router.replace("/");
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
      await signIn(email, password);
      router.replace("/");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not sign in.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="flex min-h-screen items-center justify-center p-6">
      <form onSubmit={onSubmit} className="w-full max-w-md rounded-3xl border border-[#1E3D2E] bg-[#12261C] p-8">
        <img
          src="/logo.png"
          alt="Green Torque Hybrid/EV Repair"
          width={220}
          height={58}
          className="mb-5 h-14 w-auto"
        />
        <h1 className="text-3xl font-extrabold">Shop dashboard</h1>
        <p className="mt-2 mb-6 text-[#8AA99A]">For advisors and technicians. Customers use the mobile app.</p>
        <div className="grid gap-4">
          <Field label="Email">
            <input className={inputClass} value={email} onChange={(event) => setEmail(event.target.value)} />
          </Field>
          <Field label="Password">
            <input className={inputClass} type="password" value={password} onChange={(event) => setPassword(event.target.value)} />
          </Field>
          {error ? <p className="text-sm text-[#E85D4C]">{error}</p> : null}
          <Button type="submit" disabled={loading}>
            {loading ? "Signing in…" : "Sign in"}
          </Button>
        </div>
        <p className="mt-6 text-sm text-[#8AA99A]">
          Demo: advisor@greentorque.demo or tech@greentorque.demo / shop123
        </p>
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
