"use client";

import { useEffect, useState } from "react";

export default function AlumnoPagosPage() {
  const [pagos, setPagos] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPagos = async () => {
      const token = localStorage.getItem("token");
      const user = JSON.parse(localStorage.getItem("user") || "{}");

      try {
        const res = await fetch(
          `http://localhost:4000/api/pagos/${user.id}`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        const data = await res.json();

        if (Array.isArray(data)) {
          setPagos(data);
        }

      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    };

    fetchPagos();
  }, []);

  if (loading) return <p className="p-6">Cargando pagos...</p>;

  // 🔥 PROCESAMIENTO
  const pagosRealizados = pagos.length;

  const saldoPendiente = pagos
    .filter((p) => !p.pagadoEn)
    .reduce((acc, p) => acc + p.monto, 0);

  const proximoPago = pagos.find((p) => !p.pagadoEn);

  return (
    <div className="space-y-6">

      <h1 className="text-3xl font-bold">Pagos</h1>

      {/* 🔥 RESUMEN */}
      <div className="grid md:grid-cols-3 gap-4">

        <div className="bg-white p-4 rounded-xl shadow">
          <p className="text-sm text-gray-500">Saldo pendiente</p>
          <h2 className="text-2xl font-bold">${saldoPendiente}</h2>
        </div>

        <div className="bg-white p-4 rounded-xl shadow">
          <p className="text-sm text-gray-500">Pagos realizados</p>
          <h2 className="text-2xl font-bold">{pagosRealizados}</h2>
        </div>

        <div className="bg-white p-4 rounded-xl shadow">
          <p className="text-sm text-gray-500">Próximo pago</p>
          <h2 className="text-2xl font-bold">
            {proximoPago?.concepto || "Sin pendientes"}
          </h2>
        </div>

      </div>

      {/* 🔥 HISTORIAL */}
      <div className="bg-white p-6 rounded-xl shadow">
        <h2 className="font-semibold mb-4">Historial de pagos</h2>

        <table className="w-full text-left">
          <thead>
            <tr className="text-gray-500 border-b">
              <th>Concepto</th>
              <th>Monto</th>
              <th>Estado</th>
            </tr>
          </thead>

          <tbody>
            {pagos.map((p, i) => (
              <tr key={i} className="border-b">
                <td>{p.concepto}</td>
                <td>${p.monto}</td>
                <td>
                  {p.pagadoEn ? (
                    <span className="text-green-600">Pagado</span>
                  ) : (
                    <span className="text-yellow-600">Pendiente</span>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* 🔥 PRÓXIMO */}
      {proximoPago && (
        <div className="bg-yellow-50 p-4 rounded-xl border">
          <p className="font-semibold">{proximoPago.concepto}</p>
          <p>${proximoPago.monto}</p>
        </div>
      )}

    </div>
  );
}