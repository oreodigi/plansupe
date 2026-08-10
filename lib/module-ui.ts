import {
  Buildings,
  Certificate,
  GearSix,
  Megaphone,
  PaintBrush,
  Package,
  Storefront,
  Toolbox,
  UsersThree,
} from "@phosphor-icons/react/dist/ssr";
import type { ComponentType } from "react";
import type { ModuleKey } from "./setup-catalog";

export const moduleUi: Record<
  ModuleKey,
  {
    icon: ComponentType<{
      size?: number;
      weight?: "regular" | "bold" | "duotone";
    }>;
    description: string;
  }
> = {
  Licenses: {
    icon: Certificate,
    description: "Registrations, permits and compliance",
  },
  Location: {
    icon: Storefront,
    description: "Site, utilities and accessibility",
  },
  Interiors: {
    icon: PaintBrush,
    description: "Layout, fit-out and customer experience",
  },
  Equipment: {
    icon: Toolbox,
    description: "Tools, technology and maintenance",
  },
  Staff: {
    icon: UsersThree,
    description: "Hiring, training and people operations",
  },
  Branding: {
    icon: Buildings,
    description: "Identity, signage and customer touchpoints",
  },
  Operations: {
    icon: GearSix,
    description: "Suppliers, systems and daily workflows",
  },
  Marketing: {
    icon: Megaphone,
    description: "Audience, channels and launch campaign",
  },
  Assets: {
    icon: Package,
    description: "Everything your business owns and uses",
  },
};

export function moduleSlug(module: string) {
  return module.toLowerCase();
}
