import { Calendar, TrendingUp, Info, AlertCircle, Sparkles, ArrowRight } from "lucide-react";
import PayoutSlider from "../components/PayoutSlider";

// Same mock data, slightly adjusted for better UI presentation
const MOCK_DATA = [
  {
    id: "VEDL",
    name: "Vedanta Limited",
    symbol: "VEDL",
    dividendAmount: "₹11.00",
    realYield: "4.12%",
    exDate: "15-Mar",
    buyBefore: "14-Mar",
    isUrgent: true,
  },
  {
    id: "ITC",
    name: "ITC Limited",
    symbol: "ITC",
    dividendAmount: "₹6.25",
    realYield: "1.45%",
    exDate: "18-Mar",
    buyBefore: "17-Mar",
    isUrgent: false,
  },
  {
    id: "COALINDIA",
    name: "Coal India",
    symbol: "COALINDIA",
    dividendAmount: "₹5.25",
    realYield: "1.18%",
    exDate: "22-Mar",
    buyBefore: "21-Mar",
    isUrgent: false,
  },
  {
    id: "RECLTD",
    name: "REC Limited",
    symbol: "RECLTD",
    dividendAmount: "₹4.50",
    realYield: "0.95%",
    exDate: "28-Mar",
    buyBefore: "27-Mar",
    isUrgent: false,
  }
];

