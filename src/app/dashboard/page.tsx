"use client";

import Header from "@/components/Header";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Building2, Smartphone, Settings, ExternalLink, BarChart3, Users, Star } from "lucide-react";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { getCurrentUserId } from "@/lib/auth";
import { supabase } from "@/lib/supabase";
import { formatDistanceToNow } from "date-fns";

interface Company {
  id: string;
  name: string;
  display_name: string;
  description: string | null;
  logo_url: string | null;
  category: string | null;
  created_at: string;
  role: 'owner' | 'admin' | 'member';
}

interface App {
  id: string;
  name: string;
  description: string;
  logo_url: string | null;
  category: string;
  average_rating: number;
  total_reviews: number;
  created_at: string;
  company: {
    name: string;
    display_name: string;
  } | null;
}

export default function DashboardPage() {
  const router = useRouter();
  const [companies, setCompanies] = useState<Company[]>([]);
  const [apps, setApps] = useState<App[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const userId = getCurrentUserId();
    if (!userId) {
      router.push("/auth/signin");
      return;
    }
    fetchData();
  }, []);

  const fetchData = async () => {
    const userId = getCurrentUserId();
    if (!userId) return;

    // Fetch companies where user is owner or member
    const { data: companyMemberships } = await supabase
      .from("company_members")
      .select(`
        role,
        companies (
          id,
          name,
          display_name,
          description,
          logo_url,
          category,
          created_at
        )
      `)
      .eq("user_id", userId);

    if (companyMemberships) {
      const companiesData = companyMemberships
        .filter((m: any) => m.companies)
        .map((m: any) => ({
          ...(m.companies as any),
          role: m.role
        }));
      setCompanies(companiesData);
    }

    // Fetch apps created by user
    const { data: appsData } = await supabase
      .from("apps")
      .select(`
        id,
        name,
        description,
        logo_url,
        category,
        average_rating,
        total_reviews,
        created_at,
        companies (
          name,
          display_name
        )
      `)
      .eq("user_id", userId)
      .order("created_at", { ascending: false });

    if (appsData) {
      setApps(appsData as any);
    }

    setLoading(false);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <main className="mx-auto max-w-7xl px-4 sm:px-6 pt-24 pb-8">
          <div className="text-center py-12">
            <p className="text-gray-600">Loading dashboard...</p>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <main className="mx-auto max-w-7xl px-4 sm:px-6 pt-24 pb-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Admin Dashboard</h1>
          <p className="text-gray-600">Manage your companies and apps</p>
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-8">
          <Button
            onClick={() => router.push("/company/create")}
            className="h-auto py-4 bg-gradient-to-br from-yellow-400 to-orange-500 hover:from-yellow-500 hover:to-orange-600 shadow-lg"
          >
            <Building2 className="h-5 w-5 mr-2" />
            Create Company Page
          </Button>
          <Button
            onClick={() => router.push("/apps/create")}
            className="h-auto py-4 bg-gradient-to-br from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 shadow-lg"
          >
            <Smartphone className="h-5 w-5 mr-2" />
            Create App Page
          </Button>
        </div>

        {/* Companies Section */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-2xl font-bold flex items-center gap-2">
              <Building2 className="h-6 w-6" />
              Your Companies
            </h2>
          </div>

          {companies.length === 0 ? (
            <Card>
              <CardContent className="py-12 text-center">
                <Building2 className="h-12 w-12 mx-auto text-gray-400 mb-4" />
                <p className="text-gray-600 mb-4">You don't have any companies yet</p>
                <Button onClick={() => router.push("/company/create")} variant="outline">
                  Create Your First Company
                </Button>
              </CardContent>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {companies.map((company) => (
                <Card key={company.id} className="hover:shadow-lg transition-shadow cursor-pointer">
                  <CardHeader>
                    <div className="flex items-start justify-between mb-2">
                      <Avatar className="h-12 w-12 bg-gradient-to-br from-yellow-400 to-orange-500">
                        {company.logo_url ? (
                          <img src={company.logo_url} alt={company.display_name} className="h-full w-full object-cover" />
                        ) : (
                          <AvatarFallback className="bg-gradient-to-br from-yellow-400 to-orange-500 text-white font-bold">
                            {company.display_name.charAt(0).toUpperCase()}
                          </AvatarFallback>
                        )}
                      </Avatar>
                      <Badge variant={company.role === 'owner' ? 'default' : 'secondary'}>
                        {company.role}
                      </Badge>
                    </div>
                    <CardTitle className="text-lg">{company.display_name}</CardTitle>
                    <CardDescription className="line-clamp-2">
                      {company.description || "No description"}
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-gray-500">
                        Created {formatDistanceToNow(new Date(company.created_at), { addSuffix: true })}
                      </span>
                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => router.push(`/company/${company.name}`)}
                        >
                          <ExternalLink className="h-3 w-3 mr-1" />
                          View
                        </Button>
                        {(company.role === 'owner' || company.role === 'admin') && (
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => router.push(`/company/${company.name}/manage`)}
                          >
                            <Settings className="h-3 w-3" />
                          </Button>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>

        {/* Apps Section */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-2xl font-bold flex items-center gap-2">
              <Smartphone className="h-6 w-6" />
              Your Apps
            </h2>
          </div>

          {apps.length === 0 ? (
            <Card>
              <CardContent className="py-12 text-center">
                <Smartphone className="h-12 w-12 mx-auto text-gray-400 mb-4" />
                <p className="text-gray-600 mb-4">You haven't created any apps yet</p>
                <Button onClick={() => router.push("/apps/create")} variant="outline">
                  Create Your First App
                </Button>
              </CardContent>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {apps.map((app) => (
                <Card key={app.id} className="hover:shadow-lg transition-shadow cursor-pointer">
                  <CardHeader>
                    <div className="flex items-start gap-3 mb-2">
                      <Avatar className="h-12 w-12 bg-gradient-to-br from-blue-500 to-purple-600">
                        {app.logo_url ? (
                          <img src={app.logo_url} alt={app.name} className="h-full w-full object-cover" />
                        ) : (
                          <AvatarFallback className="bg-gradient-to-br from-blue-500 to-purple-600 text-white font-bold">
                            {app.name.charAt(0).toUpperCase()}
                          </AvatarFallback>
                        )}
                      </Avatar>
                      <div className="flex-1 min-w-0">
                        <CardTitle className="text-lg truncate">{app.name}</CardTitle>
                        {app.company && (
                          <p className="text-xs text-gray-500 truncate">{app.company.display_name}</p>
                        )}
                      </div>
                    </div>
                    <CardDescription className="line-clamp-2">
                      {app.description}
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-center gap-4 mb-3 text-sm">
                      <div className="flex items-center gap-1">
                        <Star className="h-4 w-4 text-yellow-500 fill-yellow-500" />
                        <span className="font-semibold">{app.average_rating.toFixed(1)}</span>
                      </div>
                      <div className="flex items-center gap-1 text-gray-500">
                        <Users className="h-4 w-4" />
                        <span>{app.total_reviews} reviews</span>
                      </div>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-gray-500">
                        Created {formatDistanceToNow(new Date(app.created_at), { addSuffix: true })}
                      </span>
                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => router.push(`/apps/${app.id}`)}
                        >
                          <ExternalLink className="h-3 w-3 mr-1" />
                          View
                        </Button>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => router.push(`/apps/${app.id}/manage`)}
                        >
                          <Settings className="h-3 w-3" />
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
