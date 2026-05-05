"use client";

import { useEffect, useState } from "react";

export default function MaestroMateriasPage() {
  const [materias, setMaterias] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchMaterias = async () => {
    try {
      const token = localStorage.getItem("token");

      const res = await fetch(
        "http://127.0.0.1:4000/api/maestro/materias",
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const json = await res.json();

      if (!res.ok) throw new Error(json.message);

      setMaterias(json.data);
    } catch (err: any) {
      console.error(err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMaterias();
  }, []);

  if (loading) return <p className="p-6">Cargando materias...</p>;

  if (error)
    return <p className="p-6 text-red-500">Error: {error}</p>;

  return (
    <div className="space-y-6">
      {/* HEADER */}
      <section className="rounded-2xl bg-white border p-6 shadow-sm">
        <h1 className="text-3xl font-bold">
          Mis materias
        </h1>
        <p className="text-gray-600">
          Materias asignadas en el periodo actual
        </p>
      </section>

      {/* GRID */}
      <section className="grid md:grid-cols-2 gap-4">
        {materias.map((m) => (
          <div
            key={m.id}
            className="bg-white p-6 rounded-2xl shadow border"
          >
            <h2 className="text-xl font-semibold">
              {m.nombre}
            </h2>

            <p className="mt-3 text-gray-600">
              Grupos: {m.grupos.join(", ")}
            </p>

            <p className="text-gray-600">
              Total alumnos: {m.alumnos}
            </p>

            <p className="text-gray-600">
              Aula: {m.aula}
            </p>
          </div>
        ))}
      </section>
    </div>
  );
}