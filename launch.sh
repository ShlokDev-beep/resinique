#!/bash
# One-command bootstrap + dev server for Resinique
# Usage: bash launch.sh

# Step 1: Ensure .env exists
if [ ! -f .env ]; then
  cp .env.example .env
fi

# Step 2: Ensure database is ready (idempotent — safe every launch)
npx prisma db push > /dev/null 2>&1

# Step 3: Seed admin + 6 products (idempotent — upsert, won't duplicate)
npx tsx prisma/seed.ts > /dev/null 2>&1

# Step 4: Start dev server (background so this script returns)
npm run dev &
DEV_PID=$!
echo "🚀 Resinique running at http://localhost:3000"
echo "Admin: phone +91 8961523294 / password admin123"
echo "Press Ctrl+C to stop (or kill PID $DEV_PID)"
trap "kill $DEV_PID 2>/dev/null" EXIT
wait $DEV_PID 2>/dev/null
