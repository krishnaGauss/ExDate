import { Globe, Activity, TrendingUp, Zap, Server, Shield } from "lucide-react";

export default function ProductsPage() {
  return (
    <main className="min-h-screen bg-black text-white font-sans selection:bg-emerald-500/30 overflow-x-hidden pb-24">
      
      {/* Hero Section with Parallax ambient background */}
      <section className="relative w-full pt-32 pb-16 flex flex-col items-center justify-center overflow-hidden">
        <div className="absolute inset-0 z-0 bg-fixed pointer-events-none" style={{ backgroundAttachment: 'fixed' }}>
          <div className="absolute top-[10%] left-[20%] w-[40%] h-[40%] rounded-full bg-emerald-500/10 blur-[100px]" />
          <div className="absolute bottom-[20%] right-[10%] w-[50%] h-[50%] rounded-full bg-cyan-900/20 blur-[120px]" />
          <div className="absolute inset-0 bg-[linear-gradient(to_right,#8080801a_1px,transparent_1px),linear-gradient(to_bottom,#8080801a_1px,transparent_1px)] bg-size-[40px_40px] mask-[radial-gradient(ellipse_60%_60%_at_50%_50%,#000_70%,transparent_100%)]" />
        </div>

        <div className="relative z-10 w-full max-w-5xl mx-auto px-6 text-center space-y-6">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-sm font-medium mb-4 shadow-[0_0_15px_-3px_rgba(16,185,129,0.3)]">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
            In Active Development
          </div>
          <h1 className="text-5xl md:text-7xl font-extrabold tracking-tight text-white leading-tight">
            The <span className="text-transparent bg-clip-text bg-linear-to-r from-emerald-400 to-cyan-500">World Monitor</span> Terminal.
          </h1>
          <p className="text-xl text-neutral-400 max-w-3xl mx-auto leading-relaxed font-light">
            We are building a democratized, institutional-grade informational terminal. Designed for the modern retail trader, bringing Wall Street analytics to everyone.
          </p>
        </div>
      </section>

      {/* Grid Features Section */}
      <section className="relative z-10 w-full max-w-7xl mx-auto px-6 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          
          {/* Feature 1 (Large Span) */}
          <div className="group lg:col-span-2 relative p-8 rounded-2xl bg-neutral-950/50 border border-neutral-800 hover:border-emerald-500/50 transition-all duration-500 overflow-hidden">
            <div className="absolute inset-0 bg-linear-to-br from-emerald-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
            <div className="relative z-10">
              <Globe className="w-10 h-10 text-emerald-400 mb-6" />
              <h3 className="text-2xl font-bold text-white mb-3">Global Macro Matrix</h3>
              <p className="text-neutral-400 leading-relaxed max-w-xl">
                Track cross-border asset flows, FX volatility, and global interest rate impacts in real-time. Instantly visualize how a policy change in the US affects your Indian equities.
              </p>
            </div>
            {/* Abstract UI representation */}
            <div className="absolute right-[-10%] bottom-[-20%] w-[60%] h-[80%] bg-neutral-900 border border-neutral-800 rounded-tl-xl shadow-2xl opacity-50 transform rotate-[-5deg] group-hover:rotate-0 transition-transform duration-700 flex flex-col gap-2 p-4">
              <div className="flex gap-2"><div className="w-8 h-8 rounded bg-emerald-500/20"></div><div className="w-full h-8 rounded bg-neutral-800"></div></div>
              <div className="flex gap-2"><div className="w-12 h-6 rounded bg-emerald-500/10"></div><div className="w-full h-6 rounded bg-neutral-800"></div></div>
              <div className="w-full flex-1 rounded bg-neutral-800/50 mt-2"></div>
            </div>
          </div>

          {/* Feature 2 */}
          <div className="group relative p-8 rounded-2xl bg-neutral-950/50 border border-neutral-800 hover:border-cyan-500/50 transition-all duration-500 overflow-hidden">
            <div className="absolute inset-0 bg-linear-to-br from-cyan-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
            <Activity className="w-10 h-10 text-cyan-400 mb-6 relative z-10" />
            <h3 className="text-2xl font-bold text-white mb-3 relative z-10">Institutional Order Flow</h3>
            <p className="text-neutral-400 leading-relaxed relative z-10">
              See the tape like the pros. Detect dark pool prints, block trades, and options sweeping activity across major indices before the retail crowd catches on.
            </p>
          </div>

          {/* Feature 3 */}
          <div className="group relative p-8 rounded-2xl bg-neutral-950/50 border border-neutral-800 hover:border-emerald-500/50 transition-all duration-500 overflow-hidden">
            <div className="absolute inset-0 bg-linear-to-br from-emerald-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
            <TrendingUp className="w-10 h-10 text-emerald-400 mb-6 relative z-10" />
            <h3 className="text-2xl font-bold text-white mb-3 relative z-10">AI Sentiment Engine</h3>
            <p className="text-neutral-400 leading-relaxed relative z-10">
              Our models ingest millions of financial tweets, news articles, and earnings transcripts instantly to quantify fear and greed on a per-ticker blueprint.
            </p>
          </div>

          {/* Feature 4 (Large Span) */}
          <div className="group lg:col-span-2 relative p-8 rounded-2xl bg-neutral-950/50 border border-neutral-800 hover:border-emerald-500/50 transition-all duration-500 overflow-hidden">
            <div className="absolute inset-0 bg-linear-to-tl from-emerald-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
            <div className="relative z-10 flex flex-col md:flex-row gap-8 items-center h-full">
              <div className="flex-1">
                <Zap className="w-10 h-10 text-emerald-400 mb-6" />
                <h3 className="text-2xl font-bold text-white mb-3">Sub-Millisecond Execution Data</h3>
                <p className="text-neutral-400 leading-relaxed">
                  Powered by direct exchange feeds, giving you L2/L3 market depth with near-zero latency. Built for algorithmic traders and high-frequency enthusiasts.
                </p>
              </div>
              <div className="flex-1 w-full flex justify-end">
                <div className="grid grid-cols-2 gap-2 w-full max-w-62.5">
                  <div className="h-12 rounded bg-neutral-900 border border-emerald-500/20 flex items-center justify-center animate-pulse"><span className="text-xs text-emerald-400 font-mono">230.45</span></div>
                  <div className="h-12 rounded bg-neutral-900 border border-orange-500/20 flex items-center justify-center animate-pulse delay-75"><span className="text-xs text-orange-400 font-mono">230.44</span></div>
                  <div className="h-12 rounded bg-neutral-900 border border-emerald-500/20 flex items-center justify-center animate-pulse delay-150"><span className="text-xs text-emerald-400 font-mono">230.43</span></div>
                  <div className="h-12 rounded bg-neutral-900 border border-orange-500/20 flex items-center justify-center animate-pulse delay-300"><span className="text-xs text-orange-400 font-mono">230.42</span></div>
                </div>
              </div>
            </div>
          </div>

          {/* Feature 5 (Full Span) */}
          <div className="group lg:col-span-3 relative p-8 rounded-2xl bg-neutral-950/50 border border-neutral-800 hover:border-neutral-600 transition-all duration-500 overflow-hidden flex flex-col md:flex-row items-center gap-8 text-center md:text-left">
            <div className="absolute inset-0 bg-linear-to-r from-neutral-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
            <div className="p-5 bg-neutral-900 rounded-full border border-neutral-800 relative z-10">
              <Shield className="w-10 h-10 text-neutral-400 group-hover:text-white transition-colors" />
            </div>
            <div className="relative z-10">
              <h3 className="text-2xl font-bold text-white mb-3">Bank-Grade Infrastructure</h3>
              <p className="text-neutral-400 leading-relaxed max-w-3xl">
                End-to-end encryption. Cold storage backups. Designed to protect your API keys and custom trading algorithms seamlessly. Trust is built-in.
              </p>
            </div>
          </div>

        </div>

        {/* Waitlist CTA */}
        <div className="mt-16 w-full max-w-3xl mx-auto text-center p-8 md:p-12 rounded-3xl bg-linear-to-br from-neutral-900 to-black border border-neutral-800 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-500/5 rounded-full blur-[80px]" />
          <h2 className="text-3xl font-bold text-white mb-4 relative z-10">Secure Your Beta Access.</h2>
          <p className="text-neutral-400 mb-8 relative z-10">
            We are rolling out invites starting Q3. Join the waitlist to lock in your spot and early-adopter pricing for life.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center relative z-10 max-w-md mx-auto">
            <input 
              type="email" 
              placeholder="Enter your email" 
              className="flex-1 bg-black border border-neutral-700 text-white rounded-lg px-4 py-3 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition-all"
            />
            <button className="px-6 py-3 bg-emerald-500 hover:bg-emerald-400 text-black font-semibold rounded-lg transition-colors whitespace-nowrap">
              Join Waitlist
            </button>
          </div>
        </div>

      </section>
    </main>
  );
}
