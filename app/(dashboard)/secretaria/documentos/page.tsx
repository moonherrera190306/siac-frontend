"use client";

import { useEffect, useState } from "react";
import { API_URL } from "@/lib/config";

type Documento = {
  id: string;
  nombre: string;
  tipo: string;
  estado: string;
  motivoRechazo?: string | null;
  createdAt: string;
  alumno?: {
    matricula?: string;
    user?: { name?: string };
    grupo?: { nombre?: string };
  };
};

const COLOR: Record<string, string> = {
  VALIDADO: "bg-green-100 text-green-700",
  PENDIENTE: "bg-amber-100 text-amber-700",
  RECHAZADO: "bg-red-100 text-red-700",
};

export default function SecretariaDocumentosPage() {
  const [documentos, setDocumentos] = useState<Documento[]>([]);
  const [filtro, setFiltro] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const cargar = async (estado = "") => {
    try {
      setLoading(true);

      // 🔥 Antes el estado se decidía con `index % 2`.
      const res = await fetch(
        `${API_URL}/api/documentos?perPage=100${estado ? `&estado=${estado}` : ""}`,
        { credentials: "include" }
      );

      const json = await res.json();

      if (!res.ok) {
        throw new Error(json?.message || "Error al cargar documentos");
      }

      setDocumentos(json?.data ?? []);
      setError("");
    } catch (e: any) {
      setError(e.message || "Error al cargar documentos");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    cargar(filtro);
  }, [filtro]);

  const validar = async (id: string, estado: string) => {
    let motivoRechazo = "";

    if (estado === "RECHAZADO") {
      motivoRechazo = window.prompt("Motivo del rechazo:") || "";

      if (!motivoRechazo) return;
    }

    const res = await fetch(`${API_URL}/api/documentos/${id}/validar`, {
      method: "PUT",
      credentials: "include",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ estado, motivoRechazo }),
    });

    if (!res.ok) {
      const json = await res.json();
      setError(json?.message || "No se pudo actualizar el documento");
      return;
    }

    cargar(filtro);
  };

  return (
    <div className="space-y-6">
      <section className="flex flex-col gap-4 rounded-2xl border bg-white p-6 shadow-sm md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-3xl font-bold">Documentos</h1>
          <p className="text-gray-500">Expedientes de los alumnos</p>
        </div>

        <select
          className="rounded-xl border border-gray-300 px-4 py-2"
          value={filtro}
          onChange={(e) => setFiltro(e.target.value)}
        >
          <option value="">Todos</option>
          <option value="PENDIENTE">Pendientes</option>
          <option value="VALIDADO">Validados</option>
          <option value="RECHAZADO">Rechazados</option>
        </select>
      </section>

      {error && (
        <p className="rounded-xl bg-red-50 p-4 text-red-600">{error}</p>
      )}

      {loading && <p className="p-2 text-gray-500">Cargando...</p>}

      {!loading && documentos.length === 0 && !error && (
        <div className="rounded-2xl border bg-white p-8 text-center text-gray-500">
          No hay documentos registrados todavía.
        </div>
      )}

      {!loading && documentos.length > 0 && (
        <div className="overflow-x-auto rounded-2xl border bg-white shadow-sm">
          <table className="w-full text-left text-sm">
            <thead className="bg-gray-50 text-gray-600">
              <tr>
                <th className="px-4 py-3">Alumno</th>
                <th className="px-4 py-3">Grupo</th>
                <th className="px-4 py-3">Documento</th>
                <th className="px-4 py-3">Tipo</th>
                <th className="px-4 py-3">Fecha</th>
                <th className="px-4 py-3">Estado</th>
                <th className="px-4 py-3"></th>
              </tr>
            </thead>

            <tbody>
              {documentos.map((d) => (
                <tr key={d.id} className="border-t">
                  <td className="px-4 py-3">
                    {d.alumno?.user?.name || "N/A"}
                    <span className="block text-xs text-gray-400">
                      {d.alumno?.matricula}
                    </span>
                  </td>

                  <td className="px-4 py-3">{d.alumno?.grupo?.nombre || "—"}</td>

                  <td className="px-4 py-3">{d.nombre}</td>

                  <td className="px-4 py-3">{d.tipo}</td>

                  <td className="px-4 py-3">
                    {new Date(d.createdAt).toLocaleDateString("es-MX")}
                  </td>

                  <td className="px-4 py-3">
                    <span
                      className={`rounded-full px-3 py-1 text-xs ${
                        COLOR[d.estado] || "bg-gray-100 text-gray-600"
                      }`}
                    >
                      {d.estado}
                    </span>

                    {d.motivoRechazo && (
                      <span className="block text-xs text-gray-400">
                        {d.motivoRechazo}
                      </span>
                    )}
                  </td>

                  <td className="px-4 py-3">
                    {d.estado !== "VALIDADO" && (
                      <button
                        onClick={() => validar(d.id, "VALIDADO")}
                        className="mr-2 rounded-lg border px-3 py-1 text-xs hover:bg-green-50"
                      >
                        Validar
                      </button>
                    )}

                    {d.estado !== "RECHAZADO" && (
                      <button
                        onClick={() => validar(d.id, "RECHAZADO")}
                        className="rounded-lg border px-3 py-1 text-xs hover:bg-red-50"
                      >
                        Rechazar
                      </button>
                    )}
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
