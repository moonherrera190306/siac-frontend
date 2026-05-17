"use client";

import { useEffect, useState } from "react";

export default function CajaHistorialPage() {
  const [pagos, setPagos] = useState<any[]>([]);
  const [search, setSearch] = useState("");
  const [fecha, setFecha] = useState("");

  const token =
    typeof window !== "undefined" ? localStorage.getItem("token") : null;

  useEffect(() => {
    const fetchPagos = async () => {
      const res = await fetch("http://localhost:4000/api/pagos", {
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

  // 🔥 FILTROS
  const filtrados = pagos.filter((p) => {
    const texto =
      p.alumno?.user?.name?.toLowerCase() +
      p.concepto?.toLowerCase();

    const coincideTexto = texto.includes(search.toLowerCase());

    const coincideFecha = fecha
      ? new Date(p.pagadoEn).toISOString().slice(0, 10) === fecha
      : true;

    return coincideTexto && coincideFecha;
  });

  return (
    <div className="space-y-6">

      <section className="bg-white p-6 rounded-2xl shadow">
        <h1 className="text-3xl font-bold">Historial</h1>
        <p className="text-gray-500">
          Movimientos financieros del sistema
        </p>
      </section>

      <section className="bg-white p-6 rounded-2xl shadow">

        {/* 🔍 FILTROS */}
        <div className="flex flex-col md:flex-row gap-3 mb-4">

          <input
            type="text"
            placeholder="Buscar alumno o concepto..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="border p-2 rounded w-full"
          />

          <input
            type="date"
            value={fecha}
            onChange={(e) => setFecha(e.target.value)}
            className="border p-2 rounded"
          />

        </div>

        {/* 📄 TABLA */}
        <div className="overflow-x-auto">
          <table className="w-full text-left">

            <thead>
              <tr className="border-b text-gray-500">
                <th>Fecha</th>
                <th>Alumno</th>
                <th>Concepto</th>
                <th>Monto</th>
                <th>Estado</th>
              </tr>
            </thead>

            <tbody>
              {filtrados.map((p) => (
                <tr key={p.id} className="border-b">

                  <td>
                    {p.pagadoEn
                      ? new Date(p.pagadoEn).toLocaleDateString()
                      : "-"}
                  </td>

                  <td className="font-medium">
                    {p.alumno?.user?.name}
                  </td>

                  <td>{p.concepto}</td>

                  <td>${p.monto}</td>

                  <td>
                    {p.pagadoEn ? (
                      <span className="text-green-600">
                        Pagado
                      </span>
                    ) : (
                      <span className="text-yellow-600">
                        Pendiente
                      </span>
                    )}
                  </td>

                </tr>
              ))}
            </tbody>

          </table>
        </div>

      </section>
    </div>
  );
}