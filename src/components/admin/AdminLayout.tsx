'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';

interface AdminLayoutProps {
  children: React.ReactNode;
}

const navItems = [
  { label: 'Products', href: '/admin/products', icon: 'fa-cube' },
  { label: 'Categories', href: '/admin/categories', icon: 'fa-layer-group' },
  { label: 'News', href: '/admin/news', icon: 'fa-newspaper' },
  { label: 'Pages', href: '/admin/pages', icon: 'fa-file-lines' },
  { label: 'Media', href: '/admin/media', icon: 'fa-images' },
  { label: 'Settings', href: '/admin/settings', icon: 'fa-gear' },
];

export default function AdminLayout({ children }: AdminLayoutProps) {
  const pathname = usePathname();
  const router = useRouter();
  const locale = pathname?.split('/')[1] || 'zh';
  const [sidebarOpen, setSidebarOpen] = useState(false);

  function handleLogout() {
    document.cookie = 'token=; path=/; max-age=0';
    router.push(`/${locale}/admin/login`);
  }

  function isActive(href: string) {
    return pathname === `/${locale}${href}` || pathname.startsWith(`/${locale}${href}/`);
  }

  const linkClass = (href: string) =>
    `flex items-center gap-3 px-4 py-2.5 text-sm rounded-lg transition-colors ${
      isActive(href)
        ? 'bg-white/10 text-white font-medium'
        : 'text-gray-300 hover:bg-white/5 hover:text-white'
    }`;

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Mobile overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/50 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`fixed inset-y-0 left-0 z-50 w-64 bg-[#1a3a5c] flex flex-col transition-transform duration-300 lg:translate-x-0 lg:static lg:z-auto ${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {/* Logo / Brand */}
        <div className="h-16 flex items-center gap-3 px-6 border-b border-white/10 shrink-0">
          <i className="fa-solid fa-wrench text-[#c8a96e] text-lg" />
          <span className="text-white font-semibold text-base tracking-wide">PSG Admin</span>
        </div>

        {/* Navigation */}
        <nav className="flex-1 overflow-y-auto px-3 py-6 space-y-1">
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={`/${locale}${item.href}`}
              className={linkClass(item.href)}
              onClick={() => setSidebarOpen(false)}
            >
              <i className={`fa-solid ${item.icon} w-5 text-center text-sm opacity-70`} />
              {item.label}
            </Link>
          ))}
        </nav>

        {/* Logout */}
        <div className="px-3 pb-6 shrink-0">
          <button
            onClick={handleLogout}
            className="flex items-center gap-3 px-4 py-2.5 w-full text-sm text-gray-300 hover:text-white hover:bg-white/5 rounded-lg transition-colors"
          >
            <i className="fa-solid fa-right-from-bracket w-5 text-center text-sm opacity-70" />
            Logout
          </button>
        </div>
      </aside>

      {/* Main content area */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Top bar (mobile hamburger) */}
        <header className="h-16 bg-white border-b border-gray-200 flex items-center px-4 lg:px-8 shrink-0 lg:hidden">
          <button
            onClick={() => setSidebarOpen(true)}
            className="p-2 -ml-2 text-gray-600 hover:text-gray-900"
          >
            <i className="fa-solid fa-bars text-lg" />
          </button>
          <span className="ml-3 text-sm font-medium text-gray-700">PSG Admin</span>
        </header>

        {/* Page content */}
        <main className="flex-1 overflow-y-auto p-6 lg:p-8">
          {children}
        </main>
      </div>
    </div>
  );
}
