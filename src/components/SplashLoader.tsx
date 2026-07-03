"use client";

import React, { useState, useEffect } from "react";
import { useApp } from "@/context/AppContext";

export default function SplashLoader() {
  const { siteSettings } = useApp();
  const [progress, setProgress] = useState(0);
  const [isExiting, setIsExiting] = useState(false);
  const [isDone, setIsDone] = useState(false);

  useEffect(() => {
    // Check if already shown this session
    const alreadyShown = sessionStorage.getItem("mw_splash_shown");
    if (alreadyShown) {
      setIsDone(true);
      return;
    }

    // Animate progress from 0 to 100
    const startTime = Date.now();
    const duration = 1800; // 1.8 seconds

    const interval = setInterval(() => {
      const elapsed = Date.now() - startTime;
      const p = Math.min((elapsed / duration) * 100, 100);
      setProgress(p);

      if (p >= 100) {
        clearInterval(interval);
        setTimeout(() => {
          setIsExiting(true);
          setTimeout(() => {
            setIsDone(true);
            sessionStorage.setItem("mw_splash_shown", "true");
          }, 600);
        }, 200);
      }
    }, 16);

    return () => clearInterval(interval);
  }, []);

  if (isDone) return null;

  return (
    <div
      className={`fixed inset-0 z-[9999] flex flex-col items-center justify-center bg-white transition-all duration-600 ${
        isExiting ? "opacity-0 scale-105" : "opacity-100 scale-100"
      }`}
      style={{ transitionTimingFunction: "cubic-bezier(0.4, 0, 0.2, 1)" }}
    >
      {/* Subtle background pattern */}
      <div className="absolute inset-0 bg-[linear-gradient(135deg,rgba(56,189,248,0.03)_0_1px,transparent_1px_32px)] pointer-events-none" />

      {/* Ambient glow */}
      <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-sky-100/40 rounded-full blur-[100px] pointer-events-none" />

      {/* Logo Area */}
      <div
        className={`relative z-10 flex flex-col items-center gap-6 transition-all duration-500 ${
          isExiting ? "translate-y-[-20px] opacity-0" : "translate-y-0 opacity-100"
        }`}
      >
        {siteSettings?.logo?.url ? (
          <img
            src={siteSettings.logo.url}
            alt="Logo"
            className="h-20 sm:h-24 w-auto object-contain animate-pulse"
          />
        ) : (
          <div className="text-center">
            <span className="block text-3xl sm:text-4xl font-black tracking-tight text-[#1a1a1a]">
              مركز الروان
            </span>
            <span className="block text-sm font-bold tracking-[0.3em] text-slate-400 uppercase mt-1 font-mono">
              Rwan Center
            </span>
          </div>
        )}

        {/* Progress Bar */}
        <div className="w-48 sm:w-56 h-[3px] bg-slate-100 rounded-full overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-accent via-sky-400 to-emerald-300 rounded-full transition-all duration-100 ease-linear"
            style={{ width: `${progress}%` }}
          />
        </div>

        {/* Loading text */}
        <span className="text-[11px] font-bold text-slate-400 tracking-wide">
          جارٍ تحميل المتجر...
        </span>
      </div>
    </div>
  );
}
