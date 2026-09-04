import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const category = searchParams.get('category');
  const search = searchParams.get('search');
  const sort = searchParams.get('sort') || 'newest';

  const where: any = {};
  if (category && category !== 'All') where.category = category;
  if (search) where.title = { contains: search };

  const orderBy: any =
    sort === 'price-asc'
      ? { price: 'asc' }
      : sort === 'price-desc'
        ? { price: 'desc' }
        : sort === 'name'
          ? { title: 'asc' }
          : { createdAt: 'desc' };

  const products = await prisma.product.findMany({
    where,
    orderBy,
  });

  return NextResponse.json(products);
}
