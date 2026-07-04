import React, { useState, useEffect, useRef } from "react";
import { ChevronLeft, ChevronRight, Wrench, Headphones } from "lucide-react";
import { useApp } from "@/context/AppContext";
import ProductMockup from "@/components/ProductMockup";

interface PromoCarouselProps {
  onOpenRepairModal: () => void;
}

function BannerSharpImage({
  src,
  alt,
  maxHeight,
  maxUpscale = 1,
  className = "",
}: {
  src: string;
  alt: string;
  maxHeight: number;
  maxUpscale?: number;
  className?: string;
}) {
  const [naturalSize, setNaturalSize] = useState<{ width: number; height: number } | null>(null);

  return (
    <img
      src={src}
      alt={alt}
      decoding="async"
      loading="eager"
      onLoad={(event) => {
        const image = event.currentTarget;
        setNaturalSize({
          width: image.naturalWidth,
          height: image.naturalHeight,
        });
      }}
      className={`block h-auto w-auto object-contain ${className}`}
      style={{
        maxWidth: naturalSize ? `min(100%, ${Math.round(naturalSize.width * maxUpscale)}px)` : "100%",
        maxHeight: naturalSize ? `min(${maxHeight}px, ${Math.round(naturalSize.height * maxUpscale)}px)` : `${maxHeight}px`,
        filter: "contrast(1.04) saturate(1.03)",
        transform: "translateZ(0)",
        backfaceVisibility: "hidden",
      }}
    />
  );
}

