"use client";

import React, { useState, useEffect } from "react";
import { ChevronUp } from "lucide-react";

export default function BackToTop() {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsVisible(window.scrollY > 400);
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <button
      onClick={scrollToTop}
      aria-label="العودة للأعلى"
      title="العودة للأعلى"
      className={`fixed bottom-24 md:bottom-6 left-6 z-50 flex items-center justify-center w-12 h-12 rounded-full border border-slate-200/80 bg-white/90 text-slate-700 shadow-[0_8px_30px_rgba(0,0,0,0.08)] backdrop-blur-xl cursor-pointer transition-all duration-500 hover:bg-[#1a1a1a] hover:text-white hover:border-transparent hover:shadow-[0_12px_35px_rgba(0,0,0,0.15)] hover:scale-110 active:scale-95 group ${
        isVisible
          ? "translate-y-0 opacity-100 scale-100"
          : "translate-y-4 opacity-0 scale-75 pointer-events-none"
      }`}
    >
      <ChevronUp className="w-5 h-5 transition-transform duration-300 group-hover:-translate-y-0.5" />
      {/* Subtle glow ring on hover */}
      <span className="absolute inset-0 rounded-full border-2 border-transparent group-hover:border-accent/20 transition-all duration-300" />
    </button>
  );
}
