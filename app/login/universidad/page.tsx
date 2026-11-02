import LoginForm from "@/components/LoginForm";

// 🖼️ Imagen provisional: reemplazar /public/login-universidad.svg
// por la imagen oficial (mismas proporciones 1236×345 de preferencia).
export default function LoginUniversidad() {
  return (
    <LoginForm
      nivel="UNIVERSIDAD"
      banner={{
        src: "/login-universidad.svg",
        alt: "CESZAM Universidad",
        width: 1236,
        height: 345,
      }}
      pie="Centro de Estudios Superiores de Zamora · Universidad"
      otroAcceso={{ texto: "¿Eres de Preparatoria? Entra aquí", href: "/login" }}
    />
  );
}
