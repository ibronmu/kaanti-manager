export type UserRole = "OWNER" | "ADMIN" | "MEMBER" | "VIEWER";
export const BUSINESS_CATEGORIES = [
  "Retail","Wholesale","Food & Beverage","Fashion & Textiles","Agriculture",
  "Services","Manufacturing","Transportation","Construction","Other"
] as const;
export const NIGERIAN_STATES = [
  "Abia","Adamawa","Akwa Ibom","Anambra","Bauchi","Bayelsa","Benue","Borno",
  "Cross River","Delta","Ebonyi","Edo","Ekiti","Enugu","FCT","Gombe","Imo",
  "Jigawa","Kaduna","Kano","Katsina","Kebbi","Kogi","Kwara","Lagos","Nasarawa",
  "Niger","Ogun","Ondo","Osun","Oyo","Plateau","Rivers","Sokoto","Taraba",
  "Yobe","Zamfara"
] as const;
