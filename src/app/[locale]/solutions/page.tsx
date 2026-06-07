'use client';

import { useTranslations } from 'next-intl';
import { usePathname } from 'next/navigation';
import Link from 'next/link';

const solutionCategories = [
  {
    key: 'kitchen',
    gradient: 'from-amber-900/80 to-amber-700/60',
    icon: (
      <svg className="w-12 h-12 text-white/70" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M9.53 16.122a3 3 0 0 0-5.78 1.128 2.25 2.25 0 0 0 2.4 2.245 4.5 4.5 0 0 0 8.4-2.245c0-.399-.078-.78-.22-1.128m0 0a15.998 15.998 0 0 0 3.388-1.62m-5.043-.025a15.994 15.994 0 0 1 1.622-3.395m3.42 3.42a15.995 15.995 0 0 0 4.764-4.648l3.876-5.814a1.151 1.151 0 0 0-1.597-1.597L14.146 6.32a15.996 15.996 0 0 0-4.649 4.763m3.42 3.42a6.776 6.776 0 0 0-3.42-3.42" />
      </svg>
    ),
    features: ['Damped Hinges', 'Drawer Systems', 'Lift Systems'],
  },
  {
    key: 'wardrobe',
    gradient: 'from-blue-900/80 to-blue-700/60',
    icon: (
      <svg className="w-12 h-12 text-white/70" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 12.75V12A2.25 2.25 0 0 1 4.5 9.75h15A2.25 2.25 0 0 1 21.75 12v.75m-8.69-6.44-2.12-2.12a1.5 1.5 0 0 0-1.061-.44H4.5A2.25 2.25 0 0 0 2.25 6v12a2.25 2.25 0 0 0 2.25 2.25h15A2.25 2.25 0 0 0 21.75 18V9a2.25 2.25 0 0 0-2.25-2.25h-5.379a1.5 1.5 0 0 1-1.06-.44Z" />
      </svg>
    ),
    features: ['Sliding Systems', 'Concealed Rails', 'Handle Collection'],
  },
  {
    key: 'office',
    gradient: 'from-slate-800/80 to-slate-600/60',
    icon: (
      <svg className="w-12 h-12 text-white/70" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 21h16.5M4.5 3h15M5.25 3v18m13.5-18v18M9 6.75h1.5m-1.5 3h1.5m-1.5 3h1.5m3-6H15m-1.5 3H15m-1.5 3H15M9 21v-3.375c0-.621.504-1.125 1.125-1.125h3.75c.621 0 1.125.504 1.125 1.125V21" />
      </svg>
    ),
    features: ['Heavy-duty Slides', 'Lock Systems', 'Cable Management'],
  },
];

export default function SolutionsPage() {
  const t = useTranslations('solutionsPage');
  const tc = useTranslations('common');
  const pathname = usePathname();
  const locale = pathname.split('/')[1] || 'zh';

  return (
    <div>
      {/* ===== Hero Banner ===== */}
      <section className="relative bg-[#1a3a5c] py-24 md:py-32">
        <div className="absolute inset-0 bg-gradient-to-br from-[#1a3a5c] via-[#1a3a5c]/95 to-[#0f2640]"></div>
        <div className="absolute inset-0 opacity-[0.04]"
          style={{
            backgroundImage: `radial-gradient(circle at 25% 25%, #c8a96e 1px, transparent 1px),
                             radial-gradient(circle at 75% 75%, #c8a96e 1px, transparent 1px)`,
            backgroundSize: '60px 60px',
          }}>
        </div>
        <div className="relative max-w-[1280px] mx-auto px-6 text-center">
          <h1 className="text-3xl md:text-5xl font-bold text-white mb-5 leading-tight">
            {t('hero.title')}
          </h1>
          <p className="text-base md:text-lg text-white/60 max-w-2xl mx-auto leading-relaxed">
            {t('hero.subtitle')}
          </p>
        </div>
      </section>

      {/* ===== Solution Categories Grid ===== */}
      <section className="py-20 md:py-28 bg-white">
        <div className="max-w-[1280px] mx-auto px-6">
          <div className="grid md:grid-cols-3 gap-8">
            {solutionCategories.map((cat) => (
              <div
                key={cat.key}
                className="group bg-white border border-[#e8e8e8] overflow-hidden hover:shadow-lg hover:border-[#c8a96e] transition-all duration-300 flex flex-col"
              >
                {/* Visual header */}
                <div className={`relative h-52 bg-gradient-to-br ${cat.gradient} flex items-center justify-center overflow-hidden`}>
                  <div className="absolute inset-0 bg-black/10 group-hover:bg-black/0 transition-colors duration-500"></div>
                  {cat.icon}
                </div>

                {/* Content */}
                <div className="p-8 flex-1 flex flex-col">
                  <h3 className="text-xl font-bold text-[#1a1a1a] mb-3">
                    {t(`${cat.key}.title`)}
                  </h3>
                  <p className="text-[#666666] text-sm leading-relaxed mb-6 flex-1">
                    {t(`${cat.key}.desc`)}
                  </p>

                  {/* Feature list */}
                  <div className="border-t border-[#f0f0f0] pt-5">
                    <h4 className="text-xs font-semibold text-[#999999] uppercase tracking-wider mb-3">
                      {tc('products')} &middot; {cat.key === 'kitchen' ? 'Kitchen' : cat.key === 'wardrobe' ? 'Wardrobe' : 'Office'}
                    </h4>
                    <ul className="space-y-2">
                      {cat.features.map((f) => (
                        <li key={f} className="flex items-center gap-2.5 text-sm text-[#666666]">
                          <span className="w-1.5 h-1.5 bg-[#c8a96e] rounded-full flex-shrink-0"></span>
                          {f}
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ===== Results highlight bar ===== */}
      <section className="bg-[#f5f7fa] py-14">
        <div className="max-w-[1280px] mx-auto px-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
            {[
              { value: tc('about') === 'About PINSHIGAO' || tc('about') === '关于品仕高' ? '2,000+' : '2.000+', label: 'Clients Served' },
              { value: '50+', label: 'Countries Exported' },
              { value: '50M', label: 'Annual Output' },
              { value: '8', label: 'Product Series' },
            ].map((stat) => (
              <div key={stat.label}>
                <div className="text-2xl md:text-3xl font-bold text-[#1a3a5c] mb-1">{stat.value}</div>
                <div className="text-xs text-[#999999] uppercase tracking-widest">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ===== CTA Section ===== */}
      <section className="py-20 md:py-28 relative bg-[#1a3a5c]">
        <div className="absolute inset-0 bg-gradient-to-tl from-[#0f2640] via-[#1a3a5c]/90 to-[#1a3a5c]"></div>
        <div className="relative max-w-[1280px] mx-auto px-6 text-center">
          <h2 className="text-2xl md:text-3xl font-bold text-white mb-4 leading-tight">
            {t('cta.title')}
          </h2>
          <p className="text-white/60 max-w-2xl mx-auto mb-10 leading-relaxed">
            {t('cta.desc')}
          </p>
          <Link
            href={`/${locale}/contact`}
            className="inline-block px-8 py-3.5 bg-[#c8a96e] text-white text-sm font-medium
              hover:bg-[#a8894e] transition-colors tracking-wider"
          >
            {t('cta.button')}
          </Link>
        </div>
      </section>
    </div>
  );
}
