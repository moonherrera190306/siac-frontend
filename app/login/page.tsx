"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { API_URL } from "@/lib/config";
import { notificar } from "@/lib/notificar";

// Una sola fuente de verdad: la usan el login y el layout.
const RUTAS: Record<string, string> = {
  ADMIN: "/administrador/dashboard",
  ALUMNO: "/alumno/dashboard",
  CAJA: "/caja/dashboard",
  DIRECTOR: "/director/dashboard",
  MAESTRO: "/maestro/dashboard",
  SECRETARIA: "/secretaria/dashboard",
};

export default function LoginPage() {
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [verClave, setVerClave] = useState(false);

  // Si ya hay sesión, se entra directo.
  useEffect(() => {
    const guardado = localStorage.getItem("user");

    if (!guardado) return;

    try {
      const user = JSON.parse(guardado);
      if (user?.role && RUTAS[user.role]) router.push(RUTAS[user.role]);
    } catch {
      localStorage.removeItem("user");
    }
  }, [router]);

  const handleLogin = async () => {
    if (!email || !password) {
      notificar("Completa todos los campos", "alerta");
      return;
    }

    try {
      setLoading(true);

      const res = await fetch(`${API_URL}/api/auth/login`, {
        method: "POST",
        // 🔐 credentials: "include" es lo que permite al navegador
        // guardar la cookie httpOnly que devuelve el backend.
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();

      if (!res.ok) {
        notificar(data.message || "Error en login", "error");
        return;
      }

      // 🔐 El token NO se guarda: viene en una cookie httpOnly.
      // Aquí solo queda el perfil, que no es una credencial.
      localStorage.setItem("user", JSON.stringify(data.user));

      // Primer acceso: hay que cambiar la contraseña antes de entrar.
      if (data.user.debeCambiarPassword) {
        router.push("/cambiar-password");
        return;
      }

      router.push(RUTAS[data.user.role] ?? "/");
    } catch (error) {
      console.error(error);
      notificar("Error de conexión con el servidor", "error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="siac-fondo-marino flex min-h-screen items-center justify-center p-4">
      <div className="w-full max-w-[430px]">
        {/* El membrete oficial como encabezado: la misma identidad que
            el alumno ve en sus constancias. */}
        <div className="overflow-hidden rounded-t-2xl bg-white">
          <Image
            src="/membrete-banner.png"
            alt="Centro de Estudios Superiores de Zamora"
            width={1236}
            height={345}
            priority
            className="h-auto w-full"
          />
        </div>

        <div className="rounded-b-2xl bg-white px-8 pb-8 pt-7 shadow-2xl">
          <div className="mb-7 text-center">
            <h1 className="text-xl font-bold tracking-[0.18em] text-[#00253f]">
              SIAC
            </h1>

            <p className="mt-1 text-[13px] text-slate-500">
              Sistema Integral Académico
            </p>

            <span className="mx-auto mt-3 block h-[3px] w-14 rounded-full bg-[#e6bf46]" />
          </div>

          <div className="space-y-4">
            <div>
              <label
                htmlFor="correo"
                className="mb-1.5 block text-[13px] font-medium text-slate-700"
              >
                Correo
              </label>

              <input
                id="correo"
                type="email"
                autoComplete="username"
                placeholder="nombre@ceszam.mx"
                className="w-full px-4 py-2.5 text-sm"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleLogin()}
              />
            </div>

            <div>
              <label
                htmlFor="clave"
                className="mb-1.5 block text-[13px] font-medium text-slate-700"
              >
                Contraseña
              </label>

              <div className="relative">
                <input
                  id="clave"
                  type={verClave ? "text" : "password"}
                  autoComplete="current-password"
                  placeholder="••••••••"
                  className="w-full py-2.5 pl-4 pr-16 text-sm"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleLogin()}
                />

                <button
                  type="button"
                  onClick={() => setVerClave((v) => !v)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-semibold text-slate-500 hover:text-[#00253f]"
                >
                  {verClave ? "Ocultar" : "Ver"}
                </button>
              </div>
            </div>

            <button
              onClick={handleLogin}
              disabled={loading}
              className="siac-btn siac-btn-primario mt-2 w-full py-2.5"
            >
              {loading ? "Entrando…" : "Iniciar sesión"}
            </button>
          </div>

          <p className="mt-6 border-t border-slate-100 pt-4 text-center text-[11px] leading-relaxed text-slate-400">
            Si es tu primer acceso, el sistema te pedirá cambiar la contraseña.
            <br />
            ¿Problemas para entrar? Acude a Secretaría Escolar.
          </p>
        </div>

        <p className="mt-5 text-center text-[11px] text-white/45">
          Escuela Preparatoria por Cooperación de Zamora · Incorporada a la UMSNH
        </p>
      </div>
    </div>
  );
}
