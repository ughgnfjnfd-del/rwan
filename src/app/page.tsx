"use client";

import React, { useState, useEffect } from "react";
import {
  Search,
  Heart,
  ShoppingBag,
  Menu,
  X,
  Smartphone,
  Headphones,
  Cpu,
  Wrench,
  ChevronRight,
  Shield,
  Star,
  Phone,
  MapPin,
  Clock,
  ThumbsUp,
  Lock,
  Zap,
  Cable,
  Eye,
  BadgeCheck,
  CheckCircle2,
  Palette,
  PackageCheck,
  ShieldCheck,
  Sparkles
} from "lucide-react";
import CartDrawer from "@/components/CartDrawer";
import RepairModal from "@/components/RepairModal";
import CheckoutModal from "@/components/CheckoutModal";
import WishlistDrawer from "@/components/WishlistDrawer";
import PromoCarousel from "@/components/PromoCarousel";
import Link from "next/link";
import { useApp, Product, CartItem } from "@/context/AppContext";

import ProductMockup from "@/components/ProductMockup";
import MarqueeTicker from "@/components/MarqueeTicker";
import FlashSaleBanner from "@/components/FlashSaleBanner";
import BundlesSection from "@/components/BundlesSection";
import PromoPopUp from "@/components/PromoPopUp";

const getProductHighlights = (product: Product) => {
  if (product.image.startsWith("charger-")) {
    return ["شحن سريع", "USB-C", "حماية ذكية"];
  }
  if (product.image === "iphone" || product.image === "samsung" || product.category === "موبايلات") {
    return ["أداء قوي", "كاميرا ممتازة", "شاشة واضحة"];
  }
  if (["سماعات", "ملحقات"].includes(product.category) || product.image === "earbuds" || product.image === "headphones") {
    return ["جودة أصلية", "استخدام مريح", "توافق عالي"];
  }
  if (product.image === "cases" || product.image === "screen-protector") {
    return ["حماية يومية", "شكل أنيق", "تركيب مناسب"];
  }
  return ["جودة مضمونة", "اختيار موثوق", "جاهز للتسليم"];
};

const getDiscountPercent = (product: Product) => (
  product.discountPrice && product.discountPrice > 0
    ? Math.round((1 - (product.discountPrice / product.price)) * 100)
    : 0
);

const isPresetProductVisual = (image: string) => (
  ["iphone", "samsung", "cases", "headphones", "earbuds", "cable", "smartwatch", "powerbank", "screen-protector"].includes(image) ||
  image.startsWith("charger-")
);

function ProductShowroomVisual({
  image,
  name,
  sizeClass = "w-24 aspect-[9/18]",
  imageClassName = "max-h-[78%] max-w-[78%]",
}: {
  image: string;
  name: string;
  sizeClass?: string;
  imageClassName?: string;
}) {
  if (isPresetProductVisual(image)) {
    return <ProductMockup image={image} name={name} sizeClass={sizeClass} />;
  }

  return (
    <img
      src={image}
      alt={name}
      className={`${imageClassName} object-contain mix-blend-multiply drop-shadow-[0_26px_28px_rgba(15,23,42,0.18)] transition-transform duration-500 group-hover:scale-105`}
    />
  );
}

interface ProductDetailModalProps {
  product: Product;
  isOpen: boolean;
  onClose: () => void;
  onAddToCart: (product: Product, selectedColor?: { name: string; hex: string; image?: string | null } | null) => void;
  allProducts: Product[];
  onSelectProduct: (product: Product) => void;
}

