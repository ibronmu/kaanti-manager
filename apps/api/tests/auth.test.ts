import request from "supertest";
import { createApp } from "../src/app";
import { prisma } from "../src/utils/prisma";

const app = createApp();

beforeAll(async () => { await prisma.user.deleteMany({ where: { email: { contains: "@test.kaanti" } } }); });
afterAll(async () => { await prisma.user.deleteMany({ where: { email: { contains: "@test.kaanti" } } }); await prisma.$disconnect(); });

describe("Auth", () => {
  const email = `owner@test.kaanti`;
  it("registers a user", async () => {
    const res = await request(app).post("/api/v1/auth/register").send({
      email, password: "Password123!", fullName: "Test Owner",
    });
    expect(res.status).toBe(201);
    expect(res.body.success).toBe(true);
  });

  it("rejects duplicate registration", async () => {
    const res = await request(app).post("/api/v1/auth/register").send({
      email, password: "Password123!", fullName: "Test Owner",
    });
    expect(res.status).toBe(409);
  });

  it("logs in", async () => {
    const res = await request(app).post("/api/v1/auth/login").send({ email, password: "Password123!" });
    expect(res.status).toBe(200);
    expect(res.body.data.accessToken).toBeDefined();
  });
});