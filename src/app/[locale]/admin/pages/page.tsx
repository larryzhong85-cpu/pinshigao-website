'use client';

import { useState, useEffect, useMemo, useCallback } from 'react';
import { useTranslations } from 'next-intl';
import { usePathname } from 'next/navigation';
import dynamic from 'next/dynamic';
import AdminLayout from '@/components/AdminLayout';

const ReactQuill = dynamic(() => import('react-quill-new'), { ssr: false });
import 'react-quill-new/dist/quill.snow.css';

interface PageEntry {
  id: number;
  slug: string;
  titleZh: string;
  titleEn: string;
  titleDe: string;
  contentZh: string;
  contentEn: string;
  contentDe: string;
  published: boolean;
}

const emptyPage = (): PageEntry => ({
  id: 0, slug: '', titleZh: '', titleEn: '', titleDe: '',
  contentZh: '', contentEn: '', contentDe: '', published: true,
});

export default function AdminPages() {
  const t = useTranslations('admin');
  const pathname = usePathname();
  const locale = pathname?.split('/')[1] || 'zh';

  const [pages, setPages] = useState<PageEntry[]>([]);
  const [editing, setEditing] = useState<PageEntry | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [translating, setTranslating] = useState(false);

  const fetchPages = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/pages');
      const data = await res.json();
      setPages(Array.isArray(data) ? data : []);
    } catch { setPages([]); }
    finally { setLoading(false); }
  }, []);

  useEffect(() => { fetchPages(); }, [fetchPages]);

  const handleEdit = (page: PageEntry) => { setEditing({ ...page }); setError(''); };
  const handleNew = () => { setEditing(emptyPage()); setError(''); };
  const handleCancel = () => { setEditing(null); setError(''); };

  const handleSave = async () => {
    if (!editing) return;
    if (!editing.slug.trim()) { setError('Slug is required.'); return; }
    setSaving(true); setError('');
    try {
      const isNew = editing.id === 0;
      const res = await fetch('/api/pages', {
        method: isNew ? 'POST' : 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(editing),
      });
      if (!res.ok) {
        const errData = await res.json().catch(() => ({}));
        throw new Error(errData.error || 'Failed to save page');
      }
      await fetchPages();
      setEditing(null);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Failed to save page');
    } finally { setSaving(false); }
  };

  const handleDelete = async (page: PageEntry) => {
    if (!confirm(`${t('confirmDelete') || 'Delete'} "${page.slug}"?`)) return;
    try {
      const res = await fetch(`/api/pages?id=${page.id}`, { method: 'DELETE' });
      if (!res.ok) throw new Error('Delete failed');
      await fetchPages();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Delete failed');
    }
  };

  // ---- Auto-translate ----
  const autoTranslate = async (field: 'title' | 'content') => {
    if (!editing || !editing.titleZh.trim()) return;
    setTranslating(true);
    try {
      // For content, strip HTML tags for translation, then re-wrap
      const sourceText = field === 'title' ? editing.titleZh : editing.contentZh;
      if (!sourceText.trim()) { setTranslating(false); return; }

      const res = await fetch('/api/translate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          text: sourceText,
          source: 'zh-CN',
          targets: ['en', 'de'],
        }),
      });
      if (!res.ok) return;
      const data = await res.json();
      const updates: Partial<PageEntry> = {};
      if (field === 'title') {
        if (data.en && !editing.titleEn) updates.titleEn = data.en;
        if (data.de && !editing.titleDe) updates.titleDe = data.de;
      } else {
        if (data.en && !editing.contentEn) updates.contentEn = data.en;
        if (data.de && !editing.contentDe) updates.contentDe = data.de;
      }
      if (Object.keys(updates).length > 0) {
        setEditing({ ...editing, ...updates });
      }
    } catch { /* ignore */ }
    finally { setTranslating(false); }
  };

  const inputClass = 'w-full border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#c8a96e] focus:border-[#c8a96e]';
  const labelClass = 'block text-sm font-medium text-gray-700 mb-1';
  const sectionTitle = 'text-base font-semibold text-[#1a3a5c] mt-6 mb-3 pb-2 border-b border-gray-200';
  const btnClass = 'px-3 py-1.5 text-xs border border-gray-300 text-gray-600 hover:bg-gray-50 transition-colors inline-flex items-center gap-1';

  const quillModules = useMemo(() => ({
    toolbar: [
      [{ header: [1, 2, 3, 4, 5, 6, false] }],
      ['bold', 'italic', 'underline', 'strike'],
      [{ color: [] }, { background: [] }],
      [{ list: 'ordered' }, { list: 'bullet' }, { indent: '-1' }, { indent: '+1' }],
      ['blockquote', 'code-block'],
      [{ align: [] }],
      ['link', 'image'],
      [{ script: 'sub' }, { script: 'super' }],
      ['clean'],
    ],
  }), []);

  // ---- Edit Mode ----
  if (editing) {
    return (
      <AdminLayout>
        <div className="max-w-4xl mx-auto">
          <div className="flex items-center justify-between mb-6">
            <h1 className="text-2xl font-bold text-[#1a3a5c]">
              {editing.id === 0 ? t('newPage') : `${t('editPage')}: ${editing.slug}`}
            </h1>
            <button type="button" onClick={handleCancel}
              className="text-sm text-gray-500 hover:text-gray-700 transition-colors">
              &larr; {t('backToList')}
            </button>
          </div>

          {error && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-700 text-sm">{error}</div>
          )}

          <div className="space-y-4 bg-white border border-gray-200 p-6">
            {/* Slug */}
            <div>
              <label className={labelClass}>{t('pageSlug')} <span className="text-red-500">*</span></label>
              <input className={inputClass} value={editing.slug}
                onChange={(e) => setEditing({ ...editing, slug: e.target.value.replace(/\s+/g, '-').toLowerCase() })}
                placeholder="about-us" />
              <p className="text-xs text-gray-400 mt-1">{t('slugHint')}</p>
            </div>

            {/* Titles with auto-translate */}
            <div>
              <div className="flex items-center justify-between mb-3">
                <h2 className={sectionTitle} style={{ margin: 0, border: 'none', padding: 0 }}>
                  {t('titles') || 'Titles'}
                </h2>
                <button type="button" onClick={() => autoTranslate('title')} disabled={translating || !editing.titleZh}
                  className={btnClass}>
                  {translating ? <><i className="fa-solid fa-spinner fa-spin" /> {t('translating')}</>
                    : <><i className="fa-solid fa-language" /> {t('translate')}</>}
                </button>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className={labelClass}>{t('titleZh')}</label>
                  <input className={inputClass} value={editing.titleZh}
                    onChange={(e) => setEditing({ ...editing, titleZh: e.target.value })} />
                </div>
                <div>
                  <label className={labelClass}>{t('titleEn')}</label>
                  <input className={inputClass} value={editing.titleEn}
                    onChange={(e) => setEditing({ ...editing, titleEn: e.target.value })} />
                </div>
                <div>
                  <label className={labelClass}>{t('titleDe')}</label>
                  <input className={inputClass} value={editing.titleDe}
                    onChange={(e) => setEditing({ ...editing, titleDe: e.target.value })} />
                </div>
              </div>
            </div>

            {/* Content with auto-translate */}
            <div>
              <div className="flex items-center justify-between mb-3">
                <h2 className={sectionTitle} style={{ margin: 0, border: 'none', padding: 0 }}>
                  {t('content') || 'Content'}
                </h2>
                <button type="button" onClick={() => autoTranslate('content')} disabled={translating || !editing.contentZh}
                  className={btnClass}>
                  {translating ? <><i className="fa-solid fa-spinner fa-spin" /> {t('translating')}</>
                    : <><i className="fa-solid fa-language" /> {t('translate')}</>}
                </button>
              </div>

              <div className="mb-4">
                <label className={labelClass}>{t('contentZh')}</label>
                {typeof window !== 'undefined' && (
                  <div className="border border-gray-300 rounded-sm overflow-hidden quill-editor-wrapper">
                    <ReactQuill value={editing.contentZh}
                      onChange={(val: string) => setEditing({ ...editing, contentZh: val })}
                      modules={quillModules} theme="snow" placeholder={t('inputContentZh')} />
                  </div>
                )}
              </div>
              <div className="mb-4">
                <label className={labelClass}>{t('contentEn')}</label>
                {typeof window !== 'undefined' && (
                  <div className="border border-gray-300 rounded-sm overflow-hidden quill-editor-wrapper">
                    <ReactQuill value={editing.contentEn}
                      onChange={(val: string) => setEditing({ ...editing, contentEn: val })}
                      modules={quillModules} theme="snow" placeholder={t('inputContentEn')} />
                  </div>
                )}
              </div>
              <div className="mb-4">
                <label className={labelClass}>{t('contentDe')}</label>
                {typeof window !== 'undefined' && (
                  <div className="border border-gray-300 rounded-sm overflow-hidden quill-editor-wrapper">
                    <ReactQuill value={editing.contentDe}
                      onChange={(val: string) => setEditing({ ...editing, contentDe: val })}
                      modules={quillModules} theme="snow" placeholder={t('inputContentDe')} />
                  </div>
                )}
              </div>
            </div>

            {/* Published toggle */}
            <div>
              <h2 className={sectionTitle}>{t('settings') || 'Settings'}</h2>
              <label className="flex items-center gap-2 cursor-pointer">
                <input type="checkbox" checked={editing.published}
                  onChange={(e) => setEditing({ ...editing, published: e.target.checked })}
                  className="w-4 h-4 rounded border-gray-300 text-[#c8a96e] focus:ring-[#c8a96e]" />
                <span className="text-sm font-medium text-gray-700">{t('published')}</span>
              </label>
            </div>

            {/* Actions */}
            <div className="pt-4 border-t border-gray-200 flex gap-3">
              <button type="button" onClick={handleSave} disabled={saving}
                className="px-6 py-2.5 bg-[#1a3a5c] text-white text-sm font-medium hover:bg-[#2a5a8c] transition-colors disabled:opacity-50 disabled:cursor-not-allowed inline-flex items-center gap-2">
                {saving && <i className="fa-solid fa-spinner fa-spin" />}
                {saving ? t('saving') : t('savePage')}
              </button>
              <button type="button" onClick={handleCancel}
                className="px-6 py-2.5 bg-gray-100 text-gray-700 text-sm font-medium hover:bg-gray-200 transition-colors">
                {t('cancel')}
              </button>
            </div>
          </div>
        </div>
      </AdminLayout>
    );
  }

  // ---- List View ----
  return (
    <AdminLayout>
      <div className="max-w-5xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold text-[#1a3a5c]">{t('managePages')}</h1>
            <p className="text-sm text-gray-500 mt-1">{t('managePagesDesc')}</p>
          </div>
          <button type="button" onClick={handleNew}
            className="px-4 py-2 bg-[#1a3a5c] text-white text-sm font-medium hover:bg-[#2a5a8c] transition-colors flex items-center gap-2">
            <i className="fa-solid fa-plus" /> {t('newPage')}
          </button>
        </div>

        {error && <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-700 text-sm">{error}</div>}

        {loading ? (
          <div className="flex justify-center py-12">
            <div className="w-8 h-8 border-2 border-[#1a3a5c] border-t-transparent rounded-full animate-spin" />
          </div>
        ) : pages.length === 0 ? (
          <div className="bg-white border border-gray-200 p-12 text-center">
            <i className="fa-solid fa-file-lines text-4xl text-gray-300 mb-3" />
            <p className="text-gray-500 text-sm">{t('noPages')}</p>
          </div>
        ) : (
          <div className="bg-white border border-gray-200 divide-y divide-gray-100">
            {pages.map((page) => (
              <div key={page.id} className="flex items-center justify-between p-4 hover:bg-gray-50 transition-colors">
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-3">
                    <h3 className="text-sm font-semibold text-[#1a3a5c] truncate">
                      {page.titleEn || page.titleZh || page.slug}
                    </h3>
                    <span className={`inline-block px-2 py-0.5 text-xs font-medium rounded ${
                      page.published ? 'bg-green-50 text-green-700' : 'bg-gray-100 text-gray-500'
                    }`}>
                      {page.published ? t('published') : t('draft')}
                    </span>
                  </div>
                  <p className="text-xs text-gray-400 mt-0.5">/{locale}/pages/{page.slug}</p>
                </div>
                <div className="flex items-center gap-2 shrink-0 ml-4">
                  <button type="button" onClick={() => handleEdit(page)}
                    className="px-3 py-1.5 text-xs font-medium text-[#1a3a5c] border border-gray-300 hover:bg-gray-50 transition-colors">
                    {t('edit')}
                  </button>
                  <button type="button" onClick={() => handleDelete(page)}
                    className="px-3 py-1.5 text-xs font-medium text-red-600 border border-gray-300 hover:bg-red-50 transition-colors">
                    {t('delete')}
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </AdminLayout>
  );
}
