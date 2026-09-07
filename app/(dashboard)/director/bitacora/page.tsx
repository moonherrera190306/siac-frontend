"use client";

import { useEffect, useState } from "react";
import { API_URL } from "@/lib/config";

function hoy() {
  const d = new Date();
  const mes = String(d.getMonth() + 1).padStart(2, "0");
  const dia = String(d.getDate()).padStart(2, "0");
  return `${d.getFullYear()}-${mes}-${dia}`;
}

export default function DirectorBitacoraPage() {
  const [pestana, setPestana] = useState<
    "registro" | "cumplimiento" | "bitacora"
  >("registro");

  const [fechaRegistro, setFechaRegistro] = useState(hoy());
  const [registroDia, setRegistroDia] = useState<any[]>([]);
  const [metaRegistro, setMetaRegistro] = useState<any>({});
  const [soloSinRegistro, setSoloSinRegistro] = useState(false);
  const [cargandoRegistro, setCargandoRegistro] = useState(true);

  const [cumplimiento, setCumplimiento] = useState<any[]>([]);
  const [metaCump, setMetaCump] = useState<any>({});

  const [bitacora, setBitacora] = useState<any[]>([]);
  const [soloIncidencias, setSoloIncidencias] = useState(false);

  const [loading, setLoading] = useState(true);
  const [generando, setGenerando] = useState(false);
  const [error, setError] = useState("");
  const [aviso, setAviso] = useState("");

  const cargarRegistroDia = async (dia: string) => {
    try {
      setCargandoRegistro(true);

      const res = await fetch(
        `${API_URL}/api/clases/registro-dia?fecha=${dia}`,
        { credentials: "include" }
      );

      const json = await res.json();

      if (!res.ok) {
        setError(json?.message || "Error al cargar el registro del día");
        return;
      }

      setRegistroDia(json?.data ?? []);
      setMetaRegistro(json?.meta ?? {});
    } finally {
      setCargandoRegistro(false);
    }
  };

  const cargarCumplimiento = async () => {
    const res = await fetch(`${API_URL}/api/clases/cumplimiento`, {
      credentials: "include",
    });

    const json = await res.json();

    if (!res.ok) {
      setError(json?.message || "Error al cargar el cumplimiento");
      return;
    }

    setCumplimiento(json?.data ?? []);
    setMetaCump(json?.meta ?? {});
  };

  const cargarBitacora = async (incidencias: boolean) => {
    const res = await fetch(
      `${API_URL}/api/clases/bitacora?perPage=100${
        incidencias ? "&conIncidencias=true" : ""
      }`,
      { credentials: "include" }
    );

    const json = await res.json();

    if (!res.ok) {
      setError(json?.message || "Error al cargar la bitácora");
      return;
    }

    setBitacora(json?.data ?? []);
  };

  useEffect(() => {
    const cargar = async () => {
      try {
        await Promise.all([
          cargarRegistroDia(fechaRegistro),
          cargarCumplimiento(),
          cargarBitacora(false),
        ]);
        setError("");
      } finally {
        setLoading(false);
      }
    };

    cargar();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const generarClases = async () => {
    if (
      !window.confirm(
        "Se generarán las clases programadas del ciclo a partir de los horarios. Volver a generarlas no duplica nada. ¿Continuar?"
      )
    ) {
      return;
    }

    setError("");
    setAviso("");
    setGenerando(true);

    const res = await fetch(`${API_URL}/api/clases/generar`, {
      method: "POST",
      credentials: "include",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({}),
    });

    const json = await res.json();

    setGenerando(false);

    if (!res.ok) {
      setError(json?.message || "No se pudieron generar las clases");
      return;
    }

    setAviso(json?.message || "Clases generadas");
    cargarCumplimiento();
  };

  if (loading) return <p className="p-6">Cargando...</p>;

  const global =
    metaCump.totalProgramadas > 0
      ? (
          (metaCump.totalRegistradas / metaCump.totalProgramadas) *
          100
        ).toFixed(1)
      : null;

  return (
    <div className="space-y-6">
      <section className="flex flex-col gap-4 rounded-2xl border bg-white p-6 shadow-sm md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-3xl font-bold">Seguimiento docente</h1>
          <p className="text-gray-500">
            Clases programadas contra clases realmente impartidas
            {metaCump.ciclo ? ` · ${metaCump.ciclo}` : ""}
          </p>
        </div>

        <button
          onClick={generarClases}
          disabled={generando}
          className="rounded-xl bg-slate-800 px-5 py-2 text-white disabled:bg-gray-400"
        >
          {generando ? "Generando..." : "Generar clases del ciclo"}
        </button>
      </section>

      {error && (
        <p className="rounded-xl bg-red-50 p-4 text-red-600">{error}</p>
      )}

      {aviso && (
        <p className="rounded-xl bg-green-50 p-4 text-green-700">{aviso}</p>
      )}

      <div className="grid gap-4 md:grid-cols-3">
        <div className="rounded-2xl border bg-white p-5 shadow-sm">
          <p className="text-sm text-gray-500">Programadas a la fecha</p>
          <h2 className="text-2xl font-bold">
            {metaCump.totalProgramadas ?? 0}
          </h2>
        </div>

        <div className="rounded-2xl border bg-white p-5 shadow-sm">
          <p className="text-sm text-gray-500">Registradas</p>
          <h2 className="text-2xl font-bold">
            {metaCump.totalRegistradas ?? 0}
          </h2>
        </div>

        <div className="rounded-2xl border bg-white p-5 shadow-sm">
          <p className="text-sm text-gray-500">Cumplimiento global</p>
          <h2 className="text-2xl font-bold">
            {global === null ? "Sin datos" : `${global}%`}
          </h2>
        </div>
      </div>

      <div className="flex gap-2">
        <button
          onClick={() => setPestana("registro")}
          className={`rounded-xl px-4 py-2 text-sm font-medium ${
            pestana === "registro"
              ? "bg-slate-900 text-white"
              : "border bg-white hover:bg-gray-50"
          }`}
        >
          Registro del día
        </button>

        <button
          onClick={() => setPestana("cumplimiento")}
          className={`rounded-xl px-4 py-2 text-sm font-medium ${
            pestana === "cumplimiento"
              ? "bg-slate-900 text-white"
              : "border bg-white hover:bg-gray-50"
          }`}
        >
          Cumplimiento
        </button>

        <button
          onClick={() => setPestana("bitacora")}
          className={`rounded-xl px-4 py-2 text-sm font-medium ${
            pestana === "bitacora"
              ? "bg-slate-900 text-white"
              : "border bg-white hover:bg-gray-50"
          }`}
        >
          Bitácora
        </button>
      </div>

      {pestana === "registro" && (
        <>
          <section className="flex flex-col gap-4 rounded-2xl border bg-white p-5 shadow-sm md:flex-row md:items-center md:justify-between">
            <div>
              <p className="text-sm text-gray-500">
                Un docente solo puede registrar su clase dentro de{" "}
                {metaRegistro.toleranciaMinutos ?? "—"} minutos desde la hora
                de inicio.
              </p>
            </div>

            <input
              type="date"
              value={fechaRegistro}
              onChange={(e) => {
                setFechaRegistro(e.target.value);
                cargarRegistroDia(e.target.value);
              }}
              className="rounded-xl border border-gray-300 px-4 py-2"
            />
          </section>

          <div className="grid gap-4 md:grid-cols-4">
            <div className="rounded-2xl border bg-white p-5 shadow-sm">
              <p className="text-sm text-gray-500">Programadas</p>
              <h2 className="text-2xl font-bold">
                {metaRegistro.programadas ?? 0}
              </h2>
            </div>

            <div className="rounded-2xl border bg-white p-5 shadow-sm">
              <p className="text-sm text-gray-500">Registradas</p>
              <h2 className="text-2xl font-bold text-green-700">
                {metaRegistro.registradas ?? 0}
              </h2>
            </div>

            <div className="rounded-2xl border bg-white p-5 shadow-sm">
              <p className="text-sm text-gray-500">Tarde</p>
              <h2 className="text-2xl font-bold text-amber-700">
                {metaRegistro.tarde ?? 0}
              </h2>
            </div>

            <div className="rounded-2xl border bg-white p-5 shadow-sm">
              <p className="text-sm text-gray-500">Sin registro</p>
              <h2 className="text-2xl font-bold text-red-700">
                {metaRegistro.sinRegistro ?? 0}
              </h2>
            </div>
          </div>

          <label className="flex items-center gap-2 text-sm text-gray-600">
            <input
              type="checkbox"
              checked={soloSinRegistro}
              onChange={(e) => setSoloSinRegistro(e.target.checked)}
            />
            Solo sin registro
          </label>

          {cargandoRegistro ? (
            <p className="text-gray-500">Cargando...</p>
          ) : registroDia.length === 0 ? (
            <div className="rounded-2xl border bg-white p-8 text-center text-gray-500">
              No hay clases programadas para esta fecha.
            </div>
          ) : (
            <div className="overflow-x-auto rounded-2xl border bg-white shadow-sm">
              <table className="w-full text-left text-sm">
                <thead className="bg-gray-50 text-gray-600">
                  <tr>
                    <th className="px-4 py-3">Hora</th>
                    <th className="px-4 py-3">Docente</th>
                    <th className="px-4 py-3">Materia</th>
                    <th className="px-4 py-3">Grupo</th>
                    <th className="px-4 py-3">Aula</th>
                    <th className="px-4 py-3">Tema</th>
                    <th className="px-4 py-3 text-center">Alumnos</th>
                    <th className="px-4 py-3 text-center">Estado</th>
                  </tr>
                </thead>

                <tbody>
                  {registroDia
                    .filter((r) =>
                      soloSinRegistro ? r.estado === "SIN_REGISTRO" : true
                    )
                    .sort((a, b) =>
                      (a.horaInicio || "").localeCompare(b.horaInicio || "")
                    )
                    .map((r) => (
                      <tr key={r.horarioId} className="border-t align-top">
                        <td className="px-4 py-3 whitespace-nowrap">
                          {r.horaInicio}–{r.horaFin}
                        </td>

                        <td className="px-4 py-3 font-medium">
                          {r.docente}
                        </td>

                        <td className="px-4 py-3">{r.materia}</td>

                        <td className="px-4 py-3">{r.grupo}</td>

                        <td className="px-4 py-3 text-gray-500">
                          {r.aula || "—"}
                        </td>

                        <td className="px-4 py-3">
                          <p className="text-gray-700">{r.tema || "—"}</p>
                          {r.incidencias && (
                            <p className="mt-1 text-xs text-amber-700">
                              {r.incidencias}
                            </p>
                          )}
                        </td>

                        <td className="px-4 py-3 text-center">
                          {r.alumnos ?? "—"}
                        </td>

                        <td className="px-4 py-3 text-center">
                          {r.estado === "REGISTRADA" && (
                            <span className="rounded-full bg-green-100 px-3 py-1 text-xs text-green-700">
                              registrada
                            </span>
                          )}

                          {r.estado === "REGISTRADA_TARDE" && (
                            <span className="rounded-full bg-amber-100 px-3 py-1 text-xs text-amber-700">
                              tarde · {r.minutosRetardo} min
                            </span>
                          )}

                          {r.estado === "EN_TIEMPO" && (
                            <span className="rounded-full bg-gray-100 px-3 py-1 text-xs text-gray-600">
                              aún puede registrar
                            </span>
                          )}

                          {r.estado === "SIN_REGISTRO" && (
                            <span className="rounded-full bg-red-100 px-3 py-1 text-xs text-red-700">
                              sin registro
                            </span>
                          )}
                        </td>
                      </tr>
                    ))}
                </tbody>
              </table>
            </div>
          )}
        </>
      )}

      {pestana === "cumplimiento" && (
        <>
          {cumplimiento.length === 0 ? (
            <div className="rounded-2xl border bg-white p-8 text-center">
              <p className="text-gray-500">
                No hay clases programadas todavía.
              </p>
              <p className="mt-1 text-sm text-gray-400">
                Captura los horarios y usa "Generar clases del ciclo".
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto rounded-2xl border bg-white shadow-sm">
              <table className="w-full text-left text-sm">
                <thead className="bg-gray-50 text-gray-600">
                  <tr>
                    <th className="px-4 py-3">Docente</th>
                    <th className="px-4 py-3">Materias</th>
                    <th className="px-4 py-3 text-center">Programadas</th>
                    <th className="px-4 py-3 text-center">Registradas</th>
                    <th className="px-4 py-3 text-center">Sin registrar</th>
                    <th className="px-4 py-3 text-center">Incidencias</th>
                    <th className="px-4 py-3 text-center">Cumplimiento</th>
                  </tr>
                </thead>

                <tbody>
                  {cumplimiento.map((d) => (
                    <tr key={d.docenteId} className="border-t">
                      <td className="px-4 py-3 font-medium">{d.nombre}</td>

                      <td className="px-4 py-3 text-gray-500">
                        {d.materias.join(", ") || "—"}
                      </td>

                      <td className="px-4 py-3 text-center">{d.programadas}</td>

                      <td className="px-4 py-3 text-center">{d.registradas}</td>

                      <td className="px-4 py-3 text-center">
                        {d.pendientes > 0 ? (
                          <span className="rounded-full bg-red-100 px-2 py-1 text-xs text-red-700">
                            {d.pendientes}
                          </span>
                        ) : (
                          "0"
                        )}
                      </td>

                      <td className="px-4 py-3 text-center">
                        {d.conIncidencias > 0 ? (
                          <span className="rounded-full bg-amber-100 px-2 py-1 text-xs text-amber-700">
                            {d.conIncidencias}
                          </span>
                        ) : (
                          "0"
                        )}
                      </td>

                      <td className="px-4 py-3 text-center">
                        <span
                          className={`rounded-full px-3 py-1 text-xs ${
                            d.cumplimiento === null
                              ? "bg-gray-100 text-gray-600"
                              : d.cumplimiento < 80
                              ? "bg-red-100 text-red-700"
                              : d.cumplimiento < 95
                              ? "bg-amber-100 text-amber-700"
                              : "bg-green-100 text-green-700"
                          }`}
                        >
                          {d.cumplimiento === null ? "—" : `${d.cumplimiento}%`}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </>
      )}

      {pestana === "bitacora" && (
        <>
          <label className="flex items-center gap-2 text-sm text-gray-600">
            <input
              type="checkbox"
              checked={soloIncidencias}
              onChange={(e) => {
                setSoloIncidencias(e.target.checked);
                cargarBitacora(e.target.checked);
              }}
            />
            Solo clases con incidencias
          </label>

          {bitacora.length === 0 ? (
            <div className="rounded-2xl border bg-white p-8 text-center text-gray-500">
              No hay bitácoras registradas con ese filtro.
            </div>
          ) : (
            <div className="space-y-3">
              {bitacora.map((c) => (
                <article
                  key={c.id}
                  className="rounded-2xl border bg-white p-5 shadow-sm"
                >
                  <div className="flex flex-wrap items-start justify-between gap-2">
                    <div>
                      <h3 className="font-semibold">
                        {c.asignacion?.materia?.nombre} · Grupo{" "}
                        {c.asignacion?.grupo?.nombre}
                      </h3>

                      <p className="text-sm text-gray-500">
                        {c.asignacion?.docente?.nombre ||
                          c.asignacion?.docente?.user?.name}{" "}
                        · {new Date(c.fecha).toLocaleDateString("es-MX")} ·{" "}
                        {c._count?.asistencias ?? 0} alumnos
                      </p>
                    </div>

                    {c.incidencias && (
                      <span className="rounded-full bg-amber-100 px-3 py-1 text-xs text-amber-700">
                        con incidencia
                      </span>
                    )}
                  </div>

                  <dl className="mt-3 space-y-1 text-sm">
                    <div>
                      <dt className="inline font-medium">Tema: </dt>
                      <dd className="inline text-gray-700">{c.tema || "—"}</dd>
                    </div>

                    {c.actividad && (
                      <div>
                        <dt className="inline font-medium">Actividad: </dt>
                        <dd className="inline text-gray-700">{c.actividad}</dd>
                      </div>
                    )}

                    {c.observaciones && (
                      <div>
                        <dt className="inline font-medium">Observaciones: </dt>
                        <dd className="inline text-gray-700">
                          {c.observaciones}
                        </dd>
                      </div>
                    )}

                    {c.incidencias && (
                      <div>
                        <dt className="inline font-medium text-amber-800">
                          Incidencias:{" "}
                        </dt>
                        <dd className="inline text-amber-800">
                          {c.incidencias}
                        </dd>
                      </div>
                    )}
                  </dl>
                </article>
              ))}
            </div>
          )}
        </>
      )}
    </div>
  );
}
