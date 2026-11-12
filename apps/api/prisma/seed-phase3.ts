import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

const DEMO_PARTNERS = [
  { id: "11111111-1111-1111-1111-111111111111", name: "[DEMO] Sahel Islamic Bank", type: "NBFI", website: "https://example.com" },
  { id: "22222222-2222-2222-2222-222222222222", name: "[DEMO] Kano Cooperative Finance", type: "Cooperative", website: "https://example.com" },
];

const DEMO_FINANCING = [
  { id: "f0000001-0000-0000-0000-000000000001", partnerId: "11111111-1111-1111-1111-111111111111", name: "[DEMO] Working Capital Murabaha", structure: "Murabaha", description: "Cost-plus financing for working capital. The bank purchases the goods and resells to the business at a disclosed markup.", eligibility: "Registered SME operating for at least 6 months with consistent records.", terms: "Up to 12 months", fees: "Demonstration data — actual fees set by partner" },
  { id: "f0000001-0000-0000-0000-000000000002", partnerId: "11111111-1111-1111-1111-111111111111", name: "[DEMO] Asset Musharakah", structure: "Musharakah", description: "Joint ownership arrangement for equipment or vehicles with a diminishing partnership structure.", eligibility: "Registered SME with a demonstrable commercial case.", terms: "Up to 36 months", fees: "Demonstration data" },
  { id: "f0000001-0000-0000-0000-000000000003", partnerId: "11111111-1111-1111-1111-111111111111", name: "[DEMO] Trade Mudarabah", structure: "Mudarabah", description: "Profit-sharing arrangement where the bank provides capital and the business provides expertise.", eligibility: "SME with trading or commercial activity.", terms: "3–12 months", fees: "Demonstration data" },
  { id: "f0000001-0000-0000-0000-000000000004", partnerId: "22222222-2222-2222-2222-222222222222", name: "[DEMO] Equipment Ijarah", structure: "Ijarah", description: "Lease-to-own arrangement for machinery and productive equipment.", eligibility: "SME with identified equipment need.", terms: "12–48 months", fees: "Demonstration data" },
  { id: "f0000001-0000-0000-0000-000000000005", partnerId: "22222222-2222-2222-2222-222222222222", name: "[DEMO] Agricultural Salam", structure: "Salam", description: "Forward purchase of agricultural produce with advance payment.", eligibility: "Registered agricultural SMEs.", terms: "1 harvest cycle", fees: "Demonstration data" },
  { id: "f0000001-0000-0000-0000-000000000006", partnerId: "22222222-2222-2222-2222-222222222222", name: "[DEMO] Invoice Murabaha", structure: "Murabaha", description: "Short-term financing against verified invoices.", eligibility: "SME with verifiable receivables.", terms: "30–90 days", fees: "Demonstration data" },
];

const DEMO_INVESTMENTS = [
  { id: "i0000001-0000-0000-0000-000000000001", partnerId: "11111111-1111-1111-1111-111111111111", name: "[DEMO] Federal Sukuk (Ijarah)", category: "Sukuk", description: "Sovereign Ijarah sukuk backed by government assets. Invest in fixed-income instruments issued by authorised bodies only.", riskLevel: "Low to medium — sovereign risk", minAmount: 10000 },
  { id: "i0000001-0000-0000-0000-000000000002", partnerId: "11111111-1111-1111-1111-111111111111", name: "[DEMO] Corporate Sukuk (Wakala)", category: "Sukuk", description: "Corporate sukuk based on Wakala structure.", riskLevel: "Medium — corporate credit risk", minAmount: 50000 },
  { id: "i0000001-0000-0000-0000-000000000003", partnerId: "22222222-2222-2222-2222-222222222222", name: "[DEMO] Shariah-compliant Money Market Fund", category: "Fund", description: "Low-volatility fund investing in Shariah-compliant money market instruments.", riskLevel: "Low — capital at risk", minAmount: 5000 },
  { id: "i0000001-0000-0000-0000-000000000004", partnerId: "22222222-2222-2222-2222-222222222222", name: "[DEMO] Ethical Equity Fund", category: "Fund", description: "Diversified equity fund screened for Shariah compliance.", riskLevel: "Medium to high — market risk, capital at risk", minAmount: 25000 },
];

