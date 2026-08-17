"use client";

import { useEffect, useState } from "react";
import { API_URL } from "@/lib/config";
import { notificar } from "@/lib/notificar";

export default function DirectorMateriasPage() {

  const [materias, setMaterias] =
    useState<any[]>([]);

  const [nombre, setNombre] =
    useState("");

  const [descripcion, setDescripcion] =
    useState("");

  const [loading, setLoading] =
    useState(true);

  const [creating, setCreating] =
    useState(false);

  // ========================================
  // 🔥 FETCH MATERIAS
  // ========================================
  const fetchMaterias = async () => {

    try {

      // 🔐 El token vive en una cookie httpOnly y no se puede leer desde aquí.
  // Solo se comprueba que exista una sesión guardada.
  const sesion =
    typeof window !== "undefined"
      ? localStorage.getItem("user")
      : null;

      const res = await fetch(
        `${API_URL}/api/materias`,
        {
          credentials: "include",
        }
      );

      const data =
        await res.json();

      setMaterias(
        Array.isArray(data)
          ? data
          : Array.isArray(data?.data)
          ? data.data
          : Array.isArray(data?.materias)
          ? data.materias
          : []
      );

    } catch (error) {

      console.error(error);

      notificar(
        "Error obteniendo materias"
      , "error");

    } finally {

      setLoading(false);

    }
  };

  // ========================================
  // ➕ CREAR MATERIA
  // ========================================
  const crearMateria = async () => {

    if (!nombre) {

      notificar(
        "Nombre requerido"
      , "alerta");

      return;
    }

    try {

      setCreating(true);

      const res = await fetch(
        `${API_URL}/api/materias`,
        {

          method: "POST",

          credentials: "include",
          headers: {

            "Content-Type":
              "application/json"
          },

          body: JSON.stringify({

            nombre,
            descripcion

          })

        }
      );

      const response =
        await res.json();

      if (!res.ok) {

        throw new Error(
          response?.message ||
          "Error creando materia"
        );

      }

      notificar(
        "✅ Materia creada"
      , "exito");

      // 🔥 LIMPIAR
      setNombre("");
      setDescripcion("");

      fetchMaterias();

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

    fetchMaterias();

  }, []);

  // ========================================
  // LOADING
  // ========================================
  if (loading) {

    return (
      <div className="p-6">
        Cargando materias...
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
          Gestión de materias 📘
        </h1>

        <p className="text-gray-500 mt-1">
          Administración académica de materias
        </p>

      </section>

      {/* FORM */}
      <section className="bg-white rounded-2xl shadow p-6">

        <h2 className="text-xl font-semibold mb-4">
          Nueva materia
        </h2>

        <div className="grid md:grid-cols-2 gap-4">

          {/* NOMBRE */}
          <input
            type="text"
            placeholder="Ej: Programación Web"
            value={nombre}
            onChange={(e) =>
              setNombre(
                e.target.value
              )
            }
            className="border rounded-xl p-3"
          />

          {/* DESCRIPCIÓN */}
          <input
            type="text"
            placeholder="Descripción de la materia"
            value={descripcion}
            onChange={(e) =>
              setDescripcion(
                e.target.value
              )
            }
            className="border rounded-xl p-3"
          />

        </div>

        <button
          onClick={crearMateria}
          disabled={creating}
          className="mt-6 bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-xl"
        >
          {
            creating
              ? "Creando..."
              : "Crear materia"
          }
        </button>

      </section>

      {/* TABLA */}
      <section className="bg-white rounded-2xl shadow p-6">

        <h2 className="text-xl font-semibold mb-4">
          Materias registradas
        </h2>

        {
          materias.length === 0 ? (

            <p className="text-gray-500">
              No hay materias registradas
            </p>

          ) : (

            <div className="overflow-x-auto">

              <table className="w-full">

                <thead>

                  <tr className="border-b">

                    <th className="text-left p-3">
                      Materia
                    </th>

                    <th className="text-left p-3">
                      Descripción
                    </th>

                  </tr>

                </thead>

                <tbody>

                  {
                    materias.map((m) => (

                      <tr
                        key={m.id}
                        className="border-b"
                      >

                        <td className="p-3 font-medium">
                          {m.nombre}
                        </td>

                        <td className="p-3">
                          {
                            m.descripcion ||
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