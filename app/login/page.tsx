"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function LoginPage() {
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const handleLogin = async () => {
    if (!email || !password) {
      alert("Completa todos los campos");
      return;
    }

    try {
      setLoading(true);

      const res = await fetch("http://localhost:4000/api/auth/login", {
        method: "POST", // 🔥 IMPORTANTE
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          email,
          password
        })
      });

      const data = await res.json();

      if (!res.ok) {
        alert(data.message || "Error en login");
        return;
      }

      // 🔐 Guardar sesión
      localStorage.setItem("token", data.token);
      localStorage.setItem("user", JSON.stringify(data.user));

      // 🚀 Redirección por rol
      const roleRoutes: any = {
        ADMIN: "/administrador",
        ALUMNO: "/alumno",
        CAJA: "/caja",
        DIRECTOR: "/director",
        MAESTRO: "/maestro",
        SECRETARIA: "/secretaria"
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
    <div className="flex flex-col items-center justify-center h-screen gap-4">
      <h1 className="text-3xl font-bold">SIAC Login</h1>

      <input
        type="email"
        placeholder="Correo"
        className="border p-2 w-64"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
      />

      <input
        type="password"
        placeholder="Contraseña"
        className="border p-2 w-64"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
      />

      <button
        onClick={handleLogin}
        disabled={loading}
        className="bg-blue-500 text-white px-4 py-2 rounded"
      >
        {loading ? "Entrando..." : "Iniciar sesión"}
      </button>
    </div>
  );
}