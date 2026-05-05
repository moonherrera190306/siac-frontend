"use client";

import { useEffect, useState } from "react";

export default function AlumnoMateriasPage() {
  const [materias, setMaterias] = useState<any[]>([]);

  useEffect(() => {
    const fetchData = async () => {
      const token = localStorage.getItem("token");
      const user = JSON.parse(localStorage.getItem("user") || "{}");

      const res = await fetch(
        `http://localhost:4000/api/alumnos/materias/${user.id}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const data = await res.json();

      if (Array.isArray(data)) {
        setMaterias(data);
      }
    };

    fetchData();
  }, []);

  const promedioGeneral =
    materias.reduce((a, b) => a + Number(b.promedio), 0) /
    (materias.length || 1);

  return (
    <div className="space-y-6">

      <h1 className="text-3xl font-bold">Mis materias</h1>

      {/* RESUMEN */}
      <div className="grid md:grid-cols-3 gap-4">
        <div className="bg-white p-4 rounded-xl shadow">
          <p className="text-sm text-gray-500">Materias inscritas</p>
          <h2 className="text-2xl font-bold">{materias.length}</h2>
        </div>

        <div className="bg-white p-4 rounded-xl shadow">
          <p className="text-sm text-gray-500">Promedio general</p>
          <h2 className="text-2xl font-bold">
            {promedioGeneral.toFixed(1)}
          </h2>
        </div>

        <div className="bg-white p-4 rounded-xl shadow">
          <p className="text-sm text-gray-500">Docentes</p>
          <h2 className="text-2xl font-bold">{materias.length}</h2>
        </div>
      </div>

      {/* TABLA */}
      <div className="bg-white p-6 rounded-xl shadow">
        <table className="w-full">
          <thead>
            <tr className="text-gray-500 border-b">
              <th>Materia</th>
              <th>Docente</th>
              <th>Horario</th>
              <th>Aula</th>
              <th>Promedio</th>
            </tr>
          </thead>

          <tbody>
            {materias.map((m, i) => (
              <tr key={i} className="border-b">
                <td>{m.materia}</td>
                <td>{m.docente}</td>
                <td>{m.horario}</td>
                <td>{m.aula}</td>
                <td className="font-semibold">{m.promedio}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

    </div>
  );
}