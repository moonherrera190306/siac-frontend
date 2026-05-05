"use client";

import { useEffect, useState } from "react";

export default function SecretariaInscripcionesPage() {
  const [inscripciones, setInscripciones] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [search, setSearch] = useState("");
  const [estado, setEstado] = useState("Todos");

  const fetchInscripciones = async () => {
    try {
      const token = localStorage.getItem("token");

      const res = await fetch(
        "http://127.0.0.1:4000/api/inscripciones",
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const json = await res.json();

      if (!res.ok) throw new Error(json.message);

      setInscripciones(json.data);
    } catch (err: any) {
      console.error(err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchInscripciones();
  }, []);

  // 🔍 FILTRO
  const filtered = inscripciones.filter((i) => {
    const matchSearch = i.alumno
      .toLowerCase()
      .includes(search.toLowerCase());

    const matchEstado =
      estado === "Todos" || i.estado === estado;

    return matchSearch && matchEstado;
  });

  if (loading) return <p className="p-6">Cargando inscripciones...</p>;

  if (error)
    return <p className="p-6 text-red-500">Error: {error}</p>;

  return (
    <div className="space-y-6">
      {/* HEADER */}
      <section className="flex justify-between items-center bg-white p-6 rounded-2xl shadow">
        <div>
          <h1 className="text-3xl font-bold">Inscripciones</h1>
          <p className="text-gray-600">
            Gestión de registros académicos
          </p>
        </div>

        <button className="bg-slate-900 text-white px-4 py-2 rounded-xl">
          Nueva inscripción
        </button>
      </section>

      {/* FILTROS */}
      <section className="bg-white p-4 rounded-2xl shadow flex gap-3">
        <input
          placeholder="Buscar alumno..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="border px-3 py-2 rounded w-full"
        />

        <select
          value={estado}
          onChange={(e) => setEstado(e.target.value)}
          className="border px-3 py-2 rounded"
        >
          <option>Todos</option>
          <option>Completada</option>
          <option>Pendiente</option>
        </select>
      </section>

      {/* TABLA */}
      <section className="bg-white p-6 rounded-2xl shadow">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b text-gray-500">
              <th>Alumno</th>
              <th>Nivel</th>
              <th>Grupo</th>
              <th>Fecha</th>
              <th>Estado</th>
              <th className="text-right">Acciones</th>
            </tr>
          </thead>

          <tbody>
            {filtered.map((i) => (
              <tr key={i.id} className="border-b">
                <td>{i.alumno}</td>
                <td>{i.nivel}</td>
                <td>{i.grupo}</td>
                <td>{i.fecha}</td>

                <td>
                  <span
                    className={`px-2 py-1 rounded text-xs ${
                      i.estado === "Completada"
                        ? "bg-green-100 text-green-700"
                        : "bg-yellow-100 text-yellow-700"
                    }`}
                  >
                    {i.estado}
                  </span>
                </td>

                <td className="text-right space-x-2">
                  <button className="bg-gray-100 px-3 py-1 rounded">
                    Ver
                  </button>
                  <button className="bg-gray-100 px-3 py-1 rounded">
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