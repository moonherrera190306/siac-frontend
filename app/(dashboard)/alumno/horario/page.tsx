"use client";

import { useEffect, useState } from "react";

export default function AlumnoHorarioPage() {
  const [horario, setHorario] = useState<any[]>([]);

  useEffect(() => {
    const fetchHorario = async () => {
      const token = localStorage.getItem("token");
      const user = JSON.parse(localStorage.getItem("user") || "{}");

      try {
        const res = await fetch(
          `http://localhost:4000/api/alumnos/horario/${user.id}`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        const data = await res.json();

        if (Array.isArray(data)) {
          setHorario(data);
        }

      } catch (error) {
        console.error(error);
      }
    };

    fetchHorario();
  }, []);

  const totalClases = horario.reduce(
    (acc, dia) => acc + dia.clases.length,
    0
  );

  return (
    <div className="space-y-6">

      <h1 className="text-3xl font-bold">Horario</h1>

      {/* RESUMEN */}
      <div className="grid md:grid-cols-3 gap-4">
        <div className="bg-white p-4 rounded-xl shadow">
          <p className="text-sm text-gray-500">Días activos</p>
          <h2 className="text-2xl font-bold">{horario.length}</h2>
        </div>

        <div className="bg-white p-4 rounded-xl shadow">
          <p className="text-sm text-gray-500">Clases por semana</p>
          <h2 className="text-2xl font-bold">{totalClases}</h2>
        </div>

        <div className="bg-white p-4 rounded-xl shadow">
          <p className="text-sm text-gray-500">Primera clase</p>
          <h2 className="text-2xl font-bold">
            {horario[0]?.clases[0]?.hora?.split("-")[0] || "--"}
          </h2>
        </div>
      </div>

      {/* HORARIO */}
      <section className="space-y-5">
        {horario.map((dia) => (
          <div key={dia.dia} className="bg-white p-6 rounded-xl shadow">
            <h2 className="text-xl font-semibold">{dia.dia}</h2>

            <div className="grid md:grid-cols-3 gap-4 mt-4">
              {dia.clases.map((clase, i) => (
                <div key={i} className="bg-gray-50 p-4 rounded-xl border">
                  <p className="text-sm text-gray-500">{clase.hora}</p>
                  <h3 className="font-semibold">{clase.materia}</h3>
                  <p className="text-sm">Docente: {clase.docente}</p>
                  <p className="text-sm">Aula: {clase.aula}</p>
                </div>
              ))}
            </div>
          </div>
        ))}
      </section>

    </div>
  );
}