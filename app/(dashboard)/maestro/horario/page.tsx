"use client";

import { useEffect, useState } from "react";

export default function MaestroHorarioPage() {
  const [horario, setHorario] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const token =
    typeof window !== "undefined"
      ? localStorage.getItem("token")
      : null;

  const diasSemana = ["Lunes", "Martes", "Miércoles", "Jueves", "Viernes"];

  useEffect(() => {
    if (!token) {
      window.location.href = "/login";
      return;
    }

    const fetchHorario = async () => {
      try {
        // 🔥 GRUPOS DEL MAESTRO
        const res = await fetch(
          "https://siac-backend-production.up.railway.app/api/docentes/grupos", 
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        const grupos = await res.json();

        let clases: any[] = [];

        // 🔥 OBTENER MATERIAS DE CADA GRUPO
        for (const g of grupos) {
          const resGrupo = await fetch(
            `https://siac-backend-production.up.railway.app/api/grupos/${g.id}`,
            {
              headers: {
                Authorization: `Bearer ${token}`,
              },
            }
          );

          const grupoCompleto = await resGrupo.json();

          grupoCompleto.materias.forEach((m: any, index: number) => {
            clases.push({
              dia: diasSemana[index % diasSemana.length],
              hora: `${7 + index}:00 - ${8 + index}:00`,
              materia: m.nombre,
              grupo: grupoCompleto.nombre,
              aula: "Aula " + (index + 1),
            });
          });
        }

        // 🔥 AGRUPAR POR DÍA
        const agrupado = diasSemana.map((dia) => ({
          dia,
          clases: clases.filter((c) => c.dia === dia),
        }));

        setHorario(agrupado);

      } catch (error) {
        console.error(error);
        alert("Error cargando horario");
      } finally {
        setLoading(false);
      }
    };

    fetchHorario();
  }, []);

  if (loading) return <p className="p-6">Cargando...</p>;

  return (
    <div className="space-y-6">

      {/* HEADER */}
      <section className="rounded-2xl bg-white border p-6 shadow-sm">
        <h1 className="text-3xl font-bold">
          Mi horario
        </h1>
        <p className="text-gray-500">
          Clases programadas durante la semana
        </p>
      </section>

      {/* HORARIO */}
      <section className="space-y-5">
        {horario.map((dia) => (
          <div
            key={dia.dia}
            className="rounded-2xl border bg-white p-6 shadow-sm"
          >
            <h2 className="text-xl font-semibold">
              {dia.dia}
            </h2>

            {dia.clases.length === 0 && (
              <p className="text-gray-400 mt-2">
                Sin clases
              </p>
            )}

            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4 mt-4">
              {dia.clases.map((clase: any, index: number) => (
                <div
                  key={index}
                  className="rounded-xl border bg-gray-50 p-4"
                >
                  <p className="text-sm text-gray-500">
                    {clase.hora}
                  </p>

                  <h3 className="font-semibold">
                    {clase.materia}
                  </h3>

                  <p className="text-sm text-gray-600">
                    Grupo: {clase.grupo}
                  </p>

                  <p className="text-sm text-gray-600">
                    Aula: {clase.aula}
                  </p>
                </div>
              ))}
            </div>
          </div>
        ))}
      </section>
    </div>
  );
}