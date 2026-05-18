"use client";

import { useEffect, useMemo, useState } from "react";

type Alumno = {
  id?: string;
};

type Grupo = {
  id?: string;
};

type Documento = {
  id?: string;
};

function normalizeArray(data: any): any[] {
  if (Array.isArray(data)) return data;

  if (Array.isArray(data?.data)) {
    return data.data;
  }

  return [];
}

export default function SecretariaDashboardPage() {
  const [alumnos, setAlumnos] = useState<
    Alumno[]
  >([]);

  const [grupos, setGrupos] = useState<
    Grupo[]
  >([]);

  const [documentos, setDocumentos] =
    useState<Documento[]>([]);

  const [loading, setLoading] =
    useState(true);

  const [error, setError] =
    useState("");

  useEffect(() => {
    async function fetchData() {
      try {
        setLoading(true);
        setError("");

        const token =
          localStorage.getItem("token");

        const headers = {
          "Content-Type":
            "application/json",

          Authorization: `Bearer ${token}`,
        };

        const [
          alumnosRes,
          gruposRes,
          documentosRes,
        ] = await Promise.all([
          fetch(
            "http://localhost:4000/api/alumnos",
            { headers }
          ),

          fetch(
            "http://localhost:4000/api/grupos",
            { headers }
          ),

          fetch(
            "http://localhost:4000/api/documentos",
            { headers }
          ),
        ]);

        const alumnosJson =
          await alumnosRes.json();

        const gruposJson =
          await gruposRes.json();

        let documentosJson: any = [];

        try {
          documentosJson =
            await documentosRes.json();
        } catch {
          documentosJson = [];
        }

        setAlumnos(
          normalizeArray(
            alumnosJson?.data ||
              alumnosJson
          )
        );

        setGrupos(
          normalizeArray(
            gruposJson?.data ||
              gruposJson
          )
        );

        setDocumentos(
          normalizeArray(
            documentosJson?.data ||
              documentosJson
          )
        );
      } catch (err: any) {
        console.error(err);

        setError(
          err?.message ||
            "Error interno del servidor"
        );

        setAlumnos([]);
        setGrupos([]);
        setDocumentos([]);
      } finally {
        setLoading(false);
      }
    }

    fetchData();
  }, []);

  const resumen = useMemo(
    () => [
      {
        title: "Alumnos",
        value: alumnos?.length ?? 0,
        description:
          "Alumnos registrados",
      },

      {
        title: "Grupos",
        value: grupos?.length ?? 0,
        description:
          "Grupos académicos",
      },

      {
        title: "Documentos",
        value:
          documentos?.length ?? 0,
        description:
          "Documentación cargada",
      },

      {
        title: "Inscripciones",
        value: alumnos?.length ?? 0,
        description:
          "Inscripciones activas",
      },
    ],
    [alumnos, grupos, documentos]
  );

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
      <section className="rounded-2xl border bg-white p-6 shadow-sm">
        <h1 className="text-3xl font-bold">
          Dashboard de Secretaría
        </h1>

        <p className="text-gray-600">
          Control escolar y académico
        </p>
      </section>

      <section className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
        {(resumen ?? []).map(
          (item) => (
            <div
              key={item.title}
              className="rounded-2xl border bg-white p-5 shadow"
            >
              <p className="text-sm text-gray-500">
                {item.title}
              </p>

              <h2 className="mt-2 text-3xl font-bold">
                {item?.value ?? 0}
              </h2>

              <p className="mt-1 text-sm text-gray-500">
                {item.description}
              </p>
            </div>
          )
        )}
      </section>
    </div>
  );
}