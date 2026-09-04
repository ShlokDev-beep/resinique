'use client';

import Link from 'next/link';
import { ShoppingBag, Heart } from 'lucide-react';
import { useCartStore } from '@/lib/store';
import { useWishlistStore } from '@/lib/wishlist';
import { safeJsonParse } from '@/lib/utils';

interface ProductCardProps {
  id: string;
  title: string;
  price: number;
  category: string;
  images: string;
  stock: number;
}

export default function ProductCard({ id, title, price, category, images, stock }: ProductCardProps) {
  const addItem = useCartStore((s) => s.addItem);
  const wishlist = useWishlistStore();
  const imageList = safeJsonParse<string[]>(images, []);
  const mainImage = imageList[0] || '';
  const isWishlisted = wishlist.hasItem(id);

  return (
    <div className="card group relative hover:shadow-md transition-shadow duration-300">
      <Link href={`/products/${id}`}>
        <div className="aspect-square bg-cream-100 overflow-hidden">
          <img
            src={mainImage || '/uploads/placeholder.svg'}
            alt={title}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          />
        </div>
      </Link>
      <button
        onClick={() => wishlist.toggleItem({ productId: id, title, price, image: mainImage, category })}
        aria-label={isWishlisted ? 'Remove from wishlist' : 'Add to wishlist'}
        className={`absolute top-2 right-2 p-2 rounded-full shadow-sm transition-colors ${
          isWishlisted ? 'bg-rose-500 text-white' : 'bg-white/90 text-charcoal-700 hover:text-rose-500'
        }`}
      >
        <Heart className={`w-4 h-4 ${isWishlisted ? 'fill-current' : ''}`} />
      </button>
      <div className="p-4">
        <p className="text-xs text-amber-warm font-medium uppercase tracking-wider mb-1">{category}</p>
        <Link href={`/products/${id}`}>
          <h3 className="font-semibold text-charcoal-900 hover:text-amber-warm transition-colors">{title}</h3>
        </Link>
        <div className="flex items-center justify-between mt-3">
          <span className="text-lg font-bold text-charcoal-900">₹{price.toLocaleString()}</span>
          <button
            onClick={() => addItem({ productId: id, title, price, image: mainImage, stock })}
            disabled={stock <= 0}
            className="p-2 bg-amber-warm text-white rounded-full hover:bg-amber-deep transition-colors disabled:opacity-40"
          >
            <ShoppingBag className="w-4 h-4" />
          </button>
        </div>
        {stock <= 0 && (
          <p className="text-xs text-red-500 mt-1">Out of stock</p>
        )}
        {stock > 0 && stock <= 3 && (
          <p className="text-xs text-amber-deep mt-1">Only {stock} left</p>
        )}
      </div>
    </div>
  );
}
