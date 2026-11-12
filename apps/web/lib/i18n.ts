"use client";

export type Lang = "en" | "ha";

const KEY = "kaanti_lang";

const DICT: Record<Lang, Record<string, string>> = {
  en: {
    nav_dashboard: "Dashboard",
    nav_transactions: "Transactions",
    nav_inventory: "Inventory",
    nav_customers: "Customers",
    nav_reports: "Reports",
    nav_financing: "Financing",
    nav_investments: "Investments",
    nav_learn: "Kaanti Learn",
    nav_readiness: "Readiness",
    nav_logout: "Log out",
    lang_switch: "Hausa",
    loading: "Loading…",
    error: "Something went wrong",
    retry: "Retry",
    empty: "Nothing here yet",
    demo_banner: "DEMO DATA",
    financing_title: "Financing opportunities",
    financing_subtitle: "Discover Shariah-compliant products from authorised financial institutions.",
    financing_disclaimer: "Kaanti Manager does not approve financing. Assessment, approval and contracting are handled by the authorised financial institution.",
    financing_all: "All",
    financing_structure: "Structure",
    financing_eligibility: "Eligibility",
    financing_terms: "Terms",
    financing_fees: "Fees & charges",
    financing_provider: "Provider",
    financing_express: "Express interest",
    financing_expressed: "Interest recorded. Contact the provider directly to proceed.",
    investments_title: "Investment opportunities",
    investments_subtitle: "Verified ethical and Shariah-compliant investment products from authorised providers.",
    investments_disclaimer: "Kaanti Manager does not hold or manage investments. No returns are guaranteed. Capital is at risk. Only invest through authorised providers.",
    investments_risk: "Risk information",
    investments_min: "Minimum investment",
    investments_category: "Category",
    learn_title: "Kaanti Learn",
    learn_subtitle: "Practical financial education for Nigerian business owners.",
    learn_all: "All",
    learn_minutes: "min read",
    learn_back: "Back to lessons",
    readiness_title: "Financial readiness summary",
    readiness_subtitle: "A descriptive summary of the quality and completeness of your business records.",
    readiness_disclaimer: "This summary describes the quality and completeness of your business records. It is not a credit score and does not indicate financing approval. Financing assessments are made independently by authorised financial institutions.",
    readiness_indicator_good: "Strong",
    readiness_indicator_partial: "Partial",
    readiness_indicator_low: "Needs attention",
  },
  ha: {
    nav_dashboard: "Babban Shafi",
    nav_transactions: "Ma'amaloli",
    nav_inventory: "Kaya",
    nav_customers: "Abokan Ciniki",
    nav_reports: "Rahotanni",
    nav_financing: "Kuɗi",
    nav_investments: "Saka Jari",
    nav_learn: "Koyan Kaanti",
    nav_readiness: "Shirye-shirye",
    nav_logout: "Fita",
    lang_switch: "Turanci",
    loading: "Ana lodawa…",
    error: "Wani abu ya ɓarna",
    retry: "Sake gwadawa",
    empty: "Babu komai tukuna",
    demo_banner: "BAYANIN GWAGWARWA",
    financing_title: "Damar samun kuɗi",
    financing_subtitle: "Gano kayayyakin da suka dace da Shari'a daga cibiyoyin kuɗi da aka yarda da su.",
    financing_disclaimer: "Kaanti Manager ba ya amincewa da kuɗi. Kimantawa, amincewa da kwangila cibiyar kuɗi ce da aka yarda da ita ke yi.",
    financing_all: "Duka",
    financing_structure: "Tsari",
    financing_eligibility: "Cancantar",
    financing_terms: "Wa'adi",
    financing_fees: "Kuɗi da cajin",
    financing_provider: "Mai bayarwa",
    financing_express: "Nuna sha'awa",
    financing_expressed: "An rubuta sha'awarka. Tuntuɓi mai bayarwa kai tsaye don ci gaba.",
    investments_title: "Damar saka jari",
    investments_subtitle: "Kayayyakin saka jari na ɗabi'a da suka dace da Shari'a daga masu bayarwa da aka yarda da su.",
    investments_disclaimer: "Kaanti Manager ba ya riƙe ko sarrafa saka jari. Babu tabbacin riba. Jarinka na cikin haɗari. Saka jari kawai ta hanyar masu bayarwa da aka yarda da su.",
    investments_risk: "Bayanin haɗari",
    investments_min: "Mafi ƙarancin jari",
    investments_category: "Rukuni",
    learn_title: "Koyan Kaanti",
    learn_subtitle: "Ilimin kuɗi mai amfani ga masu kasuwanci na Najeriya.",
    learn_all: "Duka",
    learn_minutes: "minti karatu",
    learn_back: "Koma ga darussa",
    readiness_title: "Takaitaccen shirye-shiryen kuɗi",
    readiness_subtitle: "Bayanin inganci da cikar bayanan kasuwancinka.",
    readiness_disclaimer: "Wannan takaitaccen bayani ne kan inganci da cikar bayanan kasuwancinka. Ba makin bashi ba ne kuma ba ya nuna amincewar kuɗi. Cibiyoyin kuɗi da aka yarda da su ne ke yin kimantawar kuɗi da kansu.",
    readiness_indicator_good: "Karfi",
    readiness_indicator_partial: "Sashe",
    readiness_indicator_low: "Bukatar kulawa",
  },
};

export function getLang(): Lang {
  if (typeof window === "undefined") return "en";
  const v = localStorage.getItem(KEY);
  return v === "ha" ? "ha" : "en";
}

export function setLang(lang: Lang) {
  if (typeof window === "undefined") return;
  localStorage.setItem(KEY, lang);
  window.location.reload();
}

export function t(key: string, lang: Lang = getLang()): string {
  return DICT[lang][key] ?? DICT.en[key] ?? key;
}