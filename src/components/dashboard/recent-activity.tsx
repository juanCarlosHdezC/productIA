// src/components/dashboard/recent-activity.tsx
"use client";

import { useEffect, useState } from "react";
import { FileEdit, FilePlus, RefreshCw, Sparkles } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";

interface RecentActivityListProps {
  userId: string;
}

interface ActivityItem {
  id: string;
  type:
    | "product_created"
    | "description_generated"
    | "description_edited"
    | "subscription_changed";
  entityName: string;
  timestamp: Date;
}

// Función auxiliar para formatear tiempo relativo sin utilizar date-fns
function formatRelativeTime(date: Date): string {
  const now = new Date();
  const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);

  // Menos de un minuto
  if (diffInSeconds < 60) {
    return "hace menos de un minuto";
  }

  // Menos de una hora
  if (diffInSeconds < 3600) {
    const minutes = Math.floor(diffInSeconds / 60);
    return `hace ${minutes} ${minutes === 1 ? "minuto" : "minutos"}`;
  }

  // Menos de un día
  if (diffInSeconds < 86400) {
    const hours = Math.floor(diffInSeconds / 3600);
    return `hace ${hours} ${hours === 1 ? "hora" : "horas"}`;
  }

  // Menos de una semana
  if (diffInSeconds < 604800) {
    const days = Math.floor(diffInSeconds / 86400);
    return `hace ${days} ${days === 1 ? "día" : "días"}`;
  }

  // Menos de un mes
  if (diffInSeconds < 2592000) {
    const weeks = Math.floor(diffInSeconds / 604800);
    return `hace ${weeks} ${weeks === 1 ? "semana" : "semanas"}`;
  }

  // Menos de un año
  if (diffInSeconds < 31536000) {
    const months = Math.floor(diffInSeconds / 2592000);
    return `hace ${months} ${months === 1 ? "mes" : "meses"}`;
  }

  // Más de un año
  const years = Math.floor(diffInSeconds / 31536000);
  return `hace ${years} ${years === 1 ? "año" : "años"}`;
}

export function RecentActivityList({ userId }: RecentActivityListProps) {
  const [activities, setActivities] = useState<ActivityItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Simular la carga de actividades recientes desde la API
    // En una implementación real, esto sería una llamada a la API
    setTimeout(() => {
      // Datos simulados
      const mockActivities: ActivityItem[] = [
        {
          id: "1",
          type: "description_generated",
          entityName: "Auriculares Bluetooth XT-500",
          timestamp: new Date(Date.now() - 1000 * 60 * 30), // 30 minutos atrás
        },
        {
          id: "2",
          type: "product_created",
          entityName: "Cafetera Espresso Deluxe",
          timestamp: new Date(Date.now() - 1000 * 60 * 60 * 3), // 3 horas atrás
        },
        {
          id: "3",
          type: "description_edited",
          entityName: "Zapatillas Running Pro Air",
          timestamp: new Date(Date.now() - 1000 * 60 * 60 * 24), // 1 día atrás
        },
        {
          id: "4",
          type: "subscription_changed",
          entityName: "Actualización a Plan Pro",
          timestamp: new Date(Date.now() - 1000 * 60 * 60 * 24 * 2), // 2 días atrás
        },
      ];

      setActivities(mockActivities);
      setIsLoading(false);
    }, 1000);
  }, [userId]);

  if (isLoading) {
    return (
      <div className="space-y-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="flex items-center space-x-4">
            <Skeleton className="h-10 w-10 rounded-full" />
            <div className="space-y-2">
              <Skeleton className="h-4 w-[250px]" />
              <Skeleton className="h-4 w-[200px]" />
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (activities.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-8 text-center">
        <RefreshCw className="h-10 w-10 text-muted-foreground mb-4" />
        <h3 className="text-lg font-medium">No hay actividad reciente</h3>
        <p className="text-sm text-muted-foreground mt-1">
          Tu historial de actividad aparecerá aquí
        </p>
      </div>
    );
  }

  const getActivityIcon = (type: string) => {
    switch (type) {
      case "product_created":
        return <FilePlus className="h-6 w-6 text-blue-500" />;
      case "description_generated":
        return <Sparkles className="h-6 w-6 text-purple-500" />;
      case "description_edited":
        return <FileEdit className="h-6 w-6 text-amber-500" />;
      case "subscription_changed":
        return <Sparkles className="h-6 w-6 text-green-500" />;
      default:
        return <RefreshCw className="h-6 w-6 text-gray-500" />;
    }
  };

  const getActivityText = (activity: ActivityItem) => {
    switch (activity.type) {
      case "product_created":
        return `Creaste un nuevo producto: "${activity.entityName}"`;
      case "description_generated":
        return `Generaste descripciones para "${activity.entityName}"`;
      case "description_edited":
        return `Editaste la descripción de "${activity.entityName}"`;
      case "subscription_changed":
        return `${activity.entityName}`;
      default:
        return `Actividad en "${activity.entityName}"`;
    }
  };

  return (
    <div className="space-y-5">
      {activities.map((activity) => (
        <div key={activity.id} className="flex items-start space-x-4">
          <div className="mt-0.5">{getActivityIcon(activity.type)}</div>
          <div className="space-y-1">
            <p className="text-sm font-medium">{getActivityText(activity)}</p>
            <p className="text-xs text-muted-foreground">
              {formatRelativeTime(new Date(activity.timestamp))}
            </p>
          </div>
        </div>
      ))}
    </div>
  );
}
