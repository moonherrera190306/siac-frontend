"use client";

import { useEffect, useState } from "react";

export default function AlumnoDocumentosPage() {
  const [docs, setDocs] = useState<any[]>([]);

  useEffect(() => {
    const fetchDocs = async () => {
      const token = localStorage.getItem("token");
      const user = JSON.parse(localStorage.getItem("user") || "{}");

      const res = await fetch(
        `http://localhost:4000/api/documentos/${user.id}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const data = await res.json();

      if (Array.isArray(data)) {
        setDocs(data);
      }
    };

    fetchDocs();
  }, []);

  return (
    <div className="space-y-6">

      <h1 className="text-3xl font-bold">Documentos</h1>

      <div className="bg-white p-6 rounded-xl shadow">
        <table className="w-full">
          <thead>
            <tr className="text-gray-500 border-b">
              <th>Documento</th>
              <th>Tipo</th>
              <th>Fecha</th>
              <th>Acción</th>
            </tr>
          </thead>

          <tbody>
            {docs.map((doc) => (
              <tr key={doc.id} className="border-b">
                <td>{doc.nombre}</td>
                <td>{doc.tipo}</td>
                <td>
                  {new Date(doc.createdAt).toLocaleDateString()}
                </td>
                <td>
                  <a
                    href={doc.url}
                    target="_blank"
                    className="bg-slate-900 text-white px-3 py-2 rounded"
                  >
                    Descargar
                  </a>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

    </div>
  );
}