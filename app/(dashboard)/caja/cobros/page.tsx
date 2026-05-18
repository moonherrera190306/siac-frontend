"use client";

import { useEffect, useMemo, useState } from "react";

type Pago = {
  id?: string;
  concepto?: string;
  monto?: number | string | null;
  estatus?: string;
  createdAt?: string;
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

function money(value: unknown) {
  const number = Number(value ?? 0);

  if (Number.isNaN(number)) return "$0.00";

  return number.toLocaleString("es-MX", {
    style: "currency",
    currency: "MXN",
  });
}

export default function CajaCobrosPage() {
  const [pagos, setPagos] = useState<Pago[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [search, setSearch] = useState("");

  useEffect(() => {
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
              "Error al cargar cobros"
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

    fetchPagos();
  }, []);

  const pagosFiltrados = useMemo(() => {
    return (pagos ?? []).filter((p) => {
      const alumno =
        p?.alumno?.user?.name?.toLowerCase() || "";

      const concepto =
        p?.concepto?.toLowerCase() || "";

      const query = search.toLowerCase();

      return (
        alumno.includes(query) ||
        concepto.includes(query)
      );
    });
  }, [pagos, search]);

  if (loading) {
    return (
      <div className="p-6">
        <p>Cargando cobros...</p>
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
      <div className="rounded-2xl bg-white p-6 shadow-sm">
        <h1 className="text-3xl font-bold">
          Cobros
        </h1>

        <p className="text-gray-500">
          Gestión de pagos y cobros registrados
        </p>
      </div>

      <div className="rounded-2xl bg-white p-6 shadow-sm">
        <input
          type="text"
          placeholder="Buscar alumno o concepto..."
          value={search}
          onChange={(e) =>
            setSearch(e.target.value)
          }
          className="w-full rounded-xl border p-3 outline-none focus:border-blue-500"
        />
      </div>

      <div className="rounded-2xl bg-white p-6 shadow-sm">
        {(pagosFiltrados ?? []).length === 0 ? (
          <p className="text-gray-500">
            No hay cobros registrados.
          </p>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full">
              <thead>
                <tr className="border-b text-left">
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
                    Estatus
                  </th>

                  <th className="p-3">
                    Fecha
                  </th>
                </tr>
              </thead>

              <tbody>
                {(pagosFiltrados ?? []).map(
                  (p, index) => (
                    <tr
                      key={p?.id ?? index}
                      className="border-b"
                    >
                      <td className="p-3">
                        {p?.alumno?.user?.name ??
                          "Sin alumno"}
                      </td>

                      <td className="p-3">
                        {p?.concepto ??
                          "Sin concepto"}
                      </td>

                      <td className="p-3 font-semibold">
                        {money(p?.monto)}
                      </td>

                      <td className="p-3">
                        <span className="rounded-full bg-blue-100 px-3 py-1 text-sm text-blue-700">
                          {p?.estatus ??
                            "PENDIENTE"}
                        </span>
                      </td>

                      <td className="p-3">
                        {p?.createdAt
                          ? new Date(
                              p.createdAt
                            ).toLocaleDateString(
                              "es-MX"
                            )
                          : "-"}
                      </td>
                    </tr>
                  )
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}