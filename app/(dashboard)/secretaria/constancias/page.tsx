"use client";

import { useEffect, useState } from "react";

export default function SecretariaConstanciasPage() {
  const [constancias, setConstancias] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // 🔄 GET CONSTANCIAS
  const fetchConstancias = async () => {
    try {
      const token = localStorage.getItem("token");

      const res = await fetch(
        "http://127.0.0.1:4000/api/constancias",
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const json = await res.json();

      if (!res.ok) throw new Error(json.message);

      setConstancias(json.data);
    } catch (err: any) {
      console.error(err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchConstancias();
  }, []);

  // 📄 GENERAR CONSTANCIA
  const generarConstancia = async () => {
    try {
      const token = localStorage.getItem("token");

      const alumnoId = prompt("ID del alumno:");
      const tipo = prompt("Tipo de constancia:");

      if (!alumnoId || !tipo) return;

      const res = await fetch(
        "http://127.0.0.1:4000/api/constancias",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ alumnoId, tipo }),
        }
      );

      const json = await res.json();

      if (!res.ok) throw new Error(json.message);

      fetchConstancias();
    } catch (err: any) {
      alert(err.message);
    }
  };

  // 📥 DESCARGAR PDF
  const descargar = async (id: string) => {
    try {
      const token = localStorage.getItem("token");

      const res = await fetch(
        `http://127.0.0.1:4000/api/constancias/${id}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (!res.ok) throw new Error("Error descarga");

      const blob = await res.blob();
      const url = window.URL.createObjectURL(blob);

      const a = document.createElement("a");
      a.href = url;
      a.download = "constancia.pdf";
      a.click();

      window.URL.revokeObjectURL(url);
    } catch (err) {
      alert("Error al descargar");
    }
  };

  if (loading) return <p className="p-6">Cargando constancias...</p>;

  if (error)
    return <p className="p-6 text-red-500">Error: {error}</p>;

  return (
    <div className="space-y-6">
      {/* HEADER */}
      <section className="flex justify-between items-center rounded-2xl border bg-white p-6 shadow-sm">
        <div>
          <h1 className="text-3xl font-bold">Constancias</h1>
          <p className="text-gray-600">
            Genera y consulta documentos escolares
          </p>
        </div>

        <button
          onClick={generarConstancia}
          className="bg-slate-900 text-white px-4 py-2 rounded-xl"
        >
          Nueva constancia
        </button>
      </section>

      {/* TABLA */}
      <section className="bg-white rounded-2xl p-6 shadow">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b text-gray-500">
              <th>Alumno</th>
              <th>Tipo</th>
              <th>Fecha</th>
              <th>Estado</th>
              <th className="text-right">Acciones</th>
            </tr>
          </thead>

          <tbody>
            {constancias.map((c) => (
              <tr key={c.id} className="border-b">
                <td>{c.alumno}</td>
                <td>{c.tipo}</td>
                <td>{c.fecha}</td>

                <td>
                  <span
                    className={`px-2 py-1 rounded text-xs ${
                      c.estado === "Generada"
                        ? "bg-green-100 text-green-700"
                        : "bg-yellow-100 text-yellow-700"
                    }`}
                  >
                    {c.estado}
                  </span>
                </td>

                <td className="text-right space-x-2">
                  <button className="bg-gray-100 px-3 py-1 rounded">
                    Ver
                  </button>

                  <button
                    onClick={() => descargar(c.id)}
                    className="bg-gray-100 px-3 py-1 rounded"
                  >
                    Descargar
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>
    </div>
  );
}