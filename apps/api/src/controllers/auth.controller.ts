import { Request, Response } from "express";
import * as authService from "../services/auth.service";
import { env } from "../config/env";

const setAuthCookies = (res: Response, access: string, refresh: string) => {
  const isProd = env.nodeEnv === "production";
  const base = { httpOnly: true, secure: isProd, sameSite: isProd ? "none" as const : "lax" as const, path: "/", domain: env.cookieDomain };
  res.cookie("access_token", access, { ...base, maxAge: 15 * 60 * 1000 });
  res.cookie("refresh_token", refresh, { ...base, maxAge: 30 * 24 * 60 * 60 * 1000 });
};

export const register = async (req: Request, res: Response) => {
  const user = await authService.registerUser(req.body);
  res.status(201).json({
    success: true,
    message: "Account created. Please verify your email.",
    data: user,
  });
};

export const login = async (req: Request, res: Response) => {
  const { email, password } = req.body;
  const result = await authService.loginUser(email, password);
  setAuthCookies(res, result.accessToken, result.refreshToken);
  res.json({
    success: true,
    message: "Logged in",
    data: { user: result.user, accessToken: result.accessToken },
  });
};

export const refresh = async (req: Request, res: Response) => {
  const token = req.cookies?.refresh_token ?? req.body?.refreshToken;
  const { accessToken, refreshToken } = await authService.refreshSession(token);
  setAuthCookies(res, accessToken, refreshToken);
  res.json({ success: true, message: "Session refreshed", data: { accessToken } });
};

export const logout = async (req: Request, res: Response) => {
  await authService.logoutUser(req.cookies?.refresh_token);
  res.clearCookie("access_token");
  res.clearCookie("refresh_token");
  res.json({ success: true, message: "Logged out" });
};