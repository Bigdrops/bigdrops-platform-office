import { AlertTriangle, CheckCircle2, Clock, Users } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Empty, EmptyContent, EmptyDescription, EmptyHeader, EmptyMedia, EmptyTitle } from "@/components/ui/empty";
import { Separator } from "@/components/ui/separator";
import { getActiveIncidents } from "@/lib/services/incident-service";
import { getFailedProvisioning, getProvisioningStatusCounts } from "@/lib/services/provisioning-service";
import { getPendingWorkspaces, getWorkspaceStatusCounts } from "@/lib/services/workspace-service";

function KpiCard({
  icon: Icon,
  label,
  value,
  trend,
  variant = "default",
}: {
  icon: React.ComponentType<React.SVGProps<SVGSVGElement>>;
  label: string;
  value: number | string;
  trend?: { label: string; positive?: boolean };
  variant?: "default" | "warning" | "danger" | "success";
}) {
  const variantStyles = {
    default: "text-muted-foreground",
    warning: "text-amber-600 dark:text-amber-400",
    danger: "text-destructive",
    success: "text-emerald-600 dark:text-emerald-400",
  };

  return (
    <Card size="sm">
      <CardHeader className="flex flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-2">
          <div className="flex size-8 items-center justify-center rounded-lg bg-muted">
            <Icon className={`size-4 ${variantStyles[variant]}`} />
          </div>
          <CardDescription className="font-medium text-xs uppercase tracking-wider">{label}</CardDescription>
        </div>
      </CardHeader>
      <CardContent className="flex items-end justify-between">
        <div className="font-semibold text-3xl tabular-nums tracking-tight">{value}</div>
        {trend ? (
          <span
            className={`text-xs tabular-nums ${
              trend.positive ? "text-emerald-600 dark:text-emerald-400" : "text-destructive"
            }`}
          >
            {trend.label}
          </span>
        ) : null}
      </CardContent>
    </Card>
  );
}

function StatusDot({ severity }: { severity: string }) {
  const colors: Record<string, string> = {
    critical: "bg-red-500",
    high: "bg-orange-500",
    medium: "bg-amber-500",
    low: "bg-blue-500",
  };
  return <span className={`inline-block size-2 rounded-full ${colors[severity] ?? "bg-muted-foreground"}`} />;
}

