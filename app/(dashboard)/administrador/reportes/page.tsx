"use client";

import { useEffect, useState } from "react";
import { API_URL } from "@/lib/config";

const REPORTES = [
  {
    id: "riesgo",
    titulo: "Alumnos en riesgo",
    detalle: "Reprobadas, promedio bajo o asistencia bajo 80%",
  },
  {
    id: "grupos",
    titulo: "Desempeño por grupo",
    detalle: "Promedio, aprobación y asistencia",
  },
  {
    id: "ingresos",
    titulo: "Ingresos",
    detalle: "Por concepto, sin contar recibos cancelados",
  },
  {
    id: "alumnos",
    titulo: "Padrón de alumnos",
    detalle: "Listado completo con carrera y grupo",
  },
];

// Colores de estado reservados: nunca se usan como serie.
const NIVEL: Record<string, string> = {
  CRITICO: "bg-red-100 text-red-800",
  ALTO: "bg-amber-100 text-amber-800",
  MEDIO: "bg-slate-100 text-slate-700",
};

export default function AdministradorReportesPage() {
  const [activo, setActivo] = useState("riesgo");

  const [filas, setFilas] = useState<any[]>([]);
  const [columnas, setColumnas] = useState<any[]>([]);
  const [meta, setMeta] = useState<any>({});

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const cargar = async (id: string) => {
    try {
      setLoading(true);
      setActivo(id);

      const res = await fetch(`${API_URL}/api/reportes/${id}`, {
        credentials: "include",
      });

      const json = await res.json();

      if (!res.ok) throw new Error(json?.message || "Error al generar");

      setFilas(json?.data ?? []);
      setColumnas(json?.columnas ?? []);
      setMeta(json?.meta ?? {});
      setError("");
    } catch (e: any) {
      setError(e.message || "Error al generar el reporte");
      setFilas([]);
      setColumnas([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    cargar("riesgo");
  }, []);

  const descargar = (formato: "csv" | "pdf") => {
    // El backend devuelve el archivo como descarga directa.
    window.open(`${API_URL}/api/reportes/${activo}?formato=${formato}`, "_blank");
  };

  // Barra de magnitud: un solo tono, la longitud es el dato.
  const barra = (valor: number, maximo: number) => (
    <div className="h-2 w-full rounded-full bg-slate-100">
      <div
        className="h-2 rounded-full bg-blue-600"
        style={{ width: `${maximo > 0 ? (valor / maximo) * 100 : 0}%` }}
      />
    </div>
  );

  const maxPromedio = 10;

  const maxImporte = Math.max(
    ...filas.map((f) => Number(f.importe || 0)),
    0
  );

  return (
    <div className="space-y-6">
      <section className="rounded-2xl border bg-white p-6 shadow-sm">
        <h1 className="text-3xl font-bold">Reportes</h1>
        <p className="text-gray-500">
          Datos del ciclo activo · descargables en PDF para imprimir o en CSV
          para Excel
        </p>
      </section>

      <div className="grid gap-3 md:grid-cols-4">
        {REPORTES.map((r) => (
          <button
            key={r.id}
            onClick={() => cargar(r.id)}
            className={`rounded-2xl border bg-white p-4 text-left shadow-sm transition hover:border-blue-400 ${
              activo === r.id ? "border-blue-500" : ""
            }`}
          >
            <p className="font-semibold">{r.titulo}</p>
            <p className="text-xs text-gray-500">{r.detalle}</p>
          </button>
        ))}
      </div>

      {error && (
        <p className="rounded-xl bg-red-50 p-4 text-red-600">{error}</p>
      )}

      {loading && <p className="text-gray-500">Generando...</p>}

      {!loading && !error && (
        <>
          <section className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border bg-white p-5 shadow-sm">
            <div className="flex flex-wrap gap-6">
              <div>
                <p className="text-sm text-gray-500">Registros</p>
                <p className="text-2xl font-bold">{filas.length}</p>
              </div>

              {meta.total !== undefined && activo === "ingresos" && (
                <div>
                  <p className="text-sm text-gray-500">Total</p>
                  <p className="text-2xl font-bold">
                    ${Number(meta.total).toFixed(2)}
                  </p>
                </div>
              )}

              {meta.recibos !== undefined && (
                <div>
                  <p className="text-sm text-gray-500">Recibos</p>
                  <p className="text-2xl font-bold">{meta.recibos}</p>
                </div>
              )}

              {meta.revisados !== undefined && (
                <div>
                  <p className="text-sm text-gray-500">Alumnos revisados</p>
                  <p className="text-2xl font-bold">{meta.revisados}</p>
                </div>
              )}

              {meta.ciclo && (
                <div>
                  <p className="text-sm text-gray-500">Ciclo</p>
                  <p className="text-2xl font-bold">{meta.ciclo}</p>
                </div>
              )}
            </div>

            <div className="flex gap-2">
              <button
                onClick={() => descargar("pdf")}
                disabled={filas.length === 0}
                className="rounded-xl border border-slate-800 px-5 py-2 text-slate-800 disabled:border-gray-300 disabled:text-gray-400"
              >
                Descargar PDF
              </button>

              <button
                onClick={() => descargar("csv")}
                disabled={filas.length === 0}
                className="rounded-xl bg-slate-800 px-5 py-2 text-white disabled:bg-gray-400"
              >
                Descargar CSV
              </button>
            </div>
          </section>

          {/* Comparación visual: una sola medida, un solo tono. */}
          {activo === "grupos" && filas.length > 0 && (
            <section className="rounded-2xl border bg-white p-5 shadow-sm">
              <h2 className="mb-4 font-semibold">Promedio por grupo</h2>

              <ul className="space-y-3">
                {filas.map((f) => (
                  <li key={f.grupo} className="grid grid-cols-6 items-center gap-3">
                    <span className="col-span-1 text-sm font-medium">
                      {f.grupo}
                    </span>

                    <div className="col-span-4">
                      {barra(Number(f.promedio || 0), maxPromedio)}
                    </div>

                    <span className="col-span-1 text-right text-sm text-slate-600">
                      {f.promedio || "—"}
                    </span>
                  </li>
                ))}
              </ul>
            </section>
          )}

          {activo === "ingresos" && filas.length > 0 && (
            <section className="rounded-2xl border bg-white p-5 shadow-sm">
              <h2 className="mb-4 font-semibold">Ingresos por concepto</h2>

              <ul className="space-y-3">
                {filas.map((f) => (
                  <li
                    key={f.concepto}
                    className="grid grid-cols-6 items-center gap-3"
                  >
                    <span className="col-span-2 text-sm font-medium">
                      {f.concepto}
                    </span>

                    <div className="col-span-3">
                      {barra(Number(f.importe || 0), maxImporte)}
                    </div>

                    <span className="col-span-1 text-right text-sm text-slate-600">
                      ${Number(f.importe).toFixed(2)}
                    </span>
                  </li>
                ))}
              </ul>
            </section>
          )}

          {filas.length === 0 ? (
            <div className="rounded-2xl border bg-white p-8 text-center text-gray-500">
              {activo === "riesgo"
                ? "Ningún alumno cumple criterios de riesgo. Buena noticia."
                : "No hay datos para este reporte todavía."}
            </div>
          ) : (
            <div className="overflow-x-auto rounded-2xl border bg-white shadow-sm">
              <table className="w-full text-left text-sm">
                <thead className="bg-gray-50 text-gray-600">
                  <tr>
                    {columnas.map((c) => (
                      <th key={c.id} className="px-4 py-3">
                        {c.label}
                      </th>
                    ))}
                  </tr>
                </thead>

                <tbody>
                  {filas.map((f, i) => (
                    <tr key={i} className="border-t">
                      {columnas.map((c) => (
                        <td key={c.id} className="px-4 py-2">
                          {c.id === "nivel" ? (
                            <span
                              className={`rounded-full px-2 py-1 text-xs ${
                                NIVEL[f.nivel] || "bg-gray-100 text-gray-600"
                              }`}
                            >
                              {f.nivel}
                            </span>
                          ) : (
                            f[c.id] || "—"
                          )}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </>
      )}
    </div>
  );
}
