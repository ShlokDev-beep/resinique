export default function Loading() {
  return (
    <div className="min-h-[60vh] flex items-center justify-center">
      <div className="flex flex-col items-center gap-3">
        <div className="w-8 h-8 border-3 border-cream-300 border-t-amber-warm rounded-full animate-spin" />
        <p className="text-sm text-charcoal-700/50">Loading...</p>
      </div>
    </div>
  );
}
