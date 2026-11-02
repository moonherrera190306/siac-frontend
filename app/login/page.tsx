import LoginForm from "@/components/LoginForm";

export default function LoginPreparatoria() {
  return (
    <LoginForm
      nivel="PREPARATORIA"
      banner={{
        src: "/escudo-prepa.png",
        alt: "Escudo de la Escuela Preparatoria por Cooperación de Zamora",
        width: 570,
        height: 480,
      }}
      pie="Escuela Preparatoria por Cooperación de Zamora · Incorporada a la UMSNH"
      otroAcceso={{ texto: "¿Eres de Universidad? Entra aquí", href: "/login/universidad" }}
    />
  );
}
