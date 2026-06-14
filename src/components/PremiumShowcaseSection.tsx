"use client";

import React, { useEffect, useMemo, useState } from "react";
import {
  ArrowLeft,
  BadgeCheck,
  CheckCircle2,
  Eye,
  ShieldCheck,
  ShoppingBag,
  Sparkles,
  Star,
  Tag,
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
    section: "border-slate-200/80 bg-[linear-gradient(135deg,#ffffff_0%,#f8fafc_46%,#edf7ff_100%)]",
    badge: "border-slate-200 bg-white text-slate-900",
    accent: "from-slate-900 via-sky-500 to-emerald-300",
    highlight: "text-sky-600",
    soft: "bg-slate-950 text-white",
  },
  aqua: {
    section: "border-cyan-100 bg-[linear-gradient(135deg,#ffffff_0%,#f0fdff_48%,#eefcf5_100%)]",
    badge: "border-cyan-200 bg-white text-cyan-800",
    accent: "from-cyan-500 via-sky-400 to-emerald-300",
    highlight: "text-cyan-700",
    soft: "bg-cyan-700 text-white",
  },
  blush: {
    section: "border-rose-100 bg-[linear-gradient(135deg,#ffffff_0%,#fff7f7_48%,#f5fbff_100%)]",
    badge: "border-rose-200 bg-white text-rose-700",
    accent: "from-rose-500 via-sky-400 to-amber-300",
    highlight: "text-rose-600",
    soft: "bg-rose-600 text-white",
  },
};

const isPresetProductVisual = (image: string) => (
  presetImages.includes(image) || image.startsWith("charger-")
);

const hasRealDiscount = (product: Product) => (
  Boolean(product.discountPrice && product.discountPrice > 0 && product.discountPrice < product.price)
);

const getCurrentPrice = (product: Product) => product.discountPrice || product.price;

const getDiscountPercent = (product: Product) => (
  hasRealDiscount(product)
    ? Math.round((1 - (getCurrentPrice(product) / product.price)) * 100)
    : 0
);

const getSaving = (product: Product) => Math.max(0, product.price - getCurrentPrice(product));

const uniqueProducts = (items: Product[]) => (
  Array.from(new Map(items.map((item) => [item.id, item])).values())
);

function PremiumProductVisual({
  product,
  sizeClass,
  imageClassName,
  eager = false,
}: {
  product: Product;
  sizeClass: string;
  imageClassName: string;
  eager?: boolean;
}) {
  if (isPresetProductVisual(product.image)) {
    return <ProductMockup image={product.image} name={product.name} sizeClass={sizeClass} />;
  }

  return (
    <img
      src={product.image}
      alt={product.name}
      loading={eager ? "eager" : "lazy"}
      decoding="async"
      className={`${imageClassName} object-contain drop-shadow-[0_26px_38px_rgba(15,23,42,0.18)]`}
    />
  );
}

