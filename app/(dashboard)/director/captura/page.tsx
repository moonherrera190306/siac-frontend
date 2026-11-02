"use client";

import { useEffect, useMemo, useState } from "react";
import { API_URL } from "@/lib/config";

type Fila = {
  asignacionId: string;
  docenteId: string;
  docente: string;
  materia: string;
  grupo: string;
  totalAlumnos: number;
  capturados: number;
  ultimaCaptura: string | null;
  estado: "COMPLETA" | "PARCIAL" | "SIN_CAPTURA" | "SIN_ALUMNOS";
};

const COLUMNAS = [
  { id: "", label: "Cualquier columna" },
  { id: "PP", label: "Primer parcial" },
  { id: "SP", label: "Segundo parcial" },
  { id: "EF", label: "Examen final" },
  { id: "O", label: "Ordinario" },
  { id: "ND", label: "Nota definitiva" },
];

const ESTILO: Record<Fila["estado"], { texto: string; clase: string }> = {
  COMPLETA: { texto: "Completa", clase: "bg-green-100 text-green-800" },
  PARCIAL: { texto: "Parcial", clase: "bg-amber-100 text-amber-800" },
  SIN_CAPTURA: { texto: "Sin subir", clase: "bg-red-100 text-red-700" },
  SIN_ALUMNOS: { texto: "Sin alumnos", clase: "bg-gray-100 text-gray-500" },
};

/**
 * ✅ AVANCE DE CAPTURA DE CALIFICACIONES
 * El director ve qué maestro ya subió calificaciones y cuál no,
 * por materia y grupo del ciclo activo.
 */
