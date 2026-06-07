'use client';

import { useState, useEffect, FormEvent } from 'react';
import { useRouter, usePathname } from 'next/navigation';

interface Category {
  id: number;
  nameZh: string;
  nameEn: string;
  nameDe: string;
  slug: string;
}

export default function NewProductPage() {
  const router = useRouter();
  const pathname = usePathname();
  const locale = pathname?.split('/')[1] || 'zh';

  const [categories, setCategories] = useState<Category[]>([]);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  /* ---------- form fields ---------- */
  const [nameZh, setNameZh] = useState('');
  const [nameEn, setNameEn] = useState('');
  const [nameDe, setNameDe] = useState('');
  const [subtitleZh, setSubtitleZh] = useState('');
  const [subtitleEn, setSubtitleEn] = useState('');
  const [subtitleDe, setSubtitleDe] = useState('');
  const [descZh, setDescZh] = useState('');
  const [descEn, setDescEn] = useState('');
  const [descDe, setDescDe] = useState('');
  const [categoryId, setCategoryId] = useState('');
  const [featured, setFeatured] = useState(false);
  const [published, setPublished] = useState(true);
  const [images, setImages] = useState<string[]>([]);
  const [uploading, setUploading] = useState(false);

  /* ---------- load categories ---------- */
  useEffect(() => {
    fetch('/api/categories')
      .then((res) => res.json())
      .then((data) => setCategories(Array.isArray(data) ? data : []))
      .catch(() => setCategories([]));
  }, []);

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
      setImages((prev) => [...prev, data.filename]);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Upload failed');
    } finally {
      setUploading(false);
      // Reset the input so the same file can be re-selected
      e.target.value = '';
    }
  };

  const removeImage = (filename: string) => {
    setImages((prev) => prev.filter((f) => f !== filename));
  };

  /* ---------- submit handler ---------- */
  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setError('');

    try {
      const res = await fetch('/api/products', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          nameZh,
          nameEn,
          nameDe,
          subtitleZh: subtitleZh || undefined,
          subtitleEn: subtitleEn || undefined,
          subtitleDe: subtitleDe || undefined,
          descZh: descZh || undefined,
          descEn: descEn || undefined,
          descDe: descDe || undefined,
          categoryId: categoryId ? Number(categoryId) : undefined,
          featured,
          published,
          images: images.length > 0 ? JSON.stringify(images) : undefined,
        }),
      });

      if (!res.ok) {
        const errData = await res.json().catch(() => ({}));
        throw new Error(errData.error || 'Failed to create product');
      }

      router.push(`/${locale}/admin/products`);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Failed to create product');
    } finally {
      setSubmitting(false);
    }
  };

  /* ---------- style helpers ---------- */
  const inputClass =
    'w-full border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-accent focus:border-accent';
  const labelClass = 'block text-sm font-medium text-gray-700 mb-1';
  const sectionTitle = 'text-base font-semibold text-primary mt-6 mb-3 pb-2 border-b border-gray-200';

  return (
    <div className="max-w-3xl mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-primary">New Product</h1>
        <button
          type="button"
          onClick={() => router.push(`/${locale}/admin/products`)}
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
        {/* ---- Names ---- */}
        <div>
          <h2 className={sectionTitle}>Names</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className={labelClass}>
                Name (ZH) <span className="text-red-500">*</span>
              </label>
              <input
                className={inputClass}
                value={nameZh}
                onChange={(e) => setNameZh(e.target.value)}
                required
              />
            </div>
            <div>
              <label className={labelClass}>
                Name (EN) <span className="text-red-500">*</span>
              </label>
              <input
                className={inputClass}
                value={nameEn}
                onChange={(e) => setNameEn(e.target.value)}
                required
              />
            </div>
            <div>
              <label className={labelClass}>
                Name (DE) <span className="text-red-500">*</span>
              </label>
              <input
                className={inputClass}
                value={nameDe}
                onChange={(e) => setNameDe(e.target.value)}
                required
              />
            </div>
          </div>
        </div>

        {/* ---- Subtitles ---- */}
        <div>
          <h2 className={sectionTitle}>Subtitles</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className={labelClass}>Subtitle (ZH)</label>
              <input
                className={inputClass}
                value={subtitleZh}
                onChange={(e) => setSubtitleZh(e.target.value)}
              />
            </div>
            <div>
              <label className={labelClass}>Subtitle (EN)</label>
              <input
                className={inputClass}
                value={subtitleEn}
                onChange={(e) => setSubtitleEn(e.target.value)}
              />
            </div>
            <div>
              <label className={labelClass}>Subtitle (DE)</label>
              <input
                className={inputClass}
                value={subtitleDe}
                onChange={(e) => setSubtitleDe(e.target.value)}
              />
            </div>
          </div>
        </div>

        {/* ---- Descriptions ---- */}
        <div>
          <h2 className={sectionTitle}>Descriptions</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className={labelClass}>Description (ZH)</label>
              <textarea
                className={`${inputClass} resize-y min-h-[100px]`}
                value={descZh}
                onChange={(e) => setDescZh(e.target.value)}
              />
            </div>
            <div>
              <label className={labelClass}>Description (EN)</label>
              <textarea
                className={`${inputClass} resize-y min-h-[100px]`}
                value={descEn}
                onChange={(e) => setDescEn(e.target.value)}
              />
            </div>
            <div>
              <label className={labelClass}>Description (DE)</label>
              <textarea
                className={`${inputClass} resize-y min-h-[100px]`}
                value={descDe}
                onChange={(e) => setDescDe(e.target.value)}
              />
            </div>
          </div>
        </div>

        {/* ---- Category + toggles ---- */}
        <div>
          <h2 className={sectionTitle}>Settings</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className={labelClass}>Category</label>
              <select
                className={inputClass}
                value={categoryId}
                onChange={(e) => setCategoryId(e.target.value)}
              >
                <option value="">-- No category --</option>
                {categories.map((cat) => (
                  <option key={cat.id} value={cat.id}>
                    {cat.nameZh} / {cat.nameEn}
                  </option>
                ))}
              </select>
            </div>

            <div className="flex items-end gap-6 pb-2">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={featured}
                  onChange={(e) => setFeatured(e.target.checked)}
                  className="w-4 h-4 rounded border-gray-300 text-accent focus:ring-accent"
                />
                <span className="text-sm font-medium text-gray-700">Featured</span>
              </label>

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

        {/* ---- Images ---- */}
        <div>
          <h2 className={sectionTitle}>Images</h2>
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

          {images.length > 0 && (
            <div className="flex flex-wrap gap-3">
              {images.map((filename) => (
                <div key={filename} className="relative group">
                  <img
                    src={`/uploads/${filename}`}
                    alt={filename}
                    className="w-24 h-24 object-cover rounded border border-gray-200"
                  />
                  <button
                    type="button"
                    onClick={() => removeImage(filename)}
                    className="absolute -top-2 -right-2 w-5 h-5 bg-red-500 text-white text-xs rounded-full
                      flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    &times;
                  </button>
                </div>
              ))}
            </div>
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
            {submitting ? 'Creating...' : 'Create Product'}
          </button>
        </div>
      </form>
    </div>
  );
}
