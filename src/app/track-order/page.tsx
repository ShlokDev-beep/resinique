'use client';

import { useState } from 'react';
import { Search, Package, Clock, Truck, CheckCircle, ExternalLink } from 'lucide-react';

interface OrderData {
  orderNumber: string;
  status: string;
  totalAmount: number;
  createdAt: string;
  items: { title: string; quantity: number; price: number }[];
  trackingUrl: string | null;
  courierName: string | null;
}

const statusSteps = [
  { key: 'PENDING_VERIFICATION', label: 'Order Placed', icon: Clock },
  { key: 'PAYMENT_VERIFIED', label: 'Payment Verified', icon: CheckCircle },
  { key: 'PROCESSING', label: 'Preparing', icon: Package },
  { key: 'CURING', label: 'Curing', icon: Clock },
  { key: 'SHIPPED', label: 'Shipped', icon: Truck },
  { key: 'DELIVERED', label: 'Delivered', icon: CheckCircle },
];

const statusColors: Record<string, string> = {
  PENDING_VERIFICATION: 'text-amber-deep',
  PAYMENT_VERIFIED: 'text-green-600',
  PROCESSING: 'text-blue-600',
  CURING: 'text-purple-600',
  SHIPPED: 'text-blue-700',
  DELIVERED: 'text-green-700',
  CANCELLED: 'text-red-600',
};

const formatStatus = (s: string) => s.replace(/_/g, ' ').toLowerCase().replace(/\b\w/g, (c) => c.toUpperCase());

export default function TrackOrderPage() {
  const [orderNumber, setOrderNumber] = useState('');
  const [phone, setPhone] = useState('');
  const [order, setOrder] = useState<OrderData | null>(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setOrder(null);
    setLoading(true);

    try {
      const res = await fetch(`/api/orders/track?orderNumber=${encodeURIComponent(orderNumber)}&phone=${encodeURIComponent(phone)}`);
      const data = await res.json();

      if (!res.ok) {
        setError(data.error || 'Order not found');
      } else {
        setOrder(data);
      }
    } catch {
      setError('Failed to look up order');
    }
    setLoading(false);
  };

  const currentStepIndex = order
    ? statusSteps.findIndex((s) => s.key === order.status)
    : -1;

  return (
    <div className="max-w-2xl mx-auto px-4 py-10">
      <h1 className="text-3xl font-bold mb-2 text-center">Track Your Order</h1>
      <p className="text-charcoal-700/60 text-center mb-8">
        Enter your order number and phone number to check status
      </p>

      <form onSubmit={handleSearch} className="card p-6 space-y-4 mb-8">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium mb-1">Order Number</label>
            <input
              type="text"
              value={orderNumber}
              onChange={(e) => setOrderNumber(e.target.value)}
              className="input-field font-mono"
              placeholder="RQ-20260904-ABC123"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Phone Number</label>
            <input
              type="text"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              className="input-field"
              placeholder="+91 XXXXX XXXXX"
              required
            />
          </div>
        </div>
        <button type="submit" disabled={loading} className="btn-primary w-full flex items-center justify-center gap-2">
          <Search className="w-4 h-4" />
          {loading ? 'Looking up...' : 'Track Order'}
        </button>
      </form>

      {error && (
        <div className="bg-red-50 text-red-600 text-sm p-4 rounded-xl text-center mb-6">{error}</div>
      )}

      {order && (
        <div className="space-y-6">
          <div className="card p-6">
            <div className="flex items-center justify-between mb-6">
              <div>
                <p className="text-xs text-charcoal-700/50">Order Number</p>
                <p className="font-mono font-bold">{order.orderNumber}</p>
              </div>
              <div className="text-right">
                <p className="text-xs text-charcoal-700/50">Status</p>
                <p className={`font-bold capitalize ${statusColors[order.status] || ''}`}>
                  {formatStatus(order.status)}
                </p>
              </div>
            </div>

            {order.status !== 'CANCELLED' && (
              <div className="flex items-center justify-between mb-8">
                {statusSteps.map((step, i) => {
                  const isActive = i <= currentStepIndex;
                  const isCurrent = i === currentStepIndex;
                  return (
                    <div key={step.key} className="flex flex-col items-center flex-1">
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center mb-1 ${
                        isActive ? 'bg-amber-warm text-white' : 'bg-cream-200 text-charcoal-700/40'
                      } ${isCurrent ? 'ring-2 ring-amber-warm/50' : ''}`}>
                        <step.icon className="w-4 h-4" />
                      </div>
                      <span className="text-[10px] text-center text-charcoal-700/60 hidden sm:block">{step.label}</span>
                    </div>
                  );
                })}
              </div>
            )}

            {order.status === 'CANCELLED' && (
              <div className="bg-red-50 text-red-600 text-sm p-3 rounded-lg mb-4 text-center">
                This order has been cancelled.
              </div>
            )}

            <div className="border-t border-cream-200 pt-4 space-y-2">
              {order.items.map((item, i) => (
                <div key={i} className="flex justify-between text-sm">
                  <span>{item.title} × {item.quantity}</span>
                  <span>₹{(item.price * item.quantity).toLocaleString()}</span>
                </div>
              ))}
              <div className="flex justify-between font-bold border-t border-cream-200 pt-2">
                <span>Total</span>
                <span>₹{order.totalAmount.toLocaleString()}</span>
              </div>
            </div>

            <div className="text-xs text-charcoal-700/40 mt-4">
              Ordered on {new Date(order.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })}
            </div>

            {order.trackingUrl && (
              <div className="mt-4">
                <a
                  href={order.trackingUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn-primary inline-flex items-center gap-2 text-sm"
                >
                  <Truck className="w-4 h-4" />
                  Track Shipment {order.courierName ? `(${order.courierName})` : ''}
                  <ExternalLink className="w-3 h-3" />
                </a>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
