const API_URL = process.env.NEXT_PUBLIC_API_URL;

export async function apiFetch(
  endpoint: string,
  options: RequestInit = {}
) {
  const token =
    typeof window !== "undefined"
      ? localStorage.getItem("token")
      : null;

  // ✅ usar Record<string, string>
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    ...(options.headers as Record<string, string>),
  };

  // ✅ Authorization seguro
  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }

  const response = await fetch(`${API_URL}${endpoint}`, {
    ...options,
    headers,
  });

  // ✅ sesión expirada
  if (response.status === 401) {
    if (typeof window !== "undefined") {
      localStorage.removeItem("token");
      localStorage.removeItem("user");

      window.location.href = "/";
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