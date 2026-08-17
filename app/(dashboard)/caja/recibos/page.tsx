"use client";

import { useEffect, useState } from "react";
import { API_URL } from "@/lib/config";
import { abrirRecibo } from "@/lib/documentos";

type Recibo = {
  id: string;
  folio: number;
  total: number;
  estado: string;
  metodo: string;
  pagadoEn: string;
  alumno?: { matricula?: string; user?: { name?: string } };
  detalles?: { cantidad: number; monto: number; concepto?: { nombre?: string } }[];
};

export default function CajaRecibosPage() {
  const [recibos, setRecibos] = useState<Recibo[]>([]);
  const [busqueda, setBusqueda] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [detalle, setDetalle] = useState<Recibo | null>(null);

  useEffect(() => {
    const cargar = async () => {
      try {
        const res = await fetch(`${API_URL}/api/pagos?perPage=100`, {
          credentials: "include",
        });

        const json = await res.json();

        if (!res.ok) {
          throw new Error(json?.message || "Error al cargar los recibos");
        }

        setRecibos(json?.data ?? []);
      } catch (e: any) {
        setError(e.message || "Error al cargar los recibos");
      } finally {
        setLoading(false);
      }
    };

    cargar();
  }, []);

  const filtrados = recibos.filter((r) => {
    const texto = busqueda.trim().toLowerCase();

    if (!texto) return true;

    return (
      String(r.folio).includes(texto) ||
      (r.alumno?.user?.name || "").toLowerCase().includes(texto) ||
      (r.alumno?.matricula || "").toLowerCase().includes(texto)
    );
  });

  if (loading) return <p className="p-6">Cargando...</p>;

  return (
    <div className="space-y-6">
      <section className="flex flex-col gap-4 rounded-3xl border bg-white p-6 shadow-sm md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-3xl font-bold">Recibos</h1>
          <p className="text-gray-500">
            Folio consecutivo institucional
          </p>
        </div>

        <input
          className="w-full rounded-xl border border-gray-300 px-4 py-2 md:w-72"
          placeholder="Buscar por folio, nombre o matrícula"
          value={busqueda}
          onChange={(e) => setBusqueda(e.target.value)}
        />
      </section>

      {error && (
        <p className="rounded-xl bg-red-50 p-4 text-red-600">{error}</p>
      )}

      {!error && filtrados.length === 0 && (
        <div className="rounded-3xl border bg-white p-8 text-center text-gray-500">
          No hay recibos que mostrar.
        </div>
      )}

      {filtrados.length > 0 && (
        <div className="overflow-x-auto rounded-3xl border bg-white shadow-sm">
          <table className="w-full text-left text-sm">
            <thead className="bg-gray-50 text-gray-600">
              <tr>
                <th className="px-4 py-3">Folio</th>
                <th className="px-4 py-3">Alumno</th>
                <th className="px-4 py-3">Conceptos</th>
                <th className="px-4 py-3">Método</th>
                <th className="px-4 py-3">Fecha</th>
                <th className="px-4 py-3">Total</th>
                <th className="px-4 py-3">Estado</th>
                <th className="px-4 py-3"></th>
              </tr>
            </thead>

            <tbody>
              {filtrados.map((r) => (
                <tr key={r.id} className="border-t">
                  <td className="px-4 py-3 font-semibold">{r.folio}</td>

                  <td className="px-4 py-3">
                    {r.alumno?.user?.name || "N/A"}
                    <span className="block text-xs text-gray-400">
                      {r.alumno?.matricula}
                    </span>
                  </td>

                  <td className="px-4 py-3">
                    {(r.detalles ?? [])
                      .map((d) => d.concepto?.nombre)
                      .filter(Boolean)
                      .join(", ") || "—"}
                  </td>

                  <td className="px-4 py-3">{r.metodo}</td>

                  <td className="px-4 py-3">
                    {r.pagadoEn
                      ? new Date(r.pagadoEn).toLocaleDateString("es-MX")
                      : "—"}
                  </td>

                  <td className="px-4 py-3">
                    ${Number(r.total ?? 0).toFixed(2)}
                  </td>

                  <td className="px-4 py-3">
                    <span
                      className={
                        r.estado === "CANCELADO"
                          ? "rounded-full bg-red-100 px-3 py-1 text-xs text-red-700"
                          : "rounded-full bg-green-100 px-3 py-1 text-xs text-green-700"
                      }
                    >
                      {r.estado === "CANCELADO" ? "Cancelado" : "Pagado"}
                    </span>
                  </td>

                  <td className="px-4 py-3">
                    <div className="flex gap-1">
                      <button
                        onClick={() => setDetalle(r)}
                        className="rounded-lg border px-3 py-1 text-xs hover:bg-gray-50"
                      >
                        Ver
                      </button>

                      <button
                        onClick={() => abrirRecibo(r)}
                        className="rounded-lg border px-3 py-1 text-xs hover:bg-blue-50"
                      >
                        Imprimir
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {detalle && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-xl">
            <h2 className="text-xl font-bold">Recibo {detalle.folio}</h2>

            <p className="mt-1 text-sm text-gray-500">
              {detalle.alumno?.user?.name} · {detalle.alumno?.matricula}
            </p>

            <ul className="mt-4 space-y-2 text-sm">
              {(detalle.detalles ?? []).map((d, i) => (
                <li key={i} className="flex justify-between border-b pb-2">
                  <span>
                    {d.concepto?.nombre}
                    {d.cantidad > 1 && ` x${d.cantidad}`}
                  </span>
                  <span>${Number(d.monto * d.cantidad).toFixed(2)}</span>
                </li>
              ))}
            </ul>

            <div className="mt-4 flex justify-between font-semibold">
              <span>Total</span>
              <span>${Number(detalle.total ?? 0).toFixed(2)}</span>
            </div>

            <div className="mt-6 flex gap-2">
              <button
                onClick={() => abrirRecibo(detalle)}
                className="flex-1 rounded-xl bg-blue-700 py-2 text-white hover:bg-blue-800"
              >
                Imprimir recibo
              </button>

              <button
                onClick={() => setDetalle(null)}
                className="rounded-xl border border-slate-300 px-4 py-2"
              >
                Cerrar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
