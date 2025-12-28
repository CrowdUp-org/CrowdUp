"use client";

import { BadgeCheck } from "lucide-react";

interface VerifiedBadgeProps {
  size?: "sm" | "md" | "lg";
  showTooltip?: boolean;
  className?: string;
}

const sizeClasses = {
  sm: "w-3.5 h-3.5",
  md: "w-4 h-4",
  lg: "w-5 h-5",
};

export function VerifiedBadge({
  size = "md",
  showTooltip = true,
  className = "",
}: VerifiedBadgeProps) {
  return (
    <span
      className={`inline-flex items-center ${className}`}
      title={showTooltip ? "Verified Company Representative" : undefined}
    >
      <BadgeCheck
        className={`${sizeClasses[size]} text-blue-500 fill-blue-500/20`}
      />
    </span>
  );
}

export default VerifiedBadge;
