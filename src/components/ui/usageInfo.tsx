"use client";

import { useEffect, useState } from "react";

interface Limits {
  plan: string;
  dailyTokenLimit: number;
  remainingToday: number;
  monthlyTokenLimit: number;
  remainingMonth: number;
}

export function UsageInfo() {
  const [limits, setLimits] = useState<Limits | null>(null);

  useEffect(() => {
    async function fetchLimits() {
      const res = await fetch("/api/user/limits");
      const data = await res.json();
      setLimits(data);
    }
    fetchLimits();
  }, []);

  if (!limits) return <p className="text-gray-500">Cargando límites...</p>;

  return (
    <div className="bg-white rounded-xl p-4 shadow-md text-sm space-y-2">
      <p>
        <strong>Plan:</strong> {limits.plan}
      </p>
      <p>
        <strong>Tokens disponibles hoy:</strong>{" "}
        <span className="text-blue-600 font-semibold">
          {limits.remainingToday}
        </span>{" "}
        / {limits.dailyTokenLimit}
      </p>
      <p>
        <strong>Tokens restantes este mes:</strong>{" "}
        <span className="text-green-600 font-semibold">
          {limits.remainingMonth}
        </span>{" "}
        / {limits.monthlyTokenLimit}
      </p>
    </div>
  );
}
