"use client";

import { useEffect, useState } from "react";

export default function AdministradorMateriasPage() {
  const [materias, setMaterias] = useState<any[]>([]);
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
        // 🔥 TRAER MATERIAS
        const res = await fetch(
          "https://siac-backend-production.up.railway.app/api/materias",
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        const data = await res.json();

        // 🔥 FORMATEAR DATA
        const formateadas = data.map((m: any) => ({
          id: m.id,
          nombre: m.nombre,
          semestre:
            m.grupo?.semestre?.nombre || "Sin semestre",
          docente:
            m.docente?.user?.name || "Sin docente",
          estado: "Activa",
        }));

        setMaterias(formateadas);

      } catch (error) {
        console.error(error);
        alert("Error cargando materias");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  if (loading) return <p className="p-6">Cargando...</p>;

  return (
    <div className="space-y-6">

      {/* HEADER */}
      <section className="flex flex-col gap-4 rounded-2xl border bg-white p-6 shadow-sm md:flex-row md:justify-between">
        <div>
          <h1 className="text-3xl font-bold">
            Materias
          </h1>
          <p className="text-gray-500">
            Catálogo académico
          </p>
        </div>

        <button
          onClick={() => alert("Crear materia")}
          className="bg-slate-900 text-white px-4 py-2 rounded-xl"
        >
          Nueva materia
        </button>
      </section>

      {/* TABLA */}
      <section className="bg-white p-6 rounded-2xl shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left">

            <thead>
              <tr className="border-b text-gray-500">
                <th className="py-3">Materia</th>
                <th>Semestre</th>
                <th>Docente</th>
                <th>Estado</th>
                <th>Acciones</th>
              </tr>
            </thead>

            <tbody>
              {materias.map((m) => (
                <tr key={m.id} className="border-b">

                  <td className="py-4 font-medium">
                    {m.nombre}
                  </td>

                  <td>{m.semestre}</td>

                  <td>{m.docente}</td>

                  <td>
                    <span className="bg-green-100 text-green-700 px-3 py-1 rounded-full text-sm">
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
                          alert("Editar materia")
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