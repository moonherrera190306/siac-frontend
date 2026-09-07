"use client";

import { useEffect, useState } from "react";
import { API_URL } from "@/lib/config";
import { abrirRecibo } from "@/lib/documentos";
import {
  BuscadorAlumnos,
  filtrarAlumnos,
  type CampoBusqueda,
} from "@/components/BuscadorAlumnos";

const LIBRO_STORAGE_KEY = "siac_libro_caja";

const METODOS = ["EFECTIVO", "TRANSFERENCIA", "TARJETA", "DEPOSITO"];

type Linea = {
  conceptoPagoId: string;
  descripcion: string;
  cantidad: number;
  monto: number;
  adeudoId?: string | null;
};

export default function CajaCobrosPage() {
  const [alumnos, setAlumnos] = useState<any[]>([]);
  const [conceptos, setConceptos] = useState<any[]>([]);

  const [busqueda, setBusqueda] = useState("");
  const [campoBusqueda, setCampoBusqueda] = useState<CampoBusqueda>("matricula");
  const [alumnoId, setAlumnoId] = useState("");
  const [adeudos, setAdeudos] = useState<any[]>([]);

  const [metodo, setMetodo] = useState("EFECTIVO");
  const [referencia, setReferencia] = useState("");
  const [libro, setLibro] = useState("");
  const [iniciales, setIniciales] = useState("");
  const [lineas, setLineas] = useState<Linea[]>([]);

  const [loading, setLoading] = useState(true);
  const [cobrando, setCobrando] = useState(false);
  const [error, setError] = useState("");
  const [recibo, setRecibo] = useState<any>(null);

  useEffect(() => {
    const cargar = async () => {
      try {
        const [ra, rc] = await Promise.all([
          fetch(`${API_URL}/api/alumnos?perPage=200`, { credentials: "include" }),
          fetch(`${API_URL}/api/pagos/conceptos`, { credentials: "include" }),
        ]);

        const ja = await ra.json();

        // 🔥 Antes esto no revisaba `ra.ok`: si el backend respondía 403
        // el selector quedaba vacío sin decir por qué.
        if (!ra.ok) {
          throw new Error(ja?.message || "No se pudieron cargar los alumnos");
        }

        const lista = ja?.data ?? [];

        setAlumnos(lista);

        if (lista.length === 0) {
          setError(
            "No hay alumnos registrados. Da de alta alumnos en Secretaría antes de cobrar."
          );
        }

        if (rc.ok) {
          const jc = await rc.json();
          setConceptos(jc?.data ?? []);
        } else {
          const jc = await rc.json().catch(() => null);

          setError(
            jc?.message ||
              "No se pudo cargar el catálogo de conceptos de pago."
          );
        }
      } catch (e: any) {
        setError(e.message || "Error al cargar");
      } finally {
        setLoading(false);
      }
    };

    cargar();

    try {
      const ultimoLibro = window.localStorage.getItem(LIBRO_STORAGE_KEY);
      if (ultimoLibro) setLibro(ultimoLibro);
    } catch {
      // localStorage no disponible: se captura el libro manualmente.
    }
  }, []);

  const seleccionar = async (id: string) => {
    setAlumnoId(id);
    setRecibo(null);
    setError("");

    if (!id) {
      setAdeudos([]);
      return;
    }

    const res = await fetch(`${API_URL}/api/pagos/resumen/${id}`, {
      credentials: "include",
    });

    const json = await res.json();

    setAdeudos(json?.data?.adeudos ?? []);
  };

  const buscarPorLector = async (codigo: string) => {
    setError("");

    if (!codigo) return;

    const res = await fetch(
      `${API_URL}/api/alumnos/matricula/${encodeURIComponent(codigo)}`,
      { credentials: "include" }
    );

    const json = await res.json();

    if (!res.ok) {
      setError(json?.message || "No se encontró un alumno con esa matrícula");
      return;
    }

    const alumno = json?.data;

    if (!alumno) {
      setError("No se encontró un alumno con esa matrícula");
      return;
    }

    // El alumno escaneado puede no estar en la lista ya cargada
    // (por ejemplo si hay más de 200 alumnos): se agrega para que
    // el <select> pueda mostrarlo y quedar seleccionado.
    setAlumnos((prev) =>
      prev.some((a) => a.id === alumno.id) ? prev : [...prev, alumno]
    );

    await seleccionar(alumno.id);
    setBusqueda("");
  };

  const agregarLinea = (concepto: any, adeudo?: any) => {
    setLineas((prev) => [
      ...prev,
      {
        conceptoPagoId: concepto?.id ?? adeudo?.conceptoPagoId,
        descripcion: adeudo?.descripcion || "",
        cantidad: 1,
        monto: Number(adeudo?.saldo ?? concepto?.monto ?? 0),
        adeudoId: adeudo?.id ?? null,
      },
    ]);
  };

  const quitarLinea = (i: number) =>
    setLineas((prev) => prev.filter((_, idx) => idx !== i));

  const cambiarLinea = (i: number, campo: string, valor: any) =>
    setLineas((prev) =>
      prev.map((l, idx) => (idx === i ? { ...l, [campo]: valor } : l))
    );

  const total = lineas.reduce(
    (acc, l) => acc + Number(l.monto || 0) * Number(l.cantidad || 1),
    0
  );

  const cobrar = async () => {
    setError("");

    if (!alumnoId) {
      setError("Selecciona un alumno");
      return;
    }

    if (lineas.length === 0) {
      setError("Agrega al menos un concepto");
      return;
    }

    try {
      setCobrando(true);

      const res = await fetch(`${API_URL}/api/pagos`, {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          alumnoId,
          metodo,
          referencia,
          libro: libro.trim() || undefined,
          iniciales: iniciales.trim() ? iniciales.trim().toUpperCase() : undefined,
          conceptos: lineas,
        }),
      });

      const json = await res.json();

      if (!res.ok) {
        setError(json?.message || "No se pudo registrar el cobro");
        return;
      }

      setRecibo(json?.data ?? null);
      setLineas([]);
      setReferencia("");

      try {
        if (libro.trim()) window.localStorage.setItem(LIBRO_STORAGE_KEY, libro.trim());
      } catch {
        // localStorage no disponible: no afecta el cobro ya registrado.
      }

      seleccionar(alumnoId);
    } catch {
      setError("Error de conexión con el servidor");
    } finally {
      setCobrando(false);
    }
  };

  const filtrados = filtrarAlumnos(alumnos, busqueda, campoBusqueda, (a) => ({
    matricula: a.matricula,
    nombre: a.user?.name,
  }));

  if (loading) return <p className="p-6">Cargando...</p>;

  return (
    <div className="space-y-6">
      <section className="rounded-3xl border bg-white p-6 shadow-sm">
        <h1 className="text-3xl font-bold">Cobros</h1>
        <p className="text-gray-500">
          Cada cobro genera un recibo con folio consecutivo.
        </p>
      </section>

      {error && (
        <p className="rounded-xl bg-red-50 p-4 text-red-600">{error}</p>
      )}

      {recibo && (
        <section className="rounded-3xl border-2 border-green-500 bg-green-50 p-6">
          <h2 className="text-2xl font-bold text-green-800">
            Recibo {recibo.folio}
          </h2>

          <p className="mt-1 text-sm text-green-700">
            Total cobrado: ${Number(recibo.total ?? 0).toFixed(2)}
            {recibo.libro ? ` · Libro ${recibo.libro}` : ""}
            {recibo.iniciales ? ` · ${recibo.iniciales}` : ""}
          </p>

          <ul className="mt-3 space-y-1 text-sm text-green-900">
            {(recibo.detalles ?? []).map((d: any) => (
              <li key={d.id}>
                {d.concepto?.nombre} — ${Number(d.monto).toFixed(2)}
                {d.concepto?.generaTramite && (
                  <span className="ml-2 rounded bg-blue-100 px-2 py-0.5 text-xs text-blue-700">
                    trámite generado para secretaría
                  </span>
                )}
              </li>
            ))}
          </ul>

          <div className="mt-4 flex gap-2">
            <button
              onClick={() => abrirRecibo(recibo)}
              className="rounded-xl bg-green-700 px-4 py-2 text-sm text-white hover:bg-green-800"
            >
              Imprimir recibo
            </button>

            <button
              onClick={() => setRecibo(null)}
              className="rounded-xl border border-green-600 px-4 py-2 text-sm text-green-800"
            >
              Nuevo cobro
            </button>
          </div>
        </section>
      )}

      <section className="rounded-3xl border bg-white p-5 shadow-sm">
        <h2 className="mb-3 font-semibold">Alumno</h2>

        <BuscadorAlumnos
          valor={busqueda}
          campo={campoBusqueda}
          onValor={setBusqueda}
          onCampo={setCampoBusqueda}
          onLector={buscarPorLector}
          conLector
          autoFocus
        />

        <select
          className="mt-3 w-full rounded-xl border border-gray-300 px-4 py-2"
          value={alumnoId}
          onChange={(e) => seleccionar(e.target.value)}
        >
          <option value="">Selecciona un alumno...</option>

          {filtrados.map((a) => (
            <option key={a.id} value={a.id}>
              {a.matricula} — {a.user?.name}
            </option>
          ))}
        </select>

        {alumnoId && adeudos.length > 0 && (
          <div className="mt-4 rounded-2xl bg-amber-50 p-4">
            <p className="mb-2 text-sm font-medium text-amber-800">
              Adeudos pendientes
            </p>

            <ul className="space-y-2">
              {adeudos.map((ad) => (
                <li
                  key={ad.id}
                  className="flex items-center justify-between text-sm"
                >
                  <span>
                    {ad.descripcion || ad.concepto?.nombre || "Adeudo"} — $
                    {Number(ad.saldo).toFixed(2)}
                  </span>

                  <button
                    onClick={() => agregarLinea(ad.concepto, ad)}
                    className="rounded-lg border border-amber-500 px-3 py-1 text-xs text-amber-800"
                  >
                    Cobrar
                  </button>
                </li>
              ))}
            </ul>
          </div>
        )}

        {alumnoId && adeudos.length === 0 && (
          <p className="mt-3 text-sm text-gray-500">
            Este alumno no tiene adeudos registrados.
          </p>
        )}
      </section>

      <section className="rounded-3xl border bg-white p-5 shadow-sm">
        <h2 className="mb-3 font-semibold">Conceptos a cobrar</h2>

        {conceptos.length > 0 && (
          <div className="mb-4 flex flex-wrap gap-2">
            {conceptos
              .filter((c) => c.activo !== false)
              .map((c) => (
                <button
                  key={c.id}
                  onClick={() => agregarLinea(c)}
                  className="rounded-xl border px-3 py-2 text-sm hover:bg-gray-50"
                >
                  + {c.nombre}
                  {c.monto ? ` ($${c.monto})` : ""}
                </button>
              ))}
          </div>
        )}

        {lineas.length === 0 ? (
          <p className="text-sm text-gray-500">
            Todavía no hay conceptos en este recibo.
          </p>
        ) : (
          <ul className="space-y-2">
            {lineas.map((l, i) => (
              <li key={i} className="grid gap-2 md:grid-cols-6">
                <input
                  className="rounded-xl border border-gray-300 px-3 py-2 md:col-span-3"
                  placeholder="Descripción"
                  value={l.descripcion}
                  onChange={(e) =>
                    cambiarLinea(i, "descripcion", e.target.value)
                  }
                />

                <input
                  type="number"
                  min={1}
                  className="rounded-xl border border-gray-300 px-3 py-2"
                  value={l.cantidad}
                  onChange={(e) =>
                    cambiarLinea(i, "cantidad", Number(e.target.value))
                  }
                />

                <input
                  type="number"
                  min={0}
                  step="0.01"
                  className="rounded-xl border border-gray-300 px-3 py-2"
                  value={l.monto}
                  onChange={(e) =>
                    cambiarLinea(i, "monto", Number(e.target.value))
                  }
                />

                <button
                  onClick={() => quitarLinea(i)}
                  className="rounded-xl border px-3 py-2 text-sm hover:bg-red-50"
                >
                  Quitar
                </button>
              </li>
            ))}
          </ul>
        )}

        <div className="mt-4 grid gap-3 md:grid-cols-3">
          <select
            className="rounded-xl border border-gray-300 px-3 py-2"
            value={metodo}
            onChange={(e) => setMetodo(e.target.value)}
          >
            {METODOS.map((m) => (
              <option key={m} value={m}>
                {m}
              </option>
            ))}
          </select>

          <input
            className="rounded-xl border border-gray-300 px-3 py-2"
            placeholder="Referencia (opcional)"
            value={referencia}
            onChange={(e) => setReferencia(e.target.value)}
          />

          <div className="flex items-center justify-end text-xl font-bold">
            ${total.toFixed(2)}
          </div>
        </div>

        <div className="mt-3 grid gap-3 md:grid-cols-2">
          <input
            className="rounded-xl border border-gray-300 px-3 py-2"
            placeholder="Libro (ej. L-12)"
            value={libro}
            onChange={(e) => setLibro(e.target.value)}
          />

          <input
            className="rounded-xl border border-gray-300 px-3 py-2"
            placeholder="Iniciales del cajero (opcional)"
            value={iniciales}
            onChange={(e) => setIniciales(e.target.value.toUpperCase())}
          />
        </div>

        <button
          onClick={cobrar}
          disabled={cobrando || lineas.length === 0 || !alumnoId}
          className="mt-4 w-full rounded-xl bg-blue-600 py-3 text-white transition hover:bg-blue-700 disabled:bg-gray-400"
        >
          {cobrando ? "Cobrando..." : "Cobrar y generar recibo"}
        </button>
      </section>
    </div>
  );
}
