'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Sparkles, ArrowRight, Palette, Heart, Clock, Star } from 'lucide-react';
import ProductCard from '@/components/ProductCard';

interface Product {
  id: string;
  title: string;
  price: number;
  category: string;
  images: string;
  stock: number;
}

export default function Home() {
  const [featured, setFeatured] = useState<Product[]>([]);

  useEffect(() => {
    fetch('/api/products')
      .then((r) => r.json())
      .then((data) => setFeatured(data.slice(0, 4)));
  }, []);

  const features = [
    { icon: Palette, title: 'Handcrafted', desc: 'Each piece is uniquely made by hand with premium resin.' },
    { icon: Heart, title: 'Custom Orders', desc: 'Commission a personalized piece with your colors & inclusions.' },
    { icon: Clock, title: 'Fast Shipping', desc: 'Carefully packaged and shipped within 3-5 business days.' },
  ];

  const testimonials = [
    { name: 'Priya M.', text: 'The coasters are absolutely stunning! The rose gold leaf detail is gorgeous.', rating: 5 },
    { name: 'Ananya K.', text: 'Commissioned a tray with my wedding flowers preserved. It turned out perfect!', rating: 5 },
    { name: 'Riya S.', text: 'Bought the galaxy pendant as a gift. My friend loved it. Will order again.', rating: 5 },
  ];

  return (
    <div>
      <section className="relative bg-gradient-to-br from-cream-100 via-champagne to-cream-200 py-24 md:py-32">
        <div className="max-w-6xl mx-auto px-4 text-center">
          <div className="flex items-center justify-center gap-2 mb-6">
            <Sparkles className="w-8 h-8 text-amber-warm" />
          </div>
          <h1 className="text-4xl md:text-6xl font-bold text-charcoal-900 mb-6">
            Handcrafted Resin Art
          </h1>
          <p className="text-lg md:text-xl text-charcoal-700 max-w-2xl mx-auto mb-10">
            Discover unique epoxy resin creations — from elegant coasters to preserved flower keepsakes.
            Each piece tells a story.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/products" className="btn-primary inline-flex items-center gap-2 justify-center">
              Shop Collection <ArrowRight className="w-4 h-4" />
            </Link>
            <Link href="/custom-order" className="btn-outline inline-flex items-center gap-2 justify-center">
              Custom Commission
            </Link>
          </div>
        </div>
      </section>

      {featured.length > 0 && (
        <section className="max-w-6xl mx-auto px-4 py-20">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h2 className="text-3xl font-bold">Featured Pieces</h2>
              <p className="text-charcoal-700/60 mt-1">Our most loved creations</p>
            </div>
            <Link href="/products" className="text-amber-warm hover:text-amber-deep text-sm font-medium inline-flex items-center gap-1">
              View All <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6">
            {featured.map((product) => (
              <ProductCard key={product.id} {...product} />
            ))}
          </div>
        </section>
      )}

      <section className="max-w-6xl mx-auto px-4 py-20">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {features.map((f) => (
            <div key={f.title} className="card p-8 text-center hover:shadow-md transition-shadow">
              <f.icon className="w-10 h-10 text-amber-warm mx-auto mb-4" />
              <h3 className="text-lg font-bold mb-2">{f.title}</h3>
              <p className="text-charcoal-700/70 text-sm">{f.desc}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="bg-cream-200/50 py-20">
        <div className="max-w-6xl mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold mb-4">How It Works</h2>
          <p className="text-charcoal-700/70 mb-12 max-w-xl mx-auto">
            Simple, secure ordering — no account needed to shop.
          </p>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            {['Browse & Pick', 'Add to Cart', 'Pay via UPI', 'Receive at Door'].map((step, i) => (
              <div key={step} className="flex flex-col items-center">
                <div className="w-12 h-12 rounded-full bg-amber-warm text-white flex items-center justify-center font-bold text-lg mb-3">
                  {i + 1}
                </div>
                <p className="font-medium">{step}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="max-w-6xl mx-auto px-4 py-20">
        <h2 className="text-3xl font-bold text-center mb-12">What Our Customers Say</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {testimonials.map((t) => (
            <div key={t.name} className="card p-6">
              <div className="flex gap-1 mb-3">
                {[...Array(t.rating)].map((_, i) => (
                  <Star key={i} className="w-4 h-4 fill-amber-warm text-amber-warm" />
                ))}
              </div>
              <p className="text-sm text-charcoal-700/80 mb-4">&ldquo;{t.text}&rdquo;</p>
              <p className="text-sm font-medium text-charcoal-900">{t.name}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="bg-charcoal-900 text-cream-100 py-20">
        <div className="max-w-6xl mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold mb-4">Ready to Commission a Custom Piece?</h2>
          <p className="text-cream-400 mb-8 max-w-lg mx-auto">
            Share your vision — colors, materials, size — and we&apos;ll create something uniquely yours.
          </p>
          <Link
            href="/custom-order"
            className="btn-primary inline-flex items-center gap-2"
          >
            Start Your Commission <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </section>
    </div>
  );
}
