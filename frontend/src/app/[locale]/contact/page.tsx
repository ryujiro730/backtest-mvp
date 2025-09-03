// app/[locale]/contact/page.tsx

export default function ContactPage() {
  return (
    <section className="section bg-black/40">
      <div className="container mx-auto max-w-3xl px-6 text-center">
        <h2 className="text-3xl font-bold mb-4">Contact Us</h2>
        <p className="text-zinc-400 mb-6">
          Have questions about Delver, partnership opportunities, or feedback on our FX backtesting platform?
          We&apos;d love to hear from you.
        </p>

        <div className="space-y-2 text-zinc-300">
          <p>📧 Email:</p>
          <p>
            <a href="mailto:info@delvertrade.com" className="text-emerald-400 hover:underline">
              info@delvertrade.com
            </a>
          </p>
          <p>
            🐦 Twitter:{' '}
            <a href="https://x.com/_teejey" className="text-emerald-400 hover:underline">
              @_teejey
            </a>
          </p>
          <p>🌏 Based in Japan, serving traders worldwide</p>
        </div>
      </div>
    </section>
  );
}
