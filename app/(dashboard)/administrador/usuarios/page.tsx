"use client";

import { useEffect, useState } from "react";
import { API_URL } from "@/lib/config";
import { notificar } from "@/lib/notificar";
import { PageHeader, Card, TableWrap, Badge, Button, Vacio, Modal } from "@/components/ui";

const ROLES_STAFF = ["ADMIN", "DIRECTOR", "SECRETARIA", "CAJA"];

export default function AdministradorUsuariosPage() {
  const [usuarios, setUsuarios] = useState<any[]>([]);
  const [busqueda, setBusqueda] = useState("");

  const [abierto, setAbierto] = useState(false);
  const [nuevo, setNuevo] = useState({ name: "", email: "", role: "SECRETARIA" });
  const [guardando, setGuardando] = useState(false);

  const [loading, setLoading] = useState(true);

  const cargar = async () => {
    try {
      setLoading(true);

      const res = await fetch(`${API_URL}/api/admin/usuarios`, {
        credentials: "include",
      });

      const json = await res.json();

      if (!res.ok) throw new Error(json?.message || "Error al cargar usuarios");

      setUsuarios(Array.isArray(json) ? json : json?.data ?? []);
    } catch (e: any) {
      notificar(e.message || "Error al cargar usuarios", "error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    cargar();
  }, []);

  const crear = async () => {
    if (!nuevo.name || !nuevo.email) {
      notificar("El nombre y el correo son requeridos", "alerta");
      return;
    }

    setGuardando(true);

    const res = await fetch(`${API_URL}/api/admin/usuarios`, {
      method: "POST",
      credentials: "include",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(nuevo),
    });

    const json = await res.json();

    setGuardando(false);

    if (!res.ok) {
      notificar(json?.message || "No se pudo crear el usuario", "error");
      return;
    }

    // La contraseña temporal solo se muestra una vez.
    notificar(
      `Usuario creado. Contraseña temporal: ${json.passwordTemporal}`,
      "exito",
      15000
    );

    setNuevo({ name: "", email: "", role: "SECRETARIA" });
    setAbierto(false);
    cargar();
  };

  const cambiarEstado = async (u: any) => {
    const res = await fetch(`${API_URL}/api/admin/usuarios/${u.id}/estado`, {
      method: "PUT",
      credentials: "include",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ activo: !u.activo }),
    });

    const json = await res.json();

    if (!res.ok) {
      notificar(json?.message || "No se pudo cambiar el estado", "error");
      return;
    }

    notificar(u.activo ? "Usuario desactivado" : "Usuario activado", "exito");
    cargar();
  };

  const filtrados = usuarios.filter((u) => {
    const t = busqueda.trim().toLowerCase();
    if (!t) return true;
    return (
      (u.name || "").toLowerCase().includes(t) ||
      (u.email || "").toLowerCase().includes(t) ||
      (u.role || "").toLowerCase().includes(t)
    );
  });

  if (loading) return <p className="p-2 text-slate-500">Cargando...</p>;

  return (
    <>
      <PageHeader
        titulo="Usuarios"
        descripcion={`${usuarios.length} cuentas · administra los accesos y roles del sistema`}
      >
        <Button onClick={() => setAbierto(true)}>Nuevo usuario</Button>
      </PageHeader>

      <Card>
        <input
          className="w-full rounded-xl border border-slate-300 px-4 py-2"
          placeholder="Buscar por nombre, correo o rol"
          value={busqueda}
          onChange={(e) => setBusqueda(e.target.value)}
        />
      </Card>

      {filtrados.length === 0 ? (
        <Vacio titulo="No hay usuarios con ese filtro." />
      ) : (
        <TableWrap>
          <table className="w-full text-left text-sm">
            <thead className="bg-slate-50 text-slate-600">
              <tr>
                <th className="px-4 py-3">Nombre</th>
                <th className="px-4 py-3">Correo</th>
                <th className="px-4 py-3">Rol</th>
                <th className="px-4 py-3">Estado</th>
                <th className="px-4 py-3"></th>
              </tr>
            </thead>

            <tbody>
              {filtrados.map((u) => (
                <tr key={u.id} className="border-t border-slate-100">
                  <td className="px-4 py-3 font-medium">{u.name}</td>
                  <td className="px-4 py-3 text-slate-600">{u.email}</td>
                  <td className="px-4 py-3">{u.role}</td>

                  <td className="px-4 py-3">
                    <Badge tono={u.activo ? "bien" : "neutro"}>
                      {u.activo ? "Activo" : "Inactivo"}
                    </Badge>
                  </td>

                  <td className="px-4 py-3">
                    <Button
                      variante="secundario"
                      onClick={() => cambiarEstado(u)}
                    >
                      {u.activo ? "Desactivar" : "Activar"}
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </TableWrap>
      )}

      {abierto && (
        <Modal titulo="Nuevo usuario" onClose={() => setAbierto(false)}>
          <div className="space-y-3">
            <input
              className="w-full rounded-xl border border-slate-300 px-4 py-2"
              placeholder="Nombre completo"
              value={nuevo.name}
              onChange={(e) => setNuevo({ ...nuevo, name: e.target.value })}
            />

            <input
              type="email"
              className="w-full rounded-xl border border-slate-300 px-4 py-2"
              placeholder="correo@ceszam.mx"
              value={nuevo.email}
              onChange={(e) => setNuevo({ ...nuevo, email: e.target.value })}
            />

            <select
              className="w-full rounded-xl border border-slate-300 px-4 py-2"
              value={nuevo.role}
              onChange={(e) => setNuevo({ ...nuevo, role: e.target.value })}
            >
              {ROLES_STAFF.map((r) => (
                <option key={r} value={r}>
                  {r}
                </option>
              ))}
            </select>

            <p className="text-xs text-slate-500">
              Los alumnos se dan de alta en Alumnos y los maestros en Maestros:
              ahí se crea también su registro académico. La contraseña se genera
              sola y el usuario debe cambiarla al entrar.
            </p>

            <div className="flex justify-end gap-2 pt-2">
              <Button variante="secundario" onClick={() => setAbierto(false)}>
                Cancelar
              </Button>

              <Button onClick={crear} disabled={guardando}>
                {guardando ? "Creando..." : "Crear usuario"}
              </Button>
            </div>
          </div>
        </Modal>
      )}
    </>
  );
}
