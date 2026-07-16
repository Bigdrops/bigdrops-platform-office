export interface ProvisioningStatusCounts {
  pending: number;
  creating: number;
  ready: number;
  failed: number;
  purging: number;
  purged: number;
  total: number;
}

export interface FailedProvisioning {
  entityId: string;
  status: string;
  lastError: string | null;
  attemptCount: number;
  updatedAt: string | null;
}

import { getSupabase } from "./client";

/**
 * Fetch counts of entities by provisioning status.
 * Returns zeros on failure.
 */
export async function getProvisioningStatusCounts(): Promise<ProvisioningStatusCounts> {
  const empty: ProvisioningStatusCounts = {
    pending: 0,
    creating: 0,
    ready: 0,
    failed: 0,
    purging: 0,
    purged: 0,
    total: 0,
  };

  const supabase = await getSupabase();
  if (!supabase) return empty;

  try {
    const { data, error } = await supabase.from("entity_provisioning_status").select("status");

    if (error) return empty;

    const counts: ProvisioningStatusCounts = { ...empty, total: data.length };
    for (const row of data) {
      switch (row.status) {
        case "pending":
          counts.pending++;
          break;
        case "creating":
          counts.creating++;
          break;
        case "ready":
          counts.ready++;
          break;
        case "failed":
          counts.failed++;
          break;
        case "purging":
          counts.purging++;
          break;
        case "purged":
          counts.purged++;
          break;
      }
    }
    return counts;
  } catch {
    return empty;
  }
}

/**
 * Fetch failed provisioning records for monitoring.
 */
export async function getFailedProvisioning(): Promise<FailedProvisioning[]> {
  const supabase = await getSupabase();
  if (!supabase) return [];

  try {
    const { data, error } = await supabase
      .from("entity_provisioning_status")
      .select("entity_id, status, last_error, attempt_count, updated_at")
      .eq("status", "failed")
      .order("updated_at", { ascending: false });

    if (error) return [];
    return (data || []).map((p) => ({
      entityId: p.entity_id,
      status: p.status,
      lastError: p.last_error,
      attemptCount: p.attempt_count,
      updatedAt: p.updated_at,
    }));
  } catch {
    return [];
  }
}
