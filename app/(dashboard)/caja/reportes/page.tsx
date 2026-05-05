"use client";

export default function CajaReportesPage() {

  const generar = async (tipo: string) => {
    try {
      const token = localStorage.getItem("token");

      const res = await fetch(
        `http://localhost:4000/api/reportes/${tipo}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (!res.ok) {
        throw new Error("Error generando reporte");
      }

      const data = await res.json();

      console.log("REPORTE:", data);

      alert(`Reporte ${tipo} generado correctamente 🔥`);

    } catch (error) {
      console.error(error);
      alert("Error al generar reporte");
    }
  };

  const reportes = [
    {
      key: "pagos",
      titulo: "Reporte diario de caja",
      descripcion: "Resumen de ingresos del día.",
    },
    {
      key: "pagos",
      titulo: "Reporte de pagos pendientes",
      descripcion: "Alumnos con adeudos.",
    },
    {
      key: "pagos",
      titulo: "Reporte de recibos emitidos",
      descripcion: "Pagos registrados.",
    },
    {
      key: "pagos",
      titulo: "Reporte por método de pago",
      descripcion: "Distribución de pagos.",
    },
  ];

  return (
    <div className="space-y-6">

      <section className="bg-white p-6 rounded-2xl shadow">
        <h1 className="text-3xl font-bold">Reportes</h1>
        <p className="text-gray-500">
          Genera reportes del módulo de caja
        </p>
      </section>

      <section className="grid md:grid-cols-2 gap-4">
        {reportes.map((r) => (
          <div key={r.titulo} className="bg-white p-6 rounded-2xl shadow">

            <h2 className="text-xl font-semibold">{r.titulo}</h2>
            <p className="text-gray-500 mt-2">{r.descripcion}</p>

            <button
              onClick={() => generar(r.key)}
              className="mt-4 bg-slate-900 text-white px-4 py-2 rounded-xl"
            >
              Generar reporte
            </button>

          </div>
        ))}
      </section>

    </div>
  );
}