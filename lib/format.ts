/**
 * Utilidades que estaban reescritas en decenas de archivos:
 * normalizeData, formatMoney y toNumber vivían duplicadas en
 * casi cada pantalla, cada una con su propia variante.
 */

/** Acepta un array directo o `{ data: [...] }` y siempre devuelve un array. */
export function comoLista<T = any>(respuesta: any): T[] {
  if (Array.isArray(respuesta)) return respuesta;
  if (Array.isArray(respuesta?.data)) return respuesta.data;
  return [];
}

export function aNumero(valor: unknown, porDefecto = 0): number {
  const n = Number(valor);
  return Number.isFinite(n) ? n : porDefecto;
}

export function dinero(valor: unknown): string {
  return new Intl.NumberFormat("es-MX", {
    style: "currency",
    currency: "MXN",
  }).format(aNumero(valor));
}

export function fecha(valor: unknown): string {
  if (!valor) return "—";

  const d = new Date(valor as string);

  return isNaN(d.getTime()) ? "—" : d.toLocaleDateString("es-MX");
}

export function fechaHora(valor: unknown): string {
  if (!valor) return "—";

  const d = new Date(valor as string);

  return isNaN(d.getTime()) ? "—" : d.toLocaleString("es-MX");
}

/** Fecha de hoy en formato YYYY-MM-DD para los <input type="date">. */
export function hoyISO(): string {
  const d = new Date();
  const mes = String(d.getMonth() + 1).padStart(2, "0");
  const dia = String(d.getDate()).padStart(2, "0");
  return `${d.getFullYear()}-${mes}-${dia}`;
}
