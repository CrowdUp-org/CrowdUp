"use client";

import Header from "@/components/Header";
import { Button } from "@/components/ui/button";
import {
  Users,
  Shield,
  ShieldAlert,
  Search,
  ChevronLeft,
  ChevronRight,
  TrendingUp,
  MoreVertical,
  Ban,
  UserX,
  Key,
  Unlock,
  AlertTriangle,
  LayoutDashboard,
  History,
} from "lucide-react";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import { getCurrentUserId } from "@/lib/services/auth.service";
import {
  getAllUsers,
  updateUserAdminStatus,
  isCurrentUserAdmin,
  banUser,
  unbanUser,
  kickUser,
  resetUserPassword,
} from "@/lib/services/verification.service";
import { format } from "date-fns";
import { toast } from "sonner";
import { ReputationBadge } from "@/components/ui/reputation-badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

export default function UserManagementPage() {
  const router = useRouter();
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [searchQuery, setSearchQuery] = useState("");
  const pageSize = 20;

  // New states for actions
  const [selectedUser, setSelectedUser] = useState<any>(null);
  const [banModalOpen, setBanModalOpen] = useState(false);
  const [banReason, setBanReason] = useState("");
  const [resetPasswordOpen, setResetPasswordOpen] = useState(false);
  const [newPassword, setNewPassword] = useState("");
  const [kickModalOpen, setKickModalOpen] = useState(false);

  useEffect(() => {
    checkAdmin();
  }, []);

  useEffect(() => {
    if (isAdmin) {
      fetchUsers();
    }
  }, [isAdmin, page]);

  const checkAdmin = async () => {
    const userId = getCurrentUserId();
    if (!userId) {
      router.push("/auth/signin");
      return;
    }
    setCurrentUserId(userId);

    const admin = await isCurrentUserAdmin(userId);
    if (!admin) {
      router.push("/");
      return;
    }
    setIsAdmin(true);
  };

  const fetchUsers = async () => {
    setLoading(true);
    const offset = (page - 1) * pageSize;
    const data = await getAllUsers(pageSize, offset);
    setUsers(data);
    setLoading(false);
  };

  const handleToggleAdmin = async (
    targetUserId: string,
    currentStatus: boolean,
  ) => {
    if (targetUserId === currentUserId) {
      toast.error("You cannot remove your own admin status");
      return;
    }

    const { success, error } = await updateUserAdminStatus(
      targetUserId,
      !currentStatus,
      currentUserId!,
    );

    if (success) {
      toast.success(
        `User ${!currentStatus ? "promoted to" : "removed from"} admin`,
      );
      setUsers(
        users.map((u) =>
          u.id === targetUserId ? { ...u, is_admin: !currentStatus } : u,
        ),
      );
    } else {
      toast.error(error || "Failed to update user status");
    }
  };

  const handleBan = async () => {
    if (!selectedUser || !currentUserId) return;

    const { success, error } = await banUser(
      selectedUser.id,
      banReason,
      currentUserId,
    );

    if (success) {
      toast.success(`User ${selectedUser.username} has been banned`);
      setUsers(
        users.map((u) =>
          u.id === selectedUser.id
            ? { ...u, is_banned: true, banned_reason: banReason }
            : u,
        ),
      );
      setBanModalOpen(false);
      setBanReason("");
    } else {
      toast.error(error || "Failed to ban user");
    }
  };

  const handleUnban = async (user: any) => {
    if (!currentUserId) return;

    const { success, error } = await unbanUser(user.id, currentUserId);

    if (success) {
      toast.success(`User ${user.username} has been unbanned`);
      setUsers(
        users.map((u) =>
          u.id === user.id
            ? { ...u, is_banned: false, banned_reason: null }
            : u,
        ),
      );
    } else {
      toast.error(error || "Failed to unban user");
    }
  };

  const handleKick = async () => {
    if (!selectedUser || !currentUserId) return;

    const { success, error } = await kickUser(selectedUser.id, currentUserId);

    if (success) {
      toast.success(`User ${selectedUser.username} has been kicked`);
      setKickModalOpen(false);
    } else {
      toast.error(error || "Failed to kick user");
    }
  };

  const handleResetPassword = async () => {
    if (!selectedUser || !currentUserId || !newPassword) return;

    const { success, error } = await resetUserPassword(
      selectedUser.id,
      newPassword,
      currentUserId,
    );

    if (success) {
      toast.success(`Password reset for ${selectedUser.username}`);
      setResetPasswordOpen(false);
      setNewPassword("");
    } else {
      toast.error(error || "Failed to reset password");
    }
  };

  const filteredUsers = users.filter(
    (user) =>
      user.username?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      user.display_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      user.email?.toLowerCase().includes(searchQuery.toLowerCase()),
  );

  if (!isAdmin) return null;

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <main className="mx-auto max-w-6xl px-6 pt-24 pb-12">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold flex items-center gap-3">
              <Users className="h-8 w-8 text-blue-600" />
              User Management
            </h1>
            <p className="text-gray-600 mt-1">
              Manage platform moderators and view community activity
            </p>
          </div>
          <div className="flex gap-4">
            <Button
              onClick={() => router.push("/admin")}
              variant="outline"
              className="gap-2"
            >
              <LayoutDashboard className="h-4 w-4" />
              Dashboard
            </Button>
            <Button
              onClick={() => router.push("/admin/verification")}
              variant="outline"
              className="gap-2"
            >
              <Shield className="h-4 w-4" />
              Verifications
            </Button>
            <Button
              onClick={() => router.push("/admin/audit")}
              variant="outline"
              className="gap-2"
            >
              <History className="h-4 w-4" />
              Audit Logs
            </Button>
          </div>
        </div>

        {/* Search and Filters */}
        <div className="bg-white p-4 rounded-xl border shadow-sm mb-6 flex gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search users by name, username or email..."
              className="w-full pl-10 pr-4 py-2 rounded-lg border focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </div>

        {/* Users Table */}
        <div className="bg-white rounded-xl border shadow-sm overflow-hidden">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-gray-50 border-b">
                <th className="px-6 py-4 font-semibold text-gray-700">User</th>
                <th className="px-6 py-4 font-semibold text-gray-700">
                  Reputation
                </th>
                <th className="px-6 py-4 font-semibold text-gray-700">
                  Joined
                </th>
                <th className="px-6 py-4 font-semibold text-gray-700">
                  Status
                </th>
                <th className="px-6 py-4 font-semibold text-gray-700 text-right">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {loading ? (
                <tr>
                  <td
                    colSpan={5}
                    className="px-6 py-12 text-center text-gray-500"
                  >
                    Loading users...
                  </td>
                </tr>
              ) : filteredUsers.length === 0 ? (
                <tr>
                  <td
                    colSpan={5}
                    className="px-6 py-12 text-center text-gray-500"
                  >
                    No users found
                  </td>
                </tr>
              ) : (
                filteredUsers.map((user) => (
                  <tr
                    key={user.id}
                    className="hover:bg-gray-50 transition-colors"
                  >
                    <td className="px-6 py-4">
                      <div className="flex flex-col">
                        <span className="font-bold text-gray-900">
                          {user.display_name}
                        </span>
                        <span className="text-sm text-gray-500">
                          @{user.username}
                        </span>
                        <span className="text-xs text-gray-400">
                          {user.email}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <ReputationBadge
                        score={user.reputation_score}
                        level={user.reputation_level}
                      />
                    </td>
                    <td className="px-6 py-4 text-gray-600 text-sm">
                      {format(new Date(user.created_at), "MMM d, yyyy")}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex flex-col gap-1">
                        {user.is_admin ? (
                          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-blue-100 text-blue-700 text-xs font-medium w-fit">
                            <Shield className="h-3 w-3" />
                            Admin
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-gray-100 text-gray-700 text-xs font-medium w-fit">
                            User
                          </span>
                        )}
                        {user.is_banned && (
                          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-red-100 text-red-700 text-xs font-medium w-fit">
                            <Ban className="h-3 w-3" />
                            Banned
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="sm">
                            <MoreVertical className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="w-48">
                          <DropdownMenuLabel>Admin Actions</DropdownMenuLabel>
                          <DropdownMenuSeparator />

                          <DropdownMenuItem
                            onClick={() =>
                              handleToggleAdmin(user.id, user.is_admin)
                            }
                            className={
                              user.is_admin ? "text-red-600" : "text-blue-600"
                            }
                          >
                            {user.is_admin ? (
                              <>
                                <ShieldAlert className="mr-2 h-4 w-4" />
                                Revoke Admin
                              </>
                            ) : (
                              <>
                                <Shield className="mr-2 h-4 w-4" />
                                Make Admin
                              </>
                            )}
                          </DropdownMenuItem>

                          <DropdownMenuItem
                            onClick={() => {
                              setSelectedUser(user);
                              setResetPasswordOpen(true);
                            }}
                          >
                            <Key className="mr-2 h-4 w-4" />
                            Reset Password
                          </DropdownMenuItem>

                          <DropdownMenuItem
                            onClick={() => {
                              setSelectedUser(user);
                              setKickModalOpen(true);
                            }}
                          >
                            <UserX className="mr-2 h-4 w-4" />
                            Kick User
                          </DropdownMenuItem>

                          <DropdownMenuSeparator />

                          {user.is_banned ? (
                            <DropdownMenuItem
                              onClick={() => handleUnban(user)}
                              className="text-green-600 font-medium"
                            >
                              <Unlock className="mr-2 h-4 w-4" />
                              Unban User
                            </DropdownMenuItem>
                          ) : (
                            <DropdownMenuItem
                              onClick={() => {
                                setSelectedUser(user);
                                setBanModalOpen(true);
                              }}
                              className="text-red-600 font-medium"
                            >
                              <Ban className="mr-2 h-4 w-4" />
                              Ban User
                            </DropdownMenuItem>
                          )}
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>

          {/* Pagination */}
          <div className="px-6 py-4 bg-gray-50 border-t flex items-center justify-between">
            <p className="text-sm text-gray-600">Showing page {page}</p>
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page === 1 || loading}
              >
                <ChevronLeft className="h-4 w-4" />
                Previous
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setPage((p) => p + 1)}
                disabled={users.length < pageSize || loading}
              >
                Next
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>

        {/* Ban User Modal */}
        <Dialog open={banModalOpen} onOpenChange={setBanModalOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2 text-red-600">
                <Ban className="h-5 w-5" />
                Ban User: {selectedUser?.username}
              </DialogTitle>
              <DialogDescription>
                This will prevent the user from accessing the platform. This
                action will be logged.
              </DialogDescription>
            </DialogHeader>
            <div className="py-4 space-y-4">
              <div className="space-y-2">
                <Label htmlFor="reason">Reason for Ban</Label>
                <Textarea
                  id="reason"
                  placeholder="Inappropriate behavior, spam, etc."
                  value={banReason}
                  onChange={(e) => setBanReason(e.target.value)}
                />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setBanModalOpen(false)}>
                Cancel
              </Button>
              <Button
                variant="destructive"
                onClick={handleBan}
                disabled={!banReason}
              >
                Confirm Ban
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Kick User Modal */}
        <Dialog open={kickModalOpen} onOpenChange={setKickModalOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <UserX className="h-5 w-5 text-orange-500" />
                Kick User: {selectedUser?.username}
              </DialogTitle>
              <DialogDescription>
                Are you sure you want to kick this user? This will log the
                action in the audit trail.
              </DialogDescription>
            </DialogHeader>
            <DialogFooter>
              <Button variant="outline" onClick={() => setKickModalOpen(false)}>
                Cancel
              </Button>
              <Button
                variant="default"
                className="bg-orange-500 hover:bg-orange-600"
                onClick={handleKick}
              >
                Confirm Kick
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Reset Password Modal */}
        <Dialog open={resetPasswordOpen} onOpenChange={setResetPasswordOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <Key className="h-5 w-5 text-blue-600" />
                Reset Password: {selectedUser?.username}
              </DialogTitle>
              <DialogDescription>
                Enter a new password for this user. This action will be logged.
              </DialogDescription>
            </DialogHeader>
            <div className="py-4 space-y-4">
              <div className="space-y-2">
                <Label htmlFor="password">New Password</Label>
                <Input
                  id="password"
                  type="password"
                  placeholder="Enter new secure password..."
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                />
              </div>
            </div>
            <DialogFooter>
              <Button
                variant="outline"
                onClick={() => setResetPasswordOpen(false)}
              >
                Cancel
              </Button>
              <Button
                variant="default"
                className="bg-blue-600 hover:bg-blue-700"
                onClick={handleResetPassword}
                disabled={!newPassword}
              >
                Reset Password
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </main>
    </div>
  );
}
