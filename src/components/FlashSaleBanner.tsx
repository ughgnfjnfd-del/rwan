"use client";

import React, { useEffect, useState } from "react";
import { useApp, Product } from "@/context/AppContext";
import ProductMockup from "./ProductMockup";
import {
  BadgeCheck,
  CheckCircle2,
  Clock3,
  Flame,
  PackageCheck,
  ShieldCheck,
  ShoppingBag,
  Sparkles,
  Tag,
  Zap,
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
        <div className="scale-[2.05] transition-transform duration-500 sm:scale-[2.45] lg:scale-[2.65]">
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
      className="relative z-10 max-h-[94%] max-w-[96%] rounded-[28px] object-contain drop-shadow-[0_30px_46px_rgba(15,23,42,0.18)]"
    />
  );
}

function TimeBox({ value, label, hot = false }: { value: number; label: string; hot?: boolean }) {
  return (
    <div className="flex min-w-[62px] flex-col items-center">
      <div className={`flex h-14 w-full items-center justify-center rounded-2xl border font-mono text-xl font-black shadow-sm sm:h-16 sm:text-2xl ${hot
        ? "border-red-200 bg-red-600 text-white shadow-red-200/70"
        : "border-slate-200 bg-white text-slate-950"
        }`}>
        {String(value).padStart(2, "0")}
      </div>
      <span className="mt-1 text-[10px] font-black text-slate-400">{label}</span>
    </div>
  );
}

