/**
 * 🖨️ DOCUMENTOS IMPRIMIBLES
 *
 * Abren una ventana con el documento listo para imprimir o guardar
 * como PDF desde el propio navegador (Ctrl+P → "Guardar como PDF").
 *
 * No se generan en el servidor: eso requeriría una librería de PDF.
 * Mientras tanto, esto ya sirve para entregar e imprimir.
 */

export const ESCUELA = {
  nombre: "CESZAM",
  rfc: "CES961018ZP9",
  domicilio: "Dr. Alonso Martínez #670, Fracc. Jardinadas, Zamora, Michoacán",
};

const UNIDADES = [
  "", "UN", "DOS", "TRES", "CUATRO", "CINCO", "SEIS", "SIETE", "OCHO", "NUEVE",
  "DIEZ", "ONCE", "DOCE", "TRECE", "CATORCE", "QUINCE", "DIECISÉIS",
  "DIECISIETE", "DIECIOCHO", "DIECINUEVE", "VEINTE",
];

const DECENAS = [
  "", "", "VEINTI", "TREINTA", "CUARENTA", "CINCUENTA", "SESENTA", "SETENTA",
  "OCHENTA", "NOVENTA",
];

const CENTENAS = [
  "", "CIENTO", "DOSCIENTOS", "TRESCIENTOS", "CUATROCIENTOS", "QUINIENTOS",
  "SEISCIENTOS", "SETECIENTOS", "OCHOCIENTOS", "NOVECIENTOS",
];

function centenas(n: number): string {
  if (n === 0) return "";
  if (n === 100) return "CIEN";

  const c = Math.floor(n / 100);
  const resto = n % 100;

  let salida = CENTENAS[c];

  if (resto > 0) {
    salida += (salida ? " " : "") + decenas(resto);
  }

  return salida;
}

function decenas(n: number): string {
  if (n <= 20) return UNIDADES[n];

  const d = Math.floor(n / 10);
  const u = n % 10;

  if (d === 2) return u === 0 ? "VEINTE" : "VEINTI" + UNIDADES[u].toLowerCase().toUpperCase();

  return DECENAS[d] + (u > 0 ? " Y " + UNIDADES[u] : "");
}

/** El importe con letra: un recibo sin él no se ve serio. */
export function importeConLetra(valor: number): string {
  const entero = Math.floor(valor);
  const centavos = Math.round((valor - entero) * 100);

  let texto = "";

  if (entero === 0) texto = "CERO";
  else if (entero < 1000) texto = centenas(entero);
  else {
    const miles = Math.floor(entero / 1000);
    const resto = entero % 1000;

    texto =
      (miles === 1 ? "MIL" : centenas(miles) + " MIL") +
      (resto > 0 ? " " + centenas(resto) : "");
  }

  return `${texto} PESOS ${String(centavos).padStart(2, "0")}/100 M.N.`;
}

function abrirVentana(titulo: string, cuerpo: string, estilos: string) {
  const v = window.open("", "_blank", "width=900,height=1000");

  if (!v) {
    return false;
  }

  v.document.write(`<!doctype html>
<html lang="es">
<head>
<meta charset="utf-8">
<title>${titulo}</title>
<style>
  * { box-sizing: border-box; }
  body {
    font-family: system-ui, -apple-system, "Segoe UI", Arial, sans-serif;
    color: #0f172a;
    margin: 0;
    padding: 32px;
    background: #f1f5f9;
  }
  .hoja {
    background: #fff;
    max-width: 700px;
    margin: 0 auto;
    padding: 36px 40px;
    border: 1px solid #e2e8f0;
    border-radius: 12px;
  }
  @media print {
    body { background: #fff; padding: 0; }
    .hoja { border: 0; border-radius: 0; max-width: none; }
    .no-imprimir { display: none !important; }
  }
  ${estilos}
</style>
</head>
<body>
  <div class="hoja">${cuerpo}</div>

  <p class="no-imprimir" style="text-align:center;margin-top:20px;color:#64748b;font-size:13px">
    Usa Ctrl+P para imprimir o guardar como PDF.
  </p>

  <script>setTimeout(() => window.print(), 350);</script>
</body>
</html>`);

  v.document.close();

  return true;
}

