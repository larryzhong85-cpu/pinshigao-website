'use client';

import { useState, useEffect } from 'react';
import { useTranslations } from 'next-intl';
import { useParams } from 'next/navigation';
import Link from 'next/link';

interface Article {
  id: number;
  slug: string;
  titleZh: string;
  titleEn: string;
  titleDe: string;
  contentZh: string;
  contentEn: string;
  contentDe: string;
  image: string;
  date: string;
}

export default function NewsDetailPage() {
  const params = useParams<{ locale: string; slug: string }>();
  const locale = params.locale;
  const slug = params.slug;
  const common = useTranslations('common');
  const t = useTranslations('news');

  const [article, setArticle] = useState<Article | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    const fetchArticle = async () => {
      try {
        setLoading(true);
        setError(false);
        const res = await fetch(`/api/news/${slug}`);
        if (!res.ok) {
          if (res.status === 404) {
            setError(true);
          } else {
            throw new Error('Failed to fetch');
          }
          return;
        }
        const data: Article = await res.json();
        setArticle(data);
      } catch {
        setError(true);
      } finally {
        setLoading(false);
      }
    };
    fetchArticle();
  }, [slug]);

  if (loading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="w-10 h-10 border-4 border-[#1a3a5c] border-t-transparent rounded-full animate-spin"></div>
          <span className="text-gray-500 text-sm">Loading...</span>
        </div>
      </div>
    );
  }

  if (error || !article) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center px-6">
          <h1 className="text-4xl font-bold text-[#1a3a5c] mb-4">
            {common('noResults')}
          </h1>
          <p className="text-gray-500 mb-8">{common('error')}</p>
          <Link
            href={`/${locale}/news`}
            className="inline-flex items-center gap-2 px-6 py-3 bg-[#1a3a5c] text-white text-sm font-medium hover:bg-[#2a4a6c] transition-colors"
          >
            <i className="fa-solid fa-arrow-left"></i>
            {common('back')}
          </Link>
        </div>
      </div>
    );
  }

  const titleKey = `title${locale.charAt(0).toUpperCase() + locale.slice(1)}` as keyof Article;
  const contentKey = `content${locale.charAt(0).toUpperCase() + locale.slice(1)}` as keyof Article;
  const localizedTitle = (article[titleKey] as string) || article.titleEn;
  const localizedContent = (article[contentKey] as string) || article.contentEn;

  return (
    <div className="min-h-screen bg-white">
      {/* Hero Image */}
      <div className="relative h-[420px] md:h-[520px] overflow-hidden bg-gray-900">
        <img
          src={article.image}
          alt={localizedTitle}
          className="w-full h-full object-cover opacity-70"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
        <div className="absolute bottom-0 left-0 right-0 max-w-[1280px] mx-auto px-6 pb-12 md:pb-16">
          <h1 className="text-white text-3xl md:text-4xl lg:text-5xl font-bold leading-tight max-w-3xl">
            {localizedTitle}
          </h1>
          <div className="flex items-center gap-3 mt-4">
            <i className="fa-regular fa-calendar text-[#c8a96e] text-sm"></i>
            <span className="text-white/70 text-sm">{article.date}</span>
          </div>
        </div>
      </div>

      {/* Content Section */}
      <section className="max-w-[860px] mx-auto px-6 py-12 md:py-16">
        {/* Back Button */}
        <Link
          href={`/${locale}/news`}
          className="inline-flex items-center gap-2 text-sm text-gray-500 hover:text-[#1a3a5c] transition-colors mb-8 group"
        >
          <i className="fa-solid fa-arrow-left text-xs transition-transform group-hover:-translate-x-1"></i>
          {common('back')}
        </Link>

        {/* Article Body */}
        <article className="prose prose-lg max-w-none prose-headings:text-[#1a3a5c] prose-p:text-gray-600 prose-p:leading-relaxed">
          {localizedContent.split('\n\n').map((paragraph, idx) => (
            <p key={idx} className="mb-6">
              {paragraph}
            </p>
          ))}
        </article>

        {/* Bottom Navigation */}
        <div className="mt-12 pt-8 border-t border-gray-100 flex items-center justify-between">
          <Link
            href={`/${locale}/news`}
            className="inline-flex items-center gap-2 text-sm text-gray-500 hover:text-[#1a3a5c] transition-colors group"
          >
            <i className="fa-solid fa-arrow-left text-xs transition-transform group-hover:-translate-x-1"></i>
            {common('back')}
          </Link>
          <Link
            href={`/${locale}/news`}
            className="text-sm text-[#1a3a5c] hover:text-[#c8a96e] transition-colors font-medium"
          >
            {t('title')}
            <i className="fa-solid fa-arrow-right ml-2 text-xs"></i>
          </Link>
        </div>
      </section>
    </div>
  );
}