export default function FlashSaleBanner() {
  const { flashSale, products, addToCart } = useApp();
  const [now, setNow] = useState(() => Date.now());

  const product = products.find((p) => p.id === flashSale?.productId);

  useEffect(() => {
    if (!flashSale?.isEnabled || !flashSale.endTime) return;

    const intervalId = window.setInterval(() => {
      setNow(Date.now());
    }, 1000);

    return () => window.clearInterval(intervalId);
  }, [flashSale?.endTime, flashSale?.isEnabled]);

  const timeLeft = (() => {
    if (!flashSale?.endTime) {
      return { days: 0, hours: 0, minutes: 0, seconds: 0, isOver: true };
    }

    const difference = +new Date(flashSale.endTime) - now;
    if (difference <= 0) {
      return { days: 0, hours: 0, minutes: 0, seconds: 0, isOver: true };
    }

    return {
      days: Math.floor(difference / (1000 * 60 * 60 * 24)),
      hours: Math.floor((difference / (1000 * 60 * 60)) % 24),
      minutes: Math.floor((difference / 1000 / 60) % 60),
      seconds: Math.floor((difference / 1000) % 60),
      isOver: false,
    };
  })();

  if (!flashSale || !flashSale.isEnabled || !product || timeLeft.isOver) {
    return null;
  }

  const dealPrice = flashSale.discountPrice > 0 ? flashSale.discountPrice : (product.discountPrice || product.price);
  const discountPercent = Math.max(0, Math.round((1 - (dealPrice / product.price)) * 100));
  const initialStock = Math.max(flashSale.initialStock || flashSale.stockLimit || 1, 1);
  const remainingStock = Math.max(0, flashSale.stockLimit || 0);
  const stockPercent = Math.max(4, Math.min(100, (remainingStock / initialStock) * 100));
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
      className="relative isolate w-full overflow-hidden rounded-[34px] border border-red-100 bg-[linear-gradient(135deg,#ffffff_0%,#fff6f6_38%,#eef8ff_100%)] p-4 text-right shadow-[0_30px_90px_rgba(15,23,42,0.10)] sm:p-6 lg:p-8"
      dir="rtl"
    >
      <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(90deg,rgba(15,23,42,0.045)_1px,transparent_1px),linear-gradient(180deg,rgba(15,23,42,0.035)_1px,transparent_1px)] bg-[size:40px_40px]" />
      <div className="pointer-events-none absolute inset-x-8 top-0 h-px bg-gradient-to-l from-transparent via-white to-transparent" />
      <div className="pointer-events-none absolute inset-x-8 bottom-0 h-px bg-gradient-to-l from-transparent via-red-200 to-transparent" />

      <div className="relative grid gap-6 lg:grid-cols-[0.96fr_1.04fr] lg:items-center">
        <div className="order-1">
          <div className="relative min-h-[360px] rounded-[30px] border border-white bg-white/80 p-4 shadow-[0_26px_70px_rgba(15,23,42,0.12)] backdrop-blur-md sm:min-h-[430px] sm:p-6 lg:min-h-[460px]">
            <div className="absolute inset-4 rounded-[26px] border border-slate-200/70 bg-[linear-gradient(180deg,#ffffff_0%,#f8fafc_100%)]" />
            <div className="absolute left-5 top-5 z-20 inline-flex items-center gap-1.5 rounded-full bg-red-600 px-3 py-1.5 text-[10px] font-black text-white shadow-lg shadow-red-200">
              <Flame className="h-3.5 w-3.5 fill-white" />
              عرض خاطف
            </div>
            <div className="absolute right-5 top-5 z-20 inline-flex items-center gap-1.5 rounded-full border border-slate-200 bg-white px-3 py-1.5 text-[10px] font-black text-slate-800 shadow-sm">
              <Sparkles className="h-3.5 w-3.5 text-sky-500" />
              Deal Studio
            </div>

            <div className="relative z-10 flex h-[285px] items-center justify-center sm:h-[350px] lg:h-[370px]">
              <div className="absolute bottom-4 h-14 w-[82%] rounded-[100%] bg-slate-300/45 blur-2xl" />
              <div className="absolute inset-x-5 bottom-2 h-20 rounded-[28px] border border-white bg-white/85 shadow-[0_18px_50px_rgba(15,23,42,0.12)]" />
              <div className="absolute inset-x-14 bottom-13 h-2 rounded-full bg-gradient-to-l from-red-500 via-sky-400 to-amber-300" />
              <FlashProductVisual product={product} />
            </div>

            <div className="relative z-10 rounded-3xl border border-slate-200 bg-white/95 p-4 shadow-sm">
              <div className="mb-3 flex flex-wrap items-center gap-2">
                <span className="rounded-full bg-slate-950 px-3 py-1 text-[10px] font-black text-white">
                  {product.category}
                </span>
                {discountPercent > 0 && (
                  <span className="rounded-full bg-red-50 px-3 py-1 text-[10px] font-black text-red-600">
                    خصم {discountPercent}%
                  </span>
                )}
              </div>
              <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
                <div className="min-w-0">
                  <h3 className="truncate text-xl font-black text-slate-950 sm:text-2xl">{product.name}</h3>
                  {product.nameEn && (
                    <p className="truncate font-mono text-[11px] font-bold uppercase text-slate-400" dir="ltr">
                      {product.nameEn}
                    </p>
                  )}
                </div>
                <div className="flex flex-shrink-0 items-end gap-2">
                  <span className="font-mono text-xs font-black text-slate-400 line-through">
                    {product.price.toLocaleString()} د.ع
                  </span>
                  <span className="font-mono text-2xl font-black text-slate-950 sm:text-3xl">
                    {dealPrice.toLocaleString()} د.ع
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="order-2 space-y-6 lg:pr-2">
          <div className="space-y-4">
            <span className="inline-flex items-center gap-2 rounded-full border border-red-200 bg-white px-3.5 py-2 text-[11px] font-black text-red-600 shadow-sm">
              <Zap className="h-4 w-4 fill-red-500 text-red-500" />
              الصفقة الاستثنائية لهذا اليوم
            </span>

            <div className="space-y-3">
              <h2 className="max-w-3xl text-3xl font-black leading-tight text-slate-950 sm:text-4xl lg:text-5xl">
                خصم محدود يخلي {product.name} بطل العرض
              </h2>
              <p className="max-w-2xl text-sm font-bold leading-7 text-slate-500">
                {product.description || "عرض قوي لفترة قصيرة، صورة واضحة، سعر مباشر، وكمية محدودة حتى يحس الزبون أن الفرصة أمامه الآن."}
              </p>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-2 sm:max-w-2xl">
            <div className="min-h-[96px] rounded-2xl border border-white bg-white/80 p-3 shadow-sm">
              <Tag className="mb-2 h-4 w-4 text-red-600" />
              <span className="block text-[10px] font-black text-slate-400">وفر</span>
              <strong className="mt-1 block font-mono text-base font-black text-slate-950">
                {(product.price - dealPrice).toLocaleString()} د.ع
              </strong>
            </div>
            <div className="min-h-[96px] rounded-2xl border border-white bg-white/80 p-3 shadow-sm">
              <PackageCheck className="mb-2 h-4 w-4 text-emerald-600" />
              <span className="block text-[10px] font-black text-slate-400">متبقي</span>
              <strong className="mt-1 block font-mono text-base font-black text-slate-950">
                {remainingStock} قطع
              </strong>
            </div>
            <div className="min-h-[96px] rounded-2xl border border-white bg-white/80 p-3 shadow-sm">
              <Clock3 className="mb-2 h-4 w-4 text-sky-600" />
              <span className="block text-[10px] font-black text-slate-400">ينتهي خلال</span>
              <strong className="mt-1 block text-sm font-black leading-5 text-slate-950 sm:text-base">
                {endsInPrimary}
              </strong>
              <span className="block text-[10px] font-black leading-4 text-sky-600">
                و {endsInSecondary}
              </span>
            </div>
          </div>

          <div className="rounded-[28px] border border-slate-200 bg-white/82 p-4 shadow-sm backdrop-blur-md sm:p-5">
            <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
              <div className="flex items-center gap-2 text-sm font-black text-slate-900">
                <Flame className="h-5 w-5 fill-red-500 text-red-500" />
                الوقت المتبقي للصفقة
              </div>
              <span className="rounded-full bg-red-50 px-3 py-1 text-[10px] font-black text-red-600">
                الكمية محدودة
              </span>
            </div>

            <div className="grid grid-cols-4 gap-2">
              <TimeBox value={timeLeft.days} label="يوم" />
              <TimeBox value={timeLeft.hours} label="ساعة" />
              <TimeBox value={timeLeft.minutes} label="دقيقة" />
              <TimeBox value={timeLeft.seconds} label="ثانية" hot />
            </div>

            <div className="mt-5 space-y-2">
              <div className="flex items-center justify-between text-[11px] font-black">
                <span className="text-red-600">متبقي {remainingStock} قطع فقط</span>
                <span className="text-slate-400">من أصل {initialStock}</span>
              </div>
              <div className="h-3 overflow-hidden rounded-full bg-slate-100">
                <div
                  className="h-full rounded-full bg-gradient-to-l from-red-600 via-orange-400 to-sky-400 transition-all duration-500"
                  style={{ width: `${stockPercent}%` }}
                />
              </div>
            </div>
          </div>

          <div className="flex flex-col gap-3 sm:flex-row">
            <button
              onClick={() => addToCart({ ...product, price: dealPrice, discountPrice: null })}
              className="inline-flex items-center justify-center gap-2 rounded-2xl bg-slate-950 px-6 py-3.5 text-sm font-black text-white shadow-xl shadow-slate-300/70 transition-transform hover:-translate-y-0.5 hover:bg-slate-800 active:translate-y-0 cursor-pointer"
            >
              <ShoppingBag className="h-4 w-4" />
              احجز السعر الآن
            </button>
            <div className="grid flex-1 grid-cols-3 gap-2">
              {[
                { label: "أصلي", icon: BadgeCheck, color: "text-emerald-600" },
                { label: "ضمان", icon: ShieldCheck, color: "text-sky-600" },
                { label: "متوفر", icon: CheckCircle2, color: "text-red-600" },
              ].map((item) => (
                <div key={item.label} className="flex items-center justify-center gap-1.5 rounded-2xl border border-slate-200 bg-white px-2 py-3 text-[10px] font-black text-slate-700 shadow-sm">
                  <item.icon className={`h-3.5 w-3.5 ${item.color}`} />
                  {item.label}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
