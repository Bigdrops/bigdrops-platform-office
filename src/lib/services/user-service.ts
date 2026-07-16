import type { UserRow } from "@/app/(main)/dashboard/users/_components/data";

import { getSupabase } from "./client";

// Fallback data used when the database tables aren't available
const fallbackUsers: UserRow[] = [
  {
    name: "Olivia Rhye",
    email: "olivia.rhye@weblabs.studio",
    role: "Workspace Owner",
    status: "Active",
    team: "Platform",
    workspace: ["Weblabs Studio", "Internal Tools"],
    joinedDate: "24 Jun 2024, 9:23 AM",
    lastActive: 0,
  },
  {
    name: "Phoenix Baker",
    email: "phoenix.baker@weblabs.studio",
    role: "Admin",
    status: "Active",
    team: "Growth",
    workspace: ["Weblabs Studio"],
    joinedDate: "15 Mar 2023, 2:45 PM",
    lastActive: 5,
  },
  {
    name: "Lana Steiner",
    email: "lana.steiner@acme.inc",
    role: "Billing Admin",
    status: "Active",
    team: "Revenue",
    workspace: ["Acme Inc."],
    joinedDate: "10 Apr 2022, 11:30 AM",
    lastActive: 14 * 24 * 60,
  },
  {
    name: "Demi Wilkinson",
    email: "demi.wilkinson@weblabs.studio",
    role: "Security Admin",
    status: "Locked",
    team: "Internal Tools",
    workspace: ["Weblabs Studio", "Internal Tools"],
    joinedDate: "28 Feb 2023, 6:15 PM",
    lastActive: 60,
  },
  {
    name: "Candice Wu",
    email: "candice.wu@sandbox.dev",
    role: "Team Lead",
    status: "Active",
    team: "Customer Ops",
    workspace: ["Sandbox"],
    joinedDate: "19 May 2024, 7:55 AM",
    lastActive: 2 * 60,
  },
  {
    name: "Natali Craig",
    email: "natali.craig@weblabs.studio",
    role: "Contributor",
    status: "Pending invite",
    team: "Compliance",
    workspace: ["Weblabs Studio"],
    joinedDate: "03 Jan 2024, 12:05 PM",
    lastActive: 90 * 24 * 60,
  },
  {
    name: "Drew Cano",
    email: "drew.cano@internal.tools",
    role: "Guest",
    status: "Active",
    team: "Internal Tools",
    workspace: ["Internal Tools"],
    joinedDate: "21 Jul 2023, 8:40 PM",
    lastActive: 3 * 60,
  },
  {
    name: "Orlando Diggs",
    email: "orlando.diggs@acme.inc",
    role: "Read-only",
    status: "Deactivated",
    team: "Revenue",
    workspace: ["Acme Inc."],
    joinedDate: "16 Sep 2023, 3:25 PM",
    lastActive: 6,
  },
  {
    name: "Andi Lane",
    email: "andi.lane@weblabs.studio",
    role: "Contributor",
    status: "Active",
    team: "People Ops",
    workspace: ["Weblabs Studio", "Sandbox"],
    joinedDate: "04 Nov 2022, 9:50 AM",
    lastActive: 12,
  },
  {
    name: "Kate Morrison",
    email: "kate.morrison@weblabs.studio",
    role: "Admin",
    status: "Active",
    team: "Platform",
    workspace: ["Weblabs Studio"],
    joinedDate: "30 Dec 2023, 4:35 PM",
    lastActive: 30,
  },
  {
    name: "Alec Whitten",
    email: "alec.whitten@internal.tools",
    role: "Team Lead",
    status: "Suspended",
    team: "Internal Tools",
    workspace: ["Internal Tools"],
    joinedDate: "12 Feb 2024, 10:20 AM",
    lastActive: 8 * 24 * 60,
  },
  {
    name: "Ariana Decker",
    email: "ariana.decker@weblabs.studio",
    role: "Contributor",
    status: "Active",
    team: "Growth",
    workspace: ["Weblabs Studio"],
    joinedDate: "08 Aug 2023, 1:10 PM",
    lastActive: 24 * 60,
  },
  {
    name: "Steven Tey",
    email: "steven.tey@sandbox.dev",
    role: "Guest",
    status: "Pending invite",
    team: "Customer Ops",
    workspace: ["Sandbox"],
    joinedDate: "17 Jan 2024, 5:45 PM",
    lastActive: 90 * 24 * 60,
  },
  {
    name: "Lori Bryson",
    email: "lori.bryson@acme.inc",
    role: "Billing Admin",
    status: "Active",
    team: "Finance",
    workspace: ["Acme Inc."],
    joinedDate: "02 Oct 2023, 11:15 AM",
    lastActive: 45,
  },
  {
    name: "Koray Okumus",
    email: "koray.okumus@weblabs.studio",
    role: "Security Admin",
    status: "Active",
    team: "Internal Tools",
    workspace: ["Weblabs Studio", "Internal Tools"],
    joinedDate: "22 May 2024, 8:30 AM",
    lastActive: 10,
  },
  {
    name: "Josh Miller",
    email: "josh.miller@internal.tools",
    role: "Read-only",
    status: "Active",
    team: "Compliance",
    workspace: ["Internal Tools"],
    joinedDate: "14 Jul 2023, 6:05 PM",
    lastActive: 4 * 60,
  },
  {
    name: "Mollie Hall",
    email: "mollie.hall@weblabs.studio",
    role: "Contributor",
    status: "Deactivated",
    team: "Platform",
    workspace: ["Weblabs Studio"],
    joinedDate: "26 Nov 2022, 3:40 PM",
    lastActive: 21 * 24 * 60,
  },
  {
    name: "Rene Wells",
    email: "rene.wells@acme.inc",
    role: "Team Lead",
    status: "Active",
    team: "Revenue",
    workspace: ["Acme Inc."],
    joinedDate: "11 Apr 2024, 9:05 AM",
    lastActive: 18,
  },
  {
    name: "Rylee Howard",
    email: "rylee.howard@sandbox.dev",
    role: "Guest",
    status: "Locked",
    team: "Growth",
    workspace: ["Sandbox"],
    joinedDate: "09 Sep 2023, 12:25 PM",
    lastActive: 2 * 24 * 60,
  },
  {
    name: "Sienna Hewitt",
    email: "sienna.hewitt@weblabs.studio",
    role: "Admin",
    status: "Active",
    team: "Internal Tools",
    workspace: ["Weblabs Studio", "Internal Tools"],
    joinedDate: "05 Dec 2023, 2:15 PM",
    lastActive: 0,
  },
  {
    name: "Noah Pierre",
    email: "noah.pierre@weblabs.studio",
    role: "Contributor",
    status: "Active",
    team: "Platform",
    workspace: ["Weblabs Studio"],
    joinedDate: "18 Jun 2024, 4:50 PM",
    lastActive: 7,
  },
  {
    name: "Eve Lechner",
    email: "eve.lechner@acme.inc",
    role: "Read-only",
    status: "Suspended",
    team: "Finance",
    workspace: ["Acme Inc."],
    joinedDate: "01 Mar 2023, 10:10 AM",
    lastActive: 30 * 24 * 60,
  },
  {
    name: "Zahir McClure",
    email: "zahir.mcclure@internal.tools",
    role: "Security Admin",
    status: "Active",
    team: "Internal Tools",
    workspace: ["Internal Tools"],
    joinedDate: "07 Feb 2024, 7:20 PM",
    lastActive: 60,
  },
  {
    name: "Mia Romberg",
    email: "mia.romberg@weblabs.studio",
    role: "Billing Admin",
    status: "Pending invite",
    team: "Finance",
    workspace: ["Weblabs Studio"],
    joinedDate: "29 Apr 2024, 11:55 AM",
    lastActive: 90 * 24 * 60,
  },
  {
    name: "Nico Arendt",
    email: "nico.arendt@sandbox.dev",
    role: "Contributor",
    status: "Active",
    team: "Customer Ops",
    workspace: ["Sandbox", "Internal Tools"],
    joinedDate: "13 May 2024, 6:35 PM",
    lastActive: 25,
  },
];

