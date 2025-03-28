// src/components/dashboard/products-grid.tsx
"use client";

import Link from "next/link";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { CalendarDays, Edit, ExternalLink } from "lucide-react";
import { Badge } from "@/components/ui/badge";

interface ProductsGridProps {
  products: any[];
  emptyState: React.ReactNode;
}

export function ProductsGrid({ products, emptyState }: ProductsGridProps) {
  if (products.length === 0) {
    return <>{emptyState}</>;
  }

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
      {products.map((product) => {
        let parsedDescription = { title: "", description: "" };
        try {
          if (product.descriptions.length > 0) {
            parsedDescription = JSON.parse(product.descriptions[0].content);
          }
        } catch (e) {
          console.error("Error parsing description:", e);
        }

        // Formatear la fecha manualmente
        const updateDate = new Date(product.updatedAt);
        const formattedDate = `${updateDate
          .getDate()
          .toString()
          .padStart(2, "0")}/${(updateDate.getMonth() + 1)
          .toString()
          .padStart(2, "0")}/${updateDate.getFullYear()}`;

        return (
          <Card key={product.id} className="overflow-hidden">
            <CardHeader className="p-4">
              <div className="flex justify-between items-start">
                <CardTitle className="text-lg line-clamp-1">
                  {product.name}
                </CardTitle>
                <Badge variant="outline">{product.category}</Badge>
              </div>
              <div className="flex items-center pt-2 text-xs text-muted-foreground">
                <CalendarDays className="mr-1 h-3 w-3" />
                Actualizado: {formattedDate}
              </div>
            </CardHeader>
            <CardContent className="p-4 pt-0">
              {product.descriptions.length > 0 ? (
                <div>
                  <h3 className="font-semibold text-sm mb-1">
                    {parsedDescription.title}
                  </h3>
                  <p className="text-sm line-clamp-3 text-muted-foreground">
                    {parsedDescription.description}
                  </p>
                </div>
              ) : (
                <p className="text-sm text-muted-foreground italic">
                  Sin descripciones generadas
                </p>
              )}
            </CardContent>
            <CardFooter className="flex justify-between p-4 pt-0">
              <Button variant="ghost" size="sm" asChild>
                <Link href={`/dashboard/products/${product.id}`}>
                  <Edit className="mr-2 h-4 w-4" />
                  Editar
                </Link>
              </Button>
              <Button variant="ghost" size="sm" asChild>
                <Link href={`/dashboard/products/${product.id}/preview`}>
                  <ExternalLink className="mr-2 h-4 w-4" />
                  Vista Previa
                </Link>
              </Button>
            </CardFooter>
          </Card>
        );
      })}
    </div>
  );
}
