"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

/**
 * Este archivo contenía por error una copia de la página de pagos
 * del alumno. La raíz del rol solo debe redirigir a su dashboard.
 */
export default function AdministradorPage() {
  const router = useRouter();

  useEffect(() => {
    router.replace("/administrador/dashboard");
  }, [router]);

  return null;
}
