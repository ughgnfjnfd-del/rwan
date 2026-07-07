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
  ChevronLeft,
  Shield,
  Star,
  Globe,
  MapPin,
  Clock,
  Lock,
  Zap,
  Cable,
  Eye,
  BadgeCheck,
  CheckCircle2,
  Palette,
  PackageCheck,
  ShieldCheck,
  Sparkles,
  MessageCircle
} from "lucide-react";
import CartDrawer from "@/components/CartDrawer";
import RepairModal from "@/components/RepairModal";
import CheckoutModal from "@/components/CheckoutModal";
import WishlistDrawer from "@/components/WishlistDrawer";
import PromoCarousel from "@/components/PromoCarousel";
import Link from "next/link";
import { useApp, Product } from "@/context/AppContext";
import { matchProduct } from "@/lib/search";

import ProductMockup from "@/components/ProductMockup";
import MarqueeTicker from "@/components/MarqueeTicker";
import FlashSaleBanner from "@/components/FlashSaleBanner";
import BundlesSection from "@/components/BundlesSection";
import PromoPopUp from "@/components/PromoPopUp";
import PremiumShowcaseSection from "@/components/PremiumShowcaseSection";
import GalleryShowcase from "@/components/GalleryShowcase";
import PartnerSiteButton from "@/components/PartnerSiteButton";
import BackToTop from "@/components/BackToTop";
import SplashLoader from "@/components/SplashLoader";
import ProductSkeleton from "@/components/ProductSkeleton";

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
  onAddToCart: (
    product: Product,
    selectedColor?: { name: string; hex: string; image?: string | null } | null,
    selectedPort?: string | null
  ) => void;
  allProducts: Product[];
  onSelectProduct: (product: Product) => void;
}

