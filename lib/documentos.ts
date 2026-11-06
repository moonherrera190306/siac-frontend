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
  // Firmante por omisión; el catálogo completo está más abajo.
  director: "M. en E. CUAUHTÉMOC OROZCO GIL",
  cargoDirector: "DIRECTOR DE LA PREPARATORIA",

  // Iniciales del subdirector + año. Va al pie de cada constancia.
  referencia: "J.R.V.C/2026-0",
};

/**
 * ✍️ QUIÉN FIRMA
 *
 * Hay dos direcciones —preparatoria y universidad— y las constancias las
 * puede firmar cualquiera de los cuatro directivos. Quien genera el
 * documento elige; por eso esto es un catálogo y no una constante.
 */
export interface Firmante {
  clave: string;
  nombre: string;
  cargo: string;
}

export const FIRMANTES: Firmante[] = [
  {
    clave: "COG",
    nombre: "M. en E. CUAUHTÉMOC OROZCO GIL",
    cargo: "DIRECTOR DE LA PREPARATORIA",
  },
  {
    clave: "IOG",
    nombre: "LIC. IGOR OROZCO GIL",
    cargo: "DIRECTOR DE LA UNIVERSIDAD",
  },
  {
    clave: "JRVC",
    nombre: "JOSÉ RAMÓN VEGA CERDA",
    cargo: "SUBDIRECTOR",
  },
  {
    clave: "JFVD",
    nombre: "JUAN FERNANDO VELÁZQUEZ DURÁN",
    cargo: "COORDINADOR ACADÉMICO",
  },
];

export const firmantePorClave = (clave?: string): Firmante =>
  FIRMANTES.find((f) => f.clave === clave) ?? FIRMANTES[0];

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
   🔤 NOMBRES Y BACHILLERATOS COMO EN LOS DOCUMENTOS OFICIALES
========================================= */

const PARTICULAS = new Set(["DE", "DEL", "LA", "LAS", "LOS", "Y", "SAN", "SANTA"]);

/**
 * El SIAC guarda "NOMBRES APELLIDO1 APELLIDO2"; los documentos impresos
 * van "APELLIDO1 APELLIDO2 NOMBRES". Las partículas (DE, DEL, LA…) se
 * pegan al apellido que sigue: "MARIA DE LA LUZ DE LA CRUZ PEREZ".
 */
export function partirNombre(completo?: string | null): { apellidos: string; nombres: string } {
  const p = String(completo ?? "").trim().toUpperCase().split(/\s+/).filter(Boolean);
  if (p.length < 3) return { apellidos: p.slice(1).join(" "), nombres: p[0] ?? "" };

  const unidades: string[] = [];
  let i = p.length - 1;
  while (i >= 0 && unidades.length < 2) {
    let u = p[i--];
    while (i >= 1 && PARTICULAS.has(p[i])) u = `${p[i--]} ${u}`;
    unidades.unshift(u);
  }
  const nombres = p.slice(0, i + 1).join(" ");
  if (!nombres) return { apellidos: unidades.slice(0, -1).join(" "), nombres: unidades.at(-1) ?? "" };
  return { apellidos: unidades.join(" "), nombres };
}

/** "PEÑA DIEGO ALEJANDRO": apellidos primero. */
export function nombreOficial(completo?: string | null): string {
  const { apellidos, nombres } = partirNombre(completo);
  return [apellidos, nombres].filter(Boolean).join(" ") || "—";
}

const AREAS: Record<string, string> = {
  CQB: "CIENCIAS QUÍMICO BIOLÓGICAS",
  CSH: "CIENCIAS SOCIALES Y HUMANIDADES",
  IA: "INGENIERÍA Y ARQUITECTURA",
  CEA: "CIENCIAS ECONÓMICO ADMINISTRATIVAS",
};

/**
 * Del nombre del grupo al bachillerato impreso:
 *   "3C TR-IA-09"     → "TR. INGENIERÍA Y ARQUITECTURA 09"
 *   "5E AP-CQB-11-1"  → "ÁREA PROP. CIENCIAS QUÍMICO BIOLÓGICAS 11-1"
 *   "2A" (1° y 2°)    → "TRONCO COMÚN"
 */
export function bachilleratoDeGrupo(grupo?: string | null, respaldo?: string | null): string {
  const g = String(grupo ?? "").toUpperCase();
  const m = g.match(/\b(TR|AP)-([A-Z]+)-(\d+(?:-\d+)?)/);
  if (m) return `${m[1] === "TR" ? "TR." : "ÁREA PROP."} ${AREAS[m[2]] ?? m[2]} ${m[3]}`;
  if (/DER/.test(g)) return "LICENCIATURA EN DERECHO";
  if (/^[12]\s*[A-Z]\b/.test(g.trim())) return "TRONCO COMÚN";
  return (respaldo ?? "").toUpperCase() || "TRONCO COMÚN";
}

/** Letra del grupo: "3E TR-CQB-11-1" → "E". */
const letraGrupo = (grupo?: string | null) =>
  String(grupo ?? "").trim().toUpperCase().match(/^\d+\s*([A-Z])/)?.[1] ?? "";

/**
 * Hoja tamaño carta sin membrete (recibo, kardex). Los documentos de
 * caja y de control escolar se imprimen en papel blanco.
 */
