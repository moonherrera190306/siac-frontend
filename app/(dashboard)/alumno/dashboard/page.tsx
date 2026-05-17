"use client";

import { useEffect, useMemo, useState } from "react";
import { apiFetch } from "@/lib/apiClient";

type MateriaResumen = {
  materia: string;
  promedio: number;
};

type CalificacionItem = {
  calificacion?: number | string | null;
  materia?: {
    nombre?: string;
  };
};

type PagoItem = {
  id?: string;
  pagadoEn?: string | null;
  estatus?: string;
};

function getCurrentUserId() {
  try {
    const user = JSON.parse(localStorage.getItem("user") || "{}");
    return user?.id || "";
  } catch {
    return "";
  }
}

function normalizeArray(result: any) {
  if (Array.isArray(result)) return result;
  if (Array.isArray(result?.data)) return result.data;
  if (Array.isArray(result?.calificaciones)) return result.calificaciones;
  if (Array.isArray(result?.pagos)) return result.pagos;
  if (Array.isArray(result?.data?.calificaciones)) return result.data.calificaciones;
  if (Array.isArray(result?.data?.pagos)) return result.data.pagos;
  return [];
}

function toNumber(value: unknown) {
  const n = Number(value ?? 0);
  return Number.isFinite(n) ? n : 0;
}

function agruparMaterias(calificaciones: CalificacionItem[]): MateriaResumen[] {
  const agrupado: Record<string, number[]> = {};

  calificaciones.forEach((item) => {
    const materia = item?.materia?.nombre ?? "Materia sin nombre";
    const calificacion = toNumber(item?.calificacion);

    if (!agrupado[materia]) {
      agrupado[materia] = [];
    }

    agrupado[materia].push(calificacion);
  });

  return Object.entries(agrupado).map(([materia, califs]) => {
    const suma = califs.reduce((acc, calif) => acc + calif, 0);
    const promedio = califs.length > 0 ? suma / califs.length : 0;

    return {
      materia,
      promedio: Number(promedio.toFixed(1)),
    };
  });
}

export default function AlumnoDashboardPage() {
  const [materias, setMaterias] = useState<MateriaResumen[]>([]);
  const [pagosPendientes, setPagosPendientes] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const promedio = useMemo(() => {
    if (materias.length === 0) return 0;

    const suma = materias.reduce((acc, item) => acc + toNumber(item.promedio), 0);
    return Number((suma / materias.length).toFixed(1));
  }, [materias]);

  useEffect(() => {
    async function fetchData() {
      try {
        setLoading(true);
        setError("");

        const userId = getCurrentUserId();

        if (!userId) {
          throw new Error("No se encontró el usuario en sesión.");
        }

        const calificacionesResult = await apiFetch(
          `/api/calificaciones/alumno/${userId}`
        );

        const calificaciones = normalizeArray(
          calificacionesResult
        ) as CalificacionItem[];

        setMaterias(agruparMaterias(calificaciones));

        const pagosResult = await apiFetch(`/api/pagos/${userId}`);
        const pagos = normalizeArray(pagosResult) as PagoItem[];

        const pendientes = pagos.filter(
          (p) => !p?.pagadoEn && p?.estatus !== "PAGADO"
        );

        setPagosPendientes(pendientes.length);
      } catch (err: any) {
        console.error("Error dashboard alumno:", err);
        setError(err?.message || "Error al cargar dashboard del alumno.");
        setMaterias([]);
        setPagosPendientes(0);
      } finally {
        setLoading(false);
      }
    }

    fetchData();
  }, []);

  if (loading) {
    return <p className="p-6">Cargando dashboard del alumno...</p>;
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
      <h1 className="text-3xl font-bold">Bienvenido, Alumno</h1>

      <div className="grid gap-4 md:grid-cols-4">
        <div className="rounded-xl bg-white p-4 shadow">
          <p className="text-sm text-gray-500">Promedio general</p>
          <h2 className="text-2xl font-bold">{promedio}</h2>
        </div>

        <div className="rounded-xl bg-white p-4 shadow">
          <p className="text-sm text-gray-500">Materias inscritas</p>
          <h2 className="text-2xl font-bold">{materias.length}</h2>
        </div>

        <div className="rounded-xl bg-white p-4 shadow">
          <p className="text-sm text-gray-500">Asistencia</p>
          <h2 className="text-2xl font-bold">--%</h2>
        </div>

        <div className="rounded-xl bg-white p-4 shadow">
          <p className="text-sm text-gray-500">Pagos pendientes</p>
          <h2 className="text-2xl font-bold">{pagosPendientes}</h2>
        </div>
      </div>

      <div className="rounded-xl bg-white p-6 shadow">
        <h2 className="mb-4 text-lg font-semibold">Mis materias</h2>

        {materias.length === 0 ? (
          <p className="text-gray-500">No hay materias registradas.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="border-b text-gray-500">
                  <th className="py-3">Materia</th>
                  <th className="py-3">Promedio</th>
                </tr>
              </thead>

              <tbody>
                {materias.map((m, i) => (
                  <tr key={`${m.materia}-${i}`} className="border-b">
                    <td className="py-3">{m.materia ?? "Materia sin nombre"}</td>
                    <td className="py-3 font-semibold">{m.promedio ?? 0}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}