"use client";

import { useEffect, useState } from "react";
import { API_URL } from "@/lib/config";

type Calificacion = {
  id: string;
  notaDefinitiva?: string | null;
  promedio?: string | null;
  estatus: string;
  alumno?: {
    matricula?: string;
    user?: { name?: string };
    grupo?: { nombre?: string };
  };
  materia?: { nombre?: string; clave?: string | null };
  cicloEscolar?: { nombre?: string };
};

const COLOR_ESTATUS: Record<string, string> = {
  APROBADA: "bg-green-100 text-green-700",
  REPROBADA: "bg-red-100 text-red-700",
  NO_PRESENTO: "bg-amber-100 text-amber-700",
  EN_CURSO: "bg-gray-100 text-gray-600",
};

export default function DirectorCalificacionesPage() {
  const [calificaciones, setCalificaciones] = useState<Calificacion[]>([]);
  const [busqueda, setBusqueda] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const cargar = async () => {
      try {
        // 🔥 Antes esta pantalla era una vista de materias con
        // promedios inventados (`95 - index*4`).
        const res = await fetch(`${API_URL}/api/director/calificaciones`, {
          credentials: "include",
        });

        const json = await res.json();

        if (!res.ok) {
          throw new Error(json?.message || "Error al cargar calificaciones");
        }

        setCalificaciones(json?.data ?? []);
      } catch (e: any) {
        setError(e.message || "Error al cargar calificaciones");
      } finally {
        setLoading(false);
      }
    };

    cargar();
  }, []);

  const filtradas = calificaciones.filter((c) => {
    const texto = busqueda.trim().toLowerCase();

    if (!texto) return true;

    return (
      (c.alumno?.user?.name || "").toLowerCase().includes(texto) ||
      (c.alumno?.matricula || "").toLowerCase().includes(texto) ||
      (c.materia?.nombre || "").toLowerCase().includes(texto) ||
      (c.alumno?.grupo?.nombre || "").toLowerCase().includes(texto)
    );
  });

  if (loading) return <p className="p-6">Cargando...</p>;

  return (
    <div className="space-y-6">
      <section className="flex flex-col gap-4 rounded-2xl border bg-white p-6 shadow-sm md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-3xl font-bold">Calificaciones</h1>
          <p className="text-gray-500">
            Kardex del ciclo — datos reales del sistema
          </p>
        </div>

        <input
          className="w-full rounded-xl border border-gray-300 px-4 py-2 md:w-80"
          placeholder="Buscar por alumno, matrícula, materia o grupo"
          value={busqueda}
          onChange={(e) => setBusqueda(e.target.value)}
        />
      </section>

      {error && (
        <p className="rounded-xl bg-red-50 p-4 text-red-600">{error}</p>
      )}

      {!error && filtradas.length === 0 && (
        <div className="rounded-2xl border bg-white p-8 text-center text-gray-500">
          Todavía no hay calificaciones capturadas.
        </div>
      )}

      {filtradas.length > 0 && (
        <div className="overflow-x-auto rounded-2xl border bg-white shadow-sm">
          <table className="w-full text-left text-sm">
            <thead className="bg-gray-50 text-gray-600">
              <tr>
                <th className="px-4 py-3">Alumno</th>
                <th className="px-4 py-3">Grupo</th>
                <th className="px-4 py-3">Materia</th>
                <th className="px-4 py-3">Ciclo</th>
                <th className="px-4 py-3">Promedio</th>
                <th className="px-4 py-3">Definitiva</th>
                <th className="px-4 py-3">Estatus</th>
              </tr>
            </thead>

            <tbody>
              {filtradas.map((c) => (
                <tr key={c.id} className="border-t">
                  <td className="px-4 py-3">
                    {c.alumno?.user?.name || "N/A"}
                    <span className="block text-xs text-gray-400">
                      {c.alumno?.matricula}
                    </span>
                  </td>

                  <td className="px-4 py-3">
                    {c.alumno?.grupo?.nombre || "—"}
                  </td>

                  <td className="px-4 py-3">
                    {c.materia?.nombre}
                    {c.materia?.clave && (
                      <span className="block text-xs text-gray-400">
                        {c.materia.clave}
                      </span>
                    )}
                  </td>

                  <td className="px-4 py-3">{c.cicloEscolar?.nombre || "—"}</td>

                  <td className="px-4 py-3">{c.promedio ?? "—"}</td>

                  <td className="px-4 py-3 font-semibold">
                    {c.notaDefinitiva ?? "—"}
                  </td>

                  <td className="px-4 py-3">
                    <span
                      className={`rounded-full px-3 py-1 text-xs ${
                        COLOR_ESTATUS[c.estatus] || "bg-gray-100 text-gray-600"
                      }`}
                    >
                      {c.estatus.replace("_", " ")}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
