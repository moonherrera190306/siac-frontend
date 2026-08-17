"use client";

import { useEffect, useState } from "react";
import { API_URL } from "@/lib/config";

type Nivel = {
  id: string;
  clave: string;
  nombre: string;
  _count?: { programas?: number; trayectorias?: number };
};

type Turno = {
  id: string;
  clave: string;
  nombre: string;
  _count?: { grupos?: number };
};

type Trayectoria = {
  id: string;
  clave: string;
  nombre: string;
  seccion?: string | null;
  nivelAcademico?: { clave?: string; nombre?: string } | null;
  _count?: { alumnos?: number; materias?: number };
};

const CLAVE_PREPA = "PREPARATORIA";

type Pestana = "niveles" | "turnos" | "trayectorias";

export default function DirectorEstructuraPage() {
  const [pestana, setPestana] = useState<Pestana>("niveles");

  const [niveles, setNiveles] = useState<Nivel[]>([]);
  const [turnos, setTurnos] = useState<Turno[]>([]);
  const [trayectorias, setTrayectorias] = useState<Trayectoria[]>([]);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [aviso, setAviso] = useState("");

  // formularios
  const [nuevoNivel, setNuevoNivel] = useState({ clave: "", nombre: "" });
  const [nuevoTurno, setNuevoTurno] = useState({ clave: "", nombre: "" });
  const [nuevaTray, setNuevaTray] = useState({
    clave: "",
    nombre: "",
    seccion: "",
  });

  // 🔒 Las trayectorias son de preparatoria (UMSNH).
  // Si no existe ese nivel, la pestaña ni se muestra.
  const nivelPrepa = niveles.find((n) => n.clave === CLAVE_PREPA);

  const cargar = async () => {
    try {
      setLoading(true);

      const [rn, rt, rtr] = await Promise.all([
        fetch(`${API_URL}/api/niveles`, { credentials: "include" }),
        fetch(`${API_URL}/api/turnos`, { credentials: "include" }),
        fetch(`${API_URL}/api/trayectorias?soloPreparatoria=true`, {
          credentials: "include",
        }),
      ]);

      const [jn, jt, jtr] = await Promise.all([rn.json(), rt.json(), rtr.json()]);

      if (!rn.ok) throw new Error(jn?.message || "Error al cargar niveles");

      setNiveles(jn?.data ?? []);
      setTurnos(jt?.data ?? []);
      setTrayectorias(jtr?.data ?? []);
      setError("");
    } catch (e: any) {
      setError(e.message || "Error al cargar la estructura");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    cargar();
  }, []);

  // Si desaparece el nivel de preparatoria, no dejar la pestaña abierta.
  useEffect(() => {
    if (pestana === "trayectorias" && !nivelPrepa) {
      setPestana("niveles");
    }
  }, [nivelPrepa, pestana]);

  const enviar = async (url: string, body: any, alTerminar: () => void) => {
    setError("");
    setAviso("");

    const res = await fetch(`${API_URL}${url}`, {
      method: "POST",
      credentials: "include",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });

    const json = await res.json();

    if (!res.ok) {
      setError(json?.message || "No se pudo guardar");
      return;
    }

    setAviso("Guardado correctamente");
    alTerminar();
    cargar();
  };

  const eliminar = async (url: string) => {
    setError("");
    setAviso("");

    const res = await fetch(`${API_URL}${url}`, {
      method: "DELETE",
      credentials: "include",
    });

    const json = await res.json();

    if (!res.ok) {
      setError(json?.message || "No se pudo eliminar");
      return;
    }

    setAviso(json?.message || "Eliminado");
    cargar();
  };

  if (loading) return <p className="p-6">Cargando...</p>;

  const pestanas: { id: Pestana; label: string }[] = [
    { id: "niveles", label: "Niveles" },
    { id: "turnos", label: "Turnos" },
  ];

  if (nivelPrepa) {
    pestanas.push({ id: "trayectorias", label: "Trayectorias" });
  }

  return (
    <div className="space-y-6">
      <section className="rounded-2xl border bg-white p-6 shadow-sm">
        <h1 className="text-3xl font-bold">Estructura académica</h1>
        <p className="text-gray-500">
          Catálogos base: niveles, turnos y trayectorias
        </p>
      </section>

      {error && (
        <p className="rounded-xl bg-red-50 p-4 text-red-600">{error}</p>
      )}

      {aviso && (
        <p className="rounded-xl bg-green-50 p-4 text-green-700">{aviso}</p>
      )}

      <div className="flex gap-2">
        {pestanas.map((p) => (
          <button
            key={p.id}
            onClick={() => setPestana(p.id)}
            className={`rounded-xl px-4 py-2 text-sm font-medium transition ${
              pestana === p.id
                ? "bg-slate-900 text-white"
                : "border bg-white hover:bg-gray-50"
            }`}
          >
            {p.label}
          </button>
        ))}
      </div>

      {/* ---------------- NIVELES ---------------- */}
      {pestana === "niveles" && (
        <section className="space-y-4">
          <div className="rounded-2xl border bg-white p-5 shadow-sm">
            <h2 className="mb-3 font-semibold">Nuevo nivel</h2>

            <div className="flex flex-col gap-3 md:flex-row">
              <input
                className="rounded-xl border border-gray-300 px-4 py-2 md:w-56"
                placeholder="Clave (ej. PREPARATORIA)"
                value={nuevoNivel.clave}
                onChange={(e) =>
                  setNuevoNivel({ ...nuevoNivel, clave: e.target.value })
                }
              />

              <input
                className="flex-1 rounded-xl border border-gray-300 px-4 py-2"
                placeholder="Nombre"
                value={nuevoNivel.nombre}
                onChange={(e) =>
                  setNuevoNivel({ ...nuevoNivel, nombre: e.target.value })
                }
              />

              <button
                onClick={() =>
                  enviar("/api/niveles", nuevoNivel, () =>
                    setNuevoNivel({ clave: "", nombre: "" })
                  )
                }
                className="rounded-xl bg-blue-600 px-6 py-2 text-white hover:bg-blue-700"
              >
                Agregar
              </button>
            </div>
          </div>

          <div className="overflow-x-auto rounded-2xl border bg-white shadow-sm">
            <table className="w-full text-left text-sm">
              <thead className="bg-gray-50 text-gray-600">
                <tr>
                  <th className="px-4 py-3">Clave</th>
                  <th className="px-4 py-3">Nombre</th>
                  <th className="px-4 py-3">Programas</th>
                  <th className="px-4 py-3"></th>
                </tr>
              </thead>

              <tbody>
                {niveles.map((n) => (
                  <tr key={n.id} className="border-t">
                    <td className="px-4 py-3 font-medium">{n.clave}</td>
                    <td className="px-4 py-3">{n.nombre}</td>
                    <td className="px-4 py-3">{n._count?.programas ?? 0}</td>
                    <td className="px-4 py-3">
                      <button
                        onClick={() => eliminar(`/api/niveles/${n.id}`)}
                        className="rounded-lg border px-3 py-1 text-xs hover:bg-red-50"
                      >
                        Eliminar
                      </button>
                    </td>
                  </tr>
                ))}

                {niveles.length === 0 && (
                  <tr>
                    <td colSpan={4} className="px-4 py-6 text-center text-gray-500">
                      No hay niveles registrados.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </section>
      )}

      {/* ---------------- TURNOS ---------------- */}
      {pestana === "turnos" && (
        <section className="space-y-4">
          <div className="rounded-2xl border bg-white p-5 shadow-sm">
            <h2 className="mb-3 font-semibold">Nuevo turno</h2>

            <div className="flex flex-col gap-3 md:flex-row">
              <input
                className="rounded-xl border border-gray-300 px-4 py-2 md:w-40"
                placeholder="Clave (MAT / VES)"
                value={nuevoTurno.clave}
                onChange={(e) =>
                  setNuevoTurno({ ...nuevoTurno, clave: e.target.value })
                }
              />

              <input
                className="flex-1 rounded-xl border border-gray-300 px-4 py-2"
                placeholder="Nombre"
                value={nuevoTurno.nombre}
                onChange={(e) =>
                  setNuevoTurno({ ...nuevoTurno, nombre: e.target.value })
                }
              />

              <button
                onClick={() =>
                  enviar("/api/turnos", nuevoTurno, () =>
                    setNuevoTurno({ clave: "", nombre: "" })
                  )
                }
                className="rounded-xl bg-blue-600 px-6 py-2 text-white hover:bg-blue-700"
              >
                Agregar
              </button>
            </div>
          </div>

          <div className="overflow-x-auto rounded-2xl border bg-white shadow-sm">
            <table className="w-full text-left text-sm">
              <thead className="bg-gray-50 text-gray-600">
                <tr>
                  <th className="px-4 py-3">Clave</th>
                  <th className="px-4 py-3">Nombre</th>
                  <th className="px-4 py-3">Grupos</th>
                  <th className="px-4 py-3"></th>
                </tr>
              </thead>

              <tbody>
                {turnos.map((t) => (
                  <tr key={t.id} className="border-t">
                    <td className="px-4 py-3 font-medium">{t.clave}</td>
                    <td className="px-4 py-3">{t.nombre}</td>
                    <td className="px-4 py-3">{t._count?.grupos ?? 0}</td>
                    <td className="px-4 py-3">
                      <button
                        onClick={() => eliminar(`/api/turnos/${t.id}`)}
                        className="rounded-lg border px-3 py-1 text-xs hover:bg-red-50"
                      >
                        Eliminar
                      </button>
                    </td>
                  </tr>
                ))}

                {turnos.length === 0 && (
                  <tr>
                    <td colSpan={4} className="px-4 py-6 text-center text-gray-500">
                      No hay turnos registrados.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </section>
      )}

      {/* ---------------- TRAYECTORIAS ---------------- */}
      {pestana === "trayectorias" && nivelPrepa && (
        <section className="space-y-4">
          <p className="rounded-xl bg-blue-50 p-4 text-sm text-blue-800">
            Las trayectorias son áreas propedéuticas de la UMSNH y aplican
            únicamente a <strong>{nivelPrepa.nombre}</strong>. No se muestran
            en universidad.
          </p>

          <div className="rounded-2xl border bg-white p-5 shadow-sm">
            <h2 className="mb-3 font-semibold">Nueva trayectoria</h2>

            <div className="flex flex-col gap-3 md:flex-row">
              <input
                className="rounded-xl border border-gray-300 px-4 py-2 md:w-32"
                placeholder="Clave (321)"
                value={nuevaTray.clave}
                onChange={(e) =>
                  setNuevaTray({ ...nuevaTray, clave: e.target.value })
                }
              />

              <input
                className="flex-1 rounded-xl border border-gray-300 px-4 py-2"
                placeholder="Nombre"
                value={nuevaTray.nombre}
                onChange={(e) =>
                  setNuevaTray({ ...nuevaTray, nombre: e.target.value })
                }
              />

              <input
                className="rounded-xl border border-gray-300 px-4 py-2 md:w-32"
                placeholder="Sección"
                value={nuevaTray.seccion}
                onChange={(e) =>
                  setNuevaTray({ ...nuevaTray, seccion: e.target.value })
                }
              />

              <button
                onClick={() =>
                  enviar(
                    "/api/trayectorias",
                    { ...nuevaTray, nivelAcademicoId: nivelPrepa.id },
                    () => setNuevaTray({ clave: "", nombre: "", seccion: "" })
                  )
                }
                className="rounded-xl bg-blue-600 px-6 py-2 text-white hover:bg-blue-700"
              >
                Agregar
              </button>
            </div>
          </div>

          <div className="overflow-x-auto rounded-2xl border bg-white shadow-sm">
            <table className="w-full text-left text-sm">
              <thead className="bg-gray-50 text-gray-600">
                <tr>
                  <th className="px-4 py-3">Clave</th>
                  <th className="px-4 py-3">Nombre</th>
                  <th className="px-4 py-3">Sección</th>
                  <th className="px-4 py-3">Alumnos</th>
                  <th className="px-4 py-3">Materias</th>
                  <th className="px-4 py-3"></th>
                </tr>
              </thead>

              <tbody>
                {trayectorias.map((t) => (
                  <tr key={t.id} className="border-t">
                    <td className="px-4 py-3 font-medium">{t.clave}</td>
                    <td className="px-4 py-3">{t.nombre}</td>
                    <td className="px-4 py-3">{t.seccion || "—"}</td>
                    <td className="px-4 py-3">{t._count?.alumnos ?? 0}</td>
                    <td className="px-4 py-3">{t._count?.materias ?? 0}</td>
                    <td className="px-4 py-3">
                      <button
                        onClick={() => eliminar(`/api/trayectorias/${t.id}`)}
                        className="rounded-lg border px-3 py-1 text-xs hover:bg-red-50"
                      >
                        Eliminar
                      </button>
                    </td>
                  </tr>
                ))}

                {trayectorias.length === 0 && (
                  <tr>
                    <td colSpan={6} className="px-4 py-6 text-center text-gray-500">
                      No hay trayectorias registradas.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </section>
      )}
    </div>
  );
}
