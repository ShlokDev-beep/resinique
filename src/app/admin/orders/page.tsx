'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { ChevronLeft, Eye, Truck, CheckCircle, XCircle, MessageCircle, ExternalLink, StickyNote } from 'lucide-react';

interface OrderItem {
  id: string;
  quantity: number;
  priceAtSale: number;
  product: { title: string };
}

interface Order {
  id: string;
  orderNumber: string;
  customerName: string;
  customerPhone: string;
  shippingAddress: string;
  totalAmount: number;
  utrNumber: string;
  proofImageUrl: string;
  status: string;
  trackingUrl: string | null;
  courierName: string | null;
  adminNotes: string | null;
  items: OrderItem[];
  createdAt: string;
}

const statuses = ['ALL', 'PENDING_VERIFICATION', 'PAYMENT_VERIFIED', 'PROCESSING', 'CURING', 'SHIPPED', 'DELIVERED', 'CANCELLED'];
const statusColors: Record<string, string> = {
  PENDING_VERIFICATION: 'badge-pending',
  PAYMENT_VERIFIED: 'badge-verified',
  PROCESSING: 'badge bg-blue-50 text-blue-700',
  CURING: 'badge bg-purple-50 text-purple-700',
  SHIPPED: 'badge-shipped',
  DELIVERED: 'badge bg-green-100 text-green-800',
  CANCELLED: 'badge-cancelled',
};

