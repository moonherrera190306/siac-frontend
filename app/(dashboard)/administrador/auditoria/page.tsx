"use client";

import { Fragment, useEffect, useState } from "react";
import { API_URL } from "@/lib/config";

const ENTIDADES = [
  "Calificacion",
  "Pago",
  "Alumno",
  "Inscripcion",
  "Tramite",
  "User",
];

const ACCIONES = ["CREAR", "ACTUALIZAR", "ELIMINAR", "CANCELAR", "LOGIN"];

const COLOR: Record<string, string> = {
  CREAR: "bg-green-100 text-green-800",
  ACTUALIZAR: "bg-blue-100 text-blue-800",
  ELIMINAR: "bg-red-100 text-red-800",
  CANCELAR: "bg-amber-100 text-amber-800",
  LOGIN: "bg-slate-100 text-slate-700",
};

function Valores({ titulo, datos }: { titulo: string; datos: any }) {
  if (!datos) return null;

  return (
    <div>
      <p className="text-xs font-medium text-gray-500">{titulo}</p>

      <ul className="mt-1 space-y-0.5">
        {Object.entries(datos).map(([k, v]) => (
          <li key={k} className="text-xs">
            <span className="text-gray-400">{k}: </span>
            <span className="text-gray-700">
              {v === null || v === undefined ? "—" : String(v)}
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
}

export default function AdministradorAuditoriaPage() {
  const [registros, setRegistros] = useState<any[]>([]);
  const [meta, setMeta] = useState<any>({ total: 0, pages: 1 });

  const [entidad, setEntidad] = useState("");
  const [accion, setAccion] = useState("");
  const [page, setPage] = useState(1);

  const [abierto, setAbierto] = useState<string | null>(null);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const cargar = async () => {
      try {
        setLoading(true);

        const params = new URLSearchParams({
          page: String(page),
          perPage: "50",
        });

        if (entidad) params.set("entidad", entidad);
        if (accion) params.set("accion", accion);

        const res = await fetch(
          `${API_URL}/api/auditoria?${params.toString()}`,
          { credentials: "include" }
        );

        const json = await res.json();

        if (!res.ok) throw new Error(json?.message || "Error al consultar");

        setRegistros(json?.data ?? []);
        setMeta(json?.meta ?? { total: 0, pages: 1 });
        setError("");
      } catch (e: any) {
        setError(e.message || "Error al consultar la auditoría");
      } finally {
        setLoading(false);
      }
    };

    cargar();
  }, [entidad, accion, page]);

  return (
    <div className="space-y-6">
      <section className="rounded-2xl border bg-white p-6 shadow-sm">
        <h1 className="text-3xl font-bold">Auditoría</h1>
        <p className="text-gray-500">
          {meta.total ?? 0} operación(es) registrada(s). Los registros de
          auditoría no se editan ni se borran.
        </p>
      </section>

      {error && (
        <p className="rounded-xl bg-red-50 p-4 text-red-600">{error}</p>
      )}

      <section className="flex flex-wrap gap-3 rounded-2xl border bg-white p-5 shadow-sm">
        <select
          className="rounded-xl border border-gray-300 px-4 py-2"
          value={entidad}
          onChange={(e) => {
            setEntidad(e.target.value);
            setPage(1);
          }}
        >
          <option value="">Todas las entidades</option>
          {ENTIDADES.map((e) => (
            <option key={e} value={e}>
              {e}
            </option>
          ))}
        </select>

        <select
          className="rounded-xl border border-gray-300 px-4 py-2"
          value={accion}
          onChange={(e) => {
            setAccion(e.target.value);
            setPage(1);
          }}
        >
          <option value="">Todas las acciones</option>
          {ACCIONES.map((a) => (
            <option key={a} value={a}>
              {a}
            </option>
          ))}
        </select>
      </section>

      {loading && <p className="text-gray-500">Cargando...</p>}

      {!loading && registros.length === 0 && !error && (
        <div className="rounded-2xl border bg-white p-8 text-center">
          <p className="text-gray-500">No hay operaciones registradas.</p>
          <p className="mt-1 text-sm text-gray-400">
            La auditoría empieza a llenarse desde la primera captura, cobro o
            baja.
          </p>
        </div>
      )}

      {!loading && registros.length > 0 && (
        <div className="overflow-x-auto rounded-2xl border bg-white shadow-sm">
          <table className="w-full text-left text-sm">
            <thead className="bg-gray-50 text-gray-600">
              <tr>
                <th className="px-4 py-3">Fecha</th>
                <th className="px-4 py-3">Usuario</th>
                <th className="px-4 py-3">Acción</th>
                <th className="px-4 py-3">Entidad</th>
                <th className="px-4 py-3">Registro</th>
                <th className="px-4 py-3"></th>
              </tr>
            </thead>

            <tbody>
              {registros.map((r) => (
                <Fragment key={r.id}>
                  <tr className="border-t">
                    <td className="px-4 py-2">
                      {new Date(r.createdAt).toLocaleString("es-MX")}
                    </td>

                    <td className="px-4 py-2">
                      {r.usuario?.name || "Sistema"}
                      <span className="block text-xs text-gray-400">
                        {r.usuario?.role || ""}
                      </span>
                    </td>

                    <td className="px-4 py-2">
                      <span
                        className={`rounded-full px-2 py-1 text-xs ${
                          COLOR[r.accion] || "bg-gray-100 text-gray-600"
                        }`}
                      >
                        {r.accion}
                      </span>
                    </td>

                    <td className="px-4 py-2">{r.entidad}</td>

                    <td className="px-4 py-2 font-mono text-xs text-gray-400">
                      {String(r.entidadId).slice(0, 8)}…
                    </td>

                    <td className="px-4 py-2">
                      {(r.valorAnterior || r.valorNuevo) && (
                        <button
                          onClick={() =>
                            setAbierto(abierto === r.id ? null : r.id)
                          }
                          className="rounded-lg border px-3 py-1 text-xs hover:bg-gray-50"
                        >
                          {abierto === r.id ? "Ocultar" : "Ver cambio"}
                        </button>
                      )}
                    </td>
                  </tr>

                  {abierto === r.id && (
                    <tr className="border-t bg-gray-50">
                      <td colSpan={6} className="px-4 py-3">
                        <div className="grid gap-6 md:grid-cols-2">
                          <Valores titulo="Antes" datos={r.valorAnterior} />
                          <Valores titulo="Después" datos={r.valorNuevo} />
                        </div>

                        {r.ip && (
                          <p className="mt-3 text-xs text-gray-400">
                            IP {r.ip}
                          </p>
                        )}
                      </td>
                    </tr>
                  )}
                </Fragment>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <div className="flex justify-between text-sm text-gray-500">
        <span>
          Página {page} de {meta.pages || 1}
        </span>

        <div className="flex gap-2">
          <button
            disabled={page <= 1}
            onClick={() => setPage(page - 1)}
            className="rounded-lg border px-3 py-1 disabled:opacity-40"
          >
            Anterior
          </button>

          <button
            disabled={page >= (meta.pages || 1)}
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
