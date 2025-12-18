"use client";

import Header from "@/components/Header";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { ArrowLeft, Star, MessageCircle, TrendingUp } from "lucide-react";
import { use, useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import { getCurrentUserId } from "@/lib/auth";
import { formatDistanceToNow } from "date-fns";

interface Analytics {
  averageRating: number;
  totalReviews: number;
  ratingDistribution: { [key: number]: number };
  recentReviews: any[];
}

export default function AppAnalyticsPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const router = useRouter();
  const [app, setApp] = useState<any>(null);
  const [analytics, setAnalytics] = useState<Analytics>({
    averageRating: 0,
    totalReviews: 0,
    ratingDistribution: { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 },
    recentReviews: [],
  });
  const [loading, setLoading] = useState(true);
  const [isOwner, setIsOwner] = useState(false);

  useEffect(() => {
    fetchAppAndCheck();
  }, [id]);

  const fetchAppAndCheck = async () => {
    const { data: appData } = await supabase
      .from("apps")
      .select(`
        *,
        users (username, display_name)
      `)
      .eq("id", id)
      .single();

    if (!appData) {
      router.push("/");
      return;
    }

    setApp(appData);

    // Check ownership
    const userId = getCurrentUserId();
    if (!userId) {
      router.push("/auth/signin");
      return;
    }

    if (appData.user_id !== userId) {
      router.push(`/apps/${id}`);
      return;
    }

    setIsOwner(true);
    await fetchAnalytics();
  };

  const fetchAnalytics = async () => {
    // Fetch all reviews
    const { data: reviews } = await supabase
      .from("app_reviews")
      .select(`
        *,
        users (username, display_name)
      `)
      .eq("app_id", id)
      .order("created_at", { ascending: false });

    if (!reviews || reviews.length === 0) {
      setLoading(false);
      return;
    }

    // Calculate rating distribution
    const distribution: { [key: number]: number } = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
    reviews.forEach((review: any) => {
      distribution[review.rating]++;
    });

    // Calculate average
    const avg = reviews.reduce((sum: number, review: any) => sum + review.rating, 0) / reviews.length;

    setAnalytics({
      averageRating: Math.round(avg * 10) / 10,
      totalReviews: reviews.length,
      ratingDistribution: distribution,
      recentReviews: reviews.slice(0, 10),
    });

    setLoading(false);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <main className="mx-auto max-w-6xl px-6 pt-24 pb-8">
          <div className="text-center py-12">
            <p className="text-gray-600">Loading analytics...</p>
          </div>
        </main>
      </div>
    );
  }

  if (!isOwner) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <main className="mx-auto max-w-6xl px-6 pt-24 pb-8">
        {/* Header */}
        <div className="flex items-center gap-4 mb-8">
          <Button
            onClick={() => router.push(`/apps/${id}`)}
            variant="outline"
            className="gap-2"
          >
            <ArrowLeft className="h-4 w-4" />
            Back
          </Button>
          <div>
            <h1 className="text-3xl font-bold">{app?.name} Analytics</h1>
            <p className="text-gray-600">Track your app's performance</p>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          <Card className="p-6 bg-white border shadow-sm rounded-2xl">
            <div className="flex items-center justify-between mb-2">
              <p className="text-sm font-medium text-gray-600">Average Rating</p>
              <Star className="h-5 w-5 text-orange-500" />
            </div>
            <div className="flex items-end gap-2">
              <p className="text-3xl font-bold bg-gradient-to-r from-yellow-400 to-orange-500 bg-clip-text text-transparent">
                {analytics.averageRating.toFixed(1)}
              </p>
              <p className="text-gray-500 mb-1">/ 5.0</p>
            </div>
          </Card>

          <Card className="p-6 bg-white border shadow-sm rounded-2xl">
            <div className="flex items-center justify-between mb-2">
              <p className="text-sm font-medium text-gray-600">Total Reviews</p>
              <MessageCircle className="h-5 w-5 text-orange-500" />
            </div>
            <p className="text-3xl font-bold bg-gradient-to-r from-yellow-400 to-orange-500 bg-clip-text text-transparent">
              {analytics.totalReviews}
            </p>
          </Card>

          <Card className="p-6 bg-white border shadow-sm rounded-2xl">
            <div className="flex items-center justify-between mb-2">
              <p className="text-sm font-medium text-gray-600">Engagement</p>
              <TrendingUp className="h-5 w-5 text-orange-500" />
            </div>
            <p className="text-3xl font-bold bg-gradient-to-r from-yellow-400 to-orange-500 bg-clip-text text-transparent">
              {analytics.totalReviews > 0 ? "High" : "Low"}
            </p>
          </Card>
        </div>

        {/* Rating Distribution */}
        <Card className="p-8 bg-white border shadow-sm rounded-2xl mb-8">
          <h2 className="text-2xl font-bold mb-6">Rating Distribution</h2>
          <div className="space-y-3">
            {[5, 4, 3, 2, 1].map((rating) => {
              const count = analytics.ratingDistribution[rating] || 0;
              const percentage = analytics.totalReviews > 0 
                ? (count / analytics.totalReviews) * 100 
                : 0;
              
              return (
                <div key={rating} className="flex items-center gap-4">
                  <div className="flex items-center gap-1 w-16">
                    <span className="text-sm font-medium">{rating}</span>
                    <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                  </div>
                  <div className="flex-1 h-6 bg-gray-100 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-yellow-400 to-orange-500 transition-all"
                      style={{ width: `${percentage}%` }}
                    />
                  </div>
                  <span className="text-sm text-gray-600 w-16 text-right">
                    {count} ({Math.round(percentage)}%)
                  </span>
                </div>
              );
            })}
          </div>
        </Card>

        {/* Recent Reviews */}
        <Card className="p-8 bg-white border shadow-sm rounded-2xl">
          <h2 className="text-2xl font-bold mb-6">Recent Reviews</h2>
          {analytics.recentReviews.length === 0 ? (
            <p className="text-gray-600 text-center py-8">No reviews yet</p>
          ) : (
            <div className="space-y-6">
              {analytics.recentReviews.map((review: any) => (
                <div key={review.id} className="border-b pb-6 last:border-0 last:pb-0">
                  <div className="flex items-start justify-between mb-2">
                    <div>
                      <button
                        onClick={() => router.push(`/profile/${review.users.username}`)}
                        className="font-semibold hover:underline"
                      >
                        {review.users.display_name}
                      </button>
                      <p className="text-sm text-gray-500">
                        {formatDistanceToNow(new Date(review.created_at), { addSuffix: true })}
                      </p>
                    </div>
                    <div className="flex items-center">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <Star
                          key={star}
                          className={`h-4 w-4 ${
                            star <= review.rating
                              ? "fill-yellow-400 text-yellow-400"
                              : "text-gray-300"
                          }`}
                        />
                      ))}
                    </div>
                  </div>
                  {review.review_text && (
                    <p className="text-gray-700">{review.review_text}</p>
                  )}
                </div>
              ))}
            </div>
          )}
        </Card>
      </main>
    </div>
  );
}
