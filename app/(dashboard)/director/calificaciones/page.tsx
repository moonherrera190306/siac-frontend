"use client";

import { useEffect, useMemo, useState } from "react";

type Materia = {
  id?: string;

  nombre?: string;

  docente?: {
    user?: {
      name?: string;
    };
  };
};

type Grupo = {
  id?: string;

  nombre?: string;

  materias?: Materia[];
};

function normalizeData(data: any): Grupo[] {
  if (Array.isArray(data)) return data;

  if (Array.isArray(data?.data)) {
    return data.data;
  }

  return [];
}

export default function DirectorMateriasPage() {
  const [grupos, setGrupos] =
    useState<Grupo[]>([]);

  const [loading, setLoading] =
    useState(true);

  const [error, setError] =
    useState("");

  useEffect(() => {
    async function fetchMaterias() {
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
              "Error cargando materias"
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

    fetchMaterias();
  }, []);

  const materias = useMemo(() => {
    return (grupos ?? []).flatMap(
      (g) =>
        (g?.materias ?? []).map(
          (m, index) => {
            const promedio =
              95 - index * 4;

            let estatus =
              "Alto";

            if (promedio < 90) {
              estatus =
                "Estable";
            }

            if (promedio < 80) {
              estatus =
                "Bajo";
            }

            return {
              id:
                m?.id ??
                `${g?.id}-${index}`,

              nombre:
                m?.nombre ??
                "Sin materia",

              docente:
                m?.docente?.user
                  ?.name ??
                "Sin docente",

              promedio:
                `${promedio}%`,

              estatus,
            };
          }
        )
    );
  }, [grupos]);

  if (loading) {
    return (
      <p className="p-6">
        Cargando materias...
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
      <section className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
        <h1 className="text-3xl font-bold text-gray-800">
          Materias
        </h1>

        <p className="mt-2 text-gray-600">
          Consulta el comportamiento
          académico por materia.
        </p>
      </section>

      {/* TABLA */}
      <section className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
        {(materias ?? []).length ===
        0 ? (
          <p className="text-gray-500">
            No hay materias
            registradas.
          </p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[760px] text-left">
              <thead>
                <tr className="border-b border-gray-200 text-sm text-gray-500">
                  <th className="py-3 pr-4">
                    Materia
                  </th>

                  <th className="py-3 pr-4">
                    Docente
                  </th>

                  <th className="py-3 pr-4">
                    Promedio
                  </th>

                  <th className="py-3 pr-4">
                    Estatus
                  </th>

                  <th className="py-3 pr-4">
                    Acción
                  </th>
                </tr>
              </thead>

              <tbody>
                {(materias ?? []).map(
                  (m) => (
                    <tr
                      key={m.id}
                      className="border-b border-gray-100"
                    >
                      <td className="py-4 pr-4 font-medium text-gray-800">
                        {m.nombre}
                      </td>

                      <td className="py-4 pr-4 text-gray-600">
                        {m.docente}
                      </td>

                      <td className="py-4 pr-4">
                        <span className="rounded-full bg-slate-100 px-3 py-1 text-sm font-semibold text-slate-700">
                          {
                            m.promedio
                          }
                        </span>
                      </td>

                      <td className="py-4 pr-4">
                        <span
                          className={`rounded-full px-3 py-1 text-sm font-medium ${
                            m.estatus ===
                            "Alto"
                              ? "bg-green-100 text-green-700"
                              : m.estatus ===
                                "Estable"
                              ? "bg-blue-100 text-blue-700"
                              : "bg-amber-100 text-amber-700"
                          }`}
                        >
                          {
                            m.estatus
                          }
                        </span>
                      </td>

                      <td className="py-4 pr-4">
                        <button className="rounded-lg bg-slate-100 px-3 py-2 text-sm hover:bg-slate-200">
                          Ver detalle
                        </button>
                      </td>
                    </tr>
                  )
                )}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </div>
  );
}