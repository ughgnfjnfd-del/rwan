"use client";

import React, { useEffect, useMemo, useState } from "react";
import { Eye, ShoppingBag, Zap } from "lucide-react";
import { Product, useApp } from "@/context/AppContext";
import ProductMockup from "@/components/ProductMockup";

interface PremiumShowcaseSectionProps {
  onSelectProduct: (product: Product) => void;
  onAddToCart: (product: Product) => void;
}

const presetImages = [
  "iphone", "samsung", "cases", "headphones", "earbuds", "cable", "smartwatch", "powerbank", "screen-protector",
];

const themeStyles = {
  titanium: {
    container: "bg-gradient-to-br from-slate-900 via-indigo-950 to-slate-900",
    accent: "text-indigo-600",
    btnPrimary: "text-indigo-900",
  },
  aqua: {
    container: "bg-gradient-to-br from-cyan-900 via-blue-950 to-slate-900",
    accent: "text-cyan-600",
    btnPrimary: "text-cyan-900",
  },
  blush: {
    container: "bg-gradient-to-br from-rose-900 via-pink-950 to-purple-950",
    accent: "text-rose-600",
    btnPrimary: "text-rose-900",
  },
};

const isPresetProductVisual = (image: string) => presetImages.includes(image) || image.startsWith("charger-");
const hasRealDiscount = (product: Product) => Boolean(product.discountPrice && product.discountPrice > 0 && product.discountPrice < product.price);
const getCurrentPrice = (product: Product) => product.discountPrice || product.price;
const getDiscountPercent = (product: Product) => hasRealDiscount(product) ? Math.round((1 - (getCurrentPrice(product) / product.price)) * 100) : 0;
const getSaving = (product: Product) => Math.max(0, product.price - getCurrentPrice(product));
const uniqueProducts = (items: Product[]) => Array.from(new Map(items.map((item) => [item.id, item])).values());

function PremiumProductVisual({ product, className }: { product: Product, className: string }) {
  if (isPresetProductVisual(product.image)) {
    return <ProductMockup image={product.image} name={product.name} sizeClass={className} />;
  }
  return (
    <img 
      src={product.image} 
      alt={product.name} 
      className={`${className} object-contain mix-blend-multiply transition-transform duration-700 group-hover:scale-110`} 
    />
  );
}

