# Workspace Lifecycle Orchestration — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace the placeholder Lifecycle screen with a functional workspace lifecycle orchestration UI backed by Supabase RPC mutations.

**Architecture:** Extend `workspace-service.ts` with 3 mutation RPCs (`approve_workspace`, `suspend_workspace`, `archive_workspace`) and a `getAllWorkspaces` query. Build a responsive lifecycle screen using Card + Badge + AlertDialog components following existing patterns from the Users screen.

**Tech Stack:** Next.js 16 App Router, React 19, TypeScript, Tailwind CSS, shadcn/ui (Card, Badge, AlertDialog, Button, Table), Supabase JS client.

---

## File Structure

| File | Action | Responsibility |
|------|--------|---------------|
| `src/types/domain/workspace.ts` | Modify | Add `LifecycleAction` type, extend `WorkspaceSummary` with `creator_user_id` |
| `src/lib/services/workspace-service.ts` | Modify | Add `getAllWorkspaces`, `approveWorkspace`, `suspendWorkspace`, `archiveWorkspace` |
| `src/app/(main)/dashboard/lifecycle/page.tsx` | Replace | Server component — fetches data, renders LifecycleScreen |
| `src/app/(main)/dashboard/lifecycle/_components/lifecycle-screen.tsx` | Create | Client component — workspace list with actions |
| `src/app/(main)/dashboard/lifecycle/_components/lifecycle-actions.tsx` | Create | AlertDialog-based confirmation for each action |

---

### Task 1: Extend workspace domain types

**Files:**
- Modify: `src/types/domain/workspace.ts`

- [ ] **Step 1: Add lifecycle types to workspace.ts**

```typescript
// src/types/domain/workspace.ts

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

export interface LifecycleWorkspace {
  id: string;
  name: string;
  status: string;
  createdAt: string | null;
  creatorUserId: string;
}

export type LifecycleAction = "approve" | "suspend" | "archive";
```

- [ ] **Step 2: Run typecheck**

Run: `bunx tsc --noEmit`
Expected: No errors

- [ ] **Step 3: Commit**

```bash
git add src/types/domain/workspace.ts
git commit -m "feat: add LifecycleWorkspace type and LifecycleAction to workspace domain"
```

---

### Task 2: Extend workspace service with query and mutations

**Files:**
- Modify: `src/lib/services/workspace-service.ts`

- [ ] **Step 1: Add getAllWorkspaces function**

Add this function after `getPendingWorkspaces`:

```typescript
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
```

- [ ] **Step 2: Add approveWorkspace mutation**

```typescript
/**
 * Approve a pending workspace via RPC.
 * Returns true on success, false on failure.
 */
export async function approveWorkspace(
  workspaceId: string,
  creatorUserId: string,
): Promise<boolean> {
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
```

- [ ] **Step 3: Add suspendWorkspace mutation**

```typescript
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
```

- [ ] **Step 4: Add archiveWorkspace mutation**

```typescript
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
```

- [ ] **Step 5: Update imports in workspace-service.ts**

Ensure the top of the file includes `LifecycleWorkspace` in the import:

```typescript
import type {
  LifecycleWorkspace,
  WorkspaceStatusCounts,
  WorkspaceSummary,
} from "@/types/domain/workspace";
```

- [ ] **Step 6: Run typecheck**

Run: `bunx tsc --noEmit`
Expected: No errors

- [ ] **Step 7: Commit**

```bash
git add src/lib/services/workspace-service.ts
git commit -m "feat: add getAllWorkspaces query and approve/suspend/archive mutations"
```

---

### Task 3: Create lifecycle actions confirmation component

**Files:**
- Create: `src/app/(main)/dashboard/lifecycle/_components/lifecycle-actions.tsx`

- [ ] **Step 1: Create _components directory**

Run: `mkdir -p "src/app/(main)/dashboard/lifecycle/_components"`

- [ ] **Step 2: Create lifecycle-actions.tsx**

```tsx
"use client";

import { AlertTriangle, Archive, CheckCircle, Pause } from "lucide-react";

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogMedia,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import type { LifecycleAction } from "@/types/domain/workspace";

interface LifecycleActionConfig {
  label: string;
  description: string;
  icon: React.ComponentType<{ className?: string }>;
  buttonVariant: "default" | "destructive" | "outline";
  actionLabel: string;
}

const actionConfigs: Record<LifecycleAction, LifecycleActionConfig> = {
  approve: {
    label: "Approve",
    description:
      "This will activate the workspace and grant access to the creator. This action cannot be easily undone.",
    icon: CheckCircle,
    buttonVariant: "default",
    actionLabel: "Approve Workspace",
  },
  suspend: {
    label: "Suspend",
    description:
      "This will immediately suspend the workspace. All members will lose access until it is recovered.",
    icon: Pause,
    buttonVariant: "destructive",
    actionLabel: "Suspend Workspace",
  },
  archive: {
    label: "Archive",
    description:
      "This will archive the workspace. It will be removed from active views but data is preserved.",
    icon: Archive,
    buttonVariant: "destructive",
    actionLabel: "Archive Workspace",
  },
};

interface LifecycleAlertDialogProps {
  action: LifecycleAction;
  workspaceName: string;
  onConfirm: () => void;
  disabled?: boolean;
}

export function LifecycleAlertDialog({
  action,
  workspaceName,
  onConfirm,
  disabled,
}: LifecycleAlertDialogProps) {
  const config = actionConfigs[action];
  const Icon = config.icon;

  return (
    <AlertDialog>
      <AlertDialogTrigger asChild>
        <Button variant={config.buttonVariant === "default" ? "outline" : "ghost"} size="sm" disabled={disabled}>
          <Icon className="size-3.5" />
          {config.label}
        </Button>
      </AlertDialogTrigger>
      <AlertDialogContent size="sm">
        <AlertDialogHeader>
          <AlertDialogMedia>
            <Icon className="text-muted-foreground" />
          </AlertDialogMedia>
          <AlertDialogTitle>{config.actionLabel}</AlertDialogTitle>
          <AlertDialogDescription>
            Are you sure you want to {config.label.toLowerCase()} <strong>{workspaceName}</strong>?{" "}
            {config.description}
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancel</AlertDialogCancel>
          <AlertDialogAction variant={config.buttonVariant} onClick={onConfirm}>
            {config.actionLabel}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
```

