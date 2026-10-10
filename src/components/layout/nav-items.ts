import {
  LayoutDashboard,
  FileText,
  Briefcase,
  BarChart3,
  Mic,
  Settings,
  type LucideIcon,
} from "lucide-react";

export interface NavItem {
  href: string;
  label: string;
  icon: LucideIcon;
}

export const NAV_ITEMS: NavItem[] = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/resumes", label: "My Resumes", icon: FileText },
  { href: "/jobs", label: "Job Descriptions", icon: Briefcase },
  { href: "/analysis", label: "Analyses", icon: BarChart3 },
  { href: "/interview", label: "Interview Prep", icon: Mic },
  { href: "/settings", label: "Settings", icon: Settings },
];
