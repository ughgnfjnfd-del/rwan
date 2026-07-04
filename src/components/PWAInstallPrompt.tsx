"use client";

import React, { useState, useEffect } from "react";
import { X, Share, PlusSquare, ArrowDownToLine, Info } from "lucide-react";

export default function PWAInstallPrompt() {
  const [isIOS, setIsIOS] = useState(false);
  const [isStandalone, setIsStandalone] = useState(false);
  const [showPrompt, setShowPrompt] = useState(false);
  const [promptDismissed, setPromptDismissed] = useState(false);

  useEffect(() => {
    // Check if the prompt was dismissed recently
    const dismissed = localStorage.getItem("pwa-prompt-dismissed");
    if (dismissed) {
      const dismissTime = parseInt(dismissed, 10);
      // Wait for 1 day before showing again
      if (Date.now() - dismissTime < 24 * 60 * 60 * 1000) {
        setPromptDismissed(true);
        return;
      } else {
        localStorage.removeItem("pwa-prompt-dismissed");
      }
    }

    // Detect OS and Standalone Mode
    const userAgent = window.navigator.userAgent.toLowerCase();
    const isMobileDevice = /mobi|android|touch|iphone|ipad|ipod/i.test(userAgent);
    const isIOSDevice = /iphone|ipad|ipod/i.test(userAgent);
    
    setIsIOS(isIOSDevice);

    const isStandaloneMode = window.matchMedia("(display-mode: standalone)").matches || (window.navigator as any).standalone;
    setIsStandalone(isStandaloneMode);

    // Show prompt ONLY on mobile devices, if not standalone, and not dismissed
    if (isMobileDevice && !isStandaloneMode && !promptDismissed) {
      // Delay showing the prompt by 3 seconds for better UX
      const timer = setTimeout(() => {
        setShowPrompt(true);
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [promptDismissed]);

  const handleDismiss = () => {
    setShowPrompt(false);
    localStorage.setItem("pwa-prompt-dismissed", Date.now().toString());
  };

  if (!showPrompt) return null;

  return (
    <div className="fixed inset-x-0 bottom-4 z-[9999] px-4 flex justify-center pointer-events-none">
      <div className={`pointer-events-auto w-full max-w-sm bg-black/40 backdrop-blur-3xl border border-white/20 rounded-[2rem] shadow-[0_20px_40px_rgba(0,0,0,0.5)] p-5 transform transition-all duration-700 ease-[cubic-bezier(0.16,1,0.3,1)] ${showPrompt ? "translate-y-0 opacity-100" : "translate-y-20 opacity-0"}`}>
        
        {/* Close Button */}
        <button
          onClick={handleDismiss}
          className="absolute top-4 left-4 w-8 h-8 flex items-center justify-center rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors"
          aria-label="Close"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Content */}
        <div className="flex flex-col items-center text-center mt-2">
          <div className="w-14 h-14 bg-gradient-to-tr from-sky-400 to-indigo-500 rounded-2xl p-[1px] mb-4 shadow-lg shadow-sky-500/30">
            <div className="w-full h-full bg-black/50 rounded-[15px] flex items-center justify-center">
              <img src="/icon-192x192.png" alt="App Icon" className="w-10 h-10 rounded-xl object-contain drop-shadow-md" onError={(e) => { (e.target as HTMLImageElement).src = 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="%23fff" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="5" y="2" width="14" height="20" rx="2" ry="2"></rect><line x1="12" y1="18" x2="12.01" y2="18"></line></svg>' }} />
            </div>
          </div>
          
          <h3 className="text-lg font-bold text-white mb-1 tracking-tight">ثبّت تطبيق الروان</h3>
          <p className="text-xs text-white/70 font-medium px-2 leading-relaxed mb-5">
            احصل على تجربة أسرع وأكثر سلاسة. أضف المركز لشاشتك الرئيسية الآن.
          </p>

          <div className="w-full bg-white/10 rounded-2xl p-4 flex flex-col items-center justify-center gap-3">
            {isIOS ? (
              <>
                <p className="text-[11px] font-bold text-white/90 flex items-center gap-2">
                  1. اضغط على أيقونة المشاركة <span className="p-1.5 bg-white/15 rounded-lg"><Share className="w-3.5 h-3.5" /></span>
                </p>
                <div className="w-full h-px bg-white/10" />
                <p className="text-[11px] font-bold text-white/90 flex items-center gap-2">
                  2. اختر الإضافة للشاشة <span className="p-1.5 bg-white/15 rounded-lg"><PlusSquare className="w-3.5 h-3.5" /></span>
                </p>
              </>
            ) : (
              <>
                <p className="text-[11px] font-bold text-white/90 flex items-center gap-2">
                  1. اضغط على القائمة <span className="p-1.5 bg-white/15 rounded-lg font-black tracking-widest text-xs">⋮</span>
                </p>
                <div className="w-full h-px bg-white/10" />
                <p className="text-[11px] font-bold text-white/90 flex items-center gap-2">
                  2. اختر تثبيت التطبيق <span className="p-1.5 bg-white/15 rounded-lg"><ArrowDownToLine className="w-3.5 h-3.5" /></span>
                </p>
              </>
            )}
          </div>
        </div>
        
        {/* Glow behind */}
        <div className="absolute inset-0 -z-10 bg-gradient-to-b from-white/5 to-transparent rounded-[2rem] pointer-events-none"></div>
      </div>
    </div>
  );
}
