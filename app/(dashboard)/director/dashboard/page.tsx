"use client";

import { useEffect, useMemo, useState } from "react";
import { API_URL } from "@/lib/config";

type DashboardData = {
  totalAlumnos: number;
  totalGrupos: number;
  totalMaterias: number;
  totalDocentes: number;
};

const defaultData: DashboardData = {
  totalAlumnos: 0,
  totalGrupos: 0,
  totalMaterias: 0,
  totalDocentes: 0,
};

function normalizeArray(data: any): any[] {
  if (Array.isArray(data)) return data;

  if (Array.isArray(data?.data)) {
    return data.data;
  }

  return [];
}

export default function DirectorDashboardPage() {
  const [data, setData] =
    useState<DashboardData>(defaultData);

  const [loading, setLoading] =
    useState(true);

  const [error, setError] =
    useState("");

  useEffect(() => {
    async function fetchDashboard() {
      try {
        setLoading(true);
        setError("");

        // 🔐 El token vive en una cookie httpOnly y no se puede leer desde aquí.
  // Solo se comprueba que exista una sesión guardada.
  const sesion =
    typeof window !== "undefined"
      ? localStorage.getItem("user")
      : null;

        // 🔐 La cookie httpOnly viaja sola con credentials: "include".
        const opciones: RequestInit = {
          credentials: "include",
          headers: { "Content-Type": "application/json" },
        };

        const [
          alumnosRes,
          gruposRes,
          docentesRes,
        ] = await Promise.all([
          fetch(
            `${API_URL}/api/alumnos?perPage=1`,
            opciones
          ),

          fetch(
            `${API_URL}/api/grupos`,
            opciones
          ),

          fetch(
            `${API_URL}/api/docentes`,
            opciones
          ),
        ]);

        const alumnosJson =
          await alumnosRes.json();

        const gruposJson =
          await gruposRes.json();

        const docentesJson =
          await docentesRes.json();

        const alumnos =
          normalizeArray(
            alumnosJson?.data ||
              alumnosJson
          );

        const grupos =
          normalizeArray(
            gruposJson?.data ||
              gruposJson
          );

        const docentes =
          normalizeArray(
            docentesJson?.data ||
              docentesJson
          );

        const materias =
          grupos.flatMap(
            (g: any) =>
              g?.materias || []
          );

        setData({
          // 🔥 /api/alumnos ahora está paginado: el total real
          // viene en meta, no en el largo de la página.
          totalAlumnos:
            alumnosJson?.meta?.total ?? alumnos?.length ?? 0,

          totalGrupos:
            grupos?.length ?? 0,

          totalMaterias:
            materias?.length ?? 0,

          totalDocentes:
            docentes?.length ?? 0,
        });
      } catch (err: any) {
        console.error(err);

        setError(
          err?.message ||
            "Error interno del servidor"
        );

        setData(defaultData);
      } finally {
        setLoading(false);
      }
    }

    fetchDashboard();
  }, []);

  const resumen = useMemo(
    () => [
      {
        title: "Alumnos",
        value:
          data?.totalAlumnos ?? 0,

        description:
          "Total de alumnos",
      },

      {
        title: "Grupos",
        value:
          data?.totalGrupos ?? 0,

        description:
          "Grupos activos",
      },

      {
        title: "Materias",
        value:
          data?.totalMaterias ?? 0,

        description:
          "Materias registradas",
      },

      {
        title: "Docentes",
        value:
          data?.totalDocentes ?? 0,

        description:
          "Docentes activos",
      },
    ],
    [data]
  );

  const accesos = [
    {
      title:
        "Consultar asistencias",

      href: "/director/asistencias",
    },

    {
      title:
        "Supervisar grupos",

      href: "/director/grupos",
    },

    {
      title:
        "Ver docentes",

      href: "/director/maestros",
    },

    {
      title:
        "Reportes académicos",

      href: "/director/reportes",
    },
  ];

  if (loading) {
    return (
      <p className="p-6">
        Cargando dashboard...
      </p>
    );
  }

  if (error) {
    return (
      <div className="p-6">
        <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-red-700">
          {error}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 p-6">
      {/* HEADER */}
      <section className="rounded-2xl border bg-white p-6 shadow-sm">
        <h1 className="text-3xl font-bold">
          Dashboard Director
        </h1>

        <p className="text-gray-600">
          Vista ejecutiva institucional
        </p>
      </section>

      {/* STATS */}
      <section className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
        {(resumen ?? []).map(
          (item) => (
            <div
              key={item.title}
              className="rounded-2xl border bg-white p-5 shadow-sm"
            >
              <p className="text-sm text-gray-500">
                {item.title}
              </p>

              <h2 className="mt-2 text-3xl font-bold">
                {item.value}
              </h2>

              <p className="mt-2 text-sm text-gray-500">
                {item.description}
              </p>
            </div>
          )
        )}
      </section>

      {/* ACCESOS */}
      <section className="rounded-2xl border bg-white p-6 shadow-sm">
        <h2 className="text-2xl font-bold">
          Accesos rápidos
        </h2>

        <div className="mt-4 grid gap-3 md:grid-cols-2">
          {(accesos ?? []).map(
            (item) => (
              <a
                key={item.href}
                href={item.href}
                className="rounded-xl bg-blue-600 px-4 py-3 text-white transition hover:bg-blue-700"
              >
                {item.title}
              </a>
            )
          )}
        </div>
      </section>
    </div>
  );
}