"use client";

import Header from "@/components/Header";
import {
  History,
  Search,
  ChevronLeft,
  ChevronRight,
  Users,
  LayoutDashboard,
  Clock,
  User,
} from "lucide-react";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  isCurrentUserAdmin,
  getAuditLogs,
} from "@/lib/services/verification.service";
import { getCurrentUserId } from "@/lib/services/auth.service";
import { format } from "date-fns";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

export default function AuditLogsPage() {
  const router = useRouter();
  const [logs, setLogs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);
  const [page, setPage] = useState(1);
  const [searchQuery, setSearchQuery] = useState("");
  const pageSize = 20;

  useEffect(() => {
    checkAdmin();
  }, []);

  useEffect(() => {
    if (isAdmin) {
      fetchLogs();
    }
  }, [isAdmin, page]);

  const checkAdmin = async () => {
    const userId = getCurrentUserId();
    if (!userId) {
      router.push("/auth/signin");
      return;
    }

    const admin = await isCurrentUserAdmin(userId);
    if (!admin) {
      router.push("/");
      return;
    }
    setIsAdmin(true);
  };

  const fetchLogs = async () => {
    setLoading(true);
    const offset = (page - 1) * pageSize;
    const data = await getAuditLogs(pageSize, offset);
    setLogs(data);
    setLoading(false);
  };

  const getActionColor = (action: string) => {
    switch (action) {
      case "ban":
        return "bg-red-100 text-red-700 border-red-200";
      case "unban":
        return "bg-green-100 text-green-700 border-green-200";
      case "promote":
        return "bg-blue-100 text-blue-700 border-blue-200";
      case "demote":
        return "bg-orange-100 text-orange-700 border-orange-200";
      case "reset_password":
        return "bg-purple-100 text-purple-700 border-purple-200";
      case "kick":
        return "bg-gray-100 text-gray-700 border-gray-200";
      default:
        return "bg-gray-100 text-gray-700 border-gray-200";
    }
  };

  const filteredLogs = logs.filter(
    (log) =>
      log.target_user?.username
        ?.toLowerCase()
        .includes(searchQuery.toLowerCase()) ||
      log.admin?.username?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      log.action?.toLowerCase().includes(searchQuery.toLowerCase()),
  );

  if (!isAdmin) return null;

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <main className="mx-auto max-w-6xl px-6 pt-24 pb-12">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold flex items-center gap-3">
              <History className="h-8 w-8 text-blue-600" />
              Audit Logs
            </h1>
            <p className="text-gray-600 mt-1">
              Historical record of administrative actions and security events
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
              onClick={() => router.push("/admin/users")}
              variant="outline"
              className="gap-2"
            >
              <Users className="h-4 w-4" />
              Users
            </Button>
          </div>
        </div>

        {/* Search */}
        <div className="bg-white p-4 rounded-xl border shadow-sm mb-6 flex gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search by admin, target user or action..."
              className="w-full pl-10 pr-4 py-2 rounded-lg border focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </div>

        {/* Logs Table */}
        <div className="bg-white rounded-xl border shadow-sm overflow-hidden">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-gray-50 border-b">
                <th className="px-6 py-4 font-semibold text-gray-700">
                  Timestamp
                </th>
                <th className="px-6 py-4 font-semibold text-gray-700">Admin</th>
                <th className="px-6 py-4 font-semibold text-gray-700">
                  Action
                </th>
                <th className="px-6 py-4 font-semibold text-gray-700">
                  Target
                </th>
                <th className="px-6 py-4 font-semibold text-gray-700">
                  Details
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
                    Loading logs...
                  </td>
                </tr>
              ) : filteredLogs.length === 0 ? (
                <tr>
                  <td
                    colSpan={5}
                    className="px-6 py-12 text-center text-gray-500"
                  >
                    No logs found
                  </td>
                </tr>
              ) : (
                filteredLogs.map((log) => (
                  <tr
                    key={log.id}
                    className="hover:bg-gray-50 transition-colors"
                  >
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center gap-2 text-sm text-gray-600">
                        <Clock className="h-3 w-3" />
                        {format(new Date(log.created_at), "MMM d, HH:mm:ss")}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <div className="w-6 h-6 rounded-full bg-gray-100 flex items-center justify-center">
                          <User className="h-3 w-3 text-gray-500" />
                        </div>
                        <span className="font-medium text-gray-900">
                          {log.admin?.display_name || "System"}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <Badge
                        variant="outline"
                        className={`capitalize font-medium ${getActionColor(
                          log.action,
                        )}`}
                      >
                        {log.action.replace("_", " ")}
                      </Badge>
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-gray-600">
                        @{log.target_user?.username || "unknown"}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-500 max-w-xs truncate">
                      {log.action_details || "-"}
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
                disabled={logs.length < pageSize || loading}
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
