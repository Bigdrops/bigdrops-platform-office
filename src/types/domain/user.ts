export type UserStatus = "Active" | "Pending invite" | "Deactivated" | "Locked" | "Suspended";

export const USER_TEAM_VALUES = [
  "Platform",
  "Growth",
  "Revenue",
  "Customer Ops",
  "Internal Tools",
  "Compliance",
  "People Ops",
  "Finance",
] as const;

export type UserTeam = (typeof USER_TEAM_VALUES)[number];

export type UserRow = {
  email: string;
  joinedDate: string;
  lastActive: number;
  name: string;
  role: string;
  status: UserStatus;
  team: UserTeam;
  workspace: string[];
};
