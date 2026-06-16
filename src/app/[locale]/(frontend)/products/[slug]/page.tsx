'use client';

import { useState, useEffect } from 'react';
import { useTranslations } from 'next-intl';
import { useParams } from 'next/navigation';
import Link from 'next/link';

/* ---------- Types ---------- */
interface ProductCategory {
  id: number;
  nameZh: string;
  nameEn: string;
  nameDe: string;
  slug: string;
  image: string | null;
  _count?: { products: number };
}

interface ProductItem {
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
  images: string | null;
  category: ProductCategory | null;
  featured: boolean;
}

/* ---------- Helpers ---------- */
function parseImages(raw: string | null): string[] {
  if (!raw) return [];
  try {
    const p = JSON.parse(raw);
    return Array.isArray(p) ? p : [raw];
  } catch {
    return [raw];
  }
}

function localized(item: ProductItem | ProductCategory, locale: string, field: 'name' | 'subtitle' | 'desc'): string {
  const key = `${field}${locale.charAt(0).toUpperCase() + locale.slice(1)}` as keyof typeof item;
  const enKey = `${field}En` as keyof typeof item;
  return (item[key] as string) || (item[enKey] as string) || '';
}

const DEFAULT_IMG = 'https://images.unsplash.com/photo-1585829365295-ab7cd400c167?w=600&q=80';

/* ================================================================== */
/*  Category View — show all products in a category                     */
/* ================================================================== */
function CategoryView({ category, locale, t, common }: {
  category: ProductCategory;
  locale: string;
  t: any;
  common: any;
}) {
  const [products, setProducts] = useState<ProductItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`/api/products?categoryId=${category.id}&published=true`)
      .then(r => r.json())
      .then(data => {
        const list = data?.products ?? (Array.isArray(data) ? data : []);
        setProducts(list);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [category.id]);

  const catName = localized(category, locale, 'name');
  const catImg = category.image || DEFAULT_IMG;

  return (
    <div className="min-h-screen bg-white">
      {/* Hero */}
      <section className="relative bg-[#1a3a5c] py-20 md:py-28">
        <div className="absolute inset-0 opacity-10"
          style={{ backgroundImage: `url(${catImg})`, backgroundSize: 'cover', backgroundPosition: 'center' }}
        />
        <div className="relative max-w-[1280px] mx-auto px-6 text-center">
          <Link href={`/${locale}/products`}
            className="inline-flex items-center gap-1 text-sm text-white/50 hover:text-[#c8a96e] transition-colors mb-4">
            <i className="fa-solid fa-arrow-left text-xs" />
            {t('title')}
          </Link>
          <h1 className="text-white text-4xl md:text-5xl font-bold leading-tight">{catName}</h1>
          <div className="w-16 h-0.5 bg-[#c8a96e] mx-auto mt-6" />
        </div>
      </section>

      {/* Products */}
      <section className="max-w-[1280px] mx-auto px-6 py-16 md:py-24">
        {loading ? (
          <div className="flex justify-center py-20">
            <span className="text-gray-500">{common('loading')}</span>
          </div>
        ) : products.length === 0 ? (
          <div className="text-center py-20">
            <i className="fa-solid fa-cube text-gray-300 text-5xl mb-4" />
            <p className="text-gray-400">{common('noResults')}</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-x-8 gap-y-12">
            {products.map((p) => {
              const imgs = parseImages(p.images);
              const thumb = imgs.length > 0 ? `/uploads/${imgs[0]}` : DEFAULT_IMG;
              const name = localized(p, locale, 'name');
              const subtitle = localized(p, locale, 'subtitle');
              return (
                <Link key={p.slug} href={`/${locale}/products/${p.slug}`} className="group block">
                  <div className="relative aspect-[4/3] overflow-hidden bg-gray-100">
                    <img src={thumb} alt={name}
                      className="w-full h-full object-cover transition-all duration-500 group-hover:scale-105"
                      onError={e => { (e.currentTarget as HTMLImageElement).src = DEFAULT_IMG; }}
                    />
                  </div>
                  <div className="mt-5">
                    <h3 className="text-lg font-bold text-[#1a3a5c] group-hover:text-[#c8a96e] transition-colors">
                      {name}
                    </h3>
                    {subtitle && (
                      <p className="text-gray-500 text-sm mt-1 line-clamp-2">{subtitle}</p>
                    )}
                  </div>
                </Link>
              );
            })}
          </div>
        )}
      </section>

      <div className="h-1 bg-gradient-to-r from-[#1a3a5c] via-[#c8a96e] to-[#1a3a5c]" />
    </div>
  );
}

