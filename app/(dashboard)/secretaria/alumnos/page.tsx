"use client";

import { useEffect, useMemo, useState } from "react";

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

  const [search, setSearch] =
    useState("");

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

  const [carreraId, setCarreraId] =
    useState("");

  //////////////////////////////////////////////////////
  // 🔥 GET ALUMNOS
  //////////////////////////////////////////////////////

  const fetchAlumnos = async () => {
    try {
      setLoading(true);
      setError("");

      const token =
        localStorage.getItem("token");

      const res = await fetch(
        "http://localhost:4000/api/alumnos",
        {
          method: "GET",

          headers: {
            "Content-Type":
              "application/json",

            Authorization: `Bearer ${token}`,
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

  useEffect(() => {
    fetchAlumnos();
  }, []);

  //////////////////////////////////////////////////////
  // 🔥 CREAR ALUMNO
  //////////////////////////////////////////////////////

  const crearAlumno = async () => {
    try {
      const token =
        localStorage.getItem("token");

      const res = await fetch(
        "http://localhost:4000/api/alumnos",
        {
          method: "POST",

          headers: {
            "Content-Type":
              "application/json",

            Authorization: `Bearer ${token}`,
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

      alert(`
Alumno creado correctamente ✅

Correo:
${email}

Contraseña temporal:
${response.passwordTemporal}
`);

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

      alert(
        err?.message ||
          "Error creando alumno"
      );
    }
  };

  //////////////////////////////////////////////////////
  // 🔥 FILTRO
  //////////////////////////////////////////////////////

  const filtrados = useMemo(() => {
    return (alumnos ?? []).filter(
      (a) => {
        const texto = `
          ${a?.user?.name ?? ""}
          ${a?.user?.email ?? ""}
          ${a?.matricula ?? ""}
        `.toLowerCase();

        return texto.includes(
          search.toLowerCase()
        );
      }
    );
  }, [alumnos, search]);

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
        <input
          type="text"
          placeholder="Buscar alumno..."
          value={search}
          onChange={(e) =>
            setSearch(e.target.value)
          }
          className="w-full rounded-xl border p-3 outline-none focus:border-blue-500"
        />
      </section>

      {/* TABLE */}
      <section className="rounded-2xl bg-white p-6 shadow">

        {(filtrados ?? []).length ===
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
                {(filtrados ?? []).map(
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

              <input
                type="text"
                placeholder="Programa ID"
                value={programaId}
                onChange={(e) =>
                  setProgramaId(
                    e.target.value
                  )
                }
                className="rounded-xl border p-3"
              />

              <input
                type="text"
                placeholder="Carrera ID"
                value={carreraId}
                onChange={(e) =>
                  setCarreraId(
                    e.target.value
                  )
                }
                className="rounded-xl border p-3"
              />

              <input
                type="text"
                placeholder="Grupo ID"
                value={grupoId}
                onChange={(e) =>
                  setGrupoId(
                    e.target.value
                  )
                }
                className="rounded-xl border p-3"
              />

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