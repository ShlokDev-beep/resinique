import { Sparkles, Heart, Palette, Award } from 'lucide-react';
import Link from 'next/link';

export default function AboutPage() {
  return (
    <div>
      <section className="bg-gradient-to-br from-cream-100 via-champagne to-cream-200 py-20">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <Sparkles className="w-8 h-8 text-amber-warm mx-auto mb-4" />
          <h1 className="text-4xl font-bold mb-4">Our Story</h1>
          <p className="text-lg text-charcoal-700/70 max-w-2xl mx-auto">
            From a kitchen table to your home — every piece carries a piece of our heart.
          </p>
        </div>
      </section>

      <section className="max-w-4xl mx-auto px-4 py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
          <div className="space-y-6">
            <h2 className="text-3xl font-bold">Hi, I&apos;m Pallavi!</h2>
            <p className="text-charcoal-700/80 leading-relaxed">
              What started as a hobby during lockdown quickly became a passion. I began experimenting with
              epoxy resin — mixing colors, embedding dried flowers from my garden, and playing with metallic
              pigments. Friends and family started asking for custom pieces, and Resinique Creations was born.
            </p>
            <p className="text-charcoal-700/80 leading-relaxed">
              Every piece I create is hand-poured and carefully cured. I use premium-grade, non-toxic epoxy resin
              and UV-resistant topcoats to ensure your art lasts for years. From coasters that spark conversation
              to keepsake boxes that preserve your most precious memories — each creation is made with love.
            </p>
          </div>
          <div className="card p-8 bg-cream-50">
            <h3 className="text-xl font-bold mb-4">My Promise</h3>
            <ul className="space-y-4">
              <li className="flex items-start gap-3">
                <Heart className="w-5 h-5 text-amber-warm mt-0.5 flex-shrink-0" />
                <span className="text-sm text-charcoal-700/80">100% handmade with premium materials</span>
              </li>
              <li className="flex items-start gap-3">
                <Palette className="w-5 h-5 text-amber-warm mt-0.5 flex-shrink-0" />
                <span className="text-sm text-charcoal-700/80">Custom color palettes to match your style</span>
              </li>
              <li className="flex items-start gap-3">
                <Award className="w-5 h-5 text-amber-warm mt-0.5 flex-shrink-0" />
                <span className="text-sm text-charcoal-700/80">UV-resistant & heat-protective finish</span>
              </li>
              <li className="flex items-start gap-3">
                <Sparkles className="w-5 h-5 text-amber-warm mt-0.5 flex-shrink-0" />
                <span className="text-sm text-charcoal-700/80">Careful packaging for safe delivery</span>
              </li>
            </ul>
          </div>
        </div>
      </section>

      <section className="bg-cream-200/50 py-16">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold mb-4">The Process</h2>
          <p className="text-charcoal-700/70 mb-12 max-w-lg mx-auto">
            From mixing to curing, each piece takes 2-3 days to complete.
          </p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              { step: '1', title: 'Design & Mix', desc: 'Colors, patterns, and inclusions are chosen and carefully mixed.' },
              { step: '2', title: 'Pour & Cure', desc: 'Resin is poured in layers and left to cure for 24-48 hours.' },
              { step: '3', title: 'Finish & Ship', desc: 'Sanded, polished, top-coated, and securely packaged for shipping.' },
            ].map((s) => (
              <div key={s.step} className="card p-6">
                <div className="w-10 h-10 rounded-full bg-amber-warm text-white flex items-center justify-center font-bold mx-auto mb-4">
                  {s.step}
                </div>
                <h3 className="font-bold mb-2">{s.title}</h3>
                <p className="text-sm text-charcoal-700/70">{s.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="max-w-4xl mx-auto px-4 py-16 text-center">
        <h2 className="text-3xl font-bold mb-4">Let&apos;s Create Together</h2>
        <p className="text-charcoal-700/70 mb-8 max-w-lg mx-auto">
          Have a vision for a custom piece? I&apos;d love to hear about it.
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link href="/custom-order" className="btn-primary inline-flex items-center gap-2 justify-center">
            Start a Commission
          </Link>
          <a
            href={`https://wa.me/${process.env.NEXT_PUBLIC_SELLER_PHONE || '919876543210'}`}
            target="_blank"
            rel="noopener noreferrer"
            className="btn-outline inline-flex items-center gap-2 justify-center"
          >
            Chat on WhatsApp
          </a>
        </div>
      </section>
    </div>
  );
}