export default function PromoCarousel({ onOpenRepairModal }: PromoCarouselProps) {
  const { heroSlides, products } = useApp();
  const [activeIndex, setActiveIndex] = useState(0);
  const [progress, setProgress] = useState(0);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const progressIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const duration = 30000; // 30 seconds auto rotate
  const progressStep = 100; // updates every 100ms

  const nextSlide = () => {
    if (!heroSlides || heroSlides.length === 0) return;
    setActiveIndex((prev) => (prev + 1) % heroSlides.length);
    setProgress(0);
  };

  const prevSlide = () => {
    if (!heroSlides || heroSlides.length === 0) return;
    setActiveIndex((prev) => (prev - 1 + heroSlides.length) % heroSlides.length);
    setProgress(0);
  };

  const selectSlide = (index: number) => {
    setActiveIndex(index);
    setProgress(0);
  };

  // Reset and restart timers when active index changes
  useEffect(() => {
    if (!heroSlides || heroSlides.length === 0) return;

    // Clear existing intervals
    if (timerRef.current) clearTimeout(timerRef.current);
    if (progressIntervalRef.current) clearInterval(progressIntervalRef.current);

    // Auto rotate timer
    timerRef.current = setTimeout(() => {
      nextSlide();
    }, duration);

    // Progress bar animation
    const startTime = Date.now();
    progressIntervalRef.current = setInterval(() => {
      const elapsed = Date.now() - startTime;
      const calculatedProgress = Math.min((elapsed / duration) * 100, 100);
      setProgress(calculatedProgress);
    }, progressStep);

    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
      if (progressIntervalRef.current) clearInterval(progressIntervalRef.current);
    };
  }, [activeIndex, heroSlides]);

  if (!heroSlides || heroSlides.length === 0) {
    return (
      <div className="w-full h-[350px] bg-slate-50 border border-slate-200 rounded-[32px] flex items-center justify-center">
        <div className="animate-spin w-8 h-8 border-4 border-accent border-t-transparent rounded-full"></div>
      </div>
    );
  }

  // Adjust activeIndex if slides count changed dynamically
  const safeActiveIndex = activeIndex >= heroSlides.length ? 0 : activeIndex;
  const activeSlide = heroSlides[safeActiveIndex];
  const isCustomVisual = activeSlide.graphicType === "custom";
  const isProductVisual = activeSlide.graphicType === "product";

  return (
    <section className="relative w-full overflow-hidden select-none group/carousel bg-black">
      {/* Dynamic Backgrounds Styles Injector */}
      <style dangerouslySetInnerHTML={{
        __html: `
        @keyframes float-slow {
          0%, 100% { transform: translateY(0px) rotate(0deg); }
          50% { transform: translateY(-12px) rotate(1.5deg); }
        }
        @keyframes float-reverse {
          0%, 100% { transform: translateY(0px) rotate(0deg); }
          50% { transform: translateY(10px) rotate(-1.5deg); }
        }
        @keyframes orbit {
          0% { transform: rotate(0deg) translate(20px) rotate(0deg); }
          100% { transform: rotate(360deg) translate(20px) rotate(-360deg); }
        }
        .animate-float-slow {
          animation: float-slow 7s ease-in-out infinite;
        }
        .animate-float-reverse {
          animation: float-reverse 6s ease-in-out infinite;
        }
        .animate-orbit-item {
          animation: orbit 15s linear infinite;
        }
        .text-glow-light {
          text-shadow: 0 4px 20px rgba(59, 130, 246, 0.15);
        }
        .text-glow-dark {
          text-shadow: 0 4px 20px rgba(56, 189, 248, 0.4);
        }
      `}} />

      {/* Main Slide Panel */}
      <div className={`w-full bg-gradient-to-br ${activeSlide.bgStyle} transition-all duration-1000 ease-in-out flex flex-col lg:flex-row items-center justify-center relative overflow-hidden min-h-[85vh] lg:min-h-[90vh]`}>

        <div className={`max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 pb-28 sm:pb-32 lg:pb-0 pt-8 lg:pt-0 flex flex-col lg:flex-row items-center justify-between ${isCustomVisual ? "gap-5 sm:gap-7 lg:gap-6" : "gap-8 sm:gap-12"} z-10`}>

        {/* Glow ambient effects */}
        <div className={`absolute -top-1/2 -right-1/4 w-96 h-96 rounded-full blur-[100px] pointer-events-none opacity-40 transition-all duration-700 ${activeSlide.theme === 'dark' ? 'bg-sky-500' : 'bg-blue-300'}`}></div>
        <div className={`absolute -bottom-1/2 -left-1/4 w-96 h-96 rounded-full blur-[100px] pointer-events-none opacity-40 transition-all duration-700 ${activeSlide.theme === 'dark' ? 'bg-purple-600' : 'bg-yellow-200'}`}></div>

        {/* 1. Slide Text Information (RTL) */}
        <div className={`${isCustomVisual ? "lg:w-[38%] lg:flex-none" : "flex-1"} w-full text-right space-y-4 sm:space-y-5 z-10 order-2 lg:order-2`}>

          {/* Badge */}
          <span className={`inline-flex items-center gap-1.5 px-3 py-1 font-extrabold text-[10px] sm:text-xs rounded-full border tracking-wide shadow-sm animate-pulse ${activeSlide.theme === "dark"
              ? "bg-white/10 text-sky-400 border-sky-500/20"
              : "bg-blue-600/10 text-blue-600 border-blue-600/20"
            }`}>
            ✨ {activeSlide.badge}
          </span>

          {/* Title Banner */}
          <div className="space-y-1 sm:space-y-2">
            <h2 className={`${isCustomVisual ? "text-3xl sm:text-4xl lg:text-5xl xl:text-6xl" : "text-3xl sm:text-4xl lg:text-5xl"} font-black tracking-tight leading-tight ${activeSlide.theme === 'dark' ? 'text-white' : 'text-slate-900'
              }`}>
              {activeSlide.title}
            </h2>
            <p className={`text-base sm:text-lg lg:text-xl font-bold tracking-tight ${activeSlide.theme === 'dark' ? 'text-sky-400 text-glow-dark' : 'text-blue-600 text-glow-light'
              }`}>
              {activeSlide.titleAccent}
            </p>
          </div>

          {/* Description */}
          <p className={`text-xs sm:text-sm leading-relaxed max-w-2xl font-medium ${activeSlide.theme === 'dark' ? 'text-slate-350' : 'text-slate-500'
            }`}>
            {activeSlide.description}
          </p>

          {/* Buttons CTA */}
          <div className="flex gap-4 pt-3 justify-start items-center">
            {activeSlide.actionType === "repair" ? (
              <button
                onClick={onOpenRepairModal}
                className={`w-full sm:w-auto text-center font-extrabold text-xs sm:text-sm px-8 py-3.5 rounded-2xl shadow-lg hover:scale-[1.01] active:scale-[0.99] transition-all duration-200 cursor-pointer ${activeSlide.theme === "dark"
                    ? "bg-sky-500 text-slate-950 hover:bg-sky-400 shadow-sky-500/25"
                    : "bg-blue-600 text-white hover:bg-blue-500 shadow-blue-600/25"
                  }`}
              >
                {activeSlide.btnText}
              </button>
            ) : (
              <a
                href={activeSlide.btnLink}
                className={`w-full sm:w-auto text-center font-extrabold text-xs sm:text-sm px-8 py-3.5 rounded-2xl shadow-lg hover:scale-[1.01] active:scale-[0.99] transition-all duration-200 block ${activeSlide.theme === "dark"
                    ? "bg-white text-slate-950 hover:bg-slate-50 shadow-white/10"
                    : "bg-[#1a1a1a] text-white hover:bg-slate-800 shadow-slate-900/25"
                  }`}
              >
                {activeSlide.btnText}
              </a>
            )}
          </div>
        </div>        {/* 2. Slide Visual Showcase (LTL/Left) */}
        <div className={`w-full ${isCustomVisual ? "lg:w-[62%]" : "lg:w-5/12"} flex items-center justify-center ${isCustomVisual ? "min-h-[320px] sm:min-h-[430px] lg:min-h-[500px]" : "min-h-[200px] sm:min-h-[260px] lg:min-h-0"} z-10 order-1 lg:order-1 relative`}>

          {/* Laptop Mockup (MacBook Slide) */}
          {activeSlide.graphicType === "macbook" && (
            <div className="relative w-full max-w-[320px] sm:max-w-[360px] aspect-video flex flex-col items-center justify-center animate-float-slow">
              {/* MacBook Laptop Screen */}
              <div className="w-[85%] aspect-[16/10] bg-slate-900 rounded-2xl p-[6px] shadow-2xl border-4 border-slate-700/90 relative flex items-center justify-center overflow-hidden z-10">
                {/* Glossy Reflection Overlay */}
                <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/5 to-white/15 pointer-events-none z-10"></div>
                {/* Display Content */}
                <div className="w-full h-full rounded-lg bg-gradient-to-tr from-sky-400 via-indigo-600 to-pink-500 flex flex-col justify-between p-3 relative overflow-hidden">
                  <div className="absolute top-0.5 left-1/2 -translate-x-1/2 w-8 h-1 bg-black rounded-full"></div>
                  <div className="flex justify-between items-center text-[6px] font-bold text-white/70">
                    <span>MacBook Air</span>
                    <span className="font-mono">M5</span>
                  </div>
                  <div className="flex-1 flex items-center justify-center py-2">
                    <span className="text-[14px] sm:text-[18px] font-black text-white text-center leading-none tracking-tight text-shadow">
                      Super. <br />Power.
                    </span>
                  </div>
                  <div className="h-2 w-full flex justify-between items-center">
                    <div className="flex gap-0.5">
                      <div className="w-1.5 h-1 bg-white/40 rounded-full"></div>
                      <div className="w-1.5 h-1 bg-white/40 rounded-full"></div>
                    </div>
                    <span className="text-[5px] text-white/50">Apple Intelligence</span>
                  </div>
                </div>
              </div>
              {/* MacBook Keyboard/Base */}
              <div className="w-full h-2.5 bg-slate-400 rounded-b-lg shadow-xl relative -mt-0.5 z-20 border-t border-slate-350 flex justify-center">
                <div className="w-14 h-0.5 bg-slate-550 rounded-b"></div>
              </div>
              {/* Underneath shadow */}
              <div className="w-[75%] h-4 bg-black/15 blur-md rounded-full -mt-1 scale-x-95"></div>
            </div>
          )}

          {/* iPhone Mockup (iPhone Slide) */}
          {activeSlide.graphicType === "iphone" && (
            <div className="relative w-full max-w-[280px] aspect-[9/10] flex items-center justify-center">
              {/* Backglow */}
              <div className="absolute w-44 h-44 bg-sky-500/20 rounded-full blur-2xl animate-pulse"></div>

              {/* Left Phone (Backwards / tilted) */}
              <div className="w-28 aspect-[9/18] bg-slate-800 rounded-[32px] p-[5px] border-2 border-slate-600 shadow-xl absolute -left-2 rotate-[-12deg] z-10 translate-y-3 scale-95 opacity-90 animate-float-reverse">
                <div className="w-full h-full rounded-[27px] bg-gradient-to-b from-zinc-800 to-zinc-950 flex flex-col justify-between p-3 relative overflow-hidden">
                  <div className="w-8 h-8 rounded-full bg-zinc-900 border border-zinc-700/50 p-1 grid grid-cols-2 gap-0.5 self-end">
                    <div className="w-2.5 h-2.5 rounded-full bg-black border border-zinc-600"></div>
                    <div className="w-2.5 h-2.5 rounded-full bg-black border border-zinc-600"></div>
                    <div className="col-span-2 w-2 h-2 rounded-full bg-black border border-zinc-600 mx-auto"></div>
                  </div>
                  <span className="text-[6px] text-zinc-500 font-mono tracking-wider">TITANIUM</span>
                </div>
              </div>

              {/* Right Phone (Frontwards / floating) */}
              <div className="w-32 aspect-[9/18] bg-slate-800 rounded-[36px] p-[6px] border-2 border-slate-500 shadow-2xl relative z-20 rotate-[6deg] animate-float-slow">
                {/* Dynamic Island Notch */}
                <div className="absolute top-2.5 left-1/2 -translate-x-1/2 w-10 h-3 bg-black rounded-full z-30 flex items-center justify-between px-1.5">
                  <div className="w-1.5 h-1.5 bg-sky-500 rounded-full scale-50"></div>
                  <div className="w-1.5 h-1.5 bg-[#001] rounded-full"></div>
                </div>
                {/* Bezel display container */}
                <div className="w-full h-full rounded-[30px] bg-black border border-zinc-950/20 overflow-hidden relative flex flex-col justify-between p-4 bg-gradient-to-tr from-slate-950 via-zinc-900 to-slate-900">
                  <div className="flex justify-between items-center text-[7px] text-zinc-400 font-bold font-mono mt-1">
                    <span>9:41</span>
                    <span className="text-sky-400 font-extrabold animate-pulse">5G</span>
                  </div>

                  <div className="flex-1 flex flex-col items-center justify-center py-4">
                    <span className="text-[15px] font-black text-white tracking-tight leading-none text-center">
                      A18 PRO
                    </span>
                    <span className="text-[6px] text-sky-400 font-extrabold tracking-widest mt-1">SUPER CHIP</span>
                  </div>

                  <div className="h-4 flex items-center justify-between border-t border-zinc-800/40 pt-1.5 text-[6px] text-zinc-405">
                    <span>Apple Intelligence</span>
                    <div className="w-3 h-3 bg-gradient-to-tr from-orange-400 to-pink-500 rounded-full animate-spin"></div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Repair Graphics (Repair Slide) */}
          {activeSlide.graphicType === "repair" && (
            <div className="relative w-full max-w-[280px] aspect-square flex items-center justify-center">
              {/* Neon Glow Circle */}
              <div className="absolute w-48 h-48 rounded-full border-2 border-dashed border-sky-500/20 animate-spin" style={{ animationDuration: '30s' }}></div>
              <div className="absolute w-40 h-40 rounded-full border border-sky-400/10 animate-spin" style={{ animationDuration: '15s' }}></div>

              {/* Floating gear and wrench */}
              <div className="w-24 h-24 bg-gradient-to-tr from-slate-950 to-slate-800 rounded-3xl border border-slate-700 shadow-2xl flex items-center justify-center animate-float-slow z-20 relative">
                <Wrench className="w-10 h-10 text-sky-400 drop-shadow-[0_0_12px_rgba(56,189,248,0.5)]" />
                <div className="absolute -top-2 -right-2 bg-sky-500/10 border border-sky-400/30 w-7 h-7 rounded-lg flex items-center justify-center">
                  <span className="text-sky-400 text-[10px] font-black">🛠️</span>
                </div>
              </div>

              {/* Floating processor card behind */}
              <div className="w-20 h-20 bg-slate-900 border border-slate-800 rounded-2xl shadow-xl flex flex-col justify-between p-2.5 absolute -left-2 bottom-4 z-10 rotate-[-15deg] animate-float-reverse">
                <div className="w-3.5 h-3.5 bg-emerald-500/10 border border-emerald-500/30 rounded flex items-center justify-center text-[7px] text-emerald-400 font-bold font-mono">
                  CPU
                </div>
                <div className="w-full space-y-1">
                  <div className="w-full h-1 bg-slate-855 rounded"></div>
                  <div className="w-3/4 h-1 bg-slate-855 rounded"></div>
                  <div className="w-1/2 h-1 bg-emerald-400/40 rounded"></div>
                </div>
                <span className="text-[6px] text-emerald-500 font-extrabold font-mono uppercase tracking-widest text-center">Active</span>
              </div>
            </div>
          )}

          {/* Premium Accessories Visual (Accessories Slide) */}
          {activeSlide.graphicType === "accessories" && (
            <div className="relative w-full max-w-[280px] aspect-square flex items-center justify-center">
              {/* Ring Backglow */}
              <div className="absolute w-48 h-48 bg-yellow-400/10 rounded-full blur-3xl animate-pulse"></div>

              {/* Headphones Mockup box */}
              <div className="w-24 h-24 bg-white rounded-2xl border border-slate-100 shadow-lg p-3 flex flex-col items-center justify-between animate-float-slow z-20 absolute -right-2 top-4">
                <Headphones className="w-8 h-8 text-blue-600" />
                <div className="w-full text-center">
                  <span className="block text-[8px] font-black text-slate-700">سماعات رأس</span>
                  <span className="block text-[6px] text-slate-400 font-bold uppercase tracking-wider font-mono">Original</span>
                </div>
              </div>

              {/* Fast Charger box */}
              <div className="w-22 h-22 bg-slate-900 text-white rounded-2xl shadow-xl p-3 flex flex-col justify-between items-center rotate-[-12deg] animate-float-reverse z-10 absolute -left-4 bottom-4">
                <div className="flex gap-1.5 -mt-4 mb-2">
                  <div className="w-0.5 h-2.5 bg-slate-700 rounded-t"></div>
                  <div className="w-0.5 h-2.5 bg-slate-700 rounded-t"></div>
                </div>
                <span className="text-[9px] font-black text-amber-400 tracking-tight">65W GaN</span>
                <span className="text-[5px] text-slate-400 font-extrabold">SUPER CHARGE</span>
                <div className="w-2 h-0.5 bg-emerald-500 rounded-full animate-pulse mt-0.5"></div>
              </div>
            </div>
          )}

          {/* Custom Uploaded Image */}
          {isCustomVisual && (
            <div className="relative w-full max-w-[520px] sm:max-w-[720px] lg:max-w-[830px] flex items-center justify-center lg:-ml-8 xl:-ml-14">
              {/* Apple-like product stage: big still image, soft depth, no motion */}
              <div className="absolute inset-y-10 left-0 right-4 rounded-[3rem] bg-white/[0.08] blur-3xl opacity-70"></div>
              <div className="absolute bottom-2 left-[10%] right-[4%] h-16 rounded-[100%] bg-black/30 blur-3xl opacity-45"></div>
              <div className="absolute -right-6 top-8 h-20 w-48 rounded-full border border-white/10 bg-white/10 blur-sm"></div>
              <div className="absolute -left-4 bottom-10 h-1 w-2/3 rounded-full bg-gradient-to-r from-transparent via-sky-300/70 to-transparent"></div>

              {activeSlide.customImageUrl ? (
                <div className="relative flex items-center justify-center rounded-[2.25rem] border border-white/20 bg-white/[0.07] p-2.5 shadow-[0_35px_90px_rgba(0,0,0,0.34)] backdrop-blur-md overflow-hidden">
                  <BannerSharpImage
                    src={activeSlide.customImageUrl}
                    alt={activeSlide.title}
                    maxHeight={520}
                    maxUpscale={1.18}
                    className="rounded-[1.65rem]"
                  />
                  {/* Glossy overlay */}
                  <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/4 to-white/12 pointer-events-none"></div>
                  <div className="absolute inset-x-8 top-0 h-px bg-gradient-to-r from-transparent via-white/50 to-transparent"></div>
                </div>
              ) : (
                <div className="w-full h-[220px] bg-slate-200/50 rounded-3xl flex items-center justify-center text-slate-450 border border-dashed border-slate-300 text-xs">
                  لا توجد صورة مخصصة مضافة
                </div>
              )}
            </div>
          )}

          {/* Product Showcase */}
          {isProductVisual && (
            <div className="relative w-full max-w-[430px] aspect-[9/10] flex items-center justify-center">
              {/* Backglow */}
              <div className="absolute w-44 h-44 bg-sky-500/20 rounded-full blur-2xl animate-pulse"></div>

              <div className="z-10 flex items-center justify-center">
                {(() => {
                  const product = products.find((p) => p.id === activeSlide.productId);
                  if (product) {
                    const isPreset = ["iphone", "samsung", "cases", "headphones", "earbuds", "cable", "smartwatch", "powerbank", "screen-protector"].includes(product.image) || product.image.startsWith("charger-");
                    if (isPreset) {
                      return (
                        <ProductMockup
                          image={product.image}
                          name={product.name}
                          sizeClass="w-32 aspect-[9/18]"
                        />
                      );
                    } else {
                      // Custom image upload from database
                      return (
                        <div className="w-full max-w-[360px] sm:max-w-[430px] h-64 sm:h-80 flex items-center justify-center p-2.5 rounded-2xl bg-white/10 backdrop-blur-md border border-white/20 shadow-2xl overflow-hidden">
                          <BannerSharpImage
                            src={product.image}
                            alt={product.name}
                            maxHeight={370}
                            maxUpscale={1.12}
                            className="rounded-xl"
                          />
                        </div>
                      );
                    }
                  }
                  return (
                    <div className="w-48 h-36 bg-slate-200/50 rounded-2xl flex items-center justify-center text-slate-450 border border-dashed border-slate-350 text-xs text-center p-4">
                      لم يتم اختيار منتج صالح
                    </div>
                  );
                })()}
              </div>
            </div>
          )}

        </div>
      </div>

      {/* 3. Slider Navigation Controls (Left/Right Arrows) */}
        <button
          onClick={prevSlide}
          className={`absolute left-3 sm:left-4 top-1/2 -translate-y-1/2 p-2 rounded-full backdrop-blur-md border border-white/10 opacity-100 md:opacity-0 md:group-hover/carousel:opacity-100 transition-opacity duration-300 z-30 cursor-pointer ${activeSlide.theme === 'dark'
              ? 'bg-slate-900/40 text-white hover:bg-slate-900/60'
              : 'bg-white/40 text-slate-800 hover:bg-white/60'
            }`}
          aria-label="السابق"
        >
          <ChevronLeft className="w-4 h-4 sm:w-5 h-5" />
        </button>
        <button
          onClick={nextSlide}
          className={`absolute right-3 sm:right-6 top-1/2 -translate-y-1/2 p-3 rounded-full backdrop-blur-md border border-white/10 opacity-100 md:opacity-0 md:group-hover/carousel:opacity-100 transition-all duration-300 z-30 cursor-pointer ${activeSlide.theme === 'dark'
              ? 'bg-slate-900/40 text-white hover:bg-slate-900/80 hover:scale-110'
              : 'bg-white/40 text-slate-800 hover:bg-white/80 hover:scale-110'
            }`}
          aria-label="التالي"
        >
          <ChevronRight className="w-5 h-5 sm:w-6 sm:h-6" />
        </button>
      </div>

      {/* 4. Bottom Tab Bar Navigation (Sleek Floating Pills) */}
      <div className="absolute bottom-4 sm:bottom-8 left-0 right-0 w-full px-4 flex justify-center z-30 pointer-events-none">
        <div className="bg-black/30 backdrop-blur-2xl border border-white/15 p-1.5 sm:p-2 rounded-full overflow-x-auto flex scrollbar-none max-w-[95%] sm:max-w-4xl pointer-events-auto shadow-[0_20px_40px_rgba(0,0,0,0.4)]">
          <div className="flex items-center gap-1 sm:gap-2">
            {heroSlides.map((slide, idx) => {
              const isActive = idx === activeIndex;
              return (
                <button
                  key={slide.id}
                  onClick={() => selectSlide(idx)}
                  className={`min-w-[80px] sm:min-w-[120px] text-center py-2 px-3 sm:py-2.5 sm:px-5 rounded-full transition-all duration-500 flex flex-col items-center gap-1 relative overflow-hidden cursor-pointer select-none ${isActive
                      ? "bg-white text-black shadow-lg font-black scale-100"
                      : "text-white/60 hover:text-white hover:bg-white/10 font-bold"
                    }`}
                >
                  <span className="truncate w-full text-[10px] sm:text-xs tracking-wide">
                    {slide.tabLabel}
                  </span>

                  {/* 30 Seconds Loading Progress Indicator inside Pill */}
                  {isActive && (
                    <div className="absolute bottom-0 left-0 right-0 h-1 bg-black/10">
                      <div
                        className="h-full bg-black transition-all ease-linear"
                        style={{
                          width: `${progress}%`,
                          transitionDuration: `${progressStep}ms`
                        }}
                      ></div>
                    </div>
                  )}
                </button>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}
