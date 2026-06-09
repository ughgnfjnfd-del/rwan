"use client";

import React, { useState, useEffect } from "react";
import { X, Calendar, Wrench, Shield, CheckCircle2, Phone, User, Smartphone, AlertCircle } from "lucide-react";
import { useApp } from "@/context/AppContext";

interface RepairModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const getTodayDateString = () => {
  const date = new Date();
  const yyyy = date.getFullYear();
  const mm = String(date.getMonth() + 1).padStart(2, "0");
  const dd = String(date.getDate()).padStart(2, "0");
  return `${yyyy}-${mm}-${dd}`;
};

export default function RepairModal({ isOpen, onClose }: RepairModalProps) {
  const { addAppointment } = useApp();
  const [step, setStep] = useState(1); // 1: Form, 2: Success
  const [formData, setFormData] = useState({
    name: "",
    phone: "",
    device: "",
    issueType: "شاشة",
    details: "",
    date: getTodayDateString(),
    timeSlot: "تواصل للتحديد",
  });
  const [error, setError] = useState("");

  // Prevent background scrolling when modal is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
      setStep(1); // reset to first step
      setError("");
    } else {
      document.body.style.overflow = "unset";
    }
    return () => {
      document.body.style.overflow = "unset";
    };
  }, [isOpen]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.phone || !formData.device) {
      setError("يرجى ملء جميع الحقول المطلوبة الكلمة المميزة بالنجمة (*)");
      return;
    }
    setError("");
    addAppointment(formData);

    try {
      const res = await fetch("/api/telegram", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          type: "booking",
          payload: formData,
        }),
      });

      if (!res.ok) {
        throw new Error("Failed to send booking notification");
      }
    } catch (e) {
      console.error("Telegram notification error for booking:", e);
    }

    setStep(2);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/40 backdrop-blur-sm transition-opacity duration-300"
        onClick={onClose}
      />

      {/* Modal Card */}
      <div className="relative z-50 w-full max-w-lg bg-white rounded-2xl border border-card-border shadow-2xl overflow-hidden transform transition-all duration-300 flex flex-col max-h-[90vh]">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute left-4 top-4 p-1.5 rounded-full hover:bg-slate-100 transition-colors text-slate-400 hover:text-slate-600"
        >
          <X className="w-5 h-5" />
        </button>

        {step === 1 ? (
          <form onSubmit={handleSubmit} className="flex flex-col h-full overflow-hidden">
            {/* Header */}
            <div className="p-6 pb-4 border-b border-card-border">
              <div className="flex items-center gap-3 mb-1">
                <div className="p-2 bg-accent/10 rounded-lg text-accent">
                  <Wrench className="w-5 h-5" />
                </div>
                <h2 className="text-xl font-bold text-[#1a1a1a]">حجز موعد صيانة سريع</h2>
              </div>
              <p className="text-xs text-slate-500 mr-10">
                سجل بيانات هاتفك المعطل لنقوم بجدولة صيانة فورية لك في مركزنا المعتمد.
              </p>
            </div>

            {/* Form Fields */}
            <div className="flex-1 overflow-y-auto p-6 space-y-4">
              {error && (
                <div className="p-3 bg-red-50 border border-red-100 rounded-xl flex items-center gap-2.5 text-xs text-red-600">
                  <AlertCircle className="w-4 h-4 flex-shrink-0" />
                  <span>{error}</span>
                </div>
              )}

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
                  رقم الهاتف <span className="text-rose-500">*</span>
                </label>
                <input
                  type="tel"
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                  placeholder="مثال: +964 770 123 4567"
                  className="w-full text-sm border border-slate-200 rounded-xl px-3.5 py-2.5 focus:outline-none focus:border-accent focus:ring-1 focus:ring-accent transition-all bg-slate-50/50"
                  required
                />
              </div>

              {/* Device */}
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-700 flex items-center gap-1.5">
                  <Smartphone className="w-3.5 h-3.5 text-slate-400" />
                  نوع الهاتف وموديله <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  name="device"
                  value={formData.device}
                  onChange={handleChange}
                  placeholder="مثال: iPhone 15 Pro Max / Galaxy S24 Ultra"
                  className="w-full text-sm border border-slate-200 rounded-xl px-3.5 py-2.5 focus:outline-none focus:border-accent focus:ring-1 focus:ring-accent transition-all bg-slate-50/50"
                  required
                />
              </div>

              {/* Issue Type */}
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-700">نوع المشكلة</label>
                <select
                  name="issueType"
                  value={formData.issueType}
                  onChange={handleChange}
                  className="w-full text-sm border border-slate-200 rounded-xl px-3.5 py-2.5 bg-slate-50/50 focus:outline-none focus:border-accent focus:ring-1 focus:ring-accent transition-all cursor-pointer"
                >
                  <option value="شاشة">استبدال الشاشة (كسر)</option>
                  <option value="بطارية">تغيير البطارية (ضعف الشحن)</option>
                  <option value="منفذ شحن">تصليح منفذ الشحن</option>
                  <option value="كاميرا">صيانة الكاميرات</option>
                  <option value="نظام">برمجة وسوفتوير</option>
                  <option value="أخرى">صيانة عامة أخرى</option>
                </select>
              </div>

              {/* Warranty Guarantee Info */}
              <div className="p-3 bg-slate-50 border border-slate-100 rounded-xl text-[11px] text-slate-500 flex items-start gap-2 w-full">
                <Shield className="w-4 h-4 text-emerald-500 flex-shrink-0 mt-0.5" />
                <span>ضمان حقيقي لمدة 3 أيام على قطع الغيار المستبدلة وصيانتها.</span>
              </div>

              {/* Details */}
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-700">تفاصيل إضافية عن المشكلة (اختياري)</label>
                <textarea
                  name="details"
                  value={formData.details}
                  onChange={handleChange}
                  rows={2}
                  placeholder="صف العطل باختصار لمساعدة مهندس الصيانة..."
                  className="w-full text-sm border border-slate-200 rounded-xl px-3.5 py-2 focus:outline-none focus:border-accent focus:ring-1 focus:ring-accent transition-all bg-slate-50/50 resize-none"
                />
              </div>
            </div>

            {/* Footer Buttons */}
            <div className="p-6 border-t border-card-border flex gap-3">
              <button
                type="button"
                onClick={onClose}
                className="flex-1 border border-slate-200 text-slate-600 hover:bg-slate-50 font-bold py-2.5 rounded-xl transition-all cursor-pointer text-center text-sm"
              >
                إلغاء
              </button>
              <button
                type="submit"
                className="flex-1 bg-accent hover:bg-accent-hover text-white font-bold py-2.5 rounded-xl transition-all shadow-md hover:scale-[1.01] cursor-pointer text-center text-sm"
              >
                تأكيد الحجز
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
              <h3 className="text-xl font-bold text-[#1a1a1a]">تم تسجيل طلبك بنجاح!</h3>
              <p className="text-xs text-slate-500 max-w-sm leading-relaxed">
                شكراً لك <strong className="text-slate-800">{formData.name}</strong>. تم تسجيل طلب صيانة لهاتفك <strong className="text-slate-800">{formData.device}</strong> بنجاح.
              </p>
            </div>

            <div className="p-4 bg-slate-50 border border-slate-100 rounded-2xl text-xs text-slate-600 text-right w-full space-y-2">
              <div className="font-bold border-b border-slate-200 pb-1.5 text-slate-800">تفاصيل الحجز:</div>
              <div>• رقم هاتف العميل: <span className="font-mono text-slate-700">{formData.phone}</span></div>
              <div>• نوع الصيانة: <span className="text-slate-700">{formData.issueType}</span></div>
              <div>• رمز التأكيد الخاص بك: <span className="font-mono bg-accent/10 text-accent font-bold px-1.5 py-0.5 rounded">MW-{Math.floor(1000 + Math.random() * 9000)}</span></div>
            </div>

            <p className="text-[11px] text-slate-400">
              سيتصل بك مهندس الصيانة للتنسيق هاتفياً وتحديد موعد الزيارة المناسب لك.
            </p>

            <button
              onClick={onClose}
              className="w-full bg-[#1a1a1a] hover:bg-slate-800 text-white font-bold py-3 rounded-xl transition-all shadow-md cursor-pointer"
            >
              حسناً، فهمت
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
