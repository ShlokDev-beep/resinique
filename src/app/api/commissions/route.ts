import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { commissionSchema } from '@/lib/validations';
import { requireAdmin } from '@/lib/admin-auth';

export async function GET() {
  const auth = await requireAdmin();
  if (auth.error) return auth.error;

  const commissions = await prisma.commission.findMany({
    orderBy: { createdAt: 'desc' },
  });
  return NextResponse.json(commissions);
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const validated = commissionSchema.parse(body);

    const commission = await prisma.commission.create({
      data: {
        customerName: validated.customerName,
        customerPhone: validated.customerPhone,
        itemType: validated.itemType,
        colorPalette: validated.colorPalette,
        inclusions: validated.inclusions,
        notes: validated.notes || '',
        referenceImage: body.referenceImage || null,
      },
    });

    const sellerPhone = process.env.NEXT_PUBLIC_SELLER_PHONE || '919876543210';
    const whatsappMessage = `Hi Pallavi! I'd like a custom resin piece:\n\nType: ${validated.itemType}\nColors: ${validated.colorPalette}\nInclusions: ${validated.inclusions}\nNotes: ${validated.notes || 'None'}\n\nPlease share a quote!`;
    const whatsappUrl = `https://wa.me/${sellerPhone}?text=${encodeURIComponent(whatsappMessage)}`;

    return NextResponse.json({ commission, whatsappUrl });
  } catch (error: any) {
    if (error.name === 'ZodError') {
      return NextResponse.json({ error: error.errors }, { status: 400 });
    }
    return NextResponse.json({ error: 'Failed to create commission request' }, { status: 500 });
  }
}

export async function PATCH(request: NextRequest) {
  const auth = await requireAdmin();
  if (auth.error) return auth.error;

  try {
    const body = await request.json();
    const { id, status, quotePrice } = body;

    if (!id) {
      return NextResponse.json({ error: 'Commission ID required' }, { status: 400 });
    }

    const updateData: Record<string, string | number> = {};
    if (status) updateData.status = status;
    if (quotePrice !== undefined) updateData.quotePrice = parseFloat(quotePrice);

    const commission = await prisma.commission.update({
      where: { id },
      data: updateData,
    });

    return NextResponse.json(commission);
  } catch {
    return NextResponse.json({ error: 'Failed to update commission' }, { status: 500 });
  }
}
