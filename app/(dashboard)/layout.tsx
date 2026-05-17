"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();

  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<any>(null);

  // 🔐 VALIDAR SESIÓN
  useEffect(() => {
    const token = localStorage.getItem("token");

    let userData = null;

    try {
      const stored = localStorage.getItem("user");
      userData = stored ? JSON.parse(stored) : null;
    } catch (error) {
      console.error("Error parseando user", error);
      userData = null;
    }

    if (!token || !userData) {
      router.push("/login");
    } else {
      setUser(userData);
      setLoading(false);
    }
  }, [router]);

  // 🚪 LOGOUT
  const logout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    router.push("/login");
  };

  // 🎯 MENÚ POR ROL (CORREGIDO A TUS RUTAS REALES)
  const menuByRole: any = {
    ADMIN: [
      { label: "Dashboard", path: "/administrador" },
      { label: "Alumnos", path: "/administrador/alumnos" },
      { label: "Maestros", path: "/administrador/maestros" },
      { label: "Grupos", path: "/administrador/grupos" },
      { label: "Materias", path: "/administrador/materias" },
      { label: "Pagos", path: "/administrador/pagos" },
      { label: "Reportes", path: "/administrador/reportes" },
    ],

    ALUMNO: [
      { label: "Dashboard", path: "/alumno" },
      { label: "Materias", path: "/alumno/materias" },
      { label: "Calificaciones", path: "/alumno/calificaciones" },
      { label: "Horario", path: "/alumno/horario" },
      { label: "Pagos", path: "/alumno/pagos" },
      { label: "Documentos", path: "/alumno/documentos" },
    ],

    MAESTRO: [
      { label: "Dashboard", path: "/maestro" },
      { label: "Grupos", path: "/maestro/grupos" },
      { label: "Asistencia", path: "/maestro/asistencia" },
      { label: "Calificaciones", path: "/maestro/calificaciones" },
      { label: "Horario", path: "/maestro/horario" },
      { label: "Materias", path: "/maestro/materias" },
    ],

    DIRECTOR: [
      { label: "Dashboard", path: "/director" },
      { label: "Alumnos", path: "/director/alumnos" },
      { label: "Maestros", path: "/director/maestros" },
      { label: "Grupos", path: "/director/grupos" },
      { label: "Materias", path: "/director/materias" },
      { label: "Calificaciones", path: "/director/calificaciones" },
      { label: "Asistencias", path: "/director/asistencias" },
      { label: "Reportes", path: "/director/reportes" },
    ],

    SECRETARIA: [
      { label: "Dashboard", path: "/secretaria" },
      { label: "Alumnos", path: "/secretaria/alumnos" },
      { label: "Documentos", path: "/secretaria/documentos" },
      { label: "Inscripciones", path: "/secretaria/inscripciones" },
      { label: "Horarios", path: "/secretaria/horarios" },
      { label: "Grupos", path: "/secretaria/grupos" },
      { label: "Constancias", path: "/secretaria/constancias" },
    ],

    CAJA: [
      { label: "Dashboard", path: "/caja" },
      { label: "Cobros", path: "/caja/cobros" },
      { label: "Pagos pendientes", path: "/caja/pagos-pendientes" },
      { label: "Historial", path: "/caja/historial" },
      { label: "Recibos", path: "/caja/recibos" },
      { label: "Reportes", path: "/caja/reportes" },
    ],
  };

  const menu =
    user?.role && menuByRole[user.role]
      ? menuByRole[user.role]
      : [];

  // ⏳ LOADING
  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <p className="text-gray-500">Cargando...</p>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-gray-100">

      {/* SIDEBAR */}
      <aside className="w-64 bg-slate-900 text-white flex flex-col justify-between">

        <div>
          {/* LOGO */}
          <div className="p-6 text-xl font-bold border-b border-slate-700">
            SIAC
          </div>

          {/* USER */}
          <div className="px-6 py-4 border-b border-slate-700 text-sm">
            <p className="font-semibold">{user?.name || "Usuario"}</p>
            <p className="text-gray-400 text-xs">{user?.role || "-"}</p>
          </div>

          {/* MENU */}
          <nav className="p-4 space-y-2">
            {menu.map((item: any, index: number) => (
              <button
                key={index}
                onClick={() => router.push(item.path)}
                className="w-full text-left px-4 py-2 rounded-lg hover:bg-slate-700 transition"
              >
                {item.label}
              </button>
            ))}
          </nav>
        </div>

        {/* LOGOUT */}
        <div className="p-4 border-t border-slate-700">
          <button
            onClick={logout}
            className="w-full bg-red-500 hover:bg-red-600 py-2 rounded-lg transition"
          >
            Cerrar sesión
          </button>
        </div>

      </aside>

      {/* CONTENIDO */}
      <main className="flex-1 p-6">
        {children}
      </main>

    </div>
  );
}