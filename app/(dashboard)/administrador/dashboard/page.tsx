"use client";

import { useEffect, useMemo, useState } from "react";
import { apiFetch } from "@/lib/apiClient";

type Actividad = {
  // `concepto` y `monto` ya no viven en Pago: los conceptos están en
  // `detalles` y el importe es `total`.
  total?: number;
  detalles?: { concepto?: { nombre?: string | null } | null }[];
  alumno?: {
    user?: {
      name?: string;
    };
  };
};

type AdminDashboardData = {
  totalAlumnos: number;
  totalDocentes: number;
  totalGrupos: number;
  pagosPendientes: number;
  actividad: Actividad[];
};

const defaultData: AdminDashboardData = {
  totalAlumnos: 0,
  totalDocentes: 0,
  totalGrupos: 0,
  pagosPendientes: 0,
  actividad: [],
};

function normalizeAdminDashboard(result: any): AdminDashboardData {
  const source = result?.resumen ?? result?.data?.resumen ?? result?.data ?? result ?? {};

  return {
    totalAlumnos: Number(source?.totalAlumnos ?? 0),
    totalDocentes: Number(source?.totalDocentes ?? source?.totalMaestros ?? 0),
    totalGrupos: Number(source?.totalGrupos ?? 0),
    pagosPendientes: Number(source?.pagosPendientes ?? source?.totalPagos ?? 0),
    actividad: Array.isArray(result?.actividad)
      ? result.actividad
      : Array.isArray(result?.data?.actividad)
      ? result.data.actividad
      : Array.isArray(source?.actividad)
      ? source.actividad
      : [],
  };
}

export default function AdministradorDashboardPage() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [data, setData] = useState<AdminDashboardData>(defaultData);

  useEffect(() => {
    async function fetchDashboard() {
      try {
        setLoading(true);
        setError("");

        const result = await apiFetch("/api/admin/dashboard");
        setData(normalizeAdminDashboard(result));
      } catch (err: any) {
        console.error("Error dashboard admin:", err);
        setError(err?.message || "Error al cargar dashboard");
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
        title: "Alumnos registrados",
        value: data?.totalAlumnos ?? 0,
      },
      {
        title: "Maestros activos",
        value: data?.totalDocentes ?? 0,
      },
      {
        title: "Grupos activos",
        value: data?.totalGrupos ?? 0,
      },
      {
        title: "Pagos pendientes",
        value: data?.pagosPendientes ?? 0,
      },
    ],
    [data]
  );

  if (loading) {
    return <p className="p-10">Cargando dashboard...</p>;
  }

  if (error) {
    return (
      <div className="p-10">
        <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-red-700">
          {error}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <section className="rounded-2xl bg-white p-6 shadow-sm">
        <h1 className="text-3xl font-bold">Dashboard Admin 🔥</h1>
        <p className="text-gray-500">Resumen general del sistema SIAC</p>
      </section>

      <section className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
        {resumen.map((item) => (
          <div key={item.title} className="rounded-2xl bg-white p-5 shadow-sm">
            <p className="text-sm text-gray-500">{item.title}</p>
            <h2 className="mt-2 text-3xl font-bold">{item.value}</h2>
          </div>
        ))}
      </section>

      <section className="rounded-2xl bg-white p-6 shadow-sm">
        <h2 className="mb-4 text-xl font-semibold">Actividad reciente</h2>

        {(data?.actividad ?? []).length === 0 ? (
          <p className="text-gray-500">No hay actividad reciente.</p>
        ) : (
          <div className="space-y-3">
            {(data?.actividad ?? []).map((item, i) => (
              <div key={i} className="rounded-xl bg-gray-50 p-4">
                <p className="font-medium">
                  Pago de {item?.alumno?.user?.name ?? "Alumno no disponible"}
                </p>
                {/* `concepto` y `monto` ya no viven en Pago:
                    los conceptos están en detalles y el importe es `total`. */}
                <p className="text-sm text-gray-500">
                  {(item?.detalles ?? [])
                    .map((d: any) => d?.concepto?.nombre)
                    .filter(Boolean)
                    .join(", ") || "Sin concepto"}{" "}
                  — ${Number(item?.total ?? 0).toFixed(2)}
                </p>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}