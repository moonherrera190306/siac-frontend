"use client";

import { ReactNode } from "react";

/**
 * 🧱 COMPONENTES COMPARTIDOS
 *
 * Identidad: azules y grises, con el ámbar como acento.
 *
 * Se usan clases estándar de Tailwind a propósito. Las utilidades con
 * variables CSS (`bg-[var(--x)]`) dependen de que el compilador las
 * genere, y cuando no lo hace el componente se queda sin estilo sin
 * que nada avise. Los tokens de globals.css siguen ahí para el CSS
 * propio; aquí no se arriesga la estructura.
 */

/* ---------- Encabezado de pantalla ---------- */
export function PageHeader({
  titulo,
  descripcion,
  children,
}: {
  titulo: string;
  descripcion?: string;
  children?: ReactNode;
}) {
  return (
    <section className="flex flex-col gap-4 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm md:flex-row md:items-center md:justify-between">
      <div>
        <h1 className="text-2xl font-bold text-slate-900 md:text-3xl">
          {titulo}
        </h1>

        {descripcion && (
          <p className="mt-1 text-sm text-slate-500">{descripcion}</p>
        )}
      </div>

      {children && <div className="flex flex-wrap gap-2">{children}</div>}
    </section>
  );
}

/* ---------- Tarjeta ---------- */
export function Card({
  children,
  className = "",
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <section
      className={`rounded-2xl border border-slate-200 bg-white p-5 shadow-sm ${className}`}
    >
      {children}
    </section>
  );
}

/* ---------- Tarjeta de dato (KPI) ----------
   Número grande, etiqueta chica. Sin gráfica: cuando el dato
   es uno solo, un número se lee mejor que cualquier barra. */
export function Stat({
  etiqueta,
  valor,
  nota,
  acento = false,
}: {
  etiqueta: string;
  valor: ReactNode;
  nota?: string;
  acento?: boolean;
}) {
  return (
    <div
      className={`rounded-2xl border p-5 shadow-sm ${
        acento ? "border-amber-200 bg-amber-50" : "border-slate-200 bg-white"
      }`}
    >
      <p className="text-sm text-slate-500">{etiqueta}</p>

      <p className="mt-1 text-2xl font-bold text-slate-900">{valor}</p>

      {nota && <p className="mt-1 text-xs text-slate-400">{nota}</p>}
    </div>
  );
}

/* ---------- Botón ---------- */
type Variante = "primario" | "secundario" | "acento" | "peligro";

const VARIANTES: Record<Variante, string> = {
  primario: "bg-blue-700 text-white hover:bg-blue-800",
  secundario:
    "border border-slate-300 bg-white text-slate-700 hover:bg-slate-50",
  acento: "bg-amber-500 text-slate-900 hover:bg-amber-400",
  peligro: "border border-slate-300 text-red-700 hover:bg-red-50",
};

export function Button({
  children,
  variante = "primario",
  className = "",
  ...props
}: {
  children: ReactNode;
  variante?: Variante;
} & React.ButtonHTMLAttributes<HTMLButtonElement>) {
  return (
    <button
      {...props}
      className={`rounded-xl px-4 py-2 text-sm font-medium transition disabled:cursor-not-allowed disabled:opacity-50 ${VARIANTES[variante]} ${className}`}
    >
      {children}
    </button>
  );
}

/* ---------- Badge ----------
   Los colores de estado son reservados y SIEMPRE llevan texto:
   la identidad nunca depende solo del color. */
type Tono = "neutro" | "bien" | "alerta" | "grave" | "info";

const TONOS: Record<Tono, string> = {
  neutro: "bg-slate-100 text-slate-700",
  info: "bg-blue-50 text-blue-800",
  bien: "bg-green-100 text-green-800",
  alerta: "bg-amber-100 text-amber-800",
  grave: "bg-red-100 text-red-800",
};

export function Badge({
  children,
  tono = "neutro",
}: {
  children: ReactNode;
  tono?: Tono;
}) {
  return (
    <span
      className={`inline-block rounded-full px-2.5 py-1 text-xs font-medium ${TONOS[tono]}`}
    >
      {children}
    </span>
  );
}

/* ---------- Estado vacío ----------
   Un vacío explicado vale más que una tabla en blanco. */
export function Vacio({ titulo, pista }: { titulo: string; pista?: string }) {
  return (
    <div className="rounded-2xl border border-dashed border-slate-300 bg-white p-8 text-center">
      <p className="text-slate-500">{titulo}</p>

      {pista && <p className="mt-1 text-sm text-slate-400">{pista}</p>}
    </div>
  );
}

/* ---------- Contenedor de tabla ---------- */
export function TableWrap({ children }: { children: ReactNode }) {
  return (
    <div className="overflow-x-auto rounded-2xl border border-slate-200 bg-white shadow-sm">
      {children}
    </div>
  );
}

/* ---------- Barra de magnitud ----------
   Una sola medida, un solo tono: la longitud ES el dato. */
export function Barra({ valor, maximo }: { valor: number; maximo: number }) {
  const ancho = maximo > 0 ? Math.min(100, (valor / maximo) * 100) : 0;

  return (
    <div className="h-2 w-full rounded-full bg-slate-200">
      <div
        className="h-2 rounded-full bg-blue-700"
        style={{ width: `${ancho}%` }}
      />
    </div>
  );
}

/* ---------- Modal ---------- */
export function Modal({
  titulo,
  onClose,
  children,
}: {
  titulo: string;
  onClose: () => void;
  children: ReactNode;
}) {
  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 p-4"
      onClick={onClose}
      role="presentation"
    >
      <div
        className="w-full max-w-lg rounded-2xl bg-white p-6 shadow-xl"
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-label={titulo}
      >
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-xl font-bold text-slate-900">{titulo}</h2>

          <button
            onClick={onClose}
            aria-label="Cerrar"
            className="text-2xl leading-none text-slate-400 hover:text-slate-700"
          >
            ×
          </button>
        </div>

        {children}
      </div>
    </div>
  );
}