function abrirHojaSimple(
  titulo: string,
  paginas: string[],
  estilos: string,
  horizontal = false
): boolean {
  const v = window.open("", "_blank", "width=1000,height=1000");
  if (!v) return false;

  const ancho = horizontal ? "27.94cm" : "21.59cm";
  const alto = horizontal ? "21.59cm" : "27.94cm";
  const origen = window.location.origin;

  v.document.write(`<!doctype html>
<html lang="es">
<head>
<meta charset="utf-8">
<title>${titulo}</title>
<base href="${origen}/">
<style>
  * { box-sizing: border-box; }
  body { margin:0; padding:24px 0; background:#e2e8f0; color:#000; font-family: Arial, Helvetica, sans-serif; }
  .hoja { position:relative; width:${ancho}; height:${alto}; margin:0 auto 24px; background:#fff; box-shadow:0 4px 16px rgba(15,23,42,.18); overflow:hidden; }
  @media print {
    @page { size: letter ${horizontal ? "landscape" : "portrait"}; margin:0; }
    html { -webkit-print-color-adjust:exact; print-color-adjust:exact; }
    body { background:#fff; padding:0; }
    .hoja { margin:0; box-shadow:none; page-break-after:always; }
    .hoja:last-child { page-break-after:auto; }
    .no-imprimir { display:none !important; }
  }
  ${estilos}
</style>
</head>
<body>
  ${paginas.map((p) => `<div class="hoja">${p}</div>`).join("")}
  <p class="no-imprimir" style="text-align:center;color:#475569;font-size:13px">
    Usa Ctrl+P para imprimir o guardar como PDF${horizontal ? " (orientación horizontal)" : ""}.
  </p>
  <script>window.onload = () => setTimeout(() => window.print(), 400);</script>
</body>
</html>`);
  v.document.close();
  return true;
}

/* =========================================
   🧾 TICKET DE CAJA (IMPRESORA TÉRMICA)
   Rollo de 80 mm. Todo en negro, sin fondos: la térmica no imprime
   grises y el texto fino se pierde.
========================================= */

/** Ancho del rollo en mm. 80 es el estándar; cambiar a 58 si la impresora es chica. */
export const ANCHO_TICKET_MM = 80;

const pesos = (n: number) =>
  n.toLocaleString("es-MX", { minimumFractionDigits: 2, maximumFractionDigits: 2 });

/**
 * Abre la ventana del ticket ANTES de cobrar: si se abre después de
 * esperar al servidor, el navegador la toma como emergente y la bloquea.
 */
export function prepararVentanaTicket(): Window | null {
  const v = window.open("", "_blank", "width=420,height=720");
  if (v) {
    v.document.write('<p style="font:14px system-ui;text-align:center;margin-top:40px">Registrando cobro…</p>');
  }
  return v;
}

export function abrirRecibo(pago: any, ventana?: Window | null): boolean {
  const v = ventana ?? window.open("", "_blank", "width=420,height=720");
  if (!v) return false;

  const alumno =
    pago.alumno ??
    (pago.exalumnoNombre
      ? { matricula: pago.exalumnoMatricula, user: { name: pago.exalumnoNombre } }
      : {});

  const nombre = nombreOficial(String(alumno.user?.name ?? "").replace(/\s*\(exalumno\)\s*$/i, ""));
  const detalles = pago.detalles ?? [];
  const total = Number(pago.total ?? 0);
  const cancelado = pago.estado === "CANCELADO";
  const fecha = pago.pagadoEn ? new Date(pago.pagadoEn) : new Date();
  const dd = (n: number) => String(n).padStart(2, "0");
  const fechaCorta = `${dd(fecha.getDate())}/${dd(fecha.getMonth() + 1)}/${fecha.getFullYear()}`;
  const hora = `${dd(fecha.getHours())}:${dd(fecha.getMinutes())}`;

  const lineas = detalles
    .map((d: any) => {
      const cant = Number(d.cantidad ?? 1);
      const importe = Number(d.monto ?? 0) * cant;
      return `
        <div class="concepto">
          <span>${cant > 1 ? `${cant} x ` : ""}${(d.concepto?.nombre ?? "CONCEPTO").toUpperCase()}</span>
          <span>$${pesos(importe)}</span>
        </div>
        ${d.descripcion ? `<div class="desc">${d.descripcion}</div>` : ""}`;
    })
    .join("");

  const origen = window.location.origin;

  v.document.open();
  v.document.write(`<!doctype html>
<html lang="es">
<head>
<meta charset="utf-8">
<title>Ticket ${pago.folio ?? ""}</title>
<base href="${origen}/">
<style>
  @page { size: ${ANCHO_TICKET_MM}mm auto; margin: 0; }
  * { box-sizing: border-box; }
  html, body { margin: 0; padding: 0; background: #fff; color: #000; }
  body { font-family: "Courier New", Consolas, monospace; font-size: 12px; line-height: 1.3; }
  .ticket { width: ${ANCHO_TICKET_MM}mm; padding: 4mm ${ANCHO_TICKET_MM >= 80 ? 4 : 2}mm 8mm; }
  .centro { text-align: center; }
  .escudo { width: 22mm; filter: grayscale(1) contrast(1.6); }
  .inst { font-family: Arial, Helvetica, sans-serif; font-weight: 700; font-size: 13px; line-height: 1.15; margin: 2mm 0 1mm; }
  .chico { font-size: 10.5px; }
  .sep { border: 0; border-top: 1px dashed #000; margin: 2.5mm 0; }
  .fila { display: flex; justify-content: space-between; gap: 2mm; }
  .folio { font-size: 16px; font-weight: 700; }
  .nombre { font-weight: 700; font-size: 12.5px; margin-top: 1mm; }
  .concepto { display: flex; justify-content: space-between; gap: 2mm; font-weight: 700; }
  .desc { font-size: 10.5px; margin: 0 0 1mm 2mm; }
  .total { display: flex; justify-content: space-between; font-size: 18px; font-weight: 700; border-top: 2px solid #000; border-bottom: 2px solid #000; padding: 1.5mm 0; margin-top: 2mm; }
  .letra { font-size: 10px; margin-top: 1.5mm; }
  .cancelado { border: 3px solid #000; text-align: center; font-size: 20px; font-weight: 700; letter-spacing: 3px; padding: 1mm; margin: 2mm 0; }
  .pie { font-size: 10px; margin-top: 3mm; }
  @media screen { body { background: #e5e7eb; } .ticket { background: #fff; margin: 12px auto; box-shadow: 0 2px 10px rgba(0,0,0,.2); } }
</style>
</head>
<body>
  <div class="ticket">
    <div class="centro">
      <img class="escudo" src="/escudo-umsnh.png" alt="" onerror="this.style.display='none'">
      <p class="inst">CENTRO DE ESTUDIOS<br>SUPERIORES DE ZAMORA</p>
      <div class="chico">R.F.C. ${ESCUELA.rfc}</div>
      <div class="chico">Dr. Alonso Martínez #670<br>Fracc. Jardinadas, Zamora, Mich.</div>
    </div>

    <hr class="sep">

    <div class="fila"><span>FOLIO</span><span class="folio">${pago.folio ?? "—"}</span></div>
    <div class="fila"><span>FECHA</span><span>${fechaCorta} ${hora}</span></div>
    ${pago.libro ? `<div class="fila"><span>LIBRO</span><span>${pago.libro}</span></div>` : ""}
    ${pago.iniciales ? `<div class="fila"><span>CAJERO</span><span>${pago.iniciales}</span></div>` : ""}

    <hr class="sep">

    <div class="fila"><span>MATRÍCULA</span><span>${alumno.matricula ?? ""}</span></div>
    <div class="nombre">${nombre}</div>
    ${alumno.grupo?.nombre ? `<div class="chico">GRUPO ${alumno.grupo.nombre}</div>` : ""}

    <hr class="sep">

    ${lineas || '<div class="chico">Sin conceptos</div>'}

    <div class="total"><span>TOTAL</span><span>$${pesos(total)}</span></div>
    <div class="letra">${importeConLetra(total)}</div>
    <div class="fila chico" style="margin-top:1.5mm"><span>PAGO</span><span>${pago.metodo ?? ""}${pago.referencia ? ` · ${pago.referencia}` : ""}</span></div>

    ${cancelado ? `<div class="cancelado">CANCELADO</div><div class="chico">${pago.motivoCancela ?? ""}</div>` : ""}

    <hr class="sep">
    <div class="centro pie">Conserve este ticket para cualquier aclaración.<br>¡Gracias!</div>
  </div>
  <script>
    // Se espera al escudo para que salga en la impresión.
    const img = document.querySelector(".escudo");
    const listo = () => setTimeout(() => { window.focus(); window.print(); }, 200);
    if (!img || img.complete) listo(); else { img.onload = listo; img.onerror = listo; }
  </script>
</body>
</html>`);
  v.document.close();
  return true;
}

