"use client";

import { useEffect, useState } from "react";

export default function AdministradorMaestrosPage() {
  const [maestros, setMaestros] = useState<any[]>([]);
  const [search, setSearch] = useState("");
  const [especialidadFiltro, setEspecialidadFiltro] = useState("");
  const [loading, setLoading] = useState(true);

  const token =
    typeof window !== "undefined"
      ? localStorage.getItem("token")
      : null;

  useEffect(() => {
    if (!token) {
      window.location.href = "/login";
      return;
    }

    const fetchData = async () => {
      try {
        // 🔥 TRAER DOCENTES
        const res = await fetch(
          "http://localhost:4000/api/docentes",
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        const docentes = await res.json();

        // 🔥 TRAER MATERIAS PARA CONTAR GRUPOS
        const resMaterias = await fetch(
          "http://localhost:4000/api/materias",
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        const materias = await resMaterias.json();

        // 🔥 ARMAR DATA
        const data = docentes.map((d: any) => {
          const materiasDocente = materias.filter(
            (m: any) => m.docenteId === d.id
          );

          return {
            id: d.id,
            nombre: d.user?.name,
            especialidad:
              materiasDocente[0]?.nombre || "Sin asignar",
            grupos: materiasDocente.length,
            estado: d.user?.activo ? "Activo" : "Inactivo",
          };
        });

        setMaestros(data);

      } catch (error) {
        console.error(error);
        alert("Error cargando maestros");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  // 🔍 FILTROS
  const maestrosFiltrados = maestros.filter((m) => {
    return (
      m.nombre.toLowerCase().includes(search.toLowerCase()) &&
      (especialidadFiltro === "" ||
        m.especialidad === especialidadFiltro)
    );
  });

  const especialidadesUnicas = [
    ...new Set(maestros.map((m) => m.especialidad)),
  ];

  if (loading) return <p className="p-6">Cargando...</p>;

  return (
    <div className="space-y-6">

      {/* HEADER */}
      <section className="flex flex-col gap-4 rounded-2xl border bg-white p-6 shadow-sm md:flex-row md:justify-between">
        <div>
          <h1 className="text-3xl font-bold">Maestros</h1>
          <p className="text-gray-500">
            Gestión de docentes y asignaciones
          </p>
        </div>

        <button
          onClick={() => alert("Crear maestro")}
          className="bg-slate-900 text-white px-4 py-2 rounded-xl"
        >
          Nuevo maestro
        </button>
      </section>

      {/* FILTROS */}
      <section className="bg-white p-6 rounded-2xl shadow-sm">
        <div className="flex flex-col md:flex-row gap-3 md:justify-between">

          <input
            type="text"
            placeholder="Buscar maestro..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="border px-4 py-2 rounded-xl"
          />

          <select
            value={especialidadFiltro}
            onChange={(e) =>
              setEspecialidadFiltro(e.target.value)
            }
            className="border px-4 py-2 rounded-xl"
          >
            <option value="">Todas las especialidades</option>
            {especialidadesUnicas.map((e) => (
              <option key={e}>{e}</option>
            ))}
          </select>

        </div>

        {/* TABLA */}
        <div className="overflow-x-auto mt-6">
          <table className="w-full text-left">
            <thead>
              <tr className="border-b text-gray-500">
                <th className="py-3">Nombre</th>
                <th>Especialidad</th>
                <th>Grupos</th>
                <th>Estado</th>
                <th>Acciones</th>
              </tr>
            </thead>

            <tbody>
              {maestrosFiltrados.map((m) => (
                <tr key={m.id} className="border-b">

                  <td className="py-4 font-medium">
                    {m.nombre}
                  </td>

                  <td>{m.especialidad}</td>

                  <td>{m.grupos}</td>

                  <td>
                    <span
                      className={`px-3 py-1 rounded-full text-sm ${
                        m.estado === "Activo"
                          ? "bg-green-100 text-green-700"
                          : "bg-red-100 text-red-700"
                      }`}
                    >
                      {m.estado}
                    </span>
                  </td>

                  <td>
                    <div className="flex gap-2">
                      <button
                        onClick={() =>
                          alert(JSON.stringify(m, null, 2))
                        }
                        className="bg-gray-100 px-3 py-1 rounded"
                      >
                        Ver
                      </button>

                      <button
                        onClick={() =>
                          alert("Editar maestro")
                        }
                        className="bg-gray-100 px-3 py-1 rounded"
                      >
                        Editar
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