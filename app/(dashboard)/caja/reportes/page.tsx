"use client";

import { useState } from "react";

type Reporte = {
  key: string;
  titulo: string;
  descripcion: string;
};

export default function CajaReportesPage() {
  const [loading, setLoading] = useState("");
  const [resultado, setResultado] = useState<any>(null);
  const [error, setError] = useState("");

  async function generar(tipo: string) {
    try {
      setLoading(tipo);
      setError("");
      setResultado(null);

      const token = localStorage.getItem("token");

      const res = await fetch(
        `http://localhost:4000/api/reportes/${tipo}`,
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const response = await res.json();

      if (!res.ok) {
        throw new Error(
          response?.message ||
            "Error generando reporte"
        );
      }

      const data = response?.data || response;

      setResultado(data);

      alert(
        `Reporte ${tipo} generado correctamente`
      );

      console.log("REPORTE:", data);
    } catch (err: any) {
      console.error(err);

      setError(
        err?.message ||
          "Error al generar reporte"
      );
    } finally {
      setLoading("");
    }
  }

  const reportes: Reporte[] = [
    {
      key: "pagos",
      titulo: "Reporte diario de caja",
      descripcion:
        "Resumen de ingresos y pagos registrados.",
    },

    {
      key: "pendientes",
      titulo: "Reporte de pagos pendientes",
      descripcion:
        "Consulta alumnos con adeudos activos.",
    },

    {
      key: "recibos",
      titulo: "Reporte de recibos emitidos",
      descripcion:
        "Historial de recibos generados.",
    },

    {
      key: "metodos",
      titulo: "Reporte por método de pago",
      descripcion:
        "Distribución de pagos registrados.",
    },
  ];

  return (
    <div className="space-y-6 p-6">
      <section className="rounded-2xl bg-white p-6 shadow">
        <h1 className="text-3xl font-bold">
          Reportes
        </h1>

        <p className="text-gray-500">
          Genera reportes del módulo de caja
        </p>
      </section>

      {error && (
        <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-red-700">
          {error}
        </div>
      )}

      <section className="grid gap-4 md:grid-cols-2">
        {(reportes ?? []).map((r) => (
          <div
            key={r.key}
            className="rounded-2xl bg-white p-6 shadow"
          >
            <h2 className="text-xl font-semibold">
              {r.titulo}
            </h2>

            <p className="mt-2 text-gray-500">
              {r.descripcion}
            </p>

            <button
              onClick={() => generar(r.key)}
              disabled={loading === r.key}
              className="mt-4 rounded-xl bg-slate-900 px-4 py-2 text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {loading === r.key
                ? "Generando..."
                : "Generar reporte"}
            </button>
          </div>
        ))}
      </section>

      {resultado && (
        <section className="rounded-2xl bg-white p-6 shadow">
          <h2 className="mb-4 text-2xl font-bold">
            Resultado del reporte
          </h2>

          <div className="overflow-auto rounded-xl bg-slate-950 p-4 text-sm text-green-400">
            <pre>
              {JSON.stringify(
                resultado,
                null,
                2
              )}
            </pre>
          </div>
        </section>
      )}
    </div>
  );
}