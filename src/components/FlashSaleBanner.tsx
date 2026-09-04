"use client";

import React, { useEffect, useState, useMemo } from "react";
import { useApp, Product, isMobileProduct } from "@/context/AppContext";
import ProductMockup from "./ProductMockup";
import {
  BadgeCheck,
  CheckCircle2,
  Clock,
  Flame,
  PackageCheck,
  ShieldCheck,
  ShoppingBag,
  Sparkles,
  Tag,
  Zap,
  Eye,
  Truck,
  RotateCcw,
  ArrowRight
} from "lucide-react";

const presetImages = [
  "iphone",
  "samsung",
  "cases",
  "headphones",
  "earbuds",
  "cable",
  "smartwatch",
  "powerbank",
  "screen-protector",
];

const isPresetProductVisual = (image: string) => (
  presetImages.includes(image) || image.startsWith("charger-")
);

function FlashProductVisual({ product }: { product: Product }) {
  if (isPresetProductVisual(product.image)) {
    return (
      <div className="relative z-10 flex h-full w-full items-center justify-center overflow-visible">
        <div className="scale-[1.85] sm:scale-[2.2] lg:scale-[2.4] transition-transform duration-700 hover:scale-[2.5] drop-shadow-[0_25px_40px_rgba(0,0,0,0.6)]">
          <ProductMockup image={product.image} name={product.name} sizeClass="w-32 aspect-[9/18]" />
        </div>
      </div>
    );
  }

  return (
    <img
      src={product.image}
      alt={product.name}
      loading="eager"
      decoding="async"
      className="relative z-10 max-h-[88%] max-w-[92%] rounded-[28px] object-contain drop-shadow-[0_30px_50px_rgba(0,0,0,0.65)] transition-transform duration-700 hover:scale-105"
    />
  );
}

function CyberTimeBox({ value, label, isHot = false }: { value: number; label: string; isHot?: boolean }) {
  return (
    <div className="flex min-w-[58px] sm:min-w-[68px] flex-col items-center">
      <div
        className={`relative flex h-14 sm:h-16 w-full items-center justify-center rounded-2xl border font-mono text-xl sm:text-2xl font-black shadow-lg backdrop-blur-md overflow-hidden ${
          isHot
            ? "border-rose-500/60 bg-gradient-to-b from-rose-600/90 to-red-700/90 text-white shadow-rose-600/30"
            : "border-white/15 bg-slate-950/75 text-white shadow-black/40"
        }`}
      >
        {/* Subtle inner gloss line */}
        <div className="pointer-events-none absolute inset-x-0 top-0 h-1/2 bg-white/[0.08]" />
        <span className="relative z-10 tracking-wider">
          {String(value).padStart(2, "0")}
        </span>
      </div>
      <span className="mt-1.5 text-[10px] sm:text-[11px] font-black tracking-wider text-slate-400">
        {label}
      </span>
    </div>
  );
}

interface FlashSaleBannerProps {
  onSelectProduct?: (product: Product) => void;
}

