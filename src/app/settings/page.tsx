"use client";

import Header from "@/components/Header";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Camera } from "lucide-react";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { getCurrentUser, getCurrentUserId, changePassword } from "@/lib/auth";
import { supabase } from "@/lib/supabase";
import { compressAndUploadImage } from "@/lib/imageUpload";

export default function SettingsPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [formData, setFormData] = useState({
    display_name: "",
    username: "",
    bio: "",
    email: "",
    avatar_url: "",
  });
  const [uploadingImage, setUploadingImage] = useState(false);
  const [passwordData, setPasswordData] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });
  const [passwordLoading, setPasswordLoading] = useState(false);
  const [passwordError, setPasswordError] = useState("");
  const [passwordSuccess, setPasswordSuccess] = useState("");

  useEffect(() => {
    const user = getCurrentUser();
    if (!user) {
      router.push("/auth/signin");
      return;
    }

    setFormData({
      display_name: user.display_name,
      username: user.username,
      bio: user.bio || "",
      email: user.email,
      avatar_url: user.avatar_url || "",
    });
  }, [router]);

  const handleSave = async () => {
    setError("");
    setSuccess("");
    setLoading(true);

    const userId = getCurrentUserId();
    if (!userId) {
      router.push("/auth/signin");
      return;
    }

    const { error: updateError } = await supabase
      .from("users")
      .update({
        display_name: formData.display_name,
        bio: formData.bio,
        avatar_url: formData.avatar_url || null,
      })
      .eq("id", userId);

    if (updateError) {
      setError("Failed to update profile. Please try again.");
      setLoading(false);
      return;
    }

    // Update local storage
    const updatedUser = {
      ...getCurrentUser()!,
      display_name: formData.display_name,
      bio: formData.bio,
      avatar_url: formData.avatar_url || null,
    };
    localStorage.setItem("user", JSON.stringify(updatedUser));

    setSuccess("Profile updated successfully!");
    setLoading(false);
  };

  const handlePasswordChange = async () => {
    setPasswordError("");
    setPasswordSuccess("");

    if (!passwordData.currentPassword || !passwordData.newPassword || !passwordData.confirmPassword) {
      setPasswordError("Please fill in all password fields");
      return;
    }

    if (passwordData.newPassword !== passwordData.confirmPassword) {
      setPasswordError("New passwords do not match");
      return;
    }

    if (passwordData.newPassword.length < 6) {
      setPasswordError("New password must be at least 6 characters");
      return;
    }

    setPasswordLoading(true);

    const result = await changePassword(passwordData.currentPassword, passwordData.newPassword);

    if (result.error) {
      setPasswordError(result.error);
      setPasswordLoading(false);
      return;
    }

    setPasswordSuccess("Password changed successfully!");
    setPasswordData({
      currentPassword: "",
      newPassword: "",
      confirmPassword: "",
    });
    setPasswordLoading(false);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <main className="mx-auto max-w-4xl px-6 pt-24 pb-8">
        <h1 className="text-3xl font-bold mb-2">Settings</h1>
        <p className="text-gray-600 mb-8">Manage your account settings and preferences</p>

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

        {/* Profile Settings */}
        <div className="bg-white rounded-2xl border shadow-sm p-8 mb-6">
          <h2 className="text-xl font-bold mb-6">Profile Information</h2>
          
          {/* Avatar */}
          <div className="flex items-center gap-6 mb-6">
            <div className="relative">
              <Avatar className="h-24 w-24 bg-gradient-to-br from-yellow-400 to-orange-500 ring-4 ring-orange-200">
                {formData.avatar_url ? (
                  <img src={formData.avatar_url} alt="Profile" className="h-full w-full object-cover" />
                ) : (
                  <AvatarFallback className="bg-gradient-to-br from-yellow-400 to-orange-500 text-white text-3xl">
                    {formData.display_name.charAt(0).toUpperCase()}
                  </AvatarFallback>
                )}
              </Avatar>
              <input
                type="file"
                id="avatar-upload"
                accept="image/*"
                className="hidden"
                onChange={async (e) => {
                  const file = e.target.files?.[0];
                  if (!file) return;

                  setUploadingImage(true);
                  const result = await compressAndUploadImage(file, 200, 200, 0.8);
                  
                  if (result.success && result.dataUrl) {
                    setFormData({ ...formData, avatar_url: result.dataUrl });
                  } else {
                    setError(result.error || "Failed to upload image");
                  }
                  setUploadingImage(false);
                }}
              />
              <Button
                size="icon"
                type="button"
                onClick={() => document.getElementById("avatar-upload")?.click()}
                disabled={uploadingImage}
                className="absolute bottom-0 right-0 rounded-full h-8 w-8 bg-gradient-to-br from-yellow-400 to-orange-500 hover:from-yellow-500 hover:to-orange-600 shadow-lg shadow-orange-500/30"
              >
                <Camera className="h-4 w-4" />
              </Button>
            </div>
            <div>
              <p className="font-semibold mb-1">Profile Picture</p>
              <p className="text-sm text-gray-600 mb-2">
                {uploadingImage ? "Uploading..." : "Click camera icon to upload (max 200x200px)"}
              </p>
              {formData.avatar_url && (
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => setFormData({ ...formData, avatar_url: "" })}
                  className="text-xs"
                >
                  Remove Picture
                </Button>
              )}
            </div>
          </div>

          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="display_name">Display Name</Label>
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
                <Label htmlFor="username">Username</Label>
                <Input
                  id="username"
                  value={`@${formData.username}`}
                  disabled
                  className="mt-2 bg-gray-50"
                />
                <p className="text-xs text-gray-500 mt-1">Username cannot be changed</p>
              </div>
            </div>

            <div>
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                value={formData.email}
                disabled
                className="mt-2 bg-gray-50"
              />
              <p className="text-xs text-gray-500 mt-1">Email cannot be changed</p>
            </div>

            <div>
              <Label htmlFor="bio">Bio</Label>
              <Textarea 
                id="bio" 
                value={formData.bio}
                onChange={(e) =>
                  setFormData({ ...formData, bio: e.target.value })
                }
                placeholder="Tell us about yourself..."
                className="mt-2 resize-none"
                rows={3}
              />
            </div>
          </div>
        </div>

        {/* Security Settings */}
        <div className="bg-white rounded-2xl border shadow-sm p-8 mb-6">
          <h2 className="text-xl font-bold mb-6">Security</h2>

          {passwordError && (
            <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-xl text-sm mb-6">
              {passwordError}
            </div>
          )}

          {passwordSuccess && (
            <div className="bg-green-50 border border-green-200 text-green-600 px-4 py-3 rounded-xl text-sm mb-6">
              {passwordSuccess}
            </div>
          )}

          <div className="space-y-4">
            <div>
              <Label htmlFor="currentPassword">Current Password</Label>
              <Input
                id="currentPassword"
                type="password"
                value={passwordData.currentPassword}
                onChange={(e) =>
                  setPasswordData({ ...passwordData, currentPassword: e.target.value })
                }
                className="mt-2"
                placeholder="Enter current password"
              />
            </div>

            <div>
              <Label htmlFor="newPassword">New Password</Label>
              <Input
                id="newPassword"
                type="password"
                value={passwordData.newPassword}
                onChange={(e) =>
                  setPasswordData({ ...passwordData, newPassword: e.target.value })
                }
                className="mt-2"
                placeholder="Enter new password (min 6 characters)"
              />
            </div>

            <div>
              <Label htmlFor="confirmPassword">Confirm New Password</Label>
              <Input
                id="confirmPassword"
                type="password"
                value={passwordData.confirmPassword}
                onChange={(e) =>
                  setPasswordData({ ...passwordData, confirmPassword: e.target.value })
                }
                className="mt-2"
                placeholder="Confirm new password"
              />
            </div>

            <Button
              onClick={handlePasswordChange}
              disabled={passwordLoading}
              className="bg-gradient-to-r from-yellow-400 to-orange-500 hover:from-yellow-500 hover:to-orange-600 shadow-lg shadow-orange-500/30"
            >
              {passwordLoading ? "Changing..." : "Change Password"}
            </Button>
          </div>
        </div>

        {/* Save Button */}
        <div className="flex justify-end gap-3">
          <Button variant="outline" onClick={() => router.push("/")}>
            Cancel
          </Button>
          <Button
            onClick={handleSave}
            disabled={loading}
            className="bg-gradient-to-r from-yellow-400 to-orange-500 hover:from-yellow-500 hover:to-orange-600 shadow-lg shadow-orange-500/30 transition-all hover:scale-105"
          >
            {loading ? "Saving..." : "Save Changes"}
          </Button>
        </div>
      </main>
    </div>
  );
}
