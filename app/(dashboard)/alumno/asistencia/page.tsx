"use client";

import { useEffect, useState } from "react";
import { API_URL } from "@/lib/config";

const COLOR: Record<string, string> = {
  PRESENTE: "bg-green-100 text-green-700",
  RETARDO: "bg-amber-100 text-amber-700",
  JUSTIFICADO: "bg-blue-100 text-blue-700",
  FALTA: "bg-red-100 text-red-700",
};

export default function AlumnoAsistenciaPage() {
  const [resumen, setResumen] = useState<any[]>([]);
  const [detalle, setDetalle] = useState<any[]>([]);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const cargar = async () => {
      try {
        const guardado = localStorage.getItem("user");

        if (!guardado) {
          window.location.href = "/login";
          return;
        }

        const user = JSON.parse(guardado);
        const alumnoId = user?.alumnoId || user?.id;

        const res = await fetch(
          `${API_URL}/api/asistencias/alumno/${alumnoId}`,
          { credentials: "include" }
        );

        const json = await res.json();

        if (!res.ok) {
          throw new Error(json?.message || "Error al cargar la asistencia");
        }

        setResumen(json?.data?.resumen ?? []);
        setDetalle(json?.data?.detalle ?? []);
      } catch (e: any) {
        setError(e.message || "Error al cargar la asistencia");
      } finally {
        setLoading(false);
      }
    };

    cargar();
  }, []);

  if (loading) return <p className="p-6">Cargando...</p>;

  const conDato = resumen.filter((r) => r.porcentaje !== null);

  const global =
    conDato.length === 0
      ? null
      : (
          conDato.reduce((acc, r) => acc + Number(r.porcentaje), 0) /
          conDato.length
        ).toFixed(1);

  const totalFaltas = resumen.reduce(
    (acc, r) =>
      acc + r.faltasMes1 + r.faltasMes2 + r.faltasMes3 + r.faltasMes4,
    0
  );

  return (
    <div className="space-y-6">
      <section className="rounded-3xl border bg-white p-6 shadow-sm">
        <h1 className="text-3xl font-bold">Mi asistencia</h1>

        <p className="text-gray-500">
          {global === null
            ? "Todavía no hay asistencia registrada"
            : `${global}% de asistencia · ${totalFaltas} falta(s)`}
        </p>
      </section>

      {error && (
        <p className="rounded-xl bg-red-50 p-4 text-red-600">{error}</p>
      )}

      {resumen.length === 0 && !error && (
        <div className="rounded-3xl border bg-white p-8 text-center text-gray-500">
          Tus maestros todavía no han registrado asistencia.
        </div>
      )}

      {resumen.length > 0 && (
        <section className="overflow-x-auto rounded-3xl border bg-white shadow-sm">
          <h2 className="border-b px-5 py-4 text-lg font-semibold">
            Acumulado por materia
          </h2>

          <table className="w-full text-left text-sm">
            <thead className="bg-gray-50 text-gray-600">
              <tr>
                <th className="px-4 py-3">Materia</th>
                <th className="px-3 py-3 text-center">Mes 1</th>
                <th className="px-3 py-3 text-center">Mes 2</th>
                <th className="px-3 py-3 text-center">Mes 3</th>
                <th className="px-3 py-3 text-center">Mes 4</th>
                <th className="px-3 py-3 text-center">Faltas</th>
                <th className="px-3 py-3 text-center">%</th>
              </tr>
            </thead>

            <tbody>
              {resumen.map((r) => {
                const faltas =
                  r.faltasMes1 + r.faltasMes2 + r.faltasMes3 + r.faltasMes4;

                return (
                  <tr key={r.id} className="border-t">
                    <td className="px-4 py-2 font-medium">
                      {r.materia?.nombre}
                    </td>

                    <td className="px-3 py-2 text-center">{r.asisMes1}</td>
                    <td className="px-3 py-2 text-center">{r.asisMes2}</td>
                    <td className="px-3 py-2 text-center">{r.asisMes3}</td>
                    <td className="px-3 py-2 text-center">{r.asisMes4}</td>

                    <td className="px-3 py-2 text-center">{faltas}</td>

                    <td className="px-3 py-2 text-center">
                      <span
                        className={`rounded-full px-2 py-1 text-xs ${
                          r.porcentaje === null
                            ? "bg-gray-100 text-gray-600"
                            : r.porcentaje < 80
                            ? "bg-red-100 text-red-700"
                            : r.porcentaje < 90
                            ? "bg-amber-100 text-amber-700"
                            : "bg-green-100 text-green-700"
                        }`}
                      >
                        {r.porcentaje === null ? "—" : `${r.porcentaje}%`}
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </section>
      )}

      {detalle.length > 0 && (
        <section className="overflow-x-auto rounded-3xl border bg-white shadow-sm">
          <h2 className="border-b px-5 py-4 text-lg font-semibold">
            Últimas clases
          </h2>

          <table className="w-full text-left text-sm">
            <thead className="bg-gray-50 text-gray-600">
              <tr>
                <th className="px-4 py-3">Fecha</th>
                <th className="px-4 py-3">Materia</th>
                <th className="px-4 py-3">Tema</th>
                <th className="px-4 py-3">Estado</th>
              </tr>
            </thead>

            <tbody>
              {detalle.slice(0, 40).map((d) => (
                <tr key={d.id} className="border-t">
                  <td className="px-4 py-2">
                    {d.clase?.fecha
                      ? new Date(d.clase.fecha).toLocaleDateString("es-MX")
                      : "—"}
                  </td>

                  <td className="px-4 py-2">
                    {d.clase?.asignacion?.materia?.nombre || "—"}
                  </td>

                  <td className="px-4 py-2 text-gray-500">
                    {d.clase?.tema || "—"}
                  </td>

                  <td className="px-4 py-2">
                    <span
                      className={`rounded-full px-2 py-1 text-xs ${
                        COLOR[d.estado] || "bg-gray-100 text-gray-600"
                      }`}
                    >
                      {d.estado}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </section>
      )}
    </div>
  );
}
