"use client";

import React, { useMemo } from "react";
import { Product, GalleryItem, useApp } from "@/context/AppContext";
import { Sparkles, ArrowLeft, ArrowRight } from "lucide-react";

interface GalleryShowcaseProps {
  onSelectProduct: (product: Product) => void;
}

function GalleryCard({ item, onSelectProduct, isClone = false }: { item: GalleryItem; onSelectProduct: (p: Product) => void, isClone?: boolean }) {
  const { products } = useApp();
  const linkedProduct = products.find((p) => p.id === item.productId);

  return (
    <div
      onClick={() => linkedProduct && onSelectProduct(linkedProduct)}
      className={`group relative w-[75vw] sm:w-[320px] md:w-[340px] aspect-[4/5] sm:aspect-[3/4] rounded-[28px] sm:rounded-[32px] flex-shrink-0 cursor-pointer snap-center ${isClone ? 'hidden md:block' : 'block'}`}
      style={{ perspective: "1000px" }}
    >
      {/* Premium Card Container */}
      <div className="relative w-full h-full rounded-[28px] sm:rounded-[32px] overflow-hidden transition-all duration-700 ease-[cubic-bezier(0.23,1,0.32,1)] transform-gpu md:group-hover:-translate-y-3 md:group-hover:shadow-[0_40px_80px_-20px_rgba(14,165,233,0.3)] bg-white border border-slate-200/60 shadow-[0_10px_30px_-10px_rgba(0,0,0,0.1)] md:shadow-none">
        
        {/* Image */}
        <img
          src={item.imageUrl}
          alt={linkedProduct?.name || "معرض المنتجات"}
          className="w-full h-full object-cover transition-transform duration-700 md:group-hover:scale-105"
        />

        {/* Ambient Overlay for text contrast - Always on for mobile, hover for desktop */}
        <div className="absolute inset-0 bg-gradient-to-t from-slate-900/90 via-slate-900/10 to-transparent opacity-100 md:opacity-0 md:group-hover:opacity-100 transition-opacity duration-500" />
        
        {/* Glossy reflection effect - Desktop only */}
        <div className="hidden md:block absolute inset-0 bg-gradient-to-tr from-white/0 via-white/30 to-white/0 opacity-0 group-hover:opacity-100 transform -translate-x-full group-hover:translate-x-full transition-all duration-1000 ease-in-out" />

        {/* Hover/Mobile Content: Always visible on mobile, Slide up from bottom on desktop */}
        {linkedProduct && (
          <div className="absolute bottom-0 left-0 w-full p-5 sm:p-6 translate-y-0 md:translate-y-8 opacity-100 md:opacity-0 md:group-hover:translate-y-0 md:group-hover:opacity-100 transition-all duration-500 z-20 flex justify-between items-end" dir="rtl">
             <div className="max-w-[80%]">
               <p className="text-white font-bold text-base sm:text-lg leading-tight line-clamp-2 drop-shadow-md">{linkedProduct.name}</p>
               <div className="inline-block mt-2 px-3 py-1 rounded-full bg-black/30 backdrop-blur-md border border-white/20">
                 <p className="text-sky-300 font-black text-sm drop-shadow-md">{linkedProduct.price.toLocaleString()} د.ع</p>
               </div>
             </div>
             <div className="w-10 h-10 rounded-full bg-white/20 backdrop-blur-md flex items-center justify-center text-white border border-white/30 shadow-lg shrink-0 transition-transform md:group-hover:scale-110">
                <ArrowLeft className="w-5 h-5 -rotate-45" />
             </div>
          </div>
        )}
      </div>

      {/* Behind Card Glow - Desktop only */}
      <div className="hidden md:block absolute -inset-2 bg-gradient-to-r from-sky-400 to-emerald-400 rounded-[36px] blur-2xl opacity-0 group-hover:opacity-25 transition-opacity duration-700 -z-10" />
    </div>
  );
}

