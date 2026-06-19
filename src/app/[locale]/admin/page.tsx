'use client';

import { useState, useEffect } from 'react';
import { useTranslations } from 'next-intl';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import AdminLayout from '@/components/AdminLayout';

interface DashboardStats {
  products: number;
  news: number;
  categories: number;
  inquiries: number;
}

export default function AdminDashboard() {
  const t = useTranslations('admin');
  const pathname = usePathname();
  const locale = pathname?.split('/')[1] || 'zh';

  const [stats, setStats] = useState<DashboardStats>({ products: 0, news: 0, categories: 0, inquiries: 0 });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadStats() {
      try {
        const [prodRes, newsRes, catRes, inqRes] = await Promise.all([
          fetch('/api/products?pageSize=1'),
          fetch('/api/news?limit=1'),
          fetch('/api/categories'),
          fetch('/api/inquiries', { credentials: 'include' }),
        ]);

        const prodData = await prodRes.json();
        const newsData = await newsRes.json();
        const catData = await catRes.json();
        const inqData = await inqRes.json().catch(() => ({ items: [] }));

        setStats({
          products: prodData?.pagination?.total ?? (Array.isArray(prodData) ? prodData.length : 0),
          news: newsData?.pagination?.total ?? (Array.isArray(newsData) ? newsData.length : 0),
          categories: Array.isArray(catData) ? catData.length : 0,
          inquiries: inqData?.items?.length ?? (Array.isArray(inqData) ? inqData.length : 0),
        });
      } catch {
        // silent
      } finally {
        setLoading(false);
      }
    }
    loadStats();
  }, []);

  const statCards = [
    { label: t('statsProductLabel') ?? 'Products', value: String(stats.products), icon: 'fa-box' },
    { label: t('statsNewsLabel') ?? 'News', value: String(stats.news), icon: 'fa-newspaper' },
    { label: t('manageCategories') ?? 'Categories', value: String(stats.categories), icon: 'fa-tags' },
    { label: t('manageInquiries') ?? 'Inquiries', value: String(stats.inquiries), icon: 'fa-envelope' },
  ];

  const quickActions = [
    { label: t('addProduct') ?? 'Add Product', href: `/${locale}/admin/products/new`, icon: 'fa-plus-circle' },
    { label: t('addNews') ?? 'Add News', href: `/${locale}/admin/news/new`, icon: 'fa-plus-circle' },
    { label: t('manageMedia') ?? 'Manage Media', href: `/${locale}/admin/media`, icon: 'fa-images' },
    { label: t('managePages') ?? 'Manage Pages', href: `/${locale}/admin/pages`, icon: 'fa-file-alt' },
    { label: t('siteSettings') ?? 'Site Settings', href: `/${locale}/admin/settings`, icon: 'fa-cog' },
    { label: t('viewSite') ?? 'View Site', href: `/${locale}`, icon: 'fa-external-link-alt' },
  ];

  return (
    <AdminLayout>
      {/* Welcome Header */}
      <div className="mb-8">
        <h1 className="text-2xl font-semibold text-[#1a3a5c]">
          {t('welcome') ?? 'Dashboard'}
        </h1>
        <p className="text-gray-500 mt-1 text-sm">
          {t('welcomeMessage') ?? 'Welcome back, Admin. Here is an overview of your site.'}
        </p>
      </div>

      {/* Quick Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 mb-8">
        {loading
          ? statCards.map((stat, i) => (
              <div key={i} className="bg-white border border-gray-200 p-5 flex items-start gap-4">
                <div className="w-10 h-10 bg-[#1a3a5c]/5 flex items-center justify-center shrink-0">
                  <i className={`fa-solid ${stat.icon} text-[#c8a96e] text-lg`}></i>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs text-gray-500 uppercase tracking-wider mb-0.5">{stat.label}</p>
                  <div className="w-16 h-6 bg-gray-100 animate-pulse rounded" />
                </div>
              </div>
            ))
          : statCards.map((stat, i) => (
              <div key={i} className="bg-white border border-gray-200 p-5 flex items-start gap-4 hover:shadow-sm transition-shadow">
                <div className="w-10 h-10 bg-[#1a3a5c]/5 flex items-center justify-center shrink-0">
                  <i className={`fa-solid ${stat.icon} text-[#c8a96e] text-lg`}></i>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs text-gray-500 uppercase tracking-wider mb-0.5">{stat.label}</p>
                  <p className="text-2xl font-bold text-[#1a3a5c]">{stat.value}</p>
                </div>
              </div>
            ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Quick Actions */}
        <div className="lg:col-span-2">
          <h2 className="text-lg font-semibold text-[#1a3a5c] mb-4">
            {t('quickActions') ?? 'Quick Actions'}
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {quickActions.map((action, i) => (
              <Link
                key={i}
                href={action.href}
                className="flex items-center gap-3 p-4 border border-gray-200 bg-white
                  hover:border-[#c8a96e] hover:shadow-sm transition-all group"
              >
                <div className="w-9 h-9 bg-[#c8a96e]/10 flex items-center justify-center shrink-0
                  group-hover:bg-[#c8a96e]/20 transition-colors">
                  <i className={`fa-solid ${action.icon} text-[#c8a96e]`}></i>
                </div>
                <span className="text-sm font-medium text-gray-700 group-hover:text-[#1a3a5c] transition-colors">
                  {action.label}
                </span>
                <i className="fa-solid fa-chevron-right text-gray-300 text-xs ml-auto
                  group-hover:text-[#c8a96e] transition-colors"></i>
              </Link>
            ))}
          </div>
        </div>

        {/* Recent Activity - placeholder */}
        <div>
          <h2 className="text-lg font-semibold text-[#1a3a5c] mb-4">
            {t('recentActivity') ?? 'Recent Activity'}
          </h2>
          <div className="border border-gray-200 bg-white divide-y divide-gray-100">
            <p className="p-4 text-sm text-gray-400">
              {t('noActivity') ?? 'No recent activity.'}
            </p>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}
