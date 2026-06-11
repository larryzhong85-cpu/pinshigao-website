'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

const locales = [
  { code: 'zh', label: '中文' },
  { code: 'en', label: 'EN' },
  { code: 'de', label: 'DE' },
];

export default function Header() {
  const t = useTranslations('nav');
  const pathname = usePathname();
  const [menuOpen, setMenuOpen] = useState(false);

  const currentLocale = locales.find(l => pathname.startsWith(`/${l.code}`))?.code || 'zh';

  // Don't render on admin pages
  if (pathname?.includes('/admin/')) return null;

  const navItems = [
    { href: `/${currentLocale}`, label: t('home') },
    { href: `/${currentLocale}/products`, label: t('products') },
    { href: `/${currentLocale}/solutions`, label: t('solutions') },
    { href: `/${currentLocale}/about`, label: t('about') },
    { href: `/${currentLocale}/news`, label: t('news') },
    { href: `/${currentLocale}/contact`, label: t('contact') },
  ];

  function switchLang(code: string) {
    const segments = pathname.split('/').filter(Boolean);
    segments[0] = code;
    window.location.href = '/' + segments.join('/');
  }

  return (
    <>
      {/* Top Bar */}
      <div className="bg-[#1a3a5c] text-white/80 text-xs py-2 hidden md:block">
        <div className="max-w-[1280px] mx-auto px-6 flex justify-end items-center gap-6">
          <div className="flex gap-4 items-center">
            <span className="flex items-center gap-1.5">
              <i className="fa-solid fa-phone text-[#c8a96e] text-[10px]"></i>
              +86 400-888-9999
            </span>
            <span className="flex items-center gap-1.5">
              <i className="fa-solid fa-envelope text-[#c8a96e] text-[10px]"></i>
              info@pinshigao.com
            </span>
          </div>
          <div className="flex items-center gap-0">
            {locales.map((l, i) => (
              <button
                key={l.code}
                onClick={() => switchLang(l.code)}
                className={`px-3 py-1 text-[11px] uppercase tracking-wider transition-colors
                  ${currentLocale === l.code ? 'text-[#c8a96e]' : 'text-white/50 hover:text-white'}
                  ${i < locales.length - 1 ? 'border-r border-white/15' : ''}`}
              >
                {l.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Main Header */}
      <header className="sticky top-0 z-50 bg-white/97 backdrop-blur-md border-b border-gray-100">
        <div className="max-w-[1280px] mx-auto px-6 flex justify-between items-center h-28">
          <Link href={`/${currentLocale}`} className="flex items-center gap-4 z-50">
            <img src="/logo.jpeg" alt="品仕高 PINSHIGAO" className="h-24 w-auto" />
            <div className="hidden sm:block border-l border-gray-200 pl-4 leading-tight">
              <div className="text-[11px] text-gray-500 font-medium tracking-wider whitespace-nowrap">为家居打造完美运动</div>
              <div className="text-[9px] text-gray-300 tracking-wider whitespace-nowrap">Perfect Motion for Your Home</div>
            </div>
          </Link>

          {/* Desktop Nav */}
          <nav className="hidden lg:flex items-center gap-1">
            {navItems.map(item => {
              const isActive = pathname === item.href || pathname.startsWith(item.href + '/');
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`px-4 py-2 text-sm font-medium transition-colors rounded
                    ${isActive ? 'text-[#1a3a5c] bg-gray-50' : 'text-gray-600 hover:text-[#1a3a5c] hover:bg-gray-50'}`}
                >
                  {item.label}
                </Link>
              );
            })}
            <Link
              href={`/${currentLocale}/contact`}
              className="ml-4 px-5 py-2 bg-[#c8a96e] text-white text-sm font-medium hover:bg-[#a8894e] transition-colors"
            >
              {t('contact')}
            </Link>
          </nav>

          {/* Mobile: Language + Hamburger */}
          <div className="flex items-center gap-3 lg:hidden">
            {locales.map(l => (
              <button
                key={l.code}
                onClick={() => switchLang(l.code)}
                className={`text-xs font-medium px-2 py-1 transition-colors
                  ${currentLocale === l.code ? 'text-[#c8a96e]' : 'text-gray-400'}`}
              >
                {l.label}
              </button>
            ))}
            <button
              onClick={() => setMenuOpen(!menuOpen)}
              className="w-10 h-10 flex flex-col justify-center items-center gap-1 z-50"
              aria-label="Menu"
            >
              <span className={`block w-5 h-0.5 bg-[#1a3a5c] transition-all duration-300
                ${menuOpen ? 'rotate-45 translate-y-[6px]' : ''}`} />
              <span className={`block w-5 h-0.5 bg-[#1a3a5c] transition-all duration-300
                ${menuOpen ? 'opacity-0' : ''}`} />
              <span className={`block w-5 h-0.5 bg-[#1a3a5c] transition-all duration-300
                ${menuOpen ? '-rotate-45 -translate-y-[6px]' : ''}`} />
            </button>
          </div>
        </div>
      </header>

      {/* Mobile Menu Overlay */}
      <div
        className={`fixed inset-0 bg-black/40 z-40 transition-opacity duration-300 lg:hidden
          ${menuOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'}`}
        onClick={() => setMenuOpen(false)}
      />

      {/* Mobile Off-Canvas Menu */}
      <nav
        className={`fixed top-0 right-0 w-[85vw] max-w-sm h-full bg-[#1a3a5c] z-40
          transition-all duration-400 ease-in-out lg:hidden overflow-y-auto
          ${menuOpen ? 'translate-x-0' : 'translate-x-full'}`}
      >
        <div className="pt-24 pb-8 px-8">
          <ul className="space-y-1">
            {navItems.map(item => (
              <li key={item.href}>
                <Link
                  href={item.href}
                  onClick={() => setMenuOpen(false)}
                  className="flex items-center justify-between py-4 text-white/80 hover:text-[#c8a96e]
                    border-b border-white/10 text-base transition-colors"
                >
                  {item.label}
                  <i className="fa-solid fa-arrow-right text-xs opacity-40 group-hover:opacity-80"></i>
                </Link>
              </li>
            ))}
          </ul>

          <div className="mt-10 pt-8 border-t border-white/10">
            <Link
              href={`/${currentLocale}/contact`}
              onClick={() => setMenuOpen(false)}
              className="block w-full py-3 px-6 bg-[#c8a96e] text-white text-sm font-medium text-center
                hover:bg-[#a8894e] transition-colors"
            >
              {t('contact')}
            </Link>
          </div>

          <div className="mt-8 text-xs text-white/30">
            <div className="flex gap-3 mb-4">
              {locales.map(l => (
                <button
                  key={l.code}
                  onClick={() => switchLang(l.code)}
                  className={`text-xs px-3 py-1 border transition-colors
                    ${currentLocale === l.code
                      ? 'border-[#c8a96e] text-[#c8a96e]'
                      : 'border-white/20 text-white/40 hover:text-white'}`}
                >
                  {l.label}
                </button>
              ))}
            </div>
            <p>© PINSHIGAO Hardware</p>
          </div>
        </div>
      </nav>
    </>
  );
}
