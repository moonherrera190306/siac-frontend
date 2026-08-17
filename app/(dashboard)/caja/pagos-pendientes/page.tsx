"use client";

import { useEffect, useState } from "react";
import { API_URL } from "@/lib/config";

export default function CajaPagosPendientesPage() {
  const [adeudos, setAdeudos] = useState<any[]>([]);
  const [meta, setMeta] = useState<any>({ total: 0, saldoTotal: 0 });

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [aviso, setAviso] = useState("");

  const [nuevo, setNuevo] = useState({
    alumnoId: "",
    descripcion: "",
    monto: "",
    fechaLimite: "",
  });

  const [alumnos, setAlumnos] = useState<any[]>([]);

  const cargar = async () => {
    try {
      setLoading(true);

      const [ra, ral] = await Promise.all([
        fetch(`${API_URL}/api/pagos/adeudos/lista?perPage=200`, {
          credentials: "include",
        }),
        fetch(`${API_URL}/api/alumnos?perPage=200`, { credentials: "include" }),
      ]);

      const [ja, jal] = await Promise.all([ra.json(), ral.json()]);

      if (!ra.ok) throw new Error(ja?.message || "Error al cargar adeudos");

      setAdeudos(ja?.data ?? []);
      setMeta(ja?.meta ?? { total: 0, saldoTotal: 0 });
      setAlumnos(jal?.data ?? []);
      setError("");
    } catch (e: any) {
      setError(e.message || "Error al cargar adeudos");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    cargar();
  }, []);

  const registrar = async () => {
    setError("");
    setAviso("");

    if (!nuevo.alumnoId || !nuevo.monto) {
      setError("El alumno y el monto son requeridos");
      return;
    }

    const res = await fetch(`${API_URL}/api/pagos/adeudos`, {
      method: "POST",
      credentials: "include",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(nuevo),
    });

    const json = await res.json();

    if (!res.ok) {
      setError(json?.message || "No se pudo registrar el adeudo");
      return;
    }

    setAviso("Adeudo registrado");
    setNuevo({ alumnoId: "", descripcion: "", monto: "", fechaLimite: "" });
    cargar();
  };

  if (loading) return <p className="p-6">Cargando...</p>;

  const hoy = new Date();

  return (
    <div className="space-y-6">
      <section className="rounded-3xl border bg-white p-6 shadow-sm">
        <h1 className="text-3xl font-bold">Adeudos</h1>

        <p className="text-gray-500">
          {meta.total ?? 0} adeudo(s) pendiente(s) · $
          {Number(meta.saldoTotal ?? 0).toFixed(2)} por cobrar
        </p>

        <p className="mt-2 text-sm text-gray-400">
          Un adeudo pendiente bloquea la consulta de calificaciones del alumno.
        </p>
      </section>

      {error && (
        <p className="rounded-xl bg-red-50 p-4 text-red-600">{error}</p>
      )}

      {aviso && (
        <p className="rounded-xl bg-green-50 p-4 text-green-700">{aviso}</p>
      )}

      <section className="rounded-3xl border bg-white p-5 shadow-sm">
        <h2 className="mb-3 font-semibold">Registrar adeudo</h2>

        <div className="grid gap-3 md:grid-cols-5">
          <select
            className="rounded-xl border border-gray-300 px-3 py-2 md:col-span-2"
            value={nuevo.alumnoId}
            onChange={(e) => setNuevo({ ...nuevo, alumnoId: e.target.value })}
          >
            <option value="">Alumno...</option>

            {alumnos.map((a) => (
              <option key={a.id} value={a.id}>
                {a.matricula} — {a.user?.name}
              </option>
            ))}
          </select>

          <input
            className="rounded-xl border border-gray-300 px-3 py-2"
            placeholder="Descripción"
            value={nuevo.descripcion}
            onChange={(e) => setNuevo({ ...nuevo, descripcion: e.target.value })}
          />

          <input
            type="number"
            step="0.01"
            className="rounded-xl border border-gray-300 px-3 py-2"
            placeholder="Monto"
            value={nuevo.monto}
            onChange={(e) => setNuevo({ ...nuevo, monto: e.target.value })}
          />

          <div className="flex gap-2">
            <input
              type="date"
              className="w-full rounded-xl border border-gray-300 px-3 py-2"
              value={nuevo.fechaLimite}
              onChange={(e) =>
                setNuevo({ ...nuevo, fechaLimite: e.target.value })
              }
            />

            <button
              onClick={registrar}
              className="rounded-xl bg-blue-600 px-4 py-2 text-white hover:bg-blue-700"
            >
              +
            </button>
          </div>
        </div>
      </section>

      {adeudos.length === 0 ? (
        <div className="rounded-3xl border bg-white p-8 text-center text-gray-500">
          No hay adeudos pendientes.
        </div>
      ) : (
        <div className="overflow-x-auto rounded-3xl border bg-white shadow-sm">
          <table className="w-full text-left text-sm">
            <thead className="bg-gray-50 text-gray-600">
              <tr>
                <th className="px-4 py-3">Alumno</th>
                <th className="px-4 py-3">Grupo</th>
                <th className="px-4 py-3">Concepto</th>
                <th className="px-4 py-3">Saldo</th>
                <th className="px-4 py-3">Vence</th>
                <th className="px-4 py-3"></th>
              </tr>
            </thead>

            <tbody>
              {adeudos.map((a) => {
                const vencido =
                  a.fechaLimite && new Date(a.fechaLimite) < hoy;

                return (
                  <tr key={a.id} className="border-t">
                    <td className="px-4 py-3">
                      {a.alumno?.user?.name}
                      <span className="block text-xs text-gray-400">
                        {a.alumno?.matricula}
                      </span>
                    </td>

                    <td className="px-4 py-3">{a.alumno?.grupo?.nombre || "—"}</td>

                    <td className="px-4 py-3">
                      {a.descripcion || a.concepto?.nombre || "Adeudo"}
                    </td>

                    <td className="px-4 py-3 font-semibold">
                      ${Number(a.saldo).toFixed(2)}
                    </td>

                    <td className="px-4 py-3">
                      {a.fechaLimite ? (
                        <span
                          className={
                            vencido
                              ? "rounded-full bg-red-100 px-3 py-1 text-xs text-red-700"
                              : "text-gray-600"
                          }
                        >
                          {new Date(a.fechaLimite).toLocaleDateString("es-MX")}
                        </span>
                      ) : (
                        "—"
                      )}
                    </td>

                    <td className="px-4 py-3">
                      <a
                        href="/caja/cobros"
                        className="rounded-lg border px-3 py-1 text-xs hover:bg-gray-50"
                      >
                        Cobrar
                      </a>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