function ProductDetailModal({ product, isOpen, onClose, onAddToCart, allProducts, onSelectProduct }: ProductDetailModalProps) {
  const [qty, setQty] = useState(1);
  const [selectedColor, setSelectedColor] = useState<{ name: string; hex: string; image?: string | null } | null>(
    () => product.colors?.[0] || null
  );
  const [selectedPort, setSelectedPort] = useState<string | null>(
    () => product.ports?.[0] || null
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
          {product.ports && product.ports.length > 0 && (
            <div className="space-y-3 rounded-2xl border border-slate-100 bg-white p-4 shadow-sm">
              <div className="flex items-center justify-between gap-3">
                <span className="inline-flex items-center gap-2 text-xs font-black text-slate-800">
                  <Cpu className="h-4 w-4 text-slate-500" />
                  اختر نوع المنفذ (Port Type)
                </span>
                <span className="rounded-lg bg-sky-50 border border-sky-100 text-sky-600 px-3 py-1 text-[10px] font-extrabold">
                  {selectedPort || "غير محدد"}
                </span>
              </div>

              <div className="flex flex-wrap gap-2">
                {product.ports.map((port, idx) => {
                  const isSelected = selectedPort === port;
                  return (
                    <button
                      key={idx}
                      onClick={() => setSelectedPort(port)}
                      type="button"
                      className={`relative px-4 py-2 text-xs font-bold rounded-xl border transition-all duration-200 active:scale-95 cursor-pointer ${isSelected
                        ? "bg-[#1a1a1a] border-[#1a1a1a] text-white shadow-md scale-[1.02]"
                        : "bg-slate-50/50 border-slate-200 text-slate-650 hover:bg-slate-50 hover:border-slate-350"
                        }`}
                    >
                      {port}
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

          <div className="mt-auto rounded-2xl border border-slate-200/60 bg-white/85 backdrop-blur-xl p-4 sticky bottom-4 z-30 shadow-[0_-20px_40px_-15px_rgba(0,0,0,0.05)]">
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

            {product.isOutOfStock ? (
              <button
                disabled
                className="flex w-full items-center justify-center gap-2 rounded-xl bg-slate-100 border border-slate-200 px-6 py-4 text-sm font-black text-slate-400 cursor-not-allowed"
              >
                المنتج نفذ من المخزون حالياً
              </button>
            ) : (
              <button
                onClick={() => {
                  for (let i = 0; i < qty; i++) {
                    onAddToCart(product, selectedColor, selectedPort);
                  }
                  onClose();
                }}
                className="flex w-full items-center justify-center gap-2 rounded-xl bg-[#1a1a1a] px-6 py-4 text-sm font-black text-white shadow-lg shadow-slate-900/15 transition-all hover:bg-slate-800 active:scale-[0.99] cursor-pointer"
              >
                <ShoppingBag className="w-4 h-4" />
                أضف للسلة الآن
              </button>
            )}
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
    appliedCoupon,
    applyCoupon,
    validateCouponLive,
    clearAppliedCoupon,
    couponCodes,
    recordCouponUse,
  } = useApp();

  // Calculate dynamic coupon discount based on cart items and applied coupon conditions
  const couponDiscount = React.useMemo(() => {
    if (!appliedCoupon) return 0;
    const coupon = couponCodes.find(c => c.code.toUpperCase() === appliedCoupon.code.toUpperCase());
    if (!coupon || !coupon.isActive) return 0;

    // Check appliesTo (only store or both)
    if (coupon.appliesTo === "repair") return 0; // doesn't apply to cart items

    const subtotal = cartItems.reduce((acc, curr) => acc + (curr.product.discountPrice || curr.product.price) * curr.quantity, 0);

    if (coupon.minOrderAmount > 0 && subtotal < coupon.minOrderAmount) return 0;

    if (coupon.discountType === "percent") {
      return Math.min(subtotal, Math.round(subtotal * (coupon.discountValue / 100)));
    }
    return Math.min(subtotal, coupon.discountValue);
  }, [appliedCoupon, couponCodes, cartItems]);

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
  const [showSearchDropdown, setShowSearchDropdown] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // Smart Navbar: track scroll position for dynamic transparency
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener("scroll", handleScroll, { passive: true });
    handleScroll(); // Initial check
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Listen for custom open-cart event from MobileBottomNav
  useEffect(() => {
    const handleOpenCart = () => setIsCartOpen(true);
    window.addEventListener("open-cart", handleOpenCart);
    return () => window.removeEventListener("open-cart", handleOpenCart);
  }, []);

  // Simulate product loading state
  useEffect(() => {
    if (products.length > 0) {
      const timer = setTimeout(() => setIsLoading(false), 600);
      return () => clearTimeout(timer);
    }
  }, [products]);



  // Cart Handlers
  const handleAddToCart = (
    product: Product,
    selectedColor?: { name: string; hex: string; image?: string | null } | null,
    selectedPort?: string | null
  ) => {
    const color = selectedColor !== undefined ? selectedColor : (product.colors && product.colors.length > 0 ? product.colors[0] : null);
    const port = selectedPort !== undefined ? selectedPort : (product.ports && product.ports.length > 0 ? product.ports[0] : null);
    addToCart(product, color, port);
    setIsCartOpen(true);
  };

  const handleUpdateQuantity = (productId: string, quantity: number, selectedColorName?: string | null, selectedPort?: string | null) => {
    updateCartQuantity(productId, quantity, selectedColorName, selectedPort);
  };

  const handleRemoveItem = (productId: string, selectedColorName?: string | null, selectedPort?: string | null) => {
    removeFromCart(productId, selectedColorName, selectedPort);
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

    let currentDiscount = couponDiscount;
    const finalCouponCode = appliedCoupon ? appliedCoupon.code : undefined;

    if (appliedCoupon) {
      const liveValidation = await validateCouponLive(appliedCoupon.code, "store", total);
      if (!liveValidation.isValid) {
        alert(`عذراً، لم يعد رمز الخصم صالحاً للاستخدام: ${liveValidation.message}`);
        clearAppliedCoupon();
        return false;
      }
      currentDiscount = liveValidation.discountAmount;
    }

    const finalTotal = Math.max(0, total - currentDiscount) + (parseInt(siteSettings.shippingFee.replace(/[^0-9]/g, "")) || 0);

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
            couponCode: finalCouponCode,
            couponDiscount: currentDiscount,
            finalTotal: finalTotal,
          },
        }),
      });

      if (!res.ok) {
        throw new Error("Failed to send notification");
      }

      if (appliedCoupon) {
        await recordCouponUse(appliedCoupon.code, "store", total);
      }

      clearCart();
      return true;
    } catch (e) {
      console.error("Telegram notification error:", e);
      return false;
    }
  };

  const handleScroll = (id: string, direction: 'left' | 'right') => {
    const container = document.getElementById(id);
    if (container) {
      const scrollAmount = container.clientWidth * 0.75;
      container.scrollBy({ left: direction === 'left' ? -scrollAmount : scrollAmount, behavior: 'smooth' });
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
    const matchesSearch = isSearching ? matchProduct(product, searchQuery) : true;
    const matchesCategory =
      activeCategory === "الكل" || product.category === activeCategory;

    return matchesSearch && matchesCategory;
  });

  // Group categories dynamically that have items in the filtered products
  const defaultCatsOrder = ["موبايلات", "كفرات", "سماعات", "شواحن", "كابلات", "ملحقات"];
  const uniqueFilteredCats = Array.from(new Set(filteredProducts.map(p => p.category)));
  const activeCategories = [
    ...defaultCatsOrder.filter(cat => uniqueFilteredCats.includes(cat)),
    ...uniqueFilteredCats.filter(cat => !defaultCatsOrder.includes(cat))
  ];

  // Scroll Reveal Observer
  useEffect(() => {
    if (isLoading) return; // Wait until loaded

    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('opacity-100', 'translate-y-0');
          entry.target.classList.remove('opacity-0', 'translate-y-12');
          observer.unobserve(entry.target);
        }
      });
    }, { threshold: 0.05, rootMargin: '0px 0px -50px 0px' });

    const elements = document.querySelectorAll('.reveal-on-scroll');
    elements.forEach((el) => {
      el.classList.add('opacity-0', 'translate-y-12', 'transition-all', 'duration-1000', 'ease-out');
      observer.observe(el);
    });

    return () => observer.disconnect();
  }, [isLoading, filteredProducts]);

  // Get actual product objects for wishlist items
  const wishlistProducts = wishlist
    .map((id) => products.find((p) => p.id === id))
    .filter((p): p is Product => !!p);

  return (
    <div className="min-h-screen bg-[#fcfcfc] text-slate-900 flex flex-col font-sans selection:bg-accent/20">

      <MarqueeTicker />

      {/* 1. Header (Navigation) — Smart Navbar */}
      <header className={`sticky top-0 z-40 transition-all duration-500 ease-out ${isScrolled
          ? "bg-white/85 backdrop-blur-xl border-b border-slate-200/60 shadow-[0_1px_20px_rgba(0,0,0,0.04)]"
          : "bg-white/40 backdrop-blur-sm border-b border-transparent"
        }`}>
        <div className={`max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between transition-all duration-500 ${isScrolled ? "h-16" : "h-20"
          }`}>

          {/* Right: Brand Logo */}
          <div className="flex items-center gap-3">
            {siteSettings?.logo?.url ? (
              <img src={siteSettings.logo.url} alt="Logo" className={`w-auto object-contain transition-all duration-500 ${isScrolled ? "h-10 sm:h-12" : "h-14 sm:h-16"}`} />
            ) : (
              <>
                <div className="text-right">
                  <span className="block text-lg sm:text-xl font-extrabold tracking-tight text-[#1a1a1a]">
                    مركز الروان
                  </span>
                  <span className="block text-[10px] sm:text-xs font-semibold tracking-wider text-slate-400 uppercase -mt-1 font-mono">
                    Al-Rwan Center
                  </span>
                </div>
                <div className="w-1.5 h-8 bg-accent rounded-full hidden sm:block"></div>
              </>
            )}
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
            <a href="#contact" className="hover:text-accent transition-colors">اتصل بنا</a>
          </nav>

          {/* Left: Actions (Desktop & Mobile) */}
          <div className="flex items-center gap-2 sm:gap-4">

            {/* Premium Partner Site Button (Always Visible) */}
            <PartnerSiteButton variant="header-premium" />

            {/* Search Bar - Desktop */}
            <div className="relative hidden md:block z-50">
              <input
                type="text"
                placeholder="ابحث عن هاتف أو ملحق..."
                value={searchQuery}
                onChange={(e) => {
                  const val = e.target.value;
                  setSearchQuery(val);
                  setShowSearchDropdown(true);
                  if (val.trim() !== "") {
                    setActiveCategory("الكل");
                  }
                }}
                onFocus={() => setShowSearchDropdown(true)}
                className="text-xs bg-slate-50 border border-slate-200 rounded-full py-2 pl-4 pr-10 w-64 focus:outline-none focus:border-accent focus:ring-1 focus:ring-accent transition-all"
              />
              <Search className="w-4 h-4 text-slate-400 absolute left-auto right-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />

              {/* Dropdown for Desktop */}
              {showSearchDropdown && searchQuery.trim() !== "" && (
                <>
                  <div className="fixed inset-0 z-40 bg-black/5 backdrop-blur-[1px]" onClick={() => setShowSearchDropdown(false)} />
                  <div className="absolute left-0 mt-2 w-[420px] bg-white/95 backdrop-blur-md border border-slate-200/80 rounded-2xl shadow-2xl z-50 overflow-hidden text-right animate-in fade-in-50 slide-in-from-top-2 duration-200">
                    <div className="p-3 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
                      <span className="text-[11px] font-extrabold text-slate-500">نتائج البحث السريعة ({filteredProducts.length})</span>
                      <button
                        onClick={() => setShowSearchDropdown(false)}
                        className="text-slate-400 hover:text-slate-650 p-1 rounded-full hover:bg-slate-100 transition-colors"
                      >
                        <X className="w-3.5 h-3.5" />
                      </button>
                    </div>

                    {filteredProducts.length === 0 ? (
                      <div className="p-6 text-center text-slate-400 text-xs">
                        لا توجد نتائج مطابقة لبحثك &quot;{searchQuery}&quot;.
                      </div>
                    ) : (
                      <div className="max-h-[360px] overflow-y-auto divide-y divide-slate-100/60">
                        {filteredProducts.slice(0, 5).map((product) => {
                          const discountPercent = getDiscountPercent(product);
                          return (
                            <div
                              key={product.id}
                              onClick={() => {
                                setSelectedProduct(product);
                                setShowSearchDropdown(false);
                              }}
                              className="p-3 flex items-center gap-3 hover:bg-slate-50/80 transition-all cursor-pointer group"
                            >
                              <div className="w-12 h-12 bg-slate-50 border border-slate-150 rounded-xl flex items-center justify-center overflow-hidden flex-shrink-0 group-hover:scale-105 transition-transform duration-200">
                                <ProductShowroomVisual
                                  image={product.image}
                                  name={product.name}
                                  sizeClass="w-8 aspect-[9/18]"
                                  imageClassName="max-h-10 max-w-10 rounded-lg"
                                />
                              </div>
                              <div className="flex-grow min-w-0 text-right">
                                <div className="flex items-center gap-1.5 justify-start flex-row-reverse">
                                  <span className="text-[9px] font-black text-slate-400 bg-slate-100 px-1.5 py-0.5 rounded-md uppercase">
                                    {product.category}
                                  </span>
                                  {discountPercent > 0 && (
                                    <span className="text-[8px] font-bold text-white bg-rose-600 px-1 rounded-md">
                                      وفر {discountPercent}%
                                    </span>
                                  )}
                                </div>
                                <h4 className="text-xs font-black text-slate-900 truncate mt-1 group-hover:text-accent transition-colors leading-tight">
                                  {product.name}
                                </h4>
                                {product.nameEn && (
                                  <p className="text-[9px] font-bold text-slate-400 uppercase truncate mt-0.5" dir="ltr">
                                    {product.nameEn}
                                  </p>
                                )}
                              </div>
                              <div className="flex flex-col items-end gap-1.5 flex-shrink-0 pl-1">
                                <div className="flex flex-col text-left font-mono">
                                  {product.discountPrice ? (
                                    <>
                                      <span className="text-[9px] text-slate-400 line-through leading-none">
                                        {product.price.toLocaleString()} د.ع
                                      </span>
                                      <span className="text-[11px] font-black text-rose-600 leading-none mt-0.5">
                                        {product.discountPrice.toLocaleString()} د.ع
                                      </span>
                                    </>
                                  ) : (
                                    <span className="text-[11px] font-black text-slate-900 leading-none">
                                      {product.price.toLocaleString()} د.ع
                                    </span>
                                  )}
                                </div>
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleAddToCart(product);
                                    setShowSearchDropdown(false);
                                  }}
                                  className="p-1.5 bg-slate-100 hover:bg-[#1a1a1a] hover:text-white rounded-lg transition-colors text-slate-650 cursor-pointer"
                                  title="أضف للسلة"
                                >
                                  <ShoppingBag className="w-3 h-3" />
                                </button>
                              </div>
                            </div>
                          );
                        })}

                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setShowSearchDropdown(false);
                            const productsSection = document.getElementById("products");
                            if (productsSection) {
                              productsSection.scrollIntoView({ behavior: "smooth" });
                            }
                          }}
                          className="w-full text-center py-3 bg-[#1a1a1a] text-white hover:bg-slate-800 text-xs font-extrabold transition-colors flex items-center justify-center gap-1.5"
                        >
                          <span>عرض كافة نتائج البحث ({filteredProducts.length})</span>
                          <ChevronRight className="w-3.5 h-3.5 transform rotate-180" />
                        </button>
                      </div>
                    )}
                  </div>
                </>
              )}
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
              className="hidden md:flex p-2.5 rounded-full hover:bg-slate-50 border border-slate-100 transition-colors relative cursor-pointer group"
              title="لوحة الإدارة"
            >
              <Lock className="w-4 h-4 text-slate-600 group-hover:text-accent transition-colors" />
            </Link>



            {/* Mobile Hamburg Menu Button */}
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="p-2.5 hidden rounded-full hover:bg-slate-50 border border-slate-100 transition-colors cursor-pointer"
              aria-label="Menu"
            >
              {isMobileMenuOpen ? <X className="w-4 h-4 text-slate-600" /> : <Menu className="w-4 h-4 text-slate-600" />}
            </button>

          </div>

        </div>
      </header>

      {/* Mobile Menu Overlay */}
      {isMobileMenuOpen && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm md:hidden" onClick={() => setIsMobileMenuOpen(false)}>
          <div className="w-3/4 max-w-sm bg-white h-full p-6 shadow-2xl flex flex-col space-y-6" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between border-b border-card-border pb-4">
              {siteSettings?.logo?.url ? (
                <img src={siteSettings.logo.url} alt="Logo" className="h-12 w-auto object-contain" />
              ) : (
                <div>
                  <span className="block text-md font-extrabold">مركز الروان</span>
                  <span className="block text-[9px] font-bold text-slate-400 uppercase font-mono">Al-Rwan Center</span>
                </div>
              )}
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
              <a href="#contact" onClick={() => setIsMobileMenuOpen(false)} className="hover:text-accent">اتصل بنا</a>

              <div className="h-px bg-slate-100 my-2 w-full" />
              <Link href="/admin" onClick={() => setIsMobileMenuOpen(false)} className="flex items-center gap-3 text-slate-500 hover:text-slate-900 mt-2">
                <div className="p-2 bg-slate-50 rounded-lg">
                  <Lock className="w-4 h-4" />
                </div>
                <span>لوحة الإدارة</span>
              </Link>
            </nav>
          </div>
        </div>
      )}

      {/* 2. Hero Section (Dynamic Sliding Banner Carousel) - Edge to Edge */}
      <PromoCarousel onOpenRepairModal={() => setIsRepairOpen(true)} />

      {/* Main Content Area */}
      <main className="flex-grow max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 lg:py-12 w-full space-y-20 lg:space-y-28">

        {/* Mobile-Only Search Box (Prominent top item) */}
        <div className="md:hidden w-full relative z-30">
          <input
            type="text"
            placeholder="ابحث عن هواتف، كابلات، صيانة..."
            value={searchQuery}
            onChange={(e) => {
              const val = e.target.value;
              setSearchQuery(val);
              setShowSearchDropdown(true);
              if (val.trim() !== "") {
                setActiveCategory("الكل");
              }
            }}
            onFocus={() => setShowSearchDropdown(true)}
            className="w-full text-xs bg-slate-50 border border-slate-200 rounded-xl py-3 pl-4 pr-11 focus:outline-none focus:border-accent focus:ring-1 focus:ring-accent transition-all shadow-sm"
          />
          <Search className="w-4.5 h-4.5 text-slate-400 absolute left-auto right-4 top-1/2 -translate-y-1/2 pointer-events-none" />

          {/* Dropdown for Mobile */}
          {showSearchDropdown && searchQuery.trim() !== "" && (
            <>
              <div className="fixed inset-0 z-40 bg-black/5 backdrop-blur-[1px]" onClick={() => setShowSearchDropdown(false)} />
              <div className="absolute right-0 left-0 mt-2 bg-white/95 backdrop-blur-md border border-slate-200/80 rounded-2xl shadow-2xl z-50 overflow-hidden text-right animate-in fade-in-50 slide-in-from-top-2 duration-200">
                <div className="p-3 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
                  <span className="text-[11px] font-extrabold text-slate-500">نتائج البحث السريعة ({filteredProducts.length})</span>
                  <button
                    onClick={() => setShowSearchDropdown(false)}
                    className="text-slate-400 hover:text-slate-650 p-1 rounded-full hover:bg-slate-100 transition-colors"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                </div>

                {filteredProducts.length === 0 ? (
                  <div className="p-6 text-center text-slate-400 text-xs">
                    لا توجد نتائج مطابقة لبحثك &quot;{searchQuery}&quot;.
                  </div>
                ) : (
                  <div className="max-h-[320px] overflow-y-auto divide-y divide-slate-100/60">
                    {filteredProducts.slice(0, 5).map((product) => {
                      const discountPercent = getDiscountPercent(product);
                      return (
                        <div
                          key={product.id}
                          onClick={() => {
                            setSelectedProduct(product);
                            setShowSearchDropdown(false);
                          }}
                          className="p-3 flex items-center gap-3 hover:bg-slate-50/80 transition-all cursor-pointer group"
                        >
                          <div className="w-12 h-12 bg-slate-50 border border-slate-150 rounded-xl flex items-center justify-center overflow-hidden flex-shrink-0 group-hover:scale-105 transition-transform duration-200">
                            <ProductShowroomVisual
                              image={product.image}
                              name={product.name}
                              sizeClass="w-8 aspect-[9/18]"
                              imageClassName="max-h-10 max-w-10 rounded-lg"
                            />
                          </div>
                          <div className="flex-grow min-w-0 text-right">
                            <div className="flex items-center gap-1.5 justify-start flex-row-reverse">
                              <span className="text-[9px] font-black text-slate-400 bg-slate-100 px-1.5 py-0.5 rounded-md uppercase">
                                {product.category}
                              </span>
                              {discountPercent > 0 && (
                                <span className="text-[8px] font-bold text-white bg-rose-600 px-1 rounded-md">
                                  وفر {discountPercent}%
                                </span>
                              )}
                            </div>
                            <h4 className="text-xs font-black text-slate-900 truncate mt-1 group-hover:text-accent transition-colors leading-tight">
                              {product.name}
                            </h4>
                            {product.nameEn && (
                              <p className="text-[9px] font-bold text-slate-400 uppercase truncate mt-0.5" dir="ltr">
                                {product.nameEn}
                              </p>
                            )}
                          </div>
                          <div className="flex flex-col items-end gap-1.5 flex-shrink-0 pl-1">
                            <div className="flex flex-col text-left font-mono">
                              {product.discountPrice ? (
                                <>
                                  <span className="text-[9px] text-slate-400 line-through leading-none">
                                    {product.price.toLocaleString()} د.ع
                                  </span>
                                  <span className="text-[11px] font-black text-rose-600 leading-none mt-0.5">
                                    {product.discountPrice.toLocaleString()} د.ع
                                  </span>
                                </>
                              ) : (
                                <span className="text-[11px] font-black text-slate-900 leading-none">
                                  {product.price.toLocaleString()} د.ع
                                </span>
                              )}
                            </div>
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                handleAddToCart(product);
                                setShowSearchDropdown(false);
                              }}
                              className="p-1.5 bg-slate-100 hover:bg-[#1a1a1a] hover:text-white rounded-lg transition-colors text-slate-650 cursor-pointer"
                              title="أضف للسلة"
                            >
                              <ShoppingBag className="w-3 h-3" />
                            </button>
                          </div>
                        </div>
                      );
                    })}

                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setShowSearchDropdown(false);
                        const productsSection = document.getElementById("products");
                        if (productsSection) {
                          productsSection.scrollIntoView({ behavior: "smooth" });
                        }
                      }}
                      className="w-full text-center py-3 bg-[#1a1a1a] text-white hover:bg-slate-800 text-xs font-extrabold transition-colors flex items-center justify-center gap-1.5"
                    >
                      <span>عرض كافة نتائج البحث ({filteredProducts.length})</span>
                      <ChevronRight className="w-3.5 h-3.5 transform rotate-180" />
                    </button>
                  </div>
                )}
              </div>
            </>
          )}
        </div>


        {/* 3. Bento Grid Categories */}
        <section id="categories" className="space-y-6 reveal-on-scroll">
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


        <GalleryShowcase onSelectProduct={setSelectedProduct} />

        <PremiumShowcaseSection
          onSelectProduct={setSelectedProduct}
          onAddToCart={handleAddToCart}
        />

        {/* Bundles Lookbook Section */}
        <div className="reveal-on-scroll">
          <BundlesSection />
        </div>

        {/* 4. Product Showcase Grid */}
        <section id="products" className="space-y-6 reveal-on-scroll">
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

          {isLoading ? (
            <div className="space-y-10">
              <div className="space-y-4">
                <div className="flex items-center gap-3 border-b border-slate-100 pb-2">
                  <div className="w-20 h-5 rounded bg-slate-100 animate-pulse" />
                  <div className="w-8 h-4 rounded-full bg-slate-100 animate-pulse" />
                </div>
                <ProductSkeleton count={5} />
              </div>
              <div className="space-y-4">
                <div className="flex items-center gap-3 border-b border-slate-100 pb-2">
                  <div className="w-16 h-5 rounded bg-slate-100 animate-pulse" />
                  <div className="w-8 h-4 rounded-full bg-slate-100 animate-pulse" />
                </div>
                <ProductSkeleton count={4} />
              </div>
            </div>
          ) : filteredProducts.length === 0 ? (
            <div className="p-12 border border-dashed border-slate-200 rounded-2xl text-center text-slate-400">
              لا توجد منتجات تطابق بحثك حالياً.
            </div>
          ) : (
            <div className="space-y-10">
              {activeCategories.map((catName) => {
                const catProds = filteredProducts.filter(p => p.category === catName);
                if (catProds.length === 0) return null;
                return (
                  <div key={catName} className="space-y-4 relative group/row">
                    <div className="flex items-center gap-3 border-b border-slate-100 pb-2">
                      <h3 className="font-extrabold text-base sm:text-lg text-slate-800">
                        {catName}
                      </h3>
                      <span className="bg-slate-105 text-slate-600 text-[10px] font-bold px-2 py-0.5 rounded-full font-mono">
                        {catProds.length}
                      </span>
                    </div>

                    <div className="relative">
                      {/* Desktop Navigation Arrows */}
                      <button
                        onClick={(e) => { e.preventDefault(); handleScroll(`scroll-cat-${catName}`, 'right'); }}
                        className="hidden md:flex absolute -right-5 lg:-right-6 top-[calc(50%-1.5rem)] -translate-y-1/2 z-20 w-11 h-11 bg-white/95 backdrop-blur-md shadow-lg border border-slate-200 rounded-full items-center justify-center text-slate-600 hover:text-accent hover:border-accent/30 hover:scale-105 opacity-0 group-hover/row:opacity-100 transition-all cursor-pointer"
                        title="التالي"
                      >
                        <ChevronRight className="w-5 h-5 mr-0.5" />
                      </button>
                      <button
                        onClick={(e) => { e.preventDefault(); handleScroll(`scroll-cat-${catName}`, 'left'); }}
                        className="hidden md:flex absolute -left-5 lg:-left-6 top-[calc(50%-1.5rem)] -translate-y-1/2 z-20 w-11 h-11 bg-white/95 backdrop-blur-md shadow-lg border border-slate-200 rounded-full items-center justify-center text-slate-600 hover:text-accent hover:border-accent/30 hover:scale-105 opacity-0 group-hover/row:opacity-100 transition-all cursor-pointer"
                        title="السابق"
                      >
                        <ChevronLeft className="w-5 h-5 ml-0.5" />
                      </button>

                      <div id={`scroll-cat-${catName}`} className="flex overflow-x-auto gap-4 sm:gap-6 pb-6 px-4 -mx-4 md:px-2 md:-mx-2 snap-x snap-mandatory scrollbar-none scroll-smooth relative">
                        {catProds.map((product) => {
                          const discountPercent = getDiscountPercent(product);
                          const highlights = getProductHighlights(product);
                          const visibleColors = product.colors?.slice(0, 4) || [];

                          return (
                            <div
                              key={product.id}
                              onClick={() => setSelectedProduct(product)}
                              className="group flex cursor-pointer flex-col overflow-hidden rounded-3xl border border-slate-200/50 bg-white shadow-sm transition-all duration-500 ease-out hover:-translate-y-2 hover:border-slate-200 hover:shadow-[0_20px_40px_-10px_rgba(0,0,0,0.08)] flex-shrink-0 w-[200px] xs:w-[220px] md:w-[240px] lg:w-[260px] snap-start relative"
                            >
                              {/* Visual product preview box */}
                              <div className="relative aspect-square overflow-hidden border-b border-slate-50 bg-[#fafafa] p-4 sm:p-5">
                                {/* Dynamic Spotlight on Hover */}
                                <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_40%,rgba(255,255,255,0.9)_0%,transparent_60%)] opacity-0 group-hover:opacity-100 transition-opacity duration-700 pointer-events-none z-0" />
                                <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_100%,rgba(14,165,233,0.04)_0%,transparent_50%)] pointer-events-none z-0" />

                                <div className="absolute inset-x-5 bottom-5 h-10 rounded-2xl border border-white bg-white/70 shadow-[0_16px_40px_rgba(15,23,42,0.05)] backdrop-blur-md" />
                                <div className="absolute bottom-9 left-1/2 h-2 w-24 -translate-x-1/2 rounded-full bg-gradient-to-l from-sky-100 via-white to-emerald-50 opacity-50" />

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
                                    {product.isOutOfStock ? (
                                      <span className="hidden rounded-md bg-rose-50 px-2 py-1 text-[9px] font-black text-rose-600 sm:inline-flex">
                                        نفذت الكمية
                                      </span>
                                    ) : (
                                      <span className="hidden rounded-md bg-emerald-50 px-2 py-1 text-[9px] font-black text-emerald-600 sm:inline-flex">
                                        متوفر
                                      </span>
                                    )}
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
                                    {product.isOutOfStock ? (
                                      <button
                                        disabled
                                        className="flex items-center justify-center gap-1 rounded-xl bg-slate-100 px-3 py-2 text-[10px] font-black text-slate-400 cursor-not-allowed"
                                        title="نفذت الكمية"
                                      >
                                        <span className="px-1 text-[9px]">نفذ</span>
                                      </button>
                                    ) : (
                                      <button
                                        onClick={(e) => {
                                          e.stopPropagation();
                                          handleAddToCart(product);
                                        }}
                                        className="flex items-center justify-center gap-1 rounded-xl bg-[#1a1a1a] px-3 py-2 text-[10px] font-black text-white transition-colors hover:bg-slate-800 cursor-pointer"
                                        title="أضف للسلة"
                                      >
                                        <ShoppingBag className="h-3.5 w-3.5" />
                                      </button>
                                    )}
                                  </div>
                                </div>
                              </div>
                            </div>
                          );
                        })}
                      </div>
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
        <section id="repair" className="relative overflow-hidden rounded-[32px] border border-slate-200 bg-[#f5f5f7] text-slate-950 shadow-[0_30px_90px_rgba(15,23,42,0.08)]">
          <div className="absolute inset-0 pointer-events-none bg-[linear-gradient(135deg,rgba(255,255,255,0.98),rgba(241,245,249,0.82)_48%,rgba(226,232,240,0.7)),linear-gradient(90deg,rgba(56,189,248,0.12),transparent_32%,rgba(16,185,129,0.1)_100%)]" />
          <div className="absolute inset-0 pointer-events-none bg-[linear-gradient(120deg,transparent_0%,rgba(255,255,255,0.72)_46%,transparent_58%)]" />

          <div className="relative z-10 grid grid-cols-1 gap-8 p-5 sm:p-8 lg:grid-cols-12 lg:gap-10 lg:p-12">
            <div className="lg:col-span-7 text-right">
              <div className="mb-5 flex flex-wrap items-center justify-start gap-2">
                <span className="inline-flex items-center gap-1.5 rounded-full border border-slate-200 bg-white/80 px-3 py-1.5 text-[11px] font-black text-slate-700 shadow-sm backdrop-blur-md">
                  <Sparkles className="h-3.5 w-3.5 text-accent" />
                  تجربة صيانة بمعايير فاخرة
                </span>
                <span className="inline-flex items-center gap-1.5 rounded-full border border-emerald-100 bg-emerald-50 px-3 py-1.5 text-[11px] font-black text-emerald-700">
                  <BadgeCheck className="h-3.5 w-3.5" />
                  فحص أولي مجاني
                </span>
              </div>

              <h2 className="max-w-3xl text-3xl font-black leading-tight tracking-tight text-slate-950 sm:text-4xl lg:text-5xl">
                صيانة تشعر معها أن جهازك عاد جديدًا.
              </h2>
              <p className="mt-4 max-w-3xl text-sm font-medium leading-7 text-slate-500 sm:text-base">
                تجربة صيانة هادئة وواضحة من لحظة الفحص حتى التسليم: تشخيص دقيق، قطع أصلية، تحديث حالة الجهاز، وضمان حقيقي على القطع المستبدلة.
              </p>

              <div className="mt-7 grid gap-3 sm:grid-cols-3">
                {[
                  { icon: Eye, title: "تشخيص شفاف", desc: "نعرض سبب العطل قبل البدء" },
                  { icon: Cable, title: "قطع أصلية", desc: "شاشات، بطاريات ومنافذ معتمدة" },
                  { icon: ShieldCheck, title: "ضمان موثق", desc: "3 أيام على الصيانة والقطع" },
                ].map((item) => (
                  <div key={item.title} className="rounded-2xl border border-white bg-white/72 p-4 shadow-sm backdrop-blur-xl transition-all duration-300 hover:-translate-y-0.5 hover:shadow-md">
                    <div className="mb-3 inline-flex h-9 w-9 items-center justify-center rounded-full bg-slate-950 text-white shadow-sm">
                      <item.icon className="h-4 w-4" />
                    </div>
                    <h3 className="text-sm font-black text-slate-950">{item.title}</h3>
                    <p className="mt-1 text-[11px] font-semibold leading-5 text-slate-500">{item.desc}</p>
                  </div>
                ))}
              </div>

              <div className="mt-7 grid gap-3 rounded-[24px] border border-white bg-white/68 p-3 shadow-sm backdrop-blur-xl sm:grid-cols-4">
                {[
                  { value: "01", label: "استلام الجهاز" },
                  { value: "02", label: "فحص العطل" },
                  { value: "03", label: "تأكيد الكلفة" },
                  { value: "04", label: "تسليم بضمان" },
                ].map((step) => (
                  <div key={step.value} className="flex items-center gap-3 rounded-2xl bg-slate-50/80 p-3">
                    <span className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full bg-slate-950 font-mono text-[11px] font-black text-white">
                      {step.value}
                    </span>
                    <span className="text-xs font-black text-slate-700">{step.label}</span>
                  </div>
                ))}
              </div>

              <div className="mt-7 flex flex-col gap-3 sm:flex-row sm:items-center">
                <button
                  onClick={() => setIsRepairOpen(true)}
                  className="inline-flex items-center justify-center gap-2 rounded-full bg-slate-950 px-7 py-3.5 text-sm font-black text-white shadow-[0_16px_35px_rgba(15,23,42,0.18)] transition-all duration-200 hover:-translate-y-0.5 hover:bg-slate-800 active:scale-[0.99] cursor-pointer"
                >
                  <Wrench className="h-4 w-4" />
                  <span>احجز صيانة الآن</span>
                </button>

                <a
                  href={`https://wa.me/${siteSettings?.phone ? siteSettings.phone.replace(/[^\d+]/g, '') : ''}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center justify-center gap-2 rounded-full border border-slate-200 bg-white px-6 py-3.5 text-sm font-black text-slate-800 shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:border-emerald-200 hover:text-emerald-700 active:scale-[0.99] cursor-pointer"
                >
                  <MessageCircle className="h-4 w-4" />
                  <span>استشارة عبر واتساب</span>
                </a>
              </div>
            </div>

            <div className="lg:col-span-5">
              <div className="relative mx-auto flex min-h-[460px] max-w-[430px] items-center justify-center">
                <div className="relative z-10 w-full rounded-[32px] border border-white bg-white/78 p-4 shadow-[0_28px_80px_rgba(15,23,42,0.14)] backdrop-blur-2xl">
                  <div className="rounded-[26px] border border-slate-200 bg-slate-950 p-4 text-white shadow-inner">
                    <div className="mb-4 flex items-center justify-between gap-3">
                      <div className="flex items-center gap-2">
                        <span className="h-2.5 w-2.5 rounded-full bg-emerald-400 shadow-[0_0_0_5px_rgba(52,211,153,0.14)]" />
                        <span className="text-[11px] font-black text-slate-300">Live Diagnostics</span>
                      </div>
                      <span className="rounded-full border border-white/10 px-2.5 py-1 font-mono text-[10px] font-black text-slate-400">RWAN OS</span>
                    </div>

                    <div className="relative mx-auto mb-5 flex h-[235px] w-[128px] items-center justify-center rounded-[32px] border-[7px] border-slate-800 bg-gradient-to-b from-slate-900 via-slate-950 to-black shadow-[0_30px_55px_rgba(0,0,0,0.42)]">
                      <div className="absolute top-2 h-1.5 w-12 rounded-full bg-slate-800" />
                      <Smartphone className="h-16 w-16 text-accent/80" strokeWidth={1.5} />
                      <div className="absolute bottom-5 left-5 right-5 h-1.5 rounded-full bg-slate-800">
                        <div className="h-full w-[76%] rounded-full bg-accent" />
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-2">
                      {[
                        { icon: Cpu, label: "المعالج", value: "مستقر" },
                        { icon: Zap, label: "الشحن", value: "جاهز" },
                        { icon: Lock, label: "البيانات", value: "محمي" },
                        { icon: Clock, label: "الوقت", value: "30 دقيقة" },
                      ].map((item) => (
                        <div key={item.label} className="rounded-2xl border border-white/10 bg-white/[0.06] p-3">
                          <item.icon className="mb-2 h-4 w-4 text-accent" />
                          <span className="block text-[10px] font-bold text-slate-400">{item.label}</span>
                          <span className="block text-xs font-black text-white">{item.value}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="mt-3 grid grid-cols-3 gap-2">
                    {[
                      { value: "3 يوم", label: "ضمان" },
                      { value: "4 مراحل", label: "متابعة" },
                      { value: "أصلي", label: "قطع" },
                    ].map((stat) => (
                      <div key={stat.label} className="rounded-2xl bg-slate-50 p-3 text-center">
                        <span className="block text-sm font-black text-slate-950">{stat.value}</span>
                        <span className="block text-[10px] font-bold text-slate-500">{stat.label}</span>
                      </div>
                    ))}
                  </div>
                </div>
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

      {/* Premium Apple-Style Footer */}
      <footer id="contact" className="relative mt-12 text-right overflow-hidden">
        {/* Gradient divider */}
        <div className="footer-gradient-divider w-full" />

        {/* Decorative background */}
        <div className="relative bg-[#fafafa]">
          {/* Subtle dot grid pattern */}
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_1px_1px,rgba(148,163,184,0.08)_1px,transparent_0)] bg-[length:24px_24px] pointer-events-none" />
          {/* Ambient glow orbs */}
          <div className="absolute top-0 right-[15%] w-72 h-72 bg-sky-100/20 rounded-full blur-[100px] pointer-events-none" />
          <div className="absolute bottom-0 left-[10%] w-64 h-64 bg-emerald-100/15 rounded-full blur-[80px] pointer-events-none" />

          <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-14 sm:py-16">

            {/* Main footer grid */}
            <div className="grid grid-cols-1 md:grid-cols-12 gap-8 lg:gap-12">

              {/* Column 1: Brand — spans 4 cols */}
              <div className="md:col-span-4 space-y-5">
                <div className="flex items-center gap-4 sm:gap-5">
                  {siteSettings?.logo?.url ? (
                    <>
                      <img src={siteSettings.logo.url} alt="Logo" className="h-24 sm:h-28 w-auto object-contain drop-shadow-sm" />
                      <span className="text-2xl sm:text-3xl font-black text-[#1a1a1a] tracking-tight uppercase">

                      </span>
                    </>
                  ) : (
                    <div>
                      <span className="block text-2xl sm:text-3xl font-black text-[#1a1a1a] tracking-tight">
                        مركز الروان
                      </span>
                      <span className="block text-sm font-bold text-slate-400 uppercase font-mono tracking-widest mt-1">
                        Al-Rwan Center
                      </span>
                    </div>
                  )}
                </div>
                <p className="text-[13px] text-slate-500 leading-relaxed max-w-sm">
                  مركز الروان المعتمد لبيع وشراء الهواتف الذكية وحافظاتها الأنيقة والعصرية، والمركز المعتمد الأسرع في الصيانة بالمنطقة.
                </p>

                {/* Social Icons Row */}
                <div className="flex items-center gap-2.5 pt-1">
                  {siteSettings.socials.map((social, index) => {
                    // Map platform to SVG icon and hover color
                    const getSocialIcon = (platform: string) => {
                      const p = platform.toLowerCase();
                      if (p.includes("facebook") || p.includes("فيسبوك")) return (
                        <svg className="w-[18px] h-[18px]" viewBox="0 0 24 24" fill="currentColor"><path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" /></svg>
                      );
                      if (p.includes("instagram") || p.includes("إنستغرام") || p.includes("انستغرام") || p.includes("انستقرام")) return (
                        <svg className="w-[18px] h-[18px]" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z" /></svg>
                      );
                      if (p.includes("whatsapp") || p.includes("واتساب") || p.includes("واتس")) return (
                        <svg className="w-[18px] h-[18px]" viewBox="0 0 24 24" fill="currentColor"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" /></svg>
                      );
                      if (p.includes("tiktok") || p.includes("تيكتوك") || p.includes("تيك توك")) return (
                        <svg className="w-[18px] h-[18px]" viewBox="0 0 24 24" fill="currentColor"><path d="M12.525.02c1.31-.02 2.61-.01 3.91-.02.08 1.53.63 3.09 1.75 4.17 1.12 1.11 2.7 1.62 4.24 1.79v4.03c-1.44-.05-2.89-.35-4.2-.97-.57-.26-1.1-.59-1.62-.93-.01 2.92.01 5.84-.02 8.75-.08 1.4-.54 2.79-1.35 3.94-1.31 1.92-3.58 3.17-5.91 3.21-1.43.08-2.86-.31-4.08-1.03-2.02-1.19-3.44-3.37-3.65-5.71-.02-.5-.03-1-.01-1.49.18-1.9 1.12-3.72 2.58-4.96 1.66-1.44 3.98-2.13 6.15-1.72.02 1.48-.04 2.96-.04 4.44-.99-.32-2.15-.23-3.02.37-.63.41-1.11 1.04-1.36 1.75-.21.51-.15 1.07-.14 1.61.24 1.64 1.82 3.02 3.5 2.87 1.12-.01 2.19-.66 2.77-1.61.19-.33.4-.67.41-1.06.1-1.79.06-3.57.07-5.36.01-4.03-.01-8.05.02-12.07z" /></svg>
                      );
                      if (p.includes("snapchat") || p.includes("سناب") || p.includes("سناب شات")) return (
                        <svg className="w-[18px] h-[18px]" viewBox="0 0 24 24" fill="currentColor"><path d="M12.017 0C5.396 0 .029 5.367.029 11.987c0 5.079 3.158 9.417 7.618 11.162-.105-.949-.199-2.403.041-3.439.219-.937 1.406-5.957 1.406-5.957s-.359-.72-.359-1.781c0-1.668.967-2.914 2.171-2.914 1.023 0 1.518.769 1.518 1.69 0 1.029-.655 2.568-.994 3.995-.283 1.194.599 2.169 1.777 2.169 2.133 0 3.772-2.249 3.772-5.495 0-2.873-2.064-4.882-5.012-4.882-3.414 0-5.418 2.561-5.418 5.207 0 1.031.397 2.138.893 2.738a.36.36 0 01.083.345l-.333 1.36c-.053.22-.174.267-.402.161-1.499-.698-2.436-2.889-2.436-4.649 0-3.785 2.75-7.262 7.929-7.262 4.163 0 7.398 2.967 7.398 6.931 0 4.136-2.607 7.464-6.227 7.464-1.216 0-2.359-.631-2.75-1.378l-.748 2.853c-.271 1.043-1.002 2.35-1.492 3.146C9.57 23.812 10.763 24 12.017 24c6.624 0 11.99-5.367 11.99-11.988C24.007 5.367 18.641.001 12.017.001z" /></svg>
                      );
                      if (p.includes("telegram") || p.includes("تليغرام") || p.includes("تلغرام") || p.includes("تيليجرام")) return (
                        <svg className="w-[18px] h-[18px]" viewBox="0 0 24 24" fill="currentColor"><path d="M11.944 0A12 12 0 000 12a12 12 0 0012 12 12 12 0 0012-12A12 12 0 0012 0a12 12 0 00-.056 0zm4.962 7.224c.1-.002.321.023.465.14a.506.506 0 01.171.325c.016.093.036.306.02.472-.18 1.898-.962 6.502-1.36 8.627-.168.9-.499 1.201-.82 1.23-.696.065-1.225-.46-1.9-.902-1.056-.693-1.653-1.124-2.678-1.8-1.185-.78-.417-1.21.258-1.91.177-.184 3.247-2.977 3.307-3.23.007-.032.014-.15-.056-.212s-.174-.041-.249-.024c-.106.024-1.793 1.14-5.061 3.345-.479.33-.913.49-1.302.48-.428-.008-1.252-.241-1.865-.44-.752-.245-1.349-.374-1.297-.789.027-.216.325-.437.893-.663 3.498-1.524 5.83-2.529 6.998-3.014 3.332-1.386 4.025-1.627 4.476-1.635z" /></svg>
                      );
                      if (p.includes("twitter") || p.includes("تويتر") || p === "x") return (
                        <svg className="w-[16px] h-[16px]" viewBox="0 0 24 24" fill="currentColor"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" /></svg>
                      );
                      if (p.includes("youtube") || p.includes("يوتيوب")) return (
                        <svg className="w-[18px] h-[18px]" viewBox="0 0 24 24" fill="currentColor"><path d="M23.498 6.186a3.016 3.016 0 00-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 00.502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 002.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 002.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" /></svg>
                      );
                      // Default: globe icon
                      return <Globe className="w-[16px] h-[16px]" />;
                    };

                    const getHoverColor = (platform: string) => {
                      const p = platform.toLowerCase();
                      if (p.includes("facebook") || p.includes("فيسبوك")) return "hover:text-[#1877F2] hover:border-[#1877F2]/30 hover:bg-blue-50/50";
                      if (p.includes("instagram") || p.includes("إنستغرام") || p.includes("انستغرام") || p.includes("انستقرام")) return "hover:text-[#E4405F] hover:border-[#E4405F]/30 hover:bg-pink-50/50";
                      if (p.includes("whatsapp") || p.includes("واتساب") || p.includes("واتس")) return "hover:text-[#25D366] hover:border-[#25D366]/30 hover:bg-emerald-50/50";
                      if (p.includes("tiktok") || p.includes("تيكتوك")) return "hover:text-[#000000] hover:border-[#000]/20 hover:bg-slate-50";
                      if (p.includes("snapchat") || p.includes("سناب")) return "hover:text-[#FFFC00] hover:border-[#FFFC00]/40 hover:bg-yellow-50/50";
                      if (p.includes("telegram") || p.includes("تليغرام") || p.includes("تلغرام") || p.includes("تيليجرام")) return "hover:text-[#0088CC] hover:border-[#0088CC]/30 hover:bg-sky-50/50";
                      if (p.includes("twitter") || p.includes("تويتر") || p === "x") return "hover:text-[#000000] hover:border-[#000]/20 hover:bg-slate-50";
                      if (p.includes("youtube") || p.includes("يوتيوب")) return "hover:text-[#FF0000] hover:border-[#FF0000]/30 hover:bg-red-50/50";
                      return "hover:text-accent hover:border-accent/30";
                    };

                    return (
                      <a
                        key={index}
                        href={social.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className={`social-icon-glow flex items-center justify-center w-10 h-10 rounded-xl border border-slate-200/80 bg-white text-slate-400 shadow-sm ${getHoverColor(social.platform || social.name)}`}
                        title={social.name}
                      >
                        {getSocialIcon(social.platform || social.name)}
                      </a>
                    );
                  })}
                </div>
              </div>

              {/* Column 2: Quick links — spans 2 cols */}
              <div className="md:col-span-2 space-y-4">
                <h4 className="font-black text-sm text-[#1a1a1a] flex items-center gap-2">
                  <span className="w-1 h-4 bg-accent rounded-full" />
                  روابط سريعة
                </h4>
                <ul className="text-[13px] text-slate-500 space-y-3">
                  <li><a href="#" className="hover:text-accent transition-colors duration-200 hover:translate-x-[-2px] inline-block">الرئيسية</a></li>
                  <li><a href="#categories" className="hover:text-accent transition-colors duration-200 hover:translate-x-[-2px] inline-block">الأقسام الرئيسية</a></li>
                  <li><a href="#products" className="hover:text-accent transition-colors duration-200 hover:translate-x-[-2px] inline-block">المنتجات المميزة</a></li>
                  <li><a href="#repair" className="hover:text-accent transition-colors duration-200 hover:translate-x-[-2px] inline-block">خدمة الصيانة المعتمدة</a></li>
                </ul>
              </div>

              {/* Column 3: Policy — spans 2 cols */}
              <div className="md:col-span-2 space-y-4">
                <h4 className="font-black text-sm text-[#1a1a1a] flex items-center gap-2">
                  <span className="w-1 h-4 bg-emerald-400 rounded-full" />
                  السياسات والضمان
                </h4>
                <ul className="text-[13px] text-slate-500 space-y-3">
                  <li><Link href="/policies/return" className="hover:text-accent transition-colors duration-200">سياسة الاسترجاع</Link></li>
                  <li><Link href="/policies/warranty" className="hover:text-accent transition-colors duration-200">ضمان الأجهزة والقطع</Link></li>
                  <li><Link href="/policies/repair-terms" className="hover:text-accent transition-colors duration-200">شروط موعد الصيانة</Link></li>
                  <li><Link href="/policies/shipping" className="hover:text-accent transition-colors duration-200">خدمة التوصيل والشحن</Link></li>
                </ul>
              </div>

              {/* Column 4: Premium Showroom Location Card — spans 4 cols */}
              <div className="md:col-span-4 space-y-4">
                <h4 className="font-black text-sm text-[#1a1a1a] flex items-center gap-2">
                </h4>
                <div className="rounded-[20px] border border-slate-200/80 bg-white p-5 shadow-[0_4px_24px_rgba(0,0,0,0.03)] space-y-4">
                  <div className="flex items-start gap-3 justify-start">
                    <div className="p-2.5 bg-gradient-to-br from-sky-50 to-sky-100/50 text-accent rounded-xl flex-shrink-0 mt-0.5 shadow-sm">
                      <MapPin className="w-4 h-4" />
                    </div>
                    <div className="text-right">
                      <span className="block text-[13px] font-black text-slate-900">مركز الروان - الصالحية</span>
                      <span className="block text-[12px] text-slate-500 mt-1 leading-relaxed">
                        العراق، الناصرية، الصالحية، شارع التقاعد، قرب دائرة التقاعد.
                      </span>
                    </div>
                  </div>

                  <div className="h-px bg-gradient-to-l from-transparent via-slate-200 to-transparent" />

                  <div className="flex items-start gap-3 justify-start">
                    <div className="p-2.5 bg-gradient-to-br from-emerald-50 to-emerald-100/50 text-emerald-500 rounded-xl flex-shrink-0 mt-0.5 shadow-sm">
                      <Clock className="w-4 h-4" />
                    </div>
                    <div className="text-right">
                      <span className="block text-[13px] font-black text-slate-900">ساعات الاستقبال</span>
                      <span className="block text-[12px] text-slate-500 mt-1">
                        يومياً: 3:00 م - 12:00 م
                      </span>
                    </div>
                  </div>

                  <a
                    href="https://maps.app.goo.gl/eaSEpATVXLuQzidh7?g_st=ic"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="mt-1 w-full inline-flex items-center justify-center gap-2 rounded-xl bg-[#1a1a1a] py-3 text-[12px] font-black text-white shadow-md transition-all hover:bg-slate-800 hover:shadow-lg active:scale-[0.99] text-center"
                  >
                    <Globe className="w-3.5 h-3.5" />
                    <span>الاتجاهات في خرائط Google</span>
                  </a>
                </div>
              </div>

            </div>

            {/* Bottom bar */}
            <div className="mt-12 pt-8 relative">
              {/* Gradient line separator */}
              <div className="absolute top-0 inset-x-0 h-px bg-gradient-to-l from-transparent via-slate-300/50 to-transparent" />

              <div className="flex flex-col lg:flex-row items-center justify-between text-center gap-4">
                <div className="text-[12px] text-slate-400 font-medium">
                  &copy; {new Date().getFullYear()} مركز الروان (Al-Rwan Center). جميع الحقوق محفوظة.
                </div>
                
                {/* Developer Info */}
                <a 
                  href="https://med-pc.vercel.app/" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 group transition-all hover:scale-105"
                  title="مطور الموقع Mohammed.N"
                >
                  <span className="text-[11px] text-slate-400 group-hover:text-accent transition-colors font-medium">
                    تطوير وتصميم
                  </span>
                  <div className="w-7 h-7 rounded-lg overflow-hidden bg-slate-200/50 flex items-center justify-center text-slate-500 group-hover:ring-2 ring-accent transition-all">
                    {/* 
                      أضف الشعار الخاص بك في مجلد public 
                      باسم developer-logo.png
                      وإذا كان الامتداد يختلف قم بتغييره أدناه
                    */}
                    <img 
                      src="/developer-logo.png" 
                      alt="Mohammed.N Logo" 
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        // في حال لم يتم وضع الشعار بعد، نعرض أيقونة افتراضية
                        e.currentTarget.style.display = 'none';
                        e.currentTarget.parentElement?.classList.add('p-1.5');
                        const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
                        svg.setAttribute('viewBox', '0 0 24 24');
                        svg.setAttribute('fill', 'none');
                        svg.setAttribute('stroke', 'currentColor');
                        svg.innerHTML = '<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" />';
                        e.currentTarget.parentElement?.appendChild(svg);
                      }}
                    />
                  </div>
                  <span className="text-[12px] font-bold text-slate-500 group-hover:text-accent transition-colors">
                    Mohammed.N
                  </span>
                </a>

                <div className="flex items-center gap-3 text-[11px] text-slate-400">
                  <span className="flex items-center gap-1.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                    <span className="font-bold">المتجر متاح الآن</span>
                  </span>
                  <span className="text-slate-300">•</span>
                  <span className="font-bold">توصيل لجميع المحافظات</span>
                </div>
              </div>
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
        appliedCoupon={appliedCoupon}
        couponDiscount={couponDiscount}
        onApplyCoupon={(code) => {
          const subtotal = cartItems.reduce((acc, curr) => acc + (curr.product.discountPrice || curr.product.price) * curr.quantity, 0);
          return applyCoupon(code, "store", subtotal);
        }}
        onClearCoupon={clearAppliedCoupon}
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
        appliedCoupon={appliedCoupon}
        couponDiscount={couponDiscount}
      />

      {/* Product Detail Modal */}
      {selectedProduct && (
        <ProductDetailModal
          key={selectedProduct.id}
          product={selectedProduct}
          isOpen={!!selectedProduct}
          onClose={() => setSelectedProduct(null)}
          onAddToCart={(prod, color, port) => {
            handleAddToCart(prod, color, port);
          }}
          allProducts={products}
          onSelectProduct={(prod) => setSelectedProduct(prod)}
        />
      )}

      {/* Promotional Pop-up Modal */}
      <PromoPopUp />

      {/* Splash Loading Screen */}
      <SplashLoader />

      {/* Back to Top Button */}
      <BackToTop />

      {/* Premium Floating WhatsApp Button */}
      <a
        href={`https://wa.me/${siteSettings?.phone ? siteSettings.phone.replace(/[^\d+]/g, '') : ''}`}
        target="_blank"
        rel="noopener noreferrer"
        className="fixed bottom-6 right-6 z-50 hidden md:flex items-center justify-center w-14 h-14 bg-emerald-500 hover:bg-emerald-600 text-white rounded-full shadow-2xl transition-all duration-300 hover:scale-110 active:scale-95 group cursor-pointer"
        aria-label="تواصل معنا عبر واتساب"
        title="تواصل معنا مباشرة عبر واتساب"
      >
        <span className="absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75 animate-ping -z-10 group-hover:animate-none"></span>
        <MessageCircle className="w-7 h-7" />
        <span className="absolute right-16 scale-0 bg-[#1a1a1a] text-white text-[10px] font-bold py-2 px-3.5 rounded-xl whitespace-nowrap shadow-md transition-all duration-200 origin-right group-hover:scale-100 opacity-0 group-hover:opacity-100 flex items-center gap-1">
          <span>تواصل معنا مباشرة عبر واتساب</span>
          <span className="w-2 h-2 rounded-full bg-emerald-500 inline-block animate-pulse"></span>
        </span>
      </a>

    </div>
  );
}