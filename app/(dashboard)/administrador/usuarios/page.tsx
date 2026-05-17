"use client";

import { useEffect, useState } from "react";
import { apiFetch } from "@/lib/apiClient";

type Usuario = {
  id: string;
  name: string;
  email: string;
  role: string;
  activo?: boolean;
};

export default function AdministradorUsuariosPage() {
  const [usuarios, setUsuarios] = useState<Usuario[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    async function cargarUsuarios() {
      try {
        setLoading(true);
        setError("");

        const data = await apiFetch("/api/admin/usuarios");

        const listaUsuarios = Array.isArray(data)
          ? data
          : Array.isArray(data?.usuarios)
          ? data.usuarios
          : Array.isArray(data?.data)
          ? data.data
          : [];

        setUsuarios(listaUsuarios);
      } catch (err: any) {
        console.error("Error cargando usuarios:", err);
        setError(err.message || "Error cargando usuarios");
      } finally {
        setLoading(false);
      }
    }

    cargarUsuarios();
  }, []);

  if (loading) {
    return <p className="p-6">Cargando usuarios...</p>;
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
        {usuarios.length === 0 ? (
          <p className="text-gray-500">No hay usuarios registrados.</p>
        ) : (
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
                {(usuarios ?? []).map((u) => (
                  <tr key={u.id} className="border-b">
                    <td className="py-3">{u.name ?? "Sin nombre"}</td>
                    <td className="py-3">{u.email ?? "Sin correo"}</td>
                    <td className="py-3">{u.role ?? "Sin rol"}</td>
                    <td className="py-3">
                      <span
                        className={`rounded-full px-3 py-1 text-sm ${
                          u.activo ?? true
                            ? "bg-green-100 text-green-700"
                            : "bg-red-100 text-red-700"
                        }`}
                      >
                        {u.activo ?? true ? "Activo" : "Inactivo"}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </div>
  );
}