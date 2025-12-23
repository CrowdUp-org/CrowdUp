"use client";

import Header from "@/components/Header";
import { Button } from "@/components/ui/button";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { use, useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import { getCurrentUserId } from "@/lib/auth";
import {
    getPendingVerifications,
    approveVerification,
    rejectVerification
} from "@/app/actions/verification";
import { Shield, CheckCircle2, XCircle, AlertCircle, Loader2 } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { toast } from "sonner"; // Assuming sonner is used, given sonner.tsx exists

interface VerificationRequest {
    id: string;
    role: string;
    created_at: string;
    verification_status: string;
    verification_date: string;
    verification_notes: string | null;
    users: {
        id: string;
        username: string;
        display_name: string;
        email: string;
        avatar_url: string | null;
    };
    companies: {
        id: string;
        name: string;
        display_name: string;
        logo_url: string | null;
    };
}

export default function AdminVerificationPage() {
    const router = useRouter();
    const [loading, setLoading] = useState(true);
    const [isAdmin, setIsAdmin] = useState(false);
    const [requests, setRequests] = useState<VerificationRequest[]>([]);
    const [processingId, setProcessingId] = useState<string | null>(null);

    // Rejection dialog state
    const [rejectingId, setRejectingId] = useState<string | null>(null);
    const [rejectionReason, setRejectionReason] = useState("");
    const [rejectDialogOpen, setRejectDialogOpen] = useState(false);

    useEffect(() => {
        checkAdminAndFetch();
    }, []);

    const checkAdminAndFetch = async () => {
        try {
            const userId = getCurrentUserId();
            if (!userId) {
                router.push("/auth/signin");
                return;
            }

            // Check admin status client-side first
            const { data: userData } = await supabase
                .from("users")
                .select("is_platform_admin")
                .eq("id", userId)
                .single();

            if (!userData?.is_platform_admin) {
                router.push("/dashboard"); // Redirect non-admins
                return;
            }

            setIsAdmin(true);

            // Fetch requests using server action
            const data = await getPendingVerifications(userId);
            setRequests(data as any); // Casting because of loose types in server action return
        } catch (error) {
            console.error("Error loading verification page:", error);
            toast.error("Failed to load verification requests");
        } finally {
            setLoading(false);
        }
    };

    const handleApprove = async (requestId: string) => {
        try {
            setProcessingId(requestId);
            const userId = getCurrentUserId();
            if (!userId) return;

            await approveVerification(userId, requestId);
            toast.success("Request approved");

            // Remove from list
            setRequests(prev => prev.filter(r => r.id !== requestId));
        } catch (error) {
            console.error("Error approving:", error);
            toast.error("Failed to approve request");
        } finally {
            setProcessingId(null);
        }
    };

    const openRejectDialog = (requestId: string) => {
        setRejectingId(requestId);
        setRejectionReason("");
        setRejectDialogOpen(true);
    };

    const handleReject = async () => {
        if (!rejectingId || !rejectionReason.trim()) return;

        try {
            setProcessingId(rejectingId);
            const userId = getCurrentUserId();
            if (!userId) return;

            await rejectVerification(userId, rejectingId, rejectionReason);
            toast.success("Request rejected");

            // Remove from list
            setRequests(prev => prev.filter(r => r.id !== rejectingId));
            setRejectDialogOpen(false);
        } catch (error) {
            console.error("Error rejecting:", error);
            toast.error("Failed to reject request");
        } finally {
            setProcessingId(null);
            setRejectingId(null);
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
            </div>
        );
    }

    if (!isAdmin) return null; // Should have redirected

    return (
        <div className="min-h-screen bg-gray-50">
            <Header />
            <main className="mx-auto max-w-7xl px-6 pt-24 pb-8">
                <div className="flex items-center gap-3 mb-8">
                    <Shield className="h-8 w-8 text-blue-600" />
                    <div>
                        <h1 className="text-2xl font-bold">Verification Requests</h1>
                        <p className="text-gray-600">Manage company verification requests</p>
                    </div>
                </div>

                <Card>
                    <CardHeader>
                        <CardTitle>Pending Requests</CardTitle>
                        <CardDescription>
                            {requests.length === 0
                                ? "No pending verification requests found."
                                : `Found ${requests.length} pending requests.`}
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        {requests.length > 0 && (
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>Company</TableHead>
                                        <TableHead>Representative</TableHead>
                                        <TableHead>Role</TableHead>
                                        <TableHead>Requested</TableHead>
                                        <TableHead className="text-right">Actions</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {requests.map((request) => (
                                        <TableRow key={request.id}>
                                            <TableCell>
                                                <div className="flex items-center gap-3">
                                                    <Avatar className="h-9 w-9 bg-gray-100 border">
                                                        {request.companies.logo_url ? (
                                                            <AvatarImage src={request.companies.logo_url} />
                                                        ) : (
                                                            <AvatarFallback>{request.companies.display_name.charAt(0)}</AvatarFallback>
                                                        )}
                                                    </Avatar>
                                                    <div>
                                                        <p className="font-medium">{request.companies.display_name}</p>
                                                        <p className="text-xs text-gray-500">@{request.companies.name}</p>
                                                    </div>
                                                </div>
                                            </TableCell>
                                            <TableCell>
                                                <div className="flex items-center gap-3">
                                                    <Avatar className="h-8 w-8">
                                                        <AvatarImage src={request.users.avatar_url || undefined} />
                                                        <AvatarFallback>{request.users.display_name.charAt(0)}</AvatarFallback>
                                                    </Avatar>
                                                    <div>
                                                        <p className="text-sm font-medium">{request.users.display_name}</p>
                                                        <p className="text-xs text-gray-500">{request.users.email}</p>
                                                    </div>
                                                </div>
                                            </TableCell>
                                            <TableCell>
                                                <Badge variant="outline">
                                                    {request.role === 'owner' ? 'Owner' : 'Admin'}
                                                </Badge>
                                            </TableCell>
                                            <TableCell className="text-sm text-gray-500">
                                                {request.verification_date && formatDistanceToNow(new Date(request.verification_date), { addSuffix: true })}
                                            </TableCell>
                                            <TableCell className="text-right">
                                                <div className="flex justify-end gap-2">
                                                    <Button
                                                        size="sm"
                                                        variant="outline"
                                                        className="bg-green-50 text-green-700 hover:bg-green-100 hover:text-green-800 border-green-200"
                                                        onClick={() => handleApprove(request.id)}
                                                        disabled={!!processingId}
                                                    >
                                                        {processingId === request.id ? (
                                                            <Loader2 className="h-4 w-4 animate-spin" />
                                                        ) : (
                                                            <><CheckCircle2 className="h-4 w-4 mr-1" /> Approve</>
                                                        )}
                                                    </Button>
                                                    <Button
                                                        size="sm"
                                                        variant="outline"
                                                        className="bg-red-50 text-red-700 hover:bg-red-100 hover:text-red-800 border-red-200"
                                                        onClick={() => openRejectDialog(request.id)}
                                                        disabled={!!processingId}
                                                    >
                                                        <XCircle className="h-4 w-4 mr-1" /> Reject
                                                    </Button>
                                                </div>
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        )}
                    </CardContent>
                </Card>

                {/* Rejection Dialog */}
                <Dialog open={rejectDialogOpen} onOpenChange={setRejectDialogOpen}>
                    <DialogContent>
                        <DialogHeader>
                            <DialogTitle>Reject Verification Request</DialogTitle>
                            <DialogDescription>
                                Please provide a reason for rejecting this request. This will be visible to the user.
                            </DialogDescription>
                        </DialogHeader>
                        <div className="py-4">
                            <Textarea
                                placeholder="Reason for rejection (e.g., identity mismatch, insufficient documents...)"
                                value={rejectionReason}
                                onChange={(e) => setRejectionReason(e.target.value)}
                                rows={4}
                            />
                        </div>
                        <DialogFooter>
                            <Button variant="outline" onClick={() => setRejectDialogOpen(false)}>Cancel</Button>
                            <Button
                                variant="destructive"
                                onClick={handleReject}
                                disabled={!rejectionReason.trim() || !!processingId}
                            >
                                {processingId ? "Rejecting..." : "Reject Request"}
                            </Button>
                        </DialogFooter>
                    </DialogContent>
                </Dialog>
            </main>
        </div>
    );
}
