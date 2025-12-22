"use client";

import { Suspense, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";

function AuthCallbackContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { refreshUser } = useAuth();

  useEffect(() => {
    const sessionData = searchParams.get("session");

    if (sessionData) {
      try {
        const user = JSON.parse(decodeURIComponent(sessionData));
        // Store user session in localStorage
        localStorage.setItem("user", JSON.stringify(user));
        localStorage.setItem("userId", user.id);
        
        // Refresh the auth context
        refreshUser();
        
        // Redirect to home page
        router.push("/");
      } catch (error) {
        console.error("Failed to process session data:", error);
        router.push("/auth/signin?error=session_failed");
      }
    } else {
      // No session data, redirect to signin
      router.push("/auth/signin");
    }
  }, [searchParams, router, refreshUser]);

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500 mx-auto mb-4"></div>
        <p className="text-gray-600">Completing sign in...</p>
      </div>
    </div>
  );
}

export default function AuthCallbackPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    }>
      <AuthCallbackContent />
    </Suspense>
  );
}
