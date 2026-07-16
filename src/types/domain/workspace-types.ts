export interface WorkspaceStatusCounts {
  pendingApproval: number;
  active: number;
  suspended: number;
  archived: number;
  total: number;
}

export interface WorkspaceSummary {
  id: string;
  name: string;
  status: string;
  createdAt: string | null;
}
