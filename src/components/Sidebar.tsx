'use client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { signOut, useSession } from 'next-auth/react';
import {
  LayoutDashboard, Search, Package, History,
  User, LogOut, BookOpen, HandshakeIcon,
} from 'lucide-react';

const nav = [
  { href: '/dashboard',  label: 'Dashboard',  icon: LayoutDashboard },
  { href: '/search',     label: 'Browse',      icon: Search },
  { href: '/inventory',  label: 'My Items',    icon: Package },
  { href: '/requests',   label: 'Requests',    icon: HandshakeIcon },
  { href: '/history',    label: 'History',     icon: History },
  { href: '/account',    label: 'My Account',  icon: User },
];

export default function Sidebar() {
  const pathname = usePathname();
  const { data: session } = useSession();

  return (
    <aside className="fixed inset-y-0 left-0 w-64 flex flex-col bg-gradient-to-b from-maroon-800 to-maroon-950 z-50">
      {/* Logo */}
      <div className="px-6 py-6 border-b border-white/10">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 bg-white/20 rounded-lg flex items-center justify-center">
            <BookOpen className="w-4 h-4 text-white" />
          </div>
          <span className="font-display font-bold text-white text-lg tracking-tight">LendIt</span>
        </div>
      </div>

      {/* User */}
      <div className="px-4 py-4 border-b border-white/10">
        <div className="flex items-center gap-3">
          <img
            src={session?.user?.image ?? `https://api.dicebear.com/7.x/personas/svg?seed=${session?.user?.email}`}
            alt="avatar"
            className="w-9 h-9 rounded-full bg-white/20 object-cover"
          />
          <div className="min-w-0">
            <p className="text-white text-sm font-semibold truncate">{session?.user?.name ?? 'User'}</p>
            <p className="text-stone-300 text-xs truncate">{session?.user?.email}</p>
          </div>
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 px-3 py-4 space-y-0.5 overflow-y-auto">
        {nav.map(({ href, label, icon: Icon }) => (
          <Link
            key={href}
            href={href}
            className={`sidebar-link ${pathname.startsWith(href) ? 'active' : ''}`}
          >
            <Icon className="w-4 h-4 flex-shrink-0" />
            {label}
          </Link>
        ))}
      </nav>

      {/* Logout */}
      <div className="px-3 py-4 border-t border-white/10">
        <button
          onClick={() => signOut({ callbackUrl: '/login' })}
          className="sidebar-link w-full text-left text-stone-300 hover:text-white"
        >
          <LogOut className="w-4 h-4 flex-shrink-0" />
          Sign out
        </button>
      </div>
    </aside>
  );
}
