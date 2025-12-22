"use client";

import Header from "@/components/Header";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Switch } from "@/components/ui/switch";
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
import { Separator } from "@/components/ui/separator";
import { Camera, Bell, Shield, Trash2, Download, AlertTriangle } from "lucide-react";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { getCurrentUser, getCurrentUserId, changePassword } from "@/lib/auth";
import { supabase } from "@/lib/supabase";
import { compressAndUploadImage } from "@/lib/imageUpload";
import { useAuth } from "@/contexts/AuthContext";

export default function SettingsPage() {
  const router = useRouter();
  const { refreshUser } = useAuth();
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
  
  // Privacy Settings
  const [privacySettings, setPrivacySettings] = useState({
    profileVisibility: true,
    showActivity: true,
    allowMessages: true,
  });
  
  // Notification Settings
  const [notificationSettings, setNotificationSettings] = useState({
    emailNotifications: true,
    projectUpdates: true,
    newFollowers: true,
    messages: true,
  });
  
  // Delete account state
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [deleteConfirmText, setDeleteConfirmText] = useState("");

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

    // Refresh auth context to update header and other components
    refreshUser();

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

  const handlePrivacyUpdate = async (key: keyof typeof privacySettings, value: boolean) => {
    setPrivacySettings({ ...privacySettings, [key]: value });
    // TODO: Save to backend
    const userId = getCurrentUserId();
    if (!userId) return;
    
    await supabase
      .from("user_settings")
      .upsert({
        user_id: userId,
        privacy_settings: { ...privacySettings, [key]: value },
      });
  };

  const handleNotificationUpdate = async (key: keyof typeof notificationSettings, value: boolean) => {
    setNotificationSettings({ ...notificationSettings, [key]: value });
    // TODO: Save to backend
    const userId = getCurrentUserId();
    if (!userId) return;
    
    await supabase
      .from("user_settings")
      .upsert({
        user_id: userId,
        notification_settings: { ...notificationSettings, [key]: value },
      });
  };

  const handleExportData = async () => {
    const userId = getCurrentUserId();
    if (!userId) return;

    try {
      // Fetch user data
      const { data: userData } = await supabase
        .from("users")
        .select("*")
        .eq("id", userId)
        .single();

      // Create JSON file
      const dataStr = JSON.stringify(userData, null, 2);
      const dataBlob = new Blob([dataStr], { type: "application/json" });
      const url = URL.createObjectURL(dataBlob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `crowdup-data-${new Date().toISOString().split("T")[0]}.json`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);

      setSuccess("Data exported successfully!");
    } catch (error) {
      setError("Failed to export data");
    }
  };

  const handleDeleteAccount = async () => {
    if (deleteConfirmText !== "DELETE") {
      setError("Please type DELETE to confirm");
      return;
    }

    setDeleteLoading(true);
    const userId = getCurrentUserId();
    if (!userId) return;

    try {
      // Delete user account
      const { error: deleteError } = await supabase
        .from("users")
        .delete()
        .eq("id", userId);

      if (deleteError) throw deleteError;

      // Clear local storage
      localStorage.removeItem("user");
      localStorage.removeItem("userId");

      // Redirect to home
      router.push("/");
    } catch (error) {
      setError("Failed to delete account");
      setDeleteLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <main className="mx-auto max-w-4xl px-3 sm:px-4 md:px-6 pt-20 sm:pt-24 pb-8">
        <h1 className="text-2xl sm:text-3xl font-bold mb-2">Settings</h1>
        <p className="text-sm sm:text-base text-gray-600 mb-6 sm:mb-8">Manage your account settings and preferences</p>

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
        <div className="bg-white rounded-xl sm:rounded-2xl border shadow-sm p-4 sm:p-6 md:p-8 mb-4 sm:mb-6">
          <h2 className="text-lg sm:text-xl font-bold mb-4 sm:mb-6">Profile Information</h2>
          
          {/* Avatar */}
          <div className="flex flex-col sm:flex-row items-center sm:items-start gap-4 sm:gap-6 mb-6">
            <div className="relative flex-shrink-0">
              <Avatar className="h-20 w-20 sm:h-24 sm:w-24 bg-gradient-to-br from-yellow-400 to-orange-500 ring-4 ring-orange-200">
                {formData.avatar_url ? (
                  <img src={formData.avatar_url} alt="Profile" className="h-full w-full object-cover" />
                ) : (
                  <AvatarFallback className="bg-gradient-to-br from-yellow-400 to-orange-500 text-white text-2xl sm:text-3xl">
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
                className="absolute bottom-0 right-0 rounded-full h-7 w-7 sm:h-8 sm:w-8 bg-gradient-to-br from-yellow-400 to-orange-500 hover:from-yellow-500 hover:to-orange-600 shadow-lg shadow-orange-500/30 border-2 border-white"
              >
                <Camera className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-white" />
              </Button>
            </div>
            <div className="text-center sm:text-left">
              <p className="font-semibold mb-1 text-sm sm:text-base">Profile Picture</p>
              <p className="text-xs sm:text-sm text-gray-600 mb-2">
                {uploadingImage ? "Uploading..." : "Click camera icon to upload"}
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
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
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
        <div className="bg-white rounded-xl sm:rounded-2xl border shadow-sm p-4 sm:p-6 md:p-8 mb-4 sm:mb-6">
          <h2 className="text-lg sm:text-xl font-bold mb-4 sm:mb-6">Security</h2>

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

        {/* Privacy Settings */}
        <div className="bg-white rounded-xl sm:rounded-2xl border shadow-sm p-4 sm:p-6 md:p-8 mb-4 sm:mb-6">
          <div className="flex items-center gap-2 mb-6">
            <Shield className="h-5 w-5 text-orange-500" />
            <h2 className="text-lg sm:text-xl font-bold">Privacy</h2>
          </div>

          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label className="text-base">Public Profile</Label>
                <p className="text-sm text-gray-500">Allow others to view your profile</p>
              </div>
              <Switch
                checked={privacySettings.profileVisibility}
                onCheckedChange={(checked) => handlePrivacyUpdate("profileVisibility", checked)}
              />
            </div>

            <Separator />

            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label className="text-base">Show Activity</Label>
                <p className="text-sm text-gray-500">Display your recent activity on your profile</p>
              </div>
              <Switch
                checked={privacySettings.showActivity}
                onCheckedChange={(checked) => handlePrivacyUpdate("showActivity", checked)}
              />
            </div>

            <Separator />

            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label className="text-base">Allow Messages</Label>
                <p className="text-sm text-gray-500">Let other users send you direct messages</p>
              </div>
              <Switch
                checked={privacySettings.allowMessages}
                onCheckedChange={(checked) => handlePrivacyUpdate("allowMessages", checked)}
              />
            </div>
          </div>
        </div>

        {/* Notification Settings */}
        <div className="bg-white rounded-xl sm:rounded-2xl border shadow-sm p-4 sm:p-6 md:p-8 mb-4 sm:mb-6">
          <div className="flex items-center gap-2 mb-6">
            <Bell className="h-5 w-5 text-orange-500" />
            <h2 className="text-lg sm:text-xl font-bold">Notifications</h2>
          </div>

          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label className="text-base">Email Notifications</Label>
                <p className="text-sm text-gray-500">Receive notifications via email</p>
              </div>
              <Switch
                checked={notificationSettings.emailNotifications}
                onCheckedChange={(checked) => handleNotificationUpdate("emailNotifications", checked)}
              />
            </div>

            <Separator />

            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label className="text-base">Project Updates</Label>
                <p className="text-sm text-gray-500">Get notified about projects you follow</p>
              </div>
              <Switch
                checked={notificationSettings.projectUpdates}
                onCheckedChange={(checked) => handleNotificationUpdate("projectUpdates", checked)}
              />
            </div>

            <Separator />

            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label className="text-base">New Followers</Label>
                <p className="text-sm text-gray-500">Get notified when someone follows you</p>
              </div>
              <Switch
                checked={notificationSettings.newFollowers}
                onCheckedChange={(checked) => handleNotificationUpdate("newFollowers", checked)}
              />
            </div>

            <Separator />

            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label className="text-base">Messages</Label>
                <p className="text-sm text-gray-500">Get notified about new messages</p>
              </div>
              <Switch
                checked={notificationSettings.messages}
                onCheckedChange={(checked) => handleNotificationUpdate("messages", checked)}
              />
            </div>
          </div>
        </div>

        {/* Data & Account Management */}
        <div className="bg-white rounded-xl sm:rounded-2xl border shadow-sm p-4 sm:p-6 md:p-8 mb-4 sm:mb-6">
          <h2 className="text-lg sm:text-xl font-bold mb-4 sm:mb-6">Data & Account</h2>

          <div className="space-y-6">
            {/* Export Data */}
            <div className="flex items-start justify-between">
              <div className="space-y-1">
                <Label className="text-base">Export Your Data</Label>
                <p className="text-sm text-gray-500">Download a copy of your account data</p>
              </div>
              <Button
                variant="outline"
                onClick={handleExportData}
                className="flex items-center gap-2"
              >
                <Download className="h-4 w-4" />
                Export
              </Button>
            </div>

            <Separator />

            {/* Delete Account */}
            <div className="flex items-start justify-between">
              <div className="space-y-1">
                <Label className="text-base text-red-600">Delete Account</Label>
                <p className="text-sm text-gray-500">Permanently delete your account and all data</p>
              </div>
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button
                    variant="outline"
                    className="border-red-200 text-red-600 hover:bg-red-50 hover:text-red-700 flex items-center gap-2"
                  >
                    <Trash2 className="h-4 w-4" />
                    Delete
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle className="flex items-center gap-2 text-red-600">
                      <AlertTriangle className="h-5 w-5" />
                      Delete Account
                    </AlertDialogTitle>
                    <AlertDialogDescription className="space-y-4">
                      <p>
                        This action cannot be undone. This will permanently delete your account and
                        remove all your data from our servers.
                      </p>
                      <div>
                        <Label htmlFor="delete-confirm" className="text-sm font-medium">
                          Type <span className="font-bold">DELETE</span> to confirm:
                        </Label>
                        <Input
                          id="delete-confirm"
                          value={deleteConfirmText}
                          onChange={(e) => setDeleteConfirmText(e.target.value)}
                          className="mt-2"
                          placeholder="DELETE"
                        />
                      </div>
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel onClick={() => setDeleteConfirmText("")}>
                      Cancel
                    </AlertDialogCancel>
                    <AlertDialogAction
                      onClick={handleDeleteAccount}
                      disabled={deleteConfirmText !== "DELETE" || deleteLoading}
                      className="bg-red-600 hover:bg-red-700"
                    >
                      {deleteLoading ? "Deleting..." : "Delete Account"}
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            </div>
          </div>
        </div>

        {/* Save Button */}
        <div className="flex flex-col sm:flex-row justify-end gap-2 sm:gap-3">
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
