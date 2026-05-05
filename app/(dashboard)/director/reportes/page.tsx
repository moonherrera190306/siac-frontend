"use client";

import { useState } from "react";

export default function DirectorReportesPage() {
  const [loading, setLoading] = useState<string | null>(null);

  const reportes = [
    {
      key: "academico",
      titulo: "Reporte académico general",
      descripcion:
        "Consulta el comportamiento global de promedios y materias.",
    },
    {
      key: "asistencias",
      titulo: "Reporte de asistencia",
      descripcion:
        "Seguimiento institucional de faltas y asistencia por grupo.",
    },
    {
      key: "docentes",
      titulo: "Reporte de desempeño docente",
      descripcion:
        "Análisis de carga académica y resultados por maestro.",
    },
    {
      key: "grupos",
      titulo: "Reporte por grupo",
      descripcion:
        "Resumen de resultados, asistencia y observaciones por grupo.",
    },
  ];

  const generarReporte = async (tipo: string) => {
    try {
      setLoading(tipo);

      const token = localStorage.getItem("token");

      const res = await fetch(
        `http://127.0.0.1:4000/api/director/reportes/${tipo}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (!res.ok) {
        throw new Error("Error generando reporte");
      }

      // 🔥 DESCARGA AUTOMÁTICA (PDF o JSON)
      const blob = await res.blob();
      const url = window.URL.createObjectURL(blob);

      const a = document.createElement("a");
      a.href = url;
      a.download = `reporte-${tipo}.pdf`;
      a.click();

      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error(error);
      alert("Error al generar reporte");
    } finally {
      setLoading(null);
    }
  };

  return (
    <div className="space-y-6">
      {/* HEADER */}
      <section className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
        <h1 className="text-3xl font-bold text-gray-800">Reportes</h1>
        <p className="mt-2 text-gray-600">
          Reportes estratégicos para la toma de decisiones académicas.
        </p>
      </section>

      {/* REPORTES */}
      <section className="grid grid-cols-1 gap-4 md:grid-cols-2">
        {reportes.map((reporte) => (
          <div
            key={reporte.key}
            className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm"
          >
            <h2 className="text-xl font-semibold text-gray-800">
              {reporte.titulo}
            </h2>

            <p className="mt-2 text-gray-600">
              {reporte.descripcion}
            </p>

            <button
              onClick={() => generarReporte(reporte.key)}
              disabled={loading === reporte.key}
              className="mt-4 rounded-xl bg-slate-900 px-4 py-2 text-sm font-medium text-white hover:bg-slate-800 disabled:opacity-50"
            >
              {loading === reporte.key
                ? "Generando..."
                : "Generar reporte"}
            </button>
          </div>
        ))}
      </section>
    </div>
  );
}