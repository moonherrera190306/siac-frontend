"use client";

import { useEffect, useState } from "react";
import { API_URL } from "@/lib/config";

const COLOR: Record<string, string> = {
  SOLICITADO: "bg-amber-100 text-amber-700",
  EN_PROCESO: "bg-blue-100 text-blue-700",
  LISTO: "bg-green-100 text-green-700",
  ENTREGADO: "bg-slate-200 text-slate-700",
  CANCELADO: "bg-red-100 text-red-700",
};

// Mismo flujo que valida el backend.
const SIGUIENTE: Record<string, string[]> = {
  SOLICITADO: ["EN_PROCESO", "CANCELADO"],
  EN_PROCESO: ["LISTO", "CANCELADO"],
  LISTO: ["ENTREGADO", "CANCELADO"],
  ENTREGADO: [],
  CANCELADO: [],
};

const ETIQUETA: Record<string, string> = {
  EN_PROCESO: "Poner en proceso",
  LISTO: "Marcar listo",
  ENTREGADO: "Entregar",
  CANCELADO: "Cancelar",
};

export default function SecretariaTramitesPage() {
  const [tramites, setTramites] = useState<any[]>([]);
  const [meta, setMeta] = useState<any>({ total: 0, pendientes: 0 });
  const [filtro, setFiltro] = useState("");

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [aviso, setAviso] = useState("");

  const cargar = async (estado = "") => {
    try {
      setLoading(true);

      const res = await fetch(
        `${API_URL}/api/tramites?perPage=100${estado ? `&estado=${estado}` : ""}`,
        { credentials: "include" }
      );

      const json = await res.json();

      if (!res.ok) throw new Error(json?.message || "Error al cargar trámites");

      setTramites(json?.data ?? []);
      setMeta(json?.meta ?? { total: 0, pendientes: 0 });
      setError("");
    } catch (e: any) {
      setError(e.message || "Error al cargar trámites");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    cargar(filtro);
  }, [filtro]);

  const avanzar = async (id: string, estado: string) => {
    let notas = "";

    if (estado === "CANCELADO") {
      notas = window.prompt("Motivo de la cancelación:") || "";
      if (!notas) return;
    }

    setError("");
    setAviso("");

    const res = await fetch(`${API_URL}/api/tramites/${id}/estado`, {
      method: "PUT",
      credentials: "include",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ estado, notas }),
    });

    const json = await res.json();

    if (!res.ok) {
      setError(json?.message || "No se pudo actualizar el trámite");
      return;
    }

    setAviso(`Trámite marcado como ${estado}`);
    cargar(filtro);
  };

  return (
    <div className="space-y-6">
      <section className="flex flex-col gap-4 rounded-2xl border bg-white p-6 shadow-sm md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-3xl font-bold">Trámites</h1>
          <p className="text-gray-500">
            {meta.pendientes ?? 0} pendiente(s) de {meta.total ?? 0} · se generan
            solos cuando caja cobra una constancia o memorándum
          </p>
        </div>

        <select
          className="rounded-xl border border-gray-300 px-4 py-2"
          value={filtro}
          onChange={(e) => setFiltro(e.target.value)}
        >
          <option value="">Todos</option>
          <option value="SOLICITADO">Solicitados</option>
          <option value="EN_PROCESO">En proceso</option>
          <option value="LISTO">Listos</option>
          <option value="ENTREGADO">Entregados</option>
          <option value="CANCELADO">Cancelados</option>
        </select>
      </section>

      {error && (
        <p className="rounded-xl bg-red-50 p-4 text-red-600">{error}</p>
      )}

      {aviso && (
        <p className="rounded-xl bg-green-50 p-4 text-green-700">{aviso}</p>
      )}

      {loading && <p className="text-gray-500">Cargando...</p>}

      {!loading && tramites.length === 0 && !error && (
        <div className="rounded-2xl border bg-white p-8 text-center text-gray-500">
          No hay trámites con ese filtro.
        </div>
      )}

      {!loading && tramites.length > 0 && (
        <div className="overflow-x-auto rounded-2xl border bg-white shadow-sm">
          <table className="w-full text-left text-sm">
            <thead className="bg-gray-50 text-gray-600">
              <tr>
                <th className="px-4 py-3">Alumno</th>
                <th className="px-4 py-3">Trámite</th>
                <th className="px-4 py-3">Recibo</th>
                <th className="px-4 py-3">Solicitado</th>
                <th className="px-4 py-3">Estado</th>
                <th className="px-4 py-3">Acciones</th>
              </tr>
            </thead>

            <tbody>
              {tramites.map((t) => (
                <tr key={t.id} className="border-t">
                  <td className="px-4 py-3">
                    {t.alumno?.user?.name}
                    <span className="block text-xs text-gray-400">
                      {t.alumno?.matricula} · {t.alumno?.grupo?.nombre || "Sin grupo"}
                    </span>
                  </td>

                  <td className="px-4 py-3">
                    {t.concepto?.nombre || "Trámite"}
                  </td>

                  <td className="px-4 py-3">
                    {t.pago?.folio ? (
                      <span className="rounded bg-green-50 px-2 py-1 text-xs text-green-700">
                        Folio {t.pago.folio}
                      </span>
                    ) : (
                      <span className="text-xs text-gray-400">Sin pago</span>
                    )}
                  </td>

                  <td className="px-4 py-3">
                    {new Date(t.createdAt).toLocaleDateString("es-MX")}
                  </td>

                  <td className="px-4 py-3">
                    <span
                      className={`rounded-full px-3 py-1 text-xs ${
                        COLOR[t.estado] || "bg-gray-100 text-gray-600"
                      }`}
                    >
                      {t.estado.replace("_", " ")}
                    </span>

                    {t.notas && (
                      <span className="block text-xs text-gray-400">
                        {t.notas}
                      </span>
                    )}
                  </td>

                  <td className="px-4 py-3">
                    <div className="flex flex-wrap gap-1">
                      {(SIGUIENTE[t.estado] ?? []).map((e) => (
                        <button
                          key={e}
                          onClick={() => avanzar(t.id, e)}
                          className={`rounded-lg border px-3 py-1 text-xs ${
                            e === "CANCELADO"
                              ? "hover:bg-red-50"
                              : "hover:bg-blue-50"
                          }`}
                        >
                          {ETIQUETA[e]}
                        </button>
                      ))}

                      {(SIGUIENTE[t.estado] ?? []).length === 0 && (
                        <span className="text-xs text-gray-400">Cerrado</span>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