export default function GalleryShowcase({ onSelectProduct }: GalleryShowcaseProps) {
  const { galleryShowcase } = useApp();

  const displayItems = useMemo(() => {
    const rawItems = galleryShowcase.items || [];
    if (rawItems.length === 0) return [];
    
    let repeated = [...rawItems];
    while (repeated.length < 8) {
      repeated = [...repeated, ...rawItems];
    }
    return repeated;
  }, [galleryShowcase.items]);

  if (!galleryShowcase.isEnabled || displayItems.length === 0) return null;

  return (
    <section className="relative py-12 md:py-20 overflow-hidden bg-slate-50/50" dir="rtl">
      
      {/* CSS for Premium Marquee with fade edges on Desktop & Swipe on Mobile */}
      <style dangerouslySetInnerHTML={{ __html: `
        @media (min-width: 768px) {
          @keyframes scroll-marquee {
            from { transform: translateX(0); }
            to { transform: translateX(calc(-50% - 16px)); } /* 32px gap / 2 */
          }
          .desktop-marquee {
            display: flex;
            gap: 32px;
            animation: scroll-marquee 40s linear infinite;
          }
          .desktop-marquee:hover {
            animation-play-state: paused;
          }
          .fade-edges {
            mask-image: linear-gradient(to right, transparent, black 10%, black 90%, transparent);
            -webkit-mask-image: linear-gradient(to right, transparent, black 10%, black 90%, transparent);
          }
        }
        
        /* Hide scrollbar for mobile swipe */
        .mobile-swipe-container::-webkit-scrollbar {
          display: none;
        }
        .mobile-swipe-container {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
      `}} />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-8 md:mb-12 flex flex-col items-center text-center">
        <div className="inline-flex items-center gap-2 rounded-full border border-sky-200/50 bg-white px-4 py-1.5 shadow-sm mb-5 transition-transform hover:scale-105">
          <Sparkles className="h-4 w-4 text-sky-500" />
          <span className="text-xs font-bold bg-clip-text text-transparent bg-gradient-to-r from-sky-600 to-emerald-600">
            اكتشف الجديد
          </span>
        </div>
        <h2 className="text-3xl sm:text-4xl md:text-5xl font-black text-slate-900 tracking-tight mb-4 leading-tight">
          {galleryShowcase.title || "أحدث المنتجات"}
        </h2>
        <p className="text-sm sm:text-base md:text-lg text-slate-500 max-w-2xl leading-relaxed">
          {galleryShowcase.subtitle || "نقدم لك أحدث الأجهزة والملحقات المميزة المضافة حديثاً في المركز. تصفح التشكيلة الكاملة بأسعار تنافسية."}
        </p>
      </div>

      <div className="relative w-full pb-4 md:pb-8">
        <div className="md:fade-edges overflow-hidden md:overflow-visible" dir="ltr">
          {/* Mobile Swipe / Desktop Marquee Track */}
          <div className="mobile-swipe-container desktop-marquee flex overflow-x-auto md:overflow-visible snap-x snap-mandatory px-4 md:px-0 gap-4 md:gap-8 w-full md:w-max scroll-smooth py-4">
            {displayItems.map((item, idx) => (
              <GalleryCard key={`primary-${idx}`} item={item} onSelectProduct={onSelectProduct} />
            ))}
            {displayItems.map((item, idx) => (
              <GalleryCard key={`clone-${idx}`} item={item} onSelectProduct={onSelectProduct} isClone={true} />
            ))}
          </div>
        </div>

        {/* Mobile Swipe Hint */}
        <div className="md:hidden flex items-center justify-center gap-2 mt-2 text-slate-400 text-xs font-medium">
          <ArrowRight className="w-3 h-3" />
          <span>اسحب للمزيد</span>
          <ArrowLeft className="w-3 h-3" />
        </div>
      </div>
    </section>
  );
}
