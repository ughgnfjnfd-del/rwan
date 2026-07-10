"use client";

/* eslint-disable @next/next/no-img-element */

import React, { useEffect, useMemo, useState } from "react";
import {
  ArrowLeft,
  BadgeCheck,
  Eye,
  PackageCheck,
  ShieldCheck,
  ShoppingBag,
  Sparkles,
  Zap,
} from "lucide-react";
import { Product, useApp } from "@/context/AppContext";
import ProductMockup from "@/components/ProductMockup";

interface PremiumShowcaseSectionProps {
  onSelectProduct: (product: Product) => void;
  onAddToCart: (product: Product) => void;
}

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

const themeStyles = {
  titanium: {
    shell: "from-white via-slate-50 to-slate-200",
    accent: "bg-slate-950 text-white",
    subtle: "text-slate-500",
    meter: "from-slate-950 via-slate-700 to-slate-400",
    tint: "bg-slate-950",
  },
  aqua: {
    shell: "from-white via-cyan-50 to-slate-100",
    accent: "bg-cyan-950 text-white",
    subtle: "text-cyan-700/70",
    meter: "from-cyan-950 via-cyan-700 to-sky-300",
    tint: "bg-cyan-600",
  },
  blush: {
    shell: "from-white via-rose-50 to-slate-100",
    accent: "bg-rose-950 text-white",
    subtle: "text-rose-700/70",
    meter: "from-rose-950 via-rose-700 to-pink-300",
    tint: "bg-rose-500",
  },
};

const isPresetProductVisual = (image: string) => presetImages.includes(image) || image.startsWith("charger-");
const hasRealDiscount = (product: Product) => Boolean(product.discountPrice && product.discountPrice > 0 && product.discountPrice < product.price);
const getCurrentPrice = (product: Product) => product.discountPrice || product.price;
const getDiscountPercent = (product: Product) => (
  hasRealDiscount(product)
    ? Math.round((1 - (getCurrentPrice(product) / product.price)) * 100)
    : 0
);
const getSaving = (product: Product) => Math.max(0, product.price - getCurrentPrice(product));
const uniqueProducts = (items: Product[]) => Array.from(new Map(items.map((item) => [item.id, item])).values());

function PremiumProductVisual({ product }: { product: Product }) {
  if (isPresetProductVisual(product.image)) {
    return (
      <div className="relative z-10 flex h-full w-full items-center justify-center scale-[1.75] sm:scale-[2.15] lg:scale-[2.35]">
        <ProductMockup image={product.image} name={product.name} sizeClass="w-28 aspect-[9/18]" />
      </div>
    );
  }

  return (
    <img
      src={product.image}
      alt={product.name}
      className="relative z-10 max-h-[86%] max-w-[86%] object-contain drop-shadow-[0_30px_45px_rgba(15,23,42,0.18)] transition-transform duration-700 group-hover:-translate-y-2 group-hover:scale-[1.03]"
    />
  );
}

function ProductThumb({ product }: { product: Product }) {
  if (isPresetProductVisual(product.image)) {
    return (
      <div className="scale-[0.65]">
        <ProductMockup image={product.image} name={product.name} sizeClass="w-12 aspect-[9/18]" />
      </div>
    );
  }

  return (
    <img
      src={product.image}
      alt={product.name}
      className="h-full w-full object-contain"
    />
  );
}

