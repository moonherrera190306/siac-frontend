"use client";

import { useEffect, useState } from "react";
import { API_URL } from "@/lib/config";

const COLUMNAS = [
  { id: "primerParcial", label: "PP" },
  { id: "segundoParcial", label: "SP" },
  { id: "promedio", label: "PROM" },
  { id: "examenFinal", label: "EF" },
  { id: "notaFinal", label: "O" },
  { id: "extraordinario", label: "EE" },
  { id: "adicional", label: "EA" },
  { id: "especial", label: "EER" },
  { id: "notaDefinitiva", label: "ND" },
];

const COLOR: Record<string, string> = {
  APROBADA: "bg-green-100 text-green-700",
  REPROBADA: "bg-red-100 text-red-700",
  NO_PRESENTO: "bg-amber-100 text-amber-700",
  EN_CURSO: "bg-gray-100 text-gray-600",
};

export default function AlumnoCalificacionesPage() {
  const [calificaciones, setCalificaciones] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [bloqueado, setBloqueado] = useState("");

  useEffect(() => {
    const cargar = async () => {
      try {
        // El id sale del token, no de la URL.
        const res = await fetch(`${API_URL}/api/calificaciones/alumno/me`, {
          credentials: "include",
        });

        const json = await res.json();

        if (res.status === 403) {
          // Bloqueo por adeudo: no es un error, es una regla.
          setBloqueado(json?.message || "Acceso restringido");
          return;
        }

        if (!res.ok) {
          throw new Error(json?.message || "Error al cargar calificaciones");
        }

        setCalificaciones(json?.data ?? []);
      } catch (e: any) {
        setError(e.message || "Error al cargar calificaciones");
      } finally {
        setLoading(false);
      }
    };

    cargar();
  }, []);

  if (loading) return <p className="p-6">Cargando...</p>;

  if (bloqueado) {
    return (
      <div className="rounded-3xl border bg-white p-8 text-center">
        <h1 className="text-2xl font-bold">Calificaciones no disponibles</h1>
        <p className="mt-2 text-gray-600">{bloqueado}</p>
      </div>
    );
  }

  // Agrupadas por ciclo, como en el kardex oficial.
  const porCiclo = new Map<string, any[]>();

  for (const c of calificaciones) {
    const ciclo = c.cicloEscolar?.nombre || "Sin ciclo";

    if (!porCiclo.has(ciclo)) porCiclo.set(ciclo, []);

    porCiclo.get(ciclo)!.push(c);
  }

  const numericas = calificaciones
    .map((c) => c.notaDefinitiva)
    .filter((n) => n !== null && n !== undefined && !isNaN(Number(n)))
    .map(Number);

  const promedioGeneral =
    numericas.length === 0
      ? null
      : (numericas.reduce((a, b) => a + b, 0) / numericas.length).toFixed(1);

  return (
    <div className="space-y-6">
      <section className="rounded-3xl border bg-white p-6 shadow-sm">
        <h1 className="text-3xl font-bold">Mis calificaciones</h1>

        <p className="text-gray-500">
          {promedioGeneral === null
            ? "Todavía no tienes calificaciones definitivas"
            : `Promedio general: ${promedioGeneral}`}
        </p>
      </section>

      {error && (
        <p className="rounded-xl bg-red-50 p-4 text-red-600">{error}</p>
      )}

      {calificaciones.length === 0 && !error && (
        <div className="rounded-3xl border bg-white p-8 text-center text-gray-500">
          Todavía no hay calificaciones capturadas.
        </div>
      )}

      {Array.from(porCiclo.entries()).map(([ciclo, filas]) => (
        <section
          key={ciclo}
          className="overflow-x-auto rounded-3xl border bg-white shadow-sm"
        >
          <h2 className="border-b px-5 py-4 text-lg font-semibold">{ciclo}</h2>

          <table className="w-full text-left text-sm">
            <thead className="bg-gray-50 text-gray-600">
              <tr>
                <th className="px-3 py-3">Clave</th>
                <th className="px-3 py-3">Materia</th>

                {COLUMNAS.map((c) => (
                  <th key={c.id} className="px-2 py-3 text-center">
                    {c.label}
                  </th>
                ))}

                <th className="px-3 py-3">Estatus</th>
              </tr>
            </thead>

            <tbody>
              {filas.map((c) => (
                <tr key={c.id} className="border-t">
                  <td className="px-3 py-2 text-gray-400">
                    {c.materia?.clave || "—"}
                  </td>

                  <td className="px-3 py-2 font-medium">{c.materia?.nombre}</td>

                  {COLUMNAS.map((col) => (
                    <td
                      key={col.id}
                      className={`px-2 py-2 text-center ${
                        col.id === "notaDefinitiva"
                          ? "font-semibold text-slate-800"
                          : ""
                      }`}
                    >
                      {c[col.id] || "—"}
                    </td>
                  ))}

                  <td className="px-3 py-2">
                    <span
                      className={`rounded-full px-2 py-1 text-xs ${
                        COLOR[c.estatus] || "bg-gray-100 text-gray-600"
                      }`}
                    >
                      {(c.estatus || "").replace("_", " ")}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </section>
      ))}

      {calificaciones.length > 0 && (
        <p className="text-xs text-gray-400">
          PP primer parcial · SP segundo parcial · PROM promedio · EF examen
          final · O ordinario · EE extraordinario · EA adicional · EER especial ·
          ND nota definitiva
        </p>
      )}
    </div>
  );
}
