"use client";

import { useEffect, useState } from "react";
import { X, TrendingUp, Users } from "lucide-react";
import { Button } from "./ui/button";
import { Avatar, AvatarFallback } from "./ui/avatar";
import { useRouter } from "next/navigation";

export const SidePanel = () => {
  const [open, setOpen] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const openHandler = () => setOpen(true);
    const closeOnEsc = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    window.addEventListener("open-sidepanel", openHandler as EventListener);
    window.addEventListener("keydown", closeOnEsc);
    return () => {
      window.removeEventListener("open-sidepanel", openHandler as EventListener);
      window.removeEventListener("keydown", closeOnEsc);
    };
  }, []);

  const trendingGroups = [
    { name: "Instagram", followers: "15.4K", growth: "+12%", initial: "I", color: "bg-gradient-to-br from-purple-500 via-pink-500 to-orange-500", id: "instagram" },
    { name: "WhatsApp", followers: "12.3K", growth: "+8%", initial: "W", color: "bg-green-500", id: "whatsapp" },
    { name: "Spotify", followers: "9.8K", growth: "+15%", initial: "S", color: "bg-green-600", id: "spotify" },
    { name: "Discord", followers: "8.7K", growth: "+5%", initial: "D", color: "bg-indigo-600", id: "discord" },
  ];

  return (
    <div className={`fixed inset-0 z-[60] transition-all ${open ? "pointer-events-auto" : "pointer-events-none"}`}>
      {/* Backdrop */}
      <div
        onClick={() => setOpen(false)}
        className={`absolute inset-0 bg-black/20 transition-opacity ${open ? "opacity-100" : "opacity-0"}`}
      />

      {/* Panel */}
      <aside
        className={`absolute right-0 top-0 h-full w-[360px] max-w-[85vw] bg-white border-l border-gray-200 shadow-2xl transition-transform duration-300 ease-out
        ${open ? "translate-x-0" : "translate-x-full"}`}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-gray-200">
          <h2 className="text-base font-semibold text-gray-900">Sidebar</h2>
          <Button 
            variant="ghost" 
            size="icon" 
            className="h-8 w-8 rounded-lg hover:bg-gray-100" 
            onClick={() => setOpen(false)}
          >
            <X className="h-5 w-5" />
          </Button>
        </div>

        {/* Body */}
        <div className="overflow-y-auto h-[calc(100vh-65px)] p-5 space-y-4">
          {/* Community Feed */}
          <div className="rounded-2xl bg-orange-50 p-5 border border-orange-100">
            <div className="flex items-center gap-2 mb-2">
              <TrendingUp className="h-5 w-5 text-orange-500" />
              <h3 className="font-semibold text-base text-gray-900">Community Feed</h3>
            </div>
            <p className="text-sm text-gray-600 leading-relaxed">
              Latest feedback and suggestions from the community
            </p>
          </div>

          {/* Trending Groups */}
          <div className="rounded-2xl border border-gray-200 bg-white p-5">
            <div className="flex items-center gap-2 mb-4">
              <TrendingUp className="h-5 w-5 text-orange-500" />
              <h3 className="font-semibold text-base text-gray-900">Trending Group</h3>
            </div>
            
            <div className="space-y-3">
              {trendingGroups.map((group) => (
                <button
                  key={group.name}
                  onClick={() => {
                    router.push(`/company/${group.id}`);
                    setOpen(false);
                  }}
                  className="w-full flex items-center justify-between hover:bg-gray-50 p-2 -mx-2 rounded-lg transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <Avatar className={`h-10 w-10 ${group.color}`}>
                      <AvatarFallback className={`${group.color} text-white font-semibold text-sm`}>
                        {group.initial}
                      </AvatarFallback>
                    </Avatar>
                    <div className="text-left">
                      <p className="font-medium text-sm text-gray-900">{group.name}</p>
                      <p className="text-xs text-gray-500">{group.followers} followers</p>
                    </div>
                  </div>
                  <span className="text-sm font-semibold text-green-600">{group.growth}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Community Stats */}
          <div className="rounded-2xl border border-gray-200 bg-white p-5">
            <div className="flex items-center gap-2 mb-4">
              <Users className="h-5 w-5 text-orange-500" />
              <h3 className="font-semibold text-base text-gray-900">Community</h3>
            </div>
            
            <div className="space-y-2.5">
              <div className="flex items-center justify-between py-1.5">
                <span className="text-sm text-gray-600">Active Users</span>
                <span className="font-semibold text-gray-900">24.7K</span>
              </div>
              <div className="flex items-center justify-between py-1.5">
                <span className="text-sm text-gray-600">Posts Today</span>
                <span className="font-semibold text-gray-900">156</span>
              </div>
              <div className="flex items-center justify-between py-1.5">
                <span className="text-sm text-gray-600">Companies</span>
                <span className="font-semibold text-gray-900">847</span>
              </div>
            </div>
          </div>
        </div>
      </aside>
    </div>
  );
};

export default SidePanel;