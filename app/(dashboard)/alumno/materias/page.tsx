"use client";

import { useEffect, useState } from "react";

export default function AlumnoMateriasPage() {
  const [materias, setMaterias] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchMaterias = async () => {
      try {
        const token = localStorage.getItem("token");

        const user = JSON.parse(
          localStorage.getItem("user") || "{}"
        );

        const alumnoId =
          user?.alumnoId || user?.id;

        const res = await fetch(
          `http://localhost:4000/api/alumnos/materias/${alumnoId}`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        const data = await res.json();

        if (!res.ok) {
          throw new Error(
            data.message || "Error al obtener materias"
          );
        }

        setMaterias(data.data || []);
      } catch (err: any) {
        console.error(err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchMaterias();
  }, []);

  if (loading) {
    return (
      <p className="text-white">
        Cargando materias...
      </p>
    );
  }

  if (error) {
    return (
      <div className="bg-red-100 text-red-600 p-4 rounded-xl">
        {error}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">
        Mis Materias
      </h1>

      {materias.length === 0 ? (
        <div className="bg-white rounded-2xl p-6 shadow">
          <p>No tienes materias asignadas.</p>
        </div>
      ) : (
        <div className="grid md:grid-cols-2 gap-6">
          {materias.map((materia) => (
            <div
              key={materia.id}
              className="bg-white rounded-2xl p-6 shadow"
            >
              <h2 className="text-xl font-semibold">
                {materia.nombre}
              </h2>

              <p className="text-gray-500 mt-2">
                Clave: {materia.clave}
              </p>

              <p className="text-gray-500">
                Créditos: {materia.creditos}
              </p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}