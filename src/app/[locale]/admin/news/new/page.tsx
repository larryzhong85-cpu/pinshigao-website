'use client';
import AdminLayout from '@/components/AdminLayout';

import { useState, FormEvent, useRef } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import Link from 'next/link';

function getLocale(p: string): string {
  return p.split('/')[1] || 'zh';
}

function generateSlug(zh: string, en: string, de: string): string {
  const src = en || zh || de || 'untitled';
  return src
    .toLowerCase()
    .replace(/[^a-z0-9一-鿿]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 80) || 'untitled';
}

export default function AdminNewsNewPage() {
  const router = useRouter();
  const pathname = usePathname();
  const locale = getLocale(pathname);
  const fileRef = useRef<HTMLInputElement>(null);

  const [titleZh, setTitleZh] = useState('');
  const [titleEn, setTitleEn] = useState('');
  const [titleDe, setTitleDe] = useState('');
  const [contentZh, setContentZh] = useState('');
  const [contentEn, setContentEn] = useState('');
  const [contentDe, setContentDe] = useState('');
  const [image, setImage] = useState('');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [published, setPublished] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [uploading, setUploading] = useState(false);

  const t = (zh: string, en: string, de: string) =>
    locale === 'zh' ? zh : locale === 'de' ? de : en;

  // ---------- Image upload ----------
  async function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    const allowed = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];
    if (!allowed.includes(file.type)) {
      setError(t('仅支持 JPG/PNG/WebP/GIF', 'Only JPG, PNG, WebP & GIF', 'Nur JPG, PNG, WebP & GIF'));
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      setError(t('文件大小不能超过 5MB', 'File size must be under 5MB', 'Datei max. 5 MB'));
      return;
    }

    setUploading(true);
    setError('');
    try {
      const form = new FormData();
      form.append('file', file);
      const res = await fetch('/api/upload', {
        method: 'POST',
        credentials: 'include',
        body: form,
      });
      if (res.status === 401) { router.push(`/${locale}/admin/login`); return; }
      if (!res.ok) {
        const d = await res.json().catch(() => ({}));
        throw new Error(d.message || t('上传失败', 'Upload failed', 'Upload fehlgeschlagen'));
      }
      const data = await res.json();
      setImage(data.filename || data.url || '');
    } catch (e) {
      setError(e instanceof Error ? e.message : t('上传失败', 'Upload failed', 'Upload fehlgeschlagen'));
    } finally {
      setUploading(false);
      if (fileRef.current) fileRef.current.value = '';
    }
  }

  // ---------- Submit ----------
  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError('');

    if (!titleZh.trim() && !titleEn.trim() && !titleDe.trim()) {
      setError(t('请至少填写一个标题', 'Please fill in at least one title', 'Bitte mindestens einen Titel eingeben'));
      return;
    }

    const slug = generateSlug(titleZh, titleEn, titleDe);

    setSaving(true);
    try {
      const body = {
        slug,
        titleZh: titleZh.trim(),
        titleEn: titleEn.trim(),
        titleDe: titleDe.trim(),
        contentZh: contentZh.trim(),
        contentEn: contentEn.trim(),
        contentDe: contentDe.trim(),
        image: image || null,
        date: new Date(date).toISOString(),
        published,
      };

      const res = await fetch('/api/news', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(body),
      });

      if (res.status === 401) { router.push(`/${locale}/admin/login`); return; }

      const data = await res.json();
      if (!res.ok) throw new Error(data.message || data.error || t('创建失败', 'Create failed', 'Erstellung fehlgeschlagen'));

      router.push(`/${locale}/admin/news`);
    } catch (e) {
      setError(e instanceof Error ? e.message : t('创建失败', 'Create failed', 'Erstellung fehlgeschlagen'));
    } finally {
      setSaving(false);
    }
  }

  const labelClass = 'block text-sm font-medium text-gray-600 mb-1.5';
  const inputClass = 'w-full px-3.5 py-2.5 text-sm border border-gray-200 rounded-sm bg-white text-gray-800 placeholder-gray-300 outline-none transition-colors focus:border-[#c8a96e] focus:ring-2 focus:ring-[#c8a96e]/20 disabled:opacity-50';
  const textareaClass = 'w-full px-3.5 py-2.5 text-sm border border-gray-200 rounded-sm bg-white text-gray-800 placeholder-gray-300 outline-none transition-colors focus:border-[#c8a96e] focus:ring-2 focus:ring-[#c8a96e]/20 disabled:opacity-50 resize-y min-h-[120px]';
  const langTagClass = 'inline-flex items-center text-xs font-medium px-2 py-0.5 rounded-sm bg-gray-100 text-gray-500';

  return (<AdminLayout>
    <div className="min-h-screen bg-gray-50">
      {/* ========== TOP NAV ========== */}
      <header className="bg-white border-b border-gray-200">
        <div className="max-w-[1000px] mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link
              href={`/${locale}/admin/news`}
              className="text-sm text-gray-500 hover:text-[#1a3a5c] transition-colors"
            >
              <i className="fa-solid fa-chevron-left mr-1" />
              {t('返回', 'Back', 'Zuruck')}
            </Link>
            <span className="text-gray-300">|</span>
            <h1 className="text-lg font-semibold text-[#1a3a5c]">
              {t('新建新闻', 'New Article', 'Neuer Artikel')}
            </h1>
          </div>
        </div>
      </header>

      {/* ========== TOAST ========== */}
      {error && (
        <div className="fixed top-4 right-4 z-50 bg-red-600 text-white px-5 py-3 rounded-sm shadow-lg text-sm flex items-center gap-2 animate-fade-in">
          <i className="fa-solid fa-exclamation-circle" />
          {error}
          <button onClick={() => setError('')} className="ml-3 hover:text-white/70">
            <i className="fa-solid fa-times" />
          </button>
        </div>
      )}

      {/* ========== FORM ========== */}
      <div className="max-w-[1000px] mx-auto px-6 py-6">
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* ---------- Title ---------- */}
          <div className="bg-white border border-gray-200 rounded-sm p-6">
            <h2 className="text-base font-semibold text-[#1a3a5c] mb-4">
              {t('标题', 'Title', 'Titel')}
            </h2>
            <div className="space-y-4">
              <div>
                <label className={labelClass}>
                  <span className={langTagClass}>ZH</span> 中文标题
                </label>
                <input
                  type="text"
                  value={titleZh}
                  onChange={(e) => setTitleZh(e.target.value)}
                  placeholder={t('请输入中文标题', 'Chinese title', 'Chinesischer Titel')}
                  className={inputClass}
                  disabled={saving}
                />
              </div>
              <div>
                <label className={labelClass}>
                  <span className={langTagClass}>EN</span> English Title
                </label>
                <input
                  type="text"
                  value={titleEn}
                  onChange={(e) => setTitleEn(e.target.value)}
                  placeholder="English title"
                  className={inputClass}
                  disabled={saving}
                />
              </div>
              <div>
                <label className={labelClass}>
                  <span className={langTagClass}>DE</span> Deutscher Titel
                </label>
                <input
                  type="text"
                  value={titleDe}
                  onChange={(e) => setTitleDe(e.target.value)}
                  placeholder="Deutscher Titel"
                  className={inputClass}
                  disabled={saving}
                />
              </div>
            </div>
          </div>

          {/* ---------- Content ---------- */}
          <div className="bg-white border border-gray-200 rounded-sm p-6">
            <h2 className="text-base font-semibold text-[#1a3a5c] mb-4">
              {t('内容', 'Content', 'Inhalt')}
            </h2>
            <div className="space-y-4">
              <div>
                <label className={labelClass}>
                  <span className={langTagClass}>ZH</span> 中文内容
                </label>
                <textarea
                  value={contentZh}
                  onChange={(e) => setContentZh(e.target.value)}
                  placeholder={t('请输入中文内容', 'Chinese content', 'Chinesischer Inhalt')}
                  className={textareaClass}
                  rows={8}
                  disabled={saving}
                />
              </div>
              <div>
                <label className={labelClass}>
                  <span className={langTagClass}>EN</span> English Content
                </label>
                <textarea
                  value={contentEn}
                  onChange={(e) => setContentEn(e.target.value)}
                  placeholder="English content"
                  className={textareaClass}
                  rows={8}
                  disabled={saving}
                />
              </div>
              <div>
                <label className={labelClass}>
                  <span className={langTagClass}>DE</span> Deutscher Inhalt
                </label>
                <textarea
                  value={contentDe}
                  onChange={(e) => setContentDe(e.target.value)}
                  placeholder="Deutscher Inhalt"
                  className={textareaClass}
                  rows={8}
                  disabled={saving}
                />
              </div>
            </div>
          </div>

          {/* ---------- Image & Meta ---------- */}
          <div className="bg-white border border-gray-200 rounded-sm p-6">
            <h2 className="text-base font-semibold text-[#1a3a5c] mb-4">
              {t('图片与设置', 'Image & Settings', 'Bild & Einstellungen')}
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Image */}
              <div>
                <label className={labelClass}>
                  {t('封面图片', 'Cover Image', 'Titelbild')}
                </label>

                {/* Preview */}
                {image && (
                  <div className="mb-3 relative w-full h-40 rounded-sm overflow-hidden bg-gray-100 border border-gray-200">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={image.startsWith('http') ? image : `/uploads/${image}`}
                      alt="preview"
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        (e.currentTarget as HTMLImageElement).style.display = 'none';
                      }}
                    />
                    <button
                      type="button"
                      onClick={() => setImage('')}
                      className="absolute top-2 right-2 w-7 h-7 flex items-center justify-center rounded-full bg-black/50 text-white text-xs hover:bg-black/70 transition-colors"
                    >
                      <i className="fa-solid fa-times" />
                    </button>
                  </div>
                )}

                <div className="flex gap-2">
                  <input
                    type="file"
                    ref={fileRef}
                    accept="image/jpeg,image/png,image/webp,image/gif"
                    onChange={handleFileChange}
                    className="hidden"
                    disabled={saving || uploading}
                  />
                  <button
                    type="button"
                    onClick={() => fileRef.current?.click()}
                    disabled={saving || uploading}
                    className="px-4 py-2 text-sm border border-gray-200 rounded-sm text-gray-600 hover:border-[#c8a96e] hover:text-[#c8a96e] transition-colors disabled:opacity-50"
                  >
                    {uploading ? (
                      <><i className="fa-solid fa-spinner fa-spin mr-1.5" />{t('上传中...', 'Uploading...', 'Lade hoch...')}</>
                    ) : (
                      <><i className="fa-solid fa-upload mr-1.5" />{t('上传图片', 'Upload', 'Hochladen')}</>
                    )}
                  </button>
                  <input
                    type="text"
                    value={image}
                    onChange={(e) => setImage(e.target.value)}
                    placeholder={t('或输入图片 URL', 'Or enter image URL', 'Oder Bild-URL')}
                    className={inputClass}
                    disabled={saving || uploading}
                  />
                </div>
                <p className="mt-1.5 text-xs text-gray-400">
                  {t('支持 JPG/PNG/WebP/GIF, 最大 5MB', 'JPG/PNG/WebP/GIF, max 5MB', 'JPG/PNG/WebP/GIF, max. 5 MB')}
                </p>
              </div>

              <div className="space-y-5">
                {/* Date */}
                <div>
                  <label className={labelClass} htmlFor="news-date">
                    <i className="fa-regular fa-calendar mr-1.5 text-gray-400" />
                    {t('日期', 'Date', 'Datum')}
                  </label>
                  <input
                    id="news-date"
                    type="date"
                    value={date}
                    onChange={(e) => setDate(e.target.value)}
                    className={inputClass}
                    disabled={saving}
                  />
                </div>

                {/* Published toggle */}
                <div>
                  <label className="flex items-center gap-3 cursor-pointer">
                    <div className="relative">
                      <input
                        type="checkbox"
                        checked={published}
                        onChange={(e) => setPublished(e.target.checked)}
                        disabled={saving}
                        className="sr-only peer"
                      />
                      <div
                        className={`w-10 h-6 rounded-full transition-colors peer-disabled:opacity-50 ${
                          published ? 'bg-[#1a3a5c]' : 'bg-gray-300'
                        }`}
                      />
                      <div
                        className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow-sm transition-transform ${
                          published ? 'translate-x-4' : ''
                        }`}
                      />
                    </div>
                    <div>
                      <span className="text-sm font-medium text-gray-700">
                        {t('发布', 'Published', 'Veroffentlicht')}
                      </span>
                      <p className="text-xs text-gray-400">
                        {published
                          ? t('文章对外可见', 'Visible to visitors', 'Sichtbar fur Besucher')
                          : t('仅保存为草稿', 'Save as draft only', 'Nur als Entwurf speichern')}
                      </p>
                    </div>
                  </label>
                </div>
              </div>
            </div>
          </div>

          {/* ---------- Actions ---------- */}
          <div className="flex items-center justify-end gap-3 pb-8">
            <Link
              href={`/${locale}/admin/news`}
              className="px-5 py-2.5 text-sm border border-gray-200 rounded-sm text-gray-600 hover:border-gray-300 hover:text-gray-800 transition-colors"
            >
              {t('取消', 'Cancel', 'Abbrechen')}
            </Link>
            <button
              type="submit"
              disabled={saving || uploading}
              className="px-6 py-2.5 text-sm bg-[#1a3a5c] text-white rounded-sm font-medium hover:bg-[#0f2640] transition-colors disabled:opacity-50 disabled:cursor-not-allowed inline-flex items-center gap-2"
            >
              {saving ? (
                <><i className="fa-solid fa-spinner fa-spin" />{t('保存中...', 'Saving...', 'Speichern...')}</>
              ) : (
                <><i className="fa-solid fa-check" />{published ? t('发布', 'Publish', 'Veroffentlichen') : t('保存草稿', 'Save Draft', 'Entwurf speichern')}</>
              )}
            </button>
          </div>
        </form>
      </div>

    </div>
    </AdminLayout>
  );
}
