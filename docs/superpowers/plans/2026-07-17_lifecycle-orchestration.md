Here's the updated Workspace Lifecycle Orchestration — Implementation Plan with all feedback incorporated.

---

```markdown
# Workspace Lifecycle Orchestration — Implementation Plan

**For agentic workers:** REQUIRED SUB-SKILL: Use `superpowers:subagent-driven-development` (recommended) or `superpowers:executing-plans` to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace the placeholder Lifecycle screen with a functional workspace lifecycle orchestration UI backed by Supabase RPC mutations.

**Architecture:** Extend `workspace-service.ts` with 4 mutation RPCs (`approve_workspace`, `suspend_workspace`, `recover_workspace`, `archive_workspace`) and a `getAllWorkspaces` query. Build a responsive lifecycle screen with desktop Table + mobile Cards, using AlertDialog for confirmations. RPCs own authorization and audit logging — service layer simply calls them.

**Tech Stack:** Next.js 16 App Router, React 19, TypeScript, Tailwind CSS, shadcn/ui (Card, Badge, AlertDialog, Button, Table), Supabase JS client, `useRouter` from `next/navigation`.

---

## File Structure

| File | Action | Responsibility |
|------|--------|----------------|
| `src/types/domain/workspace.ts` | Modify | Add `LifecycleAction` type (approve, suspend, recover, archive), extend `WorkspaceSummary` with `creatorUserId` |
| `src/lib/services/workspace-service.ts` | Modify | Add `getAllWorkspaces` query + mutations returning `{ success, error? }` |
| `src/app/(main)/dashboard/lifecycle/page.tsx` | Replace | Server component — fetches data, renders `LifecycleScreen` |
| `src/app/(main)/dashboard/lifecycle/_components/lifecycle-screen.tsx` | Create | Client component — workspace list with desktop table + mobile cards |
| `src/app/(main)/dashboard/lifecycle/_components/lifecycle-actions.tsx` | Create | AlertDialog-based confirmation for each action |

---

## Task 1: Extend workspace domain types

**Files:** Modify `src/types/domain/workspace.ts`

- [ ] **Step 1:** Add lifecycle types to `workspace.ts`

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

// Extend WorkspaceSummary rather than creating a separate type if only one field differs.
// For lifecycle, we need creatorUserId, so we extend.
export interface WorkspaceLifecycle extends WorkspaceSummary {
  creatorUserId: string;
}

export type LifecycleAction = 'approve' | 'suspend' | 'recover' | 'archive';
```

· Step 2: Run typecheck: bunx tsc --noEmit — expected: no errors
· Step 3: Commit

```bash
git add src/types/domain/workspace.ts
git commit -m "feat: add LifecycleAction type and WorkspaceLifecycle interface"
```

---

Task 2: Extend workspace service with query and mutations

Files: Modify src/lib/services/workspace-service.ts

· Step 1: Add getAllWorkspaces function

```typescript
import type { WorkspaceLifecycle } from '@/types/domain/workspace';

/**
 * Fetch all workspaces for lifecycle management.
 * Returns empty array on failure.
 */
export async function getAllWorkspaces(): Promise<WorkspaceLifecycle[]> {
  const supabase = await getSupabase();
  if (!supabase) return [];

  try {
    const { data, error } = await supabase
      .from('workspaces')
      .select('id, name, status, created_at, creator_user_id')
      .order('created_at', { ascending: false });

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

· Step 2: Add mutation helpers with ServiceResult type

```typescript
type ServiceResult = { success: boolean; error?: string };

export async function approveWorkspace(
  workspaceId: string,
  creatorUserId: string
): Promise<ServiceResult> {
  const supabase = await getSupabase();
  if (!supabase) return { success: false, error: 'Supabase client unavailable' };

  try {
    const { error } = await supabase.rpc('approve_workspace', {
      p_workspace_id: workspaceId,
      p_creator_user_id: creatorUserId,
    });
    if (error) return { success: false, error: error.message };
    return { success: true };
  } catch (err) {
    return { success: false, error: String(err) };
  }
}

export async function suspendWorkspace(workspaceId: string): Promise<ServiceResult> {
  const supabase = await getSupabase();
  if (!supabase) return { success: false, error: 'Supabase client unavailable' };

  try {
    const { error } = await supabase.rpc('suspend_workspace', {
      p_workspace_id: workspaceId,
    });
    if (error) return { success: false, error: error.message };
    return { success: true };
  } catch (err) {
    return { success: false, error: String(err) };
  }
}