/* ================================================================== */
/*  Product Detail View                                                */
/* ================================================================== */
function ProductDetailView({ product, locale, t, common }: {
  product: ProductItem;
  locale: string;
  t: any;
  common: any;
}) {
  const [activeImage, setActiveImage] = useState(0);
  const [related, setRelated] = useState<ProductItem[]>([]);

  const title = localized(product, locale, 'name');
  const subtitle = localized(product, locale, 'subtitle');
  const description = localized(product, locale, 'desc');
  const imageUrls = parseImages(product.images).map(f => `/uploads/${f}`);

  // Fetch related products from the same category
  useEffect(() => {
    if (!product.category?.id) return;
    fetch(`/api/products?categoryId=${product.category.id}&published=true&pageSize=4`)
      .then(r => r.json())
      .then(data => {
        const list: ProductItem[] = data?.products ?? (Array.isArray(data) ? data : []);
        setRelated(list.filter(p => p.slug !== product.slug));
      })
      .catch(() => {});
  }, [product.slug, product.category?.id]);

  // Parse specs lines
  const specsKey = `specs${locale.charAt(0).toUpperCase() + locale.slice(1)}` as keyof ProductItem;
  const specsEnKey = 'specsEn' as keyof ProductItem;
  const rawSpecs = (product[specsKey] as string) || (product[specsEnKey] as string) || '';
  const specsLines = rawSpecs.split('\n').filter(Boolean);

  return (
    <div className="min-h-screen bg-white">
      {/* Breadcrumb */}
      <div className="bg-gray-50 border-b border-gray-100">
        <div className="max-w-[1280px] mx-auto px-6 py-4">
          <div className="flex items-center gap-2 text-sm text-gray-500">
            <Link href={`/${locale}`} className="hover:text-[#1a3a5c] transition-colors">{common('home')}</Link>
            <span className="text-gray-300">/</span>
            <Link href={`/${locale}/products`} className="hover:text-[#1a3a5c] transition-colors">{t('title')}</Link>
            {product.category && (
              <>
                <span className="text-gray-300">/</span>
                <Link href={`/${locale}/products/${product.category.slug}`}
                  className="hover:text-[#1a3a5c] transition-colors">
                  {localized(product.category, locale, 'name')}
                </Link>
              </>
            )}
            <span className="text-gray-300">/</span>
            <span className="text-[#1a3a5c] font-medium truncate max-w-[200px]">{title}</span>
          </div>
        </div>
      </div>

      {/* Product Main */}
      <section className="max-w-[1280px] mx-auto px-6 py-12 md:py-16">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16">
          {/* Images */}
          <div>
            {imageUrls.length > 0 ? (
              <>
                <div className="aspect-square bg-gray-50 overflow-hidden mb-4">
                  <img src={imageUrls[activeImage]} alt={title}
                    className="w-full h-full object-cover"
                    onError={e => { (e.currentTarget as HTMLImageElement).src = DEFAULT_IMG; }}
                  />
                </div>
                {imageUrls.length > 1 && (
                  <div className="flex gap-3 overflow-x-auto pb-2">
                    {imageUrls.map((url, idx) => (
                      <button key={idx} onClick={() => setActiveImage(idx)}
                        className={`w-20 h-20 shrink-0 overflow-hidden border-2 transition-colors ${
                          activeImage === idx ? 'border-[#c8a96e]' : 'border-gray-200 hover:border-gray-400'
                        }`}>
                        <img src={url} alt={`${title} ${idx + 1}`} className="w-full h-full object-cover" />
                      </button>
                    ))}
                  </div>
                )}
              </>
            ) : (
              <div className="aspect-square bg-gray-100 flex items-center justify-center">
                <i className="fa-solid fa-image text-gray-300 text-6xl" />
              </div>
            )}
          </div>

          {/* Info */}
          <div className="flex flex-col">
            {product.category && (
              <Link href={`/${locale}/products/${product.category.slug}`}
                className="inline-block text-xs font-medium text-[#c8a96e] tracking-[0.15em] uppercase mb-3 hover:underline">
                {localized(product.category, locale, 'name')}
              </Link>
            )}
            <h1 className="text-3xl md:text-4xl font-bold text-[#1a3a5c] leading-tight mb-4">{title}</h1>
            {subtitle && <p className="text-lg text-gray-500 mb-6">{subtitle}</p>}
            <div className="w-12 h-0.5 bg-[#c8a96e] mb-6" />

            {description && (
              <div className="text-gray-600 leading-relaxed mb-8">
                {description.split('\n').map((p, i) => (
                  <p key={i} className={i > 0 ? 'mt-4' : ''}>{p}</p>
                ))}
              </div>
            )}

            {specsLines.length > 0 && (
              <div className="mb-8">
                <h3 className="text-sm font-semibold text-[#1a3a5c] uppercase tracking-wider mb-3">
                  {t('detail.specs')}
                </h3>
                <div className="grid grid-cols-2 gap-3">
                  {specsLines.map((line, i) => {
                    const ci = line.indexOf(':');
                    return ci > 0 ? (
                      <div key={i} className="flex gap-2 text-sm">
                        <span className="text-gray-400 font-medium min-w-[80px]">{line.slice(0, ci)}:</span>
                        <span className="text-gray-700">{line.slice(ci + 1).trim()}</span>
                      </div>
                    ) : (
                      <div key={i} className="text-sm text-gray-600 col-span-2">{line}</div>
                    );
                  })}
                </div>
              </div>
            )}

            <div className="mt-auto pt-6 border-t border-gray-100">
              <Link href={`/${locale}/contact`}
                className="inline-flex items-center gap-2 px-8 py-3.5 bg-[#c8a96e] text-white text-sm font-medium
                  hover:bg-[#a8894e] transition-all hover:-translate-y-0.5 hover:shadow-lg">
                {common('contactNow')}
                <i className="fa-solid fa-arrow-right text-xs" />
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Related Products */}
      {related.length > 0 && (
        <section className="bg-gray-50 py-16 md:py-20">
          <div className="max-w-[1280px] mx-auto px-6">
            <h2 className="text-2xl font-bold text-[#1a3a5c] mb-10 text-center">
              {t('detail.related')}
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {related.map((p) => {
                const name = localized(p, locale, 'name');
                const imgs = parseImages(p.images);
                const thumb = imgs.length > 0 ? `/uploads/${imgs[0]}` : DEFAULT_IMG;
                return (
                  <Link key={p.slug} href={`/${locale}/products/${p.slug}`} className="group block bg-white shadow-sm hover:shadow-md transition-shadow">
                    <div className="aspect-[4/3] overflow-hidden bg-gray-100">
                      <img src={thumb} alt={name}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                        onError={e => { (e.currentTarget as HTMLImageElement).src = DEFAULT_IMG; }}
                      />
                    </div>
                    <div className="p-4">
                      <h3 className="text-sm font-semibold text-[#1a3a5c] group-hover:text-[#c8a96e] transition-colors">{name}</h3>
                    </div>
                  </Link>
                );
              })}
            </div>
          </div>
        </section>
      )}

      <div className="h-1 bg-gradient-to-r from-[#1a3a5c] via-[#c8a96e] to-[#1a3a5c]" />
    </div>
  );
}

