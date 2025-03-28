// src/app/dashboard/settings/page.tsx

"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { signOut } from "next-auth/react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { toast } from "sonner";
import { DashboardShell } from "@/components/dashboard/shell";
import { DashboardHeader } from "@/components/dashboard/header";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { UserAvatar } from "@/components/dashboard/user-avatar";
import {
  Loader2,
  Mail,
  User,
  Key,
  User2,
  AlertTriangle,
  Sparkles,
} from "lucide-react";

// Esquema para actualización de perfil
const profileFormSchema = z.object({
  name: z
    .string()
    .min(2, {
      message: "El nombre debe tener al menos 2 caracteres.",
    })
    .max(30, {
      message: "El nombre no puede tener más de 30 caracteres.",
    }),
  email: z.string().email({
    message: "Por favor, introduce un correo electrónico válido.",
  }),
});

// Tipo derivado del esquema
type ProfileFormValues = z.infer<typeof profileFormSchema>;

// Esquema para cambio de contraseña
const passwordFormSchema = z
  .object({
    currentPassword: z.string().min(1, "La contraseña actual es requerida"),
    newPassword: z
      .string()
      .min(8, "La nueva contraseña debe tener al menos 8 caracteres")
      .max(100, "La contraseña no puede tener más de 100 caracteres")
      .regex(
        /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/,
        "La contraseña debe incluir al menos una letra mayúscula, una minúscula, un número y un carácter especial"
      ),
    confirmPassword: z
      .string()
      .min(1, "Por favor, confirma tu nueva contraseña"),
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    message: "Las contraseñas no coinciden",
    path: ["confirmPassword"],
  });

// Tipo derivado del esquema de contraseña
type PasswordFormValues = z.infer<typeof passwordFormSchema>;

