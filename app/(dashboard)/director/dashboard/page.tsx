"use client";

import { useEffect, useState } from "react";

export default function DirectorDashboardPage() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchDashboard = async () => {
      try {
        const token = localStorage.getItem("token");

        const res = await fetch(
          "http://localhost:4000/api/director/asistencias",
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        const json = await res.json();

        if (!res.ok) {
          throw new Error(json.message || "Error en backend");
        }

        setData(json.data);
      } catch (err: any) {
        console.error(err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboard();
  }, []);

  if (loading) {
    return <p className="p-6">Cargando dashboard...</p>;
  }

  if (error) {
    return (
      <p className="p-6 text-red-500">
        Error cargando datos: {error}
      </p>
    );
  }

  // 🔥 CARDS DINÁMICOS
  const resumen = [
    {
      title: "Alumnos activos",
      value: data.totalAlumnos,
      description: "Total de alumnos inscritos",
    },
    {
      title: "Asistencias registradas",
      value: data.totalAsistencias,
      description: "Registros en el sistema",
    },
    {
      title: "Faltas",
      value: data.faltas,
      description: "Inasistencias detectadas",
    },
    {
      title: "Asistencia general",
      value: `${data.porcentaje}%`,
      description: "Porcentaje global",
    },
  ];

  // 🔥 INDICADORES DINÁMICOS (base)
  const indicadores = [
    {
      titulo: "Asistencia positiva",
      detalle: `${data.presentes} registros de asistencia`,
    },
    {
      titulo: "Área de atención",
      detalle: `${data.faltas} faltas registradas`,
    },
    {
      titulo: "Retardos",
      detalle: `${data.retardos} retardos detectados`,
    },
  ];

  const accesos = [
    "Ver reporte académico",
    "Consultar asistencias",
    "Revisar calificaciones",
    "Supervisar grupos",
  ];

  return (
    <div className="space-y-6">
      {/* HEADER */}
      <section className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
        <h1 className="text-3xl font-bold text-gray-800">
          Dashboard de Director
        </h1>
        <p className="mt-2 text-gray-600">
          Vista ejecutiva del desempeño académico y operativo.
        </p>
      </section>

      {/* CARDS */}
      <section className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
        {resumen.map((item) => (
          <div
            key={item.title}
            className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm"
          >
            <p className="text-sm text-gray-500">{item.title}</p>
            <h2 className="mt-2 text-3xl font-bold text-gray-800">
              {item.value}
            </h2>
            <p className="mt-2 text-sm text-gray-500">
              {item.description}
            </p>
          </div>
        ))}
      </section>

      {/* INDICADORES + ACCESOS */}
      <section className="grid grid-cols-1 gap-6 xl:grid-cols-3">
        <div className="xl:col-span-2 rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
          <h2 className="text-xl font-semibold text-gray-800">
            Indicadores estratégicos
          </h2>
          <p className="mt-1 text-sm text-gray-500">
            Resumen de desempeño institucional
          </p>

          <div className="mt-4 space-y-4">
            {indicadores.map((item, index) => (
              <div
                key={index}
                className="rounded-xl border border-gray-200 bg-gray-50 p-4"
              >
                <h3 className="font-semibold text-gray-800">
                  {item.titulo}
                </h3>
                <p className="mt-1 text-sm text-gray-600">
                  {item.detalle}
                </p>
              </div>
            ))}
          </div>
        </div>

        <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
          <h2 className="text-xl font-semibold text-gray-800">
            Accesos rápidos
          </h2>
          <p className="mt-1 text-sm text-gray-500">
            Acciones clave del sistema
          </p>

          <div className="mt-4 space-y-3">
            {accesos.map((item, index) => (
              <button
                key={index}
                className="w-full rounded-xl bg-slate-900 px-4 py-3 text-left text-sm font-medium text-white transition hover:bg-slate-800"
              >
                {item}
              </button>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}