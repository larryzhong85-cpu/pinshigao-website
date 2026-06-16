'use client';

import { useState, useEffect, useCallback } from 'react';
import { useTranslations } from 'next-intl';
import { useRouter, usePathname } from 'next/navigation';
import AdminLayout from '@/components/AdminLayout';

interface InquiryItem {
  id: number;
  name: string;
  email: string;
  phone: string | null;
  message: string;
  read: boolean;
  createdAt: string;
}

export default function AdminInquiriesPage() {
  const t = useTranslations('admin');
  const pathname = usePathname();
  const router = useRouter();
  const locale = pathname?.split('/')[1] || 'zh';

  const [inquiries, setInquiries] = useState<InquiryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selected, setSelected] = useState<InquiryItem | null>(null);

  const fetchInquiries = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const res = await fetch('/api/inquiries', { credentials: 'include' });
      if (res.status === 401) { router.push(`/${locale}/admin/login`); return; }
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = await res.json();
      setInquiries(data?.items ?? (Array.isArray(data) ? data : []));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load');
    } finally {
      setLoading(false);
    }
  }, [router, locale]);

  useEffect(() => { fetchInquiries(); }, [fetchInquiries]);

  async function markRead(id: number) {
    try {
      await fetch('/api/inquiries', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ id, read: true }),
      });
      setInquiries(prev => prev.map(i => i.id === id ? { ...i, read: true } : i));
    } catch { /* ignore */ }
  }

  async function deleteInquiry(id: number) {
    if (!confirm(locale === 'zh' ? '确定删除？' : 'Delete?')) return;
    try {
      const res = await fetch(`/api/inquiries?id=${id}`, {
        method: 'DELETE',
        credentials: 'include',
      });
      if (!res.ok) throw new Error('Delete failed');
      setInquiries(prev => prev.filter(i => i.id !== id));
      if (selected?.id === id) setSelected(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Delete failed');
    }
  }

  function formatDate(iso: string) {
    const d = new Date(iso);
    return d.toLocaleString(locale === 'zh' ? 'zh-CN' : locale === 'de' ? 'de-DE' : 'en-US');
  }

  const unreadCount = inquiries.filter(i => !i.read).length;

  return (
    <AdminLayout>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-semibold text-[#1a3a5c]">
            {locale === 'zh' ? '询盘管理' : locale === 'de' ? 'Anfragen' : 'Inquiries'}
          </h1>
          <p className="text-sm text-gray-500 mt-1">
            {unreadCount > 0
              ? (locale === 'zh' ? `${unreadCount} 条未读` : `${unreadCount} unread`)
              : (locale === 'zh' ? '所有消息已读' : 'All messages read')}
          </p>
        </div>
      </div>

      {error && (
        <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-700 text-sm">{error}</div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* List */}
        <div className="lg:col-span-1 bg-white border border-gray-200 overflow-y-auto max-h-[70vh]">
          {loading ? (
            <div className="flex justify-center py-12">
              <i className="fa-solid fa-spinner fa-spin text-gray-400 text-xl" />
            </div>
          ) : inquiries.length === 0 ? (
            <div className="text-center py-12 text-gray-400 text-sm">
              {locale === 'zh' ? '暂无询盘' : locale === 'de' ? 'Keine Anfragen' : 'No inquiries'}
            </div>
          ) : (
            <div className="divide-y divide-gray-100">
              {inquiries.map((inq) => (
                <button
                  key={inq.id}
                  onClick={() => { setSelected(inq); if (!inq.read) markRead(inq.id); }}
                  className={`w-full text-left px-4 py-4 hover:bg-gray-50 transition-colors ${
                    selected?.id === inq.id ? 'bg-blue-50 border-l-2 border-l-[#1a3a5c]' : ''
                  } ${!inq.read ? 'bg-amber-50/50' : ''}`}
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0 flex-1">
                      <p className={`text-sm truncate ${!inq.read ? 'font-semibold text-[#1a3a5c]' : 'text-gray-700'}`}>
                        {inq.name}
                      </p>
                      <p className="text-xs text-gray-400 truncate mt-0.5">{inq.email}</p>
                    </div>
                    {!inq.read && (
                      <span className="w-2 h-2 bg-[#c8a96e] rounded-full shrink-0 mt-1.5" />
                    )}
                  </div>
                  <p className="text-xs text-gray-400 mt-2 line-clamp-2">{inq.message}</p>
                  <p className="text-[10px] text-gray-300 mt-1.5">{formatDate(inq.createdAt)}</p>
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Detail */}
        <div className="lg:col-span-2 bg-white border border-gray-200 p-6">
          {selected ? (
            <div>
              <div className="flex items-start justify-between mb-6">
                <div>
                  <h2 className="text-lg font-semibold text-[#1a3a5c]">{selected.name}</h2>
                  <p className="text-sm text-gray-500 mt-1">{selected.email}</p>
                  {selected.phone && (
                    <p className="text-sm text-gray-500">{selected.phone}</p>
                  )}
                  <p className="text-xs text-gray-400 mt-2">{formatDate(selected.createdAt)}</p>
                </div>
                <button
                  onClick={() => deleteInquiry(selected.id)}
                  className="px-3 py-1.5 text-xs text-red-600 border border-red-200 hover:bg-red-50 transition-colors"
                >
                  <i className="fa-solid fa-trash-can mr-1" />
                  {t('delete')}
                </button>
              </div>
              <div className="border-t border-gray-100 pt-4">
                <p className="text-sm text-gray-700 whitespace-pre-wrap leading-relaxed">{selected.message}</p>
              </div>
              <div className="mt-6 pt-4 border-t border-gray-100">
                <p className="text-xs text-gray-400">
                  <span className="inline-flex items-center gap-1">
                    <span className={`w-2 h-2 rounded-full ${selected.read ? 'bg-green-500' : 'bg-amber-400'}`} />
                    {selected.read
                      ? (locale === 'zh' ? '已读' : 'Read')
                      : (locale === 'zh' ? '未读' : 'Unread')}
                  </span>
                </p>
              </div>
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-20 text-gray-400">
              <i className="fa-solid fa-envelope-open-text text-4xl mb-4 text-gray-200" />
              <p className="text-sm">
                {locale === 'zh' ? '选择一条询盘查看详情' : locale === 'de' ? 'Anfrage auswählen' : 'Select an inquiry to view'}
              </p>
            </div>
          )}
        </div>
      </div>
    </AdminLayout>
  );
}