/* =========================================
   📒 KARDEX — REGISTRO DE CALIFICACIONES
   Hoja horizontal; tres semestres por hoja, como el impreso.
========================================= */

export function abrirKardex(alumno: any, calificaciones: any[], inscripciones: any[] = []): boolean {
  const { apellidos, nombres } = partirNombre(alumno?.user?.name);
  const universidad = /DER/i.test(alumno?.grupo?.nombre ?? "") || /DERECHO/i.test(alumno?.carrera?.nombre ?? "");
  const titulo = universidad
    ? "CENTRO DE ESTUDIOS SUPERIORES DE ZAMORA. REGISTRO DE CALIFICACIONES (KARDEX)"
    : "ESCUELA PREPARATORIA POR COOPERACIÓN DE ZAMORA. REGISTRO DE CALIFICACIONES (KARDEX)";

  const fecha = (v: any) => (v ? new Date(v).toISOString().slice(0, 10) : "");
  const inicio = (c: any) => new Date(c.cicloEscolar?.fechaInicio ?? c.cicloEscolar?.createdAt ?? 0).getTime();

  // Grupo en que estuvo inscrito en cada ciclo.
  const grupoDeCiclo = new Map<string, string>();
  for (const i of inscripciones ?? []) {
    if (i.cicloEscolarId && i.grupo?.nombre) grupoDeCiclo.set(i.cicloEscolarId, i.grupo.nombre);
  }

  // Una fila por materia: el primer intento y hasta dos recursamientos.
  const porMateria = new Map<string, any[]>();
  for (const c of calificaciones ?? []) {
    const k = c.materiaId ?? c.materia?.id;
    if (!porMateria.has(k)) porMateria.set(k, []);
    porMateria.get(k)!.push(c);
  }

  const semestres = new Map<number, { ciclo: any; filas: any[][] }>();
  for (const intentos of porMateria.values()) {
    intentos.sort((a, b) => inicio(a) - inicio(b));
    const n = intentos[0].materia?.semestre?.numero ?? 0;
    if (!semestres.has(n)) semestres.set(n, { ciclo: intentos[0].cicloEscolar, filas: [] });
    semestres.get(n)!.filas.push(intentos);
  }

  const v = (x: any) => (x ?? "") === null ? "" : String(x ?? "");

  const bloque = (n: number, b: { ciclo: any; filas: any[][] }) => {
    const grupo = grupoDeCiclo.get(b.ciclo?.id) ?? "";
    const etiqueta = universidad ? (alumno?.carrera?.nombre ?? "").toUpperCase() : bachilleratoDeGrupo(grupo, n <= 2 ? "TRONCO COMÚN" : alumno?.trayectoria?.nombre);
    const letra = letraGrupo(grupo);
    const filas = b.filas
      .sort((x, y) => String(x[0].materia?.clave ?? x[0].materia?.nombre ?? "").localeCompare(String(y[0].materia?.clave ?? y[0].materia?.nombre ?? "")))
      .map((intentos) => {
        const [c, r1, r2] = intentos;
        const ultimo = intentos[intentos.length - 1];
        return `<tr>
          <td class="mat">${(c.materia?.nombre ?? "—").toUpperCase()}</td>
          <td>${v(c.primerParcial)}</td><td>${v(c.segundoParcial)}</td><td>${v(c.promedio)}</td>
          <td>${v(c.examenFinal)}</td><td>${v(c.notaFinal)}</td><td>${v(c.extraordinario)}</td><td>${v(c.adicional)}</td>
          <td>${v(r1?.notaFinal)}</td><td>${v(r1?.extraordinario)}</td><td>${v(r1?.especial)}</td>
          <td>${v(r2?.notaFinal)}</td><td>${v(r2?.extraordinario)}</td><td>${v(r2?.especial)}</td>
          <td></td><td>${v(ultimo.articulo)}</td>
          <td class="fecha">${intentos.length > 1 ? fecha(ultimo.updatedAt) : ""}</td>
          <td>${v(ultimo.notaDefinitiva)}</td>
          <td class="est">${estatusImpreso(ultimo)}</td>
          <td class="obs"></td>
        </tr>`;
      })
      .join("");

    return `
      <div class="bloque">
        <div class="cab-bloque">
          <span class="etiqueta">${etiqueta}</span>
          <span class="semestre">${semestreEnLetra(n) || "SEMESTRE"}${letra ? ` "${letra}"` : ""} &nbsp; ${b.ciclo?.nombre ?? ""}</span>
        </div>
        <table>
          <colgroup><col class="c-mat">${'<col class="c-n">'.repeat(14)}<col class="c-art"><col class="c-fecha"><col class="c-n"><col class="c-est"><col class="c-obs"></colgroup>
          <thead><tr>
            <th class="mat">Materias</th><th>PP</th><th>SP</th><th>PROM</th><th>EF</th><th>O</th><th>EE</th><th>EA</th>
            <th class="osc">O</th><th class="osc">E</th><th class="osc">EER</th>
            <th>O</th><th>E</th><th>EER</th>
            <th class="osc">NPA</th><th class="osc">Artículo</th><th>Fecha</th><th>ND</th><th>Estatus</th><th>Observaciones</th>
          </tr></thead>
          <tbody>${filas}</tbody>
        </table>
      </div>`;
  };

  const ordenados = [...semestres.entries()].sort((a, b) => a[0] - b[0]);
  const grupos: [number, any][][] = [];
  for (let i = 0; i < ordenados.length; i += 3) grupos.push(ordenados.slice(i, i + 3));
  if (!grupos.length) grupos.push([]);

  const anioIngreso = (() => {
    const primero = [...(calificaciones ?? [])].sort((a, b) => inicio(a) - inicio(b))[0];
    const anio = primero?.cicloEscolar?.nombre?.match(/\d{4}/)?.[0];
    return anio ? anio.slice(2) : "";
  })();

  const encabezado = `
    <p class="titulo">${titulo}</p>
    <div class="datos">
      <div>
        <p><b>APELLIDOS:</b> ${apellidos}</p>
        <p><b>NOMBRE:</b> ${nombres}</p>
        <p><b>MATRÍCULA:</b> ${alumno?.matricula ?? ""} &nbsp; <b>EXPEDIENTE:</b> ${String(alumno?.matricula ?? "").slice(-6)}</p>
        <p><b>SITUACIÓN ACADÉMICA:</b> ${alumno?.estatusAcademico === "ACTIVO" ? "REGULAR" : (alumno?.estatusAcademico ?? "")}</p>
        <p><b>AÑO DE INGRESO:</b> ${anioIngreso}</p>
      </div>
      <div>
        <p><b>LUGAR DE NACIMIENTO:</b> ${[alumno?.ciudad, alumno?.estado].filter(Boolean).join(", ").toUpperCase()}</p>
        <p><b>F. DE NACIMIENTO:</b> ${fecha(alumno?.fechaNacimiento)}</p>
        <p><b>DOMICILIO:</b> ${(alumno?.direccion ?? "").toUpperCase()}</p>
        <p><b>SECUNDARIA:</b></p>
        <p><b>CURP:</b> ${(alumno?.curp ?? "").toUpperCase()}</p>
      </div>
      <div>
        <p><b>SEXO:</b> ${(alumno?.sexo ?? "").toUpperCase().slice(0, 1)}</p>
        <p><b>TUTOR:</b> ${(alumno?.tutorNombre ?? "").toUpperCase()}</p>
        <p><b>TEL. TUTOR:</b> ${alumno?.tutorTelefono ?? ""}</p>
        <p><b>CEL. ALUMNO:</b> ${alumno?.telefono ?? ""}</p>
      </div>
    </div>
    <p class="calif">C A L I F I C A C I O N E S</p>
    <p class="leyenda">P.P. 1er Parcial, S.P. 2do Parcial, PROM. Promedio, E.F. Examen Final, O. Ordinario, E.E. Extraordinario, E.A. Adicional, NPA Nota Por Artículo, N.D. Nota Definitiva</p>
  `;

  const paginas = grupos.map((g, i) => `
    <div class="pag">
      ${universidad ? "" : bannerPrepa("10cm")}
      ${i === 0 ? encabezado : `<p class="titulo">${titulo}</p>`}
      ${g.map(([n, b]) => bloque(n, b)).join("")}
      <p class="pie">Página ${i + 1}/${grupos.length}</p>
    </div>`);

  const estilos = `
    ${ESTILO_BANNER}
    .pag { position:absolute; inset:.7cm 1.2cm 1.2cm; font-size:7pt; }
    .titulo { text-align:center; font-weight:700; font-size:9pt; margin:0 0 .25cm; }
    .datos { display:grid; grid-template-columns:1.1fr 1.3fr 1fr; gap:.4cm; font-size:7pt; }
    .datos p { margin:0 0 1px; }
    .calif { text-align:center; font-weight:700; font-size:9pt; letter-spacing:2px; margin:.25cm 0 0; }
    .leyenda { text-align:center; font-size:6.5pt; margin:0 0 .2cm; }
    .bloque { margin-bottom:.3cm; }
    .cab-bloque { display:flex; font-weight:700; font-size:7.5pt; margin-bottom:1px; }
    .cab-bloque .etiqueta { width:7.2cm; }
    .cab-bloque .semestre { flex:1; text-align:left; padding-left:.3cm; }
    table { width:100%; border-collapse:collapse; table-layout:fixed; }
    th, td { border:1px solid #000; padding:0 2px; height:.36cm; text-align:center; font-size:6.8pt; white-space:nowrap; overflow:hidden; }
    th { font-weight:700; }
    th.osc { background:#4b4b4b; color:#fff; }
    .mat { text-align:left; }
    .est, .obs { text-align:left; }
    .c-mat { width:7.2cm; } .c-n { width:.62cm; } .c-art { width:1.15cm; } .c-fecha { width:1.5cm; } .c-est { width:1.7cm; } .c-obs { width:2.4cm; }
    .pie { position:absolute; bottom:-.6cm; left:0; right:0; text-align:center; font-size:7pt; }
  `;

  return abrirHojaSimple(`Kardex ${alumno?.matricula ?? ""}`, paginas, estilos, true);
}

