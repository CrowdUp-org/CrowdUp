"use client";

import {
  createContext,
  useContext,
  useEffect,
  useState,
  useCallback,
  useRef,
  ReactNode,
} from "react";
import {
  User,
  fetchCurrentUser,
  refreshToken,
  getCurrentUser,
} from "@/lib/services/auth.service";

interface AuthContextType {
  user: User | null;
  loading: boolean;
  error: string | null;
  refreshUser: () => Promise<void>;
  isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  loading: true,
  error: null,
  refreshUser: async () => {},
  isAuthenticated: false,
});

// Token refresh interval: 12 minutes (before 15min expiry)
const TOKEN_REFRESH_INTERVAL = 12 * 60 * 1000;

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const refreshIntervalRef = useRef<NodeJS.Timeout | null>(null);

  const refreshUser = useCallback(async () => {
    try {
      setError(null);
      const currentUser = await fetchCurrentUser();
      setUser(currentUser);
    } catch (err) {
      console.error("[Auth] Error fetching user:", err);
      setError("Failed to fetch user data");
      setUser(null);
    }
  }, []);

  // Attempt token refresh
  const attemptTokenRefresh = useCallback(async (): Promise<boolean> => {
    try {
      const success = await refreshToken();
      if (success) {
        await refreshUser();
        return true;
      }
      return false;
    } catch {
      return false;
    }
  }, [refreshUser]);

  // Initial load and setup periodic refresh
  useEffect(() => {
    const initAuth = async () => {
      setLoading(true);
      try {
        // First try to get user with current token
        const currentUser = await fetchCurrentUser();

        if (currentUser) {
          setUser(currentUser);
        } else {
          // Token might be expired, try refresh
          const refreshed = await attemptTokenRefresh();
          if (!refreshed) {
            setUser(null);
          }
        }
      } catch (err) {
        setError("Authentication error");
        setUser(null);
      } finally {
        setLoading(false);
      }
    };

    initAuth();

    // Setup periodic token refresh
    refreshIntervalRef.current = setInterval(async () => {
      // Only refresh if user is logged in
      const cached = getCurrentUser();
      if (cached) {
        await attemptTokenRefresh();
      }
    }, TOKEN_REFRESH_INTERVAL);

    return () => {
      if (refreshIntervalRef.current) {
        clearInterval(refreshIntervalRef.current);
      }
    };
  }, [attemptTokenRefresh]);

  const isAuthenticated = user !== null;

  return (
    <AuthContext.Provider
      value={{ user, loading, error, refreshUser, isAuthenticated }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
