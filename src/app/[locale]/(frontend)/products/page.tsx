'use client';

import { useTranslations } from 'next-intl';
import { useParams } from 'next/navigation';
import Link from 'next/link';

interface CategoryConfig {
  slug: string;
  image: string;
}

const categories: CategoryConfig[] = [
  {
    slug: 'hinges',
    image: 'https://images.unsplash.com/photo-1585829365295-ab7cd400c167?w=600&q=80',
  },
  {
    slug: 'drawers',
    image: 'https://images.unsplash.com/photo-1600481176191-2a2d60e8a767?w=600&q=80',
  },
  {
    slug: 'lifts',
    image: 'https://images.unsplash.com/photo-1600566753086-00f18b4f6b7f?w=600&q=80',
  },
  {
    slug: 'slides',
    image: 'https://images.unsplash.com/photo-1599658880434-8c0f021c0b3a?w=600&q=80',
  },
  {
    slug: 'handles',
    image: 'https://images.unsplash.com/photo-1600607687644-c3f4e4f8d59b?w=600&q=80',
  },
];

const featuredProducts = [
  { key: 'hinge', slug: 'psg-pro-damped-hinge' },
  { key: 'drawer', slug: 'psg-sleek-silent-drawer' },
];

export default function ProductsPage() {
  const params = useParams<{ locale: string }>();
  const locale = params.locale;
  const t = useTranslations('products');

  return (
    <div className="min-h-screen bg-white">
      {/* ========== Hero / Banner ========== */}
      <section className="relative bg-[#1a3a5c] py-20 md:py-28">
        <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=1920&q=80')] bg-cover bg-center opacity-10" />
        <div className="relative max-w-[1280px] mx-auto px-6 text-center">
          <span className="inline-block text-[#c8a96e] text-sm font-medium tracking-[0.2em] uppercase mb-4">
            {t('subtitle')}
          </span>
          <h1 className="text-white text-4xl md:text-5xl lg:text-6xl font-bold leading-tight">
            {t('title')}
          </h1>
          <div className="w-16 h-0.5 bg-[#c8a96e] mx-auto mt-6" />
        </div>
      </section>

      {/* ========== Category Grid ========== */}
      <section className="max-w-[1280px] mx-auto px-6 py-16 md:py-24">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-x-8 gap-y-12">
          {categories.map((cat) => (
            <Link
              key={cat.slug}
              href={`/${locale}/products/${cat.slug}`}
              className="group block"
            >
              {/* Image */}
              <div className="relative aspect-[4/3] overflow-hidden bg-gray-100">
                <img
                  src={cat.image}
                  alt={t(`categories.${cat.slug}.name`)}
                  className="w-full h-full object-cover transition-all duration-500 group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-[#1a3a5c]/0 group-hover:bg-[#1a3a5c]/10 transition-colors duration-300" />
              </div>

              {/* Info */}
              <div className="mt-5">
                <span className="inline-block text-xs font-medium text-[#c8a96e] tracking-[0.15em] uppercase">
                  {t(`categories.${cat.slug}.series`)}
                </span>
                <h3 className="text-lg md:text-xl font-bold text-[#1a3a5c] mt-1 group-hover:text-[#c8a96e] transition-colors">
                  {t(`categories.${cat.slug}.name`)}
                </h3>
                <p className="text-gray-500 text-sm mt-2 leading-relaxed line-clamp-2">
                  {t(`categories.${cat.slug}.desc`)}
                </p>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* ========== Featured Products ========== */}
      <section className="bg-gray-50 py-16 md:py-24">
        <div className="max-w-[1280px] mx-auto px-6">
          <div className="text-center mb-12">
            <span className="inline-block text-[#c8a96e] text-sm font-medium tracking-[0.2em] uppercase mb-3">
              {t('featured.subtitle')}
            </span>
            <h2 className="text-3xl md:text-4xl font-bold text-[#1a3a5c]">
              {t('featured.title')}
            </h2>
            <div className="w-12 h-0.5 bg-[#c8a96e] mx-auto mt-4" />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {featuredProducts.map((fp) => (
              <Link
                key={fp.key}
                href={`/${locale}/products/${fp.slug}`}
                className="group flex flex-col sm:flex-row bg-white shadow-sm hover:shadow-md transition-shadow duration-300"
              >
                <div className="sm:w-[200px] shrink-0">
                  <img
                    src={
                      fp.key === 'hinge'
                        ? 'https://images.unsplash.com/photo-1585829365295-ab7cd400c167?w=400&q=80'
                        : 'https://images.unsplash.com/photo-1600481176191-2a2d60e8a767?w=400&q=80'
                    }
                    alt={t(`featured.${fp.key}.name`)}
                    className="w-full h-48 sm:h-full object-cover"
                  />
                </div>
                <div className="flex-1 p-6 flex flex-col justify-center">
                  <h3 className="text-lg font-bold text-[#1a3a5c] group-hover:text-[#c8a96e] transition-colors">
                    {t(`featured.${fp.key}.name`)}
                  </h3>
                  <p className="text-gray-500 text-sm mt-2 leading-relaxed line-clamp-3">
                    {t(`featured.${fp.key}.desc`)}
                  </p>
                  <div className="flex flex-wrap gap-4 mt-4 text-xs text-gray-400">
                    {fp.key === 'hinge' && (
                      <>
                        <span>{t('featured.hinge.load')}</span>
                        <span>{t('featured.hinge.cycles')}</span>
                        <span>{t('featured.hinge.adjust')}</span>
                      </>
                    )}
                    {fp.key === 'drawer' && (
                      <>
                        <span>{t('featured.drawer.load')}</span>
                        <span>{t('featured.drawer.cycles')}</span>
                        <span>{t('featured.drawer.profile')}</span>
                      </>
                    )}
                  </div>
                </div>
              </Link>
            ))}
          </div>

          <div className="text-center mt-10">
            <Link
              href={`/${locale}/products`}
              className="inline-flex items-center gap-2 px-8 py-3 bg-[#1a3a5c] text-white text-sm font-medium
                hover:bg-[#2a4a6c] transition-colors"
            >
              {t('viewAll')}
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