- [ ] **Step 3: Run typecheck**

Run: `bunx tsc --noEmit`
Expected: No errors

- [ ] **Step 4: Commit**

```bash
git add src/app/\(main\)/dashboard/lifecycle/_components/lifecycle-actions.tsx
git commit -m "feat: add LifecycleAlertDialog confirmation component"
```

---

### Task 4: Create lifecycle screen client component

**Files:**
- Create: `src/app/(main)/dashboard/lifecycle/_components/lifecycle-screen.tsx`

- [ ] **Step 1: Create lifecycle-screen.tsx**

```tsx
"use client";
"use no memo";

import * as React from "react";

import { AlertTriangle, CheckCircle, Archive, Pause, RefreshCw } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  approveWorkspace,
  archiveWorkspace,
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
  const [workspaces, setWorkspaces] = React.useState(initialWorkspaces);
  const [loading, setLoading] = React.useState<string | null>(null);

  async function handleAction(action: LifecycleAction, workspace: LifecycleWorkspace) {
    setLoading(workspace.id);
    let success = false;

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

    setLoading(null);
  }

  function handleRefresh() {
    window.location.reload();
  }

  return (
    <div className="space-y-4">
      <div className="rounded-lg border bg-background p-6">
        <p className="font-medium text-muted-foreground text-sm uppercase tracking-[0.2em]">
          Platform Office
        </p>
        <h1 className="mt-2 font-semibold text-2xl tracking-tight">Lifecycle Orchestration</h1>
        <p className="mt-2 max-w-2xl text-muted-foreground text-sm">
          Manage workspace lifecycle states — approve pending workspaces, suspend active ones, or archive
          them for cleanup.
        </p>
      </div>

      <Card>
        <CardHeader className="border-b">
          <CardTitle className="text-xl leading-none">Workspaces</CardTitle>
          <CardDescription className="max-w-sm leading-snug">
            {workspaces.length} workspace{workspaces.length !== 1 ? "s" : ""} total. Actions require
            confirmation.
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
                  const isRowLoading = loading === workspace.id;

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
```

- [ ] **Step 2: Run typecheck**

Run: `bunx tsc --noEmit`
Expected: No errors

- [ ] **Step 3: Commit**

```bash
git add src/app/\(main\)/dashboard/lifecycle/_components/lifecycle-screen.tsx
git commit -m "feat: add LifecycleScreen client component with workspace table and actions"
```

---

### Task 5: Replace lifecycle page with functional implementation

**Files:**
- Modify: `src/app/(main)/dashboard/lifecycle/page.tsx`

- [ ] **Step 1: Replace page.tsx contents**

```tsx
import { getAllWorkspaces } from "@/lib/services/workspace-service";

import { LifecycleScreen } from "./_components/lifecycle-screen";

export default async function LifecyclePage() {
  const workspaces = await getAllWorkspaces();

  return <LifecycleScreen initialWorkspaces={workspaces} />;
}
```

- [ ] **Step 2: Run typecheck**

Run: `bunx tsc --noEmit`
Expected: No errors

- [ ] **Step 3: Run build**

Run: `bun run build`
Expected: Build succeeds with `/dashboard/lifecycle` route listed

- [ ] **Step 4: Commit**

```bash
git add src/app/\(main\)/dashboard/lifecycle/page.tsx
git commit -m "feat: replace lifecycle placeholder with functional orchestration screen"
```

---

### Task 6: Final verification and report

- [ ] **Step 1: Run full typecheck**

Run: `bunx tsc --noEmit`
Expected: No errors

- [ ] **Step 2: Run full build**

Run: `bun run build`
Expected: Build succeeds, all routes compile

- [ ] **Step 3: Verify git status**

Run: `git status`
Expected: Only intended files modified/created

- [ ] **Step 4: Write report**

Create report at `docs/Reports/architecture/2026-07-17_mimo-code_lifecycle-orchestration.md`

---

## Spec Coverage

| Requirement | Task |
|-------------|------|
| Extend workspace-service.ts with lifecycle mutations | Task 2 |
| Replace lifecycle placeholder with functional screen | Task 5 |
| List workspaces and current lifecycle state | Task 4 |
| Display only valid actions per workspace state | Task 4 (`getValidActions`) |
| Use existing shadcn/ui components | Tasks 3, 4 (Card, Badge, Table, AlertDialog) |
| AlertDialog for destructive/state-changing actions | Task 3 |
| Refresh UI after successful operations | Task 4 (optimistic state update) |
| Mobile-first behaviour | Tasks 3, 4 (responsive classes) |
| No direct Supabase access from UI | Task 5 (server component fetches, passes to client) |
| Preserve service-layer architecture | Task 2 (extends existing service) |
