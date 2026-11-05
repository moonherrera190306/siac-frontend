"use client";

import { useEffect, useState } from "react";
import { apiFetch } from "@/lib/apiClient";
import { API_URL } from "@/lib/config";
import { notificar } from "@/lib/notificar";
import { PageHeader, Card, Stat, Button, Vacio, TableWrap } from "@/components/ui";

type Resumen = {
  enCarga: boolean;
  actas: number;
  porRevisar: number;
  alumnos: number;
  calificaciones: number;
  detalle: string | null;
} | null;

type Exalumno = { id: number; matricula: string; nombre: string; generacion: string | null };

const n = (v: number) => v.toLocaleString("es-MX");

/**
 * 🗄️ Archivo histórico dentro del SIAC (solo lectura).
 * Los datos viven en la app de biblioteca; el detalle completo se abre
 * allá por SSO.
 */
export default function ArchivoPage() {
  const [resumen, setResumen] = useState<Resumen>(null);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState("");
  const [q, setQ] = useState("");
  const [lista, setLista] = useState<Exalumno[]>([]);
  const [buscando, setBuscando] = useState(false);

  useEffect(() => {
    apiFetch("/api/archivo/resumen")
      .then((r) => setResumen(r?.data ?? null))
      .catch((e) => setError(e.message))
      .finally(() => setCargando(false));
  }, []);

  useEffect(() => {
    const texto = q.trim();
    if (texto.length < 2) return setLista([]);
    const t = setTimeout(() => {
      setBuscando(true);
      apiFetch(`/api/archivo/exalumnos?q=${encodeURIComponent(texto)}`)
        .then((r) => setLista(r?.data ?? []))
        .catch((e) => notificar(e.message, "error"))
        .finally(() => setBuscando(false));
    }, 350);
    return () => clearTimeout(t);
  }, [q]);

  const abrirArchivo = async () => {
    const pestana = window.open("", "_blank");
    try {
      const res = await fetch(`${API_URL}/api/auth/sso-archivo`, { credentials: "include" });
      const json = await res.json();
      if (!res.ok || !json.url) throw new Error(json?.message);
      if (pestana) pestana.location.href = json.url;
      else window.location.href = json.url;
    } catch (e: any) {
      pestana?.close();
      notificar(e?.message || "No se pudo abrir el Archivo histórico", "error");
    }
  };

  return (
    <>
      <PageHeader
        titulo="Archivo histórico"
        descripcion="Actas y calificaciones de exalumnos digitalizadas del archivo de la preparatoria."
      >
        <Button onClick={abrirArchivo}>Abrir archivo completo ↗</Button>
      </PageHeader>

      {resumen?.enCarga && (
        <div className="rounded-2xl border border-amber-300 bg-amber-50 px-5 py-4 text-sm text-amber-900">
          <p className="font-semibold">⏳ Los datos se están cargando en el sistema</p>
          <p className="mt-1">
            La información del archivo histórico aún no está completa y está pendiente de
            revisión. Lo que ves aquí es preliminar.
          </p>
          {resumen.detalle && <p className="mt-1 text-xs text-amber-800/80">{resumen.detalle}</p>}
        </div>
      )}

      {cargando ? (
        <Card><p className="text-sm text-slate-500">Cargando…</p></Card>
      ) : error ? (
        <Card><p className="text-sm text-red-700">{error}</p></Card>
      ) : !resumen ? (
        <Card><Vacio titulo="Aún no hay datos en el archivo" pista="La carga desde la digitalización todavía no ha empezado." /></Card>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <Stat etiqueta="Actas cargadas" valor={n(resumen.actas)} />
          <Stat etiqueta="Exalumnos" valor={n(resumen.alumnos)} />
          <Stat etiqueta="Calificaciones" valor={n(resumen.calificaciones)} />
          <Stat etiqueta="Actas por revisar" valor={n(resumen.porRevisar)} acento />
        </div>
      )}

      <Card>
        <label className="text-sm font-medium text-slate-700" htmlFor="buscar-exalumno">
          Buscar exalumno
        </label>
        <input
          id="buscar-exalumno"
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="Nombre o matrícula"
          className="mt-2 w-full rounded-xl border border-slate-300 px-4 py-2 text-sm"
        />

        {q.trim().length >= 2 && (
          <div className="mt-4">
            {buscando ? (
              <p className="text-sm text-slate-500">Buscando…</p>
            ) : lista.length === 0 ? (
              <Vacio titulo="Sin resultados" />
            ) : (
              <TableWrap>
                <table className="w-full text-sm">
                  <thead className="bg-slate-50 text-left text-slate-500">
                    <tr>
                      <th className="px-4 py-2">Nombre</th>
                      <th className="px-4 py-2">Matrícula</th>
                      <th className="px-4 py-2">Generación</th>
                    </tr>
                  </thead>
                  <tbody>
                    {lista.map((a) => (
                      <tr key={a.id} className="border-t border-slate-100">
                        <td className="px-4 py-2">{a.nombre}</td>
                        <td className="px-4 py-2">{a.matricula}</td>
                        <td className="px-4 py-2">{a.generacion ?? "—"}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </TableWrap>
            )}
          </div>
        )}
      </Card>
    </>
  );
}
