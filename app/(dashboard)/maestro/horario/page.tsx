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
  grupo: string;
};

export default function MaestroHorarioPage() {
  const [bloques, setBloques] = useState<Bloque[]>([]);
  const [asignaciones, setAsignaciones] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const cargar = async () => {
      try {
        // 🔥 Antes este horario se inventaba en el navegador
        // (`día = index % 5`). Ahora sale de las asignaciones reales.
        const res = await fetch(`${API_URL}/api/docentes/horario`, {
          credentials: "include",
        });

        const json = await res.json();

        if (!res.ok) {
          throw new Error(json?.message || "Error al cargar el horario");
        }

        setBloques(json?.data ?? []);
        setAsignaciones(json?.meta?.asignaciones ?? 0);
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
      <section className="rounded-3xl border bg-white p-6 shadow-sm">
        <h1 className="text-3xl font-bold">Mi horario</h1>
        <p className="text-gray-500">Clases del ciclo escolar activo</p>
      </section>

      {error && (
        <p className="rounded-xl bg-red-50 p-4 text-red-600">{error}</p>
      )}

      {!error && bloques.length === 0 && (
        <div className="rounded-3xl border bg-white p-8 text-center">
          <p className="text-gray-500">
            {asignaciones === 0
              ? "No tienes materias asignadas en el ciclo activo."
              : "Tus materias todavía no tienen horario capturado."}
          </p>
          <p className="mt-1 text-sm text-gray-400">
            Dirección los registra desde Asignaciones.
          </p>
        </div>
      )}

      {bloques.length > 0 && (
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {DIAS.filter((d) => bloques.some((b) => b.dia === d)).map((dia) => (
            <section
              key={dia}
              className="rounded-3xl border bg-white p-5 shadow-sm"
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
                      className="rounded-2xl border border-gray-100 bg-gray-50 p-3"
                    >
                      <p className="text-sm font-medium text-blue-700">
                        {b.horaInicio} - {b.horaFin}
                      </p>

                      <p className="font-semibold">{b.materia}</p>

                      <p className="text-sm text-gray-500">Grupo {b.grupo}</p>

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
