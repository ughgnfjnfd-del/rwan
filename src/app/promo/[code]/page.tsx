"use client";

import React, { useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { Gift, CheckCircle2, AlertCircle, ArrowRight, Sparkles, TicketPercent } from "lucide-react";
import { useApp } from "@/context/AppContext";

export default function PromoLandingPage() {
  const params = useParams();
  const router = useRouter();
  const { couponCampaigns, couponCodes, applyCoupon, validateCoupon, isInitialized } = useApp();
  const [successClaimed, setSuccessClaimed] = useState(false);

  const rawCode = params?.code;
  const code = (Array.isArray(rawCode) ? rawCode[0] : rawCode || "").trim().toUpperCase();

  const coupon = couponCodes.find((item) => item.code.toUpperCase() === code);
  const campaign = coupon ? couponCampaigns.find((item) => item.id === coupon.campaignId) : null;

  // Perform initial scan record and validation
  const validationResult = validateCoupon(code, "both", 0);
  const isValid = validationResult.isValid;

  const handleClaim = () => {
    if (!code) return;
    const result = applyCoupon(code, "both", 0);
    if (result.isValid) {
      setSuccessClaimed(true);
      setTimeout(() => {
        router.push("/");
      }, 1500);
    }
  };

  if (!isInitialized) {
    return (
      <div className="min-h-screen bg-[linear-gradient(135deg,#0f172a_0%,#1e293b_100%)] flex items-center justify-center text-white">
        <div className="flex flex-col items-center gap-4">
          <div className="animate-spin w-10 h-10 border-4 border-sky-400 border-t-transparent rounded-full"></div>
          <p className="text-sm font-semibold tracking-wide text-slate-400">جاري تحميل العرض الفاخر...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[linear-gradient(135deg,#0f172a_0%,#1e1b4b_50%,#020617_100%)] flex items-center justify-center p-4 relative overflow-hidden select-none" dir="rtl">
      {/* Decorative ambient blobs */}
      <div className="absolute -top-40 -right-40 w-96 h-96 bg-purple-600/20 rounded-full blur-[100px] pointer-events-none"></div>
      <div className="absolute -bottom-40 -left-40 w-96 h-96 bg-sky-500/20 rounded-full blur-[100px] pointer-events-none"></div>
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-indigo-500/5 rounded-full blur-[120px] pointer-events-none"></div>

      <div className="relative z-10 w-full max-w-lg animate-in fade-in-50 zoom-in-95 duration-500">
        
        {/* Card wrapper with glassmorphism */}
        <div className="border border-white/10 bg-slate-900/70 p-6 sm:p-10 rounded-[32px] shadow-2xl backdrop-blur-xl text-center space-y-8 flex flex-col items-center">
          
          {/* Top Brand Logo */}
          <div className="space-y-1 text-right w-full flex justify-between items-center border-b border-white/5 pb-4">
            <div>
              <span className="block text-sm font-black text-white">مركز الروان</span>
              <span className="block text-[9px] font-bold text-slate-400 uppercase tracking-wider font-mono">Rwan Center</span>
            </div>
            <span className="inline-flex items-center gap-1.5 px-3 py-1 text-[10px] font-black text-sky-400 bg-sky-500/10 rounded-full border border-sky-500/25 shadow-sm">
              <Sparkles className="w-3.5 h-3.5" />
              هدية خاصة
            </span>
          </div>

          {successClaimed ? (
            /* Success State */
            <div className="space-y-6 py-8 animate-in fade-in zoom-in-90 duration-300 flex flex-col items-center">
              <div className="w-20 h-20 bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 rounded-full flex items-center justify-center shadow-lg shadow-emerald-500/15 animate-bounce">
                <CheckCircle2 className="w-10 h-10" />
              </div>
              <div className="space-y-2">
                <h2 className="text-2xl font-black text-white">تم تفعيل الخصم بنجاح!</h2>
                <p className="text-xs text-slate-400 leading-relaxed max-w-sm">
                  تم حفظ الكوبون وتطبيقه تلقائياً في السلة وفي حجز الصيانة. جاري توجيهك الآن للتسوق...
                </p>
              </div>
            </div>
          ) : isValid ? (
            /* Coupon Valid State */
            <>
              {/* Giant Promo Icon Container */}
              <div className="w-24 h-24 bg-gradient-to-tr from-sky-500 to-indigo-600 rounded-3xl flex items-center justify-center shadow-xl shadow-sky-500/10 relative group">
                <Gift className="w-12 h-12 text-white drop-shadow-[0_4px_10px_rgba(255,255,255,0.3)]" />
                <span className="absolute -top-2 -left-2 bg-pink-500 text-white font-extrabold text-[9px] px-2 py-0.5 rounded-md shadow-md">
                  PROMO
                </span>
              </div>

              {/* Title & Subtitle */}
              <div className="space-y-3">
                <h1 className="text-2xl sm:text-3xl font-black leading-tight text-white">
                  {campaign?.landingTitle || "مبروك! حصلت على هدية خاصة"}
                </h1>
                <p className="text-xs sm:text-sm text-slate-400 leading-relaxed max-w-md">
                  {campaign?.landingSubtitle || "عرض خاص وموثق لزبائن مركز الروان المميزين. اضغط على الزر لتفعيل الخصم في حسابك."}
                </p>
              </div>

              {/* Value Badge Display */}
              <div className="w-full bg-white/[0.03] border border-white/5 p-5 rounded-2xl flex items-center justify-between gap-4">
                <div className="text-right space-y-1">
                  <span className="block text-[10px] font-black text-slate-400">قيمة الهدية</span>
                  <strong className="block text-2xl font-mono font-black text-sky-400">
                    {coupon?.discountType === "percent"
                      ? `${coupon.discountValue}% خصم`
                      : `${coupon?.discountValue?.toLocaleString()} د.ع خصم`}
                  </strong>
                </div>
                <div className="text-left space-y-1">
                  <span className="block text-[10px] font-black text-slate-400">الرمز الخاص بك</span>
                  <span className="block text-base font-mono font-black text-white tracking-widest bg-white/10 px-3.5 py-1 rounded-xl border border-white/10">
                    {coupon?.code}
                  </span>
                </div>
              </div>

              {/* Scope details */}
              <div className="text-xs text-slate-400 space-y-2 text-right w-full border-t border-white/5 pt-4">
                <div className="flex items-center justify-start gap-2">
                  <TicketPercent className="w-4 h-4 text-sky-400 flex-shrink-0" />
                  <span>ينطبق الخصم على: 
                    <strong className="text-slate-200 mr-1.5">
                      {coupon?.appliesTo === "store"
                        ? "المنتجات فقط"
                        : coupon?.appliesTo === "repair"
                        ? "خدمات الصيانة فقط"
                        : "كافة المنتجات وخدمات الصيانة"}
                    </strong>
                  </span>
                </div>
                {coupon && coupon.minOrderAmount > 0 && (
                  <div className="flex items-center justify-start gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0" />
                    <span>الحد الأدنى للاستخدام: <strong className="text-slate-200 mr-1.5">{coupon.minOrderAmount.toLocaleString()} د.ع</strong></span>
                  </div>
                )}
              </div>

              {/* Action button */}
              <button
                onClick={handleClaim}
                className="w-full bg-sky-500 hover:bg-sky-400 text-slate-950 font-black text-sm py-4 rounded-xl shadow-lg shadow-sky-500/15 transition-all hover:scale-[1.01] active:scale-[0.99] cursor-pointer flex items-center justify-center gap-2"
              >
                <span>استخدم الخصم الآن</span>
                <ArrowRight className="w-4 h-4 transform rotate-180" />
              </button>
            </>
          ) : (
            /* Coupon Invalid State */
            <>
              <div className="w-20 h-20 bg-rose-500/10 border border-rose-500/30 text-rose-400 rounded-full flex items-center justify-center shadow-lg shadow-rose-500/10 animate-pulse">
                <AlertCircle className="w-10 h-10" />
              </div>

              <div className="space-y-3">
                <h1 className="text-xl sm:text-2xl font-black text-white">رمز الخصم غير صالح أو مستخدم</h1>
                <p className="text-xs sm:text-sm text-slate-400 leading-relaxed max-w-sm">
                  {validationResult.message || `عذراً، يبدو أن الكود ${code} المستخدم غير متوفر في نظامنا أو قد انتهت صلاحية العرض الخاص به.`}
                </p>
              </div>

              <button
                onClick={() => router.push("/")}
                className="w-full bg-white/10 hover:bg-white/15 text-white font-black text-sm py-4 rounded-xl border border-white/10 transition-all hover:scale-[1.01] active:scale-[0.99] cursor-pointer flex items-center justify-center gap-2"
              >
                <ArrowRight className="w-4 h-4" />
                <span>العودة للمتجر الرئيسي</span>
              </button>
            </>
          )}

        </div>

      </div>
    </div>
  );
}
