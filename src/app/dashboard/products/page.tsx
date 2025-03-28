// src/app/dashboard/products/page.tsx

"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { toast } from "sonner";
import { DashboardShell } from "@/components/dashboard/shell";
import { DashboardHeader } from "@/components/dashboard/header";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  ChevronLeft,
  ChevronRight,
  Edit,
  FileText,
  Loader2,
  Package,
  Plus,
  Search,
  SlidersHorizontal,
  Sparkles,
  Eye,
} from "lucide-react";

export default function ProductsPage() {
  const router = useRouter();
  const searchParams = useSearchParams();

  // Estados para los parámetros de búsqueda y filtrado
  const [search, setSearch] = useState(searchParams.get("search") || "");
  const [page, setPage] = useState(
    parseInt(searchParams.get("page") || "1", 10)
  );
  const [limit, setLimit] = useState(
    parseInt(searchParams.get("limit") || "10", 10)
  );
  const [orderBy, setOrderBy] = useState(
    searchParams.get("orderBy") || "updatedAt"
  );
  const [order, setOrder] = useState(searchParams.get("order") || "desc");

  // Estado para los productos y su carga
  const [products, setProducts] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [metadata, setMetadata] = useState({
    page: 1,
    limit: 10,
    totalCount: 0,
    totalPages: 1,
    hasMore: false,
    hasPrev: false,
  });

  // Cargar productos
  useEffect(() => {
    const fetchProducts = async () => {
      setIsLoading(true);
      try {
        const queryParams = new URLSearchParams({
          page: page.toString(),
          limit: limit.toString(),
          orderBy,
          order,
          ...(search ? { search } : {}),
        });

        const response = await fetch(`/api/products?${queryParams}`);

        if (!response.ok) {
          throw new Error("Error al cargar productos");
        }

        const data = await response.json();
        setProducts(data.products);
        setMetadata(data.meta);
      } catch (error) {
        console.error("Error al cargar productos:", error);
        toast.error("Error al cargar productos", {
          description:
            "No se pudieron cargar tus productos. Inténtalo nuevamente.",
        });
      } finally {
        setIsLoading(false);
      }
    };

    fetchProducts();
  }, [page, limit, orderBy, order, search]);

  // Actualizar URL con parámetros de búsqueda y filtrado
  useEffect(() => {
    const params = new URLSearchParams(searchParams);

    if (page !== 1) params.set("page", page.toString());
    else params.delete("page");

    if (limit !== 10) params.set("limit", limit.toString());
    else params.delete("limit");

    if (orderBy !== "updatedAt") params.set("orderBy", orderBy);
    else params.delete("orderBy");

    if (order !== "desc") params.set("order", order);
    else params.delete("order");

    if (search) params.set("search", search);
    else params.delete("search");

    const newUrl = params.toString() ? `?${params.toString()}` : "";
    router.replace(`/dashboard/products${newUrl}`);
  }, [page, limit, orderBy, order, search, router, searchParams]);

  // Manejar cambio de página
  const handlePageChange = (newPage: number) => {
    if (newPage < 1 || newPage > metadata.totalPages) return;
    setPage(newPage);
  };

  // Manejar búsqueda
  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setPage(1); // Reiniciar a la primera página cuando se busca
  };

  // Formatear fecha
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat("es-ES", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    }).format(date);
  };

  return (
    <DashboardShell>
      <DashboardHeader
        heading="Productos"
        text="Gestiona todos tus productos y sus descripciones."
      >
        <Button asChild>
          <Link href="/dashboard/new">
            <Plus className="mr-2 h-4 w-4" />
            Nuevo Producto
          </Link>
        </Button>
      </DashboardHeader>

      <div className="grid gap-4 md:grid-cols-[200px_1fr] lg:grid-cols-[250px_1fr]">
        <Card className="h-fit">
          <CardHeader>
            <CardTitle className="text-lg">Filtros</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Ordenar por</label>
              <Select value={orderBy} onValueChange={setOrderBy}>
                <SelectTrigger>
                  <SelectValue placeholder="Ordenar por" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="name">Nombre</SelectItem>
                  <SelectItem value="category">Categoría</SelectItem>
                  <SelectItem value="createdAt">Fecha de creación</SelectItem>
                  <SelectItem value="updatedAt">
                    Última actualización
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Dirección</label>
              <Select value={order} onValueChange={setOrder}>
                <SelectTrigger>
                  <SelectValue placeholder="Dirección" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="asc">Ascendente</SelectItem>
                  <SelectItem value="desc">Descendente</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">
                Resultados por página
              </label>
              <Select
                value={limit.toString()}
                onValueChange={(value) => setLimit(parseInt(value, 10))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Resultados por página" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="5">5</SelectItem>
                  <SelectItem value="10">10</SelectItem>
                  <SelectItem value="20">20</SelectItem>
                  <SelectItem value="50">50</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <form className="flex-1" onSubmit={handleSearch}>
              <div className="relative">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Buscar por nombre o categoría..."
                  className="pl-8"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                />
              </div>
            </form>
            <Button variant="outline" size="icon" title="Filtros">
              <SlidersHorizontal className="h-4 w-4" />
            </Button>
          </div>

          <Card>
            {isLoading ? (
              <div className="flex items-center justify-center h-64">
                <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
              </div>
            ) : products.length === 0 ? (
              <div className="flex flex-col items-center justify-center px-4 py-10 text-center">
                <Package className="h-12 w-12 text-muted-foreground mb-4" />
                <h3 className="text-lg font-medium">
                  No se encontraron productos
                </h3>
                <p className="text-sm text-muted-foreground mt-1 max-w-md">
                  {search
                    ? `No hay resultados para "${search}". Intenta con otra búsqueda.`
                    : "Aún no has creado ningún producto. Comienza creando uno nuevo."}
                </p>
                <Button className="mt-4" asChild>
                  <Link href="/dashboard/new">
                    <Plus className="mr-2 h-4 w-4" />
                    Crear Primer Producto
                  </Link>
                </Button>
              </div>
            ) : (
              <Table>
                <TableCaption>
                  Mostrando {products.length} de {metadata.totalCount} productos
                </TableCaption>
                <TableHeader>
                  <TableRow>
                    <TableHead>Nombre</TableHead>
                    <TableHead>Categoría</TableHead>
                    <TableHead>Descripciones</TableHead>
                    <TableHead>Actualizado</TableHead>
                    <TableHead className="text-right">Acciones</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {products.map((product) => (
                    <TableRow key={product.id}>
                      <TableCell className="font-medium max-w-[200px] truncate">
                        {product.name}
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline">{product.category}</Badge>
                      </TableCell>
                      <TableCell>
                        {product.descriptions.length > 0 ? (
                          <Badge className="bg-green-100 text-green-800 hover:bg-green-200">
                            {product.descriptions.length}
                          </Badge>
                        ) : (
                          <Badge
                            variant="outline"
                            className="text-muted-foreground"
                          >
                            0
                          </Badge>
                        )}
                      </TableCell>
                      <TableCell className="text-muted-foreground text-sm">
                        {formatDate(product.updatedAt)}
                      </TableCell>
                      <TableCell className="text-right space-x-1">
                        <Button
                          variant="ghost"
                          size="icon"
                          asChild
                          title="Ver producto"
                        >
                          <Link
                            href={`/dashboard/products/${product.id}/preview`}
                          >
                            <Eye className="h-4 w-4" />
                          </Link>
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          asChild
                          title="Editar producto"
                        >
                          <Link href={`/dashboard/products/${product.id}`}>
                            <Edit className="h-4 w-4" />
                          </Link>
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          asChild
                          title="Generar descripción"
                        >
                          <Link
                            href={`/dashboard/products/${product.id}?tab=generator`}
                          >
                            <Sparkles className="h-4 w-4" />
                          </Link>
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}

            {!isLoading && products.length > 0 && (
              <CardFooter className="flex items-center justify-between border-t px-6 py-4">
                <div className="text-sm text-muted-foreground">
                  Página {page} de {metadata.totalPages}
                </div>

                <div className="flex items-center space-x-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handlePageChange(page - 1)}
                    disabled={!metadata.hasPrev}
                  >
                    <ChevronLeft className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handlePageChange(page + 1)}
                    disabled={!metadata.hasMore}
                  >
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                </div>
              </CardFooter>
            )}
          </Card>
        </div>
      </div>
    </DashboardShell>
  );
}
