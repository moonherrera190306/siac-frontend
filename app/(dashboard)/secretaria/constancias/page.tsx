"use client";

import { useEffect, useState } from "react";

type Alumno = {
  id?: string;

  matricula?: string;

  createdAt?: string;

  user?: {
    name?: string;
  };
};

function normalizeData(data: any): Alumno[] {
  if (Array.isArray(data)) return data;

  if (Array.isArray(data?.data)) {
    return data.data;
  }

  return [];
}

export default function SecretariaConstanciasPage() {
  const [constancias, setConstancias] =
    useState<Alumno[]>([]);

  const [loading, setLoading] =
    useState(true);

  const [error, setError] =
    useState("");

  useEffect(() => {
    async function fetchConstancias() {
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
              "Error cargando constancias"
          );
        }

        const data =
          response?.data || response;

        setConstancias(
          normalizeData(data)
        );
      } catch (err: any) {
        console.error(err);

        setError(
          err?.message ||
            "Error interno del servidor"
        );

        setConstancias([]);
      } finally {
        setLoading(false);
      }
    }

    fetchConstancias();
  }, []);

  function generarConstancia() {
    alert(
      "Constancia generada correctamente"
    );
  }

  function descargar(
    alumno?: string
  ) {
    alert(
      `Descargando constancia de ${alumno}`
    );
  }

  if (loading) {
    return (
      <p className="p-6">
        Cargando constancias...
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
      <section className="flex items-center justify-between rounded-2xl border bg-white p-6 shadow-sm">
        <div>
          <h1 className="text-3xl font-bold">
            Constancias
          </h1>

          <p className="text-gray-600">
            Genera y consulta documentos
            escolares
          </p>
        </div>

        <button
          onClick={generarConstancia}
          className="rounded-xl bg-slate-900 px-4 py-2 text-white"
        >
          Nueva constancia
        </button>
      </section>

      {/* TABLA */}
      <section className="rounded-2xl bg-white p-6 shadow">
        {(constancias ?? []).length ===
        0 ? (
          <p className="text-gray-500">
            No hay constancias
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
                    Tipo
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
                {(constancias ?? []).map(
                  (c, index) => (
                    <tr
                      key={c?.id ?? index}
                      className="border-b"
                    >
                      <td className="p-3">
                        {c?.user?.name ??
                          "Sin alumno"}
                      </td>

                      <td className="p-3">
                        Estudios
                      </td>

                      <td className="p-3">
                        {c?.createdAt
                          ? new Date(
                              c.createdAt
                            ).toLocaleDateString(
                              "es-MX"
                            )
                          : "-"}
                      </td>

                      <td className="p-3">
                        <span className="rounded bg-green-100 px-2 py-1 text-xs text-green-700">
                          Generada
                        </span>
                      </td>

                      <td className="space-x-2 p-3 text-right">
                        <button className="rounded bg-gray-100 px-3 py-1">
                          Ver
                        </button>

                        <button
                          onClick={() =>
                            descargar(
                              c?.user?.name
                            )
                          }
                          className="rounded bg-gray-100 px-3 py-1"
                        >
                          Descargar
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