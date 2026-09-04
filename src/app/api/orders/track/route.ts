import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const orderNumber = searchParams.get('orderNumber');
  const phone = searchParams.get('phone');

  if (!orderNumber || !phone) {
    return NextResponse.json({ error: 'Order number and phone required' }, { status: 400 });
  }

  const order = await prisma.order.findFirst({
    where: {
      orderNumber: orderNumber.toUpperCase(),
      customerPhone: phone,
    },
    include: { items: { include: { product: true } } },
  });

  if (!order) {
    return NextResponse.json({ error: 'Order not found' }, { status: 404 });
  }

  return NextResponse.json({
    orderNumber: order.orderNumber,
    status: order.status,
    totalAmount: order.totalAmount,
    createdAt: order.createdAt,
    items: order.items.map((item) => ({
      title: item.product.title,
      quantity: item.quantity,
      price: item.priceAtSale,
    })),
    trackingUrl: order.trackingUrl,
    courierName: order.courierName,
  });
}