export default function PremiumShowcaseSection({ onSelectProduct, onAddToCart }: PremiumShowcaseSectionProps) {
  const { products, premiumShowcase } = useApp();
  const [activeIndex, setActiveIndex] = useState(0);

  const rotationProducts = useMemo(() => {
    const discountedProducts = [...products].filter(hasRealDiscount).sort((a, b) => getSaving(b) - getSaving(a));
    const configuredProducts = premiumShowcase.productIds
      .map((id) => products.find((product) => product.id === id))
      .filter(Boolean) as Product[];
    const preferredHero = products.find((product) => product.id === premiumShowcase.heroProductId);

    const fallbackProducts = uniqueProducts([
      ...(preferredHero ? [preferredHero] : []),
      ...discountedProducts,
      ...products.filter((product) => product.isPopular),
    ]);

    const baseRotationProducts = configuredProducts.length > 0 ? configuredProducts : fallbackProducts;
    return baseRotationProducts.slice(0, 5);
  }, [premiumShowcase.heroProductId, premiumShowcase.productIds, products]);

  useEffect(() => {
    if (!premiumShowcase.isEnabled || rotationProducts.length <= 1) return;

    const intervalId = window.setInterval(() => {
      setActiveIndex((current) => (current + 1) % rotationProducts.length);
    }, 6500);

    return () => window.clearInterval(intervalId);
  }, [premiumShowcase.isEnabled, rotationProducts.length]);

  if (!premiumShowcase.isEnabled || rotationProducts.length === 0) return null;

  const safeActiveIndex = activeIndex % rotationProducts.length;
  const heroProduct = rotationProducts[safeActiveIndex] || rotationProducts[0];
  const theme = themeStyles[premiumShowcase.theme] || themeStyles.titanium;
  const heroPrice = getCurrentPrice(heroProduct);
  const heroDiscount = getDiscountPercent(heroProduct);
  const saving = getSaving(heroProduct);
  const productLabel = heroProduct.nameEn || heroProduct.category;

  return (
    <section id="premium-offers" dir="rtl" className="w-full py-8 sm:py-12">
      <div className="mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className={`relative overflow-hidden rounded-[30px] border border-slate-200/80 bg-gradient-to-br ${theme.shell} shadow-[0_28px_70px_rgba(15,23,42,0.09)]`}>
          <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(110deg,rgba(255,255,255,0.96)_0%,rgba(255,255,255,0.72)_48%,rgba(255,255,255,0.12)_72%)]" />
          <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-white" />

          <div className="relative z-10 grid grid-cols-1 lg:min-h-[570px] lg:grid-cols-[1.03fr_0.97fr]">
            <div className="order-2 flex flex-col justify-between gap-7 p-6 text-right sm:p-9 lg:order-1 lg:p-11 xl:p-14">
              <div>
                <div className="mb-7 flex flex-wrap items-center gap-2">
                  <span className="inline-flex items-center gap-2 rounded-full border border-slate-200/70 bg-white/85 px-4 py-2 text-[11px] font-black text-slate-800 shadow-sm backdrop-blur-xl">
                    <Sparkles className="h-4 w-4 text-accent" />
                    {premiumShowcase.badge || "العروض الأقوى"}
                  </span>
                  {heroDiscount > 0 && (
                    <span className="inline-flex items-center gap-2 rounded-full border border-emerald-200 bg-emerald-50/90 px-4 py-2 text-[11px] font-black text-emerald-700">
                      <Zap className="h-4 w-4" />
                      وفر {saving.toLocaleString()} د.ع
                    </span>
                  )}
                </div>

                <div className="max-w-xl">
                  <p className="mb-3 text-[10px] font-black uppercase tracking-[0.18em] text-slate-400" dir="ltr">
                    AL-RWAN SIGNATURE SELECTION
                  </p>
                  <h2 className="text-[clamp(2.5rem,4.5vw,4.6rem)] font-black leading-[0.98] text-slate-950">
                    {premiumShowcase.title || "عروض الروان المميزة"}
                  </h2>
                  <p className="mt-5 max-w-lg text-sm font-semibold leading-7 text-slate-500 sm:text-base">
                    {premiumShowcase.subtitle || "منتجات مختارة بعروض قوية وتجربة عرض مرتبة مثل واجهات المتاجر العالمية."}
                  </p>
                </div>

                <div className="mt-7 flex max-w-xl flex-wrap items-center gap-x-5 gap-y-3 border-y border-slate-200/80 py-4">
                  {[
                    { icon: BadgeCheck, label: "منتج أصلي" },
                    { icon: ShieldCheck, label: "ضمان المركز" },
                    { icon: PackageCheck, label: "تسليم سريع" },
                  ].map((item) => (
                    <span key={item.label} className="inline-flex items-center gap-2 text-xs font-black text-slate-700">
                      <item.icon className="h-4 w-4 text-slate-950" />
                      {item.label}
                    </span>
                  ))}
                </div>
              </div>

              <div className="flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
                <div className="flex items-end gap-4">
                  <div>
                    <span className="block text-[10px] font-black text-slate-400">السعر الخاص</span>
                    <div className="mt-1 flex items-baseline gap-2">
                      <span className="font-mono text-4xl font-black tracking-normal text-slate-950">
                        {heroPrice.toLocaleString()}
                      </span>
                      <span className="text-xs font-black text-slate-500">د.ع</span>
                    </div>
                    {hasRealDiscount(heroProduct) && (
                      <span className="mt-1 block font-mono text-xs font-bold text-slate-400 line-through decoration-rose-500 decoration-2">
                        {heroProduct.price.toLocaleString()} د.ع
                      </span>
                    )}
                  </div>

                  {heroDiscount > 0 && (
                    <span className={`mb-1 rounded-full px-3 py-1.5 text-xs font-black shadow-sm ${theme.accent}`}>
                      -{heroDiscount}%
                    </span>
                  )}
                </div>

                <div className="flex gap-2">
                  <button
                    onClick={() => onAddToCart(heroProduct)}
                    className="inline-flex min-h-12 items-center justify-center gap-2 rounded-full bg-slate-950 px-6 text-sm font-black text-white shadow-[0_16px_30px_rgba(15,23,42,0.18)] transition-all duration-300 hover:-translate-y-0.5 hover:bg-slate-800 active:scale-[0.98] cursor-pointer"
                  >
                    <ShoppingBag className="h-4 w-4" />
                    <span>أضف للسلة</span>
                  </button>
                  <button
                    onClick={() => onSelectProduct(heroProduct)}
                    aria-label={premiumShowcase.ctaText || "شاهد التفاصيل"}
                    title={premiumShowcase.ctaText || "شاهد التفاصيل"}
                    className="inline-flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-full border border-slate-200 bg-white/80 text-slate-800 shadow-sm backdrop-blur-xl transition-all duration-300 hover:-translate-y-0.5 hover:bg-white active:scale-[0.98] cursor-pointer"
                  >
                    <Eye className="h-4 w-4" />
                  </button>
                </div>
              </div>
            </div>

            <div className="relative order-1 flex min-h-[440px] flex-col overflow-hidden border-b border-white/80 bg-white/35 p-5 sm:min-h-[520px] sm:p-7 lg:order-2 lg:min-h-0 lg:border-b-0 lg:border-r">
              <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(145deg,rgba(255,255,255,0.88),rgba(255,255,255,0.18)_55%,rgba(255,255,255,0.72))]" />
              <span className="pointer-events-none absolute left-5 top-16 select-none text-[clamp(5rem,11vw,9rem)] font-black leading-none text-slate-900/[0.035]" dir="ltr">
                RWAN
              </span>

              <div className="relative z-20 flex items-start justify-between gap-4">
                <div className="min-w-0 text-right">
                  <span className="block text-[10px] font-black text-slate-400">اختيار اليوم</span>
                  <h3 className="mt-1 truncate text-lg font-black text-slate-950">{heroProduct.name}</h3>
                  <p className={`mt-1 truncate text-[11px] font-bold ${theme.subtle}`} dir={heroProduct.nameEn ? "ltr" : "rtl"}>
                    {productLabel}
                  </p>
                </div>
                <span className="font-mono text-xs font-black text-slate-400" dir="ltr">
                  {String(safeActiveIndex + 1).padStart(2, "0")} / {String(rotationProducts.length).padStart(2, "0")}
                </span>
              </div>

              <div className="relative z-10 flex flex-1 items-center justify-center py-3">
                <div className="group relative flex h-[300px] w-full max-w-[520px] items-center justify-center sm:h-[385px] lg:h-[400px]">
                  <div className="absolute bottom-5 h-10 w-[66%] rounded-[100%] bg-slate-400/35 blur-2xl" />
                  <div className="absolute bottom-2 h-14 w-[72%] rounded-[50%] border border-white/90 bg-white/60 shadow-[0_20px_45px_rgba(15,23,42,0.12)] backdrop-blur-md" />
                  <div className={`absolute bottom-9 h-1 w-24 rounded-full bg-gradient-to-l ${theme.meter}`} />
                  <PremiumProductVisual product={heroProduct} />
                </div>
              </div>

              <div className="relative z-20 flex items-end justify-between gap-3">
                {rotationProducts.length > 1 && (
                  <div className="flex items-center gap-1.5 rounded-full border border-white bg-white/75 p-1.5 shadow-sm backdrop-blur-xl">
                    {rotationProducts.map((product, index) => {
                      const isActive = index === safeActiveIndex;

                      return (
                        <button
                          key={product.id}
                          onClick={() => setActiveIndex(index)}
                          aria-label={product.name}
                          className={`relative flex h-11 w-11 items-center justify-center overflow-hidden rounded-full border transition-all duration-300 cursor-pointer sm:h-12 sm:w-12 ${
                            isActive
                              ? "scale-105 border-slate-950 bg-white shadow-md"
                              : "border-transparent bg-slate-100/80 opacity-65 hover:border-slate-300 hover:opacity-100"
                          }`}
                          title={product.name}
                        >
                          <ProductThumb product={product} />
                        </button>
                      );
                    })}
                  </div>
                )}

                <button
                  onClick={() => onSelectProduct(heroProduct)}
                  className="group inline-flex min-h-10 items-center justify-center gap-2 rounded-full px-3 text-[11px] font-black text-slate-500 transition-colors hover:text-slate-950 cursor-pointer"
                >
                  <span className="hidden sm:inline">المواصفات</span>
                  <ArrowLeft className="h-4 w-4 transition-transform group-hover:-translate-x-1" />
                </button>
              </div>
            </div>
          </div>

          <div className={`absolute bottom-0 right-0 h-[3px] w-full ${theme.tint} opacity-80`} />
        </div>
      </div>
    </section>
  );
}
