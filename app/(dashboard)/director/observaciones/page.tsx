"use client";

import { useEffect, useState } from "react";
import { API_URL } from "@/lib/config";

const TIPOS = [
  "ACADEMICA",
  "CONDUCTA",
  "ASISTENCIA",
  "ADMINISTRATIVA",
  "RECONOCIMIENTO",
  "OTRA",
];

const GRAVEDADES = ["BAJA", "MEDIA", "ALTA"];

const COLOR_ESTATUS: Record<string, string> = {
  ABIERTA: "bg-amber-100 text-amber-700",
  EN_SEGUIMIENTO: "bg-blue-100 text-blue-700",
  RESUELTA: "bg-green-100 text-green-700",
  CERRADA: "bg-slate-200 text-slate-700",
};

const COLOR_GRAVEDAD: Record<string, string> = {
  ALTA: "bg-red-100 text-red-700",
  MEDIA: "bg-amber-100 text-amber-700",
  BAJA: "bg-gray-100 text-gray-600",
};

export default function DirectorObservacionesPage() {
  const [observaciones, setObservaciones] = useState<any[]>([]);
  const [meta, setMeta] = useState<any>({ total: 0, abiertas: 0 });

  const [alumnos, setAlumnos] = useState<any[]>([]);
  const [docentes, setDocentes] = useState<any[]>([]);
  const [grupos, setGrupos] = useState<any[]>([]);

  const [filtro, setFiltro] = useState("");
  const [abierta, setAbierta] = useState<string | null>(null);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [aviso, setAviso] = useState("");

  const [nueva, setNueva] = useState({
    titulo: "",
    descripcion: "",
    tipo: "ACADEMICA",
    gravedad: "MEDIA",
    alumnoId: "",
    docenteId: "",
    grupoId: "",
  });

  const [nota, setNota] = useState("");
  const [estatusNuevo, setEstatusNuevo] = useState("EN_SEGUIMIENTO");

  const cargar = async (estatus = "") => {
    try {
      setLoading(true);

      const res = await fetch(
        `${API_URL}/api/observaciones?perPage=100${
          estatus ? `&estatus=${estatus}` : ""
        }`,
        { credentials: "include" }
      );

      const json = await res.json();

      if (!res.ok) throw new Error(json?.message || "Error al cargar");

      setObservaciones(json?.data ?? []);
      setMeta(json?.meta ?? { total: 0, abiertas: 0 });
      setError("");
    } catch (e: any) {
      setError(e.message || "Error al cargar observaciones");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const catalogos = async () => {
      const [ra, rd, rg] = await Promise.all([
        fetch(`${API_URL}/api/alumnos?perPage=200`, { credentials: "include" }),
        fetch(`${API_URL}/api/docentes`, { credentials: "include" }),
        fetch(`${API_URL}/api/grupos`, { credentials: "include" }),
      ]);

      const [ja, jd, jg] = await Promise.all([ra.json(), rd.json(), rg.json()]);

      setAlumnos(ja?.data ?? []);
      setDocentes(jd?.data ?? []);
      setGrupos(jg?.data ?? []);
    };

    catalogos();
  }, []);

  useEffect(() => {
    cargar(filtro);
  }, [filtro]);

  const registrar = async () => {
    setError("");
    setAviso("");

    const res = await fetch(`${API_URL}/api/observaciones`, {
      method: "POST",
      credentials: "include",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(nueva),
    });

    const json = await res.json();

    if (!res.ok) {
      setError(json?.message || "No se pudo registrar");
      return;
    }

    setAviso("Observación registrada");

    setNueva({
      titulo: "",
      descripcion: "",
      tipo: "ACADEMICA",
      gravedad: "MEDIA",
      alumnoId: "",
      docenteId: "",
      grupoId: "",
    });

    cargar(filtro);
  };

  const seguir = async (id: string) => {
    if (!nota.trim()) {
      setError("La nota de seguimiento no puede ir vacía");
      return;
    }

    setError("");
    setAviso("");

    const res = await fetch(`${API_URL}/api/observaciones/${id}/seguimiento`, {
      method: "POST",
      credentials: "include",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ nota, estatusNuevo }),
    });

    const json = await res.json();

    if (!res.ok) {
      setError(json?.message || "No se pudo registrar el seguimiento");
      return;
    }

    setAviso("Seguimiento registrado");
    setNota("");
    cargar(filtro);
  };

  return (
    <div className="space-y-6">
      <section className="flex flex-col gap-4 rounded-2xl border bg-white p-6 shadow-sm md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-3xl font-bold">Observaciones</h1>
          <p className="text-gray-500">
            {meta.abiertas ?? 0} abierta(s) de {meta.total ?? 0}
          </p>
        </div>

        <select
          className="rounded-xl border border-gray-300 px-4 py-2"
          value={filtro}
          onChange={(e) => setFiltro(e.target.value)}
        >
          <option value="">Todas</option>
          <option value="ABIERTA">Abiertas</option>
          <option value="EN_SEGUIMIENTO">En seguimiento</option>
          <option value="RESUELTA">Resueltas</option>
          <option value="CERRADA">Cerradas</option>
        </select>
      </section>

      {error && (
        <p className="rounded-xl bg-red-50 p-4 text-red-600">{error}</p>
      )}

      {aviso && (
        <p className="rounded-xl bg-green-50 p-4 text-green-700">{aviso}</p>
      )}

      <section className="rounded-2xl border bg-white p-5 shadow-sm">
        <h2 className="mb-3 font-semibold">Registrar observación</h2>

        <div className="grid gap-3 md:grid-cols-3">
          <input
            className="rounded-xl border border-gray-300 px-3 py-2 md:col-span-2"
            placeholder="Título"
            value={nueva.titulo}
            onChange={(e) => setNueva({ ...nueva, titulo: e.target.value })}
          />

          <select
            className="rounded-xl border border-gray-300 px-3 py-2"
            value={nueva.tipo}
            onChange={(e) => setNueva({ ...nueva, tipo: e.target.value })}
          >
            {TIPOS.map((t) => (
              <option key={t} value={t}>
                {t}
              </option>
            ))}
          </select>

          <textarea
            className="rounded-xl border border-gray-300 px-3 py-2 md:col-span-3"
            placeholder="Descripción"
            rows={2}
            value={nueva.descripcion}
            onChange={(e) =>
              setNueva({ ...nueva, descripcion: e.target.value })
            }
          />

          <select
            className="rounded-xl border border-gray-300 px-3 py-2"
            value={nueva.alumnoId}
            onChange={(e) => setNueva({ ...nueva, alumnoId: e.target.value })}
          >
            <option value="">Alumno (opcional)</option>
            {alumnos.map((a) => (
              <option key={a.id} value={a.id}>
                {a.matricula} — {a.user?.name}
              </option>
            ))}
          </select>

          <select
            className="rounded-xl border border-gray-300 px-3 py-2"
            value={nueva.docenteId}
            onChange={(e) => setNueva({ ...nueva, docenteId: e.target.value })}
          >
            <option value="">Docente (opcional)</option>
            {docentes.map((d) => (
              <option key={d.id} value={d.id}>
                {d.nombre || d.user?.name}
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

          <select
            className="rounded-xl border border-gray-300 px-3 py-2"
            value={nueva.gravedad}
            onChange={(e) => setNueva({ ...nueva, gravedad: e.target.value })}
          >
            {GRAVEDADES.map((g) => (
              <option key={g} value={g}>
                Gravedad {g}
              </option>
            ))}
          </select>

          <button
            onClick={registrar}
            className="rounded-xl bg-blue-600 px-6 py-2 text-white hover:bg-blue-700 md:col-span-2"
          >
            Registrar
          </button>
        </div>

        <p className="mt-2 text-xs text-gray-400">
          Debe referirse al menos a un alumno, docente o grupo.
        </p>
      </section>

      {loading && <p className="text-gray-500">Cargando...</p>}

      {!loading && observaciones.length === 0 && !error && (
        <div className="rounded-2xl border bg-white p-8 text-center text-gray-500">
          No hay observaciones con ese filtro.
        </div>
      )}

      <div className="space-y-3">
        {observaciones.map((o) => {
          const cerrada = ["RESUELTA", "CERRADA"].includes(o.estatus);

          return (
            <article
              key={o.id}
              className="rounded-2xl border bg-white p-5 shadow-sm"
            >
              <div className="flex flex-wrap items-start justify-between gap-2">
                <div>
                  <h3 className="font-semibold">{o.titulo}</h3>

                  <p className="text-sm text-gray-500">
                    {o.alumno?.user?.name && `Alumno: ${o.alumno.user.name} · `}
                    {(o.docente?.nombre || o.docente?.user?.name) &&
                      `Docente: ${o.docente.nombre || o.docente.user.name} · `}
                    {o.grupo?.nombre && `Grupo ${o.grupo.nombre} · `}
                    {new Date(o.createdAt).toLocaleDateString("es-MX")}
                  </p>
                </div>

                <div className="flex gap-2">
                  <span
                    className={`rounded-full px-3 py-1 text-xs ${
                      COLOR_GRAVEDAD[o.gravedad]
                    }`}
                  >
                    {o.gravedad}
                  </span>

                  <span className="rounded-full bg-slate-100 px-3 py-1 text-xs text-slate-600">
                    {o.tipo}
                  </span>

                  <span
                    className={`rounded-full px-3 py-1 text-xs ${
                      COLOR_ESTATUS[o.estatus]
                    }`}
                  >
                    {o.estatus.replace("_", " ")}
                  </span>
                </div>
              </div>

              <p className="mt-3 text-sm text-gray-700">{o.descripcion}</p>

              {(o.seguimientos ?? []).length > 0 && (
                <ul className="mt-4 space-y-2 border-l-2 border-gray-100 pl-4">
                  {o.seguimientos.map((s: any) => (
                    <li key={s.id} className="text-sm">
                      <span className="text-gray-400">
                        {new Date(s.createdAt).toLocaleDateString("es-MX")} —{" "}
                      </span>
                      {s.nota}
                      {s.estatusNuevo && (
                        <span className="ml-2 rounded bg-slate-100 px-2 py-0.5 text-xs text-slate-600">
                          → {s.estatusNuevo.replace("_", " ")}
                        </span>
                      )}
                    </li>
                  ))}
                </ul>
              )}

              {!cerrada && (
                <div className="mt-4">
                  {abierta === o.id ? (
                    <div className="grid gap-2 md:grid-cols-4">
                      <input
                        className="rounded-xl border border-gray-300 px-3 py-2 md:col-span-2"
                        placeholder="Nota de seguimiento"
                        value={nota}
                        onChange={(e) => setNota(e.target.value)}
                      />

                      <select
                        className="rounded-xl border border-gray-300 px-3 py-2"
                        value={estatusNuevo}
                        onChange={(e) => setEstatusNuevo(e.target.value)}
                      >
                        <option value="EN_SEGUIMIENTO">En seguimiento</option>
                        <option value="RESUELTA">Resuelta</option>
                        <option value="CERRADA">Cerrada</option>
                      </select>

                      <button
                        onClick={() => seguir(o.id)}
                        className="rounded-xl bg-slate-800 px-4 py-2 text-sm text-white"
                      >
                        Guardar
                      </button>
                    </div>
                  ) : (
                    <button
                      onClick={() => {
                        setAbierta(o.id);
                        setNota("");
                      }}
                      className="rounded-lg border px-3 py-1 text-xs hover:bg-gray-50"
                    >
                      Dar seguimiento
                    </button>
                  )}
                </div>
              )}

              {cerrada && o.resolucion && (
                <p className="mt-3 rounded-xl bg-green-50 p-3 text-sm text-green-800">
                  Resolución: {o.resolucion}
                </p>
              )}
            </article>
          );
        })}
      </div>
    </div>
  );
}
