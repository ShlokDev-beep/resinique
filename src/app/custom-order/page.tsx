'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { commissionSchema } from '@/lib/validations';
import { Upload, ExternalLink, CheckCircle } from 'lucide-react';

type CommissionForm = {
  customerName: string;
  customerPhone: string;
  itemType: string;
  colorPalette: string;
  inclusions: string;
  notes: string;
};

const itemTypes = [
  'Geode Clock', 'Preserved Bouquet Tray', 'Coaster Set', 'Jewelry Set',
  'Wall Art', 'Photo Frame', 'Keepsake Box', 'Resin Table Top', 'Other',
];

export default function CustomOrderPage() {
  const [refFile, setRefFile] = useState<File | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [result, setResult] = useState<any>(null);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<CommissionForm>({
    resolver: zodResolver(commissionSchema),
  });

  const onSubmit = async (formData: CommissionForm) => {
    setSubmitting(true);
    try {
      let uploadedUrl = '';
      if (refFile) {
        const fd = new FormData();
        fd.append('file', refFile);
        const uploadRes = await fetch('/api/upload', { method: 'POST', body: fd });
        const uploadData = await uploadRes.json();
        uploadedUrl = uploadData.url;
      }

      const res = await fetch('/api/commissions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...formData, referenceImage: uploadedUrl }),
      });

      const data = await res.json();
      if (data.error) throw new Error(data.error);
      setResult(data);
    } catch (err: any) {
      alert(err.message || 'Failed to submit request');
    } finally {
      setSubmitting(false);
    }
  };

  if (result) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-16 text-center">
        <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
        <h1 className="text-3xl font-bold mb-4">Request Submitted!</h1>
        <p className="text-charcoal-700/70 mb-6">
          Pallavi will review your request and share a quote shortly.
        </p>
        <a
          href={result.whatsappUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="btn-primary inline-flex items-center gap-2 mb-4"
        >
          Send on WhatsApp <ExternalLink className="w-4 h-4" />
        </a>
        <br />
        <a href="/products" className="text-amber-warm hover:underline text-sm">
          Browse Ready-Made Pieces
        </a>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto px-4 py-10">
      <h1 className="text-3xl font-bold mb-2">Custom Commission</h1>
      <p className="text-charcoal-700/70 mb-8">
        Tell us about your dream resin piece and we&apos;ll create a quote just for you.
      </p>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        <div className="card p-6 space-y-4">
          <h2 className="text-lg font-bold">Your Details</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">Full Name</label>
              <input {...register('customerName')} className="input-field" placeholder="Your name" />
              {errors.customerName && <p className="text-red-500 text-xs mt-1">{errors.customerName.message}</p>}
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Phone</label>
              <input {...register('customerPhone')} className="input-field" placeholder="+91 XXXXX XXXXX" />
              {errors.customerPhone && <p className="text-red-500 text-xs mt-1">{errors.customerPhone.message}</p>}
            </div>
          </div>
        </div>

        <div className="card p-6 space-y-4">
          <h2 className="text-lg font-bold">Piece Details</h2>
          <div>
            <label className="block text-sm font-medium mb-1">Item Type</label>
            <select {...register('itemType')} className="input-field">
              <option value="">Select type...</option>
              {itemTypes.map((type) => (
                <option key={type} value={type}>{type}</option>
              ))}
            </select>
            {errors.itemType && <p className="text-red-500 text-xs mt-1">{errors.itemType.message}</p>}
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Color Palette</label>
            <input {...register('colorPalette')} className="input-field" placeholder="e.g. Rose gold, blush pink, white" />
            {errors.colorPalette && <p className="text-red-500 text-xs mt-1">{errors.colorPalette.message}</p>}
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Inclusions</label>
            <input {...register('inclusions')} className="input-field" placeholder="e.g. Gold foil, pressed flowers, stones" />
            {errors.inclusions && <p className="text-red-500 text-xs mt-1">{errors.inclusions.message}</p>}
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Additional Notes</label>
            <textarea {...register('notes')} className="input-field" rows={3} placeholder="Any specific requests, sizes, or references..." />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Reference Image (optional)</label>
            <div className="border-2 border-dashed border-cream-400 rounded-xl p-6 text-center hover:border-amber-warm transition-colors">
              <Upload className="w-8 h-8 mx-auto mb-2 text-cream-400" />
              <input
                type="file"
                accept="image/*"
                onChange={(e) => setRefFile(e.target.files?.[0] || null)}
                className="hidden"
                id="ref-upload"
              />
              <label htmlFor="ref-upload" className="cursor-pointer text-sm text-charcoal-700/60 hover:text-amber-warm">
                {refFile ? refFile.name : 'Upload inspiration image'}
              </label>
            </div>
          </div>
        </div>

        <button type="submit" disabled={submitting} className="btn-primary w-full">
          {submitting ? 'Submitting...' : 'Submit Commission Request'}
        </button>
      </form>
    </div>
  );
}
