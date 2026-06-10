'use client';
import { useState } from 'react';
import { Loader2, MapPin, CheckCircle } from 'lucide-react';

export default function AccountForms({ user }: { user: any }) {
  const [profile, setProfile] = useState({
    name:      user.name ?? '',
    phone:     user.phone ?? '',
    location:  user.location ?? '',
    latitude:  user.latitude ?? '',
    longitude: user.longitude ?? '',
    imageUrl:  user.image_url ?? '',
  });
  const [passwords, setPasswords] = useState({
    current: '', newPw: '', confirm: '',
  });
  const [profileMsg, setProfileMsg] = useState('');
  const [pwMsg, setPwMsg]           = useState('');
  const [profileLoading, setProfileLoading] = useState(false);
  const [pwLoading, setPwLoading]           = useState(false);
  const [geoLoading, setGeoLoading]         = useState(false);

  function getLocation() {
    if (!navigator.geolocation) return;
    setGeoLoading(true);
    navigator.geolocation.getCurrentPosition(
      pos => {
        setProfile(p => ({ ...p, latitude: String(pos.coords.latitude), longitude: String(pos.coords.longitude) }));
        setGeoLoading(false);
      },
      () => setGeoLoading(false)
    );
  }

  async function saveProfile(e: React.FormEvent) {
    e.preventDefault();
    setProfileLoading(true); setProfileMsg('');
    const res = await fetch('/api/user', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(profile),
    });
    setProfileLoading(false);
    setProfileMsg(res.ok ? 'Profile updated.' : 'Update failed.');
  }

  async function changePassword(e: React.FormEvent) {
    e.preventDefault();
    if (passwords.newPw !== passwords.confirm) return setPwMsg('Passwords do not match.');
    if (passwords.newPw.length < 8) return setPwMsg('Password must be at least 8 characters.');
    setPwLoading(true); setPwMsg('');
    const res = await fetch('/api/user/password', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(passwords),
    });
    const data = await res.json();
    setPwLoading(false);
    setPwMsg(res.ok ? 'Password changed.' : (data.error ?? 'Failed.'));
  }

  return (
    <div className="space-y-6">
      {/* Profile form */}
      <div className="card p-6">
        <h2 className="font-semibold text-stone-800 mb-5">Personal information</h2>
        <form onSubmit={saveProfile} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="col-span-2">
              <label className="form-label">Full name</label>
              <input className="form-input" value={profile.name}
                onChange={e => setProfile(p => ({ ...p, name: e.target.value }))} />
            </div>
            <div>
              <label className="form-label">Phone</label>
              <input className="form-input" value={profile.phone}
                onChange={e => setProfile(p => ({ ...p, phone: e.target.value }))} />
            </div>
            <div>
              <label className="form-label">City / Area</label>
              <input className="form-input" value={profile.location}
                onChange={e => setProfile(p => ({ ...p, location: e.target.value }))} />
            </div>
            <div className="col-span-2">
              <label className="form-label">Profile image URL</label>
              <input className="form-input" placeholder="https://…" value={profile.imageUrl}
                onChange={e => setProfile(p => ({ ...p, imageUrl: e.target.value }))} />
            </div>
          </div>

          <div>
            <label className="form-label">GPS location</label>
            <div className="flex gap-2">
              <input readOnly className="form-input flex-1" placeholder="Latitude" value={profile.latitude} />
              <input readOnly className="form-input flex-1" placeholder="Longitude" value={profile.longitude} />
              <button type="button" onClick={getLocation} disabled={geoLoading} className="btn-secondary flex items-center gap-1.5 whitespace-nowrap">
                {geoLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <MapPin className="w-4 h-4" />}
                Update
              </button>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button type="submit" disabled={profileLoading} className="btn-primary flex items-center gap-2">
              {profileLoading && <Loader2 className="w-4 h-4 animate-spin" />}
              Save changes
            </button>
            {profileMsg && (
              <span className={`text-sm flex items-center gap-1.5 ${profileMsg.includes('updated') ? 'text-emerald-600' : 'text-red-600'}`}>
                {profileMsg.includes('updated') && <CheckCircle className="w-4 h-4" />}
                {profileMsg}
              </span>
            )}
          </div>
        </form>
      </div>

      {/* Password form */}
      <div className="card p-6">
        <h2 className="font-semibold text-stone-800 mb-5">Change password</h2>
        <form onSubmit={changePassword} className="space-y-4">
          <div>
            <label className="form-label">Current password</label>
            <input type="password" className="form-input" required value={passwords.current}
              onChange={e => setPasswords(p => ({ ...p, current: e.target.value }))} />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="form-label">New password</label>
              <input type="password" className="form-input" required value={passwords.newPw}
                onChange={e => setPasswords(p => ({ ...p, newPw: e.target.value }))} />
            </div>
            <div>
              <label className="form-label">Confirm new password</label>
              <input type="password" className="form-input" required value={passwords.confirm}
                onChange={e => setPasswords(p => ({ ...p, confirm: e.target.value }))} />
            </div>
          </div>
          <div className="flex items-center gap-3">
            <button type="submit" disabled={pwLoading} className="btn-primary flex items-center gap-2">
              {pwLoading && <Loader2 className="w-4 h-4 animate-spin" />}
              Change password
            </button>
            {pwMsg && (
              <span className={`text-sm ${pwMsg === 'Password changed.' ? 'text-emerald-600' : 'text-red-600'}`}>{pwMsg}</span>
            )}
          </div>
        </form>
      </div>
    </div>
  );
}
