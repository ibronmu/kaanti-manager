import { prisma } from "../utils/prisma";
import { AppError } from "../utils/errors";

const pickTranslation = <T extends { language: string }>(translations: T[], lang: string) =>
  translations.find((t) => t.language === lang) ?? translations.find((t) => t.language === "en") ?? translations[0];

export const listLessons = async (lang: string, category?: string) => {
  const lessons = await prisma.lesson.findMany({
    where: category ? { category } : undefined,
    include: { translations: true },
    orderBy: [{ order: "asc" }],
  });
  return lessons.map((l) => {
    const t = pickTranslation(l.translations, lang);
    return {
      id: l.id,
      slug: l.slug,
      category: l.category,
      order: l.order,
      durationMinutes: l.durationMinutes,
      title: t?.title ?? "",
      summary: t?.summary ?? "",
      language: t?.language ?? "en",
    };
  });
};

export const getLessonBySlug = async (slug: string, lang: string) => {
  const lesson = await prisma.lesson.findUnique({
    where: { slug },
    include: { translations: true },
  });
  if (!lesson) throw new AppError("Lesson not found", 404);
  const t = pickTranslation(lesson.translations, lang);
  return {
    id: lesson.id,
    slug: lesson.slug,
    category: lesson.category,
    order: lesson.order,
    durationMinutes: lesson.durationMinutes,
    title: t?.title ?? "",
    summary: t?.summary ?? "",
    content: t?.content ?? "",
    language: t?.language ?? "en",
  };
};

export const listCategories = async () => {
  const rows = await prisma.lesson.findMany({
    select: { category: true },
    distinct: ["category"],
    orderBy: { category: "asc" },
  });
  return rows.map((r) => r.category);
};