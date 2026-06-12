'use client';

import { useState, useEffect, FormEvent } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { useTranslations } from 'next-intl';
import AdminLayout from '@/components/AdminLayout';

/* ---------- Types ---------- */
interface SettingsData {
  siteTitle: string;
  siteDescription: string;
  contactEmail: string;
  contactPhone: string;
  contactAddress: string;
  copyright: string;
  footerAbout: string;
}

/* ---------- Component ---------- */
export default function AdminSettingsPage() {
  const router = useRouter();
  const pathname = usePathname();
  const locale = pathname?.split('/')[1] || 'zh';
  const t = useTranslations('admin');

  const [settings, setSettings] = useState<SettingsData>({
    siteTitle: '',
    siteDescription: '',
    contactEmail: '',
    contactPhone: '',
    contactAddress: '',
    copyright: '',
    footerAbout: '',
  });
  const [original, setOriginal] = useState<SettingsData>({
    siteTitle: '',
    siteDescription: '',
    contactEmail: '',
    contactPhone: '',
    contactAddress: '',
    copyright: '',
    footerAbout: '',
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  /* ---------- Fetch settings ---------- */
  useEffect(() => {
    let cancelled = false;

    async function load() {
      setLoading(true);
      setError('');
      try {
        const res = await fetch('/api/settings', { credentials: 'include' });
        if (res.status === 401) {
          router.push(`/${locale}/admin/login`);
          return;
        }
        if (!res.ok) {
          const err = await res.json().catch(() => ({}));
          throw new Error(err.message || t('errorLoad'));
        }
        const data = await res.json();
        // API returns [{key, value}, ...] - convert to object
        const dataObj: Record<string, string> = {};
        if (Array.isArray(data)) {
          data.forEach((item: { key: string; value: string }) => {
            dataObj[item.key] = item.value ?? '';
          });
        }
        const mapped: SettingsData = {
          siteTitle: dataObj.siteTitle ?? '',
          siteDescription: dataObj.siteDescription ?? '',
          contactEmail: dataObj.contactEmail ?? '',
          contactPhone: dataObj.contactPhone ?? '',
          contactAddress: dataObj.contactAddress ?? '',
          copyright: dataObj.copyright ?? '',
          footerAbout: dataObj.footerAbout ?? '',
        };
        if (!cancelled) {
          setSettings(mapped);
          setOriginal(mapped);
        }
      } catch (e) {
        if (!cancelled) {
          setError(e instanceof Error ? e.message : t('errorLoad'));
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    load();
    return () => { cancelled = true; };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  /* ---------- Field change ---------- */
  function updateField<K extends keyof SettingsData>(key: K, value: SettingsData[K]) {
    setSettings((prev) => ({ ...prev, [key]: value }));
  }

  /* ---------- Has changes ---------- */
  function hasChanges(): boolean {
    return (['siteTitle','siteDescription','contactEmail','contactPhone','contactAddress','copyright','footerAbout'] as (keyof SettingsData)[]).some(
      (k) => settings[k] !== original[k],
    );
  }

  /* ---------- Submit ---------- */
  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (!hasChanges()) {
      setError(t('noChanges'));
      setTimeout(() => setError(''), 2500);
      return;
    }

    setSaving(true);
    setError('');
    setSuccessMsg('');

    try {
      const res = await fetch('/api/settings', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(settings),
      });

      if (res.status === 401) {
        router.push(`/${locale}/admin/login`);
        return;
      }

      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.message || t('errorSave'));
      }

      setOriginal({ ...settings });
      setSuccessMsg(t('saved'));
      setTimeout(() => setSuccessMsg(''), 3000);
    } catch (e) {
      setError(e instanceof Error ? e.message : t('errorSave'));
    } finally {
      setSaving(false);
    }
  }

  /* ---------- Styles ---------- */
  const inputClass =
    'w-full border border-[var(--color-border)] rounded-sm px-3 py-2 text-sm ' +
    'focus:outline-none focus:border-[#c8a96e] focus:ring-1 focus:ring-[#c8a96e]/30 transition-colors';
  const textareaClass = `${inputClass} resize-y min-h-[100px]`;
  const labelClass = 'block text-sm font-medium text-[var(--color-text)] mb-1.5';
  const sectionTitle =
    'text-base font-semibold text-[#1a3a5c] pb-2 border-b border-[var(--color-border)] mb-4';

  /* ---------- Render ---------- */
  return (
    <AdminLayout>
      {/* Page header */}
      <div className="mb-6">
        <h1 className="text-2xl font-semibold text-[#1a3a5c]">{t('pageTitle')}</h1>
      </div>

      {/* Toast messages */}
      {successMsg && (
        <div className="fixed top-4 right-4 z-50 bg-green-600 text-white px-5 py-3 rounded-sm shadow-lg text-sm flex items-center gap-2 animate-fade-in">
          <i className="fa-solid fa-check-circle" />
          {successMsg}
        </div>
      )}
      {error && (
        <div className="fixed top-4 right-4 z-50 bg-red-600 text-white px-5 py-3 rounded-sm shadow-lg text-sm flex items-center gap-2 animate-fade-in">
          <i className="fa-solid fa-exclamation-circle" />
          {error}
          <button onClick={() => setError('')} className="ml-3 hover:text-white/70">
            <i className="fa-solid fa-times" />
          </button>
        </div>
      )}

      {/* Loading state */}
      {loading ? (
        <div className="flex items-center justify-center py-20">
          <div className="flex items-center gap-3 text-[var(--color-text-secondary)]">
            <i className="fa-solid fa-spinner fa-spin text-lg" />
            <span className="text-sm">{t('loading')}</span>
          </div>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="max-w-2xl space-y-6">
          {/* ---- Site Info ---- */}
          <div className="bg-white border border-[var(--color-border)] rounded-sm p-5">
            <h2 className={sectionTitle}>
              <i className="fa-solid fa-globe text-[#c8a96e] mr-2" />
              {t('siteSection')}
            </h2>

            <div className="space-y-4">
              {/* Site Title */}
              <div>
                <label className={labelClass} htmlFor="siteTitle">
                  {t('siteTitle')}
                </label>
                <input
                  id="siteTitle"
                  className={inputClass}
                  value={settings.siteTitle}
                  onChange={(e) => updateField('siteTitle', e.target.value)}
                  placeholder={t('siteTitlePlaceholder')}
                />
              </div>

              {/* Site Description */}
              <div>
                <label className={labelClass} htmlFor="siteDescription">
                  {t('siteDescription')}
                </label>
                <textarea
                  id="siteDescription"
                  className={textareaClass}
                  value={settings.siteDescription}
                  onChange={(e) => updateField('siteDescription', e.target.value)}
                  placeholder={t('siteDescriptionPlaceholder')}
                  rows={3}
                />
              </div>
            </div>
          </div>

          {/* ---- Contact Information ---- */}
          <div className="bg-white border border-[var(--color-border)] rounded-sm p-5">
            <h2 className={sectionTitle}>
              <i className="fa-solid fa-address-card text-[#c8a96e] mr-2" />
              {t('contactSection')}
            </h2>

            <div className="space-y-4">
              {/* Email */}
              <div>
                <label className={labelClass} htmlFor="contactEmail">
                  {t('contactEmail')}
                </label>
                <input
                  id="contactEmail"
                  type="email"
                  className={inputClass}
                  value={settings.contactEmail}
                  onChange={(e) => updateField('contactEmail', e.target.value)}
                  placeholder={t('contactEmailPlaceholder')}
                />
              </div>

              {/* Phone */}
              <div>
                <label className={labelClass} htmlFor="contactPhone">
                  {t('contactPhone')}
                </label>
                <input
                  id="contactPhone"
                  type="tel"
                  className={inputClass}
                  value={settings.contactPhone}
                  onChange={(e) => updateField('contactPhone', e.target.value)}
                  placeholder={t('contactPhonePlaceholder')}
                />
              </div>

              {/* Address */}
              <div>
                <label className={labelClass} htmlFor="contactAddress">
                  {t('address')}
                </label>
                <textarea
                  id="contactAddress"
                  className={textareaClass}
                  value={settings.contactAddress}
                  onChange={(e) => updateField('contactAddress', e.target.value)}
                  placeholder={t('contactAddressPlaceholder')}
                  rows={2}
                />
              </div>
            </div>
          </div>

          {/* ---- Footer Settings ---- */}
          <div className="bg-white border border-[var(--color-border)] rounded-sm p-5">
            <h2 className={sectionTitle}>
              <i className="fa-solid fa-receipt text-[#c8a96e] mr-2" />
              {t('footerSection')}
            </h2>

            <div className="space-y-4">
              {/* Copyright */}
              <div>
                <label className={labelClass} htmlFor="copyright">
                  {t('copyright')}
                </label>
                <input
                  id="copyright"
                  className={inputClass}
                  value={settings.copyright}
                  onChange={(e) => updateField('copyright', e.target.value)}
                  placeholder={t('copyrightPlaceholder')}
                />
              </div>

              {/* Footer About */}
              <div>
                <label className={labelClass} htmlFor="footerAbout">
                  {t('footerAbout')}
                </label>
                <textarea
                  id="footerAbout"
                  className={textareaClass}
                  value={settings.footerAbout}
                  onChange={(e) => updateField('footerAbout', e.target.value)}
                  placeholder={t('footerAboutPlaceholder')}
                  rows={3}
                />
              </div>
            </div>
          </div>

          {/* ---- Submit ---- */}
          <div className="flex items-center gap-3">
            <button
              type="submit"
              disabled={saving}
              className="inline-flex items-center gap-2 px-6 py-2.5 bg-[#1a3a5c] text-white text-sm font-medium
                hover:bg-[#0f2640] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {saving ? (
                <>
                  <i className="fa-solid fa-spinner fa-spin" />
                  {t('saving')}
                </>
              ) : (
                <>
                  <i className="fa-solid fa-floppy-disk" />
                  {t('save')}
                </>
              )}
            </button>

            {hasChanges() && !saving && (
              <button
                type="button"
                onClick={() => setSettings({ ...original })}
                className="px-4 py-2.5 text-sm text-[var(--color-text-secondary)] border border-[var(--color-border)]
                  hover:bg-gray-50 transition-colors"
              >
                {t('reset')}
              </button>
            )}
          </div>
        </form>
      )}

    </AdminLayout>
  );
}
