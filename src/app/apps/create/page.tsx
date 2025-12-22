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
import { supabase } from "@/lib/supabase";
import { getCurrentUserId } from "@/lib/auth";
import { compressAndUploadImage } from "@/lib/imageUpload";
import { Send, Upload } from "lucide-react";

export default function CreateAppPage() {
  const router = useRouter();
  const [companies, setCompanies] = useState<any[]>([]);
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    app_url: "",
    logo_url: "",
    category: "",
    company_id: "",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [uploadingLogo, setUploadingLogo] = useState(false);

  useEffect(() => {
    const userId = getCurrentUserId();
    if (!userId) {
      router.push("/auth/signin");
      return;
    }
    fetchCompanies();
  }, [router]);

  const fetchCompanies = async () => {
    const { data } = await supabase
      .from("companies")
      .select("*")
      .order("name");
    
    if (data) {
      setCompanies(data);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    const userId = getCurrentUserId();
    if (!userId) {
      router.push("/auth/signin");
      return;
    }

    if (!formData.name || !formData.description || !formData.category) {
      setError("Please fill in all required fields");
      return;
    }

    setLoading(true);

    const { data, error: insertError } = await supabase
      .from("apps")
      .insert({
        user_id: userId,
        name: formData.name,
        description: formData.description,
        app_url: formData.app_url || null,
        logo_url: formData.logo_url || null,
        category: formData.category,
        company_id: formData.company_id || null,
      })
      .select()
      .single();

    if (insertError) {
      setError("Failed to create app. Please try again.");
      setLoading(false);
      return;
    }

    if (data) {
      router.push(`/apps/${data.id}`);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <main className="mx-auto max-w-3xl px-6 pt-24 pb-8">
        <div className="bg-white rounded-2xl border shadow-sm p-8">
          <h1 className="text-3xl font-bold mb-2">Create App Page</h1>
          <p className="text-gray-600 mb-8">
            Share your app with the community and get feedback
          </p>

          <form onSubmit={handleSubmit} className="space-y-6">
            {error && (
              <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-xl text-sm">
                {error}
              </div>
            )}

            {/* App Name */}
            <div>
              <Label htmlFor="name" className="text-base font-semibold mb-2 block">
                App Name *
              </Label>
              <Input
                id="name"
                placeholder="My Awesome App"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="h-12"
                required
              />
            </div>

            {/* Description */}
            <div>
              <Label htmlFor="description" className="text-base font-semibold mb-2 block">
                Description *
              </Label>
              <Textarea
                id="description"
                placeholder="Describe what your app does and why people should use it..."
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                rows={6}
                className="resize-none"
                required
              />
            </div>

            {/* Category */}
            <div>
              <Label htmlFor="category" className="text-base font-semibold mb-2 block">
                Category *
              </Label>
              <Select
                value={formData.category}
                onValueChange={(value) => setFormData({ ...formData, category: value })}
              >
                <SelectTrigger className="h-12">
                  <SelectValue placeholder="Select category..." />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Productivity">📦 Productivity</SelectItem>
                  <SelectItem value="Social">👥 Social</SelectItem>
                  <SelectItem value="Entertainment">🎮 Entertainment</SelectItem>
                  <SelectItem value="Communication">💬 Communication</SelectItem>
                  <SelectItem value="Music">🎵 Music</SelectItem>
                  <SelectItem value="Photo & Video">📸 Photo & Video</SelectItem>
                  <SelectItem value="Shopping">🛍️ Shopping</SelectItem>
                  <SelectItem value="Business">📊 Business</SelectItem>
                  <SelectItem value="Education">📚 Education</SelectItem>
                  <SelectItem value="Health & Fitness">❤️ Health & Fitness</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* App URL */}
            <div>
              <Label htmlFor="app_url" className="text-base font-semibold mb-2 block">
                App URL (Optional)
              </Label>
              <Input
                id="app_url"
                type="url"
                placeholder="https://myapp.com"
                value={formData.app_url}
                onChange={(e) => setFormData({ ...formData, app_url: e.target.value })}
                className="h-12"
              />
            </div>

            {/* Logo Upload */}
            <div>
              <Label className="text-base font-semibold mb-2 block">
                App Logo (Optional)
              </Label>
              <div className="flex items-center gap-4">
                {formData.logo_url && (
                  <img
                    src={formData.logo_url}
                    alt="Logo preview"
                    className="h-20 w-20 rounded-lg object-cover border-2 border-gray-200"
                  />
                )}
                <div className="flex-1">
                  <input
                    type="file"
                    id="logo-upload"
                    accept="image/*"
                    className="hidden"
                    onChange={async (e) => {
                      const file = e.target.files?.[0];
                      if (!file) return;

                      setUploadingLogo(true);
                      const result = await compressAndUploadImage(file, 300, 300, 0.85);
                      
                      if (result.success && result.dataUrl) {
                        setFormData({ ...formData, logo_url: result.dataUrl });
                      } else {
                        setError(result.error || "Failed to upload logo");
                      }
                      setUploadingLogo(false);
                    }}
                  />
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => document.getElementById("logo-upload")?.click()}
                    disabled={uploadingLogo}
                    className="w-full gap-2"
                  >
                    <Upload className="h-4 w-4" />
                    {uploadingLogo ? "Uploading..." : "Upload Logo"}
                  </Button>
                  <p className="text-xs text-gray-500 mt-2">
                    Upload an image (max 300x300px, compressed automatically)
                  </p>
                  {formData.logo_url && (
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => setFormData({ ...formData, logo_url: "" })}
                      className="text-xs mt-2"
                    >
                      Remove Logo
                    </Button>
                  )}
                </div>
              </div>
            </div>

            {/* Company */}
            <div>
              <Label htmlFor="company" className="text-base font-semibold mb-2 block">
                Company (Optional)
              </Label>
              <Select
                value={formData.company_id}
                onValueChange={(value) => setFormData({ ...formData, company_id: value })}
              >
                <SelectTrigger className="h-12">
                  <SelectValue placeholder="Select company or leave blank..." />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">No Company</SelectItem>
                  {companies.map((company) => (
                    <SelectItem key={company.id} value={company.id}>
                      {company.display_name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <p className="text-xs text-gray-500 mt-1">
                Link your app to an existing company page
              </p>
            </div>

            {/* Actions */}
            <div className="flex items-center gap-3 pt-4">
              <Button
                type="submit"
                disabled={loading}
                className="flex-1 h-12 bg-gradient-to-br from-yellow-400 to-orange-500 hover:from-yellow-500 hover:to-orange-600 text-white gap-2 shadow-lg shadow-orange-500/30"
              >
                <Send className="h-4 w-4" />
                {loading ? "Creating..." : "Create App Page"}
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
