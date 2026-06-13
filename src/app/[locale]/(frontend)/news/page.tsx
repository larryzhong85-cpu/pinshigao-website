'use client';

import { useState, useEffect } from 'react';
import { useTranslations } from 'next-intl';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

// ---------- Types ----------
interface NewsItem {
  id: string;
  slug: string;
  image: string;
  date: string;
  titleZh?: string;
  titleEn?: string;
  titleDe?: string;
  summaryZh?: string;
  summaryEn?: string;
  summaryDe?: string;
}

const ITEMS_PER_PAGE = 6;

// ---------- Helpers ----------
function getLocale(pathname: string): string {
  return pathname.split('/')[1] || 'zh';
}

function fallbackImg(index: number): string {
  const colors = ['#1a3a5c', '#2a5a8c', '#c8a96e', '#a8894e', '#0f2640', '#e0c88a'];
  return `data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='800' height='450' viewBox='0 0 800 450'%3E%3Crect fill='${encodeURIComponent(colors[index % colors.length])}' width='800' height='450'/%3E%3Ctext x='400' y='230' font-family='sans-serif' font-size='28' fill='rgba(255,255,255,0.4)' text-anchor='middle'%3ENEWS%3C/text%3E%3C/svg%3E`;
}

function localizedValue(
  item: NewsItem,
  locale: string,
  field: 'title' | 'summary',
): string {
  const key = `${field}${locale.charAt(0).toUpperCase() + locale.slice(1)}` as keyof NewsItem;
  const value = item[key];
  if (typeof value === 'string' && value) return value;
  // Fallback to English
  const enKey = `${field}En` as keyof NewsItem;
  const enValue = item[enKey];
  if (typeof enValue === 'string' && enValue) return enValue;
  return '';
}

