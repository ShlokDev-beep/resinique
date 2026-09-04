import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Shop Handcrafted Resin Art | Resinique Creations',
  description: 'Browse our collection of handcrafted epoxy resin coasters, trays, jewelry, wall art, and preserved keepsakes. Each piece is unique.',
};

export default function ProductsLayout({ children }: { children: React.ReactNode }) {
  return children;
}
