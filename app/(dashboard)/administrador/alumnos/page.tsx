"use client";

import { useEffect, useState } from "react";

export default function AdministradorAlumnosPage() {
  const [alumnos, setAlumnos] = useState<any[]>([]);
  const [search, setSearch] = useState("");
  const [grupoFiltro, setGrupoFiltro] = useState("");

  const token =
    typeof window !== "undefined"
      ? localStorage.getItem("token")
      : null;

  // 🔥 TRAER ALUMNOS
  useEffect(() => {
    if (!token) {
      window.location.href = "/login";
      return;
    }

    fetch("http://localhost:4000/api/alumnos", {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })
      .then((res) => res.json())
      .then(setAlumnos)
      .catch(() => alert("Error cargando alumnos"));
  }, []);

  // 🔍 FILTROS
  const alumnosFiltrados = alumnos.filter((a) => {
    const nombre = a.user?.name.toLowerCase() || "";
    const grupo = a.grupo?.nombre || "";

    return (
      nombre.includes(search.toLowerCase()) &&
      (grupoFiltro === "" || grupo === grupoFiltro)
    );
  });

  // 📊 OBTENER GRUPOS ÚNICOS
  const gruposUnicos = [
    ...new Set(alumnos.map((a) => a.grupo?.nombre).filter(Boolean)),
  ];

  return (
    <div className="space-y-6">

      {/* HEADER */}
      <section className="flex flex-col gap-4 rounded-2xl border bg-white p-6 shadow-sm md:flex-row md:justify-between">
        <div>
          <h1 className="text-3xl font-bold">Alumnos</h1>
          <p className="text-gray-500">
            Gestión del padrón de alumnos
          </p>
        </div>

        <button
          onClick={() => alert("Abrir modal crear alumno")}
          className="rounded-xl bg-slate-900 px-4 py-2 text-white"
        >
          Nuevo alumno
        </button>
      </section>

      {/* FILTROS */}
      <section className="bg-white p-6 rounded-2xl shadow-sm">
        <div className="flex flex-col md:flex-row gap-3 md:justify-between">

          <input
            type="text"
            placeholder="Buscar alumno..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="border px-4 py-2 rounded-xl"
          />

          <select
            value={grupoFiltro}
            onChange={(e) => setGrupoFiltro(e.target.value)}
            className="border px-4 py-2 rounded-xl"
          >
            <option value="">Todos los grupos</option>
            {gruposUnicos.map((g) => (
              <option key={g}>{g}</option>
            ))}
          </select>

        </div>

        {/* TABLA */}
        <div className="overflow-x-auto mt-6">
          <table className="w-full text-left">
            <thead>
              <tr className="border-b text-gray-500">
                <th className="py-3">Nombre</th>
                <th>Grupo</th>
                <th>Matrícula</th>
                <th>Estado</th>
                <th>Acciones</th>
              </tr>
            </thead>

            <tbody>
              {alumnosFiltrados.map((a) => (
                <tr key={a.id} className="border-b">

                  <td className="py-4 font-medium">
                    {a.user?.name}
                  </td>

                  <td>
                    {a.grupo?.nombre || "Sin grupo"}
                  </td>

                  <td>{a.matricula}</td>

                  <td>
                    <span
                      className={`px-3 py-1 rounded-full text-sm ${
                        a.user?.activo
                          ? "bg-green-100 text-green-700"
                          : "bg-red-100 text-red-700"
                      }`}
                    >
                      {a.user?.activo ? "Activo" : "Baja"}
                    </span>
                  </td>

                  <td>
                    <div className="flex gap-2">

                      <button
                        onClick={() =>
                          alert(JSON.stringify(a, null, 2))
                        }
                        className="bg-gray-100 px-3 py-1 rounded"
                      >
                        Ver
                      </button>

                      <button
                        onClick={() =>
                          alert("Editar alumno")
                        }
                        className="bg-gray-100 px-3 py-1 rounded"
                      >
                        Editar
                      </button>

                      <button
                        onClick={() =>
                          alert("Dar de baja")
                        }
                        className="bg-red-50 text-red-600 px-3 py-1 rounded"
                      >
                        Baja
                      </button>

                    </div>
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