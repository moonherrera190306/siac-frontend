"use client";

import { useEffect, useState } from "react";

export default function SecretariaHorariosPage() {
  const [horarios, setHorarios] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchHorarios = async () => {
    try {
      const token = localStorage.getItem("token");

      const res = await fetch(
        "http://127.0.0.1:4000/api/horarios",
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const json = await res.json();

      if (!res.ok) throw new Error(json.message);

      setHorarios(json.data);
    } catch (err: any) {
      console.error(err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchHorarios();
  }, []);

  if (loading) return <p className="p-6">Cargando horarios...</p>;

  if (error)
    return <p className="p-6 text-red-500">Error: {error}</p>;

  return (
    <div className="space-y-6">
      {/* HEADER */}
      <section className="rounded-2xl border bg-white p-6 shadow-sm">
        <h1 className="text-3xl font-bold">Horarios</h1>
        <p className="text-gray-600">
          Organización horaria institucional
        </p>
      </section>

      {/* TABLA */}
      <section className="bg-white rounded-2xl p-6 shadow">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b text-gray-500">
              <th>Grupo</th>
              <th>Turno</th>
              <th>Horario</th>
              <th>Aula</th>
              <th className="text-right">Acciones</th>
            </tr>
          </thead>

          <tbody>
            {horarios.map((h) => (
              <tr key={h.id} className="border-b">
                <td>{h.grupo}</td>
                <td>{h.turno}</td>
                <td>{h.horario}</td>
                <td>{h.aula}</td>

                <td className="text-right">
                  <button className="bg-slate-100 px-3 py-1 rounded hover:bg-slate-200">
                    Editar
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>
    </div>
  );
}