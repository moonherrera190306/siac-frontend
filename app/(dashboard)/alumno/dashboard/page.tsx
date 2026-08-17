"use client";

import { useEffect, useState } from "react";
import { API_URL } from "@/lib/config";
import { PageHeader, Card, Stat, Badge, Vacio, Button } from "@/components/ui";
import { dinero } from "@/lib/format";

const DIAS = ["LUNES", "MARTES", "MIERCOLES", "JUEVES", "VIERNES", "SABADO"];

const ETIQUETA_DIA: Record<string, string> = {
  LUNES: "Lunes",
  MARTES: "Martes",
  MIERCOLES: "Miércoles",
  JUEVES: "Jueves",
  VIERNES: "Viernes",
  SABADO: "Sábado",
};

function diaDeHoy() {
  // getDay: 0 domingo … 6 sábado
  return DIAS[new Date().getDay() - 1] ?? null;
}

export default function AlumnoDashboardPage() {
  const [calificaciones, setCalificaciones] = useState<any[]>([]);
  const [asistencia, setAsistencia] = useState<number | null>(null);
  const [adeudo, setAdeudo] = useState(0);
  const [horario, setHorario] = useState<any[]>([]);
  const [bloqueado, setBloqueado] = useState("");

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const cargar = async () => {
      try {
        const guardado = localStorage.getItem("user");

        if (!guardado) {
          window.location.href = "/login";
          return;
        }

        const user = JSON.parse(guardado);
        const alumnoId = user?.alumnoId;

        // 🔥 El alumno usa /alumno/me: la ruta /alumno/:id es solo para
        // el personal. Antes esta pantalla llamaba a la de staff y
        // recibía 403, por eso el dashboard no cargaba nunca.
        const [rc, ra, rp, rh] = await Promise.all([
          fetch(`${API_URL}/api/calificaciones/alumno/me`, {
            credentials: "include",
          }),
          fetch(`${API_URL}/api/asistencias/alumno/${alumnoId}`, {
            credentials: "include",
          }),
          fetch(`${API_URL}/api/pagos/resumen/${alumnoId}`, {
            credentials: "include",
          }),
          fetch(`${API_URL}/api/alumnos/horario/${alumnoId}`, {
            credentials: "include",
          }),
        ]);

        if (rc.status === 403) {
          const jc = await rc.json();
          setBloqueado(jc?.message || "Consulta restringida");
        } else if (rc.ok) {
          const jc = await rc.json();
          setCalificaciones(jc?.data ?? []);
        }

        if (ra.ok) {
          const ja = await ra.json();
          const resumen = ja?.data?.resumen ?? [];

          const conDato = resumen.filter((r: any) => r.porcentaje !== null);

          setAsistencia(
            conDato.length === 0
              ? null
              : Number(
                  (
                    conDato.reduce(
                      (acc: number, r: any) => acc + Number(r.porcentaje),
                      0
                    ) / conDato.length
                  ).toFixed(1)
                )
          );
        }

        if (rp.ok) {
          const jp = await rp.json();
          setAdeudo(Number(jp?.data?.adeudo ?? 0));
        }

        if (rh.ok) {
          const jh = await rh.json();

          const bloques: any[] = [];

          for (const a of jh?.data ?? []) {
            for (const h of a.horarios ?? []) {
              bloques.push({
                ...h,
                materia: a.materia?.nombre,
                docente: a.docente?.nombre || a.docente?.user?.name,
              });
            }
          }

          setHorario(bloques);
        }
      } catch (e: any) {
        setError(e.message || "Error al cargar el panel");
      } finally {
        setLoading(false);
      }
    };

    cargar();
  }, []);

  if (loading) return <p className="p-2 text-slate-500">Cargando...</p>;

  const numericas = calificaciones
    .map((c) => c.notaDefinitiva)
    .filter((n) => n !== null && n !== undefined && !isNaN(Number(n)))
    .map(Number);

  const promedio =
    numericas.length === 0
      ? null
      : (numericas.reduce((a, b) => a + b, 0) / numericas.length).toFixed(1);

  const reprobadas = calificaciones.filter(
    (c) => c.estatus === "REPROBADA"
  ).length;

  const hoy = diaDeHoy();

  const clasesHoy = horario
    .filter((b) => b.dia === hoy)
    .sort((a, b) => a.horaInicio.localeCompare(b.horaInicio));

  return (
    <>
      <PageHeader
        titulo="Mi panel"
        descripcion={
          hoy
            ? `${ETIQUETA_DIA[hoy]} · ${clasesHoy.length} clase(s) hoy`
            : "Hoy no hay clases programadas"
        }
      />

      {error && (
        <p className="rounded-xl bg-red-50 p-4 text-red-700">{error}</p>
      )}

      <div className="grid gap-4 md:grid-cols-4">
        <Stat
          etiqueta="Promedio general"
          valor={promedio ?? "—"}
          nota={promedio ? `${numericas.length} materia(s)` : "Sin definitivas"}
        />

        <Stat
          etiqueta="Asistencia"
          valor={asistencia === null ? "—" : `${asistencia}%`}
          nota={asistencia === null ? "Sin registros" : undefined}
        />

        <Stat
          etiqueta="Materias reprobadas"
          valor={reprobadas}
          acento={reprobadas > 0}
        />

        <Stat
          etiqueta="Adeudo"
          valor={dinero(adeudo)}
          acento={adeudo > 0}
          nota={adeudo > 0 ? "Bloquea tus calificaciones" : "Sin adeudos"}
        />
      </div>

      {bloqueado && (
        <Card className="border-amber-200 bg-amber-50">
          <p className="font-medium text-amber-900">
            Tus calificaciones están restringidas
          </p>

          <p className="mt-1 text-sm text-amber-800">{bloqueado}</p>

          <a href="/alumno/pagos">
            <Button variante="acento" className="mt-3">
              Ver mis pagos
            </Button>
          </a>
        </Card>
      )}

      <div className="grid gap-4 lg:grid-cols-2">
        <Card>
          <h2 className="mb-3 font-semibold">Clases de hoy</h2>

          {clasesHoy.length === 0 ? (
            <p className="text-sm text-slate-500">
              {hoy
                ? "No tienes clases programadas para hoy."
                : "Hoy es fin de semana."}
            </p>
          ) : (
            <ul className="space-y-2">
              {clasesHoy.map((c, i) => (
                <li
                  key={i}
                  className="flex items-center justify-between rounded-xl border border-slate-100 bg-slate-50 p-3"
                >
                  <div>
                    <p className="font-medium">{c.materia}</p>
                    <p className="text-xs text-slate-500">{c.docente}</p>
                  </div>

                  <div className="text-right">
                    <p className="text-sm font-medium text-blue-700">
                      {c.horaInicio} - {c.horaFin}
                    </p>
                    {c.aula && (
                      <p className="text-xs text-slate-400">Aula {c.aula}</p>
                    )}
                  </div>
                </li>
              ))}
            </ul>
          )}
        </Card>

        <Card>
          <h2 className="mb-3 font-semibold">Mis materias</h2>

          {calificaciones.length === 0 ? (
            <Vacio titulo="Todavía no hay calificaciones capturadas." />
          ) : (
            <ul className="space-y-2">
              {calificaciones.slice(0, 8).map((c) => (
                <li
                  key={c.id}
                  className="flex items-center justify-between border-b border-slate-100 pb-2 last:border-0"
                >
                  <span className="text-sm">{c.materia?.nombre}</span>

                  <span className="flex items-center gap-2">
                    <span className="text-sm font-semibold">
                      {c.notaDefinitiva ?? "—"}
                    </span>

                    <Badge
                      tono={
                        c.estatus === "APROBADA"
                          ? "bien"
                          : c.estatus === "REPROBADA"
                          ? "grave"
                          : "neutro"
                      }
                    >
                      {(c.estatus || "").replace("_", " ")}
                    </Badge>
                  </span>
                </li>
              ))}
            </ul>
          )}
        </Card>
      </div>
    </>
  );
}
