"use client";

import Link from "next/link";
import { useState } from "react";
import { Circle, Menu, X } from "lucide-react";

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <nav className="fixed top-0 inset-x-0 w-full z-50 bg-black/80 backdrop-blur-md border-b border-neutral-800">
      <div className="mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
        {/* Left: Logo */}
        <div className="flex-none">
          <Link href="/" className="text-3xl font-bold tracking-tight text-white flex items-center gap-1">
            ExDate<span className="relative top-1.5"><Circle className="text-emerald-400 w-3 h-3 fill-emerald-400" /></span>
          </Link>
        </div>

        {/* Center: Tabs (Desktop) */}
        <div className="hidden sm:flex flex-1 justify-center gap-25">
          <Link href="/products" className="text-lg font-medium text-neutral-400 hover:text-white transition-colors">
            Products
          </Link>
          <Link href="/about" className="text-lg font-medium text-neutral-400 hover:text-white transition-colors">
            About Us
          </Link>
          <Link href="/info" className="text-lg font-medium text-neutral-400 hover:text-white transition-colors">
            Info
          </Link>
        </div>

        {/* Right: Empty spacer to balance flex-1 on desktop */}
        <div className="flex-none hidden sm:flex sm:w-22"></div>

        {/* Mobile Menu Button */}
        <div className="sm:hidden flex items-center">
          <button 
            onClick={() => setIsOpen(!isOpen)}
            className="text-neutral-400 hover:text-white p-2"
          >
            {isOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </div>

      {/* Mobile Menu Dropdown */}
      {isOpen && (
        <div className="sm:hidden border-t border-neutral-800 bg-black/95 backdrop-blur-md">
          <div className="px-4 py-6 flex flex-col gap-4">
            <Link 
              href="/products" 
              onClick={() => setIsOpen(false)}
              className="text-lg font-medium text-neutral-400 hover:text-white transition-colors"
            >
              Products
            </Link>
            <Link 
              href="/about" 
              onClick={() => setIsOpen(false)}
              className="text-lg font-medium text-neutral-400 hover:text-white transition-colors"
            >
              About Us
            </Link>
            <Link 
              href="/info" 
              onClick={() => setIsOpen(false)}
              className="text-lg font-medium text-neutral-400 hover:text-white transition-colors"
            >
              Info
            </Link>
          </div>
        </div>
      )}
    </nav>
  );
}
