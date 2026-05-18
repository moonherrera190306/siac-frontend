"use client";

import { useEffect, useState } from "react";

type Grupo = {
  id?: string;

  nombre?: string;

  turno?: string;

  aula?: string;

  horario?: string;
};

function normalizeData(data: any): Grupo[] {
  if (Array.isArray(data)) return data;

  if (Array.isArray(data?.data)) {
    return data.data;
  }

  return [];
}

export default function SecretariaHorariosPage() {
  const [horarios, setHorarios] =
    useState<Grupo[]>([]);

  const [loading, setLoading] =
    useState(true);

  const [error, setError] =
    useState("");

  useEffect(() => {
    async function fetchHorarios() {
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
              "Error cargando horarios"
          );
        }

        const data =
          response?.data || response;

        setHorarios(
          normalizeData(data)
        );
      } catch (err: any) {
        console.error(err);

        setError(
          err?.message ||
            "Error interno del servidor"
        );

        setHorarios([]);
      } finally {
        setLoading(false);
      }
    }

    fetchHorarios();
  }, []);

  if (loading) {
    return (
      <p className="p-6">
        Cargando horarios...
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
          Horarios
        </h1>

        <p className="text-gray-600">
          Organización horaria
          institucional
        </p>
      </section>

      {/* TABLA */}
      <section className="rounded-2xl bg-white p-6 shadow">
        {(horarios ?? []).length ===
        0 ? (
          <p className="text-gray-500">
            No hay horarios registrados.
          </p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b text-gray-500">
                  <th className="p-3">
                    Grupo
                  </th>

                  <th className="p-3">
                    Turno
                  </th>

                  <th className="p-3">
                    Horario
                  </th>

                  <th className="p-3">
                    Aula
                  </th>

                  <th className="p-3 text-right">
                    Acciones
                  </th>
                </tr>
              </thead>

              <tbody>
                {(horarios ?? []).map(
                  (h, index) => (
                    <tr
                      key={h?.id ?? index}
                      className="border-b"
                    >
                      <td className="p-3">
                        {h?.nombre ??
                          "Sin grupo"}
                      </td>

                      <td className="p-3">
                        {h?.turno ??
                          "Matutino"}
                      </td>

                      <td className="p-3">
                        {h?.horario ??
                          "07:00 - 14:00"}
                      </td>

                      <td className="p-3">
                        {h?.aula ??
                          "Aula 1"}
                      </td>

                      <td className="p-3 text-right">
                        <button className="rounded bg-slate-100 px-3 py-1 hover:bg-slate-200">
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