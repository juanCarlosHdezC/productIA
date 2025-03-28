// src/components/dashboard/main-nav.tsx
"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";

export function MainNav() {
  const pathname = usePathname();

  const navItems = [
    {
      name: "Dashboard",
      href: "/dashboard",
    },
    {
      name: "Productos",
      href: "/dashboard/products",
    },
    {
      name: "Historial",
      href: "/dashboard/history",
    },
    {
      name: "Facturación",
      href: "/dashboard/billing",
    },
    {
      name: "Configuración",
      href: "/dashboard/settings",
    },
  ];

  return (
    <div className="mr-4 flex">
      <Link href="/" className="mr-6 flex items-center space-x-2">
        <Sparkles className="h-6 w-6" />
        <span className="hidden font-bold text-xl sm:inline-block">
          DescribeAI
        </span>
      </Link>
      <nav className="hidden md:flex items-center space-x-6 text-sm font-medium">
        {navItems.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className={cn(
              "transition-colors hover:text-foreground/80",
              pathname === item.href || pathname?.startsWith(`${item.href}/`)
                ? "text-foreground font-semibold"
                : "text-foreground/60"
            )}
          >
            {item.name}
          </Link>
        ))}
      </nav>
    </div>
  );
}
