"use client";

import { useEffect, useState } from "react";

export default function DirectorCiclosPage() {

  const [ciclos, setCiclos] = useState<any[]>([]);

  const [nombre, setNombre] = useState("");
  const [fechaInicio, setFechaInicio] = useState("");
  const [fechaFin, setFechaFin] = useState("");

  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);

  // ========================================
  // 📚 OBTENER CICLOS
  // ========================================
  const fetchCiclos = async () => {

    try {

      const token =
        localStorage.getItem("token");

      const res = await fetch(
        "http://localhost:4000/api/ciclos",
        {
          headers: {
            Authorization:
              `Bearer ${token}`
          }
        }
      );

      const response =
        await res.json();

      if (!res.ok) {
        throw new Error(
          response?.message ||
          "Error cargando ciclos"
        );
      }

      setCiclos(
        response?.data || []
      );

    } catch (error) {

      console.error(error);

      alert(
        "Error obteniendo ciclos"
      );

    } finally {

      setLoading(false);

    }
  };

  // ========================================
  // ➕ CREAR CICLO
  // ========================================
  const crearCiclo = async () => {

    if (!nombre) {
      alert("Nombre requerido");
      return;
    }

    try {

      setCreating(true);

      const token =
        localStorage.getItem("token");

      const res = await fetch(
        "http://localhost:4000/api/ciclos",
        {
          method: "POST",

          headers: {
            "Content-Type":
              "application/json",

            Authorization:
              `Bearer ${token}`
          },

          body: JSON.stringify({
            nombre,
            fechaInicio,
            fechaFin
          })
        }
      );

      const response =
        await res.json();

      if (!res.ok) {
        throw new Error(
          response?.message ||
          "Error creando ciclo"
        );
      }

      alert(
        "✅ Ciclo creado"
      );

      setNombre("");
      setFechaInicio("");
      setFechaFin("");

      fetchCiclos();

    } catch (error: any) {

      console.error(error);

      alert(
        error.message
      );

    } finally {

      setCreating(false);

    }
  };

  // ========================================
  // 🔥 ACTIVAR CICLO
  // ========================================
  const activarCiclo = async (
    id: string
  ) => {

    try {

      const token =
        localStorage.getItem("token");

      const res = await fetch(
        `http://localhost:4000/api/ciclos/activar/${id}`,
        {
          method: "PUT",

          headers: {
            Authorization:
              `Bearer ${token}`
          }
        }
      );

      const response =
        await res.json();

      if (!res.ok) {
        throw new Error(
          response?.message ||
          "Error activando ciclo"
        );
      }

      alert(
        "✅ Ciclo activado"
      );

      fetchCiclos();

    } catch (error: any) {

      console.error(error);

      alert(
        error.message
      );

    }
  };

  useEffect(() => {

    fetchCiclos();

  }, []);

  // ========================================
  // LOADING
  // ========================================
  if (loading) {
    return (
      <div className="p-6">
        Cargando ciclos...
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
          Ciclos escolares 📚
        </h1>

        <p className="text-gray-500 mt-1">
          Gestión de ciclos académicos
        </p>

      </section>

      {/* FORM */}
      <section className="bg-white rounded-2xl shadow p-6">

        <h2 className="text-xl font-semibold mb-4">
          Crear ciclo
        </h2>

        <div className="grid md:grid-cols-3 gap-4">

          <div>
            <label className="text-sm text-gray-500">
              Nombre
            </label>

            <input
              type="text"
              placeholder="2025-2026"
              value={nombre}
              onChange={(e) =>
                setNombre(
                  e.target.value
                )
              }
              className="w-full mt-1 border rounded-xl p-3"
            />
          </div>

          <div>
            <label className="text-sm text-gray-500">
              Fecha inicio
            </label>

            <input
              type="date"
              value={fechaInicio}
              onChange={(e) =>
                setFechaInicio(
                  e.target.value
                )
              }
              className="w-full mt-1 border rounded-xl p-3"
            />
          </div>

          <div>
            <label className="text-sm text-gray-500">
              Fecha fin
            </label>

            <input
              type="date"
              value={fechaFin}
              onChange={(e) =>
                setFechaFin(
                  e.target.value
                )
              }
              className="w-full mt-1 border rounded-xl p-3"
            />
          </div>

        </div>

        <button
          onClick={crearCiclo}
          disabled={creating}
          className="mt-6 bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-xl font-medium"
        >
          {
            creating
              ? "Creando..."
              : "Crear ciclo"
          }
        </button>

      </section>

      {/* TABLA */}
      <section className="bg-white rounded-2xl shadow p-6">

        <h2 className="text-xl font-semibold mb-4">
          Ciclos registrados
        </h2>

        {
          ciclos.length === 0 ? (

            <p className="text-gray-500">
              No hay ciclos registrados
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
                      Inicio
                    </th>

                    <th className="text-left p-3">
                      Fin
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
                    ciclos.map((ciclo) => (

                      <tr
                        key={ciclo.id}
                        className="border-b"
                      >

                        <td className="p-3 font-medium">
                          {ciclo.nombre}
                        </td>

                        <td className="p-3">
                          {
                            ciclo.fechaInicio
                              ? new Date(
                                  ciclo.fechaInicio
                                ).toLocaleDateString()
                              : "-"
                          }
                        </td>

                        <td className="p-3">
                          {
                            ciclo.fechaFin
                              ? new Date(
                                  ciclo.fechaFin
                                ).toLocaleDateString()
                              : "-"
                          }
                        </td>

                        <td className="p-3">

                          {
                            ciclo.activo ? (

                              <span className="bg-green-100 text-green-700 px-3 py-1 rounded-full text-sm">
                                ACTIVO
                              </span>

                            ) : (

                              <span className="bg-gray-100 text-gray-700 px-3 py-1 rounded-full text-sm">
                                INACTIVO
                              </span>

                            )
                          }

                        </td>

                        <td className="p-3">

                          {
                            !ciclo.activo && (

                              <button
                                onClick={() =>
                                  activarCiclo(
                                    ciclo.id
                                  )
                                }
                                className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-xl"
                              >
                                Activar
                              </button>

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