"use client";

import { useEffect, useState } from "react";
import { API_URL } from "@/lib/config";
// Una sola fuente de verdad para los datos de la institución.
import { ESCUELA as INSTITUCION } from "@/lib/documentos";
import { notificar } from "@/lib/notificar";

const COLOR: Record<string, string> = {
  SOLICITADO: "bg-amber-100 text-amber-700",
  EN_PROCESO: "bg-blue-100 text-blue-700",
  LISTO: "bg-green-100 text-green-700",
  ENTREGADO: "bg-slate-200 text-slate-700",
  CANCELADO: "bg-red-100 text-red-700",
};

const ESCUELA = INSTITUCION.nombre;
const DOMICILIO = INSTITUCION.domicilio;

export default function SecretariaConstanciasPage() {
  const [tramites, setTramites] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [aviso, setAviso] = useState("");

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

  // 🔥 Antes esto era un notificar("Generar constancia", "alerta").
  // Ahora abre el documento listo para imprimir o guardar en PDF
  // desde el propio navegador.
  const generar = (t: any) => {
    const fecha = new Date().toLocaleDateString("es-MX", {
      day: "numeric",
      month: "long",
      year: "numeric",
    });

    const alumno = t.alumno;

    const ventana = window.open("", "_blank", "width=800,height=1000");

    if (!ventana) {
      setError(
        "El navegador bloqueó la ventana emergente. Permítela para generar la constancia."
      );
      return;
    }

    ventana.document.write(`
      <html>
        <head>
          <title>Constancia - ${alumno?.matricula ?? ""}</title>
          <style>
            body { font-family: Georgia, serif; padding: 60px; line-height: 1.8; color: #111; }
            h1 { text-align: center; font-size: 30px; font-weight: 800; letter-spacing: 5px; }
            h2 { text-align: center; font-size: 15px; font-weight: normal; margin-top: 40px; }
            .sello { text-align: center; margin-top: 90px; }
            .linea { border-top: 1px solid #000; width: 260px; margin: 0 auto; padding-top: 6px; }
            .pie { margin-top: 50px; font-size: 11px; color: #555; text-align: center; }
            p { text-align: justify; }
          </style>
        </head>
        <body>
          <h1>${ESCUELA}</h1>
          <p style="text-align:center; font-size:12px;">${DOMICILIO}</p>

          <h2>CONSTANCIA DE ESTUDIOS</h2>

          <p>
            A quien corresponda:
          </p>

          <p>
            Por medio de la presente se hace constar que
            <strong>${alumno?.user?.name ?? ""}</strong>, con matrícula
            <strong>${alumno?.matricula ?? ""}</strong>, se encuentra inscrito
            en esta institución en
            <strong>${alumno?.carrera?.nombre ?? "el programa correspondiente"}</strong>,
            grupo <strong>${alumno?.grupo?.nombre ?? "—"}</strong>.
          </p>

          <p>
            Se extiende la presente a petición del interesado para los fines
            legales que a este convengan, en la ciudad de Zamora, Michoacán,
            a ${fecha}.
          </p>

          <div class="sello">
            <div class="linea">Secretaría Escolar</div>
          </div>

          <div class="pie">
            ${t.pago?.folio ? `Recibo de pago folio ${t.pago.folio}` : "Sin recibo asociado"}
          </div>

          <script>window.print();</script>
        </body>
      </html>
    `);

    ventana.document.close();

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
