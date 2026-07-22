"use client";

/* eslint-disable @next/next/no-img-element */

import React, { useEffect, useMemo, useState } from "react";
import {
  ArrowLeft,
  BadgeCheck,
  Cpu,
  Maximize2,
  Minus,
  PackageCheck,
  Palette,
  Plus,
  Share2,
  ShieldCheck,
  ShoppingBag,
  Sparkles,
  Star,
  Truck,
  X,
} from "lucide-react";
import { Product } from "@/context/AppContext";
import ProductMockup from "@/components/ProductMockup";

interface ProductFocusModalProps {
  product: Product;
  isOpen: boolean;
  onClose: () => void;
  onAddToCart: (
    product: Product,
    selectedColor?: { name: string; hex: string; image?: string | null } | null,
    selectedPort?: string | null,
  ) => void;
}

type ProductTab = "overview" | "specs" | "warranty";

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

function ProductVisual({ image, name }: { image: string; name: string }) {
  const isPreset = presetImages.includes(image) || image.startsWith("charger-");
  if (isPreset) {
    return (
      <div className="scale-[1.75] sm:scale-[2.2] lg:scale-[2.65]">
        <ProductMockup image={image} name={name} sizeClass="w-28 aspect-[9/18]" />
      </div>
    );
  }

  return (
    <img
      src={image}
      alt={name}
      className="max-h-[78%] max-w-[82%] object-contain mix-blend-multiply drop-shadow-[0_34px_34px_rgba(15,23,42,0.2)] transition-transform duration-500 group-hover:scale-[1.025]"
    />
  );
}

