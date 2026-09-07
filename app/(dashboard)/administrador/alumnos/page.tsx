"use client";

import { useEffect, useState } from "react";
import { API_URL } from "@/lib/config";
import { notificar } from "@/lib/notificar";
import { PageHeader, Card, TableWrap, Badge, Button, Vacio, Modal } from "@/components/ui";
import { BuscadorAlumnos, type CampoBusqueda } from "@/components/BuscadorAlumnos";

type Orden = "reciente" | "nombre" | "matricula";

const TONO_ESTATUS: Record<string, "bien" | "alerta" | "grave" | "info" | "neutro"> = {
  ACTIVO: "bien",
  BAJA_TEMPORAL: "alerta",
  BAJA_DEFINITIVA: "grave",
  EGRESADO: "info",
};

export default function AdministradorAlumnosPage() {
  const [alumnos, setAlumnos] = useState<any[]>([]);
  const [meta, setMeta] = useState<any>({ total: 0, pages: 1 });

  const [busqueda, setBusqueda] = useState("");
  const [campo, setCampo] = useState<CampoBusqueda>("apellido");
  const [orden, setOrden] = useState<Orden>("reciente");
  const [page, setPage] = useState(1);

  const [detalle, setDetalle] = useState<any>(null);
  const [editando, setEditando] = useState<any>(null);
  const [guardando, setGuardando] = useState(false);

  const [loading, setLoading] = useState(true);

  const cargar = async () => {
    try {
      setLoading(true);

      const params = new URLSearchParams({ page: String(page), perPage: "50", orden });

      if (busqueda.trim()) {
        params.set("search", busqueda.trim());
        params.set("campo", campo);
      }

      const res = await fetch(`${API_URL}/api/alumnos?${params}`, {
        credentials: "include",
      });

      const json = await res.json();

      if (!res.ok) throw new Error(json?.message || "Error al cargar alumnos");

      setAlumnos(json?.data ?? []);
      setMeta(json?.meta ?? { total: 0, pages: 1 });
    } catch (e: any) {
      notificar(e.message || "Error al cargar alumnos", "error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const t = setTimeout(cargar, 400);
    return () => clearTimeout(t);
  }, [page, busqueda, campo, orden]);

  const guardarEdicion = async () => {
    setGuardando(true);

    const res = await fetch(`${API_URL}/api/alumnos/${editando.id}`, {
      method: "PUT",
      credentials: "include",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name: editando.nombre,
        telefono: editando.telefono,
        direccion: editando.direccion,
        curp: editando.curp,
        tutorNombre: editando.tutorNombre,
        tutorTelefono: editando.tutorTelefono,
      }),
    });

    const json = await res.json();

    setGuardando(false);

    if (!res.ok) {
      notificar(json?.message || "No se pudo guardar", "error");
      return;
    }

    notificar("Alumno actualizado", "exito");
    setEditando(null);
    cargar();
  };

  // 🔒 No borra: da de baja. El expediente, las calificaciones
  // y los pagos deben conservarse.
  const darBaja = async (a: any) => {
    const motivo = window.prompt(`Motivo de la baja de ${a.user?.name}:`);

    if (!motivo) return;

    const res = await fetch(`${API_URL}/api/alumnos/${a.id}`, {
      method: "DELETE",
      credentials: "include",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ motivo }),
    });

    const json = await res.json();

    if (!res.ok) {
      notificar(json?.message || "No se pudo dar de baja", "error");
      return;
    }

    notificar("Alumno dado de baja", "exito");
    setDetalle(null);
    cargar();
  };

  if (loading && alumnos.length === 0) {
    return <p className="p-2 text-slate-500">Cargando...</p>;
  }

  return (
    <>
      <PageHeader
        titulo="Alumnos"
        descripcion={`${meta.total ?? 0} alumnos en el padrón`}
      >
        {/* El alta completa vive en Secretaría: ahí se asigna grupo,
            carrera, trayectoria e inscripción en el mismo paso. */}
        <a href="/secretaria/alumnos">
          <Button>Dar de alta en Secretaría</Button>
        </a>
      </PageHeader>

      <Card>
        <BuscadorAlumnos
          valor={busqueda}
          campo={campo}
          onValor={(v) => {
            setBusqueda(v);
            setPage(1);
          }}
          onCampo={(c) => {
            setCampo(c);
            setPage(1);
          }}
        >
          <select
            value={orden}
            onChange={(e) => {
              setOrden(e.target.value as Orden);
              setPage(1);
            }}
            aria-label="Ordenar por"
            className="rounded-xl border border-slate-300 px-3 py-2 text-sm"
          >
            <option value="reciente">Más recientes</option>
            <option value="nombre">Apellido (A–Z)</option>
            <option value="matricula">Matrícula</option>
          </select>
        </BuscadorAlumnos>

        <div className="mt-3 flex items-center justify-between text-sm text-slate-500">
          <span>
            Página {page} de {meta.pages || 1}
          </span>

          <div className="flex gap-2">
            <Button
              variante="secundario"
              disabled={page <= 1}
              onClick={() => setPage(page - 1)}
            >
              Anterior
            </Button>

            <Button
              variante="secundario"
              disabled={page >= (meta.pages || 1)}
              onClick={() => setPage(page + 1)}
            >
              Siguiente
            </Button>
          </div>
        </div>
      </Card>

      {alumnos.length === 0 ? (
        <Vacio titulo="No hay alumnos con ese filtro." />
      ) : (
        <TableWrap>
          <table className="w-full text-left text-sm">
            <thead className="bg-slate-50 text-slate-600">
              <tr>
                <th className="px-4 py-3">Matrícula</th>
                <th className="px-4 py-3">Alumno</th>
                <th className="px-4 py-3">Grupo</th>
                <th className="px-4 py-3">Carrera</th>
                <th className="px-4 py-3">Estatus</th>
                <th className="px-4 py-3"></th>
              </tr>
            </thead>

            <tbody>
              {alumnos.map((a) => (
                <tr key={a.id} className="border-t border-slate-100">
                  <td className="px-4 py-3 font-medium">{a.matricula}</td>

                  <td className="px-4 py-3">
                    {a.user?.name}
                    <span className="block text-xs text-slate-400">
                      {a.user?.email}
                    </span>
                  </td>

                  <td className="px-4 py-3">{a.grupo?.nombre ?? "Sin grupo"}</td>

                  <td className="px-4 py-3">{a.carrera?.nombre ?? "—"}</td>

                  <td className="px-4 py-3">
                    <Badge tono={TONO_ESTATUS[a.estatusAcademico] ?? "neutro"}>
                      {(a.estatusAcademico || "").replace("_", " ")}
                    </Badge>
                  </td>

                  <td className="px-4 py-3">
                    <div className="flex gap-2">
                      <Button
                        variante="secundario"
                        onClick={() => setDetalle(a)}
                      >
                        Ver
                      </Button>

                      <Button
                        variante="secundario"
                        onClick={() =>
                          setEditando({
                            id: a.id,
                            nombre: a.user?.name ?? "",
                            telefono: a.telefono ?? "",
                            direccion: a.direccion ?? "",
                            curp: a.curp ?? "",
                            tutorNombre: a.tutorNombre ?? "",
                            tutorTelefono: a.tutorTelefono ?? "",
                          })
                        }
                      >
                        Editar
                      </Button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </TableWrap>
      )}

      {detalle && (
        <Modal
          titulo={detalle.user?.name ?? "Alumno"}
          onClose={() => setDetalle(null)}
        >
          <dl className="space-y-2 text-sm">
            {[
              ["Matrícula", detalle.matricula],
              ["Correo", detalle.user?.email],
              ["CURP", detalle.curp],
              ["Teléfono", detalle.telefono],
              ["Programa", detalle.programa?.nombre],
              ["Carrera", detalle.carrera?.nombre],
              ["Grupo", detalle.grupo?.nombre],
              ["Trayectoria", detalle.trayectoria?.nombre],
              ["Tutor", detalle.tutorNombre],
              ["Tel. tutor", detalle.tutorTelefono],
            ].map(([k, v]) => (
              <div key={String(k)} className="flex justify-between gap-4">
                <dt className="text-slate-500">{k}</dt>
                <dd className="text-right">{v || "—"}</dd>
              </div>
            ))}
          </dl>

          <div className="mt-6 flex justify-end gap-2">
            <a href={`/secretaria/expediente/${detalle.id}`}>
              <Button variante="secundario">Ver expediente</Button>
            </a>

            {detalle.activo && (
              <Button variante="peligro" onClick={() => darBaja(detalle)}>
                Dar de baja
              </Button>
            )}
          </div>
        </Modal>
      )}

      {editando && (
        <Modal titulo="Editar alumno" onClose={() => setEditando(null)}>
          <div className="grid gap-3 md:grid-cols-2">
            {[
              ["nombre", "Nombre completo"],
              ["curp", "CURP"],
              ["telefono", "Teléfono"],
              ["direccion", "Dirección"],
              ["tutorNombre", "Nombre del tutor"],
              ["tutorTelefono", "Teléfono del tutor"],
            ].map(([campo, etiqueta]) => (
              <input
                key={campo}
                className="rounded-xl border border-slate-300 px-4 py-2"
                placeholder={etiqueta}
                value={editando[campo] ?? ""}
                onChange={(e) =>
                  setEditando({ ...editando, [campo]: e.target.value })
                }
              />
            ))}
          </div>

          <p className="mt-3 text-xs text-slate-500">
            El grupo, la carrera y la matrícula se cambian desde Secretaría,
            donde queda registrada la inscripción.
          </p>

          <div className="mt-6 flex justify-end gap-2">
            <Button variante="secundario" onClick={() => setEditando(null)}>
              Cancelar
            </Button>

            <Button onClick={guardarEdicion} disabled={guardando}>
              {guardando ? "Guardando..." : "Guardar"}
            </Button>
          </div>
        </Modal>
      )}
    </>
  );
}
