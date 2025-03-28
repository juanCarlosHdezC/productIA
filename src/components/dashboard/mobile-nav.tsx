// src/components/dashboard/mobile-nav.tsx
"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { signOut } from "next-auth/react";
import { Menu, Plus, Settings, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { UserAvatar } from "@/components/dashboard/user-avatar";

interface MobileNavProps {
  isPro: boolean;
  user: {
    name?: string | null;
    image?: string | null;
    email?: string | null;
  };
}

export function MobileNav({ isPro, user }: MobileNavProps) {
  const [open, setOpen] = useState(false);
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
    <div className="flex md:hidden">
      <Button
        variant="ghost"
        className="mr-2 px-0 text-base hover:bg-transparent focus:ring-0"
        onClick={() => setOpen(true)}
      >
        <Menu className="h-6 w-6" />
        <span className="sr-only">Abrir menú móvil</span>
      </Button>
      {open && (
        <div className="fixed inset-0 z-50 bg-background/80 backdrop-blur-sm animate-in">
          <div className="fixed right-0 top-0 z-50 h-full w-3/4 border-l bg-background p-6 shadow-lg animate-in slide-in-from-right duration-300 sm:w-1/2">
            <div className="flex items-center justify-between">
              <Link
                href="/"
                className="flex items-center space-x-2"
                onClick={() => setOpen(false)}
              >
                <span className="font-bold text-xl">DescribeAI</span>
              </Link>
              <Button
                variant="ghost"
                className="px-0 text-base hover:bg-transparent focus:ring-0"
                onClick={() => setOpen(false)}
              >
                <X className="h-6 w-6" />
                <span className="sr-only">Cerrar menú móvil</span>
              </Button>
            </div>
            <div className="mt-8 flex flex-col space-y-3">
              {navItems.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setOpen(false)}
                  className={cn(
                    "text-base transition-colors hover:text-foreground/80",
                    pathname === item.href ||
                      pathname?.startsWith(`${item.href}/`)
                      ? "text-foreground font-semibold"
                      : "text-foreground/60"
                  )}
                >
                  {item.name}
                </Link>
              ))}
              <div className="mt-4 flex flex-col space-y-2">
                {isPro ? (
                  <Link
                    href="/dashboard/new"
                    onClick={() => setOpen(false)}
                    className="inline-flex h-9 items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground shadow transition-colors hover:bg-primary/90 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50"
                  >
                    <Plus className="mr-2 h-4 w-4" />
                    Nuevo Producto
                  </Link>
                ) : (
                  <Link
                    href="/pricing"
                    onClick={() => setOpen(false)}
                    className="inline-flex h-9 items-center justify-center rounded-md border border-input bg-transparent px-4 py-2 text-sm font-medium shadow-sm transition-colors hover:bg-accent hover:text-accent-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50"
                  >
                    Actualizar a Pro
                  </Link>
                )}
              </div>
              <div className="mt-6 border-t pt-4">
                <div className="flex items-center mb-4">
                  <UserAvatar
                    user={{ name: user.name, image: user.image }}
                    className="h-10 w-10 mr-2"
                  />
                  <div>
                    {user.name && (
                      <p className="font-medium text-sm">{user.name}</p>
                    )}
                    {user.email && (
                      <p className="text-xs text-muted-foreground truncate max-w-[180px]">
                        {user.email}
                      </p>
                    )}
                  </div>
                </div>
                <div className="flex flex-col space-y-2">
                  <Link
                    href="/dashboard/settings"
                    onClick={() => setOpen(false)}
                    className="inline-flex h-9 items-center justify-center rounded-md border border-input bg-transparent px-4 py-2 text-sm font-medium shadow-sm transition-colors hover:bg-accent hover:text-accent-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50"
                  >
                    <Settings className="mr-2 h-4 w-4" />
                    Configuración
                  </Link>
                  <Button
                    variant="outline"
                    className="h-9 px-4 py-2"
                    onClick={() => {
                      setOpen(false);
                      signOut({
                        callbackUrl: `${window.location.origin}/login`,
                      });
                    }}
                  >
                    Cerrar Sesión
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
