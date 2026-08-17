"use client";

import { useEffect, useState } from "react";
import { API_URL } from "@/lib/config";
import { notificar } from "@/lib/notificar";
import { PageHeader, Card, TableWrap, Badge, Button, Vacio, Modal, Stat } from "@/components/ui";
import { dinero, fecha } from "@/lib/format";

export default function AdministradorPagosPage() {
  const [pagos, setPagos] = useState<any[]>([]);
  const [meta, setMeta] = useState<any>({ total: 0 });
  const [busqueda, setBusqueda] = useState("");
  const [detalle, setDetalle] = useState<any>(null);

  const [loading, setLoading] = useState(true);

  const cargar = async () => {
    try {
      setLoading(true);

      const res = await fetch(`${API_URL}/api/pagos?perPage=100`, {
        credentials: "include",
      });

      const json = await res.json();

      if (!res.ok) throw new Error(json?.message || "Error al cargar pagos");

      setPagos(json?.data ?? []);
      setMeta(json?.meta ?? { total: 0 });
    } catch (e: any) {
      notificar(e.message || "Error al cargar pagos", "error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    cargar();
  }, []);

  // 🔒 Un pago NO se edita: se cancela con motivo.
  // Editar el importe de un recibo ya emitido destruiría la
  // trazabilidad, y el folio ya salió impreso.
  const cancelar = async (p: any) => {
    const motivo = window.prompt(`Motivo de cancelación del recibo ${p.folio}:`);

    if (!motivo) return;

    const res = await fetch(`${API_URL}/api/pagos/cancelar/${p.id}`, {
      method: "PUT",
      credentials: "include",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ motivo }),
    });

    const json = await res.json();

    if (!res.ok) {
      notificar(json?.message || "No se pudo cancelar", "error");
      return;
    }

    notificar(json?.message || "Recibo cancelado", "exito");
    setDetalle(null);
    cargar();
  };

  const filtrados = pagos.filter((p) => {
    const t = busqueda.trim().toLowerCase();
    if (!t) return true;
    return (
      String(p.folio).includes(t) ||
      (p.alumno?.user?.name || "").toLowerCase().includes(t) ||
      (p.alumno?.matricula || "").toLowerCase().includes(t)
    );
  });

  const cobrado = filtrados
    .filter((p) => p.estado !== "CANCELADO")
    .reduce((acc, p) => acc + Number(p.total ?? 0), 0);

  const conceptosDe = (p: any) =>
    (p.detalles ?? [])
      .map((d: any) => d.concepto?.nombre)
      .filter(Boolean)
      .join(", ") || "—";

  if (loading) return <p className="p-2 text-slate-500">Cargando...</p>;

  return (
    <>
      <PageHeader
        titulo="Pagos"
        descripcion="Control financiero — los cobros se registran desde Caja"
      >
        {/* El alta real vive en Caja: ahí están los adeudos del alumno,
            el folio consecutivo y la generación de trámites. */}
        <a href="/caja/cobros">
          <Button>Ir a cobrar</Button>
        </a>
      </PageHeader>

      <div className="grid gap-4 md:grid-cols-3">
        <Stat etiqueta="Recibos" valor={meta.total ?? filtrados.length} />
        <Stat etiqueta="Cobrado (vigente)" valor={dinero(cobrado)} />
        <Stat
          etiqueta="Cancelados"
          valor={pagos.filter((p) => p.estado === "CANCELADO").length}
        />
      </div>

      <Card>
        <input
          className="w-full rounded-xl border border-slate-300 px-4 py-2"
          placeholder="Buscar por folio, alumno o matrícula"
          value={busqueda}
          onChange={(e) => setBusqueda(e.target.value)}
        />
      </Card>

      {filtrados.length === 0 ? (
        <Vacio
          titulo="No hay pagos registrados."
          pista="Los recibos se generan desde Caja → Cobros."
        />
      ) : (
        <TableWrap>
          <table className="w-full text-left text-sm">
            <thead className="bg-slate-50 text-slate-600">
              <tr>
                <th className="px-4 py-3">Folio</th>
                <th className="px-4 py-3">Alumno</th>
                <th className="px-4 py-3">Conceptos</th>
                <th className="px-4 py-3">Fecha</th>
                <th className="px-4 py-3">Total</th>
                <th className="px-4 py-3">Estado</th>
                <th className="px-4 py-3"></th>
              </tr>
            </thead>

            <tbody>
              {filtrados.map((p) => (
                <tr
                  key={p.id}
                  className={`border-t border-slate-100 ${
                    p.estado === "CANCELADO" ? "opacity-60" : ""
                  }`}
                >
                  <td className="px-4 py-3 font-semibold">{p.folio}</td>

                  <td className="px-4 py-3">
                    {p.alumno?.user?.name || "N/A"}
                    <span className="block text-xs text-slate-400">
                      {p.alumno?.matricula}
                    </span>
                  </td>

                  <td className="px-4 py-3">{conceptosDe(p)}</td>

                  <td className="px-4 py-3">{fecha(p.pagadoEn)}</td>

                  <td className="px-4 py-3">{dinero(p.total)}</td>

                  <td className="px-4 py-3">
                    <Badge tono={p.estado === "CANCELADO" ? "grave" : "bien"}>
                      {p.estado === "CANCELADO" ? "Cancelado" : "Pagado"}
                    </Badge>
                  </td>

                  <td className="px-4 py-3">
                    <Button variante="secundario" onClick={() => setDetalle(p)}>
                      Ver
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </TableWrap>
      )}

      {detalle && (
        <Modal
          titulo={`Recibo ${detalle.folio}`}
          onClose={() => setDetalle(null)}
        >
          <p className="text-sm text-slate-500">
            {detalle.alumno?.user?.name} · {detalle.alumno?.matricula}
          </p>

          <p className="mt-1 text-sm text-slate-500">
            {fecha(detalle.pagadoEn)} · {detalle.metodo}
          </p>

          <ul className="mt-4 space-y-2 text-sm">
            {(detalle.detalles ?? []).map((d: any) => (
              <li
                key={d.id}
                className="flex justify-between border-b border-slate-100 pb-2"
              >
                <span>
                  {d.concepto?.nombre}
                  {d.cantidad > 1 && ` x${d.cantidad}`}
                </span>
                <span>{dinero(d.monto * d.cantidad)}</span>
              </li>
            ))}
          </ul>

          <div className="mt-4 flex justify-between font-semibold">
            <span>Total</span>
            <span>{dinero(detalle.total)}</span>
          </div>

          {detalle.motivoCancela && (
            <p className="mt-4 rounded-xl bg-red-50 p-3 text-sm text-red-800">
              Cancelado: {detalle.motivoCancela}
            </p>
          )}

          <div className="mt-6 flex justify-end gap-2">
            {detalle.estado !== "CANCELADO" && (
              <Button variante="peligro" onClick={() => cancelar(detalle)}>
                Cancelar recibo
              </Button>
            )}

            <Button variante="secundario" onClick={() => setDetalle(null)}>
              Cerrar
            </Button>
          </div>
        </Modal>
      )}
    </>
  );
}
