type ModulePageProps = {
  title: string;
  description: string;
};

export default function ModulePage({ title, description }: ModulePageProps) {
  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-3xl font-bold text-gray-800">{title}</h1>
        <p className="mt-2 text-gray-600">{description}</p>
      </div>

      <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
        <p className="text-sm text-gray-500">
          Esta vista está lista como base para integrar tablas,
          formularios y conexión con el backend.
        </p>
      </div>
    </div>
  );
}