/* =========================================
   🏛️ ENCABEZADOS POR NIVEL
========================================= */

export const esUniversidad = (alumno: any) =>
  /DER/i.test(alumno?.grupo?.nombre ?? "") || /DERECHO|LICENCIATURA/i.test(alumno?.carrera?.nombre ?? "");

const TITULO_NIVEL = {
  UNIVERSIDAD: ["ESCUELA DE DERECHO", "DE ZAMORA INCORPORADA A LA", "UNIVERSIDAD MICHOACANA DE SAN NICOLÁS DE HIDALGO"],
  PREPARATORIA: ["ESCUELA PREPARATORIA POR COOPERACIÓN", "DE ZAMORA INCORPORADA A LA", "UNIVERSIDAD MICHOACANA DE SAN NICOLÁS DE HIDALGO"],
};

const escudoUMSNH = (clase = "escudo-umsnh") =>
  `<img class="${clase}" src="/escudo-umsnh.png" alt="" onerror="this.onerror=null;this.src='/escudo-prepa.png'">`;

const encabezadoInstitucional = (universidad: boolean, serif = false) => `
  <div class="enc-inst">
    ${escudoUMSNH()}
    <div class="enc-titulo${serif ? " serif" : ""}">${(universidad ? TITULO_NIVEL.UNIVERSIDAD : TITULO_NIVEL.PREPARATORIA).join("<br>")}</div>
  </div>`;

