import { PrismaClient } from "@prisma/client";
import bcrypt from "bcrypt";

const prisma = new PrismaClient();

async function main() {
  // Crear roles
  const adminRole = await prisma.role.create({
    data: { nombre: "admin" }
  });

  // Crear usuario admin
  const hashedPassword = await bcrypt.hash("admin123", 10);

  const adminUser = await prisma.usuario.create({
    data: {
      nombre: "Admin",
      apellidos: "Sistema",
      email: "admin@sie.com",
      passwordHash: hashedPassword,
      roles: {
        create: {
          roleId: adminRole.id
        }
      }
    }
  });

  console.log("✅ Admin creado:", adminUser.email);
}

main()
  .catch(e => console.error(e))
  .finally(() => prisma.$disconnect());