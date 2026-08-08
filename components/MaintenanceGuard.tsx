"use client";

import { useEffect, useState, type ReactNode } from "react";
import { usePathname } from "next/navigation";
import { Wrench } from "lucide-react";
import { getSettings, type AppSettings } from "@/lib/db";
import Link from "next/link";

export function MaintenanceGuard({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const [settings, setSettings] = useState<AppSettings | null | "loading">("loading");

  useEffect(() => {
    let alive = true;
    getSettings().then((s) => alive && setSettings(s));
    return () => {
      alive = false;
    };
  }, []);

  const inMaintenance = settings !== "loading" && settings?.maintenance;
  const isAllowed = pathname.startsWith("/maintenance") || pathname.startsWith("/login");

  if (inMaintenance && !isAllowed) {
    return (
      <div className="flex min-h-[80vh] flex-col items-center justify-center px-4 text-center">
        <span className="flex h-16 w-16 items-center justify-center rounded-2xl border border-amber-500/30 bg-amber-500/10">
          <Wrench size={28} className="text-amber-400" />
        </span>
        <h1 className="mt-6 text-2xl font-extrabold text-white">Sedang Dalam Pemeliharaan</h1>
        <p className="mt-3 max-w-md text-sm leading-relaxed text-muted">
          {settings?.maintenanceMessage || "Kami sedang melakukan perbaikan. Tunggu sebentar ya!"}
        </p>
        <Link href="/login" className="btn btn-ghost btn-md mt-6">
          Status admin
        </Link>
      </div>
    );
  }

  return <>{children}</>;
}
