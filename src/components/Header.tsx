"use client";

import { Home, Search, Plus, MessageCircle, User, Bell, ChevronDown, Building2, Smartphone } from "lucide-react";
import { Button } from "./ui/button";
import { Avatar, AvatarFallback } from "./ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "./ui/dropdown-menu";
import { useRouter, usePathname } from "next/navigation";
import { useState, useEffect } from "react";
import { signOut } from "@/lib/auth";
import { useAuth } from "@/contexts/AuthContext";
import { cn } from "@/lib/utils";

export default function Header() {
  const router = useRouter();
  const pathname = usePathname();
  const [scrolled, setScrolled] = useState(false);
  const { user, refreshUser } = useAuth();

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const isActive = (path: string) => pathname === path;

  const handleSignOut = () => {
    signOut();
    refreshUser();
    router.push("/auth/signin");
  };

  // Don't show header on auth pages
  if (pathname.startsWith("/auth")) {
    return null;
  }

  return (
    <header
      className={cn(
        "fixed top-4 left-1/2 -translate-x-1/2 z-50 w-[95%] max-w-7xl rounded-2xl transition-all duration-300",
        scrolled
          ? "bg-white/80 backdrop-blur-xl shadow-lg shadow-black/5"
          : "glass-effect shadow-md"
      )}
    >
      <div className="flex items-center justify-between px-8 py-3.5">
        {/* Logo */}
        <button
          onClick={() => router.push("/")}
          className="flex items-center gap-2 hover:opacity-80 transition-opacity"
        >
          <div className="flex items-center gap-1">
            <span className="text-2xl font-bold text-[#020202]">Crowd</span>
            <span className="text-2xl font-bold bg-gradient-to-r from-[#FF992B] to-[#FF8400] bg-clip-text text-transparent">Up</span>
          </div>
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-r from-[#FF992B] to-[#FF8400] transition-transform hover:scale-110 shadow-[0_0_30px_rgba(255,133,0,0.3)]">
            <svg
              viewBox="0 0 24 24"
              fill="none"
              stroke="white"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="h-6 w-6"
            >
              <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
              <circle cx="9" cy="7" r="4" />
              <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
              <path d="M16 3.13a4 4 0 0 1 0 7.75" />
            </svg>
          </div>
        </button>

        {/* Navigation Icons - Container with better spacing */}
        <nav className="flex items-center gap-4 rounded-2xl bg-[#909090] px-6 py-2.5 shadow-[0_0_28px_rgba(144,144,144,0.6)]">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => router.push("/")}
            className={cn(
              "rounded-xl transition-all hover:scale-105 h-10 w-10 focus-ring",
              isActive("/") ? "bg-[#808080] text-white hover:bg-[#707070]" : "hover:bg-[#808080] text-white hover:text-white"
            )}
          >
            <Home className="h-5 w-5" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => router.push("/search")}
            className={cn(
              "rounded-xl transition-all hover:scale-105 h-10 w-10 focus-ring",
              isActive("/search") ? "bg-[#808080] text-white hover:bg-[#707070]" : "hover:bg-[#808080] text-white hover:text-white"
            )}
          >
            <Search className="h-5 w-5" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => router.push("/create")}
            className="rounded-xl bg-gradient-to-r from-[#FF992B] to-[#FF8400] text-white hover:from-[#FF8400] hover:to-[#FF7300] transition-all hover:scale-105 shadow-lg shadow-orange-500/30 h-10 w-10 focus-ring"
          >
            <Plus className="h-5 w-5" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => router.push("/messages")}
            className={cn(
              "rounded-xl transition-all hover:scale-105 h-10 w-10 focus-ring",
              isActive("/messages") ? "bg-[#808080] text-white hover:bg-[#707070]" : "hover:bg-[#808080] text-white hover:text-white"
            )}
          >
            <MessageCircle className="h-5 w-5" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => {
              if (user) {
                router.push(`/profile/${user.username}`);
              } else {
                router.push("/auth/signin");
              }
            }}
            className={cn(
              "rounded-xl transition-all hover:scale-105 h-10 w-10 focus-ring",
              pathname.startsWith("/profile") ? "bg-[#808080] text-white hover:bg-[#707070]" : "hover:bg-[#808080] text-white hover:text-white"
            )}
          >
            <User className="h-5 w-5" />
          </Button>
        </nav>

        {/* User Section with Notification */}
        <div className="flex items-center gap-3">
          {/* Notification Bell - Far Right */}
          {user && (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className="rounded-xl transition-all hover:scale-105 hover:bg-gray-100 h-10 w-10 relative focus-ring"
                >
                  <Bell className="h-5 w-5" />
                  {/* Notification badge */}
                  <span className="absolute top-1 right-1 h-2 w-2 bg-red-500 rounded-full" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-80">
                <div className="px-4 py-3 border-b">
                  <h3 className="font-semibold">Notifications</h3>
                </div>
                <div className="max-h-96 overflow-y-auto">
                  <div className="p-4 text-center text-gray-500 text-sm">
                    No new notifications
                  </div>
                  {/* Placeholder for future notifications */}
                </div>
              </DropdownMenuContent>
            </DropdownMenu>
          )}

          {user ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="flex items-center gap-2.5 rounded-xl hover:bg-gray-100/50 transition-all px-3 py-2 h-auto focus-ring">
                  <Avatar className="h-9 w-9 bg-gradient-to-r from-[#FF992B] to-[#FF8400] ring-2 ring-orange-200 transition-all hover:ring-4">
                    <AvatarFallback className="bg-gradient-to-r from-[#FF992B] to-[#FF8400] text-white font-semibold">
                      {user.display_name.charAt(0).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <div className="text-left">
                    <p className="text-sm font-semibold text-gray-900">{user.display_name}</p>
                    <p className="text-xs text-gray-500">@{user.username}</p>
                  </div>
                  <ChevronDown className="h-4 w-4 text-gray-500" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                <DropdownMenuItem onClick={() => router.push(`/profile/${user.username}`)}>
                  <User className="h-4 w-4 mr-2" />
                  Profile
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => router.push("/settings")}>
                  <Bell className="h-4 w-4 mr-2" />
                  Settings
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => router.push("/company/create")}>
                  <Building2 className="h-4 w-4 mr-2" />
                  Create Company Page
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => router.push("/apps/create")}>
                  <Smartphone className="h-4 w-4 mr-2" />
                  Create App Page
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem className="text-red-600" onClick={handleSignOut}>
                  Logout
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <Button
              onClick={() => router.push("/auth/signin")}
              className="rounded-xl bg-gradient-to-r from-[#FF992B] to-[#FF8400] text-white hover:from-[#FF8400] hover:to-[#FF7300] shadow-lg shadow-orange-500/30 transition-all hover:scale-105 focus-ring"
            >
              Sign In
            </Button>
          )}
        </div>
      </div>
    </header>
  );
}