export async function recoverWorkspace(workspaceId: string): Promise<ServiceResult> {
  const supabase = await getSupabase();
  if (!supabase) return { success: false, error: 'Supabase client unavailable' };

  try {
    const { error } = await supabase.rpc('recover_workspace', {
      p_workspace_id: workspaceId,
    });
    if (error) return { success: false, error: error.message };
    return { success: true };
  } catch (err) {
    return { success: false, error: String(err) };
  }
}

export async function archiveWorkspace(workspaceId: string): Promise<ServiceResult> {
  const supabase = await getSupabase();
  if (!supabase) return { success: false, error: 'Supabase client unavailable' };

  try {
    const { error } = await supabase.rpc('archive_workspace', {
      p_workspace_id: workspaceId,
    });
    if (error) return { success: false, error: error.message };
    return { success: true };
  } catch (err) {
    return { success: false, error: String(err) };
  }
}
```

· Step 3: Update imports in workspace-service.ts

```typescript
import type { WorkspaceLifecycle, WorkspaceStatusCounts, WorkspaceSummary } from '@/types/domain/workspace';
```

· Step 4: Run typecheck: bunx tsc --noEmit — expected: no errors
· Step 5: Commit

```bash
git add src/lib/services/workspace-service.ts
git commit -m "feat: add getAllWorkspaces query and approve/suspend/recover/archive mutations"
```

---

Task 3: Create lifecycle actions confirmation component

Files: Create src/app/(main)/dashboard/lifecycle/_components/lifecycle-actions.tsx

· Step 1: Create _components directory

```bash
mkdir -p "src/app/(main)/dashboard/lifecycle/_components"
```

· Step 2: Create lifecycle-actions.tsx

```tsx
'use client';

import { AlertTriangle, Archive, CheckCircle, Pause, RefreshCw } from 'lucide-react';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogMedia, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { Button } from '@/components/ui/button';
import type { LifecycleAction } from '@/types/domain/workspace';

interface LifecycleActionConfig {
  label: string;
  description: string;
  icon: React.ComponentType<{ className?: string }>;
  buttonVariant: 'default' | 'destructive' | 'outline';
  actionLabel: string;
}

const actionConfigs: Record<LifecycleAction, LifecycleActionConfig> = {
  approve: {
    label: 'Approve',
    description: 'This will activate the workspace and grant access to the creator. This action cannot be easily undone.',
    icon: CheckCircle,
    buttonVariant: 'default',
    actionLabel: 'Approve Workspace',
  },
  suspend: {
    label: 'Suspend',
    description: 'This will immediately suspend the workspace. All members will lose access until it is recovered.',
    icon: Pause,
    buttonVariant: 'destructive',
    actionLabel: 'Suspend Workspace',
  },
  recover: {
    label: 'Recover',
    description: 'This will restore a suspended workspace to active status.',
    icon: RefreshCw,
    buttonVariant: 'default',
    actionLabel: 'Recover Workspace',
  },
  archive: {
    label: 'Archive',
    description: 'This will archive the workspace. It will be removed from active views but data is preserved.',
    icon: Archive,
    buttonVariant: 'destructive',
    actionLabel: 'Archive Workspace',
  },
};

interface LifecycleAlertDialogProps {
  action: LifecycleAction;
  workspaceName: string;
  onConfirm: () => void;
  disabled?: boolean;
  loading?: boolean;
}

