'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useSession, signOut } from 'next-auth/react';
import { ShoppingBag, Menu, X, User, LogOut, Shield, Sparkles, Heart } from 'lucide-react';
import { useCartStore } from '@/lib/store';
import { useWishlistStore } from '@/lib/wishlist';
import CartDrawer from './CartDrawer';

export default function Navbar() {
  const { data: session } = useSession();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [cartOpen, setCartOpen] = useState(false);
  const itemCount = useCartStore((s) => s.getItemCount());
  const wishlistCount = useWishlistStore((s) => s.items.length);

  return (
    <>
      <nav className="bg-white/80 backdrop-blur-md border-b border-cream-200 sticky top-0 z-40">
        <div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <Sparkles className="w-6 h-6 text-amber-warm" />
            <span className="text-xl font-bold text-charcoal-900">Resinique</span>
          </Link>

          <div className="hidden md:flex items-center gap-8">
            <Link href="/products" className="text-charcoal-700 hover:text-amber-warm transition-colors">
              Shop
            </Link>
            <Link href="/custom-order" className="text-charcoal-700 hover:text-amber-warm transition-colors">
              Custom Orders
            </Link>
            <Link href="/about" className="text-charcoal-700 hover:text-amber-warm transition-colors">
              About
            </Link>
            <Link href="/track-order" className="text-charcoal-700 hover:text-amber-warm transition-colors">
              Track Order
            </Link>
            {session?.user?.role === 'ADMIN' && (
              <Link href="/admin" className="text-charcoal-700 hover:text-amber-warm transition-colors flex items-center gap-1">
                <Shield className="w-4 h-4" /> Admin
              </Link>
            )}
          </div>

          <div className="flex items-center gap-4">
            <Link
              href="/wishlist"
              className="relative p-2 text-charcoal-700 hover:text-rose-500 transition-colors"
              aria-label="Wishlist"
            >
              <Heart className="w-5 h-5" />
              {wishlistCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-rose-500 text-white text-xs w-5 h-5 rounded-full flex items-center justify-center">
                  {wishlistCount}
                </span>
              )}
            </Link>
            <button
              onClick={() => setCartOpen(true)}
              className="relative p-2 text-charcoal-700 hover:text-amber-warm transition-colors"
            >
              <ShoppingBag className="w-5 h-5" />
              {itemCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-amber-warm text-white text-xs w-5 h-5 rounded-full flex items-center justify-center">
                  {itemCount}
                </span>
              )}
            </button>

            {session ? (
              <div className="hidden md:flex items-center gap-3">
                <span className="text-sm text-charcoal-700">{session.user?.name}</span>
                <button
                  onClick={() => signOut()}
                  className="p-2 text-charcoal-700 hover:text-red-500 transition-colors"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <div className="hidden md:flex items-center gap-3">
                <Link
                  href="/login"
                  className="text-sm text-charcoal-700 hover:text-amber-warm transition-colors"
                >
                  <User className="w-4 h-4" /> Login
                </Link>
                <Link
                  href="/auth/google"
                  className="text-sm text-amber-600 hover:text-amber-800 transition-colors"
                >
                  Continue with Google
                </Link>
              </div>
            )}
          </div>

          {mobileOpen && (
            <div className="md:hidden border-t border-cream-200 bg-white px-4 py-4 space-y-3">
              <Link href="/products" onClick={() => setMobileOpen(false)} className="block text-charcoal-700">
                Shop
              </Link>
              <Link href="/custom-order" onClick={() => setMobileOpen(false)} className="block text-charcoal-700">
                Custom Orders
              </Link>
              <Link href="/about" onClick={() => setMobileOpen(false)} className="block text-charcoal-700">
                About
              </Link>
              <Link href="/track-order" onClick={() => setMobileOpen(false)} className="block text-charcoal-700">
                Track Order
              </Link>
              <Link href="/wishlist" onClick={() => setMobileOpen(false)} className="block text-charcoal-700">
                Wishlist
              </Link>
              <Link href="/account" onClick={() => setMobileOpen(false)} className="block text-charcoal-700">
                My Orders
              </Link>
              {session?.user?.role === 'ADMIN' && (
                <Link href="/admin" onClick={() => setMobileOpen(false)} className="block text-charcoal-700">
                  Admin Dashboard
                </Link>
              )}
              {session ? (
                <button onClick={() => signOut()} className="block text-red-500">
                  Sign Out
                </button>
              ) : (
                <>
                  <Link href="/login" onClick={() => setMobileOpen(false)} className="block text-charcoal-700">
                    Login
                  </Link>
                  <Link href="/auth/google" onClick={() => setMobileOpen(false)} className="block text-charcoal-700">
                    Continue with Google
                  </Link>
                </>
              )}
            </div>
          )}
        </div>
      </nav>

      <CartDrawer open={cartOpen} onClose={() => setCartOpen(false)} />
    </>
  );
}