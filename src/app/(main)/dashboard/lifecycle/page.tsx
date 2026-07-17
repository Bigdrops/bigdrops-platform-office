import { getAllWorkspaces } from "@/lib/services/workspace-service";

import { LifecycleScreen } from "./_components/lifecycle-screen";

export default async function LifecyclePage() {
  const workspaces = await getAllWorkspaces();

  return <LifecycleScreen initialWorkspaces={workspaces} />;
}
