"use client";

import Header from "@/components/Header";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { ChevronUp, ChevronDown, Share2, Flag, Send } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { use, useState, useEffect } from "react";
import { cn } from "@/lib/utils";
import { supabase } from "@/lib/supabase";
import { getCurrentUser, getCurrentUserId } from "@/lib/auth";
import { useRouter } from "next/navigation";
import { formatDistanceToNow } from "date-fns";

interface Post {
  id: string;
  user_id: string;
  type: "Bug Report" | "Feature Request" | "Complaint";
  company: string;
  company_color: string;
  title: string;
  description: string;
  votes: number;
  created_at: string;
  users: {
    username: string;
    display_name: string;
  };
}

interface Comment {
  id: string;
  post_id: string;
  user_id: string;
  content: string;
  created_at: string;
  users: {
    username: string;
    display_name: string;
  };
}

export default function PostDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const router = useRouter();
  const currentUser = getCurrentUser();
  const [post, setPost] = useState<Post | null>(null);
  const [comments, setComments] = useState<Comment[]>([]);
  const [votes, setVotes] = useState(0);
  const [userVote, setUserVote] = useState<"up" | "down" | null>(null);
  const [commentText, setCommentText] = useState("");
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [upvoters, setUpvoters] = useState<any[]>([]);
  const [upvotersDialogOpen, setUpvotersDialogOpen] = useState(false);

  useEffect(() => {
    fetchPost();
    fetchComments();
    fetchUserVote();
    fetchUpvoters();
  }, [id]);

  const fetchPost = async () => {
    const { data, error } = await supabase
      .from("posts")
      .select(
        `
        *,
        users (username, display_name)
      `,
      )
      .eq("id", id)
      .single();

    if (!error && data) {
      setPost(data as Post);
      setVotes(data.votes);
    }
    setLoading(false);
  };

  const fetchComments = async () => {
    const { data, error } = await supabase
      .from("comments")
      .select(
        `
        *,
        users (username, display_name)
      `,
      )
      .eq("post_id", id)
      .order("created_at", { ascending: false });

    if (!error && data) {
      setComments(data as Comment[]);
    }
  };

  const fetchUpvoters = async () => {
    const { data } = await supabase
      .from("votes")
      .select(
        `
        vote_type,
        users (username, display_name, avatar_url)
      `,
      )
      .eq("post_id", id)
      .eq("vote_type", "up")
      .order("created_at", { ascending: false });

    if (data) {
      setUpvoters(data);
    }
  };

  const fetchUserVote = async () => {
    const userId = getCurrentUserId();
    if (!userId) return;

    const { data } = await supabase
      .from("votes")
      .select("vote_type")
      .eq("post_id", id)
      .eq("user_id", userId)
      .single();

    if (data) {
      setUserVote(data.vote_type as "up" | "down");
    }
  };

  const handleVote = async (voteType: "up" | "down") => {
    const userId = getCurrentUserId();
    if (!userId) {
      router.push("/auth/signin");
      return;
    }

    let newVotes: number = votes;
    let newUserVote: "up" | "down" | null = voteType;

    if (userVote === voteType) {
      newUserVote = null;
      newVotes = votes + (voteType === "up" ? -1 : 1);

      await supabase
        .from("votes")
        .delete()
        .eq("post_id", id)
        .eq("user_id", userId);
    } else {
      if (userVote) {
        newVotes = votes + (voteType === "up" ? 2 : -2);
      } else {
        newVotes = votes + (voteType === "up" ? 1 : -1);
      }

      await supabase.from("votes").upsert({
        post_id: id,
        user_id: userId,
        vote_type: voteType,
      });
    }

    await supabase.from("posts").update({ votes: newVotes }).eq("id", id);

    setVotes(newVotes);
    setUserVote(newUserVote);
  };

  const handleComment = async () => {
    if (!commentText.trim()) return;

    const userId = getCurrentUserId();
    if (!userId) {
      router.push("/auth/signin");
      return;
    }

    setSubmitting(true);

    const { error } = await supabase.from("comments").insert({
      post_id: id,
      user_id: userId,
      content: commentText.trim(),
    });

    if (!error) {
      setCommentText("");
      fetchComments();
    }

    setSubmitting(false);
  };

  const handleShare = () => {
    const url = window.location.href;
    if (navigator.share) {
      navigator.share({
        title: post?.title,
        text: post?.description,
        url: url,
      });
    } else {
      navigator.clipboard.writeText(url);
      alert("Link copied to clipboard!");
    }
  };

  const handleReport = () => {
    alert(
      "Report functionality coming soon! This post has been flagged for review.",
    );
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <main className="mx-auto max-w-4xl px-6 pt-24 pb-8">
          <div className="text-center py-12">
            <p className="text-gray-600">Loading post...</p>
          </div>
        </main>
      </div>
    );
  }

  if (!post) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <main className="mx-auto max-w-4xl px-6 pt-24 pb-8">
          <div className="text-center py-12 bg-white rounded-2xl border">
            <p className="text-gray-600 mb-4">Post not found</p>
            <Button onClick={() => router.push("/")} variant="outline">
              Go Home
            </Button>
          </div>
        </main>
      </div>
    );
  }

  const typeConfig = {
    "Bug Report": {
      icon: "🐛",
      bgColor: "bg-red-50",
      textColor: "text-red-600",
      borderColor: "border-red-200",
    },
    "Feature Request": {
      icon: "💡",
      bgColor: "bg-blue-50",
      textColor: "text-blue-600",
      borderColor: "border-blue-200",
    },
    Complaint: {
      icon: "⚠️",
      bgColor: "bg-yellow-50",
      textColor: "text-yellow-600",
      borderColor: "border-yellow-200",
    },
  };

  const config = typeConfig[post.type];

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <main className="mx-auto max-w-4xl px-6 pt-24 pb-8">
        {/* Post Card */}
        <div className="rounded-2xl border bg-white p-8 shadow-sm mb-6">
          <div className="flex items-start gap-6">
            {/* Vote Section */}
            <div className="flex flex-col items-center gap-2">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => handleVote("up")}
                className={cn(
                  "h-10 w-10 transition-all hover:scale-110",
                  userVote === "up" && "text-green-600 bg-green-50",
                )}
              >
                <ChevronUp className="h-6 w-6" />
              </Button>
              <Dialog
                open={upvotersDialogOpen}
                onOpenChange={setUpvotersDialogOpen}
              >
                <DialogTrigger asChild>
                  <button
                    className={cn(
                      "text-2xl font-bold hover:underline cursor-pointer",
                      userVote === "up" && "text-green-600",
                      userVote === "down" && "text-red-600",
                    )}
                  >
                    {votes}
                  </button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-[500px] max-h-[600px] overflow-y-auto">
                  <DialogHeader>
                    <DialogTitle>
                      Upvoted by {upvoters.length}{" "}
                      {upvoters.length === 1 ? "person" : "people"}
                    </DialogTitle>
                    <DialogDescription>
                      People who upvoted this post
                    </DialogDescription>
                  </DialogHeader>
                  <div className="space-y-3 py-4">
                    {upvoters.length === 0 ? (
                      <p className="text-center text-gray-500 py-8">
                        No upvotes yet
                      </p>
                    ) : (
                      upvoters.map((vote: any, index: number) => (
                        <button
                          key={index}
                          onClick={() => {
                            setUpvotersDialogOpen(false);
                            router.push(`/profile/${vote.users.username}`);
                          }}
                          className="w-full p-3 flex items-center gap-3 hover:bg-gray-50 rounded-lg transition-colors"
                        >
                          <Avatar className="h-10 w-10 bg-gradient-to-br from-yellow-400 to-orange-500">
                            {vote.users.avatar_url ? (
                              <img
                                src={vote.users.avatar_url}
                                alt={vote.users.display_name}
                                className="h-full w-full object-cover"
                              />
                            ) : (
                              <AvatarFallback className="bg-gradient-to-br from-yellow-400 to-orange-500 text-white font-semibold">
                                {vote.users.display_name
                                  .charAt(0)
                                  .toUpperCase()}
                              </AvatarFallback>
                            )}
                          </Avatar>
                          <div className="text-left">
                            <p className="font-semibold">
                              {vote.users.display_name}
                            </p>
                            <p className="text-sm text-gray-500">
                              @{vote.users.username}
                            </p>
                          </div>
                        </button>
                      ))
                    )}
                  </div>
                </DialogContent>
              </Dialog>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => handleVote("down")}
                className={cn(
                  "h-10 w-10 transition-all hover:scale-110",
                  userVote === "down" && "text-red-600 bg-red-50",
                )}
              >
                <ChevronDown className="h-6 w-6" />
              </Button>
            </div>

            {/* Content */}
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-3">
                <Badge
                  className={cn(
                    config.bgColor,
                    config.textColor,
                    "border",
                    config.borderColor,
                    "font-medium",
                  )}
                >
                  <span className="mr-1">{config.icon}</span>
                  {post.type}
                </Badge>
                <span className="text-gray-300">•</span>
                <button
                  onClick={() =>
                    router.push(`/company/${post.company.toLowerCase()}`)
                  }
                  className="text-sm font-medium hover:underline"
                  style={{ color: post.company_color }}
                >
                  {post.company}
                </button>
              </div>

              <h1 className="text-3xl font-bold mb-4">{post.title}</h1>
              <p className="text-gray-700 mb-6 leading-relaxed whitespace-pre-wrap">
                {post.description}
              </p>

              {/* Author Info */}
              <div className="flex items-center justify-between pb-6 border-b">
                <button
                  onClick={() => router.push(`/profile/${post.users.username}`)}
                  className="flex items-center gap-3 hover:opacity-70 transition-opacity"
                >
                  <Avatar className="h-10 w-10 bg-gradient-to-br from-yellow-400 to-orange-500">
                    <AvatarFallback className="bg-gradient-to-br from-yellow-400 to-orange-500 text-white">
                      {post.users.display_name.charAt(0).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="font-semibold">{post.users.display_name}</p>
                    <p className="text-sm text-gray-500">
                      {formatDistanceToNow(new Date(post.created_at), {
                        addSuffix: true,
                      })}
                    </p>
                  </div>
                </button>

                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    className="gap-2"
                    onClick={handleShare}
                  >
                    <Share2 className="h-4 w-4" />
                    Share
                  </Button>
                  <Button variant="outline" size="icon" onClick={handleReport}>
                    <Flag className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Comments Section */}
        <div className="rounded-2xl border bg-white p-8 shadow-sm">
          <h2 className="text-2xl font-bold mb-6">
            {comments.length} Comments
          </h2>

          {/* Add Comment */}
          {currentUser ? (
            <div className="flex items-start gap-4 mb-8 pb-8 border-b">
              <Avatar className="h-10 w-10 bg-gradient-to-br from-yellow-400 to-orange-500">
                <AvatarFallback className="bg-gradient-to-br from-yellow-400 to-orange-500 text-white">
                  {currentUser.display_name.charAt(0).toUpperCase()}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1">
                <Textarea
                  placeholder="Share your thoughts..."
                  value={commentText}
                  onChange={(e) => setCommentText(e.target.value)}
                  className="mb-3 resize-none"
                  rows={3}
                />
                <Button
                  onClick={handleComment}
                  disabled={submitting || !commentText.trim()}
                  className="bg-gradient-to-br from-yellow-400 to-orange-500 hover:from-yellow-500 hover:to-orange-600 gap-2 shadow-lg shadow-orange-500/30"
                >
                  <Send className="h-4 w-4" />
                  {submitting ? "Posting..." : "Post Comment"}
                </Button>
              </div>
            </div>
          ) : (
            <div className="mb-8 pb-8 border-b text-center">
              <p className="text-gray-600 mb-4">Sign in to leave a comment</p>
              <Button
                onClick={() => router.push("/auth/signin")}
                className="bg-gradient-to-br from-yellow-400 to-orange-500 hover:from-yellow-500 hover:to-orange-600 shadow-lg shadow-orange-500/30"
              >
                Sign In
              </Button>
            </div>
          )}

          {/* Comments List */}
          {comments.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              No comments yet. Be the first to comment!
            </div>
          ) : (
            <div className="space-y-6">
              {comments.map((comment) => (
                <div key={comment.id} className="flex items-start gap-4">
                  <button
                    onClick={() =>
                      router.push(`/profile/${comment.users.username}`)
                    }
                    className="hover:opacity-70 transition-opacity"
                  >
                    <Avatar className="h-10 w-10 bg-gradient-to-br from-yellow-400 to-orange-500">
                      <AvatarFallback className="bg-gradient-to-br from-yellow-400 to-orange-500 text-white">
                        {comment.users.display_name.charAt(0).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                  </button>
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <button
                        onClick={() =>
                          router.push(`/profile/${comment.users.username}`)
                        }
                        className="font-semibold hover:underline"
                      >
                        {comment.users.display_name}
                      </button>
                      <span className="text-sm text-gray-500">
                        •{" "}
                        {formatDistanceToNow(new Date(comment.created_at), {
                          addSuffix: true,
                        })}
                      </span>
                    </div>
                    <p className="text-gray-700 whitespace-pre-wrap">
                      {comment.content}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
