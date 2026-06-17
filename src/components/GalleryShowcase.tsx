"use client";

import React, { useMemo } from "react";
import { Product, GalleryItem, useApp } from "@/context/AppContext";
import { Sparkles } from "lucide-react";

interface GalleryShowcaseProps {
  onSelectProduct: (product: Product) => void;
}

function GalleryCard({ item, onSelectProduct }: { item: GalleryItem; onSelectProduct: (p: Product) => void }) {
  const { products } = useApp();
  const linkedProduct = products.find((p) => p.id === item.productId);

  const handleClick = () => {
    if (linkedProduct) {
      onSelectProduct(linkedProduct);
    }
  };

  return (
    <div
      onClick={handleClick}
      className="group relative w-[240px] sm:w-[300px] aspect-[4/5] rounded-[28px] border border-slate-200/80 bg-gradient-to-b from-white to-slate-50 flex-shrink-0 shadow-[0_4px_20px_rgba(0,0,0,0.015)] hover:shadow-[0_24px_50px_rgba(15,23,42,0.12)] hover:-translate-y-2 transition-all duration-500 ease-out overflow-hidden cursor-pointer"
    >
      {/* Decorative Grid Pattern */}
      <div className="absolute inset-0 bg-[linear-gradient(135deg,rgba(14,165,233,0.015)_0_1px,transparent_1px_20px)] opacity-30 pointer-events-none z-10" />

      {/* Image Display (Edge-to-Edge, object-cover) */}
      <div className="absolute inset-0">
        <img
          src={item.imageUrl}
          alt={linkedProduct?.name || "معرض الصور"}
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
        />
      </div>

      {/* Subtle hover shading */}
      <div className="absolute inset-0 bg-slate-950/2 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none z-20" />
    </div>
  );
}

export default function GalleryShowcase({ onSelectProduct }: GalleryShowcaseProps) {
  const { galleryShowcase } = useApp();

  // Repeated base items to ensure the screen width is filled for loop wrapping.
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
    <section id="gallery-showcase" className="space-y-8 text-right overflow-hidden py-4" dir="rtl">
      
      {/* Inject custom styling for the marquee animation */}
      <style dangerouslySetInnerHTML={{ __html: `
        @keyframes marquee-flat-scroll {
          0% {
            transform: translateX(0);
          }
          100% {
            /* Shift exactly by half the track width plus half a gap width (12px) to align clones perfectly */
            transform: translateX(calc(-50% - 12px));
          }
        }
        .animate-marquee-flat-track {
          display: flex;
          gap: 24px; /* gap-6 */
          animation: marquee-flat-scroll 35s linear infinite;
        }
        .animate-marquee-flat-track:hover {
          animation-play-state: paused;
        }
      `}} />

      {/* Title & Badge */}
      <div className="space-y-1 px-4 sm:px-6 lg:px-8">
        <span className="inline-flex items-center gap-1.5 rounded-full border border-sky-100 bg-sky-50/50 px-3 py-1 text-[10px] font-black text-sky-600">
          <Sparkles className="h-3.5 w-3.5" />
          جديد مركز الروان
        </span>
        <h2 className="text-xl sm:text-2xl font-black text-[#1a1a1a]">
          {galleryShowcase.title || "الأحدث. ألقِ نظرة على ما هو جديد الآن."}
        </h2>
        <p className="text-xs text-slate-500">
          {galleryShowcase.subtitle || "تصفح أحدث الأجهزة والملحقات المميزة المضافة حديثاً في المركز."}
        </p>
      </div>

      {/* Infinite Marquee Scrolling Viewport */}
      <div className="relative w-full overflow-hidden py-2" dir="ltr">
        {/* Flat list rendering items twice for seamless wrapping */}
        <div className="animate-marquee-flat-track w-max">
          
          {/* Primary Set */}
          {displayItems.map((item, idx) => (
            <GalleryCard
              key={`${item.id}-primary-${idx}`}
              item={item}
              onSelectProduct={onSelectProduct}
            />
          ))}

          {/* Secondary Clone Set */}
          {displayItems.map((item, idx) => (
            <GalleryCard
              key={`${item.id}-clone-${idx}`}
              item={item}
              onSelectProduct={onSelectProduct}
            />
          ))}

        </div>
      </div>

    </section>
  );
}
