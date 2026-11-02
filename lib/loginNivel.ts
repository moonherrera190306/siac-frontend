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

export function rutaLogin(): string {
  try {
    return localStorage.getItem(CLAVE) === "UNIVERSIDAD"
      ? "/login/universidad"
      : "/login";
  } catch {
    return "/login";
  }
}

export const esRutaLogin = (pathname: string | null) =>
  pathname === "/login" || pathname === "/login/universidad";
