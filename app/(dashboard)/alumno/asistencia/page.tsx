"use client";

import { useEffect, useMemo, useState } from "react";

export default function AlumnoAsistenciaPage() {

  const [asistencias, setAsistencias] =
    useState<any[]>([]);

  const [loading, setLoading] =
    useState(true);

  const [error, setError] =
    useState("");

  // ========================================
  // FETCH
  // ========================================

  useEffect(() => {

    const fetchAsistencias = async () => {

      try {

        const token =
          localStorage.getItem("token");

        const user = JSON.parse(
          localStorage.getItem("user") || "{}"
        );

        const alumnoId =
          user?.alumnoId || user?.id;

        const res = await fetch(
          `http://localhost:4000/api/asistencias/alumno/${alumnoId}`,
          {
            headers: {
              Authorization:
                `Bearer ${token}`,
            },
          }
        );

        const data = await res.json();

        if (!res.ok) {
          throw new Error(
            data.message ||
            "Error obteniendo asistencias"
          );
        }

        setAsistencias(
          data.data || []
        );

      } catch (err: any) {

        console.error(err);

        setError(err.message);

      } finally {

        setLoading(false);

      }
    };

    fetchAsistencias();

  }, []);

  // ========================================
  // ESTADÍSTICAS
  // ========================================

  const total =
    asistencias.length;

  const presentes =
    asistencias.filter(
      (a) => a.presente
    ).length;

  const faltas =
    asistencias.filter(
      (a) => !a.presente
    ).length;

  const porcentaje =
    total > 0
      ? Math.round(
          (presentes / total) * 100
        )
      : 0;

  // ========================================
  // AGRUPAR POR MES
  // ========================================

  const historial =
    useMemo(() => {

      const meses: any = {};

      asistencias.forEach((a) => {

        const fecha =
          new Date(a.fecha);

        const mes =
          fecha.toLocaleString(
            "es-MX",
            {
              month: "long",
              year: "numeric",
            }
          );

        if (!meses[mes]) {
          meses[mes] = [];
        }

        meses[mes].push(a);

      });

      return meses;

    }, [asistencias]);

  // ========================================
  // LOADING
  // ========================================

  if (loading) {
    return (
      <div className="p-6">
        Cargando asistencias...
      </div>
    );
  }

  // ========================================
  // ERROR
  // ========================================

  if (error) {
    return (
      <div className="bg-red-100 text-red-600 p-4 rounded-2xl">
        {error}
      </div>
    );
  }

  // ========================================
  // UI
  // ========================================

  return (
    <div className="space-y-6 p-6">

      {/* HEADER */}
      <section className="bg-white rounded-3xl shadow p-6">

        <h1 className="text-4xl font-bold">
          Asistencias 📚
        </h1>

        <p className="text-gray-500 mt-2">
          Consulta tus asistencias,
          faltas y progreso académico
        </p>

      </section>

      {/* STATS */}
      <div className="grid md:grid-cols-4 gap-6">

        <div className="bg-white rounded-3xl shadow p-6">

          <p className="text-gray-500">
            Clases registradas
          </p>

          <h2 className="text-4xl font-bold mt-3">

            {total}

          </h2>

        </div>

        <div className="bg-white rounded-3xl shadow p-6">

          <p className="text-gray-500">
            Asistencias
          </p>

          <h2 className="text-4xl font-bold text-green-600 mt-3">

            {presentes}

          </h2>

        </div>

        <div className="bg-white rounded-3xl shadow p-6">

          <p className="text-gray-500">
            Faltas
          </p>

          <h2 className="text-4xl font-bold text-red-500 mt-3">

            {faltas}

          </h2>

        </div>

        <div className="bg-white rounded-3xl shadow p-6">

          <p className="text-gray-500">
            Asistencia global
          </p>

          <h2 className="text-4xl font-bold text-blue-600 mt-3">

            {porcentaje}%

          </h2>

        </div>

      </div>

      {/* BARRA */}
      <section className="bg-white rounded-3xl shadow p-6">

        <div className="flex justify-between mb-3">

          <span className="font-semibold">

            Progreso de asistencia

          </span>

          <span className="font-bold">

            {porcentaje}%

          </span>

        </div>

        <div className="h-4 w-full rounded-full bg-slate-200 overflow-hidden">

          <div
            style={{
              width: `${porcentaje}%`
            }}
            className={`h-full rounded-full ${
              porcentaje >= 80
                ? "bg-green-500"
                : porcentaje >= 60
                  ? "bg-yellow-500"
                  : "bg-red-500"
            }`}
          />

        </div>

      </section>

      {/* HISTORIAL */}
      <section className="bg-white rounded-3xl shadow p-6">

        <h2 className="text-2xl font-bold mb-6">

          Historial mensual

        </h2>

        {Object.keys(historial)
          .length === 0 ? (

          <div className="text-center py-10 text-gray-500">

            No hay asistencias registradas

          </div>

        ) : (

          <div className="space-y-8">

            {Object.entries(historial)
              .map(
                ([mes, registros]: any) => (

                <div key={mes}>

                  <h3 className="text-xl font-bold capitalize mb-4">

                    {mes}

                  </h3>

                  <div className="overflow-x-auto border rounded-2xl">

                    <table className="w-full">

                      <thead className="bg-slate-100">

                        <tr className="text-left">

                          <th className="p-4">
                            Fecha
                          </th>

                          <th className="p-4">
                            Materia
                          </th>

                          <th className="p-4">
                            Estado
                          </th>

                        </tr>

                      </thead>

                      <tbody>

                        {registros.map(
                          (a: any) => (

                          <tr
                            key={a.id}
                            className="border-t"
                          >

                            <td className="p-4">

                              {new Date(
                                a.fecha
                              ).toLocaleDateString(
                                "es-MX"
                              )}

                            </td>

                            <td className="p-4 font-medium">

                              {
                                a?.materia
                                  ?.nombre ||
                                "Materia"
                              }

                            </td>

                            <td className="p-4">

                              <span
                                className={`rounded-full px-4 py-1 text-sm font-semibold ${
                                  a.presente
                                    ? "bg-green-100 text-green-700"
                                    : "bg-red-100 text-red-600"
                                }`}
                              >

                                {a.presente
                                  ? "Presente"
                                  : "Falta"}

                              </span>

                            </td>

                          </tr>

                        ))}

                      </tbody>

                    </table>

                  </div>

                </div>

              ))}

          </div>

        )}

      </section>

    </div>
  );
}