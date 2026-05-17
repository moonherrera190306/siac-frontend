"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

export default function AdministradorDashboardPage() {
  const router = useRouter();

  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<any>(null);

  useEffect(() => {
    const fetchDashboard = async () => {
      const token = localStorage.getItem("token");

      if (!token) {
        router.push("/login");
        return;
      }

      try {
        const res = await fetch(
          "http://siac-backend-production.up.railway.app/api/admin/dashboard",
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        if (!res.ok) {
          localStorage.removeItem("token");
          router.push("/login");
          return;
        }

        const result = await res.json();
        setData(result);

      } catch (error) {
        console.error("Error:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboard();
  }, []);

  // ⏳ LOADING REAL
  if (loading || !data) {
    return <p className="p-10">Cargando dashboard...</p>;
  }

  // 🔥 DATOS REALES DEL BACKEND
  const resumen = [
    {
      title: "Alumnos registrados",
      value: data.totalAlumnos,
      description: "Total de alumnos activos",
    },
    {
      title: "Maestros activos",
      value: data.totalDocentes,
      description: "Docentes registrados",
    },
    {
      title: "Grupos activos",
      value: data.totalGrupos,
      description: "Grupos del sistema",
    },
    {
      title: "Pagos registrados",
      value: data.totalPagos,
      description: "Pagos realizados",
    },
  ];

  // 🔥 ACCESOS CON NAVEGACIÓN REAL
  const accesos = [
    {
      label: "Registrar nuevo alumno",
      path: "/administrador/alumnos",
    },
    {
      label: "Registrar nuevo maestro",
      path: "/administrador/maestros",
    },
    {
      label: "Crear grupo",
      path: "/administrador/grupos",
    },
    {
      label: "Asignar materia",
      path: "/administrador/materias",
    },
  ];

  // 🔥 ACTIVIDAD (puedes conectar después)
  const actividad = [
    {
      titulo: "Sistema activo",
      detalle: "El sistema SIAC está funcionando correctamente",
      fecha: "Ahora",
    },
    {
      titulo: "Base de datos conectada",
      detalle: "Conexión con PostgreSQL exitosa",
      fecha: "Hace unos segundos",
    },
  ];

  return (
    <div className="space-y-6">

      {/* HEADER */}
      <section className="rounded-2xl border bg-white p-6 shadow-sm">
        <h1 className="text-3xl font-bold">
          Dashboard de Administrador
        </h1>
        <p className="text-gray-500">
          Bienvenido al sistema SIAC 🔥
        </p>
      </section>

      {/* RESUMEN */}
      <section className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
        {resumen.map((item) => (
          <div
            key={item.title}
            className="rounded-2xl border bg-white p-5 shadow-sm"
          >
            <p className="text-sm text-gray-500">
              {item.title}
            </p>
            <h2 className="text-3xl font-bold">
              {item.value}
            </h2>
            <p className="text-sm text-gray-500">
              {item.description}
            </p>
          </div>
        ))}
      </section>

      {/* CONTENIDO */}
      <section className="grid grid-cols-1 gap-6 xl:grid-cols-3">

        {/* ACTIVIDAD */}
        <div className="xl:col-span-2 rounded-2xl border bg-white p-6 shadow-sm">
          <h2 className="text-xl font-semibold">
            Actividad del sistema
          </h2>

          <div className="mt-4 space-y-4">
            {actividad.map((item, index) => (
              <div
                key={index}
                className="bg-gray-50 p-4 rounded-xl"
              >
                <h3 className="font-semibold">
                  {item.titulo}
                </h3>
                <p className="text-sm text-gray-600">
                  {item.detalle}
                </p>
                <span className="text-xs text-gray-500">
                  {item.fecha}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* ACCESOS */}
        <div className="rounded-2xl border bg-white p-6 shadow-sm">
          <h2 className="text-xl font-semibold">
            Accesos rápidos
          </h2>

          <div className="mt-4 space-y-3">
            {accesos.map((item, index) => (
              <button
                key={index}
                onClick={() => router.push(item.path)}
                className="w-full bg-slate-900 text-white px-4 py-3 rounded-xl text-left hover:bg-slate-800"
              >
                {item.label}
              </button>
            ))}
          </div>
        </div>

      </section>
    </div>
  );
}