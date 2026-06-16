'use client';

import { useState, useEffect, useMemo } from 'react';
import { useTranslations } from 'next-intl';
import { usePathname } from 'next/navigation';

export default function SolutionsPage() {
  const pathname = usePathname();
  const locale = useMemo(() => {
    if (pathname.startsWith('/zh')) return 'zh';
    if (pathname.startsWith('/de')) return 'de';
    return 'en';
  }, [pathname]);

  const t = useTranslations('solutionsPage');
  const [html, setHtml] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/pages')
      .then(res => res.json())
      .then((data: any[]) => {
        const list = Array.isArray(data) ? data : [];
        const page = list.find((p: any) => p.slug === 'solutions');
        if (page) {
          const key = `content${locale.charAt(0).toUpperCase() + locale.slice(1)}` as keyof typeof page;
          setHtml((page[key] as string) || page.contentEn || null);
        }
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [locale]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-[#1a3a5c] border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (html) {
    return (
      <div
        className="solutions-page-content"
        dangerouslySetInnerHTML={{ __html: html }}
      />
    );
  }

  // Fallback
  return (
    <div className="min-h-screen bg-white flex items-center justify-center">
      <div className="text-center px-6 max-w-2xl">
        <h1 className="text-3xl font-bold text-[#1a3a5c] mb-4">{t('hero.title')}</h1>
        <p className="text-gray-600">{t('hero.subtitle')}</p>
      </div>
    </div>
  );
}