const ESTILO_ENC = `
  .enc-inst { position:relative; text-align:center; min-height:2.3cm; }
  .enc-inst .escudo-umsnh { position:absolute; left:0; top:0; width:2.2cm; filter:grayscale(1) contrast(1.15); }
  .enc-titulo { font-weight:700; font-size:12pt; line-height:1.2; padding:0 2.4cm; }
  .enc-titulo.serif { font-family:"Times New Roman", Georgia, serif; }
`;

/** Encabezado membretado de la prepa (franja azul con escudo de la UMSNH). */
const bannerPrepa = (ancho = "14cm") =>
  `<div class="banner-prepa"><img src="/membrete-banner.png" alt="" style="width:${ancho}"></div>`;

const ESTILO_BANNER = `
  .banner-prepa { text-align:center; margin:0 0 .25cm; }
  .banner-prepa img { display:inline-block; height:auto; }
`;

const ORDINAL_CORTO = ["", "1ro.", "2do.", "3ro.", "4to.", "5to.", "6to.", "7mo.", "8vo.", "9no.", "10mo."];

/* =========================================
   📒 BOLETA DE CALIFICACIONES Y ASISTENCIAS (UNIVERSIDAD)
   El "kardex" del semestre que entrega la Escuela de Derecho.
========================================= */

