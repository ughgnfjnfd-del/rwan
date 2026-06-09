"use client";

import React, { useState, useEffect } from "react";
import { X, User, Phone, MapPin, AlertCircle, CheckCircle2, ShoppingBag } from "lucide-react";
import { CartItem } from "@/context/AppContext";

interface CheckoutModalProps {
  isOpen: boolean;
  onClose: () => void;
  cartItems: CartItem[];
  onSubmit: (customer: { name: string; phone: string; address: string }) => Promise<boolean>;
  shippingFee: string;
}

export default function CheckoutModal({ isOpen, onClose, cartItems, onSubmit, shippingFee }: CheckoutModalProps) {
  const [step, setStep] = useState(1); // 1: Form, 2: Success
  const [formData, setFormData] = useState({
    name: "",
    phone: "",
    address: "",
  });
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [savedTotalPrice, setSavedTotalPrice] = useState(0);

  const numericShipping = parseInt(shippingFee.replace(/[^0-9]/g, "")) || 0;

  // Prevent background scrolling when modal is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
      setStep(1); // reset to first step
      setError("");
      setFormData({ name: "", phone: "", address: "" });
      
      const subTotal = cartItems.reduce(
        (sum, item) => sum + (item.product.discountPrice || item.product.price) * item.quantity,
        0
      );
      setSavedTotalPrice(subTotal + numericShipping);
    } else {
      document.body.style.overflow = "unset";
    }
    return () => {
      document.body.style.overflow = "unset";
    };
    // We only initialize values when the modal is opened
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim() || !formData.phone.trim() || !formData.address.trim()) {
      setError("يرجى ملء جميع الحقول المطلوبة الكلمة المميزة بالنجمة (*)");
      return;
    }
    setError("");
    setIsSubmitting(true);

    const success = await onSubmit(formData);
    setIsSubmitting(false);

    if (success) {
      setStep(2);
    } else {
      setError("حدث خطأ أثناء إرسال الطلب. يرجى المحاولة مرة أخرى.");
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" dir="rtl">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/45 backdrop-blur-sm transition-opacity duration-300"
        onClick={onClose}
      />

      {/* Modal Card */}
      <div className="relative z-50 w-full max-w-lg bg-white rounded-2xl border border-card-border shadow-2xl overflow-hidden transform transition-all duration-300 flex flex-col max-h-[90vh] text-right font-sans text-slate-800">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute left-4 top-4 p-1.5 rounded-full hover:bg-slate-100 transition-colors text-slate-400 hover:text-slate-650"
        >
          <X className="w-5 h-5" />
        </button>

        {step === 1 ? (
          <form onSubmit={handleSubmit} className="flex flex-col h-full overflow-hidden">
            {/* Header */}
            <div className="p-6 pb-4 border-b border-card-border">
              <div className="flex items-center gap-3 mb-1">
                <div className="p-2 bg-[#1a1a1a] text-white rounded-lg">
                  <ShoppingBag className="w-5 h-5" />
                </div>
                <h2 className="text-lg font-bold text-[#1a1a1a]">إكمال طلب الشراء</h2>
              </div>
              <p className="text-xs text-slate-400 mr-10">
                يرجى إدخال معلومات التوصيل والتواصل لتسجيل طلبك وإرساله للإدارة فوراً.
              </p>
            </div>

            {/* Form Fields */}
            <div className="flex-1 overflow-y-auto p-6 space-y-4">
              {error && (
                <div className="p-3 bg-rose-50 border border-rose-100 rounded-xl flex items-center gap-2.5 text-xs text-rose-600">
                  <AlertCircle className="w-4 h-4 flex-shrink-0" />
                  <span>{error}</span>
                </div>
              )}

              {/* Order Summary Miniature */}
              <div className="bg-slate-50 border border-slate-150 p-4 rounded-xl space-y-1.5 text-xs">
                <div className="font-bold text-slate-700 border-b border-slate-200 pb-1.5 mb-1.5 flex justify-between">
                  <span>ملخص السلة:</span>
                  <span>{cartItems.reduce((acc, curr) => acc + curr.quantity, 0)} منتجات</span>
                </div>
                <div className="max-h-24 overflow-y-auto space-y-1 pr-1">
                  {cartItems.map(item => (
                    <div key={item.product.id} className="flex justify-between text-slate-500">
                      <span className="truncate max-w-[240px]">• {item.product.name} (x{item.quantity})</span>
                      <span className="font-mono text-slate-600">{((item.product.discountPrice || item.product.price) * item.quantity).toLocaleString()} د.ع</span>
                    </div>
                  ))}
                </div>
                <div className="border-t border-dashed border-slate-200 pt-2 mt-2 space-y-1">
                  <div className="flex justify-between text-slate-500">
                    <span>أجور التوصيل:</span>
                    <span className={numericShipping === 0 ? "text-emerald-600 font-semibold" : "text-slate-600 font-semibold"}>
                      {numericShipping > 0 ? `${numericShipping.toLocaleString()} د.ع` : shippingFee}
                    </span>
                  </div>
                  <div className="flex justify-between font-bold text-sm text-slate-800 pt-1 border-t border-slate-150">
                    <span>المجموع الإجمالي للفاتورة:</span>
                    <span>{savedTotalPrice.toLocaleString()} د.ع</span>
                  </div>
                </div>
              </div>

              {/* Name */}
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-700 flex items-center gap-1.5">
                  <User className="w-3.5 h-3.5 text-slate-400" />
                  الاسم الكامل <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  placeholder="مثال: أحمد علي"
                  className="w-full text-sm border border-slate-200 rounded-xl px-3.5 py-2.5 focus:outline-none focus:border-accent focus:ring-1 focus:ring-accent transition-all bg-slate-50/50"
                  required
                />
              </div>

              {/* Phone */}
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-700 flex items-center gap-1.5">
                  <Phone className="w-3.5 h-3.5 text-slate-400" />
                  رقم الهاتف للتواصل <span className="text-rose-500">*</span>
                </label>
                <input
                  type="tel"
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                  placeholder="مثال: 0773 165 0096"
                  className="w-full text-sm border border-slate-200 rounded-xl px-3.5 py-2.5 focus:outline-none focus:border-accent focus:ring-1 focus:ring-accent transition-all bg-slate-50/50 text-left font-mono"
                  dir="ltr"
                  required
                />
                <p className="text-[10px] text-slate-400">سيتم حفظ الرقم وعرضه بالترتيب الصحيح تلقائياً.</p>
              </div>

              {/* Address */}
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-700 flex items-center gap-1.5">
                  <MapPin className="w-3.5 h-3.5 text-slate-400" />
                  عنوان التوصيل بالتفصيل <span className="text-rose-500">*</span>
                </label>
                <textarea
                  name="address"
                  value={formData.address}
                  onChange={handleChange}
                  rows={2}
                  placeholder="المحافظة، المنطقة، أقرب نقطة دالة، الشارع..."
                  className="w-full text-sm border border-slate-200 rounded-xl px-3.5 py-2 focus:outline-none focus:border-accent focus:ring-1 focus:ring-accent transition-all bg-slate-50/50 resize-none"
                  required
                />
              </div>
            </div>

            {/* Footer Buttons */}
            <div className="p-6 border-t border-card-border flex gap-3">
              <button
                type="button"
                onClick={onClose}
                className="flex-1 border border-slate-200 text-slate-600 hover:bg-slate-50 font-bold py-2.5 rounded-xl transition-all cursor-pointer text-center text-sm"
                disabled={isSubmitting}
              >
                إلغاء
              </button>
              <button
                type="submit"
                className="flex-1 bg-accent hover:bg-accent-hover text-white font-bold py-2.5 rounded-xl transition-all shadow-md hover:scale-[1.01] cursor-pointer text-center text-sm flex items-center justify-center gap-2"
                disabled={isSubmitting}
              >
                {isSubmitting ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    <span>جاري الإرسال...</span>
                  </>
                ) : (
                  <span>تأكيد وإرسال الطلب</span>
                )}
              </button>
            </div>
          </form>
        ) : (
          /* Success Screen */
          <div className="p-8 text-center flex flex-col items-center justify-center space-y-6">
            <div className="p-4 bg-emerald-50 rounded-full text-emerald-500 animate-bounce">
              <CheckCircle2 className="w-12 h-12" />
            </div>

            <div className="space-y-2">
              <h3 className="text-xl font-bold text-[#1a1a1a]">تم إرسال طلبك بنجاح!</h3>
              <p className="text-xs text-slate-500 max-w-sm leading-relaxed">
                شكراً لك <strong className="text-slate-800">{formData.name}</strong>. تم استلام طلب الشراء الخاص بك وإرسال إشعار للإدارة بنجاح.
              </p>
            </div>

            <div className="p-4 bg-slate-50 border border-slate-100 rounded-2xl text-xs text-slate-600 text-right w-full space-y-2">
              <div className="font-bold border-b border-slate-200 pb-1.5 text-slate-800">تفاصيل التواصل الشحن:</div>
              <div>• رقم هاتف التواصل: <span className="font-mono text-slate-700" dir="ltr">{formData.phone}</span></div>
              <div>• عنوان التوصيل: <span className="text-slate-700">{formData.address}</span></div>
              <div>• إجمالي الفاتورة: <span className="font-bold text-slate-800">{savedTotalPrice.toLocaleString()} د.ع</span></div>
            </div>

            <p className="text-[11px] text-slate-400">
              سيتصل بك موظف المبيعات لتأكيد الشحن والتوصيل خلال 24 ساعة.
            </p>

            <button
              onClick={onClose}
              className="w-full bg-[#1a1a1a] hover:bg-slate-800 text-white font-bold py-3 rounded-xl transition-all shadow-md cursor-pointer text-sm"
            >
              حسناً، فهمت
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
