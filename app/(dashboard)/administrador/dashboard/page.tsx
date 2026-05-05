"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

export default function AdministradorDashboardPage() {
  const router = useRouter();

  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<any>(null);

  useEffect(() => {
    const fetchDashboard = async () => {
      const token = localStorage.getItem("token");

      if (!token) {
        router.push("/login");
        return;
      }

      try {
        const res = await fetch("http://localhost:4000/api/admin/dashboard", {
          headers: {
            Authorization: `Bearer ${token}`
          }
        });

        if (!res.ok) {
          localStorage.removeItem("token");
          router.push("/login");
          return;
        }

        const result = await res.json();
        setData(result);

      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboard();
  }, []);

  if (loading) return <p className="p-10">Cargando dashboard...</p>;

  const resumen = [
    {
      title: "Alumnos registrados",
      value: data?.totalAlumnos || 0,
    },
    {
      title: "Maestros activos",
      value: data?.totalDocentes || 0,
    },
    {
      title: "Grupos activos",
      value: data?.totalGrupos || 0,
    },
    {
      title: "Pagos registrados",
      value: data?.pagosPendientes || 0,
    },
  ];

  return (
    <div className="space-y-6">

      <section className="bg-white p-6 rounded-2xl shadow-sm">
        <h1 className="text-3xl font-bold">Dashboard Admin 🔥</h1>
        <p className="text-gray-500">
          Resumen general del sistema SIAC
        </p>
      </section>

      {/* RESUMEN */}
      <section className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
        {resumen.map((item) => (
          <div key={item.title} className="bg-white p-5 rounded-2xl shadow-sm">
            <p className="text-gray-500 text-sm">{item.title}</p>
            <h2 className="text-3xl font-bold mt-2">{item.value}</h2>
          </div>
        ))}
      </section>

      {/* ACTIVIDAD */}
      <section className="bg-white p-6 rounded-2xl shadow-sm">
        <h2 className="text-xl font-semibold mb-4">
          Actividad reciente
        </h2>

        <div className="space-y-3">
          {data?.actividad?.map((item: any, i: number) => (
            <div key={i} className="bg-gray-50 p-4 rounded-xl">
              <p className="font-medium">
                Pago de {item.alumno?.user?.name}
              </p>
              <p className="text-sm text-gray-500">
                {item.concepto} - ${item.monto}
              </p>
            </div>
          ))}
        </div>
      </section>

    </div>
  );
}