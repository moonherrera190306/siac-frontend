"use client";

import { useEffect, useState } from "react";
import { apiFetch } from "@/lib/apiClient";

interface Materia {
  id: string;
  nombre: string;
  docente: string;
  promedio: number | string;
  estatus: string;
}

export default function DirectorMateriasPage() {
  const [materias, setMaterias] = useState<Materia[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchMaterias = async () => {
      try {
        setLoading(true);
        setError(null);

        // ✅ apiFetch ya manda token automáticamente
        const response = await apiFetch("/api/director/materias");

        console.log("MATERIAS RESPONSE:", response);

        // ✅ Blindaje de arrays
        const materiasSeguras = Array.isArray(response?.data)
          ? response.data
          : [];

        setMaterias(materiasSeguras);
      } catch (err: any) {
        console.error("ERROR MATERIAS:", err);

        setError(
          err?.message || "No se pudo cargar la información"
        );

        // ✅ Evita undefined
        setMaterias([]);
      } finally {
        setLoading(false);
      }
    };

    fetchMaterias();
  }, []);

  // 🔄 LOADING
  if (loading) {
    return (
      <div className="p-6">
        <p className="text-gray-600">
          Cargando materias...
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
            Error cargando materias
          </p>

          <p className="mt-1 text-sm text-red-500">
            {error}
          </p>
        </div>
      </div>
    );
  }

  // 📭 EMPTY STATE
  if (materias.length === 0) {
    return (
      <div className="space-y-6">
        <section className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
          <h1 className="text-3xl font-bold text-gray-800">
            Materias
          </h1>

          <p className="mt-2 text-gray-600">
            Consulta el comportamiento académico por materia.
          </p>
        </section>

        <section className="rounded-2xl border border-gray-200 bg-white p-10 text-center shadow-sm">
          <p className="text-gray-500">
            No hay materias registradas.
          </p>
        </section>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* HEADER */}
      <section className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
        <h1 className="text-3xl font-bold text-gray-800">
          Materias
        </h1>

        <p className="mt-2 text-gray-600">
          Consulta el comportamiento académico por materia.
        </p>
      </section>

      {/* TABLA */}
      <section className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[760px] text-left">
            <thead>
              <tr className="border-b border-gray-200 text-sm text-gray-500">
                <th className="py-3 pr-4">Materia</th>
                <th className="py-3 pr-4">Docente</th>
                <th className="py-3 pr-4">Promedio</th>
                <th className="py-3 pr-4">Estatus</th>
                <th className="py-3 pr-4">Acción</th>
              </tr>
            </thead>

            <tbody>
              {(materias ?? []).map((m) => (
                <tr
                  key={m?.id}
                  className="border-b border-gray-100"
                >
                  <td className="py-4 pr-4 font-medium text-gray-800">
                    {m?.nombre ?? "Sin nombre"}
                  </td>

                  <td className="py-4 pr-4 text-gray-600">
                    {m?.docente ?? "Sin docente"}
                  </td>

                  <td className="py-4 pr-4">
                    <span className="rounded-full bg-slate-100 px-3 py-1 text-sm font-semibold text-slate-700">
                      {m?.promedio ?? 0}
                    </span>
                  </td>

                  <td className="py-4 pr-4">
                    <span
                      className={`rounded-full px-3 py-1 text-sm font-medium ${
                        m?.estatus === "Alto"
                          ? "bg-green-100 text-green-700"
                          : m?.estatus === "Estable"
                          ? "bg-blue-100 text-blue-700"
                          : "bg-amber-100 text-amber-700"
                      }`}
                    >
                      {m?.estatus ?? "Sin estatus"}
                    </span>
                  </td>

                  <td className="py-4 pr-4">
                    <button className="rounded-lg bg-slate-100 px-3 py-2 text-sm transition hover:bg-slate-200">
                      Ver detalle
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}