import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { lovable } from '@/integrations/lovable';
import { toast } from 'sonner';

export default function Auth() {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      if (data.session) navigate('/', { replace: true });
    });
  }, [navigate]);

  const handleEmailSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    setSubmitting(false);
    if (error) {
      toast.error(error.message);
      return;
    }
    navigate('/', { replace: true });
  };

  const handleGoogle = async () => {
    const result = await lovable.auth.signInWithOAuth('google', {
      redirect_uri: window.location.origin,
    });
    if (result.error) {
      toast.error((result.error as Error).message || 'Google sign-in failed');
      return;
    }
    if (result.redirected) return;
    navigate('/', { replace: true });
  };

  return (
    <main className="min-h-screen flex items-center justify-center px-4" style={{ background: '#F8FAFC' }}>
      <div className="w-full max-w-sm rounded-xl p-8" style={{ background: '#FFFFFF', border: '1px solid #E2E8F0', boxShadow: '0 1px 3px rgba(15,23,42,0.04)' }}>
        <h1 className="text-2xl font-semibold tracking-tight mb-1" style={{ color: '#0F172A' }}>Sign in to Flare</h1>
        <p className="text-sm mb-6" style={{ color: '#64748B' }}>Invite-only access for BDRs and admins.</p>

        <button
          onClick={handleGoogle}
          className="w-full mb-4 px-4 py-2.5 rounded-md text-sm font-medium flex items-center justify-center gap-2"
          style={{ background: '#FFFFFF', border: '1px solid #E2E8F0', color: '#0F172A' }}
        >
          <svg width="16" height="16" viewBox="0 0 24 24" aria-hidden>
            <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
            <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.99.66-2.25 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84A11 11 0 0 0 12 23z"/>
            <path fill="#FBBC05" d="M5.84 14.1A6.6 6.6 0 0 1 5.5 12c0-.73.12-1.43.34-2.1V7.07H2.18A11 11 0 0 0 1 12c0 1.77.42 3.44 1.18 4.93l3.66-2.83z"/>
            <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.2 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1A11 11 0 0 0 2.18 7.07l3.66 2.83C6.71 7.31 9.14 5.38 12 5.38z"/>
          </svg>
          Continue with Google
        </button>

        <div className="flex items-center gap-3 my-4">
          <div className="flex-1 h-px" style={{ background: '#E2E8F0' }} />
          <span className="text-[11px] uppercase tracking-wider" style={{ color: '#94A3B8' }}>or</span>
          <div className="flex-1 h-px" style={{ background: '#E2E8F0' }} />
        </div>

        <form onSubmit={handleEmailSignIn} className="space-y-3">
          <div>
            <label className="block text-xs font-medium mb-1" style={{ color: '#334155' }}>Email</label>
            <input
              type="email" required value={email} onChange={(e) => setEmail(e.target.value)}
              className="w-full px-3 py-2 rounded-md text-sm focus:outline-none focus:ring-2"
              style={{ background: '#FFFFFF', border: '1px solid #E2E8F0', color: '#0F172A' }}
            />
          </div>
          <div>
            <label className="block text-xs font-medium mb-1" style={{ color: '#334155' }}>Password</label>
            <input
              type="password" required value={password} onChange={(e) => setPassword(e.target.value)}
              className="w-full px-3 py-2 rounded-md text-sm focus:outline-none focus:ring-2"
              style={{ background: '#FFFFFF', border: '1px solid #E2E8F0', color: '#0F172A' }}
            />
          </div>
          <button
            type="submit" disabled={submitting}
            className="w-full px-4 py-2.5 rounded-md text-sm font-semibold"
            style={{ background: '#0EA5E9', color: '#FFFFFF' }}
          >
            {submitting ? 'Signing in…' : 'Sign in'}
          </button>
        </form>

        <p className="text-[11px] mt-5" style={{ color: '#94A3B8' }}>
          New accounts are created by an admin. Contact your administrator if you don't have one.
        </p>
      </div>
    </main>
  );
}
