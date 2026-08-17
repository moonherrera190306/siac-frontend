"use client";

import { useEffect, useState } from "react";
import { API_URL } from "@/lib/config";
import { notificar } from "@/lib/notificar";
import { PageHeader, Card, TableWrap, Badge, Button, Vacio, Modal } from "@/components/ui";

const TIPOS = ["OBLIGATORIA", "COMPLEMENTARIA", "EXTRACURRICULAR"];
const EVALUACIONES = ["NUMERICA", "ACREDITACION"];

const VACIA = {
  id: "",
  nombre: "",
  clave: "",
  tipo: "OBLIGATORIA",
  tipoEvaluacion: "NUMERICA",
  creditos: "",
  horasSemana: "",
  semestreId: "",
};

export default function AdministradorMateriasPage() {
  const [materias, setMaterias] = useState<any[]>([]);
  const [semestres, setSemestres] = useState<any[]>([]);
  const [busqueda, setBusqueda] = useState("");

  const [form, setForm] = useState<any>(VACIA);
  const [abierto, setAbierto] = useState(false);
  const [guardando, setGuardando] = useState(false);

  const [loading, setLoading] = useState(true);

  const cargar = async () => {
    try {
      setLoading(true);

      const [rm, rs] = await Promise.all([
        fetch(`${API_URL}/api/materias`, { credentials: "include" }),
        fetch(`${API_URL}/api/semestres`, { credentials: "include" }),
      ]);

      const [jm, js] = await Promise.all([rm.json(), rs.json()]);

      if (!rm.ok) throw new Error(jm?.message || "Error al cargar materias");

      setMaterias(Array.isArray(jm) ? jm : jm?.data ?? []);
      setSemestres(Array.isArray(js) ? js : js?.data ?? []);
    } catch (e: any) {
      notificar(e.message || "Error al cargar materias", "error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    cargar();
  }, []);

  const abrirNueva = () => {
    setForm(VACIA);
    setAbierto(true);
  };

  const abrirEdicion = (m: any) => {
    setForm({
      id: m.id,
      nombre: m.nombre ?? "",
      clave: m.clave ?? "",
      tipo: m.tipo ?? "OBLIGATORIA",
      tipoEvaluacion: m.tipoEvaluacion ?? "NUMERICA",
      creditos: m.creditos ?? "",
      horasSemana: m.horasSemana ?? "",
      semestreId: m.semestreId ?? "",
    });

    setAbierto(true);
  };

  const guardar = async () => {
    if (!form.nombre.trim()) {
      notificar("El nombre es requerido", "alerta");
      return;
    }

    setGuardando(true);

    const editando = Boolean(form.id);

    const res = await fetch(
      `${API_URL}/api/materias${editando ? `/${form.id}` : ""}`,
      {
        method: editando ? "PUT" : "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          nombre: form.nombre,
          clave: form.clave || null,
          tipo: form.tipo,
          tipoEvaluacion: form.tipoEvaluacion,
          creditos: form.creditos || null,
          horasSemana: form.horasSemana || null,
          semestreId: form.semestreId || null,
        }),
      }
    );

    const json = await res.json();

    setGuardando(false);

    if (!res.ok) {
      notificar(json?.message || "No se pudo guardar", "error");
      return;
    }

    notificar(editando ? "Materia actualizada" : "Materia creada", "exito");
    setAbierto(false);
    cargar();
  };

  const filtradas = materias.filter((m) => {
    const t = busqueda.trim().toLowerCase();
    if (!t) return true;
    return (
      (m.nombre || "").toLowerCase().includes(t) ||
      (m.clave || "").toLowerCase().includes(t)
    );
  });

  if (loading) return <p className="p-2 text-slate-500">Cargando...</p>;

  return (
    <>
      <PageHeader
        titulo="Materias"
        descripcion={`${materias.length} materias del plan de estudios`}
      >
        <Button onClick={abrirNueva}>Nueva materia</Button>
      </PageHeader>

      <Card>
        <input
          className="w-full rounded-xl border border-slate-300 px-4 py-2"
          placeholder="Buscar por nombre o clave del plan"
          value={busqueda}
          onChange={(e) => setBusqueda(e.target.value)}
        />
      </Card>

      {filtradas.length === 0 ? (
        <Vacio titulo="No hay materias registradas." />
      ) : (
        <TableWrap>
          <table className="w-full text-left text-sm">
            <thead className="bg-slate-50 text-slate-600">
              <tr>
                <th className="px-4 py-3">Clave</th>
                <th className="px-4 py-3">Materia</th>
                <th className="px-4 py-3">Semestre</th>
                <th className="px-4 py-3">Tipo</th>
                <th className="px-4 py-3">Evaluación</th>
                <th className="px-4 py-3">Créditos</th>
                <th className="px-4 py-3"></th>
              </tr>
            </thead>

            <tbody>
              {filtradas.map((m) => (
                <tr key={m.id} className="border-t border-slate-100">
                  <td className="px-4 py-3 text-slate-500">{m.clave || "—"}</td>

                  <td className="px-4 py-3 font-medium">{m.nombre}</td>

                  <td className="px-4 py-3">{m.semestre?.nombre ?? "—"}</td>

                  <td className="px-4 py-3">
                    <Badge tono={m.tipo === "OBLIGATORIA" ? "info" : "neutro"}>
                      {m.tipo}
                    </Badge>
                  </td>

                  <td className="px-4 py-3">
                    {m.tipoEvaluacion === "ACREDITACION" ? "AC / NA" : "1 - 10"}
                  </td>

                  <td className="px-4 py-3">{m.creditos ?? "—"}</td>

                  <td className="px-4 py-3">
                    <Button
                      variante="secundario"
                      onClick={() => abrirEdicion(m)}
                    >
                      Editar
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </TableWrap>
      )}

      {abierto && (
        <Modal
          titulo={form.id ? "Editar materia" : "Nueva materia"}
          onClose={() => setAbierto(false)}
        >
          <div className="grid gap-3 md:grid-cols-2">
            <input
              className="rounded-xl border border-slate-300 px-4 py-2 md:col-span-2"
              placeholder="Nombre de la materia"
              value={form.nombre}
              onChange={(e) => setForm({ ...form, nombre: e.target.value })}
            />

            <input
              className="rounded-xl border border-slate-300 px-4 py-2"
              placeholder="Clave del plan (100155)"
              value={form.clave}
              onChange={(e) => setForm({ ...form, clave: e.target.value })}
            />

            <select
              className="rounded-xl border border-slate-300 px-4 py-2"
              value={form.semestreId}
              onChange={(e) => setForm({ ...form, semestreId: e.target.value })}
            >
              <option value="">Semestre...</option>

              {semestres.map((s: any) => (
                <option key={s.id} value={s.id}>
                  {s.nombre}
                  {s.carrera?.nombre ? ` — ${s.carrera.nombre}` : ""}
                </option>
              ))}
            </select>

            <select
              className="rounded-xl border border-slate-300 px-4 py-2"
              value={form.tipo}
              onChange={(e) => setForm({ ...form, tipo: e.target.value })}
            >
              {TIPOS.map((t) => (
                <option key={t} value={t}>
                  {t}
                </option>
              ))}
            </select>

            <select
              className="rounded-xl border border-slate-300 px-4 py-2"
              value={form.tipoEvaluacion}
              onChange={(e) =>
                setForm({ ...form, tipoEvaluacion: e.target.value })
              }
            >
              {EVALUACIONES.map((t) => (
                <option key={t} value={t}>
                  {t === "ACREDITACION" ? "Acreditación (AC/NA)" : "Numérica (1-10)"}
                </option>
              ))}
            </select>

            <input
              type="number"
              className="rounded-xl border border-slate-300 px-4 py-2"
              placeholder="Créditos"
              value={form.creditos}
              onChange={(e) => setForm({ ...form, creditos: e.target.value })}
            />

            <input
              type="number"
              className="rounded-xl border border-slate-300 px-4 py-2"
              placeholder="Horas por semana"
              value={form.horasSemana}
              onChange={(e) => setForm({ ...form, horasSemana: e.target.value })}
            />
          </div>

          {form.id && (
            <p className="mt-3 text-xs text-slate-500">
              El tipo de evaluación no se puede cambiar si la materia ya tiene
              calificaciones capturadas: un 8 no significa nada en una materia
              que solo acepta AC/NA.
            </p>
          )}

          <div className="mt-6 flex justify-end gap-2">
            <Button variante="secundario" onClick={() => setAbierto(false)}>
              Cancelar
            </Button>

            <Button onClick={guardar} disabled={guardando}>
              {guardando ? "Guardando..." : "Guardar"}
            </Button>
          </div>
        </Modal>
      )}
    </>
  );
}
