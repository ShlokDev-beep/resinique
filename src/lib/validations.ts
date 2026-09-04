import { z } from 'zod';

export const checkoutSchema = z.object({
  customerName: z.string().min(2, 'Name is required'),
  customerPhone: z.string().min(10, 'Valid phone number required'),
  shippingAddress: z.string().min(10, 'Full address required'),
  utrNumber: z.string().regex(/^\d{12}$/, 'UTR must be exactly 12 digits'),
});

export const commissionSchema = z.object({
  customerName: z.string().min(2, 'Name is required'),
  customerPhone: z.string().min(10, 'Valid phone number required'),
  itemType: z.string().min(2, 'Item type is required'),
  colorPalette: z.string().min(2, 'Color palette is required'),
  inclusions: z.string().min(2, 'Inclusions are required'),
  notes: z.string().optional(),
});

export const productSchema = z.object({
  title: z.string().min(2),
  description: z.string().min(10),
  category: z.string().min(1),
  price: z.number().positive(),
  stock: z.number().int().min(0),
  leadTimeDays: z.number().int().min(1),
  isCustomizable: z.boolean(),
});

export const loginSchema = z.object({
  phone: z.string().min(10),
  password: z.string().min(6),
});

export const registerSchema = z.object({
  name: z.string().min(2),
  phone: z.string().min(10),
  password: z.string().min(6),
});
