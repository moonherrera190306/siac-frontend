"use client";

import { useEffect, useState } from "react";

export default function DirectorDocentesPage() {

  const [docentes, setDocentes] =
    useState<any[]>([]);

  const [nombre, setNombre] =
    useState("");

  const [email, setEmail] =
    useState("");

  const [password, setPassword] =
    useState("");

  const [loading, setLoading] =
    useState(true);

  const [creating, setCreating] =
    useState(false);

  // ========================================
  // 🔥 FETCH DOCENTES
  // ========================================
  const fetchDocentes = async () => {

    try {

      const token =
        localStorage.getItem("token");

      const res = await fetch(
        "http://localhost:4000/api/docentes",
        {
          headers: {
            Authorization:
              `Bearer ${token}`
          }
        }
      );

      const data =
        await res.json();

      setDocentes(
        Array.isArray(data)
          ? data
          : Array.isArray(data?.data)
          ? data.data
          : Array.isArray(data?.docentes)
          ? data.docentes
          : []
      );

    } catch (error) {

      console.error(error);

      alert(
        "Error obteniendo docentes"
      );

    } finally {

      setLoading(false);

    }
  };

  // ========================================
  // ➕ CREAR DOCENTE
  // ========================================
  const crearDocente = async () => {

    if (
      !nombre ||
      !email ||
      !password
    ) {

      alert(
        "Completa todos los campos"
      );

      return;
    }

    try {

      setCreating(true);

      const token =
        localStorage.getItem("token");

      const res = await fetch(
        "http://localhost:4000/api/docentes",
        {

          method: "POST",

          headers: {

            "Content-Type":
              "application/json",

            Authorization:
              `Bearer ${token}`

          },

          body: JSON.stringify({

            name: nombre,
            email,
            password

          })

        }
      );

      const response =
        await res.json();

      if (!res.ok) {

        throw new Error(
          response?.message ||
          "Error creando docente"
        );

      }

      alert(
        "✅ Docente creado"
      );

      // 🔥 LIMPIAR
      setNombre("");
      setEmail("");
      setPassword("");

      fetchDocentes();

    } catch (error: any) {

      console.error(error);

      alert(
        error.message
      );

    } finally {

      setCreating(false);

    }
  };

  useEffect(() => {

    fetchDocentes();

  }, []);

  // ========================================
  // LOADING
  // ========================================
  if (loading) {

    return (
      <div className="p-6">
        Cargando docentes...
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
          Gestión de maestros 👨‍🏫
        </h1>

        <p className="text-gray-500 mt-1">
          Administración de docentes
        </p>

      </section>

      {/* FORM */}
      <section className="bg-white rounded-2xl shadow p-6">

        <h2 className="text-xl font-semibold mb-4">
          Nuevo docente
        </h2>

        <div className="grid md:grid-cols-3 gap-4">

          {/* NOMBRE */}
          <input
            type="text"
            placeholder="Nombre completo"
            value={nombre}
            onChange={(e) =>
              setNombre(
                e.target.value
              )
            }
            className="border rounded-xl p-3"
          />

          {/* EMAIL */}
          <input
            type="email"
            placeholder="correo@siac.com"
            value={email}
            onChange={(e) =>
              setEmail(
                e.target.value
              )
            }
            className="border rounded-xl p-3"
          />

          {/* PASSWORD */}
          <input
            type="text"
            placeholder="Contraseña temporal"
            value={password}
            onChange={(e) =>
              setPassword(
                e.target.value
              )
            }
            className="border rounded-xl p-3"
          />

        </div>

        <button
          onClick={crearDocente}
          disabled={creating}
          className="mt-6 bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-xl"
        >
          {
            creating
              ? "Creando..."
              : "Crear docente"
          }
        </button>

      </section>

      {/* TABLA */}
      <section className="bg-white rounded-2xl shadow p-6">

        <h2 className="text-xl font-semibold mb-4">
          Docentes registrados
        </h2>

        {
          docentes.length === 0 ? (

            <p className="text-gray-500">
              No hay docentes registrados
            </p>

          ) : (

            <div className="overflow-x-auto">

              <table className="w-full">

                <thead>

                  <tr className="border-b">

                    <th className="text-left p-3">
                      Nombre
                    </th>

                    <th className="text-left p-3">
                      Correo
                    </th>

                    <th className="text-left p-3">
                      Estado
                    </th>

                  </tr>

                </thead>

                <tbody>

                  {
                    docentes.map((d) => (

                      <tr
                        key={d.id}
                        className="border-b"
                      >

                        <td className="p-3 font-medium">
                          {
                            d?.user?.name ||
                            "-"
                          }
                        </td>

                        <td className="p-3">
                          {
                            d?.user?.email ||
                            "-"
                          }
                        </td>

                        <td className="p-3">

                          {
                            d?.user?.activo ? (

                              <span className="bg-green-100 text-green-700 px-3 py-1 rounded-full text-sm">
                                ACTIVO
                              </span>

                            ) : (

                              <span className="bg-red-100 text-red-700 px-3 py-1 rounded-full text-sm">
                                INACTIVO
                              </span>

                            )
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