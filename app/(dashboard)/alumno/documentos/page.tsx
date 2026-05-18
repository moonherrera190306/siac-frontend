"use client";

import { useEffect, useState } from "react";

export default function AlumnoDocumentosPage() {
  const [docs, setDocs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchDocs = async () => {
      try {
        setLoading(true);

        const token =
          localStorage.getItem("token");

        const user = JSON.parse(
          localStorage.getItem("user") || "{}"
        );

        const alumnoId =
          user?.alumnoId ||
          user?.id;

        if (!token) {
          throw new Error(
            "Token inválido"
          );
        }

        if (!alumnoId) {
          throw new Error(
            "Alumno no encontrado"
          );
        }

        const res = await fetch(
          `http://localhost:4000/api/documentos/${alumnoId}`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        const response =
          await res.json();

        console.log(
          "DOCUMENTOS:",
          response
        );

        if (!res.ok) {
          throw new Error(
            response?.message ||
              "Error cargando documentos"
          );
        }

        const data =
          response?.data || [];

        if (!Array.isArray(data)) {
          console.error(
            "Backend no regresó array:",
            data
          );

          setDocs([]);
          return;
        }

        setDocs(data);

      } catch (err: any) {
        console.error(err);

        setError(
          err?.message ||
            "Error cargando documentos"
        );

        setDocs([]);
      } finally {
        setLoading(false);
      }
    };

    fetchDocs();
  }, []);

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
          {error}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 p-6">

      {/* HEADER */}
      <section className="bg-white p-6 rounded-2xl shadow">
        <h1 className="text-3xl font-bold">
          Documentos
        </h1>

        <p className="text-gray-500">
          Consulta y descarga tus archivos escolares
        </p>
      </section>

      {/* TABLA */}
      <section className="bg-white p-6 rounded-2xl shadow">

        {(docs ?? []).length === 0 ? (
          <p className="text-gray-500">
            No hay documentos registrados
          </p>
        ) : (
          <div className="overflow-x-auto">

            <table className="w-full text-left">

              <thead>
                <tr className="text-gray-500 border-b">
                  <th className="py-3">
                    Documento
                  </th>

                  <th className="py-3">
                    Tipo
                  </th>

                  <th className="py-3">
                    Fecha
                  </th>

                  <th className="py-3">
                    Acción
                  </th>
                </tr>
              </thead>

              <tbody>

                {(docs ?? []).map(
                  (doc) => (
                    <tr
                      key={doc?.id}
                      className="border-b"
                    >
                      <td className="py-3">
                        {doc?.nombre ||
                          "Documento"}
                      </td>

                      <td className="py-3">
                        {doc?.tipo ||
                          "-"}
                      </td>

                      <td className="py-3">
                        {doc?.createdAt
                          ? new Date(
                              doc.createdAt
                            ).toLocaleDateString()
                          : "-"}
                      </td>

                      <td className="py-3">

                        {doc?.url ? (
                          <a
                            href={doc.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="bg-slate-900 text-white px-3 py-2 rounded-lg hover:bg-slate-800"
                          >
                            Descargar
                          </a>
                        ) : (
                          <span className="text-gray-400">
                            Sin archivo
                          </span>
                        )}

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