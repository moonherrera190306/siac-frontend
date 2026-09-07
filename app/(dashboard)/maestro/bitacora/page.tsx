"use client";

import { useCallback, useEffect, useState } from "react";
import { API_URL } from "@/lib/config";

const ESTADOS = [
  { id: "PRESENTE", label: "P", color: "bg-green-600" },
  { id: "RETARDO", label: "R", color: "bg-amber-500" },
  { id: "JUSTIFICADO", label: "J", color: "bg-blue-500" },
  { id: "FALTA", label: "F", color: "bg-red-600" },
];

// Un color distinto por estado de la ventana de registro, para que se
// distinga de un vistazo cuál clase ya se puede capturar.
const ESTILOS_ESTADO: Record<string, string> = {
  PENDIENTE: "bg-gray-100 text-gray-600",
  ABIERTA: "bg-green-100 text-green-700",
  VENCIDA: "bg-red-100 text-red-700",
  REGISTRADA: "bg-blue-100 text-blue-700",
};

export default function MaestroBitacoraPage() {
  const [clases, setClases] = useState<any[]>([]);
  const [meta, setMeta] = useState<any>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Clase seleccionada para registrar: el formulario se abre debajo de
  // las tarjetas en la misma pantalla.
  const [activa, setActiva] = useState<any>(null);
  const [alumnos, setAlumnos] = useState<any[]>([]);
  const [bitacora, setBitacora] = useState({
    tema: "",
    actividad: "",
    observaciones: "",
    incidencias: "",
  });

  const [cargandoForm, setCargandoForm] = useState(false);
  const [guardando, setGuardando] = useState(false);
  const [errorForm, setErrorForm] = useState("");
  const [aviso, setAviso] = useState("");

  const cargarClases = useCallback(async () => {
    try {
      const res = await fetch(`${API_URL}/api/clases/hoy`, {
        credentials: "include",
      });

      const json = await res.json();

      if (!res.ok) {
        throw new Error(json?.message || "Error al cargar las clases de hoy");
      }

      setClases(json?.data ?? []);
      setMeta(json?.meta ?? {});
      setError("");
    } catch (e: any) {
      setError(e.message || "Error al cargar las clases de hoy");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    cargarClases();

    // Las ventanas de registro se abren y se cierran solas con el paso del
    // tiempo (PENDIENTE -> ABIERTA -> VENCIDA), así que se refresca cada
    // minuto sin que el maestro tenga que recargar la página.
    const intervalo = setInterval(cargarClases, 60000);
    return () => clearInterval(intervalo);
  }, [cargarClases]);

  const abrirRegistro = async (clase: any) => {
    setActiva(clase);
    setErrorForm("");
    setAviso("");
    setAlumnos([]);
    setBitacora({ tema: "", actividad: "", observaciones: "", incidencias: "" });

    try {
      setCargandoForm(true);

      const res = await fetch(
        `${API_URL}/api/asistencias/clase/${clase.asignacionId}?fecha=${meta.fecha}`,
        { credentials: "include" }
      );

      const json = await res.json();

      if (!res.ok) {
        throw new Error(json?.message || "Error al cargar la lista de alumnos");
      }

      // Si no hay estado guardado, se asume presente: es lo normal.
      setAlumnos(
        (json?.data?.alumnos ?? []).map((a: any) => ({
          ...a,
          estado: a.estado || "PRESENTE",
        }))
      );

      const claseGuardada = json?.data?.clase;
      setBitacora({
        tema: claseGuardada?.tema || "",
        actividad: claseGuardada?.actividad || "",
        observaciones: claseGuardada?.observaciones || "",
        incidencias: claseGuardada?.incidencias || "",
      });
    } catch (e: any) {
      setErrorForm(e.message || "Error al cargar la lista de alumnos");
    } finally {
      setCargandoForm(false);
    }
  };

  const cerrarRegistro = () => {
    setActiva(null);
    setAlumnos([]);
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
    setErrorForm("");
    setAviso("");

    if (!bitacora.tema.trim()) {
      setErrorForm("El tema de la clase es obligatorio para registrar la sesión");
      return;
    }

    try {
      setGuardando(true);

      const res = await fetch(`${API_URL}/api/asistencias/clase`, {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          asignacionId: activa.asignacionId,
          horarioId: activa.horarioId,
          // Siempre se manda la fecha que calculó el backend: el navegador
          // puede estar en otra zona horaria y desfasar el día.
          fecha: meta.fecha,
          ...bitacora,
          asistencias: alumnos.map((a) => ({
            alumnoId: a.alumnoId,
            estado: a.estado,
          })),
        }),
      });

      const json = await res.json();

      if (!res.ok) {
        // 403 = la ventana de tolerancia ya se cerró (u otra regla del
        // backend): se muestra el motivo tal cual lo explica el backend.
        setErrorForm(json?.message || "No se pudo registrar la clase");
        await cargarClases();
        return;
      }

      setAviso("Clase registrada correctamente");
      cerrarRegistro();
      await cargarClases();
    } catch {
      setErrorForm("Error de conexión con el servidor");
    } finally {
      setGuardando(false);
    }
  };

  if (loading) return <p className="p-6">Cargando...</p>;

  const clasesOrdenadas = [...clases].sort((a, b) =>
    (a.horaInicio || "").localeCompare(b.horaInicio || "")
  );

  return (
    <div className="space-y-6">
      <section className="rounded-2xl border bg-white p-5 shadow-sm">
        <h1 className="text-3xl font-bold">Bitácora</h1>
        <p className="mt-1 text-gray-500">
          El registro de cada clase solo se acepta desde su hora de inicio y
          hasta {meta.toleranciaMinutos ?? 10} minutos después, porque la
          bitácora también funciona como control de asistencia del docente.
        </p>
        {meta.fecha && (
          <p className="mt-2 text-xs text-gray-400">
            Hoy es {meta.dia?.toLowerCase?.() ?? meta.dia} {meta.fecha} · hora
            del servidor {meta.hora}
          </p>
        )}
      </section>

      {error && (
        <p className="rounded-xl bg-red-50 p-4 text-red-600">{error}</p>
      )}

      {aviso && (
        <p className="rounded-xl bg-green-50 p-4 text-green-700">{aviso}</p>
      )}

      {clasesOrdenadas.length === 0 ? (
        <div className="rounded-2xl border bg-white p-8 text-center text-gray-500">
          No tienes clases programadas para hoy.
        </div>
      ) : (
        <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
          {clasesOrdenadas.map((c) => (
            <div key={c.horarioId} className="rounded-2xl border bg-white p-5 shadow-sm">
              <div className="flex items-start justify-between gap-2">
                <div>
                  <p className="font-semibold">{c.materia}</p>
                  <p className="text-xs text-gray-500">
                    Grupo {c.grupo} · {c.aula || "sin aula"}
                  </p>
                </div>

                <span
                  className={`rounded-full px-3 py-1 text-xs ${
                    ESTILOS_ESTADO[c.estado] || ESTILOS_ESTADO.PENDIENTE
                  }`}
                >
                  {c.estado}
                </span>
              </div>

              <p className="mt-2 text-sm text-gray-600">
                {c.horaInicio} - {c.horaFin}
              </p>

              {c.estado === "PENDIENTE" && (
                <p className="mt-2 text-sm text-gray-500">
                  Abre a las {c.horaInicio}
                  {typeof c.abreEn === "number" ? ` (en ${c.abreEn} min)` : ""}
                </p>
              )}

              {c.estado === "ABIERTA" && (
                <p className="mt-2 text-sm font-medium text-green-700">
                  Te quedan {c.restan} min (cierra a las {c.cierraA})
                </p>
              )}

              {c.estado === "VENCIDA" && (
                <p className="mt-2 text-sm text-red-600">
                  Se cerró el registro a las {c.cierraA} — repórtalo a
                  dirección
                </p>
              )}

              {c.estado === "REGISTRADA" && (
                <div className="mt-2 text-sm text-blue-700">
                  <p>Tema: {c.tema || "—"}</p>
                  {c.minutosRetardo > 0 && (
                    <p className="text-amber-600">
                      Registrada con {c.minutosRetardo} min de retardo
                    </p>
                  )}
                </div>
              )}

              <button
                onClick={() => abrirRegistro(c)}
                disabled={c.estado !== "ABIERTA"}
                className="mt-4 w-full rounded-xl bg-blue-600 px-4 py-2 text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:bg-gray-300"
              >
                Registrar clase
              </button>
            </div>
          ))}
        </div>
      )}

      {activa && (
        <section className="rounded-2xl border bg-white p-5 shadow-sm">
          <div className="flex flex-wrap items-center justify-between gap-3 border-b pb-4">
            <div>
              <h2 className="text-xl font-bold">{activa.materia}</h2>
              <p className="text-sm text-gray-500">
                Grupo {activa.grupo} · {activa.horaInicio} - {activa.horaFin}
              </p>
            </div>

            <button
              onClick={cerrarRegistro}
              className="rounded-lg border px-3 py-1 text-xs hover:bg-gray-50"
            >
              Cerrar
            </button>
          </div>

          {errorForm && (
            <p className="mt-4 rounded-xl bg-red-50 p-4 text-red-600">
              {errorForm}
            </p>
          )}

          {cargandoForm ? (
            <p className="mt-4 text-gray-500">Cargando lista de alumnos...</p>
          ) : (
            <>
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
              </div>

              <div className="mt-3 overflow-x-auto rounded-2xl border">
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
                        <td
                          colSpan={3}
                          className="px-4 py-6 text-center text-gray-500"
                        >
                          Este grupo no tiene alumnos activos.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>

              <div className="mt-4 grid gap-3 md:grid-cols-2">
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
                {guardando ? "Guardando..." : "Registrar clase"}
              </button>
            </>
          )}
        </section>
      )}
    </div>
  );
}
