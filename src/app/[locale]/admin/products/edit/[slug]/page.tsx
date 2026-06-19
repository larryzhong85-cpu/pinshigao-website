'use client';
import AdminLayout from '@/components/AdminLayout';

import { useState, useEffect, FormEvent } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useTranslations } from 'next-intl';

interface Category {
  id: number;
  nameZh: string;
  nameEn: string;
  nameDe: string;
  slug: string;
}

interface ProductFormData {
  nameZh: string;
  nameEn: string;
  nameDe: string;
  subtitleZh: string;
  subtitleEn: string;
  subtitleDe: string;
  descZh: string;
  descEn: string;
  descDe: string;
  specsZh: string;
  specsEn: string;
  specsDe: string;
  images: string;
  categoryId: string;
  featured: boolean;
  order: number;
  published: boolean;
}

export default function EditProductPage() {
  const t = useTranslations('admin');
  const params = useParams<{ locale: string; slug: string }>();
  const router = useRouter();
  const locale = params.locale;
  const slug = params.slug;

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [categories, setCategories] = useState<Category[]>([]);
  const [statusMessage, setStatusMessage] = useState('');
  const [translating, setTranslating] = useState<'name' | 'subtitle' | 'desc' | null>(null);

  const [form, setForm] = useState<ProductFormData>({
    nameZh: '',
    nameEn: '',
    nameDe: '',
    subtitleZh: '',
    subtitleEn: '',
    subtitleDe: '',
    descZh: '',
    descEn: '',
    descDe: '',
    specsZh: '',
    specsEn: '',
    specsDe: '',
    images: '',
    categoryId: '',
    featured: false,
    order: 0,
    published: true,
  });

  useEffect(() => {
    async function loadData() {
      try {
        const [productRes, categoriesRes] = await Promise.all([
          fetch(`/api/products/${slug}`),
          fetch('/api/categories'),
        ]);

        if (!productRes.ok) {
          throw new Error(t('productNotFound'));
        }

        const product = await productRes.json();

        let categoriesList: Category[] = [];
        if (categoriesRes.ok) {
          categoriesList = await categoriesRes.json();
          setCategories(categoriesList);
        }

        setForm({
          nameZh: product.nameZh || '',
          nameEn: product.nameEn || '',
          nameDe: product.nameDe || '',
          subtitleZh: product.subtitleZh || '',
          subtitleEn: product.subtitleEn || '',
          subtitleDe: product.subtitleDe || '',
          descZh: product.descZh || '',
          descEn: product.descEn || '',
          descDe: product.descDe || '',
          specsZh: product.specsZh || '',
          specsEn: product.specsEn || '',
          specsDe: product.specsDe || '',
          images: product.images || '',
          categoryId: product.categoryId ? String(product.categoryId) : '',
          featured: product.featured || false,
          order: product.order ?? 0,
          published: product.published ?? true,
        });
      } catch (err) {
        setError(err instanceof Error ? err.message : t('serverError'));
      } finally {
        setLoading(false);
      }
    }

    loadData();
  }, [slug, t]);

  function updateField<K extends keyof ProductFormData>(
    key: K,
    value: ProductFormData[K]
  ) {
    setForm((prev) => ({ ...prev, [key]: value }));
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setSaving(true);
    setStatusMessage('');
    setError('');

    try {
      const body = {
        ...form,
        categoryId: form.categoryId ? parseInt(form.categoryId, 10) : null,
        order: Number(form.order),
      };

      const res = await fetch(`/api/products/${slug}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error || t('serverError'));
      }

      setStatusMessage(t('productUpdated'));

      setTimeout(() => {
        router.push(`/${locale}/admin/products`);
        router.refresh();
      }, 1200);
    } catch (err) {
      setError(err instanceof Error ? err.message : t('serverError'));
    } finally {
      setSaving(false);
    }
  }

  const autoTranslate = async (field: 'name' | 'subtitle' | 'desc') => {
    setTranslating(field);
    const sourceText = field === 'name' ? form.nameZh : field === 'subtitle' ? form.subtitleZh : form.descZh;
    if (!sourceText) { setTranslating(null); return; }
    try {
      const res = await fetch('/api/translate', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text: sourceText, source: 'zh-CN', targets: ['en', 'de'] }),
      });
      const data = await res.json();
      if (data.en !== undefined) {
        const enKey = field === 'name' ? 'nameEn' : field === 'subtitle' ? 'subtitleEn' : 'descEn';
        updateField(enKey as any, data.en);
      }
      if (data.de !== undefined) {
        const deKey = field === 'name' ? 'nameDe' : field === 'subtitle' ? 'subtitleDe' : 'descDe';
        updateField(deKey as any, data.de);
      }
    } catch { /* silent */ }
    finally { setTranslating(null); }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <p className="text-gray-500 text-lg">{t('loadingProduct')}</p>
      </div>
    );
  }

  if (error && !form.nameZh) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center gap-4">
        <p className="text-red-500 text-lg">{error}</p>
        <button
          onClick={() => router.back()}
          className="px-4 py-2 bg-gray-200 text-gray-700 rounded hover:bg-gray-300 transition-colors"
        >
          {t('goBack')}
        </button>
      </div>
    );
  }

  return (<AdminLayout>
    <div className="min-h-screen bg-gray-50 py-10">
      <div className="max-w-4xl mx-auto px-4">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <button
              onClick={() => router.back()}
              className="text-sm text-gray-500 hover:text-gray-700 mb-2 inline-flex items-center gap-1"
            >
              &larr; {t('goBack')}
            </button>
            <h1 className="text-2xl font-bold text-gray-900">{t('editProduct')}</h1>
            <p className="text-sm text-gray-500 mt-1">{t('slug')}: {slug}</p>
          </div>
        </div>

        {/* Status Messages */}
        {statusMessage && (
          <div className="mb-6 px-4 py-3 bg-green-50 border border-green-200 text-green-700 rounded text-sm">
            {statusMessage}
          </div>
        )}
        {error && (
          <div className="mb-6 px-4 py-3 bg-red-50 border border-red-200 text-red-700 rounded text-sm">
            {error}
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-8">
          {/* Multilingual Names */}
          <section className="bg-white rounded shadow-sm border border-gray-200 p-6">
            <h2 className="text-lg font-semibold text-gray-800 mb-4">{t('productName')}</h2>
            <button type="button" onClick={() => autoTranslate('name')} disabled={translating !== null || !form.nameZh}
              className="mb-3 px-3 py-1.5 text-xs border border-gray-300 text-gray-600 hover:bg-gray-50 transition-colors inline-flex items-center gap-1">
              {translating === 'name' ? <><i className="fa-solid fa-spinner fa-spin" /> Translating...</> : <><i className="fa-solid fa-language" /> Auto Translate</>}
            </button>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-600 mb-1">
                  {t('productName')} (ZH) <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={form.nameZh}
                  onChange={(e) => updateField('nameZh', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-600 mb-1">
                  {t('productName')} (EN) <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={form.nameEn}
                  onChange={(e) => updateField('nameEn', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-600 mb-1">
                  {t('productName')} (DE) <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={form.nameDe}
                  onChange={(e) => updateField('nameDe', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>
          </section>

          {/* Subtitles */}
          <section className="bg-white rounded shadow-sm border border-gray-200 p-6">
            <h2 className="text-lg font-semibold text-gray-800 mb-4">{t('subtitle')}</h2>
            <button type="button" onClick={() => autoTranslate('subtitle')} disabled={translating !== null || !form.subtitleZh}
              className="mb-3 px-3 py-1.5 text-xs border border-gray-300 text-gray-600 hover:bg-gray-50 transition-colors inline-flex items-center gap-1">
              {translating === 'subtitle' ? <><i className="fa-solid fa-spinner fa-spin" /> Translating...</> : <><i className="fa-solid fa-language" /> Auto Translate</>}
            </button>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-600 mb-1">{t('subtitle')} (ZH)</label>
                <input
                  type="text"
                  value={form.subtitleZh}
                  onChange={(e) => updateField('subtitleZh', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-600 mb-1">{t('subtitle')} (EN)</label>
                <input
                  type="text"
                  value={form.subtitleEn}
                  onChange={(e) => updateField('subtitleEn', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-600 mb-1">{t('subtitle')} (DE)</label>
                <input
                  type="text"
                  value={form.subtitleDe}
                  onChange={(e) => updateField('subtitleDe', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>
          </section>

          {/* Descriptions */}
          <section className="bg-white rounded shadow-sm border border-gray-200 p-6">
            <h2 className="text-lg font-semibold text-gray-800 mb-4">{t('productDescription')}</h2>
            <button type="button" onClick={() => autoTranslate('desc')} disabled={translating !== null || !form.descZh}
              className="mb-3 px-3 py-1.5 text-xs border border-gray-300 text-gray-600 hover:bg-gray-50 transition-colors inline-flex items-center gap-1">
              {translating === 'desc' ? <><i className="fa-solid fa-spinner fa-spin" /> Translating...</> : <><i className="fa-solid fa-language" /> Auto Translate</>}
            </button>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-600 mb-1">{t('productDescription')} (ZH)</label>
                <textarea
                  rows={4}
                  value={form.descZh}
                  onChange={(e) => updateField('descZh', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-y"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-600 mb-1">{t('productDescription')} (EN)</label>
                <textarea
                  rows={4}
                  value={form.descEn}
                  onChange={(e) => updateField('descEn', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-y"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-600 mb-1">{t('productDescription')} (DE)</label>
                <textarea
                  rows={4}
                  value={form.descDe}
                  onChange={(e) => updateField('descDe', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-y"
                />
              </div>
            </div>
          </section>

          {/* Specifications */}
          <section className="bg-white rounded shadow-sm border border-gray-200 p-6">
            <h2 className="text-lg font-semibold text-gray-800 mb-4">{t('specifications')}</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-600 mb-1">{t('specifications')} (ZH)</label>
                <textarea
                  rows={5}
                  value={form.specsZh}
                  onChange={(e) => updateField('specsZh', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded text-sm font-mono focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-y"
                  placeholder={t('specsPlaceholder')}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-600 mb-1">{t('specifications')} (EN)</label>
                <textarea
                  rows={5}
                  value={form.specsEn}
                  onChange={(e) => updateField('specsEn', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded text-sm font-mono focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-y"
                  placeholder={t('specsPlaceholder')}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-600 mb-1">{t('specifications')} (DE)</label>
                <textarea
                  rows={5}
                  value={form.specsDe}
                  onChange={(e) => updateField('specsDe', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded text-sm font-mono focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-y"
                  placeholder={t('specsPlaceholder')}
                />
              </div>
            </div>
          </section>

          {/* Images, Category, Settings */}
          <section className="bg-white rounded shadow-sm border border-gray-200 p-6">
            <h2 className="text-lg font-semibold text-gray-800 mb-4">{t('mediaAndSettings')}</h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Images */}
              <div>
                <label className="block text-sm font-medium text-gray-600 mb-1">
                  {t('imagesLabel')}
                </label>
                <textarea
                  rows={3}
                  value={form.images}
                  onChange={(e) => updateField('images', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded text-sm font-mono focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-y"
                  placeholder={t('imagesPlaceholder')}
                />
              </div>

              {/* Category */}
              <div>
                <label className="block text-sm font-medium text-gray-600 mb-1">{t('categories')}</label>
                <select
                  value={form.categoryId}
                  onChange={(e) => updateField('categoryId', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white"
                >
                  <option value="">{t('noCategory')}</option>
                  {categories.map((cat) => (
                    <option key={cat.id} value={cat.id}>
                      {cat.nameZh} / {cat.nameEn} / {cat.nameDe}
                    </option>
                  ))}
                </select>
              </div>

              {/* Order */}
              <div>
                <label className="block text-sm font-medium text-gray-600 mb-1">{t('order')}</label>
                <input
                  type="number"
                  value={form.order}
                  onChange={(e) => updateField('order', Number(e.target.value))}
                  className="w-full px-3 py-2 border border-gray-300 rounded text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              {/* Toggles */}
              <div className="flex flex-col gap-4 justify-end">
                <label className="flex items-center gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={form.featured}
                    onChange={(e) => updateField('featured', e.target.checked)}
                    className="w-4 h-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                  <span className="text-sm font-medium text-gray-600">{t('featuredProduct')}</span>
                </label>

                <label className="flex items-center gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={form.published}
                    onChange={(e) => updateField('published', e.target.checked)}
                    className="w-4 h-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                  <span className="text-sm font-medium text-gray-600">{t('published')}</span>
                </label>
              </div>
            </div>
          </section>

          {/* Actions */}
          <div className="flex items-center justify-end gap-4 pb-10">
            <button
              type="button"
              onClick={() => router.back()}
              className="px-5 py-2.5 border border-gray-300 text-gray-700 text-sm font-medium rounded hover:bg-gray-50 transition-colors"
            >
              {t('cancel')}
            </button>
            <button
              type="submit"
              disabled={saving}
              className="px-6 py-2.5 bg-blue-600 text-white text-sm font-medium rounded hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {saving ? t('saving') : t('saveChanges')}
            </button>
          </div>
        </form>
      </div>
    </div>
    </AdminLayout>
  );
}
