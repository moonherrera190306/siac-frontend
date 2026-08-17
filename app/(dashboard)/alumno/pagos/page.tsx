"use client";

import { useEffect, useState } from "react";
import { API_URL } from "@/lib/config";
import { abrirRecibo } from "@/lib/documentos";

export default function AlumnoPagosPage() {
  const [pagos, setPagos] = useState<any[]>([]);
  const [resumen, setResumen] = useState<any>(null);
  const [recibo, setRecibo] = useState<any>(null);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const cargar = async () => {
      try {
        const guardado = localStorage.getItem("user");

        if (!guardado) {
          window.location.href = "/login";
          return;
        }

        const user = JSON.parse(guardado);
        const alumnoId = user?.alumnoId || user?.id;

        const [rp, rr] = await Promise.all([
          fetch(`${API_URL}/api/pagos/${alumnoId}`, { credentials: "include" }),
          fetch(`${API_URL}/api/pagos/resumen/${alumnoId}`, {
            credentials: "include",
          }),
        ]);

        const [jp, jr] = await Promise.all([rp.json(), rr.json()]);

        if (!rp.ok) throw new Error(jp?.message || "Error al cargar pagos");

        setPagos(jp?.data ?? []);
        setResumen(jr?.data ?? null);
      } catch (e: any) {
        setError(e.message || "Error al cargar pagos");
      } finally {
        setLoading(false);
      }
    };

    cargar();
  }, []);

  if (loading) return <p className="p-6">Cargando...</p>;

  const adeudo = Number(resumen?.adeudo ?? 0);

  return (
    <div className="space-y-6">
      <section className="rounded-3xl border bg-white p-6 shadow-sm">
        <h1 className="text-3xl font-bold">Mis pagos</h1>
        <p className="text-gray-500">{pagos.length} recibo(s) a tu nombre</p>
      </section>

      {error && (
        <p className="rounded-xl bg-red-50 p-4 text-red-600">{error}</p>
      )}

      <div className="grid gap-4 md:grid-cols-2">
        <div className="rounded-3xl border bg-white p-5 shadow-sm">
          <p className="text-sm text-gray-500">Total pagado</p>
          <h2 className="text-2xl font-bold">
            ${Number(resumen?.totalPagado ?? 0).toFixed(2)}
          </h2>
        </div>

        <div
          className={`rounded-3xl border p-5 shadow-sm ${
            adeudo > 0 ? "border-red-300 bg-red-50" : "bg-white"
          }`}
        >
          <p className="text-sm text-gray-500">Adeudo</p>

          <h2
            className={`text-2xl font-bold ${
              adeudo > 0 ? "text-red-700" : ""
            }`}
          >
            ${adeudo.toFixed(2)}
          </h2>

          {adeudo > 0 && (
            <p className="mt-1 text-xs text-red-700">
              Con adeudo pendiente no puedes consultar tus calificaciones.
            </p>
          )}
        </div>
      </div>

      {(resumen?.adeudos ?? []).length > 0 && (
        <section className="rounded-3xl border bg-white p-5 shadow-sm">
          <h2 className="mb-3 font-semibold">Detalle del adeudo</h2>

          <ul className="space-y-2 text-sm">
            {resumen.adeudos.map((a: any) => (
              <li
                key={a.id}
                className="flex justify-between border-b pb-2 last:border-0"
              >
                <span>{a.descripcion || "Adeudo"}</span>
                <span className="font-medium">
                  ${Number(a.saldo).toFixed(2)}
                </span>
              </li>
            ))}
          </ul>
        </section>
      )}

      {pagos.length === 0 ? (
        <div className="rounded-3xl border bg-white p-8 text-center text-gray-500">
          Todavía no tienes pagos registrados.
        </div>
      ) : (
        <section className="overflow-x-auto rounded-3xl border bg-white shadow-sm">
          <h2 className="border-b px-5 py-4 text-lg font-semibold">Recibos</h2>

          <table className="w-full text-left text-sm">
            <thead className="bg-gray-50 text-gray-600">
              <tr>
                <th className="px-4 py-3">Folio</th>
                <th className="px-4 py-3">Fecha</th>
                <th className="px-4 py-3">Conceptos</th>
                <th className="px-4 py-3">Total</th>
                <th className="px-4 py-3">Estado</th>
                <th className="px-4 py-3"></th>
              </tr>
            </thead>

            <tbody>
              {pagos.map((p) => (
                <tr
                  key={p.id}
                  className={`border-t ${
                    p.estado === "CANCELADO" ? "opacity-60" : ""
                  }`}
                >
                  <td className="px-4 py-3 font-semibold">{p.folio}</td>

                  <td className="px-4 py-3">
                    {p.pagadoEn
                      ? new Date(p.pagadoEn).toLocaleDateString("es-MX")
                      : "—"}
                  </td>

                  <td className="px-4 py-3">
                    {(p.detalles ?? [])
                      .map((d: any) => d.concepto?.nombre)
                      .filter(Boolean)
                      .join(", ") || "—"}
                  </td>

                  <td className="px-4 py-3">
                    ${Number(p.total ?? 0).toFixed(2)}
                  </td>

                  <td className="px-4 py-3">
                    <span
                      className={
                        p.estado === "CANCELADO"
                          ? "rounded-full bg-red-100 px-3 py-1 text-xs text-red-700"
                          : "rounded-full bg-green-100 px-3 py-1 text-xs text-green-700"
                      }
                    >
                      {p.estado === "CANCELADO" ? "Cancelado" : "Pagado"}
                    </span>
                  </td>

                  <td className="px-4 py-3">
                    <div className="flex gap-1">
                      <button
                        onClick={() => setRecibo(p)}
                        className="rounded-lg border px-3 py-1 text-xs hover:bg-gray-50"
                      >
                        Ver
                      </button>

                      <button
                        onClick={() => abrirRecibo(p)}
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
        </section>
      )}

      {recibo && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-xl">
            <h2 className="text-xl font-bold">Recibo {recibo.folio}</h2>

            <p className="mt-1 text-sm text-gray-500">
              {recibo.pagadoEn
                ? new Date(recibo.pagadoEn).toLocaleDateString("es-MX")
                : ""}{" "}
              · {recibo.metodo}
            </p>

            <ul className="mt-4 space-y-2 text-sm">
              {(recibo.detalles ?? []).map((d: any) => (
                <li key={d.id} className="flex justify-between border-b pb-2">
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
              <span>${Number(recibo.total ?? 0).toFixed(2)}</span>
            </div>

            <div className="mt-6 flex gap-2">
              <button
                onClick={() => abrirRecibo(recibo)}
                className="flex-1 rounded-xl bg-blue-700 py-2 text-white hover:bg-blue-800"
              >
                Descargar recibo
              </button>

              <button
                onClick={() => setRecibo(null)}
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
