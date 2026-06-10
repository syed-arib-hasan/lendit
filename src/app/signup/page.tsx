'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { BookOpen, Loader2, MapPin } from 'lucide-react';

export default function SignupPage() {
  const router = useRouter();
  const [form, setForm] = useState({
    name: '', email: '', phone: '', location: '',
    latitude: '', longitude: '', password: '', confirmPassword: '',
  });
  const [error, setError]     = useState('');
  const [loading, setLoading] = useState(false);
  const [geoLoading, setGeoLoading] = useState(false);

  function update(k: string, v: string) {
    setForm(f => ({ ...f, [k]: v }));
  }

  function getLocation() {
    if (!navigator.geolocation) return alert('Geolocation not supported');
    setGeoLoading(true);
    navigator.geolocation.getCurrentPosition(
      pos => {
        setForm(f => ({
          ...f,
          latitude:  String(pos.coords.latitude),
          longitude: String(pos.coords.longitude),
        }));
        setGeoLoading(false);
      },
      () => { alert('Could not get location'); setGeoLoading(false); }
    );
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    if (form.password !== form.confirmPassword) return setError('Passwords do not match.');
    if (form.password.length < 8) return setError('Password must be at least 8 characters.');

    setLoading(true);
    const res = await fetch('/api/auth/signup', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(form),
    });
    const data = await res.json();
    setLoading(false);

    if (res.ok) router.push('/login?created=1');
    else setError(data.error ?? 'Something went wrong.');
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-maroon-800 to-maroon-950 p-6">
      <div className="w-full max-w-lg bg-white rounded-3xl p-8 shadow-2xl">
        <div className="flex items-center gap-2 mb-8">
          <div className="w-8 h-8 bg-maroon-800 rounded-lg flex items-center justify-center">
            <BookOpen className="w-4 h-4 text-white" />
          </div>
          <span className="font-display font-bold text-maroon-800 text-lg">LendIt</span>
        </div>

        <div className="mb-6">
          <h2 className="font-display text-2xl font-bold text-stone-900 mb-1">Create your account</h2>
          <p className="text-stone-500 text-sm">Join the community and start sharing</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="col-span-2">
              <label className="form-label">Full name</label>
              <input className="form-input" placeholder="Jane Smith" required
                value={form.name} onChange={e => update('name', e.target.value)} />
            </div>
            <div className="col-span-2">
              <label className="form-label">Email address</label>
              <input type="email" className="form-input" placeholder="jane@example.com" required
                value={form.email} onChange={e => update('email', e.target.value)} />
            </div>
            <div>
              <label className="form-label">Phone</label>
              <input className="form-input" placeholder="+1 555 000 0000"
                value={form.phone} onChange={e => update('phone', e.target.value)} />
            </div>
            <div>
              <label className="form-label">City / Area</label>
              <input className="form-input" placeholder="New York, NY" required
                value={form.location} onChange={e => update('location', e.target.value)} />
            </div>
          </div>

          {/* Location */}
          <div>
            <label className="form-label">GPS Location</label>
            <div className="flex gap-2">
              <input readOnly className="form-input flex-1" placeholder="Latitude"
                value={form.latitude} />
              <input readOnly className="form-input flex-1" placeholder="Longitude"
                value={form.longitude} />
              <button type="button" onClick={getLocation} disabled={geoLoading}
                className="btn-secondary flex items-center gap-1.5 whitespace-nowrap">
                {geoLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <MapPin className="w-4 h-4" />}
                {geoLoading ? '…' : 'Get'}
              </button>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="form-label">Password</label>
              <input type="password" className="form-input" placeholder="Min. 8 characters" required
                value={form.password} onChange={e => update('password', e.target.value)} />
            </div>
            <div>
              <label className="form-label">Confirm password</label>
              <input type="password" className="form-input" placeholder="Repeat password" required
                value={form.confirmPassword} onChange={e => update('confirmPassword', e.target.value)} />
            </div>
          </div>

          {error && <div className="bg-red-50 text-red-700 text-sm px-4 py-3 rounded-lg">{error}</div>}

          <button type="submit" disabled={loading} className="btn-primary w-full flex items-center justify-center gap-2 py-3 mt-2">
            {loading && <Loader2 className="w-4 h-4 animate-spin" />}
            {loading ? 'Creating account…' : 'Create account'}
          </button>
        </form>

        <p className="text-center text-sm text-stone-500 mt-5">
          Already have an account?{' '}
          <Link href="/login" className="text-maroon-800 font-semibold hover:underline">Sign in</Link>
        </p>
      </div>
    </div>
  );
}
