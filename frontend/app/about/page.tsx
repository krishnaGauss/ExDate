import { Rocket, LineChart, Shield, Code2 } from "lucide-react";

export default function AboutUs() {
  return (
    <main className="min-h-screen bg-black text-white font-sans selection:bg-emerald-500/30">
      <div className="w-full max-w-3xl mx-auto px-6 pt-24 pb-16 md:pt-32 md:pb-24">
        
        <header className="mb-16 text-center md:text-left space-y-5">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-semibold uppercase tracking-wider mb-2">
            <Code2 className="w-4 h-4" />
            <span>The Team</span>
          </div>
          <h1 className="text-4xl md:text-5xl font-bold tracking-tight text-white leading-tight">
            Built by builders, <br className="hidden md:block" />
            <span className="text-neutral-400">for the modern investor.</span>
          </h1>
          <p className="text-lg text-neutral-400 max-w-2xl leading-relaxed">
            We are a group of young developers obsessed with the intersection of clean design and complex financial data.
          </p>
        </header>

        {/* Story Section */}
        <section className="space-y-8 mb-20">
          <div className="p-6 md:p-8 rounded-lg border border-neutral-800 bg-neutral-950/50">
            <h2 className="text-2xl font-semibold mb-4 text-white">Our Vision</h2>
            <div className="space-y-4 text-neutral-400 leading-relaxed">
              <p>
                The Indian retail investing landscape is cluttered with legacy platforms that flood users with irrelevant data, confusing jargon, and poor mobile experiences. We started <strong>ExDate</strong> as a stepping stone to change that.
              </p>
              <p>
                Our ambition goes far beyond just a dividend calendar. We are laying the groundwork for a complete ecosystem of modern financial software services designed from the ground up for clarity, speed, and actionable insights.
              </p>
            </div>
          </div>
        </section>

        {/* Roadmap Grid */}
        <div className="mb-12">
          <h3 className="text-xl font-semibold text-white mb-6 flex items-center gap-2">
            <Rocket className="w-5 h-5 text-emerald-400" />
            What we are building next
          </h3>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            
            {/* Roadmap Item 1 */}
            <div className="p-5 rounded-lg border border-neutral-800 bg-black hover:bg-neutral-900/40 transition-colors">
              <div className="w-10 h-10 rounded bg-emerald-500/10 flex items-center justify-center mb-4">
                <LineChart className="w-5 h-5 text-emerald-400" />
              </div>
              <h4 className="text-lg font-medium text-white mb-2">Predictive Screener</h4>
              <p className="text-sm text-neutral-400">
                Advanced algorithmic screening that doesn't just show historical data, but highlights predictive trends and high-probability setups.
              </p>
            </div>

            {/* Roadmap Item 2 */}
            <div className="p-5 rounded-lg border border-neutral-800 bg-black hover:bg-neutral-900/40 transition-colors">
              <div className="w-10 h-10 rounded bg-emerald-500/10 flex items-center justify-center mb-4">
                <Shield className="w-5 h-5 text-emerald-400" />
              </div>
              <h4 className="text-lg font-medium text-white mb-2">Personal Portfolio Manager</h4>
              <p className="text-sm text-neutral-400">
                A secure, beautifully designed hub to consolidate your holdings, track real-time net worth, and analyze your asset allocation seamlessly.
              </p>
            </div>

          </div>
        </div>

        {/* Footer Note */}
        <div className="pt-8 border-t border-neutral-800 text-center sm:text-left">
          <p className="text-neutral-500 text-sm">
            We are actively prototyping these tools. Stick around — the future of Indian fintech is going to look a lot better.
          </p>
        </div>

      </div>
    </main>
  );
}
