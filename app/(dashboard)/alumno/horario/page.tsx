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

type Bloque = {
  dia: string;
  horaInicio: string;
  horaFin: string;
  aula?: string | null;
  materia: string;
  docente: string;
};

export default function AlumnoHorarioPage() {
  const [bloques, setBloques] = useState<Bloque[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const cargar = async () => {
      try {
        const guardado = localStorage.getItem("user");

        if (!guardado) {
          window.location.href = "/login";
          return;
        }

        const user = JSON.parse(guardado);
        const alumnoId = user?.alumnoId || user?.id;

        const res = await fetch(
          `${API_URL}/api/alumnos/horario/${alumnoId}`,
          { credentials: "include" }
        );

        const json = await res.json();

        if (!res.ok) {
          throw new Error(json?.message || "Error al cargar el horario");
        }

        // Cada asignación trae sus bloques reales de horario.
        const filas: Bloque[] = [];

        for (const a of json?.data ?? []) {
          for (const h of a.horarios ?? []) {
            filas.push({
              dia: h.dia,
              horaInicio: h.horaInicio,
              horaFin: h.horaFin,
              aula: h.aula || a.aula,
              materia: a.materia?.nombre ?? "Sin materia",
              docente: a.docente?.nombre || a.docente?.user?.name || "Sin docente",
            });
          }
        }

        setBloques(filas);
      } catch (e: any) {
        setError(e.message || "Error al cargar el horario");
      } finally {
        setLoading(false);
      }
    };

    cargar();
  }, []);

  if (loading) return <p className="p-6">Cargando...</p>;

  return (
    <div className="space-y-6">
      <section className="rounded-2xl border bg-white p-6 shadow-sm">
        <h1 className="text-3xl font-bold">Mi horario</h1>
        <p className="text-gray-500">Ciclo escolar activo</p>
      </section>

      {error && (
        <p className="rounded-xl bg-red-50 p-4 text-red-600">{error}</p>
      )}

      {!error && bloques.length === 0 && (
        <div className="rounded-2xl border bg-white p-8 text-center">
          <p className="text-gray-500">
            Todavía no hay horarios capturados para tus materias.
          </p>
          <p className="mt-1 text-sm text-gray-400">
            Cuando dirección los registre aparecerán aquí.
          </p>
        </div>
      )}

      {bloques.length > 0 && (
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {DIAS.filter((d) => bloques.some((b) => b.dia === d)).map((dia) => (
            <section
              key={dia}
              className="rounded-2xl border bg-white p-5 shadow-sm"
            >
              <h2 className="mb-3 text-lg font-semibold text-slate-800">
                {ETIQUETA[dia]}
              </h2>

              <ul className="space-y-3">
                {bloques
                  .filter((b) => b.dia === dia)
                  .sort((a, b) => a.horaInicio.localeCompare(b.horaInicio))
                  .map((b, i) => (
                    <li
                      key={i}
                      className="rounded-xl border border-gray-100 bg-gray-50 p-3"
                    >
                      <p className="text-sm font-medium text-blue-700">
                        {b.horaInicio} - {b.horaFin}
                      </p>

                      <p className="font-semibold">{b.materia}</p>

                      <p className="text-sm text-gray-500">{b.docente}</p>

                      {b.aula && (
                        <p className="text-xs text-gray-400">Aula {b.aula}</p>
                      )}
                    </li>
                  ))}
              </ul>
            </section>
          ))}
        </div>
      )}
    </div>
  );
}
