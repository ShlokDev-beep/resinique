'use client';

import { X, Plus, Minus, Trash2, ShoppingBag, Heart } from 'lucide-react';
import Link from 'next/link';
import { useCartStore } from '@/lib/store';
import { useWishlistStore } from '@/lib/wishlist';

export default function CartDrawer({ open, onClose }: { open: boolean; onClose: () => void }) {
  const { items, removeItem, updateQuantity, getTotal } = useCartStore();
  const wishlist = useWishlistStore();

  if (!open) return null;

  return (
    <>
      <div className="fixed inset-0 bg-black/40 z-50" onClick={onClose} />
      <div className="fixed right-0 top-0 h-full w-full max-w-md bg-white z-50 shadow-xl flex flex-col">
        <div className="flex items-center justify-between p-4 border-b border-cream-200">
          <h2 className="text-lg font-bold">Shopping Cart</h2>
          <button onClick={onClose} className="p-1 hover:text-amber-warm">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-4">
          {items.length === 0 ? (
            <div className="text-center py-16 text-charcoal-700/60">
              <ShoppingBag className="w-12 h-12 mx-auto mb-4 text-cream-400" />
              <p className="font-medium">Your cart is empty</p>
              <p className="text-sm mt-1 mb-4">Explore our handmade resin collection</p>
              <Link href="/products" onClick={onClose} className="text-amber-warm hover:underline inline-block">
                Browse Products
              </Link>
            </div>
          ) : (
            <div className="space-y-4">
              {items.map((item) => (
                <div key={item.productId} className="flex gap-4 p-3 bg-cream-50 rounded-xl">
                  <div className="w-16 h-16 bg-cream-200 rounded-lg overflow-hidden flex-shrink-0">
                    {item.image && (
                      <img src={item.image} alt={item.title} className="w-full h-full object-cover" />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-medium text-sm truncate">{item.title}</h3>
                    <p className="text-amber-warm font-semibold text-sm">₹{item.price.toLocaleString()}</p>
                    <div className="flex items-center gap-2 mt-1">
                      <button
                        onClick={() => updateQuantity(item.productId, item.quantity - 1)}
                        className="w-6 h-6 rounded-full bg-cream-200 flex items-center justify-center hover:bg-cream-300"
                      >
                        <Minus className="w-3 h-3" />
                      </button>
                      <span className="text-sm w-6 text-center">{item.quantity}</span>
                      <button
                        onClick={() => updateQuantity(item.productId, item.quantity + 1)}
                        disabled={item.quantity >= item.stock}
                        className="w-6 h-6 rounded-full bg-cream-200 flex items-center justify-center hover:bg-cream-300 disabled:opacity-40 disabled:cursor-not-allowed"
                      >
                        <Plus className="w-3 h-3" />
                      </button>
                      <span className="text-[10px] text-charcoal-700/40">{item.stock >= 99 ? '' : `/ ${item.stock}`}</span>
                      <button
                        onClick={() => removeItem(item.productId)}
                        className="ml-auto text-red-400 hover:text-red-600"
                        title="Remove from cart"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => {
                          wishlist.toggleItem({ productId: item.productId, title: item.title, price: item.price, image: item.image });
                          removeItem(item.productId);
                        }}
                        className="text-rose-400 hover:text-rose-600"
                        title="Move to wishlist"
                      >
                        <Heart className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {items.length > 0 && (
          <div className="border-t border-cream-200 p-4 space-y-3">
            <div className="flex justify-between font-bold">
              <span>Total</span>
              <span>₹{getTotal().toLocaleString()}</span>
            </div>
            <Link
              href="/checkout"
              onClick={onClose}
              className="block text-center btn-primary w-full"
            >
              Proceed to Checkout
            </Link>
          </div>
        )}
      </div>
    </>
  );
}
