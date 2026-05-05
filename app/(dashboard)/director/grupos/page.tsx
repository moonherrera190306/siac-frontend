"use client";

import { useEffect, useState } from "react";

export default function DirectorMaestrosPage() {
  const [maestros, setMaestros] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchMaestros = async () => {
      try {
        const token = localStorage.getItem("token");

        const res = await fetch(
          "http://127.0.0.1:4000/api/director/maestros",
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

        setMaestros(json.data);
      } catch (err: any) {
        console.error(err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchMaestros();
  }, []);

  if (loading) return <p className="p-6">Cargando maestros...</p>;

  if (error)
    return <p className="p-6 text-red-500">Error: {error}</p>;

  return (
    <div className="space-y-6">
      {/* HEADER */}
      <section className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
        <h1 className="text-3xl font-bold text-gray-800">Maestros</h1>
        <p className="mt-2 text-gray-600">
          Consulta el desempeño y carga académica docente.
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
              {maestros.map((m) => (
                <tr key={m.id} className="border-b border-gray-100">
                  <td className="py-4 pr-4 font-medium text-gray-800">
                    {m.nombre}
                  </td>

                  <td className="py-4 pr-4 text-gray-600">
                    {m.materia}
                  </td>

                  <td className="py-4 pr-4 text-gray-600">
                    {m.grupos}
                  </td>

                  <td className="py-4 pr-4">
                    <span
                      className={`rounded-full px-3 py-1 text-sm font-medium ${
                        m.desempeño === "Alto"
                          ? "bg-green-100 text-green-700"
                          : m.desempeño === "Bueno"
                          ? "bg-blue-100 text-blue-700"
                          : "bg-amber-100 text-amber-700"
                      }`}
                    >
                      {m.desempeño}
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