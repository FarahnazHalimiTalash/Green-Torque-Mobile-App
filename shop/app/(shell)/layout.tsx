"use client";

import { Shell } from "@/components/shell";
import { ShopProvider } from "@/lib/shop-context";

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <ShopProvider>
      <Shell>{children}</Shell>
    </ShopProvider>
  );
}