function ProductDetailModal({ product, isOpen, onClose, onAddToCart, allProducts, onSelectProduct }: ProductDetailModalProps) {
  const [qty, setQty] = useState(1);
  const [selectedColor, setSelectedColor] = useState<{ name: string; hex: string; image?: string | null } | null>(
    () => product.colors?.[0] || null
  );

  // Lock body scroll when modal is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }
    return () => {
      document.body.style.overflow = "unset";
    };
  }, [isOpen]);

  if (!isOpen) return null;

  const isPreset = ["iphone", "samsung", "cases", "headphones", "earbuds", "cable", "smartwatch", "powerbank", "screen-protector"].includes(product.image) || product.image.startsWith("charger-");

  // Generate default description based on categories/image presets
  const defaultDesc = product.description || (
    product.category === "موبايلات"
      ? `هاتف ذكي راقٍ يتميز بأقوى أداء وكاميرات احترافية مع بطارية تدوم طويلاً وتصميم فاخر مقاوم للصدمات.`
      : product.category === "ملحقات"
        ? `ملحق أصلي ذو جودة عالية مصمم خصيصاً ليتناسب مع جهازك ويوفر له الكفاءة المثالية والاستخدام الطويل.`
        : `قطعة غيار أصلية ومضمونة توفر لجهازك الأداء المثالي للتشغيل والاستقرار.`
  );

  // Generate default specifications
  const defaultSpecs = product.specs ? product.specs.split("\n") : (
    product.image.startsWith("charger-")
      ? [
        "قوة الشحن الفائقة والذكية",
        "منفذ USB-C قوي يدعم تقنية الشحن السريع PD",
        "حماية متكاملة ضد الجهد الزائد وحرارة الشحن",
        "ضمان حقيقي لمدة 6 أشهر من الوكيل"
      ]
      : product.image === "iphone" || product.image === "samsung"
        ? [
          "شاشة أوليد فائقة الوضوح مع تردد 120 هرتز",
          "معالج متطور يدعم تقنيات الذكاء الاصطناعي والألعاب القوية",
          "نظام كاميرات ثلاثي العدسات بتقريب بصري ممتاز",
          "مقاومة كاملة للماء والغبار بمعيار IP68"
        ]
        : [
          "جودة تصنيع ممتازة بمواد صديقة للبيئة",
          "تصميم عصري وخفيف الوزن لسهولة الاستخدام",
          "توافق كامل مع مختلف الأجهزة والأنظمة",
          "ضمان الجودة والأداء المثالي من مركز الروان"
        ]
  );

  // Simulated Customer Reviews
  const reviews = [
    { name: "حيدر الجبوري", rating: 5, comment: "ممتاز جداً وأصلي 100%، الشحن كان سريع وتغليف رائع.", date: "منذ يومين" },
    { name: "فاطمة الموسوي", rating: 4.8, comment: "الجودة عالية جداً ويستحق السعر، خدمة العملاء سريعة بالرد.", date: "منذ أسبوع" }
  ];

  // Related products (same category, excluding current)
  const related = allProducts
    .filter((p) => p.category === product.category && p.id !== product.id)
    .slice(0, 3);
  const highlights = getProductHighlights(product);
  const discountPercent = getDiscountPercent(product);
  const currentPrice = product.discountPrice || product.price;
  const colorCount = product.colors?.length || 0;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5" dir="rtl">
      <div className="fixed inset-0 bg-black/65 backdrop-blur-md transition-opacity" onClick={onClose}></div>

      <div className="relative z-10 grid w-full max-w-6xl max-h-[92vh] overflow-y-auto rounded-[28px] border border-white/20 bg-white shadow-2xl animate-in fade-in-50 zoom-in-95 duration-200 lg:grid-cols-[0.95fr_1.05fr]">
        <button
          onClick={onClose}
          className="absolute top-4 left-4 z-30 flex h-10 w-10 items-center justify-center rounded-full border border-white/20 bg-white/90 text-slate-500 shadow-sm backdrop-blur-md transition-all hover:bg-white hover:text-slate-900 cursor-pointer"
          title="إغلاق"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="relative min-h-[360px] overflow-hidden bg-gradient-to-b from-white via-sky-50/70 to-slate-100 p-5 sm:p-8 lg:min-h-full">
          <div className="absolute inset-0 bg-[linear-gradient(135deg,rgba(14,165,233,0.08)_0_1px,transparent_1px_28px)] opacity-60" />
          <div className="absolute inset-x-8 top-8 h-px bg-gradient-to-l from-transparent via-sky-200 to-transparent" />
          <div className="absolute inset-x-8 bottom-8 h-px bg-gradient-to-l from-transparent via-emerald-200 to-transparent" />

          <div className="relative z-10 flex min-h-[320px] flex-col justify-between gap-5 lg:min-h-[620px]">
            <div className="flex items-center justify-between gap-3">
              <span className="inline-flex items-center gap-2 rounded-lg border border-sky-200 bg-white/80 px-3 py-1.5 text-[10px] font-extrabold text-sky-700 shadow-sm backdrop-blur-md">
                <Sparkles className="h-3.5 w-3.5" />
                معرض المنتج
              </span>
              {isPreset && (
                <span className="rounded-lg border border-slate-200 bg-white/80 px-3 py-1.5 font-mono text-[9px] font-black uppercase text-slate-500 shadow-sm backdrop-blur-md">
                  {product.image}
                </span>
              )}
            </div>

            <div className="flex flex-1 items-center justify-center py-8">
              <div className="group relative flex h-[285px] w-full max-w-[430px] items-center justify-center sm:h-[360px]">
                <div className="absolute inset-x-4 top-0 h-14 rounded-2xl border border-white bg-white/70 shadow-[0_20px_60px_rgba(14,165,233,0.12)] backdrop-blur-md" />
                <div className="absolute bottom-10 h-12 w-[78%] rounded-[100%] bg-slate-300/45 blur-2xl" />
                <div className="absolute bottom-0 h-20 w-[86%] rounded-[32px] border border-white bg-white/80 shadow-[0_24px_70px_rgba(15,23,42,0.14)] backdrop-blur-md" />
                <div className="absolute bottom-9 h-2 w-[56%] rounded-full bg-gradient-to-l from-sky-300 via-white to-emerald-200" />

                <div className={`${isPreset ? "scale-[1.55] sm:scale-[1.9]" : "h-full w-full"} relative z-10 flex items-center justify-center transition-transform duration-500 group-hover:-translate-y-1`}>
                  <ProductShowroomVisual
                    image={selectedColor?.image || product.image}
                    name={product.name}
                    sizeClass="w-32 aspect-[9/18]"
                    imageClassName="max-h-[76%] max-w-[76%] rounded-2xl"
                  />
                </div>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-2">
              <div className="rounded-xl border border-slate-200 bg-white/80 p-3 text-center shadow-sm backdrop-blur-md">
                <BadgeCheck className="mx-auto mb-1 h-4 w-4 text-emerald-300" />
                <span className="text-[10px] font-extrabold text-slate-800">أصلي</span>
              </div>
              <div className="rounded-xl border border-slate-200 bg-white/80 p-3 text-center shadow-sm backdrop-blur-md">
                <ShieldCheck className="mx-auto mb-1 h-4 w-4 text-sky-300" />
                <span className="text-[10px] font-extrabold text-slate-800">ضمان</span>
              </div>
              <div className="rounded-xl border border-slate-200 bg-white/80 p-3 text-center shadow-sm backdrop-blur-md">
                <PackageCheck className="mx-auto mb-1 h-4 w-4 text-amber-300" />
                <span className="text-[10px] font-extrabold text-slate-800">متوفر</span>
              </div>
            </div>
          </div>
        </div>

        <div className="flex flex-col gap-6 p-5 text-right sm:p-8">
          <div className="space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <span className="inline-flex items-center rounded-lg bg-accent/10 px-3 py-1.5 text-xs font-black text-accent">
                {product.category}
              </span>
              <div className="flex items-center gap-1.5 text-amber-500">
                <Star className="w-4 h-4 fill-amber-500" />
                <span className="text-xs font-black text-slate-700">
                  {(product.rating || 5).toFixed(1)}
                </span>
                <span className="text-[11px] font-bold text-slate-400">
                  ({product.reviewsCount || 24} تقييم)
                </span>
              </div>
            </div>

            <div className="space-y-2">
              <h2 className="text-2xl font-black leading-tight text-slate-950 sm:text-3xl">
                {product.name}
              </h2>
              {product.nameEn && (
                <p className="text-xs font-bold uppercase tracking-wide text-slate-400" dir="ltr">
                  {product.nameEn}
                </p>
              )}
            </div>

            <div className="grid grid-cols-3 gap-2">
              {highlights.map((item) => (
                <div key={item} className="rounded-xl border border-slate-100 bg-slate-50 px-3 py-2.5">
                  <CheckCircle2 className="mb-1 h-4 w-4 text-emerald-500" />
                  <span className="block text-[11px] font-black leading-4 text-slate-700">{item}</span>
                </div>
              ))}
            </div>
          </div>

          {product.colors && product.colors.length > 0 && (
            <div className="space-y-3 rounded-2xl border border-slate-100 bg-white p-4 shadow-sm">
              <div className="flex items-center justify-between gap-3">
                <span className="inline-flex items-center gap-2 text-xs font-black text-slate-800">
                  <Palette className="h-4 w-4 text-slate-500" />
                  اختر اللون
                </span>
                <span className="rounded-lg bg-slate-100 px-3 py-1 text-[11px] font-black text-slate-700">
                  {selectedColor?.name || `${colorCount} ألوان`}
                </span>
              </div>

              <div className="flex flex-wrap gap-3">
                {product.colors.map((color, idx) => {
                  const isSelected = selectedColor?.name === color.name;
                  return (
                    <button
                      key={idx}
                      onClick={() => setSelectedColor(color)}
                      className={`relative h-10 w-10 rounded-full p-0.5 transition-all duration-300 active:scale-95 cursor-pointer ${isSelected
                        ? "ring-2 ring-slate-900 ring-offset-2 scale-110 shadow-md"
                        : "border border-slate-200 hover:scale-105 hover:border-slate-400"
                        }`}
                      title={color.name}
                    >
                      <span
                        className="block h-full w-full rounded-full border border-black/10"
                        style={{ backgroundColor: color.hex }}
                      />
                      {isSelected && (
                        <span className="absolute inset-0 flex items-center justify-center rounded-full bg-black/10 text-[11px] font-bold text-white drop-shadow-sm">
                          ✓
                        </span>
                      )}
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          <div className="grid gap-4 lg:grid-cols-2">
            <div className="space-y-2">
              <h4 className="text-sm font-black text-slate-900">وصف المنتج</h4>
              <p className="text-xs font-medium leading-6 text-slate-500">
                {defaultDesc}
              </p>
            </div>

            <div className="space-y-2">
              <h4 className="text-sm font-black text-slate-900">المواصفات الفنية</h4>
              <ul className="space-y-2">
                {defaultSpecs.slice(0, 4).map((spec, index) => (
                  <li key={index} className="flex items-start gap-2 text-[11px] font-bold leading-5 text-slate-500">
                    <CheckCircle2 className="mt-0.5 h-3.5 w-3.5 flex-shrink-0 text-accent" />
                    <span>{spec}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          <div className="mt-auto rounded-2xl border border-slate-100 bg-slate-50 p-4">
            <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <span className="text-[10px] font-black uppercase tracking-wide text-slate-400">سعر اليوم</span>
                <div className="mt-1 flex flex-wrap items-end gap-2">
                  <span className="font-mono text-2xl font-black text-slate-950">
                    {(currentPrice * qty).toLocaleString()} د.ع
                  </span>
                  {product.discountPrice && (
                    <>
                      <span className="font-mono text-xs font-bold text-slate-400 line-through">
                        {(product.price * qty).toLocaleString()} د.ع
                      </span>
                      <span className="rounded-lg bg-rose-600 px-2 py-1 text-[10px] font-black text-white">
                        وفر {discountPercent}%
                      </span>
                    </>
                  )}
                </div>
              </div>

              <div className="flex items-center overflow-hidden rounded-xl border border-slate-200 bg-white">
                <button
                  onClick={() => setQty(Math.max(1, qty - 1))}
                  className="px-4 py-3 text-slate-500 transition-colors hover:bg-slate-100 font-black cursor-pointer"
                >
                  -
                </button>
                <span className="min-w-10 px-3 text-center text-sm font-black text-slate-900 font-mono">
                  {qty}
                </span>
                <button
                  onClick={() => setQty(qty + 1)}
                  className="px-4 py-3 text-slate-500 transition-colors hover:bg-slate-100 font-black cursor-pointer"
                >
                  +
                </button>
              </div>
            </div>

            <button
              onClick={() => {
                for (let i = 0; i < qty; i++) {
                  onAddToCart(product, selectedColor);
                }
                onClose();
              }}
              className="flex w-full items-center justify-center gap-2 rounded-xl bg-[#1a1a1a] px-6 py-4 text-sm font-black text-white shadow-lg shadow-slate-900/15 transition-all hover:bg-slate-800 active:scale-[0.99] cursor-pointer"
            >
              <ShoppingBag className="w-4 h-4" />
              أضف للسلة الآن
            </button>
          </div>

          {related.length > 0 && (
            <div className="space-y-3 border-t border-slate-100 pt-4">
              <h4 className="text-sm font-black text-slate-900">كمّل اختيارك</h4>
              <div className="grid grid-cols-3 gap-3">
                {related.map((p) => (
                  <div
                    key={p.id}
                    onClick={() => {
                      onSelectProduct(p);
                      setQty(1);
                    }}
                    className="flex cursor-pointer flex-col items-center gap-2 rounded-xl border border-slate-100 bg-white p-2.5 text-center transition-all hover:border-slate-200 hover:shadow-md"
                  >
                    <div className="my-1 scale-75">
                      <ProductMockup image={p.image} name={p.name} sizeClass="w-12 aspect-[9/18]" />
                    </div>
                    <span className="w-full truncate text-[10px] font-black text-slate-700" title={p.name}>
                      {p.name}
                    </span>
                    <span className="font-mono text-[9px] font-black text-slate-500">
                      {(p.discountPrice || p.price).toLocaleString()} د.ع
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default function Home() {
  const {
    products,
    cartItems,
    addToCart,
    removeFromCart,
    updateCartQuantity,
    clearCart,
    siteSettings,
    wishlist,
    toggleWishlist,
  } = useApp();

  // States
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isWishlistOpen, setIsWishlistOpen] = useState(false);
  const [isRepairOpen, setIsRepairOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [activeCategory, setActiveCategory] = useState("الكل");
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [showAllProducts, setShowAllProducts] = useState(false);
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);

  // Cart Handlers
  const handleAddToCart = (product: Product, selectedColor?: { name: string; hex: string; image?: string | null } | null) => {
    const color = selectedColor !== undefined ? selectedColor : (product.colors && product.colors.length > 0 ? product.colors[0] : null);
    addToCart(product, color);
    setIsCartOpen(true);
  };

  const handleUpdateQuantity = (productId: string, quantity: number, selectedColorName?: string | null) => {
    updateCartQuantity(productId, quantity, selectedColorName);
  };

  const handleRemoveItem = (productId: string, selectedColorName?: string | null) => {
    removeFromCart(productId, selectedColorName);
  };

  const handleCheckout = () => {
    if (cartItems.length === 0) {
      alert("السلة فارغة!");
      return;
    }
    setIsCartOpen(false);
    setIsCheckoutOpen(true);
  };

  const handleCheckoutSubmit = async (customer: { name: string; phone: string; address: string }): Promise<boolean> => {
    const total = cartItems.reduce((acc, curr) => acc + (curr.product.discountPrice || curr.product.price) * curr.quantity, 0);

    try {
      const res = await fetch("/api/telegram", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          type: "order",
          payload: {
            customer,
            items: cartItems,
            total: total,
          },
        }),
      });

      if (!res.ok) {
        throw new Error("Failed to send notification");
      }

      clearCart();
      return true;
    } catch (e) {
      console.error("Telegram notification error:", e);
      return false;
    }
  };

  // Category Navigation Handler
  const handleCategoryClick = (categoryName: string) => {
    setActiveCategory(categoryName);
    // Smooth scroll to products section
    const productsSection = document.getElementById("products");
    if (productsSection) {
      productsSection.scrollIntoView({ behavior: "smooth" });
    }
  };

  // Filtered Products
  const isSearching = searchQuery.trim() !== "";
  const displayProducts = isSearching
    ? products
    : (showAllProducts || activeCategory !== "الكل" ? products : products.filter((p) => p.isPopular));

  const filteredProducts = displayProducts.filter((product) => {
    const matchesSearch =
      product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      product.nameEn.toLowerCase().includes(searchQuery.toLowerCase()) ||
      product.category.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesCategory =
      activeCategory === "الكل" || product.category === activeCategory;

    return matchesSearch && matchesCategory;
  });

  // Group categories that have items in the filtered products
  const activeCategories = ["موبايلات", "كفرات", "سماعات", "شواحن", "كابلات", "ملحقات"].filter((cat) =>
    filteredProducts.some((p) => p.category === cat)
  );

  // Get actual product objects for wishlist items
  const wishlistProducts = wishlist
    .map((id) => products.find((p) => p.id === id))
    .filter((p): p is Product => !!p);

  return (
    <div className="min-h-screen bg-white text-[#1a1a1a] flex flex-col font-sans">

      <MarqueeTicker />

      {/* 1. Header (Navigation) */}
      <header className="sticky top-0 z-40 bg-white/80 backdrop-blur-md border-b border-card-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">

          {/* Right: Brand Logo */}
          <div className="flex items-center gap-3">
            <div className="text-right">
              <span className="block text-lg sm:text-xl font-extrabold tracking-tight text-[#1a1a1a]">
                مركز الروان
              </span>
              <span className="block text-[10px] sm:text-xs font-semibold tracking-wider text-slate-400 uppercase -mt-1 font-mono">
                Rwan Center
              </span>
            </div>
            <div className="w-1.5 h-8 bg-accent rounded-full hidden sm:block"></div>
          </div>

          {/* Center: Desktop Menu */}
          <nav className="hidden md:flex items-center gap-8 text-sm font-semibold text-slate-600">
            <a href="#" className="text-accent transition-colors hover:text-[#1a1a1a]">الرئيسية</a>
            <a
              href="#products"
              onClick={(e) => {
                e.preventDefault();
                handleCategoryClick("موبايلات");
              }}
              className="hover:text-accent transition-colors"
            >
              موبايلات
            </a>
            <a
              href="#products"
              onClick={(e) => {
                e.preventDefault();
                handleCategoryClick("ملحقات");
              }}
              className="hover:text-accent transition-colors"
            >
              ملحقات
            </a>
            <a href="#repair" className="hover:text-accent transition-colors">صيانة</a>
            <a href="#about" className="hover:text-accent transition-colors">من نحن</a>
            <a href="#contact" className="hover:text-accent transition-colors">اتصل بنا</a>
          </nav>

          {/* Left: Actions (Desktop & Mobile) */}
          <div className="flex items-center gap-2 sm:gap-4">

            {/* Search Bar - Desktop */}
            <div className="relative hidden md:block">
              <input
                type="text"
                placeholder="ابحث عن هاتف أو ملحق..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="text-xs bg-slate-50 border border-slate-200 rounded-full py-2 pl-4 pr-10 w-64 focus:outline-none focus:border-accent focus:ring-1 focus:ring-accent transition-all"
              />
              <Search className="w-4 h-4 text-slate-400 absolute left-auto right-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            </div>

            {/* Wishlist Button */}
            <button
              onClick={() => setIsWishlistOpen(true)}
              className="p-2.5 rounded-full hover:bg-slate-50 border border-slate-100 transition-colors relative cursor-pointer"
              aria-label="Wishlist"
            >
              <Heart className={`w-4 h-4 ${wishlist.length > 0 ? "fill-rose-500 text-rose-500" : "text-slate-600"}`} />
              {wishlist.length > 0 && (
                <span className="absolute -top-1.5 -left-1.5 bg-rose-500 text-white font-extrabold text-[9px] w-5 h-5 rounded-full flex items-center justify-center border-2 border-white animate-pulse">
                  {wishlist.length}
                </span>
              )}
            </button>

            {/* Shopping Cart Button */}
            <button
              onClick={() => setIsCartOpen(true)}
              className="p-2.5 rounded-full hover:bg-slate-50 border border-slate-100 transition-colors relative cursor-pointer"
              aria-label="Cart"
            >
              <ShoppingBag className="w-4 h-4 text-slate-600" />
              {cartItems.length > 0 && (
                <span className="absolute -top-1.5 -left-1.5 bg-accent text-white font-extrabold text-[9px] w-5 h-5 rounded-full flex items-center justify-center border-2 border-white">
                  {cartItems.reduce((acc, curr) => acc + curr.quantity, 0)}
                </span>
              )}
            </button>

            {/* Admin Dashboard Link */}
            <Link
              href="/admin"
              className="p-2.5 rounded-full hover:bg-slate-50 border border-slate-100 transition-colors relative cursor-pointer group"
              title="لوحة الإدارة"
            >
              <Lock className="w-4 h-4 text-slate-600 group-hover:text-accent transition-colors" />
            </Link>

            {/* Mobile Hamburg Menu Button */}
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="p-2.5 md:hidden rounded-full hover:bg-slate-50 border border-slate-100 transition-colors cursor-pointer"
              aria-label="Menu"
            >
              {isMobileMenuOpen ? <X className="w-4 h-4 text-slate-600" /> : <Menu className="w-4 h-4 text-slate-600" />}
            </button>

          </div>

        </div>
      </header>

      {/* Mobile Menu Overlay */}
      {isMobileMenuOpen && (
        <div className="fixed inset-0 z-30 bg-black/40 backdrop-blur-sm md:hidden" onClick={() => setIsMobileMenuOpen(false)}>
          <div className="w-3/4 max-w-sm bg-white h-full p-6 shadow-2xl flex flex-col space-y-6" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between border-b border-card-border pb-4">
              <div>
                <span className="block text-md font-extrabold">مركز الروان</span>
                <span className="block text-[9px] font-bold text-slate-400 uppercase font-mono">Rwan Center</span>
              </div>
              <button
                onClick={() => setIsMobileMenuOpen(false)}
                className="p-1 rounded-full hover:bg-slate-100 text-slate-400"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <nav className="flex flex-col gap-4 text-base font-bold text-slate-700">
              <a href="#" onClick={() => setIsMobileMenuOpen(false)} className="text-accent">الرئيسية</a>
              <a href="#categories" onClick={() => setIsMobileMenuOpen(false)} className="hover:text-accent">الأقسام</a>
              <a href="#products" onClick={() => setIsMobileMenuOpen(false)} className="hover:text-accent">المنتجات</a>
              <a href="#repair" onClick={() => setIsMobileMenuOpen(false)} className="hover:text-accent">مركز الصيانة</a>
              <a href="#about" onClick={() => setIsMobileMenuOpen(false)} className="hover:text-accent">من نحن</a>
              <a href="#contact" onClick={() => setIsMobileMenuOpen(false)} className="hover:text-accent">اتصل بنا</a>
            </nav>
          </div>
        </div>
      )}

      {/* Main Content Area */}
      <main className="flex-grow max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 w-full space-y-12">

        {/* Mobile-Only Search Box (Prominent top item) */}
        <div className="md:hidden w-full relative">
          <input
            type="text"
            placeholder="ابحث عن هواتف، كابلات، صيانة..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full text-xs bg-slate-50 border border-slate-200 rounded-xl py-3 pl-4 pr-11 focus:outline-none focus:border-accent focus:ring-1 focus:ring-accent transition-all shadow-sm"
          />
          <Search className="w-4.5 h-4.5 text-slate-400 absolute left-auto right-4 top-1/2 -translate-y-1/2 pointer-events-none" />
        </div>

        {/* 2. Hero Section (Dynamic Sliding Banner Carousel) */}
        <PromoCarousel onOpenRepairModal={() => setIsRepairOpen(true)} />

        {/* 3. Bento Grid Categories */}
        <section id="categories" className="space-y-6">
          <div className="text-right">
            <h2 className="text-xl sm:text-2xl font-extrabold text-[#1a1a1a]">تصفح الأقسام الرئيسية</h2>
            <p className="text-xs text-slate-500">اختر القسم الذي ترغب في استكشافه أو طلب خدماته</p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">

            {/* Category Card 1: Mobiles */}
            <div
              onClick={() => handleCategoryClick("موبايلات")}
              className={`p-5 rounded-2xl border text-right transition-all duration-200 hover:shadow-md cursor-pointer group flex flex-col justify-between h-40 ${activeCategory === "موبايلات"
                  ? "bg-slate-50 border-accent/60 ring-1 ring-accent/60"
                  : "bg-white border-card-border hover:border-slate-300"
                }`}
            >
              <div className="p-2.5 bg-slate-100 rounded-xl text-slate-700 w-fit group-hover:scale-105 transition-transform duration-200">
                <Smartphone className="w-5 h-5 text-[#1a1a1a]" />
              </div>
              <div>
                <h3 className="font-extrabold text-sm sm:text-base text-[#1a1a1a] mb-1">موبايلات</h3>
                <p className="text-[10px] text-slate-500 leading-normal">
                  أحدث الهواتف الذكية من كبرى الشركات العالمية.
                </p>
              </div>
            </div>

            {/* Category Card 2: Cases */}
            <div
              onClick={() => handleCategoryClick("كفرات")}
              className={`p-5 rounded-2xl border text-right transition-all duration-200 hover:shadow-md cursor-pointer group flex flex-col justify-between h-40 ${activeCategory === "كفرات"
                  ? "bg-slate-50 border-accent/60 ring-1 ring-accent/60"
                  : "bg-white border-card-border hover:border-slate-300"
                }`}
            >
              <div className="p-2.5 bg-slate-100 rounded-xl text-slate-700 w-fit group-hover:scale-105 transition-transform duration-200">
                <Shield className="w-5 h-5 text-[#1a1a1a]" />
              </div>
              <div>
                <h3 className="font-extrabold text-sm sm:text-base text-[#1a1a1a] mb-1">كفرات</h3>
                <p className="text-[10px] text-slate-500 leading-normal">
                  حقائب حماية وحافظات أنيقة ومقاومة للصدمات.
                </p>
              </div>
            </div>

            {/* Category Card 3: Headphones */}
            <div
              onClick={() => handleCategoryClick("سماعات")}
              className={`p-5 rounded-2xl border text-right transition-all duration-200 hover:shadow-md cursor-pointer group flex flex-col justify-between h-40 ${activeCategory === "سماعات"
                  ? "bg-slate-50 border-accent/60 ring-1 ring-accent/60"
                  : "bg-white border-card-border hover:border-slate-300"
                }`}
            >
              <div className="p-2.5 bg-slate-100 rounded-xl text-slate-700 w-fit group-hover:scale-105 transition-transform duration-200">
                <Headphones className="w-5 h-5 text-[#1a1a1a]" />
              </div>
              <div>
                <h3 className="font-extrabold text-sm sm:text-base text-[#1a1a1a] mb-1">سماعات</h3>
                <p className="text-[10px] text-slate-500 leading-normal">
                  سماعات رأس وأذن لاسلكية بأعلى دقة صوت.
                </p>
              </div>
            </div>

            {/* Category Card 4: Chargers */}
            <div
              onClick={() => handleCategoryClick("شواحن")}
              className={`p-5 rounded-2xl border text-right transition-all duration-200 hover:shadow-md cursor-pointer group flex flex-col justify-between h-40 ${activeCategory === "شواحن"
                  ? "bg-slate-50 border-accent/60 ring-1 ring-accent/60"
                  : "bg-white border-card-border hover:border-slate-300"
                }`}
            >
              <div className="p-2.5 bg-slate-100 rounded-xl text-slate-700 w-fit group-hover:scale-105 transition-transform duration-200">
                <Zap className="w-5 h-5 text-[#1a1a1a]" />
              </div>
              <div>
                <h3 className="font-extrabold text-sm sm:text-base text-[#1a1a1a] mb-1">شواحن</h3>
                <p className="text-[10px] text-slate-500 leading-normal">
                  منصات شحن ورؤوس شواحن أصلية معتمدة.
                </p>
              </div>
            </div>

            {/* Category Card 5: Cables */}
            <div
              onClick={() => handleCategoryClick("كابلات")}
              className={`p-5 rounded-2xl border text-right transition-all duration-200 hover:shadow-md cursor-pointer group flex flex-col justify-between h-40 ${activeCategory === "كابلات"
                  ? "bg-slate-50 border-accent/60 ring-1 ring-accent/60"
                  : "bg-white border-card-border hover:border-slate-300"
                }`}
            >
              <div className="p-2.5 bg-slate-100 rounded-xl text-slate-700 w-fit group-hover:scale-105 transition-transform duration-200">
                <Cable className="w-5 h-5 text-[#1a1a1a]" />
              </div>
              <div>
                <h3 className="font-extrabold text-sm sm:text-base text-[#1a1a1a] mb-1">كابلات</h3>
                <p className="text-[10px] text-slate-500 leading-normal">
                  كابلات شحن ومزامنة بيانات عالية المتانة.
                </p>
              </div>
            </div>

            {/* Category Card 6: Accessories */}
            <div
              onClick={() => handleCategoryClick("ملحقات")}
              className={`p-5 rounded-2xl border text-right transition-all duration-200 hover:shadow-md cursor-pointer group flex flex-col justify-between h-40 ${activeCategory === "ملحقات"
                  ? "bg-slate-50 border-accent/60 ring-1 ring-accent/60"
                  : "bg-white border-card-border hover:border-slate-300"
                }`}
            >
              <div className="p-2.5 bg-slate-100 rounded-xl text-slate-700 w-fit group-hover:scale-105 transition-transform duration-200">
                <ShoppingBag className="w-5 h-5 text-[#1a1a1a]" />
              </div>
              <div>
                <h3 className="font-extrabold text-sm sm:text-base text-[#1a1a1a] mb-1">ملحقات</h3>
                <p className="text-[10px] text-slate-500 leading-normal">
                  لاصقات حماية شاشة، ساعات، وملحقات أخرى.
                </p>
              </div>
            </div>

            {/* Category Card 7: Repair Services */}
            <div
              onClick={() => setIsRepairOpen(true)}
              className="bg-[#1a1a1a] border border-[#1a1a1a] p-5 rounded-2xl text-right transition-all duration-200 hover:shadow-lg hover:scale-[1.005] cursor-pointer group flex flex-col justify-between h-40 col-span-2 md:col-span-3 lg:col-span-2 text-white relative overflow-hidden"
            >
              {/* background flare effect for emphasis */}
              <div className="absolute top-[-20%] left-[-20%] w-40 h-40 bg-accent/20 rounded-full blur-2xl pointer-events-none"></div>

              <div className="p-2.5 bg-white/10 rounded-xl text-white w-fit group-hover:scale-105 transition-transform duration-200 border border-white/5">
                <Wrench className="w-5 h-5 text-accent" />
              </div>
              <div>
                <h3 className="font-extrabold text-sm sm:text-base text-white mb-1 flex items-center gap-1.5">
                  خدمات الصيانة المعتمدة
                  <span className="bg-accent text-white font-extrabold text-[9px] px-2 py-0.5 rounded-full uppercase">فوري</span>
                </h3>
                <p className="text-[10px] text-slate-300 leading-normal">
                  فحص مجاني فوري وصيانة سريعة للأجهزة مع ضمان حقيقي يصل إلى 3 أيام.
                </p>
              </div>
            </div>

          </div>
        </section>


        {/* Special Offers Section */}
        {products.some(p => p.discountPrice && p.discountPrice > 0) && (
          <section className="bg-gradient-to-l from-rose-50/50 via-slate-50 to-blue-50/10 border border-rose-100 rounded-3xl p-6 space-y-6 relative overflow-hidden">
            {/* Background design elements */}
            <div className="absolute left-[-20px] top-[-20px] w-36 h-36 bg-rose-500/5 rounded-full blur-2xl pointer-events-none"></div>

            <div className="flex items-center justify-between border-b border-rose-100 pb-3 text-right">
              <div className="space-y-1">
                <span className="inline-flex items-center gap-1 bg-rose-100 text-rose-600 font-extrabold text-[10px] px-2.5 py-0.5 rounded-full uppercase animate-pulse">
                  🔥 عروض محدودة
                </span>
                <h2 className="text-xl font-extrabold text-[#1a1a1a]">العروض المميزة والتخفيضات</h2>
                <p className="text-xs text-slate-400">احصل على أقوى العروض الحصرية والخصومات لفترة محدودة</p>
              </div>
            </div>

            {/* Horizontal scroll grid */}
            <div className="flex gap-4 overflow-x-auto pb-4 pt-1 pr-1 scrollbar-thin scrollbar-thumb-slate-200">
              {products
                .filter(p => p.discountPrice && p.discountPrice > 0)
                .map((product) => {
                  const discountPercent = Math.round((1 - (product.discountPrice! / product.price)) * 100);
                  return (
                    <div
                      key={product.id}
                      onClick={() => setSelectedProduct(product)}
                      className="bg-white border border-card-border rounded-2xl overflow-hidden hover:shadow-md hover:border-rose-200 transition-all duration-300 flex flex-col group cursor-pointer w-48 sm:w-56 flex-shrink-0"
                    >
                      {/* Image Preview */}
                      <div className="aspect-square bg-slate-50/50 p-4 flex items-center justify-center relative overflow-hidden border-b border-card-border">
                        {/* Wishlist toggle */}
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            toggleWishlist(product.id);
                          }}
                          className="absolute top-2.5 left-2.5 bg-white p-1.5 rounded-full shadow-sm hover:scale-105 border border-slate-100 text-slate-400 hover:text-rose-500 transition-all cursor-pointer z-10"
                        >
                          <Heart className={`w-3 h-3 sm:w-3.5 sm:h-3.5 ${wishlist.includes(product.id) ? "fill-rose-500 text-rose-500" : ""}`} />
                        </button>

                        {/* Discount Badge */}
                        <span className="absolute top-2.5 right-2.5 bg-rose-600 text-white text-[8px] sm:text-[9px] font-extrabold px-2 py-0.5 rounded-full shadow-sm z-10">
                          خصم {discountPercent}%
                        </span>

                        <ProductMockup image={product.image} name={product.name} sizeClass="w-20 aspect-[9/18]" />
                      </div>

                      {/* Info */}
                      <div className="p-3 sm:p-4 flex-1 flex flex-col justify-between text-right space-y-2">
                        <div>
                          <div className="flex justify-between items-center text-[9px] sm:text-[10px]">
                            <span className="text-slate-400 font-medium truncate max-w-[80px]" title={product.nameEn}>
                              {product.nameEn}
                            </span>
                            <span className="bg-rose-50 text-rose-600 border border-rose-100 font-extrabold text-[8px] px-1.5 py-0.5 rounded">
                              عرض خاص
                            </span>
                          </div>
                          <h3 className="font-extrabold text-xs text-slate-800 group-hover:text-accent transition-colors duration-200 leading-snug line-clamp-2 mt-1 min-h-[2.4rem]">
                            {product.name}
                          </h3>
                        </div>

                        <div className="flex items-center justify-between pt-1.5 border-t border-slate-50">
                          <div className="flex flex-col text-right">
                            <span className="text-[9px] text-slate-400 line-through font-mono">
                              {product.price.toLocaleString()} د.ع
                            </span>
                            <span className="font-extrabold text-xs sm:text-sm text-rose-650 font-mono leading-none">
                              {product.discountPrice!.toLocaleString()} د.ع
                            </span>
                          </div>

                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleAddToCart(product);
                            }}
                            className="bg-rose-600 hover:bg-rose-700 text-white text-[10px] sm:text-xs font-bold px-2.5 py-1.5 rounded-lg transition-colors flex items-center gap-1 cursor-pointer"
                          >
                            <ShoppingBag className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })}
            </div>
          </section>
        )}

        {/* Bundles Lookbook Section */}
        <BundlesSection />

        {/* 4. Product Showcase Grid */}
        <section id="products" className="space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 text-right">
            <div>
              <h2 className="text-xl sm:text-2xl font-extrabold text-[#1a1a1a]">
                {isSearching ? "نتائج البحث" : (showAllProducts ? "كافة منتجات المركز" : "المنتجات الشائعة الأكثر طلباً")}
              </h2>
              <p className="text-xs text-slate-500">
                {isSearching ? "المنتجات المطابقة لكلمات البحث" : (showAllProducts ? "تصفح كافة المعروضات لدينا مقسمة حسب الفئة" : "المنتجات المميزة الشائعة التي قمنا بتحديدها لك")}
              </p>
            </div>

            {/* Filter buttons */}
            <div className="flex gap-2 justify-start sm:justify-end overflow-x-auto pb-1">
              {["الكل", "موبايلات", "كفرات", "سماعات", "شواحن", "كابلات", "ملحقات"].map((cat) => (
                <button
                  key={cat}
                  onClick={() => setActiveCategory(cat)}
                  className={`text-xs font-bold px-4 py-2 rounded-lg border transition-all cursor-pointer ${activeCategory === cat
                      ? "bg-[#1a1a1a] border-[#1a1a1a] text-white"
                      : "bg-white border-slate-200 text-slate-600 hover:bg-slate-50"
                    }`}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>

          {filteredProducts.length === 0 ? (
            <div className="p-12 border border-dashed border-slate-200 rounded-2xl text-center text-slate-400">
              لا توجد منتجات تطابق بحثك حالياً.
            </div>
          ) : (
            <div className="space-y-10">
              {activeCategories.map((catName) => {
                const catProds = filteredProducts.filter(p => p.category === catName);
                if (catProds.length === 0) return null;
                return (
                  <div key={catName} className="space-y-4">
                    <div className="flex items-center gap-3 border-b border-slate-100 pb-2">
                      <h3 className="font-extrabold text-base sm:text-lg text-slate-800">
                        {catName}
                      </h3>
                      <span className="bg-slate-105 text-slate-600 text-[10px] font-bold px-2 py-0.5 rounded-full font-mono">
                        {catProds.length}
                      </span>
                    </div>

                    <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
                      {catProds.map((product) => {
                        const discountPercent = getDiscountPercent(product);
                        const highlights = getProductHighlights(product);
                        const visibleColors = product.colors?.slice(0, 4) || [];

                        return (
                          <div
                            key={product.id}
                            onClick={() => setSelectedProduct(product)}
                            className="group flex cursor-pointer flex-col overflow-hidden rounded-2xl border border-slate-200/70 bg-white shadow-sm transition-all duration-300 hover:-translate-y-1 hover:border-slate-300 hover:shadow-xl"
                          >
                            {/* Visual product preview box */}
                            <div className="relative aspect-square overflow-hidden border-b border-slate-100 bg-gradient-to-b from-white via-sky-50 to-slate-100 p-4 sm:p-5">
                              <div className="absolute inset-0 bg-[linear-gradient(135deg,rgba(14,165,233,0.07)_0_1px,transparent_1px_24px)] opacity-60" />
                              <div className="absolute inset-x-6 top-5 h-px bg-gradient-to-l from-transparent via-sky-200 to-transparent" />
                              <div className="absolute inset-x-5 bottom-5 h-10 rounded-2xl border border-white bg-white/70 shadow-[0_16px_40px_rgba(15,23,42,0.10)] backdrop-blur-md" />
                              <div className="absolute bottom-9 left-1/2 h-2 w-24 -translate-x-1/2 rounded-full bg-gradient-to-l from-sky-200 via-white to-emerald-100" />

                              {/* Add to Wishlist overlay */}
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  toggleWishlist(product.id);
                                }}
                                className="absolute top-2.5 left-2.5 z-20 flex h-8 w-8 items-center justify-center rounded-full border border-slate-200 bg-white/90 text-slate-500 shadow-sm backdrop-blur-md transition-all hover:scale-105 hover:text-rose-500 cursor-pointer"
                                title="المفضلة"
                              >
                                <Heart className={`w-3.5 h-3.5 ${wishlist.includes(product.id) ? "fill-rose-500 text-rose-500" : ""}`} />
                              </button>

                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setSelectedProduct(product);
                                }}
                                className="absolute bottom-2.5 left-2.5 z-20 flex h-8 w-8 items-center justify-center rounded-full border border-slate-200 bg-white/90 text-slate-700 shadow-sm backdrop-blur-md transition-all hover:scale-105 hover:text-slate-950 cursor-pointer"
                                title="شاهد التفاصيل"
                              >
                                <Eye className="h-3.5 w-3.5" />
                              </button>

                              {discountPercent > 0 ? (
                                <span className="absolute top-2.5 right-2.5 z-20 rounded-lg bg-rose-600 px-2 py-1 text-[8px] font-black text-white shadow-sm sm:text-[9px]">
                                  وفر {discountPercent}%
                                </span>
                              ) : product.isPopular && (
                                <span className="absolute top-2.5 right-2.5 z-20 inline-flex items-center gap-1 rounded-lg bg-amber-400 px-2 py-1 text-[8px] font-black text-slate-950 shadow-sm sm:text-[9px]">
                                  <Sparkles className="h-3 w-3" />
                                  شائع
                                </span>
                              )}

                              <div className="relative z-10 flex h-full items-center justify-center">
                                <div className="absolute bottom-7 h-8 w-28 rounded-[100%] bg-slate-300/35 blur-xl transition-transform duration-300 group-hover:scale-110" />
                                <div className="relative transition-transform duration-500 group-hover:-translate-y-1 group-hover:scale-105">
                                  <ProductShowroomVisual
                                    image={product.image}
                                    name={product.name}
                                    sizeClass="w-24 aspect-[9/18]"
                                    imageClassName="max-h-32 max-w-32 rounded-xl"
                                  />
                                </div>
                              </div>

                              <div className="absolute bottom-2.5 right-2.5 z-20 flex items-center gap-1 rounded-lg border border-slate-200 bg-white/85 px-2 py-1 text-[8px] font-black text-slate-700 shadow-sm backdrop-blur-md">
                                <BadgeCheck className="h-3 w-3 text-emerald-300" />
                                أصلي
                              </div>
                            </div>

                            {/* Info */}
                            <div className="flex flex-1 flex-col justify-between gap-3 p-3 text-right sm:p-4">
                              <div className="space-y-2">
                                <div className="flex items-center justify-between gap-2 text-[9px] sm:text-[10px]">
                                  <span className="truncate rounded-md bg-slate-100 px-2 py-0.5 font-black text-slate-500" title={product.category}>
                                    {product.category}
                                  </span>
                                  <div className="flex items-center gap-0.5 text-amber-500">
                                    <Star className="h-3 w-3 fill-amber-500" />
                                    <span className="font-black text-slate-600">{(product.rating || 5).toFixed(1)}</span>
                                  </div>
                                </div>

                                <div>
                                  {product.nameEn && (
                                    <span className="block truncate text-[9px] font-bold uppercase tracking-wide text-slate-400" dir="ltr" title={product.nameEn}>
                                      {product.nameEn}
                                    </span>
                                  )}
                                  <h3 className="mt-1 min-h-[2.25rem] text-xs font-black leading-tight text-slate-900 transition-colors duration-200 group-hover:text-accent sm:text-sm">
                                    {product.name}
                                  </h3>
                                </div>

                                <div className="flex flex-wrap gap-1">
                                  {highlights.slice(0, 2).map((item) => (
                                    <span key={item} className="rounded-md bg-slate-50 px-2 py-1 text-[9px] font-black text-slate-500">
                                      {item}
                                    </span>
                                  ))}
                                </div>

                                {visibleColors.length > 0 && (
                                  <div className="flex items-center gap-1.5">
                                    {visibleColors.map((color, index) => (
                                      <span
                                        key={`${color.name}-${index}`}
                                        className="h-3.5 w-3.5 rounded-full border border-black/10 ring-1 ring-slate-200"
                                        style={{ backgroundColor: color.hex }}
                                        title={color.name}
                                      />
                                    ))}
                                    {(product.colors?.length || 0) > visibleColors.length && (
                                      <span className="text-[9px] font-black text-slate-400">
                                        +{(product.colors?.length || 0) - visibleColors.length}
                                      </span>
                                    )}
                                  </div>
                                )}
                              </div>

                              <div className="border-t border-slate-100 pt-3">
                                <div className="mb-3 flex min-h-9 items-end justify-between gap-2">
                                  <div className="flex flex-col text-right">
                                    {product.discountPrice ? (
                                      <>
                                        <span className="mb-0.5 font-mono text-[9px] leading-none text-slate-400 line-through">
                                          {product.price.toLocaleString()} د.ع
                                        </span>
                                        <span className="font-mono text-sm font-black leading-none text-rose-600">
                                          {product.discountPrice.toLocaleString()} د.ع
                                        </span>
                                      </>
                                    ) : (
                                      <span className="font-mono text-sm font-black text-slate-900">
                                        {product.price.toLocaleString()} د.ع
                                      </span>
                                    )}
                                  </div>
                                  <span className="hidden rounded-md bg-emerald-50 px-2 py-1 text-[9px] font-black text-emerald-600 sm:inline-flex">
                                    متوفر
                                  </span>
                                </div>

                                <div className="grid grid-cols-[1fr_auto] gap-2">
                                  <button
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      setSelectedProduct(product);
                                    }}
                                    className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-[10px] font-black text-slate-700 transition-colors hover:bg-slate-50 cursor-pointer"
                                  >
                                    التفاصيل
                                  </button>
                                  <button
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      handleAddToCart(product);
                                    }}
                                    className="flex items-center justify-center gap-1 rounded-xl bg-[#1a1a1a] px-3 py-2 text-[10px] font-black text-white transition-colors hover:bg-slate-800 cursor-pointer"
                                  >
                                    <ShoppingBag className="h-3.5 w-3.5" />
                                  </button>
                                </div>
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* Show All Products Toggle Button */}
          {!isSearching && (
            <div className="flex justify-center pt-8">
              <button
                onClick={() => setShowAllProducts(!showAllProducts)}
                className="bg-[#1a1a1a] hover:bg-slate-800 text-white font-bold text-xs sm:text-sm px-8 py-3.5 rounded-xl transition-all duration-200 shadow-md cursor-pointer flex items-center gap-2 hover:scale-[1.01]"
              >
                <span>{showAllProducts ? "عرض المنتجات الشائعة فقط" : "عرض كافة منتجات المركز"}</span>
                <ChevronRight className={`w-4 h-4 transform transition-transform ${showAllProducts ? 'rotate-90' : '-rotate-90'}`} />
              </button>
            </div>
          )}
        </section>

        {/* Flash Sale Countdown Deal */}
        <FlashSaleBanner />

        {/* 5. Authorized Repair Center section */}
        <section id="repair" className="bg-[#1a1a1a] text-white rounded-3xl p-6 sm:p-10 lg:p-12 overflow-hidden relative border border-slate-800">
          {/* Subtle background graphic design */}
          <div className="absolute -left-12 -bottom-12 w-64 h-64 bg-accent/10 rounded-full blur-3xl pointer-events-none"></div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center relative z-10">

            {/* Left Column: Wrench Icon / Decorative */}
            <div className="lg:col-span-4 flex flex-col items-center justify-center order-2 lg:order-1 text-center bg-white/5 border border-white/10 rounded-2xl p-6 backdrop-blur-sm">
              <div className="p-4 bg-accent/20 rounded-2xl text-accent mb-4 animate-pulse">
                <Wrench className="w-10 h-10" />
              </div>
              <h3 className="font-extrabold text-base mb-1">قطع غيار أصلية</h3>
              <p className="text-xs text-slate-400 max-w-[240px]">
                نستخدم قطع غيار معتمدة بالكامل لضمان تشغيل هاتفك بأعلى كفاءة وأداء.
              </p>

              <div className="flex gap-4 mt-6 w-full border-t border-white/5 pt-4 text-slate-300 text-xs">
                <div className="flex-1 text-center">
                  <div className="font-bold text-base text-accent">3 يوم</div>
                  <span className="text-[10px] text-slate-400">فترة الضمان</span>
                </div>
                <div className="w-px bg-white/10"></div>
                <div className="flex-1 text-center">
                  <div className="font-bold text-base text-accent">30 دقيقة</div>
                  <span className="text-[10px] text-slate-400">متوسط وقت الصيانة</span>
                </div>
              </div>
            </div>

            {/* Right Column: Information & Call to Action */}
            <div className="lg:col-span-8 text-right space-y-5 order-1 lg:order-2">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-white/5 text-slate-300 border border-white/10 font-bold text-xs rounded-full">
                <ThumbsUp className="w-3.5 h-3.5 text-accent" />
                المركز الأول في صيانة الهواتف الذكية بالمنطقة
              </span>
              <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight leading-tight">
                مركز الصيانة المعتمد <br />
                <span className="text-accent">صيانة فورية وضمان معتمد</span>
              </h2>
              <p className="text-xs sm:text-sm text-slate-400 leading-relaxed max-w-3xl">
                نعلم مدى أهمية هاتفك الذكي في حياتك اليومية، لذلك قمنا بتجهيز مركز صيانة متكامل بأحدث أدوات التشخيص والفحص. نقوم باستبدال الشاشات، صيانة البطاريات، منفذ الشحن، وحل جميع مشاكل النظام فوراً مع ضمان معتمد وقطع غيار أصلية.
              </p>

              <div className="flex flex-wrap gap-4 justify-start pt-2">
                <button
                  onClick={() => setIsRepairOpen(true)}
                  className="bg-accent hover:bg-accent-hover text-white font-bold text-sm px-8 py-3.5 rounded-xl transition-all duration-200 shadow-md hover:scale-[1.01] cursor-pointer"
                >
                  احجز موعد صيانة الآن
                </button>
                <a
                  href={`tel:${siteSettings.phone.replace(/\s+/g, '')}`}
                  className="border border-white/20 hover:bg-white/5 text-white font-bold text-sm px-6 py-3.5 rounded-xl transition-all duration-200 text-center flex items-center justify-center gap-2"
                >
                  <span>اتصال مباشر بالفني</span>
                  <span dir="ltr">({siteSettings.phone})</span>
                </a>
              </div>
            </div>

          </div>
        </section>

        {/* Dynamic Custom Promo Banner */}
        {siteSettings.promoBanner?.isEnabled && (
          <section
            className={`rounded-3xl p-6 sm:p-8 lg:p-10 relative overflow-hidden shadow-xl border flex flex-col md:flex-row items-center justify-between gap-6 transition-all duration-300 ${siteSettings.promoBanner.bgStyle === "glass-blue"
                ? "bg-gradient-to-r from-blue-600 via-indigo-600 to-sky-500 text-white border-blue-500/20 shadow-blue-500/20"
                : siteSettings.promoBanner.bgStyle === "glass-emerald"
                  ? "bg-gradient-to-r from-emerald-600 via-teal-600 to-cyan-500 text-white border-emerald-500/20 shadow-emerald-500/20"
                  : siteSettings.promoBanner.bgStyle === "glass-amber"
                    ? "bg-gradient-to-r from-amber-500 via-orange-600 to-yellow-500 text-white border-amber-500/20 shadow-amber-500/20"
                    : siteSettings.promoBanner.bgStyle === "glass-dark"
                      ? "bg-gradient-to-r from-slate-900 via-slate-800 to-slate-950 text-white border-slate-800 shadow-slate-950/40"
                      : "bg-gradient-to-r from-rose-500 via-pink-600 to-red-500 text-white border-rose-500/20 shadow-rose-500/20" // default glass-rose
              }`}
          >
            {/* Glowing background bubble decorative graphics */}
            <div className="absolute top-[-50%] right-[-10%] w-72 h-72 bg-white/10 rounded-full blur-3xl pointer-events-none"></div>
            <div className="absolute bottom-[-50%] left-[-10%] w-72 h-72 bg-black/10 rounded-full blur-3xl pointer-events-none"></div>

            {/* Right Side: Text info */}
            <div className="flex-1 text-right space-y-3 z-10 w-full" dir="rtl">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-white/20 text-white backdrop-blur-md font-bold text-[10px] sm:text-xs rounded-full border border-white/10 animate-bounce">
                ✨ {siteSettings.promoBanner.badge}
              </span>
              <h2 className="text-xl sm:text-2xl lg:text-3xl font-extrabold tracking-tight leading-tight">
                {siteSettings.promoBanner.title}
              </h2>
              <p className="text-xs sm:text-sm text-white/90 leading-relaxed max-w-3xl">
                {siteSettings.promoBanner.description}
              </p>
            </div>

            {/* Left Side: Call to action button */}
            <div className="z-10 w-full md:w-auto flex justify-start md:justify-end">
              <a
                href={siteSettings.promoBanner.buttonLink}
                className="w-full md:w-auto text-center bg-white text-slate-900 font-extrabold text-xs sm:text-sm px-8 py-4 rounded-2xl shadow-lg hover:bg-slate-100 active:scale-[0.99] transition-all duration-200 uppercase tracking-wide block hover:scale-[1.02]"
              >
                {siteSettings.promoBanner.buttonText}
              </a>
            </div>
          </section>
        )}

      </main>

      {/* Footer */}
      <footer id="contact" className="bg-slate-50 border-t border-card-border py-12 mt-12 text-right">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

          {/* Top Footer Row: Store Info (Working Hours & Showroom Location) */}
          <div id="about" className="grid grid-cols-1 md:grid-cols-2 gap-6 pb-8 mb-8 border-b border-slate-200">

            {/* Showroom Location */}
            <div className="flex items-center gap-4 justify-start">
              <div className="p-3 bg-white rounded-xl border border-card-border text-slate-700 shadow-xs">
                <MapPin className="w-5 h-5 text-accent" />
              </div>
              <div className="text-right">
                <h4 className="font-extrabold text-sm text-[#1a1a1a]">موقع المركز</h4>
                <p className="text-xs text-slate-500 mt-1">
                  العراق، الناصرية، الصالحية، شارع التقاعد.
                </p>
              </div>
            </div>

            {/* Working Hours */}
            <div className="flex items-center gap-4 justify-start">
              <div className="p-3 bg-white rounded-xl border border-card-border text-slate-700 shadow-xs">
                <Clock className="w-5 h-5 text-accent" />
              </div>
              <div className="text-right">
                <h4 className="font-extrabold text-sm text-[#1a1a1a]">ساعات العمل</h4>
                <p className="text-xs text-slate-500 mt-1">
                  نحن جاهزون لخدمتكم طوال أيام الأسبوع: من 3:00 مساءً حتى 12:00 مساءً.
                </p>
              </div>
            </div>

          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">

            {/* Column 1: Brand */}
            <div className="space-y-4">
              <div>
                <span className="block text-lg font-extrabold text-[#1a1a1a]">مركز الروان</span>
                <span className="block text-xs font-bold text-slate-400 uppercase font-mono">Rwan Center</span>
              </div>
              <p className="text-xs text-slate-500 leading-relaxed">
                مركز الروان المعتمد لبيع وشراء الهواتف الذكية وحافضاتها الأنيقة والعصرية، والمركز المعتمد الأسرع في الصيانة بالمنطقة.
              </p>
            </div>

            {/* Column 2: Quick links */}
            <div className="space-y-4">
              <h4 className="font-extrabold text-sm text-[#1a1a1a]">روابط سريعة</h4>
              <ul className="text-xs text-slate-500 space-y-2.5">
                <li><a href="#" className="hover:text-accent">الرئيسية</a></li>
                <li><a href="#categories" className="hover:text-accent">الأقسام الرئيسية</a></li>
                <li><a href="#products" className="hover:text-accent">المنتجات المميزة</a></li>
                <li><a href="#repair" className="hover:text-accent">خدمة الصيانة المعتمدة</a></li>
              </ul>
            </div>

            {/* Column 3: Policy */}
            <div className="space-y-4">
              <h4 className="font-extrabold text-sm text-[#1a1a1a]">السياسات والضمان</h4>
              <ul className="text-xs text-slate-500 space-y-2.5">
                <li><Link href="/policies/return" className="hover:text-accent">سياسة الاسترجاع والتبديل</Link></li>
                <li><Link href="/policies/warranty" className="hover:text-accent">تفاصيل ضمان الأجهزة والقطع</Link></li>
                <li><Link href="/policies/repair-terms" className="hover:text-accent">شروط حجز موعد الصيانة</Link></li>
                <li><Link href="/policies/shipping" className="hover:text-accent">خدمة التوصيل والشحن</Link></li>
              </ul>
            </div>

            {/* Column 4: Newsletter */}
            <div className="space-y-4">
              <h4 className="font-extrabold text-sm text-[#1a1a1a]">النشرة البريدية</h4>
              <p className="text-xs text-slate-500">اشترك معنا ليصلك جديد الهواتف وتخفيضات الإكسسوارات الأسبوعية.</p>
              <div className="flex">
                <input
                  type="email"
                  placeholder="بريدك الإلكتروني..."
                  className="text-xs bg-white border border-slate-200 rounded-r-xl py-2 px-3 focus:outline-none focus:border-accent w-full text-right"
                />
                <button className="bg-[#1a1a1a] hover:bg-slate-800 text-white px-4 rounded-l-xl text-xs font-bold transition-colors cursor-pointer">
                  اشترك
                </button>
              </div>
            </div>

          </div>

          <div className="border-t border-slate-200 mt-8 pt-8 flex flex-col sm:flex-row items-center justify-between text-center gap-4 text-xs text-slate-400">
            <div>
              &copy; {new Date().getFullYear()} مركز الروان (Rwan Center). جميع الحقوق محفوظة.
            </div>
            <div className="flex gap-4">
              {siteSettings.socials.map((social, index) => (
                <a
                  key={index}
                  href={social.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-[#1a1a1a] transition-colors"
                >
                  {social.name}
                </a>
              ))}
            </div>
          </div>
        </div>
      </footer>

      {/* Cart Drawer */}
      <CartDrawer
        isOpen={isCartOpen}
        onClose={() => setIsCartOpen(false)}
        items={cartItems}
        onUpdateQuantity={handleUpdateQuantity}
        onRemoveItem={handleRemoveItem}
        onCheckout={handleCheckout}
        shippingFee={siteSettings.shippingFee}
      />

      {/* Wishlist Drawer */}
      <WishlistDrawer
        isOpen={isWishlistOpen}
        onClose={() => setIsWishlistOpen(false)}
        items={wishlistProducts}
        onRemoveItem={toggleWishlist}
        onAddToCart={handleAddToCart}
      />

      {/* Repair Booking Modal */}
      <RepairModal
        isOpen={isRepairOpen}
        onClose={() => setIsRepairOpen(false)}
      />

      {/* Checkout Modal */}
      <CheckoutModal
        isOpen={isCheckoutOpen}
        onClose={() => setIsCheckoutOpen(false)}
        cartItems={cartItems}
        onSubmit={handleCheckoutSubmit}
        shippingFee={siteSettings.shippingFee}
      />

      {/* Product Detail Modal */}
      {selectedProduct && (
        <ProductDetailModal
          key={selectedProduct.id}
          product={selectedProduct}
          isOpen={!!selectedProduct}
          onClose={() => setSelectedProduct(null)}
          onAddToCart={(prod, color) => {
            handleAddToCart(prod, color);
          }}
          allProducts={products}
          onSelectProduct={(prod) => setSelectedProduct(prod)}
        />
      )}

      {/* Promotional Pop-up Modal */}
      <PromoPopUp />

    </div>
  );
}
