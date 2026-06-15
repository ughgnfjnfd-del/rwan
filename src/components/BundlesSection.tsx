"use client";

import React from "react";
import { useApp } from "@/context/AppContext";
import ProductMockup from "./ProductMockup";
import { ShoppingBag, Sparkles, Plus } from "lucide-react";

export default function BundlesSection() {
  const { productBundles, products, addBundleToCart } = useApp();

  if (!productBundles || productBundles.length === 0) {
    return null;
  }

  return (
    <section className="space-y-6 text-right" dir="rtl">
      <div>
        <h2 className="text-xl sm:text-2xl font-extrabold text-[#1a1a1a] flex items-center gap-2 justify-start">
          <Sparkles className="w-5 h-5 text-accent animate-pulse" />
          حزم صفقات التوفير الكبرى (Bundles)
        </h2>
        <p className="text-xs text-slate-500">مجموعات منسقة بعناية من المنتجات والملحقات بأسعار مخفضة وخصومات مذهلة</p>
      </div>

      <div className="flex md:grid overflow-x-auto md:overflow-x-visible gap-6 pb-4 md:pb-0 px-4 -mx-4 md:px-0 md:mx-0 scrollbar-none snap-x snap-mandatory md:grid-cols-2">
        {productBundles.map((bundle) => {
          // Find the products in this bundle
          const bundleProds = bundle.productIds
            .map((pid) => products.find((p) => p.id === pid))
            .filter((p): p is typeof products[0] => !!p);

          if (bundleProds.length === 0) return null;

          // Calculate sum of individual prices
          const originalTotal = bundleProds.reduce((acc, curr) => acc + curr.price, 0);
          const totalSavings = originalTotal - bundle.price;

          return (
            <div
              key={bundle.id}
              className={`rounded-3xl p-6 relative overflow-hidden border border-white/10 shadow-xl flex flex-col justify-between gap-6 bg-gradient-to-br ${bundle.bgStyle || "from-indigo-650 via-purple-650 to-pink-600"} text-white group flex-shrink-0 w-[290px] xs:w-[320px] md:w-auto snap-start`}
            >
              {/* Glowing bubbles behind */}
              <div className="absolute top-0 right-0 w-36 h-36 bg-white/10 rounded-full blur-2xl pointer-events-none"></div>
              <div className="absolute bottom-0 left-0 w-36 h-36 bg-black/10 rounded-full blur-2xl pointer-events-none"></div>

              {/* Top Row: Bundle Details */}
              <div className="space-y-2 z-10">
                <div className="flex justify-between items-start">
                  <span className="bg-white/20 text-white backdrop-blur-md border border-white/10 text-[9px] font-extrabold px-2.5 py-0.5 rounded-full uppercase">
                    حزمة ترويجية
                  </span>
                  {totalSavings > 0 && (
                    <span className="bg-emerald-500 text-white font-extrabold text-[10px] px-2.5 py-0.5 rounded-full shadow bg-emerald-500">
                      توفير {totalSavings.toLocaleString()} د.ع!
                    </span>
                  )}
                </div>
                <h3 className="text-lg font-black">{bundle.title}</h3>
                <p className="text-xs text-white/80 leading-relaxed max-w-md">{bundle.description}</p>
              </div>

              {/* Center Row: Products Showcase (Overlapping design) */}
              <div className="flex justify-center items-center gap-4 py-4 z-10 flex-wrap">
                {bundleProds.map((product, idx) => (
                  <React.Fragment key={product.id}>
                    {idx > 0 && (
                      <div className="w-6 h-6 rounded-full bg-white/10 border border-white/10 flex items-center justify-center font-bold text-white shadow-inner">
                        <Plus className="w-3.5 h-3.5" />
                      </div>
                    )}
                    <div 
                      className="bg-white/10 border border-white/10 p-3 rounded-2xl flex items-center justify-center w-24 h-32 backdrop-blur-md shadow-lg transition-transform duration-300 group-hover:scale-105"
                      title={product.name}
                    >
                      <ProductMockup image={product.image} name={product.name} sizeClass="w-14 aspect-[9/18]" />
                    </div>
                  </React.Fragment>
                ))}
              </div>

              {/* Bottom Row: Prices & CTA */}
              <div className="flex items-center justify-between border-t border-white/10 pt-4 mt-2 z-10">
                <div className="flex flex-col text-right">
                  {totalSavings > 0 && (
                    <span className="text-[10px] text-white/50 line-through font-mono">
                      {originalTotal.toLocaleString()} د.ع
                    </span>
                  )}
                  <span className="text-lg font-black font-mono">
                    {bundle.price.toLocaleString()} د.ع
                  </span>
                </div>

                <button
                  onClick={() => {
                    addBundleToCart(bundle.productIds);
                    alert("تم إضافة الحزمة كاملة إلى السلة بنجاح! 🛍️");
                  }}
                  className="bg-white hover:bg-slate-100 text-slate-900 text-xs font-extrabold py-3 px-6 rounded-2xl flex items-center gap-2 shadow-lg hover:scale-[1.01] active:scale-[0.99] transition-all cursor-pointer"
                >
                  <ShoppingBag className="w-4 h-4 text-slate-900" />
                  <span>شراء الحزمة كاملة</span>
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}
