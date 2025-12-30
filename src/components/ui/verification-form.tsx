"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { requestVerification } from "@/lib/services/verification.service";
import { BadgeCheck, Loader2, CheckCircle, XCircle, Clock } from "lucide-react";

interface VerificationFormProps {
  userId: string;
  companyId: string;
  companyName: string;
  currentStatus?: "pending" | "approved" | "rejected" | null;
  onSuccess?: () => void;
}

export function VerificationForm({
  userId,
  companyId,
  companyName,
  currentStatus,
  onSuccess,
}: VerificationFormProps) {
  const [businessEmail, setBusinessEmail] = useState("");
  const [roleDescription, setRoleDescription] = useState("");
  const [additionalNotes, setAdditionalNotes] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);

    if (!businessEmail.trim()) {
      setError("Business email is required");
      setIsSubmitting(false);
      return;
    }

    const result = await requestVerification(userId, companyId, {
      businessEmail: businessEmail.trim(),
      roleDescription: roleDescription.trim(),
      additionalNotes: additionalNotes.trim(),
    });

    if (result.success) {
      setSuccess(true);
      onSuccess?.();
    } else {
      setError(result.error || "Failed to submit verification request");
    }

    setIsSubmitting(false);
  };

  // Already verified
  if (currentStatus === "approved") {
    return (
      <div className="p-4 rounded-lg bg-green-500/10 border border-green-500/20">
        <div className="flex items-center gap-2 text-green-500">
          <CheckCircle className="w-5 h-5" />
          <span className="font-medium">Verified Representative</span>
        </div>
        <p className="text-sm text-muted-foreground mt-1">
          You are a verified representative of {companyName}.
        </p>
      </div>
    );
  }

  // Pending verification
  if (currentStatus === "pending" || success) {
    return (
      <div className="p-4 rounded-lg bg-yellow-500/10 border border-yellow-500/20">
        <div className="flex items-center gap-2 text-yellow-500">
          <Clock className="w-5 h-5" />
          <span className="font-medium">Verification Pending</span>
        </div>
        <p className="text-sm text-muted-foreground mt-1">
          Your verification request is being reviewed. This usually takes 1-2
          business days.
        </p>
      </div>
    );
  }

  // Rejected - allow resubmission
  if (currentStatus === "rejected") {
    return (
      <div className="space-y-4">
        <div className="p-4 rounded-lg bg-red-500/10 border border-red-500/20">
          <div className="flex items-center gap-2 text-red-500">
            <XCircle className="w-5 h-5" />
            <span className="font-medium">Verification Rejected</span>
          </div>
          <p className="text-sm text-muted-foreground mt-1">
            Your previous verification request was not approved. You can submit
            a new request below.
          </p>
        </div>
        <VerificationFormFields
          businessEmail={businessEmail}
          setBusinessEmail={setBusinessEmail}
          roleDescription={roleDescription}
          setRoleDescription={setRoleDescription}
          additionalNotes={additionalNotes}
          setAdditionalNotes={setAdditionalNotes}
          isSubmitting={isSubmitting}
          error={error}
          onSubmit={handleSubmit}
        />
      </div>
    );
  }

  // No request yet - show form
  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <BadgeCheck className="w-5 h-5 text-blue-500" />
        <h3 className="font-semibold">Get Verified</h3>
      </div>
      <p className="text-sm text-muted-foreground">
        Verify your identity as a {companyName} representative to get a verified
        badge and access additional features.
      </p>
      <VerificationFormFields
        businessEmail={businessEmail}
        setBusinessEmail={setBusinessEmail}
        roleDescription={roleDescription}
        setRoleDescription={setRoleDescription}
        additionalNotes={additionalNotes}
        setAdditionalNotes={setAdditionalNotes}
        isSubmitting={isSubmitting}
        error={error}
        onSubmit={handleSubmit}
      />
    </div>
  );
}

function VerificationFormFields({
  businessEmail,
  setBusinessEmail,
  roleDescription,
  setRoleDescription,
  additionalNotes,
  setAdditionalNotes,
  isSubmitting,
  error,
  onSubmit,
}: {
  businessEmail: string;
  setBusinessEmail: (v: string) => void;
  roleDescription: string;
  setRoleDescription: (v: string) => void;
  additionalNotes: string;
  setAdditionalNotes: (v: string) => void;
  isSubmitting: boolean;
  error: string | null;
  onSubmit: (e: React.FormEvent) => void;
}) {
  return (
    <form onSubmit={onSubmit} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="businessEmail">Business Email *</Label>
        <Input
          id="businessEmail"
          type="email"
          placeholder="you@company.com"
          value={businessEmail}
          onChange={(e) => setBusinessEmail(e.target.value)}
          required
        />
        <p className="text-xs text-muted-foreground">
          Use your company email address for faster verification
        </p>
      </div>

      <div className="space-y-2">
        <Label htmlFor="roleDescription">Your Role</Label>
        <Input
          id="roleDescription"
          placeholder="e.g., Community Manager, Developer Relations"
          value={roleDescription}
          onChange={(e) => setRoleDescription(e.target.value)}
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="additionalNotes">Additional Information</Label>
        <Textarea
          id="additionalNotes"
          placeholder="Any additional information to help verify your identity..."
          value={additionalNotes}
          onChange={(e) => setAdditionalNotes(e.target.value)}
          rows={3}
        />
      </div>

      {error && <div className="text-sm text-red-500">{error}</div>}

      <Button type="submit" disabled={isSubmitting} className="w-full">
        {isSubmitting ? (
          <>
            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
            Submitting...
          </>
        ) : (
          <>
            <BadgeCheck className="w-4 h-4 mr-2" />
            Request Verification
          </>
        )}
      </Button>
    </form>
  );
}

export default VerificationForm;
