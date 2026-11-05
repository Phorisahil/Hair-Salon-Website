import { loadEnvConfig } from "@next/env";
import bcrypt from "bcryptjs";
import { PrismaClient } from "@prisma/client";

loadEnvConfig(process.cwd());

const prisma = new PrismaClient();

async function main() {
  const command = process.argv[2];
  if (command !== "create" && command !== "reset-password" && command !== "update-credentials") {
    throw new Error("Use an admin:setup, admin:reset-password, or admin:update-credentials npm script.");
  }

  const email = process.env.ADMIN_EMAIL?.trim().toLowerCase();
  const password = process.env.ADMIN_PASSWORD;
  if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    throw new Error("Set a valid ADMIN_EMAIL in your local .env file.");
  }
  if (!password || password.length < 16 || password === "ChangeThisPassword123!") {
    throw new Error("Set a unique ADMIN_PASSWORD of at least 16 characters in .env.");
  }

  if (command === "update-credentials") {
    const currentEmail = process.env.ADMIN_CURRENT_EMAIL?.trim().toLowerCase();
    if (!currentEmail || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(currentEmail)) {
      throw new Error("Set the existing account's ADMIN_CURRENT_EMAIL in .env.");
    }

    const current = await prisma.adminUser.findUnique({ where: { email: currentEmail } });
    if (!current) {
      throw new Error("No administrator exists with ADMIN_CURRENT_EMAIL.");
    }

    const existingTarget = await prisma.adminUser.findUnique({ where: { email } });
    if (existingTarget && existingTarget.id !== current.id) {
      throw new Error("ADMIN_EMAIL is already used by another administrator.");
    }

    await prisma.adminUser.update({
      where: { id: current.id },
      data: {
        email,
        name: "Sahil Phakathwayo",
        password: await bcrypt.hash(password, 12),
      },
    });
    console.info("Administrator email, name, and password updated.");
    return;
  }

  const existing = await prisma.adminUser.findUnique({ where: { email } });
  if (command === "create") {
    if (await prisma.adminUser.count()) {
      throw new Error("An administrator already exists. Use admin:reset-password to reset a specific account.");
    }

    await prisma.adminUser.create({
      data: {
        email,
        name: "Sahil Phakathwayo",
        password: await bcrypt.hash(password, 12),
      },
    });
    console.info("Administrator created. Sign in at /admin/login.");
    return;
  }

  if (!existing) {
    throw new Error("No administrator exists with ADMIN_EMAIL. Use admin:setup for first-time setup.");
  }

  await prisma.adminUser.update({
    where: { id: existing.id },
    data: { password: await bcrypt.hash(password, 12) },
  });
  console.info("Administrator password updated.");
}

main()
  .catch((error: unknown) => {
    console.error(error instanceof Error ? error.message : "Administrator setup failed.");
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
