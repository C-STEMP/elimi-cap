export interface NotificationItem {
  id: string;
  title: string;
  description: string;
  timestamp: string;
  category: "application" | "assessment" | "system" | "security";
  read: boolean;
  link?: string;
}

export const INITIAL_NOTIFICATIONS: NotificationItem[] = [
  {
    id: "notif-1",
    title: "Application Status Updated",
    description: "Your RPL Carpentry & Joinery certification application has been reviewed by QAA assessors.",
    timestamp: "10m ago",
    category: "application",
    read: false,
    link: "/dashboard/applications",
  },
  {
    id: "notif-2",
    title: "Panel Interview Scheduled",
    description: "Your technical verification interview is confirmed for July 22, 2026 at 12:00 PM.",
    timestamp: "1h ago",
    category: "assessment",
    read: false,
    link: "/dashboard",
  },
  {
    id: "notif-3",
    title: "Evidence Vault Verification",
    description: "3 practical evidence video submissions were successfully verified and tagged with NVQF Level 3.",
    timestamp: "3h ago",
    category: "assessment",
    read: false,
    link: "/dashboard/applications",
  },
  {
    id: "notif-4",
    title: "System Maintenance Notice",
    description: "Scheduled platform upgrade complete. All modular assessment portals are fully operational.",
    timestamp: "Yesterday",
    category: "system",
    read: true,
  },
  {
    id: "notif-5",
    title: "Security Login Alert",
    description: "New sign-in detected from Chrome on macOS in Lagos, Nigeria.",
    timestamp: "2 days ago",
    category: "security",
    read: true,
  },
  {
    id: "notif-6",
    title: "New Training Course Available",
    description: "Advanced Electrical Installation & Solar Wiring module is now active in your learning hub.",
    timestamp: "3 days ago",
    category: "system",
    read: true,
  },
];
