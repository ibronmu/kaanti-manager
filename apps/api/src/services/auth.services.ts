import bcrypt from "bcrypt";
import crypto from "crypto";
import { prisma } from "../utils/prisma";
import { AppError } from "../utils/errors";
import { signAccess, signRefresh, sha256, verifyRefresh } from "../utils/tokens";

export const registerUser = async (input: {
  email: string; password: string; fullName: string; phone?: string;
}) => {
  const existing = await prisma.user.findUnique({ where: { email: input.email } });
  if (existing) throw new AppError("Email already registered", 409);

  const passwordHash = await bcrypt.hash(input.password, 12);
  const user = await prisma.user.create({
    data: {
      email: input.email,
      passwordHash,
      fullName: input.fullName,
      phone: input.phone,
      emailVerifyTok: crypto.randomBytes(24).toString("hex"),
    },
    select: { id: true, email: true, fullName: true, emailVerified: true },
  });
  return user;
};

export const loginUser = async (email: string, password: string) => {
  const user = await prisma.user.findUnique({ where: { email } });
  if (!user) throw new AppError("Invalid credentials", 401);

  const ok = await bcrypt.compare(password, user.passwordHash);
  if (!ok) throw new AppError("Invalid credentials", 401);

  const jti = crypto.randomUUID();
  const accessToken = signAccess({ sub: user.id, email: user.email });
  const refreshToken = signRefresh({ sub: user.id, jti });

  await prisma.refreshToken.create({
    data: {
      userId: user.id,
      tokenHash: sha256(refreshToken),
      expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
    },
  });

  return {
    user: { id: user.id, email: user.email, fullName: user.fullName },
    accessToken,
    refreshToken,
  };
};

export const refreshSession = async (refreshToken: string) => {
  const payload = verifyRefresh(refreshToken);
  const hash = sha256(refreshToken);
  const stored = await prisma.refreshToken.findUnique({ where: { tokenHash: hash } });

  if (!stored || stored.revokedAt || stored.expiresAt < new Date())
    throw new AppError("Refresh token invalid", 401);

  // Rotate: revoke old, issue new
  await prisma.refreshToken.update({
    where: { id: stored.id },
    data: { revokedAt: new Date() },
  });

  const user = await prisma.user.findUnique({ where: { id: payload.sub } });
  if (!user) throw new AppError("User not found", 401);

  const newJti = crypto.randomUUID();
  const accessToken = signAccess({ sub: user.id, email: user.email });
  const newRefresh = signRefresh({ sub: user.id, jti: newJti });

  await prisma.refreshToken.create({
    data: {
      userId: user.id,
      tokenHash: sha256(newRefresh),
      expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
    },
  });

  return { accessToken, refreshToken: newRefresh };
};

export const logoutUser = async (refreshToken?: string) => {
  if (!refreshToken) return;
  const hash = sha256(refreshToken);
  await prisma.refreshToken.updateMany({
    where: { tokenHash: hash, revokedAt: null },
    data: { revokedAt: new Date() },
  });
};