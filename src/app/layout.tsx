import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import Navbar from '@/components/Navbar';
import WhatsAppButton from '@/components/WhatsAppButton';
import BackToTop from '@/components/BackToTop';
import { Providers } from '@/components/Providers';

const inter = Inter({ subsets: ['latin'], variable: '--font-inter' });

export const metadata: Metadata = {
  title: "Pallavi's Resinique Creations",
  description: 'Handcrafted epoxy resin art — coasters, trays, jewelry, wall art & custom commissions.',
  icons: { icon: '/favicon.svg' },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className={`${inter.variable} font-sans`}>
        <Providers>
          <Navbar />
          <main className="min-h-screen">{children}</main>
          <footer className="bg-charcoal-900 text-cream-200 py-12 mt-16">
            <div className="max-w-6xl mx-auto px-4 grid grid-cols-1 md:grid-cols-3 gap-8">
              <div>
                <h3 className="text-lg font-bold mb-3">Resinique Creations</h3>
                <p className="text-cream-400 text-sm">
                  Handcrafted with love by Pallavi. Each piece is unique, made with premium epoxy resin.
                </p>
              </div>
              <div>
                <h3 className="text-lg font-bold mb-3">Quick Links</h3>
                <ul className="space-y-2 text-sm text-cream-400">
                  <li><a href="/products" className="hover:text-cream-100">Shop</a></li>
                  <li><a href="/custom-order" className="hover:text-cream-100">Custom Orders</a></li>
                  <li><a href="/about" className="hover:text-cream-100">About</a></li>
                  <li><a href="/track-order" className="hover:text-cream-100">Track Order</a></li>
                  <li><a href="/account" className="hover:text-cream-100">My Orders</a></li>
                </ul>
              </div>
              <div>
                <h3 className="text-lg font-bold mb-3">Contact</h3>
                <p className="text-cream-400 text-sm">
                  WhatsApp: +91 {process.env.NEXT_PUBLIC_SELLER_PHONE?.replace(/^91/, '') || '98 7654 3210'}<br />
                  UPI: {process.env.NEXT_PUBLIC_UPI_VPA || 'pallavi@upi'}
                </p>
              </div>
            </div>
            <div className="max-w-6xl mx-auto px-4 mt-8 pt-8 border-t border-charcoal-700 text-center text-cream-500 text-sm">
              © 2026 Pallavi's Resinique Creations. All rights reserved.
            </div>
          </footer>
          <WhatsAppButton />
          <BackToTop />
        </Providers>
      </body>
    </html>
  );
}
