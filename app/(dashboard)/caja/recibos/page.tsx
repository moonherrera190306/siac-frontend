"use client";

import { useEffect, useMemo, useState } from "react";

type Pago = {
  id?: string;
  concepto?: string;
  monto?: number | string | null;
  pagadoEn?: string | null;

  alumno?: {
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

export default function CajaHistorialPage() {
  const [pagos, setPagos] = useState<Pago[]>([]);
  const [search, setSearch] = useState("");
  const [fecha, setFecha] = useState("");

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

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
              "Error al cargar historial"
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

  const filtrados = useMemo(() => {
    return (pagos ?? []).filter((p) => {
      const alumno =
        p?.alumno?.user?.name?.toLowerCase() ||
        "";

      const concepto =
        p?.concepto?.toLowerCase() || "";

      const texto = `${alumno} ${concepto}`;

      const coincideTexto = texto.includes(
        search.toLowerCase()
      );

      let coincideFecha = true;

      if (fecha) {
        if (!p?.pagadoEn) {
          coincideFecha = false;
        } else {
          const fechaPago = new Date(
            p.pagadoEn
          );

          if (
            Number.isNaN(fechaPago.getTime())
          ) {
            coincideFecha = false;
          } else {
            coincideFecha =
              fechaPago
                .toISOString()
                .slice(0, 10) === fecha;
          }
        }
      }

      return coincideTexto && coincideFecha;
    });
  }, [pagos, search, fecha]);

  if (loading) {
    return (
      <div className="p-6">
        <p>Cargando historial...</p>
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
          Historial
        </h1>

        <p className="text-gray-500">
          Movimientos financieros registrados
          en caja
        </p>
      </section>

      <section className="rounded-2xl bg-white p-6 shadow">
        {/* FILTROS */}
        <div className="mb-4 flex flex-col gap-3 md:flex-row">
          <input
            type="text"
            placeholder="Buscar alumno o concepto..."
            value={search}
            onChange={(e) =>
              setSearch(e.target.value)
            }
            className="w-full rounded-lg border p-3 outline-none focus:border-blue-500"
          />

          <input
            type="date"
            value={fecha}
            onChange={(e) =>
              setFecha(e.target.value)
            }
            className="rounded-lg border p-3 outline-none focus:border-blue-500"
          />
        </div>

        {/* TABLA */}
        {(filtrados ?? []).length === 0 ? (
          <p className="text-gray-500">
            No hay movimientos registrados.
          </p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="border-b text-gray-500">
                  <th className="p-3">
                    Fecha
                  </th>

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
                </tr>
              </thead>

              <tbody>
                {(filtrados ?? []).map(
                  (p, index) => (
                    <tr
                      key={p?.id ?? index}
                      className="border-b"
                    >
                      <td className="p-3">
                        {p?.pagadoEn
                          ? new Date(
                              p.pagadoEn
                            ).toLocaleDateString(
                              "es-MX"
                            )
                          : "-"}
                      </td>

                      <td className="p-3 font-medium">
                        {p?.alumno?.user
                          ?.name ??
                          "Alumno no disponible"}
                      </td>

                      <td className="p-3">
                        {p?.concepto ??
                          "Sin concepto"}
                      </td>

                      <td className="p-3 font-semibold">
                        {formatMoney(
                          p?.monto
                        )}
                      </td>

                      <td className="p-3">
                        {p?.pagadoEn ? (
                          <span className="rounded-full bg-green-100 px-3 py-1 text-sm text-green-700">
                            Pagado
                          </span>
                        ) : (
                          <span className="rounded-full bg-yellow-100 px-3 py-1 text-sm text-yellow-700">
                            Pendiente
                          </span>
                        )}
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