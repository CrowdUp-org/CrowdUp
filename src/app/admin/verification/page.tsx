"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Header from "@/components/Header";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { VerifiedBadge } from "@/components/ui/verified-badge";
import {
  getPendingRequests,
  approveVerification,
  rejectVerification,
  isCurrentUserAdmin,
  type VerificationRequest,
} from "@/lib/services/verification.service";
import { getCurrentUserId } from "@/lib/services/auth.service";
import {
  CheckCircle,
  XCircle,
  Building2,
  User,
  Mail,
  Briefcase,
  Clock,
  Shield,
  Loader2,
  LayoutDashboard,
  Users,
  History,
} from "lucide-react";
import { formatDistanceToNow } from "date-fns";

export default function AdminVerificationPage() {
  const router = useRouter();
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);
  const [requests, setRequests] = useState<VerificationRequest[]>([]);
  const [processingId, setProcessingId] = useState<string | null>(null);
  const [rejectNotes, setRejectNotes] = useState<{ [key: string]: string }>({});
  const [showRejectForm, setShowRejectForm] = useState<string | null>(null);

  useEffect(() => {
    checkAdminAndLoadRequests();
  }, []);

  const checkAdminAndLoadRequests = async () => {
    const userId = getCurrentUserId();
    if (!userId) {
      router.push("/auth/signin");
      return;
    }

    const adminCheck = await isCurrentUserAdmin(userId);
    if (!adminCheck) {
      router.push("/");
      return;
    }

    setIsAdmin(true);
    await loadRequests();
    setLoading(false);
  };

  const loadRequests = async () => {
    const pending = await getPendingRequests();
    setRequests(pending);
  };

  const handleApprove = async (requestId: string) => {
    setProcessingId(requestId);
    const result = await approveVerification(requestId);
    if (result.success) {
      await loadRequests();
    }
    setProcessingId(null);
  };

  const handleReject = async (requestId: string) => {
    const notes = rejectNotes[requestId] || "Verification rejected";
    setProcessingId(requestId);
    const result = await rejectVerification(requestId, notes);
    if (result.success) {
      setShowRejectForm(null);
      await loadRequests();
    }
    setProcessingId(null);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <div className="flex items-center justify-center h-[60vh]">
          <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
        </div>
      </div>
    );
  }

  if (!isAdmin) {
    return null;
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="container max-w-4xl mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-3">
            <Shield className="w-8 h-8 text-blue-500" />
            <div>
              <h1 className="text-2xl font-bold">Verification Requests</h1>
              <p className="text-muted-foreground">
                Review and manage company representative verification requests
              </p>
            </div>
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

        {
          requests.length === 0 ? (
            <div className="text-center py-12 bg-card rounded-lg border border-border">
              <VerifiedBadge size="lg" className="mx-auto mb-4 opacity-50" />
              <h3 className="text-lg font-medium mb-2">No Pending Requests</h3>
              <p className="text-muted-foreground">
                All verification requests have been processed.
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {requests.map((request) => (
                <div
                  key={request.id}
                  className="bg-card rounded-lg border border-border p-6"
                >
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center gap-4">
                      {/* Company Info */}
                      <div className="flex items-center gap-2">
                        {request.company?.logo_url ? (
                          <img
                            src={request.company.logo_url}
                            alt={request.company.display_name}
                            className="w-10 h-10 rounded-lg object-cover"
                          />
                        ) : (
                          <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                            <Building2 className="w-5 h-5 text-primary" />
                          </div>
                        )}
                        <div>
                          <div className="font-semibold">
                            {request.company?.display_name || "Unknown Company"}
                          </div>
                          <div className="text-xs text-muted-foreground">
                            @{request.company?.name}
                          </div>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Clock className="w-4 h-4" />
                      {formatDistanceToNow(new Date(request.created_at), {
                        addSuffix: true,
                      })}
                    </div>
                  </div>

                  {/* User Info */}
                  <div className="flex items-center gap-3 mb-4 p-3 bg-muted/50 rounded-lg">
                    <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                      <User className="w-4 h-4 text-primary" />
                    </div>
                    <div className="flex-1">
                      <div className="font-medium">
                        {request.user?.display_name || "Unknown User"}
                      </div>
                      <div className="text-sm text-muted-foreground">
                        @{request.user?.username}
                      </div>
                    </div>
                    <div className="text-xs px-2 py-1 rounded bg-primary/10 text-primary capitalize">
                      {request.role}
                    </div>
                  </div>

                  {/* Verification Documents */}
                  {request.verification_documents && (
                    <div className="space-y-2 mb-4 p-3 bg-muted/30 rounded-lg">
                      {request.verification_documents.businessEmail && (
                        <div className="flex items-center gap-2 text-sm">
                          <Mail className="w-4 h-4 text-muted-foreground" />
                          <span className="text-muted-foreground">Email:</span>
                          <span className="font-medium">
                            {request.verification_documents.businessEmail}
                          </span>
                        </div>
                      )}
                      {request.verification_documents.roleDescription && (
                        <div className="flex items-center gap-2 text-sm">
                          <Briefcase className="w-4 h-4 text-muted-foreground" />
                          <span className="text-muted-foreground">Role:</span>
                          <span>
                            {request.verification_documents.roleDescription}
                          </span>
                        </div>
                      )}
                      {request.verification_documents.additionalNotes && (
                        <div className="text-sm mt-2">
                          <span className="text-muted-foreground">Notes: </span>
                          <span>
                            {request.verification_documents.additionalNotes}
                          </span>
                        </div>
                      )}
                    </div>
                  )}

                  {/* Actions */}
                  {showRejectForm === request.id ? (
                    <div className="space-y-3">
                      <Textarea
                        placeholder="Reason for rejection..."
                        value={rejectNotes[request.id] || ""}
                        onChange={(e) =>
                          setRejectNotes({
                            ...rejectNotes,
                            [request.id]: e.target.value,
                          })
                        }
                        rows={2}
                      />
                      <div className="flex gap-2">
                        <Button
                          variant="destructive"
                          size="sm"
                          onClick={() => handleReject(request.id)}
                          disabled={processingId === request.id}
                        >
                          {processingId === request.id ? (
                            <Loader2 className="w-4 h-4 animate-spin" />
                          ) : (
                            <>
                              <XCircle className="w-4 h-4 mr-1" />
                              Confirm Reject
                            </>
                          )}
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setShowRejectForm(null)}
                        >
                          Cancel
                        </Button>
                      </div>
                    </div>
                  ) : (
                    <div className="flex gap-2">
                      <Button
                        variant="default"
                        size="sm"
                        onClick={() => handleApprove(request.id)}
                        disabled={processingId === request.id}
                        className="bg-green-600 hover:bg-green-700"
                      >
                        {processingId === request.id ? (
                          <Loader2 className="w-4 h-4 animate-spin" />
                        ) : (
                          <>
                            <CheckCircle className="w-4 h-4 mr-1" />
                            Approve
                          </>
                        )}
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setShowRejectForm(request.id)}
                        className="text-red-500 border-red-500/20 hover:bg-red-500/10"
                      >
                        <XCircle className="w-4 h-4 mr-1" />
                        Reject
                      </Button>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )
        }
      </main >
    </div >
  );
}
