# Pallavi's Resinique Creations

A zero-fee artisan resin marketplace built with Next.js 14, Prisma, and Tailwind CSS. No Stripe/Razorpay — checkout uses direct UPI payments with proof-of-payment uploads and WhatsApp order handoffs.

## Quick Start

```bash
# 1. Install dependencies
npm install

# 2. Set up environment
cp .env.example .env
# Edit .env with your UPI details and a secret key

# 3. Initialize database & seed demo data
npx prisma db push
npx tsx prisma/seed.ts

# 4. Start dev server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

## Admin Access

| Field    | Value               |
|----------|---------------------|
| Phone    | `919876543210`      |
| Password | `admin123`          |

Navigate to `/admin` to manage orders, commissions, and products.

## Tech Stack

| Layer         | Technology                                      |
|---------------|------------------------------------------------|
| Framework     | Next.js 14 (App Router) + TypeScript           |
| Styling       | Tailwind CSS + Lucide React icons               |
| Database      | Prisma ORM + SQLite (swap to PostgreSQL)        |
| Auth          | NextAuth.js (credentials + JWT + role-based)    |
| State         | Zustand + localStorage (cart persistence)       |
| Forms         | React Hook Form + Zod validation                |
| Payments      | Direct UPI (QR code + UPI ID + UTR verification)|

## Features

### Customer Storefront
- **Product Catalog** — Filter by category (Coasters, Trays, Clocks & Art, Jewelry, Preserved Keepsakes), search, and sort
- **Product Detail** — Image gallery, care tips, stock status, related products, social sharing
- **Shopping Cart** — Persistent drawer with quantity controls, subtotal calculation
- **Custom Commissions** — Form for custom resin requests with reference image upload, WhatsApp handoff
- **Order Tracking** — Visual status stepper (Placed → Verified → Preparing → Shipped → Delivered)
- **Account / My Orders** — Phone-based order history lookup

### Zero-Fee UPI Checkout
- Dynamic `upi://pay` QR code link with order total
- Static UPI ID with copy-to-clipboard
- 12-digit UTR number validation (regex: `^\d{12}$`)
- Payment screenshot upload
- Server-side price calculation (prevents client-side price manipulation)
- Pre-filled WhatsApp confirmation message

### Admin Dashboard
- **Stats Overview** — Total orders, pending verification, shipped, revenue, products, pending commissions
- **Orders Management** — Filter by status, view payment proof screenshots, verify payment, mark as processing/shipped with tracking URL
- **Commissions Inbox** — Review custom requests, set quote prices, approve/reject
- **Product Inventory** — CRUD with photo upload, stock management, category assignment

### Security
- **Server-side middleware** — Admin routes protected at the edge
- **API auth guards** — `requireAdmin()` on all admin endpoints
- **Server-side pricing** — Order totals computed from database, not client input
- **Upload validation** — File type whitelist (JPEG/PNG/WebP/HEIC), 5MB size limit
- **Zod validation** — All form inputs validated server and client side

### SEO & Crawling
- Auto-generated `sitemap.xml` with all product URLs
- `robots.txt` allowing storefront crawling, blocking admin/API
- Dynamic OpenGraph metadata per product page
- Social sharing (WhatsApp, Facebook, copy link)

## Project Structure

