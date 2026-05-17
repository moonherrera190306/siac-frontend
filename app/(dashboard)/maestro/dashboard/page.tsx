"use client";

import { useEffect, useState } from "react";

export default function MaestroDashboardPage() {
  const [dashboard, setDashboard] = useState<any>(null);
  const [grupos, setGrupos] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchDashboard = async () => {
      try {
        setLoading(true);

        const token = localStorage.getItem("token");

        // 🔥 DASHBOARD
        const dashboardRes = await fetch(
          "http://localhost:4000/api/docentes/dashboard",
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        const dashboardData =
          await dashboardRes.json();

        if (!dashboardRes.ok) {
          throw new Error(
            dashboardData.message ||
              "Error cargando dashboard"
          );
        }

        setDashboard(dashboardData.data);

        // 🔥 GRUPOS
        const gruposRes = await fetch(
          "http://localhost:4000/api/docentes/grupos",
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        const gruposData =
          await gruposRes.json();

        if (!gruposRes.ok) {
          throw new Error(
            gruposData.message ||
              "Error cargando grupos"
          );
        }

        setGrupos(gruposData.data || []);

      } catch (err: any) {
        console.error(
          "ERROR DASHBOARD:",
          err
        );

        setError(
          err.message ||
            "Error cargando dashboard"
        );
      } finally {
        setLoading(false);
      }
    };

    fetchDashboard();
  }, []);

  /* =========================
     ⏳ LOADING
  ========================= */
  if (loading) {
    return (
      <div className="p-6">
        <p>Cargando dashboard...</p>
      </div>
    );
  }

  /* =========================
     ❌ ERROR
  ========================= */
  if (error) {
    return (
      <div className="p-6">
        <div className="rounded-xl border border-red-300 bg-red-50 p-4">
          <h2 className="font-semibold text-red-700">
            Error cargando dashboard
          </h2>

          <p className="text-red-600 mt-1">
            {error}
          </p>
        </div>
      </div>
    );
  }

  /* =========================
     ✅ DASHBOARD
  ========================= */
  return (
    <div className="space-y-6 p-6">

      {/* HEADER */}
      <section className="rounded-2xl bg-white border p-6 shadow-sm">
        <h1 className="text-3xl font-bold">
          Dashboard Maestro
        </h1>

        <p className="text-gray-600 mt-2">
          Bienvenido al panel académico
        </p>
      </section>

      {/* KPIs */}
      <section className="grid md:grid-cols-4 gap-4">

        <div className="rounded-2xl bg-white border p-5 shadow-sm">
          <p className="text-gray-500 text-sm">
            Materias
          </p>

          <h2 className="text-3xl font-bold mt-2">
            {dashboard?.materias ?? 0}
          </h2>
        </div>

        <div className="rounded-2xl bg-white border p-5 shadow-sm">
          <p className="text-gray-500 text-sm">
            Grupos
          </p>

          <h2 className="text-3xl font-bold mt-2">
            {dashboard?.totalGrupos ?? 0}
          </h2>
        </div>

        <div className="rounded-2xl bg-white border p-5 shadow-sm">
          <p className="text-gray-500 text-sm">
            Alumnos
          </p>

          <h2 className="text-3xl font-bold mt-2">
            {dashboard?.totalAlumnos ?? 0}
          </h2>
        </div>

        <div className="rounded-2xl bg-white border p-5 shadow-sm">
          <p className="text-gray-500 text-sm">
            Promedio
          </p>

          <h2 className="text-3xl font-bold mt-2">
            {dashboard?.promedioGeneral ?? 0}
          </h2>
        </div>

      </section>

      {/* GRUPOS */}
      <section className="rounded-2xl bg-white border p-6 shadow-sm">

        <h2 className="text-2xl font-bold mb-4">
          Mis grupos
        </h2>

        {!grupos.length ? (
          <p className="text-gray-500">
            No hay grupos asignados
          </p>
        ) : (
          <div className="grid md:grid-cols-2 gap-4">

            {grupos.map((grupo) => (
              <div
                key={grupo.id}
                className="rounded-xl border p-4"
              >
                <h3 className="font-semibold text-lg">
                  {grupo.nombre}
                </h3>

                <p className="text-gray-600 mt-2">
                  Total alumnos:
                  {" "}
                  {grupo.totalAlumnos ?? 0}
                </p>
              </div>
            ))}

          </div>
        )}

      </section>

    </div>
  );
}