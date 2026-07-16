import { getWorkspaceUsers } from "@/lib/services/user-service";

import { Users } from "./_components/users";

export default async function Page() {
  // ponytail: hardcoded workspace ID — resolve from active workspace context when implemented
  const activeWorkspaceId = "00000000-0000-0000-0000-000000000000";

  const usersData = await getWorkspaceUsers(activeWorkspaceId);
  return <Users users={usersData} />;
}