```
src/
├── app/
│   ├── api/
│   │   ├── admin/
│   │   │   ├── orders/       # GET, PATCH (admin auth)
│   │   │   ├── products/     # POST, PATCH, DELETE (admin auth)
│   │   │   └── stats/        # GET (admin auth)
│   │   ├── auth/
│   │   │   ├── [...nextauth]/ # NextAuth handler
│   │   │   └── register/     # POST (public)
│   │   ├── commissions/      # GET, POST, PATCH
│   │   ├── orders/
│   │   │   ├── create/       # POST (public)
│   │   │   ├── customer/     # GET (by phone)
│   │   │   └── track/        # GET (by orderNumber + phone)
│   │   ├── products/
│   │   │   ├── [id]/         # GET (single + related)
│   │   │   └── index/        # GET (list with filters)
│   │   └── upload/           # POST (file upload)
│   ├── admin/                # Admin dashboard pages
│   ├── products/             # Product catalog + detail
│   ├── checkout/             # UPI checkout flow
│   ├── custom-order/         # Commission request form
│   ├── track-order/          # Order status tracker
│   ├── account/              # Customer order history
│   ├── about/                # Brand story
│   ├── login/                # Auth page
│   ├── sitemap.ts            # Dynamic sitemap
│   ├── robots.ts             # Robots.txt
│   ├── not-found.tsx         # Custom 404
│   ├── error.tsx             # Error boundary
│   └── loading.tsx           # Root loading state
├── components/
│   ├── Navbar.tsx            # Sticky nav with cart badge
│   ├── CartDrawer.tsx        # Slide-out cart
│   ├── ProductCard.tsx       # Product grid card
│   ├── Providers.tsx         # NextAuth SessionProvider
│   ├── WhatsAppButton.tsx    # Floating WhatsApp CTA
│   └── BackToTop.tsx         # Scroll-to-top button
├── lib/
│   ├── prisma.ts             # Prisma client singleton
│   ├── auth.ts               # NextAuth configuration
│   ├── admin-auth.ts         # Server-side admin guard
│   ├── store.ts              # Zustand cart store
│   ├── validations.ts        # Zod schemas
│   └── utils.ts              # Safe JSON parse helper
└── types/
    └── next-auth.d.ts        # Session type augmentation
```

## Database Schema

| Model        | Purpose                                    |
|--------------|--------------------------------------------|
| User         | Admin/customer accounts with role-based auth|
| Product      | Resin pieces with images, stock, pricing   |
| Order        | Customer orders with UTR + payment proof    |
| OrderItem    | Line items linking orders to products       |
| Commission   | Custom piece requests with quote workflow   |

## Environment Variables

| Variable                | Required | Description                          |
|------------------------|----------|--------------------------------------|
| `DATABASE_URL`         | Yes      | Prisma connection string             |
| `NEXTAUTH_SECRET`      | Yes      | Random string for JWT signing        |
| `NEXTAUTH_URL`         | Yes      | App URL (e.g., http://localhost:3000)|
| `NEXT_PUBLIC_UPI_VPA`  | Yes      | Seller UPI virtual payment address   |
| `NEXT_PUBLIC_SELLER_NAME` | Yes   | Display name for UPI QR              |
| `NEXT_PUBLIC_SELLER_PHONE` | Yes  | WhatsApp number (with country code)  |

## Deployment

### Production (PostgreSQL)

1. Change `provider = "sqlite"` to `provider = "postgresql"` in `prisma/schema.prisma`
2. Update `DATABASE_URL` in `.env` to your PostgreSQL connection string
3. Run `npx prisma db push` to sync schema
4. Run `npx tsx prisma/seed.ts` to seed initial data
5. Build and deploy:

```bash
npm run build
npm start
```

### Supported Platforms
- Vercel (recommended)
- Railway
- Any Node.js hosting with file system access for uploads

## Customization

### Changing UPI Details
Edit `.env`:
```
NEXT_PUBLIC_UPI_VPA="your-vpa@bank"
NEXT_PUBLIC_SELLER_NAME="Your Name"
NEXT_PUBLIC_SELLER_PHONE="919XXXXXXXXX"
```

### Adding Product Categories
Edit the `categories` array in:
- `src/app/products/page.tsx` (catalog filter)
- `src/app/custom-order/page.tsx` (commission form)
- `src/app/admin/products/page.tsx` (admin form)

### Changing Theme Colors
Edit the color palette in `tailwind.config.ts`:
```ts
colors: {
  cream: { ... },    // Background tones
  charcoal: { ... }, // Text colors
  amber: { ... },    // Accent colors
  champagne: '#...', // Highlight
}
```

## License

Private — Pallavi's Resinique Creations
