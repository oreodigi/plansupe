import type { ModuleKey } from "@/lib/setup-catalog";

const baseSuggestions: Record<ModuleKey, string[]> = {
  Licenses: [
    "Local business registration",
    "Fire safety approval",
    "Insurance cover",
    "Trademark registration",
  ],
  Location: [
    "Security deposit",
    "Brokerage fee",
    "Electricity connection",
    "Internet connection",
    "Premises inspection",
  ],
  Interiors: [
    "Flooring",
    "Painting",
    "Lighting",
    "Electrical work",
    "Plumbing work",
    "Furniture",
    "Storage cabinets",
    "Air conditioning",
  ],
  Equipment: [
    "Computers",
    "Printers",
    "Business phones",
    "Wi-Fi router",
    "POS system",
    "CCTV system",
    "Power backup / UPS",
    "Office furniture",
  ],
  Staff: [
    "Manager",
    "Sales staff",
    "Accountant",
    "Cleaning staff",
    "Staff uniforms",
    "Recruitment fees",
  ],
  Branding: [
    "Logo design",
    "Brand guidelines",
    "Shop signage",
    "Packaging design",
    "Business cards",
    "Product photography",
    "Staff uniforms",
  ],
  Operations: [
    "Billing software",
    "Accounting software",
    "Inventory system",
    "Supplier onboarding",
    "Courier or delivery setup",
    "Cleaning supplies",
    "Maintenance contract",
  ],
  Marketing: [
    "Website",
    "Google Business Profile",
    "Social media setup",
    "Launch advertising",
    "Flyers and brochures",
    "Influencer campaign",
    "SEO setup",
    "Opening event",
  ],
};

const categorySuggestions: Record<
  string,
  Partial<Record<ModuleKey, string[]>>
> = {
  "Restaurant / QSR": {
    Equipment: [
      "Commercial refrigerator",
      "Cooking range",
      "Exhaust hood",
      "Preparation tables",
      "Commercial mixer",
      "Dishwasher",
      "Deep freezer",
      "Kitchen POS system",
    ],
    Interiors: [
      "Kitchen fit-out",
      "Dining furniture",
      "Service counter",
      "Kitchen ventilation",
      "Grease trap and plumbing",
      "Customer washroom fit-out",
    ],
    Branding: [
      "Menu design",
      "Outdoor signage",
      "Food packaging",
      "Staff uniforms",
    ],
    Marketing: [
      "Food photography",
      "Delivery app listing",
      "Launch offers",
      "Local food ads",
    ],
  },
  "Retail Store": {
    Equipment: [
      "POS terminals",
      "Barcode scanners",
      "Receipt printer",
      "Display racks",
      "CCTV system",
    ],
    Interiors: [
      "Display shelving",
      "Checkout counter",
      "Trial rooms",
      "Store lighting",
      "Window display",
    ],
  },
  "Salon / Spa": {
    Equipment: [
      "Salon chairs",
      "Wash stations",
      "Hair dryers",
      "Sterilizer",
      "Treatment beds",
    ],
    Interiors: [
      "Reception counter",
      "Mirrors and stations",
      "Treatment rooms",
      "Ambient lighting",
    ],
  },
  Clinic: {
    Equipment: [
      "Examination table",
      "Diagnostic equipment",
      "Medical refrigerator",
      "Computers",
      "Printer",
    ],
    Interiors: [
      "Reception and waiting area",
      "Consultation rooms",
      "Clinical storage",
      "Hand-wash stations",
    ],
  },
  "Gym / Fitness": {
    Equipment: [
      "Cardio machines",
      "Strength machines",
      "Free weights",
      "Floor mats",
      "Sound system",
    ],
    Interiors: [
      "Rubber flooring",
      "Mirrors",
      "Changing rooms",
      "Locker installation",
      "Ventilation",
    ],
  },
  "Office / Agency": {
    Equipment: [
      "Laptop computers",
      "Printers",
      "Business phones",
      "Conference display",
      "Wi-Fi system",
    ],
  },
  "IT / SaaS": {
    Equipment: [
      "Developer laptops",
      "External monitors",
      "Test phones",
      "Networking equipment",
      "Power backup / UPS",
    ],
  },
  "Coaching / Education": {
    Equipment: [
      "Teacher computers",
      "Projector",
      "Printer",
      "Student desks",
      "Audio system",
    ],
    Interiors: [
      "Classroom fit-out",
      "Whiteboards",
      "Reception area",
      "Library shelving",
    ],
  },
};

export function moduleItemSuggestions(category: string, module: ModuleKey) {
  return Array.from(
    new Set([
      ...(categorySuggestions[category]?.[module] ?? []),
      ...baseSuggestions[module],
    ]),
  ).slice(0, 10);
}

export const moduleItemLabels: Record<ModuleKey, string> = {
  Licenses: "licence or registration",
  Location: "location cost",
  Interiors: "interior item or service",
  Equipment: "equipment item",
  Staff: "role or people cost",
  Branding: "branding item or service",
  Operations: "operational item or service",
  Marketing: "marketing activity or service",
};
