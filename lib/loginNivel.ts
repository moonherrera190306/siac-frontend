/**
 * 🏫 Login por nivel.
 *
 * Preparatoria entra por /login y Universidad por /login/universidad.
 * Se recuerda por qué acceso entró el usuario para que, al cerrar
 * sesión o expirar, regrese a su misma pantalla de login.
 */

export type Nivel = "PREPARATORIA" | "UNIVERSIDAD";

const CLAVE = "loginNivel";

export function guardarNivelLogin(nivel: Nivel) {
  try {
    localStorage.setItem(CLAVE, nivel);
  } catch {}
}

/** Login del nivel recordado; sin nivel, la portada para elegir. */
export function rutaLogin(): string {
  try {
    const nivel = localStorage.getItem(CLAVE);
    if (nivel === "UNIVERSIDAD") return "/login/universidad";
    if (nivel === "PREPARATORIA") return "/login";
  } catch {}
  return "/";
}

/** Pantallas públicas: portada (/) y los dos logins. */
export const esRutaLogin = (pathname: string | null) =>
  pathname === "/" || pathname === "/login" || pathname === "/login/universidad";
