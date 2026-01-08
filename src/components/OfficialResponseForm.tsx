"use client";

import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import {
  ResponseType,
  OfficialResponseWithUser,
} from "@/lib/services/official-responses.service";
import { useState, useEffect } from "react";
import {
  CheckCircle2,
  Search,
  Lightbulb,
  X,
  Clock,
  Loader2,
} from "lucide-react";
import { Card } from "@/components/ui/card";

interface OfficialResponseFormProps {
  postId: string;
  existingResponse?: OfficialResponseWithUser;
  onSubmit: (data: {
    content: string;
    responseType: ResponseType;
    isPinned: boolean;
  }) => Promise<void>;
  onCancel: () => void;
  isSubmitting?: boolean;
}

const RESPONSE_TYPE_OPTIONS: {
  value: ResponseType;
  label: string;
  description: string;
  icon: React.ElementType;
}[] = [
  {
    value: "acknowledgment",
    label: "Acknowledged",
    description: "We've seen this feedback",
    icon: CheckCircle2,
  },
  {
    value: "investigating",
    label: "Investigating",
    description: "We're looking into this",
    icon: Search,
  },
  {
    value: "planned",
    label: "Planned",
    description: "This feature/fix is planned",
    icon: Lightbulb,
  },
  {
    value: "fixed",
    label: "Fixed",
    description: "This issue has been resolved",
    icon: CheckCircle2,
  },
  {
    value: "wont_fix",
    label: "Won't Fix",
    description: "We won't be addressing this",
    icon: X,
  },
  {
    value: "duplicate",
    label: "Duplicate",
    description: "Duplicate of another post",
    icon: Clock,
  },
];

export function OfficialResponseForm({
  postId,
  existingResponse,
  onSubmit,
  onCancel,
  isSubmitting = false,
}: OfficialResponseFormProps) {
  const [content, setContent] = useState(existingResponse?.content || "");
  const [responseType, setResponseType] = useState<ResponseType>(
    existingResponse?.response_type || "acknowledgment"
  );
  const [isPinned, setIsPinned] = useState(
    existingResponse?.is_pinned ?? true
  );
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (existingResponse) {
      setContent(existingResponse.content);
      setResponseType(existingResponse.response_type);
      setIsPinned(existingResponse.is_pinned);
    }
  }, [existingResponse]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!content.trim()) {
      setError("Response content is required");
      return;
    }

    if (content.trim().length < 10) {
      setError("Response must be at least 10 characters");
      return;
    }

    try {
      await onSubmit({
        content: content.trim(),
        responseType,
        isPinned,
      });
    } catch (err) {
      setError("Failed to submit response. Please try again.");
      console.error(err);
    }
  };

  const selectedOption = RESPONSE_TYPE_OPTIONS.find(
    (opt) => opt.value === responseType
  );
  const SelectedIcon = selectedOption?.icon || CheckCircle2;

  return (
    <Card className="border-2 border-indigo-200 bg-indigo-50/50 p-6">
      <form onSubmit={handleSubmit} className="space-y-5">
        <div>
          <div className="mb-2 flex items-center justify-between">
            <Label htmlFor="response-type" className="text-base font-semibold">
              Response Type
            </Label>
            {selectedOption && (
              <div className="flex items-center gap-1.5 text-sm text-gray-600">
                <SelectedIcon className="h-4 w-4" />
                <span>{selectedOption.description}</span>
              </div>
            )}
          </div>
          <Select value={responseType} onValueChange={(value) => setResponseType(value as ResponseType)}>
            <SelectTrigger id="response-type" className="bg-white">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {RESPONSE_TYPE_OPTIONS.map((option) => {
                const Icon = option.icon;
                return (
                  <SelectItem key={option.value} value={option.value}>
                    <div className="flex items-center gap-2">
                      <Icon className="h-4 w-4" />
                      <div className="flex flex-col">
                        <span className="font-medium">{option.label}</span>
                        <span className="text-xs text-gray-500">
                          {option.description}
                        </span>
                      </div>
                    </div>
                  </SelectItem>
                );
              })}
            </SelectContent>
          </Select>
        </div>

        <div>
          <Label htmlFor="content" className="text-base font-semibold mb-2 block">
            Official Response
          </Label>
          <Textarea
            id="content"
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="Write your official response here..."
            className="min-h-[150px] bg-white resize-none"
            disabled={isSubmitting}
          />
          <p className="mt-1.5 text-xs text-gray-500">
            {content.length} characters • Min 10 characters
          </p>
        </div>

        <div className="flex items-center space-x-2 rounded-lg border border-gray-200 bg-white p-3">
          <Checkbox
            id="is-pinned"
            checked={isPinned}
            onCheckedChange={(checked) => setIsPinned(checked as boolean)}
            disabled={isSubmitting}
          />
          <div className="flex-1">
            <Label
              htmlFor="is-pinned"
              className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer"
            >
              Pin this response
            </Label>
            <p className="text-xs text-gray-500 mt-1">
              Pinned responses appear at the top of the comments section
            </p>
          </div>
        </div>

        {error && (
          <div className="rounded-lg bg-red-50 border border-red-200 p-3 text-sm text-red-700">
            {error}
          </div>
        )}

        <div className="flex gap-3 pt-2">
          <Button
            type="submit"
            disabled={isSubmitting || !content.trim()}
            className="flex-1 bg-indigo-600 hover:bg-indigo-700"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                {existingResponse ? "Updating..." : "Posting..."}
              </>
            ) : (
              <>{existingResponse ? "Update Response" : "Post Official Response"}</>
            )}
          </Button>
          <Button
            type="button"
            variant="outline"
            onClick={onCancel}
            disabled={isSubmitting}
            className="bg-white"
          >
            Cancel
          </Button>
        </div>
      </form>
    </Card>
  );
}
