"use client";

import { useEffect, useState } from "react";

export default function MaestroDashboardPage() {
  const [resumen, setResumen] = useState<any[]>([]);
  const [clasesHoy, setClasesHoy] = useState<any[]>([]);
  const [pendientes, setPendientes] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);

  const token =
    typeof window !== "undefined"
      ? localStorage.getItem("token")
      : null;

  useEffect(() => {
    if (!token) {
      window.location.href = "/login";
      return;
    }

    const fetchData = async () => {
      try {
        // 🔥 GRUPOS DEL MAESTRO
        const resGrupos = await fetch(
          "https://siac-backend-production.up.railway.app/api/docentes/grupos",
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        const grupos = await resGrupos.json();

        // 🔥 MATERIAS
        const resMaterias = await fetch(
          "https://siac-backend-production.up.railway.app/api/materias",
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        const materias = await resMaterias.json();

        // 🔥 CONTAR ALUMNOS
        let totalAlumnos = 0;

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
          totalAlumnos += grupoCompleto.alumnos.length;
        }

        // 🔥 RESUMEN REAL
        setResumen([
          {
            title: "Grupos asignados",
            value: grupos.length,
            description: "Grupos bajo tu responsabilidad",
          },
          {
            title: "Materias",
            value: materias.length,
            description: "Materias que impartes",
          },
          {
            title: "Alumnos",
            value: totalAlumnos,
            description: "Total de alumnos",
          },
          {
            title: "Clases hoy",
            value: grupos.length, // simplificado
            description: "Clases programadas",
          },
        ]);

        // 🔥 CLASES HOY (FAKE MEJORADO)
        const clases = materias.slice(0, 3).map((m: any, i: number) => ({
          hora: `${7 + i}:00 - ${8 + i}:00`,
          materia: m.nombre,
          grupo: m.grupo?.nombre || "N/A",
          aula: "Aula " + (i + 1),
        }));

        setClasesHoy(clases);

        // 🔥 PENDIENTES INTELIGENTES
        setPendientes([
          "Capturar calificaciones",
          "Registrar asistencia",
          "Revisar actividades",
        ]);

      } catch (error) {
        console.error(error);
        alert("Error cargando dashboard");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  if (loading) return <p className="p-6">Cargando...</p>;

  return (
    <div className="space-y-6">

      {/* HEADER */}
      <section className="rounded-2xl border bg-white p-6 shadow-sm">
        <h1 className="text-3xl font-bold">
          Panel del maestro
        </h1>
        <p className="text-gray-500">
          Información académica en tiempo real
        </p>
      </section>

      {/* RESUMEN */}
      <section className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
        {resumen.map((item) => (
          <div key={item.title} className="rounded-2xl border bg-white p-5 shadow-sm">
            <p className="text-sm text-gray-500">{item.title}</p>
            <h2 className="text-3xl font-bold">{item.value}</h2>
            <p className="text-sm text-gray-500">{item.description}</p>
          </div>
        ))}
      </section>

      {/* CONTENIDO */}
      <section className="grid grid-cols-1 gap-6 xl:grid-cols-2">

        {/* CLASES */}
        <div className="rounded-2xl border bg-white p-6 shadow-sm">
          <h2 className="text-xl font-semibold">Clases de hoy</h2>

          <div className="space-y-4 mt-4">
            {clasesHoy.map((clase, index) => (
              <div key={index} className="bg-gray-50 p-4 rounded-xl">
                <p className="text-sm text-gray-500">{clase.hora}</p>
                <h3 className="font-semibold">{clase.materia}</h3>
                <p>Grupo: {clase.grupo}</p>
                <p>Aula: {clase.aula}</p>
              </div>
            ))}
          </div>
        </div>

        {/* PENDIENTES */}
        <div className="rounded-2xl border bg-white p-6 shadow-sm">
          <h2 className="text-xl font-semibold">Pendientes</h2>

          <div className="space-y-3 mt-4">
            {pendientes.map((item, index) => (
              <div key={index} className="bg-gray-50 p-4 rounded-xl">
                {item}
              </div>
            ))}
          </div>
        </div>

      </section>
    </div>
  );
}