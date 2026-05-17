"use client";

import { useEffect, useState } from "react";

export default function CajaDashboardPage() {
  const [pagos, setPagos] = useState<any[]>([]);

  useEffect(() => {
    const fetchPagos = async () => {
      const token = localStorage.getItem("token");

      const res = await fetch("https://siac-backend-production.up.railway.app/api/pagos", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await res.json();

      if (Array.isArray(data)) {
        setPagos(data);
      }
    };

    fetchPagos();
  }, []);

  // 🔥 MÉTRICAS REALES

  const hoy = new Date().toDateString();

  const cobrosHoy = pagos
    .filter((p) => new Date(p.pagadoEn).toDateString() === hoy)
    .reduce((acc, p) => acc + p.monto, 0);

  const movimientosHoy = pagos.filter(
    (p) => new Date(p.pagadoEn).toDateString() === hoy
  ).length;

  const pagosPendientes = pagos.filter((p) => !p.pagadoEn).length;

  const recibosEmitidos = pagos.length;

  // 🔥 MOVIMIENTOS RECIENTES
  const recientes = pagos.slice(0, 5);

  const accesos = [
    "Registrar cobro",
    "Consultar pagos pendientes",
    "Generar recibo",
    "Ver historial",
  ];

  return (
    <div className="space-y-6">

      <section className="bg-white p-6 rounded-2xl shadow-sm">
        <h1 className="text-3xl font-bold">Dashboard de Caja</h1>
        <p className="text-gray-500">
          Control general de cobros y movimientos
        </p>
      </section>

      {/* 🔥 RESUMEN */}
      <section className="grid md:grid-cols-4 gap-4">

        <div className="bg-white p-5 rounded-xl shadow">
          <p className="text-sm text-gray-500">Cobros del día</p>
          <h2 className="text-2xl font-bold">${cobrosHoy}</h2>
        </div>

        <div className="bg-white p-5 rounded-xl shadow">
          <p className="text-sm text-gray-500">Pagos pendientes</p>
          <h2 className="text-2xl font-bold">{pagosPendientes}</h2>
        </div>

        <div className="bg-white p-5 rounded-xl shadow">
          <p className="text-sm text-gray-500">Recibos emitidos</p>
          <h2 className="text-2xl font-bold">{recibosEmitidos}</h2>
        </div>

        <div className="bg-white p-5 rounded-xl shadow">
          <p className="text-sm text-gray-500">Movimientos hoy</p>
          <h2 className="text-2xl font-bold">{movimientosHoy}</h2>
        </div>

      </section>

      {/* 🔥 MOVIMIENTOS */}
      <section className="grid xl:grid-cols-3 gap-6">

        <div className="xl:col-span-2 bg-white p-6 rounded-2xl shadow">

          <h2 className="text-xl font-semibold">
            Movimientos recientes
          </h2>

          <div className="mt-4 space-y-3">

            {recientes.map((p) => (
              <div
                key={p.id}
                className="bg-gray-50 p-4 rounded-xl border"
              >
                <div className="flex justify-between">

                  <div>
                    <p className="font-semibold">
                      {p.alumno?.user?.name}
                    </p>
                    <p className="text-sm text-gray-500">
                      {p.concepto}
                    </p>
                  </div>

                  <div className="text-right">
                    <p className="font-bold">${p.monto}</p>
                    <p className="text-xs text-gray-400">
                      {p.pagadoEn
                        ? new Date(p.pagadoEn).toLocaleTimeString()
                        : "-"}
                    </p>
                  </div>

                </div>
              </div>
            ))}

          </div>
        </div>

        {/* 🔥 ACCESOS */}
        <div className="bg-white p-6 rounded-2xl shadow">
          <h2 className="text-xl font-semibold">
            Accesos rápidos
          </h2>

          <div className="mt-4 space-y-3">
            {accesos.map((item, i) => (
              <button
                key={i}
                className="w-full bg-slate-900 text-white p-3 rounded-xl hover:bg-slate-800"
              >
                {item}
              </button>
            ))}
          </div>
        </div>

      </section>
    </div>
  );
}