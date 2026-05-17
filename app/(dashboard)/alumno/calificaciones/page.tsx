"use client";

import { useEffect, useState } from "react";

export default function AlumnoCalificacionesPage() {
  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      const token = localStorage.getItem("token");
      const user = JSON.parse(localStorage.getItem("user") || "{}");

      try {
        const res = await fetch(
          `http://localhost:4000/api/calificaciones/alumno/${user.id}`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        const result = await res.json();

console.log("RESULT BACKEND:", result);

// 🔥 VALIDACIÓN
if (!Array.isArray(result)) {
  console.error("Backend no regresó array:", result);
  setData([]);
  return;
}

        // 🔥 TRANSFORMACIÓN
        const agrupado: any = {};

        result.forEach((item: any) => {
          const materia = item.materia.nombre;

          if (!agrupado[materia]) {
            agrupado[materia] = {
              materia,
              P1: null,
              P2: null,
              P3: null,
              FINAL: null,
            };
          }

          agrupado[materia][item.tipo] = item.calificacion;
        });

        // 🔥 CALCULAR FINAL Y ESTADO
        const finalData = Object.values(agrupado).map((m: any) => {
          const valores = [m.P1, m.P2, m.P3].filter(v => v !== null);

          const promedio =
            valores.length > 0
              ? valores.reduce((a, b) => a + b, 0) / valores.length
              : 0;

          return {
            ...m,
            FINAL: promedio.toFixed(1),
            estado: promedio >= 6 ? "Aprobado" : "Reprobado",
          };
        });

        setData(finalData);

      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  if (loading) return <p className="p-6">Cargando...</p>;

  // 🔥 MÉTRICAS
  const materias = data.length;
  const aprobadas = data.filter((m) => m.estado === "Aprobado").length;
  const mejor = Math.max(...data.map((m) => Number(m.FINAL)));

  return (
    <div className="space-y-6">

      <h1 className="text-3xl font-bold">Calificaciones</h1>

      {/* RESUMEN */}
      <div className="grid md:grid-cols-3 gap-4">
        <div className="bg-white p-4 rounded-xl shadow">
          <p className="text-sm text-gray-500">Materias cursadas</p>
          <h2 className="text-2xl font-bold">{materias}</h2>
        </div>

        <div className="bg-white p-4 rounded-xl shadow">
          <p className="text-sm text-gray-500">Materias aprobadas</p>
          <h2 className="text-2xl font-bold">{aprobadas}</h2>
        </div>

        <div className="bg-white p-4 rounded-xl shadow">
          <p className="text-sm text-gray-500">Mejor calificación</p>
          <h2 className="text-2xl font-bold">{mejor}</h2>
        </div>
      </div>

      {/* TABLA */}
      <div className="bg-white p-6 rounded-2xl shadow">
        <h2 className="text-lg font-semibold mb-4">
          Detalle por materia
        </h2>

        <table className="w-full text-left">
          <thead>
            <tr className="text-gray-500 border-b">
              <th>Materia</th>
              <th>P1</th>
              <th>P2</th>
              <th>P3</th>
              <th>Final</th>
              <th>Estado</th>
            </tr>
          </thead>

          <tbody>
            {data.map((m, i) => (
              <tr key={i} className="border-b">
                <td>{m.materia}</td>
                <td>{m.P1 || "-"}</td>
                <td>{m.P2 || "-"}</td>
                <td>{m.P3 || "-"}</td>
                <td className="font-semibold">{m.FINAL}</td>
                <td>
                  <span
                    className={`px-3 py-1 rounded-full text-sm ${
                      m.estado === "Aprobado"
                        ? "bg-green-100 text-green-700"
                        : "bg-red-100 text-red-700"
                    }`}
                  >
                    {m.estado}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

    </div>
  );
}