"use client";

import { useEffect, useState } from "react";
import { API_URL } from "@/lib/config";
import { notificar } from "@/lib/notificar";
import { BuscadorAlumnos, type CampoBusqueda } from "@/components/BuscadorAlumnos";

type Orden = "reciente" | "nombre" | "matricula";

type Alumno = {
  id?: string;

  matricula?: string;

  user?: {
    name?: string;
    email?: string;
  };

  grupo?: {
    nombre?: string;
  };

  programa?: {
    nombre?: string;
  };

  carrera?: {
    nombre?: string;
  };
};

function normalizeData(data: any): Alumno[] {
  if (Array.isArray(data)) return data;

  if (Array.isArray(data?.data)) {
    return data.data;
  }

  return [];
}

export default function SecretariaAlumnosPage() {
  const [alumnos, setAlumnos] =
    useState<Alumno[]>([]);

  const [loading, setLoading] =
    useState(true);

  const [error, setError] =
    useState("");

  const [busqueda, setBusqueda] =
    useState("");

  const [campo, setCampo] =
    useState<CampoBusqueda>("apellido");

  const [orden, setOrden] =
    useState<Orden>("reciente");

  const [open, setOpen] =
    useState(false);

  //////////////////////////////////////////////////////
  // 🔥 FORM
  //////////////////////////////////////////////////////

  const [name, setName] =
    useState("");

  const [email, setEmail] =
    useState("");

  const [matricula, setMatricula] =
    useState("");

  const [grupoId, setGrupoId] =
    useState("");

  const [programaId, setProgramaId] =
    useState("");

  const [trayectoriaId, setTrayectoriaId] =
    useState("");

  // catálogos para los selectores del alta
  const [programas, setProgramas] = useState<any[]>([]);
  const [carreras, setCarreras] = useState<any[]>([]);
  const [gruposCat, setGruposCat] = useState<any[]>([]);
  const [trayectorias, setTrayectorias] = useState<any[]>([]);

  // paginación del servidor
  const [page, setPage] = useState(1);
  const [meta, setMeta] = useState<any>({ total: 0, pages: 1 });

  const [carreraId, setCarreraId] =
    useState("");

  //////////////////////////////////////////////////////
  // 🔥 GET ALUMNOS
  //////////////////////////////////////////////////////

  const fetchAlumnos = async () => {
    try {
      setLoading(true);
      setError("");

      // 🔐 El token vive en una cookie httpOnly y no se puede leer desde aquí.
  // Solo se comprueba que exista una sesión guardada.
  const sesion =
    typeof window !== "undefined"
      ? localStorage.getItem("user")
      : null;

      // 🔥 La búsqueda y la paginación ahora las hace el servidor:
      // traer el padrón completo no se sostiene con 3,000 alumnos.
      const params = new URLSearchParams({
        page: String(page),
        perPage: "50",
        orden,
      });

      if (busqueda.trim()) {
        params.set("search", busqueda.trim());
        params.set("campo", campo);
      }

      const res = await fetch(
        `${API_URL}/api/alumnos?${params.toString()}`,
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
            "Error cargando alumnos"
        );
      }

      const data =
        response?.data || response;

      setAlumnos(
        normalizeData(data)
      );

      setMeta(response?.meta ?? { total: 0, pages: 1 });
    } catch (err: any) {
      console.error(err);

      setError(
        err?.message ||
          "Error interno del servidor"
      );

      setAlumnos([]);
    } finally {
      setLoading(false);
    }
  };

  // El nivel del programa decide si aplican trayectorias.
  const esPreparatoria = programas
    .filter((p: any) => p.id === programaId)
    .some(
      (p: any) =>
        p?.nivelAcademico?.clave === "PREPARATORIA" ||
        (p?.nombre || "").toLowerCase().includes("bachiller")
    );

  useEffect(() => {
    // Pequeño retraso para no disparar una consulta por tecla.
    const t = setTimeout(fetchAlumnos, 400);

    return () => clearTimeout(t);
  }, [page, busqueda, campo, orden]);

  // Catálogos del formulario de alta.
  useEffect(() => {
    const cargarCatalogos = async () => {
      try {
        const [rp, rc, rg, rt] = await Promise.all([
          fetch(`${API_URL}/api/programas`, { credentials: "include" }),
          fetch(`${API_URL}/api/carreras`, { credentials: "include" }),
          fetch(`${API_URL}/api/grupos`, { credentials: "include" }),
          fetch(`${API_URL}/api/trayectorias?soloPreparatoria=true`, {
            credentials: "include",
          }),
        ]);

        const [jp, jc, jg, jt] = await Promise.all([
          rp.json(),
          rc.json(),
          rg.json(),
          rt.json(),
        ]);

        setProgramas(Array.isArray(jp) ? jp : jp?.data ?? []);
        setCarreras(Array.isArray(jc) ? jc : jc?.data ?? []);
        setGruposCat(jg?.data ?? []);
        setTrayectorias(jt?.data ?? []);
      } catch {
        // Los catálogos son opcionales: si fallan, el alta sigue disponible.
      }
    };

    cargarCatalogos();
  }, []);

  //////////////////////////////////////////////////////
  // 🔥 CREAR ALUMNO
  //////////////////////////////////////////////////////

  const crearAlumno = async () => {
    try {

      const res = await fetch(
        `${API_URL}/api/alumnos`,
        {
          method: "POST",

          credentials: "include",
          headers: {
            "Content-Type":
              "application/json"
          },

          body: JSON.stringify({
            name,
            email,
            matricula,

            grupoId:
              grupoId || null,

            programaId:
              programaId || null,

            carreraId:
              carreraId || null,

            trayectoriaId:
              trayectoriaId || null,
          }),
        }
      );

      const response =
        await res.json();

      if (!res.ok) {
        throw new Error(
          response?.message ||
            "Error creando alumno"
        );
      }

      notificar(`
Alumno creado correctamente ✅

Correo:
${email}

Contraseña temporal:
${response.passwordTemporal}
`, "exito");

      setOpen(false);

      setName("");
      setEmail("");
      setMatricula("");
      setGrupoId("");
      setProgramaId("");
      setCarreraId("");

      fetchAlumnos();
    } catch (err: any) {
      console.error(err);

      notificar(
        err?.message ||
          "Error creando alumno"
      , "error");
    }
  };

  //////////////////////////////////////////////////////
  // 🔥 LOADING
  //////////////////////////////////////////////////////

  if (loading) {
    return (
      <div className="p-6">
        <p>Cargando alumnos...</p>
      </div>
    );
  }

  //////////////////////////////////////////////////////
  // 🔥 ERROR
  //////////////////////////////////////////////////////

  if (error) {
    return (
      <div className="p-6">
        <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-red-700">
          {error}
        </div>
      </div>
    );
  }

  //////////////////////////////////////////////////////
  // 🔥 UI
  //////////////////////////////////////////////////////

  return (
    <div className="space-y-6 p-6">

      {/* HEADER */}
      <section className="flex items-center justify-between rounded-2xl bg-white p-6 shadow">

        <div>
          <h1 className="text-3xl font-bold">
            Alumnos
          </h1>

          <p className="text-gray-500">
            Gestión de alumnos registrados
          </p>
        </div>

        <button
          onClick={() => setOpen(true)}
          className="rounded-xl bg-blue-600 px-4 py-3 text-white hover:bg-blue-700"
        >
          Nuevo alumno
        </button>
      </section>

      {/* SEARCH */}
      <section className="rounded-2xl bg-white p-6 shadow">
        <BuscadorAlumnos
          valor={busqueda}
          campo={campo}
          onValor={(v) => {
            setBusqueda(v);
            setPage(1);
          }}
          onCampo={(c) => {
            setCampo(c);
            setPage(1);
          }}
        >
          <select
            value={orden}
            onChange={(e) => {
              setOrden(e.target.value as Orden);
              setPage(1);
            }}
            aria-label="Ordenar por"
            className="rounded-xl border border-slate-300 px-3 py-2 text-sm"
          >
            <option value="reciente">Más recientes</option>
            <option value="nombre">Apellido (A–Z)</option>
            <option value="matricula">Matrícula</option>
          </select>
        </BuscadorAlumnos>

        <div className="mt-3 flex items-center justify-between text-sm text-gray-500">
          <span>
            {meta.total ?? 0} alumno(s) · página {page} de {meta.pages || 1}
          </span>

          <div className="flex gap-2">
            <button
              disabled={page <= 1}
              onClick={() => setPage(page - 1)}
              className="rounded-lg border px-3 py-1 disabled:opacity-40"
            >
              Anterior
            </button>

            <button
              disabled={page >= (meta.pages || 1)}
              onClick={() => setPage(page + 1)}
              className="rounded-lg border px-3 py-1 disabled:opacity-40"
            >
              Siguiente
            </button>
          </div>
        </div>
      </section>

      {/* TABLE */}
      <section className="rounded-2xl bg-white p-6 shadow">

        {(alumnos ?? []).length ===
        0 ? (
          <p className="text-gray-500">
            No hay alumnos registrados.
          </p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left">

              <thead>
                <tr className="border-b text-gray-500">
                  <th className="p-3">
                    Matrícula
                  </th>

                  <th className="p-3">
                    Nombre
                  </th>

                  <th className="p-3">
                    Correo
                  </th>

                  <th className="p-3">
                    Programa
                  </th>

                  <th className="p-3">
                    Carrera
                  </th>

                  <th className="p-3">
                    Grupo
                  </th>
                </tr>
              </thead>

              <tbody>
                {(alumnos ?? []).map(
                  (a) => (
                    <tr
                      key={a?.id}
                      className="border-b"
                    >
                      <td className="p-3">
                        {
                          a?.matricula
                        }
                      </td>

                      <td className="p-3">
                        {
                          a?.user
                            ?.name
                        }
                      </td>

                      <td className="p-3">
                        {
                          a?.user
                            ?.email
                        }
                      </td>

                      <td className="p-3">
                        {a?.programa
                          ?.nombre ||
                          "-"}
                      </td>

                      <td className="p-3">
                        {a?.carrera
                          ?.nombre ||
                          "-"}
                      </td>

                      <td className="p-3">
                        {a?.grupo
                          ?.nombre ||
                          "Sin grupo"}
                      </td>
                    </tr>
                  )
                )}
              </tbody>

            </table>
          </div>
        )}
      </section>

      {/* MODAL */}
      {open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">

          <div className="w-full max-w-2xl rounded-2xl bg-white p-6 shadow-2xl">

            <div className="mb-6 flex items-center justify-between">
              <h2 className="text-2xl font-bold">
                Nuevo alumno
              </h2>

              <button
                onClick={() =>
                  setOpen(false)
                }
              >
                ✕
              </button>
            </div>

            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">

              <input
                type="text"
                placeholder="Nombre"
                value={name}
                onChange={(e) =>
                  setName(
                    e.target.value
                  )
                }
                className="rounded-xl border p-3"
              />

              <input
                type="email"
                placeholder="Correo"
                value={email}
                onChange={(e) =>
                  setEmail(
                    e.target.value
                  )
                }
                className="rounded-xl border p-3"
              />

              <input
                type="text"
                placeholder="Matrícula"
                value={matricula}
                onChange={(e) =>
                  setMatricula(
                    e.target.value
                  )
                }
                className="rounded-xl border p-3"
              />

              {/* Antes eran campos de texto donde había que escribir
                  el UUID a mano. Ahora son catálogos. */}
              <select
                value={programaId}
                onChange={(e) => {
                  setProgramaId(e.target.value);
                  // La trayectoria depende del nivel: al cambiar de
                  // programa se limpia para no arrastrar una inválida.
                  setTrayectoriaId("");
                }}
                className="rounded-xl border p-3"
              >
                <option value="">Programa...</option>

                {programas.map((p: any) => (
                  <option key={p.id} value={p.id}>
                    {p.nombre}
                  </option>
                ))}
              </select>

              <select
                value={carreraId}
                onChange={(e) => setCarreraId(e.target.value)}
                className="rounded-xl border p-3"
              >
                <option value="">Carrera...</option>

                {carreras.map((c: any) => (
                  <option key={c.id} value={c.id}>
                    {c.nombre}
                  </option>
                ))}
              </select>

              <select
                value={grupoId}
                onChange={(e) => setGrupoId(e.target.value)}
                className="rounded-xl border p-3"
              >
                <option value="">Grupo...</option>

                {gruposCat.map((g: any) => (
                  <option key={g.id} value={g.id}>
                    {g.nombre}
                  </option>
                ))}
              </select>

              {/* 🔒 Las trayectorias solo aplican a preparatoria:
                  el selector aparece únicamente si el programa
                  seleccionado es de ese nivel. */}
              {esPreparatoria && trayectorias.length > 0 && (
                <select
                  value={trayectoriaId}
                  onChange={(e) => setTrayectoriaId(e.target.value)}
                  className="rounded-xl border p-3"
                >
                  <option value="">Trayectoria...</option>

                  {trayectorias.map((t: any) => (
                    <option key={t.id} value={t.id}>
                      {t.clave} — {t.nombre}
                    </option>
                  ))}
                </select>
              )}

            </div>

            <div className="mt-6 flex justify-end gap-3">

              <button
                onClick={() =>
                  setOpen(false)
                }
                className="rounded-xl border px-4 py-2"
              >
                Cancelar
              </button>

              <button
                onClick={crearAlumno}
                className="rounded-xl bg-blue-600 px-5 py-2 text-white hover:bg-blue-700"
              >
                Crear alumno
              </button>

            </div>

          </div>

        </div>
      )}

    </div>
  );
}