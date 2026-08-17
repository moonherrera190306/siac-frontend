"use client";

import { useEffect, useState } from "react";
import { API_URL } from "@/lib/config";

type Fila = {
  grupoId: string;
  grupo: string;
  alumnos: number;
  asistencia: string | null;
  faltas: number;
  estatus: string;
};

const COLOR: Record<string, string> = {
  Excelente: "bg-green-100 text-green-700",
  Estable: "bg-blue-100 text-blue-700",
  "Atención": "bg-amber-100 text-amber-700",
  "Sin registros": "bg-gray-100 text-gray-600",
};

export default function DirectorAsistenciasPage() {
  const [filas, setFilas] = useState<Fila[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const cargar = async () => {
      try {
        // 🔥 Antes esta pantalla calculaba `88%` fijo y `95 - index*3`
        // en el navegador. Ahora el backend devuelve el acumulado real.
        const res = await fetch(`${API_URL}/api/director/asistencias`, {
          credentials: "include",
        });

        const json = await res.json();

        if (!res.ok) {
          throw new Error(json?.message || "Error al cargar asistencias");
        }

        setFilas(json?.data ?? []);
      } catch (e: any) {
        setError(e.message || "Error al cargar asistencias");
      } finally {
        setLoading(false);
      }
    };

    cargar();
  }, []);

  const conDato = filas.filter((f) => f.asistencia !== null);

  const global =
    conDato.length === 0
      ? null
      : (
          conDato.reduce((acc, f) => acc + parseFloat(f.asistencia as string), 0) /
          conDato.length
        ).toFixed(1);

  if (loading) return <p className="p-6">Cargando...</p>;

  return (
    <div className="space-y-6">
      <section className="rounded-2xl border bg-white p-6 shadow-sm">
        <h1 className="text-3xl font-bold">Asistencias</h1>
        <p className="text-gray-500">Acumulado por grupo del ciclo</p>
      </section>

      {error && (
        <p className="rounded-xl bg-red-50 p-4 text-red-600">{error}</p>
      )}

      <div className="grid gap-4 md:grid-cols-3">
        <div className="rounded-2xl border bg-white p-5 shadow-sm">
          <p className="text-sm text-gray-500">Asistencia global</p>
          <h2 className="text-2xl font-bold">
            {global === null ? "Sin registros" : `${global}%`}
          </h2>
        </div>

        <div className="rounded-2xl border bg-white p-5 shadow-sm">
          <p className="text-sm text-gray-500">Grupos</p>
          <h2 className="text-2xl font-bold">{filas.length}</h2>
        </div>

        <div className="rounded-2xl border bg-white p-5 shadow-sm">
          <p className="text-sm text-gray-500">Faltas acumuladas</p>
          <h2 className="text-2xl font-bold">
            {filas.reduce((acc, f) => acc + f.faltas, 0)}
          </h2>
        </div>
      </div>

      {filas.length === 0 && !error && (
        <div className="rounded-2xl border bg-white p-8 text-center text-gray-500">
          No hay grupos registrados.
        </div>
      )}

      {filas.length > 0 && (
        <div className="overflow-x-auto rounded-2xl border bg-white shadow-sm">
          <table className="w-full text-left text-sm">
            <thead className="bg-gray-50 text-gray-600">
              <tr>
                <th className="px-4 py-3">Grupo</th>
                <th className="px-4 py-3">Alumnos</th>
                <th className="px-4 py-3">Asistencia</th>
                <th className="px-4 py-3">Faltas</th>
                <th className="px-4 py-3">Estatus</th>
              </tr>
            </thead>

            <tbody>
              {filas.map((f) => (
                <tr key={f.grupoId} className="border-t">
                  <td className="px-4 py-3 font-medium">{f.grupo}</td>
                  <td className="px-4 py-3">{f.alumnos}</td>
                  <td className="px-4 py-3">{f.asistencia ?? "—"}</td>
                  <td className="px-4 py-3">{f.faltas}</td>
                  <td className="px-4 py-3">
                    <span
                      className={`rounded-full px-3 py-1 text-xs ${
                        COLOR[f.estatus] || "bg-gray-100 text-gray-600"
                      }`}
                    >
                      {f.estatus}
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
