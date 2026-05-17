"use client";

import { useEffect, useMemo, useState } from "react";
import { apiFetch } from "@/lib/apiClient";

type Pago = {
  id?: string;
  concepto?: string;
  monto?: number | string | null;
  pagadoEn?: string | null;
  fechaPago?: string | null;
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

function normalizePagos(result: any): Pago[] {
  if (Array.isArray(result)) return result;
  if (Array.isArray(result?.pagos)) return result.pagos;
  if (Array.isArray(result?.data)) return result.data;
  if (Array.isArray(result?.data?.pagos)) return result.data.pagos;
  return [];
}

function toNumber(value: unknown) {
  const numberValue = Number(value ?? 0);
  return Number.isFinite(numberValue) ? numberValue : 0;
}

export default function AlumnoPagosPage() {
  const [pagos, setPagos] = useState<Pago[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    async function fetchPagos() {
      try {
        setLoading(true);
        setError("");

        const userId = getCurrentUserId();

        if (!userId) {
          throw new Error("No se encontró el usuario en sesión.");
        }

        const result = await apiFetch(`/api/pagos/${userId}`);
        setPagos(normalizePagos(result));
      } catch (err: any) {
        console.error("Error cargando pagos del alumno:", err);
        setError(err?.message || "Error al cargar pagos.");
        setPagos([]);
      } finally {
        setLoading(false);
      }
    }

    fetchPagos();
  }, []);

  const pagosPendientes = useMemo(
    () => pagos.filter((p) => !p?.pagadoEn && p?.estatus !== "PAGADO"),
    [pagos]
  );

  const pagosRealizados = useMemo(
    () => pagos.filter((p) => p?.pagadoEn || p?.estatus === "PAGADO").length,
    [pagos]
  );

  const saldoPendiente = useMemo(
    () =>
      pagosPendientes.reduce((acc, p) => {
        return acc + toNumber(p?.monto);
      }, 0),
    [pagosPendientes]
  );

  const proximoPago = pagosPendientes[0];

  if (loading) {
    return <p className="p-6">Cargando pagos...</p>;
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
      <h1 className="text-3xl font-bold">Pagos</h1>

      <div className="grid gap-4 md:grid-cols-3">
        <div className="rounded-xl bg-white p-4 shadow">
          <p className="text-sm text-gray-500">Saldo pendiente</p>
          <h2 className="text-2xl font-bold">${saldoPendiente.toFixed(2)}</h2>
        </div>

        <div className="rounded-xl bg-white p-4 shadow">
          <p className="text-sm text-gray-500">Pagos realizados</p>
          <h2 className="text-2xl font-bold">{pagosRealizados}</h2>
        </div>

        <div className="rounded-xl bg-white p-4 shadow">
          <p className="text-sm text-gray-500">Próximo pago</p>
          <h2 className="text-2xl font-bold">
            {proximoPago?.concepto ?? "Sin pendientes"}
          </h2>
        </div>
      </div>

      <div className="rounded-xl bg-white p-6 shadow">
        <h2 className="mb-4 font-semibold">Historial de pagos</h2>

        {pagos.length === 0 ? (
          <p className="text-gray-500">No hay pagos registrados.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="border-b text-gray-500">
                  <th className="py-3">Concepto</th>
                  <th className="py-3">Monto</th>
                  <th className="py-3">Estado</th>
                </tr>
              </thead>

              <tbody>
                {pagos.map((p, i) => {
                  const pagado = Boolean(p?.pagadoEn || p?.estatus === "PAGADO");

                  return (
                    <tr key={p?.id ?? i} className="border-b">
                      <td className="py-3">{p?.concepto ?? "Sin concepto"}</td>
                      <td className="py-3">${toNumber(p?.monto).toFixed(2)}</td>
                      <td className="py-3">
                        {pagado ? (
                          <span className="text-green-600">Pagado</span>
                        ) : (
                          <span className="text-yellow-600">Pendiente</span>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {proximoPago && (
        <div className="rounded-xl border bg-yellow-50 p-4">
          <p className="font-semibold">
            {proximoPago?.concepto ?? "Pago pendiente"}
          </p>
          <p>${toNumber(proximoPago?.monto).toFixed(2)}</p>
        </div>
      )}
    </div>
  );
}