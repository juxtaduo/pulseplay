import { LogIn, LogOut, User } from 'lucide-react';
import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import { User as SupabaseUser } from '@supabase/supabase-js';

export const AuthButton = () => {
  const [user, setUser] = useState<SupabaseUser | null>(null);
  const [loading, setLoading] = useState(true);
  const [showAuthModal, setShowAuthModal] = useState(false);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
      setLoading(false);
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
    });

    return () => subscription.unsubscribe();
  }, []);

  const handleSignOut = async () => {
    await supabase.auth.signOut();
  };

  if (loading) {
    return (
      <div className="w-10 h-10 bg-slate-700 rounded-full animate-pulse" />
    );
  }

  if (user) {
    return (
      <div className="flex items-center gap-3">
        <div className="flex items-center gap-2 bg-slate-800 rounded-full px-4 py-2">
          <User size={18} className="text-slate-400" />
          <span className="text-sm text-slate-300">
            {user.email?.split('@')[0]}
          </span>
        </div>
        <button
          onClick={handleSignOut}
          className="p-2 bg-slate-800 hover:bg-slate-700 rounded-full transition-colors text-slate-300"
          title="Sign Out"
        >
          <LogOut size={18} />
        </button>
      </div>
    );
  }

  return (
    <>
      <button
        onClick={() => setShowAuthModal(true)}
        className="flex items-center gap-2 bg-blue-500 hover:bg-blue-600 px-4 py-2 rounded-full transition-colors text-white font-medium"
      >
        <LogIn size={18} />
        Sign In
      </button>

      {showAuthModal && (
        <AuthModal onClose={() => setShowAuthModal(false)} />
      )}
    </>
  );
};

const AuthModal = ({ onClose }: { onClose: () => void }) => {
  const [isSignUp, setIsSignUp] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      if (isSignUp) {
        const { error } = await supabase.auth.signUp({ email, password });
        if (error) throw error;
      } else {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
      }
      onClose();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-slate-800 rounded-xl p-6 max-w-md w-full">
        <h2 className="text-2xl font-bold text-white mb-4">
          {isSignUp ? 'Sign Up' : 'Sign In'}
        </h2>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">
              Email
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-4 py-2 bg-slate-900 border border-slate-700 rounded-lg text-white focus:outline-none focus:border-blue-500"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">
              Password
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-4 py-2 bg-slate-900 border border-slate-700 rounded-lg text-white focus:outline-none focus:border-blue-500"
              required
              minLength={6}
            />
          </div>

          {error && (
            <div className="p-3 bg-red-500 bg-opacity-10 border border-red-500 rounded-lg text-red-400 text-sm">
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full py-2 bg-blue-500 hover:bg-blue-600 disabled:bg-slate-700 rounded-lg text-white font-medium transition-colors"
          >
            {loading ? 'Loading...' : isSignUp ? 'Sign Up' : 'Sign In'}
          </button>
        </form>

        <div className="mt-4 text-center">
          <button
            onClick={() => setIsSignUp(!isSignUp)}
            className="text-sm text-blue-400 hover:text-blue-300"
          >
            {isSignUp
              ? 'Already have an account? Sign In'
              : "Don't have an account? Sign Up"}
          </button>
        </div>

        <button
          onClick={onClose}
          className="mt-4 w-full py-2 bg-slate-700 hover:bg-slate-600 rounded-lg text-slate-300 font-medium transition-colors"
        >
          Cancel
        </button>
      </div>
    </div>
  );
};
