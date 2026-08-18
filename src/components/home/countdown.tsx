"use client";

import { useEffect, useState } from "react";

import { useClientReady } from "@/lib/use-store";

type Parts = { days: number; hours: number; minutes: number; seconds: number };

const UNITS: { key: keyof Parts; label: string }[] = [
  { key: "days", label: "Days" },
  { key: "hours", label: "Hours" },
  { key: "minutes", label: "Minutes" },
  { key: "seconds", label: "Seconds" },
];

/** End of the current week (Sunday 23:59:59 local time). */
function weekEnd(from = new Date()): Date {
  const end = new Date(from);
  end.setDate(end.getDate() + ((7 - end.getDay()) % 7));
  end.setHours(23, 59, 59, 999);
  return end;
}

function split(ms: number): Parts {
  const clamped = Math.max(0, ms);
  return {
    days: Math.floor(clamped / 86_400_000),
    hours: Math.floor((clamped / 3_600_000) % 24),
    minutes: Math.floor((clamped / 60_000) % 60),
    seconds: Math.floor((clamped / 1000) % 60),
  };
}

/**
 * Live countdown to the end of the weekly sale. Values only appear after
 * hydration, so the prerendered HTML never ships a stale clock.
 */
export function Countdown() {
  const ready = useClientReady();
  const [parts, setParts] = useState<Parts | null>(null);

  useEffect(() => {
    const tick = () => setParts(split(weekEnd().getTime() - Date.now()));
    const timer = window.setInterval(tick, 1000);
    tick();
    return () => window.clearInterval(timer);
  }, []);

  return (
    <div className="flex items-center justify-center gap-3 sm:gap-4">
      {UNITS.map((unit) => (
        <div key={unit.key} className="text-center">
          <div className="flex h-14 w-16 items-center justify-center rounded-xl border border-ink-100 bg-white text-2xl font-extrabold text-ink-900 tabular-nums shadow-card sm:h-16 sm:w-20 sm:text-3xl">
            {ready && parts ? String(parts[unit.key]).padStart(2, "0") : "--"}
          </div>
          <p className="mt-1.5 text-[10px] font-bold tracking-[0.16em] text-ink-400 uppercase">
            {unit.label}
          </p>
        </div>
      ))}
    </div>
  );
}
