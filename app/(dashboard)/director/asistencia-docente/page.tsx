"use client";

import { useEffect, useMemo, useState } from "react";
import { API_URL } from "@/lib/config";
import { hoyISO } from "@/lib/format";
import { abrirHojaMembretada } from "@/lib/documentos";

/**
 * ✅ ASISTENCIA DIARIA DE MAESTROS — VISTO BUENO DE DIRECCIÓN
 *
 * Cada renglón es un bloque del horario del día. El sistema propone un
 * dictamen según lo que el maestro registró (a tiempo, tarde o nada) y
 * dirección lo confirma o lo corrige (p. ej. una falta justificada).
 */

type Dictamen = "ASISTIO" | "RETARDO" | "FALTA" | "JUSTIFICADA";

type Fila = {
  horarioId: string;
  docente: string;
  materia: string;
  grupo: string;
  horaInicio: string;
  horaFin: string;
  aula: string | null;
  estado: "REGISTRADA" | "REGISTRADA_TARDE" | "EN_TIEMPO" | "SIN_REGISTRO";
  registradaEn: string | null;
  minutosRetardo: number | null;
  tema: string | null;
  vistoBueno: {
    dictamen: Dictamen;
    nota: string | null;
    validadoEn: string;
    validadoPor: string | null;
  } | null;
};

const DICTAMEN: Record<Dictamen, { texto: string; clase: string }> = {
  ASISTIO: { texto: "Asistió", clase: "bg-green-100 text-green-800" },
  RETARDO: { texto: "Retardo", clase: "bg-amber-100 text-amber-800" },
  FALTA: { texto: "Falta", clase: "bg-red-100 text-red-700" },
  JUSTIFICADA: { texto: "Justificada", clase: "bg-blue-100 text-blue-700" },
};

const ESTADO_SISTEMA: Record<Fila["estado"], string> = {
  REGISTRADA: "Registró a tiempo",
  REGISTRADA_TARDE: "Registró tarde",
  EN_TIEMPO: "Aún puede registrar",
  SIN_REGISTRO: "Sin registro",
};

/** Lo que el sistema sugiere antes de que dirección decida. */
const sugerido = (f: Fila): Dictamen =>
  f.vistoBueno?.dictamen ??
  (f.estado === "REGISTRADA" ? "ASISTIO" : f.estado === "REGISTRADA_TARDE" ? "RETARDO" : "FALTA");

const horaDe = (iso: string | null) =>
  iso
    ? new Date(iso).toLocaleTimeString("es-MX", {
        hour: "2-digit",
        minute: "2-digit",
        timeZone: "America/Mexico_City",
      })
    : "—";

