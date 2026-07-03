"use client";

import React, { useEffect } from "react";
import { X, Trash2, ShoppingBag, Heart } from "lucide-react";
import { Product } from "@/context/AppContext";

interface WishlistDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  items: Product[];
  onRemoveItem: (productId: string) => void;
  onAddToCart: (product: Product) => void;
}

export default function WishlistDrawer({
  isOpen,
  onClose,
  items,
  onRemoveItem,
  onAddToCart,
}: WishlistDrawerProps) {
  // Prevent background scrolling when drawer is open
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

  return (
    <>
      {/* Backdrop */}
      <div
        className={`fixed inset-0 z-50 bg-black/40 backdrop-blur-sm transition-opacity duration-300 ${isOpen ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"
          }`}
        onClick={onClose}
      />

      {/* Drawer Container (Right Side Slide-Over) */}
      <div
        className={`fixed top-0 bottom-0 right-0 z-50 w-full max-w-md bg-white shadow-2xl border-l border-card-border transition-transform duration-300 transform ${isOpen ? "translate-x-0" : "translate-x-full"
          } flex flex-col text-right`}
        dir="rtl"
      >
        {/* Header */}
        <div className="p-5 border-b border-card-border flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Heart className="w-5 h-5 text-rose-500 fill-rose-500" />
            <h2 className="text-lg font-bold">المفضلة</h2>
            <span className="bg-rose-50 text-rose-600 border border-rose-100 font-semibold text-xs px-2.5 py-0.5 rounded-full">
              {items.length} منتجات
            </span>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-full hover:bg-slate-100 transition-colors text-slate-400 hover:text-slate-650"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-5 space-y-4">
          {items.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-center space-y-4 py-20">
              <div className="p-4 bg-slate-50 rounded-full text-rose-400">
                <Heart className="w-10 h-10" />
              </div>
              <p className="text-slate-500 font-medium text-sm">قائمة المفضلة فارغة حالياً</p>
              <button
                onClick={onClose}
                className="text-xs bg-accent text-white px-4 py-2 rounded-lg font-bold hover:bg-accent-hover transition-colors shadow-sm cursor-pointer"
              >
                استكشف المنتجات
              </button>
            </div>
          ) : (
            items.map((product) => (
              <div
                key={product.id}
                className="flex gap-4 p-3 border border-card-border rounded-xl hover:shadow-sm transition-shadow duration-200"
              >
                {/* Product Image representation */}
                <div className="w-20 h-20 bg-slate-50 rounded-lg overflow-hidden flex items-center justify-center border border-slate-100 flex-shrink-0 relative">
                  <div className="text-[10px] text-slate-400 font-semibold uppercase p-1 text-center font-mono">
                    {product.nameEn}
                  </div>
                </div>

                {/* Details */}
                <div className="flex-1 flex flex-col justify-between min-w-0">
                  <div>
                    <h4 className="font-bold text-sm text-[#1a1a1a] truncate">
                      {product.name}
                    </h4>
                    <span className="text-xs text-slate-400 uppercase">
                      {product.category}
                    </span>
                  </div>

                  <div className="flex items-center justify-between mt-2">
                    <span className="font-bold text-sm text-[#1a1a1a] font-mono">
                      {product.price.toLocaleString()} د.ع
                    </span>

                    <div className="flex items-center gap-2">
                      {/* Add to Cart from Wishlist */}
                      <button
                        onClick={() => {
                          onAddToCart(product);
                          // Option to keep in wishlist or remove, keeping is standard
                        }}
                        className="bg-[#1a1a1a] hover:bg-slate-800 text-white text-[10px] sm:text-xs font-bold px-2.5 py-1.5 rounded-lg transition-colors flex items-center gap-1 cursor-pointer"
                        title="أضف للسلة"
                      >
                        <ShoppingBag className="w-3.5 h-3.5" />
                        <span>شراء</span>
                      </button>

                      {/* Remove from Wishlist */}
                      <button
                        onClick={() => onRemoveItem(product.id)}
                        className="text-slate-400 hover:text-rose-500 p-1.5 rounded-lg hover:bg-rose-50 border border-slate-100 transition-colors cursor-pointer"
                        title="حذف من المفضلة"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </>
  );
}
