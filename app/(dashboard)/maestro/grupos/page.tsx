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
        const res = await fetch(
          "http://localhost:4000/api/docentes/grupos",
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        const response = await res.json();

        if (!res.ok) {
          throw new Error(
            response.message ||
              "Error cargando grupos"
          );
        }

        setGrupos(response.data || []);

      } catch (error) {
        console.error(error);

        alert("Error cargando grupos");
      } finally {
        setLoading(false);
      }
    };

    fetchGrupos();
  }, []);

  if (loading) {
    return (
      <p className="p-6">
        Cargando...
      </p>
    );
  }

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

        {(grupos ?? []).map((grupo) => (
          <div
            key={grupo.id}
            className="rounded-2xl border bg-white p-5 shadow-sm"
          >
            <h2 className="text-xl font-semibold">
              Grupo {grupo.nombre}
            </h2>

            <p className="mt-3 text-gray-600">
              Total alumnos:
              {" "}
              {grupo.totalAlumnos ?? 0}
            </p>

            <button
              onClick={() =>
                alert(
                  `Grupo ${grupo.nombre}`
                )
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