"use client";

import { useEffect, useState } from "react";

export default function AlumnoPerfilPage() {

  const [alumno, setAlumno] =
    useState<any>(null);

  const [loading, setLoading] =
    useState(true);

  const [saving, setSaving] =
    useState(false);

  const [editando, setEditando] =
    useState(false);

  const [error, setError] =
    useState("");

  // ========================================
  // FORM STATES
  // ========================================

  const [telefono, setTelefono] =
    useState("");

  const [curp, setCurp] =
    useState("");

  const [sexo, setSexo] =
    useState("");

  const [
    fechaNacimiento,
    setFechaNacimiento
  ] = useState("");

  const [ciudad, setCiudad] =
    useState("");

  const [estado, setEstado] =
    useState("");

  const [
    codigoPostal,
    setCodigoPostal
  ] = useState("");

  const [direccion, setDireccion] =
    useState("");

  const [
    tutorNombre,
    setTutorNombre
  ] = useState("");

  const [
    tutorTelefono,
    setTutorTelefono
  ] = useState("");

  // ========================================
  // FETCH PERFIL
  // ========================================

  useEffect(() => {

    const fetchPerfil = async () => {

      try {

        const token =
          localStorage.getItem("token");

        const user = JSON.parse(
          localStorage.getItem("user") || "{}"
        );

        const alumnoId =
          user?.alumnoId || user?.id;

        const res = await fetch(
          `http://localhost:4000/api/alumnos/${alumnoId}`,
          {
            headers: {
              Authorization:
                `Bearer ${token}`,
            },
          }
        );

        const data = await res.json();

        if (!res.ok) {
          throw new Error(
            data.message ||
            "Error obteniendo perfil"
          );
        }

        const alumnoData =
          data.data;

        setAlumno(alumnoData);

        // ====================================
        // SET FORM
        // ====================================

        setTelefono(
          alumnoData?.telefono || ""
        );

        setCurp(
          alumnoData?.curp || ""
        );

        setSexo(
          alumnoData?.sexo || ""
        );

        setFechaNacimiento(
          alumnoData?.fechaNacimiento
            ? alumnoData.fechaNacimiento
                .split("T")[0]
            : ""
        );

        setCiudad(
          alumnoData?.ciudad || ""
        );

        setEstado(
          alumnoData?.estado || ""
        );

        setCodigoPostal(
          alumnoData?.codigoPostal || ""
        );

        setDireccion(
          alumnoData?.direccion || ""
        );

        setTutorNombre(
          alumnoData?.tutorNombre || ""
        );

        setTutorTelefono(
          alumnoData?.tutorTelefono || ""
        );

      } catch (err: any) {

        console.error(err);

        setError(err.message);

      } finally {

        setLoading(false);

      }
    };

    fetchPerfil();

  }, []);

  // ========================================
  // GUARDAR PERFIL
  // ========================================

  const guardarPerfil = async () => {

    try {

      setSaving(true);

      const token =
        localStorage.getItem("token");

      const user = JSON.parse(
        localStorage.getItem("user") || "{}"
      );

      const alumnoId =
        user?.alumnoId || user?.id;

      const res = await fetch(
        `http://localhost:4000/api/alumnos/perfil/${alumnoId}`,
        {
          method: "PUT",

          headers: {
            "Content-Type":
              "application/json",

            Authorization:
              `Bearer ${token}`,
          },

          body: JSON.stringify({

            telefono,
            curp,
            sexo,
            fechaNacimiento,
            ciudad,
            estado,
            codigoPostal,
            direccion,
            tutorNombre,
            tutorTelefono
          }),
        }
      );

      const data = await res.json();

      if (!res.ok) {
        throw new Error(
          data.message ||
          "Error actualizando perfil"
        );
      }

      setAlumno(data.data);

      setEditando(false);

      alert(
        "Perfil actualizado correctamente"
      );

    } catch (err: any) {

      console.error(err);

      alert(err.message);

    } finally {

      setSaving(false);

    }
  };

  // ========================================
  // LOADING
  // ========================================

  if (loading) {
    return (
      <div className="p-6">
        Cargando perfil...
      </div>
    );
  }

  // ========================================
  // ERROR
  // ========================================

  if (error) {
    return (
      <div className="bg-red-100 text-red-600 p-4 rounded-2xl">
        {error}
      </div>
    );
  }

  // ========================================
  // UI
  // ========================================

  return (
    <div className="space-y-6 p-6">

      {/* HEADER */}
      <section className="bg-white rounded-3xl shadow p-6 flex justify-between items-start">

        <div className="flex gap-6">

          {/* FOTO */}
          <div className="h-24 w-24 rounded-full bg-slate-200 flex items-center justify-center text-5xl font-bold">

            {alumno?.user?.name
              ?.charAt(0)}

          </div>

          {/* INFO */}
          <div>

            <h1 className="text-5xl font-bold">

              {alumno?.user?.name}

            </h1>

            <p className="text-gray-500 mt-2">

              {alumno?.user?.email}

            </p>

            <div className="mt-4 inline-block rounded-full bg-slate-100 px-4 py-1 text-sm">

              Matrícula:
              {" "}
              {alumno?.matricula}

            </div>

          </div>

        </div>

        {/* BOTONES */}
        <div className="flex gap-3">

          {editando && (

            <button
              onClick={() =>
                setEditando(false)
              }
              className="rounded-xl border border-slate-300 px-5 py-2"
            >
              Cancelar
            </button>

          )}

          <button
            onClick={() => {

              if (editando) {
                guardarPerfil();
              } else {
                setEditando(true);
              }

            }}
            disabled={saving}
            className="rounded-xl bg-blue-600 px-5 py-2 text-white hover:bg-blue-700"
          >

            {saving
              ? "Guardando..."
              : editando
                ? "Guardar cambios"
                : "Editar perfil"}

          </button>

        </div>

      </section>

      {/* GRID */}
      <div className="grid lg:grid-cols-2 gap-6">

        {/* PERSONAL */}
        <section className="bg-white rounded-3xl shadow p-6 space-y-4">

          <h2 className="text-2xl font-bold">
            Información personal
          </h2>

          {/* TEL */}
          <div>
            <label className="text-sm text-gray-500">
              Teléfono
            </label>

            <input
              disabled={!editando}
              value={telefono}
              onChange={(e) =>
                setTelefono(
                  e.target.value
                )
              }
              className="w-full mt-1 border rounded-xl p-3 disabled:bg-slate-100"
            />
          </div>

          {/* CURP */}
          <div>
            <label className="text-sm text-gray-500">
              CURP
            </label>

            <input
              disabled={!editando}
              value={curp}
              onChange={(e) =>
                setCurp(
                  e.target.value
                )
              }
              className="w-full mt-1 border rounded-xl p-3 disabled:bg-slate-100"
            />
          </div>

          {/* SEXO */}
          <div>
            <label className="text-sm text-gray-500">
              Sexo
            </label>

            <select
              disabled={!editando}
              value={sexo}
              onChange={(e) =>
                setSexo(
                  e.target.value
                )
              }
              className="w-full mt-1 border rounded-xl p-3 disabled:bg-slate-100"
            >

              <option value="">
                Seleccionar
              </option>

              <option value="M">
                Masculino
              </option>

              <option value="F">
                Femenino
              </option>

            </select>
          </div>

          {/* FECHA */}
          <div>
            <label className="text-sm text-gray-500">
              Fecha nacimiento
            </label>

            <input
              type="date"
              disabled={!editando}
              value={fechaNacimiento}
              onChange={(e) =>
                setFechaNacimiento(
                  e.target.value
                )
              }
              className="w-full mt-1 border rounded-xl p-3 disabled:bg-slate-100"
            />
          </div>

        </section>

        {/* ACADÉMICA */}
        <section className="bg-white rounded-3xl shadow p-6 space-y-4">

          <h2 className="text-2xl font-bold">
            Información académica
          </h2>

          <div>
            <label className="text-sm text-gray-500">
              Programa
            </label>

            <p className="font-semibold mt-1">
              {alumno?.programa
                ?.nombre || "-"}
            </p>
          </div>

          <div>
            <label className="text-sm text-gray-500">
              Carrera
            </label>

            <p className="font-semibold mt-1">
              {alumno?.carrera
                ?.nombre || "-"}
            </p>
          </div>

          <div>
            <label className="text-sm text-gray-500">
              Grupo
            </label>

            <p className="font-semibold mt-1">
              {alumno?.grupo
                ?.nombre || "-"}
            </p>
          </div>

          <div>
            <label className="text-sm text-gray-500">
              Estatus
            </label>

            <div className="mt-3 inline-block rounded-full bg-green-100 text-green-700 px-4 py-1 text-sm font-semibold">
              ACTIVO
            </div>
          </div>

        </section>

      </div>

      {/* DIRECCIÓN */}
      <section className="bg-white rounded-3xl shadow p-6">

        <h2 className="text-2xl font-bold mb-6">
          Dirección
        </h2>

        <div className="grid md:grid-cols-3 gap-4">

          <div>
            <label className="text-sm text-gray-500">
              Ciudad
            </label>

            <input
              disabled={!editando}
              value={ciudad}
              onChange={(e) =>
                setCiudad(
                  e.target.value
                )
              }
              className="w-full mt-1 border rounded-xl p-3 disabled:bg-slate-100"
            />
          </div>

          <div>
            <label className="text-sm text-gray-500">
              Estado
            </label>

            <input
              disabled={!editando}
              value={estado}
              onChange={(e) =>
                setEstado(
                  e.target.value
                )
              }
              className="w-full mt-1 border rounded-xl p-3 disabled:bg-slate-100"
            />
          </div>

          <div>
            <label className="text-sm text-gray-500">
              Código Postal
            </label>

            <input
              disabled={!editando}
              value={codigoPostal}
              onChange={(e) =>
                setCodigoPostal(
                  e.target.value
                )
              }
              className="w-full mt-1 border rounded-xl p-3 disabled:bg-slate-100"
            />
          </div>

          <div className="md:col-span-3">
            <label className="text-sm text-gray-500">
              Dirección
            </label>

            <input
              disabled={!editando}
              value={direccion}
              onChange={(e) =>
                setDireccion(
                  e.target.value
                )
              }
              className="w-full mt-1 border rounded-xl p-3 disabled:bg-slate-100"
            />
          </div>

        </div>

      </section>

      {/* TUTOR */}
      <section className="bg-white rounded-3xl shadow p-6">

        <h2 className="text-2xl font-bold mb-6">
          Tutor
        </h2>

        <div className="grid md:grid-cols-2 gap-4">

          <div>
            <label className="text-sm text-gray-500">
              Nombre tutor
            </label>

            <input
              disabled={!editando}
              value={tutorNombre}
              onChange={(e) =>
                setTutorNombre(
                  e.target.value
                )
              }
              className="w-full mt-1 border rounded-xl p-3 disabled:bg-slate-100"
            />
          </div>

          <div>
            <label className="text-sm text-gray-500">
              Teléfono tutor
            </label>

            <input
              disabled={!editando}
              value={tutorTelefono}
              onChange={(e) =>
                setTutorTelefono(
                  e.target.value
                )
              }
              className="w-full mt-1 border rounded-xl p-3 disabled:bg-slate-100"
            />
          </div>

        </div>

      </section>

    </div>
  );
}