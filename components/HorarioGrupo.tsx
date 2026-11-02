"use client";

import { abrirHojaMembretada } from "@/lib/documentos";

/**
 * 🗓️ HORARIO DE UN GRUPO EN REJILLA (días × horas)
 *
 * La misma rejilla se ve en pantalla y se imprime en hoja membretada.
 */

export type BloqueHorario = {
  dia: string;
  horaInicio: string;
  horaFin: string;
  materia?: string | null;
  docente?: string | null;
  aula?: string | null;
};

const DIAS = ["LUNES", "MARTES", "MIERCOLES", "JUEVES", "VIERNES", "SABADO"];

const ETIQUETA: Record<string, string> = {
  LUNES: "Lunes",
  MARTES: "Martes",
  MIERCOLES: "Miércoles",
  JUEVES: "Jueves",
  VIERNES: "Viernes",
  SABADO: "Sábado",
};

function armarRejilla(bloques: BloqueHorario[]) {
  // Sábado solo aparece si el grupo tiene clase ese día.
  const dias = DIAS.filter((d) => d !== "SABADO" || bloques.some((b) => b.dia === d));

  const franjas = [
    ...new Set(bloques.map((b) => `${b.horaInicio}|${b.horaFin}`)),
  ].sort();

  const celda = (dia: string, franja: string) =>
    bloques.filter((b) => b.dia === dia && `${b.horaInicio}|${b.horaFin}` === franja);

  return { dias, franjas, celda };
}

const esc = (t?: string | null) =>
  String(t ?? "").replace(/[&<>"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" })[c]!);

export function imprimirHorarioGrupo(
  grupo: { nombre?: string; turno?: string | null; semestre?: string | null },
  bloques: BloqueHorario[]
): boolean {
  const { dias, franjas, celda } = armarRejilla(bloques);

  const filas = franjas
    .map((f) => {
      const [ini, fin] = f.split("|");
      const tds = dias
        .map((d) => {
          const bs = celda(d, f);
          return `<td>${bs
            .map(
              (b) =>
                `<strong>${esc(b.materia)}</strong>${b.docente ? `<br><span>${esc(b.docente)}</span>` : ""}${b.aula ? `<br><em>${esc(b.aula)}</em>` : ""}`
            )
            .join("<hr>")}</td>`;
        })
        .join("");
      return `<tr><th>${ini}<br>${fin}</th>${tds}</tr>`;
    })
    .join("");

  const sub = [grupo.semestre, grupo.turno].filter(Boolean).map(esc).join(" · ");

  const html = `
    <h2>HORARIO DEL GRUPO ${esc(grupo.nombre)}</h2>
    ${sub ? `<p class="sub">${sub}</p>` : ""}
    <table>
      <thead><tr><th>Hora</th>${dias.map((d) => `<th>${ETIQUETA[d]}</th>`).join("")}</tr></thead>
      <tbody>${filas || `<tr><td colspan="${dias.length + 1}">Sin horario capturado</td></tr>`}</tbody>
    </table>`;

  const estilos = `
    .contenido { text-align: left; font-family: system-ui, Arial, sans-serif; }
    h2 { text-align: center; font-size: 13pt; margin: 0 0 2px; letter-spacing: .05em; }
    .sub { text-align: center; font-size: 9pt; margin: 0 0 10px; color: #334155; }
    table { width: 100%; border-collapse: collapse; table-layout: fixed; font-size: 7.5pt; line-height: 1.25; }
    th, td { border: 1px solid #475569; padding: 4px; vertical-align: top; }
    thead th { background: #00253f; color: #fff; }
    tbody th { width: 52px; background: #f1f5f9; font-weight: 600; text-align: center; }
    td span { color: #334155; }
    td em { color: #64748b; }
    hr { border: 0; border-top: 1px dashed #94a3b8; margin: 3px 0; }`;

  return abrirHojaMembretada(`Horario ${grupo.nombre ?? ""}`, [html], estilos);
}

export function HorarioGrupo({ bloques }: { bloques: BloqueHorario[] }) {
  if (bloques.length === 0) {
    return <p className="text-gray-500">Este grupo todavía no tiene horarios capturados.</p>;
  }

  const { dias, franjas, celda } = armarRejilla(bloques);

  return (
    <div className="overflow-x-auto">
      <table className="w-full min-w-[720px] table-fixed border-collapse text-xs">
        <thead>
          <tr>
            <th className="w-20 border bg-[#00253f] px-2 py-2 text-white">Hora</th>
            {dias.map((d) => (
              <th key={d} className="border bg-[#00253f] px-2 py-2 text-white">
                {ETIQUETA[d]}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {franjas.map((f) => {
            const [ini, fin] = f.split("|");
            return (
              <tr key={f}>
                <th className="border bg-slate-50 px-2 py-2 font-semibold">
                  {ini}
                  <br />
                  {fin}
                </th>
                {dias.map((d) => (
                  <td key={d} className="border px-2 py-2 align-top">
                    {celda(d, f).map((b, i) => (
                      <div key={i} className={i > 0 ? "mt-1 border-t border-dashed pt-1" : ""}>
                        <p className="font-semibold">{b.materia}</p>
                        {b.docente && <p className="text-gray-600">{b.docente}</p>}
                        {b.aula && <p className="text-gray-400">{b.aula}</p>}
                      </div>
                    ))}
                  </td>
                ))}
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
