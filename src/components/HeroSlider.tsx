'use client';

import { useEffect, useRef } from 'react';
import { useTranslations } from 'next-intl';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

const slides = [
  {
    image: 'https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=1600&q=80',
    pretitle: 'PINSHIGAO · Precision Motion',
    titleKey: 'hero.slide1Title',
    descKey: 'hero.slide1Desc',
  },
  {
    image: 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=1600&q=80',
    pretitle: 'Hinges · Drawer Systems · Lift Systems',
    titleKey: 'hero.slide2Title',
    descKey: 'hero.slide2Desc',
  },
  {
    image: 'https://images.unsplash.com/photo-1616486338812-3dadae4b4ace?w=1600&q=80',
    pretitle: 'Innovation · Quality · Reliability',
    titleKey: 'hero.slide3Title',
    descKey: 'hero.slide3Desc',
  },
];

export default function HeroSlider() {
  const t = useTranslations();
  const pathname = usePathname();
  const locale = pathname?.split('/')[1] || 'zh';
  const swiperRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    let swiperInstance: any = null;

    async function initSwiper() {
      const Swiper = (await import('swiper')).default;
      const { Autoplay, Pagination, Navigation } = await import('swiper/modules');
      await import('swiper/css');
      await import('swiper/css/navigation');
      await import('swiper/css/pagination');

      if (swiperRef.current) {
        swiperInstance = new Swiper(swiperRef.current, {
          modules: [Autoplay, Pagination, Navigation],
          loop: true,
          speed: 1000,
          autoplay: { delay: 5000, disableOnInteraction: false },
          pagination: {
            el: '.hero-pagination',
            clickable: true,
            bulletClass: 'swiper-pagination-bullet',
            bulletActiveClass: 'swiper-pagination-bullet-active',
          },
          navigation: {
            nextEl: '.hero-next',
            prevEl: '.hero-prev',
          },
        });
      }
    }

    initSwiper();

    return () => {
      swiperInstance?.destroy();
    };
  }, []);

  return (
    <section className="relative w-full h-[90vh] min-h-[600px] max-h-[900px] overflow-hidden">
      <div className="swiper w-full h-full" ref={swiperRef}>
        <div className="swiper-wrapper">
          {slides.map((slide, i) => (
            <div key={i} className="swiper-slide relative overflow-hidden">
              <div
                className="absolute inset-0 bg-cover bg-center"
                style={{ backgroundImage: `url(${slide.image})` }}
              />
              <div className="absolute inset-0 bg-gradient-to-br from-[#1a3a5c]/75 via-[#1a3a5c]/30 to-black/20" />
              <div className="relative z-10 h-full flex items-center px-[10%]">
                <div className="max-w-[620px] text-white">
                  <div className="text-xs uppercase tracking-[4px] mb-4 text-[#c8a96e] font-medium"
                    style={{ fontFamily: 'Inter, sans-serif' }}>
                    {slide.pretitle}
                  </div>
                  <h1 className="text-[clamp(1.8rem,4.5vw,3.5rem)] font-semibold leading-[1.15] mb-5 tracking-[-0.02em]">
                    {t(slide.titleKey)}
                  </h1>
                  <p className="text-base md:text-lg leading-relaxed text-white/80 mb-8 max-w-[480px]">
                    {t(slide.descKey)}
                  </p>
                  <div className="flex gap-4 flex-wrap">
                    <Link
                      href={`/${locale}/products`}
                      className="inline-flex items-center gap-2 px-8 py-3.5 bg-[#c8a96e] text-white text-sm font-medium
                        hover:bg-[#a8894e] transition-all hover:-translate-y-0.5 hover:shadow-lg hover:shadow-[#c8a96e]/30"
                    >
                      {t('common.explore')} <i className="fa-solid fa-arrow-right text-xs"></i>
                    </Link>
                    <Link
                      href={`/${locale}/about`}
                      className="inline-flex items-center gap-2 px-8 py-3.5 text-white text-sm font-medium
                        border border-white/50 hover:bg-white/10 transition-all"
                    >
                      {t('common.learnMore')}
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
        <div className="hero-pagination absolute bottom-8 left-1/2 -translate-x-1/2 z-20 flex gap-2" />
        <div className="hero-next absolute right-6 top-1/2 -translate-y-1/2 z-20 w-12 h-12 flex items-center justify-center
          text-white/60 hover:text-white cursor-pointer transition-colors hidden md:flex">
          <i className="fa-solid fa-chevron-right text-xl"></i>
        </div>
        <div className="hero-prev absolute left-6 top-1/2 -translate-y-1/2 z-20 w-12 h-12 flex items-center justify-center
          text-white/60 hover:text-white cursor-pointer transition-colors hidden md:flex">
          <i className="fa-solid fa-chevron-left text-xl"></i>
        </div>
      </div>
    </section>
  );
}
