'use client';

import { useTranslations } from 'next-intl';
import { usePathname } from 'next/navigation';
import { useMemo } from 'react';

const milestones = [
  { year: '2004', zh: '公司成立于广东佛山', en: 'Company founded in Foshan, Guangdong', de: 'Gründung in Foshan, Guangdong' },
  { year: '2008', zh: '通过ISO9001质量管理体系认证', en: 'ISO9001 Quality Management Certification', de: 'ISO9001 Qualitätsmanagement-Zertifizierung' },
  { year: '2012', zh: '建立首个自动化生产线', en: 'First automated production line established', de: 'Erste automatisierte Produktionslinie' },
  { year: '2016', zh: '产品出口至全球30个国家', en: 'Products exported to 30 countries', de: 'Export in 30 Länder' },
  { year: '2020', zh: '佛山智能制造基地一期投产', en: 'Phase I of Foshan Smart Factory launched', de: 'Phase I der Foshan Smart Factory' },
  { year: '2024', zh: '全球客户超2000家，年产能突破5000万件', en: '2,000+ global clients, 50M annual capacity', de: '2.000+ Kunden weltweit, 50M Kapazität' },
];

const stats = [
  { value: '2,000+', zh: '全球客户', en: 'Global Clients', de: 'Kunden weltweit' },
  { value: '50+', zh: '出口国家', en: 'Export Countries', de: 'Exportländer' },
  { value: '50M', zh: '年产能(件)', en: 'Annual Capacity', de: 'Jahreskapazität' },
  { value: '20', zh: '行业经验', en: 'Years of Expertise', de: 'Jahre Erfahrung' },
];

const values = [
  {
    icon: (
      <svg className="w-10 h-10" viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M20 4L24 14H34L26 20L30 30L20 24L10 30L14 20L6 14H16L20 4Z" fill="currentColor" />
      </svg>
    ),
    zh: { title: '品质', desc: '德国精工标准，全流程品质管控，每一件产品都经过严格测试' },
    en: { title: 'Quality', desc: 'German precision standards, full-process quality control, every product rigorously tested' },
    de: { title: 'Qualität', desc: 'Deutsche Präzisionsstandards, durchgängige Qualitätskontrolle, jedes Produkt streng geprüft' },
  },
  {
    icon: (
      <svg className="w-10 h-10" viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M20 6L23 14H32L25 19L28 28L20 22L12 28L15 19L8 14H17L20 6Z" fill="currentColor" />
        <circle cx="20" cy="17" r="10" stroke="currentColor" strokeWidth="1.5" fill="none" />
      </svg>
    ),
    zh: { title: '创新', desc: '持续研发投入，30余项专利技术，引领家具五金行业技术变革' },
    en: { title: 'Innovation', desc: 'Continuous R&D investment, 30+ patented technologies, leading industry transformation' },
    de: { title: 'Innovation', desc: 'Kontinuierliche F&E-Investitionen, 30+ patentierte Technologien, führend in der Branche' },
  },
  {
    icon: (
      <svg className="w-10 h-10" viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M8 12H32V32H8V12Z" stroke="currentColor" strokeWidth="1.5" fill="none" />
        <path d="M14 12V8H26V12" stroke="currentColor" strokeWidth="1.5" fill="none" />
        <path d="M12 20H28" stroke="currentColor" strokeWidth="1.5" />
        <path d="M12 26H24" stroke="currentColor" strokeWidth="1.5" />
      </svg>
    ),
    zh: { title: '服务', desc: '专业销售与技术团队，提供一站式选型、安装、售后保障服务' },
    en: { title: 'Service', desc: 'Professional sales and technical team, one-stop selection, installation, and after-sales support' },
    de: { title: 'Service', desc: 'Professionelles Vertriebs- und Technikteam, umfassende Beratung, Installation und Kundendienst' },
  },
];