export default function AdminOrdersPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [orders, setOrders] = useState<Order[]>([]);
  const [filter, setFilter] = useState('ALL');
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [trackingUrl, setTrackingUrl] = useState('');
  const [courierName, setCourierName] = useState('');
  const [adminNotes, setAdminNotes] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (status === 'authenticated' && session?.user?.role !== 'ADMIN') {
      router.push('/admin');
    }
  }, [session, status, router]);

  useEffect(() => {
    if (status !== 'authenticated' || session?.user?.role !== 'ADMIN') return;
    fetch(`/api/admin/orders?status=${filter}`)
      .then((r) => r.json())
      .then(setOrders);
  }, [filter, status, session]);

  const updateOrder = async (id: string, data: Record<string, string | undefined>) => {
    setLoading(true);
    await fetch('/api/admin/orders', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id, ...data }),
    });
    const updated = await fetch(`/api/admin/orders?status=${filter}`).then((r) => r.json());
    setOrders(updated);
    setSelectedOrder(null);
    setLoading(false);
  };

  const getNotifyLink = (order: Order, status: string) => {
    const phone = order.customerPhone.replace(/\D/g, '');
    let message = `Hi ${order.customerName}, your Resinique order ${order.orderNumber}`;
    switch (status) {
      case 'PAYMENT_VERIFIED':
        message += ' has been verified and will start preparing soon!';
        break;
      case 'PROCESSING':
        message += ' is now being prepared with love 💛';
        break;
      case 'SHIPPED':
        message += ` has been shipped${order.courierName ? ` via ${order.courierName}` : ''}${order.trackingUrl ? ` — track it here: ${order.trackingUrl}` : ''}!`;
        break;
      case 'DELIVERED':
        message += ' has been delivered. Enjoy your piece! 🎉';
        break;
      case 'CANCELLED':
        message += ' was cancelled. Please contact us for a refund.';
        break;
      default:
        return null;
    }
    return `https://wa.me/${phone}?text=${encodeURIComponent(message)}`;
  };

  const openOrder = (order: Order) => {
    setSelectedOrder(order);
    setTrackingUrl(order.trackingUrl || '');
    setCourierName(order.courierName || '');
    setAdminNotes(order.adminNotes || '');
  };

  const formatStatus = (s: string) => s.replace(/_/g, ' ').toLowerCase().replace(/\b\w/g, (c) => c.toUpperCase());

  const saveNotes = async () => {
    if (!selectedOrder) return;
    setLoading(true);
    await fetch('/api/admin/orders', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id: selectedOrder.id, adminNotes }),
    });
    setSelectedOrder({ ...selectedOrder, adminNotes });
    setLoading(false);
    alert('Notes saved');
  };

  return (
    <div className="max-w-6xl mx-auto px-4 py-10">
      <a href="/admin" className="inline-flex items-center gap-1 text-sm text-charcoal-700/60 hover:text-amber-warm mb-6">
        <ChevronLeft className="w-4 h-4" /> Dashboard
      </a>
      <h1 className="text-3xl font-bold mb-6">Orders Management</h1>

      <div className="flex gap-2 overflow-x-auto pb-4 mb-6">
        {statuses.map((s) => (
          <button
            key={s}
            onClick={() => setFilter(s)}
            className={`px-4 py-2 rounded-full text-xs font-medium whitespace-nowrap transition-colors ${
              filter === s ? 'bg-amber-warm text-white' : 'bg-cream-200 text-charcoal-700 hover:bg-cream-300'
            }`}
          >
            {s === 'ALL' ? 'All' : formatStatus(s)}
          </button>
        ))}
      </div>

      <div className="space-y-3">
        {orders.length === 0 ? (
          <p className="text-center text-charcoal-700/60 py-12">No orders found</p>
        ) : (
          orders.map((order) => (
            <div key={order.id} className="card p-4 flex flex-col md:flex-row md:items-center gap-4">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-3 mb-1">
                  <span className="font-mono font-bold text-sm">{order.orderNumber}</span>
                  {order.adminNotes && (
                    <StickyNote className="w-3.5 h-3.5 text-amber-deep" aria-label="Has internal notes" />
                  )}
                  <span className={statusColors[order.status] || 'badge'}>
                    {formatStatus(order.status)}
                  </span>
                </div>
                <p className="text-sm text-charcoal-700/60">{order.customerName} • {order.customerPhone}</p>
                <p className="text-xs text-charcoal-700/40 mt-1">
                  ₹{order.totalAmount.toLocaleString()} • UTR: {order.utrNumber} • {new Date(order.createdAt).toLocaleDateString()}
                </p>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => openOrder(order)}
                  className="p-2 bg-cream-100 rounded-lg hover:bg-cream-200 transition-colors"
                >
                  <Eye className="w-4 h-4" />
                </button>
                {getNotifyLink(order, order.status) && (
                  <a
                    href={getNotifyLink(order, order.status)!}
                    target="_blank"
                    rel="noopener noreferrer"
                    title="Notify customer on WhatsApp"
                    className="p-2 bg-green-50 text-green-600 rounded-lg hover:bg-green-100 transition-colors"
                  >
                    <MessageCircle className="w-4 h-4" />
                  </a>
                )}
                {order.status === 'PENDING_VERIFICATION' && (
                  <button
                    onClick={() => updateOrder(order.id, { status: 'PAYMENT_VERIFIED' })}
                    disabled={loading}
                    className="p-2 bg-green-100 text-green-700 rounded-lg hover:bg-green-200 transition-colors"
                  >
                    <CheckCircle className="w-4 h-4" />
                  </button>
                )}
                {order.status === 'PENDING_VERIFICATION' && (
                  <button
                    onClick={() => updateOrder(order.id, { status: 'CANCELLED' })}
                    disabled={loading}
                    className="p-2 bg-red-100 text-red-700 rounded-lg hover:bg-red-200 transition-colors"
                  >
                    <XCircle className="w-4 h-4" />
                  </button>
                )}
              </div>
            </div>
          ))
        )}
      </div>

      {selectedOrder && (
        <>
          <div className="fixed inset-0 bg-black/40 z-50" onClick={() => setSelectedOrder(null)} />
          <div className="fixed inset-4 md:inset-auto md:top-1/2 md:left-1/2 md:-translate-x-1/2 md:-translate-y-1/2 md:w-full md:max-w-2xl md:max-h-[80vh] bg-white rounded-2xl z-50 overflow-y-auto">
            <div className="p-6 space-y-6">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-bold">{selectedOrder.orderNumber}</h2>
                <button onClick={() => setSelectedOrder(null)} className="text-charcoal-700/40 hover:text-charcoal-900 text-2xl">
                  ×
                </button>
              </div>

              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <p className="text-charcoal-700/50 text-xs">Customer</p>
                  <p className="font-medium">{selectedOrder.customerName}</p>
                </div>
                <div>
                  <p className="text-charcoal-700/50 text-xs">Phone</p>
                  <p className="font-medium">{selectedOrder.customerPhone}</p>
                </div>
                <div className="col-span-2">
                  <p className="text-charcoal-700/50 text-xs">Address</p>
                  <p className="font-medium">{selectedOrder.shippingAddress}</p>
                </div>
                <div>
                  <p className="text-charcoal-700/50 text-xs">Total</p>
                  <p className="font-bold text-amber-warm">₹{selectedOrder.totalAmount.toLocaleString()}</p>
                </div>
                <div>
                  <p className="text-charcoal-700/50 text-xs">UTR</p>
                  <p className="font-mono font-medium">{selectedOrder.utrNumber}</p>
                </div>
              </div>

              {selectedOrder.proofImageUrl && (
                <div>
                  <p className="text-charcoal-700/50 text-xs mb-2">Payment Proof</p>
                  <img
                    src={selectedOrder.proofImageUrl}
                    alt="Payment proof"
                    className="w-full max-w-sm rounded-xl border border-cream-200"
                  />
                </div>
              )}

              <div>
                <p className="text-charcoal-700/50 text-xs mb-2">Items</p>
                {selectedOrder.items.map((item) => (
                  <div key={item.id} className="flex justify-between text-sm py-1">
                    <span>{item.product.title} × {item.quantity}</span>
                    <span>₹{(item.priceAtSale * item.quantity).toLocaleString()}</span>
                  </div>
                ))}
              </div>

              <div className="border-t border-cream-200 pt-4 space-y-3">
                <h3 className="font-bold text-sm">Internal Notes</h3>
                <textarea
                  value={adminNotes}
                  onChange={(e) => setAdminNotes(e.target.value)}
                  placeholder="e.g. Gift wrapping requested, prefer morning delivery..."
                  rows={3}
                  className="input-field text-sm"
                />
                <button
                  onClick={saveNotes}
                  disabled={loading}
                  className="btn-secondary text-sm"
                >
                  Save Notes
                </button>
              </div>

              <div className="border-t border-cream-200 pt-4 space-y-3">
                <h3 className="font-bold text-sm">Update Tracking</h3>
                <input
                  type="text"
                  placeholder="Courier name"
                  value={courierName}
                  onChange={(e) => setCourierName(e.target.value)}
                  className="input-field text-sm"
                />
                <input
                  type="text"
                  placeholder="Tracking URL"
                  value={trackingUrl}
                  onChange={(e) => setTrackingUrl(e.target.value)}
                  className="input-field text-sm"
                />
                <div className="flex gap-2">
                  <button
                    onClick={() =>
                      updateOrder(selectedOrder.id, {
                        status: 'SHIPPED',
                        courierName,
                        trackingUrl,
                      })
                    }
                    disabled={loading || !courierName}
                    className="btn-primary flex items-center gap-2 text-sm"
                  >
                    <Truck className="w-4 h-4" /> Mark Shipped
                  </button>
                  {selectedOrder.status === 'PAYMENT_VERIFIED' && (
                    <button
                      onClick={() => updateOrder(selectedOrder.id, { status: 'PROCESSING' })}
                      disabled={loading}
                      className="btn-secondary text-sm"
                    >
                      Mark Processing
                    </button>
                  )}
                  {selectedOrder.status === 'PROCESSING' && (
                    <button
                      onClick={() => updateOrder(selectedOrder.id, { status: 'CURING' })}
                      disabled={loading}
                      className="btn-secondary text-sm"
                    >
                      Mark Curing
                    </button>
                  )}
                  {selectedOrder.status === 'CURING' && (
                    <button
                      onClick={() => updateOrder(selectedOrder.id, { status: 'SHIPPED' })}
                      disabled={loading}
                      className="btn-primary text-sm flex items-center gap-2"
                    >
                      <Truck className="w-4 h-4" /> Mark Shipped
                    </button>
                  )}
                  {selectedOrder.status === 'SHIPPED' && (
                    <button
                      onClick={() => updateOrder(selectedOrder.id, { status: 'DELIVERED' })}
                      disabled={loading}
                      className="bg-green-600 text-white px-4 py-2 rounded-lg text-sm hover:bg-green-700 flex items-center gap-2"
                    >
                      <CheckCircle className="w-4 h-4" /> Mark Delivered
                    </button>
                  )}
                </div>
                {(() => {
                  const notifyLink = getNotifyLink(selectedOrder, 'SHIPPED');
                  const deliveredLink = selectedOrder.status === 'SHIPPED'
                    ? getNotifyLink(selectedOrder, 'DELIVERED')
                    : null;
                  const link = notifyLink || deliveredLink;
                  return link && (
                    <a
                      href={link}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-xs text-green-600 hover:underline inline-flex items-center gap-1"
                    >
                      <MessageCircle className="w-3 h-3" />
                      {deliveredLink ? 'Notify customer on delivery on WhatsApp' : 'Send shipping notification on WhatsApp'}
                      <ExternalLink className="w-3 h-3" />
                    </a>
                  );
                })()}
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
