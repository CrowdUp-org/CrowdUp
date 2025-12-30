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
import { Badge } from "@/components/ui/badge";
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
import { VerifiedBadge } from "@/components/ui/verified-badge";
import { VerificationForm } from "@/components/ui/verification-form";
import { getVerificationStatus } from "@/lib/services/verification.service";
import {
  Settings,
  Upload,
  Trash2,
  Users,
  UserPlus,
  ExternalLink,
  Shield,
  Crown,
  Mail,
  BadgeCheck,
} from "lucide-react";
import { use, useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import { getCurrentUserId } from "@/lib/services/auth.service";
import { compressAndUploadImage } from "@/lib/utils/image";

interface Company {
  id: string;
  name: string;
  display_name: string;
  description: string | null;
  logo_url: string | null;
  website: string | null;
  category: string | null;
  owner_id: string | null;
}

interface Member {
  id: string;
  role: "owner" | "admin" | "member";
  created_at: string;
  users: {
    id: string;
    username: string;
    display_name: string;
    avatar_url: string | null;
  };
}

export default function CompanyManagePage({
  params,
}: {
  params: Promise<{ name: string }>;
}) {
  const { name } = use(params);
  const router = useRouter();
  const [company, setCompany] = useState<Company | null>(null);
  const [members, setMembers] = useState<Member[]>([]);
  const [isOwner, setIsOwner] = useState(false);
  const [isOwnerOrAdmin, setIsOwnerOrAdmin] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [uploadingLogo, setUploadingLogo] = useState(false);
  const [formData, setFormData] = useState({
    display_name: "",
    description: "",
    website: "",
    logo_url: "",
    category: "",
  });
  const [newMemberEmail, setNewMemberEmail] = useState("");
  const [newMemberRole, setNewMemberRole] = useState<"admin" | "member">(
    "member",
  );
  const [inviting, setInviting] = useState(false);
  const [verificationStatus, setVerificationStatus] = useState<{
    verified: boolean;
    status: "pending" | "approved" | "rejected" | null;
  } | null>(null);
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);

  useEffect(() => {
    fetchCompanyAndMembers();
  }, [name]);

  const fetchCompanyAndMembers = async () => {
    const userId = getCurrentUserId();
    if (!userId) {
      router.push("/auth/signin");
      return;
    }

    // Fetch company
    const { data: companyData } = await supabase
      .from("companies")
      .select("*")
      .eq("name", name.toLowerCase())
      .single();

    if (!companyData) {
      router.push("/dashboard");
      return;
    }

    setCompany(companyData as any);
    setFormData({
      display_name: (companyData as any).display_name,
      description: (companyData as any).description || "",
      website: (companyData as any).website || "",
      logo_url: (companyData as any).logo_url || "",
      category: (companyData as any).category || "",
    });

    const { data: memberData } = (await supabase
      .from("company_members")
      .select("role")
      .eq("company_id", (companyData as any).id)
      .eq("user_id", userId)
      .single()) as any;

    if (!memberData) {
      router.push(`/company/${name}`);
      return;
    }

    const userRole = (memberData as any).role;
    setIsOwner(userRole === "owner");
    setIsOwnerOrAdmin(userRole === "owner" || userRole === "admin");

    const { data: membersData } = (await supabase
      .from("company_members")
      .select(
        `
        id,
        role,
        created_at,
        users (
          id,
          username,
          display_name,
          avatar_url
        )
      `,
      )
      .eq("company_id", (companyData as any).id)
      .order("created_at", { ascending: true })) as any;

    if (membersData) {
      setMembers(membersData as any);
    }

    // Set current user ID and fetch verification status
    setCurrentUserId(userId);
    const verStatus = await getVerificationStatus(
      userId,
      (companyData as any).id,
    );
    if (verStatus) {
      setVerificationStatus(verStatus);
    }

    setLoading(false);
  };

  const handleSave = async () => {
    setError("");
    setSuccess("");
    setSaving(true);

    if (!formData.display_name || !formData.description) {
      setError("Company name and description are required");
      setSaving(false);
      return;
    }

    const { error: updateError } = (await (supabase.from("companies") as any)
      .update({
        display_name: formData.display_name,
        description: formData.description,
        website: formData.website || null,
        logo_url: formData.logo_url || null,
        category: formData.category || null,
      })
      .eq("id", company!.id)) as any;

    if (updateError) {
      setError("Failed to update company. Please try again.");
      setSaving(false);
      return;
    }

    setSuccess("Company updated successfully!");
    await fetchCompanyAndMembers();
    setSaving(false);
  };

  const handleInviteMember = async () => {
    setError("");
    setInviting(true);

    if (!newMemberEmail) {
      setError("Email is required");
      setInviting(false);
      return;
    }

    // Find user by email
    const { data: userData } = await supabase
      .from("users")
      .select("id")
      .eq("email", newMemberEmail)
      .single();

    if (!userData) {
      setError("User not found with this email");
      setInviting(false);
      return;
    }

    // Check if already a member
    const { data: existingMember } = (await supabase
      .from("company_members")
      .select("id")
      .eq("company_id", company!.id)
      .eq("user_id", (userData as any).id)
      .single()) as any;

    if (existingMember) {
      setError("User is already a member");
      setInviting(false);
      return;
    }

    // Add member
    const { error: insertError } = (await supabase
      .from("company_members")
      .insert({
        company_id: company!.id,
        user_id: (userData as any).id,
        role: newMemberRole,
      } as any)) as any;

    if (insertError) {
      setError("Failed to add member");
      setInviting(false);
      return;
    }

    setSuccess("Member added successfully!");
    setNewMemberEmail("");
    await fetchCompanyAndMembers();
    setInviting(false);
  };

  const handleRemoveMember = async (memberId: string, memberUserId: string) => {
    const userId = getCurrentUserId();
    if (memberUserId === userId) {
      setError("You cannot remove yourself");
      return;
    }

    const { error: deleteError } = await supabase
      .from("company_members")
      .delete()
      .eq("id", memberId);

    if (!deleteError) {
      setSuccess("Member removed");
      await fetchCompanyAndMembers();
    }
  };

  const handleChangeRole = async (
    memberId: string,
    newRole: "admin" | "member",
  ) => {
    const { error: updateError } = (await (
      supabase.from("company_members") as any
    )
      .update({ role: newRole })
      .eq("id", memberId)) as any;

    if (!updateError) {
      setSuccess("Role updated");
      await fetchCompanyAndMembers();
    }
  };

  const handleDeleteCompany = async () => {
    if (!isOwner) return;

    const { error: deleteError } = await supabase
      .from("companies")
      .delete()
      .eq("id", company!.id);

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
            <h1 className="text-3xl font-bold mb-2">Manage Company</h1>
            <p className="text-gray-600">{company?.display_name}</p>
          </div>
          <div className="flex gap-2">
            <Button
              variant="outline"
              onClick={() => router.push(`/company/${name}`)}
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

        {/* Company Information */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Settings className="h-5 w-5" />
              Company Information
            </CardTitle>
            <CardDescription>
              Update your company details and branding
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Logo */}
            <div className="flex items-center gap-6">
              <div className="relative">
                <Avatar className="h-24 w-24 bg-gradient-to-br from-yellow-400 to-orange-500">
                  {formData.logo_url ? (
                    <img
                      src={formData.logo_url}
                      alt="Logo"
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    <AvatarFallback className="bg-gradient-to-br from-yellow-400 to-orange-500 text-white text-3xl">
                      {formData.display_name.charAt(0).toUpperCase()}
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
                <p className="font-semibold mb-1">Company Logo</p>
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
              <Label htmlFor="display_name">Company Name *</Label>
              <Input
                id="display_name"
                value={formData.display_name}
                onChange={(e) =>
                  setFormData({ ...formData, display_name: e.target.value })
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
                <Label htmlFor="website">Website</Label>
                <Input
                  id="website"
                  value={formData.website}
                  onChange={(e) =>
                    setFormData({ ...formData, website: e.target.value })
                  }
                  className="mt-2"
                  placeholder="https://example.com"
                />
              </div>
              <div>
                <Label htmlFor="category">Industry</Label>
                <Select
                  value={formData.category}
                  onValueChange={(value) =>
                    setFormData({ ...formData, category: value })
                  }
                >
                  <SelectTrigger className="mt-2">
                    <SelectValue placeholder="Select industry" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Technology">Technology</SelectItem>
                    <SelectItem value="Finance">Finance</SelectItem>
                    <SelectItem value="Healthcare">Healthcare</SelectItem>
                    <SelectItem value="Education">Education</SelectItem>
                    <SelectItem value="E-commerce">E-commerce</SelectItem>
                    <SelectItem value="Entertainment">Entertainment</SelectItem>
                    <SelectItem value="Other">Other</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="flex justify-end pt-4">
              <Button onClick={handleSave} disabled={saving}>
                {saving ? "Saving..." : "Save Changes"}
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Team Members */}
        {isOwnerOrAdmin && (
          <Card className="mb-6">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="h-5 w-5" />
                Team Members
              </CardTitle>
              <CardDescription>
                Manage your company team and permissions
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Add Member */}
              <div className="bg-gray-50 rounded-lg p-4 space-y-3">
                <div className="flex items-center gap-2 mb-2">
                  <UserPlus className="h-4 w-4" />
                  <h3 className="font-semibold">Invite Member</h3>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <Input
                    placeholder="member@email.com"
                    value={newMemberEmail}
                    onChange={(e) => setNewMemberEmail(e.target.value)}
                  />
                  <Select
                    value={newMemberRole}
                    onValueChange={(v) => setNewMemberRole(v as any)}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="member">Member</SelectItem>
                      <SelectItem value="admin">Admin</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <Button
                  onClick={handleInviteMember}
                  disabled={inviting}
                  size="sm"
                >
                  <Mail className="h-4 w-4 mr-2" />
                  {inviting ? "Inviting..." : "Send Invite"}
                </Button>
              </div>

              {/* Members List */}
              <div className="space-y-2">
                {members.map((member) => (
                  <div
                    key={member.id}
                    className="flex items-center justify-between p-3 rounded-lg border bg-white"
                  >
                    <div className="flex items-center gap-3">
                      <Avatar className="h-10 w-10">
                        {member.users.avatar_url ? (
                          <img
                            src={member.users.avatar_url}
                            alt={member.users.display_name}
                          />
                        ) : (
                          <AvatarFallback>
                            {member.users.display_name.charAt(0).toUpperCase()}
                          </AvatarFallback>
                        )}
                      </Avatar>
                      <div>
                        <p className="font-semibold">
                          {member.users.display_name}
                        </p>
                        <p className="text-sm text-gray-500">
                          @{member.users.username}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      {member.role === "owner" ? (
                        <Badge className="bg-yellow-500">
                          <Crown className="h-3 w-3 mr-1" />
                          Owner
                        </Badge>
                      ) : member.role === "admin" ? (
                        <Badge variant="secondary">
                          <Shield className="h-3 w-3 mr-1" />
                          Admin
                        </Badge>
                      ) : (
                        <Badge variant="outline">Member</Badge>
                      )}
                      {isOwner && member.role !== "owner" && (
                        <div className="flex gap-1">
                          <Select
                            value={member.role}
                            onValueChange={(v) =>
                              handleChangeRole(member.id, v as any)
                            }
                          >
                            <SelectTrigger className="h-8 w-24">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="member">Member</SelectItem>
                              <SelectItem value="admin">Admin</SelectItem>
                            </SelectContent>
                          </Select>
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() =>
                              handleRemoveMember(member.id, member.users.id)
                            }
                          >
                            <Trash2 className="h-4 w-4 text-red-600" />
                          </Button>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Verification */}
        {company && currentUserId && (
          <Card className="mb-6">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BadgeCheck className="h-5 w-5 text-blue-500" />
                Verification
              </CardTitle>
              <CardDescription>
                Get verified to show you're an official representative
              </CardDescription>
            </CardHeader>
            <CardContent>
              <VerificationForm
                userId={currentUserId}
                companyId={company.id}
                companyName={company.display_name}
                currentStatus={verificationStatus?.status}
                onSuccess={() => fetchCompanyAndMembers()}
              />
            </CardContent>
          </Card>
        )}

        {/* Danger Zone */}
        {isOwner && (
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
                  <Button variant="destructive">Delete Company</Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>
                      Are you absolutely sure?
                    </AlertDialogTitle>
                    <AlertDialogDescription>
                      This action cannot be undone. This will permanently delete
                      the company page, remove all members, and delete all
                      associated data.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                    <AlertDialogAction
                      onClick={handleDeleteCompany}
                      className="bg-red-600"
                    >
                      Delete Company
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            </CardContent>
          </Card>
        )}
      </main>
    </div>
  );
}
