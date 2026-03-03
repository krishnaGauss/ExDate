import { Calendar, TrendingUp, Info, AlertCircle } from "lucide-react";

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
    <main className="min-h-screen bg-black text-white font-sans selection:bg-emerald-500/30 overflow-x-hidden">
      {/* Container */}
      <div className="w-full mx-auto px-6 pt-24 pb-16 md:pt-32 md:pb-24">
        
        {/* Hero Section */}
        <header className="mb-16 text-center md:text-left space-y-5">
          <h1 className="text-4xl md:text-5xl font-bold tracking-tight text-white leading-tight">
            Don&apos;t miss the drop. <br className="hidden md:block" />
            <span className="text-neutral-400">The honest Indian Dividend Calendar.</span>
          </h1>
          <p className="text-lg text-neutral-400 max-w-2xl leading-relaxed">
            We calculate the real yield based on live prices, so you know exactly what hits your bank account.
          </p>
        </header>

        {/* Dashboard Grid / List */}
        <section className="space-y-4">
          {MOCK_DATA.map((stock) => (
            <div 
              key={stock.id} 
              className="max-w-3xl mx-auto w-full group flex flex-col md:flex-row md:items-center justify-between gap-6 p-5 rounded-lg border border-neutral-800 bg-neutral-950/50 hover:bg-neutral-900/50 transition-colors"
            >
              {/* Left Column: Company Info */}
              <div className="flex-1 space-y-2">
                <div className="flex items-center gap-3">
                  <h2 className="text-xl font-semibold text-white">{stock.name}</h2>
                  <span className="px-2 py-0.5 rounded text-xs font-medium bg-neutral-800 text-neutral-400">
                    {stock.symbol}
                  </span>
                </div>
                <div className="flex items-center gap-1.5 text-sm text-neutral-400">
                  <Info className="w-4 h-4" />
                  <span>Dividend: <span className="text-white font-medium">{stock.dividendAmount}</span> / share</span>
                </div>
              </div>

              {/* Middle/Right Column: Yield & Deadline */}
              <div className="flex flex-col sm:flex-row gap-5 sm:gap-8 sm:items-center">
                
                {/* Real Yield - Hero Metric */}
                <div className="flex items-center gap-3">
                  <div className="p-2.5 bg-emerald-500/10 rounded-md">
                    <TrendingUp className="w-5 h-5 text-emerald-400" />
                  </div>
                  <div>
                    <div className="text-xs text-neutral-400 mb-0.5 uppercase tracking-wider font-semibold">Real Yield</div>
                    <div className="text-lg font-bold text-emerald-400">{stock.realYield}</div>
                  </div>
                </div>

                {/* Ex-Date & Badge */}
                <div className="flex flex-col gap-2">
                  <div className="flex items-center gap-2 text-neutral-300">
                    <Calendar className="w-4 h-4 text-neutral-500" />
                    <span className="text-sm font-medium">Ex-Date: {stock.exDate}</span>
                  </div>
                  <div 
                    className={`inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-md text-xs font-medium border w-fit ${
                      stock.isUrgent 
                        ? 'border-orange-500/20 bg-orange-500/10 text-orange-400' 
                        : 'border-neutral-800 bg-black text-neutral-400'
                    }`}
                  >
                    {stock.isUrgent && <AlertCircle className="w-3.5 h-3.5" />}
                    <span>Buy before {stock.buyBefore}</span>
                  </div>
                </div>

              </div>
            </div>
          ))}
        </section>

        {/* Disclaimer */}
        <div className="mt-8 text-center">
          <p className="text-xs text-neutral-600">
            * The data displayed on this page is for demonstration purposes only and does not represent real-time market data.
          </p>
        </div>

      </div>
    </main>
  );
}
