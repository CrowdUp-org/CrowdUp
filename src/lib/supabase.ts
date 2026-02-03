import { createClient } from "@supabase/supabase-js";
import { Database } from "./database.types";

/**
 * Supabase Configuration
 *
 * SECURITY:
 * - NEXT_PUBLIC_* keys are safe to expose (publishable/anon keys)
 * - SUPABASE_SECRET_KEY must NEVER be exposed to clients
 * - All env vars must be properly set in production
 */

const isDev = process.env.NODE_ENV !== "production";

/**
 * Gets Supabase URL with validation.
 * Placeholder is allowed in development for build purposes.
 */
const getSupabaseUrl = (): string => {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  if (!url) {
    if (isDev) {
      console.warn(
        "[CONFIG] NEXT_PUBLIC_SUPABASE_URL not set. Using placeholder for build."
      );
      return "https://placeholder.supabase.co";
    }
    throw new Error(
      "NEXT_PUBLIC_SUPABASE_URL environment variable is required"
    );
  }
  return url;
};

/**
 * Gets Supabase publishable key with validation.
 * This is the anon/public key - safe to expose.
 */
const getSupabasePublishableKey = (): string => {
  const key = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;
  if (!key) {
    if (isDev) {
      console.warn(
        "[CONFIG] NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY not set. Using placeholder for build."
      );
      return "placeholder-key";
    }
    throw new Error(
      "NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY environment variable is required"
    );
  }
  return key;
};

/**
 * Gets Supabase secret key with validation.
 * SECURITY: This key has full database access - NEVER expose to clients.
 */
const getSupabaseSecretKey = (): string => {
  const key = process.env.SUPABASE_SECRET_KEY;
  if (!key) {
    if (isDev) {
      console.warn(
        "[CONFIG] SUPABASE_SECRET_KEY not set. Admin operations will fail."
      );
      return "placeholder-secret-key";
    }
    throw new Error(
      "SUPABASE_SECRET_KEY environment variable is required in production"
    );
  }
  return key;
};

const supabaseUrl = getSupabaseUrl();
const supabasePublishableKey = getSupabasePublishableKey();
const supabaseSecretKey = getSupabaseSecretKey();

// Client-side Supabase client (publishable key)
export const supabase = createClient<Database>(
  supabaseUrl,
  supabasePublishableKey,
  {
    auth: {
      persistSession: false, // Disable session persistence for better performance
      autoRefreshToken: false,
    },
    global: {
      headers: {
        "x-client-info": "crowdup-web",
      },
    },
  },
);

// Server-side Supabase client (Secret API key) for privileged operations
// SECURITY: Only use supabaseAdmin on the server side. Never expose to clients.
export const supabaseAdmin = createClient<Database>(
  supabaseUrl,
  supabaseSecretKey,
  {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
    },
    global: {
      headers: {
        "x-client-info": "crowdup-server",
        "x-admin-auth": "true",
      },
    },
  },
);
