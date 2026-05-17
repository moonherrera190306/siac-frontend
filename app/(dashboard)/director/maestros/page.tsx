"use client";

import { useEffect, useState } from "react";
import { apiFetch } from "@/lib/apiClient";

interface Maestro {
  id: string;
  nombre: string;
  materia: string;
  grupos: number | string;
  desempeño: string;
}

export default function DirectorMaestrosPage() {
  const [maestros, setMaestros] = useState<Maestro[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchMaestros = async () => {
      try {
        setLoading(true);
        setError(null);

        // ✅ apiFetch manda token automáticamente
        const response = await apiFetch("/api/director/maestros");

        console.log("MAESTROS RESPONSE:", response);

        // ✅ Blindaje de array
        const maestrosSeguros = Array.isArray(response?.data)
          ? response.data
          : [];

        setMaestros(maestrosSeguros);
      } catch (err: any) {
        console.error("ERROR MAESTROS:", err);

        setError(
          err?.message || "No se pudo cargar la información"
        );

        // ✅ evita undefined
        setMaestros([]);
      } finally {
        setLoading(false);
      }
    };

    fetchMaestros();
  }, []);

  // 🔄 LOADING
  if (loading) {
    return (
      <div className="p-6">
        <p className="text-gray-600">
          Cargando maestros...
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
            Error cargando maestros
          </p>

          <p className="mt-1 text-sm text-red-500">
            {error}
          </p>
        </div>
      </div>
    );
  }

  // 📭 EMPTY STATE
  if (maestros.length === 0) {
    return (
      <div className="space-y-6">
        {/* HEADER */}
        <section className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
          <h1 className="text-3xl font-bold text-gray-800">
            Maestros
          </h1>

          <p className="mt-2 text-gray-600">
            Consulta el desempeño y la carga académica
            del personal docente.
          </p>
        </section>

        {/* EMPTY */}
        <section className="rounded-2xl border border-gray-200 bg-white p-10 text-center shadow-sm">
          <p className="text-gray-500">
            No hay maestros registrados.
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
          Maestros
        </h1>

        <p className="mt-2 text-gray-600">
          Consulta el desempeño y la carga académica del
          personal docente.
        </p>
      </section>

      {/* TABLA */}
      <section className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[760px] text-left">
            <thead>
              <tr className="border-b border-gray-200 text-sm text-gray-500">
                <th className="py-3 pr-4">Nombre</th>
                <th className="py-3 pr-4">Materia</th>
                <th className="py-3 pr-4">Grupos</th>
                <th className="py-3 pr-4">Desempeño</th>
                <th className="py-3 pr-4">Acción</th>
              </tr>
            </thead>

            <tbody>
              {(maestros ?? []).map((m) => (
                <tr
                  key={m?.id}
                  className="border-b border-gray-100"
                >
                  <td className="py-4 pr-4 font-medium text-gray-800">
                    {m?.nombre ?? "Sin nombre"}
                  </td>

                  <td className="py-4 pr-4 text-gray-600">
                    {m?.materia ?? "Sin materia"}
                  </td>

                  <td className="py-4 pr-4 text-gray-600">
                    {m?.grupos ?? 0}
                  </td>

                  <td className="py-4 pr-4">
                    <span
                      className={`rounded-full px-3 py-1 text-sm font-medium ${
                        m?.desempeño === "Alto"
                          ? "bg-green-100 text-green-700"
                          : m?.desempeño === "Bueno"
                          ? "bg-blue-100 text-blue-700"
                          : "bg-amber-100 text-amber-700"
                      }`}
                    >
                      {m?.desempeño ?? "Sin desempeño"}
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