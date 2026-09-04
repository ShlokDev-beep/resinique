'use client';

import { useState } from 'react';
import { useSession } from 'next-auth/react';
import { Search, Package, Truck } from 'lucide-react';

interface OrderItem {
  title: string;
  quantity: number;
  price: number;
}

interface Order {
  id: string;
  orderNumber: string;
  totalAmount: number;
  status: string;
  createdAt: string;
  items: OrderItem[];
}

const statusColors: Record<string, string> = {
  PENDING_VERIFICATION: 'badge-pending',
  PAYMENT_VERIFIED: 'badge-verified',
  PROCESSING: 'badge bg-blue-50 text-blue-700',
  CURING: 'badge bg-purple-50 text-purple-700',
  SHIPPED: 'badge-shipped',
  DELIVERED: 'badge bg-green-100 text-green-800',
  CANCELLED: 'badge-cancelled',
};

const formatStatus = (s: string) => s.replace(/_/g, ' ').toLowerCase().replace(/\b\w/g, (c) => c.toUpperCase());

export default function AccountPage() {
  const { status: sessionStatus } = useSession();
  const [phone, setPhone] = useState('');
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await fetch(`/api/orders/customer?phone=${encodeURIComponent(phone)}`);
      const data = await res.json();
      setOrders(data);
      setSearched(true);
    } catch {
      setOrders([]);
      setSearched(true);
    }
    setLoading(false);
  };

  if (sessionStatus === 'loading') {
    return (
      <div className="max-w-4xl mx-auto px-4 py-10">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-cream-200 rounded w-1/3" />
          <div className="h-40 bg-cream-200 rounded" />
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-10">
      <h1 className="text-3xl font-bold mb-2">My Orders</h1>
      <p className="text-charcoal-700/60 mb-8">View your order history and status</p>

      <form onSubmit={handleSearch} className="card p-6 mb-8">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1">
            <label className="block text-sm font-medium mb-1">Phone Number</label>
            <input
              type="text"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              className="input-field"
              placeholder="Enter the phone number used during checkout"
              required
            />
          </div>
          <div className="flex items-end">
            <button type="submit" disabled={loading} className="btn-primary flex items-center gap-2">
              <Search className="w-4 h-4" />
              {loading ? 'Searching...' : 'Find Orders'}
            </button>
          </div>
        </div>
      </form>

      {searched && orders.length === 0 && (
        <div className="text-center py-12 text-charcoal-700/60">
          <Package className="w-12 h-12 mx-auto mb-3 text-cream-400" />
          <p className="text-lg">No orders found</p>
          <p className="text-sm mt-1">Make sure you entered the correct phone number</p>
        </div>
      )}

      {orders.length > 0 && (
        <div className="space-y-4">
          {orders.map((order) => (
            <div key={order.id} className="card p-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
                <div>
                  <p className="font-mono font-bold text-sm">{order.orderNumber}</p>
                  <p className="text-xs text-charcoal-700/50 mt-1">
                    {new Date(order.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })}
                  </p>
                </div>
                <div className="flex items-center gap-3">
                  <span className={statusColors[order.status] || 'badge'}>
                    {formatStatus(order.status)}
                  </span>
                  <span className="font-bold">₹{order.totalAmount.toLocaleString()}</span>
                </div>
              </div>

              <div className="border-t border-cream-200 pt-3 space-y-2">
                {order.items.map((item, i) => (
                  <div key={i} className="flex justify-between text-sm">
                    <span className="text-charcoal-700/70">{item.title} × {item.quantity}</span>
                    <span>₹{(item.price * item.quantity).toLocaleString()}</span>
                  </div>
                ))}
              </div>

              <div className="mt-4 flex gap-3">
                <a
                  href={`/track-order?orderNumber=${order.orderNumber}&phone=${phone}`}
                  className="text-sm text-amber-warm hover:text-amber-deep inline-flex items-center gap-1"
                >
                  <Truck className="w-3 h-3" /> Track Details
                </a>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
