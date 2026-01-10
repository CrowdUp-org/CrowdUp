"use client";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { VerifiedBadge } from "@/components/VerifiedBadge";
import {
  OfficialResponseWithUser,
  ResponseType,
} from "@/lib/services/official-responses.service";
import { formatDistanceToNow } from "date-fns";
import {
  Building2,
  CheckCircle2,
  Clock,
  Lightbulb,
  Pin,
  Search,
  X,
  MoreHorizontal,
  Pencil,
  Trash2,
} from "lucide-react";
import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface OfficialResponseCardProps {
  response: OfficialResponseWithUser;
  currentUserId?: string;
  onEdit?: (response: OfficialResponseWithUser) => void;
  onDelete?: (responseId: string) => void;
  canModify?: boolean;
}

const RESPONSE_TYPE_CONFIG: Record<
  ResponseType,
  {
    label: string;
    icon: React.ElementType;
    color: string;
    bgColor: string;
    borderColor: string;
  }
> = {
  acknowledgment: {
    label: "Acknowledged",
    icon: CheckCircle2,
    color: "text-blue-700",
    bgColor: "bg-blue-50",
    borderColor: "border-blue-200",
  },
  investigating: {
    label: "Investigating",
    icon: Search,
    color: "text-amber-700",
    bgColor: "bg-amber-50",
    borderColor: "border-amber-200",
  },
  planned: {
    label: "Planned",
    icon: Lightbulb,
    color: "text-purple-700",
    bgColor: "bg-purple-50",
    borderColor: "border-purple-200",
  },
  fixed: {
    label: "Fixed",
    icon: CheckCircle2,
    color: "text-green-700",
    bgColor: "bg-green-50",
    borderColor: "border-green-200",
  },
  wont_fix: {
    label: "Won't Fix",
    icon: X,
    color: "text-gray-700",
    bgColor: "bg-gray-50",
    borderColor: "border-gray-200",
  },
  duplicate: {
    label: "Duplicate",
    icon: Clock,
    color: "text-orange-700",
    bgColor: "bg-orange-50",
    borderColor: "border-orange-200",
  },
};

export function OfficialResponseCard({
  response,
  currentUserId,
  onEdit,
  onDelete,
  canModify = false,
}: OfficialResponseCardProps) {
  const router = useRouter();
  const [showMenu, setShowMenu] = useState(false);
  const config = RESPONSE_TYPE_CONFIG[response.response_type];
  const Icon = config.icon;
  const isAuthor = currentUserId === response.responder_id;

  const handleEdit = () => {
    onEdit?.(response);
    setShowMenu(false);
  };

  const handleDelete = () => {
    if (confirm("Are you sure you want to delete this official response?")) {
      onDelete?.(response.id);
    }
    setShowMenu(false);
  };

  return (
    <div
      className={`rounded-2xl border-2 ${config.borderColor} ${config.bgColor} p-6 shadow-sm transition-all hover:shadow-md`}
    >
      {/* Header with badges */}
      <div className="mb-4 flex items-center justify-between">
        <div className="flex items-center gap-2 flex-wrap">
          <Badge
            variant="outline"
            className={`${config.color} ${config.bgColor} ${config.borderColor} border font-semibold`}
          >
            <Building2 className="mr-1.5 h-3.5 w-3.5" />
            Official Response
          </Badge>
          <Badge
            variant="secondary"
            className={`${config.color} ${config.bgColor} font-medium`}
          >
            <Icon className="mr-1.5 h-3.5 w-3.5" />
            {config.label}
          </Badge>
          {response.is_pinned && (
            <Badge
              variant="outline"
              className="border-indigo-200 bg-indigo-50 text-indigo-700"
            >
              <Pin className="mr-1 h-3 w-3 fill-indigo-700" />
              Pinned
            </Badge>
          )}
        </div>

        {canModify && (isAuthor || canModify) && (
          <DropdownMenu open={showMenu} onOpenChange={setShowMenu}>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                size="sm"
                className="h-8 w-8 p-0 hover:bg-white/50"
              >
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              {onEdit && (
                <DropdownMenuItem onClick={handleEdit}>
                  <Pencil className="mr-2 h-4 w-4" />
                  Edit
                </DropdownMenuItem>
              )}
              {onDelete && (
                <DropdownMenuItem
                  onClick={handleDelete}
                  className="text-red-600 focus:text-red-600"
                >
                  <Trash2 className="mr-2 h-4 w-4" />
                  Delete
                </DropdownMenuItem>
              )}
            </DropdownMenuContent>
          </DropdownMenu>
        )}
      </div>

      {/* Responder info */}
      <div className="mb-4 flex items-start gap-4">
        <Avatar className="h-12 w-12 border-2 border-white shadow-sm">
          <AvatarImage
            src={response.users.avatar_url || undefined}
            alt={response.users.display_name}
          />
          <AvatarFallback className="bg-gradient-to-br from-blue-500 to-indigo-600 text-white font-semibold">
            {response.users.display_name.charAt(0).toUpperCase()}
          </AvatarFallback>
        </Avatar>

        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1 flex-wrap">
            <button
              onClick={() => {
                if (response.users.username) {
                  router.push(`/profile/${response.users.username}`);
                }
              }}
              className="font-semibold text-gray-900 hover:underline"
            >
              {response.users.display_name}
            </button>
            <VerifiedBadge size={16} showTooltip={true} />
            {response.companies && (
              <>
                <span className="text-gray-400">·</span>
                <button
                  onClick={() => {
                    if (response.companies?.name) {
                      router.push(`/company/${response.companies.name}`);
                    }
                  }}
                  className="text-sm text-gray-600 hover:underline flex items-center gap-1.5"
                >
                  {response.companies.logo_url && (
                    <img
                      src={response.companies.logo_url}
                      alt={response.companies.display_name}
                      className="h-4 w-4 rounded"
                    />
                  )}
                  {response.companies.display_name}
                </button>
              </>
            )}
          </div>
          <p className="text-sm text-gray-500">
            {formatDistanceToNow(new Date(response.created_at), {
              addSuffix: true,
            })}
            {response.updated_at !== response.created_at && (
              <span className="ml-1">(edited)</span>
            )}
          </p>
        </div>
      </div>

      {/* Response content */}
      <div className="prose prose-sm max-w-none">
        <p className="text-gray-800 whitespace-pre-wrap leading-relaxed">
          {response.content}
        </p>
      </div>
    </div>
  );
}
