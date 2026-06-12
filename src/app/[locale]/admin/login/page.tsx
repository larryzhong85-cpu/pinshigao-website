'use client';

import { useState, FormEvent } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useTranslations } from 'next-intl';

export default function AdminLoginPage() {
  const params = useParams();
  const router = useRouter();
  const t = useTranslations('admin');
  const locale = (params.locale as string) || 'zh';

  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError('');

    if (!username.trim() || !password.trim()) {
      setError(t('validationEmpty'));
      return;
    }

    setLoading(true);

    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username: username.trim(), password }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.message || data.error || t('loginFailed'));
        return;
      }

      if (data.token) {
        localStorage.setItem("admin_token", data.token);
        document.cookie = `token=${data.token}; path=/; max-age=${7 * 24 * 60 * 60}; SameSite=Lax`;
      }

      router.push(`/${locale}/admin`);
    } catch {
      setError(t('networkError'));
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-[#f5f7fa] flex items-center justify-center px-4">
      <div className="w-full max-w-md">
        {/* Branding */}
        <div className="text-center mb-10">
          <img src="/logo.jpeg" alt={t('login')} className="h-28 mx-auto mb-3" />
          <p className="text-sm text-[#999]">{t('loginSubtitle')}</p>
        </div>

        {/* Login Card */}
        <div className="bg-white rounded-xl shadow-sm border border-[#e8e8e8] p-8">
          <h2 className="text-xl font-semibold text-[#1a3a5c] mb-6 text-center">
            {t('login')}
          </h2>

          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Username */}
            <div>
              <label
                htmlFor="username"
                className="block text-sm font-medium text-[#666] mb-1.5"
              >
                {t('username')}
              </label>
              <input
                id="username"
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder={t('username')}
                autoComplete="username"
                disabled={loading}
                className="w-full px-4 py-2.5 rounded-lg border border-[#e8e8e8] bg-white text-[#1a1a1a] placeholder:text-[#bbb] outline-none transition-colors focus:border-[#c8a96e] focus:ring-2 focus:ring-[#c8a96e]/20 disabled:opacity-50"
              />
            </div>

            {/* Password */}
            <div>
              <label
                htmlFor="password"
                className="block text-sm font-medium text-[#666] mb-1.5"
              >
                {t('password')}
              </label>
              <input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder={t('password')}
                autoComplete="current-password"
                disabled={loading}
                className="w-full px-4 py-2.5 rounded-lg border border-[#e8e8e8] bg-white text-[#1a1a1a] placeholder:text-[#bbb] outline-none transition-colors focus:border-[#c8a96e] focus:ring-2 focus:ring-[#c8a96e]/20 disabled:opacity-50"
              />
            </div>

            {/* Error */}
            {error && (
              <div className="rounded-lg bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-600">
                {error}
              </div>
            )}

            {/* Submit */}
            <button
              type="submit"
              disabled={loading}
              className="w-full py-2.5 rounded-lg bg-[#1a3a5c] text-white font-medium text-sm transition-colors hover:bg-[#0f2640] disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? t('loading') : t('loginBtn')}
            </button>
          </form>
        </div>

        {/* Footer */}
        <p className="mt-8 text-center text-xs text-[#aaa]">
          &copy; {new Date().getFullYear()} PINSHIGAO Hardware Co., Ltd.
        </p>
      </div>
    </div>
  );
}