export default function ProductFocusModal({ product, isOpen, onClose, onAddToCart }: ProductFocusModalProps) {
  const [qty, setQty] = useState(1);
  const [selectedColor, setSelectedColor] = useState<{ name: string; hex: string; image?: string | null } | null>(
    () => product.colors?.length === 1 ? product.colors[0] : null,
  );
  const [selectedPort, setSelectedPort] = useState<string | null>(
    () => product.ports?.length === 1 ? product.ports[0] : null,
  );
  const [activeTab, setActiveTab] = useState<ProductTab>("overview");
  const [isInspecting, setIsInspecting] = useState(false);
  const [shareStatus, setShareStatus] = useState("");

  useEffect(() => {
    if (!isOpen) return;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        if (isInspecting) setIsInspecting(false);
        else onClose();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [isInspecting, isOpen, onClose]);

  const currentPrice = product.discountPrice || product.price;
  const discountPercent = product.discountPrice && product.discountPrice < product.price
    ? Math.round((1 - product.discountPrice / product.price) * 100)
    : 0;
  const selectedImage = selectedColor?.image || product.image;
  const needsColor = Boolean(product.colors && product.colors.length > 1 && !selectedColor);
  const needsPort = Boolean(product.ports && product.ports.length > 1 && !selectedPort);
  const selectionMissing = needsColor || needsPort;

  const description = product.description || (
    product.category === "موبايلات"
      ? "هاتف ذكي بأداء قوي وكاميرات متقدمة وبطارية مصممة للاستخدام اليومي الطويل."
      : product.category === "ملحقات"
        ? "ملحق مختار بعناية ليقدم توافقاً جيداً واستخداماً مستقراً مع أجهزتك."
        : "منتج مفحوص ومختار من مركز الروان ليقدم أداءً مستقراً وجودة موثوقة."
  );

  const specifications = useMemo(() => {
    if (product.specs) return product.specs.split("\n").map((item) => item.trim()).filter(Boolean);
    if (product.image.startsWith("charger-")) {
      return ["تقنية شحن سريع PD", "منفذ USB-C", "حماية من الحرارة والجهد الزائد", "ضمان مركز الروان"];
    }
    if (["iphone", "samsung"].includes(product.image)) {
      return ["شاشة عالية الوضوح", "معالج سريع للاستخدام اليومي", "نظام كاميرات متقدم", "مقاومة للماء والغبار حسب مواصفات المنتج"];
    }
    return ["مواد تصنيع مختارة", "تصميم خفيف وسهل الاستخدام", "توافق واسع", "ضمان الجودة من مركز الروان"];
  }, [product.image, product.specs]);

  const overviewDetails = product.specs ? specifications.slice(0, 3) : [];

  if (!isOpen) return null;

  const addSelectedQuantity = () => {
    if (selectionMissing || product.isOutOfStock) return false;
    for (let index = 0; index < qty; index += 1) onAddToCart(product, selectedColor, selectedPort);
    return true;
  };

  const handleAddToCart = () => {
    if (!addSelectedQuantity()) return;
    onClose();
  };

  const handleBuyNow = () => {
    if (!addSelectedQuantity()) return;
    onClose();
    window.setTimeout(() => window.dispatchEvent(new Event("buy-now")), 0);
  };

  const handleShare = async () => {
    const url = new URL(window.location.href);
    url.searchParams.set("product", product.id);
    const shareData = { title: product.name, text: `${product.name} - مركز الروان`, url: url.toString() };
    try {
      const canShare = typeof navigator.share === "function";
      if (canShare) await navigator.share(shareData);
      else await navigator.clipboard.writeText(url.toString());
      setShareStatus(canShare ? "تمت المشاركة" : "تم نسخ الرابط");
      window.setTimeout(() => setShareStatus(""), 1800);
    } catch {
      setShareStatus("");
    }
  };

  const productTint = selectedColor?.hex && /^#[0-9a-f]{6}$/i.test(selectedColor.hex)
    ? `color-mix(in srgb, ${selectedColor.hex} 11%, #f4f6f8)`
    : "#f4f6f8";

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/70 backdrop-blur-md sm:items-center sm:p-4" dir="rtl">
      <button className="absolute inset-0 cursor-default" onClick={onClose} aria-label="إغلاق تفاصيل المنتج" />

      <section
        role="dialog"
        aria-modal="true"
        aria-labelledby="product-focus-title"
        className="relative z-10 grid h-[100dvh] w-full overflow-hidden bg-white shadow-[0_35px_100px_rgba(0,0,0,0.35)] sm:h-[94vh] sm:max-w-7xl sm:rounded-[24px] lg:grid-cols-[1.08fr_0.92fr]"
      >
        <div className="relative flex min-h-[42vh] flex-col overflow-hidden border-b border-slate-200 lg:min-h-0 lg:border-b-0 lg:border-l" style={{ background: productTint }}>
          <div className="relative z-20 flex items-center justify-between p-4 sm:p-6">
            <span className="inline-flex items-center gap-2 text-[10px] font-black text-slate-500">
              <Sparkles className="h-4 w-4 text-cyan-600" />
              PRODUCT FOCUS
            </span>
            <div className="flex items-center gap-2">
              <button onClick={handleShare} className="flex h-10 w-10 items-center justify-center rounded-full border border-slate-200 bg-white/80 text-slate-600 shadow-sm backdrop-blur-md transition-colors hover:text-slate-950 cursor-pointer" title="مشاركة المنتج" aria-label="مشاركة المنتج">
                <Share2 className="h-4 w-4" />
              </button>
              <button onClick={onClose} className="flex h-10 w-10 items-center justify-center rounded-full border border-slate-200 bg-white/80 text-slate-600 shadow-sm backdrop-blur-md transition-colors hover:text-slate-950 cursor-pointer" title="إغلاق" aria-label="إغلاق">
                <X className="h-5 w-5" />
              </button>
            </div>
          </div>

          {shareStatus && <span className="absolute left-6 top-17 z-30 rounded-full bg-slate-950 px-3 py-1.5 text-[10px] font-black text-white">{shareStatus}</span>}

          <button
            onClick={() => setIsInspecting(true)}
            className="group relative flex flex-1 items-center justify-center overflow-hidden p-6 cursor-zoom-in"
            aria-label="تكبير صورة المنتج"
          >
            <span className="pointer-events-none absolute text-[7rem] font-black text-slate-950/[0.035] sm:text-[11rem]" dir="ltr">RWAN</span>
            <div className="relative flex h-[260px] w-full max-w-[610px] items-center justify-center sm:h-[430px] lg:h-[560px]">
              <div className="absolute bottom-12 h-12 w-2/3 rounded-[100%] bg-slate-500/25 blur-2xl" />
              <ProductVisual image={selectedImage} name={product.name} />
            </div>
            <span className="absolute bottom-5 left-5 inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white/80 px-3 py-2 text-[10px] font-black text-slate-700 shadow-sm backdrop-blur-md">
              <Maximize2 className="h-3.5 w-3.5" />
              فحص الصورة
            </span>
          </button>

          <div className="relative z-20 flex flex-wrap items-center justify-center gap-x-5 gap-y-2 border-t border-slate-200/80 bg-white/45 px-4 py-4 backdrop-blur-md">
            <span className="inline-flex items-center gap-2 text-[10px] font-black text-slate-700"><BadgeCheck className="h-4 w-4 text-emerald-600" />منتج أصلي</span>
            <span className="inline-flex items-center gap-2 text-[10px] font-black text-slate-700"><ShieldCheck className="h-4 w-4 text-cyan-700" />ضمان موثق</span>
            <span className="inline-flex items-center gap-2 text-[10px] font-black text-slate-700"><PackageCheck className="h-4 w-4 text-amber-600" />{product.isOutOfStock ? "غير متوفر" : "متوفر الآن"}</span>
          </div>
        </div>

        <div className="relative flex min-h-0 flex-col bg-white">
          <div className="min-h-0 flex-1 overflow-y-auto p-5 pb-44 sm:p-7 sm:pb-44 lg:p-9 lg:pb-48">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <span className="rounded-full bg-slate-100 px-3 py-1.5 text-[10px] font-black text-slate-600">{product.category}</span>
              <span className="inline-flex items-center gap-1.5 text-xs font-black text-slate-700">
                <Star className="h-4 w-4 fill-amber-400 text-amber-400" />
                {(product.rating || 5).toFixed(1)}
                <span className="font-bold text-slate-400">({product.reviewsCount || 24})</span>
              </span>
            </div>

            <div className="mt-5">
              <h2 id="product-focus-title" className="text-3xl font-black leading-tight text-slate-950 sm:text-4xl">{product.name}</h2>
              {product.nameEn && <p className="mt-2 text-xs font-black uppercase text-slate-400" dir="ltr">{product.nameEn}</p>}
            </div>

            <div className="mt-7 flex rounded-full bg-slate-100 p-1" role="tablist" aria-label="معلومات المنتج">
              {([
                { id: "overview", label: "نظرة عامة" },
                { id: "specs", label: "المواصفات" },
                { id: "warranty", label: "الضمان" },
              ] as Array<{ id: ProductTab; label: string }>).map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  role="tab"
                  aria-selected={activeTab === tab.id}
                  className={`min-h-10 flex-1 rounded-full px-3 text-[11px] font-black transition-all cursor-pointer ${activeTab === tab.id ? "bg-white text-slate-950 shadow-sm" : "text-slate-500 hover:text-slate-800"}`}
                >
                  {tab.label}
                </button>
              ))}
            </div>

            <div className="mt-7 min-h-48">
              {activeTab === "overview" && (
                <div>
                  <p className="text-sm font-semibold leading-7 text-slate-500">{description}</p>
                  {overviewDetails.length > 0 && (
                    <div className="mt-6 border-y border-slate-200">
                      <div className="flex items-center justify-between border-b border-slate-200 py-3">
                        <span className="text-[10px] font-black text-slate-400">مختصر المواصفات</span>
                        <span className="font-mono text-[9px] font-black text-cyan-700">QUICK READ</span>
                      </div>
                      <div className="divide-y divide-slate-200">
                        {overviewDetails.map((detail, index) => (
                          <div key={`${detail}-${index}`} className="grid grid-cols-[28px_1fr] items-start gap-3 py-4">
                            <span className="pt-0.5 font-mono text-[10px] font-black text-cyan-700">{String(index + 1).padStart(2, "0")}</span>
                            <span className="text-xs font-semibold leading-6 text-slate-600">{detail}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}

              {activeTab === "specs" && (
                <div className="divide-y divide-slate-200 border-y border-slate-200">
                  {specifications.slice(0, 8).map((spec, index) => (
                    <div key={`${spec}-${index}`} className="flex items-start gap-3 py-4">
                      <span className="mt-0.5 font-mono text-[10px] font-black text-cyan-700">{String(index + 1).padStart(2, "0")}</span>
                      <span className="text-xs font-bold leading-6 text-slate-600">{spec}</span>
                    </div>
                  ))}
                </div>
              )}

              {activeTab === "warranty" && (
                <div className="space-y-5">
                  <div className="flex items-start gap-4 border-b border-slate-200 pb-5">
                    <ShieldCheck className="h-6 w-6 flex-shrink-0 text-cyan-700" />
                    <div><h3 className="text-sm font-black text-slate-950">ضمان مركز الروان</h3><p className="mt-2 text-xs font-semibold leading-6 text-slate-500">تفاصيل الضمان تعتمد على نوع المنتج وتُثبت في فاتورة الشراء. نوضح لك المدة والشروط قبل إكمال الطلب.</p></div>
                  </div>
                  <div className="flex items-start gap-4 border-b border-slate-200 pb-5">
                    <Truck className="h-6 w-6 flex-shrink-0 text-emerald-700" />
                    <div><h3 className="text-sm font-black text-slate-950">التوصيل حسب منطقتك</h3><p className="mt-2 text-xs font-semibold leading-6 text-slate-500">تُحسب كلفة ومدة التوصيل بعد إدخال العنوان، بدون وعود زمنية غير مؤكدة.</p></div>
                  </div>
                </div>
              )}
            </div>

            {product.colors && product.colors.length > 0 && (
              <div className="mt-8 border-t border-slate-200 pt-6">
                <div className="flex items-center justify-between gap-3">
                  <span className="inline-flex items-center gap-2 text-xs font-black text-slate-900"><Palette className="h-4 w-4" />اللون</span>
                  <span className={`text-[10px] font-black ${needsColor ? "text-rose-600" : "text-slate-500"}`}>{selectedColor?.name || "اختر لوناً"}</span>
                </div>
                <div className="mt-4 flex flex-wrap gap-3">
                  {product.colors.map((color) => {
                    const selected = selectedColor?.name === color.name;
                    return (
                      <button key={color.name} onClick={() => setSelectedColor(color)} className={`group inline-flex min-h-11 items-center gap-2 rounded-full border px-3 transition-all cursor-pointer ${selected ? "border-slate-950 bg-slate-950 text-white" : "border-slate-200 text-slate-600 hover:border-slate-400"}`}>
                        <span className="h-6 w-6 rounded-full border border-black/10" style={{ backgroundColor: color.hex }} />
                        <span className="text-[10px] font-black">{color.name}</span>
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {product.ports && product.ports.length > 0 && (
              <div className="mt-7 border-t border-slate-200 pt-6">
                <div className="flex items-center justify-between gap-3">
                  <span className="inline-flex items-center gap-2 text-xs font-black text-slate-900"><Cpu className="h-4 w-4" />نوع المنفذ</span>
                  <span className={`text-[10px] font-black ${needsPort ? "text-rose-600" : "text-slate-500"}`}>{selectedPort || "اختر منفذاً"}</span>
                </div>
                <div className="mt-4 flex flex-wrap gap-2">
                  {product.ports.map((port) => (
                    <button key={port} onClick={() => setSelectedPort(port)} className={`min-h-11 rounded-full border px-5 text-[11px] font-black transition-all cursor-pointer ${selectedPort === port ? "border-slate-950 bg-slate-950 text-white" : "border-slate-200 text-slate-600 hover:border-slate-400"}`}>{port}</button>
                  ))}
                </div>
              </div>
            )}
          </div>

          <div className="absolute inset-x-0 bottom-0 z-30 border-t border-slate-200 bg-white/94 p-4 shadow-[0_-18px_45px_rgba(15,23,42,0.08)] backdrop-blur-xl sm:p-5">
            <div className="flex items-end justify-between gap-4">
              <div>
                <span className="block text-[9px] font-black text-slate-400">سعر اليوم</span>
                <div className="mt-1 flex flex-wrap items-baseline gap-2">
                  <strong className="font-mono text-2xl font-black text-slate-950">{(currentPrice * qty).toLocaleString()}</strong>
                  <span className="text-[10px] font-black text-slate-500">د.ع</span>
                  {discountPercent > 0 && <span className="rounded-full bg-rose-50 px-2 py-1 text-[9px] font-black text-rose-600">-{discountPercent}%</span>}
                </div>
              </div>
              <div className="flex h-11 items-center rounded-full border border-slate-200 bg-slate-50">
                <button onClick={() => setQty((value) => Math.max(1, value - 1))} className="flex h-full w-10 items-center justify-center text-slate-600 cursor-pointer" aria-label="تقليل الكمية"><Minus className="h-4 w-4" /></button>
                <span className="w-9 text-center font-mono text-xs font-black">{qty}</span>
                <button onClick={() => setQty((value) => value + 1)} className="flex h-full w-10 items-center justify-center text-slate-600 cursor-pointer" aria-label="زيادة الكمية"><Plus className="h-4 w-4" /></button>
              </div>
            </div>

            {selectionMissing && <p className="mt-2 text-[10px] font-black text-rose-600">{needsColor ? "اختر اللون قبل المتابعة" : "اختر نوع المنفذ قبل المتابعة"}</p>}

            <div className="mt-4 grid grid-cols-[1fr_auto] gap-2 sm:grid-cols-2">
              <button
                onClick={handleAddToCart}
                disabled={selectionMissing || product.isOutOfStock}
                className="inline-flex min-h-12 items-center justify-center gap-2 rounded-full border border-slate-300 bg-white px-4 text-xs font-black text-slate-900 transition-all hover:border-slate-950 disabled:cursor-not-allowed disabled:bg-slate-100 disabled:text-slate-400 cursor-pointer"
              >
                <ShoppingBag className="h-4 w-4" />
                <span className="hidden sm:inline">أضف للسلة</span>
              </button>
              <button
                onClick={handleBuyNow}
                disabled={selectionMissing || product.isOutOfStock}
                className="inline-flex min-h-12 items-center justify-center gap-2 rounded-full bg-slate-950 px-6 text-xs font-black text-white shadow-lg transition-all hover:bg-slate-800 active:scale-[0.99] disabled:cursor-not-allowed disabled:bg-slate-300 cursor-pointer"
              >
                {product.isOutOfStock ? "نفذ من المخزون" : "شراء مباشر"}
                {!product.isOutOfStock && <ArrowLeft className="h-4 w-4" />}
              </button>
            </div>
          </div>
        </div>

        {isInspecting && (
          <div className="fixed inset-0 z-[70] flex items-center justify-center bg-white p-4 sm:p-10">
            <button onClick={() => setIsInspecting(false)} className="absolute left-5 top-5 flex h-11 w-11 items-center justify-center rounded-full border border-slate-200 bg-white text-slate-700 shadow-sm cursor-pointer" aria-label="إغلاق فحص الصورة"><X className="h-5 w-5" /></button>
            <span className="absolute right-5 top-6 text-[10px] font-black text-slate-400">اسحب بصرياً وتفحّص التفاصيل</span>
            <div className="group flex h-full w-full max-w-6xl items-center justify-center overflow-auto">
              <div className="flex min-h-[600px] min-w-[600px] items-center justify-center">
                <ProductVisual image={selectedImage} name={product.name} />
              </div>
            </div>
          </div>
        )}
      </section>
    </div>
  );
}
