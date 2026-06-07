'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import { usePathname } from 'next/navigation';

interface FormData {
  name: string;
  email: string;
  phone: string;
  message: string;
}

const initialForm: FormData = {
  name: '',
  email: '',
  phone: '',
  message: '',
};

export default function ContactPage() {
  const t = useTranslations('contact');
  const common = useTranslations('common');
  const pathname = usePathname();
  const locale = pathname.split('/')[1] || 'zh';

  const [form, setForm] = useState<FormData>(initialForm);
  const [submitted, setSubmitted] = useState(false);

  function handleChange(e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    // For now, simply show success message
    setSubmitted(true);
    setForm(initialForm);
  }

  const inputClass =
    'w-full px-4 py-3 border border-gray-200 rounded-sm text-sm text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-1 focus:ring-[#c8a96e] focus:border-[#c8a96e] transition-colors bg-white';
  const labelClass = 'block text-sm font-medium text-gray-700 mb-1.5';
  const infoIconClass = 'w-10 h-10 flex items-center justify-center bg-[#1a3a5c]/5 text-[#c8a96e] rounded-full shrink-0';

  return (
    <>
      {/* Hero Banner */}
      <section className="relative">
        <div className="h-[300px] md:h-[360px] bg-gradient-to-br from-[#1a3a5c] to-[#2a5a8c] flex items-center justify-center">
          <div className="absolute inset-0 bg-[url('/images/contact-hero-bg.jpg')] bg-cover bg-center opacity-10" />
          <div className="relative z-10 text-center px-6">
            <h1 className="text-4xl md:text-5xl font-bold text-white mb-3">{t('title')}</h1>
            <p className="text-lg text-white/70 max-w-[600px] mx-auto">{t('subtitle')}</p>
          </div>
        </div>
        <div className="absolute -bottom-4 left-0 right-0 h-8 bg-gradient-to-t from-white to-transparent" />
      </section>

      {/* Two-Column Layout */}
      <section className="max-w-[1280px] mx-auto px-6 py-16 md:py-24">
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-12 lg:gap-20">
          {/* Left Column - Form */}
          <div className="lg:col-span-3">
            <h2 className="text-2xl font-semibold text-[#1a3a5c] mb-8">{t('form.submit')}</h2>

            {submitted ? (
              <div className="bg-emerald-50 border border-emerald-200 rounded-sm p-8 text-center">
                <div className="w-16 h-16 mx-auto mb-4 flex items-center justify-center bg-emerald-100 rounded-full">
                  <svg className="w-8 h-8 text-emerald-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                <p className="text-emerald-800 text-base font-medium">{t('form.success')}</p>
                <button
                  onClick={() => setSubmitted(false)}
                  className="mt-6 px-6 py-2.5 bg-[#c8a96e] text-white text-sm font-medium hover:bg-[#a8894e] transition-colors rounded-sm"
                >
                  {common('send')}
                </button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-6">
                <div>
                  <label htmlFor="name" className={labelClass}>
                    {t('form.name')} <span className="text-red-400">*</span>
                  </label>
                  <input
                    id="name"
                    name="name"
                    type="text"
                    value={form.name}
                    onChange={handleChange}
                    required
                    className={inputClass}
                    placeholder={t('form.name')}
                  />
                </div>

                <div>
                  <label htmlFor="email" className={labelClass}>
                    {t('form.email')} <span className="text-red-400">*</span>
                  </label>
                  <input
                    id="email"
                    name="email"
                    type="email"
                    value={form.email}
                    onChange={handleChange}
                    required
                    className={inputClass}
                    placeholder={t('form.email')}
                  />
                </div>

                <div>
                  <label htmlFor="phone" className={labelClass}>
                    {t('form.phone')}
                  </label>
                  <input
                    id="phone"
                    name="phone"
                    type="tel"
                    value={form.phone}
                    onChange={handleChange}
                    className={inputClass}
                    placeholder={t('form.phone')}
                  />
                </div>

                <div>
                  <label htmlFor="message" className={labelClass}>
                    {t('form.message')} <span className="text-red-400">*</span>
                  </label>
                  <textarea
                    id="message"
                    name="message"
                    rows={5}
                    value={form.message}
                    onChange={handleChange}
                    required
                    className={`${inputClass} resize-y min-h-[120px]`}
                    placeholder={t('form.message')}
                  />
                </div>

                <button
                  type="submit"
                  className="w-full md:w-auto px-10 py-3 bg-[#c8a96e] text-white text-sm font-medium hover:bg-[#a8894e] transition-colors rounded-sm tracking-wider"
                >
                  {t('form.submit')}
                </button>
              </form>
            )}
          </div>

          {/* Right Column - Contact Info */}
          <div className="lg:col-span-2">
            <div className="bg-gray-50 border border-gray-100 rounded-sm p-8 space-y-8">
              <h3 className="text-lg font-semibold text-[#1a3a5c]">{t('title')}</h3>

              <div className="space-y-6">
                {/* Address */}
                <div className="flex items-start gap-4">
                  <div className={infoIconClass}>
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M15 10.5a3 3 0 11-6 0 3 3 0 016 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1115 0z" />
                    </svg>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500 mb-0.5">{t('info.address')}</p>
                    <p className="text-sm font-medium text-gray-800">{common('addressFull')}</p>
                  </div>
                </div>

                {/* Phone */}
                <div className="flex items-start gap-4">
                  <div className={infoIconClass}>
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 6.75c0 8.284 6.716 15 15 15h2.25a2.25 2.25 0 002.25-2.25v-1.372c0-.516-.351-.966-.852-1.091l-4.423-1.106c-.44-.11-.902.055-1.173.417l-.97 1.293c-.282.376-.769.542-1.21.38a12.035 12.035 0 01-7.143-7.143c-.162-.441.004-.928.38-1.21l1.293-.97c.363-.271.527-.734.417-1.173L6.963 3.102a1.125 1.125 0 00-1.091-.852H4.5A2.25 2.25 0 002.25 4.5v2.25z" />
                    </svg>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500 mb-0.5">{t('info.phone')}</p>
                    <p className="text-sm font-medium text-gray-800">{common('phone')}</p>
                  </div>
                </div>

                {/* Email */}
                <div className="flex items-start gap-4">
                  <div className={infoIconClass}>
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M21.75 6.75v10.5a2.25 2.25 0 01-2.25 2.25h-15a2.25 2.25 0 01-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25m19.5 0v.243a2.25 2.25 0 01-1.07 1.916l-7.5 4.615a2.25 2.25 0 01-2.36 0L3.32 8.91a2.25 2.25 0 01-1.07-1.916V6.75" />
                    </svg>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500 mb-0.5">{t('info.email')}</p>
                    <p className="text-sm font-medium text-gray-800">{common('email')}</p>
                  </div>
                </div>

                {/* Hours */}
                <div className="flex items-start gap-4">
                  <div className={infoIconClass}>
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500 mb-0.5">{t('info.hours')}</p>
                    <p className="text-sm font-medium text-gray-800">
                      {locale === 'zh'
                        ? '周一至周五 8:30-17:30'
                        : locale === 'de'
                        ? 'Mo-Fr 8:30-17:30'
                        : 'Mon-Fri 8:30-17:30'}
                    </p>
                  </div>
                </div>
              </div>

              {/* Divider */}
              <div className="border-t border-gray-200 pt-6">
                <p className="text-xs text-gray-400 leading-relaxed">
                  {common('companyFull')} &middot; {t('subtitle')}
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