export default function DirectorCapturaPage() {
  const [filas, setFilas] = useState<Fila[]>([]);
  const [columna, setColumna] = useState("");
  const [filtroEstado, setFiltroEstado] = useState("");
  const [texto, setTexto] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const cargar = async () => {
      try {
        setLoading(true);
        setError("");

        const res = await fetch(
          `${API_URL}/api/director/captura-calificaciones${columna ? `?columna=${columna}` : ""}`,
          { credentials: "include" }
        );
        const json = await res.json();

        if (!res.ok) throw new Error(json?.message || "Error al cargar");

        setFilas(json?.data ?? []);
      } catch (e: any) {
        setError(e.message || "Error al cargar");
      } finally {
        setLoading(false);
      }
    };

    cargar();
  }, [columna]);

  const visibles = useMemo(() => {
    const t = texto.trim().toLowerCase();
    return filas.filter(
      (f) =>
        (!filtroEstado || f.estado === filtroEstado) &&
        (!t ||
          f.docente.toLowerCase().includes(t) ||
          f.materia.toLowerCase().includes(t) ||
          f.grupo.toLowerCase().includes(t))
    );
  }, [filas, filtroEstado, texto]);

  // Resumen por maestro: un maestro "ya subió" solo si todas sus materias están completas.
  const maestros = useMemo(() => {
    const m = new Map<string, { docente: string; total: number; completas: number }>();
    for (const f of filas) {
      if (f.estado === "SIN_ALUMNOS") continue;
      const r = m.get(f.docenteId) ?? { docente: f.docente, total: 0, completas: 0 };
      r.total += 1;
      if (f.estado === "COMPLETA") r.completas += 1;
      m.set(f.docenteId, r);
    }
    return [...m.values()];
  }, [filas]);

  const listos = maestros.filter((m) => m.completas === m.total).length;

  return (
    <div className="space-y-6">
      <section className="rounded-3xl border bg-white p-6 shadow-sm">
        <h1 className="text-3xl font-bold">Captura de calificaciones</h1>
        <p className="text-gray-500">
          Qué maestros ya subieron calificaciones en el ciclo activo.
        </p>
      </section>

      {error && <p className="rounded-xl bg-red-50 p-4 text-red-600">{error}</p>}

      <section className="grid gap-3 md:grid-cols-3">
        <div className="rounded-2xl border bg-white p-4 text-center shadow-sm">
          <p className="text-xs uppercase tracking-wide text-gray-500">Maestros al día</p>
          <p className="mt-1 text-3xl font-bold text-green-700">
            {listos}
            <span className="text-base font-normal text-gray-500"> / {maestros.length}</span>
          </p>
        </div>
        <div className="rounded-2xl border bg-white p-4 text-center shadow-sm">
          <p className="text-xs uppercase tracking-wide text-gray-500">Materias sin subir</p>
          <p className="mt-1 text-3xl font-bold text-red-600">
            {filas.filter((f) => f.estado === "SIN_CAPTURA").length}
          </p>
        </div>
        <div className="rounded-2xl border bg-white p-4 text-center shadow-sm">
          <p className="text-xs uppercase tracking-wide text-gray-500">Parciales</p>
          <p className="mt-1 text-3xl font-bold text-amber-600">
            {filas.filter((f) => f.estado === "PARCIAL").length}
          </p>
        </div>
      </section>

      <section className="flex flex-wrap gap-2 rounded-2xl border bg-white p-4 shadow-sm">
        <select
          value={columna}
          onChange={(e) => setColumna(e.target.value)}
          className="rounded-xl border border-gray-300 px-3 py-2 text-sm"
        >
          {COLUMNAS.map((c) => (
            <option key={c.id} value={c.id}>
              {c.label}
            </option>
          ))}
        </select>

        <select
          value={filtroEstado}
          onChange={(e) => setFiltroEstado(e.target.value)}
          className="rounded-xl border border-gray-300 px-3 py-2 text-sm"
        >
          <option value="">Todos los estados</option>
          <option value="SIN_CAPTURA">Sin subir</option>
          <option value="PARCIAL">Parcial</option>
          <option value="COMPLETA">Completa</option>
        </select>

        <input
          value={texto}
          onChange={(e) => setTexto(e.target.value)}
          placeholder="Buscar maestro, materia o grupo"
          className="w-full rounded-xl border border-gray-300 px-4 py-2 text-sm md:w-80"
        />
      </section>

      {loading ? (
        <p className="p-6">Cargando...</p>
      ) : (
        <div className="overflow-x-auto rounded-3xl border bg-white shadow-sm">
          <table className="w-full text-left text-sm">
            <thead className="bg-gray-50 text-gray-600">
              <tr>
                <th className="px-4 py-3">Maestro</th>
                <th className="px-4 py-3">Materia</th>
                <th className="px-4 py-3">Grupo</th>
                <th className="px-4 py-3 text-center">Capturados</th>
                <th className="px-4 py-3">Última captura</th>
                <th className="px-4 py-3">Estado</th>
              </tr>
            </thead>
            <tbody>
              {visibles.map((f) => (
                <tr key={f.asignacionId} className="border-t">
                  <td className="px-4 py-3 font-medium">{f.docente}</td>
                  <td className="px-4 py-3">{f.materia}</td>
                  <td className="px-4 py-3">{f.grupo}</td>
                  <td className="px-4 py-3 text-center">
                    {f.capturados} / {f.totalAlumnos}
                  </td>
                  <td className="px-4 py-3 text-gray-500">
                    {f.ultimaCaptura
                      ? new Date(f.ultimaCaptura).toLocaleDateString("es-MX")
                      : "—"}
                  </td>
                  <td className="px-4 py-3">
                    <span
                      className={`rounded-full px-3 py-1 text-xs font-medium ${ESTILO[f.estado].clase}`}
                    >
                      {ESTILO[f.estado].texto}
                    </span>
                  </td>
                </tr>
              ))}

              {visibles.length === 0 && (
                <tr>
                  <td colSpan={6} className="px-4 py-6 text-center text-gray-500">
                    No hay asignaciones que mostrar en el ciclo activo.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