export default function PremiumShowcaseSection({ onSelectProduct, onAddToCart }: PremiumShowcaseSectionProps) {
  const { products, premiumShowcase } = useApp();
  const [activeIndex, setActiveIndex] = useState(0);

  const showcaseData = useMemo(() => {
    const discountedProducts = [...products]
      .filter(hasRealDiscount)
      .sort((a, b) => getSaving(b) - getSaving(a));

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
    const preferredHeroIndex = preferredHero
      ? baseRotationProducts.findIndex((product) => product.id === preferredHero.id)
      : -1;
    const rotationProducts = preferredHeroIndex > 0
      ? [
        baseRotationProducts[preferredHeroIndex],
        ...baseRotationProducts.slice(0, preferredHeroIndex),
        ...baseRotationProducts.slice(preferredHeroIndex + 1),
      ]
      : baseRotationProducts;

    if (rotationProducts.length === 0) {
      return null;
    }

    return { rotationProducts, discountedProducts };
  }, [premiumShowcase.heroProductId, premiumShowcase.productIds, products]);

  const rotationProducts = showcaseData?.rotationProducts || [];
  const discountedProducts = showcaseData?.discountedProducts || [];

  useEffect(() => {
    if (!premiumShowcase.isEnabled || rotationProducts.length <= 1) return;

    const intervalId = window.setInterval(() => {
      setActiveIndex((currentIndex) => (currentIndex + 1) % rotationProducts.length);
    }, 60000);

    return () => window.clearInterval(intervalId);
  }, [premiumShowcase.isEnabled, rotationProducts.length]);

  if (!premiumShowcase.isEnabled || rotationProducts.length === 0) return null;

  const safeActiveIndex = activeIndex % rotationProducts.length;
  const heroProduct = rotationProducts[safeActiveIndex];
  const supportProducts = rotationProducts
    .filter((product) => product.id !== heroProduct.id)
    .slice(0, 3);
  const theme = themeStyles[premiumShowcase.theme] || themeStyles.titanium;
  const heroPrice = getCurrentPrice(heroProduct);
  const heroDiscount = getDiscountPercent(heroProduct);
  const heroSaving = getSaving(heroProduct);

  return (
    <section
      id="premium-offers"
      dir="rtl"
      className={`relative isolate overflow-hidden rounded-[32px] border px-4 py-6 text-right shadow-[0_28px_80px_rgba(15,23,42,0.08)] sm:px-7 sm:py-8 lg:px-10 lg:py-10 ${theme.section}`}
    >
      <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(90deg,rgba(15,23,42,0.04)_1px,transparent_1px),linear-gradient(180deg,rgba(15,23,42,0.035)_1px,transparent_1px)] bg-[size:42px_42px]" />
      <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-l from-transparent via-white to-transparent" />
      <div className="pointer-events-none absolute inset-x-8 bottom-0 h-px bg-gradient-to-l from-transparent via-sky-200 to-transparent" />

      <div className="relative grid gap-8 lg:grid-cols-[0.9fr_1.1fr] lg:items-center">
        <div className="order-2 space-y-6 lg:order-1">
          <div className="space-y-4">
            <span className={`inline-flex items-center gap-2 rounded-full border px-3.5 py-2 text-[11px] font-black shadow-sm ${theme.badge}`}>
              <Sparkles className="h-4 w-4" />
              {premiumShowcase.badge || "العروض الأقوى"}
            </span>

            <div className="space-y-3">
              <h2 className="text-3xl font-black leading-tight text-slate-950 sm:text-4xl lg:text-5xl">
                {premiumShowcase.title || "مختارات الروان المميزة"}
              </h2>
              <p className="max-w-xl text-sm font-bold leading-7 text-slate-500">
                {premiumShowcase.subtitle || "منتجات مختارة بعروض قوية وتجربة عرض مرتبة مثل واجهات المتاجر العالمية."}
              </p>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-2 sm:max-w-xl">
            <div className="rounded-2xl border border-white bg-white/75 p-3 shadow-sm backdrop-blur-md">
              <Tag className={`mb-2 h-4 w-4 ${theme.highlight}`} />
              <span className="block text-[10px] font-black text-slate-400">أقوى خصم</span>
              <strong className="mt-1 block font-mono text-base font-black text-slate-950">
                {heroDiscount > 0 ? `${heroDiscount}%` : "مميز"}
              </strong>
            </div>
            <div className="rounded-2xl border border-white bg-white/75 p-3 shadow-sm backdrop-blur-md">
              <Zap className={`mb-2 h-4 w-4 ${theme.highlight}`} />
              <span className="block text-[10px] font-black text-slate-400">وفر</span>
              <strong className="mt-1 block font-mono text-sm font-black text-slate-950">
                {heroSaving > 0 ? `${heroSaving.toLocaleString()} د.ع` : "عرض خاص"}
              </strong>
            </div>
            <div className="rounded-2xl border border-white bg-white/75 p-3 shadow-sm backdrop-blur-md">
              <Star className={`mb-2 h-4 w-4 fill-current ${theme.highlight}`} />
              <span className="block text-[10px] font-black text-slate-400">مختارة</span>
              <strong className="mt-1 block font-mono text-base font-black text-slate-950">
                {rotationProducts.length || discountedProducts.length || 1}
              </strong>
            </div>
          </div>

          <div className="flex flex-col gap-3 sm:flex-row">
            <button
              type="button"
              onClick={() => onSelectProduct(heroProduct)}
              className={`inline-flex items-center justify-center gap-2 rounded-2xl px-5 py-3 text-sm font-black shadow-lg transition-transform hover:-translate-y-0.5 active:translate-y-0 cursor-pointer ${theme.soft}`}
            >
              <Eye className="h-4 w-4" />
              {premiumShowcase.ctaText || "شاهد العرض"}
            </button>
            <button
              type="button"
              onClick={() => onAddToCart(heroProduct)}
              className="inline-flex items-center justify-center gap-2 rounded-2xl border border-slate-200 bg-white px-5 py-3 text-sm font-black text-slate-900 shadow-sm transition-transform hover:-translate-y-0.5 hover:border-slate-300 active:translate-y-0 cursor-pointer"
            >
              <ShoppingBag className="h-4 w-4" />
              أضف للسلة
            </button>
          </div>

          <div className="grid gap-2 sm:max-w-xl sm:grid-cols-3">
            {["أصلي ومضمون", "سعر أقوى", "جاهز للتوصيل"].map((item) => (
              <div key={item} className="flex items-center gap-2 rounded-2xl border border-slate-200/70 bg-white/65 px-3 py-2.5 text-xs font-black text-slate-700 shadow-sm backdrop-blur-md">
                <CheckCircle2 className={`h-4 w-4 flex-shrink-0 ${theme.highlight}`} />
                <span>{item}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="order-1 lg:order-2">
          <div className="relative min-h-[390px] rounded-[30px] border border-white bg-white/70 p-4 shadow-[0_26px_70px_rgba(15,23,42,0.12)] backdrop-blur-md sm:min-h-[470px] sm:p-6 lg:min-h-[540px]">
            <div className="absolute inset-4 rounded-[26px] border border-slate-200/60 bg-[linear-gradient(180deg,rgba(255,255,255,0.96)_0%,rgba(248,250,252,0.78)_100%)]" />
            <div className={`absolute inset-x-10 bottom-12 h-3 rounded-full bg-gradient-to-l ${theme.accent}`} />
            <div className="absolute inset-x-8 bottom-8 h-20 rounded-[28px] border border-white bg-white/80 shadow-[0_18px_55px_rgba(15,23,42,0.12)]" />
            <div className="absolute inset-x-14 bottom-20 h-12 rounded-[100%] bg-slate-300/45 blur-xl" />

            <div
              key={heroProduct.id}
              className="relative z-10 flex h-[300px] items-center justify-center animate-in fade-in-50 slide-in-from-bottom-3 duration-500 sm:h-[370px] lg:h-[420px]"
            >
              <PremiumProductVisual
                product={heroProduct}
                sizeClass="w-40 aspect-[9/18] sm:w-48 lg:w-56"
                imageClassName="max-h-[92%] max-w-[92%] rounded-3xl"
                eager
              />
            </div>

            <div className="relative z-10 mt-3 flex flex-col gap-3 rounded-3xl border border-slate-200 bg-white/90 p-4 shadow-sm sm:flex-row sm:items-center sm:justify-between">
              <div className="min-w-0">
                <div className="mb-1 flex flex-wrap items-center gap-2">
                  <span className={`rounded-full px-2.5 py-1 text-[10px] font-black ${theme.soft}`}>
                    {heroProduct.category}
                  </span>
                  {heroDiscount > 0 && (
                    <span className="rounded-full border border-rose-100 bg-rose-50 px-2.5 py-1 text-[10px] font-black text-rose-600">
                      خصم {heroDiscount}%
                    </span>
                  )}
                </div>
                <h3 className="truncate text-lg font-black text-slate-950 sm:text-xl">
                  {heroProduct.name}
                </h3>
                {heroProduct.nameEn && (
                  <p className="truncate font-mono text-[11px] font-bold uppercase text-slate-400" dir="ltr">
                    {heroProduct.nameEn}
                  </p>
                )}
              </div>

              <div className="flex flex-shrink-0 items-end gap-2 sm:flex-col sm:items-start">
                {hasRealDiscount(heroProduct) && (
                  <span className="font-mono text-xs font-black text-slate-400 line-through">
                    {heroProduct.price.toLocaleString()} د.ع
                  </span>
                )}
                <span className="font-mono text-2xl font-black text-slate-950">
                  {heroPrice.toLocaleString()} د.ع
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {rotationProducts.length > 1 && (
        <div className="relative mt-5 flex items-center justify-center gap-2">
          {rotationProducts.map((product, index) => (
            <button
              key={product.id}
              type="button"
              onClick={() => setActiveIndex(index)}
              className={`h-2 rounded-full transition-all cursor-pointer ${index === safeActiveIndex
                ? `w-9 bg-gradient-to-l ${theme.accent}`
                : "w-2 bg-slate-300 hover:bg-slate-400"
                }`}
              title={product.name}
            />
          ))}
        </div>
      )}

      {supportProducts.length > 0 && (
        <div className="relative mt-6 grid gap-3 md:grid-cols-3">
          {supportProducts.map((product) => {
            const productDiscount = getDiscountPercent(product);
            const productIndex = rotationProducts.findIndex((item) => item.id === product.id);
            return (
              <button
                key={product.id}
                type="button"
                onClick={() => setActiveIndex(Math.max(productIndex, 0))}
                className="group grid min-h-[132px] grid-cols-[96px_1fr] gap-3 rounded-3xl border border-slate-200/80 bg-white/80 p-3 text-right shadow-sm backdrop-blur-md transition-all hover:-translate-y-0.5 hover:border-slate-300 hover:shadow-lg cursor-pointer"
              >
                <div className="relative flex h-full min-h-[108px] items-center justify-center overflow-hidden rounded-2xl border border-slate-100 bg-slate-50">
                  <div className={`absolute inset-x-4 bottom-3 h-1.5 rounded-full bg-gradient-to-l ${theme.accent}`} />
                  <PremiumProductVisual
                    product={product}
                    sizeClass="w-16 aspect-[9/18]"
                    imageClassName="relative z-10 max-h-[82%] max-w-[82%] rounded-xl"
                  />
                </div>

                <div className="flex min-w-0 flex-col justify-between gap-2">
                  <div className="space-y-1">
                    <div className="flex flex-wrap items-center gap-1.5">
                      {productDiscount > 0 ? (
                        <span className="rounded-full bg-rose-50 px-2 py-0.5 text-[9px] font-black text-rose-600">
                          وفر {productDiscount}%
                        </span>
                      ) : (
                        <span className="rounded-full bg-slate-100 px-2 py-0.5 text-[9px] font-black text-slate-500">
                          اختيار مميز
                        </span>
                      )}
                      <span className="rounded-full bg-emerald-50 px-2 py-0.5 text-[9px] font-black text-emerald-700">
                        متوفر
                      </span>
                    </div>
                    <h3 className="line-clamp-2 text-sm font-black leading-5 text-slate-900 group-hover:text-sky-700">
                      {product.name}
                    </h3>
                  </div>

                  <div className="flex items-end justify-between gap-2">
                    <div>
                      {hasRealDiscount(product) && (
                        <span className="block font-mono text-[10px] font-bold text-slate-400 line-through">
                          {product.price.toLocaleString()} د.ع
                        </span>
                      )}
                      <strong className="block font-mono text-sm font-black text-slate-950">
                        {getCurrentPrice(product).toLocaleString()} د.ع
                      </strong>
                    </div>
                    <ArrowLeft className={`h-4 w-4 flex-shrink-0 transition-transform group-hover:-translate-x-1 ${theme.highlight}`} />
                  </div>
                </div>
              </button>
            );
          })}
        </div>
      )}

      <div className="relative mt-5 flex flex-wrap items-center gap-2 text-[10px] font-black text-slate-500">
        <span className="inline-flex items-center gap-1.5 rounded-full border border-slate-200 bg-white/70 px-3 py-1.5">
          <BadgeCheck className={`h-3.5 w-3.5 ${theme.highlight}`} />
          منتجات أصلية
        </span>
        <span className="inline-flex items-center gap-1.5 rounded-full border border-slate-200 bg-white/70 px-3 py-1.5">
          <ShieldCheck className={`h-3.5 w-3.5 ${theme.highlight}`} />
          ضمان حقيقي
        </span>
      </div>
    </section>
  );
}
