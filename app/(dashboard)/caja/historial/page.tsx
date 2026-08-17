"use client";

import { useEffect, useState } from "react";
import { API_URL } from "@/lib/config";
import { abrirRecibo } from "@/lib/documentos";

export default function CajaHistorialPage() {
  const [pagos, setPagos] = useState<any[]>([]);
  const [meta, setMeta] = useState<any>({ total: 0 });
  const [page, setPage] = useState(1);
  const [busqueda, setBusqueda] = useState("");

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [aviso, setAviso] = useState("");

  const cargar = async () => {
    try {
      setLoading(true);

      const res = await fetch(
        `${API_URL}/api/pagos?perPage=50&page=${page}`,
        { credentials: "include" }
      );

      const json = await res.json();

      if (!res.ok) throw new Error(json?.message || "Error al cargar pagos");

      setPagos(json?.data ?? []);
      setMeta(json?.meta ?? { total: 0 });
      setError("");
    } catch (e: any) {
      setError(e.message || "Error al cargar pagos");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    cargar();
  }, [page]);

  const cancelar = async (id: string, folio: number) => {
    const motivo = window.prompt(`Motivo de cancelación del recibo ${folio}:`);

    if (!motivo) return;

    setError("");
    setAviso("");

    const res = await fetch(`${API_URL}/api/pagos/cancelar/${id}`, {
      method: "PUT",
      credentials: "include",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ motivo }),
    });

    const json = await res.json();

    if (!res.ok) {
      setError(json?.message || "No se pudo cancelar");
      return;
    }

    setAviso(json?.message || "Recibo cancelado");
    cargar();
  };

  const filtrados = pagos.filter((p) => {
    const t = busqueda.trim().toLowerCase();
    if (!t) return true;
    return (
      String(p.folio).includes(t) ||
      (p.alumno?.user?.name || "").toLowerCase().includes(t) ||
      (p.alumno?.matricula || "").toLowerCase().includes(t)
    );
  });

  const totalPagina = filtrados
    .filter((p) => p.estado !== "CANCELADO")
    .reduce((acc, p) => acc + Number(p.total ?? 0), 0);

  if (loading) return <p className="p-6">Cargando...</p>;

  return (
    <div className="space-y-6">
      <section className="flex flex-col gap-4 rounded-3xl border bg-white p-6 shadow-sm md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-3xl font-bold">Historial de pagos</h1>
          <p className="text-gray-500">
            {meta.total ?? 0} recibo(s) · ${totalPagina.toFixed(2)} en esta
            página
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

      {aviso && (
        <p className="rounded-xl bg-green-50 p-4 text-green-700">{aviso}</p>
      )}

      {filtrados.length === 0 ? (
        <div className="rounded-3xl border bg-white p-8 text-center text-gray-500">
          No hay pagos registrados.
        </div>
      ) : (
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
              {filtrados.map((p) => (
                <tr
                  key={p.id}
                  className={`border-t ${
                    p.estado === "CANCELADO" ? "opacity-60" : ""
                  }`}
                >
                  <td className="px-4 py-3 font-semibold">{p.folio}</td>

                  <td className="px-4 py-3">
                    {p.alumno?.user?.name || "N/A"}
                    <span className="block text-xs text-gray-400">
                      {p.alumno?.matricula}
                    </span>
                  </td>

                  <td className="px-4 py-3">
                    {(p.detalles ?? [])
                      .map((d: any) => d.concepto?.nombre)
                      .filter(Boolean)
                      .join(", ") || "—"}
                  </td>

                  <td className="px-4 py-3">{p.metodo}</td>

                  <td className="px-4 py-3">
                    {p.pagadoEn
                      ? new Date(p.pagadoEn).toLocaleDateString("es-MX")
                      : "—"}
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

                    {p.motivoCancela && (
                      <span className="block text-xs text-gray-400">
                        {p.motivoCancela}
                      </span>
                    )}
                  </td>

                  <td className="px-4 py-3">
                    <div className="flex gap-1">
                      <button
                        onClick={() => abrirRecibo(p)}
                        className="rounded-lg border px-3 py-1 text-xs hover:bg-blue-50"
                      >
                        Recibo
                      </button>

                      {p.estado !== "CANCELADO" && (
                        <button
                          onClick={() => cancelar(p.id, p.folio)}
                          className="rounded-lg border px-3 py-1 text-xs hover:bg-red-50"
                        >
                          Cancelar
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <div className="flex justify-between text-sm text-gray-500">
        <span>Página {page}</span>

        <div className="flex gap-2">
          <button
            disabled={page <= 1}
            onClick={() => setPage(page - 1)}
            className="rounded-lg border px-3 py-1 disabled:opacity-40"
          >
            Anterior
          </button>

          <button
            disabled={pagos.length < 50}
            onClick={() => setPage(page + 1)}
            className="rounded-lg border px-3 py-1 disabled:opacity-40"
          >
            Siguiente
          </button>
        </div>
      </div>
    </div>
  );
}
