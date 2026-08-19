import { supabase } from "@/lib/supabase";
import { trpc } from "@/lib/trpc";
import { useCallback, useEffect, useMemo, useState } from "react";
import type { Session } from "@supabase/supabase-js";

/**
 * useAuth hook powered by Supabase Auth.
 *
 * Flow:
 * 1. Listen for Supabase auth state changes (onAuthStateChange)
 * 2. When a session is obtained, call `auth.syncUser` to upsert in our DB
 * 3. The tRPC `auth.me` query (using the Bearer token) returns the app-level user
 */
export function useAuth() {
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const utils = trpc.useUtils();

  const meQuery = trpc.auth.me.useQuery(undefined, {
    retry: false,
    refetchOnWindowFocus: false,
    enabled: !!session, // only query when we have a session
  });

  const syncMutation = trpc.auth.syncUser.useMutation({
    onSuccess: () => {
      // After syncing, refetch the user data
      utils.auth.me.invalidate();
    },
  });

  // Listen for Supabase auth state changes
  useEffect(() => {
    // Get initial session
    supabase.auth.getSession().then(({ data: { session: s } }) => {
      setSession(s);
      if (s) {
        syncMutation.mutate({ accessToken: s.access_token });
      }
      setLoading(false);
    });

    // Subscribe to auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (_event, newSession) => {
        setSession(newSession);
        if (newSession) {
          syncMutation.mutate({ accessToken: newSession.access_token });
        } else {
          utils.auth.me.setData(undefined, null);
        }
        setLoading(false);
      }
    );

    return () => {
      subscription.unsubscribe();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const logout = useCallback(async () => {
    await supabase.auth.signOut();
    utils.auth.me.setData(undefined, null);
    await utils.auth.me.invalidate();
  }, [utils]);

  const state = useMemo(() => ({
    user: meQuery.data ?? null,
    loading: loading || meQuery.isLoading,
    error: meQuery.error ?? null,
    isAuthenticated: Boolean(meQuery.data),
    session,
  }), [
    meQuery.data,
    meQuery.error,
    meQuery.isLoading,
    loading,
    session,
  ]);

  return {
    ...state,
    refresh: () => meQuery.refetch(),
    logout,
  };
}
