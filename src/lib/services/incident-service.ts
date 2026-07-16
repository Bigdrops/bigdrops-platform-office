import type { IncidentSummary } from "@/types/domain/incident-types";

import { getSupabase } from "./client";

/**
 * Fetch active (unresolved) platform incidents.
 * Returns empty array if the table doesn't exist yet
 * (per PRD section 10.2 — table is "not yet defined").
 */
export async function getActiveIncidents(): Promise<IncidentSummary[]> {
  const supabase = await getSupabase();
  if (!supabase) return [];

  try {
    const { data, error } = await supabase
      .from("platform_incidents")
      .select("id, title, severity, status, created_at")
      .neq("status", "resolved")
      .order("created_at", { ascending: false });

    if (error) return [];
    return (data || []).map((i) => ({
      id: i.id,
      title: i.title,
      severity: i.severity,
      status: i.status,
      createdAt: i.created_at,
    }));
  } catch {
    return [];
  }
}
