import type { LifecycleWorkspace, WorkspaceStatusCounts, WorkspaceSummary } from "@/types/domain/workspace";

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

/**
 * Fetch all workspaces for lifecycle management.
 * Returns empty array on failure.
 */
export async function getAllWorkspaces(): Promise<LifecycleWorkspace[]> {
  const supabase = await getSupabase();
  if (!supabase) return [];

  try {
    const { data, error } = await supabase
      .from("workspaces")
      .select("id, name, status, created_at, creator_user_id")
      .order("created_at", { ascending: false });

    if (error) return [];
    return (data || []).map((w) => ({
      id: w.id,
      name: w.name,
      status: w.status,
      createdAt: w.created_at,
      creatorUserId: w.creator_user_id,
    }));
  } catch {
    return [];
  }
}

/**
 * Approve a pending workspace via RPC.
 * Returns true on success, false on failure.
 */
export async function approveWorkspace(workspaceId: string, creatorUserId: string): Promise<boolean> {
  const supabase = await getSupabase();
  if (!supabase) return false;

  try {
    const { error } = await supabase.rpc("approve_workspace", {
      p_workspace_id: workspaceId,
      p_creator_user_id: creatorUserId,
    });
    return !error;
  } catch {
    return false;
  }
}

/**
 * Suspend an active workspace via RPC.
 * Returns true on success, false on failure.
 */
export async function suspendWorkspace(workspaceId: string): Promise<boolean> {
  const supabase = await getSupabase();
  if (!supabase) return false;

  try {
    const { error } = await supabase.rpc("suspend_workspace", {
      p_workspace_id: workspaceId,
    });
    return !error;
  } catch {
    return false;
  }
}

/**
 * Archive a workspace via RPC.
 * Returns true on success, false on failure.
 */
export async function archiveWorkspace(workspaceId: string): Promise<boolean> {
  const supabase = await getSupabase();
  if (!supabase) return false;

  try {
    const { error } = await supabase.rpc("archive_workspace", {
      p_workspace_id: workspaceId,
    });
    return !error;
  } catch {
    return false;
  }
}
