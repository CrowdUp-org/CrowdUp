"use client";

import { Home, Search, Plus, MessageCircle, User, ChevronDown, Building2, Smartphone, BarChart3, Sun, Moon, Monitor, Bookmark, Settings } from "lucide-react";
import { Button } from "./ui/button";
import { Avatar, AvatarFallback } from "./ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
  DropdownMenuSub,
  DropdownMenuSubTrigger,
  DropdownMenuSubContent,
  DropdownMenuPortal,
} from "./ui/dropdown-menu";
import { useRouter, usePathname } from "next/navigation";
import { useState, useEffect } from "react";
import { signOut } from "@/lib/auth";
import { useAuth } from "@/contexts/AuthContext";
import { useTheme } from "@/contexts/ThemeContext";
import { NotificationDropdown } from "./NotificationDropdown";

export default function Header() {
  const router = useRouter();
  const pathname = usePathname();
  const [scrolled, setScrolled] = useState(false);
  const { user, refreshUser } = useAuth();
  const { theme, setTheme } = useTheme();

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
      className={`fixed top-2 sm:top-4 left-1/2 -translate-x-1/2 z-50 w-[98%] sm:w-[95%] max-w-7xl rounded-xl sm:rounded-2xl border transition-all duration-300 ${
        scrolled
          ? "bg-white/80 dark:bg-gray-900/80 backdrop-blur-xl shadow-lg shadow-black/5 dark:shadow-black/20 border-gray-200 dark:border-gray-800"
          : "bg-white/95 dark:bg-gray-900/95 backdrop-blur-sm shadow-md border-gray-200 dark:border-gray-800"
      }`}
    >
      <div className="flex items-center justify-between px-3 sm:px-6 md:px-8 py-2.5 sm:py-3.5">
        {/* Logo */}
        <button
          onClick={() => router.push("/")}
          className="flex items-center gap-1.5 sm:gap-2 hover:opacity-80 transition-opacity"
        >
          <div className="flex items-center gap-0.5 sm:gap-1">
            <span className="text-lg sm:text-2xl font-bold text-black dark:text-white">Crowd</span>
            <span className="text-lg sm:text-2xl font-bold bg-gradient-to-r from-yellow-400 to-orange-500 bg-clip-text text-transparent">Up</span>
          </div>
          <div className="flex h-8 w-8 sm:h-10 sm:w-10 items-center justify-center rounded-lg sm:rounded-xl bg-gradient-to-br from-yellow-400 to-orange-500 transition-transform hover:scale-110 shadow-lg shadow-orange-500/30">
            <svg
              viewBox="0 0 24 24"
              fill="none"
              stroke="white"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="h-5 w-5 sm:h-6 sm:w-6"
            >
              <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
              <circle cx="9" cy="7" r="4" />
              <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
              <path d="M16 3.13a4 4 0 0 1 0 7.75" />
            </svg>
          </div>
        </button>

        {/* Navigation Icons - Container with better spacing */}
        <nav className="flex items-center gap-1.5 sm:gap-2 md:gap-4 rounded-xl sm:rounded-2xl bg-gray-50/80 dark:bg-gray-800/80 px-2 sm:px-4 md:px-6 py-2 sm:py-2.5 border border-gray-200/80 dark:border-gray-700/80 backdrop-blur-sm">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => router.push("/")}
            className={`rounded-lg sm:rounded-xl transition-all hover:scale-105 h-8 w-8 sm:h-10 sm:w-10 ${
              isActive("/") ? "bg-gray-300 dark:bg-gray-600 text-gray-900 dark:text-gray-100 hover:bg-gray-400 dark:hover:bg-gray-500" : "hover:bg-gray-200 dark:hover:bg-gray-700 dark:text-gray-300"
            }`}
          >
            <Home className="h-4 w-4 sm:h-5 sm:w-5" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => router.push("/search")}
            className={`rounded-lg sm:rounded-xl transition-all hover:scale-105 h-8 w-8 sm:h-10 sm:w-10 ${
              isActive("/search") ? "bg-gray-300 dark:bg-gray-600 text-gray-900 dark:text-gray-100 hover:bg-gray-400 dark:hover:bg-gray-500" : "hover:bg-gray-200 dark:hover:bg-gray-700 dark:text-gray-300"
            }`}
          >
            <Search className="h-4 w-4 sm:h-5 sm:w-5" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => router.push("/create")}
            className="rounded-lg sm:rounded-xl bg-gradient-to-br from-yellow-400 to-orange-500 text-white hover:from-yellow-500 hover:to-orange-600 transition-all hover:scale-105 shadow-lg shadow-orange-500/30 h-8 w-8 sm:h-10 sm:w-10"
          >
            <Plus className="h-4 w-4 sm:h-5 sm:w-5" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => router.push("/messages")}
            className={`rounded-lg sm:rounded-xl transition-all hover:scale-105 h-8 w-8 sm:h-10 sm:w-10 ${
              isActive("/messages") ? "bg-gray-300 dark:bg-gray-600 text-gray-900 dark:text-gray-100 hover:bg-gray-400 dark:hover:bg-gray-500" : "hover:bg-gray-200 dark:hover:bg-gray-700 dark:text-gray-300"
            }`}
          >
            <MessageCircle className="h-4 w-4 sm:h-5 sm:w-5" />
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
            className={`rounded-lg sm:rounded-xl transition-all hover:scale-105 h-8 w-8 sm:h-10 sm:w-10 ${
              pathname.startsWith("/profile") ? "bg-gray-300 dark:bg-gray-600 text-gray-900 dark:text-gray-100 hover:bg-gray-400 dark:hover:bg-gray-500" : "hover:bg-gray-200 dark:hover:bg-gray-700 dark:text-gray-300"
            }`}
          >
            <User className="h-4 w-4 sm:h-5 sm:w-5" />
          </Button>
        </nav>

        {/* User Section with Notification */}
        <div className="flex items-center gap-1.5 sm:gap-3">
          {/* Notification Bell */}
          {user && <NotificationDropdown />}

          {user ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="flex items-center gap-1.5 sm:gap-2.5 rounded-lg sm:rounded-xl hover:bg-gray-100 dark:hover:bg-gray-800 transition-all px-2 sm:px-3 py-1.5 sm:py-2 h-auto">
                  <Avatar className="h-7 w-7 sm:h-9 sm:w-9 bg-gradient-to-br from-yellow-400 to-orange-500 ring-2 ring-orange-200 transition-all hover:ring-4">
                    {user.avatar_url ? (
                      <img src={user.avatar_url} alt={user.display_name} className="h-full w-full object-cover rounded-full" />
                    ) : (
                      <AvatarFallback className="bg-gradient-to-br from-yellow-400 to-orange-500 text-white font-semibold">
                        {user.display_name.charAt(0).toUpperCase()}
                      </AvatarFallback>
                    )}
                  </Avatar>
                  <div className="text-left hidden sm:block">
                    <p className="text-sm font-semibold text-gray-900 dark:text-gray-100">{user.display_name}</p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">@{user.username}</p>
                  </div>
                  <ChevronDown className="h-3 w-3 sm:h-4 sm:w-4 text-gray-500 hidden sm:block" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                <DropdownMenuItem onClick={() => router.push(`/profile/${user.username}`)}>
                  <User className="h-4 w-4 mr-2" />
                  Profile
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => router.push("/dashboard")}>
                  <BarChart3 className="h-4 w-4 mr-2" />
                  Dashboard
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => router.push("/profile/bookmarks")}>
                  <Bookmark className="h-4 w-4 mr-2" />
                  Saved Posts
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => router.push("/settings")}>
                  <Settings className="h-4 w-4 mr-2" />
                  Settings
                </DropdownMenuItem>
                <DropdownMenuSub>
                  <DropdownMenuSubTrigger>
                    {theme === "dark" ? (
                      <Moon className="h-4 w-4 mr-2" />
                    ) : theme === "light" ? (
                      <Sun className="h-4 w-4 mr-2" />
                    ) : (
                      <Monitor className="h-4 w-4 mr-2" />
                    )}
                    Theme
                  </DropdownMenuSubTrigger>
                  <DropdownMenuPortal>
                    <DropdownMenuSubContent>
                      <DropdownMenuItem onClick={() => setTheme("light")}>
                        <Sun className="h-4 w-4 mr-2" />
                        Light
                        {theme === "light" && <span className="ml-auto text-orange-500">✓</span>}
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => setTheme("dark")}>
                        <Moon className="h-4 w-4 mr-2" />
                        Dark
                        {theme === "dark" && <span className="ml-auto text-orange-500">✓</span>}
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => setTheme("system")}>
                        <Monitor className="h-4 w-4 mr-2" />
                        System
                        {theme === "system" && <span className="ml-auto text-orange-500">✓</span>}
                      </DropdownMenuItem>
                    </DropdownMenuSubContent>
                  </DropdownMenuPortal>
                </DropdownMenuSub>
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
              className="rounded-lg sm:rounded-xl bg-gradient-to-br from-yellow-400 to-orange-500 text-white hover:from-yellow-500 hover:to-orange-600 shadow-lg shadow-orange-500/30 text-sm sm:text-base px-3 sm:px-4 py-1.5 sm:py-2"
            >
              Sign In
            </Button>
          )}
        </div>
      </div>
    </header>
  );
}