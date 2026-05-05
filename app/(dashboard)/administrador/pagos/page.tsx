"use client";

import { useEffect, useState } from "react";

export default function AdministradorPagosPage() {
  const [pagos, setPagos] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const token =
    typeof window !== "undefined"
      ? localStorage.getItem("token")
      : null;

  useEffect(() => {
    if (!token) {
      window.location.href = "/login";
      return;
    }

    const fetchPagos = async () => {
      try {
        const res = await fetch(
          "http://localhost:4000/api/pagos",
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        const data = await res.json();

        const formateados = data.map((p: any) => ({
          id: p.id,
          alumno: p.alumno?.user?.name || "N/A",
          concepto: p.concepto,
          monto: `$${p.monto}`,
          estado: "Pagado", // por ahora todos los registrados son pagados
        }));

        setPagos(formateados);

      } catch (error) {
        console.error(error);
        alert("Error cargando pagos");
      } finally {
        setLoading(false);
      }
    };

    fetchPagos();
  }, []);

  if (loading) return <p className="p-6">Cargando...</p>;

  return (
    <div className="space-y-6">

      {/* HEADER */}
      <section className="flex flex-col gap-4 rounded-2xl border bg-white p-6 shadow-sm md:flex-row md:justify-between">
        <div>
          <h1 className="text-3xl font-bold">Pagos</h1>
          <p className="text-gray-500">
            Control financiero
          </p>
        </div>

        <button
          onClick={() => alert("Registrar pago")}
          className="bg-slate-900 text-white px-4 py-2 rounded-xl"
        >
          Registrar pago
        </button>
      </section>

      {/* TABLA */}
      <section className="bg-white p-6 rounded-2xl shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left">

            <thead>
              <tr className="border-b text-gray-500">
                <th className="py-3">Alumno</th>
                <th>Concepto</th>
                <th>Monto</th>
                <th>Estado</th>
                <th>Acciones</th>
              </tr>
            </thead>

            <tbody>
              {pagos.map((p) => (
                <tr key={p.id} className="border-b">

                  <td className="py-4 font-medium">
                    {p.alumno}
                  </td>

                  <td>{p.concepto}</td>

                  <td>{p.monto}</td>

                  <td>
                    <span className="bg-green-100 text-green-700 px-3 py-1 rounded-full text-sm">
                      {p.estado}
                    </span>
                  </td>

                  <td>
                    <div className="flex gap-2">

                      <button
                        onClick={() =>
                          alert(JSON.stringify(p, null, 2))
                        }
                        className="bg-gray-100 px-3 py-1 rounded"
                      >
                        Ver
                      </button>

                      <button
                        onClick={() =>
                          alert("Editar pago")
                        }
                        className="bg-gray-100 px-3 py-1 rounded"
                      >
                        Editar
                      </button>

                    </div>
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