const LESSONS = [
  { slug: "recordkeeping-basics", category: "recordkeeping", order: 1, minutes: 4, titleEn: "Why record every transaction", titleHa: "Me yasa a rubuta kowace ciniki", summaryEn: "The single habit that separates growing businesses from stalling ones.", summaryHa: "Ɗabi'ar da ke raba kasuwanci mai ci gaba da wanda ba ya ci gaba.", contentEn: "Recording every transaction, no matter how small, gives you an accurate picture of your business. Without records, you cannot know if you are profitable, which products sell best, or where money leaks. Start by recording every sale and every expense on the same day it happens. Consistency matters more than perfection.", contentHa: "Rubuta kowace ciniki, komai ƙanƙantarta, yana ba ka cikakken hoto na kasuwancinka. Ba tare da rubuce-rubuce ba, ba za ka iya sanin ko kana samun riba ba, wace kaya ce ta fi sayarwa, ko ina kuɗi ke ɓacewa. Fara da rubuta kowace sayarwa da kowace kashewa a ranar da ta faru. Daidaituwa ya fi kamala muhimmanci." },
  { slug: "budgeting-basics", category: "budgeting", order: 2, minutes: 3, titleEn: "Simple monthly budgeting", titleHa: "Tsarin kasafin kuɗi na wata", summaryEn: "Plan next month in 10 minutes using last month's records.", summaryHa: "Tsara wata mai zuwa cikin minti 10 ta amfani da bayanan watan da ya gabata.", contentEn: "Look at last month's income and expenses. Identify which expenses were necessary and which were not. Write down a target for next month's income, then allocate expected expenses before the month begins. Review weekly. A budget is not a restriction — it is a plan you can adjust.", contentHa: "Duba kuɗin shiga da kashewa na watan da ya gabata. Gano wace kashewa ta zama dole da wace ba ta zama ba. Rubuta burin kuɗin shiga na wata mai zuwa, sannan raba kashewar da ake tsammani kafin watan ya fara. Bita mako-mako. Kasafin kuɗi ba takurawa ba ne — shiri ne da za ka iya daidaitawa." },
  { slug: "cashflow-management", category: "cashflow", order: 3, minutes: 4, titleEn: "Understanding cash flow", titleHa: "Fahimtar kwararar kuɗi", summaryEn: "Profit and cash are not the same thing.", summaryHa: "Riba da kuɗi ba abu ɗaya ba ne.", contentEn: "Cash flow is the movement of money in and out of your business. You can be profitable on paper but still short of cash if customers owe you or if you bought too much stock. Track cash in and cash out weekly. If customers owe you, follow up. If you have surplus, plan how to use it — do not let it disappear.", contentHa: "Kwararar kuɗi ita ce motsin kuɗi ciki da waje daga kasuwancinka. Kana iya samun riba a takarda amma ka rasa kuɗi idan abokan ciniki suna bin ka bashi ko ka sayi kaya da yawa. Bibiyi kuɗi shiga da fita mako-mako. Idan abokan ciniki suna bin ka bashi, bi su. Idan kana da ragi, tsara yadda za ka yi amfani da shi — kada ka bar shi ya ɓace." },
  { slug: "financial-literacy-intro", category: "literacy", order: 4, minutes: 3, titleEn: "Financial literacy basics", titleHa: "Tushen ilimin kuɗi", summaryEn: "The four numbers every business owner should know.", summaryHa: "Lambobi huɗu da kowane mai kasuwanci ya kamata ya sani.", contentEn: "Every business owner should know four numbers at any time: total income this month, total expenses this month, cash on hand, and outstanding receivables. If you can state these four numbers accurately, you can make good business decisions quickly.", contentHa: "Kowane mai kasuwanci ya kamata ya san lambobi huɗu a kowane lokaci: jimillar kuɗin shiga a wannan watan, jimillar kashewa a wannan watan, kuɗin hannu, da bashin da ake bin abokan ciniki. Idan za ka iya faɗin waɗannan lambobi huɗu daidai, za ka iya yanke shawara mai kyau cikin sauri." },
  { slug: "business-growth", category: "growth", order: 5, minutes: 4, titleEn: "Signs your business is ready to grow", titleHa: "Alamun da ke nuna kasuwancinka ya shirya girma", summaryEn: "Growth should be funded by evidence, not hope.", summaryHa: "Girman ya kamata a samar da shi ta hanyar shaida, ba bege ba.", contentEn: "Before expanding — new location, new product line, more staff — look at three things: consistent sales growth over 3+ months, cash reserves to handle 2 months of expenses, and a clear reason why expansion will increase profit. Expansion without these three signals often consumes the business rather than growing it.", contentHa: "Kafin faɗaɗawa — sabon wuri, sabon nau'in kaya, ƙarin ma'aikata — duba abubuwa uku: karuwar tallace-tallace a kan watanni 3+, ajiyar kuɗi don ɗaukar kashewar watanni 2, da dalili bayyananne da faɗaɗawa zai ƙara riba. Faɗaɗawa ba tare da waɗannan alamun uku ba takan cinye kasuwancin maimakon ya girma." },
  { slug: "islamic-finance-fundamentals", category: "islamic-finance", order: 6, minutes: 5, titleEn: "Islamic finance fundamentals", titleHa: "Tushen kuɗin Musulunci", summaryEn: "Riba, gharar, and the profit-and-risk sharing principle.", summaryHa: "Riba, gharar, da ka'idar raba riba da haɗari.", contentEn: "Islamic finance prohibits riba (interest), gharar (excessive uncertainty), and maysir (gambling). Instead, it is built on profit-and-loss sharing, real economic activity, and clear contracts. Common structures include Murabaha (cost-plus sale), Musharakah (joint venture), Mudarabah (profit-sharing), Ijarah (lease), and Salam (forward purchase). Each is a distinct contract with its own rules.", contentHa: "Kuɗin Musulunci ya hana riba, gharar (rashin tabbas mai yawa), da maysir (caca). A maimakon haka, an gina shi a kan raba riba da asara, aikin tattalin arziki na gaske, da kwangiloli bayyanannu. Manyan tsare-tsare sun haɗa da Murabaha (sayarwa da riba bayyananna), Musharakah (haɗin gwiwa), Mudarabah (raba riba), Ijarah (hayar), da Salam (sayen gaba). Kowanne kwangila ne dabam da nasa ka'idoji." },
  { slug: "understanding-financing-products", category: "financing", order: 7, minutes: 4, titleEn: "Understanding financing products", titleHa: "Fahimtar kayayyakin kuɗi", summaryEn: "How to read a financing offer without getting lost.", summaryHa: "Yadda za ka karanta tayin kuɗi ba tare da ɓata ba.", contentEn: "When reviewing any financing offer, look for: the structure (what type of contract is it?), the total cost (not just the monthly payment), the term, any fees or penalties, and what happens if you cannot pay on time. Ask the provider to explain anything you do not understand in your own language. Never sign a contract you do not fully understand.", contentHa: "Lokacin nazarin kowane tayin kuɗi, nemi: tsarin (wace irin kwangila ce?), jimillar kuɗi (ba kawai biyan kuɗin wata ba), wa'adin, duk wani kuɗi ko hukunci, da abin da zai faru idan ba za ka iya biya akan lokaci ba. Nemi mai bayarwa ya bayyana duk abin da ba ka fahimta ba a cikin harshenka. Kada ka taɓa sanya hannu kan kwangilar da ba ka fahimta sosai ba." },
  { slug: "investment-risk-awareness", category: "investment-risk", order: 8, minutes: 4, titleEn: "Investment risk awareness", titleHa: "Sanin haɗarin saka jari", summaryEn: "Higher return always means higher risk.", summaryHa: "Yawan riba koyaushe yana nufin yawan haɗari.", contentEn: "No investment is completely risk-free. Higher potential returns come with higher risk, including the possibility of losing your capital. Before investing: understand what the product is, who issues it, what risks it carries, and whether you can afford to lose the money. Only invest money you will not need for at least a year.", contentHa: "Babu saka jari da ba shi da haɗari kwata-kwata. Riba mai yawa tana zuwa da haɗari mai yawa, gami da yiwuwar rasa jarinka. Kafin saka jari: fahimci menene kayan, wanene ya fitar da shi, wace haɗari yake ɗauke da ita, da ko za ka iya jurewa rasa kuɗin. Saka jari kawai kuɗin da ba za ka buƙata na akalla shekara ɗaya ba." },
  { slug: "fraud-awareness", category: "fraud", order: 9, minutes: 3, titleEn: "Spotting financial fraud", titleHa: "Gane zamba ta kuɗi", summaryEn: "The warning signs every business owner should know.", summaryHa: "Alamun gargaɗi da kowane mai kasuwanci ya kamata ya sani.", contentEn: "Be suspicious of: guaranteed high returns, urgency to send money quickly, requests for payment outside official channels, offers that require you to recruit others, and anyone who refuses to provide written terms. Legitimate financial institutions provide written contracts, clear pricing, and time to consider.", contentHa: "Yi shakka da: tabbataccen riba mai yawa, gaggawa don aika kuɗi da sauri, buƙatun biyan kuɗi a wajen hanyoyin hukuma, tayin da ke buƙatar ka ɗauki wasu, da duk wanda ya ƙi bayar da sharuɗɗa a rubuce. Ingantattun cibiyoyin kuɗi suna bayar da kwangiloli a rubuce, farashi bayyananne, da lokaci don yin la'akari." },
];