export default function PremiumShowcaseSection({ onSelectProduct, onAddToCart }: PremiumShowcaseSectionProps) {
  const { products, premiumShowcase } = useApp();
  const [activeIndex, setActiveIndex] = useState(0);

  const showcaseData = useMemo(() => {
    const discountedProducts = [...products].filter(hasRealDiscount).sort((a, b) => getSaving(b) - getSaving(a));
    const configuredProducts = premiumShowcase.productIds.map((id) => products.find((product) => product.id === id)).filter(Boolean) as Product[];
    const preferredHero = products.find((product) => product.id === premiumShowcase.heroProductId);
    
    const fallbackProducts = uniqueProducts([
      ...(preferredHero ? [preferredHero] : []),
      ...discountedProducts,
      ...products.filter((product) => product.isPopular),
    ]);

    const baseRotationProducts = configuredProducts.length > 0 ? configuredProducts : fallbackProducts;
    
    // Limit to 5 products for a clean dock switcher
    return baseRotationProducts.length > 0 ? baseRotationProducts.slice(0, 5) : null;
  }, [premiumShowcase.heroProductId, premiumShowcase.productIds, products]);

  const rotationProducts = showcaseData || [];

  useEffect(() => {
    if (!premiumShowcase.isEnabled || rotationProducts.length <= 1) return;
    const intervalId = window.setInterval(() => {
      setActiveIndex((curr) => (curr + 1) % rotationProducts.length);
    }, 6000); // 6 seconds dynamic rotation
    return () => window.clearInterval(intervalId);
  }, [premiumShowcase.isEnabled, rotationProducts.length]);

  if (!premiumShowcase.isEnabled || rotationProducts.length === 0) return null;

  const heroProduct = rotationProducts[activeIndex];
  const theme = themeStyles[premiumShowcase.theme] || themeStyles.titanium;
  const heroPrice = getCurrentPrice(heroProduct);
  const heroDiscount = getDiscountPercent(heroProduct);

  return (
    <section id="premium-offers" dir="rtl" className="px-4 py-8 max-w-7xl mx-auto w-full">
      <div className={`relative overflow-hidden rounded-[40px] shadow-[0_30px_80px_rgba(0,0,0,0.15)] ${theme.container}`}>
        
        {/* Animated Background Orbs */}
        <div className="absolute -top-32 -right-32 w-[500px] h-[500px] bg-white/10 blur-[120px] rounded-full mix-blend-overlay animate-pulse pointer-events-none" />
        <div className="absolute -bottom-32 -left-32 w-[500px] h-[500px] bg-white/5 blur-[120px] rounded-full mix-blend-overlay pointer-events-none" />
        <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] opacity-10 mix-blend-overlay pointer-events-none" />

        <div className="relative z-10 flex flex-col lg:flex-row items-center p-6 sm:p-10 md:p-16 gap-12 lg:gap-20">
          
          {/* Text Content */}
          <div className="flex-1 w-full text-center lg:text-right space-y-6 lg:space-y-8 order-2 lg:order-1">
            
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-white/20 bg-white/10 backdrop-blur-md shadow-lg">
               <Zap className="h-4 w-4 text-yellow-400 fill-yellow-400 animate-pulse" />
               <span className="text-xs font-bold text-white tracking-wide">{premiumShowcase.badge || "عرض حصري وخاص"}</span>
            </div>
            
            <div className="space-y-4">
              <h2 className="text-4xl sm:text-5xl lg:text-6xl font-black text-white leading-[1.15] tracking-tight drop-shadow-md">
                {premiumShowcase.title || "عروض الروان المميزة"}
              </h2>
              <p className="text-base sm:text-lg text-white/70 max-w-lg mx-auto lg:mx-0 font-medium leading-relaxed">
                {premiumShowcase.subtitle || "منتجات مختارة بعروض قوية وتجربة عرض مرتبة مثل واجهات المتاجر العالمية."}
              </p>
            </div>

            {/* Pricing Section */}
            <div className="flex flex-col sm:flex-row items-center lg:items-end justify-center lg:justify-start gap-4 sm:gap-6 pt-4">
               <div className="flex flex-col items-center lg:items-start bg-black/20 px-6 py-4 rounded-3xl border border-white/10 shadow-inner">
                  {hasRealDiscount(heroProduct) && (
                    <span className="text-white/50 text-sm line-through decoration-rose-500 decoration-2 font-mono mb-1">
                      {heroProduct.price.toLocaleString()} د.ع
                    </span>
                  )}
                  <span className="text-3xl sm:text-4xl font-black text-white font-mono drop-shadow-lg">
                    {heroPrice.toLocaleString()} د.ع
                  </span>
               </div>
               
               {heroDiscount > 0 && (
                  <div className="bg-gradient-to-r from-rose-500 to-pink-600 text-white px-5 py-2.5 rounded-2xl font-black shadow-[0_10px_20px_rgba(244,63,94,0.4)] rotate-3 hover:rotate-0 transition-transform cursor-default">
                     خصم جبار {heroDiscount}%
                  </div>
               )}
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 pt-4 w-full justify-center lg:justify-start">
               <button
                 onClick={() => onAddToCart(heroProduct)}
                 className={`group relative overflow-hidden bg-white px-8 py-4 rounded-2xl font-black shadow-[0_15px_30px_rgba(255,255,255,0.2)] hover:scale-105 transition-all duration-300 flex items-center justify-center gap-3 w-full sm:w-auto ${theme.btnPrimary}`}
               >
                 <div className="absolute inset-0 bg-white opacity-0 group-hover:opacity-100 transition-opacity" />
                 <ShoppingBag className="w-5 h-5 relative z-10" />
                 <span className="relative z-10">أضف للسلة الآن</span>
               </button>
               <button
                 onClick={() => onSelectProduct(heroProduct)}
                 className="bg-white/10 text-white border border-white/20 backdrop-blur-md px-8 py-4 rounded-2xl font-bold hover:bg-white/20 hover:scale-105 transition-all duration-300 flex items-center justify-center gap-3 w-full sm:w-auto"
               >
                 <Eye className="w-5 h-5" />
                 شاهد التفاصيل
               </button>
            </div>
            
            {/* Minimalist Dock Switcher */}
            {rotationProducts.length > 1 && (
              <div className="pt-6 flex items-center justify-center lg:justify-start gap-3">
                {rotationProducts.map((p, idx) => (
                  <button 
                    key={p.id}
                    onClick={() => setActiveIndex(idx)}
                    className={`relative w-12 h-12 sm:w-14 sm:h-14 rounded-2xl overflow-hidden border-2 transition-all duration-300 cursor-pointer ${
                      idx === activeIndex 
                        ? 'border-white scale-110 shadow-[0_0_20px_rgba(255,255,255,0.4)] z-10' 
                        : 'border-white/20 opacity-50 hover:opacity-100 hover:scale-105'
                    }`}
                  >
                    <div className="absolute inset-0 bg-white" />
                    <img src={p.image} className="absolute inset-0 w-full h-full object-contain mix-blend-multiply p-1.5" alt={p.name} />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* The Floating Pedestal (Image Area) */}
          <div className="w-full lg:w-[45%] relative perspective-1000 order-1 lg:order-2">
             
             {/* Decorative spinning ring behind pedestal */}
             <div className="absolute inset-4 border border-white/20 rounded-full animate-[spin_20s_linear_infinite] pointer-events-none" />
             <div className="absolute inset-0 border border-white/10 rounded-full animate-[spin_15s_linear_infinite_reverse] pointer-events-none" />
             
             {/* The White Pedestal Container */}
             <div 
               key={`pedestal-${heroProduct.id}`}
               className="group relative bg-white rounded-[40px] shadow-[0_40px_80px_rgba(0,0,0,0.5)] p-6 sm:p-10 overflow-hidden transform hover:-translate-y-2 transition-all duration-500 border border-white/40 animate-in fade-in zoom-in-95 duration-700"
             >
                {/* Soft inner shadow for 3D depth */}
                <div className="absolute inset-0 shadow-[inset_0_-20px_50px_rgba(0,0,0,0.06)] pointer-events-none rounded-[40px]" />
                
                {/* Floor shadow under the product to avoid square drop-shadows on white images */}
                <div className="absolute bottom-8 left-1/2 -translate-x-1/2 w-[70%] h-12 bg-black/15 blur-2xl rounded-full transition-transform duration-700 group-hover:scale-90 group-hover:bg-black/10" />

                {/* The Image */}
                <div className="relative h-[220px] sm:h-[300px] lg:h-[350px] flex items-center justify-center">
                   <PremiumProductVisual
                     product={heroProduct}
                     className="max-h-full w-auto max-w-full z-10"
                   />
                </div>

                {/* Pedestal Title (adds a nice touch) */}
                <div className="absolute top-6 left-6 right-6 flex justify-between items-center opacity-40 pointer-events-none">
                   <span className="font-black text-slate-900 text-xl tracking-widest uppercase truncate">{heroProduct.category}</span>
                   <span className="font-mono text-slate-900 font-bold">0{activeIndex + 1}</span>
                </div>
             </div>
             
             {/* Floating Promo Badge */}
             <div className="absolute -top-6 -right-2 sm:-right-6 bg-gradient-to-tr from-amber-300 to-yellow-100 text-amber-900 font-black px-4 sm:px-6 py-3 sm:py-4 rounded-3xl shadow-2xl rotate-12 animate-bounce flex flex-col items-center justify-center border-4 border-white z-20">
                <span className="text-[10px] sm:text-xs uppercase tracking-wider opacity-80">ترشيح المركز</span>
                <span className="text-sm sm:text-lg">الأكثر طلباً!</span>
             </div>
          </div>

        </div>
      </div>
    </section>
  );
}