export function abrirBoletaDerecho(
  alumno: any,
  calificaciones: any[],
  asistencias: any[] = [],
  inscripciones: any[] = [],
  cicloId?: string
): boolean {
  const inicio = (c: any) => new Date(c?.cicloEscolar?.fechaInicio ?? c?.cicloEscolar?.createdAt ?? 0).getTime();
  const ciclos = [...new Map((calificaciones ?? []).map((c) => [c.cicloEscolarId, c.cicloEscolar])).values()]
    .sort((a: any, b: any) => inicio({ cicloEscolar: b }) - inicio({ cicloEscolar: a }));
  const ciclo: any = ciclos.find((c: any) => c?.id === cicloId) ?? ciclos[0];

  const delCiclo = (calificaciones ?? [])
    .filter((c) => c.cicloEscolarId === ciclo?.id)
    .sort((a, b) => String(a.materia?.clave ?? a.materia?.nombre).localeCompare(String(b.materia?.clave ?? b.materia?.nombre)));
  const asis = new Map((asistencias ?? []).filter((a) => a.cicloEscolarId === ciclo?.id).map((a) => [a.materiaId, a]));

  const grupo = (inscripciones ?? []).find((i) => i.cicloEscolarId === ciclo?.id)?.grupo?.nombre ?? alumno?.grupo?.nombre ?? "";
  const semestre = delCiclo[0]?.materia?.semestre?.numero ?? Number(String(grupo).match(/^\d+/)?.[0] ?? 0);
  const v = (x: any) => (x == null ? "" : String(x));
  const vacias = (n: number, cols: number) => `<tr>${"<td>&nbsp;</td>".repeat(cols)}</tr>`.repeat(n);

  const calif = delCiclo.map((c) => `<tr>
      <td class="mat">${(c.materia?.nombre ?? "").toUpperCase()}</td>
      <td>${v(c.primerParcial)}</td><td>${v(c.segundoParcial)}</td><td>${v(c.promedio)}</td>
      <td>${v(c.examenFinal)}</td><td>${v(c.notaFinal)}</td><td>${v(c.extraordinario)}</td>
      <td>${v(c.adicional)}</td><td>${v(c.especial)}</td></tr>`).join("");

  const asistencia = delCiclo.map((c) => {
    const a: any = asis.get(c.materiaId);
    const total = a ? [1, 2, 3, 4].reduce((s, m) => s + (a[`asisMes${m}`] ?? 0) + (a[`faltasMes${m}`] ?? 0), 0) : 0;
    const faltas = a ? [1, 2, 3, 4].reduce((s, m) => s + (a[`faltasMes${m}`] ?? 0), 0) : 0;
    const mes = (m: number) => a && (a[`asisMes${m}`] || a[`faltasMes${m}`]) ? `<td>${a[`asisMes${m}`]}</td><td>${a[`faltasMes${m}`]}</td>` : "<td></td><td></td>";
    return `<tr><td class="mat">${(c.materia?.nombre ?? "").toUpperCase()}</td>${[1, 2, 3, 4].map(mes).join("")}<td>${total ? ((faltas / total) * 100).toFixed(1) : ""}</td></tr>`;
  }).join("");

  const pagina = `
    <div class="pag">
      ${encabezadoInstitucional(true)}
      <div class="datos">
        <div><p><b>ALUMNO:</b> <span>${nombreOficial(alumno?.user?.name)}</span></p>
             <p><b>SEMESTRE:</b> <span>${ORDINAL_CORTO[semestre] ?? ""}</span> <b class="grupo">GRUPO:</b> ${letraGrupo(grupo)}</p>
             <p><b>MATRÍCULA:</b> ${alumno?.matricula ?? ""}</p></div>
        <div><p><b>AVISO:</b></p><p><b>CICLO ESCOLAR:</b> ${ciclo?.nombre ?? ""}</p></div>
      </div>

      <p class="sub">CALIFICACIONES</p>
      <table class="cal">
        <thead><tr><th class="mat">Materia</th><th>1er Parcial</th><th>2do Parcial</th><th>Promedio</th><th>Examen final</th><th>Nota final</th><th>Extraordinario</th><th>Adicional</th><th>Especial</th></tr></thead>
        <tbody>${calif}${vacias(3, 9)}</tbody>
      </table>
      <p class="leyenda">Columna "Promedio": (1er Parcial + 2do Parcial) / 2<br>Columna "Nota final": (Examen final + Promedio) / 2<br>Columna "Extraordinario": Nota obtenida en el examen<br>Columna "Adicional": Nota obtenida en el examen<br>Columna "Especial": Nota obtenida en el examen</p>

      <p class="sub">ASISTENCIAS</p>
      <table class="asis">
        <thead>
          <tr><th rowspan="2" class="mat">Materia</th><th colspan="2">1er mes</th><th colspan="2">2do mes</th><th colspan="2">3er mes</th><th colspan="2">4to mes</th><th rowspan="2">% Faltas</th></tr>
          <tr>${"<th>Asist.</th><th>Falta</th>".repeat(4)}</tr>
        </thead>
        <tbody>${asistencia}${vacias(3, 10)}</tbody>
      </table>

      <div class="firma"><p>Zamora Michoacán</p><p>DIRECTOR DE LA ESCUELA DE DERECHO</p><p>M. en D. IGOR OROZCO GIL</p></div>
      <p class="pie">Página 1/1</p>
    </div>`;

  const estilos = `
    ${ESTILO_ENC}
    .pag { position:absolute; inset:1.2cm 1.4cm 1.2cm; font-size:8.5pt; }
    .datos { display:flex; gap:2cm; margin:.4cm 0 .1cm 1.2cm; font-size:8pt; }
    .datos p { margin:0; } .datos .grupo { margin-left:1.5cm; }
    .sub { text-align:center; font-weight:700; letter-spacing:4px; margin:.2cm 0 .05cm; }
    table { width:100%; border-collapse:collapse; }
    th, td { border:1px solid #000; padding:1px 3px; text-align:center; font-size:8pt; height:.42cm; }
    th { font-weight:400; } .mat { text-align:left; width:38%; }
    .asis td, .asis th { height:.5cm; }
    .leyenda { margin:.1cm 0 .3cm; font-size:7.5pt; line-height:1.25; }
    .firma { position:absolute; bottom:1.4cm; left:0; right:0; text-align:center; font-weight:700; font-size:9.5pt; }
    .firma p { margin:0; }
    .pie { position:absolute; bottom:0; left:0; right:0; text-align:center; font-style:italic; font-size:8pt; }
  `;

  return abrirHojaSimple(`Calificaciones ${alumno?.matricula ?? ""}`, [pagina], estilos);
}

/* =========================================
   📋 LISTAS POR GRUPO PARA EL MAESTRO
   PARCIALES: hoja para capturar 1er y 2do parcial a mano.
   FINAL: concentrado con faltas y promedio, para el examen final.
========================================= */

