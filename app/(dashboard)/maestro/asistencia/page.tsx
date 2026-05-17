"use client";

import { useEffect, useState } from "react";

const ESTADOS = [
  "ASISTENCIA",
  "FALTA",
  "RETARDO",
];

export default function Page() {
  const [grupos, setGrupos] = useState<any[]>([]);
  const [grupoId, setGrupoId] = useState("");
  const [grupo, setGrupo] = useState<any>(null);
  const [asistencia, setAsistencia] = useState<any>({});
  const [loading, setLoading] = useState(false);

  const token =
    typeof window !== "undefined"
      ? localStorage.getItem("token")
      : null;

  // 🔐 VALIDAR LOGIN
  useEffect(() => {
    if (!token) {
      window.location.href = "/login";
    }
  }, []);

  // 🔥 TRAER GRUPOS
  useEffect(() => {
    if (!token) return;

    fetch(
      "http://localhost:4000/api/docentes/grupos",
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    )
      .then((res) => res.json())
      .then((response) => {
        setGrupos(response.data || []);
      })
      .catch((error) => {
        console.error(error);
      });
  }, []);

  // 🔥 TRAER GRUPO
  useEffect(() => {
    if (!grupoId) return;

    setLoading(true);

    fetch(
      `http://localhost:4000/api/grupos/${grupoId}`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    )
      .then((res) => res.json())
      .then((response) => {
        setGrupo(
          response.data || response
        );
      })
      .finally(() => setLoading(false));
  }, [grupoId]);

  // 🔥 CAMBIAR ESTADO
  const handleChange = (
    alumnoId: string,
    value: string
  ) => {
    setAsistencia((prev: any) => ({
      ...prev,
      [alumnoId]: value,
    }));
  };

  // 🔥 COLORES
  const getColor = (estado: string) => {
    if (estado === "ASISTENCIA") {
      return "bg-green-200 text-green-800";
    }

    if (estado === "FALTA") {
      return "bg-red-200 text-red-800";
    }

    if (estado === "RETARDO") {
      return "bg-yellow-200 text-yellow-800";
    }

    return "";
  };

  // 🔥 GUARDAR
  const guardar = () => {
    console.log(asistencia);

    alert(
      "Asistencia guardada 🔥"
    );
  };

  return (
    <div className="p-6 space-y-6">

      {/* HEADER */}
      <div className="bg-white p-4 rounded shadow flex justify-between">

        <div>
          <h1 className="text-xl font-bold">
            Asistencia
          </h1>

          <p className="text-sm text-gray-500">
            Registra y consulta asistencia
          </p>
        </div>

        <button
          onClick={guardar}
          className="bg-blue-600 text-white px-4 py-2 rounded"
        >
          Guardar asistencia
        </button>

      </div>

      {/* CARDS */}
      <div className="grid grid-cols-3 gap-4">

        <div className="bg-white p-4 rounded shadow">
          <p className="text-gray-500">
            Grupos
          </p>

          <h2 className="text-2xl font-bold">
            {grupos.length}
          </h2>
        </div>

        <div className="bg-white p-4 rounded shadow">
          <p className="text-gray-500">
            Alumnos
          </p>

          <h2 className="text-2xl font-bold">
            {grupo?.alumnos?.length || 0}
          </h2>
        </div>

        <div className="bg-white p-4 rounded shadow">
          <p className="text-gray-500">
            Capturados
          </p>

          <h2 className="text-2xl font-bold">
            {
              Object.keys(asistencia)
                .length
            }
          </h2>
        </div>

      </div>

      {/* SELECT */}
      <select
        onChange={(e) =>
          setGrupoId(e.target.value)
        }
        className="border p-2"
      >
        <option value="">
          Selecciona grupo
        </option>

        {(grupos ?? []).map((g) => (
          <option
            key={g.id}
            value={g.id}
          >
            {g.nombre}
          </option>
        ))}
      </select>

      {/* TABLA */}
      {grupo && (
        <div className="bg-white p-4 rounded shadow overflow-auto">

          <table className="w-full">

            <thead>
              <tr className="text-left border-b">
                <th>Alumno</th>
                <th>Grupo</th>
                <th>Estado</th>
                <th>Acción</th>
              </tr>
            </thead>

            <tbody>

              {(grupo.alumnos ?? []).map(
                (a: any) => {
                  const estado =
                    asistencia[a.id];

                  return (
                    <tr
                      key={a.id}
                      className="border-b"
                    >
                      <td>
                        {a.user?.name}
                      </td>

                      <td>
                        {grupo.nombre}
                      </td>

                      <td>
                        {estado && (
                          <span
                            className={`px-2 py-1 rounded ${getColor(
                              estado
                            )}`}
                          >
                            {estado}
                          </span>
                        )}
                      </td>

                      <td>
                        <select
                          onChange={(e) =>
                            handleChange(
                              a.id,
                              e.target.value
                            )
                          }
                          className="border p-1"
                        >
                          <option value="">
                            Seleccionar
                          </option>

                          {ESTADOS.map(
                            (e) => (
                              <option
                                key={e}
                                value={e}
                              >
                                {e}
                              </option>
                            )
                          )}
                        </select>
                      </td>
                    </tr>
                  );
                }
              )}

            </tbody>

          </table>

        </div>
      )}

      {loading && (
        <p>Cargando grupo...</p>
      )}

    </div>
  );
}