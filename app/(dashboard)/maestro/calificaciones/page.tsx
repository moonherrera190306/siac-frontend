"use client";

import { useEffect, useState } from "react";

const TIPOS = ["PARCIAL1", "PARCIAL2", "FINAL"];

const API_URL = "http://localhost:4000";

export default function Page() {
  const [grupos, setGrupos] = useState<any[]>([]);
  const [grupoId, setGrupoId] = useState("");
  const [grupo, setGrupo] = useState<any>(null);
  const [data, setData] = useState<any>({});
  const [loading, setLoading] = useState(false);

  const token =
    typeof window !== "undefined"
      ? localStorage.getItem("token")
      : null;

  /* =========================================
     🔐 VALIDAR SESIÓN
  ========================================= */
  useEffect(() => {
    if (!token) {
      alert("No estás autenticado");
      window.location.href = "/login";
    }
  }, []);

  /* =========================================
     👥 TRAER GRUPOS DEL MAESTRO
  ========================================= */
  useEffect(() => {
    if (!token) return;

    fetch(`${API_URL}/api/docentes/grupos`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })
      .then(async (res) => {
        if (!res.ok) {
          throw new Error("Error cargando grupos");
        }

        return res.json();
      })
      .then((response) => {
        setGrupos(response.data || []);
      })
      .catch((err) => {
        console.error(err);
        alert("Error cargando grupos");
      });
  }, [token]);

  /* =========================================
     📚 TRAER GRUPO COMPLETO
  ========================================= */
  useEffect(() => {
    if (!grupoId || !token) return;

    setLoading(true);

    fetch(`${API_URL}/api/grupos/${grupoId}`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })
      .then(async (res) => {
        if (!res.ok) {
          throw new Error("Error cargando grupo");
        }

        return res.json();
      })
      .then((response) => {
        setGrupo(response.data || response);
      })
      .catch((err) => {
        console.error(err);
        alert("Error cargando grupo");
      })
      .finally(() => {
        setLoading(false);
      });
  }, [grupoId, token]);

  /* =========================================
     📝 TRAER CALIFICACIONES
  ========================================= */
  useEffect(() => {
    if (!grupo || !token) return;

    const fetchCalificaciones = async () => {
      try {
        let newData: any = {};

        for (const m of grupo.materias || []) {
          const res = await fetch(
            `${API_URL}/api/calificaciones/materia/${m.id}`,
            {
              headers: {
                Authorization: `Bearer ${token}`,
              },
            }
          );

          if (!res.ok) continue;

          const response = await res.json();

          const califs = response.data || [];

          califs.forEach((c: any) => {
            const key = `${c.alumnoId}-${c.materiaId}-${c.tipo}`;

            newData[key] = c.calificacion;
          });
        }

        setData(newData);
      } catch (error) {
        console.error(error);
      }
    };

    fetchCalificaciones();
  }, [grupo, token]);

  /* =========================================
     ✏️ HANDLE INPUT
  ========================================= */
  const handleChange = (
    alumnoId: string,
    materiaId: string,
    tipo: string,
    value: string
  ) => {
    const numero = Number(value);

    // 🚨 evitar negativos
    if (numero < 0) return;

    // 🚨 evitar >100
    if (numero > 100) return;

    const key = `${alumnoId}-${materiaId}-${tipo}`;

    setData((prev: any) => ({
      ...prev,
      [key]: value,
    }));
  };

  /* =========================================
     💾 GUARDAR
  ========================================= */
  const guardar = async () => {
    try {
      setLoading(true);

      const payload = Object.entries(data).map(
        ([key, value]) => {
          const [alumnoId, materiaId, tipo] =
            key.split("-");

          return {
            alumnoId,
            materiaId,
            tipo,
            calificacion: Number(value),
          };
        }
      );

      console.log("PAYLOAD:", payload);

      const res = await fetch(
        `${API_URL}/api/calificaciones`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(payload),
        }
      );

      const response = await res.json();

      console.log("RESPONSE:", response);

      if (!res.ok) {
        throw new Error(
          response.message || "Error al guardar"
        );
      }

      alert("✅ Calificaciones guardadas");
    } catch (error: any) {
      console.error(error);

      alert(
        error.message || "Error guardando"
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">
        Captura de Calificaciones
      </h1>

      {/* SELECT */}
      <select
        value={grupoId}
        onChange={(e) =>
          setGrupoId(e.target.value)
        }
        className="border p-2 mb-6"
      >
        <option value="">
          Selecciona un grupo
        </option>

        {(grupos ?? []).map((g) => (
          <option key={g.id} value={g.id}>
            {g.nombre}
          </option>
        ))}
      </select>

      {/* LOADING */}
      {loading && (
        <p className="mb-4">
          Cargando...
        </p>
      )}

      {/* TABLAS */}
      {grupo && !loading && (
        <div>
          {(grupo.materias ?? []).map((m: any) => (
            <div key={m.id} className="mb-8">
              <h2 className="font-bold mb-2">
                {m.nombre}
              </h2>

              <table className="border w-full">
                <thead>
                  <tr>
                    <th className="border p-2">
                      Alumno
                    </th>

                    {TIPOS.map((t) => (
                      <th
                        key={t}
                        className="border p-2"
                      >
                        {t}
                      </th>
                    ))}
                  </tr>
                </thead>

                <tbody>
                  {(grupo.alumnos ?? []).map(
                    (a: any) => (
                      <tr key={a.id}>
                        <td className="border p-2">
                          {a.user?.name}
                        </td>

                        {TIPOS.map((tipo) => (
                          <td
                            key={tipo}
                            className="border p-2"
                          >
                            <input
                              type="number"
                              min={0}
                              max={100}
                              className="w-20 border p-1"
                              value={
                                data[
                                  `${a.id}-${m.id}-${tipo}`
                                ] || ""
                              }
                              onChange={(e) =>
                                handleChange(
                                  a.id,
                                  m.id,
                                  tipo,
                                  e.target.value
                                )
                              }
                            />
                          </td>
                        ))}
                      </tr>
                    )
                  )}
                </tbody>
              </table>
            </div>
          ))}

          <button
            onClick={guardar}
            disabled={loading}
            className="bg-blue-500 text-white px-4 py-2 rounded"
          >
            {loading
              ? "Guardando..."
              : "Guardar"}
          </button>
        </div>
      )}
    </div>
  );
}