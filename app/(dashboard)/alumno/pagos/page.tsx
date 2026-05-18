"use client";

import { useEffect, useState } from "react";

export default function AlumnoPagosPage() {
  const [pagos, setPagos] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchPagos = async () => {
      try {
        setLoading(true);

        const token =
          localStorage.getItem("token");

        const user = JSON.parse(
          localStorage.getItem("user") || "{}"
        );

        const alumnoId =
          user?.alumnoId ||
          user?.id;

        if (!token) {
          throw new Error(
            "Token inválido"
          );
        }

        if (!alumnoId) {
          throw new Error(
            "Alumno no encontrado"
          );
        }

        const res = await fetch(
          `http://localhost:4000/api/pagos/${alumnoId}`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        const response =
          await res.json();

        console.log(
          "PAGOS:",
          response
        );

        if (!res.ok) {
          throw new Error(
            response?.message ||
              "Error cargando pagos"
          );
        }

        const data =
          response?.data || [];

        if (!Array.isArray(data)) {
          console.error(
            "Backend no regresó array:",
            data
          );

          setPagos([]);
          return;
        }

        setPagos(data);

      } catch (err: any) {
        console.error(err);

        setError(
          err?.message ||
            "Error cargando pagos"
        );

        setPagos([]);
      } finally {
        setLoading(false);
      }
    };

    fetchPagos();
  }, []);

  if (loading) {
    return (
      <p className="p-6">
        Cargando pagos...
      </p>
    );
  }

  if (error) {
    return (
      <div className="p-6">
        <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-red-700">
          {error}
        </div>
      </div>
    );
  }

  // ==================================
  // MÉTRICAS
  // ==================================

  const pagosRealizados =
    (pagos ?? []).filter(
      (p) => p?.pagadoEn
    ).length;

  const saldoPendiente =
    (pagos ?? [])
      .filter(
        (p) => !p?.pagadoEn
      )
      .reduce(
        (acc, p) =>
          acc +
          Number(
            p?.monto || 0
          ),
        0
      );

  const proximoPago =
    (pagos ?? []).find(
      (p) => !p?.pagadoEn
    );

  return (
    <div className="space-y-6 p-6">

      {/* HEADER */}
      <section className="bg-white p-6 rounded-2xl shadow">
        <h1 className="text-3xl font-bold">
          Pagos
        </h1>

        <p className="text-gray-500">
          Consulta tu historial financiero
        </p>
      </section>

      {/* RESUMEN */}
      <section className="grid md:grid-cols-3 gap-4">

        <div className="bg-white p-4 rounded-xl shadow">
          <p className="text-sm text-gray-500">
            Saldo pendiente
          </p>

          <h2 className="text-2xl font-bold">
            $
            {saldoPendiente.toFixed(
              2
            )}
          </h2>
        </div>

        <div className="bg-white p-4 rounded-xl shadow">
          <p className="text-sm text-gray-500">
            Pagos realizados
          </p>

          <h2 className="text-2xl font-bold">
            {pagosRealizados}
          </h2>
        </div>

        <div className="bg-white p-4 rounded-xl shadow">
          <p className="text-sm text-gray-500">
            Próximo pago
          </p>

          <h2 className="text-xl font-bold">
            {proximoPago?.concepto ||
              "Sin pendientes"}
          </h2>
        </div>

      </section>

      {/* HISTORIAL */}
      <section className="bg-white p-6 rounded-2xl shadow">

        <h2 className="font-semibold mb-4">
          Historial de pagos
        </h2>

        {(pagos ?? []).length ===
        0 ? (
          <p className="text-gray-500">
            No hay pagos registrados
          </p>
        ) : (
          <div className="overflow-x-auto">

            <table className="w-full text-left">

              <thead>
                <tr className="text-gray-500 border-b">
                  <th className="py-3">
                    Concepto
                  </th>

                  <th className="py-3">
                    Monto
                  </th>

                  <th className="py-3">
                    Estado
                  </th>

                  <th className="py-3">
                    Fecha
                  </th>
                </tr>
              </thead>

              <tbody>

                {(pagos ?? []).map(
                  (p, i) => (
                    <tr
                      key={
                        p?.id || i
                      }
                      className="border-b"
                    >
                      <td className="py-3">
                        {p?.concepto ||
                          "Pago"}
                      </td>

                      <td className="py-3">
                        $
                        {Number(
                          p?.monto || 0
                        ).toFixed(2)}
                      </td>

                      <td className="py-3">

                        {p?.pagadoEn ? (
                          <span className="text-green-600 font-medium">
                            Pagado
                          </span>
                        ) : (
                          <span className="text-yellow-600 font-medium">
                            Pendiente
                          </span>
                        )}

                      </td>

                      <td className="py-3">
                        {p?.pagadoEn
                          ? new Date(
                              p.pagadoEn
                            ).toLocaleDateString()
                          : "-"}
                      </td>
                    </tr>
                  )
                )}

              </tbody>

            </table>

          </div>
        )}

      </section>

      {/* PRÓXIMO PAGO */}
      {proximoPago && (
        <section className="bg-yellow-50 border border-yellow-200 p-4 rounded-xl">

          <p className="font-semibold text-yellow-800">
            Próximo pago pendiente
          </p>

          <p className="mt-2">
            {proximoPago?.concepto}
          </p>

          <p className="font-bold">
            $
            {Number(
              proximoPago?.monto || 0
            ).toFixed(2)}
          </p>

        </section>
      )}

    </div>
  );
}