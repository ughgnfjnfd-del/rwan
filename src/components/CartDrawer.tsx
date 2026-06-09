"use client";

import React, { useEffect } from "react";
import { X, Trash2, Plus, Minus, ShoppingBag } from "lucide-react";
import { Product, CartItem } from "@/context/AppContext";

interface CartDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  items: CartItem[];
  onUpdateQuantity: (productId: string, quantity: number) => void;
  onRemoveItem: (productId: string) => void;
  onCheckout: () => void;
  shippingFee?: string;
}

export default function CartDrawer({
  isOpen,
  onClose,
  items,
  onUpdateQuantity,
  onRemoveItem,
  onCheckout,
  shippingFee = "مجاني",
}: CartDrawerProps) {
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

  const totalPrice = items.reduce(
    (sum, item) => sum + (item.product.discountPrice || item.product.price) * item.quantity,
    0
  );

  const numericShipping = parseInt(shippingFee.replace(/[^0-9]/g, "")) || 0;
  const finalTotal = totalPrice + numericShipping;

  return (
    <>
      {/* Backdrop */}
      <div
        className={`fixed inset-0 z-50 bg-black/40 backdrop-blur-sm transition-opacity duration-300 ${
          isOpen ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"
        }`}
        onClick={onClose}
      />

      {/* Drawer Container */}
      <div
        className={`fixed top-0 bottom-0 left-0 z-50 w-full max-w-md bg-white shadow-2xl border-r border-card-border transition-transform duration-300 transform ${
          isOpen ? "translate-x-0" : "-translate-x-full"
        } flex flex-col`}
      >
        {/* Header */}
        <div className="p-5 border-b border-card-border flex items-center justify-between">
          <div className="flex items-center gap-3">
            <ShoppingBag className="w-5 h-5 text-accent" />
            <h2 className="text-lg font-bold">سلة التسوق</h2>
            <span className="bg-accent/10 text-accent font-semibold text-xs px-2.5 py-0.5 rounded-full">
              {items.reduce((acc, curr) => acc + curr.quantity, 0)} منتجات
            </span>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-full hover:bg-slate-100 transition-colors text-slate-400 hover:text-slate-600"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-5 space-y-4">
          {items.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-center space-y-4 py-20">
              <div className="p-4 bg-slate-50 rounded-full text-slate-400">
                <ShoppingBag className="w-10 h-10" />
              </div>
              <p className="text-slate-500 font-medium text-sm">سلتك فارغة حالياً</p>
              <button
                onClick={onClose}
                className="text-xs bg-accent text-white px-4 py-2 rounded-lg font-bold hover:bg-accent-hover transition-colors shadow-sm cursor-pointer"
              >
                تصفح المنتجات
              </button>
            </div>
          ) : (
            items.map((item) => (
              <div
                key={item.product.id}
                className="flex gap-4 p-3 border border-card-border rounded-xl hover:shadow-sm transition-shadow duration-200"
              >
                {/* Product Image */}
                <div className="w-20 h-20 bg-slate-50 rounded-lg overflow-hidden flex items-center justify-center border border-slate-100 flex-shrink-0 relative">
                  {/* Since we don't have real images yet, we can draw a premium placeholder with icon or text */}
                  <div className="text-[10px] text-slate-400 font-semibold uppercase p-1 text-center">
                    {item.product.nameEn}
                  </div>
                </div>

                {/* Details */}
                <div className="flex-1 flex flex-col justify-between min-w-0">
                  <div>
                    <h4 className="font-bold text-sm text-[#1a1a1a] truncate">
                      {item.product.name}
                    </h4>
                    <span className="text-xs text-slate-400 uppercase">
                      {item.product.category}
                    </span>
                  </div>

                  <div className="flex items-center justify-between mt-2">
                    {/* Quantity Selector */}
                    <div className="flex items-center border border-slate-200 rounded-lg bg-slate-50/50">
                      <button
                        onClick={() =>
                          onUpdateQuantity(item.product.id, item.quantity - 1)
                        }
                        className="p-1 text-slate-500 hover:text-slate-700 hover:bg-slate-100 rounded-r-lg transition-colors cursor-pointer"
                      >
                        <Minus className="w-3.5 h-3.5" />
                      </button>
                      <span className="w-8 text-center text-xs font-bold select-none">
                        {item.quantity}
                      </span>
                      <button
                        onClick={() =>
                          onUpdateQuantity(item.product.id, item.quantity + 1)
                        }
                        className="p-1 text-slate-500 hover:text-slate-700 hover:bg-slate-100 rounded-l-lg transition-colors cursor-pointer"
                      >
                        <Plus className="w-3.5 h-3.5" />
                      </button>
                    </div>

                    <div className="flex items-center gap-3">
                      <span className="font-bold text-sm text-accent">
                        {((item.product.discountPrice || item.product.price) * item.quantity).toLocaleString()} د.ع
                      </span>
                      <button
                        onClick={() => onRemoveItem(item.product.id)}
                        className="text-slate-400 hover:text-rose-500 p-1 rounded-lg hover:bg-rose-50 transition-colors cursor-pointer"
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

        {/* Footer Summary */}
        {items.length > 0 && (
          <div className="p-5 border-t border-card-border bg-slate-50/50 space-y-4">
            <div className="space-y-1.5">
              <div className="flex justify-between text-xs text-slate-500">
                <span>المجموع الفرعي</span>
                <span>{totalPrice.toLocaleString()} د.ع</span>
              </div>
              <div className="flex justify-between text-xs text-slate-500">
                <span>التوصيل</span>
                <span className={shippingFee === "مجاني" || numericShipping === 0 ? "text-emerald-600 font-semibold" : "text-slate-700 font-semibold"}>
                  {numericShipping > 0 ? `${numericShipping.toLocaleString()} د.ع` : shippingFee}
                </span>
              </div>
              <div className="border-t border-dashed border-slate-200 my-2 pt-2 flex justify-between text-base font-bold">
                <span>المجموع الإجمالي</span>
                <span className="text-[#1a1a1a]">{finalTotal.toLocaleString()} د.ع</span>
              </div>
            </div>

            <button
              onClick={onCheckout}
              className="w-full bg-[#1a1a1a] hover:bg-slate-800 text-white font-bold py-3.5 rounded-xl transition-all duration-200 shadow-md flex items-center justify-center gap-2 hover:scale-[1.01] cursor-pointer"
            >
              <span>إتمام الطلب</span>
              <span>←</span>
            </button>
          </div>
        )}
      </div>
    </>
  );
}