export default function FlashSaleBanner({ onSelectProduct }: FlashSaleBannerProps) {
  const { flashSale, products, addToCart } = useApp();
  const [now, setNow] = useState(() => Date.now());

  // Determine active product: from flashSale or smart fallback to top discounted/popular product
  const activeProduct = useMemo(() => {
    if (flashSale?.productId) {
      const found = products.find((p) => p.id === flashSale.productId);
      if (found) return found;
    }
    // Fallback: product with highest discount or popular item
    const withDiscount = products.find((p) => !isMobileProduct(p) && p.discountPrice && p.discountPrice > 0 && p.discountPrice < p.price);
    if (withDiscount) return withDiscount;

    return products.find((p) => p.isPopular) || products[0];
  }, [flashSale?.productId, products]);

  // Interval for ticking
  useEffect(() => {
    const intervalId = window.setInterval(() => {
      setNow(Date.now());
    }, 1000);

    return () => window.clearInterval(intervalId);
  }, []);

  // Time calculation
  const timeLeft = useMemo(() => {
    const targetEnd = flashSale?.endTime
      ? new Date(flashSale.endTime).getTime()
      : (() => {
          const d = new Date();
          d.setHours(24, 0, 0, 0);
          return d.getTime();
        })();

    const difference = targetEnd - now;
    if (difference <= 0) {
      // Loop with next day so sale is never blank
      return { days: 0, hours: 14, minutes: 45, seconds: 30, isOver: false };
    }

    return {
      days: Math.floor(difference / (1000 * 60 * 60 * 24)),
      hours: Math.floor((difference / (1000 * 60 * 60)) % 24),
      minutes: Math.floor((difference / 1000 / 60) % 60),
      seconds: Math.floor((difference / 1000) % 60),
      isOver: false,
    };
  }, [flashSale?.endTime, now]);

  if (!activeProduct) {
    return null;
  }

  // Calculate pricing & savings
  const dealPrice = flashSale?.discountPrice && flashSale.discountPrice > 0
    ? flashSale.discountPrice
    : (activeProduct.discountPrice && activeProduct.discountPrice > 0
        ? activeProduct.discountPrice
        : Math.round(activeProduct.price * 0.8)); // 20% discount if none defined

  const discountPercent = Math.max(8, Math.round((1 - (dealPrice / activeProduct.price)) * 100));
  const savingsAmount = activeProduct.price - dealPrice;

  const initialStock = Math.max(flashSale?.initialStock || flashSale?.stockLimit || 20, 10);
  const remainingStock = Math.max(1, flashSale?.stockLimit !== undefined && flashSale.stockLimit > 0 ? flashSale.stockLimit : 4);
  const stockPercent = Math.max(15, Math.min(100, (remainingStock / initialStock) * 100));

  const endsInPrimary = timeLeft.days > 0
    ? `${timeLeft.days} يوم`
    : timeLeft.hours > 0
      ? `${timeLeft.hours} ساعة`
      : `${timeLeft.minutes} دقيقة`;
  const endsInSecondary = timeLeft.days > 0
    ? `${timeLeft.hours} ساعة`
    : timeLeft.hours > 0
      ? `${timeLeft.minutes} دقيقة`
      : `${timeLeft.seconds} ثانية`;

  return (
    <section
      id="flash-sale"
      className="relative isolate w-full overflow-hidden rounded-[38px] bg-[#070a12] border border-red-500/20 p-5 sm:p-7 lg:p-10 text-right shadow-[0_35px_110px_rgba(0,0,0,0.65)] select-none"
      dir="rtl"
    >
      {/* Background Lighting and Radial Blooms */}
      <div className="pointer-events-none absolute -top-32 -right-32 h-[450px] w-[450px] rounded-full bg-gradient-to-br from-rose-600/30 via-red-600/20 to-transparent blur-[120px]" />
      <div className="pointer-events-none absolute -bottom-32 -left-32 h-[450px] w-[450px] rounded-full bg-gradient-to-tr from-sky-600/20 via-indigo-600/15 to-transparent blur-[120px]" />
      <div className="pointer-events-none absolute top-1/2 left-1/3 -translate-y-1/2 h-80 w-80 rounded-full bg-amber-500/10 blur-[140px]" />

      {/* Cyber Grid Pattern */}
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_1px_1px,rgba(255,255,255,0.06)_1px,transparent_0)] bg-[size:32px_32px] opacity-70" />

      {/* Top and Bottom Glowing Neon Edges */}
      <div className="pointer-events-none absolute inset-x-14 top-0 h-px bg-gradient-to-r from-transparent via-rose-500/80 to-transparent" />
      <div className="pointer-events-none absolute inset-x-14 bottom-0 h-px bg-gradient-to-r from-transparent via-amber-500/50 to-transparent" />

      <div className="relative z-10 grid gap-8 lg:grid-cols-[0.98fr_1.02fr] lg:items-center">
        {/* Left Col (Visual Presentation in RTL) */}
        <div className="order-1">
          <div className="relative min-h-[380px] sm:min-h-[440px] lg:min-h-[490px] rounded-[32px] border border-white/15 bg-gradient-to-b from-white/[0.08] via-white/[0.03] to-transparent p-5 sm:p-7 shadow-[0_25px_60px_rgba(0,0,0,0.5)] backdrop-blur-2xl overflow-hidden group">
            {/* Ambient Background Aura inside Card */}
            <div className="pointer-events-none absolute -right-16 -top-16 h-60 w-60 rounded-full bg-rose-500/20 blur-3xl group-hover:bg-rose-500/30 transition-all duration-700" />
            <div className="pointer-events-none absolute -left-16 -bottom-16 h-60 w-60 rounded-full bg-sky-500/15 blur-3xl" />

            {/* Badges Bar */}
            <div className="flex items-center justify-between gap-2 z-20 relative">
              <div className="inline-flex items-center gap-1.5 rounded-full bg-gradient-to-r from-rose-600 to-red-600 px-3.5 py-1.5 text-[11px] font-black text-white shadow-lg shadow-rose-600/40 animate-pulse">
                <Flame className="h-3.5 w-3.5 fill-white" />
                عرض خاطف حصري
              </div>
              <div className="inline-flex items-center gap-1.5 rounded-full border border-amber-400/30 bg-amber-400/10 px-3.5 py-1.5 text-[11px] font-black text-amber-300">
                <Sparkles className="h-3.5 w-3.5" />
                صفقة اليوم الذهبية
              </div>
            </div>

            {/* 3D Product Stage */}
            <div className="relative z-10 flex h-[260px] sm:h-[310px] lg:h-[330px] items-center justify-center my-3">
              {/* Laser disc / Holographic Pedestal */}
              <div className="absolute bottom-2 h-10 w-[78%] rounded-[100%] bg-gradient-to-r from-rose-600/40 via-amber-500/30 to-sky-500/40 blur-xl" />
              <div className="absolute bottom-4 h-16 w-[70%] rounded-[100%] border border-rose-500/30 bg-white/[0.04] shadow-[0_10px_35px_rgba(244,63,94,0.3)] backdrop-blur-sm" />
              <div className="absolute bottom-11 h-1.5 w-[50%] rounded-full bg-gradient-to-r from-rose-500 via-amber-400 to-sky-400 blur-[1px]" />

              <FlashProductVisual product={activeProduct} />
            </div>

            {/* Product Meta Card at Bottom of Image */}
            <div className="relative z-10 rounded-2xl border border-white/10 bg-slate-950/80 p-4 shadow-xl backdrop-blur-xl">
              <div className="mb-2 flex flex-wrap items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  <span className="rounded-lg bg-white/10 px-2.5 py-0.5 text-[10px] font-black text-slate-200">
                    {activeProduct.category}
                  </span>
                  <span className="rounded-lg bg-emerald-500/20 border border-emerald-500/30 px-2.5 py-0.5 text-[10px] font-black text-emerald-400">
                    أصلي مضمون
                  </span>
                </div>
                <span className="rounded-lg bg-rose-600/30 border border-rose-500/40 px-2.5 py-0.5 text-[11px] font-black text-rose-300">
                  خصم {discountPercent}%
                </span>
              </div>

              <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
                <div className="min-w-0">
                  <h3 className="truncate text-lg sm:text-xl font-black text-white">{activeProduct.name}</h3>
                  {activeProduct.nameEn && (
                    <p className="truncate font-mono text-[11px] font-bold uppercase text-slate-400" dir="ltr">
                      {activeProduct.nameEn}
                    </p>
                  )}
                </div>
                <div className="flex flex-shrink-0 items-baseline gap-2">
                  <span className="font-mono text-xs font-bold text-slate-400 line-through">
                    {activeProduct.price.toLocaleString()} د.ع
                  </span>
                  <span className="font-mono text-xl sm:text-2xl font-black text-transparent bg-clip-text bg-gradient-to-l from-white via-rose-100 to-rose-400">
                    {dealPrice.toLocaleString()} <span className="text-xs text-rose-400 font-sans">د.ع</span>
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Right Col: Urgency, Countdown, Live Stock & Purchase */}
        <div className="order-2 space-y-6 lg:pr-3">
          <div className="space-y-4">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="inline-flex items-center gap-2 rounded-full border border-rose-500/40 bg-rose-500/10 px-4 py-1.5 text-xs font-black text-rose-300 shadow-sm">
                <Zap className="h-4 w-4 fill-rose-500 text-rose-500" />
                الصفقة الاستثنائية لهذا اليوم
              </span>
              <span className="inline-flex items-center gap-1.5 rounded-full border border-white/10 bg-white/5 px-3 py-1.5 text-[11px] font-bold text-slate-300">
                <BadgeCheck className="h-3.5 w-3.5 text-sky-400" />
                سعر مخفض مباشر
              </span>
            </div>

            <div className="space-y-2.5">
              <h2 className="max-w-2xl text-2xl sm:text-3xl lg:text-4xl xl:text-5xl font-black leading-tight text-white">
                خصم استثنائي يخلي <span className="text-transparent bg-clip-text bg-gradient-to-l from-rose-400 via-pink-300 to-amber-300">{activeProduct.name}</span> بطل العرض
              </h2>
              <p className="max-w-xl text-xs sm:text-sm font-medium leading-relaxed text-slate-350">
                {activeProduct.description || "فرصة قوية لفترة وجيزة، صورة حقيقية، سعر لا يقبل المنافسة، مع ضمان فحص كامل وتوصيل فوري لجميع مدن العراق."}
              </p>
            </div>
          </div>

          {/* Quick Metrics Grid */}
          <div className="grid grid-cols-3 gap-2.5">
            <div className="rounded-2xl border border-white/10 bg-white/[0.04] p-3.5 backdrop-blur-md">
              <div className="flex items-center gap-1.5 text-rose-400 mb-1">
                <Tag className="h-4 w-4" />
                <span className="text-[10px] font-black text-slate-400">وفرت</span>
              </div>
              <strong className="block font-mono text-sm sm:text-base font-black text-white">
                {savingsAmount.toLocaleString()} <span className="text-[10px] text-rose-400 font-sans">د.ع</span>
              </strong>
            </div>

            <div className="rounded-2xl border border-white/10 bg-white/[0.04] p-3.5 backdrop-blur-md">
              <div className="flex items-center gap-1.5 text-emerald-400 mb-1">
                <PackageCheck className="h-4 w-4" />
                <span className="text-[10px] font-black text-slate-400">المتبقي</span>
              </div>
              <strong className="block font-mono text-sm sm:text-base font-black text-white">
                {remainingStock} قطع
              </strong>
            </div>

            <div className="rounded-2xl border border-white/10 bg-white/[0.04] p-3.5 backdrop-blur-md">
              <div className="flex items-center gap-1.5 text-sky-400 mb-1">
                <Clock className="h-4 w-4" />
                <span className="text-[10px] font-black text-slate-400">ينتهي خلال</span>
              </div>
              <strong className="block text-xs sm:text-sm font-black text-white truncate">
                {endsInPrimary}
              </strong>
              <span className="block text-[9px] font-bold text-sky-400 truncate">
                و {endsInSecondary}
              </span>
            </div>
          </div>

          {/* High-Tech Countdown Box & Scarcity Bar */}
          <div className="rounded-[28px] border border-white/15 bg-gradient-to-br from-white/[0.07] to-white/[0.02] p-5 backdrop-blur-2xl shadow-xl">
            <div className="mb-4 flex flex-wrap items-center justify-between gap-2">
              <div className="flex items-center gap-2 text-sm font-black text-white">
                <Flame className="h-5 w-5 fill-rose-500 text-rose-500 animate-bounce" />
                <span>العد التنازلي لانتهاء الصفقة الخاطفة</span>
              </div>
              <span className="rounded-full bg-rose-500/20 border border-rose-500/30 px-3 py-1 text-[10px] font-black text-rose-300">
                الكمية في تناقص
              </span>
            </div>

            {/* Countdown Flip Boxes */}
            <div className="grid grid-cols-4 gap-2.5">
              <CyberTimeBox value={timeLeft.days} label="يوم" />
              <CyberTimeBox value={timeLeft.hours} label="ساعة" />
              <CyberTimeBox value={timeLeft.minutes} label="دقيقة" />
              <CyberTimeBox value={timeLeft.seconds} label="ثانية" isHot />
            </div>

            {/* Live Demand Bar */}
            <div className="mt-5 space-y-2">
              <div className="flex items-center justify-between text-[11px] font-black">
                <span className="text-rose-400 flex items-center gap-1">
                  <Flame className="h-3.5 w-3.5" />
                  متبقي {remainingStock} قطع فقط بالسعر المخفض!
                </span>
                <span className="text-slate-400">من أصل {initialStock} قطعة</span>
              </div>
              <div className="h-2.5 w-full overflow-hidden rounded-full bg-slate-900/90 border border-white/10">
                <div
                  className="h-full rounded-full bg-gradient-to-l from-rose-600 via-amber-400 to-sky-400 transition-all duration-700 shadow-[0_0_12px_rgba(244,63,94,0.5)]"
                  style={{ width: `${stockPercent}%` }}
                />
              </div>
            </div>
          </div>

          {/* Action CTAs & Trust Badges */}
          <div className="space-y-4 pt-1">
            <div className="flex flex-col sm:flex-row gap-3">
              <button
                onClick={() => addToCart({ ...activeProduct, price: dealPrice, discountPrice: null })}
                className="flex-1 inline-flex items-center justify-center gap-2.5 rounded-2xl bg-gradient-to-r from-rose-600 via-pink-600 to-red-600 px-6 py-4 text-sm font-black text-white shadow-xl shadow-rose-600/35 hover:shadow-rose-600/60 hover:scale-[1.01] active:scale-[0.99] transition-all cursor-pointer"
              >
                <ShoppingBag className="h-5 w-5" />
                <span>احجز واشترِ بالسعر المخفض الآن</span>
              </button>

              {onSelectProduct && (
                <button
                  onClick={() => onSelectProduct(activeProduct)}
                  className="inline-flex items-center justify-center gap-2 rounded-2xl border border-white/20 bg-white/[0.08] hover:bg-white/[0.14] px-5 py-4 text-xs font-bold text-white transition-all cursor-pointer"
                >
                  <Eye className="h-4 w-4 text-slate-300" />
                  <span>تفاصيل الجهاز</span>
                </button>
              )}
            </div>

            {/* 4 Trust Badges in Frosted Pills */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              <div className="flex items-center justify-center gap-1.5 rounded-xl border border-white/10 bg-white/[0.03] px-2.5 py-2.5 text-[10px] font-bold text-slate-300">
                <ShieldCheck className="h-3.5 w-3.5 text-emerald-400" />
                <span>ضمان أصلي</span>
              </div>
              <div className="flex items-center justify-center gap-1.5 rounded-xl border border-white/10 bg-white/[0.03] px-2.5 py-2.5 text-[10px] font-bold text-slate-300">
                <Truck className="h-3.5 w-3.5 text-sky-400" />
                <span>شحن سريع</span>
              </div>
              <div className="flex items-center justify-center gap-1.5 rounded-xl border border-white/10 bg-white/[0.03] px-2.5 py-2.5 text-[10px] font-bold text-slate-300">
                <RotateCcw className="h-3.5 w-3.5 text-amber-400" />
                <span>استبدال فوري</span>
              </div>
              <div className="flex items-center justify-center gap-1.5 rounded-xl border border-white/10 bg-white/[0.03] px-2.5 py-2.5 text-[10px] font-bold text-slate-300">
                <CheckCircle2 className="h-3.5 w-3.5 text-rose-400" />
                <span>دفع عند الاستلام</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
