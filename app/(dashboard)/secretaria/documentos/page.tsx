"use client";

import { useEffect, useState } from "react";

export default function SecretariaDocumentosPage() {
  const [documentos, setDocumentos] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchDocumentos = async () => {
    try {
      const token = localStorage.getItem("token");

      const res = await fetch(
        "http://127.0.0.1:4000/api/documentos",
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const json = await res.json();

      if (!res.ok) throw new Error(json.message);

      setDocumentos(json.data);
    } catch (err: any) {
      console.error(err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDocumentos();
  }, []);

  // ✅ VALIDAR DOCUMENTO
  const validarDocumento = async (id: string) => {
    try {
      const token = localStorage.getItem("token");

      const res = await fetch(
        `http://127.0.0.1:4000/api/documentos/${id}/validar`,
        {
          method: "PUT",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const json = await res.json();

      if (!res.ok) throw new Error(json.message);

      fetchDocumentos();
    } catch (err: any) {
      alert(err.message);
    }
  };

  if (loading) return <p className="p-6">Cargando documentos...</p>;

  if (error)
    return <p className="p-6 text-red-500">Error: {error}</p>;

  return (
    <div className="space-y-6">
      {/* HEADER */}
      <section className="rounded-2xl border bg-white p-6 shadow-sm">
        <h1 className="text-3xl font-bold">Documentos</h1>
        <p className="text-gray-600">
          Validación y seguimiento de documentación
        </p>
      </section>

      {/* TABLA */}
      <section className="bg-white rounded-2xl p-6 shadow">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b text-gray-500">
              <th>Alumno</th>
              <th>Documento</th>
              <th>Fecha</th>
              <th>Estado</th>
              <th className="text-right">Acción</th>
            </tr>
          </thead>

          <tbody>
            {documentos.map((d) => (
              <tr key={d.id} className="border-b">
                <td>{d.alumno}</td>
                <td>{d.documento}</td>
                <td>{d.fecha}</td>

                <td>
                  <span
                    className={`px-2 py-1 rounded text-xs ${
                      d.estado === "Validado"
                        ? "bg-green-100 text-green-700"
                        : "bg-yellow-100 text-yellow-700"
                    }`}
                  >
                    {d.estado}
                  </span>
                </td>

                <td className="text-right">
                  {d.estado === "Pendiente" && (
                    <button
                      onClick={() => validarDocumento(d.id)}
                      className="bg-blue-600 text-white px-3 py-1 rounded"
                    >
                      Validar
                    </button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>
    </div>
  );
}