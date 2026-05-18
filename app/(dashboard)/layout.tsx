"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const router = useRouter();

  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    const token = localStorage.getItem("token");

    if (!token) {
      router.push("/login");
      return;
    }

    const storedUser = JSON.parse(
      localStorage.getItem("user") || "{}"
    );

    setUser(storedUser);
  }, []);

  const roleMenu: any = {
    ADMIN: [
      {
        label: "Dashboard",
        path: "/administrador/dashboard",
      },
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

  const logout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");

    router.push("/login");
  };

  return (
    <div className="flex min-h-screen bg-gray-100">

      {/* SIDEBAR */}
      <aside className="w-72 bg-slate-950 text-white flex flex-col">

        {/* HEADER */}
        <div className="p-6 border-b border-slate-800">
          <h1 className="text-4xl font-bold">
            SIAC
          </h1>
        </div>

        {/* USER */}
        <div className="p-6 border-b border-slate-800">
          <p className="font-semibold">
            {user?.name || "Usuario"}
          </p>

          <p className="text-slate-400 text-sm">
            {user?.role}
          </p>
        </div>

        {/* MENU */}
        <nav className="flex-1 p-4 space-y-2">

          {menu.map((item: any) => (
            <Link
              key={item.path}
              href={item.path}
              className={`block rounded-xl px-4 py-3 transition ${
                pathname === item.path
                  ? "bg-blue-600"
                  : "hover:bg-slate-800"
              }`}
            >
              {item.label}
            </Link>
          ))}

        </nav>

        {/* FOOTER */}
        <div className="p-4 border-t border-slate-800">

          <button
            onClick={logout}
            className="w-full rounded-xl bg-red-500 px-4 py-3 font-medium hover:bg-red-600"
          >
            Cerrar sesión
          </button>

        </div>

      </aside>

      {/* CONTENT */}
      <main className="flex-1 p-6">
        {children}
      </main>

    </div>
  );
}