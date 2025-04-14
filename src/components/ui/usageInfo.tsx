"use client";

import { useEffect, useState } from "react";

interface Limits {
  plan: string;
  dailyLimit: number;
  remainingToday: number;
  monthlyLimit: number;
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
        <strong>Hoy puedes generar:</strong>{" "}
        <span className="text-blue-600 font-semibold">
          {limits.remainingToday}
        </span>{" "}
        de {limits.dailyLimit} descripciones diarias
      </p>
      <p>
        <strong>Este mes te quedan:</strong>{" "}
        <span className="text-green-600 font-semibold">
          {limits.remainingMonth}
        </span>{" "}
        de {limits.monthlyLimit} descripciones
      </p>
    </div>
  );
}
