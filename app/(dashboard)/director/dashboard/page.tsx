"use client";

import { useEffect, useMemo, useState } from "react";
import { apiFetch } from "@/lib/apiClient";

type DirectorData = {
  totalAlumnos: number;
  totalAsistencias: number;
  faltas: number;
  porcentaje: number;
  presentes: number;
  retardos: number;
};

const defaultData: DirectorData = {
  totalAlumnos: 0,
  totalAsistencias: 0,
  faltas: 0,
  porcentaje: 0,
  presentes: 0,
  retardos: 0,
};

function normalizeDirectorData(result: any): DirectorData {
  const source = result?.data ?? result ?? {};

  return {
    totalAlumnos: Number(source?.totalAlumnos ?? 0),
    totalAsistencias: Number(source?.totalAsistencias ?? 0),
    faltas: Number(source?.faltas ?? 0),
    porcentaje: Number(source?.porcentaje ?? 0),
    presentes: Number(source?.presentes ?? 0),
    retardos: Number(source?.retardos ?? 0),
  };
}

export default function DirectorDashboardPage() {
  const [data, setData] = useState<DirectorData>(defaultData);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    async function fetchDashboard() {
      try {
        setLoading(true);
        setError("");

        const result = await apiFetch("/api/director/asistencias");

        setData(normalizeDirectorData(result));
      } catch (err: any) {
        console.error("Error dashboard director:", err);
        setError(err?.message || "Error cargando dashboard");
        setData(defaultData);
      } finally {
        setLoading(false);
      }
    }

    fetchDashboard();
  }, []);

  const resumen = useMemo(
    () => [
      {
        title: "Alumnos activos",
        value: data?.totalAlumnos ?? 0,
        description: "Total de alumnos inscritos",
      },
      {
        title: "Asistencias registradas",
        value: data?.totalAsistencias ?? 0,
        description: "Registros en el sistema",
      },
      {
        title: "Faltas",
        value: data?.faltas ?? 0,
        description: "Inasistencias detectadas",
      },
      {
        title: "Asistencia general",
        value: `${data?.porcentaje ?? 0}%`,
        description: "Porcentaje global",
      },
    ],
    [data]
  );

  const indicadores = useMemo(
    () => [
      {
        titulo: "Asistencia positiva",
        detalle: `${data?.presentes ?? 0} registros de asistencia`,
      },
      {
        titulo: "Área de atención",
        detalle: `${data?.faltas ?? 0} faltas registradas`,
      },
      {
        titulo: "Retardos",
        detalle: `${data?.retardos ?? 0} retardos detectados`,
      },
    ],
    [data]
  );

  const accesos = [
    "Ver reporte académico",
    "Consultar asistencias",
    "Revisar calificaciones",
    "Supervisar grupos",
  ];

  if (loading) {
    return <p className="p-6">Cargando dashboard...</p>;
  }

  if (error) {
    return (
      <div className="p-6">
        <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-red-700">
          {error}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <section className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
        <h1 className="text-3xl font-bold text-gray-800">
          Dashboard de Director
        </h1>

        <p className="mt-2 text-gray-600">
          Vista ejecutiva del desempeño académico y operativo.
        </p>
      </section>

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

                <p className="mt-1 text-sm text-gray-500">
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

          <div className="mt-4 space-y-3">
            {accesos.map((item) => (
              <button
                key={item}
                className="w-full rounded-xl bg-slate-900 px-4 py-3 text-left text-sm font-medium text-white transition hover:bg-slate-700"
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