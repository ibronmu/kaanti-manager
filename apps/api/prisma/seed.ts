import { PrismaClient } from "@prisma/client";
import bcrypt from "bcrypt";

const prisma = new PrismaClient();

async function main() {
  const passwordHash = await bcrypt.hash("Password123!", 10);

  const user = await prisma.user.upsert({
    where: { email: "demo@kaanti.app" },
    update: {},
    create: {
      email: "demo@kaanti.app",
      passwordHash,
      fullName: "Demo Owner",
      phone: "+2348000000000",
      emailVerified: true,
    },
  });

  const business = await prisma.business.upsert({
    where: { id: "00000000-0000-0000-0000-000000000001" },
    update: {},
    create: {
      id: "00000000-0000-0000-0000-000000000001",
      name: "Kaanti Demo Store",
      category: "Retail",
      type: "Sole Proprietorship",
      location: "Kano",
      phone: "+2348000000000",
      preferredLanguage: "en",
      currency: "NGN",
    },
  });

  await prisma.businessMember.upsert({
    where: { businessId_userId: { businessId: business.id, userId: user.id } },
    update: {},
    create: { businessId: business.id, userId: user.id, role: "OWNER" },
  });

  const partner = await prisma.partnerInstitution.upsert({
    where: { id: "00000000-0000-0000-0000-0000000000aa" },
    update: {},
    create: {
      id: "00000000-0000-0000-0000-0000000000aa",
      name: "[DEMO] Sahel Islamic Bank",
      type: "NBFI",
      website: "https://example.com",
    },
  });

  await prisma.financingProduct.upsert({
    where: { id: "00000000-0000-0000-0000-0000000000bb" },
    update: {},
    create: {
      id: "00000000-0000-0000-0000-0000000000bb",
      partnerId: partner.id,
      name: "[DEMO] Working Capital Murabaha",
      structure: "Murabaha",
      description: "Demonstration product for working capital financing.",
      eligibility: "Registered SME operating for 6+ months.",
      terms: "Up to 12 months",
      fees: "Demo only",
      isDemo: true,
    },
  });

  console.log("Seed complete. Demo user: demo@kaanti.app / Password123!");
}

main()
  .catch((e) => { console.error(e); process.exit(1); })
  .finally(async () => { await prisma.$disconnect(); });