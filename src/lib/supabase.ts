import { createClient } from "@supabase/supabase-js";
import { Database } from "./database.types";

const supabaseUrl =
  process.env.NEXT_PUBLIC_SUPABASE_URL || "https://placeholder.supabase.co";
const supabasePublishableKey =
  process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY || "placeholder-key";

if (
  !process.env.NEXT_PUBLIC_SUPABASE_URL ||
  !process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY
) {
  console.error(
    "CRITICAL: Missing Supabase environment variables. Using placeholders for build/development.",
  );
}

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
const supabaseSecretKey =
  process.env.SUPABASE_SECRET_KEY || "placeholder-secret-key";

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
