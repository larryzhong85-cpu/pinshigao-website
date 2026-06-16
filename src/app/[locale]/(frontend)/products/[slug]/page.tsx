'use client';

import { useState, useEffect } from 'react';
import { useTranslations } from 'next-intl';
import { useParams } from 'next/navigation';
import Link from 'next/link';

interface ProductCategory {
  id: number;
  nameZh: string;
  nameEn: string;
  nameDe: string;
  slug: string;
}

interface ProductDetail {
  id: number;
  slug: string;
  nameZh: string;
  nameEn: string;
  nameDe: string;
  subtitleZh: string | null;
  subtitleEn: string | null;
  subtitleDe: string | null;
  descZh: string | null;
  descEn: string | null;
  descDe: string | null;
  specsZh: string | null;
  specsEn: string | null;
  specsDe: string | null;
  images: string | null;
  category: ProductCategory | null;
  featured: boolean;
  published: boolean;
}

export default function ProductDetailPage() {
  const params = useParams<{ locale: string; slug: string }>();
  const locale = params.locale;
  const slug = params.slug;
  const t = useTranslations('products');
  const common = useTranslations('common');

  const [product, setProduct] = useState<ProductDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [activeImage, setActiveImage] = useState(0);

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        setLoading(true);
        setError(false);
        const res = await fetch(`/api/products/${slug}`);
        if (!res.ok) {
          if (res.status === 404) setError(true);
          else throw new Error('Failed to fetch');
          return;
        }
        const data: ProductDetail = await res.json();
        setProduct(data);
      } catch {
        setError(true);
      } finally {
        setLoading(false);
      }
    };
    fetchProduct();
  }, [slug]);

  const getLocalized = (field: 'name' | 'subtitle' | 'desc' | 'specs'): string => {
    if (!product) return '';
    const key = `${field}${locale.charAt(0).toUpperCase() + locale.slice(1)}` as keyof ProductDetail;
    const enKey = `${field}En` as keyof ProductDetail;
    return (product[key] as string) || (product[enKey] as string) || '';
  };

  const parsedImages: string[] = (() => {
    if (!product?.images) return [];
    try {
      const parsed = JSON.parse(product.images);
      return Array.isArray(parsed) ? parsed : [];
    } catch {
      return product.images ? [product.images] : [];
    }
  })();

  const imageUrls = parsedImages.map((f) => `/uploads/${f}`);

  const specs = getLocalized('specs');
  const specsLines = specs ? specs.split('\n').filter(Boolean) : [];

  if (loading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="w-10 h-10 border-4 border-[#1a3a5c] border-t-transparent rounded-full animate-spin"></div>
          <span className="text-gray-500 text-sm">{common('loading')}</span>
        </div>
      </div>
    );
  }

  if (error || !product) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center px-6">
          <h1 className="text-4xl font-bold text-[#1a3a5c] mb-4">{common('noResults')}</h1>
          <p className="text-gray-500 mb-8">{common('error')}</p>
          <Link
            href={`/${locale}/products`}
            className="inline-flex items-center gap-2 px-6 py-3 bg-[#1a3a5c] text-white text-sm font-medium hover:bg-[#2a4a6c] transition-colors"
          >
            <i className="fa-solid fa-arrow-left"></i>
            {t('title')}
          </Link>
        </div>
      </div>
    );
  }

  const title = getLocalized('name');
  const subtitle = getLocalized('subtitle');
  const description = getLocalized('desc');

  return (
    <div className="min-h-screen bg-white">
      {/* ========== Breadcrumb ========== */}
      <div className="bg-gray-50 border-b border-gray-100">
        <div className="max-w-[1280px] mx-auto px-6 py-4">
          <div className="flex items-center gap-2 text-sm text-gray-500">
            <Link href={`/${locale}`} className="hover:text-[#1a3a5c] transition-colors">
              {common('home')}
            </Link>
            <span className="text-gray-300">/</span>
            <Link href={`/${locale}/products`} className="hover:text-[#1a3a5c] transition-colors">
              {t('title')}
            </Link>
            {product.category && (
              <>
                <span className="text-gray-300">/</span>
                <Link
                  href={`/${locale}/products/${product.category.slug}`}
                  className="hover:text-[#1a3a5c] transition-colors"
                >
                  {product.category[`name${locale.charAt(0).toUpperCase() + locale.slice(1)}` as keyof typeof product.category] as string || product.category.nameEn}
                </Link>
              </>
            )}
            <span className="text-gray-300">/</span>
            <span className="text-[#1a3a5c] font-medium truncate max-w-[200px]">{title}</span>
          </div>
        </div>
      </div>

      {/* ========== Product Main Section ========== */}
      <section className="max-w-[1280px] mx-auto px-6 py-12 md:py-16">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16">
          {/* Left: Images */}
          <div>
            {imageUrls.length > 0 ? (
              <>
                {/* Main image */}
                <div className="aspect-square bg-gray-50 overflow-hidden mb-4">
                  <img
                    src={imageUrls[activeImage]}
                    alt={title}
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      (e.currentTarget as HTMLImageElement).src =
                        'https://images.unsplash.com/photo-1585829365295-ab7cd400c167?w=600&q=80';
                    }}
                  />
                </div>
                {/* Thumbnails */}
                {imageUrls.length > 1 && (
                  <div className="flex gap-3 overflow-x-auto pb-2">
                    {imageUrls.map((url, idx) => (
                      <button
                        key={idx}
                        onClick={() => setActiveImage(idx)}
                        className={`w-20 h-20 shrink-0 overflow-hidden border-2 transition-colors
                          ${activeImage === idx ? 'border-[#c8a96e]' : 'border-gray-200 hover:border-gray-400'}`}
                      >
                        <img
                          src={url}
                          alt={`${title} ${idx + 1}`}
                          className="w-full h-full object-cover"
                        />
                      </button>
                    ))}
                  </div>
                )}
              </>
            ) : (
              <div className="aspect-square bg-gray-100 flex items-center justify-center">
                <i className="fa-solid fa-image text-gray-300 text-6xl"></i>
              </div>
            )}
          </div>

          {/* Right: Product Info */}
          <div className="flex flex-col">
            {/* Category badge */}
            {product.category && (
              <span className="inline-block text-xs font-medium text-[#c8a96e] tracking-[0.15em] uppercase mb-3">
                {product.category[`name${locale.charAt(0).toUpperCase() + locale.slice(1)}` as keyof typeof product.category] as string || product.category.nameEn}
              </span>
            )}

            {/* Title */}
            <h1 className="text-3xl md:text-4xl font-bold text-[#1a3a5c] leading-tight mb-4">
              {title}
            </h1>

            {/* Subtitle */}
            {subtitle && (
              <p className="text-lg text-gray-500 mb-6">{subtitle}</p>
            )}

            {/* Divider */}
            <div className="w-12 h-0.5 bg-[#c8a96e] mb-6" />

            {/* Description */}
            {description && (
              <div className="text-gray-600 leading-relaxed mb-8">
                {description.split('\n').map((p, i) => (
                  <p key={i} className={i > 0 ? 'mt-4' : ''}>{p}</p>
                ))}
              </div>
            )}

            {/* Specs */}
            {specsLines.length > 0 && (
              <div className="mb-8">
                <h3 className="text-sm font-semibold text-[#1a3a5c] uppercase tracking-wider mb-3">
                  {t('detail.specs')}
                </h3>
                <div className="grid grid-cols-2 gap-3">
                  {specsLines.map((line, i) => {
                    const colonIdx = line.indexOf(':');
                    if (colonIdx > 0) {
                      return (
                        <div key={i} className="flex gap-2 text-sm">
                          <span className="text-gray-400 font-medium min-w-[80px]">{line.slice(0, colonIdx)}:</span>
                          <span className="text-gray-700">{line.slice(colonIdx + 1).trim()}</span>
                        </div>
                      );
                    }
                    return (
                      <div key={i} className="text-sm text-gray-600 col-span-2">{line}</div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* CTA */}
            <div className="mt-auto pt-6 border-t border-gray-100">
              <Link
                href={`/${locale}/contact`}
                className="inline-flex items-center gap-2 px-8 py-3.5 bg-[#c8a96e] text-white text-sm font-medium
                  hover:bg-[#a8894e] transition-all hover:-translate-y-0.5 hover:shadow-lg"
              >
                {common('contactNow')}
                <i className="fa-solid fa-arrow-right text-xs" />
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* ========== Decorative Bottom ========== */}
      <div className="h-1 bg-gradient-to-r from-[#1a3a5c] via-[#c8a96e] to-[#1a3a5c]" />
    </div>
  );
}
