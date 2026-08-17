"use client";

import { useEffect, useState } from "react";
import { API_URL } from "@/lib/config";

type Asignacion = {
  id: string;
  materia?: {
    id: string;
    nombre?: string;
    clave?: string | null;
    tipo?: string;
    tipoEvaluacion?: string;
    creditos?: number | null;
    horasSemana?: number | null;
  };
  grupo?: { nombre?: string };
  cicloEscolar?: { nombre?: string };
};

export default function MaestroMateriasPage() {
  const [asignaciones, setAsignaciones] = useState<Asignacion[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const cargar = async () => {
      try {
        // 🔥 Antes esta pantalla reutilizaba el endpoint de grupos y
        // mostraba grupos como si fueran materias.
        const res = await fetch(`${API_URL}/api/docentes/grupos`, {
          credentials: "include",
        });

        const json = await res.json();

        if (!res.ok) {
          throw new Error(json?.message || "Error cargando materias");
        }

        setAsignaciones(json?.data ?? []);
      } catch (e: any) {
        setError(e.message || "Error cargando materias");
      } finally {
        setLoading(false);
      }
    };

    cargar();
  }, []);

  if (loading) return <p className="p-6">Cargando...</p>;

  // Una materia puede impartirse a varios grupos: se agrupa por materia.
  const porMateria = new Map<string, { materia: any; grupos: string[] }>();

  for (const a of asignaciones) {
    const id = a.materia?.id;

    if (!id) continue;

    if (!porMateria.has(id)) {
      porMateria.set(id, { materia: a.materia, grupos: [] });
    }

    if (a.grupo?.nombre) {
      porMateria.get(id)!.grupos.push(a.grupo.nombre);
    }
  }

  const materias = Array.from(porMateria.values());

  return (
    <div className="space-y-6">
      <section className="rounded-3xl border bg-white p-6 shadow-sm">
        <h1 className="text-3xl font-bold">Mis materias</h1>
        <p className="text-gray-500">
          {materias.length} materia(s) en el ciclo activo
        </p>
      </section>

      {error && (
        <p className="rounded-xl bg-red-50 p-4 text-red-600">{error}</p>
      )}

      {!error && materias.length === 0 && (
        <div className="rounded-3xl border bg-white p-8 text-center text-gray-500">
          No tienes materias asignadas en el ciclo activo.
        </div>
      )}

      {materias.length > 0 && (
        <div className="overflow-x-auto rounded-3xl border bg-white shadow-sm">
          <table className="w-full text-left text-sm">
            <thead className="bg-gray-50 text-gray-600">
              <tr>
                <th className="px-4 py-3">Clave</th>
                <th className="px-4 py-3">Materia</th>
                <th className="px-4 py-3">Tipo</th>
                <th className="px-4 py-3">Evaluación</th>
                <th className="px-4 py-3">Créditos</th>
                <th className="px-4 py-3">Horas</th>
                <th className="px-4 py-3">Grupos</th>
              </tr>
            </thead>

            <tbody>
              {materias.map(({ materia, grupos }) => (
                <tr key={materia.id} className="border-t">
                  <td className="px-4 py-3">{materia.clave || "—"}</td>

                  <td className="px-4 py-3 font-medium">{materia.nombre}</td>

                  <td className="px-4 py-3">{materia.tipo || "—"}</td>

                  <td className="px-4 py-3">
                    {materia.tipoEvaluacion === "ACREDITACION"
                      ? "AC / NA"
                      : "1 - 10"}
                  </td>

                  <td className="px-4 py-3">{materia.creditos ?? "—"}</td>

                  <td className="px-4 py-3">{materia.horasSemana ?? "—"}</td>

                  <td className="px-4 py-3">{grupos.join(", ") || "—"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
