"use client";

import { useEffect, useState } from "react";

export default function AlumnoDashboardPage() {
  const [materias, setMaterias] = useState<any[]>([]);
  const [promedio, setPromedio] = useState(0);
  const [pagosPendientes, setPagosPendientes] = useState(0);

  useEffect(() => {
    const fetchData = async () => {
      const token = localStorage.getItem("token");
      const user = JSON.parse(localStorage.getItem("user") || "{}");

      try {
        // 🔥 CALIFICACIONES
        const res = await fetch(
          `http://localhost:4000/api/calificaciones/alumno/${user.id}`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        const result = await res.json();

        if (!Array.isArray(result)) return;

        // 🔥 AGRUPAR POR MATERIA
        const agrupado: any = {};

        result.forEach((item: any) => {
          const materia = item.materia.nombre;

          if (!agrupado[materia]) {
            agrupado[materia] = {
              materia,
              calificaciones: [],
            };
          }

          agrupado[materia].calificaciones.push(item.calificacion);
        });

        const lista = Object.values(agrupado).map((m: any) => {
          const promedio =
            m.calificaciones.reduce((a: number, b: number) => a + b, 0) /
            m.calificaciones.length;

          return {
            materia: m.materia,
            promedio: promedio.toFixed(1),
          };
        });

        setMaterias(lista);

        // 🔥 PROMEDIO GENERAL
        const promedioGeneral =
          lista.reduce((a, b) => a + Number(b.promedio), 0) /
          (lista.length || 1);

        setPromedio(Number(promedioGeneral.toFixed(1)));

        // 🔥 PAGOS
        const pagosRes = await fetch(
          `http://localhost:4000/api/pagos/${user.id}`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        const pagos = await pagosRes.json();

        if (Array.isArray(pagos)) {
          setPagosPendientes(pagos.length);
        }

      } catch (error) {
        console.error(error);
      }
    };

    fetchData();
  }, []);

  return (
    <div className="space-y-6">

      <h1 className="text-3xl font-bold">Bienvenido, Alumno</h1>

      {/* 🔥 RESUMEN */}
      <div className="grid md:grid-cols-4 gap-4">

        <div className="bg-white p-4 rounded-xl shadow">
          <p className="text-sm text-gray-500">Promedio general</p>
          <h2 className="text-2xl font-bold">{promedio}</h2>
        </div>

        <div className="bg-white p-4 rounded-xl shadow">
          <p className="text-sm text-gray-500">Materias inscritas</p>
          <h2 className="text-2xl font-bold">{materias.length}</h2>
        </div>

        <div className="bg-white p-4 rounded-xl shadow">
          <p className="text-sm text-gray-500">Asistencia</p>
          <h2 className="text-2xl font-bold">--%</h2>
        </div>

        <div className="bg-white p-4 rounded-xl shadow">
          <p className="text-sm text-gray-500">Pagos pendientes</p>
          <h2 className="text-2xl font-bold">{pagosPendientes}</h2>
        </div>

      </div>

      {/* 🔥 MATERIAS */}
      <div className="bg-white p-6 rounded-xl shadow">
        <h2 className="text-lg font-semibold mb-4">Mis materias</h2>

        <table className="w-full text-left">
          <thead>
            <tr className="text-gray-500 border-b">
              <th>Materia</th>
              <th>Promedio</th>
            </tr>
          </thead>

          <tbody>
            {materias.map((m, i) => (
              <tr key={i} className="border-b">
                <td>{m.materia}</td>
                <td className="font-semibold">{m.promedio}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

    </div>
  );
}