export default function DirectorAsistenciaDocentePage() {
  const [fecha, setFecha] = useState(hoyISO());
  const [filas, setFilas] = useState<Fila[]>([]);
  const [borrador, setBorrador] = useState<Record<string, { dictamen: Dictamen; nota: string }>>({});
  const [texto, setTexto] = useState("");
  const [soloPendientes, setSoloPendientes] = useState(false);
  const [loading, setLoading] = useState(true);
  const [guardando, setGuardando] = useState(false);
  const [error, setError] = useState("");
  const [aviso, setAviso] = useState("");

  const cargar = async (dia: string) => {
    try {
      setLoading(true);
      setError("");

      const res = await fetch(`${API_URL}/api/clases/registro-dia?fecha=${dia}`, {
        credentials: "include",
      });
      const json = await res.json();

      if (!res.ok) throw new Error(json?.message || "Error al cargar");

      const lista: Fila[] = json?.data ?? [];
      setFilas(lista);
      setBorrador(
        Object.fromEntries(
          lista.map((f) => [f.horarioId, { dictamen: sugerido(f), nota: f.vistoBueno?.nota ?? "" }])
        )
      );
    } catch (e: any) {
      setError(e.message || "Error al cargar");
      setFilas([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    setAviso("");
    cargar(fecha);
  }, [fecha]);

  const visibles = useMemo(() => {
    const t = texto.trim().toLowerCase();
    return filas.filter(
      (f) =>
        (!soloPendientes || !f.vistoBueno) &&
        (!t ||
          f.docente.toLowerCase().includes(t) ||
          f.materia.toLowerCase().includes(t) ||
          f.grupo.toLowerCase().includes(t))
    );
  }, [filas, texto, soloPendientes]);

  const totales = useMemo(() => {
    const cuenta = (d: Dictamen) => filas.filter((f) => borrador[f.horarioId]?.dictamen === d).length;
    return {
      programadas: filas.length,
      asistio: cuenta("ASISTIO"),
      retardo: cuenta("RETARDO"),
      falta: cuenta("FALTA"),
      justificada: cuenta("JUSTIFICADA"),
      validadas: filas.filter((f) => f.vistoBueno).length,
    };
  }, [filas, borrador]);

  const esFuturo = fecha > hoyISO();

  const guardar = async (ids: string[]) => {
    if (ids.length === 0) return;

    try {
      setGuardando(true);
      setError("");
      setAviso("");

      const res = await fetch(`${API_URL}/api/clases/visto-bueno`, {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          fecha,
          items: ids.map((id) => ({ horarioId: id, ...borrador[id] })),
        }),
      });
      const json = await res.json();

      if (!res.ok) throw new Error(json?.message || "No se pudo guardar");

      setAviso(json?.message || "Visto bueno guardado");
      await cargar(fecha);
    } catch (e: any) {
      setError(e.message || "No se pudo guardar");
    } finally {
      setGuardando(false);
    }
  };

  const cambiar = (id: string, campo: "dictamen" | "nota", valor: string) =>
    setBorrador((prev) => ({ ...prev, [id]: { ...prev[id], [campo]: valor } as any }));

  const imprimir = () => {
    const esc = (t?: string | null) =>
      String(t ?? "").replace(/[&<>"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" })[c]!);

    const renglones = filas
      .map((f) => {
        const b = borrador[f.horarioId];
        return `<tr>
          <td>${f.horaInicio}-${f.horaFin}</td>
          <td>${esc(f.docente)}</td>
          <td>${esc(f.materia)}</td>
          <td>${esc(f.grupo)}</td>
          <td>${horaDe(f.registradaEn)}</td>
          <td>${f.vistoBueno ? DICTAMEN[f.vistoBueno.dictamen].texto : "Pendiente"}</td>
          <td>${esc(b?.nota)}</td>
        </tr>`;
      })
      .join("");

    const html = `
      <h2>ASISTENCIA DOCENTE</h2>
      <p class="sub">${new Date(`${fecha}T12:00:00`).toLocaleDateString("es-MX", { weekday: "long", day: "numeric", month: "long", year: "numeric" })}</p>
      <p class="sub">Programadas ${totales.programadas} · Asistió ${totales.asistio} · Retardo ${totales.retardo} · Falta ${totales.falta} · Justificada ${totales.justificada}</p>
      <table>
        <thead><tr><th>Hora</th><th>Maestro</th><th>Materia</th><th>Grupo</th><th>Registró</th><th>Visto bueno</th><th>Nota</th></tr></thead>
        <tbody>${renglones}</tbody>
      </table>
      <div class="firma">Vo. Bo. Dirección</div>`;

    const estilos = `
      .contenido { text-align: left; font-family: system-ui, Arial, sans-serif; }
      h2 { text-align: center; font-size: 13pt; margin: 0; letter-spacing: .05em; }
      .sub { text-align: center; font-size: 9pt; margin: 2px 0; color: #334155; text-transform: capitalize; }
      table { width: 100%; border-collapse: collapse; font-size: 7.5pt; margin-top: 8px; }
      th, td { border: 1px solid #475569; padding: 3px 4px; vertical-align: top; }
      thead th { background: #00253f; color: #fff; }
      .firma { margin: 40px auto 0; width: 200px; border-top: 1px solid #000; text-align: center; font-size: 9pt; padding-top: 4px; }`;

    if (!abrirHojaMembretada(`Asistencia docente ${fecha}`, [html], estilos)) {
      setError("Permite ventanas emergentes para imprimir");
    }
  };

  return (
    <div className="space-y-6">
      <section className="rounded-3xl border bg-white p-6 shadow-sm">
        <h1 className="text-3xl font-bold">Asistencia docente</h1>
        <p className="text-gray-500">
          Revisa qué maestros dieron clase cada día y da el visto bueno.
        </p>
      </section>

      <section className="flex flex-wrap items-end gap-3 rounded-2xl border bg-white p-4 shadow-sm">
        <div>
          <label className="text-xs text-gray-500">Día</label>
          <input
            type="date"
            value={fecha}
            max={hoyISO()}
            onChange={(e) => setFecha(e.target.value)}
            className="mt-1 block rounded-xl border border-gray-300 px-3 py-2 text-sm"
          />
        </div>

        <input
          value={texto}
          onChange={(e) => setTexto(e.target.value)}
          placeholder="Buscar maestro, materia o grupo"
          className="w-full rounded-xl border border-gray-300 px-4 py-2 text-sm md:w-72"
        />

        <label className="flex items-center gap-2 text-sm text-gray-600">
          <input
            type="checkbox"
            checked={soloPendientes}
            onChange={(e) => setSoloPendientes(e.target.checked)}
          />
          Solo pendientes
        </label>

        <div className="ml-auto flex gap-2">
          <button
            onClick={imprimir}
            disabled={filas.length === 0}
            className="rounded-xl border px-4 py-2 text-sm hover:bg-gray-50 disabled:opacity-50"
          >
            Imprimir
          </button>
          <button
            // Los bloques que todavía están en tiempo de registro se dejan
            // fuera: el maestro aún puede registrar su clase.
            onClick={() => guardar(filas.filter((f) => f.estado !== "EN_TIEMPO").map((f) => f.horarioId))}
            disabled={guardando || esFuturo || filas.length === 0}
            className="rounded-xl bg-[#00253f] px-4 py-2 text-sm text-white disabled:opacity-50"
          >
            {guardando ? "Guardando…" : "Visto bueno a todo el día"}
          </button>
        </div>
      </section>

      {/* 📦 Recuadro de totales */}
      <section className="grid gap-3 sm:grid-cols-3 lg:grid-cols-6">
        {[
          { t: "Programadas", v: totales.programadas, c: "text-slate-800" },
          { t: "Asistió", v: totales.asistio, c: "text-green-700" },
          { t: "Retardo", v: totales.retardo, c: "text-amber-600" },
          { t: "Falta", v: totales.falta, c: "text-red-600" },
          { t: "Justificada", v: totales.justificada, c: "text-blue-700" },
          { t: "Con visto bueno", v: `${totales.validadas}/${totales.programadas}`, c: "text-[#00253f]" },
        ].map((k) => (
          <div key={k.t} className="rounded-2xl border bg-white p-4 text-center shadow-sm">
            <p className="text-xs uppercase tracking-wide text-gray-500">{k.t}</p>
            <p className={`mt-1 text-3xl font-bold ${k.c}`}>{k.v}</p>
          </div>
        ))}
      </section>

      {error && <p className="rounded-xl bg-red-50 p-4 text-red-600">{error}</p>}
      {aviso && <p className="rounded-xl bg-green-50 p-4 text-green-700">{aviso}</p>}

      {loading ? (
        <p className="p-6">Cargando...</p>
      ) : (
        <div className="overflow-x-auto rounded-3xl border bg-white shadow-sm">
          <table className="w-full min-w-[980px] text-left text-sm">
            <thead className="bg-gray-50 text-gray-600">
              <tr>
                <th className="px-3 py-3">Hora</th>
                <th className="px-3 py-3">Maestro</th>
                <th className="px-3 py-3">Materia · Grupo</th>
                <th className="px-3 py-3">Registro del maestro</th>
                <th className="px-3 py-3">Dictamen</th>
                <th className="px-3 py-3">Nota</th>
                <th className="px-3 py-3">Visto bueno</th>
              </tr>
            </thead>
            <tbody>
              {visibles.map((f) => {
                const b = borrador[f.horarioId];
                return (
                  <tr key={f.horarioId} className="border-t align-top">
                    <td className="whitespace-nowrap px-3 py-3 font-medium">
                      {f.horaInicio}–{f.horaFin}
                    </td>
                    <td className="px-3 py-3">{f.docente}</td>
                    <td className="px-3 py-3">
                      {f.materia}
                      <span className="block text-xs text-gray-500">Grupo {f.grupo}</span>
                    </td>
                    <td className="px-3 py-3">
                      <p>{ESTADO_SISTEMA[f.estado]}</p>
                      <p className="text-xs text-gray-500">
                        {f.registradaEn ? `a las ${horaDe(f.registradaEn)}` : ""}
                        {f.minutosRetardo && f.minutosRetardo > 0 ? ` · ${f.minutosRetardo} min tarde` : ""}
                      </p>
                      {f.tema && <p className="text-xs text-gray-400">Tema: {f.tema}</p>}
                    </td>
                    <td className="px-3 py-3">
                      <select
                        value={b?.dictamen}
                        onChange={(e) => cambiar(f.horarioId, "dictamen", e.target.value)}
                        className="rounded-lg border border-gray-300 px-2 py-1 text-sm"
                      >
                        {(Object.keys(DICTAMEN) as Dictamen[]).map((d) => (
                          <option key={d} value={d}>
                            {DICTAMEN[d].texto}
                          </option>
                        ))}
                      </select>
                    </td>
                    <td className="px-3 py-3">
                      <input
                        value={b?.nota ?? ""}
                        onChange={(e) => cambiar(f.horarioId, "nota", e.target.value)}
                        placeholder="Opcional"
                        className="w-40 rounded-lg border border-gray-300 px-2 py-1 text-sm"
                      />
                    </td>
                    <td className="px-3 py-3">
                      {f.vistoBueno ? (
                        <div>
                          <span className={`rounded-full px-3 py-1 text-xs font-medium ${DICTAMEN[f.vistoBueno.dictamen].clase}`}>
                            ✓ {DICTAMEN[f.vistoBueno.dictamen].texto}
                          </span>
                          <p className="mt-1 text-xs text-gray-400">
                            {f.vistoBueno.validadoPor ?? ""} · {horaDe(f.vistoBueno.validadoEn)}
                          </p>
                        </div>
                      ) : (
                        <button
                          onClick={() => guardar([f.horarioId])}
                          disabled={guardando || esFuturo || f.estado === "EN_TIEMPO"}
                          title={f.estado === "EN_TIEMPO" ? "El maestro todavía puede registrar esta clase" : undefined}
                          className="rounded-lg border border-[#00253f] px-3 py-1 text-xs text-[#00253f] disabled:opacity-50"
                        >
                          Dar visto bueno
                        </button>
                      )}
                      {f.vistoBueno &&
                        (b?.dictamen !== f.vistoBueno.dictamen || (b?.nota ?? "") !== (f.vistoBueno.nota ?? "")) && (
                          <button
                            onClick={() => guardar([f.horarioId])}
                            disabled={guardando}
                            className="mt-1 block text-xs text-[#00253f] underline"
                          >
                            Guardar cambio
                          </button>
                        )}
                    </td>
                  </tr>
                );
              })}

              {visibles.length === 0 && (
                <tr>
                  <td colSpan={7} className="px-4 py-6 text-center text-gray-500">
                    {filas.length === 0
                      ? "No hay clases programadas ese día."
                      : "Nada que mostrar con esos filtros."}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
