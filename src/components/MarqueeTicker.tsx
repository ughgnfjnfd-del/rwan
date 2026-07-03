"use client";

import React from "react";
import { useApp } from "@/context/AppContext";

export default function MarqueeTicker() {
  const { marqueeSettings } = useApp();

  if (!marqueeSettings || !marqueeSettings.isEnabled || !marqueeSettings.items || marqueeSettings.items.length === 0) {
    return null;
  }

  // Duplicate items to ensure smooth scrolling
  const doubledItems = [...marqueeSettings.items, ...marqueeSettings.items, ...marqueeSettings.items];

  return (
    <div className="w-full bg-black/85 backdrop-blur-xl text-white border-b border-white/10 text-[11px] sm:text-xs font-bold py-2.5 px-4 relative overflow-hidden select-none z-50" dir="rtl">
      <style dangerouslySetInnerHTML={{
        __html: `
        @keyframes marquee {
          0% { transform: translate3d(0, 0, 0); }
          100% { transform: translate3d(-33.333%, 0, 0); }
        }
        .animate-marquee-slow {
          display: flex;
          width: max-content;
          animation: marquee 30s linear infinite;
        }
        .animate-marquee-slow:hover {
          animation-play-state: paused;
        }
      `}} />
      <div className="max-w-7xl mx-auto flex overflow-hidden">
        <div className="animate-marquee-slow gap-8 flex">
          {doubledItems.map((item, idx) => (
            <div key={idx} className="flex items-center gap-1 whitespace-nowrap px-6 text-slate-200 border-l border-slate-800 last:border-0">
              <span>{item}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
