"use client";

import Header from "@/components/Header";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Send } from "lucide-react";
import { supabase } from "@/lib/supabase";
import { getCurrentUserId } from "@/lib/auth";

const COMPANY_COLORS: Record<string, string> = {
  instagram: "#E1306C",
  whatsapp: "#25D366",
  spotify: "#1DB954",
  discord: "#5865F2",
  netflix: "#E50914",
  twitter: "#1DA1F2",
};

export default function CreatePostPage() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    type: "",
    company: "",
    title: "",
    description: "",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    const userId = getCurrentUserId();
    if (!userId) {
      router.push("/auth/signin");
    }
  }, [router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    const userId = getCurrentUserId();
    if (!userId) {
      router.push("/auth/signin");
      return;
    }

    if (!formData.type || !formData.company || !formData.title || !formData.description) {
      setError("Please fill in all fields");
      return;
    }

    setLoading(true);

    const typeMap: Record<string, string> = {
      bug: "Bug Report",
      feature: "Feature Request",
      complaint: "Complaint",
    };

    const { error: insertError } = await supabase.from("posts").insert({
      user_id: userId,
      type: typeMap[formData.type] as "Bug Report" | "Feature Request" | "Complaint",
      company: formData.company.charAt(0).toUpperCase() + formData.company.slice(1),
      company_color: COMPANY_COLORS[formData.company] || "#000000",
      title: formData.title,
      description: formData.description,
    });

    if (insertError) {
      setError("Failed to create post. Please try again.");
      setLoading(false);
      return;
    }

    router.push("/");
    router.refresh();
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <main className="mx-auto max-w-3xl px-6 pt-24 pb-8">
        <div className="bg-white rounded-2xl border shadow-sm p-8">
          <h1 className="text-3xl font-bold mb-2">Create a Post</h1>
          <p className="text-gray-600 mb-8">Share your feedback with the community</p>

          <form onSubmit={handleSubmit} className="space-y-6">
            {error && (
              <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-xl text-sm">
                {error}
              </div>
            )}

            {/* Post Type */}
            <div>
              <Label htmlFor="type" className="text-base font-semibold mb-2 block">
                Post Type
              </Label>
              <Select value={formData.type} onValueChange={(value) => setFormData({ ...formData, type: value })}>
                <SelectTrigger className="h-12">
                  <SelectValue placeholder="Select post type..." />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="bug">🐛 Bug Report</SelectItem>
                  <SelectItem value="feature">💡 Feature Request</SelectItem>
                  <SelectItem value="complaint">⚠️ Complaint</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Company */}
            <div>
              <Label htmlFor="company" className="text-base font-semibold mb-2 block">
                Company/App
              </Label>
              <Select value={formData.company} onValueChange={(value) => setFormData({ ...formData, company: value })}>
                <SelectTrigger className="h-12">
                  <SelectValue placeholder="Select company..." />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="instagram">Instagram</SelectItem>
                  <SelectItem value="whatsapp">WhatsApp</SelectItem>
                  <SelectItem value="spotify">Spotify</SelectItem>
                  <SelectItem value="discord">Discord</SelectItem>
                  <SelectItem value="netflix">Netflix</SelectItem>
                  <SelectItem value="twitter">Twitter</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Title */}
            <div>
              <Label htmlFor="title" className="text-base font-semibold mb-2 block">
                Title
              </Label>
              <Input
                id="title"
                placeholder="Brief summary of your feedback..."
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                className="h-12"
              />
            </div>

            {/* Description */}
            <div>
              <Label htmlFor="description" className="text-base font-semibold mb-2 block">
                Description
              </Label>
              <Textarea
                id="description"
                placeholder="Provide detailed information about your feedback..."
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                rows={8}
                className="resize-none"
              />
            </div>

            {/* Actions */}
            <div className="flex items-center gap-3 pt-4">
              <Button
                type="submit"
                disabled={loading}
                className="flex-1 h-12 bg-gradient-to-br from-yellow-400 to-orange-500 hover:from-yellow-500 hover:to-orange-600 text-white gap-2 shadow-lg shadow-orange-500/30"
              >
                <Send className="h-4 w-4" />
                {loading ? "Publishing..." : "Publish Post"}
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={() => router.push("/")}
                className="h-12"
              >
                Cancel
              </Button>
            </div>
          </form>
        </div>
      </main>
    </div>
  );
}