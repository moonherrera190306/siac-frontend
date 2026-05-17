"use client";

import { useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const pathname = usePathname();

  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem("token");

    // 🔒 Si NO hay token → mandar a login
    if (!token && pathname !== "/login") {
      router.push("/login");
    }

    // 🔓 Si ya hay token y está en login → mandar a dashboard
    if (token && pathname === "/login") {
      const user = JSON.parse(localStorage.getItem("user") || "{}");

      const roleRoutes: any = {
        ADMIN: "/administrador",
        ALUMNO: "/alumno",
        CAJA: "/caja",
        DIRECTOR: "/director",
        MAESTRO: "/maestro",
        SECRETARIA: "/secretaria",
      };

      router.push(roleRoutes[user.role] || "/login");
    }

    setLoading(false);
  }, [pathname]);

  // ⏳ Evita parpadeo mientras valida sesión
  if (loading) {
    return (
      <html lang="es">
        <body className="flex items-center justify-center h-screen">
          <p className="text-gray-500">Cargando...</p>
        </body>
      </html>
    );
  }

  return (
    <html lang="es">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        {children}
      </body>
    </html>
  );
}
