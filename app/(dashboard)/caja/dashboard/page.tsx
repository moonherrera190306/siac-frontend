"use client";

import { useEffect, useState } from "react";
import { API_URL } from "@/lib/config";

function hoy() {
  const d = new Date();
  const mes = String(d.getMonth() + 1).padStart(2, "0");
  const dia = String(d.getDate()).padStart(2, "0");
  return `${d.getFullYear()}-${mes}-${dia}`;
}

export default function CajaDashboardPage() {
  const [corte, setCorte] = useState<any>(null);
  const [adeudos, setAdeudos] = useState<any>({ total: 0, saldoTotal: 0 });
  const [ultimos, setUltimos] = useState<any[]>([]);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const cargar = async () => {
      try {
        const [rc, ra, rp] = await Promise.all([
          fetch(`${API_URL}/api/pagos/corte/dia?fecha=${hoy()}`, {
            credentials: "include",
          }),
          fetch(`${API_URL}/api/pagos/adeudos/lista?perPage=1`, {
            credentials: "include",
          }),
          fetch(`${API_URL}/api/pagos?perPage=8`, { credentials: "include" }),
        ]);

        const [jc, ja, jp] = await Promise.all([rc.json(), ra.json(), rp.json()]);

        if (rc.ok) setCorte(jc?.data ?? null);
        if (ra.ok) setAdeudos(ja?.meta ?? { total: 0, saldoTotal: 0 });
        if (rp.ok) setUltimos(jp?.data ?? []);
      } catch (e: any) {
        setError(e.message || "Error al cargar el panel");
      } finally {
        setLoading(false);
      }
    };

    cargar();
  }, []);

  if (loading) return <p className="p-6">Cargando...</p>;

  return (
    <div className="space-y-6">
      <section className="rounded-3xl border bg-white p-6 shadow-sm">
        <h1 className="text-3xl font-bold">Caja</h1>
        <p className="text-gray-500">Movimiento del día</p>
      </section>

      {error && (
        <p className="rounded-xl bg-red-50 p-4 text-red-600">{error}</p>
      )}

      <div className="grid gap-4 md:grid-cols-3">
        <div className="rounded-3xl border bg-white p-5 shadow-sm">
          <p className="text-sm text-gray-500">Cobrado hoy</p>
          <h2 className="text-2xl font-bold">
            ${Number(corte?.total ?? 0).toFixed(2)}
          </h2>
        </div>

        <div className="rounded-3xl border bg-white p-5 shadow-sm">
          <p className="text-sm text-gray-500">Recibos hoy</p>
          <h2 className="text-2xl font-bold">{corte?.recibos ?? 0}</h2>
        </div>

        <div className="rounded-3xl border bg-white p-5 shadow-sm">
          <p className="text-sm text-gray-500">Adeudos pendientes</p>
          <h2 className="text-2xl font-bold">
            ${Number(adeudos?.saldoTotal ?? 0).toFixed(2)}
          </h2>
          <p className="text-xs text-gray-400">{adeudos?.total ?? 0} registro(s)</p>
        </div>
      </div>

      <div className="grid gap-3 md:grid-cols-3">
        <a
          href="/caja/cobros"
          className="rounded-2xl bg-blue-600 p-5 text-white transition hover:bg-blue-700"
        >
          <p className="text-lg font-semibold">Cobrar</p>
          <p className="text-sm opacity-90">Generar un recibo nuevo</p>
        </a>

        <a
          href="/caja/pagos-pendientes"
          className="rounded-2xl border bg-white p-5 transition hover:border-blue-400"
        >
          <p className="text-lg font-semibold">Adeudos</p>
          <p className="text-sm text-gray-500">Registrar y consultar</p>
        </a>

        <a
          href="/caja/reportes"
          className="rounded-2xl border bg-white p-5 transition hover:border-blue-400"
        >
          <p className="text-lg font-semibold">Corte del día</p>
          <p className="text-sm text-gray-500">Desglose por concepto</p>
        </a>
      </div>

      <section className="overflow-x-auto rounded-3xl border bg-white shadow-sm">
        <h2 className="border-b px-5 py-4 text-lg font-semibold">
          Últimos recibos
        </h2>

        {ultimos.length === 0 ? (
          <p className="p-6 text-center text-gray-500">
            Todavía no hay recibos emitidos.
          </p>
        ) : (
          <table className="w-full text-left text-sm">
            <thead className="bg-gray-50 text-gray-600">
              <tr>
                <th className="px-4 py-3">Folio</th>
                <th className="px-4 py-3">Alumno</th>
                <th className="px-4 py-3">Total</th>
                <th className="px-4 py-3">Estado</th>
              </tr>
            </thead>

            <tbody>
              {ultimos.map((p) => (
                <tr key={p.id} className="border-t">
                  <td className="px-4 py-3 font-semibold">{p.folio}</td>
                  <td className="px-4 py-3">{p.alumno?.user?.name || "N/A"}</td>
                  <td className="px-4 py-3">
                    ${Number(p.total ?? 0).toFixed(2)}
                  </td>
                  <td className="px-4 py-3">
                    <span
                      className={
                        p.estado === "CANCELADO"
                          ? "rounded-full bg-red-100 px-3 py-1 text-xs text-red-700"
                          : "rounded-full bg-green-100 px-3 py-1 text-xs text-green-700"
                      }
                    >
                      {p.estado === "CANCELADO" ? "Cancelado" : "Pagado"}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </section>
    </div>
  );
}
