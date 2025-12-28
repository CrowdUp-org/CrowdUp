"use client";

import { useState, useEffect, useRef } from "react";
import { Check, ChevronsUpDown, Plus, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { supabase } from "@/lib/supabase";

interface Company {
  id: string;
  name: string;
  logo_url?: string;
  color?: string;
  is_verified?: boolean;
  category?: string;
}

interface CompanySelectProps {
  value: string;
  onChange: (value: string, color: string) => void;
  placeholder?: string;
  className?: string;
}

// Fallback colors for companies without a color
const FALLBACK_COLORS = [
  "#3B82F6",
  "#EF4444",
  "#10B981",
  "#F59E0B",
  "#8B5CF6",
  "#EC4899",
  "#06B6D4",
  "#84CC16",
  "#F97316",
  "#6366F1",
];

function getColorForName(name: string): string {
  const hash = name
    .split("")
    .reduce((acc, char) => acc + char.charCodeAt(0), 0);
  return FALLBACK_COLORS[hash % FALLBACK_COLORS.length];
}

export function CompanySelect({
  value,
  onChange,
  placeholder = "Select company...",
  className,
}: CompanySelectProps) {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");
  const [companies, setCompanies] = useState<Company[]>([]);
  const [loading, setLoading] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Fetch companies from database
  useEffect(() => {
    const fetchCompanies = async () => {
      setLoading(true);
      try {
        const { data, error } = await supabase
          .from("companies")
          .select("*")
          .order("post_count", { ascending: false })
          .limit(50);

        if (!error && data) {
          setCompanies(data as Company[]);
        }
      } catch (e) {
        console.error("Failed to fetch companies:", e);
      } finally {
        setLoading(false);
      }
    };

    fetchCompanies();
  }, []);

  // Filter companies based on search
  const filteredCompanies = companies.filter((company) =>
    company.name.toLowerCase().includes(search.toLowerCase()),
  );

  // Check if search matches any existing company
  const exactMatch = companies.find(
    (c) => c.name.toLowerCase() === search.toLowerCase(),
  );
  const showCreateOption = search.length > 0 && !exactMatch;

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(e.target as Node)
      ) {
        setOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleSelect = (company: Company) => {
    onChange(company.name, company.color || getColorForName(company.name));
    setSearch("");
    setOpen(false);
  };

  const handleCreateNew = () => {
    const capitalizedName = search.charAt(0).toUpperCase() + search.slice(1);
    onChange(capitalizedName, getColorForName(capitalizedName));
    setSearch("");
    setOpen(false);
  };

  return (
    <div ref={dropdownRef} className={cn("relative", className)}>
      <button
        type="button"
        onClick={() => {
          setOpen(!open);
          setTimeout(() => inputRef.current?.focus(), 0);
        }}
        className={cn(
          "flex h-12 w-full items-center justify-between rounded-xl border bg-white dark:bg-gray-900 px-4 py-3 text-left shadow-sm transition-all",
          "border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600",
          "focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500",
          open && "ring-2 ring-orange-500/20 border-orange-500",
        )}
      >
        {value ? (
          <div className="flex items-center gap-2">
            <div
              className="h-3 w-3 rounded-full"
              style={{ backgroundColor: getColorForName(value) }}
            />
            <span className="font-medium text-gray-900 dark:text-gray-100">
              {value}
            </span>
          </div>
        ) : (
          <span className="text-gray-500 dark:text-gray-400">
            {placeholder}
          </span>
        )}
        <ChevronsUpDown className="h-4 w-4 text-gray-400" />
      </button>

      {open && (
        <div className="absolute z-50 mt-2 w-full rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 shadow-xl animate-in fade-in-0 zoom-in-95">
          <div className="p-2 border-b border-gray-100 dark:border-gray-800">
            <div className="relative">
              <input
                ref={inputRef}
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search or type new company..."
                className="w-full px-3 py-2 text-sm bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 text-gray-900 dark:text-gray-100 placeholder:text-gray-400"
              />
              {loading && (
                <Loader2 className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 animate-spin text-gray-400" />
              )}
            </div>
          </div>

          <div className="max-h-64 overflow-y-auto p-1">
            {showCreateOption && (
              <button
                type="button"
                onClick={handleCreateNew}
                className="flex w-full items-center gap-2 rounded-lg px-3 py-2.5 text-left hover:bg-orange-50 dark:hover:bg-orange-950 transition-colors group"
              >
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-yellow-400 to-orange-500 text-white">
                  <Plus className="h-4 w-4" />
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-900 dark:text-gray-100">
                    Create &quot;
                    {search.charAt(0).toUpperCase() + search.slice(1)}&quot;
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    Add as new company
                  </p>
                </div>
              </button>
            )}

            {filteredCompanies.length === 0 && !showCreateOption && (
              <div className="px-3 py-6 text-center text-sm text-gray-500 dark:text-gray-400">
                No companies found
              </div>
            )}

            {filteredCompanies.map((company) => (
              <button
                key={company.id}
                type="button"
                onClick={() => handleSelect(company)}
                className={cn(
                  "flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-left transition-colors",
                  value === company.name
                    ? "bg-orange-50 dark:bg-orange-950"
                    : "hover:bg-gray-50 dark:hover:bg-gray-800",
                )}
              >
                {company.logo_url ? (
                  <img
                    src={company.logo_url}
                    alt={company.name}
                    className="h-8 w-8 rounded-lg object-contain bg-white dark:bg-gray-800 p-1"
                    onError={(e) => {
                      (e.target as HTMLImageElement).style.display = "none";
                    }}
                  />
                ) : (
                  <div
                    className="flex h-8 w-8 items-center justify-center rounded-lg text-white font-semibold text-sm"
                    style={{
                      backgroundColor:
                        company.color || getColorForName(company.name),
                    }}
                  >
                    {company.name.charAt(0).toUpperCase()}
                  </div>
                )}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-1.5">
                    <span className="font-medium text-sm text-gray-900 dark:text-gray-100 truncate">
                      {company.name}
                    </span>
                    {company.is_verified && (
                      <span className="inline-flex items-center justify-center h-4 w-4 rounded-full bg-blue-500 text-white">
                        <Check className="h-2.5 w-2.5" />
                      </span>
                    )}
                  </div>
                  {company.category && (
                    <p className="text-xs text-gray-500 dark:text-gray-400 truncate">
                      {company.category}
                    </p>
                  )}
                </div>
                {value === company.name && (
                  <Check className="h-4 w-4 text-orange-500 flex-shrink-0" />
                )}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
