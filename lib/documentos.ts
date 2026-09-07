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

  // Datos tal como aparecen en las constancias impresas.
  nombreLargo: "Escuela Preparatoria por Cooperación de Zamora",
  universidad: "Universidad Michoacana de San Nicolás de Hidalgo",
  claveIncorporacion: "11257",
  claveCT: "16PBH0029Y",
  expediente: '112-218.1"24"',
  director: "M. en E. CUAUHTÉMOC OROZCO GIL",
  cargoDirector: "DIRECTOR DE LA PREPARATORIA",
  referencia: "J.R.V.C/2026-0",
};

/**
 * 📄 HOJA MEMBRETADA
 *
 * El papel oficial ya trae el encabezado y el pie impresos, así que el
 * documento solo aporta el contenido y lo coloca dentro del área libre.
 *
 * Medidas tomadas del archivo (1236x1600 px = tamaño carta exacto):
 *
 *   0    – 4.2 cm   banda azul superior y escudo
 *   4.5  – 5.9 cm   "CENTRO DE ESTUDIOS SUPERIORES…"
 *   6.4  – 25.2 cm  ÁREA LIBRE  ← aquí va todo
 *   25.9 – 27.9 cm  banda azul con domicilio y teléfono
 *
 * El escudo del centro es marca de agua muy tenue: el texto se lee encima.
 */
export const MEMBRETE = {
  archivo: "/membrete-ceszam.png",
  anchoHoja: "21.59cm",
  altoHoja: "27.94cm",
  margenSuperior: "6.4cm",
  margenInferior: "2.7cm",
  margenLateral: "2.5cm",
};

/**
 * La ventana de impresión se crea con window.open("") y vive en about:blank,
 * donde una ruta relativa NO resuelve contra el sitio. Sin origin absoluto
 * el membrete no carga y la hoja sale en blanco, sin ningún error visible.
 */
function urlMembrete(): string {
  if (typeof window === "undefined") return MEMBRETE.archivo;

  return `${window.location.origin}${MEMBRETE.archivo}`;
}

/**
 * Abre una o varias hojas membretadas listas para imprimir.
 * Cada elemento de `paginas` es el HTML de una hoja.
 */
export function abrirHojaMembretada(
  titulo: string,
  paginas: string[],
  estilos = "",
  scriptExtra = ""
): boolean {
  const v = window.open("", "_blank", "width=900,height=1000");

  if (!v) return false;

  const hojas = paginas
    .map((p) => `<div class="hoja"><div class="contenido">${p}</div></div>`)
    .join("");

  v.document.write(`<!doctype html>
<html lang="es">
<head>
<meta charset="utf-8">
<title>${titulo}</title>
<style>
  * { box-sizing: border-box; }

  body {
    margin: 0;
    padding: 24px 0;
    background: #e2e8f0;
    font-family: Georgia, "Times New Roman", serif;
    color: #1a1a1a;
  }

  .hoja {
    position: relative;
    width: ${MEMBRETE.anchoHoja};
    height: ${MEMBRETE.altoHoja};
    margin: 0 auto 24px;
    background: url("${urlMembrete()}") no-repeat center / 100% 100%;
    box-shadow: 0 4px 16px rgba(15,23,42,.18);
  }

  /* El área libre entre el encabezado y el pie ya impresos. */
  .contenido {
    position: absolute;
    top: ${MEMBRETE.margenSuperior};
    bottom: ${MEMBRETE.margenInferior};
    left: ${MEMBRETE.margenLateral};
    right: ${MEMBRETE.margenLateral};
    font-size: 12pt;
    line-height: 1.5;
    text-align: justify;
  }

  @media print {
    @page { size: letter; margin: 0; }

    body { background: #fff; padding: 0; }

    /* Sin esto Chrome NO imprime el membrete y sale la hoja en blanco. */
    html {
      -webkit-print-color-adjust: exact;
      print-color-adjust: exact;
    }

    .hoja {
      margin: 0;
      box-shadow: none;
      page-break-after: always;
    }

    .hoja:last-child { page-break-after: auto; }

    .no-imprimir { display: none !important; }
  }

  ${estilos}
</style>
</head>
<body>
  ${hojas}

  <p class="no-imprimir" style="text-align:center;margin:8px 0 24px;color:#475569;font-size:13px;font-family:system-ui,sans-serif">
    Usa Ctrl+P para imprimir o guardar como PDF.
    Activa <strong>“Gráficos de fondo”</strong> para que salga el membrete.
  </p>

  ${scriptExtra}

  <script>
    // Se espera a que cargue el membrete: si se imprime antes,
    // la hoja sale sin fondo.
    const img = new Image();
    img.onload = img.onerror = () => setTimeout(() => window.print(), 250);
    img.src = ${JSON.stringify(urlMembrete())};
  </script>
</body>
</html>`);

  v.document.close();

  return true;
}

