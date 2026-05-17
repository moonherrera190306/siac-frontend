"use client";

import { useEffect, useState } from "react";

export default function PagosPage() {
  const [alumnos, setAlumnos] = useState<any[]>([]);
  const [selectedAlumno, setSelectedAlumno] = useState<any>(null);
  const [pagos, setPagos] = useState<any[]>([]);

  const [form, setForm] = useState({
    concepto: "",
    monto: ""
  });

  const token =
    typeof window !== "undefined" ? localStorage.getItem("token") : null;

  // 🔍 cargar alumnos
  const fetchAlumnos = async () => {
    const res = await fetch("https://siac-backend-production.up.railway.app/api/alumnos", {
      headers: { Authorization: `Bearer ${token}` }
    });
    const data = await res.json();
    setAlumnos(data);
  };

  // 📄 cargar pagos
  const fetchPagos = async (alumnoId: string) => {
    const res = await fetch(`https://siac-backend-production.up.railway.app/api/pagos/${alumnoId}`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    const data = await res.json();
    setPagos(data);
  };

  useEffect(() => {
    fetchAlumnos();
  }, []);

  // 💰 registrar pago
  const handleSubmit = async (e: any) => {
    e.preventDefault();

    await fetch("https://siac-backend-production.up.railway.app/api/pagos", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`
      },
      body: JSON.stringify({
        alumnoId: selectedAlumno.id,
        concepto: form.concepto,
        monto: parseFloat(form.monto)
      })
    });

    setForm({ concepto: "", monto: "" });
    fetchPagos(selectedAlumno.id);
  };

  // 🔥 cálculos
  const totalPagado = pagos.reduce((acc, p) => acc + p.monto, 0);

  return (
    <div className="p-6 space-y-6">

      <h1 className="text-2xl font-bold">Caja / Pagos</h1>

      {/* 🔍 seleccionar alumno */}
      <div className="bg-white p-4 rounded shadow">
        <h2 className="font-semibold mb-2">Seleccionar alumno</h2>

        <select
          className="border p-2 w-full"
          onChange={(e) => {
            const alumno = alumnos.find(a => a.id === e.target.value);
            setSelectedAlumno(alumno);
            fetchPagos(alumno.id);
          }}
        >
          <option>Selecciona un alumno</option>
          {alumnos.map((a) => (
            <option key={a.id} value={a.id}>
              {a.user.name} - {a.matricula}
            </option>
          ))}
        </select>
      </div>

      {/* 📊 resumen */}
      {selectedAlumno && (
        <div className="grid md:grid-cols-3 gap-4">
          <div className="bg-white p-4 rounded shadow">
            <p>Total pagado</p>
            <h2 className="text-xl font-bold">${totalPagado}</h2>
          </div>

          <div className="bg-white p-4 rounded shadow">
            <p>Pagos registrados</p>
            <h2 className="text-xl font-bold">{pagos.length}</h2>
          </div>

          <div className="bg-white p-4 rounded shadow">
            <p>Alumno</p>
            <h2 className="text-xl font-bold">
              {selectedAlumno.user.name}
            </h2>
          </div>
        </div>
      )}

      {/* 💰 registrar pago */}
      {selectedAlumno && (
        <div className="bg-white p-4 rounded shadow">
          <h2 className="font-semibold mb-2">
            Registrar pago
          </h2>

          <form onSubmit={handleSubmit} className="space-y-2">
            <input
              placeholder="Concepto"
              value={form.concepto}
              onChange={(e) =>
                setForm({ ...form, concepto: e.target.value })
              }
              className="border p-2 w-full"
            />

            <input
              placeholder="Monto"
              value={form.monto}
              onChange={(e) =>
                setForm({ ...form, monto: e.target.value })
              }
              className="border p-2 w-full"
            />

            <button className="bg-green-600 text-white px-4 py-2 rounded">
              Registrar pago
            </button>
          </form>
        </div>
      )}

      {/* 📄 historial */}
      {pagos.length > 0 && (
        <div className="bg-white p-4 rounded shadow">
          <h2 className="font-semibold mb-2">Historial</h2>

          <table className="w-full text-sm">
            <thead>
              <tr>
                <th>Concepto</th>
                <th>Monto</th>
                <th>Fecha</th>
                <th>Estado</th>
              </tr>
            </thead>

            <tbody>
              {pagos.map((p) => (
                <tr key={p.id}>
                  <td>{p.concepto}</td>
                  <td>${p.monto}</td>
                  <td>
                    {p.pagadoEn
                      ? new Date(p.pagadoEn).toLocaleDateString()
                      : "-"}
                  </td>
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
      )}
    </div>
  );
}