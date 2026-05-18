"use client";

import { useEffect, useState } from "react";

export default function DirectorAsignacionesPage() {

  const [asignaciones, setAsignaciones] =
    useState<any[]>([]);

  const [materias, setMaterias] =
    useState<any[]>([]);

  const [docentes, setDocentes] =
    useState<any[]>([]);

  const [grupos, setGrupos] =
    useState<any[]>([]);

  const [ciclos, setCiclos] =
    useState<any[]>([]);

  const [materiaId, setMateriaId] =
    useState("");

  const [docenteId, setDocenteId] =
    useState("");

  const [grupoId, setGrupoId] =
    useState("");

  const [
    cicloEscolarId,
    setCicloEscolarId
  ] = useState("");

  const [horario, setHorario] =
    useState("");

  const [aula, setAula] =
    useState("");

  const [loading, setLoading] =
    useState(true);

  const [creating, setCreating] =
    useState(false);

  // ========================================
  // 🔥 FETCH DATA
  // ========================================
 const fetchData = async () => {

  try {

    const token =
      localStorage.getItem("token");

    // 📚 ASIGNACIONES
    const resAsignaciones =
      await fetch(
        "http://localhost:4000/api/asignaciones",
        {
          headers: {
            Authorization:
              `Bearer ${token}`
          }
        }
      );

    const asignacionesData =
      await resAsignaciones.json();

    // 📘 MATERIAS
    const resMaterias =
      await fetch(
        "http://localhost:4000/api/materias",
        {
          headers: {
            Authorization:
              `Bearer ${token}`
          }
        }
      );

    const materiasData =
      await resMaterias.json();

    // 👨‍🏫 DOCENTES
    const resDocentes =
      await fetch(
        "http://localhost:4000/api/docentes",
        {
          headers: {
            Authorization:
              `Bearer ${token}`
          }
        }
      );

    const docentesData =
      await resDocentes.json();

    // 👥 GRUPOS
    const resGrupos =
      await fetch(
        "http://localhost:4000/api/grupos",
        {
          headers: {
            Authorization:
              `Bearer ${token}`
          }
        }
      );

    const gruposData =
      await resGrupos.json();

    // 📚 CICLOS
    const resCiclos =
      await fetch(
        "http://localhost:4000/api/ciclos",
        {
          headers: {
            Authorization:
              `Bearer ${token}`
          }
        }
      );

    const ciclosData =
      await resCiclos.json();

    // 🔥 NORMALIZACIÓN

    setAsignaciones(
      Array.isArray(asignacionesData)
        ? asignacionesData
        : Array.isArray(asignacionesData?.data)
        ? asignacionesData.data
        : []
    );

    setMaterias(
      Array.isArray(materiasData)
        ? materiasData
        : Array.isArray(materiasData?.data)
        ? materiasData.data
        : Array.isArray(materiasData?.materias)
        ? materiasData.materias
        : []
    );

    setDocentes(
      Array.isArray(docentesData)
        ? docentesData
        : Array.isArray(docentesData?.data)
        ? docentesData.data
        : Array.isArray(docentesData?.docentes)
        ? docentesData.docentes
        : []
    );

    setGrupos(
      Array.isArray(gruposData)
        ? gruposData
        : Array.isArray(gruposData?.data)
        ? gruposData.data
        : Array.isArray(gruposData?.grupos)
        ? gruposData.grupos
        : []
    );

    setCiclos(
      Array.isArray(ciclosData)
        ? ciclosData
        : Array.isArray(ciclosData?.data)
        ? ciclosData.data
        : []
    );

  } catch (error) {

    console.error(error);

    alert(
      "Error cargando datos"
    );

  } finally {

    setLoading(false);

  }
};

  // ========================================
  // ➕ CREAR
  // ========================================
  const crearAsignacion =
    async () => {

      if (
        !materiaId ||
        !docenteId ||
        !grupoId ||
        !cicloEscolarId
      ) {

        alert(
          "Completa todos los campos"
        );

        return;
      }

      try {

        setCreating(true);

        const token =
          localStorage.getItem("token");

        const res = await fetch(
          "http://localhost:4000/api/asignaciones",
          {

            method: "POST",

            headers: {

              "Content-Type":
                "application/json",

              Authorization:
                `Bearer ${token}`

            },

            body: JSON.stringify({

              materiaId,
              docenteId,
              grupoId,
              cicloEscolarId,
              horario,
              aula

            })

          }
        );

        const response =
          await res.json();

        if (!res.ok) {

          throw new Error(
            response?.message ||
            "Error creando asignación"
          );

        }

        alert(
          "✅ Asignación creada"
        );

        setMateriaId("");
        setDocenteId("");
        setGrupoId("");
        setCicloEscolarId("");
        setHorario("");
        setAula("");

        fetchData();

      } catch (error: any) {

        console.error(error);

        alert(
          error.message
        );

      } finally {

        setCreating(false);

      }
    };

  // ========================================
  // ❌ ELIMINAR
  // ========================================
  const eliminarAsignacion =
    async (id: string) => {

      const confirmar =
        confirm(
          "¿Eliminar asignación?"
        );

      if (!confirmar) return;

      try {

        const token =
          localStorage.getItem("token");

        const res = await fetch(
          `http://localhost:4000/api/asignaciones/${id}`,
          {

            method: "DELETE",

            headers: {
              Authorization:
                `Bearer ${token}`
            }

          }
        );

        const response =
          await res.json();

        if (!res.ok) {

          throw new Error(
            response?.message ||
            "Error eliminando"
          );

        }

        alert(
          "✅ Asignación eliminada"
        );

        fetchData();

      } catch (error: any) {

        console.error(error);

        alert(
          error.message
        );

      }
    };

  useEffect(() => {

    fetchData();

  }, []);

  // ========================================
  // LOADING
  // ========================================
  if (loading) {

    return (
      <div className="p-6">
        Cargando asignaciones...
      </div>
    );

  }

  return (

    <div className="p-6 space-y-6">

      {/* HEADER */}
      <section className="bg-white rounded-2xl shadow p-6">

        <h1 className="text-3xl font-bold">
          Asignaciones académicas 📚
        </h1>

        <p className="text-gray-500 mt-1">
          Gestión de materias y maestros
        </p>

      </section>

      {/* FORM */}
      <section className="bg-white rounded-2xl shadow p-6">

        <h2 className="text-xl font-semibold mb-4">
          Nueva asignación
        </h2>

        <div className="grid md:grid-cols-2 gap-4">

          {/* MATERIA */}
          <select
            value={materiaId}
            onChange={(e) =>
              setMateriaId(
                e.target.value
              )
            }
            className="border rounded-xl p-3"
          >

            <option value="">
              Selecciona materia
            </option>

            {
              materias.map((m) => (
                <option
                  key={m.id}
                  value={m.id}
                >
                  {m.nombre}
                </option>
              ))
            }

          </select>

          {/* DOCENTE */}
          <select
            value={docenteId}
            onChange={(e) =>
              setDocenteId(
                e.target.value
              )
            }
            className="border rounded-xl p-3"
          >

            <option value="">
              Selecciona docente
            </option>

            {
              docentes.map((d) => (
                <option
                  key={d.id}
                  value={d.id}
                >
                  {
                    d?.user?.name ||
                    "Docente"
                  }
                </option>
              ))
            }

          </select>

          {/* GRUPO */}
          <select
            value={grupoId}
            onChange={(e) =>
              setGrupoId(
                e.target.value
              )
            }
            className="border rounded-xl p-3"
          >

            <option value="">
              Selecciona grupo
            </option>

            {
              grupos.map((g) => (
                <option
                  key={g.id}
                  value={g.id}
                >
                  {g.nombre}
                </option>
              ))
            }

          </select>

          {/* CICLO */}
          <select
            value={cicloEscolarId}
            onChange={(e) =>
              setCicloEscolarId(
                e.target.value
              )
            }
            className="border rounded-xl p-3"
          >

            <option value="">
              Selecciona ciclo
            </option>

            {
              ciclos.map((c) => (
                <option
                  key={c.id}
                  value={c.id}
                >
                  {c.nombre}
                </option>
              ))
            }

          </select>

          {/* HORARIO */}
          <input
            type="text"
            placeholder="Lun-Mie 7am-9am"
            value={horario}
            onChange={(e) =>
              setHorario(
                e.target.value
              )
            }
            className="border rounded-xl p-3"
          />

          {/* AULA */}
          <input
            type="text"
            placeholder="Aula A-12"
            value={aula}
            onChange={(e) =>
              setAula(
                e.target.value
              )
            }
            className="border rounded-xl p-3"
          />

        </div>

        <button
          onClick={crearAsignacion}
          disabled={creating}
          className="mt-6 bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-xl"
        >
          {
            creating
              ? "Creando..."
              : "Crear asignación"
          }
        </button>

      </section>

      {/* TABLA */}
      <section className="bg-white rounded-2xl shadow p-6">

        <h2 className="text-xl font-semibold mb-4">
          Asignaciones registradas
        </h2>

        {
          asignaciones.length === 0 ? (

            <p className="text-gray-500">
              No hay asignaciones
            </p>

          ) : (

            <div className="overflow-x-auto">

              <table className="w-full">

                <thead>

                  <tr className="border-b">

                    <th className="text-left p-3">
                      Materia
                    </th>

                    <th className="text-left p-3">
                      Maestro
                    </th>

                    <th className="text-left p-3">
                      Grupo
                    </th>

                    <th className="text-left p-3">
                      Ciclo
                    </th>

                    <th className="text-left p-3">
                      Horario
                    </th>

                    <th className="text-left p-3">
                      Aula
                    </th>

                    <th className="text-left p-3">
                      Acción
                    </th>

                  </tr>

                </thead>

                <tbody>

                  {
                    asignaciones.map((a) => (

                      <tr
                        key={a.id}
                        className="border-b"
                      >

                        <td className="p-3">
                          {
                            a?.materia?.nombre
                          }
                        </td>

                        <td className="p-3">
                          {
                            a?.docente?.user?.name
                          }
                        </td>

                        <td className="p-3">
                          {
                            a?.grupo?.nombre
                          }
                        </td>

                        <td className="p-3">
                          {
                            a?.cicloEscolar?.nombre
                          }
                        </td>

                        <td className="p-3">
                          {
                            a?.horario || "-"
                          }
                        </td>

                        <td className="p-3">
                          {
                            a?.aula || "-"
                          }
                        </td>

                        <td className="p-3">

                          <button
                            onClick={() =>
                              eliminarAsignacion(
                                a.id
                              )
                            }
                            className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-xl"
                          >
                            Eliminar
                          </button>

                        </td>

                      </tr>

                    ))
                  }

                </tbody>

              </table>

            </div>

          )
        }

      </section>

    </div>

  );
}