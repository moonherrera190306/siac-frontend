import { API_URL } from "./config";

/**
 * 🔐 La sesión viaja en una cookie httpOnly.
 *
 * El token ya no se lee ni se guarda desde JavaScript: basta con
 * `credentials: "include"` para que el navegador la mande sola.
 */
export async function apiFetch(
  endpoint: string,
  options: RequestInit = {}
) {
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    ...(options.headers as Record<string, string>),
  };

  const response = await fetch(`${API_URL}${endpoint}`, {
    ...options,
    credentials: "include",
    headers,
  });

  // ✅ sesión expirada
  if (response.status === 401) {
    if (typeof window !== "undefined") {
      localStorage.removeItem("user");

      window.location.href = "/login";
    }

    throw new Error("Sesión expirada");
  }

  let data;

  try {
    data = await response.json();
  } catch {
    data = null;
  }

  // ✅ errores backend
  if (!response.ok) {
    throw new Error(
      data?.message || "Error interno del servidor"
    );
  }

  return data;
}
