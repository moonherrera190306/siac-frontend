"use client";

import { useEffect, useState } from "react";

type Grupo = {
  id?: string;

  nombre?: string;

  nivel?: string;

  turno?: string;

  alumnos?: any[];

  materias?: any[];
};

function normalizeData(data: any): Grupo[] {
  if (Array.isArray(data)) return data;

  if (Array.isArray(data?.data)) {
    return data.data;
  }

  return [];
}

export default function SecretariaGruposPage() {
  const [grupos, setGrupos] =
    useState<Grupo[]>([]);

  const [loading, setLoading] =
    useState(true);

  const [error, setError] =
    useState("");

  useEffect(() => {
    async function fetchGrupos() {
      try {
        setLoading(true);
        setError("");

        const token =
          localStorage.getItem("token");

        const res = await fetch(
          "http://localhost:4000/api/grupos",
          {
            method: "GET",

            headers: {
              "Content-Type":
                "application/json",

              Authorization: `Bearer ${token}`,
            },
          }
        );

        const response =
          await res.json();

        if (!res.ok) {
          throw new Error(
            response?.message ||
              "Error cargando grupos"
          );
        }

        const data =
          response?.data || response;

        setGrupos(
          normalizeData(data)
        );
      } catch (err: any) {
        console.error(err);

        setError(
          err?.message ||
            "Error interno del servidor"
        );

        setGrupos([]);
      } finally {
        setLoading(false);
      }
    }

    fetchGrupos();
  }, []);

  if (loading) {
    return (
      <p className="p-6">
        Cargando grupos...
      </p>
    );
  }

  if (error) {
    return (
      <div className="p-6">
        <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-red-700">
          Error: {error}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 p-6">
      {/* HEADER */}
      <section className="rounded-2xl border bg-white p-6 shadow-sm">
        <h1 className="text-3xl font-bold">
          Grupos
        </h1>

        <p className="text-gray-600">
          Organización académica
          institucional
        </p>
      </section>

      {/* GRID */}
      {(grupos ?? []).length ===
      0 ? (
        <section className="rounded-2xl bg-white p-6 shadow">
          <p className="text-gray-500">
            No hay grupos registrados.
          </p>
        </section>
      ) : (
        <section className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
          {(grupos ?? []).map(
            (g, index) => (
              <div
                key={g?.id ?? index}
                className="rounded-2xl border bg-white p-5 shadow"
              >
                <h2 className="text-xl font-semibold">
                  Grupo{" "}
                  {g?.nombre ??
                    "Sin nombre"}
                </h2>

                <p className="mt-2 text-gray-600">
                  Nivel:{" "}
                  {g?.nivel ??
                    "No definido"}
                </p>

                <p className="text-gray-600">
                  Turno:{" "}
                  {g?.turno ??
                    "Matutino"}
                </p>

                <p className="text-gray-600">
                  Alumnos:{" "}
                  {g?.alumnos?.length ??
                    0}
                </p>

                <p className="text-gray-600">
                  Materias:{" "}
                  {g?.materias?.length ??
                    0}
                </p>

                <button className="mt-4 rounded-xl bg-slate-900 px-4 py-2 text-white transition hover:bg-slate-800">
                  Ver detalle
                </button>
              </div>
            )
          )}
        </section>
      )}
    </div>
  );
}