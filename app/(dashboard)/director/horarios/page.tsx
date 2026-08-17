"use client";

import { useEffect, useState } from "react";
import { API_URL } from "@/lib/config";

const DIAS = ["LUNES", "MARTES", "MIERCOLES", "JUEVES", "VIERNES", "SABADO"];

const ETIQUETA: Record<string, string> = {
  LUNES: "Lunes",
  MARTES: "Martes",
  MIERCOLES: "Miércoles",
  JUEVES: "Jueves",
  VIERNES: "Viernes",
  SABADO: "Sábado",
};

type Grupo = {
  id: string;
  nombre: string;
  turno?: { nombre?: string } | null;
  semestre?: { nombre?: string } | null;
};

type Bloque = {
  id: string;
  asignacionId: string;
  dia: string;
  horaInicio: string;
  horaFin: string;
  aula?: string | null;
  materia?: string;
  docente?: string;
};

type Asignacion = {
  id: string;
  grupoId: string;
  materia?: { nombre?: string };
  docente?: { nombre?: string | null; user?: { name?: string } };
};

export default function DirectorHorariosPage() {
  const [grupos, setGrupos] = useState<Grupo[]>([]);
  const [grupoId, setGrupoId] = useState("");

  const [bloques, setBloques] = useState<Bloque[]>([]);
  const [asignaciones, setAsignaciones] = useState<Asignacion[]>([]);

  const [loading, setLoading] = useState(true);
  const [cargandoGrupo, setCargandoGrupo] = useState(false);
  const [error, setError] = useState("");
  const [aviso, setAviso] = useState("");

  const [nuevo, setNuevo] = useState({
    asignacionId: "",
    dia: "LUNES",
    horaInicio: "07:00",
    horaFin: "08:00",
    aula: "",
  });

  useEffect(() => {
    const cargar = async () => {
      try {
        const [rg, ra] = await Promise.all([
          fetch(`${API_URL}/api/grupos`, { credentials: "include" }),
          fetch(`${API_URL}/api/asignaciones`, { credentials: "include" }),
        ]);

        const [jg, ja] = await Promise.all([rg.json(), ra.json()]);

        if (!rg.ok) throw new Error(jg?.message || "Error al cargar grupos");

        setGrupos(jg?.data ?? []);
        setAsignaciones(ja?.data ?? []);
      } catch (e: any) {
        setError(e.message || "Error al cargar");
      } finally {
        setLoading(false);
      }
    };

    cargar();
  }, []);

  const cargarHorario = async (id: string) => {
    try {
      setCargandoGrupo(true);
      setGrupoId(id);
      setAviso("");

      const res = await fetch(`${API_URL}/api/horarios/grupo/${id}`, {
        credentials: "include",
      });

      const json = await res.json();

      if (!res.ok) throw new Error(json?.message || "Error al cargar el horario");

      setBloques(json?.data ?? []);
      setError("");
    } catch (e: any) {
      setError(e.message || "Error al cargar el horario");
    } finally {
      setCargandoGrupo(false);
    }
  };

  const asignacionesDelGrupo = asignaciones.filter((a) => a.grupoId === grupoId);

  const agregar = async () => {
    setError("");
    setAviso("");

    if (!nuevo.asignacionId) {
      setError("Selecciona la materia");
      return;
    }

    const res = await fetch(`${API_URL}/api/horarios`, {
      method: "POST",
      credentials: "include",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(nuevo),
    });

    const json = await res.json();

    if (!res.ok) {
      // 409 = choque de grupo o de docente. El mensaje ya explica cuál.
      setError(json?.message || "No se pudo agregar el bloque");
      return;
    }

    setAviso("Bloque agregado");
    setNuevo({ ...nuevo, aula: "" });
    cargarHorario(grupoId);
  };

  const eliminar = async (id: string) => {
    setError("");
    setAviso("");

    const res = await fetch(`${API_URL}/api/horarios/${id}`, {
      method: "DELETE",
      credentials: "include",
    });

    const json = await res.json();

    if (!res.ok) {
      setError(json?.message || "No se pudo eliminar el bloque");
      return;
    }

    setAviso("Bloque eliminado");
    cargarHorario(grupoId);
  };

  if (loading) return <p className="p-6">Cargando...</p>;

  return (
    <div className="space-y-6">
      <section className="rounded-2xl border bg-white p-6 shadow-sm">
        <h1 className="text-3xl font-bold">Horarios</h1>
        <p className="text-gray-500">
          Bloques por grupo del ciclo activo. El sistema rechaza choques de
          grupo y de docente.
        </p>
      </section>

      {error && (
        <p className="rounded-xl bg-red-50 p-4 text-red-600">{error}</p>
      )}

      {aviso && (
        <p className="rounded-xl bg-green-50 p-4 text-green-700">{aviso}</p>
      )}

      <div className="grid gap-3 md:grid-cols-3 xl:grid-cols-5">
        {grupos.map((g) => (
          <button
            key={g.id}
            onClick={() => cargarHorario(g.id)}
            className={`rounded-2xl border bg-white p-4 text-left shadow-sm transition hover:border-blue-400 ${
              grupoId === g.id ? "border-blue-500" : ""
            }`}
          >
            <p className="font-semibold">{g.nombre}</p>
            <p className="text-xs text-gray-500">
              {g.semestre?.nombre || "Sin semestre"} ·{" "}
              {g.turno?.nombre || "Sin turno"}
            </p>
          </button>
        ))}
      </div>

      {grupos.length === 0 && (
        <div className="rounded-2xl border bg-white p-8 text-center text-gray-500">
          No hay grupos registrados.
        </div>
      )}

      {grupoId && !cargandoGrupo && (
        <>
          <section className="rounded-2xl border bg-white p-5 shadow-sm">
            <h2 className="mb-3 font-semibold">Agregar bloque</h2>

            {asignacionesDelGrupo.length === 0 ? (
              <p className="text-gray-500">
                Este grupo no tiene materias asignadas todavía. Asígnalas
                primero desde Asignaciones.
              </p>
            ) : (
              <div className="grid gap-3 md:grid-cols-6">
                <select
                  className="rounded-xl border border-gray-300 px-3 py-2 md:col-span-2"
                  value={nuevo.asignacionId}
                  onChange={(e) =>
                    setNuevo({ ...nuevo, asignacionId: e.target.value })
                  }
                >
                  <option value="">Materia...</option>

                  {asignacionesDelGrupo.map((a) => (
                    <option key={a.id} value={a.id}>
                      {a.materia?.nombre} —{" "}
                      {a.docente?.nombre || a.docente?.user?.name || "Sin docente"}
                    </option>
                  ))}
                </select>

                <select
                  className="rounded-xl border border-gray-300 px-3 py-2"
                  value={nuevo.dia}
                  onChange={(e) => setNuevo({ ...nuevo, dia: e.target.value })}
                >
                  {DIAS.map((d) => (
                    <option key={d} value={d}>
                      {ETIQUETA[d]}
                    </option>
                  ))}
                </select>

                <input
                  type="time"
                  className="rounded-xl border border-gray-300 px-3 py-2"
                  value={nuevo.horaInicio}
                  onChange={(e) =>
                    setNuevo({ ...nuevo, horaInicio: e.target.value })
                  }
                />

                <input
                  type="time"
                  className="rounded-xl border border-gray-300 px-3 py-2"
                  value={nuevo.horaFin}
                  onChange={(e) =>
                    setNuevo({ ...nuevo, horaFin: e.target.value })
                  }
                />

                <div className="flex gap-2">
                  <input
                    className="w-full rounded-xl border border-gray-300 px-3 py-2"
                    placeholder="Aula"
                    value={nuevo.aula}
                    onChange={(e) =>
                      setNuevo({ ...nuevo, aula: e.target.value })
                    }
                  />

                  <button
                    onClick={agregar}
                    className="rounded-xl bg-blue-600 px-4 py-2 text-white hover:bg-blue-700"
                  >
                    +
                  </button>
                </div>
              </div>
            )}
          </section>

          <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {DIAS.filter((d) => bloques.some((b) => b.dia === d)).map((dia) => (
              <div
                key={dia}
                className="rounded-2xl border bg-white p-5 shadow-sm"
              >
                <h3 className="mb-3 font-semibold text-slate-800">
                  {ETIQUETA[dia]}
                </h3>

                <ul className="space-y-3">
                  {bloques
                    .filter((b) => b.dia === dia)
                    .sort((a, b) => a.horaInicio.localeCompare(b.horaInicio))
                    .map((b) => (
                      <li
                        key={b.id}
                        className="rounded-xl border border-gray-100 bg-gray-50 p-3"
                      >
                        <div className="flex items-start justify-between gap-2">
                          <div>
                            <p className="text-sm font-medium text-blue-700">
                              {b.horaInicio} - {b.horaFin}
                            </p>

                            <p className="font-semibold">{b.materia}</p>

                            <p className="text-sm text-gray-500">{b.docente}</p>

                            {b.aula && (
                              <p className="text-xs text-gray-400">
                                Aula {b.aula}
                              </p>
                            )}
                          </div>

                          <button
                            onClick={() => eliminar(b.id)}
                            className="rounded-lg border px-2 py-1 text-xs hover:bg-red-50"
                          >
                            Quitar
                          </button>
                        </div>
                      </li>
                    ))}
                </ul>
              </div>
            ))}
          </section>

          {bloques.length === 0 && (
            <div className="rounded-2xl border bg-white p-8 text-center text-gray-500">
              Este grupo todavía no tiene bloques de horario.
            </div>
          )}
        </>
      )}

      {cargandoGrupo && <p className="text-gray-500">Cargando horario...</p>}
    </div>
  );
}
