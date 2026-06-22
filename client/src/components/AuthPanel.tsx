import { useState, type FormEvent } from 'react';
import { LogIn, UserPlus } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export function AuthPanel() {
  const [mode, setMode] = useState<'login' | 'register'>('login');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const auth = useAuth();

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    setLoading(true);
    setError(null);

    try {
      if (mode === 'register') {
        await auth.register({ name, email, password });
      } else {
        await auth.login({ email, password });
      }
    } catch (submitError) {
      setError(submitError instanceof Error ? submitError.message : 'Authentication failed');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="rounded-3xl border border-slate-200/80 dark:border-white/10 bg-slate-100/70 dark:bg-slate-950/55 p-5 shadow-glow backdrop-blur-xl">
      <div className="mb-4 flex gap-2 rounded-2xl border border-slate-200/80 dark:border-white/10 bg-slate-200/50 dark:bg-slate-950/25 p-1">
        <button type="button" onClick={() => setMode('login')} className={`flex-1 rounded-xl px-4 py-2 text-sm font-semibold transition ${mode === 'login' ? 'bg-cyan-400/25 dark:bg-cyan-400/20 text-cyan-800 dark:text-cyan-50' : 'text-slate-500 dark:text-slate-400'}`}>
          <LogIn size={14} className="mr-2 inline" />
          Login
        </button>
        <button type="button" onClick={() => setMode('register')} className={`flex-1 rounded-xl px-4 py-2 text-sm font-semibold transition ${mode === 'register' ? 'bg-cyan-400/25 dark:bg-cyan-400/20 text-cyan-800 dark:text-cyan-50' : 'text-slate-500 dark:text-slate-400'}`}>
          <UserPlus size={14} className="mr-2 inline" />
          Register
        </button>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        {mode === 'register' ? (
          <input
            value={name}
            onChange={(event) => setName(event.target.value)}
            placeholder="Display name"
            className="field-input"
            autoComplete="name"
          />
        ) : null}
        <input value={email} onChange={(event) => setEmail(event.target.value)} placeholder="Email address" className="field-input" autoComplete="email" />
        <input
          value={password}
          onChange={(event) => setPassword(event.target.value)}
          placeholder="Password"
          type="password"
          className="field-input"
          autoComplete={mode === 'register' ? 'new-password' : 'current-password'}
        />
        {error ? <div className="rounded-2xl border border-rose-500/30 dark:border-rose-500/20 bg-rose-500/15 dark:bg-rose-500/10 px-4 py-3 text-sm text-rose-800 dark:text-rose-100">{error}</div> : null}
        <button type="submit" disabled={loading} className="w-full rounded-2xl bg-gradient-to-r from-cyan-400 to-emerald-400 px-4 py-3 font-semibold text-slate-950 transition hover:brightness-110 disabled:opacity-60">
          {mode === 'register' ? 'Create Account' : 'Sign In'}
        </button>
      </form>
    </div>
  );
}
