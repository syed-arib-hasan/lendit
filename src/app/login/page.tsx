'use client';
import { useState } from 'react';
import { signIn } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { BookOpen, Eye, EyeOff, Loader2 } from 'lucide-react';

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail]       = useState('');
  const [password, setPassword] = useState('');
  const [showPw, setShowPw]     = useState(false);
  const [error, setError]       = useState('');
  const [loading, setLoading]   = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    setLoading(true);
    const res = await signIn('credentials', { email, password, redirect: false });
    setLoading(false);
    if (res?.ok) router.push('/dashboard');
    else setError('Invalid email or password.');
  }

  return (
    <div className="min-h-screen flex bg-gradient-to-br from-maroon-800 via-maroon-900 to-maroon-950">
      {/* Left panel — branding */}
      <div className="hidden lg:flex flex-col justify-between w-1/2 p-12 text-white">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center">
            <BookOpen className="w-5 h-5" />
          </div>
          <span className="font-display font-bold text-2xl">LendIt</span>
        </div>
        <div>
          <h1 className="font-display text-5xl font-bold leading-tight mb-6">
            Share more,<br />own less.
          </h1>
          <p className="text-stone-300 text-lg leading-relaxed max-w-md">
            A community platform for lending and borrowing books, electronics, and outdoor gear with people you trust.
          </p>
        </div>
        <div className="flex gap-8">
          {[['2,400+', 'Items listed'], ['840+', 'Members'], ['98%', 'Return rate']].map(([n, l]) => (
            <div key={l}>
              <p className="text-3xl font-bold text-white">{n}</p>
              <p className="text-stone-400 text-sm">{l}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Right panel — form */}
      <div className="flex-1 flex items-center justify-center p-6">
        <div className="w-full max-w-md bg-white rounded-3xl p-8 shadow-2xl">
          <div className="mb-8">
            <h2 className="font-display text-2xl font-bold text-stone-900 mb-1">Welcome back</h2>
            <p className="text-stone-500 text-sm">Sign in to your LendIt account</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="form-label">Email address</label>
              <input
                type="email" required autoComplete="email"
                className="form-input"
                placeholder="you@example.com"
                value={email}
                onChange={e => setEmail(e.target.value)}
              />
            </div>

            <div>
              <label className="form-label">Password</label>
              <div className="relative">
                <input
                  type={showPw ? 'text' : 'password'} required autoComplete="current-password"
                  className="form-input pr-10"
                  placeholder="Your password"
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                />
                <button
                  type="button"
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-stone-400 hover:text-stone-600"
                  onClick={() => setShowPw(v => !v)}
                >
                  {showPw ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {error && (
              <div className="bg-red-50 text-red-700 text-sm px-4 py-3 rounded-lg">{error}</div>
            )}

            <button type="submit" disabled={loading} className="btn-primary w-full flex items-center justify-center gap-2 py-3">
              {loading && <Loader2 className="w-4 h-4 animate-spin" />}
              {loading ? 'Signing in…' : 'Sign in'}
            </button>
          </form>

          <p className="text-center text-sm text-stone-500 mt-6">
            No account yet?{' '}
            <Link href="/signup" className="text-maroon-800 font-semibold hover:underline">Create one</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
