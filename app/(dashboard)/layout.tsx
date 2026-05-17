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
    ],

    DIRECTOR: [
      {
        label: "Dashboard",
        path: "/director/dashboard",
      },
    ],

    SECRETARIA: [
      {
        label: "Dashboard",
        path: "/secretaria/dashboard",
      },
    ],

    CAJA: [
      {
        label: "Dashboard",
        path: "/caja/dashboard",
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