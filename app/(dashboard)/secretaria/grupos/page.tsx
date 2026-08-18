"use client";

import { useEffect, useState } from "react";
import { API_URL } from "@/lib/config";

// `nivel` y `turno` dejaron de ser texto suelto: hoy son relaciones,
// y el nivel se consulta a través del semestre y su carrera.
type Grupo = {
  id?: string;

  nombre?: string;

  turno?: { nombre?: string | null } | null;

  semestre?: {
    nombre?: string | null;
    carrera?: { nombre?: string | null } | null;
  } | null;

  _count?: { alumnos?: number } | null;

  alumnos?: any[];

  materias?: any[];
};

function normalizeData(data: any): Grupo[] {
  if (Array.isArray(data)) return data;

  if (Array.isArray(data?.data)) {
    return data.data;
  }

  return [];
}

export default function SecretariaGruposPage() {
  const [grupos, setGrupos] =
    useState<Grupo[]>([]);

  const [loading, setLoading] =
    useState(true);

  const [error, setError] =
    useState("");

  useEffect(() => {
    async function fetchGrupos() {
      try {
        setLoading(true);
        setError("");

        // 🔐 El token vive en una cookie httpOnly: basta con `credentials`.
        const res = await fetch(
          `${API_URL}/api/grupos`,
          {
            method: "GET",

            credentials: "include",
            headers: {
              "Content-Type":
                "application/json"
            },
          }
        );

        const response =
          await res.json();

        if (!res.ok) {
          throw new Error(
            response?.message ||
              "Error cargando grupos"
          );
        }

        const data =
          response?.data || response;

        setGrupos(
          normalizeData(data)
        );
      } catch (err: any) {
        console.error(err);

        setError(
          err?.message ||
            "Error interno del servidor"
        );

        setGrupos([]);
      } finally {
        setLoading(false);
      }
    }

    fetchGrupos();
  }, []);

  if (loading) {
    return (
      <p className="p-6">
        Cargando grupos...
      </p>
    );
  }

  if (error) {
    return (
      <div className="p-6">
        <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-red-700">
          Error: {error}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 p-6">
      {/* HEADER */}
      <section className="rounded-2xl border bg-white p-6 shadow-sm">
        <h1 className="text-3xl font-bold">
          Grupos
        </h1>

        <p className="text-gray-600">
          Organización académica
          institucional
        </p>
      </section>

      {/* GRID */}
      {(grupos ?? []).length ===
      0 ? (
        <section className="rounded-2xl bg-white p-6 shadow">
          <p className="text-gray-500">
            No hay grupos registrados.
          </p>
        </section>
      ) : (
        <section className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
          {(grupos ?? []).map(
            (g, index) => (
              <div
                key={g?.id ?? index}
                className="rounded-2xl border bg-white p-5 shadow"
              >
                <h2 className="text-xl font-semibold">
                  Grupo{" "}
                  {g?.nombre ??
                    "Sin nombre"}
                </h2>

                <p className="mt-2 text-gray-600">
                  Semestre:{" "}
                  {g?.semestre?.nombre ?? "No definido"}
                </p>

                {/* `nivel` y `turno` dejaron de ser texto suelto:
                    hoy son relaciones del schema. */}
                <p className="text-gray-600">
                  Turno: {g?.turno?.nombre ?? "Sin turno"}
                </p>

                <p className="text-gray-600">
                  Alumnos:{" "}
                  {g?._count?.alumnos ?? g?.alumnos?.length ?? 0}
                </p>

                <p className="text-gray-600">
                  Carrera:{" "}
                  {g?.semestre?.carrera?.nombre ?? "—"}
                </p>

                <a
                  href={`/director/horarios`}
                  className="mt-4 inline-block rounded-xl border border-slate-300 px-4 py-2 text-sm hover:bg-slate-50"
                >
                  Ver horario del grupo
                </a>
              </div>
            )
          )}
        </section>
      )}
    </div>
  );
}