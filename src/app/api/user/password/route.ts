// src/app/api/user/password/route.ts

import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { hash, compare } from "bcryptjs";
import { z } from "zod";

// Esquema para cambio de contraseña
const passwordChangeSchema = z.object({
  currentPassword: z.string().min(1, "La contraseña actual es requerida"),
  newPassword: z
    .string()
    .min(8, "La nueva contraseña debe tener al menos 8 caracteres")
    .max(100, "La contraseña no puede tener más de 100 caracteres")
    .regex(
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/,
      "La contraseña debe incluir al menos una letra mayúscula, una minúscula, un número y un carácter especial"
    ),
});

// POST - Cambiar contraseña
export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json({ message: "No autorizado" }, { status: 401 });
    }

    const json = await request.json();

    // Validar datos de entrada
    const result = passwordChangeSchema.safeParse(json);

    if (!result.success) {
      const formatted = result.error.format();
      return NextResponse.json(
        { message: "Datos inválidos", errors: formatted },
        { status: 400 }
      );
    }

    const { currentPassword, newPassword } = result.data;

    // Obtener usuario
    const user = await prisma.user.findUnique({
      where: {
        id: session.user.id,
      },
      select: {
        id: true,
        password: true,
      },
    });

    if (!user || !user.password) {
      return NextResponse.json(
        { message: "Usuario no encontrado o cuenta de terceros" },
        { status: 404 }
      );
    }

    // Verificar contraseña actual
    const isPasswordValid = await compare(currentPassword, user.password);

    if (!isPasswordValid) {
      return NextResponse.json(
        { message: "La contraseña actual es incorrecta" },
        { status: 400 }
      );
    }

    // Encriptar nueva contraseña
    const hashedPassword = await hash(newPassword, 10);

    // Actualizar contraseña
    await prisma.user.update({
      where: {
        id: session.user.id,
      },
      data: {
        password: hashedPassword,
      },
    });

    return NextResponse.json({
      message: "Contraseña actualizada con éxito",
    });
  } catch (error) {
    console.error("Error al cambiar contraseña:", error);
    return NextResponse.json(
      { message: "Error al cambiar contraseña" },
      { status: 500 }
    );
  }
}