const MESES = [
  "enero", "febrero", "marzo", "abril", "mayo", "junio",
  "julio", "agosto", "septiembre", "octubre", "noviembre", "diciembre",
];

/** "a los 7 días del mes de septiembre de 2026" — la fórmula de las actas. */
function fechaEnLetra(d = new Date()): string {
  return `a los ${d.getDate()} días del mes de ${MESES[d.getMonth()]} de ${d.getFullYear()}`;
}

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

/* =========================================
   📜 CONSTANCIAS
   Formato exacto de las que se emiten en ventanilla.
========================================= */

/** Cómo se redacta el cuerpo, que es lo único que cambia entre variantes. */
export type TipoConstancia =
  | "TERMINADO" // cursó y terminó el semestre
  | "CURSANDO_INVIERNO" // cursa, con receso de navidad y año nuevo
  | "CURSANDO_PRIMAVERA"; // cursa, con receso de semana santa y pascua

const RECESO: Record<string, string> = {
  CURSANDO_INVIERNO: "10 días en navidad y año nuevo",
  CURSANDO_PRIMAVERA: "10 días en semana santa y semana de pascua",
};

const ORDINAL = [
  "", "PRIMER", "SEGUNDO", "TERCER", "CUARTO", "QUINTO", "SEXTO",
  "SÉPTIMO", "OCTAVO", "NOVENO", "DÉCIMO",
];

/** 3 → "TERCER SEMESTRE". El documento nunca dice "semestre 3". */
export function semestreEnLetra(n?: number | null): string {
  return n && ORDINAL[n] ? `${ORDINAL[n]} SEMESTRE` : "";
}

function fechaLarga(d = new Date()): string {
  return `${String(d.getDate()).padStart(2, "0")} de ${MESES[d.getMonth()]} de ${d.getFullYear()}`;
}

export interface DatosConstancia {
  tipo?: TipoConstancia;
  semestre?: number | null;
  /** Trayectoria/bachillerato: "TR. INGENIERÍA Y ARQUITECTURA 09". */
  bachillerato?: string;
  turno?: string;
  ciclo?: string;
  inicioCurso?: string;
  finCurso?: string;
  folioRecibo?: number | string;
}

export function abrirConstancia(alumno: any, datos: DatosConstancia = {}): boolean {
  const tipo = datos.tipo ?? "TERMINADO";

  const nombre = (alumno?.user?.name ?? "—").toUpperCase();

  const semestre =
    semestreEnLetra(datos.semestre) ||
    semestreEnLetra(alumno?.grupo?.semestre?.numero) ||
    "SEMESTRE";

  const bachillerato =
    datos.bachillerato ??
    alumno?.trayectoria?.nombre ??
    alumno?.carrera?.nombre ??
    "—";

  const turno = (
    datos.turno ??
    alumno?.grupo?.turno?.nombre ??
    ""
  ).toUpperCase();

  // El párrafo que cambia entre las tres variantes.
  const cuerpo =
    tipo === "TERMINADO"
      ? `
        Con número de matrícula <strong>${alumno?.matricula ?? "—"}</strong>,
        quien cursó y terminó el ${semestre} en esta institución en el
        bachillerato ${bachillerato}${turno ? ` en el turno ${turno}` : ""}
        dentro del ciclo escolar ${datos.ciclo ?? "—"}.
      `
      : `
        Con número de matrícula <strong>${alumno?.matricula ?? "—"}</strong>,
        cursa en este plantel el ${semestre}${turno ? ` turno ${turno}` : ""}
        en el bachillerato ${bachillerato}. Clave CT: ${ESCUELA.claveCT}.
        Con un periodo vacacional de ${RECESO[tipo]}; cursando las siguientes
        materias:
      `;

  const fechas =
    tipo === "TERMINADO"
      ? ""
      : `
        <p class="fechas">
          <strong>Inicio de curso:</strong> El ${datos.inicioCurso ?? "—"}<br>
          <strong>Fin de curso:</strong> El ${datos.finCurso ?? "—"}
        </p>
      `;

  const pagina = `
    <p class="destinatario">A QUIEN CORRESPONDA:</p>

    <div class="caja-foto"></div>

    <p class="lugar-fecha">Zamora Michoacán, a ${fechaLarga()}</p>

    <p class="sangria">
      El que suscribe, director de la ${ESCUELA.nombreLargo}, con clave
      ${ESCUELA.claveIncorporacion}, incorporada a la ${ESCUELA.universidad}.
      Hace <strong>CONSTAR</strong> que el (la) joven:
    </p>

    <p class="nombre">${nombre}</p>

    <p class="sangria">${cuerpo}</p>

    ${fechas}

    <p class="sangria">
      Se extiende la presente constancia a solicitud del interesado(a) para los
      fines que mejor le convengan en la ciudad de Zamora, Michoacán.
    </p>

    <div class="firma">
      <p>${ESCUELA.cargoDirector}</p>
      <p>${ESCUELA.director}</p>
    </div>

    <p class="referencia">${ESCUELA.referencia}</p>

    ${datos.folioRecibo ? `<p class="folio">Recibo folio ${datos.folioRecibo}</p>` : ""}
  `;

  const estilos = `
    .contenido { font-family: "Times New Roman", Georgia, serif; font-size: 12pt; }
    .destinatario { margin:0; font-weight:400; }
    /* Recuadro para la fotografía, como en el formato impreso. */
    .caja-foto { position:absolute; top:0; right:0; width:2.6cm; height:2.6cm; border:1px dashed #999; }
    .lugar-fecha { text-align:center; margin:.9cm 0 1.1cm; }
    .sangria { text-indent:1.2cm; margin:0 0 .55cm; text-align:justify; line-height:1.45; }
    .nombre { text-align:center; font-weight:700; margin:.5cm 0; letter-spacing:.5px; }
    .fechas { margin:0 0 .55cm 1.2cm; line-height:1.5; text-align:left; }
    .firma { position:absolute; bottom:3.2cm; left:0; right:0; text-align:center; }
    .firma p { margin:0; line-height:1.35; }
    .referencia { position:absolute; bottom:2.2cm; left:0; margin:0; font-size:10pt; text-align:left; }
    .folio { position:absolute; bottom:1.4cm; left:0; margin:0; font-size:8pt; color:#666; text-align:left; }
  `;

  return abrirHojaMembretada(
    `Constancia ${alumno?.matricula ?? ""}`,
    [pagina],
    estilos
  );
}

