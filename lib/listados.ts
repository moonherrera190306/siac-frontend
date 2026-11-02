import { API_URL } from "@/lib/config";

/** Abre el PDF del listado de alumnos de un grupo (o de todos). */
export function imprimirListadoGrupo(
  grupoId?: string,
  orden: "matricula" | "nombre" = "nombre"
) {
  const params = new URLSearchParams({ formato: "pdf", orden });
  if (grupoId) params.set("grupoId", grupoId);
  window.open(`${API_URL}/api/grupos/listado?${params.toString()}`, "_blank");
}
