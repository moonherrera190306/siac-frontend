"use client";

import { useEffect, useState } from "react";
import { API_URL } from "@/lib/config";

function hoy() {
  const d = new Date();
  const mes = String(d.getMonth() + 1).padStart(2, "0");
  const dia = String(d.getDate()).padStart(2, "0");
  return `${d.getFullYear()}-${mes}-${dia}`;
}

export default function CajaReportesPage() {
  const [fecha, setFecha] = useState(hoy());
  const [corte, setCorte] = useState<any>(null);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const cargar = async (dia: string) => {
    try {
      setLoading(true);

      // 🔥 Antes esta pantalla mostraba JSON crudo dentro de un <pre>.
      const res = await fetch(`${API_URL}/api/pagos/corte/dia?fecha=${dia}`, {
        credentials: "include",
      });

      const json = await res.json();

      if (!res.ok) throw new Error(json?.message || "Error al generar el corte");

      setCorte(json?.data ?? null);
      setError("");
    } catch (e: any) {
      setError(e.message || "Error al generar el corte");
      setCorte(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    cargar(fecha);
  }, []);

  const conceptos = Object.entries(corte?.porConcepto ?? {});

  return (
    <div className="space-y-6">
      <section className="flex flex-col gap-4 rounded-3xl border bg-white p-6 shadow-sm md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-3xl font-bold">Corte de caja</h1>
          <p className="text-gray-500">
            Un cajero ve solo sus propios cobros; dirección ve todos.
          </p>
        </div>

        <input
          type="date"
          value={fecha}
          onChange={(e) => {
            setFecha(e.target.value);
            cargar(e.target.value);
          }}
          className="rounded-xl border border-gray-300 px-4 py-2"
        />
      </section>

      {error && (
        <p className="rounded-xl bg-red-50 p-4 text-red-600">{error}</p>
      )}

      {loading && <p className="text-gray-500">Generando corte...</p>}

      {corte && !loading && (
        <>
          <div className="grid gap-4 md:grid-cols-2">
            <div className="rounded-3xl border bg-white p-6 shadow-sm">
              <p className="text-sm text-gray-500">Recibos emitidos</p>
              <h2 className="text-3xl font-bold">{corte.recibos}</h2>
            </div>

            <div className="rounded-3xl border-2 border-green-500 bg-green-50 p-6">
              <p className="text-sm text-green-700">Total del día</p>
              <h2 className="text-3xl font-bold text-green-800">
                ${Number(corte.total ?? 0).toFixed(2)}
              </h2>
            </div>
          </div>

          <section className="rounded-3xl border bg-white shadow-sm">
            <h2 className="border-b px-5 py-4 text-lg font-semibold">
              Desglose por concepto
            </h2>

            {conceptos.length === 0 ? (
              <p className="p-6 text-center text-gray-500">
                No hubo cobros en esta fecha.
              </p>
            ) : (
              <table className="w-full text-left text-sm">
                <thead className="bg-gray-50 text-gray-600">
                  <tr>
                    <th className="px-4 py-3">Concepto</th>
                    <th className="px-4 py-3 text-right">Importe</th>
                    <th className="px-4 py-3 text-right">%</th>
                  </tr>
                </thead>

                <tbody>
                  {conceptos.map(([clave, monto]: any) => (
                    <tr key={clave} className="border-t">
                      <td className="px-4 py-3">{clave}</td>

                      <td className="px-4 py-3 text-right">
                        ${Number(monto).toFixed(2)}
                      </td>

                      <td className="px-4 py-3 text-right text-gray-500">
                        {corte.total > 0
                          ? ((Number(monto) / corte.total) * 100).toFixed(1)
                          : "0.0"}
                        %
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </section>

          <p className="text-xs text-gray-400">
            Los recibos cancelados no se cuentan en el corte.
          </p>
        </>
      )}
    </div>
  );
}