/* =========================================
   📊 CONSTANCIA DE CALIFICACIONES (kardex)
   Dos columnas de semestres, con estatus y promedio general.
========================================= */

const numero = (v: any): number | null => {
  const n = Number(v);
  return Number.isFinite(n) ? n : null;
};

/**
 * El estatus impreso NO es el enum del SIAC (APROBADA/REPROBADA): el
 * documento oficial dice CÓMO se acreditó. Se deduce de las columnas,
 * en el mismo orden de prioridad que usaba el sistema anterior.
 */
export function estatusImpreso(c: any): string {
  const nd = String(c?.notaDefinitiva ?? "").toUpperCase();

  if (c?.articulo) return "ARTICULO";
  if (nd === "AC") return "ORDINARIO";
  if (nd === "" || nd === "NA" || nd === "NP") return "PENDIENTE";

  if ((numero(c.especial) ?? 0) >= 6 || (numero(c.adicional) ?? 0) >= 6)
    return "E.E.REG.";

  if ((numero(c.extraordinario) ?? 0) >= 6) return "EXTRAORD.";
  if ((numero(c.notaFinal) ?? 0) >= 6) return "ORDINARIO";

  return "PENDIENTE";
}

/** Redondeo de la escuela: el .5 sube de 6.5 y baja de 5.5. */
function redondeoEscolar(v: number): number {
  const abajo = Math.floor(v);

  if (v - abajo !== 0.5) return Math.round(v);

  return abajo >= 6 ? abajo + 1 : abajo;
}