export function LifecycleAlertDialog({
  action,
  workspaceName,
  onConfirm,
  disabled = false,
  loading = false,
}: LifecycleAlertDialogProps) {
  const config = actionConfigs[action];
  const Icon = config.icon;

  return (
    <AlertDialog>
      <AlertDialogTrigger asChild>
        <Button
          variant={config.buttonVariant === 'default' ? 'outline' : 'ghost'}
          size="sm"
          disabled={disabled || loading}
        >
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
            Are you sure you want to {config.label.toLowerCase()} <strong>{workspaceName}</strong>?{' '}
            {config.description}
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancel</AlertDialogCancel>
          <AlertDialogAction
            variant={config.buttonVariant}
            onClick={onConfirm}
            disabled={loading}
          >
            {loading ? 'Processing...' : config.actionLabel}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
```

· Step 3: Run typecheck: bunx tsc --noEmit — expected: no errors
· Step 4: Commit

```bash
git add src/app/\(main\)/dashboard/lifecycle/_components/lifecycle-actions.tsx
git commit -m "feat: add LifecycleAlertDialog confirmation component"
```

---

Task 4: Create lifecycle screen client component

Files: Create src/app/(main)/dashboard/lifecycle/_components/lifecycle-screen.tsx

· Step 1: Create lifecycle-screen.tsx

```tsx
'use client';

import * as React from 'react';
import { useRouter } from 'next/navigation';
import { AlertTriangle, CheckCircle, Archive, Pause, RefreshCw } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { approveWorkspace, archiveWorkspace, recoverWorkspace, suspendWorkspace } from '@/lib/services/workspace-service';
import type { LifecycleAction, WorkspaceLifecycle } from '@/types/domain/workspace';
import { LifecycleAlertDialog } from './lifecycle-actions';

// Reuse badge status mapping from existing screens if possible.
// If no central mapping exists yet, define one here.
const statusConfig: Record<string, { label: string; variant: 'default' | 'secondary' | 'destructive' | 'outline' }> = {
  pending_approval: { label: 'Pending Approval', variant: 'secondary' },
  active: { label: 'Active', variant: 'default' },
  suspended: { label: 'Suspended', variant: 'destructive' },
  archived: { label: 'Archived', variant: 'outline' },
};

// Transition map — clear, extensible.
const validTransitions: Record<string, LifecycleAction[]> = {
  pending_approval: ['approve'],
  active: ['suspend', 'archive'],
  suspended: ['recover', 'archive'],
  archived: [],
};

interface LifecycleScreenProps {
  initialWorkspaces: WorkspaceLifecycle[];
  error?: string;
}

export function LifecycleScreen({ initialWorkspaces, error }: LifecycleScreenProps) {
  const router = useRouter();
  const [workspaces, setWorkspaces] = React.useState(initialWorkspaces);
  const [loadingId, setLoadingId] = React.useState<string | null>(null);
  const [actionError, setActionError] = React.useState<string | null>(null);

  async function handleAction(action: LifecycleAction, workspace: WorkspaceLifecycle) {
    setLoadingId(workspace.id);
    setActionError(null);

    let result;
    switch (action) {
      case 'approve':
        result = await approveWorkspace(workspace.id, workspace.creatorUserId);
        break;
      case 'suspend':
        result = await suspendWorkspace(workspace.id);
        break;
      case 'recover':
        result = await recoverWorkspace(workspace.id);
        break;
      case 'archive':
        result = await archiveWorkspace(workspace.id);
        break;
    }

    setLoadingId(null);

    if (result.success) {
      // Refresh server data — server is the source of truth.
      router.refresh();
      // Optionally refetch to update UI immediately
      const fresh = await getAllWorkspaces(); // If you want to avoid full page refresh, but router.refresh() is enough.
    } else {
      setActionError(result.error || 'Action failed');
    }
  }

  if (error) {
    return (
      <div className="rounded-lg border border-destructive/50 bg-destructive/10 p-6 text-center">
        <AlertTriangle className="mx-auto mb-2 size-6 text-destructive" />
        <p className="text-sm text-destructive">Failed to load workspaces: {error}</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="rounded-lg border bg-background p-6">
        <p className="font-medium text-muted-foreground text-sm uppercase tracking-[0.2em]">Platform Office</p>
        <h1 className="mt-2 font-semibold text-2xl tracking-tight">Lifecycle Orchestration</h1>
        <p className="mt-2 max-w-2xl text-muted-foreground text-sm">
          Manage workspace lifecycle states — approve pending workspaces, suspend active ones, or archive them.
        </p>
      </div>

      {actionError && (
        <div className="rounded-lg border border-destructive/50 bg-destructive/10 p-3 text-sm text-destructive">
          {actionError}
        </div>
      )}

      <Card>
        <CardHeader className="border-b">
          <CardTitle className="text-xl leading-none">Workspaces</CardTitle>
          <CardDescription className="max-w-sm leading-snug">
            {workspaces.length} workspace{workspaces.length !== 1 ? 's' : ''} total. Actions require confirmation.
          </CardDescription>
          <Button variant="outline" size="sm" onClick={() => router.refresh()}>
            <RefreshCw className="size-3.5" />
            Refresh
          </Button>
        </CardHeader>
        <CardContent className="px-0">
          {workspaces.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-muted-foreground">
              <CheckCircle className="mb-3 size-8 opacity-40" />
              <p className="text-sm">No workspaces found.</p>
            </div>
          ) : (
            <>
              {/* Desktop Table - hidden on small screens */}
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
                      const statusInfo = statusConfig[workspace.status] ?? { label: workspace.status, variant: 'outline' };
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
                              ? new Date(workspace.createdAt).toLocaleDateString('en-GB', {
                                  day: '2-digit',
                                  month: 'short',
                                  year: 'numeric',
                                })
                              : '—'}
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

              {/* Mobile Cards - visible on small screens */}
              <div className="lg:hidden space-y-3 p-4">
                {workspaces.map((workspace) => {
                  const statusInfo = statusConfig[workspace.status] ?? { label: workspace.status, variant: 'outline' };
                  const actions = validTransitions[workspace.status] || [];
                  const isLoading = loadingId === workspace.id;
                  return (
                    <Card key={workspace.id}>
                      <CardContent className="p-4 space-y-3">
                        <div className="flex items-start justify-between">
                          <div>
                            <p className="font-medium">{workspace.name}</p>
                            <Badge variant={statusInfo.variant}>{statusInfo.label}</Badge>
                          </div>
                          <span className="text-muted-foreground text-xs">
                            {workspace.createdAt
                              ? new Date(workspace.createdAt).toLocaleDateString('en-GB', {
                                  day: '2-digit',
                                  month: 'short',
                                  year: 'numeric',
                                })
                              : '—'}
                          </span>
                        </div>
                        {actions.length > 0 && (
                          <div className="flex flex-wrap gap-1 pt-2 border-t">
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
```

· Step 2: Run typecheck: bunx tsc --noEmit — expected: no errors
· Step 3: Commit

```bash
git add src/app/\(main\)/dashboard/lifecycle/_components/lifecycle-screen.tsx
git commit -m "feat: add LifecycleScreen with desktop table + mobile cards and router.refresh"
```

---

Task 5: Replace lifecycle page with functional implementation

Files: Modify src/app/(main)/dashboard/lifecycle/page.tsx

· Step 1: Replace page.tsx contents

```tsx
import { getAllWorkspaces } from '@/lib/services/workspace-service';
import { LifecycleScreen } from './_components/lifecycle-screen';

export default async function LifecyclePage() {
  try {
    const workspaces = await getAllWorkspaces();
    return <LifecycleScreen initialWorkspaces={workspaces} />;
  } catch (err) {
    return <LifecycleScreen initialWorkspaces={[]} error={String(err)} />;
  }
}
```

· Step 2: Run typecheck: bunx tsc --noEmit — expected: no errors
· Step 3: Run build: bun run build — expected: build succeeds with /dashboard/lifecycle route listed
· Step 4: Commit

```bash
git add src/app/\(main\)/dashboard/lifecycle/page.tsx
git commit -m "feat: replace lifecycle placeholder with functional orchestration screen"
```

---

Task 6: Final verification and report

· Step 1: Run full typecheck: bunx tsc --noEmit — expected: no errors
· Step 2: Run full build: bun run build — expected: build succeeds, all routes compile
· Step 3: Verify git status: git status — expected: only intended files modified/created
· Step 4: Write report at docs/Reports/architecture/YYYY-MM-DD_lifecycle-orchestration.md

Include:

· Agent name and date
· Summary of work
· Key decisions (transition map, service result type, router.refresh, mobile cards)
· Any deviations from plan
· Git status before/after

---

Spec Coverage

Requirement Task
Extend workspace-service.ts with lifecycle mutations Task 2
Include recover_workspace Task 2
Return ServiceResult for mutations Task 2
Replace lifecycle placeholder with functional screen Task 5
List workspaces and current lifecycle state Task 4
Display only valid actions per workspace state Task 4 (validTransitions)
Use existing shadcn/ui components Tasks 3, 4
AlertDialog for destructive/state-changing actions Task 3
Refresh UI after successful operations using router.refresh() Task 4
Mobile-first behaviour with Table + Cards Task 4
No direct Supabase access from UI Task 5 (server component fetches)
Preserve service-layer architecture Task 2
RPC owns authorization and audit (service just calls) Task 2
Differentiate empty vs error states Task 5 (try/catch, error prop)
Reuse status badge logic Task 4 (statusConfig)
Type naming: WorkspaceLifecycle Task 1
Disable buttons and show loading state Task 3, 4
No optimistic updates Task 4 (uses router.refresh())

---

Summary of Changes from Original Plan

Original Updated
3 mutations 4 mutations (added recover)
Promise<boolean> Promise<{ success: boolean; error?: string }>
Optimistic updates router.refresh() (server is source of truth)
window.location.reload() router.refresh()
Table only Desktop table + Mobile cards
Authorization in service RPC owns auth — service just calls
Audit logging in service RPC owns audit
switch(status) validTransitions map
Loading only loading === id Also disable buttons, show spinner
Empty state only Differentiate empty vs error
New status mapping Reuse or centralise
LifecycleWorkspace WorkspaceLifecycle (extends WorkspaceSummary)

```