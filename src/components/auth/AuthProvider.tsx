import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import type { Session, User } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';

interface AuthCtx {
  session: Session | null;
  user: User | null;
  isAdmin: boolean;
  linkedBdrProfileId: string | null;
  loading: boolean;
  signOut: () => Promise<void>;
}

const Ctx = createContext<AuthCtx | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<Session | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [linkedBdrProfileId, setLinkedBdrProfileId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Register listener BEFORE the initial getSession() to avoid race.
    const { data: sub } = supabase.auth.onAuthStateChange((_event, sess) => {
      setSession(sess);
      if (!sess) {
        setIsAdmin(false);
        setLinkedBdrProfileId(null);
      } else {
        // Defer DB queries off the auth callback.
        setTimeout(() => loadRoleAndProfile(sess.user.id), 0);
      }
    });

    supabase.auth.getSession().then(({ data }) => {
      setSession(data.session);
      if (data.session) {
        loadRoleAndProfile(data.session.user.id).finally(() => setLoading(false));
      } else {
        setLoading(false);
      }
    });

    return () => sub.subscription.unsubscribe();
  }, []);

  const loadRoleAndProfile = async (userId: string) => {
    const [roleRes, profRes] = await Promise.all([
      supabase.from('user_roles').select('role').eq('user_id', userId).eq('role', 'admin').maybeSingle(),
      supabase.from('bdr_profiles').select('id').eq('user_id', userId).maybeSingle(),
    ]);
    setIsAdmin(!!roleRes.data);
    setLinkedBdrProfileId(profRes.data?.id ?? null);
  };

  const signOut = async () => {
    await supabase.auth.signOut();
  };

  return (
    <Ctx.Provider value={{
      session,
      user: session?.user ?? null,
      isAdmin,
      linkedBdrProfileId,
      loading,
      signOut,
    }}>
      {children}
    </Ctx.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(Ctx);
  if (!ctx) throw new Error('useAuth must be inside AuthProvider');
  return ctx;
}
