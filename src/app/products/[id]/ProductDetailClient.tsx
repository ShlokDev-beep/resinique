'use client';

import { useState } from 'react';
import Link from 'next/link';
import { ShoppingBag, ChevronLeft, Package, Shield, Truck, Copy, CheckCircle, Heart } from 'lucide-react';
import { useCartStore } from '@/lib/store';
import { useWishlistStore } from '@/lib/wishlist';
import { safeJsonParse } from '@/lib/utils';
import ProductCard from '@/components/ProductCard';

interface Product {
  id: string;
  title: string;
  description: string;
  category: string;
  price: number;
  images: string;
  stock: number;
  leadTimeDays: number;
  isCustomizable: boolean;
}

interface Props {
  product: Product | null;
  related: Product[];
}

export default function ProductDetailClient({ product, related }: Props) {
  const [selectedImage, setSelectedImage] = useState(0);
  const [copied, setCopied] = useState(false);
  const addItem = useCartStore((s) => s.addItem);
  const wishlist = useWishlistStore();

  if (!product) {
    return (
      <div className="max-w-6xl mx-auto px-4 py-20 text-center">
        <h1 className="text-2xl font-bold mb-4">Product Not Found</h1>
        <Link href="/products" className="btn-primary">Back to Shop</Link>
      </div>
    );
  }

  const imageList = safeJsonParse<string[]>(product.images, []);
  const isWishlisted = wishlist.hasItem(product.id);

  const shareUrl = typeof window !== 'undefined' ? window.location.href : '';
  const shareText = `Check out ${product.title} on Resinique Creations — ₹${product.price.toLocaleString()}`;

  const copyLink = () => {
    navigator.clipboard.writeText(shareUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const shareOn = (platform: string) => {
    const url = encodeURIComponent(shareUrl);
    const text = encodeURIComponent(shareText);
    const links: Record<string, string> = {
      whatsapp: `https://wa.me/?text=${text}%20${url}`,
      facebook: `https://www.facebook.com/sharer/sharer.php?u=${url}`,
      twitter: `https://twitter.com/intent/tweet?text=${text}&url=${url}`,
    };
    window.open(links[platform], '_blank');
  };

  return (
    <div className="max-w-6xl mx-auto px-4 py-10">
      <Link href="/products" className="inline-flex items-center gap-1 text-sm text-charcoal-700/60 hover:text-amber-warm mb-6">
        <ChevronLeft className="w-4 h-4" /> Back to Shop
      </Link>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div>
          <div className="aspect-square bg-cream-100 rounded-2xl overflow-hidden mb-4">
            <img
              src={imageList[selectedImage] || '/uploads/placeholder.svg'}
              alt={product.title}
              className="w-full h-full object-cover"
            />
          </div>
          {imageList.length > 1 && (
            <div className="flex gap-2">
              {imageList.map((img, i) => (
                <button
                  key={i}
                  onClick={() => setSelectedImage(i)}
                  className={`w-16 h-16 rounded-lg overflow-hidden border-2 ${
                    selectedImage === i ? 'border-amber-warm' : 'border-cream-200'
                  }`}
                >
                  <img src={img} alt="" className="w-full h-full object-cover" />
                </button>
              ))}
            </div>
          )}
        </div>

        <div>
          <p className="text-xs text-amber-warm font-medium uppercase tracking-wider mb-2">{product.category}</p>
          <h1 className="text-3xl font-bold mb-4">{product.title}</h1>
          <p className="text-3xl font-bold text-amber-warm mb-6">₹{product.price.toLocaleString()}</p>
          <p className="text-charcoal-700/80 leading-relaxed mb-8">{product.description}</p>

          <div className="space-y-4 mb-8">
            <div className="flex items-center gap-3 text-sm">
              <Package className="w-5 h-5 text-amber-warm" />
              <span>{product.leadTimeDays} day lead time</span>
            </div>
            <div className="flex items-center gap-3 text-sm">
              <Truck className="w-5 h-5 text-amber-warm" />
              <span>Free shipping on orders above ₹1,000</span>
            </div>
            <div className="flex items-center gap-3 text-sm">
              <Shield className="w-5 h-5 text-amber-warm" />
              <span>UV & heat resistant finish</span>
            </div>
          </div>

          {product.stock > 0 ? (
            <p className="text-green-600 text-sm mb-4">✓ In Stock ({product.stock} available)</p>
          ) : (
            <p className="text-red-500 text-sm mb-4">✗ Out of Stock</p>
          )}

          <div className="flex gap-3 mb-6">
            <button
              onClick={() =>
                addItem({
                  productId: product.id,
                  title: product.title,
                  price: product.price,
                  image: imageList[0] || '',
                  stock: product.stock,
                })
              }
              disabled={product.stock <= 0}
              className="btn-primary flex-1 flex items-center justify-center gap-2"
            >
              <ShoppingBag className="w-5 h-5" />
              Add to Cart
            </button>
            <button
              onClick={() =>
                wishlist.toggleItem({
                  productId: product.id,
                  title: product.title,
                  price: product.price,
                  image: imageList[0] || '',
                  category: product.category,
                })
              }
              aria-label={isWishlisted ? 'Remove from wishlist' : 'Add to wishlist'}
              className={`p-3 rounded-xl border-2 transition-colors ${
                isWishlisted
                  ? 'border-rose-500 bg-rose-50 text-rose-500'
                  : 'border-cream-300 text-charcoal-700/50 hover:border-rose-400 hover:text-rose-500'
              }`}
            >
              <Heart className={`w-5 h-5 ${isWishlisted ? 'fill-current' : ''}`} />
            </button>
          </div>

          <div className="flex items-center gap-3 mb-6">
            <span className="text-xs text-charcoal-700/50">Share:</span>
            <button onClick={() => shareOn('whatsapp')} className="p-2 bg-green-50 text-green-600 rounded-lg hover:bg-green-100 transition-colors" title="Share on WhatsApp">
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/></svg>
            </button>
            <button onClick={() => shareOn('facebook')} className="p-2 bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100 transition-colors" title="Share on Facebook">
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/></svg>
            </button>
            <button onClick={copyLink} className="p-2 bg-cream-100 text-charcoal-700 rounded-lg hover:bg-cream-200 transition-colors" title="Copy link">
              {copied ? <CheckCircle className="w-4 h-4 text-green-500" /> : <Copy className="w-4 h-4" />}
            </button>
          </div>

          {product.isCustomizable && (
            <div className="p-4 bg-champagne/30 rounded-xl border border-amber-warm/20 mb-6">
              <p className="text-sm font-medium mb-1">This piece is customizable!</p>
              <Link href="/custom-order" className="text-sm text-amber-warm hover:underline">
                Request a custom version →
              </Link>
            </div>
          )}

          <div className="p-4 bg-cream-50 rounded-xl">
            <h3 className="font-semibold mb-2 text-sm">Resin Care Tips</h3>
            <ul className="text-xs text-charcoal-700/70 space-y-1">
              <li>• Avoid prolonged direct UV/sunlight exposure</li>
              <li>• Do not place hot items directly on resin surfaces</li>
              <li>• Clean with a soft damp cloth</li>
              <li>• Avoid abrasive cleaners or scrubbers</li>
            </ul>
          </div>
        </div>
      </div>

      {related.length > 0 && (
        <section className="mt-20">
          <h2 className="text-2xl font-bold mb-6">You May Also Like</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6">
            {related.map((p) => (
              <ProductCard key={p.id} {...p} />
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
