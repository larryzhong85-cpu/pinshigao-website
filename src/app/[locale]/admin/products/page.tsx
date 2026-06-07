'use client';

import { useState, useEffect, useCallback } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import AdminLayout from '@/components/admin/AdminLayout';

/* ------------------------------------------------------------------ */
/*  Types                                                               */
/* ------------------------------------------------------------------ */
interface Category {
  id: number;
  nameZh: string;
  slug: string;
}

interface Product {
  id: number;
  slug: string;
  nameZh: string;
  images: string | null;
  published: boolean;
  categoryId: number | null;
  category: Category | null;
}

/* ------------------------------------------------------------------ */
/*  Confirmation Dialog Component                                       */
/* ------------------------------------------------------------------ */
function ConfirmDialog({
  open,
  title,
  message,
  onConfirm,
  onCancel,
  loading,
}: {
  open: boolean;
  title: string;
  message: string;
  onConfirm: () => void;
  onCancel: () => void;
  loading?: boolean;
}) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/40" onClick={onCancel} />
      <div className="relative bg-white rounded-lg shadow-xl max-w-sm w-full mx-4 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-2">{title}</h3>
        <p className="text-sm text-gray-600 mb-6">{message}</p>
        <div className="flex justify-end gap-3">
          <button
            onClick={onCancel}
            disabled={loading}
            className="px-4 py-2 text-sm text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            disabled={loading}
            className="px-4 py-2 text-sm text-white bg-red-600 hover:bg-red-700 rounded-lg transition-colors disabled:opacity-50 inline-flex items-center gap-2"
          >
            {loading && <i className="fa-solid fa-spinner fa-spin" />}
            {loading ? 'Deleting...' : 'Delete'}
          </button>
        </div>
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Page                                                                 */
/* ------------------------------------------------------------------ */
export default function AdminProductsPage() {
  const params = useParams();
  const locale = params.locale as string;
  const router = useRouter();

  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Delete state
  const [deleteTarget, setDeleteTarget] = useState<Product | null>(null);
  const [deleting, setDeleting] = useState(false);

  /* ---- Fetch products on mount ---- */
  const fetchProducts = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch('/api/products');
      if (!res.ok) throw new Error(`Failed to fetch: ${res.status}`);
      const data: Product[] = await res.json();
      setProducts(data);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Unknown error';
      setError(msg);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  /* ---- Delete handler ---- */
  async function handleDelete() {
    if (!deleteTarget) return;
    setDeleting(true);
    try {
      const res = await fetch(`/api/products/${deleteTarget.id}`, {
        method: 'DELETE',
      });
      if (!res.ok) throw new Error(`Delete failed: ${res.status}`);
      setProducts((prev) => prev.filter((p) => p.id !== deleteTarget.id));
      setDeleteTarget(null);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Delete failed';
      alert(msg);
    } finally {
      setDeleting(false);
    }
  }

  /* ---- Derived data ---- */
  const parsedImages = (raw: string | null): string[] => {
    if (!raw) return [];
    try {
      return JSON.parse(raw);
    } catch {
      return [];
    }
  };

  /* ---- Render ---- */
  return (
    <AdminLayout>
      {/* Page header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Products</h1>
          <p className="text-sm text-gray-500 mt-1">Manage your product catalog</p>
        </div>
        <Link
          href={`/${locale}/admin/products/new`}
          className="inline-flex items-center gap-2 px-4 py-2.5 bg-[#c8a96e] text-white text-sm font-medium rounded-lg
            hover:bg-[#a8894e] transition-colors"
        >
          <i className="fa-solid fa-plus" />
          New Product
        </Link>
      </div>

      {/* Loading state */}
      {loading && (
        <div className="flex items-center justify-center py-20">
          <i className="fa-solid fa-spinner fa-spin text-2xl text-gray-400" />
        </div>
      )}

      {/* Error state */}
      {!loading && error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
          <p className="text-red-700 text-sm mb-3">{error}</p>
          <button
            onClick={fetchProducts}
            className="px-4 py-2 text-sm text-red-700 bg-red-100 hover:bg-red-200 rounded-lg transition-colors"
          >
            Retry
          </button>
        </div>
      )}

      {/* Empty state */}
      {!loading && !error && products.length === 0 && (
        <div className="bg-white border border-gray-200 rounded-lg p-12 text-center">
          <i className="fa-solid fa-cube text-4xl text-gray-300 mb-4" />
          <p className="text-gray-500 text-sm mb-4">No products yet.</p>
          <Link
            href={`/${locale}/admin/products/new`}
            className="inline-flex items-center gap-2 px-4 py-2.5 bg-[#c8a96e] text-white text-sm font-medium rounded-lg hover:bg-[#a8894e] transition-colors"
          >
            <i className="fa-solid fa-plus" />
            Create your first product
          </Link>
        </div>
      )}

      {/* Table */}
      {!loading && !error && products.length > 0 && (
        <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-200 bg-gray-50">
                  <th className="text-left px-4 py-3 font-medium text-gray-600 w-16">Image</th>
                  <th className="text-left px-4 py-3 font-medium text-gray-600">Name (zh)</th>
                  <th className="text-left px-4 py-3 font-medium text-gray-600">Category</th>
                  <th className="text-left px-4 py-3 font-medium text-gray-600">Status</th>
                  <th className="text-right px-4 py-3 font-medium text-gray-600 w-32">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {products.map((product) => {
                  const imgs = parsedImages(product.images);
                  const thumbSrc = imgs.length > 0 ? `/uploads/${imgs[0]}` : null;

                  return (
                    <tr key={product.id} className="hover:bg-gray-50 transition-colors">
                      {/* Thumbnail */}
                      <td className="px-4 py-3">
                        {thumbSrc ? (
                          <img
                            src={thumbSrc}
                            alt={product.nameZh}
                            className="w-10 h-10 object-cover rounded border border-gray-200"
                          />
                        ) : (
                          <div className="w-10 h-10 bg-gray-100 rounded border border-gray-200 flex items-center justify-center">
                            <i className="fa-solid fa-image text-gray-300 text-sm" />
                          </div>
                        )}
                      </td>

                      {/* Name (zh) */}
                      <td className="px-4 py-3">
                        <Link
                          href={`/${locale}/admin/products/${product.id}/edit`}
                          className="text-gray-900 font-medium hover:text-[#c8a96e] transition-colors"
                        >
                          {product.nameZh}
                        </Link>
                      </td>

                      {/* Category */}
                      <td className="px-4 py-3 text-gray-500">
                        {product.category?.nameZh || <span className="text-gray-300 italic">None</span>}
                      </td>

                      {/* Status */}
                      <td className="px-4 py-3">
                        <span
                          className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium ${
                            product.published
                              ? 'bg-emerald-50 text-emerald-700'
                              : 'bg-gray-100 text-gray-500'
                          }`}
                        >
                          <span
                            className={`w-1.5 h-1.5 rounded-full ${
                              product.published ? 'bg-emerald-500' : 'bg-gray-400'
                            }`}
                          />
                          {product.published ? 'Published' : 'Draft'}
                        </span>
                      </td>

                      {/* Actions */}
                      <td className="px-4 py-3 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <Link
                            href={`/${locale}/admin/products/${product.id}/edit`}
                            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-gray-600 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
                          >
                            <i className="fa-solid fa-pen" />
                            Edit
                          </Link>
                          <button
                            onClick={() => setDeleteTarget(product)}
                            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-red-600 bg-red-50 hover:bg-red-100 rounded-lg transition-colors"
                          >
                            <i className="fa-solid fa-trash-can" />
                            Delete
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Delete confirmation dialog */}
      <ConfirmDialog
        open={deleteTarget !== null}
        title="Delete Product"
        message={
          deleteTarget
            ? `Are you sure you want to delete "${deleteTarget.nameZh}"? This action cannot be undone.`
            : ''
        }
        onConfirm={handleDelete}
        onCancel={() => setDeleteTarget(null)}
        loading={deleting}
      />
    </AdminLayout>
  );
}
