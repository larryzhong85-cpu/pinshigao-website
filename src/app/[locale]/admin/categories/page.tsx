'use client';

import { useTranslations } from 'next-intl';
import { usePathname, useRouter } from 'next/navigation';
import { useState, useEffect, useCallback } from 'react';
import AdminLayout from '@/components/AdminLayout';

/* ------------------------------------------------------------------ */
/*  Types                                                              */
/* ------------------------------------------------------------------ */
interface Category {
  id: number;
  nameZh: string;
  nameEn: string;
  nameDe: string;
  slug: string;
  image: string | null;
  order: number;
  createdAt: string;
  updatedAt: string;
  _count?: { products: number };
}

interface FormData {
  nameZh: string;
  nameEn: string;
  nameDe: string;
  slug: string;
  image: string;
  order: number;
}

const emptyForm: FormData = {
  nameZh: '',
  nameEn: '',
  nameDe: '',
  slug: '',
  image: '',
  order: 0,
};

/* ------------------------------------------------------------------ */
/*  Helpers                                                            */
/* ------------------------------------------------------------------ */
function slugify(text: string): string {
  return text
    .toLowerCase()
    .trim()
    .replace(/[\s]+/g, '-')
    .replace(/[^a-z0-9-]/g, '')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '');
}

/* ------------------------------------------------------------------ */
/*  Page                                                               */
/* ------------------------------------------------------------------ */
export default function AdminCategoriesPage() {
  const t = useTranslations('admin');
  const pathname = usePathname();
  const router = useRouter();
  const locale = pathname?.split('/')[1] || 'zh';

  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [search, setSearch] = useState('');

  /* Modal state */
  const [modalOpen, setModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [form, setForm] = useState<FormData>(emptyForm);
  const [saving, setSaving] = useState(false);
  const [formError, setFormError] = useState('');

  /* Delete confirmation */
  const [deleteId, setDeleteId] = useState<number | null>(null);
  const [deleting, setDeleting] = useState(false);

  /* ------------------------------------------------------------------ */
  /*  Fetch categories                                                    */
  /* ------------------------------------------------------------------ */
  const fetchCategories = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const res = await fetch('/api/categories');
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = await res.json();
      setCategories(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load categories');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchCategories();
  }, [fetchCategories]);

  /* ------------------------------------------------------------------ */
  /*  Form helpers                                                       */
  /* ------------------------------------------------------------------ */
  const openCreate = () => {
    setEditingId(null);
    setForm(emptyForm);
    setFormError('');
    setModalOpen(true);
  };

  const openEdit = (cat: Category) => {
    setEditingId(cat.id);
    setForm({
      nameZh: cat.nameZh,
      nameEn: cat.nameEn,
      nameDe: cat.nameDe,
      slug: cat.slug,
      image: cat.image || '',
      order: cat.order,
    });
    setFormError('');
    setModalOpen(true);
  };

  const handleNameChange = (field: 'nameZh' | 'nameEn' | 'nameDe', value: string) => {
    const updated = { ...form, [field]: value };
    // Auto-generate slug from nameEn (only when creating)
    if (editingId === null && field === 'nameEn') {
      updated.slug = slugify(value);
    }
    setForm(updated);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setFormError('');

    try {
      const body: FormData & { id?: number } = { ...form };
      if (editingId !== null) body.id = editingId;

      const res = await fetch('/api/categories', {
        method: editingId !== null ? 'PUT' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });

      if (!res.ok) {
        const errData = await res.json().catch(() => ({}));
        throw new Error(errData.message || `HTTP ${res.status}`);
      }

      setModalOpen(false);
      fetchCategories();
    } catch (err) {
      setFormError(err instanceof Error ? err.message : 'Save failed');
    } finally {
      setSaving(false);
    }
  };

  /* ------------------------------------------------------------------ */
  /*  Delete                                                             */
  /* ------------------------------------------------------------------ */
  const confirmDelete = (id: number) => {
    setDeleteId(id);
  };

  const executeDelete = async () => {
    if (deleteId === null) return;
    setDeleting(true);
    try {
      const res = await fetch(`/api/categories?id=${deleteId}`, {
        method: 'DELETE',
      });
      if (!res.ok) {
        const errData = await res.json().catch(() => ({}));
        throw new Error(errData.message || `HTTP ${res.status}`);
      }
      setDeleteId(null);
      fetchCategories();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Delete failed');
    } finally {
      setDeleting(false);
    }
  };

  /* ------------------------------------------------------------------ */
  /*  Filter                                                             */
  /* ------------------------------------------------------------------ */
  const filtered = categories.filter((cat) => {
    if (!search) return true;
    const q = search.toLowerCase();
    return (
      cat.nameZh.toLowerCase().includes(q) ||
      cat.nameEn.toLowerCase().includes(q) ||
      cat.nameDe.toLowerCase().includes(q) ||
      cat.slug.toLowerCase().includes(q)
    );
  });

  /* ------------------------------------------------------------------ */
  /*  Render                                                             */
  /* ------------------------------------------------------------------ */
  return (
    <AdminLayout>
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-semibold text-[#1a3a5c]">
            {t('categories') || 'Categories'}
          </h1>
          <p className="text-gray-500 text-sm mt-1">
            {t('categoriesDesc') || 'Manage your product categories.'}
          </p>
        </div>
        <button
          onClick={openCreate}
          className="flex items-center gap-2 px-5 py-2.5 bg-[#1a3a5c] text-white text-sm font-medium
            hover:bg-[#0f2640] transition-all hover:-translate-y-0.5 hover:shadow-lg"
        >
          <i className="fa-solid fa-plus"></i>
          {t('addCategory') || 'Add Category'}
        </button>
      </div>

      {/* Error banner */}
      {error && (
        <div className="mb-4 p-4 bg-red-50 border border-red-200 text-red-700 text-sm flex items-center gap-3">
          <i className="fa-solid fa-circle-exclamation"></i>
          <span className="flex-1">{error}</span>
          <button onClick={() => setError('')} className="text-red-400 hover:text-red-600">
            <i className="fa-solid fa-xmark"></i>
          </button>
        </div>
      )}

      {/* Search */}
      <div className="relative mb-6">
        <i className="fa-solid fa-search absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 text-sm"></i>
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder={t('searchCategories') || 'Search categories...'}
          className="w-full pl-10 pr-4 py-2.5 border border-gray-200 bg-white text-sm
            focus:outline-none focus:border-[#c8a96e] focus:ring-1 focus:ring-[#c8a96e]/30
            placeholder:text-gray-400"
        />
        {search && (
          <button
            onClick={() => setSearch('')}
            className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
          >
            <i className="fa-solid fa-xmark"></i>
          </button>
        )}
      </div>

      {/* Table */}
      {loading ? (
        <div className="flex items-center justify-center py-16">
          <i className="fa-solid fa-spinner fa-spin text-[#c8a96e] text-2xl"></i>
          <span className="ml-3 text-gray-500 text-sm">{t('loading') || 'Loading...'}</span>
        </div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-16 border border-dashed border-gray-200">
          <i className="fa-solid fa-folder-open text-gray-300 text-4xl mb-3"></i>
          <p className="text-gray-400 text-sm">
            {search
              ? (t('noSearchResults') || 'No categories match your search.')
              : (t('noCategories') || 'No categories yet. Create your first category.')}
          </p>
        </div>
      ) : (
        <div className="border border-gray-200 bg-white overflow-hidden">
          {/* Table header */}
          <div className="hidden md:grid grid-cols-12 gap-4 px-5 py-3 bg-gray-50 border-b border-gray-200 text-xs font-medium text-gray-500 uppercase tracking-wider">
            <div className="col-span-1">{t('order') || 'Order'}</div>
            <div className="col-span-2">{t('nameZh') || 'Name (ZH)'}</div>
            <div className="col-span-2">{t('nameEn') || 'Name (EN)'}</div>
            <div className="col-span-2">{t('nameDe') || 'Name (DE)'}</div>
            <div className="col-span-2">{t('slug') || 'Slug'}</div>
            <div className="col-span-1">{t('products') || 'Products'}</div>
            <div className="col-span-2 text-right">{t('actions') || 'Actions'}</div>
          </div>

          {/* Table rows */}
          <div className="divide-y divide-gray-100">
            {filtered.map((cat) => (
              <div
                key={cat.id}
                className="grid grid-cols-1 md:grid-cols-12 gap-2 md:gap-4 px-5 py-4 items-center
                  hover:bg-gray-50/50 transition-colors"
              >
                {/* Order */}
                <div className="col-span-1 text-sm text-gray-500 font-mono">
                  {cat.order}
                </div>

                {/* Image + names */}
                <div className="col-span-6 md:col-span-6 flex items-center gap-3 min-w-0">
                  <div className="w-10 h-10 bg-gray-100 rounded overflow-hidden shrink-0 flex items-center justify-center">
                    {cat.image ? (
                      <img
                        src={cat.image}
                        alt={cat.nameEn}
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          (e.target as HTMLImageElement).style.display = 'none';
                          (e.target as HTMLImageElement).parentElement!.innerHTML =
                            '<i class="fa-solid fa-image text-gray-300"></i>';
                        }}
                      />
                    ) : (
                      <i className="fa-solid fa-image text-gray-300"></i>
                    )}
                  </div>
                  <div className="min-w-0">
                    <p className="text-sm font-medium text-[#1a3a5c] truncate">
                      {cat.nameZh}
                    </p>
                    <p className="text-xs text-gray-400 truncate">
                      {cat.nameEn}
                    </p>
                  </div>
                </div>

                {/* Slug (desktop only) */}
                <div className="hidden md:block col-span-2 text-sm text-gray-500 font-mono truncate">
                  {cat.slug}
                </div>

                {/* Product count */}
                <div className="hidden md:block col-span-1 text-sm text-gray-500">
                  {cat._count?.products ?? '-'}
                </div>

                {/* Actions */}
                <div className="col-span-1 md:col-span-2 flex items-center justify-end gap-1.5">
                  <button
                    onClick={() => openEdit(cat)}
                    className="p-2 text-gray-400 hover:text-[#c8a96e] hover:bg-[#c8a96e]/10
                      transition-colors rounded"
                    title={t('edit') || 'Edit'}
                  >
                    <i className="fa-solid fa-pen text-sm"></i>
                  </button>
                  <button
                    onClick={() => confirmDelete(cat.id)}
                    className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50
                      transition-colors rounded"
                    title={t('delete') || 'Delete'}
                  >
                    <i className="fa-solid fa-trash-can text-sm"></i>
                  </button>
                </div>

                {/* Mobile-only slug row */}
                <div className="col-span-12 md:hidden text-xs text-gray-400 -mt-1">
                  {t('slug') || 'Slug'}: <span className="font-mono">{cat.slug}</span>
                  {' | '}
                  {t('order') || 'Order'}: {cat.order}
                  {cat._count ? ` | ${t('products') || 'Products'}: ${cat._count.products}` : ''}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ================================================================ */}
      {/*  Create / Edit Modal                                            */}
      {/* ================================================================ */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          {/* Backdrop */}
          <div
            className="absolute inset-0 bg-black/40"
            onClick={() => setModalOpen(false)}
          ></div>

          <div className="relative bg-white w-full max-w-xl shadow-xl">
            {/* Modal header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200">
              <h2 className="text-lg font-semibold text-[#1a3a5c]">
                {editingId !== null
                  ? (t('editCategory') || 'Edit Category')
                  : (t('addCategory') || 'Add Category')}
              </h2>
              <button
                onClick={() => setModalOpen(false)}
                className="text-gray-400 hover:text-gray-600 transition-colors"
              >
                <i className="fa-solid fa-xmark text-xl"></i>
              </button>
            </div>

            {/* Form */}
            <form onSubmit={handleSave} className="px-6 py-5 space-y-4">
              {formError && (
                <div className="p-3 bg-red-50 border border-red-200 text-red-700 text-sm">
                  <i className="fa-solid fa-circle-exclamation mr-2"></i>
                  {formError}
                </div>
              )}

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                {/* Name (Chinese) */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    {t('nameZh') || 'Name (Chinese)'}
                    <span className="text-red-400 ml-0.5">*</span>
                  </label>
                  <input
                    type="text"
                    value={form.nameZh}
                    onChange={(e) => handleNameChange('nameZh', e.target.value)}
                    required
                    className="w-full px-3 py-2 border border-gray-200 text-sm
                      focus:outline-none focus:border-[#c8a96e] focus:ring-1 focus:ring-[#c8a96e]/30"
                    placeholder={t('nameZhPlaceholder') || 'e.g. 铰链'}
                  />
                </div>

                {/* Name (English) */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    {t('nameEn') || 'Name (English)'}
                    <span className="text-red-400 ml-0.5">*</span>
                  </label>
                  <input
                    type="text"
                    value={form.nameEn}
                    onChange={(e) => handleNameChange('nameEn', e.target.value)}
                    required
                    className="w-full px-3 py-2 border border-gray-200 text-sm
                      focus:outline-none focus:border-[#c8a96e] focus:ring-1 focus:ring-[#c8a96e]/30"
                    placeholder={t('nameEnPlaceholder') || 'e.g. Hinges'}
                  />
                </div>

                {/* Name (German) */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    {t('nameDe') || 'Name (German)'}
                    <span className="text-red-400 ml-0.5">*</span>
                  </label>
                  <input
                    type="text"
                    value={form.nameDe}
                    onChange={(e) => handleNameChange('nameDe', e.target.value)}
                    required
                    className="w-full px-3 py-2 border border-gray-200 text-sm
                      focus:outline-none focus:border-[#c8a96e] focus:ring-1 focus:ring-[#c8a96e]/30"
                    placeholder={t('nameDePlaceholder') || 'e.g. Scharniere'}
                  />
                </div>
              </div>

              {/* Slug */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  {t('slug') || 'Slug'}
                  <span className="text-red-400 ml-0.5">*</span>
                </label>
                <input
                  type="text"
                  value={form.slug}
                  onChange={(e) => setForm({ ...form, slug: e.target.value })}
                  required
                  className="w-full px-3 py-2 border border-gray-200 text-sm font-mono
                    focus:outline-none focus:border-[#c8a96e] focus:ring-1 focus:ring-[#c8a96e]/30"
                  placeholder={t('slugPlaceholder') || 'e.g. hinges'}
                />
                <p className="text-xs text-gray-400 mt-1">
                  {t('slugHint') || 'Auto-generated from English name. Used in URLs.'}
                </p>
              </div>

              {/* Image URL */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  {t('imageUrl') || 'Image URL'}
                </label>
                <input
                  type="text"
                  value={form.image}
                  onChange={(e) => setForm({ ...form, image: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-200 text-sm
                    focus:outline-none focus:border-[#c8a96e] focus:ring-1 focus:ring-[#c8a96e]/30"
                  placeholder={t('imageUrlPlaceholder') || 'https://...'}
                />
              </div>

              {/* Order */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  {t('displayOrder') || 'Display Order'}
                </label>
                <input
                  type="number"
                  value={form.order}
                  onChange={(e) => setForm({ ...form, order: parseInt(e.target.value) || 0 })}
                  min="0"
                  className="w-full px-3 py-2 border border-gray-200 text-sm
                    focus:outline-none focus:border-[#c8a96e] focus:ring-1 focus:ring-[#c8a96e]/30"
                />
              </div>

              {/* Modal footer */}
              <div className="flex justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  className="px-5 py-2.5 border border-gray-200 text-sm text-gray-600
                    hover:bg-gray-50 transition-colors"
                >
                  {t('cancel') || 'Cancel'}
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="px-5 py-2.5 bg-[#1a3a5c] text-white text-sm font-medium
                    hover:bg-[#0f2640] transition-all disabled:opacity-50 disabled:cursor-not-allowed
                    flex items-center gap-2"
                >
                  {saving && <i className="fa-solid fa-spinner fa-spin"></i>}
                  {saving
                    ? (t('saving') || 'Saving...')
                    : editingId !== null
                      ? (t('update') || 'Update')
                      : (t('create') || 'Create')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ================================================================ */}
      {/*  Delete Confirmation Modal                                      */}
      {/* ================================================================ */}
      {deleteId !== null && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            className="absolute inset-0 bg-black/40"
            onClick={() => setDeleteId(null)}
          ></div>

          <div className="relative bg-white w-full max-w-sm shadow-xl p-6">
            <div className="text-center">
              <div className="w-14 h-14 mx-auto mb-4 bg-red-50 rounded-full flex items-center justify-center">
                <i className="fa-solid fa-trash-can text-red-400 text-xl"></i>
              </div>
              <h3 className="text-lg font-semibold text-[#1a3a5c] mb-2">
                {t('confirmDelete') || 'Confirm Delete'}
              </h3>
              <p className="text-sm text-gray-500 mb-6">
                {t('deleteCategoryWarning') ||
                  'Are you sure you want to delete this category? This action cannot be undone.'}
              </p>
              <div className="flex gap-3 justify-center">
                <button
                  onClick={() => setDeleteId(null)}
                  className="px-5 py-2.5 border border-gray-200 text-sm text-gray-600
                    hover:bg-gray-50 transition-colors"
                >
                  {t('cancel') || 'Cancel'}
                </button>
                <button
                  onClick={executeDelete}
                  disabled={deleting}
                  className="px-5 py-2.5 bg-red-600 text-white text-sm font-medium
                    hover:bg-red-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed
                    flex items-center gap-2"
                >
                  {deleting && <i className="fa-solid fa-spinner fa-spin"></i>}
                  {deleting
                    ? (t('deleting') || 'Deleting...')
                    : (t('delete') || 'Delete')}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </AdminLayout>
  );
}
