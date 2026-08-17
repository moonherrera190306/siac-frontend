"use client";

import { useEffect, useState } from "react";
import { API_URL } from "@/lib/config";
import { notificar } from "@/lib/notificar";

export default function DirectorDocentesPage() {

  const [docentes, setDocentes] =
    useState<any[]>([]);

  const [nombre, setNombre] =
    useState("");

  const [email, setEmail] =
    useState("");

  const [cedula, setCedula] =
    useState("");

  const [rfc, setRfc] =
    useState("");

  const [telefono, setTelefono] =
    useState("");

  const [aviso, setAviso] =
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

      // 🔐 El token vive en una cookie httpOnly y no se puede leer desde aquí.
  // Solo se comprueba que exista una sesión guardada.
  const sesion =
    typeof window !== "undefined"
      ? localStorage.getItem("user")
      : null;

      const res = await fetch(
        `${API_URL}/api/docentes`,
        {
          credentials: "include",
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

      notificar(
        "Error obteniendo docentes"
      , "error");

    } finally {

      setLoading(false);

    }
  };

  // ========================================
  // ➕ CREAR DOCENTE
  // ========================================
  // Un docente nunca se borra: se desactiva. El backend rechaza
  // desactivar a quien todavía tiene asignaciones en el ciclo activo.
  const cambiarEstado = async (id: string, activo: boolean) => {
    setAviso("");

    const res = await fetch(`${API_URL}/api/docentes/${id}/estado`, {
      method: "PUT",
      credentials: "include",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ activo }),
    });

    const json = await res.json();

    if (!res.ok) {
      notificar(json?.message || "No se pudo cambiar el estado", "error");
      return;
    }

    setAviso(json?.message || "Estado actualizado");
    fetchDocentes();
  };

  const crearDocente = async () => {

    if (
      !nombre ||
      !email ||
      !password
    ) {

      notificar(
        "Completa todos los campos"
      , "alerta");

      return;
    }

    try {

      setCreating(true);

      const res = await fetch(
        `${API_URL}/api/docentes`,
        {

          method: "POST",

          credentials: "include",
          headers: {

            "Content-Type":
              "application/json"
          },

          body: JSON.stringify({

            name: nombre,
            email,
            password,

            // Sin cédula ni RFC no se pueden emitir actas oficiales.
            cedula,
            rfc,
            telefono

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

      notificar(
        "✅ Docente creado"
      , "exito");

      // 🔥 LIMPIAR
      setNombre("");
      setEmail("");
      setPassword("");

      fetchDocentes();

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

          {/* CÉDULA */}
          <input
            type="text"
            placeholder="Cédula profesional"
            value={cedula}
            onChange={(e) => setCedula(e.target.value)}
            className="border rounded-xl p-3"
          />

          {/* RFC */}
          <input
            type="text"
            placeholder="RFC"
            value={rfc}
            onChange={(e) => setRfc(e.target.value)}
            className="border rounded-xl p-3"
          />

          {/* TELÉFONO */}
          <input
            type="text"
            placeholder="Teléfono"
            value={telefono}
            onChange={(e) => setTelefono(e.target.value)}
            className="border rounded-xl p-3"
          />

        </div>

        {aviso && (
          <p className="mt-3 rounded-xl bg-green-50 p-3 text-sm text-green-700">
            {aviso}
          </p>
        )}

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
                      Cédula
                    </th>

                    <th className="text-left p-3">
                      RFC
                    </th>

                    <th className="text-left p-3">
                      Estado
                    </th>

                    <th className="text-left p-3">
                      Acción
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
                          {d?.cedula || "-"}
                        </td>

                        <td className="p-3">
                          {d?.rfc || "-"}
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

                        <td className="p-3">
                          <button
                            onClick={() =>
                              cambiarEstado(d.id, !d?.activo)
                            }
                            className="rounded-lg border px-3 py-1 text-xs hover:bg-gray-50"
                          >
                            {d?.activo ? "Desactivar" : "Activar"}
                          </button>
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