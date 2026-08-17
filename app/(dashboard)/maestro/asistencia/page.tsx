"use client";

import { useEffect, useState } from "react";
import { API_URL } from "@/lib/config";

const ESTADOS = [
  { id: "PRESENTE", label: "P", color: "bg-green-600" },
  { id: "RETARDO", label: "R", color: "bg-amber-500" },
  { id: "JUSTIFICADO", label: "J", color: "bg-blue-500" },
  { id: "FALTA", label: "F", color: "bg-red-600" },
];

function hoy() {
  const d = new Date();
  const mes = String(d.getMonth() + 1).padStart(2, "0");
  const dia = String(d.getDate()).padStart(2, "0");
  return `${d.getFullYear()}-${mes}-${dia}`;
}

export default function MaestroAsistenciaPage() {
  const [asignaciones, setAsignaciones] = useState<any[]>([]);
  const [asignacionId, setAsignacionId] = useState("");
  const [fecha, setFecha] = useState(hoy());

  const [alumnos, setAlumnos] = useState<any[]>([]);
  const [info, setInfo] = useState<any>(null);

  const [bitacora, setBitacora] = useState({
    tema: "",
    actividad: "",
    observaciones: "",
    incidencias: "",
  });

  const [historial, setHistorial] = useState<any[]>([]);
  const [verHistorial, setVerHistorial] = useState(false);

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

  const abrirLista = async (id: string, dia: string) => {
    try {
      setCargando(true);
      setAsignacionId(id);
      setVerHistorial(false);
      setAviso("");
      setError("");

      const res = await fetch(
        `${API_URL}/api/asistencias/clase/${id}?fecha=${dia}`,
        { credentials: "include" }
      );

      const json = await res.json();

      if (!res.ok) throw new Error(json?.message || "Error al cargar la lista");

      const clase = json?.data?.clase;

      setInfo(json?.data?.asignacion ?? null);

      // Si no hay estado guardado, se asume presente: es lo normal.
      setAlumnos(
        (json?.data?.alumnos ?? []).map((a: any) => ({
          ...a,
          estado: a.estado || "PRESENTE",
        }))
      );

      setBitacora({
        tema: clase?.tema || "",
        actividad: clase?.actividad || "",
        observaciones: clase?.observaciones || "",
        incidencias: clase?.incidencias || "",
      });
    } catch (e: any) {
      setError(e.message || "Error al cargar la lista");
      setAlumnos([]);
      setInfo(null);
    } finally {
      setCargando(false);
    }
  };

  const marcar = (alumnoId: string, estado: string) => {
    setAlumnos((prev) =>
      prev.map((a) => (a.alumnoId === alumnoId ? { ...a, estado } : a))
    );
  };

  const marcarTodos = (estado: string) => {
    setAlumnos((prev) => prev.map((a) => ({ ...a, estado })));
  };

  const guardar = async () => {
    setError("");
    setAviso("");

    if (!bitacora.tema.trim()) {
      setError("El tema de la clase es obligatorio para registrar la sesión");
      return;
    }

    try {
      setGuardando(true);

      const res = await fetch(`${API_URL}/api/asistencias/clase`, {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          asignacionId,
          fecha,
          ...bitacora,
          asistencias: alumnos.map((a) => ({
            alumnoId: a.alumnoId,
            estado: a.estado,
          })),
        }),
      });

      const json = await res.json();

      if (!res.ok) {
        setError(json?.message || "No se pudo registrar la asistencia");
        return;
      }

      setAviso("Asistencia y bitácora registradas");
    } catch {
      setError("Error de conexión con el servidor");
    } finally {
      setGuardando(false);
    }
  };

  const cargarHistorial = async () => {
    setError("");

    const res = await fetch(
      `${API_URL}/api/asistencias/clases/${asignacionId}`,
      { credentials: "include" }
    );

    const json = await res.json();

    if (!res.ok) {
      setError(json?.message || "No se pudo cargar el historial");
      return;
    }

    setHistorial(json?.data ?? []);
    setVerHistorial(true);
  };

  const resumen = {
    presentes: alumnos.filter((a) => a.estado === "PRESENTE").length,
    retardos: alumnos.filter((a) => a.estado === "RETARDO").length,
    justificados: alumnos.filter((a) => a.estado === "JUSTIFICADO").length,
    faltas: alumnos.filter((a) => a.estado === "FALTA").length,
  };

  if (loading) return <p className="p-6">Cargando...</p>;

  return (
    <div className="space-y-6">
      <section className="rounded-3xl border bg-white p-6 shadow-sm">
        <h1 className="text-3xl font-bold">Asistencia</h1>
        <p className="text-gray-500">
          Pasa lista y registra la bitácora de la clase en la misma pantalla.
        </p>
      </section>

      {error && (
        <p className="rounded-xl bg-red-50 p-4 text-red-600">{error}</p>
      )}

      {aviso && (
        <p className="rounded-xl bg-green-50 p-4 text-green-700">{aviso}</p>
      )}

      <section className="rounded-3xl border bg-white p-5 shadow-sm">
        <label className="text-sm text-gray-600">Fecha de la clase</label>

        <input
          type="date"
          value={fecha}
          onChange={(e) => {
            setFecha(e.target.value);
            if (asignacionId) abrirLista(asignacionId, e.target.value);
          }}
          className="mt-1 block rounded-xl border border-gray-300 px-4 py-2"
        />
      </section>

      {asignaciones.length === 0 ? (
        <div className="rounded-3xl border bg-white p-8 text-center text-gray-500">
          No tienes materias asignadas en el ciclo activo.
        </div>
      ) : (
        <div className="grid gap-3 md:grid-cols-3 xl:grid-cols-4">
          {asignaciones.map((a) => (
            <button
              key={a.id}
              onClick={() => abrirLista(a.id, fecha)}
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

      {cargando && <p className="text-gray-500">Cargando lista...</p>}

      {info && !cargando && !verHistorial && (
        <>
          <section className="rounded-3xl border bg-white p-5 shadow-sm">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <h2 className="text-xl font-bold">{info.materia}</h2>
                <p className="text-sm text-gray-500">Grupo {info.grupo}</p>
              </div>

              <div className="flex flex-wrap gap-2 text-xs">
                <span className="rounded-full bg-green-100 px-3 py-1 text-green-700">
                  {resumen.presentes} presentes
                </span>
                <span className="rounded-full bg-amber-100 px-3 py-1 text-amber-700">
                  {resumen.retardos} retardos
                </span>
                <span className="rounded-full bg-blue-100 px-3 py-1 text-blue-700">
                  {resumen.justificados} justificados
                </span>
                <span className="rounded-full bg-red-100 px-3 py-1 text-red-700">
                  {resumen.faltas} faltas
                </span>
              </div>
            </div>

            <div className="mt-4 flex flex-wrap gap-2">
              {ESTADOS.map((e) => (
                <button
                  key={e.id}
                  onClick={() => marcarTodos(e.id)}
                  className="rounded-lg border px-3 py-1 text-xs hover:bg-gray-50"
                >
                  Marcar todos: {e.id}
                </button>
              ))}

              <button
                onClick={cargarHistorial}
                className="ml-auto rounded-lg border px-3 py-1 text-xs hover:bg-gray-50"
              >
                Ver historial
              </button>
            </div>
          </section>

          <div className="overflow-x-auto rounded-3xl border bg-white shadow-sm">
            <table className="w-full text-left text-sm">
              <thead className="bg-gray-50 text-gray-600">
                <tr>
                  <th className="px-4 py-3">Matrícula</th>
                  <th className="px-4 py-3">Alumno</th>
                  <th className="px-4 py-3 text-center">Asistencia</th>
                </tr>
              </thead>

              <tbody>
                {alumnos.map((a) => (
                  <tr key={a.alumnoId} className="border-t">
                    <td className="px-4 py-2">{a.matricula}</td>
                    <td className="px-4 py-2">{a.nombre}</td>

                    <td className="px-4 py-2">
                      <div className="flex justify-center gap-1">
                        {ESTADOS.map((e) => (
                          <button
                            key={e.id}
                            title={e.id}
                            onClick={() => marcar(a.alumnoId, e.id)}
                            className={`h-8 w-8 rounded-lg text-xs font-bold text-white transition ${
                              a.estado === e.id
                                ? e.color
                                : "bg-gray-200 text-gray-500 hover:bg-gray-300"
                            }`}
                          >
                            {e.label}
                          </button>
                        ))}
                      </div>
                    </td>
                  </tr>
                ))}

                {alumnos.length === 0 && (
                  <tr>
                    <td colSpan={3} className="px-4 py-6 text-center text-gray-500">
                      Este grupo no tiene alumnos activos.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          <section className="rounded-3xl border bg-white p-5 shadow-sm">
            <h2 className="mb-3 font-semibold">Bitácora de la clase</h2>

            <div className="grid gap-3 md:grid-cols-2">
              <input
                placeholder="Tema impartido (obligatorio)"
                value={bitacora.tema}
                onChange={(e) =>
                  setBitacora({ ...bitacora, tema: e.target.value })
                }
                className="rounded-xl border border-gray-300 px-4 py-2"
              />

              <input
                placeholder="Actividad realizada"
                value={bitacora.actividad}
                onChange={(e) =>
                  setBitacora({ ...bitacora, actividad: e.target.value })
                }
                className="rounded-xl border border-gray-300 px-4 py-2"
              />

              <textarea
                placeholder="Observaciones"
                value={bitacora.observaciones}
                onChange={(e) =>
                  setBitacora({ ...bitacora, observaciones: e.target.value })
                }
                className="rounded-xl border border-gray-300 px-4 py-2"
                rows={3}
              />

              <textarea
                placeholder="Incidencias"
                value={bitacora.incidencias}
                onChange={(e) =>
                  setBitacora({ ...bitacora, incidencias: e.target.value })
                }
                className="rounded-xl border border-gray-300 px-4 py-2"
                rows={3}
              />
            </div>

            <button
              onClick={guardar}
              disabled={guardando || alumnos.length === 0}
              className="mt-4 w-full rounded-xl bg-blue-600 py-2 text-white transition hover:bg-blue-700 disabled:bg-gray-400"
            >
              {guardando ? "Guardando..." : "Registrar asistencia y bitácora"}
            </button>
          </section>
        </>
      )}

      {verHistorial && (
        <section className="rounded-3xl border bg-white shadow-sm">
          <div className="flex items-center justify-between border-b px-5 py-4">
            <h2 className="text-lg font-semibold">Clases registradas</h2>

            <button
              onClick={() => setVerHistorial(false)}
              className="rounded-lg border px-3 py-1 text-xs hover:bg-gray-50"
            >
              Volver a la lista
            </button>
          </div>

          {historial.length === 0 ? (
            <p className="p-6 text-center text-gray-500">
              Todavía no hay clases registradas en esta materia.
            </p>
          ) : (
            <table className="w-full text-left text-sm">
              <thead className="bg-gray-50 text-gray-600">
                <tr>
                  <th className="px-4 py-3">Fecha</th>
                  <th className="px-4 py-3">Tema</th>
                  <th className="px-4 py-3">Alumnos</th>
                  <th className="px-4 py-3">Faltas</th>
                  <th className="px-4 py-3">Retardos</th>
                </tr>
              </thead>

              <tbody>
                {historial.map((c) => (
                  <tr key={c.id} className="border-t">
                    <td className="px-4 py-2">
                      {new Date(c.fecha).toLocaleDateString("es-MX")}
                    </td>
                    <td className="px-4 py-2">{c.tema || "—"}</td>
                    <td className="px-4 py-2">{c.alumnos}</td>
                    <td className="px-4 py-2">{c.faltas}</td>
                    <td className="px-4 py-2">{c.retardos}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </section>
      )}
    </div>
  );
}
