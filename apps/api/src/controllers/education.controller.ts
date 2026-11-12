import { Response } from "express";
import * as educationService from "../services/education.service";
import { AuthedRequest } from "../middleware/auth";

const getLang = (req: AuthedRequest): string =>
  (typeof req.query.lang === "string" && req.query.lang) ||
  (typeof req.headers["accept-language"] === "string" && req.headers["accept-language"].startsWith("ha") ? "ha" : "en");

export const list = async (req: AuthedRequest, res: Response) => {
  const lang = getLang(req);
  const category = typeof req.query.category === "string" ? req.query.category : undefined;
  const lessons = await educationService.listLessons(lang, category);
  res.json({ success: true, message: "Lessons retrieved", data: lessons });
};

export const getOne = async (req: AuthedRequest, res: Response) => {
  const lang = getLang(req);
  const lesson = await educationService.getLessonBySlug(req.params.slug, lang);
  res.json({ success: true, message: "Lesson retrieved", data: lesson });
};

export const categories = async (_req: AuthedRequest, res: Response) => {
  const list = await educationService.listCategories();
  res.json({ success: true, message: "Categories retrieved", data: list });
};