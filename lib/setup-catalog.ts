export const MODULES = [
  {
    key: "Licenses",
    label: "Licenses",
    short: "Registrations, permits and protection",
  },
  {
    key: "Location",
    label: "Location",
    short: "Site selection, utilities and access",
  },
  {
    key: "Interiors",
    label: "Interiors",
    short: "Layout, fit-out and customer experience",
  },
  {
    key: "Equipment",
    label: "Equipment",
    short: "Tools, technology and maintenance",
  },
  {
    key: "Staff",
    label: "Staff",
    short: "Roles, hiring and people operations",
  },
  {
    key: "Branding",
    label: "Branding",
    short: "Identity, signage and customer touchpoints",
  },
  {
    key: "Operations",
    label: "Operations",
    short: "Suppliers, systems and daily workflows",
  },
  {
    key: "Marketing",
    label: "Marketing",
    short: "Audience, channels and launch campaign",
  },
  {
    key: "Assets",
    label: "Assets",
    short: "Everything your business owns and uses",
  },
] as const;

export type ModuleKey = (typeof MODULES)[number]["key"];

export type RequirementOption = {
  id: string;
  module: ModuleKey;
  title: string;
  description: string;
  estimatedCost: number;
  leadWeeks: number;
  tag: "Essential" | "Recommended" | "Optional";
  authority?: string;
  appliesWhen?: string;
  sourceUrl?: string;
};

type ItemInput = Omit<RequirementOption, "id" | "module">;
type ComplianceDetails = Pick<
  ItemInput,
  "authority" | "appliesWhen" | "sourceUrl"
>;
const item = (
  title: string,
  description: string,
  estimatedCost: number,
  leadWeeks: number,
  tag: ItemInput["tag"] = "Recommended",
  details: ComplianceDetails = {},
): ItemInput => ({
  title,
  description,
  estimatedCost,
  leadWeeks,
  tag,
  ...details,
});
const licence = (
  title: string,
  description: string,
  leadWeeks: number,
  tag: ItemInput["tag"],
  authority: string,
  appliesWhen: string,
  sourceUrl?: string,
): ItemInput =>
  item(title, description, 0, leadWeeks, tag, {
    authority,
    appliesWhen,
    sourceUrl,
  });
const slug = (value: string) =>
  value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");

const core: Record<ModuleKey, ItemInput[]> = {
  Licenses: [
    licence(
      "Choose and register the legal entity",
      "Choose proprietorship, partnership, LLP or company and complete the matching registration before contracting in the business name.",
      6,
      "Essential",
      "MCA / relevant registrar",
      "Every business; the exact filing depends on the legal structure.",
      "https://www.mca.gov.in/content/mca/global/en/home.html",
    ),
    licence(
      "Register under the state Shops and Establishments law",
      "Register or intimate the workplace under the law and portal used by the state where the establishment operates.",
      4,
      "Essential",
      "State Labour Department",
      "Usually applies to shops, offices and commercial establishments; thresholds and deadlines vary by state.",
      "https://www.indiacode.nic.in/",
    ),
    licence(
      "Complete tax registrations",
      "Check GST liability using current turnover, supply type, state and compulsory-registration rules before applying.",
      4,
      "Recommended",
      "GST / CBIC",
      "Required when the applicable GST threshold or a compulsory-registration case is met.",
      "https://cbic-gst.gov.in/faq.html",
    ),
    licence(
      "Register as an MSME on Udyam",
      "Use the free government portal to obtain MSME recognition and access eligible benefits.",
      2,
      "Optional",
      "Ministry of MSME",
      "Optional, but useful for eligible micro, small and medium enterprises.",
      "https://udyamregistration.gov.in/",
    ),
  ],
  Location: [
    item(
      "Define the location scorecard",
      "Set must-haves for area, access, visibility, capacity and monthly occupancy cost.",
      0,
      1,
      "Essential",
    ),
    item(
      "Shortlist and compare locations",
      "Visit options and record rent, deposit, restrictions and expansion potential.",
      0,
      5,
      "Essential",
    ),
    item(
      "Verify utilities and accessibility",
      "Confirm power, water, internet, parking, delivery access and accessibility.",
      5000,
      2,
      "Recommended",
    ),
  ],
  Interiors: [
    item(
      "Create a functional space plan",
      "Map customer, staff, storage and service flows before committing to the fit-out.",
      25000,
      4,
      "Essential",
    ),
    item(
      "Collect fit-out quotations",
      "Compare scope, materials, timeline, warranty and exclusions from contractors.",
      0,
      3,
      "Recommended",
    ),
    item(
      "Complete safety and accessibility checks",
      "Review exits, lighting, ventilation, signage and inclusive access.",
      15000,
      3,
      "Essential",
    ),
  ],
  Equipment: [
    item(
      "Create the essential equipment list",
      "Separate launch-critical equipment from items that can wait until revenue grows.",
      0,
      2,
      "Essential",
    ),
    item(
      "Compare purchase, lease and rental",
      "Model upfront cost, warranty, maintenance and replacement risk.",
      0,
      3,
      "Recommended",
    ),
    item(
      "Plan installation and maintenance",
      "Assign power, network, installation, testing and service responsibilities.",
      10000,
      3,
      "Recommended",
    ),
  ],
  Staff: [
    item(
      "Define launch roles and responsibilities",
      "List the minimum roles, shift coverage and decision ownership for launch.",
      0,
      2,
      "Essential",
    ),
    item(
      "Create the hiring and onboarding plan",
      "Set role profiles, interviews, offer dates, training and first-week checklists.",
      10000,
      6,
      "Essential",
    ),
    item(
      "Set up payroll and staff records",
      "Prepare contracts, attendance, payroll, leave and statutory records.",
      8000,
      4,
      "Recommended",
    ),
  ],
  Branding: [
    item(
      "Finalize brand identity",
      "Confirm name, logo, colors, typography and a practical usage guide.",
      30000,
      5,
      "Essential",
    ),
    item(
      "Produce customer-facing brand assets",
      "Prepare the physical and digital assets customers will see at launch.",
      20000,
      4,
      "Recommended",
    ),
    item(
      "Secure brand domains and handles",
      "Reserve the primary domain and consistent social media usernames.",
      5000,
      1,
      "Essential",
    ),
  ],
  Operations: [
    item(
      "Document daily operating procedures",
      "Write simple opening, closing, quality, escalation and exception workflows.",
      0,
      4,
      "Essential",
    ),
    item(
      "Select suppliers and backup vendors",
      "Compare price, quality, lead time, credit terms and backup availability.",
      0,
      5,
      "Essential",
    ),
    item(
      "Run a launch-readiness rehearsal",
      "Test a full operating day and record failures before opening to customers.",
      5000,
      1,
      "Recommended",
    ),
  ],
  Marketing: [
    item(
      "Define the launch audience and offer",
      "Clarify the first customer segment, core promise, proof and opening offer.",
      0,
      2,
      "Essential",
    ),
    item(
      "Build the launch content calendar",
      "Plan messages, owners, formats and publishing dates around the target launch.",
      15000,
      4,
      "Recommended",
    ),
    item(
      "Set up measurement and lead capture",
      "Track enquiries, source, conversion and campaign spend from day one.",
      10000,
      2,
      "Essential",
    ),
  ],
  Assets: [],
};

