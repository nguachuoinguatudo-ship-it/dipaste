"use client";

import { BadgeCheck } from "lucide-react";

export function Avatar({
  src,
  name,
  verified,
  size = 40,
  className = "",
}: {
  src?: string;
  name?: string;
  verified?: boolean;
  size?: number;
  className?: string;
}) {
  const initial = (name || "?").charAt(0).toUpperCase();
  return (
    <div className={`relative inline-flex shrink-0 ${className}`} style={{ width: size, height: size }}>
      {src ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={src}
          alt={name || "avatar"}
          className="h-full w-full rounded-full object-cover ring-2 ring-line"
          referrerPolicy="no-referrer"
        />
      ) : (
        <div
          className="flex h-full w-full items-center justify-center rounded-full font-bold text-white ring-2 ring-line"
          style={{
            background: `linear-gradient(135deg, hsl(${(name || "x").length * 47 % 360} 70% 45%), hsl(${(name || "x").length * 97 % 360} 75% 35%))`,
          }}
        >
          <span style={{ fontSize: size * 0.45 }}>{initial}</span>
        </div>
      )}
      {verified && (
        <span
          className="absolute -bottom-0.5 -right-0.5 rounded-full bg-cyan-500/90 p-[2px] shadow-md shadow-cyan-500/40"
          title="Terverifikasi"
        >
          <BadgeCheck size={size * 0.32} className="text-white" strokeWidth={3} />
        </span>
      )}
    </div>
  );
}
