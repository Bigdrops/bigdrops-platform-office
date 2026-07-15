import { users as fallbackUsers } from "./_components/data";
import { Users } from "./_components/users";

async function getSupabaseUsers() {
  try {
    // Dynamically import to prevent build crashes if env keys are completely missing
    const { supabase } = await import("@/lib/supabase");

    const { data, error } = await supabase
      .from("profiles") // Change "profiles" to your table name when ready
      .select("*");

    if (error || !data || data.length === 0) {
      return fallbackUsers;
    }

    // Map database keys to the exact casing/format the UI components expect
    return data.map((user: any) => ({
      name: user.name || "Unknown",
      email: user.email || "",
      role: user.role || "Contributor",
      status: user.status || "Active",
      team: user.team || "Platform",
      workspace: Array.isArray(user.workspace) ? user.workspace : ["Workspace"],
      joinedDate: user.joined_date || user.joinedDate || new Date().toLocaleDateString(),
      lastActive: typeof user.last_active === "number" ? user.last_active : 0,
    }));
  } catch (e) {
    // If Supabase isn't configured or keys are missing, return the mock data safely
    return fallbackUsers;
  }
}

export default async function Page() {
  const usersData = await getSupabaseUsers();
  return <Users users={usersData} />;
}
