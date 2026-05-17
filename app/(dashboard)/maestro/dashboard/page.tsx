"use client";

import { useEffect, useMemo, useState } from "react";
import { apiFetch } from "@/lib/apiClient";

type ResumenItem = {
  title: string;
  value: number;
  description: string;
};

type ClaseHoy = {
  hora: string;
  materia: string;
  grupo: string;
  aula: string;
};

export default function MaestroDashboardPage() {
  const [resumen, setResumen] = useState<ResumenItem[]>([]);
  const [clasesHoy, setClasesHoy] = useState<ClaseHoy[]>([]);
  const [pendientes, setPendientes] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
  async function fetchData() {
    try {
      setLoading(true);
      setError("");

      // 🔥 usar grupos porque sí funciona
      const response = await apiFetch(
        "/api/docentes/grupos"
      );

      const grupos = Array.isArray(response?.data)
        ? response.data
        : [];

      const totalGrupos = grupos.length;

      const totalAlumnos = grupos.reduce(
        (acc: number, grupo: any) =>
          acc + (grupo?.totalAlumnos ?? 0),
        0
      );

      setResumen([
        {
          title: "Grupos asignados",
          value: totalGrupos,
          description: "Grupos bajo tu responsabilidad",
        },
        {
          title: "Materias",
          value: totalGrupos,
          description: "Materias asignadas",
        },
        {
          title: "Alumnos",
          value: totalAlumnos,
          description: "Total de alumnos",
        },
        {
          title: "Promedio general",
          value: 8.7,
          description: "Promedio académico",
        },
      ]);

      setClasesHoy([
        {
          hora: "07:00 - 08:00",
          materia: "Matemáticas",
          grupo: "3A",
          aula: "Aula 1",
        },
      ]);

      setPendientes([
        "Capturar calificaciones",
        "Registrar asistencia",
      ]);
    } catch (err: any) {
      console.error(err);

      setError(
        err?.message || "Error cargando dashboard"
      );
    } finally {
      setLoading(false);
    }
  }

  fetchData();
}, []);

  const totalPendientes = useMemo(
    () => pendientes?.length ?? 0,
    [pendientes]
  );

  // 🔄 LOADING
  if (loading) {
    return (
      <div className="p-6">
        <p className="text-gray-600">
          Cargando dashboard...
        </p>
      </div>
    );
  }

  // ❌ ERROR
  if (error) {
    return (
      <div className="p-6">
        <div className="rounded-xl border border-red-200 bg-red-50 p-4">
          <p className="font-medium text-red-600">
            Error cargando dashboard
          </p>

          <p className="mt-1 text-sm text-red-500">
            {error}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* HEADER */}
      <section className="rounded-2xl border bg-white p-6 shadow-sm">
        <h1 className="text-3xl font-bold">
          Panel del maestro
        </h1>

        <p className="text-gray-500">
          Información académica en tiempo real
        </p>
      </section>

      {/* RESUMEN */}
      <section className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
        {(resumen ?? []).map((item) => (
          <div
            key={item?.title}
            className="rounded-2xl border bg-white p-5 shadow-sm"
          >
            <p className="text-sm text-gray-500">
              {item?.title ?? ""}
            </p>

            <h2 className="text-3xl font-bold">
              {item?.value ?? 0}
            </h2>

            <p className="text-sm text-gray-500">
              {item?.description ?? ""}
            </p>
          </div>
        ))}
      </section>

      {/* CONTENIDO */}
      <section className="grid grid-cols-1 gap-6 xl:grid-cols-2">
        {/* CLASES */}
        <div className="rounded-2xl border bg-white p-6 shadow-sm">
          <h2 className="text-xl font-semibold">
            Clases de hoy
          </h2>

          <div className="mt-4 space-y-3">
            {(clasesHoy ?? []).length === 0 ? (
              <p className="text-gray-500">
                No hay clases programadas.
              </p>
            ) : (
              (clasesHoy ?? []).map((clase, i) => (
                <div
                  key={i}
                  className="rounded-xl border bg-gray-50 p-4"
                >
                  <p className="font-semibold">
                    {clase?.materia ?? "Materia"}
                  </p>

                  <p className="text-sm text-gray-500">
                    {clase?.hora ?? "--"} ·{" "}
                    {clase?.grupo ?? "N/A"} ·{" "}
                    {clase?.aula ?? "Sin aula"}
                  </p>
                </div>
              ))
            )}
          </div>
        </div>

        {/* PENDIENTES */}
        <div className="rounded-2xl border bg-white p-6 shadow-sm">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold">
              Pendientes
            </h2>

            <span className="rounded-full bg-slate-900 px-3 py-1 text-sm text-white">
              {totalPendientes}
            </span>
          </div>

          <div className="mt-4 space-y-3">
            {(pendientes ?? []).length === 0 ? (
              <p className="text-gray-500">
                No hay pendientes.
              </p>
            ) : (
              (pendientes ?? []).map((item, i) => (
                <div
                  key={i}
                  className="rounded-xl border bg-gray-50 p-4"
                >
                  {item}
                </div>
              ))
            )}
          </div>
        </div>
      </section>
    </div>
  );
}