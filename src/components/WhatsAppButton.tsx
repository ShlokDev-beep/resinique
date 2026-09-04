'use client';

import { MessageCircle } from 'lucide-react';

export default function WhatsAppButton() {
  const phone = process.env.NEXT_PUBLIC_SELLER_PHONE || '919876543210';
  const message = encodeURIComponent("Hi Pallavi! I'm interested in your resin creations.");

  return (
    <a
      href={`https://wa.me/${phone}?text=${message}`}
      target="_blank"
      rel="noopener noreferrer"
      className="fixed bottom-6 right-6 z-50 bg-green-500 text-white w-14 h-14 rounded-full flex items-center justify-center shadow-lg hover:bg-green-600 hover:scale-110 transition-all duration-200"
      aria-label="Chat on WhatsApp"
    >
      <MessageCircle className="w-6 h-6" />
    </a>
  );
}
