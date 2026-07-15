import { users as fallbackUsers } from "./_components/data";
import { Users } from "./_components/users";

async function getWorkspaceUsers(activeWorkspaceId: string) {
  try {
    const { supabase } = await import("@/lib/supabase");

    // 1. Fetch Active Workspace Members with user metadata
    const { data: members, error: membersError } = await supabase
      .from("workspace_members")
      .select(`
        role,
        joined_at,
        user:user_id (
          email,
          raw_user_meta_data
        )
      `)
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
    const activeRows = (members || []).map((member: any) => {
      const userMeta = member.user?.raw_user_meta_data || {};
      return {
        name: userMeta.name || member.user?.email?.split("@")[0] || "Unknown User",
        email: member.user?.email || "",
        role: member.role === "owner" ? "Workspace Owner" : "Member",
        status: "Active" as const,
        team: userMeta.team || "Platform", // Custom metadata fallback
        workspace: ["Active Workspace"], // You can map this to their accessible entities
        joinedDate: new Date(member.joined_at).toLocaleDateString("en-GB", {
          day: "2-digit",
          month: "short",
          year: "numeric",
        }),
        lastActive: 0, // Hook up your heartbeat check here later
      };
    });

    // 4. Map Pending Invites to the UI's UserRow format
    const pendingRows = (invites || []).map((invite: any) => ({
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

  } catch (error) {
    // Graceful fallback if database tables aren't built or keys are missing
    return fallbackUsers;
  }
}

export default async function Page() {
  // Replace this hardcoded UUID with your active workspace context resolution
  const activeWorkspaceId = "00000000-0000-0000-0000-000000000000"; 
  
  const usersData = await getWorkspaceUsers(activeWorkspaceId);
  return <Users users={usersData} />;
}
