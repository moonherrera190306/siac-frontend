"use client";

import { useEffect, useState } from "react";

export default function DirectorAsistenciasPage() {
  const [resumen, setResumen] = useState<any[]>([]);
  const [registros, setRegistros] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const token = localStorage.getItem("token");

        const res = await fetch(
          "http://localhost:4000/api/director/asistencias",
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        if (!res.ok) {
          throw new Error("Error en backend");
        }

        const data = await res.json();

        // 🔥 ADAPTAMOS A TU UI
        setResumen([
          {
            title: "Asistencia global",
            value: data.resumen.asistenciaGlobal,
            description: "Promedio general institucional",
          },
          {
            title: "Grupos con alerta",
            value: data.resumen.gruposAlerta,
            description: "Grupos con baja asistencia",
          },
          {
            title: "Faltas acumuladas",
            value: data.resumen.faltasTotales,
            description: "Faltas registradas en el periodo",
          },
        ]);

        setRegistros(data.registros);

      } catch (error) {
        console.error(error);
        alert("Error cargando asistencias");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  if (loading) {
    return <p className="p-6">Cargando asistencias...</p>;
  }

  return (
    <div className="space-y-6">

      {/* HEADER */}
      <section className="bg-white p-6 rounded-2xl shadow">
        <h1 className="text-3xl font-bold">Asistencias</h1>
        <p className="text-gray-500">
          Seguimiento institucional de asistencia por grupo
        </p>
      </section>

      {/* RESUMEN */}
      <section className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {resumen.map((item) => (
          <div key={item.title} className="bg-white p-5 rounded-xl shadow">
            <p className="text-sm text-gray-500">{item.title}</p>
            <h2 className="text-3xl font-bold">{item.value}</h2>
            <p className="text-sm text-gray-500">{item.description}</p>
          </div>
        ))}
      </section>

      {/* TABLA */}
      <section className="bg-white p-6 rounded-2xl shadow">

        <table className="w-full text-left">

          <thead>
            <tr className="border-b text-gray-500">
              <th>Grupo</th>
              <th>Asistencia</th>
              <th>Faltas</th>
              <th>Estatus</th>
            </tr>
          </thead>

          <tbody>
            {registros.map((item, index) => (
              <tr key={index} className="border-b">

                <td className="font-medium">{item.grupo}</td>

                <td>
                  <span className="bg-slate-100 px-3 py-1 rounded-full text-sm">
                    {item.asistencia}
                  </span>
                </td>

                <td>{item.faltas}</td>

                <td>
                  <span
                    className={`px-3 py-1 rounded-full text-sm ${
                      item.estatus === "Excelente"
                        ? "bg-green-100 text-green-700"
                        : item.estatus === "Estable"
                        ? "bg-blue-100 text-blue-700"
                        : "bg-red-100 text-red-700"
                    }`}
                  >
                    {item.estatus}
                  </span>
                </td>

              </tr>
            ))}
          </tbody>

        </table>

      </section>

    </div>
  );
}