"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function Home() {
  const router = useRouter();

  useEffect(() => {
    const token = localStorage.getItem("token");

    if (!token) {
      router.push("/login");
    } else {
      // aquí después podemos hacerlo dinámico por rol
      router.push("/administrador");
    }
  }, []);

  return (
    <div className="flex min-h-screen items-center justify-center">
      <p className="text-gray-600">Cargando...</p>
    </div>
  );
}