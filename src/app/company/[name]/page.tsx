"use client";

import Header from "@/components/Header";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import PostCard from "@/components/PostCard";
import { ExternalLink, Edit2, BarChart3, Upload } from "lucide-react";
import { use, useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import { getCurrentUserId } from "@/lib/auth";
import { compressAndUploadImage } from "@/lib/imageUpload";
import { formatDistanceToNow } from "date-fns";

interface Company {
  id: string;
  name: string;
  display_name: string;
  description: string | null;
  logo_url: string | null;
  website: string | null;
  category: string | null;
}

export default function CompanyPage({ params }: { params: Promise<{ name: string }> }) {
  const { name } = use(params);
  const router = useRouter();
  const [company, setCompany] = useState<Company | null>(null);
  const [posts, setPosts] = useState<any[]>([]);
  const [apps, setApps] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [commentCounts, setCommentCounts] = useState<Record<string, number>>({});
  const [isOwnerOrAdmin, setIsOwnerOrAdmin] = useState(false);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [editFormData, setEditFormData] = useState({
    display_name: "",
    description: "",
    website: "",
    logo_url: "",
    category: "",
  });
  const [editLoading, setEditLoading] = useState(false);
  const [editError, setEditError] = useState("");
  const [uploadingLogo, setUploadingLogo] = useState(false);

  useEffect(() => {
    fetchCompany();
    fetchPosts();
  }, [name]);

  useEffect(() => {
    if (company) {
      fetchApps();
      checkOwnership();
      setEditFormData({
        display_name: company.display_name,
        description: company.description || "",
        website: company.website || "",
        logo_url: company.logo_url || "",
        category: company.category || "",
      });
    }
  }, [company]);

  const fetchCompany = async () => {
    const { data } = await supabase
      .from("companies")
      .select("*")
      .eq("name", name.toLowerCase())
      .single();

    if (data) {
      setCompany(data);
    }
    setLoading(false);
  };

  const fetchPosts = async () => {
    const { data } = await supabase
      .from("posts")
      .select(`
        *,
        users (username, display_name)
      `)
      .ilike("company", name)
      .order("created_at", { ascending: false });

    if (data) {
      setPosts(data);

      // Fetch comment counts
      const postIds = data.map((p: any) => p.id);
      if (postIds.length > 0) {
        const { data: commentsData } = await supabase
          .from("comments")
          .select("post_id")
          .in("post_id", postIds);

        if (commentsData) {
          const counts: Record<string, number> = {};
          commentsData.forEach((comment: any) => {
            counts[comment.post_id] = (counts[comment.post_id] || 0) + 1;
          });
          setCommentCounts(counts);
        }
      }
    }
  };

  const fetchApps = async () => {
    if (!company) return;

    const { data } = await supabase
      .from("apps")
      .select("*")
      .eq("company_id", company.id);

    if (data) {
      setApps(data);
    }
  };

  const checkOwnership = async () => {
    const userId = getCurrentUserId();
    if (!userId || !company) return;

    const { data } = await supabase
      .from("company_members")
      .select("role")
      .eq("company_id", company.id)
      .eq("user_id", userId)
      .single();

    if (data && (data.role === "owner" || data.role === "admin")) {
      setIsOwnerOrAdmin(true);
    }
  };

  const handleEditCompany = async () => {
    setEditError("");
    setEditLoading(true);

    if (!editFormData.display_name || !editFormData.description) {
      setEditError("Display name and description are required");
      setEditLoading(false);
      return;
    }

    const { error } = await supabase
      .from("companies")
      .update({
        display_name: editFormData.display_name,
        description: editFormData.description,
        website: editFormData.website || null,
        logo_url: editFormData.logo_url || null,
        category: editFormData.category || null,
      })
      .eq("id", company!.id);

    if (error) {
      setEditError("Failed to update company. Please try again.");
      setEditLoading(false);
      return;
    }

    await fetchCompany();
    setEditDialogOpen(false);
    setEditLoading(false);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <main className="mx-auto max-w-5xl px-6 pt-24 pb-8">
          <div className="text-center py-12">
            <p className="text-gray-600">Loading...</p>
          </div>
        </main>
      </div>
    );
  }

  const displayName = company?.display_name || name.charAt(0).toUpperCase() + name.slice(1);
  const logoUrl = company?.logo_url;

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <main className="mx-auto max-w-5xl px-6 pt-24 pb-8">
        {/* Company Header */}
        <div className="bg-white rounded-2xl border shadow-sm p-8 mb-6">
          <div className="flex items-start gap-6">
            {logoUrl ? (
              <img
                src={logoUrl}
                alt={displayName}
                className="w-24 h-24 rounded-2xl object-cover border-2 border-gray-200"
              />
            ) : (
              <div className="w-24 h-24 rounded-2xl bg-gradient-to-br from-yellow-400 to-orange-500 flex items-center justify-center text-white text-4xl font-bold">
                {displayName.charAt(0)}
              </div>
            )}

            <div className="flex-1">
              <div className="flex items-start justify-between mb-2">
                <h1 className="text-3xl font-bold">{displayName}</h1>
                {isOwnerOrAdmin && (
                  <div className="flex gap-2">
                    <Button
                      onClick={() => router.push(`/company/${name}/analytics`)}
                      variant="outline"
                      className="gap-2"
                    >
                      <BarChart3 className="h-4 w-4" />
                      Analytics
                    </Button>
                    <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
                      <DialogTrigger asChild>
                        <Button variant="outline" className="gap-2">
                          <Edit2 className="h-4 w-4" />
                          Edit
                        </Button>
                      </DialogTrigger>
                      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
                        <DialogHeader>
                          <DialogTitle>Edit Company Page</DialogTitle>
                          <DialogDescription>
                            Update your company information
                          </DialogDescription>
                        </DialogHeader>
                        <div className="space-y-4 py-4">
                          {editError && (
                            <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-xl text-sm">
                              {editError}
                            </div>
                          )}
                          <div>
                            <Label htmlFor="edit_display_name">Company Name *</Label>
                            <Input
                              id="edit_display_name"
                              value={editFormData.display_name}
                              onChange={(e) =>
                                setEditFormData({ ...editFormData, display_name: e.target.value })
                              }
                              className="mt-2"
                            />
                          </div>
                          <div>
                            <Label htmlFor="edit_description">Description *</Label>
                            <Textarea
                              id="edit_description"
                              value={editFormData.description}
                              onChange={(e) =>
                                setEditFormData({ ...editFormData, description: e.target.value })
                              }
                              className="mt-2 resize-none"
                              rows={4}
                            />
                          </div>
                          <div>
                            <Label htmlFor="edit_category">Industry</Label>
                            <Select
                              value={editFormData.category}
                              onValueChange={(value) =>
                                setEditFormData({ ...editFormData, category: value })
                              }
                            >
                              <SelectTrigger className="mt-2">
                                <SelectValue placeholder="Select industry..." />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="Technology">💻 Technology</SelectItem>
                                <SelectItem value="Social Media">👥 Social Media</SelectItem>
                                <SelectItem value="Entertainment">🎮 Entertainment</SelectItem>
                                <SelectItem value="E-commerce">🛍️ E-commerce</SelectItem>
                                <SelectItem value="Finance">💰 Finance</SelectItem>
                                <SelectItem value="Healthcare">❤️ Healthcare</SelectItem>
                                <SelectItem value="Education">📚 Education</SelectItem>
                                <SelectItem value="Transportation">🚗 Transportation</SelectItem>
                                <SelectItem value="Food & Beverage">🍔 Food & Beverage</SelectItem>
                                <SelectItem value="Travel">✈️ Travel</SelectItem>
                                <SelectItem value="Gaming">🎯 Gaming</SelectItem>
                                <SelectItem value="Other">📦 Other</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                          <div>
                            <Label htmlFor="edit_website">Website</Label>
                            <Input
                              id="edit_website"
                              type="url"
                              value={editFormData.website}
                              onChange={(e) =>
                                setEditFormData({ ...editFormData, website: e.target.value })
                              }
                              className="mt-2"
                              placeholder="https://www.yourcompany.com"
                            />
                          </div>
                          <div>
                            <Label>Company Logo</Label>
                            <div className="flex items-center gap-4 mt-2">
                              {editFormData.logo_url && (
                                <img
                                  src={editFormData.logo_url}
                                  alt="Logo"
                                  className="h-16 w-16 rounded-lg object-cover border-2 border-gray-200"
                                />
                              )}
                              <div className="flex-1">
                                <input
                                  type="file"
                                  id="edit-logo-upload"
                                  accept="image/*"
                                  className="hidden"
                                  onChange={async (e) => {
                                    const file = e.target.files?.[0];
                                    if (!file) return;

                                    setUploadingLogo(true);
                                    const result = await compressAndUploadImage(file, 300, 300, 0.85);
                                    
                                    if (result.success && result.dataUrl) {
                                      setEditFormData({ ...editFormData, logo_url: result.dataUrl });
                                    } else {
                                      setEditError(result.error || "Failed to upload logo");
                                    }
                                    setUploadingLogo(false);
                                  }}
                                />
                                <Button
                                  type="button"
                                  variant="outline"
                                  onClick={() => document.getElementById("edit-logo-upload")?.click()}
                                  disabled={uploadingLogo}
                                  className="w-full gap-2"
                                >
                                  <Upload className="h-4 w-4" />
                                  {uploadingLogo ? "Uploading..." : "Upload Logo"}
                                </Button>
                                {editFormData.logo_url && (
                                  <Button
                                    type="button"
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => setEditFormData({ ...editFormData, logo_url: "" })}
                                    className="text-xs mt-2"
                                  >
                                    Remove Logo
                                  </Button>
                                )}
                              </div>
                            </div>
                          </div>
                          <div className="flex justify-end gap-3 pt-4">
                            <Button
                              variant="outline"
                              onClick={() => setEditDialogOpen(false)}
                              disabled={editLoading}
                            >
                              Cancel
                            </Button>
                            <Button
                              onClick={handleEditCompany}
                              disabled={editLoading}
                              className="bg-gradient-to-r from-yellow-400 to-orange-500 hover:from-yellow-500 hover:to-orange-600"
                            >
                              {editLoading ? "Saving..." : "Save Changes"}
                            </Button>
                          </div>
                        </div>
                      </DialogContent>
                    </Dialog>
                  </div>
                )}
              </div>
              {company?.description && (
                <p className="text-gray-700 mb-4">{company.description}</p>
              )}
              {company?.category && (
                <span className="inline-block px-3 py-1 bg-gray-100 rounded-full text-sm font-medium text-gray-700 mb-4">
                  {company.category}
                </span>
              )}
              {company?.website && (
                <Button
                  onClick={() => window.open(company.website!, "_blank")}
                  variant="outline"
                  className="gap-2"
                >
                  <ExternalLink className="h-4 w-4" />
                  Visit Website
                </Button>
              )}
            </div>
          </div>
        </div>

        {/* Apps Section */}
        {apps.length > 0 && (
          <div className="mb-6">
            <h2 className="text-2xl font-bold mb-4">Apps by {displayName}</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {apps.map((app) => (
                <button
                  key={app.id}
                  onClick={() => router.push(`/apps/${app.id}`)}
                  className="bg-white rounded-xl border p-6 hover:shadow-md transition-all text-left"
                >
                  <div className="flex items-start gap-4">
                    {app.logo_url ? (
                      <img
                        src={app.logo_url}
                        alt={app.name}
                        className="w-16 h-16 rounded-xl object-cover"
                      />
                    ) : (
                      <div className="w-16 h-16 rounded-xl bg-gradient-to-br from-yellow-400 to-orange-500 flex items-center justify-center text-white text-2xl font-bold">
                        {app.name.charAt(0)}
                      </div>
                    )}
                    <div className="flex-1">
                      <h3 className="font-bold mb-1">{app.name}</h3>
                      <p className="text-sm text-gray-600 line-clamp-2">{app.description}</p>
                      <div className="flex items-center gap-2 mt-2">
                        <span className="text-xs text-gray-500">{app.category}</span>
                        <span className="text-xs text-gray-400">•</span>
                        <span className="text-xs text-gray-500">
                          ⭐ {app.average_rating.toFixed(1)} ({app.total_reviews})
                        </span>
                      </div>
                    </div>
                  </div>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Posts Section */}
        <div>
          <h2 className="text-2xl font-bold mb-4">
            Posts about {displayName} ({posts.length})
          </h2>
          {posts.length === 0 ? (
            <div className="text-center py-12 bg-white rounded-2xl border">
              <p className="text-gray-600 mb-4">No posts yet about {displayName}</p>
              <Button
                onClick={() => router.push("/create")}
                className="bg-gradient-to-br from-yellow-400 to-orange-500 hover:from-yellow-500 hover:to-orange-600"
              >
                Create First Post
              </Button>
            </div>
          ) : (
            <div className="space-y-4">
              {posts.map((post) => (
                <PostCard
                  key={post.id}
                  postId={post.id}
                  type={post.type}
                  company={post.company}
                  companyColor={post.company_color}
                  title={post.title}
                  description={post.description}
                  votes={post.votes}
                  author={post.users.display_name}
                  authorInitial={post.users.display_name.charAt(0).toUpperCase()}
                  timestamp={formatDistanceToNow(new Date(post.created_at), {
                    addSuffix: true,
                  })}
                  comments={commentCounts[post.id] || 0}
                />
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
