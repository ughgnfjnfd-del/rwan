"use client";

import React, { useState, useEffect } from "react";
import { useApp } from "@/context/AppContext";
import ProductMockup from "./ProductMockup";
import { ShoppingBag, Timer, Flame } from "lucide-react";

export default function FlashSaleBanner() {
  const { flashSale, products, addToCart } = useApp();
  const [timeLeft, setTimeLeft] = useState({ hours: 0, minutes: 0, seconds: 0, isOver: true });

  const product = products.find((p) => p.id === flashSale?.productId);

  useEffect(() => {
    if (!flashSale || !flashSale.isEnabled || !flashSale.endTime) return;

    const calculateTime = () => {
      const difference = +new Date(flashSale.endTime) - +new Date();
      if (difference <= 0) {
        setTimeLeft({ hours: 0, minutes: 0, seconds: 0, isOver: true });
        return;
      }

      const hours = Math.floor(difference / (1000 * 60 * 60));
      const minutes = Math.floor((difference / 1000 / 60) % 60);
      const seconds = Math.floor((difference / 1000) % 60);

      setTimeLeft({ hours, minutes, seconds, isOver: false });
    };

    calculateTime();
    const interval = setInterval(calculateTime, 1000);
    return () => clearInterval(interval);
  }, [flashSale]);

  if (!flashSale || !flashSale.isEnabled || !product || timeLeft.isOver) {
    return null;
  }

  const stockPercent = Math.max(0, Math.min(100, (flashSale.stockLimit / flashSale.initialStock) * 100));

  return (
    <section className="relative w-full rounded-[32px] overflow-hidden bg-gradient-to-br from-red-950 via-slate-900 to-zinc-950 border border-red-500/20 shadow-2xl p-6 sm:p-8 flex flex-col lg:flex-row items-center justify-between gap-8 text-right select-none" dir="rtl">
      {/* Decorative fire backglow */}
      <div className="absolute -top-1/2 -left-1/4 w-96 h-96 bg-red-600/10 rounded-full blur-[120px] pointer-events-none"></div>
      <div className="absolute -bottom-1/2 -right-1/4 w-96 h-96 bg-orange-600/10 rounded-full blur-[120px] pointer-events-none"></div>

      {/* Product Image / Mockup column */}
      <div className="w-full lg:w-4/12 flex items-center justify-center relative z-10">
        <div className="w-36 h-48 bg-white/5 border border-white/10 rounded-2xl p-4 flex items-center justify-center shadow-inner backdrop-blur-md relative group animate-float-slow">
          <ProductMockup image={product.image} name={product.name} sizeClass="w-24 aspect-[9/18]" />
          <span className="absolute top-2.5 right-2.5 bg-red-650 text-white font-black text-[9px] px-2 py-0.5 rounded-full shadow-md animate-pulse bg-red-600">
            عرض خاطف 🔥
          </span>
        </div>
      </div>

      {/* Details & Counter Column */}
      <div className="flex-1 w-full space-y-4 lg:space-y-5 z-10">
        <div className="space-y-2">
          <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-red-500/10 border border-red-500/20 text-red-400 font-extrabold text-[10px] sm:text-xs rounded-full">
            <Flame className="w-3.5 h-3.5 fill-red-400 text-red-400" />
            الصفقة الخاطفة اليومية (Flash Deal)
          </span>
          <h2 className="text-xl sm:text-2xl lg:text-3xl font-black text-white leading-tight">
            خصم استثنائي ومحدود على <span className="text-red-400">{product.name}</span>
          </h2>
          <p className="text-xs text-slate-400 max-w-2xl leading-relaxed">
            {product.description || "احصل على أفضل جهاز اليوم بسعر خاص لا يتكرر! العرض ساري حتى نفاد الكمية المخصصة أو انتهاء مؤقت الساعة."}
          </p>
        </div>

        {/* Pricing */}
        <div className="flex items-center gap-4 justify-start">
          <div className="flex flex-col text-right">
            <span className="text-[10px] sm:text-xs text-slate-500 line-through font-mono">
              {product.price.toLocaleString()} د.ع
            </span>
            <span className="text-xl sm:text-2xl font-black text-white font-mono flex items-center gap-2">
              {flashSale.discountPrice.toLocaleString()} د.ع
              <span className="bg-red-600 text-white font-extrabold text-[9px] sm:text-[10px] px-2 py-0.5 rounded-full">
                وفر {Math.round((1 - (flashSale.discountPrice / product.price)) * 100)}%
              </span>
            </span>
          </div>
        </div>

        {/* Stock status progress bar */}
        <div className="space-y-2 max-w-md">
          <div className="flex justify-between items-center text-[10px] sm:text-xs font-bold">
            <span className="text-red-400">متبقي {flashSale.stockLimit} قطع فقط!</span>
            <span className="text-slate-400">إجمالي كمية العرض: {flashSale.initialStock}</span>
          </div>
          <div className="w-full h-2 bg-slate-800 rounded-full overflow-hidden">
            <div 
              className="h-full bg-gradient-to-r from-red-600 to-orange-500 transition-all duration-500"
              style={{ width: `${stockPercent}%` }}
            ></div>
          </div>
        </div>
      </div>

      {/* Countdown Clock Column */}
      <div className="w-full lg:w-3/12 flex flex-col items-center justify-center gap-4 z-10 border-t lg:border-t-0 lg:border-r border-white/5 pt-6 lg:pt-0 lg:pr-6">
        <div className="flex items-center gap-1.5 text-xs font-extrabold text-slate-350">
          <Timer className="w-4 h-4 text-red-400" />
          <span>الوقت المتبقي لانتهاء الصفقة:</span>
        </div>
        
        {/* Timer UI Blocks */}
        <div className="flex gap-2.5 font-mono">
          {/* Hours */}
          <div className="flex flex-col items-center">
            <div className="w-12 h-12 bg-white/5 border border-white/10 rounded-xl flex items-center justify-center text-lg sm:text-xl font-black text-white shadow-md">
              {String(timeLeft.hours).padStart(2, "0")}
            </div>
            <span className="text-[9px] text-slate-500 font-bold mt-1">ساعة</span>
          </div>
          <span className="text-lg font-black text-slate-650 self-center -mt-4">:</span>
          {/* Minutes */}
          <div className="flex flex-col items-center">
            <div className="w-12 h-12 bg-white/5 border border-white/10 rounded-xl flex items-center justify-center text-lg sm:text-xl font-black text-white shadow-md">
              {String(timeLeft.minutes).padStart(2, "0")}
            </div>
            <span className="text-[9px] text-slate-500 font-bold mt-1">دقيقة</span>
          </div>
          <span className="text-lg font-black text-slate-650 self-center -mt-4">:</span>
          {/* Seconds */}
          <div className="flex flex-col items-center">
            <div className="w-12 h-12 bg-red-600/10 border border-red-500/20 rounded-xl flex items-center justify-center text-lg sm:text-xl font-black text-red-400 shadow-md animate-pulse">
              {String(timeLeft.seconds).padStart(2, "0")}
            </div>
            <span className="text-[9px] text-slate-500 font-bold mt-1">ثانية</span>
          </div>
        </div>

        {/* Add to cart CTA */}
        <button
          onClick={() => addToCart({ ...product, price: flashSale.discountPrice, discountPrice: null })}
          className="w-full bg-red-600 hover:bg-red-700 text-white font-extrabold text-xs py-3 px-6 rounded-2xl shadow-lg shadow-red-600/20 hover:scale-[1.01] active:scale-[0.99] transition-all flex items-center justify-center gap-2 cursor-pointer mt-2"
        >
          <ShoppingBag className="w-4 h-4" />
          <span>اشتري الآن بسعر الخصم</span>
        </button>
      </div>
    </section>
  );
}
