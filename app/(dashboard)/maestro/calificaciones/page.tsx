"use client";

import { useEffect, useState } from "react";
import { API_URL } from "@/lib/config";

// Columnas capturables del kardex, en el orden del formato oficial.
const COLUMNAS = [
  { id: "PP", label: "PP", titulo: "Primer parcial" },
  { id: "SP", label: "SP", titulo: "Segundo parcial" },
  { id: "PROM", label: "PROM", titulo: "Promedio (calculado)" },
  { id: "EF", label: "EF", titulo: "Examen final" },
  { id: "O", label: "O", titulo: "Ordinario" },
  { id: "EE", label: "EE", titulo: "Extraordinario" },
  { id: "EA", label: "EA", titulo: "Adicional" },
  { id: "EER", label: "EER", titulo: "Especial" },
  { id: "ND", label: "ND", titulo: "Nota definitiva (calculada)" },
];

const CALCULADAS = ["PROM", "ND"];

const COLOR_ESTATUS: Record<string, string> = {
  APROBADA: "bg-green-100 text-green-700",
  REPROBADA: "bg-red-100 text-red-700",
  NO_PRESENTO: "bg-amber-100 text-amber-700",
  EN_CURSO: "bg-gray-100 text-gray-600",
};

export default function MaestroCalificacionesPage() {
  const [asignaciones, setAsignaciones] = useState<any[]>([]);
  const [asignacionId, setAsignacionId] = useState("");

  const [rejilla, setRejilla] = useState<any>(null);
  const [filas, setFilas] = useState<any[]>([]);

  const [loading, setLoading] = useState(true);
  const [cargando, setCargando] = useState(false);
  const [guardando, setGuardando] = useState(false);

  const [error, setError] = useState("");
  const [aviso, setAviso] = useState("");

  useEffect(() => {
    const cargar = async () => {
      try {
        const res = await fetch(`${API_URL}/api/docentes/grupos`, {
          credentials: "include",
        });

        const json = await res.json();

        if (!res.ok) throw new Error(json?.message || "Error cargando materias");

        setAsignaciones(json?.data ?? []);
      } catch (e: any) {
        setError(e.message || "Error cargando materias");
      } finally {
        setLoading(false);
      }
    };

    cargar();
  }, []);

  const abrir = async (id: string) => {
    try {
      setCargando(true);
      setAsignacionId(id);
      setAviso("");
      setError("");

      const res = await fetch(`${API_URL}/api/calificaciones/captura/${id}`, {
        credentials: "include",
      });

      const json = await res.json();

      if (!res.ok) throw new Error(json?.message || "Error al abrir la materia");

      setRejilla(json?.data ?? null);
      setFilas(json?.data?.alumnos ?? []);
    } catch (e: any) {
      setError(e.message || "Error al abrir la materia");
      setRejilla(null);
      setFilas([]);
    } finally {
      setCargando(false);
    }
  };

  const abiertas: string[] = rejilla?.columnasAbiertas ?? [];

  const esAcreditacion = rejilla?.asignacion?.tipoEvaluacion === "ACREDITACION";

  const editable = (columna: string, fila: any) => {
    if (CALCULADAS.includes(columna)) return false;
    if (fila.migrado) return false;
    return abiertas.includes(columna);
  };

  const cambiar = (alumnoId: string, columna: string, valor: string) => {
    setFilas((prev) =>
      prev.map((f) => (f.alumnoId === alumnoId ? { ...f, [columna]: valor } : f))
    );
  };

  const guardar = async () => {
    setError("");
    setAviso("");

    if (abiertas.length === 0) {
      setError("No hay ninguna columna abierta para capturar");
      return;
    }

    // Solo se envía lo capturable: lo calculado y lo migrado se omite.
    const payload = filas
      .filter((f) => !f.migrado)
      .map((f) => {
        const fila: any = {
          alumnoId: f.alumnoId,
          materiaId: rejilla.asignacion.materiaId,
          cicloEscolarId: rejilla.asignacion.cicloEscolarId,
          articulo: f.articulo || "",
        };

        for (const c of abiertas) {
          fila[c] = f[c] ?? "";
        }

        return fila;
      });

    if (payload.length === 0) {
      setError("No hay filas que guardar");
      return;
    }

    try {
      setGuardando(true);

      const res = await fetch(`${API_URL}/api/calificaciones`, {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const json = await res.json();

      if (!res.ok) {
        setError(json?.message || "No se pudieron guardar las calificaciones");
        return;
      }

      setAviso("Calificaciones guardadas correctamente");
      abrir(asignacionId);
    } catch {
      setError("Error de conexión con el servidor");
    } finally {
      setGuardando(false);
    }
  };

  if (loading) return <p className="p-6">Cargando...</p>;

  return (
    <div className="space-y-6">
      <section className="rounded-3xl border bg-white p-6 shadow-sm">
        <h1 className="text-3xl font-bold">Calificaciones</h1>
        <p className="text-gray-500">
          Kardex oficial. Solo se pueden capturar las columnas que dirección
          tenga abiertas.
        </p>
      </section>

      {error && (
        <p className="rounded-xl bg-red-50 p-4 text-red-600">{error}</p>
      )}

      {aviso && (
        <p className="rounded-xl bg-green-50 p-4 text-green-700">{aviso}</p>
      )}

      {asignaciones.length === 0 ? (
        <div className="rounded-3xl border bg-white p-8 text-center text-gray-500">
          No tienes materias asignadas en el ciclo activo.
        </div>
      ) : (
        <div className="grid gap-3 md:grid-cols-3 xl:grid-cols-4">
          {asignaciones.map((a) => (
            <button
              key={a.id}
              onClick={() => abrir(a.id)}
              className={`rounded-2xl border bg-white p-4 text-left shadow-sm transition hover:border-blue-400 ${
                asignacionId === a.id ? "border-blue-500" : ""
              }`}
            >
              <p className="font-semibold">{a.materia?.nombre}</p>
              <p className="text-xs text-gray-500">
                Grupo {a.grupo?.nombre} · {a.grupo?._count?.alumnos ?? 0} alumnos
              </p>
            </button>
          ))}
        </div>
      )}

      {cargando && <p className="text-gray-500">Cargando rejilla...</p>}

      {rejilla && !cargando && (
        <>
          <section className="rounded-3xl border bg-white p-5 shadow-sm">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <h2 className="text-xl font-bold">
                  {rejilla.asignacion.materia}
                </h2>
                <p className="text-sm text-gray-500">
                  Grupo {rejilla.asignacion.grupo} · {rejilla.asignacion.ciclo} ·{" "}
                  {esAcreditacion ? "AC / NA" : "escala 1 - 10"}
                </p>
              </div>

              <div className="text-sm">
                {abiertas.length === 0 ? (
                  <span className="rounded-full bg-amber-100 px-3 py-1 text-amber-700">
                    Captura cerrada
                  </span>
                ) : (
                  <span className="rounded-full bg-green-100 px-3 py-1 text-green-700">
                    Abierto: {abiertas.join(", ")}
                  </span>
                )}
              </div>
            </div>
          </section>

          <div className="overflow-x-auto rounded-3xl border bg-white shadow-sm">
            <table className="w-full text-left text-sm">
              <thead className="bg-gray-50 text-gray-600">
                <tr>
                  <th className="px-3 py-3">Matrícula</th>
                  <th className="px-3 py-3">Alumno</th>

                  {COLUMNAS.map((c) => (
                    <th
                      key={c.id}
                      title={c.titulo}
                      className={`px-2 py-3 text-center ${
                        CALCULADAS.includes(c.id) ? "text-gray-400" : ""
                      }`}
                    >
                      {c.label}
                    </th>
                  ))}

                  <th className="px-3 py-3">Estatus</th>
                </tr>
              </thead>

              <tbody>
                {filas.map((f) => (
                  <tr key={f.alumnoId} className="border-t">
                    <td className="px-3 py-2">{f.matricula}</td>

                    <td className="px-3 py-2">
                      {f.nombre}

                      {f.migrado && (
                        <span className="ml-2 rounded bg-slate-100 px-2 py-0.5 text-xs text-slate-500">
                          migrado
                        </span>
                      )}
                    </td>

                    {COLUMNAS.map((c) => (
                      <td key={c.id} className="px-1 py-2 text-center">
                        {editable(c.id, f) ? (
                          <input
                            value={f[c.id] ?? ""}
                            onChange={(e) =>
                              cambiar(f.alumnoId, c.id, e.target.value)
                            }
                            placeholder={esAcreditacion ? "AC" : "—"}
                            className="w-14 rounded-lg border border-gray-300 px-2 py-1 text-center focus:border-blue-500 focus:outline-none"
                          />
                        ) : (
                          <span
                            className={
                              CALCULADAS.includes(c.id)
                                ? "font-semibold text-slate-700"
                                : "text-gray-400"
                            }
                          >
                            {f[c.id] || "—"}
                          </span>
                        )}
                      </td>
                    ))}

                    <td className="px-3 py-2">
                      <span
                        className={`rounded-full px-2 py-1 text-xs ${
                          COLOR_ESTATUS[f.estatus] || "bg-gray-100 text-gray-600"
                        }`}
                      >
                        {(f.estatus || "").replace("_", " ")}
                      </span>
                    </td>
                  </tr>
                ))}

                {filas.length === 0 && (
                  <tr>
                    <td
                      colSpan={COLUMNAS.length + 3}
                      className="px-4 py-6 text-center text-gray-500"
                    >
                      Este grupo no tiene alumnos activos.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          <div className="flex items-center justify-between">
            <p className="text-sm text-gray-500">
              PROM y ND los calcula el sistema. El .5 sube (7.5 → 8).
            </p>

            <button
              onClick={guardar}
              disabled={guardando || abiertas.length === 0}
              className="rounded-xl bg-blue-600 px-6 py-2 text-white transition hover:bg-blue-700 disabled:bg-gray-400"
            >
              {guardando ? "Guardando..." : "Guardar"}
            </button>
          </div>
        </>
      )}
    </div>
  );
}
