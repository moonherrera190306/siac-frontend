"use client";

import { useEffect, useMemo, useState } from "react";

type Alumno = {
  id?: string;

  matricula?: string;

  createdAt?: string;

  user?: {
    name?: string;
    email?: string;
  };

  grupo?: {
    nombre?: string;
  };
};

function normalizeData(data: any): Alumno[] {
  if (Array.isArray(data)) return data;

  if (Array.isArray(data?.data)) {
    return data.data;
  }

  if (Array.isArray(data?.alumnos)) {
    return data.alumnos;
  }

  if (Array.isArray(data?.data?.alumnos)) {
    return data.data.alumnos;
  }

  return [];
}

export default function SecretariaInscripcionesPage() {
  const [inscripciones, setInscripciones] =
    useState<Alumno[]>([]);

  const [loading, setLoading] =
    useState(true);

  const [error, setError] =
    useState("");

  const [search, setSearch] =
    useState("");

  const [estado, setEstado] =
    useState("Todos");

  useEffect(() => {
    async function fetchInscripciones() {
      try {
        setLoading(true);
        setError("");

        const token =
          localStorage.getItem("token");

        const res = await fetch(
          "http://localhost:4000/api/alumnos",
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
              "Error cargando inscripciones"
          );
        }

        const data =
          response?.data || response;

        setInscripciones(
          normalizeData(data)
        );
      } catch (err: any) {
        console.error(err);

        setError(
          err?.message ||
            "Error interno del servidor"
        );

        setInscripciones([]);
      } finally {
        setLoading(false);
      }
    }

    fetchInscripciones();
  }, []);

  const filtered = useMemo(() => {
    return (inscripciones ?? []).filter(
      (i) => {
        const alumno =
          i?.user?.name?.toLowerCase() ||
          "";

        const matchSearch =
          alumno.includes(
            search.toLowerCase()
          );

        const matchEstado =
          estado === "Todos" ||
          estado === "Completada";

        return (
          matchSearch && matchEstado
        );
      }
    );
  }, [inscripciones, search, estado]);

  if (loading) {
    return (
      <p className="p-6">
        Cargando inscripciones...
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
      <section className="flex items-center justify-between rounded-2xl bg-white p-6 shadow">
        <div>
          <h1 className="text-3xl font-bold">
            Inscripciones
          </h1>

          <p className="text-gray-600">
            Gestión de registros
            académicos
          </p>
        </div>

        <button className="rounded-xl bg-slate-900 px-4 py-2 text-white">
          Nueva inscripción
        </button>
      </section>

      {/* FILTROS */}
      <section className="flex gap-3 rounded-2xl bg-white p-4 shadow">
        <input
          placeholder="Buscar alumno..."
          value={search}
          onChange={(e) =>
            setSearch(e.target.value)
          }
          className="w-full rounded border px-3 py-2"
        />

        <select
          value={estado}
          onChange={(e) =>
            setEstado(e.target.value)
          }
          className="rounded border px-3 py-2"
        >
          <option>Todos</option>
          <option>Completada</option>
        </select>
      </section>

      {/* TABLA */}
      <section className="rounded-2xl bg-white p-6 shadow">
        {(filtered ?? []).length ===
        0 ? (
          <p className="text-gray-500">
            No hay inscripciones
            registradas.
          </p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b text-gray-500">
                  <th className="p-3">
                    Alumno
                  </th>

                  <th className="p-3">
                    Matrícula
                  </th>

                  <th className="p-3">
                    Grupo
                  </th>

                  <th className="p-3">
                    Fecha
                  </th>

                  <th className="p-3">
                    Estado
                  </th>

                  <th className="p-3 text-right">
                    Acciones
                  </th>
                </tr>
              </thead>

              <tbody>
                {(filtered ?? []).map(
                  (i, index) => (
                    <tr
                      key={i?.id ?? index}
                      className="border-b"
                    >
                      <td className="p-3">
                        {i?.user?.name ??
                          "Sin nombre"}
                      </td>

                      <td className="p-3">
                        {i?.matricula ??
                          "-"}
                      </td>

                      <td className="p-3">
                        {i?.grupo
                          ?.nombre ??
                          "Sin grupo"}
                      </td>

                      <td className="p-3">
                        {i?.createdAt
                          ? new Date(
                              i.createdAt
                            ).toLocaleDateString(
                              "es-MX"
                            )
                          : "-"}
                      </td>

                      <td className="p-3">
                        <span className="rounded bg-green-100 px-2 py-1 text-xs text-green-700">
                          Completada
                        </span>
                      </td>

                      <td className="space-x-2 p-3 text-right">
                        <button className="rounded bg-gray-100 px-3 py-1">
                          Ver
                        </button>

                        <button className="rounded bg-gray-100 px-3 py-1">
                          Editar
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