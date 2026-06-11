'use client';
import AdminLayout from '@/components/AdminLayout';

import { useState, useEffect, FormEvent } from 'react';
import { useRouter, useParams } from 'next/navigation';

/* ---------- types ---------- */

interface NewsArticle {
  id: number;
  slug: string;
  titleZh: string;
  titleEn: string;
  titleDe: string;
  summaryZh: string | null;
  summaryEn: string | null;
  summaryDe: string | null;
  contentZh: string | null;
  contentEn: string | null;
  contentDe: string | null;
  image: string | null;
  date: string;
  published: boolean;
}

/* ---------- component ---------- */

export default function EditNewsPage() {
  const router = useRouter();
  const params = useParams<{ locale: string; slug: string }>();
  const locale = params.locale;
  const slug = params.slug;

  /* form state */
  const [titleZh, setTitleZh] = useState('');
  const [titleEn, setTitleEn] = useState('');
  const [titleDe, setTitleDe] = useState('');
  const [summaryZh, setSummaryZh] = useState('');
  const [summaryEn, setSummaryEn] = useState('');
  const [summaryDe, setSummaryDe] = useState('');
  const [contentZh, setContentZh] = useState('');
  const [contentEn, setContentEn] = useState('');
  const [contentDe, setContentDe] = useState('');
  const [image, setImage] = useState('');
  const [date, setDate] = useState('');
  const [published, setPublished] = useState(true);

  /* ui state */
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState('');
  const [notFound, setNotFound] = useState(false);

  /* ---------- fetch existing article ---------- */

  useEffect(() => {
    if (!slug) return;

    fetch(`/api/news/${encodeURIComponent(slug)}`)
      .then((res) => {
        if (res.status === 404) {
          setNotFound(true);
          setLoading(false);
          return null;
        }
        if (!res.ok) throw new Error('Failed to fetch article');
        return res.json();
      })
      .then((data: NewsArticle | null) => {
        if (!data) return;
        setTitleZh(data.titleZh);
        setTitleEn(data.titleEn);
        setTitleDe(data.titleDe);
        setSummaryZh(data.summaryZh ?? '');
        setSummaryEn(data.summaryEn ?? '');
        setSummaryDe(data.summaryDe ?? '');
        setContentZh(data.contentZh ?? '');
        setContentEn(data.contentEn ?? '');
        setContentDe(data.contentDe ?? '');
        setImage(data.image ?? '');
        setDate(data.date ? data.date.slice(0, 10) : '');
        setPublished(data.published);
      })
      .catch((err: unknown) => {
        setError(err instanceof Error ? err.message : 'Failed to load article');
      })
      .finally(() => setLoading(false));
  }, [slug]);

  /* ---------- upload handler ---------- */

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    setError('');

    try {
      const formData = new FormData();
      formData.append('file', file);

      const res = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      });

      if (!res.ok) {
        const errData = await res.json().catch(() => ({}));
        throw new Error(errData.error || 'Upload failed');
      }

      const data = await res.json();
      setImage(data.filename);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Upload failed');
    } finally {
      setUploading(false);
      e.target.value = '';
    }
  };

  const removeImage = () => setImage('');

  /* ---------- submit handler ---------- */

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setError('');

    try {
      const res = await fetch(`/api/news/${encodeURIComponent(slug)}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          titleZh,
          titleEn,
          titleDe,
          summaryZh: summaryZh || undefined,
          summaryEn: summaryEn || undefined,
          summaryDe: summaryDe || undefined,
          contentZh: contentZh || undefined,
          contentEn: contentEn || undefined,
          contentDe: contentDe || undefined,
          image: image || undefined,
          date: date || undefined,
          published,
        }),
      });

      if (!res.ok) {
        const errData = await res.json().catch(() => ({}));
        throw new Error(errData.error || 'Failed to update article');
      }

      router.push(`/${locale}/admin/news`);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Failed to update article');
    } finally {
      setSubmitting(false);
    }
  };

  /* ---------- style helpers ---------- */

  const inputClass =
    'w-full border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-accent focus:border-accent';
  const labelClass = 'block text-sm font-medium text-gray-700 mb-1';
  const sectionTitle =
    'text-base font-semibold text-primary mt-6 mb-3 pb-2 border-b border-gray-200';

  /* ---------- loading / not-found states ---------- */

  if (loading) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-8">
        <div className="flex items-center justify-center py-20">
          <div className="text-gray-400 text-sm">Loading article...</div>
        </div>
      </div>
    );
  }

  if (notFound) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-8">
        <div className="text-center py-20">
          <h1 className="text-xl font-semibold text-gray-700 mb-2">Article Not Found</h1>
          <p className="text-gray-400 text-sm mb-6">
            The news article with slug &quot;{slug}&quot; does not exist.
          </p>
          <button
            type="button"
            onClick={() => router.push(`/${locale}/admin/news`)}
            className="px-4 py-2 bg-primary text-white text-sm font-medium rounded hover:bg-primary-dark transition-colors"
          >
            &larr; Back to News
          </button>
        </div>
      </div>
    );
  }

  /* ---------- main render ---------- */

  return (<AdminLayout>
    <div className="max-w-3xl mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-primary">Edit News Article</h1>
        <button
          type="button"
          onClick={() => router.push(`/${locale}/admin/news`)}
          className="text-sm text-gray-500 hover:text-gray-700 transition-colors"
        >
          &larr; Back
        </button>
      </div>

      {error && (
        <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-700 text-sm rounded">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* ---- Titles ---- */}
        <div>
          <h2 className={sectionTitle}>Titles</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className={labelClass}>
                Title (ZH) <span className="text-red-500">*</span>
              </label>
              <input
                className={inputClass}
                value={titleZh}
                onChange={(e) => setTitleZh(e.target.value)}
                required
              />
            </div>
            <div>
              <label className={labelClass}>
                Title (EN) <span className="text-red-500">*</span>
              </label>
              <input
                className={inputClass}
                value={titleEn}
                onChange={(e) => setTitleEn(e.target.value)}
                required
              />
            </div>
            <div>
              <label className={labelClass}>
                Title (DE) <span className="text-red-500">*</span>
              </label>
              <input
                className={inputClass}
                value={titleDe}
                onChange={(e) => setTitleDe(e.target.value)}
                required
              />
            </div>
          </div>
        </div>

        {/* ---- Summaries ---- */}
        <div>
          <h2 className={sectionTitle}>Summaries</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className={labelClass}>Summary (ZH)</label>
              <textarea
                className={`${inputClass} resize-y min-h-[80px]`}
                value={summaryZh}
                onChange={(e) => setSummaryZh(e.target.value)}
              />
            </div>
            <div>
              <label className={labelClass}>Summary (EN)</label>
              <textarea
                className={`${inputClass} resize-y min-h-[80px]`}
                value={summaryEn}
                onChange={(e) => setSummaryEn(e.target.value)}
              />
            </div>
            <div>
              <label className={labelClass}>Summary (DE)</label>
              <textarea
                className={`${inputClass} resize-y min-h-[80px]`}
                value={summaryDe}
                onChange={(e) => setSummaryDe(e.target.value)}
              />
            </div>
          </div>
        </div>

        {/* ---- Content ---- */}
        <div>
          <h2 className={sectionTitle}>Content</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className={labelClass}>Content (ZH)</label>
              <textarea
                className={`${inputClass} resize-y min-h-[200px] font-mono text-xs leading-relaxed`}
                value={contentZh}
                onChange={(e) => setContentZh(e.target.value)}
              />
            </div>
            <div>
              <label className={labelClass}>Content (EN)</label>
              <textarea
                className={`${inputClass} resize-y min-h-[200px] font-mono text-xs leading-relaxed`}
                value={contentEn}
                onChange={(e) => setContentEn(e.target.value)}
              />
            </div>
            <div>
              <label className={labelClass}>Content (DE)</label>
              <textarea
                className={`${inputClass} resize-y min-h-[200px] font-mono text-xs leading-relaxed`}
                value={contentDe}
                onChange={(e) => setContentDe(e.target.value)}
              />
            </div>
          </div>
        </div>

        {/* ---- Settings ---- */}
        <div>
          <h2 className={sectionTitle}>Settings</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className={labelClass}>Date</label>
              <input
                type="date"
                className={inputClass}
                value={date}
                onChange={(e) => setDate(e.target.value)}
              />
            </div>

            <div className="flex items-end pb-2">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={published}
                  onChange={(e) => setPublished(e.target.checked)}
                  className="w-4 h-4 rounded border-gray-300 text-accent focus:ring-accent"
                />
                <span className="text-sm font-medium text-gray-700">Published</span>
              </label>
            </div>
          </div>
        </div>

        {/* ---- Image ---- */}
        <div>
          <h2 className={sectionTitle}>Featured Image</h2>
          <div className="mb-3">
            <label className="inline-block cursor-pointer px-4 py-2 bg-gray-100 border border-gray-300 rounded text-sm text-gray-700 hover:bg-gray-200 transition-colors">
              {uploading ? 'Uploading...' : 'Choose file'}
              <input
                type="file"
                accept="image/*"
                onChange={handleUpload}
                disabled={uploading}
                className="hidden"
              />
            </label>
          </div>

          {image ? (
            <div className="relative inline-block group">
              <img
                src={`/uploads/${image}`}
                alt="Featured"
                className="w-48 h-32 object-cover rounded border border-gray-200"
              />
              <button
                type="button"
                onClick={removeImage}
                className="absolute -top-2 -right-2 w-5 h-5 bg-red-500 text-white text-xs rounded-full
                  flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
              >
                &times;
              </button>
            </div>
          ) : (
            <p className="text-xs text-gray-400">No image selected.</p>
          )}
        </div>

        {/* ---- Submit ---- */}
        <div className="pt-4 border-t border-gray-200">
          <button
            type="submit"
            disabled={submitting}
            className="px-6 py-2.5 bg-primary text-white text-sm font-medium rounded hover:bg-primary-dark
              transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {submitting ? 'Saving...' : 'Save Changes'}
          </button>
        </div>
      </form>
    </div>
    </AdminLayout>
  );
}
