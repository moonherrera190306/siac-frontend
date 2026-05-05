"use client";

import { useEffect, useState } from "react";

export default function SecretariaDashboardPage() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchDashboard = async () => {
      try {
        const token = localStorage.getItem("token");

        const res = await fetch(
          "http://127.0.0.1:4000/api/secretaria/dashboard",
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        const json = await res.json();

        if (!res.ok) throw new Error(json.message);

        setData(json.data);
      } catch (err: any) {
        console.error(err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboard();
  }, []);

  if (loading) return <p className="p-6">Cargando dashboard...</p>;

  if (error)
    return <p className="p-6 text-red-500">Error: {error}</p>;

  // 🔥 DATOS DINÁMICOS
  const resumen = [
    {
      title: "Inscripciones del día",
      value: data.inscripcionesHoy,
      description: "Registros realizados hoy",
    },
    {
      title: "Documentos pendientes",
      value: data.documentosPendientes,
      description: "Archivos por validar",
    },
    {
      title: "Constancias generadas",
      value: data.constanciasHoy,
      description: "Emitidas hoy",
    },
    {
      title: "Trámites activos",
      value: data.tramitesActivos,
      description: "Procesos administrativos",
    },
  ];

  return (
    <div className="space-y-6">
      {/* HEADER */}
      <section className="rounded-2xl border bg-white p-6 shadow-sm">
        <h1 className="text-3xl font-bold">
          Dashboard de Secretaría
        </h1>
        <p className="text-gray-600">
          Control general de trámites escolares
        </p>
      </section>

      {/* CARDS */}
      <section className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
        {resumen.map((item) => (
          <div
            key={item.title}
            className="bg-white p-5 rounded-2xl shadow border"
          >
            <p className="text-sm text-gray-500">{item.title}</p>
            <h2 className="text-3xl font-bold mt-2">
              {item.value}
            </h2>
            <p className="text-sm text-gray-500 mt-1">
              {item.description}
            </p>
          </div>
        ))}
      </section>
    </div>
  );
}