// ---------- Component ----------
export default function NewsPage() {
  const t = useTranslations('common');
  const pathname = usePathname();
  const locale = getLocale(pathname);

  const [newsData, setNewsData] = useState<NewsItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);

  useEffect(() => {
    async function fetchNews() {
      try {
        setLoading(true);
        setError(null);
        const res = await fetch('/api/news');
        if (!res.ok) {
          throw new Error(`Failed to fetch news: ${res.status}`);
        }
        const rawData = await res.json();
        const items = Array.isArray(rawData) ? rawData : (rawData?.items ?? []);
        setNewsData(items);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An unexpected error occurred');
      } finally {
        setLoading(false);
      }
    }
    fetchNews();
  }, []);

  const totalPages = Math.ceil(newsData.length / ITEMS_PER_PAGE);

  const currentItems = newsData.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE,
  );

  // Build page-number array for display
  const pageNumbers = (() => {
    const pages: (number | 'ellipsis')[] = [];
    if (totalPages <= 7) {
      for (let i = 1; i <= totalPages; i++) pages.push(i);
    } else {
      pages.push(1);
      if (currentPage > 3) pages.push('ellipsis');
      const start = Math.max(2, currentPage - 1);
      const end = Math.min(totalPages - 1, currentPage + 1);
      for (let i = start; i <= end; i++) pages.push(i);
      if (currentPage < totalPages - 2) pages.push('ellipsis');
      pages.push(totalPages);
    }
    return pages;
  })();

  function goToPage(page: number) {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  }

  return (
    <>
      {/* ============= HERO BANNER ============= */}
      <section className="relative bg-gradient-to-br from-[#0f2640] via-[#1a3a5c] to-[#2a5a8c] overflow-hidden">
        {/* Decorative circles */}
        <div className="absolute -top-40 -right-40 w-80 h-80 rounded-full bg-[#c8a96e]/5" />
        <div className="absolute -bottom-32 -left-32 w-64 h-64 rounded-full bg-[#c8a96e]/5" />
        <div className="absolute top-1/2 left-1/3 w-96 h-96 rounded-full bg-white/[0.02]" />

        <div className="relative max-w-[1280px] mx-auto px-6 py-24 md:py-32">
          <div className="text-center">
            {/* Breadcrumb */}
            <div className="flex items-center justify-center gap-2 text-sm text-white/40 mb-6">
              <Link href={`/${locale}`} className="hover:text-[#c8a96e] transition-colors">
                {t('home')}
              </Link>
              <span className="text-white/20">/</span>
              <span className="text-white/70">{t('news')}</span>
            </div>

            {/* Title */}
            <h1 className="text-[clamp(2.5rem,6vw,4rem)] font-bold tracking-tight text-white leading-[1.1] mb-5">
              {t('news')}
            </h1>

            {/* Subtitle per locale */}
            <p className="text-white/50 text-lg max-w-2xl mx-auto">
              {locale === 'zh' && '了解品仕高最新动态与行业前沿'}
              {locale === 'en' && 'Stay updated with the latest PINSHIGAO news and industry insights'}
              {locale === 'de' && 'Bleiben Sie informiert mit den neuesten PINSHIGAO News und Brancheneinblicken'}
            </p>

            {/* Decorative line */}
            <div className="mt-8 flex items-center justify-center gap-3">
              <span className="block w-12 h-0.5 bg-[#c8a96e]/40" />
              <span className="block w-2 h-2 rotate-45 border border-[#c8a96e]" />
              <span className="block w-12 h-0.5 bg-[#c8a96e]/40" />
            </div>
          </div>
        </div>
      </section>

      {/* ============= NEWS GRID ============= */}
      <section className="bg-white py-16 md:py-24">
        <div className="max-w-[1280px] mx-auto px-6">
          {loading ? (
            /* Loading spinner */
            <div className="flex flex-col items-center justify-center py-20">
              <div className="w-10 h-10 border-4 border-[#c8a96e]/30 border-t-[#c8a96e] rounded-full animate-spin" />
              <p className="mt-4 text-sm text-[var(--color-text-secondary)]">{t('loading')}</p>
            </div>
          ) : error ? (
            /* Error state */
            <div className="text-center py-20">
              <div className="text-6xl text-red-200 mb-6">
                <i className="fa-regular fa-circle-exclamation" />
              </div>
              <p className="text-lg text-red-500 mb-2">{t('error')}</p>
              <p className="text-sm text-[var(--color-text-secondary)]">{error}</p>
            </div>
          ) : currentItems.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {currentItems.map((item, idx) => (
                <article
                  key={item.id}
                  className="group bg-white border border-[var(--color-border)] rounded-sm overflow-hidden
                    transition-all duration-300 hover:shadow-lg hover:-translate-y-1
                    flex flex-col"
                >
                  {/* Image */}
                  <Link
                    href={`/${locale}/news/${item.slug}`}
                    className="block relative overflow-hidden aspect-[16/9] bg-gray-100"
                  >
                    <img
                      src={item.image}
                      alt={localizedValue(item, locale, 'title')}
                      className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                      onError={(e) => {
                        (e.currentTarget as HTMLImageElement).src = fallbackImg(idx);
                      }}
                    />
                  </Link>

                  {/* Content */}
                  <div className="p-6 flex-1 flex flex-col">
                    {/* Date */}
                    <div className="flex items-center gap-2 text-xs text-[var(--color-text-light)] mb-3">
                      <i className="fa-regular fa-calendar text-[#c8a96e]" />
                      <time dateTime={item.date}>{item.date}</time>
                    </div>

                    {/* Title */}
                    <h2 className="text-lg font-semibold text-[var(--color-text)] mb-3 leading-snug
                      transition-colors duration-300 group-hover:text-[#1a3a5c]">
                      <Link href={`/${locale}/news/${item.slug}`}>
                        {localizedValue(item, locale, 'title')}
                      </Link>
                    </h2>

                    {/* Summary */}
                    <p className="text-sm text-[var(--color-text-secondary)] leading-relaxed mb-5 flex-1">
                      {localizedValue(item, locale, 'summary')}
                    </p>

                    {/* Read More */}
                    <Link
                      href={`/${locale}/news/${item.slug}`}
                      className="inline-flex items-center gap-2 text-sm font-medium text-[#c8a96e]
                        hover:text-[#a8894e] transition-colors group/link mt-auto"
                    >
                      <span>{t('readMore')}</span>
                      <i className="fa-solid fa-arrow-right text-xs transition-transform duration-300 group-hover/link:translate-x-1" />
                    </Link>
                  </div>
                </article>
              ))}
            </div>
          ) : (
            /* Empty state */
            <div className="text-center py-20">
              <div className="text-6xl text-gray-200 mb-6">
                <i className="fa-regular fa-newspaper" />
              </div>
              <p className="text-lg text-[var(--color-text-secondary)]">{t('noResults')}</p>
            </div>
          )}
        </div>
      </section>

      {/* ============= PAGINATION ============= */}
      {!loading && !error && totalPages > 1 && (
        <section className="bg-white pb-16 md:pb-24">
          <div className="max-w-[1280px] mx-auto px-6">
            <nav className="flex items-center justify-center gap-1.5" aria-label="Pagination">
              {/* Previous */}
              <button
                onClick={() => goToPage(currentPage - 1)}
                disabled={currentPage === 1}
                className="flex items-center gap-1.5 px-4 py-2.5 text-sm rounded-sm border
                  border-[var(--color-border)] text-[var(--color-text-secondary)]
                  hover:border-[#c8a96e] hover:text-[#c8a96e] transition-colors
                  disabled:opacity-30 disabled:cursor-not-allowed disabled:hover:border-[var(--color-border)] disabled:hover:text-[var(--color-text-secondary)]"
              >
                <i className="fa-solid fa-chevron-left text-xs" />
                <span className="hidden sm:inline">{t('back')}</span>
              </button>

              {/* Page numbers */}
              <div className="flex items-center gap-1">
                {pageNumbers.map((page, i) =>
                  page === 'ellipsis' ? (
                    <span key={`ellipsis-${i}`} className="px-2 text-[var(--color-text-light)] select-none">
                      &hellip;
                    </span>
                  ) : (
                    <button
                      key={page}
                      onClick={() => goToPage(page)}
                      className={`w-10 h-10 flex items-center justify-center text-sm rounded-sm border transition-all
                        ${
                          currentPage === page
                            ? 'bg-[#1a3a5c] text-white border-[#1a3a5c] font-medium'
                            : 'border-[var(--color-border)] text-[var(--color-text-secondary)] hover:border-[#c8a96e] hover:text-[#c8a96e]'
                        }`}
                    >
                      {page}
                    </button>
                  ),
                )}
              </div>

              {/* Next */}
              <button
                onClick={() => goToPage(currentPage + 1)}
                disabled={currentPage === totalPages}
                className="flex items-center gap-1.5 px-4 py-2.5 text-sm rounded-sm border
                  border-[var(--color-border)] text-[var(--color-text-secondary)]
                  hover:border-[#c8a96e] hover:text-[#c8a96e] transition-colors
                  disabled:opacity-30 disabled:cursor-not-allowed disabled:hover:border-[var(--color-border)] disabled:hover:text-[var(--color-text-secondary)]"
              >
                <span className="hidden sm:inline">{t('readMore')}</span>
                <i className="fa-solid fa-chevron-right text-xs" />
              </button>
            </nav>
          </div>
        </section>
      )}

      {/* ============= DECORATIVE BOTTOM BORDER ============= */}
      <div className="h-1 bg-gradient-to-r from-[#1a3a5c] via-[#c8a96e] to-[#1a3a5c]" />
    </>
  );
}
