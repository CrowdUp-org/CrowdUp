"use client";

import { cn } from "@/lib/utils";
import { CheckCircle2, Circle, Clock, XCircle, Ban } from "lucide-react";

type Status = "open" | "in_progress" | "resolved" | "closed" | "wont_fix";

interface StatusBadgeProps {
  status: Status;
  size?: "sm" | "md" | "lg";
  showIcon?: boolean;
  className?: string;
}

const statusConfig: Record<Status, {
  label: string;
  icon: typeof Circle;
  className: string;
}> = {
  open: {
    label: "Open",
    icon: Circle,
    className: "bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-950 dark:text-blue-300 dark:border-blue-800",
  },
  in_progress: {
    label: "In Progress",
    icon: Clock,
    className: "bg-yellow-50 text-yellow-700 border-yellow-200 dark:bg-yellow-950 dark:text-yellow-300 dark:border-yellow-800",
  },
  resolved: {
    label: "Resolved",
    icon: CheckCircle2,
    className: "bg-green-50 text-green-700 border-green-200 dark:bg-green-950 dark:text-green-300 dark:border-green-800",
  },
  closed: {
    label: "Closed",
    icon: XCircle,
    className: "bg-gray-50 text-gray-700 border-gray-200 dark:bg-gray-800 dark:text-gray-300 dark:border-gray-700",
  },
  wont_fix: {
    label: "Won't Fix",
    icon: Ban,
    className: "bg-red-50 text-red-700 border-red-200 dark:bg-red-950 dark:text-red-300 dark:border-red-800",
  },
};

const sizeClasses = {
  sm: "px-1.5 py-0.5 text-[10px] gap-1",
  md: "px-2 py-1 text-xs gap-1.5",
  lg: "px-3 py-1.5 text-sm gap-2",
};

const iconSizes = {
  sm: "h-2.5 w-2.5",
  md: "h-3 w-3",
  lg: "h-4 w-4",
};

export function StatusBadge({ 
  status, 
  size = "md", 
  showIcon = true,
  className 
}: StatusBadgeProps) {
  const config = statusConfig[status];
  const Icon = config.icon;
  
  return (
    <span
      className={cn(
        "inline-flex items-center font-medium rounded-full border transition-colors",
        sizeClasses[size],
        config.className,
        className
      )}
    >
      {showIcon && <Icon className={iconSizes[size]} />}
      {config.label}
    </span>
  );
}

export function getStatusColor(status: Status): string {
  const colors: Record<Status, string> = {
    open: "#3B82F6",
    in_progress: "#EAB308",
    resolved: "#22C55E",
    closed: "#6B7280",
    wont_fix: "#EF4444",
  };
  return colors[status];
}
