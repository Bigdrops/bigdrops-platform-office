"use client";
"use no memo";

import * as React from "react";

import { useRouter } from "next/navigation";

import { AlertTriangle, CheckCircle, RefreshCw } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import {
  approveWorkspace,
  archiveWorkspace,
  recoverWorkspace,
  suspendWorkspace,
} from "@/lib/services/workspace-service";
import type { LifecycleAction, LifecycleWorkspace } from "@/types/domain/workspace";

import { LifecycleAlertDialog } from "./lifecycle-actions";

const statusConfig: Record<string, { label: string; variant: "default" | "secondary" | "destructive" | "outline" }> = {
  pending_approval: { label: "Pending Approval", variant: "secondary" },
  active: { label: "Active", variant: "default" },
  suspended: { label: "Suspended", variant: "destructive" },
  archived: { label: "Archived", variant: "outline" },
};

const validTransitions: Record<string, LifecycleAction[]> = {
  pending_approval: ["approve"],
  active: ["suspend", "archive"],
  suspended: ["recover", "archive"],
  archived: [],
};

interface LifecycleScreenProps {
  initialWorkspaces: LifecycleWorkspace[];
  error?: string;
}

export function LifecycleScreen({ initialWorkspaces, error }: LifecycleScreenProps) {
  const router = useRouter();
  const workspaces = initialWorkspaces;
  const [loadingId, setLoadingId] = React.useState<string | null>(null);
  const [actionError, setActionError] = React.useState<string | null>(null);

  async function handleAction(action: LifecycleAction, workspace: LifecycleWorkspace) {
    setLoadingId(workspace.id);
    setActionError(null);

    let success = false;
    try {
      switch (action) {
        case "approve":
          success = await approveWorkspace(workspace.id, workspace.creatorUserId);
          break;
        case "suspend":
          success = await suspendWorkspace(workspace.id);
          break;
        case "recover":
          success = await recoverWorkspace(workspace.id);
          break;
        case "archive":
          success = await archiveWorkspace(workspace.id);
          break;
      }
    } finally {
      setLoadingId(null);
    }

    if (success) {
      router.refresh();
    } else {
      setActionError("Action failed");
    }
  }

  if (error) {
    return (
      <div className="rounded-lg border border-destructive/50 bg-destructive/10 p-6 text-center">
        <AlertTriangle className="mx-auto mb-2 size-6 text-destructive" />
        <p className="text-destructive text-sm">Failed to load workspaces: {error}</p>
      </div>
    );
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

      {actionError && (
        <div className="rounded-lg border border-destructive/50 bg-destructive/10 p-3 text-destructive text-sm">
          {actionError}
        </div>
      )}

      <Card>
        <CardHeader className="border-b">
          <CardTitle className="text-xl leading-none">Workspaces</CardTitle>
          <CardDescription className="max-w-sm leading-snug">
            {workspaces.length} workspace{workspaces.length !== 1 ? "s" : ""} total. Actions require confirmation.
          </CardDescription>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={() => router.refresh()}>
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
            <>
              {/* Desktop Table */}
              <div className="hidden lg:block">
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
                      const actions = validTransitions[workspace.status] || [];
                      const isLoading = loadingId === workspace.id;
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
                            {actions.length === 0 ? (
                              <span className="text-muted-foreground text-xs">No actions</span>
                            ) : (
                              <div className="flex justify-end gap-1">
                                {actions.map((action) => (
                                  <LifecycleAlertDialog
                                    key={action}
                                    action={action}
                                    workspaceName={workspace.name}
                                    onConfirm={() => handleAction(action, workspace)}
                                    disabled={!!loadingId}
                                    loading={isLoading}
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
              </div>

              {/* Mobile Cards */}
              <div className="space-y-3 p-4 lg:hidden">
                {workspaces.map((workspace) => {
                  const statusInfo = statusConfig[workspace.status] ?? {
                    label: workspace.status,
                    variant: "outline" as const,
                  };
                  const actions = validTransitions[workspace.status] || [];
                  const isLoading = loadingId === workspace.id;
                  return (
                    <Card key={workspace.id}>
                      <CardContent className="space-y-3 p-4">
                        <div className="flex items-start justify-between">
                          <div>
                            <p className="font-medium">{workspace.name}</p>
                            <Badge variant={statusInfo.variant}>{statusInfo.label}</Badge>
                          </div>
                          <span className="text-muted-foreground text-xs">
                            {workspace.createdAt
                              ? new Date(workspace.createdAt).toLocaleDateString("en-GB", {
                                  day: "2-digit",
                                  month: "short",
                                  year: "numeric",
                                })
                              : "—"}
                          </span>
                        </div>
                        {actions.length > 0 && (
                          <div className="flex flex-wrap gap-1 border-t pt-2">
                            {actions.map((action) => (
                              <LifecycleAlertDialog
                                key={action}
                                action={action}
                                workspaceName={workspace.name}
                                onConfirm={() => handleAction(action, workspace)}
                                disabled={!!loadingId}
                                loading={isLoading}
                              />
                            ))}
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
