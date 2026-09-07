"use client";

import { useEffect, useRef, useState } from "react";

/**
 * 🔎 BUSCADOR DE ALUMNOS
 *
 * En ventanilla siempre se busca de dos maneras: por apellido, porque es
 * lo que dice la persona, o por matrícula, porque es lo que trae el
 * documento. Un solo cuadro de texto que busca "en todo" obliga a leer
 * resultados de más, así que aquí el campo se elige.
 *
 * `conLector` activa el modo pistola de código de barras: el lector
 * teclea la matrícula y manda Enter, y ese Enter dispara `onLector`.
 *
 * El componente es controlado: cada pantalla decide si filtra en memoria
 * o vuelve a pedirle la lista al backend con `?campo=&search=`.
 */

export type CampoBusqueda = "todos" | "apellido" | "matricula";

export function BuscadorAlumnos({
  valor,
  campo,
  onValor,
  onCampo,
  onLector,
  onBuscar,
  autoFocus = false,
  conLector = false,
  placeholder,
  children,
}: {
  valor: string;
  campo: CampoBusqueda;
  onValor: (v: string) => void;
  onCampo: (c: CampoBusqueda) => void;
  /** Se dispara con Enter cuando `conLector` está activo. */
  onLector?: (codigo: string) => void;
  /** Se dispara con Enter cuando NO hay lector. */
  onBuscar?: () => void;
  autoFocus?: boolean;
  conLector?: boolean;
  placeholder?: string;
  children?: React.ReactNode;
}) {
  const input = useRef<HTMLInputElement>(null);

  // El lector escribe muy rápido: si el foco se pierde, el código se
  // pierde con él. Por eso en modo lector el cuadro se enfoca solo.
  useEffect(() => {
    if (autoFocus) input.current?.focus();
  }, [autoFocus, campo]);

  const textoPorCampo: Record<CampoBusqueda, string> = {
    todos: "Nombre, matrícula, CURP o correo",
    apellido: "Apellido del alumno",
    matricula: conLector
      ? "Escanea la credencial o teclea la matrícula"
      : "Matrícula del alumno",
  };

  return (
    <div className="flex flex-col gap-2 md:flex-row md:items-center">
      <select
        value={campo}
        onChange={(e) => onCampo(e.target.value as CampoBusqueda)}
        aria-label="Buscar por"
        className="rounded-xl border border-slate-300 px-3 py-2 text-sm"
      >
        <option value="apellido">Apellido</option>
        <option value="matricula">Matrícula</option>
        <option value="todos">Todo</option>
      </select>

      <input
        ref={input}
        value={valor}
        onChange={(e) => onValor(e.target.value)}
        onKeyDown={(e) => {
          if (e.key !== "Enter") return;

          e.preventDefault();

          if (conLector && campo === "matricula" && onLector) {
            onLector(valor.trim());
            return;
          }

          onBuscar?.();
        }}
        placeholder={placeholder || textoPorCampo[campo]}
        className="w-full rounded-xl border border-slate-300 px-4 py-2 text-sm md:w-80"
      />

      {valor && (
        <button
          type="button"
          onClick={() => onValor("")}
          className="rounded-xl border border-slate-300 px-3 py-2 text-sm text-slate-600 hover:bg-slate-50"
        >
          Limpiar
        </button>
      )}

      {children}
    </div>
  );
}

/**
 * Filtro en memoria con el mismo criterio que usa el backend.
 * Sirve para las pantallas que ya cargaron la lista completa.
 */
export function filtrarAlumnos<T extends any>(
  lista: T[],
  texto: string,
  campo: CampoBusqueda,
  extraer: (a: T) => { matricula?: string | null; nombre?: string | null; extra?: string | null }
) {
  const t = texto.trim().toLowerCase();

  if (!t) return lista;

  return lista.filter((item) => {
    const { matricula, nombre, extra } = extraer(item);

    const mat = (matricula || "").toLowerCase();
    const nom = (nombre || "").toLowerCase();

    if (campo === "matricula") return mat.includes(t);

    // El nombre completo viene en un solo campo: buscar el apellido
    // dentro de la cadena funciona en cualquiera de los dos órdenes.
    if (campo === "apellido") return nom.includes(t);

    return (
      mat.includes(t) || nom.includes(t) || (extra || "").toLowerCase().includes(t)
    );
  });
}