export function abrirListaGrupo(rejilla: any, modo: "PARCIALES" | "FINAL" = "PARCIALES"): boolean {
  const a = rejilla?.asignacion ?? {};
  const universidad = /DER/i.test(a.grupo ?? "");
  const alumnos = [...(rejilla?.alumnos ?? [])]
    .map((x: any) => ({ ...x, oficial: nombreOficial(x.nombre) }))
    .sort((x: any, y: any) => x.oficial.localeCompare(y.oficial, "es"));

  const grupoTexto = `${semestreEnLetra(a.semestre) || ""} ${letraGrupo(a.grupo) || a.grupo || ""}`.trim();
  const ahora = new Date();
  const sello = `${String(ahora.getDate()).padStart(2, "0")}-${String(ahora.getMonth() + 1).padStart(2, "0")}-${ahora.getFullYear()} ${ahora.toTimeString().slice(0, 8)}`;

  const columnas = modo === "PARCIALES"
    ? ["Primer Parcial", "Segundo Parcial", "Promedio", "Observaciones"]
    : ["Faltas", "Prom.", "E. Final", "Prom.Fin", "Extra.", "E.E.R.", "Fecha", "Comentarios"];

  const POR_HOJA = universidad ? 40 : 34;
  const filas = alumnos.map((x: any, i: number) => {
    const celdas = modo === "PARCIALES"
      ? `<td></td><td></td><td></td><td class="obs"></td>`
      : `<td class="pct">${x.faltasPct != null ? `${Number(x.faltasPct).toFixed(0)} ` : ""}%</td><td>${x.PROM ?? ""}</td><td></td><td></td><td></td><td></td><td></td><td class="obs"></td>`;
    return `<tr><td class="num">${i + 1}</td><td class="nom">${x.oficial}</td>${celdas}</tr>`;
  });

  const hojas: string[][] = [];
  for (let i = 0; i < Math.max(filas.length, 1); i += POR_HOJA) hojas.push(filas.slice(i, i + POR_HOJA));

  const paginas = hojas.map((trozo, h) => `
    <div class="pag">
      ${modo === "FINAL" ? `<p class="sello">${sello}</p>` : ""}
      ${universidad ? encabezadoInstitucional(true, true) : bannerPrepa("13cm")}
      <div class="meta">
        <div>
          <p><b>Ciclo Escolar:</b> ${a.ciclo ?? ""}</p>
          <p><b>Nombre:</b> ${a.docente ?? ""}</p>
          <p><b>Materia:</b> ${(a.materia ?? "").toUpperCase()}</p>
          <p><b>Grupo:</b> ${grupoTexto}</p>
        </div>
        <p class="firma-linea"><b>Firma:</b> <span></span></p>
      </div>
      <table class="${modo === "PARCIALES" ? "parciales" : "final"}">
        <thead><tr><th class="num"></th><th class="nom"></th>${columnas.map((c) => `<th>${c}</th>`).join("")}</tr></thead>
        <tbody>${trozo.join("")}</tbody>
      </table>
      ${hojas.length > 1 ? `<p class="pie">Página ${h + 1}/${hojas.length}</p>` : ""}
    </div>`);

  const estilos = `
    ${ESTILO_ENC}
    ${ESTILO_BANNER}
    .pag { position:absolute; inset:1.1cm 1.4cm 1.2cm; font-size:8pt; }
    .pie { position:absolute; bottom:-.6cm; left:0; right:0; text-align:center; font-size:7.5pt; font-style:italic; }
    .sello { position:absolute; top:-.6cm; right:0; margin:0; font-size:7pt; }
    .meta { display:flex; justify-content:space-between; align-items:flex-end; margin:.3cm 0 .1cm; font-size:8pt; }
    .meta p { margin:0 0 1px; }
    .firma-linea span { display:inline-block; width:6cm; border-bottom:1px solid #000; }
    table { width:100%; border-collapse:collapse; }
    th { font-weight:400; font-size:8pt; padding:1px 3px; border:0; }
    td { border:1px solid #000; height:.48cm; padding:0 3px; font-size:8pt; text-align:center; }
    td.num { width:.6cm; text-align:right; }
    td.nom, th.nom { text-align:left; width:${modo === "PARCIALES" ? "40%" : "34%"}; white-space:nowrap; }
    td.pct { text-align:right; }
    .parciales td.obs { width:30%; } .final td.obs { width:18%; }
  `;

  return abrirHojaSimple(`Lista ${a.grupo ?? ""} ${a.materia ?? ""}`, paginas, estilos);
}

/* =========================================
   📜 CONSTANCIA DE ESTUDIOS (UNIVERSIDAD)
========================================= */

const NUM_LETRA = [
  "cero", "uno", "dos", "tres", "cuatro", "cinco", "seis", "siete", "ocho", "nueve", "diez",
  "once", "doce", "trece", "catorce", "quince", "dieciséis", "diecisiete", "dieciocho", "diecinueve", "veinte",
  "veintiuno", "veintidós", "veintitrés", "veinticuatro", "veinticinco", "veintiséis", "veintisiete",
  "veintiocho", "veintinueve", "treinta", "treinta y uno",
];

const anioEnLetra = (y: number) => {
  const r = y - 2000;
  return `dos mil${r ? " " + (NUM_LETRA[r] ?? String(r)) : ""}`;
};

/** "26 (veintiséis) de enero de 2026 (dos mil veintiséis)". */
export function fechaConLetra(v?: string | Date | null): string {
  if (!v) return "—";
  const d = new Date(v);
  if (isNaN(d.getTime())) return String(v);
  const dia = d.getUTCDate();
  return `${String(dia).padStart(2, "0")} (${NUM_LETRA[dia]}) de ${MESES[d.getUTCMonth()]} de ${d.getUTCFullYear()} (${anioEnLetra(d.getUTCFullYear())})`;
}

