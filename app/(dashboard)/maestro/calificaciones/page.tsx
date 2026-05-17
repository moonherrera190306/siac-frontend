"use client";

import { useEffect, useState } from "react";

const TIPOS = ["PARCIAL1", "PARCIAL2", "FINAL"];

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

  // 🔐 Validar sesión
  useEffect(() => {
    if (!token) {
      alert("No estás autenticado");
      window.location.href = "/login";
    }
  }, []);

  // 🔥 TRAER GRUPOS DEL MAESTRO
  useEffect(() => {
    if (!token) return;

    fetch("https://siac-backend-production.up.railway.app/api/docentes/grupos", {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })
      .then((res) => {
        if (!res.ok) throw new Error("Error cargando grupos");
        return res.json();
      })
      .then(setGrupos)
      .catch((err) => {
        console.error(err);
        alert("Error cargando grupos");
      });
  }, [token]);

  // 🔥 TRAER GRUPO COMPLETO
  useEffect(() => {
    if (!grupoId) return;

    setLoading(true);

    fetch(`https://siac-backend-production.up.railway.app/api/grupos/${grupoId}`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })
      .then((res) => {
        if (!res.ok) throw new Error("Error cargando grupo");
        return res.json();
      })
      .then((data) => {
        setGrupo(data);
      })
      .catch((err) => {
        console.error(err);
        alert("Error cargando grupo");
      })
      .finally(() => setLoading(false));
  }, [grupoId]);

  // 🔥 TRAER CALIFICACIONES GUARDADAS
  useEffect(() => {
    if (!grupo) return;

    const fetchCalificaciones = async () => {
      let newData: any = {};

      for (const m of grupo.materias) {
        const res = await fetch(
          `https://siac-backend-production.up.railway.app/api/calificaciones/materia/${m.id}`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        const califs = await res.json();

        califs.forEach((c: any) => {
          const key = `${c.alumnoId}-${c.materiaId}-${c.tipo}`;
          newData[key] = c.calificacion;
        });
      }

      setData(newData);
    };

    fetchCalificaciones();
  }, [grupo]);

  // 🔥 MANEJO DE INPUTS
  const handleChange = (
    alumnoId: string,
    materiaId: string,
    tipo: string,
    value: string
  ) => {
    const key = `${alumnoId}-${materiaId}-${tipo}`;

    setData((prev: any) => ({
      ...prev,
      [key]: value,
    }));
  };

  // 🔥 GUARDAR
  const guardar = async () => {
    try {
      setLoading(true);

      const payload = Object.entries(data).map(([key, value]) => {
        const [alumnoId, materiaId, tipo] = key.split("-");

        return {
          alumnoId,
          materiaId,
          tipo,
          calificacion: Number(value),
        };
      });

      const res = await fetch(
        "https://siac-backend-production.up.railway.app/api/calificaciones",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(payload),
        }
      );

      if (!res.ok) throw new Error("Error al guardar");

      alert("Calificaciones guardadas 🔥");

    } catch (error) {
      console.error(error);
      alert("Error al guardar");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">
        Captura de Calificaciones
      </h1>

      {/* SELECT GRUPOS */}
      <select
        onChange={(e) => setGrupoId(e.target.value)}
        className="border p-2 mb-6"
      >
        <option value="">Selecciona un grupo</option>

        {grupos.map((g) => (
          <option key={g.id} value={g.id}>
            {g.nombre}
          </option>
        ))}
      </select>

      {/* LOADING */}
      {loading && <p>Cargando...</p>}

      {/* TABLAS */}
      {grupo && !loading && (
        <div>
          {grupo.materias?.map((m: any) => (
            <div key={m.id} className="mb-8">
              <h2 className="font-bold mb-2">{m.nombre}</h2>

              <table className="border w-full">
                <thead>
                  <tr>
                    <th className="border p-2">Alumno</th>
                    {TIPOS.map((t) => (
                      <th key={t} className="border p-2">
                        {t}
                      </th>
                    ))}
                  </tr>
                </thead>

                <tbody>
                  {grupo.alumnos?.map((a: any) => (
                    <tr key={a.id}>
                      <td className="border p-2">
                        {a.user?.name}
                      </td>

                      {TIPOS.map((tipo) => (
                        <td key={tipo} className="border p-2">
                          <input
                            type="number"
                            className="w-16 border p-1"
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
                  ))}
                </tbody>
              </table>
            </div>
          ))}

          <button
            onClick={guardar}
            className="bg-blue-500 text-white px-4 py-2"
          >
            {loading ? "Guardando..." : "Guardar"}
          </button>
        </div>
      )}
    </div>
  );
}