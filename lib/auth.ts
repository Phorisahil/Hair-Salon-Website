import { cookies } from "next/headers";
import { SignJWT, jwtVerify } from "jose";
import prisma from "@/lib/db";

function getSecret() {
  const value = process.env.AUTH_SECRET;
  if (!value || value.length < 32 || value === "replace-with-a-secure-random-string") {
    throw new Error("Set a unique AUTH_SECRET with at least 32 characters.");
  }
  return new TextEncoder().encode(value);
}

export async function createSessionToken(userId: string) {
  return new SignJWT({ sub: userId })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime("7d")
    .sign(getSecret());
}

export async function verifySessionToken(token: string) {
  const { payload } = await jwtVerify(token, getSecret());
  if (typeof payload.sub !== "string") {
    throw new Error("Invalid administrator session.");
  }
  return payload.sub;
}

export async function getCurrentAdminId() {
  const cookieStore = await cookies();
  const token = cookieStore.get("salon_session")?.value;

  if (!token) return null;
  getSecret();

  try {
    const userId = await verifySessionToken(token);
    const user = await prisma.adminUser.findUnique({
      where: { id: userId },
      select: { id: true },
    });
    return user?.id ?? null;
  } catch {
    return null;
  }
}

export async function requireAdmin() {
  const userId = await getCurrentAdminId();
  if (!userId) {
    throw new Error("Unauthorized");
  }
  return userId;
}
