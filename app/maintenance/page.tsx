"use client";

import { useEffect, useState } from "react";
import { Wrench, CheckCircle2, XCircle } from "lucide-react";
import { getSettings, type AppSettings } from "@/lib/db";

export default function MaintenancePage() {
  const [s, setS] = useState<AppSettings | null | "loading">("loading");

  useEffect(() => {
    getSettings().then(setS);
  }, []);

  const on = s !== "loading" && !!s?.maintenance;

  return (
    <div className="mx-auto max-w-md px-4 py-24 text-center">
      <span
        className={`mx-auto flex h-16 w-16 items-center justify-center rounded-2xl border ${
          on ? "border-rose-500/30 bg-rose-500/10" : "border-emerald-500/30 bg-emerald-500/10"
        }`}
      >
        {on ? <Wrench size={28} className="text-rose-400" /> : <CheckCircle2 size={28} className="text-emerald-400" />}
      </span>
      <h1 className="mt-6 text-2xl font-extrabold text-white">
        {on ? "Sedang Dalam Pemeliharaan" : "Semua Berjalan Normal"}
      </h1>
      <p className="mt-3 text-sm leading-relaxed text-muted">
        {on
          ? s?.maintenanceMessage || "Kami sedang melakukan perbaikan. Tunggu sebentar ya!"
          : "Dipaste berjalan normal. Silakan lanjut berbagi kode!"}
      </p>
      {on && (
        <p className="mt-6 inline-flex items-center gap-2 rounded-xl border border-line bg-raised px-4 py-2.5 font-mono text-xs text-muted">
          <XCircle size={14} className="text-rose-400" /> Status: <span className="font-bold text-rose-300">MAINTENANCE</span>
        </p>
      )}
    </div>
  );
}
