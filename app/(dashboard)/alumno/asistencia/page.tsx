"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

export default function AlumnoDashboardPage() {
  const router = useRouter();

  const [calificaciones, setCalificaciones] = useState<any[]>([]);
  const [pagos, setPagos] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      const token = localStorage.getItem("token");
      const userRaw = localStorage.getItem("user");

      if (!token || !userRaw) {
        router.push("/login");
        return;
      }

      const user = JSON.parse(userRaw);

      try {
        // 🔥 CALIFICACIONES
        const resCal = await fetch(
          `https://siac-backend-production.up.railway.app/api/calificaciones/alumno/${user.id}`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        console.log("CALIFICACIONES STATUS:", resCal.status);

        if (resCal.ok) {
          const calData = await resCal.json();
          setCalificaciones(calData);
        } else {
          console.warn("Error en calificaciones");
        }

        // 🔥 PAGOS
        const resPagos = await fetch(
          `https://siac-backend-production.up.railway.app/api/pagos/${user.id}`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        console.log("PAGOS STATUS:", resPagos.status);

        if (resPagos.ok) {
          const pagosData = await resPagos.json();
          setPagos(pagosData);
        } else {
          console.warn("Error en pagos");
        }

      } catch (error) {
        console.error("ERROR GENERAL:", error);
        alert("Error cargando datos");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  if (loading) {
    return <p className="p-6">Cargando datos...</p>;
  }

  return (
    <div className="space-y-6">

      <h1 className="text-3xl font-bold">Mi Panel 🎓</h1>

      {/* CALIFICACIONES */}
      <div className="bg-white p-4 rounded-xl shadow">
        <h2 className="font-semibold mb-2">Calificaciones</h2>

        {calificaciones.length === 0 ? (
          <p className="text-gray-500">Sin calificaciones</p>
        ) : (
          calificaciones.map((c) => (
            <p key={c.id}>
              {c.materia?.nombre}: {c.calificacion}
            </p>
          ))
        )}
      </div>

      {/* PAGOS */}
      <div className="bg-white p-4 rounded-xl shadow">
        <h2 className="font-semibold mb-2">Pagos</h2>

        {pagos.length === 0 ? (
          <p className="text-gray-500">Sin pagos registrados</p>
        ) : (
          pagos.map((p) => (
            <p key={p.id}>
              {p.concepto} - ${p.monto}
            </p>
          ))
        )}
      </div>

    </div>
  );
}