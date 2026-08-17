"use client";

import { useEffect, useState } from "react";
import { API_URL } from "@/lib/config";

type Docente = {
  id: string;
  nombre?: string | null;
  cedula?: string | null;
  rfc?: string | null;
  activo: boolean;
  user?: { name?: string; email?: string };
  asignaciones?: unknown[];
};

export default function AdministradorMaestrosPage() {
  const [docentes, setDocentes] = useState<Docente[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const cargar = async () => {
      try {
        // 🔥 Antes esta pantalla mostraba un array fijo de 4 maestros
        // escrito a mano en el archivo.
        const res = await fetch(`${API_URL}/api/docentes`, {
          credentials: "include",
        });

        const json = await res.json();

        if (!res.ok) {
          throw new Error(json?.message || "Error al cargar maestros");
        }

        setDocentes(json?.data ?? []);
      } catch (e: any) {
        setError(e.message || "Error al cargar maestros");
      } finally {
        setLoading(false);
      }
    };

    cargar();
  }, []);

  if (loading) return <p className="p-6">Cargando...</p>;

  return (
    <div className="space-y-6">
      <section className="rounded-2xl border bg-white p-6 shadow-sm">
        <h1 className="text-3xl font-bold">Maestros</h1>
        <p className="text-gray-500">Plantilla docente registrada</p>
      </section>

      {error && (
        <p className="rounded-xl bg-red-50 p-4 text-red-600">{error}</p>
      )}

      {!error && docentes.length === 0 && (
        <div className="rounded-2xl border bg-white p-8 text-center text-gray-500">
          No hay maestros registrados.
        </div>
      )}

      {docentes.length > 0 && (
        <div className="overflow-x-auto rounded-2xl border bg-white shadow-sm">
          <table className="w-full text-left text-sm">
            <thead className="bg-gray-50 text-gray-600">
              <tr>
                <th className="px-4 py-3">Nombre</th>
                <th className="px-4 py-3">Correo</th>
                <th className="px-4 py-3">Cédula</th>
                <th className="px-4 py-3">RFC</th>
                <th className="px-4 py-3">Asignaciones</th>
                <th className="px-4 py-3">Estado</th>
              </tr>
            </thead>

            <tbody>
              {docentes.map((d) => (
                <tr key={d.id} className="border-t">
                  <td className="px-4 py-3 font-medium">
                    {d.nombre || d.user?.name || "Sin nombre"}
                  </td>

                  <td className="px-4 py-3">{d.user?.email || "—"}</td>

                  <td className="px-4 py-3">{d.cedula || "—"}</td>

                  <td className="px-4 py-3">{d.rfc || "—"}</td>

                  <td className="px-4 py-3">
                    {(d.asignaciones ?? []).length}
                  </td>

                  <td className="px-4 py-3">
                    <span
                      className={
                        d.activo
                          ? "rounded-full bg-green-100 px-3 py-1 text-xs text-green-700"
                          : "rounded-full bg-gray-100 px-3 py-1 text-xs text-gray-600"
                      }
                    >
                      {d.activo ? "Activo" : "Inactivo"}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
