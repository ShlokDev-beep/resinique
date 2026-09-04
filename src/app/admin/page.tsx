'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useSession } from 'next-auth/react';
import { Package, Palette, ShoppingCart, Shield, TrendingUp, Truck, AlertCircle, Boxes, ChevronRight } from 'lucide-react';

interface RecentOrder {
  id: string;
  orderNumber: string;
  customerName: string;
  totalAmount: number;
  status: string;
  createdAt: string;
}

interface Stats {
  totalOrders: number;
  pendingOrders: number;
  verifiedOrders: number;
  shippedOrders: number;
  totalRevenue: number;
  totalProducts: number;
  totalCommissions: number;
  pendingCommissions: number;
  lowStockProducts: number;
  outOfStockProducts: number;
  recentOrders: RecentOrder[];
}

export default function AdminPage() {
  const { data: session, status } = useSession();
  const [stats, setStats] = useState<Stats | null>(null);

  useEffect(() => {
    if (status === 'authenticated' && session?.user?.role === 'ADMIN') {
      fetch('/api/admin/stats')
        .then((r) => r.json())
        .then(setStats);
    }
  }, [session, status]);

  if (status === 'loading') {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-pulse text-charcoal-700/40">Loading...</div>
      </div>
    );
  }

  if (!session || session.user.role !== 'ADMIN') {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <Shield className="w-16 h-16 text-cream-400 mx-auto mb-4" />
          <h1 className="text-2xl font-bold mb-2">Admin Access Required</h1>
          <p className="text-charcoal-700/60 mb-4">Please sign in with an admin account.</p>
          <Link href="/login" className="btn-primary">Sign In</Link>
        </div>
      </div>
    );
  }

  const statCards = stats
    ? [
        { label: 'Total Orders', value: stats.totalOrders, icon: ShoppingCart, color: 'text-blue-600 bg-blue-50' },
        { label: 'Pending Verification', value: stats.pendingOrders, icon: AlertCircle, color: 'text-amber-deep bg-amber-light/30' },
        { label: 'Shipped', value: stats.shippedOrders, icon: Truck, color: 'text-green-600 bg-green-50' },
        { label: 'Total Revenue', value: `₹${stats.totalRevenue.toLocaleString()}`, icon: TrendingUp, color: 'text-amber-warm bg-amber-light/30' },
        { label: 'Products', value: stats.totalProducts, icon: Package, color: 'text-purple-600 bg-purple-50' },
        { label: 'Pending Commissions', value: stats.pendingCommissions, icon: Palette, color: 'text-pink-600 bg-pink-50' },
      ]
    : [];

  const sections = [
    {
      icon: ShoppingCart,
      title: 'Orders',
      desc: 'Manage orders, verify payments, update tracking.',
      href: '/admin/orders',
      badge: stats?.pendingOrders,
    },
    {
      icon: Palette,
      title: 'Commissions',
      desc: 'Review custom requests, set quotes, approve or reject.',
      href: '/admin/commissions',
      badge: stats?.pendingCommissions,
    },
    {
      icon: Package,
      title: 'Products',
      desc: 'Add new resin pieces, manage inventory and pricing.',
      href: '/admin/products',
      badge: null,
    },
  ];

  return (
    <div className="max-w-6xl mx-auto px-4 py-10">
      <h1 className="text-3xl font-bold mb-2">Admin Dashboard</h1>
      <p className="text-charcoal-700/60 mb-8">
        Welcome back, {session.user.name || 'Admin'}
      </p>

      {stats && (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-10">
          {statCards.map((s) => (
            <div key={s.label} className="card p-4">
              <div className={`w-8 h-8 rounded-lg flex items-center justify-center mb-2 ${s.color}`}>
                <s.icon className="w-4 h-4" />
              </div>
              <p className="text-2xl font-bold">{s.value}</p>
              <p className="text-xs text-charcoal-700/50">{s.label}</p>
            </div>
          ))}
        </div>
      )}

      {stats && (stats.lowStockProducts > 0 || stats.outOfStockProducts > 0) && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-10">
          {stats.lowStockProducts > 0 && (
            <Link href="/admin/products" className="card p-5 flex items-center gap-4 hover:shadow-md transition-shadow">
              <div className="w-10 h-10 rounded-lg flex items-center justify-center bg-amber-light/30 text-amber-deep">
                <Boxes className="w-5 h-5" />
              </div>
              <div className="flex-1">
                <p className="font-bold">{stats.lowStockProducts} product{stats.lowStockProducts > 1 ? 's' : ''} running low</p>
                <p className="text-xs text-charcoal-700/60">3 or fewer pieces remaining — restock soon</p>
              </div>
              <AlertCircle className="w-5 h-5 text-amber-deep" />
            </Link>
          )}
          {stats.outOfStockProducts > 0 && (
            <Link href="/admin/products" className="card p-5 flex items-center gap-4 hover:shadow-md transition-shadow border-red-100">
              <div className="w-10 h-10 rounded-lg flex items-center justify-center bg-red-50 text-red-600">
                <Package className="w-5 h-5" />
              </div>
              <div className="flex-1">
                <p className="font-bold text-red-600">{stats.outOfStockProducts} out of stock</p>
                <p className="text-xs text-charcoal-700/60">Listed but unavailable — add more inventory</p>
              </div>
              <AlertCircle className="w-5 h-5 text-red-500" />
            </Link>
          )}
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
        {sections.map((s) => (
          <Link key={s.title} href={s.href} className="card p-6 hover:shadow-md transition-shadow group relative">
            <s.icon className="w-10 h-10 text-amber-warm mb-4 group-hover:scale-110 transition-transform" />
            <h3 className="text-lg font-bold mb-2">{s.title}</h3>
            <p className="text-sm text-charcoal-700/60">{s.desc}</p>
            {s.badge !== null && s.badge !== undefined && s.badge > 0 && (
              <span className="absolute top-4 right-4 bg-red-500 text-white text-xs w-6 h-6 rounded-full flex items-center justify-center">
                {s.badge}
              </span>
            )}
          </Link>
        ))}
      </div>

      {stats && stats.recentOrders && stats.recentOrders.length > 0 && (
        <div className="card p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-bold">Recent Orders</h2>
            <Link href="/admin/orders" className="text-sm text-amber-warm hover:text-amber-deep inline-flex items-center gap-1">
              View All <ChevronRight className="w-4 h-4" />
            </Link>
          </div>
          <div className="space-y-3">
            {stats.recentOrders.map((order) => (
              <Link
                key={order.id}
                href="/admin/orders"
                className="flex items-center justify-between p-3 bg-cream-50 rounded-xl hover:bg-cream-100 transition-colors"
              >
                <div>
                  <p className="font-mono text-sm font-semibold">{order.orderNumber}</p>
                  <p className="text-xs text-charcoal-700/60">
                    {order.customerName} • {new Date(order.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}
                  </p>
                </div>
                <div className="text-right">
                  <p className="font-bold text-sm">₹{order.totalAmount.toLocaleString()}</p>
                  <p className={`text-xs ${statusBadge(order.status)}`}>
                    {formatStatus(order.status)}
                  </p>
                </div>
              </Link>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

const statusBadge = (s: string) => {
  const map: Record<string, string> = {
    PENDING_VERIFICATION: 'text-amber-deep',
    PAYMENT_VERIFIED: 'text-green-600',
    PROCESSING: 'text-blue-600',
    CURING: 'text-purple-600',
    SHIPPED: 'text-blue-700',
    DELIVERED: 'text-green-700',
    CANCELLED: 'text-red-600',
  };
  return map[s] || 'text-charcoal-700/60';
};

const formatStatus = (s: string) => s.replace(/_/g, ' ').toLowerCase().replace(/\b\w/g, (c) => c.toUpperCase());
