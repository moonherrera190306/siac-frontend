"use client";

import { useEffect, useState } from "react";

export default function AdministradorGruposPage() {
  const [grupos, setGrupos] = useState<any[]>([]);
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

    const fetchGrupos = async () => {
      try {
        // 🔥 TRAER GRUPOS
        const res = await fetch(
          "http://localhost:4000/api/grupos",
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        const gruposData = await res.json();

        // 🔥 TRAER DETALLE DE CADA GRUPO
        const gruposCompletos = await Promise.all(
          gruposData.map(async (g: any) => {
            const resGrupo = await fetch(
              `http://localhost:4000/api/grupos/${g.id}`,
              {
                headers: {
                  Authorization: `Bearer ${token}`,
                },
              }
            );

            const grupoCompleto = await resGrupo.json();

            return {
              id: g.id,
              nombre: g.nombre,
              alumnos: grupoCompleto.alumnos?.length || 0,
              tutor:
                grupoCompleto.materias?.[0]?.docente?.user?.name ||
                "Sin asignar",
              turno: "Matutino", // puedes mejorar después
            };
          })
        );

        setGrupos(gruposCompletos);

      } catch (error) {
        console.error(error);
        alert("Error cargando grupos");
      } finally {
        setLoading(false);
      }
    };

    fetchGrupos();
  }, []);

  if (loading) return <p className="p-6">Cargando...</p>;

  return (
    <div className="space-y-6">

      {/* HEADER */}
      <section className="flex flex-col gap-4 rounded-2xl border bg-white p-6 shadow-sm md:flex-row md:justify-between">
        <div>
          <h1 className="text-3xl font-bold">Grupos</h1>
          <p className="text-gray-500">
            Organización académica
          </p>
        </div>

        <button
          onClick={() => alert("Crear grupo")}
          className="bg-slate-900 text-white px-4 py-2 rounded-xl"
        >
          Nuevo grupo
        </button>
      </section>

      {/* CARDS */}
      <section className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
        {grupos.map((grupo) => (
          <div
            key={grupo.id}
            className="bg-white p-5 rounded-2xl border shadow-sm"
          >
            <h2 className="text-xl font-semibold">
              Grupo {grupo.nombre}
            </h2>

            <p className="mt-2 text-gray-600">
              Alumnos: {grupo.alumnos}
            </p>

            <p className="text-gray-600">
              Tutor: {grupo.tutor}
            </p>

            <p className="text-gray-600">
              Turno: {grupo.turno}
            </p>

            <button
              onClick={() =>
                alert(`Grupo ${grupo.nombre}`)
              }
              className="mt-4 bg-slate-900 text-white px-4 py-2 rounded-xl"
            >
              Ver detalle
            </button>
          </div>
        ))}
      </section>
    </div>
  );
}