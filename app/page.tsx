"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";

/**
 * Ruta raíz.
 *  - Con sesión: manda a cada usuario a su dashboard según su rol.
 *  - Sin sesión: portada para elegir Preparatoria o Universidad,
 *    cada una con su propio login.
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
  const [portada, setPortada] = useState(false);

  useEffect(() => {
    // 🔐 El token está en una cookie httpOnly; aquí solo se mira
    // si quedó una sesión guardada para saber a dónde mandar al usuario.
    const guardado = localStorage.getItem("user");

    if (!guardado) {
      setPortada(true);
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
      setPortada(true);
      return;
    }

    router.replace(destino);
  }, [router]);

  if (!portada) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <p className="text-gray-600">Cargando...</p>
      </div>
    );
  }

  return (
    <div className="siac-fondo-marino flex min-h-screen flex-col items-center justify-center p-4">
      <div className="mb-8 text-center">
        <h1 className="text-3xl font-bold tracking-[0.18em] !text-white">SIAC</h1>
        <p className="mt-1 text-sm text-white/70">
          Centro de Estudios Superiores de Zamora
        </p>
        <span className="mx-auto mt-3 block h-[3px] w-14 rounded-full bg-[#e6bf46]" />
        <p className="mt-5 text-white/80">¿A qué nivel perteneces?</p>
      </div>

      <div className="grid w-full max-w-3xl gap-5 md:grid-cols-2">
        <OpcionNivel
          href="/login"
          imagen={{ src: "/escudo-prepa.png", width: 570, height: 480 }}
          titulo="Preparatoria"
          detalle="Escuela Preparatoria por Cooperación de Zamora · UMSNH"
        />
        <OpcionNivel
          href="/login/universidad"
          imagen={{ src: "/justicia-universidad.png", width: 433, height: 560 }}
          titulo="Universidad"
          detalle="Licenciatura en Derecho"
        />
      </div>

      <p className="mt-8 text-center text-[11px] text-white/45">
        Personal administrativo: entra por cualquiera de los dos.
      </p>
    </div>
  );
}

function OpcionNivel({
  href,
  imagen,
  titulo,
  detalle,
}: {
  href: string;
  imagen: { src: string; width: number; height: number };
  titulo: string;
  detalle: string;
}) {
  return (
    <Link
      href={href}
      className="group overflow-hidden rounded-2xl bg-white shadow-2xl transition hover:-translate-y-1 hover:ring-4 hover:ring-[#e6bf46]"
    >
      <div className="flex h-56 items-center justify-center bg-[#f7f7f7] p-6">
        <Image
          src={imagen.src}
          alt={titulo}
          width={imagen.width}
          height={imagen.height}
          priority
          className="h-full w-auto transition group-hover:scale-105"
        />
      </div>
      <div className="px-6 py-5 text-center">
        <p className="text-xl font-bold text-[#00253f]">{titulo}</p>
        <p className="mt-1 text-xs text-slate-500">{detalle}</p>
        <span className="siac-btn siac-btn-primario mt-4 inline-block w-full py-2.5">
          Entrar
        </span>
      </div>
    </Link>
  );
}
