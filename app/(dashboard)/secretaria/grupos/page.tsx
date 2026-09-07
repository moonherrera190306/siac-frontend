"use client";

import { useEffect, useState } from "react";
import { API_URL } from "@/lib/config";

// `nivel` y `turno` dejaron de ser texto suelto: hoy son relaciones,
// y el nivel se consulta a través del semestre y su carrera.
type Grupo = {
  id?: string;

  nombre?: string;

  turno?: { nombre?: string | null } | null;

  semestre?: {
    nombre?: string | null;
    carrera?: { nombre?: string | null } | null;
  } | null;

  _count?: { alumnos?: number } | null;

  alumnos?: any[];

  materias?: any[];
};

function normalizeData(data: any): Grupo[] {
  if (Array.isArray(data)) return data;

  if (Array.isArray(data?.data)) {
    return data.data;
  }

  return [];
}

// Listado de alumnos por grupo, listo para imprimir.
type AlumnoListado = {
  no?: number;
  matricula?: string;
  alumno?: string;
  estatus?: string;
};

type GrupoListado = {
  id?: string;
  grupo?: string;
  turno?: string;
  semestre?: string;
  carrera?: string;
  totalAlumnos?: number;
  alumnos?: AlumnoListado[];
};

type OrdenListado = "matricula" | "nombre";

