"use client";

import { useEffect, useState } from "react";
import { API_URL } from "@/lib/config";

type Inscripcion = {
  id: string;
  estatus: string;
  fechaInscripcion: string;
  semestreNumero?: number | null;
  motivoBaja?: string | null;
  alumno?: {
    id: string;
    matricula?: string;
    user?: { name?: string };
    carrera?: { nombre?: string } | null;
  };
  grupo?: { id: string; nombre?: string } | null;
  cicloEscolar?: { nombre?: string } | null;
};

type Alumno = {
  id: string;
  matricula: string;
  user?: { name?: string };
};

type Grupo = { id: string; nombre: string };

const COLOR: Record<string, string> = {
  ACTIVA: "bg-green-100 text-green-700",
  BAJA: "bg-red-100 text-red-700",
  CONCLUIDA: "bg-blue-100 text-blue-700",
};

export default function SecretariaInscripcionesPage() {
  const [inscripciones, setInscripciones] = useState<Inscripcion[]>([]);
  const [alumnos, setAlumnos] = useState<Alumno[]>([]);
  const [grupos, setGrupos] = useState<Grupo[]>([]);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [aviso, setAviso] = useState("");

  const [nueva, setNueva] = useState({
    alumnoId: "",
    grupoId: "",
    semestreNumero: "",
  });

  const cargar = async () => {
    try {
      setLoading(true);

      const [ri, ra, rg] = await Promise.all([
        fetch(`${API_URL}/api/inscripciones?perPage=200`, {
          credentials: "include",
        }),
        fetch(`${API_URL}/api/alumnos?perPage=200`, { credentials: "include" }),
        fetch(`${API_URL}/api/grupos`, { credentials: "include" }),
      ]);

      const [ji, ja, jg] = await Promise.all([ri.json(), ra.json(), rg.json()]);

      if (!ri.ok) throw new Error(ji?.message || "Error al cargar inscripciones");

      setInscripciones(ji?.data ?? []);
      setAlumnos(ja?.data ?? []);
      setGrupos(jg?.data ?? []);
      setError("");
    } catch (e: any) {
      setError(e.message || "Error al cargar");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    cargar();
  }, []);

  const inscribir = async () => {
    setError("");
    setAviso("");

    if (!nueva.alumnoId) {
      setError("Selecciona un alumno");
      return;
    }

    const res = await fetch(`${API_URL}/api/inscripciones`, {
      method: "POST",
      credentials: "include",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        alumnoId: nueva.alumnoId,
        grupoId: nueva.grupoId || null,
        semestreNumero: nueva.semestreNumero || null,
      }),
    });

    const json = await res.json();

    if (!res.ok) {
      // Ya inscrito, cupo lleno o sin ciclo activo: el mensaje lo dice.
      setError(json?.message || "No se pudo inscribir");
      return;
    }

    setAviso("Alumno inscrito correctamente");
    setNueva({ alumnoId: "", grupoId: "", semestreNumero: "" });
    cargar();
  };

  const cambiarGrupo = async (id: string, grupoId: string) => {
    if (!grupoId) return;

    setError("");
    setAviso("");

    const res = await fetch(`${API_URL}/api/inscripciones/${id}/grupo`, {
      method: "PUT",
      credentials: "include",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ grupoId }),
    });

    const json = await res.json();

    if (!res.ok) {
      setError(json?.message || "No se pudo cambiar de grupo");
      return;
    }

    setAviso("Grupo actualizado");
    cargar();
  };

  const darBaja = async (id: string) => {
    const motivo = window.prompt("Motivo de la baja:") || "";

    if (!motivo) return;

    setError("");
    setAviso("");

    const res = await fetch(`${API_URL}/api/inscripciones/${id}/baja`, {
      method: "PUT",
      credentials: "include",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ motivo }),
    });

    const json = await res.json();

    if (!res.ok) {
      setError(json?.message || "No se pudo dar de baja");
      return;
    }

    setAviso("Inscripción dada de baja");
    cargar();
  };

  // Alumnos que todavía no tienen inscripción en el ciclo cargado.
  const yaInscritos = new Set(inscripciones.map((i) => i.alumno?.id));

  const disponibles = alumnos.filter((a) => !yaInscritos.has(a.id));

  if (loading) return <p className="p-6">Cargando...</p>;

  return (
    <div className="space-y-6">
      <section className="rounded-2xl border bg-white p-6 shadow-sm">
        <h1 className="text-3xl font-bold">Inscripciones</h1>
        <p className="text-gray-500">
          {inscripciones.length} inscripción(es) en el ciclo activo ·{" "}
          {disponibles.length} alumno(s) sin inscribir
        </p>
      </section>

      {error && (
        <p className="rounded-xl bg-red-50 p-4 text-red-600">{error}</p>
      )}

      {aviso && (
        <p className="rounded-xl bg-green-50 p-4 text-green-700">{aviso}</p>
      )}

      <section className="rounded-2xl border bg-white p-5 shadow-sm">
        <h2 className="mb-3 font-semibold">Inscribir alumno</h2>

        {disponibles.length === 0 ? (
          <p className="text-gray-500">
            Todos los alumnos registrados ya están inscritos en este ciclo.
          </p>
        ) : (
          <div className="grid gap-3 md:grid-cols-4">
            <select
              className="rounded-xl border border-gray-300 px-3 py-2 md:col-span-2"
              value={nueva.alumnoId}
              onChange={(e) => setNueva({ ...nueva, alumnoId: e.target.value })}
            >
              <option value="">Alumno...</option>

              {disponibles.map((a) => (
                <option key={a.id} value={a.id}>
                  {a.matricula} — {a.user?.name}
                </option>
              ))}
            </select>

            <select
              className="rounded-xl border border-gray-300 px-3 py-2"
              value={nueva.grupoId}
              onChange={(e) => setNueva({ ...nueva, grupoId: e.target.value })}
            >
              <option value="">Grupo (opcional)</option>

              {grupos.map((g) => (
                <option key={g.id} value={g.id}>
                  {g.nombre}
                </option>
              ))}
            </select>

            <div className="flex gap-2">
              <input
                type="number"
                min={1}
                max={10}
                placeholder="Sem."
                className="w-24 rounded-xl border border-gray-300 px-3 py-2"
                value={nueva.semestreNumero}
                onChange={(e) =>
                  setNueva({ ...nueva, semestreNumero: e.target.value })
                }
              />

              <button
                onClick={inscribir}
                className="flex-1 rounded-xl bg-blue-600 px-4 py-2 text-white hover:bg-blue-700"
              >
                Inscribir
              </button>
            </div>
          </div>
        )}
      </section>

      {inscripciones.length === 0 ? (
        <div className="rounded-2xl border bg-white p-8 text-center text-gray-500">
          Todavía no hay inscripciones en este ciclo.
        </div>
      ) : (
        <div className="overflow-x-auto rounded-2xl border bg-white shadow-sm">
          <table className="w-full text-left text-sm">
            <thead className="bg-gray-50 text-gray-600">
              <tr>
                <th className="px-4 py-3">Matrícula</th>
                <th className="px-4 py-3">Alumno</th>
                <th className="px-4 py-3">Carrera</th>
                <th className="px-4 py-3">Sem.</th>
                <th className="px-4 py-3">Grupo</th>
                <th className="px-4 py-3">Fecha</th>
                <th className="px-4 py-3">Estatus</th>
                <th className="px-4 py-3"></th>
              </tr>
            </thead>

            <tbody>
              {inscripciones.map((i) => (
                <tr key={i.id} className="border-t">
                  <td className="px-4 py-3 font-medium">
                    {i.alumno?.matricula}
                  </td>

                  <td className="px-4 py-3">{i.alumno?.user?.name}</td>

                  <td className="px-4 py-3">
                    {i.alumno?.carrera?.nombre || "—"}
                  </td>

                  <td className="px-4 py-3">{i.semestreNumero ?? "—"}</td>

                  <td className="px-4 py-3">
                    {i.estatus === "ACTIVA" ? (
                      <select
                        className="rounded-lg border px-2 py-1 text-xs"
                        value={i.grupo?.id || ""}
                        onChange={(e) => cambiarGrupo(i.id, e.target.value)}
                      >
                        <option value="">Sin grupo</option>

                        {grupos.map((g) => (
                          <option key={g.id} value={g.id}>
                            {g.nombre}
                          </option>
                        ))}
                      </select>
                    ) : (
                      i.grupo?.nombre || "—"
                    )}
                  </td>

                  <td className="px-4 py-3">
                    {new Date(i.fechaInscripcion).toLocaleDateString("es-MX")}
                  </td>

                  <td className="px-4 py-3">
                    <span
                      className={`rounded-full px-3 py-1 text-xs ${
                        COLOR[i.estatus] || "bg-gray-100 text-gray-600"
                      }`}
                    >
                      {i.estatus}
                    </span>

                    {i.motivoBaja && (
                      <span className="block text-xs text-gray-400">
                        {i.motivoBaja}
                      </span>
                    )}
                  </td>

                  <td className="px-4 py-3">
                    <a
                      href={`/secretaria/expediente/${i.alumno?.id}`}
                      className="mr-2 rounded-lg border px-3 py-1 text-xs hover:bg-gray-50"
                    >
                      Expediente
                    </a>

                    {i.estatus === "ACTIVA" && (
                      <button
                        onClick={() => darBaja(i.id)}
                        className="rounded-lg border px-3 py-1 text-xs hover:bg-red-50"
                      >
                        Baja
                      </button>
                    )}
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
