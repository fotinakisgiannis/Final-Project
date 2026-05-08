import Link from 'next/link';
import { ArrowRight, Camera, Mic, Barcode, Brain, Zap, Shield } from 'lucide-react';

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-white">
      {/* Nav */}
      <nav className="sticky top-0 z-50 bg-white/95 backdrop-blur-sm border-b border-gray-100">
        <div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-gradient-to-br from-brand-400 to-brand-600 rounded-xl flex items-center justify-center">
              <span className="text-white text-sm font-bold">N</span>
            </div>
            <span className="font-bold text-gray-900">NutriTrack AI</span>
          </div>
          <div className="flex items-center gap-3">
            <Link href="/login" className="text-sm font-medium text-gray-600 hover:text-gray-900 transition-colors">
              Sign in
            </Link>
            <Link
              href="/register"
              className="px-4 py-2 bg-brand-500 hover:bg-brand-600 text-white text-sm font-medium rounded-xl transition-colors"
            >
              Get started free
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section className="pt-20 pb-24 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-brand-50 text-brand-700 rounded-full text-sm font-medium mb-8">
            <Zap className="w-4 h-4" /> Powered by Claude AI
          </div>
          <h1 className="text-5xl sm:text-6xl font-extrabold text-gray-900 mb-6 leading-tight">
            Track nutrition in
            <span className="text-brand-500"> under 5 seconds</span>
          </h1>
          <p className="text-xl text-gray-500 max-w-2xl mx-auto mb-10 leading-relaxed">
            The fastest AI nutrition tracker. Snap a photo, speak your meal, or scan a barcode.
            Get instant calorie and macro breakdowns powered by AI.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link
              href="/register"
              className="flex items-center gap-2 px-8 py-4 bg-brand-500 hover:bg-brand-600 text-white font-semibold rounded-2xl transition-all shadow-glow-green text-lg"
            >
              Start tracking free <ArrowRight className="w-5 h-5" />
            </Link>
            <Link
              href="/login"
              className="flex items-center gap-2 px-8 py-4 border border-gray-300 hover:border-gray-400 text-gray-700 font-semibold rounded-2xl transition-colors text-lg"
            >
              Sign in
            </Link>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-20 bg-gray-50 px-4">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-3xl font-bold text-gray-900 text-center mb-4">Log meals 10x faster</h2>
          <p className="text-gray-500 text-center mb-12">Multiple ways to log, powered by AI</p>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              { icon: Camera, title: 'Photo AI', desc: 'Snap a photo and get instant nutrition data with 90%+ accuracy', color: 'bg-green-100 text-green-600' },
              { icon: Mic, title: 'Voice Log', desc: 'Say what you ate and AI parses it automatically', color: 'bg-blue-100 text-blue-600' },
              { icon: Barcode, title: 'Barcode Scan', desc: 'Scan any packaged food for instant nutrition facts', color: 'bg-purple-100 text-purple-600' },
              { icon: Brain, title: 'Smart Insights', desc: 'AI coaching insights based on your personal patterns', color: 'bg-orange-100 text-orange-600' },
            ].map(({ icon: Icon, title, desc, color }) => (
              <div key={title} className="bg-white rounded-2xl p-6 shadow-card">
                <div className={`w-12 h-12 rounded-xl ${color} flex items-center justify-center mb-4`}>
                  <Icon className="w-6 h-6" />
                </div>
                <h3 className="font-semibold text-gray-900 mb-2">{title}</h3>
                <p className="text-sm text-gray-500">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Stats */}
      <section className="py-20 px-4">
        <div className="max-w-4xl mx-auto">
          <div className="grid grid-cols-3 gap-8 text-center">
            {[
              { value: '5s', label: 'Average log time' },
              { value: '6M+', label: 'Foods in database' },
              { value: '95%', label: 'AI accuracy' },
            ].map(({ value, label }) => (
              <div key={label}>
                <p className="text-4xl font-extrabold text-brand-500 mb-2">{value}</p>
                <p className="text-gray-500">{label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Security */}
      <section className="py-16 bg-gray-50 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <Shield className="w-10 h-10 text-brand-500 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 mb-3">Enterprise-grade security</h2>
          <p className="text-gray-500">
            Biometric login with Face ID / Touch ID, WebAuthn passkeys, end-to-end encryption, and GDPR-compliant data handling.
          </p>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 px-4">
        <div className="max-w-xl mx-auto text-center">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">Start your journey today</h2>
          <p className="text-gray-500 mb-8">Free forever. No credit card required.</p>
          <Link
            href="/register"
            className="inline-flex items-center gap-2 px-8 py-4 bg-brand-500 hover:bg-brand-600 text-white font-semibold rounded-2xl transition-all shadow-glow-green text-lg"
          >
            Create free account <ArrowRight className="w-5 h-5" />
          </Link>
        </div>
      </section>

      <footer className="border-t border-gray-100 py-8 px-4 text-center text-sm text-gray-400">
        <p>© 2026 NutriTrack AI. Built with Claude AI.</p>
      </footer>
    </div>
  );
}