export default function SecretariaGruposPage() {
  const [grupos, setGrupos] =
    useState<Grupo[]>([]);

  const [loading, setLoading] =
    useState(true);

  const [error, setError] =
    useState("");

  // Listado de alumnos por grupo (para consultar e imprimir).
  const [mostrarListado, setMostrarListado] = useState(false);
  const [listado, setListado] = useState<GrupoListado[]>([]);
  const [listadoLoading, setListadoLoading] = useState(false);
  const [listadoError, setListadoError] = useState("");
  const [ordenListado, setOrdenListado] = useState<OrdenListado>("matricula");
  const [grupoIdListado, setGrupoIdListado] = useState("");

  const cargarListado = async (
    grupoId: string | undefined,
    orden: OrdenListado
  ) => {
    try {
      setListadoLoading(true);
      setListadoError("");

      const params = new URLSearchParams({ orden });

      if (grupoId) params.set("grupoId", grupoId);

      const res = await fetch(
        `${API_URL}/api/grupos/listado?${params.toString()}`,
        {
          method: "GET",
          credentials: "include",
          headers: { "Content-Type": "application/json" },
        }
      );

      const response = await res.json();

      if (!res.ok) {
        throw new Error(response?.message || "Error cargando el listado");
      }

      setListado(Array.isArray(response?.data) ? response.data : []);
    } catch (err: any) {
      console.error(err);

      setListadoError(err?.message || "Error interno del servidor");
      setListado([]);
    } finally {
      setListadoLoading(false);
    }
  };

  const abrirListado = (grupoId?: string) => {
    setGrupoIdListado(grupoId ?? "");
    setMostrarListado(true);
    cargarListado(grupoId, ordenListado);
  };

  const imprimirListado = (grupoId?: string) => {
    const params = new URLSearchParams({ formato: "pdf", orden: ordenListado });

    if (grupoId) params.set("grupoId", grupoId);

    window.open(`${API_URL}/api/grupos/listado?${params.toString()}`, "_blank");
  };

  // Al cambiar el orden con el listado abierto, se vuelve a pedir
  // respetando el grupo que ya se estuviera filtrando.
  useEffect(() => {
    if (!mostrarListado) return;

    cargarListado(grupoIdListado || undefined, ordenListado);
  }, [ordenListado]);

  useEffect(() => {
    async function fetchGrupos() {
      try {
        setLoading(true);
        setError("");

        // 🔐 El token vive en una cookie httpOnly: basta con `credentials`.
        const res = await fetch(
          `${API_URL}/api/grupos`,
          {
            method: "GET",

            credentials: "include",
            headers: {
              "Content-Type":
                "application/json"
            },
          }
        );

        const response =
          await res.json();

        if (!res.ok) {
          throw new Error(
            response?.message ||
              "Error cargando grupos"
          );
        }

        const data =
          response?.data || response;

        setGrupos(
          normalizeData(data)
        );
      } catch (err: any) {
        console.error(err);

        setError(
          err?.message ||
            "Error interno del servidor"
        );

        setGrupos([]);
      } finally {
        setLoading(false);
      }
    }

    fetchGrupos();
  }, []);

  if (loading) {
    return (
      <p className="p-6">
        Cargando grupos...
      </p>
    );
  }

  if (error) {
    return (
      <div className="p-6">
        <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-red-700">
          Error: {error}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 p-6">
      {/* HEADER */}
      <section className="flex flex-wrap items-center justify-between gap-4 rounded-2xl border bg-white p-6 shadow-sm">
        <div>
          <h1 className="text-3xl font-bold">
            Grupos
          </h1>

          <p className="text-gray-600">
            Organización académica
            institucional
          </p>
        </div>

        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            onClick={() => abrirListado()}
            className="rounded-xl border border-slate-300 px-4 py-2 text-sm hover:bg-slate-50"
          >
            Ver listado de alumnos
          </button>

          <button
            type="button"
            onClick={() => imprimirListado(grupoIdListado || undefined)}
            className="rounded-xl bg-blue-600 px-4 py-2 text-sm text-white hover:bg-blue-700"
          >
            Imprimir listado (PDF)
          </button>
        </div>
      </section>

      {/* LISTADO DE ALUMNOS POR GRUPO */}
      {mostrarListado && (
        <section className="space-y-4 rounded-2xl border bg-white p-6 shadow-sm">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <h2 className="text-xl font-semibold">
              Listado de alumnos
              {grupoIdListado && (
                <span className="ml-2 text-sm font-normal text-gray-500">
                  (grupo filtrado)
                </span>
              )}
            </h2>

            <div className="flex flex-wrap items-center gap-2">
              <select
                value={ordenListado}
                onChange={(e) =>
                  setOrdenListado(e.target.value as OrdenListado)
                }
                aria-label="Ordenar listado"
                className="rounded-xl border border-slate-300 px-3 py-2 text-sm"
              >
                <option value="matricula">Ordenar por matrícula</option>
                <option value="nombre">Ordenar por nombre</option>
              </select>

              {grupoIdListado && (
                <button
                  type="button"
                  onClick={() => abrirListado()}
                  className="rounded-xl border border-slate-300 px-4 py-2 text-sm hover:bg-slate-50"
                >
                  Ver todos los grupos
                </button>
              )}

              <button
                type="button"
                onClick={() => setMostrarListado(false)}
                className="rounded-xl border border-slate-300 px-4 py-2 text-sm hover:bg-slate-50"
              >
                Cerrar
              </button>
            </div>
          </div>

          {listadoLoading ? (
            <p className="text-gray-500">Cargando listado...</p>
          ) : listadoError ? (
            <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-red-700">
              {listadoError}
            </div>
          ) : listado.length === 0 ? (
            <p className="text-gray-500">No hay alumnos para mostrar.</p>
          ) : (
            <div className="space-y-8">
              {listado.map((g, index) => (
                <div key={g.id ?? index}>
                  <div className="mb-2 flex flex-wrap items-baseline justify-between gap-2 border-b pb-2">
                    <h3 className="text-lg font-semibold">
                      Grupo {g.grupo ?? "—"}{" "}
                      <span className="text-sm font-normal text-gray-500">
                        · {g.carrera ?? "—"} · {g.semestre ?? "—"} ·{" "}
                        {g.turno ?? "—"}
                      </span>
                    </h3>

                    <div className="flex items-center gap-3">
                      <span className="text-sm text-gray-500">
                        {g.totalAlumnos ?? g.alumnos?.length ?? 0} alumno(s)
                      </span>

                      <button
                        type="button"
                        onClick={() => imprimirListado(g.id)}
                        className="rounded-xl border border-slate-300 px-3 py-1 text-xs hover:bg-slate-50"
                      >
                        Imprimir este grupo
                      </button>
                    </div>
                  </div>

                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-sm">
                      <thead className="bg-gray-50 text-gray-600">
                        <tr>
                          <th className="p-3">#</th>
                          <th className="p-3">Matrícula</th>
                          <th className="p-3">Alumno</th>
                          <th className="p-3">Estatus</th>
                        </tr>
                      </thead>

                      <tbody>
                        {(g.alumnos ?? []).map((a, i) => (
                          <tr
                            key={a.matricula ?? i}
                            className="border-b"
                          >
                            <td className="p-3">{a.no}</td>
                            <td className="p-3">{a.matricula}</td>
                            <td className="p-3">{a.alumno}</td>
                            <td className="p-3">{a.estatus}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>
      )}

      {/* GRID */}
      {(grupos ?? []).length ===
      0 ? (
        <section className="rounded-2xl bg-white p-6 shadow">
          <p className="text-gray-500">
            No hay grupos registrados.
          </p>
        </section>
      ) : (
        <section className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
          {(grupos ?? []).map(
            (g, index) => (
              <div
                key={g?.id ?? index}
                className="rounded-2xl border bg-white p-5 shadow"
              >
                <h2 className="text-xl font-semibold">
                  Grupo{" "}
                  {g?.nombre ??
                    "Sin nombre"}
                </h2>

                <p className="mt-2 text-gray-600">
                  Semestre:{" "}
                  {g?.semestre?.nombre ?? "No definido"}
                </p>

                {/* `nivel` y `turno` dejaron de ser texto suelto:
                    hoy son relaciones del schema. */}
                <p className="text-gray-600">
                  Turno: {g?.turno?.nombre ?? "Sin turno"}
                </p>

                <p className="text-gray-600">
                  Alumnos:{" "}
                  {g?._count?.alumnos ?? g?.alumnos?.length ?? 0}
                </p>

                <p className="text-gray-600">
                  Carrera:{" "}
                  {g?.semestre?.carrera?.nombre ?? "—"}
                </p>

                <div className="mt-4 flex flex-wrap gap-2">
                  <a
                    href={`/director/horarios`}
                    className="inline-block rounded-xl border border-slate-300 px-4 py-2 text-sm hover:bg-slate-50"
                  >
                    Ver horario del grupo
                  </a>

                  {g?.id && (
                    <>
                      <button
                        type="button"
                        onClick={() => abrirListado(g.id)}
                        className="rounded-xl border border-slate-300 px-4 py-2 text-sm hover:bg-slate-50"
                      >
                        Ver alumnos
                      </button>

                      <button
                        type="button"
                        onClick={() => imprimirListado(g.id)}
                        className="rounded-xl border border-slate-300 px-4 py-2 text-sm hover:bg-slate-50"
                      >
                        Imprimir
                      </button>
                    </>
                  )}
                </div>
              </div>
            )
          )}
        </section>
      )}
    </div>
  );
}