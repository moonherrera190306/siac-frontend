"use client";

import { useEffect, useState } from "react";

export default function DirectorAlumnosPage() {
  const [alumnos, setAlumnos] = useState<any[]>([]);
  const [search, setSearch] = useState("");
  const [grupo, setGrupo] = useState("");

  useEffect(() => {
    const fetchAlumnos = async () => {
      const token = localStorage.getItem("token");

      const res = await fetch(
        "http://localhost:4000/api/director/alumnos",
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const data = await res.json();

      if (Array.isArray(data)) {
        setAlumnos(data);
      }
    };

    fetchAlumnos();
  }, []);

  // 🔍 filtros
  const filtrados = alumnos.filter((a) => {
    const coincideTexto = a.nombre
      .toLowerCase()
      .includes(search.toLowerCase());

    const coincideGrupo = grupo ? a.grupo === grupo : true;

    return coincideTexto && coincideGrupo;
  });

  // 🔥 grupos dinámicos
  const grupos = [...new Set(alumnos.map((a) => a.grupo))];

  return (
    <div className="space-y-6">

      <section className="bg-white p-6 rounded-2xl shadow">
        <h1 className="text-3xl font-bold">Alumnos</h1>
        <p className="text-gray-500">
          Desempeño general del alumnado
        </p>
      </section>

      <section className="bg-white p-6 rounded-2xl shadow">

        {/* 🔍 FILTROS */}
        <div className="flex flex-col md:flex-row gap-3 mb-4">

          <input
            type="text"
            placeholder="Buscar alumno..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="border p-2 rounded w-full"
          />

          <select
            value={grupo}
            onChange={(e) => setGrupo(e.target.value)}
            className="border p-2 rounded"
          >
            <option value="">Todos los grupos</option>
            {grupos.map((g, i) => (
              <option key={i}>{g}</option>
            ))}
          </select>

        </div>

        {/* 📊 TABLA */}
        <div className="overflow-x-auto">
          <table className="w-full text-left">

            <thead>
              <tr className="border-b text-gray-500">
                <th>Nombre</th>
                <th>Grupo</th>
                <th>Promedio</th>
                <th>Estado</th>
              </tr>
            </thead>

            <tbody>
              {filtrados.map((a) => (
                <tr key={a.id} className="border-b">

                  <td className="font-medium">{a.nombre}</td>

                  <td>{a.grupo}</td>

                  <td>
                    <span className="bg-slate-100 px-3 py-1 rounded-full text-sm font-semibold">
                      {a.promedio}
                    </span>
                  </td>

                  <td>
                    {a.estado === "Activo" ? (
                      <span className="bg-green-100 text-green-700 px-3 py-1 rounded-full text-sm">
                        Activo
                      </span>
                    ) : (
                      <span className="bg-yellow-100 text-yellow-700 px-3 py-1 rounded-full text-sm">
                        Seguimiento
                      </span>
                    )}
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