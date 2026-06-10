"use client";

import React, { useState, useEffect } from "react";
import { useApp } from "@/context/AppContext";
import { X, Sparkles, ArrowLeft } from "lucide-react";

export default function PromoPopUp() {
  const { promoPopUp } = useApp();
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    if (!promoPopUp || !promoPopUp.isEnabled) return;

    const dismissed = sessionStorage.getItem("mw_dismissed_popup");
    if (!dismissed) {
      const timer = setTimeout(() => {
        setIsOpen(true);
      }, 1500); // 1.5 seconds delay
      return () => clearTimeout(timer);
    }
  }, [promoPopUp]);

  const handleClose = () => {
    setIsOpen(false);
    sessionStorage.setItem("mw_dismissed_popup", "true");
  };

  if (!isOpen || !promoPopUp) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 animate-fade-in" dir="rtl">
      {/* Backdrop */}
      <div className="fixed inset-0 bg-black/60 backdrop-blur-xs transition-opacity" onClick={handleClose}></div>

      {/* Pop-up Box */}
      <div className="relative bg-gradient-to-br from-slate-900 via-zinc-950 to-black text-white rounded-3xl border border-slate-800 shadow-2xl w-full max-w-md p-6 overflow-hidden z-10 flex flex-col items-center gap-4 text-center font-sans">
        {/* Glow ambient background */}
        <div className="absolute -top-1/4 -right-1/4 w-48 h-48 bg-sky-500/10 rounded-full blur-[60px] pointer-events-none"></div>
        <div className="absolute -bottom-1/4 -left-1/4 w-48 h-48 bg-purple-500/10 rounded-full blur-[60px] pointer-events-none"></div>

        {/* Close Button */}
        <button
          onClick={handleClose}
          className="absolute top-4 right-4 p-1.5 rounded-full bg-white/5 border border-white/10 hover:bg-white/10 text-slate-400 hover:text-white transition-colors cursor-pointer"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Dynamic header visual / icon */}
        <div className="p-3.5 bg-sky-500/10 border border-sky-400/20 text-sky-400 rounded-2xl w-fit animate-bounce mt-2">
          <Sparkles className="w-6 h-6" />
        </div>

        {/* Text Details */}
        <div className="space-y-2">
          <h3 className="text-xl font-black">{promoPopUp.title}</h3>
          <p className="text-xs text-slate-400 leading-relaxed px-2">
            {promoPopUp.description}
          </p>
        </div>

        {/* Custom Image if provided */}
        {promoPopUp.imageUrl && (
          <div className="w-full h-36 rounded-2xl overflow-hidden border border-white/5 bg-white/5 relative">
            <img src={promoPopUp.imageUrl} alt="" className="w-full h-full object-cover animate-pulse" />
          </div>
        )}

        {/* CTA Actions */}
        <div className="w-full space-y-2 mt-2">
          <a
            href={promoPopUp.btnLink}
            onClick={handleClose}
            className="w-full bg-[#38BDF8] hover:bg-[#0ea5e9] text-slate-950 font-extrabold text-xs py-3 px-6 rounded-2xl shadow-lg shadow-sky-500/10 flex items-center justify-center gap-1.5 cursor-pointer block text-center"
          >
            <span>{promoPopUp.btnText}</span>
            <ArrowLeft className="w-4 h-4" />
          </a>
          <button
            onClick={handleClose}
            className="w-full bg-transparent border border-white/10 hover:bg-white/5 text-slate-400 hover:text-white text-xs font-bold py-2.5 rounded-2xl transition-colors cursor-pointer"
          >
            تصفح المتجر أولاً
          </button>
        </div>
      </div>
    </div>
  );
}
