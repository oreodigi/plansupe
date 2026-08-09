export const BUSINESS_CATEGORIES = [
  "Restaurant / QSR",
  "Retail Store",
  "Salon / Spa",
  "Clinic",
  "Gym / Fitness",
  "Office / Agency",
  "IT / SaaS",
  "E-commerce",
  "Coaching / Education",
  "Professional Services",
] as const;

const common = [
  ["Compliance", "Register business entity", 15000],
  ["Branding", "Finalize brand identity", 30000],
  ["Operations", "Document launch-day checklist", 0],
  ["Marketing", "Prepare launch campaign", 50000],
] as const;

const categoryItems: Record<string, ReadonlyArray<readonly [string, string, number]>> = {
  "Restaurant / QSR": [
    ["Compliance", "FSSAI registration", 12000], ["Location", "Kitchen and counter layout", 65000],
    ["Equipment", "Commercial kitchen equipment", 420000], ["Furniture", "Customer seating and tables", 210000],
    ["Team", "Hire kitchen lead", 45000], ["Products", "Create opening menu and costing", 0],
  ],
  "Retail Store": [
    ["Compliance", "Shop and establishment registration", 10000], ["Location", "Store layout and trial room plan", 75000],
    ["Equipment", "POS and billing system", 48000], ["Furniture", "Display racks and checkout counter", 180000],
    ["Team", "Hire store associates", 60000], ["Products", "Prepare opening inventory catalogue", 0],
  ],
  "Salon / Spa": [
    ["Compliance", "Local trade license", 12000], ["Location", "Treatment zones and reception layout", 85000],
    ["Equipment", "Salon chairs and treatment equipment", 260000], ["Team", "Hire stylists and therapists", 90000],
    ["Products", "Define service menu and pricing", 0],
  ],
  "IT / SaaS": [
    ["Compliance", "Company and tax registrations", 25000], ["Equipment", "Team laptops and software", 300000],
    ["Team", "Define initial product team", 0], ["Products", "Define plans and unit economics", 0],
    ["Operations", "Prepare support and incident workflows", 0],
  ],
};

export function templateFor(category: string) {
  return [...(categoryItems[category] ?? [
    ["Location", "Confirm operating location", 0], ["Team", "Define initial team", 0],
    ["Products", "Define products and services", 0],
  ]), ...common];
}
