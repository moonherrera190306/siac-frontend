"use client";

import { useEffect, useState } from "react";
import { API_URL } from "@/lib/config";

const COLUMNAS = [
  { id: "PP", titulo: "Primer parcial" },
  { id: "SP", titulo: "Segundo parcial" },
  { id: "PROM", titulo: "Promedio (lo calcula el sistema)" },
  { id: "EF", titulo: "Examen final" },
  { id: "O", titulo: "Ordinario" },
  { id: "EE", titulo: "Extraordinario" },
  { id: "EA", titulo: "Adicional" },
  { id: "EER", titulo: "Especial" },
  { id: "ND", titulo: "Nota definitiva (la calcula el sistema)" },
];

const CALCULADAS = ["PROM", "ND"];

export default function DirectorEvaluacionPage() {
  const [ciclos, setCiclos] = useState<any[]>([]);
  const [cicloId, setCicloId] = useState("");

  const [bloqueos, setBloqueos] = useState<any[]>([]);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [aviso, setAviso] = useState("");

  useEffect(() => {
    const cargar = async () => {
      try {
        const res = await fetch(`${API_URL}/api/ciclos`, {
          credentials: "include",
        });

        const json = await res.json();

        const lista = Array.isArray(json) ? json : json?.data ?? [];

        setCiclos(lista);

        const activo = lista.find((c: any) => c.activo);

        if (activo) {
          setCicloId(activo.id);
          cargarBloqueos(activo.id);
        }
      } catch (e: any) {
        setError(e.message || "Error al cargar ciclos");
      } finally {
        setLoading(false);
      }
    };

    cargar();
  }, []);

  const cargarBloqueos = async (id: string) => {
    try {
      const res = await fetch(`${API_URL}/api/calificaciones/bloqueos/${id}`, {
        credentials: "include",
      });

      const json = await res.json();

      if (!res.ok) throw new Error(json?.message || "Error al cargar bloqueos");

      setBloqueos(json?.data ?? []);
      setError("");
    } catch (e: any) {
      setError(e.message || "Error al cargar bloqueos");
    }
  };

  const estado = (columna: string) =>
    bloqueos.find((b) => b.columna === columna)?.abierto ?? false;

  const alternar = async (columna: string) => {
    setError("");
    setAviso("");

    const abierto = !estado(columna);

    const res = await fetch(
      `${API_URL}/api/calificaciones/bloqueos/${cicloId}/${columna}`,
      {
        method: "PUT",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ abierto }),
      }
    );

    const json = await res.json();

    if (!res.ok) {
      setError(json?.message || "No se pudo actualizar");
      return;
    }

    setAviso(
      `${columna} ${abierto ? "abierta" : "cerrada"} para captura`
    );

    cargarBloqueos(cicloId);
  };

  if (loading) return <p className="p-6">Cargando...</p>;

  return (
    <div className="space-y-6">
      <section className="rounded-2xl border bg-white p-6 shadow-sm">
        <h1 className="text-3xl font-bold">Periodos de evaluación</h1>
        <p className="text-gray-500">
          Cada columna del kardex se abre y se cierra por separado. Un maestro
          solo puede capturar lo que esté abierto.
        </p>
      </section>

      {error && (
        <p className="rounded-xl bg-red-50 p-4 text-red-600">{error}</p>
      )}

      {aviso && (
        <p className="rounded-xl bg-green-50 p-4 text-green-700">{aviso}</p>
      )}

      <section className="rounded-2xl border bg-white p-5 shadow-sm">
        <label className="text-sm text-gray-600">Ciclo escolar</label>

        <select
          className="mt-1 w-full rounded-xl border border-gray-300 px-4 py-2 md:w-80"
          value={cicloId}
          onChange={(e) => {
            setCicloId(e.target.value);
            cargarBloqueos(e.target.value);
          }}
        >
          <option value="">Selecciona un ciclo...</option>

          {ciclos.map((c) => (
            <option key={c.id} value={c.id}>
              {c.nombre} {c.activo ? "(activo)" : ""}
            </option>
          ))}
        </select>
      </section>

      {cicloId && (
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {COLUMNAS.map((c) => {
            const calculada = CALCULADAS.includes(c.id);
            const abierta = estado(c.id);

            return (
              <section
                key={c.id}
                className={`rounded-2xl border bg-white p-5 shadow-sm ${
                  calculada ? "opacity-60" : ""
                }`}
              >
                <div className="flex items-start justify-between">
                  <div>
                    <h2 className="text-lg font-bold">{c.id}</h2>
                    <p className="text-sm text-gray-500">{c.titulo}</p>
                  </div>

                  <span
                    className={`rounded-full px-3 py-1 text-xs ${
                      abierta
                        ? "bg-green-100 text-green-700"
                        : "bg-gray-100 text-gray-600"
                    }`}
                  >
                    {abierta ? "Abierta" : "Cerrada"}
                  </span>
                </div>

                {calculada ? (
                  <p className="mt-4 text-xs text-gray-500">
                    Esta columna no se captura: la calcula el sistema.
                  </p>
                ) : (
                  <button
                    onClick={() => alternar(c.id)}
                    className={`mt-4 w-full rounded-xl px-4 py-2 text-sm text-white transition ${
                      abierta
                        ? "bg-slate-700 hover:bg-slate-800"
                        : "bg-blue-600 hover:bg-blue-700"
                    }`}
                  >
                    {abierta ? "Cerrar captura" : "Abrir captura"}
                  </button>
                )}
              </section>
            );
          })}
        </div>
      )}
    </div>
  );
}
