"use client";

import { useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { createClient } from "@/lib/supabase/client";

export function ProfileCheck() {
  const { user } = useAuth();
  const supabase = createClient();

  useEffect(() => {
    const ensureProfile = async () => {
      if (!user) return;

      // Check if profile exists
      const { data: profile } = await supabase
        .from("profiles")
        .select("id")
        .eq("id", user.id)
        .single();

      // If profile doesn't exist, create it
      if (!profile) {
        await supabase.from("profiles").insert({
          id: user.id,
          email: user.email!,
          full_name: user.user_metadata?.full_name || null,
          avatar_url: user.user_metadata?.avatar_url || null,
        });
      }
    };

    ensureProfile();
  }, [user, supabase]);

  return null;
}
