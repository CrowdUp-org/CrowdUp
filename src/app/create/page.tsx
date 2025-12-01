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
import { CompanySelect } from "@/components/ui/company-select";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Send, AlertCircle, Lightbulb, Bug, X } from "lucide-react";
import { supabase } from "@/lib/supabase";
import { getCurrentUserId } from "@/lib/auth";
import { cn } from "@/lib/utils";

const postTypes = [
  { value: "bug", label: "Bug Report", icon: Bug, color: "bg-red-50 border-red-200 text-red-700 dark:bg-red-950 dark:border-red-800 dark:text-red-300", description: "Report something that's broken" },
  { value: "feature", label: "Feature Request", icon: Lightbulb, color: "bg-blue-50 border-blue-200 text-blue-700 dark:bg-blue-950 dark:border-blue-800 dark:text-blue-300", description: "Suggest a new feature" },
  { value: "complaint", label: "Complaint", icon: AlertCircle, color: "bg-yellow-50 border-yellow-200 text-yellow-700 dark:bg-yellow-950 dark:border-yellow-800 dark:text-yellow-300", description: "Voice your concerns" },
];

export default function CreatePostPage() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    type: "",
    company: "",
    companyColor: "",
    title: "",
    description: "",
    priority: "medium",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [charCount, setCharCount] = useState(0);

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
      company: formData.company,
      company_color: formData.companyColor || "#6B7280",
      title: formData.title,
      description: formData.description,
      priority: formData.priority,
      status: "open",
    } as any);

    if (insertError) {
      setError("Failed to create post. Please try again.");
      setLoading(false);
      return;
    }

    router.push("/");
    router.refresh();
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950">
      <Header />
      <main className="mx-auto max-w-3xl px-4 sm:px-6 pt-24 pb-8">
        <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800 shadow-sm p-6 sm:p-8">
          <h1 className="text-2xl sm:text-3xl font-bold mb-2 text-gray-900 dark:text-gray-100">Create a Post</h1>
          <p className="text-gray-600 dark:text-gray-400 mb-8">Share your feedback with the community</p>

          <form onSubmit={handleSubmit} className="space-y-6">
            {error && (
              <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-xl text-sm">
                {error}
              </div>
            )}

            {/* Post Type - Visual Cards */}
            <div>
              <Label className="text-base font-semibold mb-3 block text-gray-900 dark:text-gray-100">
                What type of feedback?
              </Label>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                {postTypes.map((type) => {
                  const Icon = type.icon;
                  const isSelected = formData.type === type.value;
                  return (
                    <button
                      key={type.value}
                      type="button"
                      onClick={() => setFormData({ ...formData, type: type.value })}
                      className={cn(
                        "relative flex flex-col items-center p-4 rounded-xl border-2 transition-all text-center",
                        isSelected
                          ? "border-orange-500 bg-orange-50 dark:bg-orange-950 ring-2 ring-orange-500/20"
                          : "border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600 bg-white dark:bg-gray-900"
                      )}
                    >
                      <div className={cn(
                        "h-10 w-10 rounded-lg flex items-center justify-center mb-2",
                        type.color
                      )}>
                        <Icon className="h-5 w-5" />
                      </div>
                      <span className="font-medium text-sm text-gray-900 dark:text-gray-100">{type.label}</span>
                      <span className="text-xs text-gray-500 dark:text-gray-400 mt-1">{type.description}</span>
                      {isSelected && (
                        <div className="absolute top-2 right-2 h-5 w-5 bg-orange-500 rounded-full flex items-center justify-center">
                          <span className="text-white text-xs">✓</span>
                        </div>
                      )}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Company - Autocomplete */}
            <div>
              <Label className="text-base font-semibold mb-2 block text-gray-900 dark:text-gray-100">
                Company/App
              </Label>
              <CompanySelect
                value={formData.company}
                onChange={(company, color) => setFormData({ ...formData, company, companyColor: color })}
                placeholder="Search or type company name..."
              />
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
                Can&apos;t find your company? Just type the name to add it.
              </p>
            </div>

            {/* Title */}
            <div>
              <Label htmlFor="title" className="text-base font-semibold mb-2 block text-gray-900 dark:text-gray-100">
                Title
              </Label>
              <Input
                id="title"
                placeholder="Brief summary of your feedback..."
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                className="h-12 dark:bg-gray-900 dark:border-gray-700"
                maxLength={150}
              />
              <div className="flex justify-between mt-1">
                <p className="text-xs text-gray-500 dark:text-gray-400">Make it clear and specific</p>
                <span className={cn(
                  "text-xs",
                  formData.title.length > 120 ? "text-orange-500" : "text-gray-400"
                )}>
                  {formData.title.length}/150
                </span>
              </div>
            </div>

            {/* Description */}
            <div>
              <Label htmlFor="description" className="text-base font-semibold mb-2 block text-gray-900 dark:text-gray-100">
                Description
              </Label>
              <Textarea
                id="description"
                placeholder="Provide detailed information about your feedback...

• What happened?
• What did you expect?
• Steps to reproduce (for bugs)"
                value={formData.description}
                onChange={(e) => {
                  setFormData({ ...formData, description: e.target.value });
                  setCharCount(e.target.value.length);
                }}
                rows={8}
                className="resize-none dark:bg-gray-900 dark:border-gray-700"
                maxLength={2000}
              />
              <div className="flex justify-between mt-1">
                <p className="text-xs text-gray-500 dark:text-gray-400">Be as detailed as possible</p>
                <span className={cn(
                  "text-xs",
                  charCount > 1800 ? "text-orange-500" : "text-gray-400"
                )}>
                  {charCount}/2000
                </span>
              </div>
            </div>

            {/* Priority */}
            <div>
              <Label className="text-base font-semibold mb-2 block text-gray-900 dark:text-gray-100">
                Priority
              </Label>
              <div className="flex gap-2">
                {["low", "medium", "high", "critical"].map((priority) => (
                  <button
                    key={priority}
                    type="button"
                    onClick={() => setFormData({ ...formData, priority })}
                    className={cn(
                      "px-4 py-2 rounded-lg text-sm font-medium border transition-all capitalize",
                      formData.priority === priority
                        ? priority === "critical"
                          ? "bg-red-500 text-white border-red-500"
                          : priority === "high"
                          ? "bg-orange-500 text-white border-orange-500"
                          : priority === "medium"
                          ? "bg-yellow-500 text-white border-yellow-500"
                          : "bg-green-500 text-white border-green-500"
                        : "bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 hover:border-gray-300"
                    )}
                  >
                    {priority}
                  </button>
                ))}
              </div>
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