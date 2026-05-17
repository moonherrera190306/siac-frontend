"use client";

import { useEffect, useState } from "react";
import { apiFetch } from "@/lib/apiClient";

interface Materia {
  id: string;
  nombre: string;
  grupos: string[];
  alumnos: number;
  aula: string;
}

export default function MaestroMateriasPage() {
  const [materias, setMaterias] = useState<Materia[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchMaterias = async () => {
      try {
        setLoading(true);
        setError(null);

        // 🔥 consumir endpoint real
        const response = await apiFetch(
          "/api/docentes/grupos"
        );

        console.log("MATERIAS MAESTRO:", response);

        const grupos = Array.isArray(response?.data)
          ? response.data
          : [];

        // 🔥 transformar para UI
        const materiasTransformadas = grupos.map(
          (g: any) => ({
            id: g?.id,
            nombre: g?.nombre ?? "Sin nombre",
            grupos: [g?.nombre ?? "Sin grupo"],
            alumnos: g?.totalAlumnos ?? 0,
            aula: "Aula asignada",
          })
        );

        setMaterias(materiasTransformadas);
      } catch (err: any) {
        console.error("ERROR MATERIAS:", err);

        setError(
          err?.message ||
            "No se pudieron cargar las materias"
        );

        // 🔥 evitar undefined
        setMaterias([]);
      } finally {
        setLoading(false);
      }
    };

    fetchMaterias();
  }, []);

  // 🔄 LOADING
  if (loading) {
    return (
      <div className="p-6">
        <p className="text-gray-600">
          Cargando materias...
        </p>
      </div>
    );
  }

  // ❌ ERROR
  if (error) {
    return (
      <div className="p-6">
        <div className="rounded-xl border border-red-200 bg-red-50 p-4">
          <p className="font-medium text-red-600">
            Error cargando materias
          </p>

          <p className="mt-1 text-sm text-red-500">
            {error}
          </p>
        </div>
      </div>
    );
  }

  // 📭 EMPTY STATE
  if (materias.length === 0) {
    return (
      <div className="space-y-6">
        {/* HEADER */}
        <section className="rounded-2xl border bg-white p-6 shadow-sm">
          <h1 className="text-3xl font-bold">
            Mis materias
          </h1>

          <p className="text-gray-600">
            Materias asignadas en el periodo actual
          </p>
        </section>

        {/* EMPTY */}
        <section className="rounded-2xl border bg-white p-10 text-center shadow-sm">
          <p className="text-gray-500">
            No hay materias asignadas.
          </p>
        </section>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* HEADER */}
      <section className="rounded-2xl border bg-white p-6 shadow-sm">
        <h1 className="text-3xl font-bold">
          Mis materias
        </h1>

        <p className="text-gray-600">
          Materias asignadas en el periodo actual
        </p>
      </section>

      {/* GRID */}
      <section className="grid gap-4 md:grid-cols-2">
        {(materias ?? []).map((m) => (
          <div
            key={m?.id}
            className="rounded-2xl border bg-white p-6 shadow-sm"
          >
            <h2 className="text-xl font-semibold">
              {m?.nombre ?? "Sin nombre"}
            </h2>

            <p className="mt-3 text-gray-600">
              Grupos:{" "}
              {(m?.grupos ?? []).join(", ") || "Sin grupos"}
            </p>

            <p className="text-gray-600">
              Total alumnos: {m?.alumnos ?? 0}
            </p>

            <p className="text-gray-600">
              Aula: {m?.aula ?? "Sin aula"}
            </p>
          </div>
        ))}
      </section>
    </div>
  );
}