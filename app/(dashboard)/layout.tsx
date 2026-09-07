"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { API_URL } from "@/lib/config";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const router = useRouter();

  const [user, setUser] = useState<any>(null);

  // 📱 El sidebar era `w-72` fijo: en móvil ocupaba espacio permanente
  // y no había forma de cerrarlo.
  const [menuAbierto, setMenuAbierto] = useState(false);

  useEffect(() => {
    // 🔐 El token vive en una cookie httpOnly: no se puede leer desde aquí.
    // La sesión se confirma contra el backend.
    const guardado = localStorage.getItem("user");

    if (!guardado) {
      router.push("/login");
      return;
    }

    setUser(JSON.parse(guardado));

    fetch(`${API_URL}/api/auth/me`, { credentials: "include" })
      .then((res) => {
        if (!res.ok) throw new Error("Sesión no válida");
        return res.json();
      })
      .then((data) => {
        localStorage.setItem("user", JSON.stringify(data.user));
        setUser(data.user);

        // Evita el bucle: si ya está en la pantalla, no se redirige.
        if (
          data.user?.debeCambiarPassword &&
          pathname !== "/cambiar-password"
        ) {
          router.push("/cambiar-password");
        }
      })
      .catch(() => {
        localStorage.removeItem("user");
        router.push("/login");
      });
  }, [pathname]);

  // Al cambiar de pantalla en móvil, el menú se cierra solo.
  useEffect(() => {
    setMenuAbierto(false);
  }, [pathname]);

  const roleMenu: any = {
    ADMIN: [
      {
        label: "Dashboard",
        path: "/administrador/dashboard",
      },
      {
        label: "Usuarios",
        path: "/administrador/usuarios",
      },
      {
        label: "Alumnos",
        path: "/administrador/alumnos",
      },
      {
        label: "Materias",
        path: "/administrador/materias",
      },
      {
        label: "Pagos",
        path: "/administrador/pagos",
      },
      {
        label: "Reportes",
        path: "/administrador/reportes",
      },
      {
        label: "Auditoría",
        path: "/administrador/auditoria",
      },
      // Pendientes: /administrador/grupos y /administrador/maestros no se
      // enlazan todavía porque no consumen datos reales del backend.
    ],

    MAESTRO: [
      {
        label: "Dashboard",
        path: "/maestro/dashboard",
      },
      {
        label: "Grupos",
        path: "/maestro/grupos",
      },
      {
        label: "Asistencia",
        path: "/maestro/asistencia",
      },
      {
        label: "Bitácora",
        path: "/maestro/bitacora",
      },
      {
        label: "Calificaciones",
        path: "/maestro/calificaciones",
      },
      {
        label: "Horario",
        path: "/maestro/horario",
      },
      {
        label: "Materias",
        path: "/maestro/materias",
      },
    ],

   ALUMNO: [
  {
    label: "Dashboard",
    path: "/alumno/dashboard",
  },

  {
    label: "Materias",
    path: "/alumno/materias",
  },

  {
    label: "Calificaciones",
    path: "/alumno/calificaciones",
  },

  {
    label: "Asistencia",
    path: "/alumno/asistencia",
  },

  {
    label: "Horario",
    path: "/alumno/horario",
  },

  {
    label: "Pagos",
    path: "/alumno/pagos",
  },

  {
    label: "Documentos",
    path: "/alumno/documentos",
  },{
    label: "Perfil ",
    path: "/alumno/perfil",
  },
],

  DIRECTOR: [
  {
    label: "Dashboard",
    path: "/director/dashboard",
  },

  {
    label: "Asistencias",
    path: "/director/asistencias",
  },

  {
    label: "Calificaciones",
    path: "/director/calificaciones",
  },

  {
    label: "Grupos",
    path: "/director/grupos",
  },

  {
    label: "Maestros",
    path: "/director/maestros",
  },

  {
    label: "Materias",
    path: "/director/materias",
  },
  {
    label: "Horarios",
    path: "/director/horarios",
  },
  {
    label: "Evaluación",
    path: "/director/evaluacion",
  },
  {
    label: "Seguimiento",
    path: "/director/bitacora",
  },
  {
    label: "Observaciones",
    path: "/director/observaciones",
  },
  {
    label: "Estructura",
    path: "/director/estructura",
  },
  {
    label: "Ciclos",
    path: "/director/ciclos",
  },

  {
    label: "Asignaciones",
    path: "/director/asignaciones",
  },


  {
    label: "Reportes",
    path: "/director/reportes",
  },
],

    SECRETARIA: [
  {
    label: "Dashboard",
    path: "/secretaria/dashboard",
  },

  {
    label: "Alumnos",
    path: "/secretaria/alumnos",
  },

  {
    label: "Inscripciones",
    path: "/secretaria/inscripciones",
  },

  {
    label: "Grupos",
    path: "/secretaria/grupos",
  },

  {
    label: "Horarios",
    path: "/secretaria/horarios",
  },

  {
    label: "Trámites",
    path: "/secretaria/tramites",
  },
  {
    label: "Documentos",
    path: "/secretaria/documentos",
  },

  {
    label: "Constancias",
    path: "/secretaria/constancias",
  },
],

    CAJA: [
  {
    label: "Dashboard",
    path: "/caja/dashboard",
  },
  {
    label: "Cobros",
    path: "/caja/cobros",
  },
  {
    label: "Pagos Pendientes",
    path: "/caja/pagos-pendientes",
  },
  {
    label: "Historial",
    path: "/caja/historial",
  },
  {
    label: "Recibos",
    path: "/caja/recibos",
  },
  {
    label: "Reportes",
    path: "/caja/reportes",
  },
],
  };

  // 🔥 Un directivo que además da clase tiene ficha de docente: se le
  // agregan las pantallas de maestro a su menú, para que no tenga que
  // cambiar de cuenta. El backend le abre esas rutas por la misma razón.
  const menu = [
    ...(roleMenu[user?.role] || []),
    ...(user?.docenteId && user?.role !== "MAESTRO"
      ? [{ separador: "Docencia" }, ...roleMenu.MAESTRO.slice(1)]
      : []),
  ];

  const ROL: Record<string, string> = {
    ADMIN: "Administración",
    DIRECTOR: "Dirección",
    SECRETARIA: "Secretaría Escolar",
    CAJA: "Caja",
    MAESTRO: "Docente",
    ALUMNO: "Alumno",
  };

  // Título de la pantalla actual, para el encabezado de escritorio.
  const actual = menu.find((m: any) => m.path === pathname)?.label ?? "";

  const iniciales = (user?.name ?? "")
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((p: string) => p[0])
    .join("")
    .toUpperCase();

  const logout = async () => {
    // 🔐 La cookie httpOnly solo la puede borrar el backend.
    try {
      await fetch(`${API_URL}/api/auth/logout`, {
        method: "POST",
        credentials: "include",
      });
    } catch {
      // aunque falle la red, se cierra la sesión del lado del cliente
    }

    localStorage.removeItem("user");

    router.push("/login");
  };

  return (
    <div className="min-h-screen" style={{ background: "var(--siac-fondo)" }}>
      {/* ================= BARRA MÓVIL ================= */}
      <header className="siac-sidebar sticky top-0 z-30 flex items-center gap-3 px-4 py-3 md:hidden">
        <button
          onClick={() => setMenuAbierto(true)}
          aria-label="Abrir menú"
          className="rounded-lg border border-white/25 px-3 py-1.5 text-lg leading-none text-white"
        >
          ☰
        </button>

        <span className="text-base font-bold tracking-[0.14em] text-white">
          SIAC
        </span>

        <span className="ml-auto text-[11px] font-medium text-white/70">
          {ROL[user?.role] ?? user?.role}
        </span>
      </header>

      {/* ================= FONDO OSCURO (solo móvil) ================= */}
      {menuAbierto && (
        <div
          onClick={() => setMenuAbierto(false)}
          className="fixed inset-0 z-40 bg-slate-900/60 md:hidden"
          role="presentation"
        />
      )}

      {/* ================= SIDEBAR =================
          Fijo en todos los tamaños. En escritorio siempre visible;
          en móvil entra deslizándose. El contenido se recorre con
          margen, no con flex: así no hay forma de que se encimen. */}
      <aside
        className={
          "siac-sidebar fixed inset-y-0 left-0 z-50 flex w-64 flex-col transition-transform duration-200 md:translate-x-0 " +
          (menuAbierto ? "translate-x-0" : "-translate-x-full")
        }
      >
        {/* MARCA — el escudo de la escuela, no un cuadro de color */}
        <div className="siac-sidebar-seccion flex items-center gap-3 border-b px-5 py-4">
          <Image
            src="/escudo-ceszam.png"
            alt=""
            width={361}
            height={420}
            className="h-10 w-auto flex-none"
          />

          <div className="min-w-0">
            <p className="text-lg font-bold leading-none tracking-[0.14em] text-white">
              SIAC
            </p>
            <p className="mt-1 truncate text-[10.5px] leading-tight text-white/55">
              Centro de Estudios
              <br />
              Superiores de Zamora
            </p>
          </div>

          <button
            onClick={() => setMenuAbierto(false)}
            aria-label="Cerrar menú"
            className="ml-auto text-2xl leading-none text-white/60 md:hidden"
          >
            ×
          </button>
        </div>

        {/* USUARIO */}
        <div className="siac-sidebar-seccion flex items-center gap-3 border-b px-5 py-3.5">
          <span className="flex h-9 w-9 flex-none items-center justify-center rounded-full bg-white/10 text-xs font-bold text-white">
            {iniciales || "··"}
          </span>

          <div className="min-w-0">
            <p className="truncate text-[13px] font-semibold text-white">
              {user?.name || "Usuario"}
            </p>
            <p className="text-[11px] text-white/55">
              {ROL[user?.role] ?? user?.role}
            </p>
          </div>
        </div>

        {/* MENÚ */}
        <nav className="flex-1 space-y-0.5 overflow-y-auto px-3 py-4">
          {menu.map((item: any) =>
            item.separador ? (
              <p
                key={item.separador}
                className="mt-4 px-4 pb-1 pt-2 text-[10px] font-semibold uppercase tracking-[0.12em] text-white/40"
              >
                {item.separador}
              </p>
            ) : (
              <Link
                key={item.path}
                href={item.path}
                className={
                  "siac-nav-item" +
                  (pathname === item.path ? " siac-nav-item-activo" : "")
                }
              >
                {item.label}
              </Link>
            ),
          )}
        </nav>

        {/* SALIR */}
        <div className="siac-sidebar-seccion border-t p-3">
          <button
            onClick={logout}
            className="w-full rounded-lg border border-white/20 px-3 py-2 text-sm font-medium text-white/80 transition hover:bg-white/10 hover:text-white"
          >
            Cerrar sesión
          </button>
        </div>
      </aside>

      {/* ================= CONTENIDO =================
          `md:ml-64` deja exactamente el ancho del sidebar libre. */}
      <div className="md:ml-64">
        {/* Encabezado de escritorio: ubica al usuario sin repetir el menú. */}
        <header className="hidden items-center gap-3 border-b border-slate-200 bg-white px-8 py-3.5 md:flex">
          <h2 className="text-sm font-semibold text-slate-800">{actual}</h2>

          <span className="ml-auto text-xs text-slate-400">
            {ROL[user?.role] ?? user?.role}
          </span>
        </header>

        <main className="min-w-0 p-4 md:p-8">
          <div className="mx-auto max-w-7xl space-y-6">{children}</div>
        </main>
      </div>
    </div>
  );
}
