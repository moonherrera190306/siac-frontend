"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

export default function LoginPage() {
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  // 🚀 REDIRECCIÓN AUTOMÁTICA SI YA ESTÁ LOGUEADO
  useEffect(() => {
    const token = localStorage.getItem("token");
    const user = JSON.parse(localStorage.getItem("user") || "{}");

    if (token && user.role) {
      const roleRoutes: any = {
         ADMIN: "/administrador/dashboard",
  ALUMNO: "/alumno/dashboard",
  CAJA: "/caja/dashboard",
  DIRECTOR: "/director/dashboard",
  MAESTRO: "/maestro/dashboard",
  SECRETARIA: "/secretaria/dashboard"
      };

      router.push(roleRoutes[user.role]);
    }
  }, []);

  const handleLogin = async () => {
    if (!email || !password) {
      alert("Completa todos los campos");
      return;
    }

    try {
      setLoading(true);

      const res = await fetch("http://localhost:4000/api/auth/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ email, password })
      });

      const data = await res.json();

      if (!res.ok) {
        alert(data.message || "Error en login");
        return;
      }

      // 🔐 Guardar sesión
      localStorage.setItem("token", data.token);
      localStorage.setItem("user", JSON.stringify(data.user));

    const roleRoutes: any = {
  ADMIN: "/administrador/dashboard",
  ALUMNO: "/alumno/dashboard",
  CAJA: "/caja/dashboard",
  DIRECTOR: "/director/dashboard",
  MAESTRO: "/maestro/dashboard",
  SECRETARIA: "/secretaria/dashboard"
};

      router.push(roleRoutes[data.user.role]);

    } catch (error) {
      console.error(error);
      alert("Error de conexión con el servidor");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative flex min-h-screen items-center justify-center bg-gradient-to-br from-slate-100 to-slate-200">

      <div className="w-full max-w-md rounded-2xl bg-white p-8 shadow-xl border border-gray-200">

        {/* HEADER */}
        <div className="mb-6 text-center">
          <h1 className="text-3xl font-bold text-slate-800">
            SIAC
          </h1>
          <p className="text-gray-500 mt-1">
            Sistema Integral Académico
          </p>
        </div>

        {/* FORM */}
        <div className="space-y-4">

          <div>
            <label className="text-sm text-gray-600">Correo</label>
            <input
              type="email"
              placeholder="ejemplo@correo.com"
              className="w-full mt-1 rounded-xl border border-gray-300 px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>

          <div>
            <label className="text-sm text-gray-600">Contraseña</label>
            <input
              type="password"
              placeholder="••••••••"
              className="w-full mt-1 rounded-xl border border-gray-300 px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>

          <button
            onClick={handleLogin}
            disabled={loading}
            className="w-full rounded-xl bg-blue-600 py-2 font-medium text-white transition hover:bg-blue-700 disabled:bg-gray-400"
          >
            {loading ? "Entrando..." : "Iniciar sesión"}
          </button>

        </div>

        {/* FOOTER */}
        <div className="mt-6 text-center text-sm text-gray-500">
          © 2026 SIAC
        </div>

      </div>

      {/* DECORACIÓN */}
      <div className="absolute top-0 right-0 h-40 w-40 bg-orange-400 rounded-bl-full opacity-30 blur-2xl"></div>
      <div className="absolute bottom-0 left-0 h-40 w-40 bg-blue-400 rounded-tr-full opacity-30 blur-2xl"></div>

    </div>
  );
}