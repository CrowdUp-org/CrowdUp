"use client";

import {
  REPUTATION_LEVELS,
  ReputationLevel,
  getReputationData,
} from "@/lib/services/reputation.service";

interface ReputationCardProps {
  score: number;
  level: string;
  className?: string;
}

export function ReputationCard({
  score,
  level,
  className = "",
}: ReputationCardProps) {
  const reputationData = getReputationData(score);
  const levelKey = level as ReputationLevel;
  const levelInfo = REPUTATION_LEVELS[levelKey] || REPUTATION_LEVELS.newcomer;

  // Get next level info
  const levelOrder: ReputationLevel[] = [
    "newcomer",
    "contributor",
    "established",
    "trusted",
    "expert",
    "legend",
  ];
  const currentIndex = levelOrder.indexOf(levelKey);
  const nextLevel =
    currentIndex < levelOrder.length - 1 ? levelOrder[currentIndex + 1] : null;
  const nextLevelInfo = nextLevel ? REPUTATION_LEVELS[nextLevel] : null;

  return (
    <div className={`bg-white rounded-2xl border shadow-sm p-6 ${className}`}>
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-900">Reputation</h3>
        <span className="text-3xl">{levelInfo.icon}</span>
      </div>

      <div className="mb-4">
        <div className="flex items-baseline gap-2 mb-1">
          <span className="text-4xl font-bold bg-gradient-to-r from-yellow-400 to-orange-500 bg-clip-text text-transparent">
            {score.toLocaleString()}
          </span>
          <span className="text-gray-500 text-sm">points</span>
        </div>
        <p className="text-gray-700 font-medium">
          {levelInfo.icon} {levelInfo.name}
        </p>
      </div>

      {/* Progress bar */}
      {nextLevelInfo && (
        <div className="space-y-2">
          <div className="w-full h-2 bg-gray-100 rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-yellow-400 to-orange-500 rounded-full transition-all duration-500"
              style={{ width: `${reputationData.progressPercent}%` }}
            />
          </div>
          <div className="flex items-center justify-between text-sm text-gray-500">
            <span>{reputationData.progressPercent}% to next level</span>
            <span>
              {reputationData.pointsToNextLevel.toLocaleString()} pts to{" "}
              {nextLevelInfo.icon} {nextLevelInfo.name}
            </span>
          </div>
        </div>
      )}

      {!nextLevelInfo && (
        <div className="text-center py-2">
          <span className="text-sm text-purple-600 font-medium">
            🎉 Maximum level achieved!
          </span>
        </div>
      )}
    </div>
  );
}
