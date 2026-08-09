export const MODULES = [
  { key: "Licenses", label: "Licenses", short: "Registrations, permits and protection" },
  { key: "Location", label: "Location", short: "Site selection, utilities and access" },
  { key: "Interiors", label: "Interiors", short: "Layout, fit-out and customer experience" },
  { key: "Equipment", label: "Equipment", short: "Tools, technology and maintenance" },
  { key: "Staff", label: "Staff", short: "Roles, hiring and people operations" },
  { key: "Branding", label: "Branding", short: "Identity, signage and customer touchpoints" },
  { key: "Operations", label: "Operations", short: "Suppliers, systems and daily workflows" },
  { key: "Marketing", label: "Marketing", short: "Audience, channels and launch campaign" },
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
};

type ItemInput = Omit<RequirementOption, "id" | "module">;
const item = (title: string, description: string, estimatedCost: number, leadWeeks: number, tag: ItemInput["tag"] = "Recommended"): ItemInput => ({ title, description, estimatedCost, leadWeeks, tag });
const slug = (value: string) => value.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");

const core: Record<ModuleKey, ItemInput[]> = {
  Licenses: [
    item("Choose and register the legal entity", "Compare proprietorship, partnership and company structures before registration.", 15000, 6, "Essential"),
    item("Complete tax registrations", "Set up the tax IDs and local registrations needed to invoice and operate.", 5000, 4, "Essential"),
    item("Arrange business insurance", "Assess public liability, asset and employee coverage.", 12000, 3, "Recommended"),
  ],
  Location: [
    item("Define the location scorecard", "Set must-haves for area, access, visibility, capacity and monthly occupancy cost.", 0, 1, "Essential"),
    item("Shortlist and compare locations", "Visit options and record rent, deposit, restrictions and expansion potential.", 0, 5, "Essential"),
    item("Verify utilities and accessibility", "Confirm power, water, internet, parking, delivery access and accessibility.", 5000, 2, "Recommended"),
  ],
  Interiors: [
    item("Create a functional space plan", "Map customer, staff, storage and service flows before committing to the fit-out.", 25000, 4, "Essential"),
    item("Collect fit-out quotations", "Compare scope, materials, timeline, warranty and exclusions from contractors.", 0, 3, "Recommended"),
    item("Complete safety and accessibility checks", "Review exits, lighting, ventilation, signage and inclusive access.", 15000, 3, "Essential"),
  ],
  Equipment: [
    item("Create the essential equipment list", "Separate launch-critical equipment from items that can wait until revenue grows.", 0, 2, "Essential"),
    item("Compare purchase, lease and rental", "Model upfront cost, warranty, maintenance and replacement risk.", 0, 3, "Recommended"),
    item("Plan installation and maintenance", "Assign power, network, installation, testing and service responsibilities.", 10000, 3, "Recommended"),
  ],
  Staff: [
    item("Define launch roles and responsibilities", "List the minimum roles, shift coverage and decision ownership for launch.", 0, 2, "Essential"),
    item("Create the hiring and onboarding plan", "Set role profiles, interviews, offer dates, training and first-week checklists.", 10000, 6, "Essential"),
    item("Set up payroll and staff records", "Prepare contracts, attendance, payroll, leave and statutory records.", 8000, 4, "Recommended"),
  ],
  Branding: [
    item("Finalize brand identity", "Confirm name, logo, colors, typography and a practical usage guide.", 30000, 5, "Essential"),
    item("Produce customer-facing brand assets", "Prepare the physical and digital assets customers will see at launch.", 20000, 4, "Recommended"),
    item("Secure brand domains and handles", "Reserve the primary domain and consistent social media usernames.", 5000, 1, "Essential"),
  ],
  Operations: [
    item("Document daily operating procedures", "Write simple opening, closing, quality, escalation and exception workflows.", 0, 4, "Essential"),
    item("Select suppliers and backup vendors", "Compare price, quality, lead time, credit terms and backup availability.", 0, 5, "Essential"),
    item("Run a launch-readiness rehearsal", "Test a full operating day and record failures before opening to customers.", 5000, 1, "Recommended"),
  ],
  Marketing: [
    item("Define the launch audience and offer", "Clarify the first customer segment, core promise, proof and opening offer.", 0, 2, "Essential"),
    item("Build the launch content calendar", "Plan messages, owners, formats and publishing dates around the target launch.", 15000, 4, "Recommended"),
    item("Set up measurement and lead capture", "Track enquiries, source, conversion and campaign spend from day one.", 10000, 2, "Essential"),
  ],
};

