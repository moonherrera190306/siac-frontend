import LoginForm from "@/components/LoginForm";

export default function LoginUniversidad() {
  return (
    <LoginForm
      nivel="UNIVERSIDAD"
      banner={{
        src: "/justicia-universidad.png",
        alt: "CESZAM Universidad · Derecho",
        width: 433,
        height: 560,
      }}
      pie="Centro de Estudios Superiores de Zamora · Licenciatura en Derecho"
      otroAcceso={{ texto: "¿Eres de Preparatoria? Entra aquí", href: "/login" }}
    />
  );
}
