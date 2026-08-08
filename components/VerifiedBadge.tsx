"use client";

import { BadgeCheck } from "lucide-react";

export function VerifiedBadge({ size = 16, showLabel = false }: { size?: number; showLabel?: boolean }) {
  return (
    <span className="inline-flex items-center gap-1 text-cyan-400" title="Terverifikasi">
      <BadgeCheck size={size} strokeWidth={2.6} />
      {showLabel && <span className="text-xs font-semibold">Terverifikasi</span>}
    </span>
  );
}
