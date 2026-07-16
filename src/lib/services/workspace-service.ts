import type { WorkspaceStatusCounts, WorkspaceSummary } from "@/types/domain/workspace-types";

import { getSupabase } from "./client";

/**
 * Fetch counts of workspaces grouped by status.
 * Returns zeros if the table doesn't exist or query fails.
 */
export async function getWorkspaceStatusCounts(): Promise<WorkspaceStatusCounts> {
  const empty: WorkspaceStatusCounts = {
    pendingApproval: 0,
    active: 0,
    suspended: 0,
    archived: 0,
    total: 0,
  };

  const supabase = await getSupabase();
  if (!supabase) return empty;

  try {
    const { data, error } = await supabase.from("workspaces").select("status");

    if (error) return empty;

    const counts: WorkspaceStatusCounts = { ...empty, total: data.length };
    for (const row of data) {
      switch (row.status) {
        case "pending_approval":
          counts.pendingApproval++;
          break;
        case "active":
          counts.active++;
          break;
        case "suspended":
          counts.suspended++;
          break;
        case "archived":
          counts.archived++;
          break;
      }
    }
    return counts;
  } catch {
    return empty;
  }
}

/**
 * Fetch workspaces awaiting approval (pending_approval status).
 * Returns empty array on failure.
 */
export async function getPendingWorkspaces(): Promise<WorkspaceSummary[]> {
  const supabase = await getSupabase();
  if (!supabase) return [];

  try {
    const { data, error } = await supabase
      .from("workspaces")
      .select("id, name, status, created_at")
      .eq("status", "pending_approval")
      .order("created_at", { ascending: false });

    if (error) return [];
    return (data || []).map((w) => ({
      id: w.id,
      name: w.name,
      status: w.status,
      createdAt: w.created_at,
    }));
  } catch {
    return [];
  }
}
