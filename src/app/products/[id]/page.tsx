import { Metadata } from 'next';
import prisma from '@/lib/prisma';
import ProductDetailClient from './ProductDetailClient';

interface Props {
  params: { id: string };
}

async function getProduct(id: string) {
  try {
    const product = await prisma.product.findUnique({ where: { id } });
    if (!product) return null;

    const related = await prisma.product.findMany({
      where: { category: product.category, id: { not: product.id } },
      take: 4,
      orderBy: { createdAt: 'desc' },
    });

    return { product, related };
  } catch {
    return null;
  }
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const data = await getProduct(params.id);
  if (!data?.product) return { title: 'Product Not Found' };

  const p = data.product;
  return {
    title: `${p.title} | Resinique Creations`,
    description: p.description.slice(0, 160),
    openGraph: {
      title: p.title,
      description: p.description.slice(0, 160),
      type: 'website',
    },
  };
}

export default async function ProductDetailPage({ params }: Props) {
  const data = await getProduct(params.id);

  const product = data?.product || null;
  const related = data?.related || [];

  return <ProductDetailClient product={product} related={related} />;
}
