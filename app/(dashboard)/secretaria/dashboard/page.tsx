"use client";

import { useEffect, useMemo, useState } from "react";
import { apiFetch } from "@/lib/apiClient";

type SecretariaDashboardData = {
  inscripcionesHoy: number;
  documentosPendientes: number;
  constanciasHoy: number;
  tramitesActivos: number;
};

const defaultData: SecretariaDashboardData = {
  inscripcionesHoy: 0,
  documentosPendientes: 0,
  constanciasHoy: 0,
  tramitesActivos: 0,
};

function normalizeDashboard(result: any): SecretariaDashboardData {
  const source = result?.data ?? result ?? {};

  return {
    inscripcionesHoy: Number(source?.inscripcionesHoy ?? 0),
    documentosPendientes: Number(source?.documentosPendientes ?? 0),
    constanciasHoy: Number(source?.constanciasHoy ?? 0),
    tramitesActivos: Number(source?.tramitesActivos ?? 0),
  };
}

export default function SecretariaDashboardPage() {
  const [data, setData] =
    useState<SecretariaDashboardData>(defaultData);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    async function fetchDashboard() {
      try {
        setLoading(true);
        setError("");

        const result = await apiFetch(
          "/api/secretaria/dashboard"
        );

        setData(normalizeDashboard(result));
      } catch (err: any) {
        console.error("Error dashboard secretaria:", err);

        setError(
          err?.message || "Error al cargar dashboard"
        );

        setData(defaultData);
      } finally {
        setLoading(false);
      }
    }

    fetchDashboard();
  }, []);

  const resumen = useMemo(
    () => [
      {
        title: "Inscripciones del día",
        value: data?.inscripcionesHoy ?? 0,
        description: "Registros realizados hoy",
      },
      {
        title: "Documentos pendientes",
        value: data?.documentosPendientes ?? 0,
        description: "Archivos por validar",
      },
      {
        title: "Constancias generadas",
        value: data?.constanciasHoy ?? 0,
        description: "Emitidas hoy",
      },
      {
        title: "Trámites activos",
        value: data?.tramitesActivos ?? 0,
        description: "Procesos administrativos",
      },
    ],
    [data]
  );

  if (loading) {
    return <p className="p-6">Cargando dashboard...</p>;
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
            className="rounded-2xl border bg-white p-5 shadow"
          >
            <p className="text-sm text-gray-500">
              {item.title}
            </p>

            <h2 className="mt-2 text-3xl font-bold">
              {item?.value ?? 0}
            </h2>

            <p className="mt-1 text-sm text-gray-500">
              {item.description}
            </p>
          </div>
        ))}
      </section>
    </div>
  );
}