'use client';

import { useState, useEffect } from 'react';
import { useTranslations } from 'next-intl';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import HeroSlider from '@/components/HeroSlider';
import { Swiper, SwiperSlide } from 'swiper/react';
import 'swiper/css';

/* ------------------------------------------------------------------ */
/*  Types                                                               */
/* ------------------------------------------------------------------ */
interface HomeCategory {
  id: number;
  nameZh: string;
  nameEn: string;
  nameDe: string;
  slug: string;
  image: string | null;
}

const caseImages = [
  'https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=800&q=80',
  'https://images.unsplash.com/photo-1600585154526-990dced4db0d?w=800&q=80',
  'https://images.unsplash.com/photo-1497366216548-37526070297c?w=800&q=80',
];

const newsImages = [
  'https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=600&q=80',
  'https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?w=600&q=80',
  'https://images.unsplash.com/photo-1563770660941-20978e870e26?w=600&q=80',
];

const quickItems = [
  {
    key: 'catalog' as const,
    icon: 'book',
    color: 'from-[#1a3a5c] to-[#2a5a8c]',
  },
  {
    key: 'resources' as const,
    icon: 'download',
    color: 'from-[#c8a96e] to-[#e0c88a]',
  },
  {
    key: 'tech' as const,
    icon: 'headset',
    color: 'from-[#1a3a5c] to-[#0f2640]',
  },
  {
    key: 'shop' as const,
    icon: 'cart-shopping',
    color: 'from-[#c8a96e] to-[#a8894e]',
  },
];