export default function SettingsPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [userData, setUserData] = useState<any>(null);
  const [activeTab, setActiveTab] = useState("profile");
  const [deleteConfirmation, setDeleteConfirmation] = useState("");

  // Formulario para datos de perfil
  const profileForm = useForm<ProfileFormValues>({
    resolver: zodResolver(profileFormSchema),
    defaultValues: {
      name: "",
      email: "",
    },
  });

  // Formulario para cambio de contraseña
  const passwordForm = useForm<PasswordFormValues>({
    resolver: zodResolver(passwordFormSchema),
    defaultValues: {
      currentPassword: "",
      newPassword: "",
      confirmPassword: "",
    },
  });

  // Cargar datos del usuario
  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const response = await fetch("/api/user");

        if (!response.ok) {
          throw new Error("No se pudieron cargar los datos del usuario");
        }

        const data = await response.json();
        setUserData(data.user);

        // Establecer valores iniciales del formulario
        profileForm.reset({
          name: data.user.name || "",
          email: data.user.email || "",
        });
      } catch (error) {
        console.error("Error al cargar datos del usuario:", error);
        toast.error("Error al cargar datos", {
          description:
            "No se pudieron cargar tus datos de perfil. Inténtalo nuevamente.",
        });
      } finally {
        setIsLoading(false);
      }
    };

    fetchUserData();
  }, [profileForm]);

  // Manejar actualización del perfil
  const onProfileSubmit = async (data: ProfileFormValues) => {
    setIsSaving(true);

    try {
      const response = await fetch("/api/user", {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: data.name,
          email: data.email,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Error al actualizar perfil");
      }

      const result = await response.json();
      setUserData({ ...userData, ...result.user });

      toast.success("Perfil actualizado", {
        description:
          "Tu información personal ha sido actualizada correctamente.",
      });
    } catch (error: any) {
      console.error("Error al actualizar perfil:", error);
      toast.error("Error al actualizar perfil", {
        description:
          error.message ||
          "Ocurrió un error al actualizar tu perfil. Inténtalo nuevamente.",
      });
    } finally {
      setIsSaving(false);
    }
  };

  // Manejar cambio de contraseña
  const onPasswordSubmit = async (data: PasswordFormValues) => {
    setIsSaving(true);

    try {
      const response = await fetch("/api/user/password", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          currentPassword: data.currentPassword,
          newPassword: data.newPassword,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Error al cambiar contraseña");
      }

      // Limpiar el formulario
      passwordForm.reset({
        currentPassword: "",
        newPassword: "",
        confirmPassword: "",
      });

      toast.success("Contraseña actualizada", {
        description: "Tu contraseña ha sido cambiada correctamente.",
      });
    } catch (error: any) {
      console.error("Error al cambiar contraseña:", error);
      toast.error("Error al cambiar contraseña", {
        description:
          error.message ||
          "Ocurrió un error al cambiar tu contraseña. Inténtalo nuevamente.",
      });
    } finally {
      setIsSaving(false);
    }
  };

  // Manejar eliminación de cuenta
  const handleDeleteAccount = async () => {
    if (deleteConfirmation !== "ELIMINAR") {
      toast.error("Confirmación incorrecta", {
        description: "Debes escribir ELIMINAR para confirmar esta acción.",
      });
      return;
    }

    setIsDeleting(true);

    try {
      const response = await fetch("/api/user", {
        method: "DELETE",
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Error al eliminar cuenta");
      }

      toast.success("Cuenta eliminada", {
        description: "Tu cuenta ha sido eliminada permanentemente.",
      });

      // Cerrar sesión y redirigir a la página de inicio
      signOut({ callbackUrl: "/" });
    } catch (error: any) {
      console.error("Error al eliminar cuenta:", error);
      toast.error("Error al eliminar cuenta", {
        description:
          error.message ||
          "Ocurrió un error al eliminar tu cuenta. Inténtalo nuevamente.",
      });
      setIsDeleting(false);
    }
  };

  // Si está cargando, mostrar estado de carga
  if (isLoading) {
    return (
      <DashboardShell>
        <DashboardHeader
          heading="Configuración"
          text="Administra tu cuenta y preferencias."
        />
        <div className="flex items-center justify-center h-64">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      </DashboardShell>
    );
  }

  return (
    <DashboardShell>
      <DashboardHeader
        heading="Configuración"
        text="Administra tu cuenta y preferencias."
      />

      <Tabs
        value={activeTab}
        onValueChange={setActiveTab}
        className="space-y-4"
      >
        <TabsList>
          <TabsTrigger value="profile" className="flex items-center gap-1">
            <User2 className="h-4 w-4" />
            <span>Perfil</span>
          </TabsTrigger>
          <TabsTrigger value="password" className="flex items-center gap-1">
            <Key className="h-4 w-4" />
            <span>Contraseña</span>
          </TabsTrigger>
          <TabsTrigger
            value="subscription"
            className="flex items-center gap-1"
            onClick={() => router.push("/dashboard/settings/subscription")}
          >
            <Sparkles className="h-4 w-4" />
            <span>Suscripción</span>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="profile">
          <Card className="lg:max-w-3xl">
            <CardHeader>
              <CardTitle>Información Personal</CardTitle>
              <CardDescription>
                Actualiza tu información de perfil.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-4 mb-6">
                <UserAvatar
                  user={{ name: userData?.name, image: userData?.image }}
                  className="h-16 w-16"
                />
                <div>
                  <h3 className="text-lg font-medium">{userData?.name}</h3>
                  <p className="text-sm text-muted-foreground">
                    {userData?.email}
                  </p>
                </div>
              </div>

              <Form {...profileForm}>
                <form
                  onSubmit={profileForm.handleSubmit(onProfileSubmit)}
                  className="space-y-6"
                >
                  <FormField
                    control={profileForm.control}
                    name="name"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Nombre</FormLabel>
                        <FormControl>
                          <div className="relative">
                            <User className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                            <Input
                              className="pl-9"
                              placeholder="Tu nombre"
                              {...field}
                              disabled={isSaving}
                            />
                          </div>
                        </FormControl>
                        <FormDescription>
                          Este es tu nombre público que se mostrará en tu
                          perfil.
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={profileForm.control}
                    name="email"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Correo electrónico</FormLabel>
                        <FormControl>
                          <div className="relative">
                            <Mail className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                            <Input
                              className="pl-9"
                              placeholder="tu@email.com"
                              type="email"
                              {...field}
                              disabled={isSaving}
                            />
                          </div>
                        </FormControl>
                        <FormDescription>
                          Este correo se usará para notificaciones y acceso a tu
                          cuenta.
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <div className="flex justify-end">
                    <Button
                      type="submit"
                      disabled={isSaving || !profileForm.formState.isDirty}
                    >
                      {isSaving ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Guardando...
                        </>
                      ) : (
                        "Guardar Cambios"
                      )}
                    </Button>
                  </div>
                </form>
              </Form>
            </CardContent>

            <Separator className="my-4" />

            <CardHeader>
              <CardTitle className="text-destructive">Zona Peligrosa</CardTitle>
              <CardDescription>
                Una vez que elimines tu cuenta, no hay vuelta atrás. Ten
                cuidado.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button variant="destructive">Eliminar Cuenta</Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>
                      ¿Estás absolutamente seguro?
                    </AlertDialogTitle>
                    <AlertDialogDescription>
                      Esta acción no se puede deshacer. Eliminará
                      permanentemente tu cuenta y todos tus datos de nuestros
                      servidores.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <div className="space-y-4 py-4">
                    <div className="flex items-center justify-start space-x-2 rounded-md border border-destructive/50 bg-destructive/10 p-4">
                      <AlertTriangle className="h-5 w-5 text-destructive" />
                      <p className="text-sm text-destructive">
                        Eliminar tu cuenta es irreversible y perderás todos tus
                        productos y descripciones.
                      </p>
                    </div>

                    <div className="space-y-2">
                      <p className="text-sm font-medium">
                        Escribe ELIMINAR para confirmar:
                      </p>
                      <Input
                        value={deleteConfirmation}
                        onChange={(e) => setDeleteConfirmation(e.target.value)}
                        className={
                          deleteConfirmation &&
                          deleteConfirmation !== "ELIMINAR"
                            ? "border-destructive"
                            : ""
                        }
                        disabled={isDeleting}
                      />
                    </div>
                  </div>
                  <AlertDialogFooter>
                    <AlertDialogCancel disabled={isDeleting}>
                      Cancelar
                    </AlertDialogCancel>
                    <Button
                      variant="destructive"
                      onClick={handleDeleteAccount}
                      disabled={isDeleting || deleteConfirmation !== "ELIMINAR"}
                    >
                      {isDeleting ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Eliminando...
                        </>
                      ) : (
                        "Eliminar Cuenta"
                      )}
                    </Button>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="password">
          <Card className="lg:max-w-3xl">
            <CardHeader>
              <CardTitle>Cambiar Contraseña</CardTitle>
              <CardDescription>
                Actualiza tu contraseña para mantener tu cuenta segura.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Form {...passwordForm}>
                <form
                  onSubmit={passwordForm.handleSubmit(onPasswordSubmit)}
                  className="space-y-6"
                >
                  <FormField
                    control={passwordForm.control}
                    name="currentPassword"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Contraseña actual</FormLabel>
                        <FormControl>
                          <Input
                            type="password"
                            placeholder="••••••••"
                            {...field}
                            disabled={isSaving}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={passwordForm.control}
                    name="newPassword"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Nueva contraseña</FormLabel>
                        <FormControl>
                          <Input
                            type="password"
                            placeholder="••••••••"
                            {...field}
                            disabled={isSaving}
                          />
                        </FormControl>
                        <FormDescription>
                          La contraseña debe tener al menos 8 caracteres,
                          incluir mayúsculas, minúsculas, números y caracteres
                          especiales.
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={passwordForm.control}
                    name="confirmPassword"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Confirmar nueva contraseña</FormLabel>
                        <FormControl>
                          <Input
                            type="password"
                            placeholder="••••••••"
                            {...field}
                            disabled={isSaving}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <div className="flex justify-end">
                    <Button type="submit" disabled={isSaving}>
                      {isSaving ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Actualizando...
                        </>
                      ) : (
                        "Cambiar Contraseña"
                      )}
                    </Button>
                  </div>
                </form>
              </Form>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </DashboardShell>
  );
}
