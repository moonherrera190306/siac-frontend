"use client";

import { useEffect, useMemo, useState } from "react";
import { apiFetch } from "@/lib/apiClient";

type Pago = {
  id?: string;
  concepto?: string;
  monto?: number | string | null;
  pagadoEn?: string | null;
  estatus?: string;
  alumno?: {
    user?: {
      name?: string;
    };
  };
};

function normalizePagos(result: any): Pago[] {
  if (Array.isArray(result)) return result;
  if (Array.isArray(result?.pagos)) return result.pagos;
  if (Array.isArray(result?.data)) return result.data;
  if (Array.isArray(result?.data?.pagos)) return result.data.pagos;
  return [];
}

function toNumber(value: unknown) {
  const n = Number(value ?? 0);
  return Number.isFinite(n) ? n : 0;
}

function isToday(dateValue?: string | null) {
  if (!dateValue) return false;

  const date = new Date(dateValue);

  if (Number.isNaN(date.getTime())) return false;

  return date.toDateString() === new Date().toDateString();
}

export default function CajaDashboardPage() {
  const [pagos, setPagos] = useState<Pago[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    async function fetchPagos() {
      try {
        setLoading(true);
        setError("");

        const result = await apiFetch("/api/pagos");
        setPagos(normalizePagos(result));
      } catch (err: any) {
        console.error("Error dashboard caja:", err);
        setError(err?.message || "Error al cargar dashboard de caja.");
        setPagos([]);
      } finally {
        setLoading(false);
      }
    }

    fetchPagos();
  }, []);

  const metricas = useMemo(() => {
    const pagosHoy = pagos.filter((p) => isToday(p?.pagadoEn));

    const cobrosHoy = pagosHoy.reduce((acc, p) => {
      return acc + toNumber(p?.monto);
    }, 0);

    const movimientosHoy = pagosHoy.length;

    const pagosPendientes = pagos.filter(
      (p) => !p?.pagadoEn && p?.estatus !== "PAGADO"
    ).length;

    const recibosEmitidos = pagos.length;

    return {
      cobrosHoy,
      movimientosHoy,
      pagosPendientes,
      recibosEmitidos,
    };
  }, [pagos]);

  const recientes = useMemo(() => pagos.slice(0, 5), [pagos]);

  const accesos = [
    "Registrar cobro",
    "Consultar pagos pendientes",
    "Generar recibo",
    "Ver historial",
  ];

  if (loading) {
    return <p className="p-6">Cargando dashboard de caja...</p>;
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
      <section className="rounded-2xl bg-white p-6 shadow-sm">
        <h1 className="text-3xl font-bold">Dashboard de Caja</h1>
        <p className="text-gray-500">Control general de cobros y movimientos</p>
      </section>

      <section className="grid gap-4 md:grid-cols-4">
        <div className="rounded-xl bg-white p-5 shadow">
          <p className="text-sm text-gray-500">Cobros del día</p>
          <h2 className="text-2xl font-bold">
            ${metricas.cobrosHoy.toFixed(2)}
          </h2>
        </div>

        <div className="rounded-xl bg-white p-5 shadow">
          <p className="text-sm text-gray-500">Pagos pendientes</p>
          <h2 className="text-2xl font-bold">{metricas.pagosPendientes}</h2>
        </div>

        <div className="rounded-xl bg-white p-5 shadow">
          <p className="text-sm text-gray-500">Recibos emitidos</p>
          <h2 className="text-2xl font-bold">{metricas.recibosEmitidos}</h2>
        </div>

        <div className="rounded-xl bg-white p-5 shadow">
          <p className="text-sm text-gray-500">Movimientos hoy</p>
          <h2 className="text-2xl font-bold">{metricas.movimientosHoy}</h2>
        </div>
      </section>

      <section className="grid gap-6 xl:grid-cols-3">
        <div className="rounded-2xl bg-white p-6 shadow xl:col-span-2">
          <h2 className="text-xl font-semibold">Movimientos recientes</h2>

          {recientes.length === 0 ? (
            <p className="mt-4 text-gray-500">No hay movimientos recientes.</p>
          ) : (
            <div className="mt-4 space-y-3">
              {recientes.map((p, i) => (
                <div
                  key={p?.id ?? i}
                  className="rounded-xl border bg-gray-50 p-4"
                >
                  <div className="flex justify-between gap-4">
                    <div>
                      <p className="font-semibold">
                        {p?.alumno?.user?.name ?? "Alumno no disponible"}
                      </p>
                      <p className="text-sm text-gray-500">
                        {p?.concepto ?? "Sin concepto"}
                      </p>
                    </div>

                    <div className="text-right">
                      <p className="font-bold">
                        ${toNumber(p?.monto).toFixed(2)}
                      </p>
                      <p className="text-xs text-gray-400">
                        {p?.pagadoEn
                          ? new Date(p.pagadoEn).toLocaleTimeString()
                          : "-"}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="rounded-2xl bg-white p-6 shadow">
          <h2 className="text-xl font-semibold">Accesos rápidos</h2>

          <div className="mt-4 space-y-3">
            {accesos.map((item) => (
              <button
                key={item}
                className="w-full rounded-xl bg-slate-900 p-3 text-white hover:bg-slate-800"
              >
                {item}
              </button>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}