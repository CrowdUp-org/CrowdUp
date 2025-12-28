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
} from "lucide-react";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import { getCurrentUserId } from "@/lib/auth";
import {
  getAllUsers,
  updateUserAdminStatus,
  isCurrentUserAdmin,
} from "@/lib/verification";
import { format } from "date-fns";
import { toast } from "sonner";
import { ReputationBadge } from "@/components/ui/reputation-badge";

export default function UserManagementPage() {
  const router = useRouter();
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [searchQuery, setSearchQuery] = useState("");
  const pageSize = 20;

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
              onClick={() => router.push("/admin/verification")}
              variant="outline"
              className="gap-2"
            >
              <Shield className="h-4 w-4" />
              Verifications
            </Button>
            <Button
              onClick={() => router.push("/leaderboard")}
              variant="outline"
              className="gap-2"
            >
              <TrendingUp className="h-4 w-4" />
              Leaderboard
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
                      <ReputationBadge score={user.reputation_score} />
                    </td>
                    <td className="px-6 py-4 text-gray-600 text-sm">
                      {format(new Date(user.created_at), "MMM d, yyyy")}
                    </td>
                    <td className="px-6 py-4">
                      {user.is_admin ? (
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-blue-100 text-blue-700 text-xs font-medium">
                          <Shield className="h-3 w-3" />
                          Admin
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-gray-100 text-gray-700 text-xs font-medium">
                          User
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <Button
                        variant={user.is_admin ? "outline" : "default"}
                        size="sm"
                        className={
                          user.is_admin
                            ? "text-red-600 hover:text-red-700 hover:bg-red-50"
                            : "bg-blue-600 hover:bg-blue-700"
                        }
                        onClick={() =>
                          handleToggleAdmin(user.id, user.is_admin)
                        }
                      >
                        {user.is_admin ? (
                          <span className="flex items-center gap-1">
                            <ShieldAlert className="h-3 w-3" />
                            Revoke Admin
                          </span>
                        ) : (
                          <span className="flex items-center gap-1">
                            <Shield className="h-3 w-3" />
                            Make Admin
                          </span>
                        )}
                      </Button>
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
      </main>
    </div>
  );
}
