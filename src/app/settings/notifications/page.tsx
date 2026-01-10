"use client";

import { useState, useEffect } from "react";
import Header from "@/components/Header";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { supabase } from "@/lib/supabase";
import { getCurrentUserId } from "@/lib/services/auth.service";
import { useRouter } from "next/navigation";
import { Building2, ArrowLeft } from "lucide-react";

interface NotificationPreferences {
  id: string;
  company_id: string | null;
  notify_new_posts: boolean;
  notify_comments: boolean;
  notify_high_votes: boolean;
  notify_trending: boolean;
  notify_negative_sentiment: boolean;
  email_notifications: boolean;
  email_frequency: "realtime" | "hourly" | "daily" | "weekly";
}

interface Company {
  id: string;
  name: string;
  display_name: string;
  logo_url: string | null;
}

export default function NotificationSettingsPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [companies, setCompanies] = useState<Company[]>([]);
  const [preferences, setPreferences] = useState<
    Record<string, NotificationPreferences>
  >({});
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      const userId = getCurrentUserId();
      if (!userId) {
        router.push("/auth/signin");
        return;
      }

      try {
        // 1. Fetch companies user manages
        const { data: memberData } = await supabase
          .from("company_members")
          .select("company_id, companies(id, name, display_name, logo_url)")
          .eq("user_id", userId);

        const userCompanies = memberData?.map((m: any) => m.companies) || [];
        setCompanies(userCompanies);

        // 2. Fetch existing preferences
        const { data: prefsData } = await supabase
          .from("notification_preferences")
          .select("*")
          .eq("user_id", userId);

        const prefsMap: Record<string, NotificationPreferences> = {};
        if (prefsData) {
          prefsData.forEach((p: any) => {
            const key = p.company_id || "global";
            prefsMap[key] = p;
          });
        }

        // Initialize missing preferences
        // Global
        if (!prefsMap["global"]) {
          prefsMap["global"] = {
            id: "temp_global",
            company_id: null,
            notify_new_posts: true,
            notify_comments: true,
            notify_high_votes: true,
            notify_trending: true,
            notify_negative_sentiment: false,
            email_notifications: true,
            email_frequency: "daily",
          };
        }

        // Per company
        userCompanies.forEach((company: any) => {
          if (!prefsMap[company.id]) {
            prefsMap[company.id] = {
              id: `temp_${company.id}`,
              company_id: company.id,
              notify_new_posts: true,
              notify_comments: true,
              notify_high_votes: true,
              notify_trending: true,
              notify_negative_sentiment: false,
              email_notifications: true,
              email_frequency: "daily",
            };
          }
        });

        setPreferences(prefsMap);
      } catch (error) {
        console.error("Error fetching settings:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [router]);

  const handleUpdate = (
    companyId: string | "global",
    key: keyof NotificationPreferences,
    value: any,
  ) => {
    setPreferences((prev) => ({
      ...prev,
      [companyId]: {
        ...prev[companyId],
        [key]: value,
      },
    }));
  };

  const saveSettings = async () => {
    setSaving(true);
    const userId = getCurrentUserId();
    if (!userId) return;

    try {
      const updates = Object.values(preferences).map((pref) => {
        const { id, ...data } = pref;
        // Remove temp id
        return {
          user_id: userId,
          ...data,
        };
      });

      const { error } = await (
        supabase.from("notification_preferences") as any
      ).upsert(updates, { onConflict: "user_id, company_id" });

      if (error) throw error;

      // Refresh data to get real IDs
      // For now just stop saving
    } catch (error) {
      console.error("Error saving settings:", error);
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-950 flex items-center justify-center">
        <div className="h-8 w-8 border-2 border-orange-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950">
      <Header />
      <main className="mx-auto max-w-3xl px-3 sm:px-4 md:px-6 pt-20 sm:pt-24 pb-8">
        <div className="flex items-center gap-4 mb-6">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => router.back()}
            className="rounded-full"
          >
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
              Notification Settings
            </h1>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Manage how and when you receive notifications
            </p>
          </div>
        </div>

        <div className="space-y-6">
          {/* Global Settings (if needed, or just use company settings) */}
          {/* For now, let's assume global settings apply to user-centric notifications */}

          {companies.map((company) => {
            const prefs = preferences[company.id];
            if (!prefs) return null;

            return (
              <div
                key={company.id}
                className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 shadow-sm p-6"
              >
                <div className="flex items-center gap-3 mb-6">
                  <div className="h-10 w-10 rounded-lg bg-gray-100 dark:bg-gray-800 flex items-center justify-center overflow-hidden">
                    {company.logo_url ? (
                      <img
                        src={company.logo_url}
                        alt={company.name}
                        className="h-full w-full object-cover"
                      />
                    ) : (
                      <Building2 className="h-5 w-5 text-gray-400" />
                    )}
                  </div>
                  <div>
                    <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                      {company.display_name}
                    </h2>
                    <p className="text-xs text-gray-500">
                      Company Notifications
                    </p>
                  </div>
                </div>

                <div className="space-y-6">
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label className="text-base">New Posts</Label>
                      <p className="text-sm text-gray-500">
                        Notify when someone posts about {company.display_name}
                      </p>
                    </div>
                    <Switch
                      checked={prefs.notify_new_posts}
                      onCheckedChange={(checked) =>
                        handleUpdate(company.id, "notify_new_posts", checked)
                      }
                    />
                  </div>

                  <Separator />

                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label className="text-base">Comments</Label>
                      <p className="text-sm text-gray-500">
                        Notify on new comments
                      </p>
                    </div>
                    <Switch
                      checked={prefs.notify_comments}
                      onCheckedChange={(checked) =>
                        handleUpdate(company.id, "notify_comments", checked)
                      }
                    />
                  </div>

                  <Separator />

                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label className="text-base">High Votes</Label>
                      <p className="text-sm text-gray-500">
                        Notify when posts reach vote milestones
                      </p>
                    </div>
                    <Switch
                      checked={prefs.notify_high_votes}
                      onCheckedChange={(checked) =>
                        handleUpdate(company.id, "notify_high_votes", checked)
                      }
                    />
                  </div>

                  <Separator />

                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label className="text-base">Negative Sentiment</Label>
                      <p className="text-sm text-gray-500">
                        Alert on negative sentiment spikes
                      </p>
                    </div>
                    <Switch
                      checked={prefs.notify_negative_sentiment}
                      onCheckedChange={(checked) =>
                        handleUpdate(
                          company.id,
                          "notify_negative_sentiment",
                          checked,
                        )
                      }
                    />
                  </div>

                  <Separator />

                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div className="space-y-0.5">
                        <Label className="text-base">Email Notifications</Label>
                        <p className="text-sm text-gray-500">
                          Receive updates via email
                        </p>
                      </div>
                      <Switch
                        checked={prefs.email_notifications}
                        onCheckedChange={(checked) =>
                          handleUpdate(
                            company.id,
                            "email_notifications",
                            checked,
                          )
                        }
                      />
                    </div>

                    {prefs.email_notifications && (
                      <div className="flex items-center justify-between pl-4 border-l-2 border-gray-100 dark:border-gray-800">
                        <Label className="text-sm">Frequency</Label>
                        <Select
                          value={prefs.email_frequency}
                          onValueChange={(value) =>
                            handleUpdate(company.id, "email_frequency", value)
                          }
                        >
                          <SelectTrigger className="w-[140px]">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="realtime">Real-time</SelectItem>
                            <SelectItem value="hourly">
                              Hourly Digest
                            </SelectItem>
                            <SelectItem value="daily">Daily Digest</SelectItem>
                            <SelectItem value="weekly">
                              Weekly Digest
                            </SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            );
          })}

          {companies.length === 0 && (
            <div className="text-center py-12 bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800">
              <Building2 className="h-12 w-12 text-gray-300 mx-auto mb-3" />
              <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100">
                No Companies Found
              </h3>
              <p className="text-sm text-gray-500 max-w-sm mx-auto mt-1">
                You don't seem to manage any companies. Create a company page to
                access company notification settings.
              </p>
            </div>
          )}

          <div className="flex justify-end pt-4">
            <Button
              onClick={saveSettings}
              disabled={saving}
              className="bg-orange-500 hover:bg-orange-600 text-white min-w-[120px]"
            >
              {saving ? "Saving..." : "Save Changes"}
            </Button>
          </div>
        </div>
      </main>
    </div>
  );
}
