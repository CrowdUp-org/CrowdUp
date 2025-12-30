"use client";

import {
  REPUTATION_LEVELS,
  ReputationLevel,
} from "@/lib/services/reputation.service";

interface ReputationBadgeProps {
  level: string;
  score: number;
  showScore?: boolean;
  size?: "sm" | "md" | "lg";
}

export function ReputationBadge({
  level,
  score,
  showScore = true,
  size = "sm",
}: ReputationBadgeProps) {
  const levelKey = level as ReputationLevel;
  const levelInfo = REPUTATION_LEVELS[levelKey] || REPUTATION_LEVELS.newcomer;

  const sizeClasses = {
    sm: "text-xs px-1.5 py-0.5 gap-1",
    md: "text-sm px-2 py-1 gap-1.5",
    lg: "text-base px-3 py-1.5 gap-2",
  };

  const levelColors: Record<ReputationLevel, string> = {
    newcomer: "bg-gray-100 text-gray-700 border-gray-200",
    contributor: "bg-green-50 text-green-700 border-green-200",
    established: "bg-emerald-50 text-emerald-700 border-emerald-200",
    trusted: "bg-amber-50 text-amber-700 border-amber-200",
    expert: "bg-orange-50 text-orange-700 border-orange-200",
    legend: "bg-purple-50 text-purple-700 border-purple-200",
  };

  return (
    <span
      className={`inline-flex items-center rounded-full border font-medium ${sizeClasses[size]} ${levelColors[levelKey] || levelColors.newcomer}`}
      title={`${levelInfo.name} - ${score.toLocaleString()} reputation points`}
    >
      <span>{levelInfo.icon}</span>
      {showScore && (
        <span className="font-semibold">{score.toLocaleString()}</span>
      )}
    </span>
  );
}
