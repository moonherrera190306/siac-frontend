"use client";

import { useEffect, useState } from "react";
import { API_URL } from "@/lib/config";

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
  _count?: { alumnos?: number };
};

export default function SecretariaHorariosPage() {
  const [grupos, setGrupos] = useState<Grupo[]>([]);
  const [seleccionado, setSeleccionado] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [cargandoDetalle, setCargandoDetalle] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    const cargar = async () => {
      try {
        const res = await fetch(`${API_URL}/api/grupos`, {
          credentials: "include",
        });

        const json = await res.json();

        if (!res.ok) {
          throw new Error(json?.message || "Error al cargar grupos");
        }

        setGrupos(json?.data ?? []);
      } catch (e: any) {
        setError(e.message || "Error al cargar grupos");
      } finally {
        setLoading(false);
      }
    };

    cargar();
  }, []);

  const abrir = async (id: string) => {
    try {
      setCargandoDetalle(true);

      const res = await fetch(`${API_URL}/api/grupos/${id}`, {
        credentials: "include",
      });

      const json = await res.json();

      if (!res.ok) {
        throw new Error(json?.message || "Error al cargar el grupo");
      }

      setSeleccionado(json?.data ?? null);
    } catch (e: any) {
      setError(e.message || "Error al cargar el grupo");
    } finally {
      setCargandoDetalle(false);
    }
  };

  if (loading) return <p className="p-6">Cargando...</p>;

  // Bloques reales del grupo seleccionado.
  const bloques: any[] = [];

  for (const a of seleccionado?.asignaciones ?? []) {
    for (const h of a.horarios ?? []) {
      bloques.push({
        ...h,
        materia: a.materia?.nombre,
        docente: a.docente?.nombre || a.docente?.user?.name,
        aula: h.aula || a.aula,
      });
    }
  }

  return (
    <div className="space-y-6">
      <section className="rounded-2xl border bg-white p-6 shadow-sm">
        <h1 className="text-3xl font-bold">Horarios</h1>
        <p className="text-gray-500">Selecciona un grupo para ver su horario</p>
      </section>

      {error && (
        <p className="rounded-xl bg-red-50 p-4 text-red-600">{error}</p>
      )}

      <div className="grid gap-4 md:grid-cols-3 xl:grid-cols-4">
        {grupos.map((g) => (
          <button
            key={g.id}
            onClick={() => abrir(g.id)}
            className={`rounded-2xl border bg-white p-5 text-left shadow-sm transition hover:border-blue-400 ${
              seleccionado?.id === g.id ? "border-blue-500" : ""
            }`}
          >
            <p className="text-lg font-semibold">{g.nombre}</p>

            <p className="text-sm text-gray-500">
              {g.semestre?.nombre || "Sin semestre"}
            </p>

            {/* 🔥 Antes se mostraba "07:00 - 14:00" fijo para todos. */}
            <p className="text-xs text-gray-400">
              {g.turno?.nombre || "Sin turno"} · {g._count?.alumnos ?? 0} alumnos
            </p>
          </button>
        ))}
      </div>

      {grupos.length === 0 && !error && (
        <div className="rounded-2xl border bg-white p-8 text-center text-gray-500">
          No hay grupos registrados.
        </div>
      )}

      {cargandoDetalle && <p className="text-gray-500">Cargando horario...</p>}

      {seleccionado && !cargandoDetalle && (
        <section className="rounded-2xl border bg-white p-6 shadow-sm">
          <h2 className="text-xl font-bold">
            Horario del grupo {seleccionado.nombre}
          </h2>

          {bloques.length === 0 ? (
            <p className="mt-3 text-gray-500">
              Este grupo todavía no tiene horarios capturados.
            </p>
          ) : (
            <div className="mt-4 overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead className="bg-gray-50 text-gray-600">
                  <tr>
                    <th className="px-4 py-3">Día</th>
                    <th className="px-4 py-3">Horario</th>
                    <th className="px-4 py-3">Materia</th>
                    <th className="px-4 py-3">Docente</th>
                    <th className="px-4 py-3">Aula</th>
                  </tr>
                </thead>

                <tbody>
                  {bloques
                    .sort(
                      (a, b) =>
                        Object.keys(ETIQUETA).indexOf(a.dia) -
                          Object.keys(ETIQUETA).indexOf(b.dia) ||
                        a.horaInicio.localeCompare(b.horaInicio)
                    )
                    .map((b, i) => (
                      <tr key={i} className="border-t">
                        <td className="px-4 py-3">{ETIQUETA[b.dia] || b.dia}</td>
                        <td className="px-4 py-3">
                          {b.horaInicio} - {b.horaFin}
                        </td>
                        <td className="px-4 py-3">{b.materia}</td>
                        <td className="px-4 py-3">{b.docente || "—"}</td>
                        <td className="px-4 py-3">{b.aula || "—"}</td>
                      </tr>
                    ))}
                </tbody>
              </table>
            </div>
          )}
        </section>
      )}
    </div>
  );
}
