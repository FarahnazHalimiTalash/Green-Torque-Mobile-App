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
        className="w-full max-w-md rounded-[28px] border border-[#D7E5DC] bg-white p-8 shadow-[0_16px_40px_rgba(7,20,15,0.08)]"
      >
        <div className="mb-5 inline-flex rounded-2xl bg-[#07140F] px-3 py-2">
          <img
            src="/logo.png"
            alt="Green Torque Hybrid/EV Repair"
            width={220}
            height={58}
            className="h-12 w-auto"
          />
        </div>
        <p className="text-[11px] font-bold uppercase tracking-[0.16em] text-[#15803D]">Shop access</p>
        <h1 className="mt-2 text-3xl font-extrabold tracking-tight text-[#0C1F16]">Shop dashboard</h1>
        <p className="mt-2 mb-6 text-[#4F6B5C]">
          Admin has full shop access. Sub-admin can only upload work photos and videos. Customers use the
          mobile app.
        </p>
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
          {error ? <p className="text-sm text-[#DC2626]">{error}</p> : null}
          <Button type="submit" disabled={loading}>
            {loading ? "Signing in…" : "Sign in"}
          </Button>
        </div>
        <p className="mt-6 text-sm text-[#7F9A8B]">
          Demo: advisor@greentorque.demo (admin), subadmin@greentorque.demo, or tech@greentorque.demo /
          shop123
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
