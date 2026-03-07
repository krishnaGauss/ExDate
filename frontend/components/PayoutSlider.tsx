import React, { useState } from 'react';
import { Calculator, AlertCircle, TrendingUp } from 'lucide-react';

// Define the props your database will pass into this component
interface SimulatorProps {
  stockSymbol: string;
  livePrice: number;
  dividendPerShare: number;
}

export default function DividendSimulator({  
  livePrice , 
  dividendPerShare 
}: SimulatorProps) {
  // Mode: "simulate" (for new buyers) or "owned" (for existing holders)
  const [mode, setMode] = useState<"simulate" | "owned">("simulate");
  
  // State for Simulate Mode
  const [investment, setInvestment] = useState<number>(10000);
  
  // State for Owned Mode
  const [sharesOwned, setSharesOwned] = useState<number>(100);
  const [avgBuyPrice, setAvgBuyPrice] = useState<number>(livePrice);

  // --- THE MATH ENGINE ---
  let shares = 0;
  let totalInvested = 0;
  let yieldOnCost = 0;
  let liveYield = 0;

  if (mode === "simulate") {
    shares = Math.floor(investment / livePrice);
    totalInvested = shares * livePrice; // Actual amount used
    // If they buy today, yield is based on the live price
    liveYield = livePrice > 0 ? (dividendPerShare / livePrice) * 100 : 0; 
  } else {
    shares = sharesOwned;
    totalInvested = shares * avgBuyPrice;
    // The magic metric: Yield based on what THEY paid, not the market
    yieldOnCost = avgBuyPrice > 0 ? (dividendPerShare / avgBuyPrice) * 100 : 0;
    liveYield = livePrice > 0 ? (dividendPerShare / livePrice) * 100 : 0; 
  }

  const grossDividend = shares * dividendPerShare;
  
  // Indian Tax Rule: 10% TDS if dividend > ₹5,000
  const isTaxable = grossDividend > 5000;
  const tdsDeduction = isTaxable ? grossDividend * 0.10 : 0;
  const netPayout = grossDividend - tdsDeduction;

  // Formatter for Indian Rupees
  const formatINR = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0
    }).format(amount);
  };

  return (
    <div className="bg-neutral-900 border border-neutral-800 rounded-xl p-5 mt-4 w-full max-w-md mx-auto">
      
      {/* Header & Toggle */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-2">
          <Calculator className="text-emerald-400 w-5 h-5" />
          <h3 className="text-white font-medium">Payout Estimator</h3>
        </div>
        
        {/* iOS-style Segmented Control */}
        <div className="flex bg-black p-1 rounded-lg border border-neutral-800">
          <button
            onClick={() => setMode("simulate")}
            className={`px-3 py-1 text-xs font-medium rounded-md transition-all ${
              mode === "simulate" 
                ? "bg-neutral-800 text-white shadow-sm" 
                : "text-neutral-500 hover:text-neutral-300"
            }`}
          >
            Simulate
          </button>
          <button
            onClick={() => setMode("owned")}
            className={`px-3 py-1 text-xs font-medium rounded-md transition-all ${
              mode === "owned" 
                ? "bg-neutral-800 text-white shadow-sm" 
                : "text-neutral-500 hover:text-neutral-300"
            }`}
          >
            I own this
          </button>
        </div>
      </div>

      {/* Dynamic Input Section */}
      <div className="mb-6 h-24">
        {mode === "simulate" ? (
          <div className="animate-in fade-in slide-in-from-right-2 duration-300">
            <div className="flex justify-between items-center mb-2">
              <label className="text-sm text-neutral-400">If I invest:</label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-500">₹</span>
                <input
                  type="number"
                  value={investment}
                  onChange={(e) => setInvestment(Number(e.target.value))}
                  className="bg-black border border-neutral-700 text-white rounded-lg pl-7 pr-3 py-1 w-32 text-right focus:outline-none focus:border-emerald-500 transition-colors"
                />
              </div>
            </div>

            {/* The Magic Slider */}
            <input
              type="range"
              min="1000"
              max="500000"
              step="1000"
              value={investment}
              onChange={(e) => setInvestment(Number(e.target.value))}
              className="w-full h-2 bg-neutral-800 rounded-lg appearance-none cursor-pointer accent-emerald-500 mt-2"
            />
            <div className="flex justify-between text-xs text-neutral-500 mt-2">
              <span>₹1K</span>
              <span>₹5L</span>
            </div>
          </div>
        ) : (
          <div className="animate-in fade-in slide-in-from-left-2 duration-300 space-y-3">
            <div className="flex justify-between items-center">
              <label className="text-sm text-neutral-400">Shares Owned:</label>
              <input
                type="number"
                value={sharesOwned}
                onChange={(e) => setSharesOwned(Number(e.target.value))}
                className="bg-black border border-neutral-700 text-white rounded-lg px-3 py-1 w-32 text-right focus:outline-none focus:border-emerald-500 transition-colors"
              />
            </div>
            <div className="flex justify-between items-center">
              <label className="text-sm text-neutral-400">Avg Buy Price:</label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-500">₹</span>
                <input
                  type="number"
                  value={avgBuyPrice}
                  onChange={(e) => setAvgBuyPrice(Number(e.target.value))}
                  className="bg-black border border-neutral-700 text-white rounded-lg pl-7 pr-3 py-1 w-32 text-right focus:outline-none focus:border-emerald-500 transition-colors"
                />
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Analytics Breakdown */}
      <div className="grid grid-cols-2 gap-4 mb-4 text-sm bg-black p-3 rounded-lg border border-neutral-800">
        <div>
          <span className="block text-neutral-500 mb-1">
            {mode === "simulate" ? "Live Yield" : "Yield on Cost"}
          </span>
          <span className={`font-mono ${mode === "owned" && yieldOnCost > liveYield ? "text-emerald-400 font-bold" : "text-neutral-200"}`}>
            {mode === "simulate" ? liveYield.toFixed(2) : yieldOnCost.toFixed(2)}%
          </span>
        </div>
        <div>
          <span className="block text-neutral-500 mb-1">Shares</span>
          <span className="text-neutral-200 font-mono">{shares} qty</span>
        </div>
      </div>

      {/* The Final Payout Box */}
      <div className="bg-emerald-950/20 border border-emerald-900/50 rounded-lg p-4 relative overflow-hidden">
        {/* Subtle background glow effect */}
        <div className="absolute -right-6 -top-6 w-24 h-24 bg-emerald-500/10 blur-2xl rounded-full"></div>
        
        <div className="flex justify-between items-end relative z-10">
          <div>
            <span className="text-emerald-400 text-sm font-medium flex items-center gap-1 mb-1">
              <TrendingUp className="w-4 h-4" /> Estimated Payout
            </span>
            <span className="text-3xl font-bold text-white tracking-tight">
              {formatINR(netPayout)}
            </span>
          </div>
        </div>

        {/* TDS Warning Ribbon (Conditional) */}
        {isTaxable && (
          <div className="mt-3 pt-3 border-t border-emerald-900/50 flex items-start gap-2 text-xs text-orange-300/80">
            <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
            <p>
              Includes 10% TDS deduction ({formatINR(tdsDeduction)}) as total dividend exceeds ₹5,000 for this financial year.
            </p>
          </div>
        )}
      </div>

    </div>
  );
}