const categoryExtras: Record<
  string,
  Partial<Record<ModuleKey, ItemInput[]>>
> = {
  "Restaurant / QSR": {
    Licenses: [
      licence(
        "Obtain FSSAI registration or licence",
        "Apply through FoSCoS for the correct Basic, State or Central food registration/licence based on turnover, capacity and operation type.",
        8,
        "Essential",
        "FSSAI",
        "Every restaurant, café, QSR, cloud kitchen and other food business.",
        "https://foscos.fssai.gov.in/",
      ),
      licence(
        "Obtain the municipal Health Trade Licence",
        "For Delhi, apply for the MCD Health Trade Licence for an eating establishment; elsewhere use the equivalent municipal food/health trade approval.",
        8,
        "Essential",
        "Municipal public-health authority",
        "Applies where the local body licenses eating establishments; category and fee depend on format, area or seating.",
        "https://mcdonline.nic.in/portal/htl/officeOrderAndCircular",
      ),
      licence(
        "Obtain Fire Safety NOC (when applicable)",
        "Have the building, exits, kitchen fire controls and occupancy reviewed under the local fire-safety rules.",
        10,
        "Recommended",
        "State / city Fire Service",
        "Required when the premises, building use, height, seating or occupancy triggers local fire rules.",
      ),
      licence(
        "Obtain pollution-control consent",
        "Confirm consent and waste, wastewater, grease-trap, emissions or generator requirements before kitchen operations begin.",
        10,
        "Recommended",
        "State Pollution Control Board / Committee",
        "Applies when the restaurant's equipment, fuel, seating, discharge or local classification requires consent.",
      ),
      licence(
        "Obtain liquor licence",
        "Apply for the correct on-premise alcohol licence and plan renewals, dry-day controls and purchase records.",
        16,
        "Optional",
        "State Excise Department",
        "Only when alcohol will be stored or served.",
      ),
      licence(
        "Clear public music performance rights",
        "Obtain the relevant music licences for copyrighted musical works and sound recordings used in public.",
        4,
        "Optional",
        "Copyright owners / registered copyright societies",
        "When recorded music, a DJ, karaoke or live copyrighted music is played for customers.",
        "https://copyright.gov.in/Documents/handbook.html",
      ),
      licence(
        "Obtain outdoor signage permission",
        "Check size, placement, lighting and advertising rules before installing fascia, boards or illuminated signs.",
        5,
        "Recommended",
        "Municipal corporation / local body",
        "When exterior signage requires local advertisement or building permission.",
      ),
    ],
    Location: [
      item(
        "Validate footfall and delivery radius",
        "Compare dine-in demand, office or residential catchment and delivery coverage.",
        0,
        2,
        "Essential",
      ),
    ],
    Interiors: [
      item(
        "Design kitchen-to-counter workflow",
        "Reduce crossing paths between receiving, storage, preparation, cooking and dispatch.",
        65000,
        5,
        "Essential",
      ),
    ],
    Equipment: [
      item(
        "Procure commercial kitchen equipment",
        "Size cooking, refrigeration, preparation and exhaust equipment for peak demand.",
        420000,
        8,
        "Essential",
      ),
      item(
        "Install POS and kitchen order system",
        "Connect billing, KOT, inventory and delivery aggregators.",
        65000,
        4,
        "Recommended",
      ),
    ],
    Staff: [
      item(
        "Hire and train the opening kitchen team",
        "Cover food safety, recipes, portions, service timing and closing controls.",
        90000,
        8,
        "Essential",
      ),
    ],
    Branding: [
      item(
        "Design menu and storefront signage",
        "Make ordering, pricing and navigation clear across counter and delivery channels.",
        35000,
        4,
        "Essential",
      ),
    ],
    Operations: [
      item(
        "Cost and test the opening menu",
        "Lock recipes, yields, food cost, selling price and preparation time.",
        10000,
        5,
        "Essential",
      ),
      item(
        "Set up food inventory controls",
        "Define receiving, storage, expiry, wastage and daily stock routines.",
        12000,
        3,
        "Essential",
      ),
    ],
    Marketing: [
      item(
        "Prepare local and delivery-platform launch",
        "Coordinate maps, aggregator listings, neighbourhood outreach and opening offers.",
        45000,
        4,
        "Recommended",
      ),
    ],
  },
  "Retail Store": {
    Licenses: [
      licence(
        "Obtain municipal trade licence",
        "Confirm the local trade licence and permitted land-use requirements for the products and premises.",
        6,
        "Essential",
        "Municipal corporation / local body",
        "Applies where the local body licenses the retail trade or product category.",
      ),
      licence(
        "Verify and stamp weighing instruments",
        "Have weighing and measuring instruments approved, verified and periodically stamped before customer use.",
        5,
        "Essential",
        "State Legal Metrology Department",
        "When goods are sold by weight, measure or number using regulated instruments.",
        "https://consumeraffairs.nic.in/organisation-and-units/division/legal-metrology",
      ),
      licence(
        "Register as a manufacturer, packer or importer",
        "Complete Legal Metrology registration and package declarations for goods packed or imported under your name.",
        8,
        "Recommended",
        "Legal Metrology",
        "When the business manufactures, pre-packs or imports packaged commodities.",
        "https://consumeraffairs.nic.in/sites/default/files/file-uploads/latestnews/LM_FAQs.pdf",
      ),
      licence(
        "Obtain FSSAI registration or licence",
        "Use the food retailer category in FoSCoS for packaged food, groceries, beverages or fresh food sales.",
        6,
        "Optional",
        "FSSAI",
        "When the store sells, stores, distributes or handles food products.",
        "https://foscos.fssai.gov.in/",
      ),
      licence(
        "Obtain retail drug licence",
        "Secure the state retail drug licence and qualified pharmacist coverage before stocking or selling medicines.",
        12,
        "Optional",
        "State Drug Control Authority",
        "For a pharmacy or any store selling regulated drugs.",
        "https://cdsco.gov.in/opencms/opencms/en/Acts-Rules/",
      ),
      licence(
        "Obtain Importer Exporter Code",
        "Apply online for an IEC before commercial import or export of goods, unless a specific exemption applies.",
        5,
        "Optional",
        "DGFT",
        "When importing stock or exporting physical goods.",
        "https://www.dgft.gov.in/CP/",
      ),
      licence(
        "Obtain Fire Safety NOC (when applicable)",
        "Check fire approval for the building, storage load, floor area and customer occupancy.",
        8,
        "Recommended",
        "State / city Fire Service",
        "When local building or fire rules require it.",
      ),
    ],
    Location: [
      item(
        "Measure frontage, footfall and trade mix",
        "Compare passing traffic, neighbour brands, parking and catchment quality.",
        0,
        3,
        "Essential",
      ),
    ],
    Interiors: [
      item(
        "Plan merchandising and checkout flow",
        "Map decompression, discovery, trial, queue, checkout and stockroom zones.",
        75000,
        5,
        "Essential",
      ),
      item(
        "Procure display fixtures and signage",
        "Specify modular racks, counters, mirrors, lighting and wayfinding.",
        180000,
        7,
        "Recommended",
      ),
    ],
    Equipment: [
      item(
        "Install POS, barcode and security systems",
        "Connect billing, inventory, scanners, printers, CCTV and loss prevention.",
        85000,
        4,
        "Essential",
      ),
    ],
    Staff: [
      item(
        "Train associates on products and service",
        "Cover product knowledge, selling, returns, stock handling and closing.",
        25000,
        4,
        "Essential",
      ),
    ],
    Operations: [
      item(
        "Build opening inventory and replenishment plan",
        "Set initial quantities, reorder points, stock counts and transfer rules.",
        0,
        5,
        "Essential",
      ),
    ],
    Marketing: [
      item(
        "Plan store opening and local discovery",
        "Coordinate maps, local creators, nearby communities and opening-week offers.",
        50000,
        4,
        "Recommended",
      ),
    ],
  },
  "Salon / Spa": {
    Licenses: [
      licence(
        "Obtain salon or spa Health Trade Licence",
        "Apply for the municipal public-health/trade approval covering the exact salon, spa or wellness services offered.",
        8,
        "Essential",
        "Municipal public-health authority",
        "Required where the local body licenses salons, spas, wellness centres or similar health trades.",
        "https://mcdonline.nic.in/portal/htl/officeOrderAndCircular",
      ),
      licence(
        "Obtain Fire Safety NOC (when applicable)",
        "Confirm exits, electrical load, treatment-room layout and occupancy comply with local fire rules.",
        8,
        "Recommended",
        "State / city Fire Service",
        "When the premises or building classification triggers fire approval.",
      ),
      licence(
        "Arrange biomedical-waste authorisation",
        "Register waste handling and use an authorised disposal channel for sharps or contaminated clinical waste.",
        8,
        "Optional",
        "State Pollution Control Board / Committee",
        "When invasive, medical, tattoo, piercing or other services generate biomedical waste.",
        "https://cpcb.nic.in/uploads/Projects/Bio-Medical-Waste/Guidelines_healthcare_June_2018.pdf",
      ),
      licence(
        "Register clinical or medical services",
        "Do not offer medical, dental, dermatology or other clinical procedures without the required facility and practitioner registrations.",
        12,
        "Optional",
        "State health authority / professional council",
        "When doctors or regulated health professionals provide clinical procedures on site.",
        "https://www.clinicalestablishments.mohfw.gov.in/",
      ),
      licence(
        "Clear public music performance rights",
        "Obtain the applicable public-performance permissions for music played to customers.",
        4,
        "Optional",
        "Copyright owners / registered copyright societies",
        "When copyrighted music is played in customer areas.",
        "https://copyright.gov.in/Documents/handbook.html",
      ),
    ],
    Location: [
      item(
        "Assess privacy, water and service capacity",
        "Check treatment-room privacy, drainage, hot water, ventilation and peak occupancy.",
        0,
        3,
        "Essential",
      ),
    ],
    Interiors: [
      item(
        "Design reception and treatment zones",
        "Plan welcome, waiting, styling, wash, treatment, sterilization and staff areas.",
        85000,
        6,
        "Essential",
      ),
    ],
    Equipment: [
      item(
        "Procure chairs, beds and sterilization equipment",
        "Match equipment to the opening service menu and hygiene standards.",
        260000,
        8,
        "Essential",
      ),
    ],
    Staff: [
      item(
        "Recruit and trial service professionals",
        "Use practical skill tests and define service, hygiene and retail standards.",
        60000,
        7,
        "Essential",
      ),
    ],
    Branding: [
      item(
        "Create the service menu and consultation assets",
        "Make duration, inclusions, pricing and aftercare easy to understand.",
        20000,
        3,
        "Essential",
      ),
    ],
    Operations: [
      item(
        "Set up booking, consent and hygiene workflows",
        "Connect appointments, reminders, consultations, cleaning and follow-ups.",
        18000,
        4,
        "Essential",
      ),
    ],
    Marketing: [
      item(
        "Build a pre-opening appointment campaign",
        "Collect local leads with previews, consultations and founding offers.",
        35000,
        4,
        "Recommended",
      ),
    ],
  },
  Clinic: {
    Licenses: [
      licence(
        "Register the clinical establishment",
        "Register the clinic under the Clinical Establishments Act where adopted, or under the applicable state clinical/nursing-home law.",
        12,
        "Essential",
        "District / State Health Authority",
        "Every clinic, diagnostic centre or healthcare establishment under the law applicable in its state.",
        "https://www.clinicalestablishments.mohfw.gov.in/",
      ),
      licence(
        "Verify practitioner council registrations",
        "Confirm each doctor, dentist, AYUSH or allied professional holds a current registration for the system and services practised.",
        6,
        "Essential",
        "Relevant medical / professional council",
        "For every regulated healthcare practitioner working at the clinic.",
      ),
      licence(
        "Obtain biomedical-waste authorisation",
        "Apply to the State Pollution Control Board/Committee and contract an authorised biomedical-waste facility.",
        10,
        "Essential",
        "State Pollution Control Board / Committee",
        "Healthcare facilities generating biomedical waste, including clinics and diagnostic centres.",
        "https://cpcb.nic.in/uploads/Projects/Bio-Medical-Waste/Guidelines_healthcare_June_2018.pdf",
      ),
      licence(
        "Obtain AERB consent for X-ray equipment",
        "Register the institute and obtain the required eLORA consent before operating diagnostic X-ray equipment.",
        16,
        "Optional",
        "Atomic Energy Regulatory Board",
        "When using X-ray, CT, C-arm, mammography, dental X-ray or other regulated radiation equipment.",
        "https://aerb.gov.in/english/regulatory-process/licensing",
      ),
      licence(
        "Register under the PCPNDT law",
        "Register the facility and equipment and follow record, display and reporting requirements.",
        16,
        "Optional",
        "District Appropriate Authority",
        "When providing ultrasound, genetic counselling, genetic laboratory or prenatal diagnostic services.",
      ),
      licence(
        "Obtain retail drug licence",
        "Secure the correct state drug-sale licence if medicines are stocked and sold or dispensed through an attached pharmacy.",
        12,
        "Optional",
        "State Drug Control Authority",
        "When operating a pharmacy or selling regulated medicines from the premises.",
        "https://cdsco.gov.in/opencms/opencms/en/Acts-Rules/",
      ),
      licence(
        "Obtain Fire Safety NOC (when applicable)",
        "Confirm clinical occupancy, evacuation, oxygen/equipment risks and building fire compliance.",
        10,
        "Recommended",
        "State / city Fire Service",
        "When required for the building type, beds, floor area, height or local health registration.",
      ),
    ],
    Location: [
      item(
        "Validate patient access and clinical suitability",
        "Check accessibility, privacy, ambulance access, utilities and nearby referrals.",
        0,
        4,
        "Essential",
      ),
    ],
    Interiors: [
      item(
        "Plan patient-safe clinical flow",
        "Separate reception, consultation, procedure, clean storage and waste movement.",
        150000,
        8,
        "Essential",
      ),
    ],
    Equipment: [
      item(
        "Procure and calibrate clinical equipment",
        "Document specifications, installation, calibration and maintenance ownership.",
        500000,
        10,
        "Essential",
      ),
    ],
    Staff: [
      item(
        "Credential the clinical and support team",
        "Verify qualifications, registrations, references and emergency training.",
        30000,
        8,
        "Essential",
      ),
    ],
    Branding: [
      item(
        "Prepare patient information materials",
        "Create clear service, consent, preparation and aftercare information.",
        25000,
        4,
        "Recommended",
      ),
    ],
    Operations: [
      item(
        "Set up patient records and clinical protocols",
        "Define intake, consent, documentation, infection control and escalation.",
        45000,
        6,
        "Essential",
      ),
    ],
    Marketing: [
      item(
        "Build ethical referral and local discovery channels",
        "Set up maps, referral relationships and compliant patient education.",
        30000,
        5,
        "Recommended",
      ),
    ],
  },
  "Gym / Fitness": {
    Licenses: [
      licence(
        "Obtain fitness-centre Health Trade Licence",
        "Apply for the local health/trade licence covering a gymnasium, fitness centre or health club.",
        8,
        "Essential",
        "Municipal public-health authority",
        "Where the local body licenses fitness centres; Delhi MCD has a specific gymnasium HTL policy.",
        "https://mcdonline.nic.in/portal/htl/officeOrderAndCircular",
      ),
      licence(
        "Confirm land use and building permission",
        "Verify that gym use is permitted on the plot/floor and obtain structural clearance where heavy equipment or a basement is involved.",
        10,
        "Essential",
        "Municipal building / planning authority",
        "For physical fitness centres, especially mixed-use, residential, upper-floor or basement premises.",
      ),
      licence(
        "Obtain Fire Safety NOC (when applicable)",
        "Check exits, occupancy, electrical load and basement rules with the local fire authority.",
        8,
        "Recommended",
        "State / city Fire Service",
        "When the premises or building classification triggers fire approval.",
      ),
      licence(
        "Obtain FSSAI registration or licence",
        "Register the food activity before selling shakes, prepared food, packaged supplements or operating a juice/café counter.",
        6,
        "Optional",
        "FSSAI",
        "When selling or serving food, beverages, health supplements or nutraceuticals.",
        "https://foscos.fssai.gov.in/",
      ),
      licence(
        "Clear public music performance rights",
        "Obtain applicable public-performance permissions for workout music and classes.",
        4,
        "Optional",
        "Copyright owners / registered copyright societies",
        "When copyrighted music is played in the facility.",
        "https://copyright.gov.in/Documents/handbook.html",
      ),
    ],
    Location: [
      item(
        "Check structural load, ventilation and access",
        "Validate floor loading, noise, power, showers, parking and member access.",
        0,
        5,
        "Essential",
      ),
    ],
    Interiors: [
      item(
        "Plan training zones and member flow",
        "Separate strength, cardio, functional, studio, changing and recovery areas.",
        120000,
        7,
        "Essential",
      ),
    ],
    Equipment: [
      item(
        "Build the launch equipment mix",
        "Match equipment quantity and layout to member capacity and programming.",
        900000,
        10,
        "Essential",
      ),
    ],
    Staff: [
      item(
        "Recruit trainers and front-desk coverage",
        "Set credentials, assessments, shifts, targets and member service standards.",
        75000,
        7,
        "Essential",
      ),
    ],
    Branding: [
      item(
        "Create membership and facility sales assets",
        "Explain plans, classes, assessments, rules and onboarding clearly.",
        25000,
        3,
        "Recommended",
      ),
    ],
    Operations: [
      item(
        "Set up membership, access and safety workflows",
        "Connect billing, entry, waivers, equipment checks and incident response.",
        40000,
        5,
        "Essential",
      ),
    ],
    Marketing: [
      item(
        "Run a founding-member campaign",
        "Build a local lead list and convert tours, trials and early memberships.",
        60000,
        6,
        "Recommended",
      ),
    ],
  },
  "Office / Agency": {
    Licenses: [
      licence(
        "Confirm municipal trade and occupancy permission",
        "Verify commercial use, signage and any local trade licence required for the office activity.",
        6,
        "Recommended",
        "Municipal corporation / local body",
        "When the city licenses the activity or the premises needs commercial-use approval.",
      ),
      licence(
        "Register for Professional Tax",
        "Register the employer and employees in states that levy professional tax.",
        5,
        "Recommended",
        "State Commercial Tax / Professional Tax Department",
        "Only in states or local jurisdictions where professional tax applies.",
      ),
      licence(
        "Register the establishment with EPFO",
        "Complete employer registration and ongoing provident-fund compliance when the coverage rules apply.",
        6,
        "Recommended",
        "Employees' Provident Fund Organisation",
        "Typically when the establishment reaches the applicable employee threshold or opts into coverage.",
        "https://www.epfindia.gov.in/",
      ),
      licence(
        "Register the establishment with ESIC",
        "Complete employer registration and insure eligible employees where ESI coverage has been extended.",
        6,
        "Recommended",
        "Employees' State Insurance Corporation",
        "When the establishment type, location and employee threshold fall under ESI coverage.",
        "https://www.esic.gov.in/",
      ),
      licence(
        "Obtain sector or client-mandated registration",
        "Check whether the agency activity needs a sector licence, empanelment or professional registration before offering it.",
        8,
        "Optional",
        "Relevant sector regulator",
        "For regulated activities such as recruitment, travel, finance, security, telecom or government contracting.",
      ),
    ],
    Location: [
      item(
        "Plan team capacity and client access",
        "Compare commute, meeting needs, hybrid attendance and growth space.",
        0,
        3,
        "Recommended",
      ),
    ],
    Interiors: [
      item(
        "Design focused and collaborative work zones",
        "Balance desks, calls, meetings, storage and client presentation space.",
        90000,
        6,
        "Recommended",
      ),
    ],
    Equipment: [
      item(
        "Set up secure workplace technology",
        "Procure devices, networking, backup, access control and meeting tools.",
        250000,
        6,
        "Essential",
      ),
    ],
    Staff: [
      item(
        "Define the delivery team and utilization model",
        "Map roles, capacity, billable targets, reviews and hiring triggers.",
        0,
        4,
        "Essential",
      ),
    ],
    Branding: [
      item(
        "Create proposals and client presentation templates",
        "Standardize credentials, scope, pricing and case-study presentation.",
        30000,
        4,
        "Essential",
      ),
    ],
    Operations: [
      item(
        "Set up lead-to-delivery workflows",
        "Connect CRM, proposals, handoff, project delivery, invoicing and review.",
        25000,
        5,
        "Essential",
      ),
    ],
    Marketing: [
      item(
        "Build an authority and outbound plan",
        "Choose niches, proof assets, content themes and prospecting cadence.",
        30000,
        5,
        "Recommended",
      ),
    ],
  },
  "IT / SaaS": {
    Licenses: [
      licence(
        "Document GST and export-of-services position",
        "Confirm GST registration, place-of-supply, export invoices, LUT and refund treatment with a qualified adviser.",
        6,
        "Essential",
        "GST / CBIC",
        "When turnover or compulsory-registration rules apply, or when claiming zero-rated export benefits.",
        "https://cbic-gst.gov.in/faq.html",
      ),
      licence(
        "Register STPI and submit SOFTEX (when applicable)",
        "Check STPI registration and SOFTEX reporting for software exports realised through the covered non-physical channels.",
        8,
        "Optional",
        "Software Technology Parks of India / authorised dealer bank",
        "When the export model and foreign-exchange reporting rules require SOFTEX.",
      ),
      licence(
        "Obtain Importer Exporter Code",
        "Assess IEC requirements for goods imports/exports and for service-export benefits under the Foreign Trade Policy.",
        5,
        "Optional",
        "DGFT",
        "For import/export of goods, or service exports when claiming specified Foreign Trade Policy benefits.",
        "https://www.dgft.gov.in/CP/",
      ),
      licence(
        "Register and protect the product trademark",
        "Search relevant classes and file the product/company mark before launch or fundraising.",
        10,
        "Recommended",
        "Trade Marks Registry, IP India",
        "Optional legal protection, strongly recommended for a distinctive product or brand.",
        "https://www.ipindia.gov.in/pages/trade-marks/learn/forms-and-official-fees",
      ),
      licence(
        "Check regulated digital-service approvals",
        "Identify sector licences before building payments, lending, insurance, health, telecom, gaming or other regulated software.",
        12,
        "Optional",
        "Relevant sector regulator",
        "Only when the SaaS product performs a regulated activity.",
      ),
    ],
    Location: [
      item(
        "Choose the remote or office operating model",
        "Define collaboration hours, workspace support and meeting expectations.",
        0,
        2,
        "Optional",
      ),
    ],
    Interiors: [
      item(
        "Set up focused product-team workspaces",
        "Plan quiet work, calls, collaboration and secure equipment storage.",
        60000,
        5,
        "Optional",
      ),
    ],
    Equipment: [
      item(
        "Provision development devices and software",
        "Standardize laptops, accounts, licences, access and recovery.",
        300000,
        5,
        "Essential",
      ),
    ],
    Staff: [
      item(
        "Define the initial product and support team",
        "Map product, engineering, design, sales and support ownership.",
        0,
        3,
        "Essential",
      ),
    ],
    Branding: [
      item(
        "Create product identity and UI foundations",
        "Align name, domain, product visuals, website and interface tokens.",
        60000,
        6,
        "Recommended",
      ),
    ],
    Operations: [
      item(
        "Set up release, support and incident workflows",
        "Define quality gates, deployment, monitoring, support and escalation.",
        25000,
        5,
        "Essential",
      ),
    ],
    Marketing: [
      item(
        "Plan beta recruitment and activation",
        "Define ideal users, acquisition experiments, onboarding and feedback loops.",
        50000,
        6,
        "Essential",
      ),
    ],
  },
  "E-commerce": {
    Licenses: [
      licence(
        "Confirm GST registration for the selling model",
        "Check turnover, interstate supply, marketplace/e-commerce operator rules and current exemptions before registration.",
        6,
        "Essential",
        "GST / CBIC",
        "Depends on whether you are a seller or operator, goods/services supplied, turnover and states served.",
        "https://cbic-gst.gov.in/faq.html",
      ),
      licence(
        "Complete Legal Metrology packaged-goods compliance",
        "Register as manufacturer/packer/importer where required and display mandatory package and online product declarations.",
        8,
        "Essential",
        "Legal Metrology",
        "When manufacturing, packing, importing or selling pre-packaged commodities online.",
        "https://consumeraffairs.nic.in/sites/default/files/file-uploads/latestnews/LM_FAQs.pdf",
      ),
      licence(
        "Implement Consumer Protection e-commerce disclosures",
        "Publish seller, grievance, return, refund, country-of-origin and other information required for the platform model.",
        6,
        "Essential",
        "Department of Consumer Affairs",
        "For marketplace and inventory e-commerce entities serving consumers in India.",
        "https://consumeraffairs.nic.in/whats-new-0",
      ),
      licence(
        "Obtain Importer Exporter Code",
        "Apply for IEC before commercial import/export of goods unless specifically exempt.",
        5,
        "Optional",
        "DGFT",
        "When importing products or exporting physical goods.",
        "https://www.dgft.gov.in/CP/",
      ),
      licence(
        "Obtain FSSAI registration or licence",
        "Select the applicable e-commerce, retailer, distributor, storage or food-business category in FoSCoS.",
        8,
        "Optional",
        "FSSAI",
        "When listing, storing, distributing or selling food or supplements.",
        "https://foscos.fssai.gov.in/",
      ),
      licence(
        "Obtain drug-sale licences",
        "Confirm state drug-sale licensing for every premises and online process before listing regulated medicines.",
        14,
        "Optional",
        "State Drug Control Authority",
        "When selling medicines or other products regulated as drugs.",
        "https://cdsco.gov.in/opencms/opencms/en/Acts-Rules/",
      ),
    ],
    Location: [
      item(
        "Select storage and fulfilment setup",
        "Compare home, warehouse and third-party fulfilment by volume and service level.",
        0,
        4,
        "Essential",
      ),
    ],
    Interiors: [
      item(
        "Plan packing, storage and dispatch zones",
        "Minimize movement between receiving, shelving, picking, packing and handover.",
        50000,
        5,
        "Recommended",
      ),
    ],
    Equipment: [
      item(
        "Set up fulfilment and content equipment",
        "Cover shelving, scales, printers, scanners, packing and product photography.",
        110000,
        5,
        "Recommended",
      ),
    ],
    Staff: [
      item(
        "Plan catalogue, service and fulfilment coverage",
        "Define ownership for listings, orders, support, returns and inventory.",
        0,
        3,
        "Essential",
      ),
    ],
    Branding: [
      item(
        "Build storefront and packaging identity",
        "Create consistent product pages, packaging, inserts and transactional messages.",
        50000,
        6,
        "Essential",
      ),
    ],
    Operations: [
      item(
        "Configure catalogue, payments and fulfilment",
        "Test inventory, checkout, tax, shipping, tracking, returns and refunds.",
        45000,
        6,
        "Essential",
      ),
    ],
    Marketing: [
      item(
        "Build launch acquisition and retention flows",
        "Prepare ads, creators, email capture, abandoned cart and repeat purchase.",
        75000,
        6,
        "Recommended",
      ),
    ],
  },
  "Coaching / Education": {
    Licenses: [
      licence(
        "Register the coaching or tutorial centre",
        "Check the state's coaching-centre, tutorial-institution or education-department registration framework before enrolment.",
        10,
        "Essential",
        "State / UT Education Department",
        "Where the state has adopted a coaching or tutorial registration law, rules or guidelines.",
        "https://www.education.gov.in/sites/upload_files/mhrd/files/Guideliens_Coaching_Centres_en.pdf",
      ),
      licence(
        "Obtain Fire Safety and building certificates",
        "Confirm approved educational/commercial use, occupancy, exits, structural safety and fire certification.",
        10,
        "Essential",
        "Municipal building authority / Fire Service",
        "For physical classrooms or learner premises, subject to local thresholds.",
      ),
      licence(
        "Obtain recognition or affiliation",
        "Do not describe the centre as a school, college, degree provider or recognised awarding body without the corresponding approval.",
        16,
        "Optional",
        "Relevant education board / university / regulator",
        "Only when offering regulated qualifications, formal schooling or recognised certificates.",
      ),
      licence(
        "Confirm GST treatment of courses",
        "Determine whether each programme is taxable or covered by an education exemption before invoicing.",
        6,
        "Recommended",
        "GST / CBIC",
        "When turnover crosses the applicable threshold or taxable programmes are supplied.",
        "https://cbic-gst.gov.in/faq.html",
      ),
      licence(
        "Clear content and software rights",
        "License third-party course material, books, video, music, tests and learning software used in paid programmes.",
        5,
        "Recommended",
        "Copyright owners / Copyright Office",
        "When using protected third-party content beyond a statutory exception.",
        "https://copyright.gov.in/",
      ),
    ],
    Location: [
      item(
        "Select classroom or online delivery setup",
        "Compare learner access, cohort size, schedule, recording and hybrid needs.",
        0,
        3,
        "Essential",
      ),
    ],
    Interiors: [
      item(
        "Design the learning environment",
        "Plan visibility, acoustics, seating, breaks, recording and accessibility.",
        70000,
        5,
        "Recommended",
      ),
    ],
    Equipment: [
      item(
        "Set up teaching and learning technology",
        "Cover display, audio, recording, LMS, assessments and backups.",
        90000,
        5,
        "Essential",
      ),
    ],
    Staff: [
      item(
        "Recruit and standardize instructors",
        "Set subject criteria, demos, lesson standards, feedback and substitutions.",
        25000,
        6,
        "Recommended",
      ),
    ],
    Branding: [
      item(
        "Create programme and learner materials",
        "Standardize curriculum presentation, workbooks, certificates and welcome packs.",
        35000,
        5,
        "Essential",
      ),
    ],
    Operations: [
      item(
        "Build enrolment-to-completion workflows",
        "Connect enquiries, counselling, payment, attendance, assessment and feedback.",
        20000,
        5,
        "Essential",
      ),
    ],
    Marketing: [
      item(
        "Plan cohort or course enrolment",
        "Create webinars, counselling, proof, deadlines and follow-up sequences.",
        40000,
        6,
        "Recommended",
      ),
    ],
  },
  "Professional Services": {
    Licenses: [
      licence(
        "Obtain professional council enrolment",
        "Verify the firm structure, practising certificate and individual registrations required for the profession.",
        10,
        "Essential",
        "Relevant statutory professional council",
        "For regulated professions such as law, accountancy, architecture, medicine or company-secretarial practice.",
      ),
      licence(
        "Obtain sector-specific registration",
        "Check the regulator before advising on investments, insurance, lending, insolvency, real estate or other licensed fields.",
        12,
        "Optional",
        "Relevant sector regulator",
        "When the service includes a regulated activity or protected professional title.",
      ),
      licence(
        "Register for Professional Tax",
        "Complete employer and practitioner registration in states that levy professional tax.",
        5,
        "Recommended",
        "State Commercial Tax / Professional Tax Department",
        "Only in states or local jurisdictions where professional tax applies.",
      ),
      licence(
        "Confirm municipal trade and occupancy permission",
        "Verify commercial use and any local trade registration needed for a client-facing office.",
        6,
        "Recommended",
        "Municipal corporation / local body",
        "When the city licenses the activity or premises.",
      ),
      licence(
        "Register and protect the service trademark",
        "Search and file the business name or mark in the appropriate service classes.",
        10,
        "Optional",
        "Trade Marks Registry, IP India",
        "Optional legal protection for the firm or service brand.",
        "https://www.ipindia.gov.in/pages/trade-marks/learn/forms-and-official-fees",
      ),
    ],
    Location: [
      item(
        "Choose the client meeting and delivery model",
        "Define remote, coworking or office needs based on trust and confidentiality.",
        0,
        2,
        "Optional",
      ),
    ],
    Interiors: [
      item(
        "Prepare a credible client meeting environment",
        "Plan privacy, presentation, document handling and professional hospitality.",
        45000,
        4,
        "Optional",
      ),
    ],
    Equipment: [
      item(
        "Set up secure delivery and document systems",
        "Cover devices, storage, signatures, backup and client communication.",
        120000,
        5,
        "Essential",
      ),
    ],
    Staff: [
      item(
        "Define specialist and administrative coverage",
        "Map delivery, review, scheduling, billing and client-service responsibilities.",
        0,
        3,
        "Essential",
      ),
    ],
    Branding: [
      item(
        "Create credentials and engagement materials",
        "Prepare profile, service sheets, proposals, reports and case studies.",
        30000,
        4,
        "Essential",
      ),
    ],
    Operations: [
      item(
        "Build enquiry-to-engagement workflows",
        "Standardize qualification, conflicts, scope, delivery, review and billing.",
        15000,
        4,
        "Essential",
      ),
    ],
    Marketing: [
      item(
        "Build referral and expertise-led marketing",
        "Plan partnerships, talks, useful content and structured referral follow-up.",
        25000,
        6,
        "Recommended",
      ),
    ],
  },
};

export function requirementsFor(
  category: string,
  module: ModuleKey,
): RequirementOption[] {
  return [...core[module], ...(categoryExtras[category]?.[module] ?? [])].map(
    (entry) => ({
      ...entry,
      module,
      id: `${slug(module)}--${slug(entry.title)}`,
    }),
  );
}

export function requirementMap(category: string) {
  return new Map(
    MODULES.flatMap(({ key }) => requirementsFor(category, key)).map(
      (entry) => [entry.id, entry],
    ),
  );
}

export function dueDateFor(launchDate: string | undefined, leadWeeks: number) {
  if (!launchDate) return null;
  const date = new Date(`${launchDate}T12:00:00Z`);
  date.setUTCDate(date.getUTCDate() - leadWeeks * 7);
  return date.toISOString().slice(0, 10);
}
