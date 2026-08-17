"use client";

import { useEffect, useState } from "react";
import { API_URL } from "@/lib/config";
import { notificar } from "@/lib/notificar";

export default function DirectorGruposPage() {

  const [grupos, setGrupos] =
    useState<any[]>([]);

  const [semestres, setSemestres] =
    useState<any[]>([]);

  const [nombre, setNombre] =
    useState("");

  const [turno, setTurno] =
    useState("");

  const [nivel, setNivel] =
    useState("");

  const [semestreId, setSemestreId] =
    useState("");

  const [loading, setLoading] =
    useState(true);

  const [creating, setCreating] =
    useState(false);

  // ========================================
  // 🔥 FETCH DATA
  // ========================================
  const fetchData = async () => {

    try {

      // 🔐 El token vive en una cookie httpOnly y no se puede leer desde aquí.
  // Solo se comprueba que exista una sesión guardada.
  const sesion =
    typeof window !== "undefined"
      ? localStorage.getItem("user")
      : null;

      // 👥 GRUPOS
      const resGrupos =
        await fetch(
          `${API_URL}/api/grupos`,
          {
            credentials: "include",
          }
        );

      const gruposData =
        await resGrupos.json();

      // 📚 SEMESTRES
      const resSemestres =
        await fetch(
          `${API_URL}/api/semestres`,
          {
            credentials: "include",
          }
        );

      const semestresData =
        await resSemestres.json();

      // 🔥 NORMALIZAR
      setGrupos(
        Array.isArray(gruposData)
          ? gruposData
          : Array.isArray(gruposData?.data)
          ? gruposData.data
          : Array.isArray(gruposData?.grupos)
          ? gruposData.grupos
          : []
      );

      setSemestres(
        Array.isArray(semestresData)
          ? semestresData
          : Array.isArray(semestresData?.data)
          ? semestresData.data
          : Array.isArray(semestresData?.semestres)
          ? semestresData.semestres
          : []
      );

    } catch (error) {

      console.error(error);

      notificar(
        "Error cargando grupos"
      , "error");

    } finally {

      setLoading(false);

    }
  };

  // ========================================
  // ➕ CREAR GRUPO
  // ========================================
  const crearGrupo = async () => {

    if (!nombre) {

      notificar(
        "Nombre requerido"
      , "alerta");

      return;
    }

    try {

      setCreating(true);

      const res = await fetch(
        `${API_URL}/api/grupos`,
        {

          method: "POST",

          credentials: "include",
          headers: {

            "Content-Type":
              "application/json"
          },

          body: JSON.stringify({

            nombre,
            turno,
            nivel,
            semestreId

          })

        }
      );

      const response =
        await res.json();

      if (!res.ok) {

        throw new Error(
          response?.message ||
          "Error creando grupo"
        );

      }

      notificar(
        "✅ Grupo creado"
      , "exito");

      // 🔥 LIMPIAR
      setNombre("");
      setTurno("");
      setNivel("");
      setSemestreId("");

      fetchData();

    } catch (error: any) {

      console.error(error);

      notificar(
        error.message
      , "error");

    } finally {

      setCreating(false);

    }
  };

  useEffect(() => {

    fetchData();

  }, []);

  // ========================================
  // LOADING
  // ========================================
  if (loading) {

    return (
      <div className="p-6">
        Cargando grupos...
      </div>
    );

  }

  // ========================================
  // UI
  // ========================================
  return (

    <div className="p-6 space-y-6">

      {/* HEADER */}
      <section className="bg-white rounded-2xl shadow p-6">

        <h1 className="text-3xl font-bold">
          Gestión de grupos 👥
        </h1>

        <p className="text-gray-500 mt-1">
          Administración académica de grupos
        </p>

      </section>

      {/* FORM */}
      <section className="bg-white rounded-2xl shadow p-6">

        <h2 className="text-xl font-semibold mb-4">
          Nuevo grupo
        </h2>

        <div className="grid md:grid-cols-2 gap-4">

          {/* NOMBRE */}
          <input
            type="text"
            placeholder="Ej: 3A Sistemas"
            value={nombre}
            onChange={(e) =>
              setNombre(
                e.target.value
              )
            }
            className="border rounded-xl p-3"
          />

          {/* TURNO */}
          <select
            value={turno}
            onChange={(e) =>
              setTurno(
                e.target.value
              )
            }
            className="border rounded-xl p-3"
          >

            <option value="">
              Selecciona turno
            </option>

            <option value="MATUTINO">
              MATUTINO
            </option>

            <option value="VESPERTINO">
              VESPERTINO
            </option>

            <option value="NOCTURNO">
              NOCTURNO
            </option>

          </select>

          {/* NIVEL */}
          <select
            value={nivel}
            onChange={(e) =>
              setNivel(
                e.target.value
              )
            }
            className="border rounded-xl p-3"
          >

            <option value="">
              Selecciona nivel
            </option>

            <option value="PREPARATORIA">
              PREPARATORIA
            </option>

            <option value="UNIVERSIDAD">
              UNIVERSIDAD
            </option>

          </select>

          {/* SEMESTRE */}
          <select
            value={semestreId}
            onChange={(e) =>
              setSemestreId(
                e.target.value
              )
            }
            className="border rounded-xl p-3"
          >

            <option value="">
              Selecciona semestre
            </option>

            {
              semestres.map((s) => (

                <option
                  key={s.id}
                  value={s.id}
                >
                  {s.nombre}
                </option>

              ))
            }

          </select>

        </div>

        <button
          onClick={crearGrupo}
          disabled={creating}
          className="mt-6 bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-xl"
        >
          {
            creating
              ? "Creando..."
              : "Crear grupo"
          }
        </button>

      </section>

      {/* TABLA */}
      <section className="bg-white rounded-2xl shadow p-6">

        <h2 className="text-xl font-semibold mb-4">
          Grupos registrados
        </h2>

        {
          grupos.length === 0 ? (

            <p className="text-gray-500">
              No hay grupos registrados
            </p>

          ) : (

            <div className="overflow-x-auto">

              <table className="w-full">

                <thead>

                  <tr className="border-b">

                    <th className="text-left p-3">
                      Grupo
                    </th>

                    <th className="text-left p-3">
                      Turno
                    </th>

                    <th className="text-left p-3">
                      Nivel
                    </th>

                    <th className="text-left p-3">
                      Semestre
                    </th>

                  </tr>

                </thead>

                <tbody>

                  {
                    grupos.map((g) => (

                      <tr
                        key={g.id}
                        className="border-b"
                      >

                        <td className="p-3 font-medium">
                          {g.nombre}
                        </td>

                        <td className="p-3">
                          {g.turno?.nombre || "-"}
                        </td>

                        <td className="p-3">
                          {g.semestre?.carrera?.nombre || "-"}
                        </td>

                        <td className="p-3">
                          {
                            g?.semestre?.nombre ||
                            "-"
                          }
                        </td>

                      </tr>

                    ))
                  }

                </tbody>

              </table>

            </div>

          )
        }

      </section>

    </div>

  );
}