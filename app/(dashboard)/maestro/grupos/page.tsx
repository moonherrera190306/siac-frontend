"use client";

import { useEffect, useState } from "react";

export default function MaestroGruposPage() {
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
        // 🔥 GRUPOS DEL MAESTRO
        const res = await fetch(
          "http://localhost:4000/api/docentes/grupos",
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        const gruposData = await res.json();

        // 🔥 TRAER INFO COMPLETA DE CADA GRUPO
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
              materias: grupoCompleto.materias || [],
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
      <section className="rounded-2xl bg-white border p-6 shadow-sm">
        <h1 className="text-3xl font-bold">
          Mis grupos
        </h1>
        <p className="text-gray-500">
          Consulta tus grupos asignados
        </p>
      </section>

      {/* GRUPOS */}
      <section className="grid md:grid-cols-3 gap-4">
        {grupos.map((grupo) => (
          <div
            key={grupo.id}
            className="rounded-2xl border bg-white p-5 shadow-sm"
          >
            <h2 className="text-xl font-semibold">
              Grupo {grupo.nombre}
            </h2>

            {/* 🔥 MATERIAS */}
            <p className="mt-2 text-gray-600">
              Materias:
            </p>

            <ul className="text-sm text-gray-600">
              {grupo.materias.map((m: any) => (
                <li key={m.id}>• {m.nombre}</li>
              ))}
            </ul>

            {/* 🔥 ALUMNOS */}
            <p className="mt-2 text-gray-600">
              Alumnos: {grupo.alumnos}
            </p>

            {/* 🔥 BOTÓN */}
            <button
              onClick={() =>
                alert(`Grupo ${grupo.nombre}`)
              }
              className="mt-4 rounded-xl bg-slate-900 px-4 py-2 text-sm text-white hover:bg-slate-800"
            >
              Ver alumnos
            </button>
          </div>
        ))}
      </section>
    </div>
  );
}