import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { requireAdmin } from '@/lib/admin-auth';

export async function GET() {
  const auth = await requireAdmin();
  if (auth.error) return auth.error;

  const [
    totalOrders,
    pendingOrders,
    verifiedOrders,
    shippedOrders,
    totalRevenue,
    totalProducts,
    totalCommissions,
    pendingCommissions,
    lowStockProducts,
    outOfStockProducts,
    recentOrders,
  ] = await Promise.all([
    prisma.order.count(),
    prisma.order.count({ where: { status: 'PENDING_VERIFICATION' } }),
    prisma.order.count({ where: { status: 'PAYMENT_VERIFIED' } }),
    prisma.order.count({ where: { status: 'SHIPPED' } }),
    prisma.order.aggregate({ _sum: { totalAmount: true }, where: { status: { not: 'CANCELLED' } } }),
    prisma.product.count(),
    prisma.commission.count(),
    prisma.commission.count({ where: { status: 'PENDING_REVIEW' } }),
    prisma.product.count({ where: { stock: { gt: 0, lte: 3 } } }),
    prisma.product.count({ where: { stock: 0 } }),
    prisma.order.findMany({
      take: 5,
      orderBy: { createdAt: 'desc' },
      select: {
        id: true,
        orderNumber: true,
        customerName: true,
        totalAmount: true,
        status: true,
        createdAt: true,
      },
    }),
  ]);

  return NextResponse.json({
    totalOrders,
    pendingOrders,
    verifiedOrders,
    shippedOrders,
    totalRevenue: totalRevenue._sum.totalAmount || 0,
    totalProducts,
    totalCommissions,
    pendingCommissions,
    lowStockProducts,
    outOfStockProducts,
    recentOrders,
  });
}
