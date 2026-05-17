export default function AdministradorMaestrosPage() {
  const maestros = [
    { nombre: "Juan Pérez", especialidad: "Programación", grupos: 3, estado: "Activo" },
    { nombre: "Laura Gómez", especialidad: "Historia", grupos: 2, estado: "Activo" },
    { nombre: "Ana López", especialidad: "Ética", grupos: 2, estado: "Activo" },
    { nombre: "Roberto Díaz", especialidad: "Matemáticas", grupos: 4, estado: "Activo" },
  ];

  return (
    <div className="space-y-6">
      <section className="flex flex-col gap-4 rounded-2xl border border-gray-200 bg-white p-6 shadow-sm md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-800">Maestros</h1>
          <p className="mt-2 text-gray-600">
            Gestiona docentes, materias y asignaciones.
          </p>
        </div>

        <button className="rounded-xl bg-slate-900 px-4 py-2 text-sm font-medium text-white hover:bg-slate-800">
          Nuevo maestro
        </button>
      </section>

      <section className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
        <div className="mb-4 flex flex-col gap-3 md:flex-row md:justify-between">
          <input
            type="text"
            placeholder="Buscar maestro..."
            className="rounded-xl border border-gray-300 px-4 py-2 text-sm"
          />
          <select className="rounded-xl border border-gray-300 px-4 py-2 text-sm">
            <option>Todas las especialidades</option>
            <option>Programación</option>
            <option>Historia</option>
            <option>Ética</option>
            <option>Matemáticas</option>
          </select>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full min-w-[760px] text-left">
            <thead>
              <tr className="border-b border-gray-200 text-sm text-gray-500">
                <th className="py-3 pr-4 font-medium">Nombre</th>
                <th className="py-3 pr-4 font-medium">Especialidad</th>
                <th className="py-3 pr-4 font-medium">Grupos</th>
                <th className="py-3 pr-4 font-medium">Estado</th>
                <th className="py-3 pr-4 font-medium">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {maestros.map((maestro) => (
                <tr key={maestro.nombre} className="border-b border-gray-100">
                  <td className="py-4 pr-4 font-medium text-gray-800">{maestro.nombre}</td>
                  <td className="py-4 pr-4 text-gray-600">{maestro.especialidad}</td>
                  <td className="py-4 pr-4 text-gray-600">{maestro.grupos}</td>
                  <td className="py-4 pr-4">
                    <span className="rounded-full bg-green-100 px-3 py-1 text-sm font-medium text-green-700">
                      {maestro.estado}
                    </span>
                  </td>
                  <td className="py-4 pr-4">
                    <div className="flex gap-2">
                      <button className="rounded-lg bg-slate-100 px-3 py-2 text-sm">Ver</button>
                      <button className="rounded-lg bg-slate-100 px-3 py-2 text-sm">Editar</button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}