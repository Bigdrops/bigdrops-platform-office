"use client";
"use no memo";

import * as React from "react";

import { useRouter } from "next/navigation";

import { CheckCircle, RefreshCw } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { approveWorkspace, archiveWorkspace, suspendWorkspace } from "@/lib/services/workspace-service";
import type { LifecycleAction, LifecycleWorkspace } from "@/types/domain/workspace";

import { LifecycleAlertDialog } from "./lifecycle-actions";

const statusConfig: Record<string, { label: string; variant: "default" | "secondary" | "destructive" | "outline" }> = {
  pending_approval: { label: "Pending Approval", variant: "secondary" },
  active: { label: "Active", variant: "default" },
  suspended: { label: "Suspended", variant: "destructive" },
  archived: { label: "Archived", variant: "outline" },
};

function getValidActions(status: string): LifecycleAction[] {
  switch (status) {
    case "pending_approval":
      return ["approve"];
    case "active":
      return ["suspend", "archive"];
    case "suspended":
      return ["archive"];
    default:
      return [];
  }
}

interface LifecycleScreenProps {
  initialWorkspaces: LifecycleWorkspace[];
}

export function LifecycleScreen({ initialWorkspaces }: LifecycleScreenProps) {
  const router = useRouter();
  const [workspaces, setWorkspaces] = React.useState(initialWorkspaces);
  const [loadingIds, setLoadingIds] = React.useState<Set<string>>(new Set());

  async function handleAction(action: LifecycleAction, workspace: LifecycleWorkspace) {
    setLoadingIds((prev) => new Set(prev).add(workspace.id));
    let success = false;

    try {
      switch (action) {
        case "approve":
          success = await approveWorkspace(workspace.id, workspace.creatorUserId);
          break;
        case "suspend":
          success = await suspendWorkspace(workspace.id);
          break;
        case "archive":
          success = await archiveWorkspace(workspace.id);
          break;
      }
    } finally {
      setLoadingIds((prev) => {
        const next = new Set(prev);
        next.delete(workspace.id);
        return next;
      });
    }

    if (success) {
      setWorkspaces((prev) =>
        prev.map((w) => {
          if (w.id !== workspace.id) return w;
          switch (action) {
            case "approve":
              return { ...w, status: "active" };
            case "suspend":
              return { ...w, status: "suspended" };
            case "archive":
              return { ...w, status: "archived" };
            default:
              return w;
          }
        }),
      );
    }
  }

  function handleRefresh() {
    router.refresh();
  }

  return (
    <div className="space-y-4">
      <div className="rounded-lg border bg-background p-6">
        <p className="font-medium text-muted-foreground text-sm uppercase tracking-[0.2em]">Platform Office</p>
        <h1 className="mt-2 font-semibold text-2xl tracking-tight">Lifecycle Orchestration</h1>
        <p className="mt-2 max-w-2xl text-muted-foreground text-sm">
          Manage workspace lifecycle states — approve pending workspaces, suspend active ones, or archive them for
          cleanup.
        </p>
      </div>

      <Card>
        <CardHeader className="border-b">
          <CardTitle className="text-xl leading-none">Workspaces</CardTitle>
          <CardDescription className="max-w-sm leading-snug">
            {workspaces.length} workspace{workspaces.length !== 1 ? "s" : ""} total. Actions require confirmation.
          </CardDescription>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={handleRefresh}>
              <RefreshCw className="size-3.5" />
              Refresh
            </Button>
          </div>
        </CardHeader>
        <CardContent className="px-0">
          {workspaces.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-muted-foreground">
              <CheckCircle className="mb-3 size-8 opacity-40" />
              <p className="text-sm">No workspaces found.</p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Created</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {workspaces.map((workspace) => {
                  const statusInfo = statusConfig[workspace.status] ?? {
                    label: workspace.status,
                    variant: "outline" as const,
                  };
                  const validActions = getValidActions(workspace.status);
                  const isRowLoading = loadingIds.has(workspace.id);

                  return (
                    <TableRow key={workspace.id}>
                      <TableCell className="font-medium">{workspace.name}</TableCell>
                      <TableCell>
                        <Badge variant={statusInfo.variant}>{statusInfo.label}</Badge>
                      </TableCell>
                      <TableCell className="text-muted-foreground text-sm">
                        {workspace.createdAt
                          ? new Date(workspace.createdAt).toLocaleDateString("en-GB", {
                              day: "2-digit",
                              month: "short",
                              year: "numeric",
                            })
                          : "—"}
                      </TableCell>
                      <TableCell className="text-right">
                        {validActions.length === 0 ? (
                          <span className="text-muted-foreground text-xs">No actions</span>
                        ) : (
                          <div className="flex justify-end gap-1">
                            {validActions.map((action) => (
                              <LifecycleAlertDialog
                                key={action}
                                action={action}
                                workspaceName={workspace.name}
                                onConfirm={() => handleAction(action, workspace)}
                                disabled={isRowLoading}
                              />
                            ))}
                          </div>
                        )}
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
