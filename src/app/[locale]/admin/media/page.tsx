'use client';

import { useTranslations } from 'next-intl';
import { usePathname } from 'next/navigation';
import { useState, useEffect, useCallback, useRef } from 'react';
import AdminLayout from '@/components/AdminLayout';

/* ------------------------------------------------------------------ */
/*  Types                                                              */
/* ------------------------------------------------------------------ */
interface MediaItem {
  id: number;
  filename: string;
  url: string;
  thumbUrl?: string;
  size: number;
  type: string;
  createdAt: string;
}

interface UploadProgress {
  filename: string;
  percent: number;
  status: 'uploading' | 'done' | 'error';
  error?: string;
}

/* ------------------------------------------------------------------ */
/*  Helpers                                                            */
/* ------------------------------------------------------------------ */
function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
}

function formatDate(dateStr: string): string {
  try {
    const d = new Date(dateStr);
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    const hours = String(d.getHours()).padStart(2, '0');
    const minutes = String(d.getMinutes()).padStart(2, '0');
    return `${year}-${month}-${day} ${hours}:${minutes}`;
  } catch {
    return dateStr;
  }
}

const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/gif', 'image/svg+xml'];
const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10 MB

/* ------------------------------------------------------------------ */
/*  Page                                                               */
/* ------------------------------------------------------------------ */
export default function AdminMediaPage() {
  const t = useTranslations('admin');
  const pathname = usePathname();
  const locale = pathname?.split('/')[1] || 'zh';

  const [media, setMedia] = useState<MediaItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  /* Upload state */
  const [uploads, setUploads] = useState<UploadProgress[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [dragOver, setDragOver] = useState(false);

  /* Delete confirmation */
  const [deleteTarget, setDeleteTarget] = useState<MediaItem | null>(null);
  const [deleting, setDeleting] = useState(false);

  /* View mode */
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');

  /* ------------------------------------------------------------------ */
  /*  Fetch media                                                       */
  /* ------------------------------------------------------------------ */
  const fetchMedia = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const res = await fetch('/api/media');
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = await res.json();
      setMedia(Array.isArray(data) ? data : []);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load media');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchMedia();
  }, [fetchMedia]);

  /* ------------------------------------------------------------------ */
  /*  Upload                                                             */
  /* ------------------------------------------------------------------ */
  const validateFiles = (files: FileList | File[]): File[] => {
    const valid: File[] = [];
    for (const file of Array.from(files)) {
      if (!ALLOWED_TYPES.includes(file.type)) {
        setUploads((prev) => [
          ...prev,
          {
            filename: file.name,
            percent: 0,
            status: 'error',
            error: `${file.name}: unsupported type (${file.type})`,
          },
        ]);
        continue;
      }
      if (file.size > MAX_FILE_SIZE) {
        setUploads((prev) => [
          ...prev,
          {
            filename: file.name,
            percent: 0,
            status: 'error',
            error: `${file.name}: exceeds 10 MB limit`,
          },
        ]);
        continue;
      }
      valid.push(file);
    }
    return valid;
  };

  const uploadFiles = async (files: FileList | File[]) => {
    const valid = validateFiles(files);
    if (valid.length === 0) return;

    for (const file of valid) {
      const id = `${file.name}-${Date.now()}`;
      setUploads((prev) => [
        ...prev,
        { filename: file.name, percent: 0, status: 'uploading' },
      ]);

      try {
        const formData = new FormData();
        formData.append('file', file);

        const xhr = new XMLHttpRequest();

        const uploadPromise = new Promise<void>((resolve, reject) => {
          xhr.upload.addEventListener('progress', (e) => {
            if (e.lengthComputable) {
              const percent = Math.round((e.loaded / e.total) * 100);
              setUploads((prev) =>
                prev.map((u) =>
                  u.filename === file.name ? { ...u, percent } : u,
                ),
              );
            }
          });

          xhr.addEventListener('load', () => {
            if (xhr.status >= 200 && xhr.status < 300) {
              resolve();
            } else {
              let msg = `HTTP ${xhr.status}`;
              try {
                const body = JSON.parse(xhr.responseText);
                msg = body.message || msg;
              } catch {
                // ignore parse error
              }
              reject(new Error(msg));
            }
          });

          xhr.addEventListener('error', () => reject(new Error('Network error')));
          xhr.addEventListener('abort', () => reject(new Error('Upload aborted')));

          xhr.open('POST', '/api/upload');
          xhr.send(formData);
        });

        await uploadPromise;

        setUploads((prev) =>
          prev.map((u) =>
            u.filename === file.name
              ? { ...u, percent: 100, status: 'done' }
              : u,
          ),
        );

        // Refresh the media list
        fetchMedia();
      } catch (err) {
        setUploads((prev) =>
          prev.map((u) =>
            u.filename === file.name
              ? {
                  ...u,
                  status: 'error',
                  error: err instanceof Error ? err.message : 'Upload failed',
                }
              : u,
          ),
        );
      }
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      uploadFiles(e.target.files);
      // Reset so same file can be re-uploaded
      e.target.value = '';
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragOver(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      uploadFiles(e.dataTransfer.files);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragOver(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragOver(false);
  };

  /* ------------------------------------------------------------------ */
  /*  Delete                                                             */
  /* ------------------------------------------------------------------ */
  const executeDelete = async () => {
    if (!deleteTarget) return;
    setDeleting(true);
    try {
      const res = await fetch(`/api/media?id=${deleteTarget.id}`, {
        method: 'DELETE',
      });
      if (!res.ok) {
        const errData = await res.json().catch(() => ({}));
        throw new Error(errData.message || `HTTP ${res.status}`);
      }
      setDeleteTarget(null);
      fetchMedia();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Delete failed');
    } finally {
      setDeleting(false);
    }
  };

  /* ------------------------------------------------------------------ */
  /*  Clear done upload notifications                                    */
  /* ------------------------------------------------------------------ */
  const clearDoneUploads = () => {
    setUploads((prev) =>
      prev.filter((u) => u.status === 'uploading'),
    );
  };

  /* ------------------------------------------------------------------ */
  /*  Render                                                             */
  /* ------------------------------------------------------------------ */
  return (
    <AdminLayout>
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-semibold text-[#1a3a5c]">
            {t('manageMedia') || 'Media'}
          </h1>
          <p className="text-gray-500 text-sm mt-1">
            Upload and manage images for your site.
          </p>
        </div>
        <div className="flex items-center gap-3">
          {/* View toggle */}
          <div className="flex border border-gray-200 rounded overflow-hidden">
            <button
              onClick={() => setViewMode('grid')}
              className={`px-3 py-2 text-sm transition-colors ${
                viewMode === 'grid'
                  ? 'bg-[#1a3a5c] text-white'
                  : 'bg-white text-gray-500 hover:bg-gray-50'
              }`}
              title="Grid view"
            >
              <i className="fa-solid fa-grid"></i>
            </button>
            <button
              onClick={() => setViewMode('list')}
              className={`px-3 py-2 text-sm transition-colors ${
                viewMode === 'list'
                  ? 'bg-[#1a3a5c] text-white'
                  : 'bg-white text-gray-500 hover:bg-gray-50'
              }`}
              title="List view"
            >
              <i className="fa-solid fa-list"></i>
            </button>
          </div>
          {/* Upload button */}
          <button
            onClick={() => fileInputRef.current?.click()}
            className="flex items-center gap-2 px-5 py-2.5 bg-[#1a3a5c] text-white text-sm font-medium
              hover:bg-[#0f2640] transition-all hover:-translate-y-0.5 hover:shadow-lg"
          >
            <i className="fa-solid fa-upload"></i>
            Upload Images
          </button>
        </div>
      </div>

      {/* Hidden file input */}
      <input
        ref={fileInputRef}
        type="file"
        multiple
        accept={ALLOWED_TYPES.join(',')}
        onChange={handleFileSelect}
        className="hidden"
      />

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

      {/* Upload progress */}
      {uploads.length > 0 && (
        <div className="mb-6 border border-gray-200 bg-white">
          <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100">
            <h3 className="text-sm font-medium text-[#1a3a5c]">
              <i className="fa-solid fa-cloud-arrow-up mr-2 text-[#c8a96e]"></i>
              Uploads
            </h3>
            <button
              onClick={clearDoneUploads}
              className="text-xs text-gray-400 hover:text-gray-600 transition-colors"
            >
              Clear completed
            </button>
          </div>
          <div className="divide-y divide-gray-100">
            {uploads.map((u, i) => (
              <div key={i} className="px-4 py-3 flex items-center gap-3">
                {/* Status icon */}
                {u.status === 'uploading' ? (
                  <i className="fa-solid fa-spinner fa-spin text-[#c8a96e] text-sm w-5"></i>
                ) : u.status === 'done' ? (
                  <i className="fa-solid fa-circle-check text-green-500 text-sm w-5"></i>
                ) : (
                  <i className="fa-solid fa-circle-exclamation text-red-500 text-sm w-5"></i>
                )}

                {/* Filename */}
                <span className="text-sm text-gray-700 flex-1 truncate min-w-0">
                  {u.filename}
                </span>

                {/* Progress bar or error */}
                {u.status === 'uploading' && (
                  <div className="w-32 bg-gray-100 rounded-full h-2 overflow-hidden shrink-0">
                    <div
                      className="h-full bg-[#c8a96e] rounded-full transition-all duration-300"
                      style={{ width: `${u.percent}%` }}
                    />
                  </div>
                )}

                {u.status === 'uploading' && (
                  <span className="text-xs text-gray-400 w-10 text-right shrink-0">
                    {u.percent}%
                  </span>
                )}

                {u.status === 'error' && u.error && (
                  <span className="text-xs text-red-500 truncate max-w-[200px] shrink-0">
                    {u.error}
                  </span>
                )}

                {u.status === 'done' && (
                  <span className="text-xs text-green-600 shrink-0">Done</span>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Drop zone */}
      <div
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onClick={() => fileInputRef.current?.click()}
        className={`mb-6 border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-all
          ${
            dragOver
              ? 'border-[#c8a96e] bg-[#c8a96e]/5'
              : 'border-gray-300 bg-white hover:border-gray-400 hover:bg-gray-50'
          }`}
      >
        <i className={`fa-solid fa-cloud-arrow-up text-3xl mb-3 transition-colors ${
          dragOver ? 'text-[#c8a96e]' : 'text-gray-300'
        }`}></i>
        <p className="text-sm text-gray-500">
          <span className="text-[#c8a96e] font-medium">Click to upload</span> or drag and drop
        </p>
        <p className="text-xs text-gray-400 mt-1">
          JPEG, PNG, WebP, GIF, SVG up to 10 MB
        </p>
      </div>

      {/* Media count */}
      {!loading && media.length > 0 && (
        <p className="text-xs text-gray-400 mb-3">
          {media.length} {media.length === 1 ? 'file' : 'files'} total
        </p>
      )}

      {/* Media content */}
      {loading ? (
        <div className="flex items-center justify-center py-16">
          <i className="fa-solid fa-spinner fa-spin text-[#c8a96e] text-2xl"></i>
          <span className="ml-3 text-gray-500 text-sm">{t('loading') || 'Loading...'}</span>
        </div>
      ) : media.length === 0 ? (
        <div className="text-center py-16 border border-dashed border-gray-200">
          <i className="fa-solid fa-images text-gray-300 text-4xl mb-3"></i>
          <p className="text-gray-400 text-sm">
            No images yet. Upload your first image above.
          </p>
        </div>
      ) : viewMode === 'grid' ? (
        /* ================================================================ */
        /*  Grid View                                                        */
        /* ================================================================ */
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
          {media.map((item) => (
            <div
              key={item.id}
              className="group bg-white border border-gray-200 overflow-hidden hover:shadow-md transition-all"
            >
              {/* Image preview */}
              <div className="aspect-square bg-gray-50 relative overflow-hidden">
                <img
                  src={item.thumbUrl || item.url}
                  alt={item.filename}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  onError={(e) => {
                    (e.target as HTMLImageElement).style.display = 'none';
                    const parent = (e.target as HTMLImageElement).parentElement;
                    if (parent) {
                      const icon = document.createElement('i');
                      icon.className = 'fa-solid fa-file-image text-gray-300 text-3xl';
                      parent.classList.add('flex', 'items-center', 'justify-center');
                      parent.prepend(icon);
                    }
                  }}
                  loading="lazy"
                />

                {/* Overlay actions */}
                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/30 transition-colors flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                  <div className="flex gap-2">
                    <a
                      href={item.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="w-9 h-9 bg-white/90 hover:bg-white rounded flex items-center justify-center
                        text-gray-700 hover:text-[#1a3a5c] transition-colors"
                      title="View full size"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <i className="fa-solid fa-expand text-sm"></i>
                    </a>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setDeleteTarget(item);
                      }}
                      className="w-9 h-9 bg-white/90 hover:bg-white rounded flex items-center justify-center
                        text-gray-700 hover:text-red-500 transition-colors"
                      title="Delete"
                    >
                      <i className="fa-solid fa-trash-can text-sm"></i>
                    </button>
                  </div>
                </div>
              </div>

              {/* Meta info */}
              <div className="p-2.5">
                <p className="text-xs text-gray-700 truncate" title={item.filename}>
                  {item.filename}
                </p>
                <div className="flex items-center justify-between mt-1">
                  <span className="text-[10px] text-gray-400">{formatFileSize(item.size)}</span>
                  <span className="text-[10px] text-gray-400">{formatDate(item.createdAt)}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        /* ================================================================ */
        /*  List View                                                        */
        /* ================================================================ */
        <div className="border border-gray-200 bg-white overflow-hidden">
          {/* Table header */}
          <div className="hidden md:grid grid-cols-12 gap-4 px-5 py-3 bg-gray-50 border-b border-gray-200 text-xs font-medium text-gray-500 uppercase tracking-wider">
            <div className="col-span-5">Filename</div>
            <div className="col-span-2">Type</div>
            <div className="col-span-2">Size</div>
            <div className="col-span-2">Uploaded</div>
            <div className="col-span-1 text-right">Actions</div>
          </div>

          <div className="divide-y divide-gray-100">
            {media.map((item) => (
              <div
                key={item.id}
                className="grid grid-cols-1 md:grid-cols-12 gap-2 md:gap-4 px-5 py-3 items-center
                  hover:bg-gray-50/50 transition-colors"
              >
                {/* Thumbnail + filename */}
                <div className="col-span-5 flex items-center gap-3 min-w-0">
                  <div className="w-10 h-10 bg-gray-100 rounded overflow-hidden shrink-0 flex items-center justify-center">
                    <img
                      src={item.thumbUrl || item.url}
                      alt={item.filename}
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        (e.target as HTMLImageElement).style.display = 'none';
                        (e.target as HTMLImageElement).parentElement!.innerHTML =
                          '<i class="fa-solid fa-file-image text-gray-300"></i>';
                      }}
                    />
                  </div>
                  <span className="text-sm text-gray-700 truncate" title={item.filename}>
                    {item.filename}
                  </span>
                </div>

                {/* Type */}
                <div className="hidden md:block col-span-2 text-sm text-gray-500 truncate">
                  {item.type}
                </div>

                {/* Size */}
                <div className="hidden md:block col-span-2 text-sm text-gray-500">
                  {formatFileSize(item.size)}
                </div>

                {/* Date */}
                <div className="hidden md:block col-span-2 text-sm text-gray-500">
                  {formatDate(item.createdAt)}
                </div>

                {/* Actions */}
                <div className="col-span-1 flex items-center justify-end gap-1.5">
                  <a
                    href={item.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="p-2 text-gray-400 hover:text-[#c8a96e] hover:bg-[#c8a96e]/10
                      transition-colors rounded"
                    title="View"
                  >
                    <i className="fa-solid fa-expand text-sm"></i>
                  </a>
                  <button
                    onClick={() => setDeleteTarget(item)}
                    className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50
                      transition-colors rounded"
                    title={t('delete') || 'Delete'}
                  >
                    <i className="fa-solid fa-trash-can text-sm"></i>
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ================================================================ */}
      {/*  Delete Confirmation Modal                                       */}
      {/* ================================================================ */}
      {deleteTarget !== null && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            className="absolute inset-0 bg-black/40"
            onClick={() => setDeleteTarget(null)}
          ></div>

          <div className="relative bg-white w-full max-w-sm shadow-xl p-6">
            <div className="text-center">
              {/* Preview */}
              <div className="w-24 h-24 mx-auto mb-4 rounded overflow-hidden border border-gray-200">
                <img
                  src={deleteTarget.thumbUrl || deleteTarget.url}
                  alt={deleteTarget.filename}
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    (e.target as HTMLImageElement).style.display = 'none';
                    (e.target as HTMLImageElement).parentElement!.innerHTML =
                      '<i class="fa-solid fa-file-image text-gray-300 text-2xl"></i>';
                    (e.target as HTMLImageElement).parentElement!.classList.add(
                      'flex', 'items-center', 'justify-center',
                    );
                  }}
                />
              </div>

              <h3 className="text-lg font-semibold text-[#1a3a5c] mb-2">
                Delete Image
              </h3>
              <p className="text-sm text-gray-500 mb-2">
                Are you sure you want to delete
              </p>
              <p className="text-sm font-medium text-[#1a3a5c] truncate mb-6">
                {deleteTarget.filename}
              </p>
              <div className="flex gap-3 justify-center">
                <button
                  onClick={() => setDeleteTarget(null)}
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
                    ? 'Deleting...'
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
