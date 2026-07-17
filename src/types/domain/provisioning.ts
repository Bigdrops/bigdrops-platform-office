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
