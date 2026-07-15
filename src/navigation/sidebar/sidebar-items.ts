import {
  Activity,
  AlertTriangle,
  FileText,
  LayoutDashboard,
  type LucideIcon,
  ShieldCheck,
  Workflow,
} from "lucide-react";

export type NavBadge = "new" | "soon";

export interface NavSubItem {
  id: string;
  title: string;
  url: string;
  icon?: LucideIcon;
  badge?: NavBadge;
  disabled?: boolean;
  newTab?: boolean;
}

interface NavItemBase {
  id: string;
  title: string;
  icon?: LucideIcon;
  badge?: NavBadge;
  disabled?: boolean;
  newTab?: boolean;
}

export interface NavMainLinkItem extends NavItemBase {
  url: string;
  subItems?: never;
}

export interface NavMainParentItem extends NavItemBase {
  subItems: NavSubItem[];
}

export type NavMainItem = NavMainLinkItem | NavMainParentItem;

export interface NavGroup {
  id: number;
  label?: string;
  items: NavMainItem[];
}

export const sidebarItems: NavGroup[] = [
  {
    id: 1,
    label: "Platform Operations",
    items: [
      {
        id: "overview",
        title: "Platform Overview",
        url: "/dashboard/overview",
        icon: LayoutDashboard,
      },
      {
        id: "lifecycle",
        title: "Lifecycle Orchestration",
        url: "/dashboard/lifecycle",
        icon: Workflow,
      },
      {
        id: "provisioning",
        title: "Provisioning Status",
        url: "/dashboard/provisioning",
        icon: Activity,
      },
      {
        id: "incidents",
        title: "Incidents & Alerts",
        url: "/dashboard/incidents",
        icon: AlertTriangle,
      },
      {
        id: "entitlements",
        title: "Entitlements & Overrides",
        url: "/dashboard/entitlements",
        icon: ShieldCheck,
      },
      {
        id: "audit",
        title: "Audit & Compliance",
        url: "/dashboard/audit",
        icon: FileText,
      },
    ],
  },
];
