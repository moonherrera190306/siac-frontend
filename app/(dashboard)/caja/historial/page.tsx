"use client";

import { useEffect, useRef, useState } from "react";
import { API_URL } from "@/lib/config";
import { abrirRecibo } from "@/lib/documentos";
import {
  BuscadorAlumnos,
  type CampoBusqueda,
} from "@/components/BuscadorAlumnos";

const ESTADOS_LIBRO = [
  { value: "", label: "Todos los estados" },
  { value: "PAGADO", label: "Pagado" },
  { value: "CANCELADO", label: "Cancelado" },
];

export default function CajaHistorialPage() {
  const [pestana, setPestana] = useState<"historial" | "libro">("historial");

  // ── Historial (búsqueda en servidor) ─────────────────────────────
  const [pagos, setPagos] = useState<any[]>([]);
  const [meta, setMeta] = useState<any>({ total: 0 });
  const [page, setPage] = useState(1);
  const [busqueda, setBusqueda] = useState("");
  const [campoBusqueda, setCampoBusqueda] = useState<CampoBusqueda>("apellido");

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [aviso, setAviso] = useState("");

  const debounce = useRef<ReturnType<typeof setTimeout> | null>(null);
  const primeraCarga = useRef(true);

  const cargar = async (texto: string, pagina: number) => {
    try {
      setLoading(true);

      const params = new URLSearchParams();
      params.set("perPage", "50");
      params.set("page", String(pagina));
      if (texto.trim()) params.set("search", texto.trim());

      const res = await fetch(`${API_URL}/api/pagos?${params.toString()}`, {
        credentials: "include",
      });

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

  // Se pide al servidor cada que cambia la página, y con un pequeño
  // retardo cuando cambia el texto (para no disparar una petición por
  // cada tecla).
  useEffect(() => {
    if (debounce.current) clearTimeout(debounce.current);

    if (primeraCarga.current) {
      primeraCarga.current = false;
      cargar(busqueda, page);
      return;
    }

    debounce.current = setTimeout(() => {
      cargar(busqueda, page);
    }, 400);

    return () => {
      if (debounce.current) clearTimeout(debounce.current);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [busqueda, page]);

  // El lector de código de barras no debe esperar el debounce: en
  // cuanto escanea, se busca de inmediato.
  const buscarPorLector = (codigo: string) => {
    setBusqueda(codigo);

    if (debounce.current) clearTimeout(debounce.current);

    setPage(1);
    cargar(codigo, 1);
  };

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
    cargar(busqueda, page);
  };

  const totalPagina = pagos
    .filter((p) => p.estado !== "CANCELADO")
    .reduce((acc, p) => acc + Number(p.total ?? 0), 0);

  // ── Libro de recibos ──────────────────────────────────────────────
  const [libroFiltro, setLibroFiltro] = useState("");
  const [desdeLibro, setDesdeLibro] = useState("");
  const [hastaLibro, setHastaLibro] = useState("");
  const [folioDesde, setFolioDesde] = useState("");
  const [folioHasta, setFolioHasta] = useState("");
  const [estadoLibro, setEstadoLibro] = useState("");

  const [registrosLibro, setRegistrosLibro] = useState<any[]>([]);
  const [metaLibro, setMetaLibro] = useState<any>(null);
  const [cargandoLibro, setCargandoLibro] = useState(false);
  const [errorLibro, setErrorLibro] = useState("");
  const [buscoLibro, setBuscoLibro] = useState(false);

  const construirQueryLibro = () => {
    const params = new URLSearchParams();
    if (libroFiltro.trim()) params.set("libro", libroFiltro.trim());
    if (desdeLibro) params.set("desde", desdeLibro);
    if (hastaLibro) params.set("hasta", hastaLibro);
    if (folioDesde) params.set("folioDesde", folioDesde);
    if (folioHasta) params.set("folioHasta", folioHasta);
    if (estadoLibro) params.set("estado", estadoLibro);
    return params;
  };

  const buscarLibro = async () => {
    setErrorLibro("");
    setCargandoLibro(true);
    setBuscoLibro(true);

    try {
      const params = construirQueryLibro();

      const res = await fetch(`${API_URL}/api/pagos/libro?${params.toString()}`, {
        credentials: "include",
      });

      const json = await res.json();

      if (!res.ok) {
        setErrorLibro(json?.message || "No se pudo cargar el libro de recibos");
        return;
      }

      setRegistrosLibro(json?.data ?? []);
      setMetaLibro(json?.meta ?? null);
    } catch {
      setErrorLibro("Error de conexión con el servidor");
    } finally {
      setCargandoLibro(false);
    }
  };

  const descargarPdfLibro = () => {
    const params = construirQueryLibro();
    params.set("formato", "pdf");
    window.open(`${API_URL}/api/pagos/libro?${params.toString()}`, "_blank");
  };

  if (loading && pestana === "historial" && pagos.length === 0) {
    return <p className="p-6">Cargando...</p>;
  }

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
      </section>

      <div className="flex gap-2">
        <button
          onClick={() => setPestana("historial")}
          className={`rounded-xl px-4 py-2 text-sm font-medium ${
            pestana === "historial"
              ? "bg-slate-900 text-white"
              : "border bg-white hover:bg-gray-50"
          }`}
        >
          Recibos
        </button>

        <button
          onClick={() => setPestana("libro")}
          className={`rounded-xl px-4 py-2 text-sm font-medium ${
            pestana === "libro"
              ? "bg-slate-900 text-white"
              : "border bg-white hover:bg-gray-50"
          }`}
        >
          Libro de recibos
        </button>
      </div>

      {pestana === "historial" && (
        <>
          <section className="rounded-3xl border bg-white p-5 shadow-sm">
            <BuscadorAlumnos
              valor={busqueda}
              campo={campoBusqueda}
              onValor={(v) => {
                setPage(1);
                setBusqueda(v);
              }}
              onCampo={setCampoBusqueda}
              onLector={buscarPorLector}
              onBuscar={() => cargar(busqueda, 1)}
              conLector
              placeholder="Folio, libro, iniciales, matrícula o nombre"
            />
          </section>

          {error && (
            <p className="rounded-xl bg-red-50 p-4 text-red-600">{error}</p>
          )}

          {aviso && (
            <p className="rounded-xl bg-green-50 p-4 text-green-700">{aviso}</p>
          )}

          {loading ? (
            <p className="p-6 text-gray-500">Buscando...</p>
          ) : pagos.length === 0 ? (
            <div className="rounded-3xl border bg-white p-8 text-center text-gray-500">
              No hay pagos registrados.
            </div>
          ) : (
            <div className="overflow-x-auto rounded-3xl border bg-white shadow-sm">
              <table className="w-full text-left text-sm">
                <thead className="bg-gray-50 text-gray-600">
                  <tr>
                    <th className="px-4 py-3">Folio</th>
                    <th className="px-4 py-3">Libro</th>
                    <th className="px-4 py-3">Iniciales</th>
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
                  {pagos.map((p) => (
                    <tr
                      key={p.id}
                      className={`border-t ${
                        p.estado === "CANCELADO" ? "opacity-60" : ""
                      }`}
                    >
                      <td className="px-4 py-3 font-semibold">{p.folio}</td>

                      <td className="px-4 py-3">{p.libro || "—"}</td>

                      <td className="px-4 py-3">{p.iniciales || "—"}</td>

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
        </>
      )}

      {pestana === "libro" && (
        <>
          <section className="rounded-3xl border bg-white p-5 shadow-sm">
            <h2 className="mb-3 font-semibold">Filtros del libro</h2>

            <div className="grid gap-3 md:grid-cols-3 lg:grid-cols-6">
              <input
                className="rounded-xl border border-gray-300 px-3 py-2"
                placeholder="Libro (ej. L-12)"
                value={libroFiltro}
                onChange={(e) => setLibroFiltro(e.target.value)}
              />

              <input
                type="date"
                className="rounded-xl border border-gray-300 px-3 py-2"
                value={desdeLibro}
                onChange={(e) => setDesdeLibro(e.target.value)}
              />

              <input
                type="date"
                className="rounded-xl border border-gray-300 px-3 py-2"
                value={hastaLibro}
                onChange={(e) => setHastaLibro(e.target.value)}
              />

              <input
                type="number"
                min={1}
                className="rounded-xl border border-gray-300 px-3 py-2"
                placeholder="Folio desde"
                value={folioDesde}
                onChange={(e) => setFolioDesde(e.target.value)}
              />

              <input
                type="number"
                min={1}
                className="rounded-xl border border-gray-300 px-3 py-2"
                placeholder="Folio hasta"
                value={folioHasta}
                onChange={(e) => setFolioHasta(e.target.value)}
              />

              <select
                className="rounded-xl border border-gray-300 px-3 py-2"
                value={estadoLibro}
                onChange={(e) => setEstadoLibro(e.target.value)}
              >
                {ESTADOS_LIBRO.map((op) => (
                  <option key={op.value} value={op.value}>
                    {op.label}
                  </option>
                ))}
              </select>
            </div>

            <div className="mt-4 flex flex-wrap gap-2">
              <button
                onClick={buscarLibro}
                disabled={cargandoLibro}
                className="rounded-xl bg-blue-600 px-4 py-2 text-sm text-white hover:bg-blue-700 disabled:bg-gray-400"
              >
                {cargandoLibro ? "Buscando..." : "Buscar"}
              </button>

              <button
                onClick={descargarPdfLibro}
                className="rounded-xl border px-4 py-2 text-sm hover:bg-gray-50"
              >
                Descargar PDF
              </button>
            </div>
          </section>

          {errorLibro && (
            <p className="rounded-xl bg-red-50 p-4 text-red-600">{errorLibro}</p>
          )}

          {!buscoLibro ? (
            <div className="rounded-3xl border bg-white p-8 text-center text-gray-500">
              Define los filtros y presiona "Buscar" para ver el libro de
              recibos.
            </div>
          ) : cargandoLibro ? (
            <p className="p-6 text-gray-500">Cargando...</p>
          ) : registrosLibro.length === 0 ? (
            <div className="rounded-3xl border bg-white p-8 text-center text-gray-500">
              No hay recibos con esos filtros.
            </div>
          ) : (
            <>
              {metaLibro && (
                <div className="grid gap-4 md:grid-cols-2">
                  <div className="rounded-2xl border bg-white p-5 shadow-sm">
                    <p className="text-sm text-gray-500">Recibos</p>
                    <h2 className="text-2xl font-bold">
                      {metaLibro.recibos ?? registrosLibro.length}
                    </h2>
                  </div>

                  <div className="rounded-2xl border bg-white p-5 shadow-sm">
                    <p className="text-sm text-gray-500">Total</p>
                    <h2 className="text-2xl font-bold">
                      ${Number(metaLibro.total ?? 0).toFixed(2)}
                    </h2>
                  </div>
                </div>
              )}

              <div className="overflow-x-auto rounded-3xl border bg-white shadow-sm">
                <table className="w-full text-left text-sm">
                  <thead className="bg-gray-50 text-gray-600">
                    <tr>
                      <th className="px-4 py-3">Folio</th>
                      <th className="px-4 py-3">Libro</th>
                      <th className="px-4 py-3">Iniciales</th>
                      <th className="px-4 py-3">Fecha</th>
                      <th className="px-4 py-3">Matrícula</th>
                      <th className="px-4 py-3">Alumno</th>
                      <th className="px-4 py-3">Concepto</th>
                      <th className="px-4 py-3">Importe</th>
                      <th className="px-4 py-3">Estado</th>
                    </tr>
                  </thead>

                  <tbody>
                    {registrosLibro.map((r, i) => (
                      <tr key={`${r.folio}-${i}`} className="border-t">
                        <td className="px-4 py-3 font-semibold">{r.folio}</td>
                        <td className="px-4 py-3">{r.libro || "—"}</td>
                        <td className="px-4 py-3">{r.iniciales || "—"}</td>
                        <td className="px-4 py-3">
                          {r.fecha
                            ? new Date(r.fecha).toLocaleDateString("es-MX")
                            : "—"}
                        </td>
                        <td className="px-4 py-3">{r.matricula || "—"}</td>
                        <td className="px-4 py-3">{r.alumno || "—"}</td>
                        <td className="px-4 py-3">{r.concepto || "—"}</td>
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
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </>
          )}
        </>
      )}
    </div>
  );
}
