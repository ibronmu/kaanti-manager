import jwt from "jsonwebtoken";
import crypto from "crypto";
import { env } from "../config/env";

export interface AccessPayload { sub: string; email: string; }
export interface RefreshPayload { sub: string; jti: string; }

export const signAccess = (payload: AccessPayload) =>
  jwt.sign(payload, env.jwt.accessSecret, { expiresIn: env.jwt.accessExpires } as jwt.SignOptions);

export const signRefresh = (payload: RefreshPayload) =>
  jwt.sign(payload, env.jwt.refreshSecret, { expiresIn: env.jwt.refreshExpires } as jwt.SignOptions);

export const verifyAccess = (token: string) =>
  jwt.verify(token, env.jwt.accessSecret) as AccessPayload;

export const verifyRefresh = (token: string) =>
  jwt.verify(token, env.jwt.refreshSecret) as RefreshPayload;

export const sha256 = (input: string) =>
  crypto.createHash("sha256").update(input).digest("hex");