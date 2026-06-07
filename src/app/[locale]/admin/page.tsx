'use client';

import { useTranslations } from 'next-intl';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import AdminLayout from '@/components/AdminLayout';

export default function AdminDashboard() {
  const t = useTranslations('admin');
  const pathname = usePathname();
  const locale = pathname?.split('/')[1] || 'zh';

  const stats = [
    { label: t('statsProducts') ?? 'Products', value: '128', icon: 'fa-box', change: '+12', positive: true },
    { label: t('statsNews') ?? 'News', value: '36', icon: 'fa-newspaper', change: '+4', positive: true },
    { label: t('statsOrders') ?? 'Orders', value: '847', icon: 'fa-shopping-cart', change: '+23', positive: true },
    { label: t('statsInquiries') ?? 'Inquiries', value: '52', icon: 'fa-envelope', change: '-3', positive: false },
  ];

  const quickActions = [
    { label: t('addProduct') ?? 'Add Product', href: `/${locale}/admin/products/new`, icon: 'fa-plus-circle' },
    { label: t('addNews') ?? 'Add News', href: `/${locale}/admin/news/new`, icon: 'fa-plus-circle' },
    { label: t('manageMedia') ?? 'Manage Media', href: `/${locale}/admin/media`, icon: 'fa-images' },
    { label: t('managePages') ?? 'Manage Pages', href: `/${locale}/admin/pages`, icon: 'fa-file-alt' },
    { label: t('siteSettings') ?? 'Site Settings', href: `/${locale}/admin/settings`, icon: 'fa-cog' },
    { label: t('viewSite') ?? 'View Site', href: `/${locale}`, icon: 'fa-external-link-alt' },
  ];

  const activities = [
    { action: t('activityUpdated') ?? 'Updated', target: 'HD-300 Hinge Series', time: t('minutesAgo') ?? '5 min ago', user: 'Admin' },
    { action: t('activityCreated') ?? 'Created', target: 'Spring Sale 2026', time: t('hourAgo') ?? '1 hour ago', user: 'Admin' },
    { action: t('activityUploaded') ?? 'Uploaded', target: 'Product Images (12)', time: t('hoursAgo') ?? '3 hours ago', user: 'Editor' },
    { action: t('activityPublished') ?? 'Published', target: 'New Arrivals Page', time: t('yesterday') ?? 'Yesterday', user: 'Admin' },
    { action: t('activityDeleted') ?? 'Deleted', target: 'Draft: Old Catalog', time: t('yesterday') ?? 'Yesterday', user: 'Admin' },
    { action: t('activityUpdated') ?? 'Updated', target: 'Contact Information', time: t('daysAgo') ?? '2 days ago', user: 'Editor' },
    { action: t('activityCreated') ?? 'Created', target: 'Category: Drawer Systems', time: t('daysAgo') ?? '3 days ago', user: 'Admin' },
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
        {stats.map((stat, i) => (
          <div
            key={i}
            className="bg-white border border-gray-200 p-5 flex items-start gap-4 hover:shadow-sm transition-shadow"
          >
            <div className="w-10 h-10 bg-[#1a3a5c]/5 flex items-center justify-center shrink-0">
              <i className={`fa-solid ${stat.icon} text-[#c8a96e] text-lg`}></i>
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs text-gray-500 uppercase tracking-wider mb-0.5">{stat.label}</p>
              <p className="text-2xl font-bold text-[#1a3a5c]">{stat.value}</p>
              <span
                className={`text-xs font-medium ${
                  stat.positive ? 'text-green-600' : 'text-red-500'
                }`}
              >
                {stat.change} from last month
              </span>
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

        {/* Recent Activity */}
        <div>
          <h2 className="text-lg font-semibold text-[#1a3a5c] mb-4">
            {t('recentActivity') ?? 'Recent Activity'}
          </h2>
          <div className="border border-gray-200 bg-white divide-y divide-gray-100">
            {activities.length === 0 ? (
              <p className="p-4 text-sm text-gray-400">
                {t('noActivity') ?? 'No recent activity.'}
              </p>
            ) : (
              activities.map((item, i) => (
                <div key={i} className="flex items-start gap-3 p-3.5 hover:bg-gray-50 transition-colors">
                  <div
                    className={`w-2 h-2 rounded-full mt-1.5 shrink-0 ${
                      item.action.includes('Created')
                        ? 'bg-green-500'
                        : item.action.includes('Deleted')
                          ? 'bg-red-400'
                          : item.action.includes('Uploaded')
                            ? 'bg-blue-500'
                            : item.action.includes('Published')
                              ? 'bg-[#c8a96e]'
                              : 'bg-gray-400'
                    }`}
                  ></div>
                  <div className="min-w-0">
                    <p className="text-sm text-gray-800">
                      <span className="font-medium text-[#1a3a5c]">{item.action}</span>{' '}
                      {item.target}
                    </p>
                    <p className="text-xs text-gray-400 mt-0.5">
                      {item.user} &middot; {item.time}
                    </p>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}