/**
 * Fetch workspace users for a given workspace ID.
 * Queries workspace_members and workspace_invitations,
 * then merges into the UI's UserRow format.
 * Falls back to static data if database is unavailable.
 */
export async function getWorkspaceUsers(activeWorkspaceId: string): Promise<UserRow[]> {
  const supabase = await getSupabase();
  if (!supabase) return fallbackUsers;

  try {
    // 1. Fetch Active Workspace Members with user metadata
    const { data: members, error: membersError } = await supabase
      .from("workspace_members")
      .select(
        `
        role,
        joined_at,
        user:user_id (
          email,
          raw_user_meta_data
        )
      `,
      )
      .eq("workspace_id", activeWorkspaceId);

    if (membersError) throw membersError;

    // 2. Fetch Pending Invitations for this workspace
    const { data: invites, error: invitesError } = await supabase
      .from("workspace_invitations")
      .select("email, workspace_role, created_at, status")
      .eq("workspace_id", activeWorkspaceId)
      .eq("status", "pending");

    if (invitesError) throw invitesError;

    // 3. Map Active Members to the UI's UserRow format
    const activeRows: UserRow[] = (members || []).map((member: any) => {
      const userMeta = member.user?.raw_user_meta_data || {};
      return {
        name: userMeta.name || member.user?.email?.split("@")[0] || "Unknown User",
        email: member.user?.email || "",
        role: member.role === "owner" ? "Workspace Owner" : "Member",
        status: "Active" as const,
        team: userMeta.team || "Platform",
        workspace: ["Active Workspace"],
        joinedDate: new Date(member.joined_at).toLocaleDateString("en-GB", {
          day: "2-digit",
          month: "short",
          year: "numeric",
        }),
        lastActive: 0,
      };
    });

    // 4. Map Pending Invites to the UI's UserRow format
    const pendingRows: UserRow[] = (invites || []).map((invite: any) => ({
      name: invite.email.split("@")[0],
      email: invite.email,
      role: invite.workspace_role === "owner" ? "Workspace Owner" : "Member",
      status: "Pending invite" as const,
      team: "Platform" as const,
      workspace: ["Invited to Workspace"],
      joinedDate: new Date(invite.created_at).toLocaleDateString("en-GB", {
        day: "2-digit",
        month: "short",
        year: "numeric",
      }),
      lastActive: 0,
    }));

    const allUsers = [...activeRows, ...pendingRows];
    return allUsers.length > 0 ? allUsers : fallbackUsers;
  } catch {
    // Graceful fallback if database tables aren't built or keys are missing
    return fallbackUsers;
  }
}
