"use client";

import { useEffect, useState } from "react";
import { getReputationHistory, getActionDescription, ReputationHistoryItem } from "@/lib/reputation";
import { formatDistanceToNow } from "date-fns";

interface ReputationHistoryProps {
    userId: string;
    limit?: number;
    className?: string;
}

export function ReputationHistory({
    userId,
    limit = 10,
    className = "",
}: ReputationHistoryProps) {
    const [history, setHistory] = useState<ReputationHistoryItem[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        async function fetchHistory() {
            const data = await getReputationHistory(userId, limit);
            setHistory(data);
            setLoading(false);
        }
        fetchHistory();
    }, [userId, limit]);

    if (loading) {
        return (
            <div className={`bg-white rounded-2xl border shadow-sm p-6 ${className}`}>
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Reputation Activity</h3>
                <div className="text-center py-4 text-gray-500">Loading...</div>
            </div>
        );
    }

    if (history.length === 0) {
        return (
            <div className={`bg-white rounded-2xl border shadow-sm p-6 ${className}`}>
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Reputation Activity</h3>
                <div className="text-center py-4 text-gray-500">No activity yet</div>
            </div>
        );
    }

    return (
        <div className={`bg-white rounded-2xl border shadow-sm p-6 ${className}`}>
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Reputation Activity</h3>
            <div className="space-y-3">
                {history.map((item) => (
                    <div
                        key={item.id}
                        className="flex items-start gap-3 py-3 border-b border-gray-100 last:border-0"
                    >
                        <div
                            className={`flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold ${item.points_change > 0
                                    ? "bg-green-100 text-green-600"
                                    : "bg-red-100 text-red-600"
                                }`}
                        >
                            {item.points_change > 0 ? "+" : ""}
                            {item.points_change}
                        </div>
                        <div className="flex-1 min-w-0">
                            <p className="text-sm text-gray-900 font-medium">
                                {getActionDescription(item.action_type)}
                            </p>
                            {item.post_title && (
                                <p className="text-sm text-gray-500 truncate">
                                    &ldquo;{item.post_title}&rdquo;
                                </p>
                            )}
                            {item.reason && (
                                <p className="text-sm text-gray-500">{item.reason}</p>
                            )}
                            <p className="text-xs text-gray-400 mt-1">
                                {formatDistanceToNow(new Date(item.created_at), { addSuffix: true })}
                            </p>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}
