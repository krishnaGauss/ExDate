import { X } from "lucide-react";
import DividendSimulator from "./PayoutSlider";

interface DividendOverlayProps {
  isOpen: boolean;
  onClose: () => void;
  stockSymbol: string;
  companyName: string;
  livePrice: number;
  dividendPerShare: number;
}

export default function DividendOverlay({
  isOpen,
  onClose,
  stockSymbol,
  companyName,
  livePrice,
  dividendPerShare,
}: DividendOverlayProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/80 backdrop-blur-sm transition-opacity"
        onClick={onClose}
      />
      
      {/* Modal Content */}
      <div className="relative w-full max-w-lg bg-neutral-950 border border-neutral-800 rounded-2xl p-6 shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        
        {/* Top Header */}
        <div className="flex items-start justify-between mb-4">
          <div>
            <h2 className="text-2xl font-bold text-white tracking-tight">{stockSymbol}</h2>
            <p className="text-sm text-neutral-400 mt-1">{companyName}</p>
          </div>
          <button 
            onClick={onClose}
            className="p-2 text-neutral-400 hover:text-white hover:bg-neutral-800 rounded-full transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Dynamic Simulator */}
        <div className="mt-6">
          <DividendSimulator 
            stockSymbol={stockSymbol}
            livePrice={livePrice}
            dividendPerShare={dividendPerShare}
          />
        </div>

      </div>
    </div>
  );
}