export default function Home() {
  return (
    <main className="min-h-screen bg-[#050505] text-white font-sans selection:bg-emerald-500/30 overflow-x-hidden relative">
      
      {/* Global Ambient Glow */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none z-0">
        <div className="absolute -top-[10%] left-[20%] w-[50%] h-[30%] bg-emerald-900/20 blur-[150px] rounded-full mix-blend-screen" />
        <div className="absolute top-[20%] right-[10%] w-[40%] h-[40%] bg-cyan-900/10 blur-[150px] rounded-full mix-blend-screen" />
      </div>

      {/* 🌟 Parallax Hero Section */}
      <section className="relative w-full min-h-[95vh] flex items-center justify-center border-b border-white/5 pt-24 z-10">
        
        {/* Abstract Background Grid Layer */}
        <div className="absolute inset-0 z-0 bg-fixed opacity-40 pointer-events-none" style={{ backgroundAttachment: 'fixed' }}>
          <div className="absolute inset-0 bg-[linear-gradient(to_right,#ffffff0a_1px,transparent_1px),linear-gradient(to_bottom,#ffffff0a_1px,transparent_1px)] bg-size-[60px_60px] mask-[radial-gradient(ellipse_80%_80%_at_50%_50%,#000_60%,transparent_100%)]" />
        </div>

        <div className="relative z-10 w-full max-w-7xl mx-auto px-6 py-12 flex flex-col lg:flex-row items-center gap-16 lg:gap-24">
          
          {/* Left Text Content */}
          <div className="flex-1 space-y-8 text-center lg:text-left">
            <div className="animate-slide-up opacity-0 [animation-delay:100ms] inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 border border-white/10 shadow-[0_4px_24px_-8px_rgba(0,0,0,0.5)] backdrop-blur-md">
              <Sparkles className="w-4 h-4 text-emerald-400" />
              <span className="text-sm font-medium text-neutral-300">Intelligent Dividend Tracking</span>
            </div>
            
            <h1 className="animate-slide-up opacity-0 [animation-delay:300ms] text-5xl sm:text-6xl lg:text-8xl font-black tracking-tighter text-white leading-[1.05]">
              Don&apos;t guess. <br />
              <span className="text-transparent bg-clip-text bg-linear-to-r from-emerald-400 via-emerald-200 to-cyan-500 drop-shadow-sm">
                Simulate your yield.
              </span>
            </h1>
            
            <p className="animate-slide-up opacity-0 [animation-delay:500ms] text-lg sm:text-xl text-neutral-400 max-w-2xl mx-auto lg:mx-0 leading-relaxed font-light">
              Toggle between simulating new investments and projecting yield on cost for your existing portfolio. See exactly what hits your bank account after TDS.
            </p>
            
            <div className="animate-slide-up opacity-0 [animation-delay:700ms] flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-4 pt-4">
               <a href="/info" className="group relative px-8 py-4 bg-white text-black font-bold rounded-xl transition-all hover:bg-neutral-200 hover:scale-[1.02] active:scale-95 shadow-[0_0_40px_-10px_rgba(255,255,255,0.3)] flex items-center gap-2 overflow-hidden">
                 <span className="relative z-10">Enter Live Tracker</span>
                 <ArrowRight className="w-5 h-5 relative z-10 group-hover:translate-x-1 transition-transform" />
                 <div className="absolute inset-0 w-full h-full bg-linear-to-r from-transparent via-white/40 to-transparent -translate-x-full group-hover:translate-x-full duration-1000 ease-in-out transition-transform" />
               </a>
            </div>
          </div>

          {/* Right Interactive Component */}
          <div className="flex-1 w-full max-w-md mx-auto perspective-1000 animate-slide-up opacity-0 [animation-delay:900ms]">
            <div className="relative animate-float transform-gpu group">
              {/* Vibrant Outer Glow */}
              <div className="absolute -inset-1 bg-linear-to-br from-emerald-500/30 via-cyan-500/10 to-transparent rounded-4xl blur-2xl opacity-70 group-hover:opacity-100 transition duration-700"></div>
              
              {/* Glass container for PayoutSlider */}
              <div className="relative shadow-2xl rounded-2xl border border-white/10 overflow-hidden bg-neutral-950/80 backdrop-blur-2xl p-1">
                 <div className="absolute inset-0 bg-linear-to-br from-white/5 to-transparent pointer-events-none rounded-2xl" />
                 <PayoutSlider stockSymbol="VEDL" livePrice={280.50} dividendPerShare={11} />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Main Container for the List below the Hero */}
      <div className="relative z-10 w-full mx-auto px-6 pt-32 pb-24 max-w-5xl">
        
        <header className="mb-16 text-center space-y-4">
           <h2 className="text-4xl md:text-5xl font-extrabold tracking-tight text-white leading-tight">
             Upcoming Drop Calendar
           </h2>
           <p className="text-lg text-neutral-400 max-w-2xl mx-auto leading-relaxed">
             We bypass face-value marketing and calculate the <span className="text-white font-medium">true yield</span> based on live market prices. Track the dates that matter.
           </p>
        </header>

        {/* Premium Dashboard Grid / List */}
        <section className="space-y-4">
          {MOCK_DATA.map((stock, idx) => (
            <div 
              key={stock.id} 
              className="group animate-slide-up opacity-0 border border-white/5 bg-white/2 backdrop-blur-sm hover:bg-white/4 hover:border-emerald-500/30 hover:shadow-[0_8px_30px_rgba(16,185,129,0.05)] transition-all duration-300 rounded-2xl p-6 flex flex-col md:flex-row md:items-center justify-between gap-6"
              style={{ animationDelay: `${idx * 150}ms`, animationFillMode: 'forwards' }}
            >
              {/* Left Column: Company Info */}
              <div className="flex-1 space-y-3">
                <div className="flex items-center gap-3">
                  <h3 className="text-2xl font-bold text-white group-hover:text-emerald-50 transition-colors">{stock.name}</h3>
                  <span className="px-2.5 py-1 rounded bg-white/10 text-xs font-semibold tracking-wider text-neutral-300 border border-white/5 shadow-inner">
                    {stock.symbol}
                  </span>
                </div>
                <div className="flex items-center gap-2 text-sm text-neutral-400">
                  <Info className="w-4 h-4 text-emerald-500/70" />
                  <span>Declared Dividend: <span className="text-white font-semibold text-base">{stock.dividendAmount}</span> / share</span>
                </div>
              </div>

              {/* Middle/Right Column: Yield & Deadline */}
              <div className="flex flex-col sm:flex-row gap-6 sm:gap-10 sm:items-center border-t border-white/10 sm:border-none pt-4 sm:pt-0">
                
                {/* Real Yield - Hero Metric */}
                <div className="flex items-center gap-3">
                  <div className="p-3 bg-emerald-500/10 border border-emerald-500/20 rounded-xl group-hover:scale-110 transition-transform duration-300 shadow-[inset_0_1px_0_rgba(255,255,255,0.1)]">
                    <TrendingUp className="w-6 h-6 text-emerald-400" />
                  </div>
                  <div>
                    <div className="text-xs text-neutral-500 mb-0.5 uppercase tracking-widest font-bold">Real Yield</div>
                    <div className="text-2xl font-black text-transparent bg-clip-text bg-linear-to-r from-emerald-400 to-emerald-200">
                      {stock.realYield}
                    </div>
                  </div>
                </div>

                {/* Ex-Date & Badge */}
                <div className="flex flex-col gap-2 min-w-40">
                  <div className="flex items-center gap-2 text-neutral-300 bg-neutral-900/50 px-3 py-1.5 rounded-lg border border-white/5 w-fit">
                    <Calendar className="w-4 h-4 text-neutral-400" />
                    <span className="text-sm font-semibold">Ex-Date: {stock.exDate}</span>
                  </div>
                  <div 
                    className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-bold border w-fit transition-colors shadow-sm ${
                      stock.isUrgent 
                        ? 'border-red-500/30 bg-red-500/10 text-red-400 shadow-[0_0_15px_-3px_rgba(239,68,68,0.2)]' 
                        : 'border-white/10 bg-black/40 text-neutral-400'
                    }`}
                  >
                    {stock.isUrgent && <AlertCircle className="w-4 h-4 animate-pulse" />}
                    <span>Buy before {stock.buyBefore}</span>
                  </div>
                </div>

              </div>
            </div>
          ))}
        </section>

        {/* Disclaimer */}
          <p className="text-sm text-neutral-600 font-medium tracking-wide mt-2">
            * Data displayed is for demonstration purposes only. Verify with your broker before trading.
          </p>
      </div>
    </main>
  );
}
