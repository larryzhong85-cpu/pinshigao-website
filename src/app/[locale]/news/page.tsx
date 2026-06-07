'use client';

import { useState, useMemo } from 'react';
import { useTranslations } from 'next-intl';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

// ---------- Types ----------
interface NewsItem {
  id: string;
  slug: string;
  image: string;
  date: string;
  title: Record<string, string>;
  summary: Record<string, string>;
}

// ---------- Static demo data ----------
const newsData: NewsItem[] = [
  {
    id: '1',
    slug: 'china-furniture-fair-2024',
    image: '/images/news/fair-2024.jpg',
    date: '2024.12.15',
    title: {
      zh: '品仕高亮相2024中国国际家具展',
      en: 'PINSHIGAO at China International Furniture Fair 2024',
      de: 'PINSHIGAO auf der China International Furniture Fair 2024',
    },
    summary: {
      zh: '全新PSG-Pro系列产品首次公开亮相，获行业专家高度评价。',
      en: 'The new PSG-Pro series debuted publicly, receiving high praise from industry experts.',
      de: 'Die neue PSG-Pro Serie feierte ihr öffentliches Debüt und erhielt hohe Anerkennung von Branchenexperten.',
    },
  },
  {
    id: '2',
    slug: 'servo-drive-lift-system-launch',
    image: '/images/news/lift-system.jpg',
    date: '2024.11.08',
    title: {
      zh: '全新伺服驱动上翻门系统发布',
      en: 'New Servo-Drive Lift System Launched',
      de: 'Neues Servoantrieb-Klappensystem eingeführt',
    },
    summary: {
      zh: '触控开启，智能停止，为智能家居提供完美五金解决方案。',
      en: 'Touch-open, intelligent stop — the perfect hardware solution for smart homes.',
      de: 'Berührungsöffnung, intelligenter Stopp — die perfekte Beschlaglösung für Smart Homes.',
    },
  },
  {
    id: '3',
    slug: 'foshan-smart-factory-phase2',
    image: '/images/news/factory.jpg',
    date: '2024.10.20',
    title: {
      zh: '佛山智能制造基地二期投产',
      en: 'Phase II of Foshan Smart Factory Begins Production',
      de: 'Phase II der Smart Factory in Foshan startet Produktion',
    },
    summary: {
      zh: '年产能提升至5000万件，引入全自动装配线，品质再升级。',
      en: 'Annual capacity increased to 50 million units with new fully automated assembly lines.',
      de: 'Jahreskapazität auf 50 Millionen Einheiten erhöht, vollautomatisierte Montagelinien.',
    },
  },
  {
    id: '4',
    slug: 'germany-design-award-2024',
    image: '/images/news/award.jpg',
    date: '2024.09.05',
    title: {
      zh: '品仕高荣获德国设计奖',
      en: 'PINSHIGAO Wins German Design Award',
      de: 'PINSHIGAO gewinnt German Design Award',
    },
    summary: {
      zh: 'PSG-Sleek抽屉系统凭借创新设计与卓越品质，荣获2024德国设计奖特别表彰。',
      en: 'The PSG-Sleek drawer system won special recognition at the 2024 German Design Award for its innovative design and卓越 quality.',
      de: 'Das PSG-Sleek Schubladensystem erhielt eine besondere Anerkennung beim German Design Award 2024 für sein innovatives Design und seine herausragende Qualität.',
    },
  },
  {
    id: '5',
    slug: 'new-showroom-shanghai',
    image: '/images/news/showroom.jpg',
    date: '2024.07.18',
    title: {
      zh: '品仕高上海旗舰展厅开幕',
      en: 'PINSHIGAO Shanghai Flagship Showroom Opens',
      de: 'PINSHIGAO eröffnet Flagship-Showroom in Shanghai',
    },
    summary: {
      zh: '全新沉浸式体验展厅正式对外开放，全方位展示全系列家具五金产品与应用方案。',
      en: 'A new immersive experience showroom is now open, showcasing the full range of furniture hardware products and application solutions.',
      de: 'Ein neuer immersiver Erlebnis-Showroom ist jetzt geöffnet und präsentiert das gesamte Sortiment an Möbelbeschlägen und Anwendungslösungen.',
    },
  },
  {
    id: '6',
    slug: 'smart-home-hardware-partnership',
    image: '/images/news/partnership.jpg',
    date: '2024.05.22',
    title: {
      zh: '品仕高与华为智慧家居达成战略合作',
      en: 'PINSHIGAO Partners with Huawei Smart Home',
      de: 'PINSHIGAO schließt strategische Partnerschaft mit Huawei Smart Home',
    },
    summary: {
      zh: '双方将共同开发智能五金解决方案，推动家居智能化升级。',
      en: 'Both parties will jointly develop smart hardware solutions to drive home intelligence upgrades.',
      de: 'Beide Parteien werden gemeinsam intelligente Beschlaglösungen entwickeln, um die Hausautomation voranzutreiben.',
    },
  },
];

const ITEMS_PER_PAGE = 6;

// ---------- Helpers ----------
function getLocale(pathname: string): string {
  return pathname.split('/')[1] || 'zh';
}

function fallbackImg(index: number): string {
  const colors = ['#1a3a5c', '#2a5a8c', '#c8a96e', '#a8894e', '#0f2640', '#e0c88a'];
  return `data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='800' height='450' viewBox='0 0 800 450'%3E%3Crect fill='${encodeURIComponent(colors[index % colors.length])}' width='800' height='450'/%3E%3Ctext x='400' y='230' font-family='sans-serif' font-size='28' fill='rgba(255,255,255,0.4)' text-anchor='middle'%3ENEWS%3C/text%3E%3C/svg%3E`;
}

// ---------- Component ----------
export default function NewsPage() {
  const t = useTranslations('common');
  const pathname = usePathname();
  const locale = getLocale(pathname);

  const [currentPage, setCurrentPage] = useState(1);
  const totalPages = Math.ceil(newsData.length / ITEMS_PER_PAGE);

  const currentItems = useMemo(
    () => newsData.slice((currentPage - 1) * ITEMS_PER_PAGE, currentPage * ITEMS_PER_PAGE),
    [currentPage],
  );

  // Build page-number array for display
  const pageNumbers = useMemo(() => {
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
  }, [currentPage, totalPages]);

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
          {currentItems.length > 0 ? (
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
                      alt={item.title[locale] || item.title.en}
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
                        {item.title[locale] || item.title.en}
                      </Link>
                    </h2>

                    {/* Summary */}
                    <p className="text-sm text-[var(--color-text-secondary)] leading-relaxed mb-5 flex-1">
                      {item.summary[locale] || item.summary.en}
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
      {totalPages > 1 && (
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
