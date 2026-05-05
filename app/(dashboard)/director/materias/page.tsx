"use client";

import { useEffect, useState } from "react";

export default function DirectorMateriasPage() {
  const [materias, setMaterias] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchMaterias = async () => {
      try {
        const token = localStorage.getItem("token");

        if (!token) {
          throw new Error("No hay sesión activa");
        }

        const res = await fetch(
          "http://127.0.0.1:4000/api/director/materias",
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

        setMaterias(json.data);
      } catch (err: any) {
        console.error("ERROR:", err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchMaterias();
  }, []);

  // 🔄 LOADING
  if (loading) {
    return <p className="p-6">Cargando materias...</p>;
  }

  // ❌ ERROR
  if (error) {
    return (
      <p className="p-6 text-red-500">
        Error cargando materias: {error}
      </p>
    );
  }

  return (
    <div className="space-y-6">
      {/* HEADER */}
      <section className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
        <h1 className="text-3xl font-bold text-gray-800">Materias</h1>
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
              {materias.map((m) => (
                <tr key={m.id} className="border-b border-gray-100">
                  <td className="py-4 pr-4 font-medium text-gray-800">
                    {m.nombre}
                  </td>

                  <td className="py-4 pr-4 text-gray-600">
                    {m.docente}
                  </td>

                  <td className="py-4 pr-4">
                    <span className="rounded-full bg-slate-100 px-3 py-1 text-sm font-semibold text-slate-700">
                      {m.promedio}
                    </span>
                  </td>

                  <td className="py-4 pr-4">
                    <span
                      className={`rounded-full px-3 py-1 text-sm font-medium ${
                        m.estatus === "Alto"
                          ? "bg-green-100 text-green-700"
                          : m.estatus === "Estable"
                          ? "bg-blue-100 text-blue-700"
                          : "bg-amber-100 text-amber-700"
                      }`}
                    >
                      {m.estatus}
                    </span>
                  </td>

                  <td className="py-4 pr-4">
                    <button className="rounded-lg bg-slate-100 px-3 py-2 text-sm hover:bg-slate-200">
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