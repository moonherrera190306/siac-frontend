"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { API_URL } from "@/lib/config";

const HOME_POR_ROL: Record<string, string> = {
  ADMIN: "/administrador/dashboard",
  DIRECTOR: "/director/dashboard",
  SECRETARIA: "/secretaria/dashboard",
  CAJA: "/caja/dashboard",
  MAESTRO: "/maestro/dashboard",
  ALUMNO: "/alumno/dashboard",
};

export default function CambiarPasswordPage() {
  const router = useRouter();

  const [passwordActual, setPasswordActual] = useState("");
  const [passwordNueva, setPasswordNueva] = useState("");
  const [confirmacion, setConfirmacion] = useState("");

  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const guardar = async () => {
    setError("");

    if (!passwordActual || !passwordNueva) {
      setError("Completa todos los campos");
      return;
    }

    if (passwordNueva.length < 8) {
      setError("La nueva contraseña debe tener al menos 8 caracteres");
      return;
    }

    if (passwordNueva !== confirmacion) {
      setError("Las contraseñas no coinciden");
      return;
    }

    try {
      setLoading(true);

      const res = await fetch(`${API_URL}/api/auth/cambiar-password`, {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ passwordActual, passwordNueva }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.message || "No se pudo cambiar la contraseña");
        return;
      }

      // El perfil guardado ya no debe pedir el cambio.
      const guardado = localStorage.getItem("user");

      if (guardado) {
        const user = JSON.parse(guardado);
        user.debeCambiarPassword = false;
        localStorage.setItem("user", JSON.stringify(user));

        router.push(HOME_POR_ROL[user.role] || "/");
        return;
      }

      router.push("/");
    } catch {
      setError("Error de conexión con el servidor");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-[70vh] items-center justify-center">
      <div className="w-full max-w-md rounded-2xl border bg-white p-8 shadow-sm">
        <h1 className="text-2xl font-bold text-slate-800">
          Cambiar contraseña
        </h1>

        <p className="mt-1 text-sm text-gray-500">
          Por seguridad debes cambiar la contraseña que se te asignó.
        </p>

        <div className="mt-6 space-y-4">
          <div>
            <label className="text-sm text-gray-600">Contraseña actual</label>
            <input
              type="password"
              className="mt-1 w-full rounded-xl border border-gray-300 px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={passwordActual}
              onChange={(e) => setPasswordActual(e.target.value)}
            />
          </div>

          <div>
            <label className="text-sm text-gray-600">Nueva contraseña</label>
            <input
              type="password"
              className="mt-1 w-full rounded-xl border border-gray-300 px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={passwordNueva}
              onChange={(e) => setPasswordNueva(e.target.value)}
            />
          </div>

          <div>
            <label className="text-sm text-gray-600">Confirmar contraseña</label>
            <input
              type="password"
              className="mt-1 w-full rounded-xl border border-gray-300 px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={confirmacion}
              onChange={(e) => setConfirmacion(e.target.value)}
            />
          </div>

          {error && (
            <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-600">
              {error}
            </p>
          )}

          <button
            onClick={guardar}
            disabled={loading}
            className="w-full rounded-xl bg-blue-600 py-2 font-medium text-white transition hover:bg-blue-700 disabled:bg-gray-400"
          >
            {loading ? "Guardando..." : "Guardar"}
          </button>
        </div>
      </div>
    </div>
  );
}
