import { PrismaClient } from "@prisma/client";
import "server-only";

declare global {
  // allow global `var` declarations
  var prisma: PrismaClient | undefined;
}

const createPrismaClient = () => {
  const client = new PrismaClient({
    log: ["query"],
  });

  return client;
};

export const prisma = global.prisma || createPrismaClient();

if (process.env.NODE_ENV !== "production") {
  global.prisma = prisma;
}
