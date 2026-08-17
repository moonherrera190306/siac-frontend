"use client";

import { useEffect, useState } from "react";
import { API_URL } from "@/lib/config";
import { notificar } from "@/lib/notificar";
import { PageHeader, Card, Button, Vacio, Modal, Badge } from "@/components/ui";

export default function AdministradorGruposPage() {
  const [grupos, setGrupos] = useState<any[]>([]);
  const [turnos, setTurnos] = useState<any[]>([]);
  const [semestres, setSemestres] = useState<any[]>([]);

  const [detalle, setDetalle] = useState<any>(null);
  const [cargandoDetalle, setCargandoDetalle] = useState(false);

  const [abierto, setAbierto] = useState(false);
  const [nuevo, setNuevo] = useState({
    nombre: "",
    turnoId: "",
    semestreId: "",
    cupo: "",
  });
  const [guardando, setGuardando] = useState(false);

  const [loading, setLoading] = useState(true);

  const cargar = async () => {
    try {
      setLoading(true);

      const [rg, rt, rs] = await Promise.all([
        fetch(`${API_URL}/api/grupos`, { credentials: "include" }),
        fetch(`${API_URL}/api/turnos`, { credentials: "include" }),
        fetch(`${API_URL}/api/semestres`, { credentials: "include" }),
      ]);

      const [jg, jt, js] = await Promise.all([rg.json(), rt.json(), rs.json()]);

      if (!rg.ok) throw new Error(jg?.message || "Error al cargar grupos");

      setGrupos(jg?.data ?? []);
      setTurnos(jt?.data ?? []);
      setSemestres(Array.isArray(js) ? js : js?.data ?? []);
    } catch (e: any) {
      notificar(e.message || "Error al cargar grupos", "error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    cargar();
  }, []);

  const crear = async () => {
    if (!nuevo.nombre.trim()) {
      notificar("El nombre del grupo es requerido", "alerta");
      return;
    }

    setGuardando(true);

    const res = await fetch(`${API_URL}/api/grupos`, {
      method: "POST",
      credentials: "include",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(nuevo),
    });

    const json = await res.json();

    setGuardando(false);

    if (!res.ok) {
      notificar(json?.message || "No se pudo crear el grupo", "error");
      return;
    }

    notificar("Grupo creado", "exito");
    setNuevo({ nombre: "", turnoId: "", semestreId: "", cupo: "" });
    setAbierto(false);
    cargar();
  };

  const verDetalle = async (id: string) => {
    try {
      setCargandoDetalle(true);

      const res = await fetch(`${API_URL}/api/grupos/${id}`, {
        credentials: "include",
      });

      const json = await res.json();

      if (!res.ok) throw new Error(json?.message || "Error al cargar el grupo");

      setDetalle(json?.data ?? null);
    } catch (e: any) {
      notificar(e.message || "Error al cargar el grupo", "error");
    } finally {
      setCargandoDetalle(false);
    }
  };

  if (loading) return <p className="p-2 text-slate-500">Cargando...</p>;

  return (
    <>
      <PageHeader
        titulo="Grupos"
        descripcion={`${grupos.length} grupos activos`}
      >
        <Button onClick={() => setAbierto(true)}>Nuevo grupo</Button>
      </PageHeader>

      {grupos.length === 0 ? (
        <Vacio
          titulo="No hay grupos registrados."
          pista="Crea uno con el botón de arriba."
        />
      ) : (
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {grupos.map((g) => (
            <Card key={g.id}>
              <div className="flex items-start justify-between">
                <h2 className="text-xl font-semibold">Grupo {g.nombre}</h2>

                <Badge tono="info">{g.turno?.nombre ?? "Sin turno"}</Badge>
              </div>

              <p className="mt-2 text-sm text-slate-500">
                {g.semestre?.nombre ?? "Sin semestre"}
                {g.semestre?.carrera?.nombre
                  ? ` · ${g.semestre.carrera.nombre}`
                  : ""}
              </p>

              <p className="mt-1 text-sm text-slate-500">
                {g._count?.alumnos ?? 0} alumno(s)
                {g.cupo ? ` de ${g.cupo} de cupo` : ""}
              </p>

              <Button
                variante="secundario"
                className="mt-4 w-full"
                onClick={() => verDetalle(g.id)}
              >
                Ver detalle
              </Button>
            </Card>
          ))}
        </div>
      )}

      {cargandoDetalle && <p className="text-slate-500">Cargando detalle...</p>}

      {detalle && (
        <Modal
          titulo={`Grupo ${detalle.nombre}`}
          onClose={() => setDetalle(null)}
        >
          <p className="text-sm text-slate-500">
            {detalle.semestre?.nombre ?? "Sin semestre"} ·{" "}
            {detalle.turno?.nombre ?? "Sin turno"}
          </p>

          <h3 className="mt-4 font-semibold">
            Materias ({(detalle.asignaciones ?? []).length})
          </h3>

          {(detalle.asignaciones ?? []).length === 0 ? (
            <p className="text-sm text-slate-500">
              Sin materias asignadas todavía.
            </p>
          ) : (
            <ul className="mt-2 space-y-1 text-sm">
              {detalle.asignaciones.map((a: any) => (
                <li key={a.id} className="flex justify-between gap-4">
                  <span>{a.materia?.nombre}</span>
                  <span className="text-slate-500">
                    {a.docente?.nombre || a.docente?.user?.name || "Sin docente"}
                  </span>
                </li>
              ))}
            </ul>
          )}

          <h3 className="mt-4 font-semibold">
            Alumnos ({(detalle.alumnos ?? []).length})
          </h3>

          {(detalle.alumnos ?? []).length === 0 ? (
            <p className="text-sm text-slate-500">Sin alumnos inscritos.</p>
          ) : (
            <ul className="mt-2 max-h-52 space-y-1 overflow-y-auto text-sm">
              {detalle.alumnos.map((a: any) => (
                <li key={a.id} className="flex justify-between gap-4">
                  <span className="text-slate-500">{a.matricula}</span>
                  <span>{a.user?.name}</span>
                </li>
              ))}
            </ul>
          )}
        </Modal>
      )}

      {abierto && (
        <Modal titulo="Nuevo grupo" onClose={() => setAbierto(false)}>
          <div className="grid gap-3 md:grid-cols-2">
            <input
              className="rounded-xl border border-slate-300 px-4 py-2"
              placeholder="Nombre (1A, ADM-1...)"
              value={nuevo.nombre}
              onChange={(e) => setNuevo({ ...nuevo, nombre: e.target.value })}
            />

            <input
              type="number"
              className="rounded-xl border border-slate-300 px-4 py-2"
              placeholder="Cupo"
              value={nuevo.cupo}
              onChange={(e) => setNuevo({ ...nuevo, cupo: e.target.value })}
            />

            <select
              className="rounded-xl border border-slate-300 px-4 py-2"
              value={nuevo.turnoId}
              onChange={(e) => setNuevo({ ...nuevo, turnoId: e.target.value })}
            >
              <option value="">Turno...</option>

              {turnos.map((t: any) => (
                <option key={t.id} value={t.id}>
                  {t.nombre}
                </option>
              ))}
            </select>

            <select
              className="rounded-xl border border-slate-300 px-4 py-2"
              value={nuevo.semestreId}
              onChange={(e) =>
                setNuevo({ ...nuevo, semestreId: e.target.value })
              }
            >
              <option value="">Semestre...</option>

              {semestres.map((s: any) => (
                <option key={s.id} value={s.id}>
                  {s.nombre}
                  {s.carrera?.nombre ? ` — ${s.carrera.nombre}` : ""}
                </option>
              ))}
            </select>
          </div>

          <div className="mt-6 flex justify-end gap-2">
            <Button variante="secundario" onClick={() => setAbierto(false)}>
              Cancelar
            </Button>

            <Button onClick={crear} disabled={guardando}>
              {guardando ? "Creando..." : "Crear grupo"}
            </Button>
          </div>
        </Modal>
      )}
    </>
  );
}