async function main() {
  for (const partner of DEMO_PARTNERS) {
    await prisma.partnerInstitution.upsert({ where: { id: partner.id }, update: {}, create: partner });
  }

  for (const product of DEMO_FINANCING) {
    await prisma.financingProduct.upsert({
      where: { id: product.id },
      update: {},
      create: { ...product, isDemo: true },
    });
  }

  for (const product of DEMO_INVESTMENTS) {
    await prisma.investmentProduct.upsert({
      where: { id: product.id },
      update: {},
      create: { ...product, isDemo: true },
    });
  }

  for (const lesson of LESSONS) {
    const record = await prisma.lesson.upsert({
      where: { slug: lesson.slug },
      update: { category: lesson.category, order: lesson.order, durationMinutes: lesson.minutes },
      create: { slug: lesson.slug, category: lesson.category, order: lesson.order, durationMinutes: lesson.minutes },
    });
    for (const [language, title, summary, content] of [
      ["en", lesson.titleEn, lesson.summaryEn, lesson.contentEn],
      ["ha", lesson.titleHa, lesson.summaryHa, lesson.contentHa],
    ] as const) {
      await prisma.lessonTranslation.upsert({
        where: { lessonId_language: { lessonId: record.id, language } },
        update: { title, summary, content },
        create: { lessonId: record.id, language, title, summary, content },
      });
    }
  }

  console.log("Phase 3 seed complete:");
  console.log(`  ${DEMO_PARTNERS.length} partners`);
  console.log(`  ${DEMO_FINANCING.length} financing products`);
  console.log(`  ${DEMO_INVESTMENTS.length} investment products`);
  console.log(`  ${LESSONS.length} lessons (EN + HA)`);
}

main()
  .catch((e) => { console.error(e); process.exit(1); })
  .finally(async () => { await prisma.$disconnect(); });