const categoryExtras: Record<string, Partial<Record<ModuleKey, ItemInput[]>>> = {
  "Restaurant / QSR": {
    Licenses: [item("Obtain food safety registration", "Apply for the correct FSSAI registration or licence for the operation.", 12000, 6, "Essential"), item("Secure fire and local trade approvals", "Confirm kitchen, seating and occupancy approvals with local authorities.", 18000, 8, "Essential")],
    Location: [item("Validate footfall and delivery radius", "Compare dine-in demand, office or residential catchment and delivery coverage.", 0, 2, "Essential")],
    Interiors: [item("Design kitchen-to-counter workflow", "Reduce crossing paths between receiving, storage, preparation, cooking and dispatch.", 65000, 5, "Essential")],
    Equipment: [item("Procure commercial kitchen equipment", "Size cooking, refrigeration, preparation and exhaust equipment for peak demand.", 420000, 8, "Essential"), item("Install POS and kitchen order system", "Connect billing, KOT, inventory and delivery aggregators.", 65000, 4, "Recommended")],
    Staff: [item("Hire and train the opening kitchen team", "Cover food safety, recipes, portions, service timing and closing controls.", 90000, 8, "Essential")],
    Branding: [item("Design menu and storefront signage", "Make ordering, pricing and navigation clear across counter and delivery channels.", 35000, 4, "Essential")],
    Operations: [item("Cost and test the opening menu", "Lock recipes, yields, food cost, selling price and preparation time.", 10000, 5, "Essential"), item("Set up food inventory controls", "Define receiving, storage, expiry, wastage and daily stock routines.", 12000, 3, "Essential")],
    Marketing: [item("Prepare local and delivery-platform launch", "Coordinate maps, aggregator listings, neighbourhood outreach and opening offers.", 45000, 4, "Recommended")],
  },
  "Retail Store": {
    Licenses: [item("Obtain shop and establishment registration", "Complete the local registration required for the store and staff.", 10000, 5, "Essential")],
    Location: [item("Measure frontage, footfall and trade mix", "Compare passing traffic, neighbour brands, parking and catchment quality.", 0, 3, "Essential")],
    Interiors: [item("Plan merchandising and checkout flow", "Map decompression, discovery, trial, queue, checkout and stockroom zones.", 75000, 5, "Essential"), item("Procure display fixtures and signage", "Specify modular racks, counters, mirrors, lighting and wayfinding.", 180000, 7, "Recommended")],
    Equipment: [item("Install POS, barcode and security systems", "Connect billing, inventory, scanners, printers, CCTV and loss prevention.", 85000, 4, "Essential")],
    Staff: [item("Train associates on products and service", "Cover product knowledge, selling, returns, stock handling and closing.", 25000, 4, "Essential")],
    Operations: [item("Build opening inventory and replenishment plan", "Set initial quantities, reorder points, stock counts and transfer rules.", 0, 5, "Essential")],
    Marketing: [item("Plan store opening and local discovery", "Coordinate maps, local creators, nearby communities and opening-week offers.", 50000, 4, "Recommended")],
  },
  "Salon / Spa": {
    Licenses: [item("Obtain salon or spa trade approvals", "Confirm municipal, health, fire and music requirements for the services offered.", 15000, 6, "Essential")],
    Location: [item("Assess privacy, water and service capacity", "Check treatment-room privacy, drainage, hot water, ventilation and peak occupancy.", 0, 3, "Essential")],
    Interiors: [item("Design reception and treatment zones", "Plan welcome, waiting, styling, wash, treatment, sterilization and staff areas.", 85000, 6, "Essential")],
    Equipment: [item("Procure chairs, beds and sterilization equipment", "Match equipment to the opening service menu and hygiene standards.", 260000, 8, "Essential")],
    Staff: [item("Recruit and trial service professionals", "Use practical skill tests and define service, hygiene and retail standards.", 60000, 7, "Essential")],
    Branding: [item("Create the service menu and consultation assets", "Make duration, inclusions, pricing and aftercare easy to understand.", 20000, 3, "Essential")],
    Operations: [item("Set up booking, consent and hygiene workflows", "Connect appointments, reminders, consultations, cleaning and follow-ups.", 18000, 4, "Essential")],
    Marketing: [item("Build a pre-opening appointment campaign", "Collect local leads with previews, consultations and founding offers.", 35000, 4, "Recommended")],
  },
  Clinic: {
    Licenses: [item("Complete clinical establishment approvals", "Confirm professional registrations, facility licensing and biomedical requirements.", 30000, 10, "Essential")],
    Location: [item("Validate patient access and clinical suitability", "Check accessibility, privacy, ambulance access, utilities and nearby referrals.", 0, 4, "Essential")],
    Interiors: [item("Plan patient-safe clinical flow", "Separate reception, consultation, procedure, clean storage and waste movement.", 150000, 8, "Essential")],
    Equipment: [item("Procure and calibrate clinical equipment", "Document specifications, installation, calibration and maintenance ownership.", 500000, 10, "Essential")],
    Staff: [item("Credential the clinical and support team", "Verify qualifications, registrations, references and emergency training.", 30000, 8, "Essential")],
    Branding: [item("Prepare patient information materials", "Create clear service, consent, preparation and aftercare information.", 25000, 4, "Recommended")],
    Operations: [item("Set up patient records and clinical protocols", "Define intake, consent, documentation, infection control and escalation.", 45000, 6, "Essential")],
    Marketing: [item("Build ethical referral and local discovery channels", "Set up maps, referral relationships and compliant patient education.", 30000, 5, "Recommended")],
  },
  "Gym / Fitness": {
    Licenses: [item("Complete fitness facility and safety approvals", "Confirm trade, fire, music, trainer and customer liability requirements.", 25000, 7, "Essential")],
    Location: [item("Check structural load, ventilation and access", "Validate floor loading, noise, power, showers, parking and member access.", 0, 5, "Essential")],
    Interiors: [item("Plan training zones and member flow", "Separate strength, cardio, functional, studio, changing and recovery areas.", 120000, 7, "Essential")],
    Equipment: [item("Build the launch equipment mix", "Match equipment quantity and layout to member capacity and programming.", 900000, 10, "Essential")],
    Staff: [item("Recruit trainers and front-desk coverage", "Set credentials, assessments, shifts, targets and member service standards.", 75000, 7, "Essential")],
    Branding: [item("Create membership and facility sales assets", "Explain plans, classes, assessments, rules and onboarding clearly.", 25000, 3, "Recommended")],
    Operations: [item("Set up membership, access and safety workflows", "Connect billing, entry, waivers, equipment checks and incident response.", 40000, 5, "Essential")],
    Marketing: [item("Run a founding-member campaign", "Build a local lead list and convert tours, trials and early memberships.", 60000, 6, "Recommended")],
  },
  "Office / Agency": {
    Licenses: [item("Complete professional and local registrations", "Confirm entity, tax, employment and sector-specific requirements.", 15000, 5, "Essential")],
    Location: [item("Plan team capacity and client access", "Compare commute, meeting needs, hybrid attendance and growth space.", 0, 3, "Recommended")],
    Interiors: [item("Design focused and collaborative work zones", "Balance desks, calls, meetings, storage and client presentation space.", 90000, 6, "Recommended")],
    Equipment: [item("Set up secure workplace technology", "Procure devices, networking, backup, access control and meeting tools.", 250000, 6, "Essential")],
    Staff: [item("Define the delivery team and utilization model", "Map roles, capacity, billable targets, reviews and hiring triggers.", 0, 4, "Essential")],
    Branding: [item("Create proposals and client presentation templates", "Standardize credentials, scope, pricing and case-study presentation.", 30000, 4, "Essential")],
    Operations: [item("Set up lead-to-delivery workflows", "Connect CRM, proposals, handoff, project delivery, invoicing and review.", 25000, 5, "Essential")],
    Marketing: [item("Build an authority and outbound plan", "Choose niches, proof assets, content themes and prospecting cadence.", 30000, 5, "Recommended")],
  },
  "IT / SaaS": {
    Licenses: [item("Complete company, tax and privacy setup", "Cover incorporation, contracts, privacy policy and data-processing terms.", 30000, 6, "Essential")],
    Location: [item("Choose the remote or office operating model", "Define collaboration hours, workspace support and meeting expectations.", 0, 2, "Optional")],
    Interiors: [item("Set up focused product-team workspaces", "Plan quiet work, calls, collaboration and secure equipment storage.", 60000, 5, "Optional")],
    Equipment: [item("Provision development devices and software", "Standardize laptops, accounts, licences, access and recovery.", 300000, 5, "Essential")],
    Staff: [item("Define the initial product and support team", "Map product, engineering, design, sales and support ownership.", 0, 3, "Essential")],
    Branding: [item("Create product identity and UI foundations", "Align name, domain, product visuals, website and interface tokens.", 60000, 6, "Recommended")],
    Operations: [item("Set up release, support and incident workflows", "Define quality gates, deployment, monitoring, support and escalation.", 25000, 5, "Essential")],
    Marketing: [item("Plan beta recruitment and activation", "Define ideal users, acquisition experiments, onboarding and feedback loops.", 50000, 6, "Essential")],
  },
  "E-commerce": {
    Licenses: [item("Complete commerce, tax and policy requirements", "Prepare registrations, terms, privacy, shipping and return policies.", 18000, 5, "Essential")],
    Location: [item("Select storage and fulfilment setup", "Compare home, warehouse and third-party fulfilment by volume and service level.", 0, 4, "Essential")],
    Interiors: [item("Plan packing, storage and dispatch zones", "Minimize movement between receiving, shelving, picking, packing and handover.", 50000, 5, "Recommended")],
    Equipment: [item("Set up fulfilment and content equipment", "Cover shelving, scales, printers, scanners, packing and product photography.", 110000, 5, "Recommended")],
    Staff: [item("Plan catalogue, service and fulfilment coverage", "Define ownership for listings, orders, support, returns and inventory.", 0, 3, "Essential")],
    Branding: [item("Build storefront and packaging identity", "Create consistent product pages, packaging, inserts and transactional messages.", 50000, 6, "Essential")],
    Operations: [item("Configure catalogue, payments and fulfilment", "Test inventory, checkout, tax, shipping, tracking, returns and refunds.", 45000, 6, "Essential")],
    Marketing: [item("Build launch acquisition and retention flows", "Prepare ads, creators, email capture, abandoned cart and repeat purchase.", 75000, 6, "Recommended")],
  },
  "Coaching / Education": {
    Licenses: [item("Confirm education and content compliance", "Review entity, tax, certificates, child safety and content rights where relevant.", 12000, 5, "Essential")],
    Location: [item("Select classroom or online delivery setup", "Compare learner access, cohort size, schedule, recording and hybrid needs.", 0, 3, "Essential")],
    Interiors: [item("Design the learning environment", "Plan visibility, acoustics, seating, breaks, recording and accessibility.", 70000, 5, "Recommended")],
    Equipment: [item("Set up teaching and learning technology", "Cover display, audio, recording, LMS, assessments and backups.", 90000, 5, "Essential")],
    Staff: [item("Recruit and standardize instructors", "Set subject criteria, demos, lesson standards, feedback and substitutions.", 25000, 6, "Recommended")],
    Branding: [item("Create programme and learner materials", "Standardize curriculum presentation, workbooks, certificates and welcome packs.", 35000, 5, "Essential")],
    Operations: [item("Build enrolment-to-completion workflows", "Connect enquiries, counselling, payment, attendance, assessment and feedback.", 20000, 5, "Essential")],
    Marketing: [item("Plan cohort or course enrolment", "Create webinars, counselling, proof, deadlines and follow-up sequences.", 40000, 6, "Recommended")],
  },
  "Professional Services": {
    Licenses: [item("Complete professional registrations and contracts", "Confirm credentials, engagement terms, confidentiality and insurance.", 20000, 6, "Essential")],
    Location: [item("Choose the client meeting and delivery model", "Define remote, coworking or office needs based on trust and confidentiality.", 0, 2, "Optional")],
    Interiors: [item("Prepare a credible client meeting environment", "Plan privacy, presentation, document handling and professional hospitality.", 45000, 4, "Optional")],
    Equipment: [item("Set up secure delivery and document systems", "Cover devices, storage, signatures, backup and client communication.", 120000, 5, "Essential")],
    Staff: [item("Define specialist and administrative coverage", "Map delivery, review, scheduling, billing and client-service responsibilities.", 0, 3, "Essential")],
    Branding: [item("Create credentials and engagement materials", "Prepare profile, service sheets, proposals, reports and case studies.", 30000, 4, "Essential")],
    Operations: [item("Build enquiry-to-engagement workflows", "Standardize qualification, conflicts, scope, delivery, review and billing.", 15000, 4, "Essential")],
    Marketing: [item("Build referral and expertise-led marketing", "Plan partnerships, talks, useful content and structured referral follow-up.", 25000, 6, "Recommended")],
  },
};

export function requirementsFor(category: string, module: ModuleKey): RequirementOption[] {
  return [...core[module], ...(categoryExtras[category]?.[module] ?? [])].map((entry) => ({
    ...entry,
    module,
    id: `${slug(module)}--${slug(entry.title)}`,
  }));
}

export function requirementMap(category: string) {
  return new Map(MODULES.flatMap(({ key }) => requirementsFor(category, key)).map((entry) => [entry.id, entry]));
}

export function dueDateFor(launchDate: string | undefined, leadWeeks: number) {
  if (!launchDate) return null;
  const date = new Date(`${launchDate}T12:00:00Z`);
  date.setUTCDate(date.getUTCDate() - leadWeeks * 7);
  return date.toISOString().slice(0, 10);
}
