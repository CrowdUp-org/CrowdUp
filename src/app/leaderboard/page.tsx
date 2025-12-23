"use client";

import Header from "@/components/Header";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { ReputationBadge } from "@/components/ui/reputation-badge";
import { REPUTATION_LEVELS, getLeaderboard, LeaderboardEntry } from "@/lib/reputation";
import { Trophy, Medal, Award } from "lucide-react";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

export default function LeaderboardPage() {
    const router = useRouter();
    const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);
    const [loading, setLoading] = useState(true);
    const [page, setPage] = useState(1);
    const [hasMore, setHasMore] = useState(true);
    const pageSize = 50;

    useEffect(() => {
        fetchLeaderboard(1, true);
    }, []);

    async function fetchLeaderboard(pageNum: number, isInitial: boolean = false) {
        if (!isInitial) setLoading(true);
        const data = await getLeaderboard({ limit: pageSize, page: pageNum });

        if (isInitial) {
            setLeaderboard(data);
        } else {
            setLeaderboard(prev => [...prev, ...data]);
        }

        setHasMore(data.length === pageSize);
        setLoading(false);
    }

    const handleLoadMore = () => {
        const nextPage = page + 1;
        setPage(nextPage);
        fetchLeaderboard(nextPage);
    };

    const getRankIcon = (rank: number) => {
        switch (rank) {
            case 1:
                return <Trophy className="h-6 w-6 text-yellow-500" />;
            case 2:
                return <Medal className="h-6 w-6 text-gray-400" />;
            case 3:
                return <Award className="h-6 w-6 text-orange-400" />;
            default:
                return <span className="text-lg font-bold text-gray-500 w-6 text-center">{rank}</span>;
        }
    };

    const getRankBg = (rank: number) => {
        switch (rank) {
            case 1:
                return "bg-gradient-to-r from-yellow-50 to-amber-50 border-yellow-200";
            case 2:
                return "bg-gradient-to-r from-gray-50 to-slate-50 border-gray-200";
            case 3:
                return "bg-gradient-to-r from-orange-50 to-amber-50 border-orange-200";
            default:
                return "bg-white border-gray-100";
        }
    };

    return (
        <div className="min-h-screen bg-gray-50">
            <Header />
            <main className="mx-auto max-w-3xl px-6 pt-24 pb-8">
                {/* Header */}
                <div className="text-center mb-8">
                    <h1 className="text-3xl font-bold mb-2">
                        🏆 Leaderboard
                    </h1>
                    <p className="text-gray-600">
                        Top contributors in our community
                    </p>
                </div>

                {/* Level Legend */}
                <div className="bg-white rounded-2xl border shadow-sm p-4 mb-6">
                    <h3 className="text-sm font-medium text-gray-700 mb-3">Reputation Levels</h3>
                    <div className="flex flex-wrap gap-3">
                        {Object.entries(REPUTATION_LEVELS).map(([key, level]) => (
                            <div
                                key={key}
                                className="flex items-center gap-1.5 text-sm text-gray-600"
                            >
                                <span>{level.icon}</span>
                                <span>{level.name}</span>
                                <span className="text-gray-400">({level.minScore}+)</span>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Leaderboard */}
                <div className="bg-white rounded-2xl border shadow-sm overflow-hidden">
                    {loading ? (
                        <div className="text-center py-12 text-gray-500">
                            Loading leaderboard...
                        </div>
                    ) : leaderboard.length === 0 ? (
                        <div className="text-center py-12 text-gray-500">
                            No users yet. Be the first contributor!
                        </div>
                    ) : (
                        <div className="divide-y divide-gray-100">
                            {leaderboard.map((user) => (
                                <button
                                    key={user.id}
                                    onClick={() => router.push(`/profile/${user.username}`)}
                                    className={`w-full flex items-center gap-4 p-4 hover:bg-gray-50 transition-colors text-left ${getRankBg(user.rank)} ${user.rank <= 3 ? 'border-l-4' : ''}`}
                                >
                                    {/* Rank */}
                                    <div className="flex-shrink-0 w-10 flex justify-center">
                                        {getRankIcon(user.rank)}
                                    </div>

                                    {/* Avatar */}
                                    <Avatar className="h-10 w-10 flex-shrink-0">
                                        {user.avatar_url ? (
                                            <img
                                                src={user.avatar_url}
                                                alt={user.display_name}
                                                className="h-full w-full object-cover rounded-full"
                                            />
                                        ) : (
                                            <AvatarFallback className="bg-gradient-to-br from-yellow-400 to-orange-500 text-white font-bold">
                                                {user.display_name.charAt(0).toUpperCase()}
                                            </AvatarFallback>
                                        )}
                                    </Avatar>

                                    {/* User Info */}
                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-center gap-2">
                                            <span className="font-semibold text-gray-900 truncate">
                                                {user.display_name}
                                            </span>
                                            <ReputationBadge
                                                level={user.reputation_level}
                                                score={user.reputation_score}
                                                showScore={false}
                                                size="sm"
                                            />
                                        </div>
                                        <span className="text-sm text-gray-500">@{user.username}</span>
                                    </div>

                                    {/* Score */}
                                    <div className="text-right flex-shrink-0">
                                        <p className="text-lg font-bold bg-gradient-to-r from-yellow-400 to-orange-500 bg-clip-text text-transparent">
                                            {user.reputation_score.toLocaleString()}
                                        </p>
                                        <p className="text-xs text-gray-500">points</p>
                                    </div>
                                </button>
                            ))}
                        </div>
                    )}
                </div>

                {hasMore && !loading && leaderboard.length > 0 && (
                    <div className="mt-8 flex justify-center">
                        <Button
                            onClick={handleLoadMore}
                            variant="outline"
                            className="bg-white hover:bg-gray-50 border-gray-200 px-8 h-12 rounded-full font-semibold text-gray-700 shadow-sm transition-all hover:translate-y-[-1px] active:translate-y-[1px]"
                        >
                            Load More Contributors
                        </Button>
                    </div>
                )}

                {loading && leaderboard.length > 0 && (
                    <div className="mt-8 text-center text-gray-500 italic">
                        Fetching more contributors...
                    </div>
                )}
            </main>
        </div>
    );
}
