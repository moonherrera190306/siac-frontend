"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

/**
 * Ruta raíz: manda a cada usuario a su propio dashboard según su rol.
 * Antes redirigía siempre a /administrador, sin importar quién iniciara sesión.
 */
const HOME_POR_ROL: Record<string, string> = {
  ADMIN: "/administrador/dashboard",
  DIRECTOR: "/director/dashboard",
  SECRETARIA: "/secretaria/dashboard",
  CAJA: "/caja/dashboard",
  MAESTRO: "/maestro/dashboard",
  ALUMNO: "/alumno/dashboard",
};

export default function Home() {
  const router = useRouter();

  useEffect(() => {
    // 🔐 El token está en una cookie httpOnly; aquí solo se mira
    // si quedó una sesión guardada para saber a dónde mandar al usuario.
    const guardado = localStorage.getItem("user");

    if (!guardado) {
      router.replace("/login");
      return;
    }

    let role: string | undefined;

    try {
      role = JSON.parse(guardado)?.role;
    } catch {
      role = undefined;
    }

    const destino = role ? HOME_POR_ROL[role] : undefined;

    if (!destino) {
      // Sesión corrupta o rol desconocido: se limpia y se vuelve al login.
      localStorage.removeItem("user");
      router.replace("/login");
      return;
    }

    router.replace(destino);
  }, [router]);

  return (
    <div className="flex min-h-screen items-center justify-center">
      <p className="text-gray-600">Cargando...</p>
    </div>
  );
}
