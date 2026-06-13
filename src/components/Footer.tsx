'use client';

import { useState, useEffect } from 'react';
import { useTranslations } from 'next-intl';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

export default function Footer() {
  const t = useTranslations('footer');
  const c = useTranslations('common');
  const pathname = usePathname();
  const currentLocale = pathname?.split('/')[1] || 'zh';
  const [settings, setSettings] = useState<Record<string, string>>({});

  // Don't render on admin pages
  if (pathname?.includes('/admin/')) return null;

  // Fetch settings from API
  useEffect(() => {
    fetch('/api/settings')
      .then(res => res.json())
      .then(data => {
        if (Array.isArray(data)) {
          const map: Record<string, string> = {};
          data.forEach((item: { key: string; value: string }) => {
            map[item.key] = item.value ?? '';
          });
          setSettings(map);
        }
      })
      .catch(() => {});
  }, []);

  const productLinks = [
    { href: `/${currentLocale}/products/hinges`, zh: '铰链系统', en: 'Hinge Systems', de: 'Scharniersysteme' },
    { href: `/${currentLocale}/products/drawers`, zh: '抽屉系统', en: 'Drawer Systems', de: 'Schubladensysteme' },
    { href: `/${currentLocale}/products/lifts`, zh: '上翻门系统', en: 'Lift Systems', de: 'Klappenbeschläge' },
    { href: `/${currentLocale}/products/slides`, zh: '滑轨系统', en: 'Sliding Systems', de: 'Auszugssysteme' },
    { href: `/${currentLocale}/products/handles`, zh: '拉手系列', en: 'Handle Collection', de: 'Griffkollektion' },
  ];

  const supportLinks = [
    { href: '#', zh: '下载中心', en: 'Download Center', de: 'Download-Center' },
    { href: '#', zh: '安装指南', en: 'Installation Guides', de: 'Montageanleitungen' },
    { href: '#', zh: '技术参数', en: 'Technical Data', de: 'Technische Daten' },
    { href: '#', zh: 'FAQ', en: 'FAQ', de: 'FAQ' },
    { href: '#', zh: '售后保修', en: 'Warranty', de: 'Garantie' },
  ];

  const aboutLinks = [
    { href: `/${currentLocale}/about`, zh: '公司简介', en: 'Company Profile', de: 'Unternehmensprofil' },
    { href: `/${currentLocale}/about`, zh: '发展历程', en: 'History', de: 'Geschichte' },
    { href: '#', zh: '生产基地', en: 'Manufacturing', de: 'Produktion' },
    { href: '#', zh: '资质认证', en: 'Certifications', de: 'Zertifizierungen' },
    { href: '#', zh: '加入我们', en: 'Careers', de: 'Karriere' },
  ];

  function localize(items: typeof productLinks): string {
    const item = items[0];
    return (item as any)[currentLocale] || item.zh;
  }

  return (
    <footer className="bg-[#111820] text-white/70 text-sm">
      <div className="max-w-[1280px] mx-auto px-6 py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-10">
          {/* Brand */}
          <div className="lg:col-span-1">
            <div className="mb-4">
              <img src="/logo.jpeg" alt="品仕高 PINSHIGAO" className="h-24 w-auto" />
            </div>
            <p className="text-white/50 leading-relaxed mb-5">
              {t('about')}
            </p>
            <div className="flex gap-3">
              {['weixin', 'linkedin-in', 'youtube', 'facebook-f'].map((icon) => (
                <a key={icon} href="#" className="w-9 h-9 border border-white/15 flex items-center justify-center
                  text-white/40 hover:bg-[#c8a96e] hover:border-[#c8a96e] hover:text-white transition-all"
                  aria-label={icon}>
                  <i className={`fa-brands fa-${icon}`}></i>
                </a>
              ))}
            </div>
          </div>

          {/* Products */}
          <div>
            <h4 className="text-white text-xs font-semibold mb-5 uppercase tracking-widest">{t('products')}</h4>
            <ul className="space-y-3">
              {productLinks.map((link, i) => (
                <li key={i}>
                  <Link href={link.href} className="text-white/40 hover:text-[#c8a96e] transition-colors">
                    {(link as any)[currentLocale]}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Support */}
          <div>
            <h4 className="text-white text-xs font-semibold mb-5 uppercase tracking-widest">{t('support')}</h4>
            <ul className="space-y-3">
              {supportLinks.map((link, i) => (
                <li key={i}>
                  <a href={link.href} className="text-white/40 hover:text-[#c8a96e] transition-colors">
                    {(link as any)[currentLocale]}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* About */}
          <div>
            <h4 className="text-white text-xs font-semibold mb-5 uppercase tracking-widest">{t('aboutUs')}</h4>
            <ul className="space-y-3">
              {aboutLinks.map((link, i) => (
                <li key={i}>
                  <Link href={link.href} className="text-white/40 hover:text-[#c8a96e] transition-colors">
                    {(link as any)[currentLocale]}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h4 className="text-white text-xs font-semibold mb-5 uppercase tracking-widest">{t('contactUs')}</h4>
            <ul className="space-y-4">
              <li className="flex gap-3 text-white/40">
                <i className="fa-solid fa-location-dot text-[#c8a96e] mt-0.5"></i>
                <span>{settings.contactAddress || c('addressFull')}</span>
              </li>
              <li className="flex gap-3 text-white/40">
                <i className="fa-solid fa-phone text-[#c8a96e]"></i>
                <span>{settings.contactPhone || c('phone')}</span>
              </li>
              <li className="flex gap-3 text-white/40">
                <i className="fa-solid fa-envelope text-[#c8a96e]"></i>
                <span>{settings.contactEmail || c('email')}</span>
              </li>
              <li className="flex gap-3 text-white/40">
                <i className="fa-solid fa-clock text-[#c8a96e]"></i>
                <span>{t('hours')}</span>
              </li>
            </ul>
          </div>
        </div>
      </div>

      <div className="border-t border-white/[0.06] py-5">
        <div className="max-w-[1280px] mx-auto px-6 flex flex-col md:flex-row justify-between items-center gap-3 text-xs text-white/30">
          <span>{settings.copyright || c('copyright')}</span>
          <div className="flex items-center gap-4">
            <a href="#" className="hover:text-[#c8a96e] transition-colors">{c('privacy')}</a>
            <span className="opacity-30">|</span>
            <a href="#" className="hover:text-[#c8a96e] transition-colors">{c('terms')}</a>
          </div>
        </div>
      </div>
    </footer>
  );
}
