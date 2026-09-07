"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { API_URL } from "@/lib/config";
import { abrirConstanciaCalificaciones } from "@/lib/documentos";

const COLOR_DOC: Record<string, string> = {
  VALIDADO: "bg-green-100 text-green-700",
  PENDIENTE: "bg-amber-100 text-amber-700",
  RECHAZADO: "bg-red-100 text-red-700",
};

const COLOR_INS: Record<string, string> = {
  ACTIVA: "bg-green-100 text-green-700",
  BAJA: "bg-red-100 text-red-700",
  CONCLUIDA: "bg-blue-100 text-blue-700",
};

export default function ExpedientePage() {
  const params = useParams();
  const alumnoId = String(params?.id || "");

  const [alumno, setAlumno] = useState<any>(null);
  const [inscripciones, setInscripciones] = useState<any[]>([]);
  const [documentos, setDocumentos] = useState<any[]>([]);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [aviso, setAviso] = useState("");

  const [calificaciones, setCalificaciones] = useState<any[]>([]);

  const [nuevoDoc, setNuevoDoc] = useState({ nombre: "", tipo: "", url: "" });

  const cargar = async () => {
    try {
      setLoading(true);

      const [ra, ri, rd, rc] = await Promise.all([
        fetch(`${API_URL}/api/alumnos/${alumnoId}`, { credentials: "include" }),
        fetch(`${API_URL}/api/inscripciones/alumno/${alumnoId}`, {
          credentials: "include",
        }),
        fetch(`${API_URL}/api/documentos?alumnoId=${alumnoId}&perPage=100`, {
          credentials: "include",
        }),
        // El kardex completo, para poder imprimirlo membretado.
        fetch(`${API_URL}/api/calificaciones/alumno/${alumnoId}`, {
          credentials: "include",
        }),
      ]);

      const [ja, ji, jd, jc] = await Promise.all([
        ra.json(),
        ri.json(),
        rd.json(),
        rc.json(),
      ]);

      if (!ra.ok) throw new Error(ja?.message || "Error al cargar el alumno");

      setAlumno(ja?.data ?? null);
      setInscripciones(ji?.data ?? []);
      setDocumentos(jd?.data ?? []);
      setCalificaciones(jc?.data ?? []);
      setError("");
    } catch (e: any) {
      setError(e.message || "Error al cargar el expediente");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (alumnoId) cargar();
  }, [alumnoId]);

  const registrarDocumento = async () => {
    setError("");
    setAviso("");

    if (!nuevoDoc.nombre || !nuevoDoc.tipo || !nuevoDoc.url) {
      setError("Nombre, tipo y url son requeridos");
      return;
    }

    const res = await fetch(`${API_URL}/api/documentos`, {
      method: "POST",
      credentials: "include",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...nuevoDoc, alumnoId }),
    });

    const json = await res.json();

    if (!res.ok) {
      setError(json?.message || "No se pudo registrar el documento");
      return;
    }

    setAviso("Documento registrado");
    setNuevoDoc({ nombre: "", tipo: "", url: "" });
    cargar();
  };

  const validar = async (id: string, estado: string) => {
    let motivoRechazo = "";

    if (estado === "RECHAZADO") {
      motivoRechazo = window.prompt("Motivo del rechazo:") || "";
      if (!motivoRechazo) return;
    }

    const res = await fetch(`${API_URL}/api/documentos/${id}/validar`, {
      method: "PUT",
      credentials: "include",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ estado, motivoRechazo }),
    });

    const json = await res.json();

    if (!res.ok) {
      setError(json?.message || "No se pudo actualizar el documento");
      return;
    }

    cargar();
  };

  if (loading) return <p className="p-6">Cargando...</p>;

  if (!alumno) {
    return (
      <div className="rounded-2xl border bg-white p-8 text-center text-gray-500">
        {error || "Alumno no encontrado"}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <section className="rounded-2xl border bg-white p-6 shadow-sm">
        <p className="text-sm text-gray-500">Expediente</p>

        <h1 className="text-3xl font-bold">{alumno.user?.name}</h1>

        <p className="text-gray-500">
          {alumno.matricula} · {alumno.carrera?.nombre || "Sin carrera"} ·{" "}
          {alumno.grupo?.nombre || "Sin grupo"}
        </p>

        {alumno.trayectoria && (
          <p className="mt-1 text-sm text-blue-700">
            Trayectoria {alumno.trayectoria.clave} — {alumno.trayectoria.nombre}
          </p>
        )}

        <button
          onClick={() => {
            if (!abrirConstanciaCalificaciones(alumno, calificaciones)) {
              setError(
                "El navegador bloqueó la ventana emergente. Permítela para imprimir la constancia."
              );
            }
          }}
          disabled={calificaciones.length === 0}
          className="mt-4 rounded-xl border border-gray-300 px-4 py-2 text-sm hover:bg-blue-50 disabled:cursor-not-allowed disabled:opacity-40"
        >
          Constancia de calificaciones
          {calificaciones.length > 0 && ` (${calificaciones.length} materias)`}
        </button>
      </section>

      {error && (
        <p className="rounded-xl bg-red-50 p-4 text-red-600">{error}</p>
      )}

      {aviso && (
        <p className="rounded-xl bg-green-50 p-4 text-green-700">{aviso}</p>
      )}

      <div className="grid gap-4 md:grid-cols-2">
        <section className="rounded-2xl border bg-white p-5 shadow-sm">
          <h2 className="mb-3 font-semibold">Datos</h2>

          <dl className="space-y-2 text-sm">
            <div className="flex justify-between">
              <dt className="text-gray-500">Correo</dt>
              <dd>{alumno.user?.email || "—"}</dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-gray-500">CURP</dt>
              <dd>{alumno.curp || "—"}</dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-gray-500">Teléfono</dt>
              <dd>{alumno.telefono || "—"}</dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-gray-500">Tutor</dt>
              <dd>{alumno.tutorNombre || "—"}</dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-gray-500">Estatus</dt>
              <dd>{(alumno.estatusAcademico || "").replace("_", " ")}</dd>
            </div>
          </dl>
        </section>

        <section className="rounded-2xl border bg-white p-5 shadow-sm">
          <h2 className="mb-3 font-semibold">Historial de inscripciones</h2>

          {inscripciones.length === 0 ? (
            <p className="text-sm text-gray-500">
              Este alumno no tiene inscripciones registradas.
            </p>
          ) : (
            <ul className="space-y-2 text-sm">
              {inscripciones.map((i) => (
                <li
                  key={i.id}
                  className="flex items-center justify-between rounded-xl border border-gray-100 bg-gray-50 p-3"
                >
                  <div>
                    <p className="font-medium">{i.cicloEscolar?.nombre}</p>
                    <p className="text-xs text-gray-500">
                      {i.grupo?.nombre || "Sin grupo"}
                      {i.semestreNumero ? ` · ${i.semestreNumero}° sem.` : ""}
                    </p>
                  </div>

                  <span
                    className={`rounded-full px-3 py-1 text-xs ${
                      COLOR_INS[i.estatus] || "bg-gray-100 text-gray-600"
                    }`}
                  >
                    {i.estatus}
                  </span>
                </li>
              ))}
            </ul>
          )}
        </section>
      </div>

      <section className="rounded-2xl border bg-white p-5 shadow-sm">
        <h2 className="mb-3 font-semibold">Documentos</h2>

        {/* La subida real del archivo llega en la fase de Secretaría;
            aquí se registra el documento y su ubicación. */}
        <div className="mb-4 grid gap-3 md:grid-cols-4">
          <input
            className="rounded-xl border border-gray-300 px-3 py-2"
            placeholder="Nombre"
            value={nuevoDoc.nombre}
            onChange={(e) => setNuevoDoc({ ...nuevoDoc, nombre: e.target.value })}
          />

          <input
            className="rounded-xl border border-gray-300 px-3 py-2"
            placeholder="Tipo (acta, CURP...)"
            value={nuevoDoc.tipo}
            onChange={(e) => setNuevoDoc({ ...nuevoDoc, tipo: e.target.value })}
          />

          <input
            className="rounded-xl border border-gray-300 px-3 py-2"
            placeholder="URL del archivo"
            value={nuevoDoc.url}
            onChange={(e) => setNuevoDoc({ ...nuevoDoc, url: e.target.value })}
          />

          <button
            onClick={registrarDocumento}
            className="rounded-xl bg-blue-600 px-4 py-2 text-white hover:bg-blue-700"
          >
            Registrar
          </button>
        </div>

        {documentos.length === 0 ? (
          <p className="text-sm text-gray-500">
            No hay documentos en este expediente.
          </p>
        ) : (
          <table className="w-full text-left text-sm">
            <thead className="bg-gray-50 text-gray-600">
              <tr>
                <th className="px-4 py-3">Documento</th>
                <th className="px-4 py-3">Tipo</th>
                <th className="px-4 py-3">Estado</th>
                <th className="px-4 py-3"></th>
              </tr>
            </thead>

            <tbody>
              {documentos.map((d) => (
                <tr key={d.id} className="border-t">
                  <td className="px-4 py-3">
                    <a
                      href={d.url}
                      target="_blank"
                      rel="noreferrer"
                      className="text-blue-600 underline"
                    >
                      {d.nombre}
                    </a>
                  </td>

                  <td className="px-4 py-3">{d.tipo}</td>

                  <td className="px-4 py-3">
                    <span
                      className={`rounded-full px-3 py-1 text-xs ${
                        COLOR_DOC[d.estado] || "bg-gray-100 text-gray-600"
                      }`}
                    >
                      {d.estado}
                    </span>
                  </td>

                  <td className="px-4 py-3">
                    {d.estado !== "VALIDADO" && (
                      <button
                        onClick={() => validar(d.id, "VALIDADO")}
                        className="mr-2 rounded-lg border px-3 py-1 text-xs hover:bg-green-50"
                      >
                        Validar
                      </button>
                    )}

                    {d.estado !== "RECHAZADO" && (
                      <button
                        onClick={() => validar(d.id, "RECHAZADO")}
                        className="rounded-lg border px-3 py-1 text-xs hover:bg-red-50"
                      >
                        Rechazar
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </section>
    </div>
  );
}