export function abrirConstanciaUniversidad(
  alumno: any,
  datos: { semestre?: number | null; materias?: string[]; inicioCurso?: string | Date | null; finCurso?: string | Date | null; referencia?: string } = {}
): boolean {
  const semestre = semestreEnLetra(datos.semestre ?? alumno?.grupo?.semestre?.numero) || "SEMESTRE";
  const hoy = new Date();
  const pagina = `
    <p class="destinatario">A QUIEN CORRESPONDA:</p>
    <p class="lugar-fecha">Zamora de Hidalgo, Michoacán, a ${String(hoy.getDate()).padStart(2, "0")} (${NUM_LETRA[hoy.getDate()]}) de ${MESES[hoy.getMonth()]} de ${hoy.getFullYear()} (${anioEnLetra(hoy.getFullYear())})</p>
    <p class="sangria">
      El que suscribe, Director de la Escuela de Derecho del <strong>CENTRO DE ESTUDIOS SUPERIORES DE ZAMORA, A.C.</strong>,
      con claves 154-218.1"97" y 16MSU0014T incorporada a la ${ESCUELA.universidad}, hace <strong>CONSTAR</strong>
      que el (la) joven: <strong>${nombreOficial(alumno?.user?.name)}</strong>, con número de matrícula
      <strong>${alumno?.matricula ?? "—"}</strong>, cursa en este plantel el <strong>${semestre}</strong> de la
      <strong>LICENCIATURA EN DERECHO.</strong> Con un periodo vacacional de 10 (diez) días en semana santa y semana de pascua;
      cursando las siguientes materias:
    </p>
    <p class="materias">${(datos.materias ?? []).map((m) => m.toUpperCase()).join("<br>")}</p>
    <p class="fechas">Inicio de curso: &nbsp;El ${fechaConLetra(datos.inicioCurso)}<br>Fin de curso: &nbsp;El ${fechaConLetra(datos.finCurso)}</p>
    <p class="sangria">Se extiende la presente constancia a solicitud del interesado(a) para los fines que mejor le convengan.</p>
    <p class="firma">M. en D. Igor Orozco Gil</p>
    <p class="referencia">${datos.referencia ?? `IOG/EASO/${hoy.getFullYear()}-01`}</p>
  `;

  const estilos = `
    .contenido { position:absolute; top:3.2cm; bottom:2.5cm; left:2.5cm; right:2.5cm; font-family:"Times New Roman", Georgia, serif; font-size:11.5pt; }
    .destinatario { margin:0 0 .6cm; }
    .lugar-fecha { text-align:right; margin:0 0 .6cm; }
    .sangria { text-indent:1.2cm; margin:0 0 .3cm; text-align:justify; line-height:1.35; }
    .materias { margin:0 0 .3cm; line-height:1.15; }
    .fechas { margin:0 0 .3cm 1.2cm; line-height:1.4; text-align:left; }
    .firma { position:absolute; bottom:4cm; left:0; right:0; text-align:center; margin:0; }
    .referencia { position:absolute; bottom:2.2cm; left:0; margin:0; font-size:10.5pt; font-style:italic; text-align:left; }
  `;

  // Derecho imprime en hoja blanca: el membrete de la prepa no le corresponde.
  return abrirHojaSimple(`Constancia ${alumno?.matricula ?? ""}`, [`<div class="contenido">${pagina}</div>`], estilos);
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
  | "BUENA_CONDUCTA" // fue alumno; observó buena conducta
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
  /** Clave del firmante (COG, IOG, JRVC, JFVD). Por omisión, el de prepa. */
  firmante?: string;
  /** Ciclos en que estuvo (buena conducta): "2024-2025 2025-2026". */
  ciclos?: string;
  /** Sin recuadro para la fotografía. */
  sinFoto?: boolean;
}

export function abrirConstancia(alumno: any, datos: DatosConstancia = {}): boolean {
  const tipo = datos.tipo ?? "TERMINADO";

  const firma = firmantePorClave(datos.firmante);

  const nombre = nombreOficial(alumno?.user?.name);

  const semestre =
    semestreEnLetra(datos.semestre) ||
    semestreEnLetra(alumno?.grupo?.semestre?.numero) ||
    "SEMESTRE";

  const bachillerato =
    datos.bachillerato ??
    bachilleratoDeGrupo(alumno?.grupo?.nombre, alumno?.trayectoria?.nombre ?? alumno?.carrera?.nombre);

  const turno = (
    datos.turno ??
    alumno?.grupo?.turno?.nombre ??
    ""
  ).toUpperCase();

  // El párrafo que cambia entre las tres variantes.
  const cuerpo =
    tipo === "BUENA_CONDUCTA"
      ? `
        Con número de matrícula <strong>${alumno?.matricula ?? "—"}</strong>,
        fue alumno en este plantel. Cursó el ${semestre}${turno ? ` turno ${turno}` : ""}
        en el bachillerato ${bachillerato}. En el (los) ciclo(s) escolares
        ${datos.ciclos ?? datos.ciclo ?? "—"} habiendo observado durante su estancia en el
        plantel <strong><u>BUENA CONDUCTA</u></strong>.
      `
      : tipo === "TERMINADO"
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
    tipo === "TERMINADO" || tipo === "BUENA_CONDUCTA"
      ? ""
      : `
        <p class="fechas">
          <strong>Inicio de curso:</strong> El ${datos.inicioCurso ?? "—"}<br>
          <strong>Fin de curso:</strong> El ${datos.finCurso ?? "—"}
        </p>
      `;

  const pagina = `
    <p class="destinatario">A QUIEN CORRESPONDA:</p>

    ${datos.sinFoto ? "" : '<div class="caja-foto"></div>'}

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
      <p>${firma.cargo}</p>
      <p>${firma.nombre}</p>
    </div>

    <p class="referencia">${ESCUELA.referencia}</p>

    ${datos.folioRecibo ? `<p class="folio">Recibo folio ${datos.folioRecibo}</p>` : ""}
  `;

  const estilos = `
    .contenido { font-family: "Times New Roman", Georgia, serif; font-size: 12pt; }
    .destinatario { margin:0; font-weight:400; }
    /* Recuadro para la fotografía, como en el formato impreso. */
    .caja-foto { position:absolute; top:0; right:0; width:2.6cm; height:2.6cm; border:1px dashed #999; }
    .lugar-fecha { text-align:right; margin:.9cm 3.2cm 1.1cm 0; }
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
  const nombre = nombreOficial(alumno?.user?.name);

  const firma = firmantePorClave(datos.firmante);

  const bachillerato =
    datos.bachillerato ??
    bachilleratoDeGrupo(alumno?.grupo?.nombre, alumno?.trayectoria?.nombre ?? alumno?.carrera?.nombre);

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
          // Orden del plan de estudios (clave), no alfabético.
          .sort((x, y) =>
            String(x.materia?.clave ?? x.materia?.nombre ?? "").localeCompare(
              String(y.materia?.clave ?? y.materia?.nombre ?? "")
            )
          )
          .map(
            (c) => `
              <tr>
                <td class="materia">${c.materia?.nombre ?? "—"}</td>
                <td class="nota">${c.notaDefinitiva ?? "—"}</td>
                <td class="estatus">${estatusImpreso(c)}</td>
                <td class="fecha">${
                  // La fecha solo se anota cuando hubo examen fuera del ordinario.
                  (c.extraordinario || c.adicional || c.especial) && (c.fecha || c.updatedAt)
                    ? new Date(c.fecha || c.updatedAt).toISOString().slice(0, 10)
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
        <p>${firma.cargo}</p>
        <p>${firma.nombre}</p>
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
