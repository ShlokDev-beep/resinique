'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { ChevronLeft, Upload, Plus, Pencil, Trash2, X } from 'lucide-react';
import { safeJsonParse } from '@/lib/utils';

interface Product {
  id: string;
  title: string;
  description: string;
  category: string;
  price: number;
  images: string;
  stock: number;
  leadTimeDays: number;
  isCustomizable: boolean;
  createdAt: string;
}

const categories = ['Coasters', 'Trays', 'Clocks & Art', 'Jewelry', 'Preserved Keepsakes'];

type FormState = {
  title: string;
  description: string;
  category: string;
  price: string;
  stock: string;
  leadTimeDays: string;
  isCustomizable: boolean;
  images: string[];
};

const emptyForm: FormState = {
  title: '',
  description: '',
  category: 'Coasters',
  price: '',
  stock: '1',
  leadTimeDays: '3',
  isCustomizable: false,
  images: [],
};

export default function AdminProductsPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [products, setProducts] = useState<Product[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const [form, setForm] = useState<FormState>(emptyForm);
  const [loading, setLoading] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);

  useEffect(() => {
    if (status === 'authenticated' && session?.user?.role !== 'ADMIN') {
      router.push('/admin');
    }
  }, [session, status, router]);

  useEffect(() => {
    if (status !== 'authenticated' || session?.user?.role !== 'ADMIN') return;
    fetch('/api/products')
      .then((r) => r.json())
      .then(setProducts);
  }, [status, session]);

  const handleImageUpload = async (files: FileList) => {
    const urls: string[] = [];
    for (const file of Array.from(files)) {
      const fd = new FormData();
      fd.append('file', file);
      const res = await fetch('/api/upload', { method: 'POST', body: fd });
      const data = await res.json();
      if (data.url) urls.push(data.url);
    }
    setForm((prev) => ({ ...prev, images: [...prev.images, ...urls] }));
  };

  const removeImage = (index: number) => {
    setForm((prev) => ({ ...prev, images: prev.images.filter((_, i) => i !== index) }));
  };

  const openEdit = (product: Product) => {
    setEditId(product.id);
    setForm({
      title: product.title,
      description: product.description,
      category: product.category,
      price: product.price.toString(),
      stock: product.stock.toString(),
      leadTimeDays: product.leadTimeDays.toString(),
      isCustomizable: product.isCustomizable,
      images: safeJsonParse<string[]>(product.images, []),
    });
    setShowForm(true);
  };

  const handleSubmit = async () => {
    setLoading(true);
    try {
      const payload = {
        title: form.title,
        description: form.description,
        category: form.category,
        price: parseFloat(form.price),
        stock: parseInt(form.stock),
        leadTimeDays: parseInt(form.leadTimeDays),
        isCustomizable: form.isCustomizable,
        images: form.images,
      };

      if (editId) {
        const res = await fetch('/api/admin/products', {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ id: editId, ...payload }),
        });
        const updated = await res.json();
        if (!updated.error) {
          setProducts((prev) => prev.map((p) => (p.id === editId ? updated : p)));
        }
      } else {
        const res = await fetch('/api/admin/products', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        });
        const product = await res.json();
        if (!product.error) {
          setProducts((prev) => [product, ...prev]);
        }
      }
      setShowForm(false);
      setEditId(null);
      setForm(emptyForm);
    } catch {
      alert(editId ? 'Failed to update product' : 'Failed to create product');
    }
    setLoading(false);
  };

  const handleDelete = async (id: string) => {
    setLoading(true);
    try {
      const res = await fetch(`/api/admin/products?id=${id}`, { method: 'DELETE' });
      const data = await res.json();
      if (data.success) {
        setProducts((prev) => prev.filter((p) => p.id !== id));
      }
    } catch {
      alert('Failed to delete product');
    }
    setDeleteConfirm(null);
    setLoading(false);
  };

  return (
    <div className="max-w-6xl mx-auto px-4 py-10">
      <a href="/admin" className="inline-flex items-center gap-1 text-sm text-charcoal-700/60 hover:text-amber-warm mb-6">
        <ChevronLeft className="w-4 h-4" /> Dashboard
      </a>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-3xl font-bold">Product Inventory</h1>
        <button
          onClick={() => { setShowForm(!showForm); setEditId(null); setForm(emptyForm); }}
          className="btn-primary flex items-center gap-2 text-sm"
        >
          <Plus className="w-4 h-4" /> Add Product
        </button>
      </div>

      {showForm && (
        <div className="card p-6 mb-8 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-bold">{editId ? 'Edit Product' : 'New Product'}</h2>
            <button onClick={() => { setShowForm(false); setEditId(null); }} className="p-1 hover:text-amber-warm">
              <X className="w-5 h-5" />
            </button>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">Title</label>
              <input value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} className="input-field" />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Category</label>
              <select value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })} className="input-field">
                {categories.map((c) => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Price (₹)</label>
              <input type="number" value={form.price} onChange={(e) => setForm({ ...form, price: e.target.value })} className="input-field" />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Stock</label>
              <input type="number" value={form.stock} onChange={(e) => setForm({ ...form, stock: e.target.value })} className="input-field" />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Lead Time (days)</label>
              <input type="number" value={form.leadTimeDays} onChange={(e) => setForm({ ...form, leadTimeDays: e.target.value })} className="input-field" />
            </div>
            <div className="flex items-center gap-2 pt-6">
              <input type="checkbox" checked={form.isCustomizable} onChange={(e) => setForm({ ...form, isCustomizable: e.target.checked })} className="rounded" />
              <label className="text-sm">Customizable</label>
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Description</label>
            <textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} className="input-field" rows={3} />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Product Photos</label>
            <div className="border-2 border-dashed border-cream-400 rounded-xl p-6 text-center hover:border-amber-warm transition-colors">
              <Upload className="w-8 h-8 mx-auto mb-2 text-cream-400" />
              <input
                type="file"
                accept="image/*"
                multiple
                onChange={(e) => e.target.files && handleImageUpload(e.target.files)}
                className="hidden"
                id="product-photos"
              />
              <label htmlFor="product-photos" className="cursor-pointer text-sm text-charcoal-700/60 hover:text-amber-warm">
                Click to upload photos
              </label>
            </div>
            {form.images.length > 0 && (
              <div className="flex gap-2 mt-3 flex-wrap">
                {form.images.map((url, i) => (
                  <div key={i} className="relative group">
                    <img src={url} alt="" className="w-16 h-16 rounded-lg object-cover border border-cream-200" />
                    <button
                      onClick={() => removeImage(i)}
                      className="absolute -top-2 -right-2 w-5 h-5 bg-red-500 text-white rounded-full text-xs flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      ×
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
          <div className="flex gap-3">
            <button onClick={handleSubmit} disabled={loading} className="btn-primary text-sm">
              {loading ? 'Saving...' : editId ? 'Update Product' : 'Save Product'}
            </button>
            <button onClick={() => { setShowForm(false); setEditId(null); setForm(emptyForm); }} className="btn-secondary text-sm">Cancel</button>
          </div>
        </div>
      )}

      <div className="space-y-3">
        {products.length === 0 ? (
          <p className="text-center text-charcoal-700/60 py-12">No products yet</p>
        ) : (
          products.map((p) => {
            const imageList = safeJsonParse<string[]>(p.images, []);
            return (
              <div key={p.id} className="card p-4 flex items-center gap-4">
                <div className="w-16 h-16 bg-cream-100 rounded-lg overflow-hidden flex-shrink-0">
                  <img src={imageList[0] || '/uploads/placeholder.svg'} alt={p.title} className="w-full h-full object-cover" />
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="font-medium text-sm truncate">{p.title}</h3>
                  <p className="text-xs text-charcoal-700/50">
                    {p.category} • ₹{p.price.toLocaleString()}
                    {p.isCustomizable && ' • Customizable'}
                  </p>
                  <div className="mt-1">
                    {p.stock <= 0 ? (
                      <span className="inline-flex items-center gap-1 text-xs bg-red-50 text-red-600 px-2 py-0.5 rounded-full">
                        <X className="w-3 h-3" /> Out of stock
                      </span>
                    ) : p.stock <= 3 ? (
                      <span className="inline-flex items-center gap-1 text-xs bg-amber-light/40 text-amber-deep px-2 py-0.5 rounded-full">
                        Low stock: {p.stock} left
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 text-xs bg-green-50 text-green-700 px-2 py-0.5 rounded-full">
                        In stock: {p.stock}
                      </span>
                    )}
                  </div>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => openEdit(p)}
                    className="p-2 bg-cream-100 rounded-lg hover:bg-cream-200 transition-colors"
                    title="Edit"
                  >
                    <Pencil className="w-4 h-4" />
                  </button>
                  {deleteConfirm === p.id ? (
                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => handleDelete(p.id)}
                        disabled={loading}
                        className="text-xs bg-red-500 text-white px-2 py-1 rounded"
                      >
                        Delete
                      </button>
                      <button
                        onClick={() => setDeleteConfirm(null)}
                        className="text-xs bg-cream-200 text-charcoal-700 px-2 py-1 rounded"
                      >
                        Cancel
                      </button>
                    </div>
                  ) : (
                    <button
                      onClick={() => setDeleteConfirm(p.id)}
                      className="p-2 bg-red-50 text-red-500 rounded-lg hover:bg-red-100 transition-colors"
                      title="Delete"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