/* =========================================
   🧾 RECIBO DE PAGO
========================================= */
export function abrirRecibo(pago: any): boolean {
  const alumno = pago.alumno ?? {};

  const detalles = pago.detalles ?? [];

  const total = Number(pago.total ?? 0);

  const cancelado = pago.estado === "CANCELADO";

  const filas = detalles
    .map(
      (d: any) => `
      <tr>
        <td>${d.concepto?.nombre ?? "Concepto"}${
        d.descripcion ? `<br><span class="chico">${d.descripcion}</span>` : ""
      }</td>
        <td class="centro">${d.cantidad ?? 1}</td>
        <td class="derecha">$${Number(d.monto ?? 0).toFixed(2)}</td>
        <td class="derecha">$${(Number(d.monto ?? 0) * Number(d.cantidad ?? 1)).toFixed(2)}</td>
      </tr>`
    )
    .join("");

  const cuerpo = `
    ${cancelado ? '<div class="sello-cancelado">CANCELADO</div>' : ""}

    <header>
      <div>
        <h1>${ESCUELA.nombre}</h1>
        <p class="chico">${ESCUELA.domicilio}</p>
        <p class="chico">RFC ${ESCUELA.rfc}</p>
      </div>

      <div class="folio">
        <span class="chico">FOLIO</span>
        <strong>${pago.folio ?? "—"}</strong>
        ${pago.libro ? `<span class="chico">Libro ${pago.libro}</span>` : ""}
      </div>
    </header>

    <h2>RECIBO DE PAGO</h2>

    <dl class="datos">
      <div><dt>Alumno</dt><dd>${alumno.user?.name ?? "—"}</dd></div>
      <div><dt>Matrícula</dt><dd>${alumno.matricula ?? "—"}</dd></div>
      <div><dt>Grupo</dt><dd>${alumno.grupo?.nombre ?? "—"}</dd></div>
      <div><dt>Fecha</dt><dd>${
        pago.pagadoEn
          ? new Date(pago.pagadoEn).toLocaleDateString("es-MX", {
              day: "2-digit",
              month: "long",
              year: "numeric",
            })
          : "—"
      }</dd></div>
      <div><dt>Forma de pago</dt><dd>${pago.metodo ?? "—"}</dd></div>
      ${pago.referencia ? `<div><dt>Referencia</dt><dd>${pago.referencia}</dd></div>` : ""}
      ${pago.iniciales ? `<div><dt>Cajero</dt><dd>${pago.iniciales}</dd></div>` : ""}
    </dl>

    <table>
      <thead>
        <tr>
          <th>Concepto</th>
          <th class="centro">Cant.</th>
          <th class="derecha">P. unitario</th>
          <th class="derecha">Importe</th>
        </tr>
      </thead>
      <tbody>${filas || '<tr><td colspan="4">Sin conceptos</td></tr>'}</tbody>
    </table>

    <div class="total">
      <span>TOTAL</span>
      <strong>$${total.toFixed(2)}</strong>
    </div>

    <p class="letra">Son: ${importeConLetra(total)}</p>

    ${
      cancelado
        ? `<p class="aviso">Este recibo fue cancelado el ${
            pago.canceladoEn
              ? new Date(pago.canceladoEn).toLocaleDateString("es-MX")
              : ""
          }. Motivo: ${pago.motivoCancela ?? "—"}</p>`
        : ""
    }

    <div class="firmas">
      <div><span></span><p>Recibí</p></div>
      <div><span></span><p>Caja</p></div>
    </div>

    <p class="pie">
      Este comprobante ampara únicamente los conceptos señalados.
      Conserve este recibo para cualquier aclaración.
    </p>
  `;

  const estilos = `
    header { display:flex; justify-content:space-between; align-items:flex-start; gap:24px; border-bottom:2px solid #0f172a; padding-bottom:16px; }
    h1 { font-size:26px; font-weight:800; letter-spacing:3px; margin:0 0 6px; }
    h2 { text-align:center; font-size:13px; letter-spacing:2px; margin:22px 0; color:#475569; }
    .chico { font-size:11px; color:#64748b; margin:2px 0; }
    .folio { text-align:right; }
    .folio strong { display:block; font-size:26px; color:#b91c1c; line-height:1; }
    .datos { display:grid; grid-template-columns:1fr 1fr; gap:10px 24px; margin:0 0 22px; }
    .datos div { border-bottom:1px dotted #cbd5e1; padding-bottom:4px; }
    .datos dt { font-size:10px; text-transform:uppercase; color:#64748b; letter-spacing:.5px; }
    .datos dd { margin:2px 0 0; font-size:13px; font-weight:600; }
    table { width:100%; border-collapse:collapse; font-size:13px; }
    th { background:#f1f5f9; text-align:left; padding:8px 10px; font-size:11px; text-transform:uppercase; color:#475569; }
    td { padding:9px 10px; border-bottom:1px solid #e2e8f0; }
    .centro { text-align:center; }
    .derecha { text-align:right; }
    .total { display:flex; justify-content:flex-end; align-items:baseline; gap:20px; margin-top:14px; font-size:18px; }
    .total strong { font-size:24px; }
    .letra { text-align:right; font-size:11px; color:#475569; margin-top:2px; }
    .aviso { margin-top:18px; padding:10px 12px; background:#fef2f2; color:#7f1d1d; border-radius:8px; font-size:12px; }
    .firmas { display:flex; gap:60px; justify-content:center; margin-top:60px; }
    .firmas div { text-align:center; }
    .firmas span { display:block; width:190px; border-top:1px solid #0f172a; }
    .firmas p { margin:6px 0 0; font-size:11px; color:#475569; }
    .pie { margin-top:34px; font-size:10px; color:#94a3b8; text-align:center; }
    .sello-cancelado { position:absolute; top:180px; left:50%; transform:translateX(-50%) rotate(-18deg); font-size:64px; font-weight:800; color:rgba(185,28,28,.16); letter-spacing:6px; pointer-events:none; }
  `;

  return abrirVentana(`Recibo ${pago.folio ?? ""}`, cuerpo, estilos);
}

