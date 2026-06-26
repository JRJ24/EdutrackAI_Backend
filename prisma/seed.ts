import "dotenv/config";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "../generated/prisma/client";

const connectionString = process.env.DATABASE_URL;

if (!connectionString) {
  throw new Error("DATABASE_URL is missing");
}

const prisma = new PrismaClient({
  adapter: new PrismaPg({ connectionString }),
});

const roles = [
  {
    name: "student",
    description: "Default role for registered students",
  },
  {
    name: "admin",
    description: "Administrator role with elevated permissions",
  },
];

const seed = async () => {
  for (const role of roles) {
    const existingRole = await prisma.roles.findFirst({
      where: { name: role.name },
      select: { id: true },
    });

    if (existingRole) {
      await prisma.roles.update({
        where: { id: existingRole.id },
        data: { description: role.description },
      });
      continue;
    }

    await prisma.roles.create({ data: role });
  }
};

seed()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (error) => {
    console.error(error);
    await prisma.$disconnect();
    process.exit(1);
  });
