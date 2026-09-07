"use client";

import { useEffect, useState } from "react";
import { API_URL } from "@/lib/config";
// La constancia se arma en lib/documentos: una sola plantilla membretada
// para todos los documentos oficiales.
import { abrirConstancia, type TipoConstancia } from "@/lib/documentos";
import { notificar } from "@/lib/notificar";

const COLOR: Record<string, string> = {
  SOLICITADO: "bg-amber-100 text-amber-700",
  EN_PROCESO: "bg-blue-100 text-blue-700",
  LISTO: "bg-green-100 text-green-700",
  ENTREGADO: "bg-slate-200 text-slate-700",
  CANCELADO: "bg-red-100 text-red-700",
};

export default function SecretariaConstanciasPage() {
  const [tramites, setTramites] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [aviso, setAviso] = useState("");

  // Las tres variantes que se emiten en ventanilla.
  const [tipo, setTipo] = useState<TipoConstancia>("TERMINADO");

  const [ciclo, setCiclo] = useState<any>(null);

  const cargar = async () => {
    try {
      setLoading(true);

      // Solo los trámites de constancia: los genera caja al cobrarlas.
      const res = await fetch(
        `${API_URL}/api/tramites?concepto=CONSTANCIA&perPage=100`,
        { credentials: "include" }
      );

      const json = await res.json();

      if (!res.ok) throw new Error(json?.message || "Error al cargar");

      setTramites(json?.data ?? []);

      // Ciclo activo: de ahí salen el nombre y las fechas de curso.
      const rc = await fetch(`${API_URL}/api/ciclos?activo=true`, {
        credentials: "include",
      });

      const jc = await rc.json();

      setCiclo((jc?.data ?? []).find((c: any) => c.activo) ?? jc?.data?.[0] ?? null);
      setError("");
    } catch (e: any) {
      setError(e.message || "Error al cargar constancias");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    cargar();
  }, []);

  const avanzar = async (id: string, estado: string) => {
    const res = await fetch(`${API_URL}/api/tramites/${id}/estado`, {
      method: "PUT",
      credentials: "include",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ estado }),
    });

    const json = await res.json();

    if (!res.ok) {
      setError(json?.message || "No se pudo actualizar");
      return;
    }

    setAviso(`Constancia marcada como ${estado}`);
    cargar();
  };

  const comoTexto = (v?: string | null) =>
    v
      ? new Date(v).toLocaleDateString("es-MX", {
          day: "2-digit",
          month: "long",
          year: "numeric",
        })
      : "—";

  // Abre la constancia en hoja membretada, lista para imprimir o guardar
  // en PDF desde el navegador.
  const generar = (t: any) => {
    const ok = abrirConstancia(t.alumno, {
      tipo,
      folioRecibo: t.pago?.folio,
      ciclo: ciclo?.nombre,
      semestre: t.alumno?.grupo?.semestre?.numero,
      bachillerato: t.alumno?.trayectoria?.nombre,
      turno: t.alumno?.grupo?.turno?.nombre,
      inicioCurso: comoTexto(ciclo?.fechaInicio),
      finCurso: comoTexto(ciclo?.fechaFin),
    });

    if (!ok) {
      setError(
        "El navegador bloqueó la ventana emergente. Permítela para generar la constancia."
      );
      return;
    }

    // Al generarla queda lista para entregar.
    if (t.estado === "SOLICITADO" || t.estado === "EN_PROCESO") {
      avanzar(t.id, t.estado === "SOLICITADO" ? "EN_PROCESO" : "LISTO");
    }
  };

  if (loading) return <p className="p-6">Cargando...</p>;

  const pendientes = tramites.filter(
    (t) => t.estado !== "ENTREGADO" && t.estado !== "CANCELADO"
  );

  return (
    <div className="space-y-6">
      <section className="rounded-2xl border bg-white p-6 shadow-sm">
        <h1 className="text-3xl font-bold">Constancias</h1>
        <p className="text-gray-500">
          {pendientes.length} pendiente(s). Las solicitudes llegan solas cuando
          caja cobra una constancia.
        </p>

        <label className="mt-4 block text-sm">
          <span className="mb-1 block text-gray-600">Tipo de constancia</span>

          <select
            value={tipo}
            onChange={(e) => setTipo(e.target.value as TipoConstancia)}
            className="rounded-xl border border-gray-300 px-3 py-2"
          >
            <option value="TERMINADO">Cursó y terminó el semestre</option>
            <option value="CURSANDO_INVIERNO">
              Cursando — receso de navidad y año nuevo
            </option>
            <option value="CURSANDO_PRIMAVERA">
              Cursando — receso de semana santa y pascua
            </option>
          </select>
        </label>
      </section>

      {error && (
        <p className="rounded-xl bg-red-50 p-4 text-red-600">{error}</p>
      )}

      {aviso && (
        <p className="rounded-xl bg-green-50 p-4 text-green-700">{aviso}</p>
      )}

      {tramites.length === 0 ? (
        <div className="rounded-2xl border bg-white p-8 text-center">
          <p className="text-gray-500">No hay constancias solicitadas.</p>
          <p className="mt-1 text-sm text-gray-400">
            Se generan automáticamente al cobrar el concepto CONSTANCIA en caja.
          </p>
        </div>
      ) : (
        <div className="overflow-x-auto rounded-2xl border bg-white shadow-sm">
          <table className="w-full text-left text-sm">
            <thead className="bg-gray-50 text-gray-600">
              <tr>
                <th className="px-4 py-3">Alumno</th>
                <th className="px-4 py-3">Carrera</th>
                <th className="px-4 py-3">Recibo</th>
                <th className="px-4 py-3">Solicitada</th>
                <th className="px-4 py-3">Estado</th>
                <th className="px-4 py-3"></th>
              </tr>
            </thead>

            <tbody>
              {tramites.map((t) => (
                <tr key={t.id} className="border-t">
                  <td className="px-4 py-3">
                    {t.alumno?.user?.name}
                    <span className="block text-xs text-gray-400">
                      {t.alumno?.matricula}
                    </span>
                  </td>

                  <td className="px-4 py-3">
                    {t.alumno?.carrera?.nombre || "—"}
                  </td>

                  <td className="px-4 py-3">
                    {t.pago?.folio ? `Folio ${t.pago.folio}` : "—"}
                  </td>

                  <td className="px-4 py-3">
                    {new Date(t.createdAt).toLocaleDateString("es-MX")}
                  </td>

                  <td className="px-4 py-3">
                    <span
                      className={`rounded-full px-3 py-1 text-xs ${
                        COLOR[t.estado] || "bg-gray-100 text-gray-600"
                      }`}
                    >
                      {t.estado.replace("_", " ")}
                    </span>
                  </td>

                  <td className="px-4 py-3">
                    <div className="flex gap-1">
                      {t.estado !== "CANCELADO" && (
                        <button
                          onClick={() => generar(t)}
                          className="rounded-lg border px-3 py-1 text-xs hover:bg-blue-50"
                        >
                          Generar
                        </button>
                      )}

                      {t.estado === "LISTO" && (
                        <button
                          onClick={() => avanzar(t.id, "ENTREGADO")}
                          className="rounded-lg border px-3 py-1 text-xs hover:bg-green-50"
                        >
                          Entregar
                        </button>
                      )}
                    </div>
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
