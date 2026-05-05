"use client";

import { useEffect, useState } from "react";

export default function AdministradorUsuariosPage() {
  const [usuarios, setUsuarios] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem("token");

    fetch("http://localhost:4000/api/admin/usuarios", {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })
      .then((res) => {
        console.log("STATUS:", res.status);
        return res.json();
      })
      .then((data) => {
        console.log("DATA:", data);
        setUsuarios(data);
      })
      .catch((err) => {
        console.error(err);
        alert("Error cargando usuarios");
      })
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <p className="p-6">Cargando...</p>;

  return (
    <div className="space-y-6">
      <section className="flex flex-col gap-4 rounded-2xl border border-gray-200 bg-white p-6 shadow-sm md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-800">Usuarios</h1>
          <p className="mt-2 text-gray-600">
            Administra los accesos y roles del sistema.
          </p>
        </div>

        <button className="rounded-xl bg-slate-900 px-4 py-2 text-sm font-medium text-white">
          Nuevo usuario
        </button>
      </section>

      <section className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="border-b text-sm text-gray-500">
                <th className="py-3">Nombre</th>
                <th className="py-3">Correo</th>
                <th className="py-3">Rol</th>
                <th className="py-3">Estado</th>
              </tr>
            </thead>

            <tbody>
              {usuarios.map((u) => (
                <tr key={u.id} className="border-b">
                  <td className="py-3">{u.name}</td>
                  <td className="py-3">{u.email}</td>
                  <td className="py-3">{u.role}</td>

                  <td className="py-3">
                    <span
                      className={`px-3 py-1 rounded-full text-sm ${
                        u.activo
                          ? "bg-green-100 text-green-700"
                          : "bg-red-100 text-red-700"
                      }`}
                    >
                      {u.activo ? "Activo" : "Inactivo"}
                    </span>
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