"use client";

import React, { useEffect, useState } from "react";
import { X, Trash2, Plus, Minus, ShoppingBag, TicketPercent, CheckCircle2, AlertCircle } from "lucide-react";
import { CartItem, AppliedCoupon, CouponValidationResult } from "@/context/AppContext";
import ProductMockup from "@/components/ProductMockup";

interface CartDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  items: CartItem[];
  onUpdateQuantity: (productId: string, quantity: number, selectedColorName?: string | null, selectedPort?: string | null) => void;
  onRemoveItem: (productId: string, selectedColorName?: string | null, selectedPort?: string | null) => void;
  onCheckout: () => void;
  shippingFee?: string;
  appliedCoupon?: AppliedCoupon | null;
  couponDiscount?: number;
  onApplyCoupon?: (code: string) => CouponValidationResult;
  onClearCoupon?: () => void;
}

export default function CartDrawer({
  isOpen,
  onClose,
  items,
  onUpdateQuantity,
  onRemoveItem,
  onCheckout,
  shippingFee = "مجاني",
  appliedCoupon = null,
  couponDiscount = 0,
  onApplyCoupon,
  onClearCoupon,
}: CartDrawerProps) {
  const [couponInput, setCouponInput] = useState("");
  const [couponMessage, setCouponMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

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
  const finalTotal = Math.max(0, totalPrice - couponDiscount) + numericShipping;

  const handleApplyCoupon = () => {
    if (!onApplyCoupon) return;

    const result = onApplyCoupon(couponInput);
    setCouponMessage({
      type: result.isValid ? "success" : "error",
      text: result.message,
    });

    if (result.isValid) {
      setCouponInput("");
    }
  };

  return (
    <>
      {/* Backdrop */}
      <div
        className={`fixed inset-0 z-50 bg-black/40 backdrop-blur-sm transition-opacity duration-300 ${isOpen ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"
          }`}
        onClick={onClose}
      />

      {/* Drawer Container */}
      <div
        className={`fixed top-0 bottom-0 left-0 z-50 w-full max-w-md bg-white shadow-2xl border-r border-card-border transition-transform duration-300 transform ${isOpen ? "translate-x-0" : "-translate-x-full"
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
                key={`${item.product.id}-${item.selectedColor?.name || "default"}-${item.selectedPort || "default"}`}
                className="flex gap-4 p-3 border border-card-border rounded-xl hover:shadow-sm transition-shadow duration-200"
              >
                {/* Product Image */}
                <div className="w-16 h-16 flex items-center justify-center bg-slate-50 border border-slate-100 rounded-lg overflow-hidden p-1 flex-shrink-0 relative">
                  <ProductMockup
                    image={item.selectedColor?.image || item.product.image}
                    name={item.product.name}
                    sizeClass="w-9 aspect-[9/18]"
                  />
                </div>

                {/* Details */}
                <div className="flex-1 flex flex-col justify-between min-w-0">
                  <div>
                    <h4 className="font-bold text-sm text-[#1a1a1a] truncate">
                      {item.product.name}
                    </h4>
                    <div className="flex flex-wrap items-center gap-2 mt-0.5">
                      <span className="text-[10px] text-slate-400 uppercase">
                        {item.product.category}
                      </span>
                      {item.selectedColor && (
                        <div className="flex items-center gap-1 bg-slate-100 border border-slate-200 px-1.5 py-0.5 rounded-full">
                          <span
                            className="w-2.5 h-2.5 rounded-full border border-black/10 shadow-xs block"
                            style={{ backgroundColor: item.selectedColor.hex }}
                          />
                          <span className="text-[9px] font-bold text-slate-605">
                            {item.selectedColor.name}
                          </span>
                        </div>
                      )}
                      {item.selectedPort && (
                        <div className="flex items-center gap-1 bg-sky-50 border border-sky-100 text-sky-600 px-1.5 py-0.5 rounded-full text-[9px] font-bold">
                          {item.selectedPort}
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center justify-between mt-2">
                    {/* Quantity Selector */}
                    <div className="flex items-center border border-slate-200 rounded-lg bg-slate-50/50">
                      <button
                        onClick={() =>
                          onUpdateQuantity(item.product.id, item.quantity - 1, item.selectedColor?.name, item.selectedPort)
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
                          onUpdateQuantity(item.product.id, item.quantity + 1, item.selectedColor?.name, item.selectedPort)
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
                        onClick={() => onRemoveItem(item.product.id, item.selectedColor?.name, item.selectedPort)}
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
              <div className="rounded-2xl border border-slate-200 bg-white p-3 space-y-2">
                <div className="flex items-center justify-between gap-2">
                  <span className="inline-flex items-center gap-1.5 text-xs font-black text-slate-800">
                    <TicketPercent className="h-4 w-4 text-accent" />
                    رمز الخصم
                  </span>
                  {appliedCoupon && (
                    <button
                      type="button"
                      onClick={() => {
                        onClearCoupon?.();
                        setCouponMessage(null);
                      }}
                      className="text-[10px] font-black text-rose-500 hover:text-rose-600 cursor-pointer"
                    >
                      إزالة
                    </button>
                  )}
                </div>

                {appliedCoupon ? (
                  <div className="flex items-center justify-between rounded-xl bg-emerald-50 border border-emerald-100 px-3 py-2 text-xs">
                    <span className="font-black text-emerald-700">{appliedCoupon.code}</span>
                    <span className="font-bold text-emerald-700">-{couponDiscount.toLocaleString()} د.ع</span>
                  </div>
                ) : (
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={couponInput}
                      onChange={(e) => {
                        setCouponInput(e.target.value.toUpperCase());
                        setCouponMessage(null);
                      }}
                      placeholder="RWAN10"
                      className="min-w-0 flex-1 rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-xs font-black uppercase tracking-wide text-left outline-none focus:border-accent focus:bg-white"
                      dir="ltr"
                    />
                    <button
                      type="button"
                      onClick={handleApplyCoupon}
                      className="rounded-xl bg-slate-950 px-3 py-2 text-xs font-black text-white hover:bg-slate-800 cursor-pointer"
                    >
                      تطبيق
                    </button>
                  </div>
                )}

                {couponMessage && (
                  <div className={`flex items-center gap-1.5 text-[10px] font-bold ${couponMessage.type === "success" ? "text-emerald-600" : "text-rose-600"}`}>
                    {couponMessage.type === "success" ? <CheckCircle2 className="h-3.5 w-3.5" /> : <AlertCircle className="h-3.5 w-3.5" />}
                    <span>{couponMessage.text}</span>
                  </div>
                )}
              </div>
              {couponDiscount > 0 && (
                <div className="flex justify-between text-xs text-emerald-600 font-bold">
                  <span>خصم الكوبون</span>
                  <span>-{couponDiscount.toLocaleString()} د.ع</span>
                </div>
              )}
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
