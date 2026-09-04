'use client';

import Link from 'next/link';
import { Heart, ShoppingBag, Trash2 } from 'lucide-react';
import { useWishlistStore } from '@/lib/wishlist';
import { useCartStore } from '@/lib/store';

export default function WishlistPage() {
  const { items, removeItem, clearWishlist } = useWishlistStore();
  const addItem = useCartStore((s) => s.addItem);

  return (
    <div className="max-w-4xl mx-auto px-4 py-10">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold mb-1">Your Wishlist</h1>
          <p className="text-charcoal-700/70">Save pieces you love for later</p>
        </div>
        {items.length > 0 && (
          <button onClick={clearWishlist} className="text-sm text-red-500 hover:text-red-600 flex items-center gap-1">
            <Trash2 className="w-4 h-4" /> Clear All
          </button>
        )}
      </div>

      {items.length === 0 ? (
        <div className="text-center py-20 text-charcoal-700/60">
          <Heart className="w-12 h-12 mx-auto mb-4 text-cream-400" />
          <p className="text-lg mb-2">Your wishlist is empty</p>
          <p className="text-sm mb-6">Tap the heart on any product to save it here</p>
          <Link href="/products" className="btn-primary inline-flex">
            Browse Products
          </Link>
        </div>
      ) : (
        <div className="space-y-4">
          {items.map((item) => (
            <div key={item.productId} className="card p-4 flex items-center gap-4">
              <Link href={`/products/${item.productId}`} className="shrink-0">
                <div className="w-20 h-20 bg-cream-100 rounded-lg overflow-hidden">
                  <img
                    src={item.image || '/uploads/placeholder.svg'}
                    alt={item.title}
                    className="w-full h-full object-cover"
                  />
                </div>
              </Link>
              <div className="flex-1 min-w-0">
                <p className="text-xs text-amber-warm font-medium uppercase tracking-wider">{item.category}</p>
                <Link href={`/products/${item.productId}`}>
                  <h3 className="font-semibold text-charcoal-900 truncate hover:text-amber-warm transition-colors">{item.title}</h3>
                </Link>
                <p className="text-lg font-bold text-charcoal-900">₹{item.price.toLocaleString()}</p>
              </div>
              <div className="flex flex-col sm:flex-row items-end sm:items-center gap-2 shrink-0">
                <button
                  onClick={() => addItem({ productId: item.productId, title: item.title, price: item.price, image: item.image })}
                  className="btn-primary text-sm flex items-center gap-1"
                >
                  <ShoppingBag className="w-4 h-4" /> Add to Cart
                </button>
                <button
                  onClick={() => removeItem(item.productId)}
                  aria-label="Remove from wishlist"
                  className="p-2 text-charcoal-700/50 hover:text-red-500 transition-colors"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
