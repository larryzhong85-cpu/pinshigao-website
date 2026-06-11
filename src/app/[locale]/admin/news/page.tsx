'use client';
import AdminLayout from '@/components/AdminLayout';

import { useState, useEffect, useCallback } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import Link from 'next/link';

// ---------- Types ----------
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
  createdAt: string;
  updatedAt: string;
}

interface NewsListResponse {
  articles: NewsArticle[];
  total: number;
}

// ---------- Helpers ----------
function getLocale(pathname: string): string {
  return pathname.split('/')[1] || 'zh';
}

function formatDate(iso: string): string {
  if (!iso) return '--';
  const d = new Date(iso);
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}.${m}.${day}`;
}

function fallbackImg(name: string): string {
  return `data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='120' height='80' viewBox='0 0 120 80'%3E%3Crect fill='%23e8e8e8' width='120' height='80'/%3E%3Ctext x='60' y='44' font-family='sans-serif' font-size='10' fill='%23999' text-anchor='middle'%3E${encodeURIComponent(name)}%3C/text%3E%3C/svg%3E`;
}

// ---------- Component ----------
export default function AdminNewsPage() {
  const router = useRouter();
  const pathname = usePathname();
  const locale = getLocale(pathname);

  const [articles, setArticles] = useState<NewsArticle[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [search, setSearch] = useState('');
  const [showPublished, setShowPublished] = useState<boolean | null>(null);
  const [deletingId, setDeletingId] = useState<number | null>(null);
  const [confirmDelete, setConfirmDelete] = useState<number | null>(null);
  const [successMsg, setSuccessMsg] = useState('');

  // ---------- Fetch news ----------
  const fetchNews = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const params = new URLSearchParams();
      if (search) params.set('search', search);
      if (showPublished !== null) params.set('published', String(showPublished));

      const res = await fetch(`/api/news?${params.toString()}`, {
        credentials: 'include',
      });
      if (res.status === 401) {
        router.push(`/${locale}/admin/login`);
        return;
      }
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.message || 'Failed to fetch news');
      }
      const data: NewsListResponse = await res.json();
      setArticles(data.articles);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Unknown error');
    } finally {
      setLoading(false);
    }
  }, [router, locale]); // stable deps

  useEffect(() => {
    fetchNews();
  }, []); // only on mount

  // ---------- Toggle published ----------
  async function togglePublished(article: NewsArticle) {
    try {
      const res = await fetch(`/api/news/${article.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ published: !article.published }),
      });
      if (res.status === 401) {
        router.push(`/${locale}/admin/login`);
        return;
      }
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.message || 'Toggle failed');
      }
      setArticles((prev) =>
        prev.map((a) => (a.id === article.id ? { ...a, published: !a.published } : a)),
      );
      setSuccessMsg(
        article.published
          ? (locale === 'zh' ? '已取消发布' : locale === 'de' ? 'Veröffentlichung zurückgezogen' : 'Unpublished')
          : (locale === 'zh' ? '已发布' : locale === 'de' ? 'Veröffentlicht' : 'Published'),
      );
      setTimeout(() => setSuccessMsg(''), 3000);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Toggle failed');
    }
  }

  // ---------- Delete ----------
  async function deleteArticle(id: number) {
    setDeletingId(id);
    try {
      const res = await fetch(`/api/news/${id}`, {
        method: 'DELETE',
        credentials: 'include',
      });
      if (res.status === 401) {
        router.push(`/${locale}/admin/login`);
        return;
      }
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.message || 'Delete failed');
      }
      setArticles((prev) => prev.filter((a) => a.id !== id));
      setSuccessMsg(
        locale === 'zh' ? '已删除' : locale === 'de' ? 'Gelöscht' : 'Deleted',
      );
      setTimeout(() => setSuccessMsg(''), 3000);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Delete failed');
    } finally {
      setDeletingId(null);
      setConfirmDelete(null);
    }
  }

  // ---------- Derived ----------
  const filteredArticles = articles.filter((a) => {
    if (showPublished !== null && a.published !== showPublished) return false;
    if (search) {
      const q = search.toLowerCase();
      const matches =
        a.titleZh.toLowerCase().includes(q) ||
        a.titleEn.toLowerCase().includes(q) ||
        a.titleDe.toLowerCase().includes(q) ||
        a.slug.toLowerCase().includes(q);
      return matches;
    }
    return true;
  });

  return (<AdminLayout>
    <div className="min-h-screen bg-gray-50">
      {/* ========== TOP NAV ========== */}
      <header className="bg-white border-b border-[var(--color-border)]">
        <div className="max-w-[1400px] mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link
              href={`/${locale}/admin`}
              className="text-sm text-[var(--color-text-secondary)] hover:text-[--color-primary] transition-colors"
            >
              <i className="fa-solid fa-chevron-left mr-1" />
              {locale === 'zh' ? '返回' : locale === 'de' ? 'Zurück' : 'Back'}
            </Link>
            <span className="text-[var(--color-border)]">|</span>
            <h1 className="text-lg font-semibold text-[--color-primary]">
              {locale === 'zh' ? '新闻管理' : locale === 'de' ? 'Nachrichtenverwaltung' : 'News Management'}
            </h1>
          </div>

          <Link
            href={`/${locale}/admin/news/new`}
            className="inline-flex items-center gap-2 px-4 py-2 bg-[#1a3a5c] text-white text-sm rounded-sm
              hover:bg-[#0f2640] transition-colors"
          >
            <i className="fa-solid fa-plus" />
            {locale === 'zh' ? '添加新闻' : locale === 'de' ? 'Neu hinzufügen' : 'Add News'}
          </Link>
        </div>
      </header>

      {/* ========== TOAST MESSAGES ========== */}
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

      {/* ========== CONTENT ========== */}
      <div className="max-w-[1400px] mx-auto px-6 py-6">
        {/* ---------- Filters ---------- */}
        <div className="bg-white border border-[var(--color-border)] rounded-sm p-4 mb-6">
          <div className="flex flex-wrap items-center gap-4">
            {/* Search */}
            <div className="relative flex-1 min-w-[200px] max-w-md">
              <i className="fa-solid fa-search absolute left-3 top-1/2 -translate-y-1/2 text-[var(--color-text-light)] text-sm" />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder={locale === 'zh' ? '搜索标题或别名...' : locale === 'de' ? 'Titel oder Slug suchen...' : 'Search title or slug...'}
                className="w-full pl-9 pr-4 py-2 text-sm border border-[var(--color-border)] rounded-sm
                  focus:outline-none focus:border-[#c8a96e] focus:ring-1 focus:ring-[#c8a96e]/30 transition-colors"
              />
              {search && (
                <button onClick={() => setSearch('')} className="absolute right-3 top-1/2 -translate-y-1/2 text-[var(--color-text-light)] hover:text-[var(--color-text)]">
                  <i className="fa-solid fa-times" />
                </button>
              )}
            </div>

            {/* Status filter */}
            <div className="flex items-center gap-2">
              <span className="text-xs text-[var(--color-text-secondary)] whitespace-nowrap">
                {locale === 'zh' ? '状态' : locale === 'de' ? 'Status' : 'Status'}:
              </span>
              <select
                value={showPublished === null ? 'all' : showPublished ? 'published' : 'draft'}
                onChange={(e) => {
                  const v = e.target.value;
                  setShowPublished(v === 'all' ? null : v === 'published');
                }}
                className="text-sm border border-[var(--color-border)] rounded-sm px-3 py-2
                  focus:outline-none focus:border-[#c8a96e] transition-colors"
              >
                <option value="all">
                  {locale === 'zh' ? '全部' : locale === 'de' ? 'Alle' : 'All'}
                </option>
                <option value="published">
                  {locale === 'zh' ? '已发布' : locale === 'de' ? 'Veröffentlicht' : 'Published'}
                </option>
                <option value="draft">
                  {locale === 'zh' ? '草稿' : locale === 'de' ? 'Entwurf' : 'Draft'}
                </option>
              </select>
            </div>

            {/* Count */}
            <div className="ml-auto text-xs text-[var(--color-text-light)] whitespace-nowrap">
              {locale === 'zh'
                ? `共 ${filteredArticles.length} 条`
                : locale === 'de'
                  ? `${filteredArticles.length} Einträge`
                  : `${filteredArticles.length} articles`}
              {filteredArticles.length !== articles.length && (
                <span className="ml-1">
                  ({locale === 'zh' ? '筛选自' : locale === 'de' ? 'von' : 'of'} {articles.length})
                </span>
              )}
            </div>
          </div>
        </div>

        {/* ---------- Table ---------- */}
        <div className="bg-white border border-[var(--color-border)] rounded-sm overflow-hidden">
          {loading ? (
            <div className="flex items-center justify-center py-20">
              <div className="flex items-center gap-3 text-[var(--color-text-secondary)]">
                <i className="fa-solid fa-spinner fa-spin text-lg" />
                <span className="text-sm">
                  {locale === 'zh' ? '加载中...' : locale === 'de' ? 'Lädt...' : 'Loading...'}
                </span>
              </div>
            </div>
          ) : filteredArticles.length === 0 ? (
            <div className="text-center py-20">
              <i className="fa-regular fa-newspaper text-5xl text-gray-200 mb-4" />
              <p className="text-[var(--color-text-secondary)] text-sm">
                {search || showPublished !== null
                  ? (locale === 'zh' ? '没有匹配的新闻' : locale === 'de' ? 'Keine passenden Nachrichten' : 'No matching articles')
                  : (locale === 'zh' ? '还没有新闻文章' : locale === 'de' ? 'Noch keine Nachrichten' : 'No news articles yet')}
              </p>
              {!search && showPublished === null && (
                <Link
                  href={`/${locale}/admin/news/new`}
                  className="inline-flex items-center gap-1 mt-3 text-sm text-[#c8a96e] hover:text-[#a8894e] transition-colors"
                >
                  <i className="fa-solid fa-plus-circle" />
                  {locale === 'zh' ? '创建第一篇' : locale === 'de' ? 'Ersten erstellen' : 'Create the first one'}
                </Link>
              )}
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-gray-50 border-b border-[var(--color-border)]">
                    <th className="text-left px-4 py-3 font-medium text-[var(--color-text-secondary)] text-xs uppercase tracking-wider">
                      {locale === 'zh' ? '图片' : locale === 'de' ? 'Bild' : 'Image'}
                    </th>
                    <th className="text-left px-4 py-3 font-medium text-[var(--color-text-secondary)] text-xs uppercase tracking-wider">
                      {locale === 'zh' ? '标题' : locale === 'de' ? 'Titel' : 'Title'}
                    </th>
                    <th className="text-left px-4 py-3 font-medium text-[var(--color-text-secondary)] text-xs uppercase tracking-wider hidden md:table-cell">
                      Slug
                    </th>
                    <th className="text-left px-4 py-3 font-medium text-[var(--color-text-secondary)] text-xs uppercase tracking-wider hidden lg:table-cell">
                      {locale === 'zh' ? '日期' : locale === 'de' ? 'Datum' : 'Date'}
                    </th>
                    <th className="text-center px-4 py-3 font-medium text-[var(--color-text-secondary)] text-xs uppercase tracking-wider">
                      {locale === 'zh' ? '状态' : locale === 'de' ? 'Status' : 'Status'}
                    </th>
                    <th className="text-right px-4 py-3 font-medium text-[var(--color-text-secondary)] text-xs uppercase tracking-wider">
                      {locale === 'zh' ? '操作' : locale === 'de' ? 'Aktionen' : 'Actions'}
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[var(--color-border)]">
                  {filteredArticles.map((article) => {
                    const displayTitle =
                      article[`title${locale.charAt(0).toUpperCase() + locale.slice(1)}` as keyof NewsArticle] ||
                      article.titleEn;

                    return (
                      <tr
                        key={article.id}
                        className="group hover:bg-gray-50/50 transition-colors"
                      >
                        {/* Image */}
                        <td className="px-4 py-3">
                          <div className="w-16 h-11 rounded-sm overflow-hidden bg-gray-100">
                            <img
                              src={article.image || fallbackImg(article.slug)}
                              alt={String(displayTitle)}
                              className="w-full h-full object-cover"
                              onError={(e) => {
                                (e.currentTarget as HTMLImageElement).src = fallbackImg(article.slug);
                              }}
                            />
                          </div>
                        </td>

                        {/* Title */}
                        <td className="px-4 py-3">
                          <div className="max-w-[260px]">
                            <p className="font-medium text-[var(--color-text)] truncate">
                              {String(displayTitle)}
                            </p>
                            <p className="text-xs text-[var(--color-text-light)] mt-0.5 truncate">
                              {article.titleEn}
                            </p>
                          </div>
                        </td>

                        {/* Slug */}
                        <td className="px-4 py-3 text-xs text-[var(--color-text-secondary)] hidden md:table-cell">
                          <code className="bg-gray-100 px-1.5 py-0.5 rounded-sm">
                            /{article.slug}
                          </code>
                        </td>

                        {/* Date */}
                        <td className="px-4 py-3 text-[var(--color-text-secondary)] hidden lg:table-cell text-xs whitespace-nowrap">
                          {formatDate(article.date)}
                        </td>

                        {/* Published status */}
                        <td className="px-4 py-3 text-center">
                          <button
                            onClick={() => togglePublished(article)}
                            className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium transition-colors
                              ${article.published
                                ? 'bg-green-50 text-green-700 hover:bg-green-100'
                                : 'bg-gray-100 text-gray-500 hover:bg-gray-200'
                              }`}
                            title={article.published
                              ? (locale === 'zh' ? '点击取消发布' : locale === 'de' ? 'Veröffentlichung zurückziehen' : 'Click to unpublish')
                              : (locale === 'zh' ? '点击发布' : locale === 'de' ? 'Veröffentlichen' : 'Click to publish')
                            }
                          >
                            <span className={`w-1.5 h-1.5 rounded-full ${article.published ? 'bg-green-500' : 'bg-gray-400'}`} />
                            {article.published
                              ? (locale === 'zh' ? '已发布' : locale === 'de' ? 'Online' : 'Published')
                              : (locale === 'zh' ? '草稿' : locale === 'de' ? 'Entwurf' : 'Draft')}
                          </button>
                        </td>

                        {/* Actions */}
                        <td className="px-4 py-3 text-right">
                          <div className="flex items-center justify-end gap-1">
                            <Link
                              href={`/${locale}/admin/news/edit/${article.id}`}
                              className="inline-flex items-center gap-1 px-3 py-1.5 text-xs rounded-sm text-[var(--color-text-secondary)]
                                hover:text-[#1a3a5c] hover:bg-blue-50 transition-colors"
                            >
                              <i className="fa-solid fa-pen" />
                              <span className="hidden sm:inline">
                                {locale === 'zh' ? '编辑' : locale === 'de' ? 'Bearbeiten' : 'Edit'}
                              </span>
                            </Link>

                            {confirmDelete === article.id ? (
                              <div className="flex items-center gap-1">
                                <span className="text-xs text-red-600 mr-1">
                                  {locale === 'zh' ? '确认?' : locale === 'de' ? 'Bestätigen?' : 'Confirm?'}
                                </span>
                                <button
                                  onClick={() => deleteArticle(article.id)}
                                  disabled={deletingId === article.id}
                                  className="inline-flex items-center gap-1 px-2.5 py-1.5 text-xs rounded-sm bg-red-600 text-white
                                    hover:bg-red-700 transition-colors disabled:opacity-50"
                                >
                                  {deletingId === article.id ? (
                                    <i className="fa-solid fa-spinner fa-spin" />
                                  ) : (
                                    <i className="fa-solid fa-check" />
                                  )}
                                </button>
                                <button
                                  onClick={() => setConfirmDelete(null)}
                                  className="inline-flex items-center gap-1 px-2.5 py-1.5 text-xs rounded-sm border border-[var(--color-border)]
                                    text-[var(--color-text-secondary)] hover:bg-gray-100 transition-colors"
                                >
                                  <i className="fa-solid fa-times" />
                                </button>
                              </div>
                            ) : (
                              <button
                                onClick={() => setConfirmDelete(article.id)}
                                className="inline-flex items-center gap-1 px-3 py-1.5 text-xs rounded-sm text-[var(--color-text-secondary)]
                                  hover:text-red-600 hover:bg-red-50 transition-colors"
                              >
                                <i className="fa-solid fa-trash" />
                                <span className="hidden sm:inline">
                                  {locale === 'zh' ? '删除' : locale === 'de' ? 'Löschen' : 'Delete'}
                                </span>
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

    </div>
    </AdminLayout>
  );
}