/* =========================================
   🪪 CREDENCIAL ESCOLAR
========================================= */
export function abrirCredencial(alumno: any, ciclo?: string): boolean {
  const nombre = alumno.user?.name ?? "";

  const foto = alumno.foto
    ? `<img src="${alumno.foto}" alt="">`
    : `<span>${nombre
        .split(" ")
        .filter(Boolean)
        .slice(0, 2)
        .map((p: string) => p[0])
        .join("")
        .toUpperCase()}</span>`;

  const cuerpo = `
    <div class="credencial">
      <div class="franja">
        <p class="escuela">${ESCUELA.nombre}</p>
        <p class="tipo">CREDENCIAL DE ESTUDIANTE</p>
      </div>

      <div class="cuerpo">
        <div class="foto">${foto}</div>

        <div class="datos">
          <p class="nombre">${nombre}</p>

          <p class="dato"><span>Matrícula</span>${alumno.matricula ?? "—"}</p>
          <p class="dato"><span>Carrera</span>${alumno.carrera?.nombre ?? "—"}</p>
          <p class="dato"><span>Grupo</span>${alumno.grupo?.nombre ?? "—"}${
    alumno.grupo?.turno?.nombre ? ` · ${alumno.grupo.turno.nombre}` : ""
  }</p>
          ${
            alumno.trayectoria?.nombre
              ? `<p class="dato"><span>Trayectoria</span>${alumno.trayectoria.nombre}</p>`
              : ""
          }
        </div>
      </div>

      <div class="pie">
        <span>Ciclo ${ciclo ?? "escolar vigente"}</span>
        <span>${ESCUELA.rfc}</span>
      </div>
    </div>

    <div class="reverso">
      <p class="titulo">Datos de emergencia</p>

      <p class="dato"><span>Tutor</span>${alumno.tutorNombre ?? "—"}</p>
      <p class="dato"><span>Teléfono</span>${alumno.tutorTelefono ?? "—"}</p>
      <p class="dato"><span>CURP</span>${alumno.curp ?? "—"}</p>

      <p class="leyenda">
        Esta credencial es personal e intransferible. En caso de extravío,
        repórtelo en Secretaría Escolar.
        <br>${ESCUELA.domicilio}
      </p>
    </div>
  `;

  const estilos = `
    .hoja { max-width: 640px; }
    .credencial { width:340px; margin:0 auto; border:1px solid #cbd5e1; border-radius:14px; overflow:hidden; box-shadow:0 6px 18px rgba(15,23,42,.08); }
    .franja { background:#0f172a; color:#fff; padding:14px 16px; }
    .escuela { margin:0; font-size:20px; font-weight:800; letter-spacing:4px; line-height:1; }
    .tipo { margin:6px 0 0; font-size:12px; font-weight:700; letter-spacing:2px; color:#f59e0b; }
    .cuerpo { display:flex; gap:14px; padding:16px; }
    .foto { width:82px; height:100px; border-radius:8px; background:#e2e8f0; display:flex; align-items:center; justify-content:center; overflow:hidden; flex:none; }
    .foto img { width:100%; height:100%; object-fit:cover; }
    .foto span { font-size:26px; font-weight:700; color:#64748b; }
    .datos { min-width:0; }
    .nombre { margin:0 0 10px; font-size:15px; font-weight:700; line-height:1.2; }
    .dato { margin:0 0 6px; font-size:11.5px; }
    .dato span { display:block; font-size:8.5px; text-transform:uppercase; letter-spacing:.5px; color:#64748b; }
    .pie { display:flex; justify-content:space-between; padding:9px 16px; background:#f1f5f9; font-size:9px; color:#64748b; border-top:1px solid #e2e8f0; }
    .reverso { width:340px; margin:26px auto 0; border:1px solid #cbd5e1; border-radius:14px; padding:16px; }
    .reverso .titulo { margin:0 0 12px; font-size:11px; font-weight:700; letter-spacing:1px; color:#0f172a; text-transform:uppercase; }
    .leyenda { margin-top:16px; font-size:9px; color:#94a3b8; line-height:1.5; }
  `;

  return abrirVentana(`Credencial ${alumno.matricula ?? ""}`, cuerpo, estilos);
}
