/**
 * URL base del backend SIAC.
 *
 * En producción se define NEXT_PUBLIC_API_URL en Vercel.
 * El fallback a localhost solo aplica en desarrollo.
 */
export const API_URL =
  process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4000";
