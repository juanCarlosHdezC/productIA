import { Suspense } from "react";
import { redirect } from "next/navigation";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { checkSubscription } from "@/utils/subscription";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";

async function HistoryPage() {
  const session = await getServerSession(authOptions);

  if (!session?.user.id) {
    redirect("/login");
  }

  const isPro = await checkSubscription(session.user.id);

  const products = await prisma.product.findMany({
    where: {
      userId: session.user.id,
    },
    include: {
      descriptions: {
        orderBy: {
          createdAt: "desc",
        },
        take: 1,
      },
    },
    orderBy: {
      updatedAt: "desc",
    },
  });

  return (
    <div className="container py-10">
      <h1 className="text-3xl font-bold mb-8">Historial de Productos</h1>

      {products.length === 0 ? (
        <div className="text-center py-10">
          <h2 className="text-xl mb-2">Aún no tienes productos guardados</h2>
          <p className="text-muted-foreground mb-4">
            Genera tu primera descripción de producto para verla aquí
          </p>
          <a href="/dashboard">
            <Button>Crear nuevo producto</Button>
          </a>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {products.map((product) => {
            const description = product.descriptions[0];
            let parsedDescription = { title: "", description: "" };

            try {
              if (description) {
                parsedDescription = JSON.parse(description.content);
              }
            } catch (error) {
              console.error("Error al parsear descripción:", error);
            }

            // Formatear la fecha manualmente
            const updateDate = new Date(product.updatedAt);
            const formattedDate = `${updateDate
              .getDate()
              .toString()
              .padStart(2, "0")}/${(updateDate.getMonth() + 1)
              .toString()
              .padStart(2, "0")}/${updateDate.getFullYear()} ${updateDate
              .getHours()
              .toString()
              .padStart(2, "0")}:${updateDate
              .getMinutes()
              .toString()
              .padStart(2, "0")}`;

            return (
              <Card key={product.id} className="h-full flex flex-col">
                <CardHeader>
                  <CardTitle className="line-clamp-1">{product.name}</CardTitle>
                  <CardDescription>
                    Categoría: {product.category}
                    <br />
                    Actualizado: {formattedDate}
                  </CardDescription>
                </CardHeader>
                <CardContent className="flex-grow">
                  {description ? (
                    <>
                      <h3 className="font-semibold mb-2">
                        {parsedDescription.title}
                      </h3>
                      <p className="text-sm line-clamp-4">
                        {parsedDescription.description}
                      </p>
                    </>
                  ) : (
                    <p className="text-muted-foreground italic">
                      No hay descripciones guardadas
                    </p>
                  )}
                </CardContent>
                <div className="p-4 pt-0 mt-auto">
                  <Button variant="outline" size="sm" className="w-full">
                    Ver detalles
                  </Button>
                </div>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}

export default HistoryPage;
