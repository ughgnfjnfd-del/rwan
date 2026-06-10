"use client";

import React, { useState } from "react";
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
  Lock
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

interface ProductDetailModalProps {
  product: Product;
  isOpen: boolean;
  onClose: () => void;
  onAddToCart: (product: Product) => void;
  allProducts: Product[];
  onSelectProduct: (product: Product) => void;
}

function ProductDetailModal({ product, isOpen, onClose, onAddToCart, allProducts, onSelectProduct }: ProductDetailModalProps) {
  const [qty, setQty] = useState(1);

  if (!isOpen) return null;

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

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" dir="rtl">
      {/* Backdrop */}
      <div className="fixed inset-0 bg-black/55 backdrop-blur-sm transition-opacity" onClick={onClose}></div>
      
      {/* Modal Box */}
      <div className="relative bg-white rounded-3xl border border-slate-100 shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-y-auto z-10 flex flex-col md:flex-row font-sans text-right animate-in fade-in-50 zoom-in-95 duration-200">
        
        {/* Left Column: Visual Mockup Showcase */}
        <div className="md:w-5/12 bg-slate-50 border-l border-slate-100 p-8 flex flex-col items-center justify-center relative min-h-[300px] md:min-h-0">
          <div className="absolute top-4 left-4 bg-slate-100 text-slate-500 font-mono text-[9px] px-2.5 py-1 rounded-full font-bold uppercase select-none">
            {product.image}
          </div>
          <div className="scale-125 md:scale-150 transform transition-transform duration-300 py-8">
            <ProductMockup image={product.image} name={product.name} sizeClass="w-32 aspect-[9/18]" />
          </div>
        </div>

        {/* Right Column: Information & Actions */}
        <div className="md:w-7/12 p-6 md:p-8 flex flex-col justify-between space-y-6">
          {/* Header */}
          <div className="space-y-3">
            <div className="flex justify-between items-start">
              <span className="bg-accent/10 text-accent font-bold text-xs px-3 py-1 rounded-full">
                {product.category}
              </span>
              <button onClick={onClose} className="p-1.5 rounded-full hover:bg-slate-100 text-slate-400 cursor-pointer text-sm">
                ✕
              </button>
            </div>
            <h2 className="text-xl sm:text-2xl font-extrabold text-slate-800 leading-tight">
              {product.name}
            </h2>
            {product.nameEn && (
              <p className="text-xs sm:text-sm font-semibold text-slate-400 font-mono" dir="ltr">
                {product.nameEn}
              </p>
            )}
            <div className="flex items-center gap-1.5 text-amber-500">
              <div className="flex gap-0.5">
                {[1, 2, 3, 4, 5].map((s) => (
                  <Star key={s} className="w-3.5 h-3.5 fill-amber-500 text-amber-500" />
                ))}
              </div>
              <span className="text-xs font-bold text-slate-500">4.9 (24 تقييم)</span>
            </div>
          </div>

          {/* Description */}
          <div className="space-y-1.5">
            <h4 className="font-extrabold text-sm text-slate-800">وصف المنتج</h4>
            <p className="text-xs text-slate-500 leading-relaxed">
              {defaultDesc}
            </p>
          </div>

          {/* Specifications */}
          <div className="space-y-2">
            <h4 className="font-extrabold text-sm text-slate-800">المواصفات الفنية</h4>
            <ul className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-[11px] text-slate-500 list-disc list-inside">
              {defaultSpecs.map((spec, index) => (
                <li key={index} className="leading-tight">
                  <span className="mr-1">{spec}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Add to Cart Actions */}
          <div className="border-t border-slate-100 pt-4 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex flex-col text-right">
              <span className="text-[10px] text-slate-400 font-bold">السعر الإجمالي</span>
              <span className="text-lg sm:text-xl font-extrabold text-slate-800">
                {((product.discountPrice || product.price) * qty).toLocaleString()} د.ع
              </span>
              {product.discountPrice && (
                <span className="text-[10px] text-slate-400 line-through font-mono">
                  {(product.price * qty).toLocaleString()} د.ع
                </span>
              )}
            </div>

            <div className="flex items-center gap-3 w-full sm:w-auto justify-end">
              {/* Quantity selector */}
              <div className="flex items-center border border-slate-200 rounded-xl bg-slate-50 overflow-hidden">
                <button
                  onClick={() => setQty(Math.max(1, qty - 1))}
                  className="px-3.5 py-2 hover:bg-slate-100 text-slate-500 font-bold transition-colors cursor-pointer"
                >
                  -
                </button>
                <span className="px-4 text-xs font-extrabold text-slate-800 font-mono">
                  {qty}
                </span>
                <button
                  onClick={() => setQty(qty + 1)}
                  className="px-3.5 py-2 hover:bg-slate-100 text-slate-500 font-bold transition-colors cursor-pointer"
                >
                  +
                </button>
              </div>

              <button
                onClick={() => {
                  for (let i = 0; i < qty; i++) {
                    onAddToCart(product);
                  }
                  onClose();
                }}
                className="flex-1 sm:flex-initial bg-[#1a1a1a] hover:bg-slate-800 text-white font-bold text-xs px-6 py-3 rounded-xl transition-all shadow-md flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <ShoppingBag className="w-4 h-4" />
                أضف للسلة
              </button>
            </div>
          </div>



          {/* Related Products section */}
          {related.length > 0 && (
            <div className="border-t border-slate-100 pt-4 space-y-3">
              <h4 className="font-extrabold text-sm text-slate-800">منتجات قد تعجبك أيضاً</h4>
              <div className="grid grid-cols-3 gap-3">
                {related.map((p) => (
                  <div
                    key={p.id}
                    onClick={() => {
                      onSelectProduct(p);
                      setQty(1);
                    }}
                    className="border border-slate-100 bg-slate-50/50 hover:bg-white hover:shadow hover:border-slate-200 rounded-xl p-2.5 text-center flex flex-col items-center gap-2 cursor-pointer transition-all duration-200"
                  >
                    <div className="scale-75 my-1">
                      <ProductMockup image={p.image} name={p.name} sizeClass="w-12 aspect-[9/18]" />
                    </div>
                    <span className="text-[10px] font-bold text-slate-700 truncate w-full" title={p.name}>
                      {p.name}
                    </span>
                    <span className="text-[9px] font-extrabold text-slate-500 font-mono">
                      {p.price.toLocaleString()} د.ع
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
  const handleAddToCart = (product: Product) => {
    addToCart(product);
    setIsCartOpen(true);
  };

  const handleUpdateQuantity = (productId: string, quantity: number) => {
    updateCartQuantity(productId, quantity);
  };

  const handleRemoveItem = (productId: string) => {
    removeFromCart(productId);
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

  // Filtered Products
  const isSearching = searchQuery.trim() !== "";
  const displayProducts = isSearching 
    ? products 
    : (showAllProducts ? products : products.filter((p) => p.isPopular));

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
  const activeCategories = ["موبايلات", "ملحقات"].filter((cat) =>
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
                Raw an Center
              </span>
            </div>
            <div className="w-1.5 h-8 bg-accent rounded-full hidden sm:block"></div>
          </div>

          {/* Center: Desktop Menu */}
          <nav className="hidden md:flex items-center gap-8 text-sm font-semibold text-slate-600">
            <a href="#" className="text-accent transition-colors hover:text-[#1a1a1a]">الرئيسية</a>
            <a href="#categories" className="hover:text-accent transition-colors">موبايلات</a>
            <a href="#categories" className="hover:text-accent transition-colors">ملحقات</a>
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
                <span className="block text-[9px] font-bold text-slate-400 uppercase font-mono">Raw an Center</span>
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

        {/* Flash Sale Countdown Deal */}
        <FlashSaleBanner />

        {/* Dynamic Custom Promo Banner */}
        {siteSettings.promoBanner?.isEnabled && (
          <section
            className={`rounded-3xl p-6 sm:p-8 lg:p-10 relative overflow-hidden shadow-xl border flex flex-col md:flex-row items-center justify-between gap-6 transition-all duration-300 ${
              siteSettings.promoBanner.bgStyle === "glass-blue"
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

        {/* 3. Bento Grid Categories */}
        <section id="categories" className="space-y-6">
          <div className="text-right">
            <h2 className="text-xl sm:text-2xl font-extrabold text-[#1a1a1a]">تصفح الأقسام الرئيسية</h2>
            <p className="text-xs text-slate-500">اختر القسم الذي ترغب في استكشافه أو طلب خدماته</p>
          </div>

          <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
            
            {/* Category Card 1: Mobiles */}
            <div
              onClick={() => setActiveCategory("موبايلات")}
              className={`p-5 rounded-2xl border text-right transition-all duration-200 hover:shadow-md cursor-pointer group flex flex-col justify-between h-40 ${
                activeCategory === "موبايلات"
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

            {/* Category Card 2: Accessories */}
            <div
              onClick={() => setActiveCategory("ملحقات")}
              className={`p-5 rounded-2xl border text-right transition-all duration-200 hover:shadow-md cursor-pointer group flex flex-col justify-between h-40 ${
                activeCategory === "ملحقات"
                  ? "bg-slate-50 border-accent/60 ring-1 ring-accent/60"
                  : "bg-white border-card-border hover:border-slate-300"
              }`}
            >
              <div className="p-2.5 bg-slate-100 rounded-xl text-slate-700 w-fit group-hover:scale-105 transition-transform duration-200">
                <Headphones className="w-5 h-5 text-[#1a1a1a]" />
              </div>
              <div>
                <h3 className="font-extrabold text-sm sm:text-base text-[#1a1a1a] mb-1">ملحقات</h3>
                <p className="text-[10px] text-slate-500 leading-normal">
                  سماعات، شواحن، كابلات، وحافظات أصلية فاخرة.
                </p>
              </div>
            </div>

            {/* Category Card 3: Repair Services */}
            <div
              onClick={() => {
                setIsRepairOpen(true);
              }}
              className="bg-white border border-card-border p-5 rounded-2xl text-right transition-all duration-200 hover:border-slate-300 hover:shadow-md cursor-pointer group flex flex-col justify-between h-40"
            >
              <div className="p-2.5 bg-slate-100 rounded-xl text-slate-700 w-fit group-hover:scale-105 transition-transform duration-200">
                <Wrench className="w-5 h-5 text-[#1a1a1a]" />
              </div>
              <div>
                <h3 className="font-extrabold text-sm sm:text-base text-[#1a1a1a] mb-1">خدمات صيانة</h3>
                <p className="text-[10px] text-slate-500 leading-normal">
                  فحص مجاني فوري وصيانة سريعة موثوقة.
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
              {["الكل", "موبايلات", "ملحقات"].map((cat) => (
                <button
                  key={cat}
                  onClick={() => setActiveCategory(cat)}
                  className={`text-xs font-bold px-4 py-2 rounded-lg border transition-all cursor-pointer ${
                    activeCategory === cat
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
                      {catProds.map((product) => (
                        <div
                          key={product.id}
                          onClick={() => setSelectedProduct(product)}
                          className="bg-white border border-card-border rounded-2xl overflow-hidden hover:shadow-lg hover:border-slate-200 transition-all duration-300 flex flex-col group cursor-pointer"
                        >
                          {/* Visual product preview box */}
                          <div className="aspect-square bg-slate-50 p-4 sm:p-6 flex items-center justify-center relative overflow-hidden border-b border-card-border">
                            {/* Add to Wishlist overlay */}
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                toggleWishlist(product.id);
                              }}
                              className="absolute top-2.5 left-2.5 bg-white p-1.5 rounded-full shadow-sm hover:scale-105 border border-slate-100 text-slate-400 hover:text-rose-500 transition-all cursor-pointer z-10"
                            >
                              <Heart className={`w-3 h-3 sm:w-3.5 sm:h-3.5 ${wishlist.includes(product.id) ? "fill-rose-500 text-rose-500" : ""}`} />
                            </button>

                            {product.discountPrice && product.discountPrice > 0 ? (
                              <span className="absolute top-2.5 right-2.5 bg-rose-600 text-white text-[8px] sm:text-[9px] font-extrabold px-2 py-0.5 rounded-full shadow-xs flex items-center gap-0.5 z-10 animate-pulse">
                                خصم {Math.round((1 - (product.discountPrice / product.price)) * 100)}%
                              </span>
                            ) : product.isPopular && (
                              <span className="absolute top-2.5 right-2.5 bg-amber-500 text-white text-[8px] sm:text-[9px] font-extrabold px-2 py-0.5 rounded-full shadow-xs flex items-center gap-0.5 z-10">
                                شائع
                              </span>
                            )}

                            <ProductMockup image={product.image} name={product.name} />
                          </div>

                          {/* Info */}
                          <div className="p-3 sm:p-4 flex-1 flex flex-col justify-between text-right space-y-2.5">
                            <div className="space-y-1">
                              <div className="flex justify-between items-center text-[9px] sm:text-[10px]">
                                <span className="text-slate-400 font-medium truncate max-w-[70px]" title={product.nameEn}>
                                  {product.nameEn}
                                </span>
                                <div className="flex items-center gap-0.5 text-amber-500">
                                  <Star className="w-2.5 h-2.5 fill-amber-500" />
                                  <span className="font-bold">4.9</span>
                                </div>
                              </div>
                              <h3 className="font-extrabold text-xs sm:text-sm text-slate-800 group-hover:text-accent transition-colors duration-200 leading-tight line-clamp-2 min-h-[2rem]">
                                {product.name}
                              </h3>
                            </div>

                            <div className="flex items-center justify-between pt-1 border-t border-slate-50">
                              <div className="flex flex-col text-right">
                                {product.discountPrice ? (
                                  <>
                                    <span className="text-[9px] text-slate-400 line-through font-mono leading-none mb-0.5">
                                      {product.price.toLocaleString()} د.ع
                                    </span>
                                    <span className="font-extrabold text-xs sm:text-sm text-rose-600 font-mono leading-none">
                                      {product.discountPrice.toLocaleString()} د.ع
                                    </span>
                                  </>
                                ) : (
                                  <span className="font-extrabold text-xs sm:text-sm text-slate-800 font-mono">
                                    {product.price.toLocaleString()} د.ع
                                  </span>
                                )}
                              </div>
                              
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleAddToCart(product);
                                }}
                                className="bg-[#1a1a1a] hover:bg-slate-800 text-white text-[10px] sm:text-xs font-bold px-2.5 py-1.5 rounded-lg transition-colors flex items-center gap-1 cursor-pointer"
                              >
                                <ShoppingBag className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
                                <span className="hidden sm:inline">أضف للسلة</span>
                              </button>
                            </div>
                          </div>

                        </div>
                      ))}
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

        {/* 6. Extra Bento: Store Information & About Us */}
        <section id="about" className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Card 1: Work Hours */}
          <div className="bg-slate-50 border border-card-border p-6 rounded-2xl text-right space-y-3 hover:border-slate-300 transition-colors">
            <div className="p-2.5 bg-white rounded-xl border border-slate-100 text-slate-700 w-fit">
              <Clock className="w-5 h-5 text-accent" />
            </div>
            <h3 className="font-extrabold text-base text-[#1a1a1a]">ساعات العمل</h3>
            <p className="text-xs text-slate-500 leading-relaxed">
              نحن جاهزون لخدمتكم طوال أيام الأسبوع: <br />
              <strong></strong> من 3:00 مساءً حتى 12:00 مساءً. <br />
              <strong>الجمعة</strong>: من 3:00 مساءً حتى 12:00 مساءً.
            </p>
          </div>

          {/* Card 2: Location */}
          <div className="bg-slate-50 border border-card-border p-6 rounded-2xl text-right space-y-3 hover:border-slate-300 transition-colors">
            <div className="p-2.5 bg-white rounded-xl border border-slate-100 text-slate-700 w-fit">
              <MapPin className="w-5 h-5 text-accent" />
            </div>
            <h3 className="font-extrabold text-base text-[#1a1a1a]">موقع المعرض</h3>
            <p className="text-xs text-slate-500 leading-relaxed">
              العراق، الناصرية، الصالحية، شارع التقاعد. <br />
            </p>
          </div>

          {/* Card 3: Support */}
          <div className="bg-slate-50 border border-card-border p-6 rounded-2xl text-right space-y-3 hover:border-slate-300 transition-colors">
            <div className="p-2.5 bg-white rounded-xl border border-slate-100 text-slate-700 w-fit">
              <Phone className="w-5 h-5 text-accent" />
            </div>
            <h3 className="font-extrabold text-base text-[#1a1a1a]">الاتصال المباشر</h3>
            <p className="text-xs text-slate-500 leading-relaxed">
              للاستفسارات والطلبات الخاصة: <br />
              رقم الهاتف: <strong dir="ltr" className="inline-block text-left">{siteSettings.phone}</strong> <br />
              البريد الإلكتروني: <strong>{siteSettings.email}</strong>
            </p>
          </div>
        </section>

      </main>

      {/* Footer */}
      <footer id="contact" className="bg-slate-50 border-t border-card-border py-12 mt-12 text-right">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            
            {/* Column 1: Brand */}
            <div className="space-y-4">
              <div>
                <span className="block text-lg font-extrabold text-[#1a1a1a]">مركز الروان</span>
                <span className="block text-xs font-bold text-slate-400 uppercase font-mono">Raw an Center</span>
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
              &copy; {new Date().getFullYear()} مركز الروان (Raw an Center). جميع الحقوق محفوظة.
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
          product={selectedProduct}
          isOpen={!!selectedProduct}
          onClose={() => setSelectedProduct(null)}
          onAddToCart={(prod) => {
            handleAddToCart(prod);
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
