"use client";

import Link from "next/link";
import { ReactNode } from "react";
import { usePathname } from "next/navigation";

type MenuItem = {
  label: string;
  href: string;
};

const menuByRole: Record<string, MenuItem[]> = {
  administrador: [
    { label: "Dashboard", href: "/administrador/dashboard" },
    { label: "Usuarios", href: "/administrador/usuarios" },
    { label: "Alumnos", href: "/administrador/alumnos" },
    { label: "Maestros", href: "/administrador/maestros" },
    { label: "Grupos", href: "/administrador/grupos" },
    { label: "Materias", href: "/administrador/materias" },
    { label: "Pagos", href: "/administrador/pagos" },
    { label: "Reportes", href: "/administrador/reportes" },
  ],

  director: [
    { label: "Dashboard", href: "/director/dashboard" },
    { label: "Alumnos", href: "/director/alumnos" },
    { label: "Maestros", href: "/director/maestros" },
    { label: "Grupos", href: "/director/grupos" },
    { label: "Materias", href: "/director/materias" },
    { label: "Calificaciones", href: "/director/calificaciones" },
    { label: "Asistencias", href: "/director/asistencias" },
    { label: "Reportes", href: "/director/reportes" },
  ],

  maestro: [
    { label: "Dashboard", href: "/maestro/dashboard" },
    { label: "Mis grupos", href: "/maestro/grupos" },
    { label: "Mis materias", href: "/maestro/materias" },
    { label: "Calificaciones", href: "/maestro/calificaciones" },
    { label: "Asistencia", href: "/maestro/asistencia" },
    { label: "Horario", href: "/maestro/horario" },
  ],

  alumno: [
    { label: "Dashboard", href: "/alumno/dashboard" },
    { label: "Mis materias", href: "/alumno/materias" },
    { label: "Calificaciones", href: "/alumno/calificaciones" },
    { label: "Asistencia", href: "/alumno/asistencia" },
    { label: "Horario", href: "/alumno/horario" },
    { label: "Pagos", href: "/alumno/pagos" },
    { label: "Documentos", href: "/alumno/documentos" },
  ],

  secretaria: [
    { label: "Dashboard", href: "/secretaria/dashboard" },
    { label: "Inscripciones", href: "/secretaria/inscripciones" },
    { label: "Alumnos", href: "/secretaria/alumnos" },
    { label: "Documentos", href: "/secretaria/documentos" },
    { label: "Grupos", href: "/secretaria/grupos" },
    { label: "Horarios", href: "/secretaria/horarios" },
    { label: "Constancias", href: "/secretaria/constancias" },
  ],

  caja: [
    { label: "Dashboard", href: "/caja/dashboard" },
    { label: "Cobros", href: "/caja/cobros" },
    { label: "Pagos pendientes", href: "/caja/pagos-pendientes" },
    { label: "Historial", href: "/caja/historial" },
    { label: "Recibos", href: "/caja/recibos" },
    { label: "Reportes", href: "/caja/reportes" },
  ],
};

const roleTitles: Record<string, string> = {
  administrador: "Administrador",
  director: "Director",
  maestro: "Maestro",
  alumno: "Alumno",
  secretaria: "Secretaría",
  caja: "Caja",
};

export default function DashboardLayout({
  children,
}: {
  children: ReactNode;
}) {
  const pathname = usePathname();

  const role = pathname.split("/")[1] || "administrador";
  const menu = menuByRole[role] || [];
  const roleTitle = roleTitles[role] || "Panel";

  return (
    <div className="min-h-screen flex bg-gray-100">
      {/* Sidebar */}
      <aside className="w-64 bg-slate-950 text-white p-5 hidden md:flex md:flex-col md:justify-between">
        <div>
          <h1 className="text-2xl font-bold mb-8">SIAC</h1>

          <nav className="space-y-2">
            {menu.map((item) => {
              const isActive = pathname === item.href;

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`block rounded-lg px-3 py-2 transition ${
                    isActive
                      ? "bg-white text-slate-950 font-semibold"
                      : "text-white hover:bg-slate-800"
                  }`}
                >
                  {item.label}
                </Link>
              );
            })}
          </nav>
        </div>

        <div className="border-t border-slate-800 pt-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-slate-800 border border-slate-700 flex items-center justify-center text-sm font-bold">
              {roleTitle.charAt(0)}
            </div>

            <div>
              <p className="text-sm font-medium">{roleTitle}</p>
              <p className="text-xs text-slate-400">Usuario activo</p>
            </div>
          </div>
        </div>
      </aside>

      {/* Main */}
      <div className="flex-1 flex flex-col">
        {/* Topbar */}
        <header className="bg-white shadow-sm px-6 py-4 flex justify-between items-center">
          <div>
            <h2 className="text-2xl font-semibold text-gray-800">
              {roleTitle}
            </h2>
            <p className="text-sm text-gray-500">
              Panel de control del sistema
            </p>
          </div>

          <div className="flex items-center gap-3">
            <span className="text-sm text-gray-600">Usuario activo</span>
            <div className="w-10 h-10 rounded-full bg-slate-300" />
          </div>
        </header>

        {/* Content */}
        <main className="p-6">{children}</main>
      </div>
    </div>
  );
}