import { createApp } from "./app";
import { env } from "./config/env";
import { prisma } from "./utils/prisma";

const app = createApp();

const server = app.listen(env.port, () => {
  console.log(`API listening on http://localhost:${env.port}`);
  console.log(`Swagger docs: http://localhost:${env.port}/api/docs`);
});

const shutdown = async () => {
  await prisma.$disconnect();
  server.close(() => process.exit(0));
};

process.on("SIGINT", shutdown);
process.on("SIGTERM", shutdown);