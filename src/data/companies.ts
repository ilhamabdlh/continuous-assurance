import { DEMO } from "./demo";

export type PortfolioCompany = (typeof DEMO.portfolio.list)[number];

export interface ActiveCompany extends PortfolioCompany {
  domain: string;
  lastSweep: string;
  logo?: string;
  sponsor: string;
}

const EXTRA: Record<
  string,
  { domain: string; lastSweep: string; logo?: string; sponsor?: string }
> = {
  "Northwind Logistics": {
    domain: "northwindlog.com",
    lastSweep: "2 hours ago",
    logo: "/brand/northwind-logo.png?v=2",
    sponsor: "Meridian Capital Partners",
  },
  "Havenbrook Health": {
    domain: "havenbrook.health",
    lastSweep: "5 hours ago",
  },
  "Cascade Foods": {
    domain: "cascadefoods.com",
    lastSweep: "1 day ago",
  },
  "Orion Fabrication": {
    domain: "orionfab.com",
    lastSweep: "8 hours ago",
  },
  "Bluepoint Insurance": {
    domain: "bluepointins.com",
    lastSweep: "3 hours ago",
  },
  "Redwood Retail": {
    domain: "redwoodretail.com",
    lastSweep: "14 hours ago",
  },
  "Summit Freight": {
    domain: "summitfreight.com",
    lastSweep: "6 hours ago",
  },
  "Lumen Dental Group": {
    domain: "lumendental.com",
    lastSweep: "11 hours ago",
  },
  "Harborline Ports": {
    domain: "harborlineports.com",
    lastSweep: "4 hours ago",
  },
  "Pinecrest Hotels": {
    domain: "pinecresthotels.com",
    lastSweep: "2 days ago",
  },
  "Nimbus Payments": {
    domain: "nimbuspay.io",
    lastSweep: "90 minutes ago",
  },
  "Ironclad Steel": {
    domain: "ironcladsteel.com",
    lastSweep: "1 day ago",
  },
  "Brightlane Schools": {
    domain: "brightlaneschools.org",
    lastSweep: "7 hours ago",
  },
  "Coastal Pharma": {
    domain: "coastalpharma.com",
    lastSweep: "3 hours ago",
  },
  "Atlas Cold Storage": {
    domain: "atlascold.com",
    lastSweep: "9 hours ago",
  },
  "Velvet Commerce": {
    domain: "velvetcommerce.com",
    lastSweep: "16 hours ago",
  },
  "Keystone Advisors": {
    domain: "keystoneadv.com",
    lastSweep: "5 hours ago",
  },
  "Driftwood Energy": {
    domain: "driftwoodenergy.com",
    lastSweep: "12 hours ago",
  },
};

export const PORTFOLIO_COMPANIES: ActiveCompany[] = DEMO.portfolio.list.map((c) => {
  const extra = EXTRA[c.name] ?? {
    domain: c.name.toLowerCase().replace(/\s+/g, "") + ".com",
    lastSweep: "1 day ago",
  };
  return {
    ...c,
    domain: extra.domain,
    lastSweep: extra.lastSweep,
    logo: extra.logo,
    sponsor: extra.sponsor ?? DEMO.tenant.sponsor,
  };
});

export const DEFAULT_COMPANY =
  PORTFOLIO_COMPANIES.find((c) => c.name === "Northwind Logistics") ??
  PORTFOLIO_COMPANIES[0];