/* ------------------------------------------------------------------ */
/*  Page                                                                */
/* ------------------------------------------------------------------ */
export default function HomePage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const t = useTranslations();
  const pathname = usePathname();
  const locale = pathname?.split('/')[1] || 'zh';
  const [dynamicCategories, setDynamicCategories] = useState<HomeCategory[]>([]);
  const [newsItems, setNewsItems] = useState<any[]>([]);

  useEffect(() => {
    fetch('/api/categories')
      .then(res => res.json())
      .then(data => {
        if (Array.isArray(data)) setDynamicCategories(data);
      })
      .catch(() => {}); // silently fail, use empty array

    fetch('/api/news?limit=3')
      .then(res => res.json())
      .then(data => {
        const items = Array.isArray(data) ? data : (data?.items ?? []);
        setNewsItems(items);
      })
      .catch(() => {});
  }, []);

  const categories = dynamicCategories.length > 0 ? dynamicCategories : [];

  return (
    <>
      {/* ================================================================ */}
      {/*  1. Hero Slider                                                   */}
      {/* ================================================================ */}
      <HeroSlider />

      {/* ================================================================ */}
      {/*  2. Brand Section                                                 */}
      {/* ================================================================ */}
      <section className="py-24 bg-white">
        <div className="max-w-[1280px] mx-auto px-6">
          <div className="text-center max-w-3xl mx-auto">
            <div className="text-[#c8a96e] text-sm font-medium tracking-[4px] uppercase mb-4 font-[family-name:var(--font-en)]">
              {t('brand.since')}
            </div>
            <h2 className="text-[clamp(1.5rem,3vw,2.5rem)] font-semibold text-[#1a3a5c] mb-4 leading-tight">
              {t('brand.title')}
            </h2>
            <p className="text-[#c8a96e] text-sm italic font-[family-name:var(--font-display)] mb-8">
              {t('brand.subtitle')}
            </p>
            <p className="text-gray-600 text-base leading-relaxed max-w-2xl mx-auto">
              {t('brand.desc')}
            </p>
          </div>
        </div>
      </section>

      {/* ================================================================ */}
      {/*  3. Product Categories Slider (Swiper)                           */}
      {/* ================================================================ */}
      <section className="py-24 bg-[#f5f7fa]">
        <div className="max-w-[1280px] mx-auto px-6">
          {/* Section header */}
          <div className="text-center mb-14">
            <h2 className="text-[clamp(1.5rem,3vw,2.5rem)] font-semibold text-[#1a3a5c] mb-3 leading-tight">
              {t('products.title')}
            </h2>
            <p className="text-gray-400 text-sm tracking-[3px] uppercase font-[family-name:var(--font-en)]">
              {t('products.subtitle')}
            </p>
          </div>

          {/* Swiper carousel */}
          <Swiper
            spaceBetween={24}
            slidesPerView="auto"
            loop
            grabCursor
            breakpoints={{
              640: { slidesPerView: 2, spaceBetween: 20 },
              768: { slidesPerView: 3, spaceBetween: 24 },
              1024: { slidesPerView: 4, spaceBetween: 24 },
            }}
            className="!pb-4"
          >
            {(categories.length > 0 ? categories : []).map((cat) => {
              const name = (cat as any)[`name${locale.charAt(0).toUpperCase() + locale.slice(1)}`] || cat.nameZh;
              const slug = cat.slug;
              const img = cat.image || "https://images.unsplash.com/photo-1558618666-fcd25c85f82e?w=600&q=80";
              return (
              <SwiperSlide key={slug} className="!w-[260px]">
                <Link
                  href={`/${locale}/products/${slug}`}
                  className="group block bg-white overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300"
                >
                  <div className="relative h-[300px] overflow-hidden">
                    <div
                      className="absolute inset-0 bg-cover bg-center group-hover:scale-105 transition-transform duration-500"
                      style={{ backgroundImage: "url(" + img + ")" }}
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-[#1a3a5c]/80 via-transparent to-transparent" />
                    <div className="absolute bottom-0 left-0 right-0 p-6 text-white">
                      <h3 className="text-lg font-semibold">{name}</h3>
                    </div>
                  </div>
                  <div className="p-5">
                    <p className="text-sm text-gray-500 leading-relaxed">{name}</p>
                  </div>
                </Link>
              </SwiperSlide>
              );
            })}
          </Swiper>
        </div>
      </section>

      {/* ================================================================ */}
      {/*  6. Quick Access Icon Cards                                      */}
      {/* ================================================================ */}
      <section className="py-24 bg-white">
        <div className="max-w-[1280px] mx-auto px-6">
          <h2 className="text-center text-[clamp(1.5rem,3vw,2.5rem)] font-semibold text-[#1a3a5c] mb-14 leading-tight">
            {t('quick.title')}
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {quickItems.map((item) => (
              <div
                key={item.key}
                className="group bg-[#f5f7fa] p-8 hover:bg-white hover:shadow-lg hover:-translate-y-1 transition-all duration-300 cursor-pointer"
              >
                <div
                  className={`w-14 h-14 bg-gradient-to-br ${item.color} flex items-center justify-center mb-5
                    group-hover:scale-110 transition-transform duration-300`}
                >
                  <i className={`fa-solid fa-${item.icon} text-white text-xl`} />
                </div>
                <h3 className="text-[#1a3a5c] font-semibold text-base mb-2">
                  {t(`quick.${item.key}.title`)}
                </h3>
                <p className="text-gray-500 text-sm leading-relaxed">
                  {t(`quick.${item.key}.desc`)}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ================================================================ */}
      {/*  7. News Section Grid                                            */}
      {/* ================================================================ */}
      <section className="py-24 bg-[#f5f7fa]">
        <div className="max-w-[1280px] mx-auto px-6">
          <div className="flex justify-between items-end mb-12">
            <h2 className="text-[clamp(1.5rem,3vw,2.5rem)] font-semibold text-[#1a3a5c] leading-tight">
              {t('news.title')}
            </h2>
            <Link
              href={`/${locale}/news`}
              className="text-sm text-[#1a3a5c] hover:text-[#c8a96e] transition-colors font-medium flex items-center gap-2 whitespace-nowrap"
            >
              {t('common.viewAll')}
              <i className="fa-solid fa-arrow-right text-xs" />
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {(newsItems.length > 0 ? newsItems : [1, 2, 3]).map((item: any, idx: number) => {
              const localizedTitle = item?.titleZh || item?.titleEn || '';
              const localizedSummary = item?.summaryZh || item?.summaryEn || '';
              const itemDate = item?.date ? item.date.slice(0, 10) : '';
              const itemSlug = item?.slug || '';
              const itemImage = item?.image || newsImages[idx];
              return itemSlug ? (
                <div
                  key={item.id || idx}
                  className="group bg-white overflow-hidden shadow-sm hover:shadow-lg transition-all duration-300"
                >
                  <div className="relative h-[200px] overflow-hidden bg-gray-100">
                    <img
                      src={itemImage}
                      alt={localizedTitle}
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                      onError={(e) => {
                        (e.currentTarget as HTMLImageElement).style.backgroundImage = `url(${newsImages[idx]})`;
                        (e.currentTarget as HTMLImageElement).style.backgroundSize = 'cover';
                      }}
                    />
                  </div>
                  <div className="p-6">
                    <p className="text-gray-400 text-xs mb-2">{itemDate}</p>
                    <h3 className="text-[#1a3a5c] font-semibold text-base mb-2 line-clamp-2 leading-snug">
                      {localizedTitle}
                    </h3>
                    <p className="text-gray-500 text-sm leading-relaxed mb-4 line-clamp-2">
                      {localizedSummary}
                    </p>
                    <Link
                      href={`/${locale}/news/${itemSlug}`}
                      className="inline-flex items-center gap-2 text-[#c8a96e] text-sm font-medium group-hover:gap-3 transition-all"
                    >
                      {t('common.readMore')}
                      <i className="fa-solid fa-arrow-right text-xs" />
                    </Link>
                  </div>
                </div>
              ) : (
                <div
                  key={idx}
                  className="group bg-white overflow-hidden shadow-sm hover:shadow-lg transition-all duration-300"
                >
                  <div className="relative h-[200px] overflow-hidden bg-gray-100">
                    <div
                      className="absolute inset-0 bg-cover bg-center group-hover:scale-110 transition-transform duration-700"
                      style={{ backgroundImage: `url(${newsImages[idx]})` }}
                    />
                  </div>
                  <div className="p-6">
                    <p className="text-gray-400 text-xs mb-2">{t(`news.item${idx + 1}.date`)}</p>
                    <h3 className="text-[#1a3a5c] font-semibold text-base mb-2 line-clamp-2 leading-snug">
                      {t(`news.item${idx + 1}.title`)}
                    </h3>
                    <p className="text-gray-500 text-sm leading-relaxed mb-4 line-clamp-2">
                      {t(`news.item${idx + 1}.desc`)}
                    </p>
                    <Link
                      href={`/${locale}/news`}
                      className="inline-flex items-center gap-2 text-[#c8a96e] text-sm font-medium group-hover:gap-3 transition-all"
                    >
                      {t('common.readMore')}
                      <i className="fa-solid fa-arrow-right text-xs" />
                    </Link>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ================================================================ */}
      {/*  8. CTA Banner                                                   */}
      {/* ================================================================ */}
      <section className="relative py-24 bg-[#1a3a5c] overflow-hidden">
        {/* Decorative blobs */}
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-10 left-10 w-72 h-72 bg-[#c8a96e] rounded-full opacity-10 blur-3xl" />
          <div className="absolute bottom-10 right-10 w-96 h-96 bg-[#c8a96e] rounded-full opacity-10 blur-3xl" />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-white rounded-full opacity-[0.03] blur-3xl" />
        </div>

        <div className="relative z-10 max-w-[1280px] mx-auto px-6 text-center">
          <h2 className="text-[clamp(1.5rem,3vw,2.5rem)] font-semibold text-white mb-4 leading-tight">
            {t('cta.title')}
          </h2>
          <p className="text-white/70 text-base mb-10 max-w-xl mx-auto">
            {t('cta.desc')}
          </p>
          <div className="flex gap-4 justify-center flex-wrap">
            <Link
              href={`/${locale}/contact`}
              className="inline-flex items-center gap-2 px-8 py-3.5 bg-[#c8a96e] text-white text-sm font-medium
                hover:bg-[#a8894e] transition-all hover:-translate-y-0.5 hover:shadow-lg hover:shadow-[#c8a96e]/30"
            >
              {t('common.contactNow')}
              <i className="fa-solid fa-arrow-right text-xs" />
            </Link>
            <Link
              href={`/${locale}/products`}
              className="inline-flex items-center gap-2 px-8 py-3.5 text-white text-sm font-medium
                border border-white/30 hover:bg-white/10 transition-all"
            >
              {t('common.explore')}
            </Link>
          </div>
        </div>
      </section>
    </>
  );
}
