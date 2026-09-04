import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { checkoutSchema } from '@/lib/validations';

function generateOrderNumber(): string {
  const date = new Date();
  const prefix = 'RQ';
  const datePart = `${date.getFullYear()}${String(date.getMonth() + 1).padStart(2, '0')}${String(date.getDate()).padStart(2, '0')}`;
  const randomPart = Math.random().toString(36).substring(2, 8).toUpperCase();
  return `${prefix}-${datePart}-${randomPart}`;
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const validated = checkoutSchema.parse(body);

    if (!body.items || !Array.isArray(body.items) || body.items.length === 0) {
      return NextResponse.json({ error: 'Cart is empty' }, { status: 400 });
    }

    // Server-side price calculation — never trust client prices
    const productIds = body.items.map((item: { productId: string }) => item.productId);
    const products = await prisma.product.findMany({
      where: { id: { in: productIds } },
    });

    const productMap = new Map(products.map((p) => [p.id, p]));

    let totalAmount = 0;
    const orderItems = body.items.map((item: { productId: string; quantity: number }) => {
      const product = productMap.get(item.productId);
      if (!product) {
        throw new Error(`Product not found: ${item.productId}`);
      }
      if (product.stock < item.quantity) {
        throw new Error(`Insufficient stock for ${product.title}`);
      }
      const quantity = Math.max(1, Math.floor(item.quantity));
      totalAmount += product.price * quantity;
      return {
        productId: item.productId,
        quantity,
        priceAtSale: product.price,
      };
    });

    // Standard shipping: free above ₹1,000, else ₹99
    if (totalAmount < 1000) {
      totalAmount += 99;
    }

    const orderNumber = generateOrderNumber();

    // Deduct stock
    for (const item of orderItems) {
      await prisma.product.update({
        where: { id: item.productId },
        data: { stock: { decrement: item.quantity } },
      });
    }

    const order = await prisma.order.create({
      data: {
        orderNumber,
        customerName: validated.customerName,
        customerPhone: validated.customerPhone,
        shippingAddress: validated.shippingAddress,
        utrNumber: validated.utrNumber,
        proofImageUrl: body.proofImageUrl || '',
        totalAmount,
        items: {
          create: orderItems,
        },
      },
      include: { items: { include: { product: true } } },
    });

    const sellerPhone = process.env.NEXT_PUBLIC_SELLER_PHONE || '919876543210';
    const whatsappMessage = `Hi Pallavi, I have placed order #${orderNumber} for ₹${totalAmount.toLocaleString()}. UTR: ${validated.utrNumber}`;
    const whatsappUrl = `https://wa.me/${sellerPhone}?text=${encodeURIComponent(whatsappMessage)}`;

    return NextResponse.json({ order, whatsappUrl });
  } catch (error: any) {
    if (error.name === 'ZodError') {
      return NextResponse.json({ error: error.errors }, { status: 400 });
    }
    if (error.message?.includes('Product not found') || error.message?.includes('Insufficient stock')) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }
    return NextResponse.json({ error: 'Failed to create order' }, { status: 500 });
  }
}
