"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem("token");

    if (!token) {
      router.push("/login");
    } else {
      setLoading(false);
    }
  }, []);

  if (loading) {
    return (
      <div className="p-6">
        <p>Cargando...</p>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-gray-100">
      {/* SIDEBAR (si tienes uno, déjalo aquí) */}
      <aside className="w-64 bg-white border-r p-4">
        <h2 className="font-bold text-lg">SIAC</h2>
        {/* aquí tu menú */}
      </aside>

      {/* CONTENIDO */}
      <main className="flex-1 p-6">{children}</main>
    </div>
  );
}