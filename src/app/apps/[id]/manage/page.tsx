"use client";

import Header from "@/components/Header";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Settings, Upload, Trash2, ExternalLink } from "lucide-react";
import { use, useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import { getCurrentUserId } from "@/lib/services/auth.service";
import { compressAndUploadImage } from "@/lib/utils/image";

interface AppData {
  id: string;
  name: string;
  description: string;
  app_url: string | null;
  logo_url: string | null;
  category: string;
  user_id: string;
  company_id: string | null;
}

export default function AppManagePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const router = useRouter();
  const [app, setApp] = useState<AppData | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [uploadingLogo, setUploadingLogo] = useState(false);
  const [companies, setCompanies] = useState<any[]>([]);
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    app_url: "",
    logo_url: "",
    category: "",
    company_id: "",
  });

  useEffect(() => {
    fetchApp();
    fetchUserCompanies();
  }, [id]);

  const fetchApp = async () => {
    const userId = getCurrentUserId();
    if (!userId) {
      router.push("/auth/signin");
      return;
    }

    const { data } = await supabase
      .from("apps")
      .select("*")
      .eq("id", id)
      .single();

    if (!data) {
      router.push("/dashboard");
      return;
    }

    // Check ownership
    if ((data as any).user_id !== userId) {
      router.push(`/apps/${id}`);
      return;
    }

    setApp(data as any);
    setFormData({
      name: (data as any).name,
      description: (data as any).description,
      app_url: (data as any).app_url || "",
      logo_url: (data as any).logo_url || "",
      category: (data as any).category,
      company_id: (data as any).company_id || "",
    });

    setLoading(false);
  };

  const fetchUserCompanies = async () => {
    const userId = getCurrentUserId();
    if (!userId) return;

    const { data } = await supabase
      .from("company_members")
      .select(
        `
        companies (
          id,
          name,
          display_name
        )
      `,
      )
      .eq("user_id", userId);

    if (data) {
      setCompanies(data.map((d: any) => d.companies).filter(Boolean));
    }
  };

  const handleSave = async () => {
    setError("");
    setSuccess("");
    setSaving(true);

    if (!formData.name || !formData.description || !formData.category) {
      setError("Name, description, and category are required");
      setSaving(false);
      return;
    }

    const { error: updateError } = (await (supabase.from("apps") as any)
      .update({
        name: formData.name,
        description: formData.description,
        app_url: formData.app_url || null,
        logo_url: formData.logo_url || null,
        category: formData.category,
        company_id: formData.company_id || null,
      })
      .eq("id", id)) as any;

    if (updateError) {
      setError("Failed to update app. Please try again.");
      setSaving(false);
      return;
    }

    setSuccess("App updated successfully!");
    await fetchApp();
    setSaving(false);
  };

  const handleDeleteApp = async () => {
    const { error: deleteError } = await supabase
      .from("apps")
      .delete()
      .eq("id", id);

    if (!deleteError) {
      router.push("/dashboard");
    }
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

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <main className="mx-auto max-w-5xl px-6 pt-24 pb-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-3xl font-bold mb-2">Manage App</h1>
            <p className="text-gray-600">{app?.name}</p>
          </div>
          <div className="flex gap-2">
            <Button
              variant="outline"
              onClick={() => router.push(`/apps/${id}`)}
            >
              <ExternalLink className="h-4 w-4 mr-2" />
              View Page
            </Button>
            <Button variant="outline" onClick={() => router.push("/dashboard")}>
              Back to Dashboard
            </Button>
          </div>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-xl text-sm mb-6">
            {error}
          </div>
        )}

        {success && (
          <div className="bg-green-50 border border-green-200 text-green-600 px-4 py-3 rounded-xl text-sm mb-6">
            {success}
          </div>
        )}

        {/* App Information */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Settings className="h-5 w-5" />
              App Information
            </CardTitle>
            <CardDescription>
              Update your app details and branding
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Logo */}
            <div className="flex items-center gap-6">
              <div className="relative">
                <Avatar className="h-24 w-24 bg-gradient-to-br from-blue-500 to-purple-600">
                  {formData.logo_url ? (
                    <img
                      src={formData.logo_url}
                      alt="Logo"
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    <AvatarFallback className="bg-gradient-to-br from-blue-500 to-purple-600 text-white text-3xl">
                      {formData.name.charAt(0).toUpperCase()}
                    </AvatarFallback>
                  )}
                </Avatar>
                <input
                  type="file"
                  id="logo-upload"
                  accept="image/*"
                  className="hidden"
                  onChange={async (e) => {
                    const file = e.target.files?.[0];
                    if (!file) return;

                    setUploadingLogo(true);
                    const result = await compressAndUploadImage(
                      file,
                      300,
                      300,
                      0.9,
                    );

                    if (result.success && result.dataUrl) {
                      setFormData({ ...formData, logo_url: result.dataUrl });
                    } else {
                      setError(result.error || "Failed to upload logo");
                    }
                    setUploadingLogo(false);
                  }}
                />
                <Button
                  size="icon"
                  type="button"
                  onClick={() =>
                    document.getElementById("logo-upload")?.click()
                  }
                  disabled={uploadingLogo}
                  className="absolute bottom-0 right-0 rounded-full h-8 w-8"
                >
                  <Upload className="h-4 w-4" />
                </Button>
              </div>
              <div>
                <p className="font-semibold mb-1">App Logo</p>
                <p className="text-sm text-gray-600 mb-2">
                  {uploadingLogo ? "Uploading..." : "Click to upload"}
                </p>
                {formData.logo_url && (
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => setFormData({ ...formData, logo_url: "" })}
                  >
                    Remove Logo
                  </Button>
                )}
              </div>
            </div>

            <div>
              <Label htmlFor="name">App Name *</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) =>
                  setFormData({ ...formData, name: e.target.value })
                }
                className="mt-2"
              />
            </div>

            <div>
              <Label htmlFor="description">Description *</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) =>
                  setFormData({ ...formData, description: e.target.value })
                }
                className="mt-2 resize-none"
                rows={4}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="app_url">App URL</Label>
                <Input
                  id="app_url"
                  value={formData.app_url}
                  onChange={(e) =>
                    setFormData({ ...formData, app_url: e.target.value })
                  }
                  className="mt-2"
                  placeholder="https://app.example.com"
                />
              </div>
              <div>
                <Label htmlFor="category">Category *</Label>
                <Select
                  value={formData.category}
                  onValueChange={(value) =>
                    setFormData({ ...formData, category: value })
                  }
                >
                  <SelectTrigger className="mt-2">
                    <SelectValue placeholder="Select category" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Productivity">Productivity</SelectItem>
                    <SelectItem value="Social">Social</SelectItem>
                    <SelectItem value="Entertainment">Entertainment</SelectItem>
                    <SelectItem value="Education">Education</SelectItem>
                    <SelectItem value="Finance">Finance</SelectItem>
                    <SelectItem value="Health">Health</SelectItem>
                    <SelectItem value="Shopping">Shopping</SelectItem>
                    <SelectItem value="Utilities">Utilities</SelectItem>
                    <SelectItem value="Gaming">Gaming</SelectItem>
                    <SelectItem value="Other">Other</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div>
              <Label htmlFor="company">Link to Company (Optional)</Label>
              <Select
                value={formData.company_id}
                onValueChange={(value) =>
                  setFormData({ ...formData, company_id: value })
                }
              >
                <SelectTrigger className="mt-2">
                  <SelectValue placeholder="Select a company" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">No company</SelectItem>
                  {companies.map((company) => (
                    <SelectItem key={company.id} value={company.id}>
                      {company.display_name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="flex justify-end pt-4">
              <Button onClick={handleSave} disabled={saving}>
                {saving ? "Saving..." : "Save Changes"}
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Danger Zone */}
        <Card className="border-red-200">
          <CardHeader>
            <CardTitle className="text-red-600 flex items-center gap-2">
              <Trash2 className="h-5 w-5" />
              Danger Zone
            </CardTitle>
            <CardDescription>
              Permanent actions that cannot be undone
            </CardDescription>
          </CardHeader>
          <CardContent>
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button variant="destructive">Delete App</Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                  <AlertDialogDescription>
                    This action cannot be undone. This will permanently delete
                    the app page and all associated data including reviews.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                  <AlertDialogAction
                    onClick={handleDeleteApp}
                    className="bg-red-600"
                  >
                    Delete App
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
