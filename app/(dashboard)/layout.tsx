"use client";

import Link from "next/link";
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

  const menu =
    roleMenu[user?.role] || [];

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
    <div className="min-h-screen bg-slate-100">

      {/* ================= BARRA MÓVIL ================= */}
      <header className="sticky top-0 z-30 flex items-center gap-3 border-b border-slate-200 bg-white px-4 py-3 md:hidden">
        <button
          onClick={() => setMenuAbierto(true)}
          aria-label="Abrir menú"
          className="rounded-lg border border-slate-300 px-3 py-1.5 text-lg leading-none text-slate-700"
        >
          ☰
        </button>

        <span className="text-lg font-bold text-slate-900">SIAC</span>

        <span className="ml-auto text-xs font-medium text-slate-500">
          {user?.role}
        </span>
      </header>

      {/* ================= FONDO OSCURO (solo móvil) ================= */}
      {menuAbierto && (
        <div
          onClick={() => setMenuAbierto(false)}
          className="fixed inset-0 z-40 bg-slate-900/50 md:hidden"
          role="presentation"
        />
      )}

      {/* ================= SIDEBAR =================
          Fijo en todos los tamaños. En escritorio siempre visible;
          en móvil entra deslizándose. El contenido se recorre con
          margen, no con flex: así no hay forma de que se encimen. */}
      <aside
        className={
          "fixed inset-y-0 left-0 z-50 flex w-64 flex-col bg-slate-900 text-white transition-transform duration-200 md:translate-x-0 " +
          (menuAbierto ? "translate-x-0" : "-translate-x-full")
        }
      >
        {/* MARCA */}
        <div className="flex items-center justify-between border-b border-slate-800 px-5 py-5">
          <div>
            <p className="text-2xl font-bold tracking-tight">SIAC</p>
            <p className="text-[11px] text-slate-400">
              Sistema Integral Académico
            </p>
          </div>

          <button
            onClick={() => setMenuAbierto(false)}
            aria-label="Cerrar menú"
            className="text-2xl leading-none text-slate-400 md:hidden"
          >
            ×
          </button>
        </div>

        {/* USUARIO */}
        <div className="border-b border-slate-800 px-5 py-4">
          <p className="truncate text-sm font-semibold">
            {user?.name || "Usuario"}
          </p>

          <p className="text-xs text-slate-400">{user?.role}</p>
        </div>

        {/* MENÚ */}
        <nav className="flex-1 space-y-1 overflow-y-auto px-3 py-4">
          {menu.map((item: any) => {
            const activo = pathname === item.path;

            return (
              <Link
                key={item.path}
                href={item.path}
                className={
                  "block rounded-lg px-3 py-2 text-sm transition " +
                  (activo
                    ? "bg-blue-600 font-medium text-white"
                    : "text-slate-300 hover:bg-slate-800 hover:text-white")
                }
              >
                {item.label}
              </Link>
            );
          })}
        </nav>

        {/* SALIR */}
        <div className="border-t border-slate-800 p-3">
          <button
            onClick={logout}
            className="w-full rounded-lg border border-slate-700 px-3 py-2 text-sm font-medium text-slate-300 transition hover:bg-slate-800 hover:text-white"
          >
            Cerrar sesión
          </button>
        </div>
      </aside>

      {/* ================= CONTENIDO =================
          `md:ml-64` deja exactamente el ancho del sidebar libre. */}
      <main className="min-w-0 p-4 md:ml-64 md:p-8">
        <div className="mx-auto max-w-7xl space-y-6">{children}</div>
      </main>
    </div>
  );
}