/* ================================================================== */
/*  Main Page — routes by slug (category or product)                   */
/* ================================================================== */
export default function ProductsSlugPage() {
  const params = useParams<{ locale: string; slug: string }>();
  const locale = params.locale;
  const slug = params.slug;
  const t = useTranslations('products');
  const common = useTranslations('common');

  const [mode, setMode] = useState<'loading' | 'category' | 'product' | 'notfound'>('loading');
  const [category, setCategory] = useState<ProductCategory | null>(null);
  const [product, setProduct] = useState<ProductItem | null>(null);

  useEffect(() => {
    let cancelled = false;

    async function resolve() {
      setMode('loading');
      try {
        // Try to find a matching category first
        const catRes = await fetch(`/api/categories/${slug}`);
        if (catRes.ok) {
          const catData: ProductCategory = await catRes.json();
          if (!cancelled) {
            setCategory(catData);
            setMode('category');
            return;
          }
        }
      } catch { /* not a category */ }

      try {
        // Try as product
        const prodRes = await fetch(`/api/products/${slug}`);
        if (prodRes.ok) {
          const prodData: ProductItem = await prodRes.json();
          if (!cancelled) {
            setProduct(prodData);
            setMode('product');
            return;
          }
        }
      } catch { /* not a product */ }

      if (!cancelled) setMode('notfound');
    }

    resolve();
    return () => { cancelled = true; };
  }, [slug]);

  /* ---- Render ---- */
  if (mode === 'loading') {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <span className="text-gray-500">{common('loading')}</span>
      </div>
    );
  }

  if (mode === 'category' && category) {
    return <CategoryView category={category} locale={locale} t={t} common={common} />;
  }

  if (mode === 'product' && product) {
    return <ProductDetailView product={product} locale={locale} t={t} common={common} />;
  }

  // Not found
  return (
    <div className="min-h-screen bg-white flex items-center justify-center">
      <div className="text-center px-6">
        <h1 className="text-4xl font-bold text-[#1a3a5c] mb-4">{common('noResults')}</h1>
        <p className="text-gray-500 mb-8">{common('error')}</p>
        <Link href={`/${locale}/products`}
          className="inline-flex items-center gap-2 px-6 py-3 bg-[#1a3a5c] text-white text-sm font-medium hover:bg-[#2a4a6c] transition-colors">
          <i className="fa-solid fa-arrow-left" />
          {t('title')}
        </Link>
      </div>
    </div>
  );
}
