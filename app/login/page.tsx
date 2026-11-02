import LoginForm from "@/components/LoginForm";

export default function LoginPreparatoria() {
  return (
    <LoginForm
      nivel="PREPARATORIA"
      banner={{
        src: "/membrete-banner.png",
        alt: "Centro de Estudios Superiores de Zamora",
        width: 1236,
        height: 345,
      }}
      pie="Escuela Preparatoria por Cooperación de Zamora · Incorporada a la UMSNH"
      otroAcceso={{ texto: "¿Eres de Universidad? Entra aquí", href: "/login/universidad" }}
    />
  );
}
