"use client";

import { ArrowUpDown, AlertCircle, Search } from "lucide-react";
import { useState } from "react";

// Mock data based on the Dividend model from NSE_scraper/model/models.go
const MOCK_DIVIDENDS = [
  {
    symbol: "VEDL",
    company_name: "Vedanta Limited",
    ex_date: "15-Mar-2026",
    raw_action: "Interim Dividend - Rs 11 Per Share",
    dividend_amount: 11.00,
    live_price: 267.15,
    calculated_yield: 4.12
  },
  {
    symbol: "ITC",
    company_name: "ITC Limited",
    ex_date: "18-Mar-2026",
    raw_action: "Interim Dividend - Rs 6.25 Per Share",
    dividend_amount: 6.25,
    live_price: 431.05,
    calculated_yield: 1.45
  },
  {
    symbol: "COALINDIA",
    company_name: "Coal India Ltd",
    ex_date: "22-Mar-2026",
    raw_action: "Interim Dividend - Rs 5.25 Per Share",
    dividend_amount: 5.25,
    live_price: 444.90,
    calculated_yield: 1.18
  },
  {
    symbol: "RECLTD",
    company_name: "REC Limited",
    ex_date: "28-Mar-2026",
    raw_action: "Interim Dividend - Rs 4.50 Per Share",
    dividend_amount: 4.50,
    live_price: 476.35,
    calculated_yield: 0.95
  },
  {
    symbol: "TCS",
    company_name: "Tata Consultancy",
    ex_date: "04-Apr-2026",
    raw_action: "Final Dividend - Rs 28 Per Share",
    dividend_amount: 28.00,
    live_price: 4120.50,
    calculated_yield: 0.68
  }
];

export default function InfoPage() {
  const [searchQuery, setSearchQuery] = useState("");

  const filteredDividends = MOCK_DIVIDENDS.filter((dividend) =>
    dividend.symbol.toLowerCase().includes(searchQuery.toLowerCase()) ||
    dividend.company_name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <main className="min-h-screen bg-black text-white font-sans selection:bg-emerald-500/30 overflow-x-hidden">
      <div className="w-full mx-auto px-4 sm:px-6 pt-24 pb-16 md:pt-32 md:pb-24">
        
        {/* Header Section */}
        <header className="mb-12 text-center md:text-left space-y-4">
          <h1 className="text-3xl md:text-4xl font-bold tracking-tight text-white">
            Dividend Intelligence
          </h1>
          <p className="text-neutral-400 max-w-2xl text-lg">
            A consolidated view of upcoming dividends. We bypass face-value marketing and calculate the true yield based on the stock price.
          </p>
        </header>

        {/* Search Bar */}
        <div className="mb-6 relative max-w-md">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Search className="h-4 w-4 text-neutral-500" />
          </div>
          <input
            type="text"
            placeholder="Search by company or symbol..."
            className="w-full pl-10 pr-4 py-2.5 bg-neutral-900 border border-neutral-800 rounded-lg text-sm text-white placeholder-neutral-500 focus:outline-none focus:border-emerald-500/50 focus:ring-1 focus:ring-emerald-500/50 transition-all"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>

        {/* Data Table */}
        <div className="rounded-xl border border-neutral-800 bg-neutral-950/50 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm whitespace-nowrap">
              <thead className="bg-neutral-900/80 text-neutral-400 border-b border-neutral-800">
                <tr>
                  <th className="px-6 py-4 font-semibold uppercase tracking-wider text-xs">
                    Company
                  </th>
                  <th className="px-6 py-4 font-semibold uppercase tracking-wider text-xs">
                    Action
                  </th>
                  <th className="px-6 py-4 font-semibold uppercase tracking-wider text-xs">
                    Dividend
                  </th>
                  <th className="px-6 py-4 font-semibold uppercase tracking-wider text-xs">
                    Live Price
                  </th>
                  <th className="px-6 py-4 font-semibold uppercase tracking-wider text-xs">
                    <div className="flex items-center gap-1.5 cursor-pointer hover:text-white transition-colors">
                      Calculated Yield
                      <ArrowUpDown className="w-3.5 h-3.5" />
                    </div>
                  </th>
                  <th className="px-6 py-4 font-semibold uppercase tracking-wider text-xs">
                    Ex-Date
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-800/50">
                {filteredDividends.length > 0 ? (
                  filteredDividends.map((item, index) => (
                    <tr 
                      key={item.symbol} 
                      className="hover:bg-neutral-900/30 transition-colors group"
                    >
                      <td className="px-6 py-4">
                        <div className="flex flex-col">
                          <span className="font-semibold text-white">{item.symbol}</span>
                          <span className="text-xs text-neutral-500 truncate max-w-37.5 md:max-w-xs">
                            {item.company_name}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span 
                          className="text-xs text-neutral-300 bg-neutral-800/50 px-2.5 py-1.5 rounded inline-block border border-neutral-700/50" 
                          title={item.raw_action}
                        >
                          {item.raw_action}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="font-medium text-neutral-300">₹{item.dividend_amount.toFixed(2)}</div>
                      </td>
                      <td className="px-6 py-4 text-neutral-400">
                        ₹{item.live_price.toFixed(2)}
                      </td>
                      <td className="px-6 py-4">
                        <div className="inline-flex items-center px-4 py-1 rounded bg-emerald-500/10 text-emerald-400 font-bold border border-emerald-500/20">
                          {item.calculated_yield.toFixed(2)}%
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className={`font-medium flex items-center gap-2 ${index === 0 ? 'text-orange-400' : 'text-neutral-300'}`}>
                          {index === 0 && <AlertCircle className="w-4 h-4" />}
                          {item.ex_date}
                        </div>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={6} className="px-6 py-12 text-center text-neutral-500">
                      No dividends found matching "{searchQuery}"
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Disclaimer Note */}
        <div className="mt-8 flex justify-end">
          <p className="text-xs text-neutral-600">
            * Sorted by closest Ex-Date. Yields are updated once during market hours and once after market hours.
          </p>
        </div>

      </div>
    </main>
  );
}
