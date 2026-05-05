"use client";

import { useEffect, useState } from "react";

export default function SecretariaGruposPage() {
  const [grupos, setGrupos] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchGrupos = async () => {
    try {
      const token = localStorage.getItem("token");

      const res = await fetch(
        "http://127.0.0.1:4000/api/grupos",
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const json = await res.json();

      if (!res.ok) throw new Error(json.message);

      setGrupos(json.data);
    } catch (err: any) {
      console.error(err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchGrupos();
  }, []);

  if (loading) return <p className="p-6">Cargando grupos...</p>;

  if (error)
    return <p className="p-6 text-red-500">Error: {error}</p>;

  return (
    <div className="space-y-6">
      {/* HEADER */}
      <section className="rounded-2xl border bg-white p-6 shadow-sm">
        <h1 className="text-3xl font-bold">Grupos</h1>
        <p className="text-gray-600">
          Organización académica institucional
        </p>
      </section>

      {/* GRID */}
      <section className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
        {grupos.map((g) => (
          <div
            key={g.id}
            className="bg-white p-5 rounded-2xl shadow border"
          >
            <h2 className="text-xl font-semibold">
              Grupo {g.nombre}
            </h2>

            <p className="mt-2 text-gray-600">
              Nivel: {g.nivel}
            </p>

            <p className="text-gray-600">
              Alumnos: {g.alumnos}
            </p>

            <p className="text-gray-600">
              Tutor: {g.tutor}
            </p>

            <button className="mt-4 bg-slate-900 text-white px-4 py-2 rounded-xl hover:bg-slate-800">
              Ver detalle
            </button>
          </div>
        ))}
      </section>
    </div>
  );
}