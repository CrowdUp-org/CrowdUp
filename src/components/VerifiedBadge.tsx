"use client";

import { CheckCircle2, AlertCircle } from "lucide-react";
import {
    Tooltip,
    TooltipContent,
    TooltipProvider,
    TooltipTrigger,
} from "@/components/ui/tooltip";

interface VerifiedBadgeProps {
    className?: string;
    size?: number;
    showTooltip?: boolean;
}

export function VerifiedBadge({
    className = "",
    size = 16,
    showTooltip = true
}: VerifiedBadgeProps) {
    const badge = (
        <CheckCircle2
            className={`text-blue-500 fill-blue-100 ${className}`}
            size={size}
            strokeWidth={2.5}
            aria-label="Verified Company Representative"
        />
    );

    if (!showTooltip) return badge;

    return (
        <TooltipProvider>
            <Tooltip>
                <TooltipTrigger asChild>
                    <span className="inline-flex items-center cursor-help">
                        {badge}
                    </span>
                </TooltipTrigger>
                <TooltipContent>
                    <p>Verified Company Representative</p>
                </TooltipContent>
            </Tooltip>
        </TooltipProvider>
    );
}

export function UnverifiedBadge({
    className = "",
    size = 16
}: VerifiedBadgeProps) {
    return (
        <TooltipProvider>
            <Tooltip>
                <TooltipTrigger asChild>
                    <span className="inline-flex items-center cursor-help opacity-50">
                        <AlertCircle
                            className={`text-gray-400 ${className}`}
                            size={size}
                        />
                    </span>
                </TooltipTrigger>
                <TooltipContent>
                    <p>Unverified Account</p>
                </TooltipContent>
            </Tooltip>
        </TooltipProvider>
    );
}
