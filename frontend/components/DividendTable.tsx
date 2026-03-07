"use client";

import { ArrowUpDown, AlertCircle, Search } from "lucide-react";
import { useState } from "react";
import { Dividend } from "../app/info/types";
import DividendOverlay from "./DividendOverlay";

export default function DividendTable({ initialDividends }: { initialDividends: Dividend[] }) {
  const [searchQuery, setSearchQuery] = useState("");
  const [now] = useState(new Date());
  const [selectedDividend, setSelectedDividend] = useState<Dividend | null>(null);

  const filteredDividends = initialDividends
    .map((dividend) => {
      // Parse the "dd-MMM-yyyy" format from NSE
      const exDateObj = new Date(dividend.ex_date);
      // Reset time to purely compare dates
      exDateObj.setHours(0, 0, 0, 0);
      const today = new Date(now);
      today.setHours(0, 0, 0, 0);

      const diffTime = exDateObj.getTime() - today.getTime();
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

      return { ...dividend, daysToExDate: diffDays };
    })
    .filter((dividend) => {
      const matchSearch =
        dividend.symbol.toLowerCase().includes(searchQuery.toLowerCase()) ||
        dividend.company_name.toLowerCase().includes(searchQuery.toLowerCase());
      
      // Hide if ex-date is exactly today (0) or in the past (< 0)
      const validDate = dividend.daysToExDate > 0;

      return matchSearch && validDate;
    });

  return (
    <>
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

      <div className="rounded-xl border border-neutral-800 bg-neutral-950/50 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm whitespace-nowrap">
            <thead className="bg-neutral-900/80 text-neutral-400 border-b border-neutral-800">
              <tr>
                <th className="px-6 py-4 font-semibold uppercase tracking-wider text-xs">
                  Company
                </th>
                <th className="px-12 py-4 font-semibold uppercase tracking-wider text-xs">
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
                <th className="px-12 py-4 font-semibold uppercase tracking-wider text-xs">
                  Ex-Date
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-800/50">
              {filteredDividends.length > 0 ? (
                filteredDividends.map((item, index) => (
                  <tr 
                    key={item.id} 
                    onClick={() => setSelectedDividend(item)}
                    className="hover:bg-neutral-900/30 transition-colors group cursor-pointer"
                  >
                    <td className="px-6 py-4">
                      <div className="flex flex-col">
                        <span className="font-semibold text-white group-hover:text-emerald-400 transition-colors">{item.symbol}</span>
                        <span className="text-xs text-neutral-500 truncate max-w-37.5 md:max-w-xs transition-colors group-hover:text-neutral-400">
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
                    <td className="px-10 py-4">
                      <div className="inline-flex items-center px-4 py-1 rounded bg-emerald-500/10 text-emerald-400 font-bold border border-emerald-500/20">
                        {item.calculated_yield.toFixed(2)}%
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className={`font-medium flex items-center gap-2 ${item.daysToExDate <= 4 ? 'text-orange-400' : 'text-neutral-300'}`}>
                        {item.daysToExDate <= 4 && (
                          <div className="flex items-center gap-1.5 bg-orange-500/10 px-2 py-1 rounded border border-orange-500/20" title={`Only ${item.daysToExDate} days left!`}>
                            <AlertCircle className="w-4 h-4 animate-pulse" />
                            <span className="text-xs font-bold leading-none">{item.daysToExDate}d</span>
                          </div>
                        )}
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
      <div className="mt-8 flex justify-end">
        <p className="text-xs text-neutral-600">
          * Sorted by closest Ex-Date. Yields are updated once during market hours and once after market hours.
        </p>
      </div>

      {/* Pop-up Overlay for Selected Row */}
      {selectedDividend && (
        <DividendOverlay
          isOpen={true}
          onClose={() => setSelectedDividend(null)}
          stockSymbol={selectedDividend.symbol}
          companyName={selectedDividend.company_name}
          livePrice={selectedDividend.live_price}
          dividendPerShare={selectedDividend.dividend_amount}
        />
      )}
    </>
  );
}
