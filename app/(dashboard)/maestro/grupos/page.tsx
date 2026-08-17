"use client";

import { useEffect, useState } from "react";
import { API_URL } from "@/lib/config";

const ETIQUETA: Record<string, string> = {
  LUNES: "Lun",
  MARTES: "Mar",
  MIERCOLES: "Mié",
  JUEVES: "Jue",
  VIERNES: "Vie",
  SABADO: "Sáb",
};

type Asignacion = {
  id: string;
  aula?: string | null;
  materia?: { nombre?: string; clave?: string | null };
  cicloEscolar?: { nombre?: string };
  grupo?: {
    id: string;
    nombre?: string;
    turno?: { nombre?: string } | null;
    semestre?: { nombre?: string } | null;
    _count?: { alumnos?: number };
  };
  horarios?: {
    id: string;
    dia: string;
    horaInicio: string;
    horaFin: string;
  }[];
};

export default function MaestroGruposPage() {
  const [asignaciones, setAsignaciones] = useState<Asignacion[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const cargar = async () => {
      try {
        const res = await fetch(`${API_URL}/api/docentes/grupos`, {
          credentials: "include",
        });

        const json = await res.json();

        if (!res.ok) {
          throw new Error(json?.message || "Error cargando grupos");
        }

        setAsignaciones(json?.data ?? []);
      } catch (e: any) {
        setError(e.message || "Error cargando grupos");
      } finally {
        setLoading(false);
      }
    };

    cargar();
  }, []);

  if (loading) return <p className="p-6">Cargando...</p>;

  // Un grupo puede aparecer en varias asignaciones (una por materia).
  const grupos = new Set(
    asignaciones.map((a) => a.grupo?.id).filter(Boolean)
  );

  const alumnos = Array.from(grupos).reduce((acc, id) => {
    const a = asignaciones.find((x) => x.grupo?.id === id);
    return acc + (a?.grupo?._count?.alumnos ?? 0);
  }, 0);

  return (
    <div className="space-y-6">
      <section className="rounded-3xl border bg-white p-6 shadow-sm">
        <h1 className="text-3xl font-bold">Mis grupos</h1>
        <p className="text-gray-500">
          {grupos.size} grupo(s) · {asignaciones.length} materia(s) ·{" "}
          {alumnos} alumno(s) en el ciclo activo
        </p>
      </section>

      {error && (
        <p className="rounded-xl bg-red-50 p-4 text-red-600">{error}</p>
      )}

      {!error && asignaciones.length === 0 && (
        <div className="rounded-3xl border bg-white p-8 text-center">
          <p className="text-gray-500">
            No tienes materias asignadas en el ciclo activo.
          </p>
          <p className="mt-1 text-sm text-gray-400">
            Dirección las asigna desde Asignaciones.
          </p>
        </div>
      )}

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {asignaciones.map((a) => (
          <section
            key={a.id}
            className="rounded-3xl border bg-white p-5 shadow-sm"
          >
            <div className="flex items-start justify-between">
              <div>
                <h2 className="text-lg font-semibold">{a.materia?.nombre}</h2>

                {a.materia?.clave && (
                  <p className="text-xs text-gray-400">{a.materia.clave}</p>
                )}
              </div>

              <span className="rounded-full bg-blue-100 px-3 py-1 text-xs text-blue-700">
                {a.grupo?.nombre}
              </span>
            </div>

            <p className="mt-2 text-sm text-gray-500">
              {a.grupo?.semestre?.nombre || "Sin semestre"} ·{" "}
              {a.grupo?.turno?.nombre || "Sin turno"}
            </p>

            <p className="mt-1 text-sm text-gray-500">
              {a.grupo?._count?.alumnos ?? 0} alumno(s)
              {a.aula ? ` · Aula ${a.aula}` : ""}
            </p>

            {/* Bloques reales del horario, no inventados. */}
            <div className="mt-3 flex flex-wrap gap-2">
              {(a.horarios ?? []).length === 0 ? (
                <span className="text-xs text-gray-400">
                  Sin horario capturado
                </span>
              ) : (
                (a.horarios ?? []).map((h) => (
                  <span
                    key={h.id}
                    className="rounded-lg bg-gray-100 px-2 py-1 text-xs text-gray-600"
                  >
                    {ETIQUETA[h.dia] || h.dia} {h.horaInicio}-{h.horaFin}
                  </span>
                ))
              )}
            </div>

            <div className="mt-4 flex gap-2">
              <a
                href="/maestro/asistencia"
                className="flex-1 rounded-xl border px-3 py-2 text-center text-sm hover:bg-gray-50"
              >
                Asistencia
              </a>

              <a
                href="/maestro/calificaciones"
                className="flex-1 rounded-xl border px-3 py-2 text-center text-sm hover:bg-gray-50"
              >
                Calificaciones
              </a>
            </div>
          </section>
        ))}
      </div>
    </div>
  );
}