export function abrirConstanciaCalificaciones(
  alumno: any,
  calificaciones: any[],
  datos: DatosConstancia = {}
): boolean {
  const nombre = (alumno?.user?.name ?? "—").toUpperCase();

  const bachillerato =
    datos.bachillerato ?? alumno?.trayectoria?.nombre ?? alumno?.carrera?.nombre ?? "—";

  const turno = (datos.turno ?? alumno?.grupo?.turno?.nombre ?? "").toUpperCase();

  const semestreActual =
    semestreEnLetra(datos.semestre) ||
    semestreEnLetra(alumno?.grupo?.semestre?.numero);

  // Un bloque por semestre cursado, con el ciclo en que se cursó.
  const bloques = new Map<number, { ciclo: string; filas: any[] }>();

  for (const c of calificaciones ?? []) {
    const n = c.materia?.semestre?.numero ?? 0;

    if (!bloques.has(n)) {
      bloques.set(n, { ciclo: c.cicloEscolar?.nombre ?? "", filas: [] });
    }

    bloques.get(n)!.filas.push(c);
  }

  const ordenados = [...bloques.entries()].sort((a, b) => a[0] - b[0]);

  const htmlBloque = ([n, b]: [number, { ciclo: string; filas: any[] }]) => `
    <div class="bloque">
      <p class="titulo-sem">
        <span>${semestreEnLetra(n) || "SEMESTRE"}</span>
        <span class="ciclo">${b.ciclo}</span>
      </p>

      <table>
        ${b.filas
          .sort((x, y) =>
            (x.materia?.nombre ?? "").localeCompare(y.materia?.nombre ?? "")
          )
          .map(
            (c) => `
              <tr>
                <td class="materia">${c.materia?.nombre ?? "—"}</td>
                <td class="nota">${c.notaDefinitiva ?? "—"}</td>
                <td class="estatus">${estatusImpreso(c)}</td>
                <td class="fecha">${
                  c.fecha
                    ? new Date(c.fecha).toISOString().slice(0, 10)
                    : ""
                }</td>
              </tr>`
          )
          .join("")}
      </table>
    </div>
  `;

  // Dos columnas que fluyen por renglón: 1º izquierda, 2º derecha,
  // 3º otra vez izquierda. Es como se acomoda en el documento impreso.
  const columnas = ordenados.map(htmlBloque).join("");

  const numericas = (calificaciones ?? [])
    .map((c) => numero(c.notaDefinitiva))
    .filter((n): n is number => n !== null);

  const promedio = numericas.length
    ? redondeoEscolar(numericas.reduce((a, b) => a + b, 0) / numericas.length)
    : null;

  const pagina = `
    <p class="matricula">MATRICULA: ${alumno?.matricula ?? "—"}</p>

    <p class="encabezado-der">
      ${[semestreActual, turno].filter(Boolean).join(" ")}${
        bachillerato ? `, ${bachillerato}` : ""
      }
    </p>

    <p class="intro">
      Constancia de calificaciones que obtuvo el (la) joven <strong>${nombre}</strong>
      con el expediente ${ESCUELA.expediente}/${
        String(alumno?.matricula ?? "").slice(-6)
      } quien está cursando el bachillerato de ${bachillerato} en el ciclo
      escolar ${datos.ciclo ?? "—"}.
    </p>

    <div class="columnas">${columnas}</div>

    <div class="cierre">
      <p class="promedio">PROMEDIO GENERAL: ${promedio ?? "—"}</p>

      <p class="lugar-fecha">Zamora Michoacán, a ${fechaLarga()}</p>

      <div class="firma">
        <p>${ESCUELA.cargoDirector}</p>
        <p>${ESCUELA.director}</p>
      </div>

      <p class="nota-pie">
        Nota: La calificación mínima aprobatoria es 6 (SEIS).<br>
        ${ESCUELA.referencia}
      </p>
    </div>
  `;

  const estilos = `
    .contenido { font-family: Arial, Helvetica, sans-serif; font-size: 9pt; text-align:left; }
    .matricula { margin:0; font-weight:700; font-size:10pt; }
    .encabezado-der { position:absolute; top:0; right:0; margin:0; font-size:7.5pt; font-weight:700; text-align:right; max-width:9cm; }
    .intro { margin:.5cm 0 .6cm; text-align:justify; font-size:9.5pt; line-height:1.35; }
    .columnas { display:grid; grid-template-columns:1fr 1fr; gap:0 .7cm; align-items:start; }
    .bloque { margin-bottom:.45cm; break-inside:avoid; }
    .titulo-sem { margin:0 0 .1cm; font-weight:700; font-size:9pt; display:flex; gap:.4cm; }
    .titulo-sem .ciclo { font-weight:400; }
    .bloque table { width:100%; border-collapse:collapse; font-size:7.5pt; line-height:1.3; }
    .bloque td { padding:0 .1cm 0 0; vertical-align:top; }
    .bloque .materia { width:54%; }
    .bloque .nota { width:8%; text-align:right; padding-right:.15cm; }
    .bloque .estatus { width:20%; white-space:nowrap; }
    .bloque .fecha { width:18%; font-size:7pt; color:#333; white-space:nowrap; }
    /* Todo el cierre va anclado al pie: así la firma nunca pisa la fecha
       ni la nota, sin importar cuántos semestres tenga el alumno. */
    .cierre { position:absolute; bottom:0; left:0; right:0; }
    .promedio { margin:0 0 .7cm; font-weight:700; font-size:9.5pt; }
    .lugar-fecha { margin:0 0 .9cm; font-size:9.5pt; }
    .firma { text-align:center; margin:0 0 .8cm; }
    .firma p { margin:0; font-weight:700; font-size:10pt; line-height:1.35; }
    .nota-pie { margin:0; font-size:8.5pt; line-height:1.4; }
  `;

  return abrirHojaMembretada(
    `Calificaciones ${alumno?.matricula ?? ""}`,
    [pagina],
    estilos
  );
}