export default function AboutPage() {
  const pathname = usePathname();
  const locale = useMemo(() => {
    if (pathname.startsWith('/zh')) return 'zh';
    if (pathname.startsWith('/de')) return 'de';
    return 'en';
  }, [pathname]);

  const t = useTranslations('about');

  const heroTitle: Record<string, string> = {
    zh: '关于品仕高',
    en: 'About PINSHIGAO',
    de: 'über PINSHIGAO',
  };

  return (
    <div className="min-h-screen bg-white">
      {/* ============ HERO BANNER ============ */}
      <section className="relative bg-[#1a3a5c] overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-0 right-0 w-96 h-96 bg-[#c8a96e] rounded-full blur-3xl translate-x-1/2 -translate-y-1/4" />
          <div className="absolute bottom-0 left-0 w-80 h-80 bg-[#c8a96e] rounded-full blur-3xl -translate-x-1/2 translate-y-1/4" />
        </div>
        <div className="relative max-w-[1280px] mx-auto px-6 py-24 md:py-32">
          <div className="max-w-2xl">
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-white leading-tight mb-6">
              {heroTitle[locale]}
              <span className="block mt-2 text-xl md:text-2xl lg:text-3xl font-normal text-[#c8a96e]">
                {t('subtitle')}
              </span>
            </h1>
            <div className="w-16 h-1 bg-[#c8a96e] mb-6" />
            <p className="text-white/70 text-base md:text-lg leading-relaxed max-w-xl">
              {t('intro')}
            </p>
          </div>
        </div>
        {/* Bottom edge fade */}
        <div className="absolute bottom-0 left-0 right-0 h-16 bg-gradient-to-t from-white to-transparent" />
      </section>

      {/* ============ COMPANY INTRO ============ */}
      <section className="py-20 md:py-28">
        <div className="max-w-[1280px] mx-auto px-6">
          <div className="grid md:grid-cols-2 gap-12 md:gap-16 items-center">
            {/* Left: Text */}
            <div>
              <span className="text-[#c8a96e] text-sm font-semibold tracking-[0.2em] uppercase">
                {locale === 'zh' ? '公司简介' : locale === 'de' ? 'Unternehmensprofil' : 'Company Profile'}
              </span>
              <h2 className="text-3xl md:text-4xl font-bold text-[#1a3a5c] mt-3 mb-6 leading-tight">
                {t('title')}
              </h2>
              <p className="text-gray-600 leading-relaxed mb-6">
                {t('intro')}
              </p>
              <p className="text-gray-600 leading-relaxed">
                {t('mission')}
              </p>
              <div className="mt-8 flex items-center gap-4">
                <div className="w-12 h-12 bg-[#1a3a5c] flex items-center justify-center text-[#c8a96e] font-bold text-lg">
                  {milestones.length}
                </div>
                <div>
                  <div className="font-semibold text-[#1a3a5c]">
                    {locale === 'zh' ? '六大发展里程碑' : locale === 'de' ? '6 Meilensteine' : '6 Key Milestones'}
                  </div>
                  <div className="text-sm text-gray-500">
                    {locale === 'zh' ? '见证二十年卓越历程' : locale === 'de' ? '20 Jahre Exzellenz' : 'Witness 20 years of excellence'}
                  </div>
                </div>
              </div>
            </div>

            {/* Right: Image placeholder */}
            <div className="relative">
              <div className="relative aspect-[4/3] bg-gray-100 overflow-hidden">
                <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-[#1a3a5c]/5 to-[#c8a96e]/10">
                  <div className="text-center">
                    <div className="w-20 h-20 mx-auto mb-4 bg-[#1a3a5c]/10 flex items-center justify-center">
                      <svg className="w-10 h-10 text-[#1a3a5c]/30" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                      </svg>
                    </div>
                    <p className="text-sm text-gray-400">
                      {locale === 'zh' ? '工厂实景' : locale === 'de' ? 'Fabrikaufnahme' : 'Factory Image'}
                    </p>
                  </div>
                </div>
              </div>
              {/* Decorative accent */}
              <div className="absolute -bottom-4 -right-4 w-24 h-24 border-2 border-[#c8a96e]/30 -z-10" />
              <div className="absolute -top-4 -left-4 w-24 h-24 border-2 border-[#1a3a5c]/10 -z-10" />
            </div>
          </div>
        </div>
      </section>

      {/* ============ VALUES ============ */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-[1280px] mx-auto px-6">
          <div className="text-center mb-16">
            <span className="text-[#c8a96e] text-sm font-semibold tracking-[0.2em] uppercase">
              {locale === 'zh' ? '核心价值观' : locale === 'de' ? 'Kernwerte' : 'Core Values'}
            </span>
            <h2 className="text-3xl md:text-4xl font-bold text-[#1a3a5c] mt-3 mb-4">
              {t('values')}
            </h2>
            <div className="w-12 h-0.5 bg-[#c8a96e] mx-auto" />
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {values.map((v, i) => {
              const content = v[locale as keyof typeof v] as { title: string; desc: string };
              return (
                <div
                  key={i}
                  className="group bg-white p-8 md:p-10 text-center hover:shadow-lg transition-shadow duration-300 border border-gray-100 hover:border-[#c8a96e]/30"
                >
                  <div className="inline-flex items-center justify-center w-16 h-16 mb-6 text-[#1a3a5c] group-hover:text-[#c8a96e] transition-colors duration-300">
                    {v.icon}
                  </div>
                  <h3 className="text-xl font-bold text-[#1a3a5c] mb-4 group-hover:text-[#c8a96e] transition-colors duration-300">
                    {content.title}
                  </h3>
                  <p className="text-gray-500 leading-relaxed text-sm">
                    {content.desc}
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ============ TIMELINE / HISTORY ============ */}
      <section className="py-20 md:py-28">
        <div className="max-w-[1280px] mx-auto px-6">
          <div className="text-center mb-16">
            <span className="text-[#c8a96e] text-sm font-semibold tracking-[0.2em] uppercase">
              {locale === 'zh' ? '发展历程' : locale === 'de' ? 'Zeitleiste' : 'Our History'}
            </span>
            <h2 className="text-3xl md:text-4xl font-bold text-[#1a3a5c] mt-3 mb-4">
              {t('history')}
            </h2>
            <div className="w-12 h-0.5 bg-[#c8a96e] mx-auto" />
          </div>

          <div className="relative">
            {/* Timeline center line */}
            <div className="absolute left-8 md:left-1/2 top-0 bottom-0 w-px bg-gray-200 md:-translate-x-px" />

            <div className="space-y-12">
              {milestones.map((m, i) => {
                const eventText = (m as Record<string, string>)[locale] || m.en;
                const isLeft = i % 2 === 0;

                return (
                  <div key={i} className={`relative flex flex-col md:flex-row items-start gap-6 md:gap-0 ${isLeft ? 'md:flex-row' : 'md:flex-row-reverse'}`}>
                    {/* Year badge - always visible */}
                    <div className={`relative z-10 flex items-center gap-4 md:w-1/2 ${isLeft ? 'md:pr-12 md:justify-end' : 'md:pl-12 md:justify-start'}`}>
                      <div className={`md:hidden ${isLeft ? 'order-2' : ''}`}>
                        <div className="text-2xl font-bold text-[#1a3a5c]">{m.year}</div>
                        <p className="text-gray-600 text-sm mt-1">{eventText}</p>
                      </div>
                      {/* Desktop layout */}
                      <div className="hidden md:block text-right">
                        {isLeft && (
                          <>
                            <div className="text-2xl font-bold text-[#1a3a5c]">{m.year}</div>
                            <p className="text-gray-600 text-sm mt-1">{eventText}</p>
                          </>
                        )}
                      </div>
                      <div className="hidden md:block text-left">
                        {!isLeft && (
                          <>
                            <p className="text-gray-600 text-sm mt-1">{eventText}</p>
                            <div className="text-2xl font-bold text-[#1a3a5c]">{m.year}</div>
                          </>
                        )}
                      </div>
                    </div>

                    {/* Timeline dot */}
                    <div className="absolute left-8 md:left-1/2 w-4 h-4 bg-[#c8a96e] rounded-full border-4 border-white shadow -translate-x-1/2 z-20 mt-2" />

                    {/* Spacer for the other side on desktop */}
                    <div className="hidden md:block md:w-1/2" />
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </section>

      {/* ============ STATS ============ */}
      <section className="relative py-20 bg-[#1a3a5c] overflow-hidden">
        <div className="absolute inset-0 opacity-5">
          <div className="absolute top-0 left-1/4 w-96 h-96 bg-[#c8a96e] rounded-full blur-3xl" />
          <div className="absolute bottom-0 right-1/4 w-80 h-80 bg-[#c8a96e] rounded-full blur-3xl" />
        </div>
        <div className="relative max-w-[1280px] mx-auto px-6">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
              {locale === 'zh' ? '数字见证实力' : locale === 'de' ? 'Zahlen belegen Kompetenz' : 'Numbers Tell the Story'}
            </h2>
            <div className="w-12 h-0.5 bg-[#c8a96e] mx-auto" />
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 md:gap-12">
            {stats.map((s, i) => (
              <div key={i} className="text-center group">
                <div className="text-4xl md:text-5xl lg:text-6xl font-bold text-[#c8a96e] mb-2 transition-transform duration-300 group-hover:scale-105">
                  {s.value}
                </div>
                <div className="w-8 h-px bg-[#c8a96e]/50 mx-auto mb-3" />
                <div className="text-white/70 text-sm md:text-base tracking-wide">
                  {(s as Record<string, string>)[locale] || s.en}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ============ PHILOSOPHY / QUOTE ============ */}
      <section className="py-20 md:py-28">
        <div className="max-w-[1280px] mx-auto px-6">
          <div className="max-w-3xl mx-auto text-center">
            <div className="text-[#c8a96e] text-6xl md:text-7xl font-serif leading-none mb-6 opacity-40">
              &ldquo;
            </div>
            <blockquote className="text-2xl md:text-3xl lg:text-4xl font-light text-[#1a3a5c] leading-relaxed mb-8">
              {locale === 'zh'
                ? '精工品质，触心而动'
                : locale === 'de'
                  ? 'Präzisionstechnik, Bewegendes Wohnen'
                  : 'Precision Engineering, Inspired Living'}
            </blockquote>
            <div className="w-12 h-0.5 bg-[#c8a96e] mx-auto mb-6" />
            <p className="text-gray-500 text-base md:text-lg leading-relaxed">
              {locale === 'zh'
                ? '品仕高五金始终秉持"精工品质，触心而动"的品牌理念，以德国精工标准为基石，融合意大利设计美学，致力于为全球家具制造商提供卓越的五金解决方案。从每一枚铰链到每一套抽屉系统，品仕高人以匠心精神打磨每一处细节，让每一次开合都成为享受。'
                : locale === 'de'
                  ? 'PINSHIGAO Hardware steht für das Markenversprechen "Präzisionstechnik, Bewegendes Wohnen". Auf Basis deutscher Präzision und italienischem Design bieten wir erstklassige Beschlaglösungen für Möbelhersteller weltweit.'
                  : 'PINSHIGAO Hardware upholds the brand philosophy of "Precision Engineering, Inspired Living." Rooted in German precision and Italian design aesthetics, we are dedicated to delivering exceptional hardware solutions for furniture manufacturers worldwide.'}
            </p>
            <div className="mt-10 flex items-center justify-center gap-4 text-sm text-gray-400">
              <span className="font-semibold text-[#1a3a5c]">PINSHIGAO</span>
              <span className="text-gray-300">|</span>
              <span>{locale === 'zh' ? '品仕高五金有限公司' : locale === 'de' ? 'PINSHIGAO Hardware Co., Ltd.' : 'PINSHIGAO Hardware Co., Ltd.'}</span>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
