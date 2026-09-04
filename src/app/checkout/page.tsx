'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { checkoutSchema } from '@/lib/validations';
import { useCartStore } from '@/lib/store';
import { Upload, Copy, ExternalLink, CheckCircle } from 'lucide-react';

type CheckoutForm = {
  customerName: string;
  customerPhone: string;
  shippingAddress: string;
  utrNumber: string;
};

export default function CheckoutPage() {
  const { items, getTotal, clearCart } = useCartStore();
  const [proofFile, setProofFile] = useState<File | null>(null);
  const [proofUrl, setProofUrl] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [orderResult, setOrderResult] = useState<any>(null);
  const [copied, setCopied] = useState(false);

  const total = getTotal();
  const shipping = total >= 1000 ? 0 : 99;
  const grandTotal = total + shipping;
  const upiVpa = process.env.NEXT_PUBLIC_UPI_VPA || 'pallavi@upi';
  const sellerName = process.env.NEXT_PUBLIC_SELLER_NAME || "Pallavi's Resinique";

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<CheckoutForm>({
    resolver: zodResolver(checkoutSchema),
  });

  const upiLink = `upi://pay?pa=${upiVpa}&pn=${encodeURIComponent(sellerName)}&am=${grandTotal}&cu=INR`;

  const copyUpi = () => {
    navigator.clipboard.writeText(upiVpa);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleFileUpload = async (file: File): Promise<string> => {
    const formData = new FormData();
    formData.append('file', file);
    const res = await fetch('/api/upload', { method: 'POST', body: formData });
    const data = await res.json();
    return data.url;
  };

  const onSubmit = async (formData: CheckoutForm) => {
    if (items.length === 0) return;
    setSubmitting(true);

    try {
      let uploadedUrl = proofUrl;
      if (proofFile) {
        uploadedUrl = await handleFileUpload(proofFile);
        setProofUrl(uploadedUrl);
      }

      const res = await fetch('/api/orders/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          proofImageUrl: uploadedUrl,
          items: items.map((item) => ({
            productId: item.productId,
            quantity: item.quantity,
          })),
        }),
      });

      const data = await res.json();
      if (data.error) throw new Error(data.error);

      setOrderResult(data);
      clearCart();
    } catch (err: any) {
      alert(err.message || 'Failed to place order');
    } finally {
      setSubmitting(false);
    }
  };

  if (orderResult) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-16">
        <div className="text-center mb-8">
          <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
          <h1 className="text-3xl font-bold mb-4">Order Placed!</h1>
          <p className="text-charcoal-700/70">
            Order Number: <span className="font-mono font-bold">{orderResult.order.orderNumber}</span>
          </p>
        </div>

        <div className="card p-6 mb-6">
          <h2 className="font-bold mb-4">Order Summary</h2>
          <div className="space-y-2 mb-4">
            {orderResult.order.items?.map((item: any, i: number) => (
              <div key={i} className="flex justify-between text-sm">
                <span className="text-charcoal-700/70">{item.product?.title || 'Product'} × {item.quantity}</span>
                <span>₹{(item.priceAtSale * item.quantity).toLocaleString()}</span>
              </div>
            ))}
          </div>
          <div className="border-t border-cream-200 pt-3 flex justify-between font-bold">
            <span>Total Paid</span>
            <span>₹{orderResult.order.totalAmount.toLocaleString()}</span>
          </div>
        </div>

        <div className="card p-6 mb-6">
          <h2 className="font-bold mb-3">What&apos;s Next?</h2>
          <ol className="space-y-3 text-sm text-charcoal-700/80">
            <li className="flex gap-3">
              <span className="w-6 h-6 rounded-full bg-amber-warm text-white text-xs flex items-center justify-center flex-shrink-0">1</span>
              <span>We&apos;ll verify your UTR payment within a few hours.</span>
            </li>
            <li className="flex gap-3">
              <span className="w-6 h-6 rounded-full bg-cream-300 text-charcoal-700 text-xs flex items-center justify-center flex-shrink-0">2</span>
              <span>Once verified, we begin preparing your order.</span>
            </li>
            <li className="flex gap-3">
              <span className="w-6 h-6 rounded-full bg-cream-300 text-charcoal-700 text-xs flex items-center justify-center flex-shrink-0">3</span>
              <span>You&apos;ll receive a tracking link when your order ships.</span>
            </li>
          </ol>
        </div>

        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <a
            href={orderResult.whatsappUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="btn-primary inline-flex items-center justify-center gap-2"
          >
            Confirm on WhatsApp <ExternalLink className="w-4 h-4" />
          </a>
          <a href="/track-order" className="btn-secondary inline-flex items-center justify-center gap-2">
            Track Order
          </a>
          <a href="/products" className="btn-outline inline-flex items-center justify-center">
            Continue Shopping
          </a>
        </div>
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-16 text-center">
        <h1 className="text-3xl font-bold mb-4">Your cart is empty</h1>
        <a href="/products" className="btn-primary">Browse Products</a>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-10">
      <h1 className="text-3xl font-bold mb-8">Checkout</h1>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          <div>
            <h2 className="text-lg font-bold mb-4">Shipping Details</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">Full Name</label>
                <input {...register('customerName')} className={`input-field ${errors.customerName ? 'border-red-400 focus:ring-red-300' : ''}`} placeholder="Your name" />
                {errors.customerName && <p className="text-red-500 text-xs mt-1">{errors.customerName.message}</p>}
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Phone Number</label>
                <input {...register('customerPhone')} className={`input-field ${errors.customerPhone ? 'border-red-400 focus:ring-red-300' : ''}`} placeholder="91XXXXXXXXXX" />
                {errors.customerPhone && <p className="text-red-500 text-xs mt-1">{errors.customerPhone.message}</p>}
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Shipping Address</label>
                <textarea {...register('shippingAddress')} className={`input-field ${errors.shippingAddress ? 'border-red-400 focus:ring-red-300' : ''}`} rows={3} placeholder="Full address with pincode" />
                {errors.shippingAddress && <p className="text-red-500 text-xs mt-1">{errors.shippingAddress.message}</p>}
              </div>
            </div>
          </div>

          <div>
            <h2 className="text-lg font-bold mb-4">Payment</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">12-Digit UTR / Transaction Reference</label>
                <input {...register('utrNumber')} className={`input-field font-mono tracking-widest ${errors.utrNumber ? 'border-red-400 focus:ring-red-300' : ''}`} placeholder="123456789012" maxLength={12} />
                {errors.utrNumber && <p className="text-red-500 text-xs mt-1">{errors.utrNumber.message}</p>}
                <p className="text-xs text-charcoal-700/40 mt-1">Find this in your UPI app after payment</p>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Payment Screenshot</label>
                <div className="border-2 border-dashed border-cream-400 rounded-xl p-6 text-center hover:border-amber-warm transition-colors">
                  <Upload className="w-8 h-8 mx-auto mb-2 text-cream-400" />
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => setProofFile(e.target.files?.[0] || null)}
                    className="hidden"
                    id="proof-upload"
                  />
                  <label htmlFor="proof-upload" className="cursor-pointer text-sm text-charcoal-700/60 hover:text-amber-warm">
                    {proofFile ? proofFile.name : 'Click to upload payment screenshot'}
                  </label>
                </div>
              </div>
            </div>
          </div>

          <button type="submit" disabled={submitting} className="btn-primary w-full">
            {submitting ? 'Placing Order...' : 'Place Order'}
          </button>
        </form>

        <div>
          <div className="card p-6 sticky top-24">
            <h2 className="text-lg font-bold mb-4">Order Summary</h2>
            <div className="space-y-3 mb-6">
              {items.map((item) => (
                <div key={item.productId} className="flex justify-between text-sm">
                  <span>
                    {item.title} × {item.quantity}
                  </span>
                  <span>₹{(item.price * item.quantity).toLocaleString()}</span>
                </div>
              ))}
            </div>
            <div className="border-t border-cream-200 pt-3 space-y-2">
              <div className="flex justify-between text-sm">
                <span>Subtotal</span>
                <span>₹{total.toLocaleString()}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span>Shipping</span>
                <span>{shipping === 0 ? 'Free' : `₹${shipping}`}</span>
              </div>
              <div className="flex justify-between font-bold text-lg pt-2 border-t border-cream-200">
                <span>Total</span>
                <span>₹{grandTotal.toLocaleString()}</span>
              </div>
            </div>

            <div className="mt-6 p-4 bg-cream-50 rounded-xl space-y-3">
              <h3 className="font-bold text-sm">Pay via UPI</h3>
              <p className="text-xs text-charcoal-700/60">
                Scan the QR code or use the UPI ID below to pay ₹{grandTotal.toLocaleString()}
              </p>

              <div className="bg-white p-4 rounded-lg text-center border border-cream-200">
                <p className="text-xs text-charcoal-700/50 mb-1">UPI ID</p>
                <div className="flex items-center justify-center gap-2">
                  <span className="font-mono font-bold">{upiVpa}</span>
                  <button onClick={copyUpi} className="p-1 hover:text-amber-warm">
                    {copied ? <CheckCircle className="w-4 h-4 text-green-500" /> : <Copy className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <a
                href={upiLink}
                className="btn-primary w-full flex items-center justify-center gap-2 text-sm"
              >
                Pay ₹{grandTotal.toLocaleString()} via UPI
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
