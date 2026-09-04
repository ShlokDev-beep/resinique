'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { ChevronLeft, Eye, CheckCircle, XCircle, MessageCircle, ExternalLink, Package, Truck } from 'lucide-react';

interface Commission {
  id: string;
  customerName: string;
  customerPhone: string;
  itemType: string;
  colorPalette: string;
  inclusions: string;
  notes: string;
  referenceImage: string | null;
  quotePrice: number | null;
  status: string;
  createdAt: string;
}

const statusColors: Record<string, string> = {
  PENDING_REVIEW: 'badge-pending',
  QUOTED: 'badge bg-purple-50 text-purple-700',
  APPROVED: 'badge-verified',
  IN_PRODUCTION: 'badge bg-blue-50 text-blue-700',
  SHIPPED: 'badge-shipped',
  REJECTED: 'badge-cancelled',
};

export default function AdminCommissionsPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [commissions, setCommissions] = useState<Commission[]>([]);
  const [selected, setSelected] = useState<Commission | null>(null);
  const [quotePrice, setQuotePrice] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (status === 'authenticated' && session?.user?.role !== 'ADMIN') {
      router.push('/admin');
    }
  }, [session, status, router]);

  useEffect(() => {
    if (status !== 'authenticated' || session?.user?.role !== 'ADMIN') return;
    fetch('/api/commissions')
      .then((r) => r.json())
      .then(setCommissions);
  }, [status, session]);

  const updateCommission = async (id: string, data: Record<string, string | number | undefined>) => {
    setLoading(true);
    await fetch('/api/commissions', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id, ...data }),
    });
    const updated = await fetch('/api/commissions').then((r) => r.json());
    setCommissions(updated);
    setSelected(null);
    setLoading(false);
  };

  const formatStatus = (s: string) => s.replace(/_/g, ' ').toLowerCase().replace(/\b\w/g, (c) => c.toUpperCase());

  const getNotifyLink = (c: Commission, status: string, quote?: number) => {
    const phone = c.customerPhone.replace(/\D/g, '');
    let message = `Hi ${c.customerName}, about your ${c.itemType} commission`;
    switch (status) {
      case 'QUOTED':
        message = `Hi ${c.customerName}! Good news — your "${c.itemType}" commission quote is ready: ₹${(quote || 0).toLocaleString()}. Would you like to go ahead?`;
        break;
      case 'APPROVED':
        message = `Hi ${c.customerName}! Your "${c.itemType}" commission has been approved and is in the queue. We'll update you as we get started!`;
        break;
      case 'IN_PRODUCTION':
        message = `Hi ${c.customerName}! Great news — we've started crafting your "${c.itemType}" commission. Stay tuned for progress updates!`;
        break;
      case 'SHIPPED':
        message = `Hi ${c.customerName}! Your "${c.itemType}" commission has been shipped 🎉`;
        break;
      case 'REJECTED':
        message = `Hi ${c.customerName}, we're sorry, but we're unable to take on your "${c.itemType}" commission at this time. Please reach out if you'd like to discuss alternatives.`;
        break;
      default:
        return null;
    }
    return `https://wa.me/${phone}?text=${encodeURIComponent(message)}`;
  };

  return (
    <div className="max-w-6xl mx-auto px-4 py-10">
      <a href="/admin" className="inline-flex items-center gap-1 text-sm text-charcoal-700/60 hover:text-amber-warm mb-6">
        <ChevronLeft className="w-4 h-4" /> Dashboard
      </a>
      <h1 className="text-3xl font-bold mb-6">Commissions Inbox</h1>

      <div className="space-y-3">
        {commissions.length === 0 ? (
          <p className="text-center text-charcoal-700/60 py-12">No commission requests</p>
        ) : (
          commissions.map((c) => (
            <div key={c.id} className="card p-4 flex flex-col md:flex-row md:items-center gap-4">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-3 mb-1">
                  <span className="font-bold text-sm">{c.itemType}</span>
                  <span className={statusColors[c.status] || 'badge'}>{formatStatus(c.status)}</span>
                </div>
                <p className="text-sm text-charcoal-700/60">{c.customerName} • {c.customerPhone}</p>
                <p className="text-xs text-charcoal-700/40 mt-1">
                  Colors: {c.colorPalette} • Inclusions: {c.inclusions}
                </p>
                {c.quotePrice && (
                  <p className="text-xs text-amber-warm font-bold mt-1">Quote: ₹{c.quotePrice.toLocaleString()}</p>
                )}
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => {
                    setSelected(c);
                    setQuotePrice(c.quotePrice?.toString() || '');
                  }}
                  className="p-2 bg-cream-100 rounded-lg hover:bg-cream-200 transition-colors"
                >
                  <Eye className="w-4 h-4" />
                </button>
                {(() => {
                  const n = c.status === 'QUOTED'
                    ? getNotifyLink(c, 'QUOTED', c.quotePrice || 0)
                    : c.status === 'APPROVED'
                      ? getNotifyLink(c, 'APPROVED')
                      : null;
                  return n && (
                    <a
                      href={n}
                      target="_blank"
                      rel="noopener noreferrer"
                      title="Notify customer on WhatsApp"
                      className="p-2 bg-green-50 text-green-600 rounded-lg hover:bg-green-100 transition-colors"
                    >
                      <MessageCircle className="w-4 h-4" />
                    </a>
                  );
                })()}
              </div>
            </div>
          ))
        )}
      </div>

      {selected && (
        <>
          <div className="fixed inset-0 bg-black/40 z-50" onClick={() => setSelected(null)} />
          <div className="fixed inset-4 md:inset-auto md:top-1/2 md:left-1/2 md:-translate-x-1/2 md:-translate-y-1/2 md:w-full md:max-w-lg md:max-h-[80vh] bg-white rounded-2xl z-50 overflow-y-auto">
            <div className="p-6 space-y-6">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-bold">{selected.itemType}</h2>
                <button onClick={() => setSelected(null)} className="text-charcoal-700/40 hover:text-charcoal-900 text-2xl">×</button>
              </div>

              <div className="space-y-3 text-sm">
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <p className="text-charcoal-700/50 text-xs">Customer</p>
                    <p className="font-medium">{selected.customerName}</p>
                  </div>
                  <div>
                    <p className="text-charcoal-700/50 text-xs">Phone</p>
                    <p className="font-medium">{selected.customerPhone}</p>
                  </div>
                </div>
                <div>
                  <p className="text-charcoal-700/50 text-xs">Color Palette</p>
                  <p className="font-medium">{selected.colorPalette}</p>
                </div>
                <div>
                  <p className="text-charcoal-700/50 text-xs">Inclusions</p>
                  <p className="font-medium">{selected.inclusions}</p>
                </div>
                {selected.notes && (
                  <div>
                    <p className="text-charcoal-700/50 text-xs">Notes</p>
                    <p className="font-medium">{selected.notes}</p>
                  </div>
                )}
                {selected.referenceImage && (
                  <div>
                    <p className="text-charcoal-700/50 text-xs mb-2">Reference Image</p>
                    <img src={selected.referenceImage} alt="Reference" className="w-full rounded-xl border border-cream-200" />
                  </div>
                )}
              </div>

              <div className="border-t border-cream-200 pt-4 space-y-3">
                <h3 className="font-bold text-sm">Set Quote Price</h3>
                <input
                  type="number"
                  placeholder="₹ Price"
                  value={quotePrice}
                  onChange={(e) => setQuotePrice(e.target.value)}
                  className="input-field text-sm"
                />
                <div className="flex gap-2 flex-wrap">
                  <button
                    onClick={() => updateCommission(selected.id, { status: 'QUOTED', quotePrice: parseFloat(quotePrice) })}
                    disabled={loading || !quotePrice}
                    className="btn-primary text-sm"
                  >
                    Send Quote
                  </button>
                  <button
                    onClick={() => updateCommission(selected.id, { status: 'APPROVED' })}
                    disabled={loading}
                    className="bg-green-100 text-green-700 px-4 py-2 rounded-lg text-sm hover:bg-green-200 flex items-center gap-1"
                  >
                    <CheckCircle className="w-4 h-4" /> Approve
                  </button>
                  <button
                    onClick={() => updateCommission(selected.id, { status: 'REJECTED' })}
                    disabled={loading}
                    className="bg-red-100 text-red-700 px-4 py-2 rounded-lg text-sm hover:bg-red-200 flex items-center gap-1"
                  >
                    <XCircle className="w-4 h-4" /> Reject
                  </button>
                </div>
                <div className="space-y-2 pt-2">
                  {(() => {
                    const quoteLink = getNotifyLink(selected, 'QUOTED', parseFloat(quotePrice) || 0);
                    const approveLink = getNotifyLink(selected, 'APPROVED');
                    const rejectLink = getNotifyLink(selected, 'REJECTED');
                    const productionLink = getNotifyLink(selected, 'IN_PRODUCTION');
                    const shippedLink = getNotifyLink(selected, 'SHIPPED');
                    return (
                      <>
                        {quoteLink && quotePrice && (
                          <a href={quoteLink} target="_blank" rel="noopener noreferrer" className="text-xs text-green-600 hover:underline inline-flex items-center gap-1">
                            <MessageCircle className="w-3 h-3" /> Send quote on WhatsApp <ExternalLink className="w-3 h-3" />
                          </a>
                        )}
                        {approveLink && (
                          <a href={approveLink} target="_blank" rel="noopener noreferrer" className="text-xs text-green-600 hover:underline inline-flex items-center gap-1">
                            <MessageCircle className="w-3 h-3" /> Notify approval on WhatsApp <ExternalLink className="w-3 h-3" />
                          </a>
                        )}
                        {rejectLink && (
                          <a href={rejectLink} target="_blank" rel="noopener noreferrer" className="text-xs text-red-500 hover:underline inline-flex items-center gap-1">
                            <MessageCircle className="w-3 h-3" /> Notify rejection on WhatsApp <ExternalLink className="w-3 h-3" />
                          </a>
                        )}
                        {productionLink && (
                          <a href={productionLink} target="_blank" rel="noopener noreferrer" className="text-xs text-green-600 hover:underline inline-flex items-center gap-1">
                            <MessageCircle className="w-3 h-3" /> Notify production start on WhatsApp <ExternalLink className="w-3 h-3" />
                          </a>
                        )}
                        {shippedLink && (
                          <a href={shippedLink} target="_blank" rel="noopener noreferrer" className="text-xs text-green-600 hover:underline inline-flex items-center gap-1">
                            <MessageCircle className="w-3 h-3" /> Notify shipment on WhatsApp <ExternalLink className="w-3 h-3" />
                          </a>
                        )}
                      </>
                    );
                  })()}
                </div>

                {selected.status === 'APPROVED' && (
                  <div className="border-t border-cream-200 pt-3">
                    <button
                      onClick={() => updateCommission(selected.id, { status: 'IN_PRODUCTION' })}
                      disabled={loading}
                      className="bg-blue-100 text-blue-700 px-4 py-2 rounded-lg text-sm hover:bg-blue-200 flex items-center gap-1"
                    >
                      <Package className="w-4 h-4" /> Start Production
                    </button>
                  </div>
                )}
                {selected.status === 'IN_PRODUCTION' && (
                  <div className="border-t border-cream-200 pt-3">
                    <button
                      onClick={() => updateCommission(selected.id, { status: 'SHIPPED' })}
                      disabled={loading}
                      className="bg-purple-100 text-purple-700 px-4 py-2 rounded-lg text-sm hover:bg-purple-200 flex items-center gap-1"
                    >
                      <Truck className="w-4 h-4" /> Mark Shipped
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
