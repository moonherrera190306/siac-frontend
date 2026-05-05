"use client";

export default function AdministradorReportesPage() {

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
        throw new Error(`Error ${res.status}`);
      }

      const data = await res.json();

      console.log("REPORTE:", data);

      alert(`Reporte ${tipo} generado 🔥`);

    } catch (error) {
      console.error(error);
      alert("Error generando reporte");
    }
  };

  const reportes = [
    { key: "alumnos", titulo: "Reporte de alumnos", descripcion: "Consulta general de alumnos inscritos" },
    { key: "pagos", titulo: "Reporte de pagos", descripcion: "Resumen financiero" },
    { key: "grupos", titulo: "Reporte de grupos", descripcion: "Distribución de alumnos" },
    { key: "academico", titulo: "Reporte académico", descripcion: "Promedios y desempeño" },
  ];

  return (
    <div className="space-y-6">

      <section className="bg-white p-6 rounded-2xl shadow-sm">
        <h1 className="text-3xl font-bold">Reportes</h1>
        <p className="text-gray-500">Generación de reportes del sistema</p>
      </section>

      <section className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {reportes.map((r) => (
          <div key={r.key} className="bg-white p-6 rounded-2xl shadow-sm">
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