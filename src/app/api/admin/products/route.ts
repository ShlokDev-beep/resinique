import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { requireAdmin } from '@/lib/admin-auth';

export async function POST(request: NextRequest) {
  const auth = await requireAdmin();
  if (auth.error) return auth.error;

  try {
    const body = await request.json();

    const product = await prisma.product.create({
      data: {
        title: body.title,
        description: body.description,
        category: body.category,
        price: parseFloat(body.price),
        images: JSON.stringify(body.images || []),
        stock: parseInt(body.stock) || 1,
        leadTimeDays: parseInt(body.leadTimeDays) || 3,
        isCustomizable: body.isCustomizable || false,
      },
    });

    return NextResponse.json(product);
  } catch {
    return NextResponse.json({ error: 'Failed to create product' }, { status: 500 });
  }
}

export async function PATCH(request: NextRequest) {
  const auth = await requireAdmin();
  if (auth.error) return auth.error;

  try {
    const body = await request.json();
    const { id, ...updates } = body;

    if (!id) {
      return NextResponse.json({ error: 'Product ID required' }, { status: 400 });
    }

    const data: Record<string, any> = {};
    if (updates.title !== undefined) data.title = updates.title;
    if (updates.description !== undefined) data.description = updates.description;
    if (updates.category !== undefined) data.category = updates.category;
    if (updates.price !== undefined) data.price = parseFloat(updates.price);
    if (updates.images !== undefined) data.images = JSON.stringify(updates.images);
    if (updates.stock !== undefined) data.stock = parseInt(updates.stock);
    if (updates.leadTimeDays !== undefined) data.leadTimeDays = parseInt(updates.leadTimeDays);
    if (updates.isCustomizable !== undefined) data.isCustomizable = updates.isCustomizable;

    const product = await prisma.product.update({
      where: { id },
      data,
    });

    return NextResponse.json(product);
  } catch {
    return NextResponse.json({ error: 'Failed to update product' }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  const auth = await requireAdmin();
  if (auth.error) return auth.error;

  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ error: 'Product ID required' }, { status: 400 });
    }

    await prisma.product.delete({ where: { id } });

    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: 'Failed to delete product' }, { status: 500 });
  }
}
