"use client";

import { useEffect, useMemo, useState } from "react";

type Pago = {
  id?: string;
  concepto?: string;
  monto?: number | string | null;
  pagadoEn?: string | null;
  estatus?: string;

  alumno?: {
    matricula?: string;

    user?: {
      name?: string;
    };
  };
};

function normalizeData(result: any): Pago[] {
  if (Array.isArray(result)) return result;

  if (Array.isArray(result?.pagos)) {
    return result.pagos;
  }

  if (Array.isArray(result?.data)) {
    return result.data;
  }

  if (Array.isArray(result?.data?.pagos)) {
    return result.data.pagos;
  }

  return [];
}

function formatMoney(value: unknown) {
  const number = Number(value ?? 0);

  if (Number.isNaN(number)) {
    return "$0.00";
  }

  return number.toLocaleString("es-MX", {
    style: "currency",
    currency: "MXN",
  });
}

export default function CajaPagosPendientesPage() {
  const [pagos, setPagos] = useState<Pago[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [payingId, setPayingId] = useState("");

  async function fetchPagos() {
    try {
      setLoading(true);
      setError("");

      const token = localStorage.getItem("token");

      const res = await fetch(
        "http://localhost:4000/api/pagos",
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const response = await res.json();

      if (!res.ok) {
        throw new Error(
          response?.message ||
            "Error al cargar pagos"
        );
      }

      const data = response?.data || [];

      setPagos(normalizeData(data));
    } catch (err: any) {
      console.error(err);

      setError(
        err?.message ||
          "Error interno del servidor"
      );

      setPagos([]);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchPagos();
  }, []);

  const pendientes = useMemo(() => {
    return (pagos ?? []).filter((p) => {
      return !p?.pagadoEn;
    });
  }, [pagos]);

  async function pagar(id?: string) {
    if (!id) return;

    try {
      setPayingId(id);

      const token = localStorage.getItem("token");

      const res = await fetch(
        `http://localhost:4000/api/pagos/pagar/${id}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const response = await res.json();

      if (!res.ok) {
        throw new Error(
          response?.message ||
            "Error al registrar pago"
        );
      }

      await fetchPagos();
    } catch (err: any) {
      console.error(err);

      alert(
        err?.message ||
          "No se pudo registrar el pago"
      );
    } finally {
      setPayingId("");
    }
  }

  if (loading) {
    return (
      <div className="p-6">
        <p>Cargando pagos pendientes...</p>
      </div>
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
      <section className="rounded-2xl bg-white p-6 shadow">
        <h1 className="text-3xl font-bold">
          Pagos pendientes
        </h1>

        <p className="text-gray-500">
          Alumnos con adeudo activo
        </p>
      </section>

      <section className="rounded-2xl bg-white p-6 shadow">
        {(pendientes ?? []).length === 0 ? (
          <p className="text-gray-500">
            No hay pagos pendientes.
          </p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="border-b text-gray-500">
                  <th className="p-3">
                    Alumno
                  </th>

                  <th className="p-3">
                    Concepto
                  </th>

                  <th className="p-3">
                    Monto
                  </th>

                  <th className="p-3">
                    Estado
                  </th>

                  <th className="p-3">
                    Acción
                  </th>
                </tr>
              </thead>

              <tbody>
                {(pendientes ?? []).map(
                  (p, index) => (
                    <tr
                      key={p?.id ?? index}
                      className="border-b"
                    >
                      <td className="p-3 font-medium">
                        {p?.alumno?.user
                          ?.name ??
                          "Alumno no disponible"}
                      </td>

                      <td className="p-3">
                        {p?.concepto ??
                          "Sin concepto"}
                      </td>

                      <td className="p-3">
                        {formatMoney(
                          p?.monto
                        )}
                      </td>

                      <td className="p-3">
                        <span className="rounded-full bg-yellow-100 px-3 py-1 text-sm text-yellow-700">
                          Pendiente
                        </span>
                      </td>

                      <td className="p-3">
                        <button
                          onClick={() =>
                            pagar(p?.id)
                          }
                          disabled={
                            payingId === p?.id
                          }
                          className="rounded-lg bg-green-600 px-4 py-2 text-white transition hover:bg-green-700 disabled:cursor-not-allowed disabled:opacity-50"
                        >
                          {payingId === p?.id
                            ? "Procesando..."
                            : "Registrar pago"}
                        </button>
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