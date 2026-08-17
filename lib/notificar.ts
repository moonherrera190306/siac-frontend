type Tipo = "info" | "exito" | "error" | "alerta";

/**
 * 🔔 Avisos — sustituyen a los `alert()` del navegador.
 *
 * Los estilos van EN LÍNEA a propósito. Vivían en globals.css y no
 * siempre se aplicaban: cuando eso pasa, el aviso aparece como texto
 * suelto al final de la página en vez de flotando en la esquina.
 * En línea no dependen del compilador de estilos.
 *
 * No necesita provider ni contexto: monta su propio contenedor.
 */

const COLORES: Record<Tipo, { borde: string; fondo: string; texto: string }> = {
  info: { borde: "#1d4ed8", fondo: "#ffffff", texto: "#0f172a" },
  exito: { borde: "#15803d", fondo: "#f0fdf4", texto: "#14532d" },
  alerta: { borde: "#f59e0b", fondo: "#fffbeb", texto: "#78350f" },
  error: { borde: "#b91c1c", fondo: "#fef2f2", texto: "#7f1d1d" },
};

const MAXIMO = 4;

let ultimo = { mensaje: "", cuando: 0 };

function contenedor(): HTMLElement {
  let caja = document.getElementById("siac-avisos");

  if (caja) return caja;

  caja = document.createElement("div");
  caja.id = "siac-avisos";

  Object.assign(caja.style, {
    position: "fixed",
    top: "1rem",
    right: "1rem",
    zIndex: "9999",
    display: "flex",
    flexDirection: "column",
    gap: "0.5rem",
    width: "min(24rem, calc(100vw - 2rem))",
    pointerEvents: "none",
  });

  document.body.appendChild(caja);

  return caja;
}

export function notificar(mensaje: string, tipo: Tipo = "info", ms = 4000) {
  if (typeof document === "undefined") return;

  const ahora = Date.now();

  // 🔇 El mismo mensaje repetido en menos de 2 segundos no se apila:
  // pulsar un botón tres veces no debe llenar la pantalla.
  if (mensaje === ultimo.mensaje && ahora - ultimo.cuando < 2000) return;

  ultimo = { mensaje, cuando: ahora };

  const caja = contenedor();

  // Nunca más de 4 en pantalla: el más viejo se va.
  while (caja.childElementCount >= MAXIMO) {
    caja.firstElementChild?.remove();
  }

  const color = COLORES[tipo];

  const aviso = document.createElement("div");
  aviso.setAttribute("role", tipo === "error" ? "alert" : "status");

  Object.assign(aviso.style, {
    display: "flex",
    alignItems: "flex-start",
    gap: "0.625rem",
    padding: "0.75rem 1rem",
    borderRadius: "0.75rem",
    background: color.fondo,
    color: color.texto,
    border: "1px solid #e2e8f0",
    borderLeft: `4px solid ${color.borde}`,
    boxShadow: "0 10px 25px rgba(15, 23, 42, 0.15)",
    fontSize: "0.875rem",
    lineHeight: "1.4",
    pointerEvents: "auto",
  });

  const texto = document.createElement("span");
  texto.textContent = mensaje;
  texto.style.flex = "1";

  const cerrar = document.createElement("button");
  cerrar.textContent = "×";
  cerrar.setAttribute("aria-label", "Cerrar aviso");

  Object.assign(cerrar.style, {
    border: "0",
    background: "transparent",
    color: color.texto,
    cursor: "pointer",
    fontSize: "1.125rem",
    lineHeight: "1",
    opacity: "0.6",
    padding: "0",
  });

  cerrar.onclick = () => aviso.remove();

  aviso.append(texto, cerrar);
  caja.appendChild(aviso);

  // Los errores duran más porque hay que leerlos, pero también se van:
  // avisos que nunca desaparecen terminan tapando la pantalla.
  setTimeout(() => aviso.remove(), tipo === "error" ? 9000 : ms);
}

export const avisoExito = (m: string) => notificar(m, "exito");
export const avisoError = (m: string) => notificar(m, "error");
