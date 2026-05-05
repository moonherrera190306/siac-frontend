"use client";

import { useEffect, useState } from "react";

export default function CajaPagosPendientesPage() {
  const [pagos, setPagos] = useState<any[]>([]);

  const token =
    typeof window !== "undefined" ? localStorage.getItem("token") : null;

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

  useEffect(() => {
    fetchPagos();
  }, []);

  // 🔥 SOLO PENDIENTES
  const pendientes = pagos.filter((p) => !p.pagadoEn);

  // 💰 PAGAR
  const pagar = async (id: string) => {
    await fetch(`http://localhost:4000/api/pagos/pagar/${id}`, {
      method: "PUT",
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    fetchPagos();
  };

  return (
    <div className="space-y-6">

      <section className="bg-white p-6 rounded-2xl shadow">
        <h1 className="text-3xl font-bold">Pagos pendientes</h1>
        <p className="text-gray-500">
          Alumnos con adeudo activo
        </p>
      </section>

      <section className="bg-white p-6 rounded-2xl shadow">

        <table className="w-full text-left">

          <thead>
            <tr className="border-b text-gray-500">
              <th>Alumno</th>
              <th>Concepto</th>
              <th>Monto</th>
              <th>Estado</th>
              <th>Acción</th>
            </tr>
          </thead>

          <tbody>
            {pendientes.map((p) => (
              <tr key={p.id} className="border-b">

                <td className="font-medium">
                  {p.alumno?.user?.name}
                </td>

                <td>{p.concepto}</td>

                <td>${p.monto}</td>

                <td>
                  <span className="bg-yellow-100 text-yellow-700 px-2 py-1 rounded">
                    Pendiente
                  </span>
                </td>

                <td>
                  <button
                    onClick={() => pagar(p.id)}
                    className="bg-green-600 text-white px-3 py-2 rounded"
                  >
                    Registrar pago
                  </button>
                </td>

              </tr>
            ))}
          </tbody>

        </table>

      </section>
    </div>
  );
}