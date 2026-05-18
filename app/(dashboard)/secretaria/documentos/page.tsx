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

export default function SecretariaDocumentosPage() {
  const [documentos, setDocumentos] =
    useState<Alumno[]>([]);

  const [loading, setLoading] =
    useState(true);

  const [error, setError] =
    useState("");

  useEffect(() => {
    async function fetchDocumentos() {
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
              "Error cargando documentos"
          );
        }

        const data =
          response?.data || response;

        setDocumentos(
          normalizeData(data)
        );
      } catch (err: any) {
        console.error(err);

        setError(
          err?.message ||
            "Error interno del servidor"
        );

        setDocumentos([]);
      } finally {
        setLoading(false);
      }
    }

    fetchDocumentos();
  }, []);

  function validarDocumento(
    id?: string
  ) {
    if (!id) return;

    alert(
      `Documento ${id} validado correctamente`
    );
  }

  if (loading) {
    return (
      <p className="p-6">
        Cargando documentos...
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
          Documentos
        </h1>

        <p className="text-gray-600">
          Validación y seguimiento de
          documentación
        </p>
      </section>

      {/* TABLA */}
      <section className="rounded-2xl bg-white p-6 shadow">
        {(documentos ?? []).length ===
        0 ? (
          <p className="text-gray-500">
            No hay documentos
            registrados.
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
                    Documento
                  </th>

                  <th className="p-3">
                    Fecha
                  </th>

                  <th className="p-3">
                    Estado
                  </th>

                  <th className="p-3 text-right">
                    Acción
                  </th>
                </tr>
              </thead>

              <tbody>
                {(documentos ?? []).map(
                  (d, index) => {
                    const validado =
                      index % 2 === 0;

                    return (
                      <tr
                        key={
                          d?.id ?? index
                        }
                        className="border-b"
                      >
                        <td className="p-3">
                          {d?.user?.name ??
                            "Sin alumno"}
                        </td>

                        <td className="p-3">
                          Acta /
                          Certificado
                        </td>

                        <td className="p-3">
                          {d?.createdAt
                            ? new Date(
                                d.createdAt
                              ).toLocaleDateString(
                                "es-MX"
                              )
                            : "-"}
                        </td>

                        <td className="p-3">
                          <span
                            className={`rounded px-2 py-1 text-xs ${
                              validado
                                ? "bg-green-100 text-green-700"
                                : "bg-yellow-100 text-yellow-700"
                            }`}
                          >
                            {validado
                              ? "Validado"
                              : "Pendiente"}
                          </span>
                        </td>

                        <td className="p-3 text-right">
                          {!validado && (
                            <button
                              onClick={() =>
                                validarDocumento(
                                  d?.id
                                )
                              }
                              className="rounded bg-blue-600 px-3 py-1 text-white"
                            >
                              Validar
                            </button>
                          )}
                        </td>
                      </tr>
                    );
                  }
                )}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </div>
  );
}