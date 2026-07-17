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
    description: "This will immediately suspend the workspace. All members will lose access until it is recovered.",
    icon: Pause,
    buttonVariant: "destructive",
    actionLabel: "Suspend Workspace",
  },
  archive: {
    label: "Archive",
    description: "This will archive the workspace. It will be removed from active views but data is preserved.",
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

export function LifecycleAlertDialog({ action, workspaceName, onConfirm, disabled }: LifecycleAlertDialogProps) {
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
            Are you sure you want to {config.label.toLowerCase()} <strong>{workspaceName}</strong>? {config.description}
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
