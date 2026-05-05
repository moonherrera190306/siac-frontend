"use client";

import { useEffect, useState } from "react";

export default function AlumnosPage() {
  const [alumnos, setAlumnos] = useState<any[]>([]);
  const [editing, setEditing] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [form, setForm] = useState({
    name: "",
    email: "",
    matricula: "",
  });

  // 🔄 GET
  const fetchAlumnos = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem("token");

      const res = await fetch("http://127.0.0.1:4000/api/alumnos", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const json = await res.json();

      if (!res.ok) throw new Error(json.message);

      setAlumnos(json.data); // 🔥 importante
    } catch (err: any) {
      console.error(err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAlumnos();
  }, []);

  // ➕ / ✏️ CREATE - UPDATE
  const handleSubmit = async (e: any) => {
    e.preventDefault();

    try {
      const token = localStorage.getItem("token");

      if (!form.name || !form.email || !form.matricula) {
        return alert("Todos los campos son obligatorios");
      }

      const url = editing
        ? `http://127.0.0.1:4000/api/alumnos/${editing.id}`
        : "http://127.0.0.1:4000/api/alumnos";

      const method = editing ? "PUT" : "POST";

      const res = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(form),
      });

      const json = await res.json();

      if (!res.ok) throw new Error(json.message);

      setEditing(null);
      setForm({ name: "", email: "", matricula: "" });

      fetchAlumnos();
    } catch (err: any) {
      console.error(err);
      alert(err.message);
    }
  };

  // 🗑️ DELETE
  const handleDelete = async (id: string) => {
    if (!confirm("¿Eliminar alumno?")) return;

    try {
      const token = localStorage.getItem("token");

      const res = await fetch(
        `http://127.0.0.1:4000/api/alumnos/${id}`,
        {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const json = await res.json();

      if (!res.ok) throw new Error(json.message);

      fetchAlumnos();
    } catch (err: any) {
      console.error(err);
      alert(err.message);
    }
  };

  // ✏️ EDIT
  const handleEdit = (alumno: any) => {
    setEditing(alumno);

    setForm({
      name: alumno.user?.name || "",
      email: alumno.user?.email || "",
      matricula: alumno.matricula || "",
    });
  };

  return (
    <div className="p-6 space-y-6">
      {/* HEADER */}
      <div>
        <h1 className="text-2xl font-bold">Gestión de Alumnos</h1>
        <p className="text-gray-500">Registro y administración</p>
      </div>

      {/* ERROR */}
      {error && (
        <p className="text-red-500 bg-red-50 p-3 rounded">{error}</p>
      )}

      {/* FORM */}
      <div className="bg-white p-4 rounded-xl shadow space-y-3">
        <h2 className="font-semibold">
          {editing ? "Editar Alumno" : "Nuevo Alumno"}
        </h2>

        <form onSubmit={handleSubmit} className="grid grid-cols-3 gap-3">
          <input
            placeholder="Nombre"
            value={form.name}
            onChange={(e) =>
              setForm({ ...form, name: e.target.value })
            }
            className="border p-2 rounded"
          />

          <input
            placeholder="Email"
            value={form.email}
            onChange={(e) =>
              setForm({ ...form, email: e.target.value })
            }
            className="border p-2 rounded"
          />

          <input
            placeholder="Matrícula"
            value={form.matricula}
            onChange={(e) =>
              setForm({ ...form, matricula: e.target.value })
            }
            className="border p-2 rounded"
          />

          <button className="col-span-3 bg-blue-600 text-white py-2 rounded hover:bg-blue-700">
            {editing ? "Actualizar Alumno" : "Crear Alumno"}
          </button>
        </form>
      </div>

      {/* TABLA */}
      <div className="bg-white rounded-xl p-4 shadow">
        <h2 className="font-semibold mb-3">Lista de alumnos</h2>

        {loading ? (
          <p>Cargando...</p>
        ) : (
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="border-b text-gray-500">
                <th className="py-2">Nombre</th>
                <th>Email</th>
                <th>Matrícula</th>
                <th className="text-right">Acciones</th>
              </tr>
            </thead>

            <tbody>
              {alumnos.map((a) => (
                <tr key={a.id} className="border-b hover:bg-gray-50">
                  <td className="py-2">{a.user?.name}</td>
                  <td>{a.user?.email}</td>
                  <td>{a.matricula}</td>

                  <td className="text-right space-x-2">
                    <button
                      onClick={() => handleEdit(a)}
                      className="bg-yellow-400 text-white px-3 py-1 rounded"
                    >
                      Editar
                    </button>

                    <button
                      onClick={() => handleDelete(a.id)}
                      className="bg-red-500 text-white px-3 py-1 rounded"
                    >
                      Eliminar
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}