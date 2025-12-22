"use client";

import { User, Bell, ChevronDown, Building2, Smartphone, BarChart3, Sun, Moon, Monitor, Bookmark, Settings } from "lucide-react";
import { useRouter, usePathname } from "next/navigation";
import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
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
import { signOut } from "@/lib/auth";
import svgPaths from "./navbar/svg-paths";

type NavItem = "home" | "search" | "add" | "messages" | "profile";

function Svg({ isActive }: { isActive: boolean }) {
  return (
    <div className="relative shrink-0 size-[24.107px]" data-name="SVG">
      <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 25 25">
        <g id="SVG">
          <path d={svgPaths.p2d6a7600} id="Vector" stroke={isActive ? "white" : "#717182"} strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.00893" />
          <path d={svgPaths.pd775100} id="Vector_2" stroke={isActive ? "white" : "#717182"} strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.00893" />
        </g>
      </svg>
    </div>
  );
}

function Svg1({ isActive }: { isActive: boolean }) {
  return (
    <div className="relative shrink-0 size-[24.107px]" data-name="SVG">
      <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 25 25">
        <g id="SVG">
          <path d={svgPaths.p393528b4} id="Vector" stroke={isActive ? "white" : "#717182"} strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.00893" />
          <path d={svgPaths.pf3de100} id="Vector_2" stroke={isActive ? "white" : "#717182"} strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.00893" />
        </g>
      </svg>
    </div>
  );
}

function Svg2() {
  return (
    <div className="relative shrink-0 size-[24.107px]" data-name="SVG">
      <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 25 25">
        <g id="SVG">
          <path d="M5.0221 12.0536H19.0846" id="Vector" stroke="white" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.00893" />
          <path d="M12.0535 5.0224V19.0849" id="Vector_2" stroke="white" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.00893" />
        </g>
      </svg>
    </div>
  );
}

function Svg3({ isActive }: { isActive: boolean }) {
  return (
    <div className="relative shrink-0 size-[24.107px]" data-name="SVG">
      <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 25 25">
        <g id="SVG">
          <path d={svgPaths.p3f8a600} id="Vector" stroke={isActive ? "white" : "#717182"} strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.00893" />
        </g>
      </svg>
    </div>
  );
}

function Svg4({ isActive }: { isActive: boolean }) {
  return (
    <div className="relative shrink-0 size-[24.107px]" data-name="SVG">
      <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 25 25">
        <g id="SVG">
          <path d={svgPaths.p1036f160} id="Vector" stroke={isActive ? "white" : "#717182"} strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.00893" />
          <path d={svgPaths.p1d3f6a00} id="Vector_2" stroke={isActive ? "white" : "#717182"} strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.00893" />
        </g>
      </svg>
    </div>
  );
}

function OverlayShadow() {
  return (
    <div className="bg-[#ff992b] box-border content-stretch flex items-center justify-center overflow-clip relative rounded-[16px] shadow-[0px_13.776px_20.663px_-4.133px_rgba(0,0,0,0.1),0px_5.51px_8.265px_-5.51px_rgba(0,0,0,0.1)] shrink-0 size-[48.214px]" data-name="Overlay+Shadow">
      <Svg2 />
    </div>
  );
}
import { useTheme } from "@/contexts/ThemeContext";

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

  // Don't show header on auth pages
  if (pathname.startsWith("/auth")) {
    return null;
  }

  // Determine active item based on current path
  const getActiveItem = (): NavItem => {
    if (pathname === "/") return "home";
    if (pathname === "/search") return "search";
    if (pathname === "/create") return "add";
    if (pathname === "/messages") return "messages";
    if (pathname.startsWith("/profile")) return "profile";
    return "home";
  };

  const activeItem = getActiveItem();

  const handleNavigation = (item: NavItem) => {
    switch (item) {
      case "home":
        router.push("/");
        break;
      case "search":
        router.push("/search");
        break;
      case "add":
        router.push("/create");
        break;
      case "messages":
        router.push("/messages");
        break;
      case "profile":
        if (user) {
          router.push(`/profile/${user.username}`);
        } else {
          router.push("/auth/signin");
        }
        break;
    }
  };

  const handleSignOut = () => {
    signOut();
    refreshUser();
    router.push("/auth/signin");
  };

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

        {/* Navbar centrale */}
        <div className="relative">
          <div className="backdrop-blur-[5.51px] backdrop-filter bg-[rgba(225,225,225,0.3)] box-border content-stretch flex flex-col items-center justify-center p-[9.643px] rounded-[20px]" data-name="Overlay+OverlayBlur">
            <div 
              className="absolute bg-[#909090] h-[57.857px] rounded-[17.564px] shadow-[0px_0px_28px_-3px_#909090] top-[9.64px] w-[96.429px] transition-all duration-300 ease-out" 
              data-name="Overlay+Shadow"
              style={{
                left: activeItem === "home" ? "9.64px" : 
                      activeItem === "search" ? "115.672px" : 
                      activeItem === "add" ? "221.704px" :
                      activeItem === "messages" ? "327.736px" : 
                      "433.768px"
              }}
            />
            <div className="content-stretch flex gap-[9.643px] items-center relative shrink-0 z-10" data-name="Container">
              <button
                onClick={() => handleNavigation("home")}
                className="content-stretch flex flex-col h-[57.857px] items-center justify-center relative rounded-[20px] shrink-0 w-[96.429px] cursor-pointer transition-all hover:scale-105"
                data-name="Button"
              >
                <Svg isActive={activeItem === "home"} />
              </button>
              <button
                onClick={() => handleNavigation("search")}
                className="content-stretch flex flex-col h-[57.857px] items-center justify-center relative rounded-[17.564px] shrink-0 w-[96.429px] cursor-pointer transition-all hover:scale-105"
                data-name="Button"
              >
                <Svg1 isActive={activeItem === "search"} />
              </button>
              <div
                className="content-stretch flex flex-col h-[57.857px] items-center justify-center relative rounded-[17.564px] shrink-0 w-[96.429px]"
                data-name="Button"
              >
                <div className="content-stretch flex flex-col items-start relative shrink-0" data-name="Container">
                  <OverlayShadow />
                </div>
              </div>
              <button
                onClick={() => handleNavigation("messages")}
                className="content-stretch flex flex-col h-[57.857px] items-center justify-center relative rounded-[17.564px] shrink-0 w-[96.429px] cursor-pointer transition-all hover:scale-105"
                data-name="Button"
              >
                <Svg3 isActive={activeItem === "messages"} />
              </button>
              <button
                onClick={() => handleNavigation("profile")}
                className="content-stretch flex flex-col h-[57.857px] items-center justify-center relative rounded-[17.564px] shrink-0 w-[96.429px] cursor-pointer transition-all hover:scale-105"
                data-name="Button"
              >
                <Svg4 isActive={activeItem === "profile"} />
              </button>
            </div>
          </div>
        </div>

        {/* User Section with Notification */}
        <div className="flex items-center gap-1.5 sm:gap-3">
          {/* Notification Bell - Far Right */}
          {user && (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className="rounded-xl transition-all hover:scale-105 hover:bg-gray-100 h-10 w-10 relative"
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