export default async function OverviewPage() {
  const [workspaceCounts, provisioningCounts, activeIncidents, pendingWorkspaces, failedProvisioning] =
    await Promise.all([
      getWorkspaceStatusCounts(),
      getProvisioningStatusCounts(),
      getActiveIncidents(),
      getPendingWorkspaces(),
      getFailedProvisioning(),
    ]);

  const hasIncidents = activeIncidents.length > 0;
  const hasPendingWorkspaces = pendingWorkspaces.length > 0;
  const hasFailedProvisioning = failedProvisioning.length > 0;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-1">
        <p className="font-medium text-muted-foreground text-xs uppercase tracking-[0.2em]">Platform Office</p>
        <h1 className="font-semibold text-2xl tracking-tight">Platform Overview</h1>
        <p className="max-w-2xl text-muted-foreground text-sm">
          NOC dashboard — system health, workspace orchestration, and active alerts.
        </p>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 gap-3 md:grid-cols-4 md:gap-4">
        <KpiCard
          icon={Users}
          label="Active Workspaces"
          value={workspaceCounts.active}
          variant="success"
          trend={
            workspaceCounts.total > 0
              ? {
                  label: `${workspaceCounts.total} total`,
                  positive: true,
                }
              : undefined
          }
        />
        <KpiCard
          icon={Clock}
          label="Pending Approval"
          value={workspaceCounts.pendingApproval}
          variant="warning"
          trend={workspaceCounts.pendingApproval > 0 ? { label: "Requires action", positive: false } : undefined}
        />
        <KpiCard icon={AlertTriangle} label="Failed Provisioning" value={provisioningCounts.failed} variant="danger" />
        <KpiCard icon={CheckCircle2} label="Provisioned" value={provisioningCounts.ready} variant="success" />
      </div>

      {/* Orchestration Monitor */}
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        {/* Pending Workspaces */}
        <Card>
          <CardHeader>
            <CardTitle>Workspaces Awaiting Approval</CardTitle>
            <CardDescription>
              {hasPendingWorkspaces
                ? `${pendingWorkspaces.length} workspace${pendingWorkspaces.length !== 1 ? "s" : ""} in pending_approval state`
                : "No workspaces awaiting approval"}
            </CardDescription>
          </CardHeader>
          <Separator />
          <CardContent className="px-0">
            {hasPendingWorkspaces ? (
              <div className="divide-y">
                {pendingWorkspaces.map((ws) => (
                  <div key={ws.id} className="flex items-center justify-between px-4 py-3 text-sm">
                    <span className="truncate font-medium">{ws.name}</span>
                    <Badge
                      variant="outline"
                      className="shrink-0 border-amber-500/20 bg-amber-500/10 text-amber-600 dark:text-amber-400"
                    >
                      <span className="mr-1 inline-block size-1.5 rounded-full bg-amber-500" />
                      Pending
                    </Badge>
                  </div>
                ))}
              </div>
            ) : (
              <div className="px-4">
                <Empty>
                  <EmptyHeader>
                    <EmptyMedia variant="icon">
                      <CheckCircle2 className="size-4" />
                    </EmptyMedia>
                    <EmptyTitle>All caught up</EmptyTitle>
                  </EmptyHeader>
                  <EmptyContent>
                    <EmptyDescription>
                      No workspaces are currently awaiting approval. New workspace requests will appear here.
                    </EmptyDescription>
                  </EmptyContent>
                </Empty>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Failed Provisioning */}
        <Card>
          <CardHeader>
            <CardTitle>Failed Provisioning</CardTitle>
            <CardDescription>
              {hasFailedProvisioning
                ? `${failedProvisioning.length} ${failedProvisioning.length === 1 ? "entity" : "entities"} with provisioning errors`
                : "No provisioning failures detected"}
            </CardDescription>
          </CardHeader>
          <Separator />
          <CardContent className="px-0">
            {hasFailedProvisioning ? (
              <div className="divide-y">
                {failedProvisioning.map((p) => (
                  <div key={p.entityId} className="space-y-1 px-4 py-3 text-sm">
                    <div className="flex items-center justify-between">
                      <span className="truncate font-mono text-xs text-muted-foreground">
                        {p.entityId.slice(0, 8)}…
                      </span>
                      <span className="text-muted-foreground text-xs tabular-nums">Attempt {p.attemptCount}</span>
                    </div>
                    {p.lastError ? <p className="line-clamp-2 text-destructive text-xs">{p.lastError}</p> : null}
                  </div>
                ))}
              </div>
            ) : (
              <div className="px-4">
                <Empty>
                  <EmptyHeader>
                    <EmptyMedia variant="icon">
                      <CheckCircle2 className="size-4" />
                    </EmptyMedia>
                    <EmptyTitle>No failures</EmptyTitle>
                  </EmptyHeader>
                  <EmptyContent>
                    <EmptyDescription>All provisioning pipelines are running normally.</EmptyDescription>
                  </EmptyContent>
                </Empty>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Active Incidents */}
      <Card>
        <CardHeader>
          <CardTitle>Active Incidents</CardTitle>
          <CardDescription>
            {hasIncidents
              ? `${activeIncidents.length} unresolved incident${activeIncidents.length !== 1 ? "s" : ""}`
              : "No active incidents"}
          </CardDescription>
        </CardHeader>
        <Separator />
        <CardContent className="px-0">
          {hasIncidents ? (
            <div className="divide-y">
              {activeIncidents.map((incident) => (
                <div key={incident.id} className="flex items-center justify-between px-4 py-3 text-sm">
                  <div className="flex min-w-0 items-center gap-3">
                    <StatusDot severity={incident.severity} />
                    <span className="truncate font-medium">{incident.title}</span>
                  </div>
                  <Badge
                    variant="outline"
                    className={`shrink-0 ${
                      incident.severity === "critical"
                        ? "border-red-500/20 bg-red-500/10 text-red-600 dark:text-red-400"
                        : incident.severity === "high"
                          ? "border-orange-500/20 bg-orange-500/10 text-orange-600 dark:text-orange-400"
                          : "border-border bg-muted/50 text-muted-foreground"
                    }`}
                  >
                    {incident.severity}
                  </Badge>
                </div>
              ))}
            </div>
          ) : (
            <div className="px-4">
              <Empty>
                <EmptyHeader>
                  <EmptyMedia variant="icon">
                    <CheckCircle2 className="size-4" />
                  </EmptyMedia>
                  <EmptyTitle>Platform healthy</EmptyTitle>
                </EmptyHeader>
                <EmptyContent>
                  <EmptyDescription>
                    <strong>Note:</strong> The{" "}
                    <code className="rounded bg-muted px-1 py-0.5 text-xs font-mono">public.platform_incidents</code>{" "}
                    table is not yet defined. Active incidents will appear here once the schema is available.
                  </EmptyDescription>
                </EmptyContent>
              </Empty>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
