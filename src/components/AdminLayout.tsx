'use client';

import { useState, useEffect, useCallback } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import Link from 'next/link';

const sidebarItems = [
  { href: 'dashboard', label: 'Dashboard', icon: 'fa-gauge-high' },
  { href: 'products', label: 'Products', icon: 'fa-box' },
  { href: 'categories', label: 'Categories', icon: 'fa-tags' },
  { href: 'news', label: 'News', icon: 'fa-newspaper' },
  { href: 'pages', label: 'Pages', icon: 'fa-file-lines' },
  { href: 'settings', label: 'Settings', icon: 'fa-gear' },
  { href: 'media', label: 'Media', icon: 'fa-image' },
];

function getToken(): string | null {
  if (typeof document === 'undefined') return null;
  const fromStorage = localStorage.getItem('admin_token');
  if (fromStorage) return fromStorage;
  const match = document.cookie.match(/(?:^|;\s*)token=([^;]*)/);
  return match ? match[1] : null;
}

function clearToken(): void {
  if (typeof document === 'undefined') return;
  localStorage.removeItem('admin_token');
  document.cookie = 'token=; path=/; max-age=0';
  document.cookie = 'admin_token=; path=/; max-age=0';
}

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [authChecked, setAuthChecked] = useState(false);

  const locale = pathname.startsWith('/en') ? 'en' : pathname.startsWith('/de') ? 'de' : 'zh';
  const isLoginPage = pathname.endsWith('/admin/login');

  useEffect(() => {
    const token = getToken();
    if (!token && !isLoginPage) {
      router.replace(`/${locale}/admin/login`);
    }
    setAuthChecked(true);
  }, []);

  const handleLogout = useCallback(() => {
    clearToken();
    router.replace(`/${locale}/admin/login`);
  }, [locale, router]);

  const isActive = (href: string) => {
    const adminPath = `/${locale}/admin/${href}`;
    return pathname === adminPath || pathname.startsWith(adminPath + '/');
  };

  // Login page — render children with no chrome
  if (isLoginPage) {
    return <>{children}</>;
  }

  // Auth check in progress — show loading spinner
  if (!authChecked) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#f5f7fa]">
        <div className="w-8 h-8 border-2 border-[#1a3a5c] border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex bg-[#f5f7fa]">
      {/* Mobile overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/40 z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* ============ SIDEBAR ============ */}
      <aside
        className={`fixed inset-y-0 left-0 z-50 w-64 bg-[#1a3a5c] text-white flex flex-col
          transition-transform duration-300 ease-in-out
          lg:static lg:translate-x-0
          ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}`}
      >
        {/* Logo */}
        <div className="h-16 flex items-center justify-between px-5 border-b border-white/10 shrink-0">
          <Link href={`/${locale}/admin`}>
            <img src="/logo.jpeg" alt="品仕高 PINSHIGAO" className="h-20 w-auto" />
          </Link>
          {/* Close button (mobile only) */}
          <button
            onClick={() => setSidebarOpen(false)}
            className="w-8 h-8 flex items-center justify-center lg:hidden text-white/60 hover:text-white transition-colors"
            aria-label="Close menu"
          >
            <i className="fa-solid fa-xmark text-lg" />
          </button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 overflow-y-auto p-4 space-y-1">
          {sidebarItems.map((item) => (
            <Link
              key={item.href}
              href={`/${locale}/admin/${item.href}`}
              onClick={() => setSidebarOpen(false)}
              className={`flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm font-medium transition-colors
                ${isActive(item.href)
                  ? 'bg-white/10 text-[#c8a96e]'
                  : 'text-white/70 hover:bg-white/5 hover:text-white'}`}
            >
              <i className={`fa-solid ${item.icon} w-5 text-center text-sm shrink-0`} />
              {item.label}
            </Link>
          ))}
        </nav>

        {/* Bottom link */}
        <div className="p-4 border-t border-white/10 shrink-0">
          <Link
            href={`/${locale}`}
            className="flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm text-white/50 hover:text-white/80 hover:bg-white/5 transition-colors"
          >
            <i className="fa-solid fa-arrow-left w-5 text-center shrink-0" />
            Back to Site
          </Link>
        </div>
      </aside>

      {/* ============ MAIN CONTENT ============ */}
      <div className="flex-1 flex flex-col min-h-screen">
        {/* Top bar */}
        <header className="h-16 bg-white border-b border-[#e8e8e8] flex items-center justify-between px-4 lg:px-6 sticky top-0 z-30 shrink-0">
          <div className="flex items-center gap-3">
            {/* Hamburger (mobile) */}
            <button
              onClick={() => setSidebarOpen(true)}
              className="w-10 h-10 flex flex-col justify-center items-center gap-1 lg:hidden"
              aria-label="Open menu"
            >
              <span className="block w-5 h-[2px] bg-[#1a3a5c] rounded" />
              <span className="block w-5 h-[2px] bg-[#1a3a5c] rounded" />
              <span className="block w-5 h-[2px] bg-[#1a3a5c] rounded" />
            </button>
            <h1 className="text-lg font-semibold text-[#1a3a5c] hidden sm:block select-none">
              Admin Panel
            </h1>
          </div>

          <div className="flex items-center gap-3">
            {/* User info */}
            <div className="flex items-center gap-2 text-sm">
              <div className="w-8 h-8 rounded-full bg-[#1a3a5c] text-white flex items-center justify-center text-xs font-medium select-none">
                A
              </div>
              <span className="text-[#1a1a1a] hidden sm:inline">Admin</span>
            </div>

            {/* Logout */}
            <button
              onClick={handleLogout}
              className="px-3 py-2 text-sm text-[#666666] hover:text-[#1a3a5c] transition-colors flex items-center gap-2 rounded-lg hover:bg-gray-50"
            >
              <i className="fa-solid fa-right-from-bracket" />
              <span className="hidden sm:inline">Logout</span>
            </button>
          </div>
        </header>

        {/* Page content */}
        <main className="flex-1 p-4 lg:p-6 overflow-auto">
          {children}
        </main>
      </div>
    </div>
  );
}
