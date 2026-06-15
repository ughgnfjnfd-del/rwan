"use client";

import React, { useState, useEffect } from "react";
import {
  X,
  Calendar,
  Wrench,
  Shield,
  CheckCircle2,
  Phone,
  User,
  Smartphone,
  AlertCircle,
  ArrowLeft,
  ArrowRight,
  BatteryCharging,
  Cable,
  Camera,
  Cpu,
  FileText,
  Sparkles,
  TicketPercent,
} from "lucide-react";
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

const bookingSteps = [
  { id: 1, title: "بياناتك", hint: "من يتواصل وياك؟", icon: User },
  { id: 2, title: "جهازك", hint: "نوع الجهاز والموعد", icon: Smartphone },
  { id: 3, title: "المشكلة", hint: "شنو العطل؟", icon: Wrench },
  { id: 4, title: "تأكيد", hint: "مراجعة الطلب", icon: CheckCircle2 },
];

const issueOptions = [
  {
    value: "شاشة",
    title: "الشاشة",
    desc: "كسر، خطوط، لمس ضعيف",
    icon: Smartphone,
  },
  {
    value: "بطارية",
    title: "البطارية",
    desc: "نفاد سريع أو انتفاخ",
    icon: BatteryCharging,
  },
  {
    value: "منفذ شحن",
    title: "منفذ الشحن",
    desc: "لا يشحن أو يفصل",
    icon: Cable,
  },
  {
    value: "كاميرا",
    title: "الكاميرا",
    desc: "تشويش أو عدم فتح",
    icon: Camera,
  },
  {
    value: "نظام",
    title: "السوفتوير",
    desc: "تعليق، قفل، تحديث",
    icon: Cpu,
  },
  {
    value: "أخرى",
    title: "عطل آخر",
    desc: "نحددها بالفحص",
    icon: FileText,
  },
];

const timeSlots = [
  "تواصل للتحديد",
  "3:00 م - 5:00 م",
  "5:00 م - 8:00 م",
  "8:00 م - 11:00 م",
];

export default function RepairModal({ isOpen, onClose }: RepairModalProps) {
  const { addAppointment, appliedCoupon, applyCoupon, clearAppliedCoupon, recordCouponUse } = useApp();
  const [step, setStep] = useState(1);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [confirmationCode, setConfirmationCode] = useState("");
  const [couponInput, setCouponInput] = useState("");
  const [couponMessage, setCouponMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);
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

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
      setStep(1);
      setIsSubmitted(false);
      setError("");
      setCouponMessage(null);
      setCouponInput("");
      setConfirmationCode(`MW-${Math.floor(1000 + Math.random() * 9000)}`);
      setFormData((prev) => ({
        ...prev,
        date: getTodayDateString(),
      }));
    } else {
      document.body.style.overflow = "unset";
    }
    return () => {
      document.body.style.overflow = "unset";
    };
  }, [isOpen]);

  if (!isOpen) return null;

  const currentStep = bookingSteps.find((item) => item.id === step) || bookingSteps[0];
  const CurrentStepIcon = currentStep.icon;
  const progressPercent = (step / bookingSteps.length) * 100;

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    setError("");
  };

  const validateStep = () => {
    if (step === 1 && (!formData.name.trim() || !formData.phone.trim())) {
      setError("اكتب الاسم ورقم الهاتف حتى نكمل الحجز.");
      return false;
    }

    if (step === 2 && !formData.device.trim()) {
      setError("اكتب نوع الجهاز أو موديله حتى يعرفه مهندس الصيانة.");
      return false;
    }

    if (step === 3 && !formData.issueType) {
      setError("اختار نوع المشكلة حتى نجهز الفحص المناسب.");
      return false;
    }

    setError("");
    return true;
  };

  const goNext = () => {
    if (!validateStep()) return;
    setStep((prev) => Math.min(prev + 1, bookingSteps.length));
  };

  const goBack = () => {
    setError("");
    setStep((prev) => Math.max(prev - 1, 1));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateStep()) return;

    setError("");
    const bookingPayload = {
      ...formData,
      details: [
        formData.details,
        appliedCoupon ? `رمز الخصم المستخدم: ${appliedCoupon.code} (${appliedCoupon.label})` : "",
      ].filter(Boolean).join("\n"),
    };

    addAppointment(bookingPayload);

    try {
      const res = await fetch("/api/telegram", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          type: "booking",
          payload: bookingPayload,
        }),
      });

      if (!res.ok) {
        throw new Error("Failed to send booking notification");
      }
    } catch (e) {
      console.error("Telegram notification error for booking:", e);
    }

    if (appliedCoupon) {
      await recordCouponUse(appliedCoupon.code, "repair", 0);
    }

    setIsSubmitted(true);
  };

  const handleApplyRepairCoupon = () => {
    const result = applyCoupon(couponInput, "repair", 0);
    setCouponMessage({
      type: result.isValid ? "success" : "error",
      text: result.message,
    });

    if (result.isValid) {
      setCouponInput("");
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5" dir="rtl">
      <div
        className="fixed inset-0 bg-slate-950/55 backdrop-blur-md transition-opacity duration-300"
        onClick={onClose}
      />

      <div className="relative z-50 flex max-h-[92vh] w-full max-w-4xl flex-col overflow-hidden rounded-[28px] border border-white/70 bg-white shadow-[0_30px_100px_rgba(15,23,42,0.28)]">
        <button
          onClick={onClose}
          className="absolute left-4 top-4 z-20 flex h-9 w-9 items-center justify-center rounded-full border border-slate-200 bg-white/90 text-slate-500 shadow-sm backdrop-blur-md transition-colors hover:bg-slate-100 hover:text-slate-900 cursor-pointer"
          aria-label="إغلاق نافذة حجز الصيانة"
        >
          <X className="h-5 w-5" />
        </button>

        {isSubmitted ? (
          <div className="grid overflow-y-auto lg:grid-cols-[0.85fr_1.15fr]">
            <div className="relative hidden overflow-hidden bg-slate-950 p-8 text-white lg:block">
              <div className="absolute inset-0 bg-[linear-gradient(135deg,rgba(56,189,248,0.16),transparent_38%),linear-gradient(180deg,rgba(255,255,255,0.08),transparent)]" />
              <div className="relative z-10 flex h-full min-h-[460px] flex-col justify-between">
                <div>
                  <span className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/10 px-3 py-1.5 text-[11px] font-black text-slate-200">
                    <Sparkles className="h-3.5 w-3.5 text-accent" />
                    تم تثبيت الطلب
                  </span>
                  <h2 className="mt-5 text-3xl font-black leading-tight">
                    راح نراجع جهازك بعناية ونرجعلك بأقرب وقت.
                  </h2>
                </div>

                <div className="rounded-[26px] border border-white/10 bg-white/[0.06] p-4 backdrop-blur-xl">
                  <div className="flex items-center gap-3">
                    <div className="flex h-11 w-11 items-center justify-center rounded-full bg-emerald-400 text-slate-950">
                      <CheckCircle2 className="h-6 w-6" />
                    </div>
                    <div>
                      <p className="text-xs font-bold text-slate-400">رمز الحجز</p>
                      <p className="font-mono text-xl font-black text-white">{confirmationCode}</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="flex flex-col items-center justify-center gap-6 p-6 text-center sm:p-10">
              <div className="flex h-20 w-20 items-center justify-center rounded-full bg-emerald-50 text-emerald-500 shadow-inner">
                <CheckCircle2 className="h-12 w-12" />
              </div>

              <div className="space-y-2">
                <h3 className="text-2xl font-black text-slate-950">تم تسجيل طلبك بنجاح</h3>
                <p className="max-w-md text-sm font-medium leading-7 text-slate-500">
                  شكراً لك <strong className="text-slate-800">{formData.name}</strong>. تم تسجيل طلب صيانة لهاتفك <strong className="text-slate-800">{formData.device}</strong> وسيتم التواصل وياك للتنسيق.
                </p>
              </div>

              <div className="w-full max-w-md rounded-[24px] border border-slate-100 bg-slate-50 p-4 text-right text-xs text-slate-600">
                <div className="mb-3 flex items-center justify-between border-b border-slate-200 pb-3">
                  <span className="font-black text-slate-900">ملخص الحجز</span>
                  <span className="rounded-full bg-accent/10 px-2.5 py-1 font-mono font-black text-accent">{confirmationCode}</span>
                </div>
                <div className="space-y-2">
                  <div>رقم الهاتف: <span className="font-mono text-slate-800">{formData.phone}</span></div>
                  <div>نوع الصيانة: <span className="font-bold text-slate-800">{formData.issueType}</span></div>
                  <div>الموعد المفضل: <span className="font-bold text-slate-800">{formData.timeSlot}</span></div>
                </div>
              </div>

              <button
                onClick={onClose}
                className="w-full max-w-md rounded-full bg-slate-950 py-3.5 text-sm font-black text-white shadow-md transition-all hover:bg-slate-800 active:scale-[0.99] cursor-pointer"
              >
                حسناً، فهمت
              </button>
            </div>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="grid min-h-[620px] overflow-hidden lg:grid-cols-[0.82fr_1.18fr]">
            <aside className="relative hidden overflow-hidden bg-slate-950 p-7 text-white lg:flex lg:flex-col lg:justify-between">
              <div className="absolute inset-0 bg-[linear-gradient(135deg,rgba(56,189,248,0.15),transparent_36%),linear-gradient(180deg,rgba(255,255,255,0.08),transparent_55%)]" />
              <div className="relative z-10">
                <span className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/10 px-3 py-1.5 text-[11px] font-black text-slate-200">
                  <Shield className="h-3.5 w-3.5 text-emerald-300" />
                  بياناتك وخصوصيتك محفوظة
                </span>
                <h2 className="mt-5 text-3xl font-black leading-tight">
                  حجز صيانة مرتب، سريع، ومريح للموبايل.
                </h2>
                <p className="mt-3 text-sm font-medium leading-7 text-slate-400">
                  نحتاج معلومات قليلة حتى نجهز فحص جهازك ونحدد أفضل وقت للتواصل وياك.
                </p>
              </div>

              <div className="relative z-10 space-y-3">
                {bookingSteps.map((item) => {
                  const StepIcon = item.icon;
                  const isActive = item.id === step;
                  const isDone = item.id < step;

                  return (
                    <div
                      key={item.id}
                      className={`flex items-center gap-3 rounded-2xl border p-3 transition-all ${
                        isActive
                          ? "border-accent/40 bg-white/[0.11]"
                          : isDone
                            ? "border-emerald-400/20 bg-emerald-400/[0.08]"
                            : "border-white/10 bg-white/[0.04]"
                      }`}
                    >
                      <div className={`flex h-10 w-10 items-center justify-center rounded-full ${
                        isDone ? "bg-emerald-400 text-slate-950" : isActive ? "bg-accent text-white" : "bg-white/10 text-slate-300"
                      }`}>
                        {isDone ? <CheckCircle2 className="h-5 w-5" /> : <StepIcon className="h-5 w-5" />}
                      </div>
                      <div>
                        <p className="text-sm font-black text-white">{item.title}</p>
                        <p className="text-[11px] font-semibold text-slate-400">{item.hint}</p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </aside>

            <main className="flex min-h-0 flex-col">
              <header className="border-b border-slate-100 p-5 pb-4 sm:p-6">
                <div className="ml-12 flex items-center gap-3">
                  <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-slate-950 text-white shadow-sm">
                    <CurrentStepIcon className="h-5 w-5" />
                  </div>
                  <div>
                    <p className="text-[11px] font-black text-accent">الخطوة {step} من {bookingSteps.length}</p>
                    <h2 className="text-xl font-black text-slate-950">{currentStep.title}</h2>
                  </div>
                </div>

                <div className="mt-5 overflow-hidden rounded-full bg-slate-100">
                  <div
                    className="h-2 rounded-full bg-slate-950 transition-all duration-300"
                    style={{ width: `${progressPercent}%` }}
                  />
                </div>

                <div className="mt-3 grid grid-cols-4 gap-1 lg:hidden">
                  {bookingSteps.map((item) => (
                    <div key={item.id} className={`h-1.5 rounded-full ${item.id <= step ? "bg-accent" : "bg-slate-200"}`} />
                  ))}
                </div>
              </header>

              <div className="min-h-0 flex-1 overflow-y-auto p-5 sm:p-6">
                {error && (
                  <div className="mb-4 flex items-center gap-2.5 rounded-2xl border border-red-100 bg-red-50 p-3 text-xs font-bold text-red-600">
                    <AlertCircle className="h-4 w-4 flex-shrink-0" />
                    <span>{error}</span>
                  </div>
                )}

                {step === 1 && (
                  <div className="space-y-5">
                    <div>
                      <h3 className="text-lg font-black text-slate-950">خلينا نعرفك أولاً</h3>
                      <p className="mt-1 text-xs font-medium leading-6 text-slate-500">
                        نستخدم هذه البيانات للتواصل حول الفحص والموعد فقط.
                      </p>
                    </div>

                    <div className="grid gap-4 sm:grid-cols-2">
                      <div className="space-y-1.5">
                        <label className="flex items-center gap-1.5 text-xs font-black text-slate-700">
                          <User className="h-3.5 w-3.5 text-slate-400" />
                          الاسم الكامل <span className="text-rose-500">*</span>
                        </label>
                        <input
                          type="text"
                          name="name"
                          value={formData.name}
                          onChange={handleChange}
                          placeholder="مثال: أحمد علي"
                          className="w-full rounded-2xl border border-slate-200 bg-slate-50/70 px-4 py-3 text-sm font-semibold text-slate-800 outline-none transition-all focus:border-accent focus:bg-white focus:ring-4 focus:ring-accent/10"
                          autoComplete="name"
                        />
                      </div>

                      <div className="space-y-1.5">
                        <label className="flex items-center gap-1.5 text-xs font-black text-slate-700">
                          <Phone className="h-3.5 w-3.5 text-slate-400" />
                          رقم الهاتف <span className="text-rose-500">*</span>
                        </label>
                        <input
                          type="tel"
                          name="phone"
                          value={formData.phone}
                          onChange={handleChange}
                          placeholder="مثال: +964 770 123 4567"
                          className="w-full rounded-2xl border border-slate-200 bg-slate-50/70 px-4 py-3 text-sm font-semibold text-slate-800 outline-none transition-all focus:border-accent focus:bg-white focus:ring-4 focus:ring-accent/10"
                          autoComplete="tel"
                        />
                      </div>
                    </div>

                    <div className="rounded-[22px] border border-emerald-100 bg-emerald-50 p-4 text-xs font-bold leading-6 text-emerald-700">
                      <div className="mb-1 flex items-center gap-2 text-emerald-800">
                        <Shield className="h-4 w-4" />
                        خصوصية بياناتك مهمة
                      </div>
                      لا نطلب كلمات مرور أو حسابات، وأي فحص يحتاج فتح الجهاز يتم بعد موافقتك.
                    </div>
                  </div>
                )}

                {step === 2 && (
                  <div className="space-y-5">
                    <div>
                      <h3 className="text-lg font-black text-slate-950">شنو جهازك والوقت المناسب؟</h3>
                      <p className="mt-1 text-xs font-medium leading-6 text-slate-500">
                        اكتب موديل الجهاز بدقة حتى يكون التشخيص أسرع.
                      </p>
                    </div>

                    <div className="space-y-1.5">
                      <label className="flex items-center gap-1.5 text-xs font-black text-slate-700">
                        <Smartphone className="h-3.5 w-3.5 text-slate-400" />
                        نوع الهاتف وموديله <span className="text-rose-500">*</span>
                      </label>
                      <input
                        type="text"
                        name="device"
                        value={formData.device}
                        onChange={handleChange}
                        placeholder="مثال: iPhone 15 Pro Max / Galaxy S24 Ultra"
                        className="w-full rounded-2xl border border-slate-200 bg-slate-50/70 px-4 py-3 text-sm font-semibold text-slate-800 outline-none transition-all focus:border-accent focus:bg-white focus:ring-4 focus:ring-accent/10"
                      />
                    </div>

                    <div className="grid gap-4 sm:grid-cols-2">
                      <div className="space-y-1.5">
                        <label className="flex items-center gap-1.5 text-xs font-black text-slate-700">
                          <Calendar className="h-3.5 w-3.5 text-slate-400" />
                          التاريخ المفضل
                        </label>
                        <input
                          type="date"
                          name="date"
                          value={formData.date}
                          min={getTodayDateString()}
                          onChange={handleChange}
                          className="w-full rounded-2xl border border-slate-200 bg-slate-50/70 px-4 py-3 text-sm font-semibold text-slate-800 outline-none transition-all focus:border-accent focus:bg-white focus:ring-4 focus:ring-accent/10"
                        />
                      </div>

                      <div className="space-y-1.5">
                        <label className="flex items-center gap-1.5 text-xs font-black text-slate-700">
                          <Calendar className="h-3.5 w-3.5 text-slate-400" />
                          وقت التواصل
                        </label>
                        <select
                          name="timeSlot"
                          value={formData.timeSlot}
                          onChange={handleChange}
                          className="w-full rounded-2xl border border-slate-200 bg-slate-50/70 px-4 py-3 text-sm font-semibold text-slate-800 outline-none transition-all focus:border-accent focus:bg-white focus:ring-4 focus:ring-accent/10 cursor-pointer"
                        >
                          {timeSlots.map((slot) => (
                            <option key={slot} value={slot}>{slot}</option>
                          ))}
                        </select>
                      </div>
                    </div>
                  </div>
                )}

                {step === 3 && (
                  <div className="space-y-5">
                    <div>
                      <h3 className="text-lg font-black text-slate-950">اختار نوع المشكلة</h3>
                      <p className="mt-1 text-xs font-medium leading-6 text-slate-500">
                        اختيارك يساعدنا نوجه الطلب للفني المناسب بسرعة.
                      </p>
                    </div>

                    <div className="grid gap-3 sm:grid-cols-2">
                      {issueOptions.map((issue) => {
                        const IssueIcon = issue.icon;
                        const isSelected = formData.issueType === issue.value;

                        return (
                          <button
                            key={issue.value}
                            type="button"
                            onClick={() => {
                              setFormData({ ...formData, issueType: issue.value });
                              setError("");
                            }}
                            className={`flex items-center gap-3 rounded-[22px] border p-4 text-right transition-all duration-200 active:scale-[0.99] cursor-pointer ${
                              isSelected
                                ? "border-slate-950 bg-slate-950 text-white shadow-md"
                                : "border-slate-200 bg-slate-50/70 text-slate-800 hover:border-slate-300 hover:bg-white"
                            }`}
                          >
                            <span className={`flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-2xl ${
                              isSelected ? "bg-white text-slate-950" : "bg-white text-slate-600"
                            }`}>
                              <IssueIcon className="h-5 w-5" />
                            </span>
                            <span className="min-w-0">
                              <span className="block text-sm font-black">{issue.title}</span>
                              <span className={`block text-[11px] font-semibold leading-5 ${isSelected ? "text-slate-300" : "text-slate-500"}`}>
                                {issue.desc}
                              </span>
                            </span>
                          </button>
                        );
                      })}
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-xs font-black text-slate-700">تفاصيل إضافية عن المشكلة</label>
                      <textarea
                        name="details"
                        value={formData.details}
                        onChange={handleChange}
                        rows={3}
                        placeholder="مثال: الجهاز طاح، الشاشة تشتغل بس اللمس لا..."
                        className="w-full resize-none rounded-2xl border border-slate-200 bg-slate-50/70 px-4 py-3 text-sm font-semibold text-slate-800 outline-none transition-all focus:border-accent focus:bg-white focus:ring-4 focus:ring-accent/10"
                      />
                    </div>
                  </div>
                )}

                {step === 4 && (
                  <div className="space-y-5">
                    <div>
                      <h3 className="text-lg font-black text-slate-950">راجع الطلب قبل التأكيد</h3>
                      <p className="mt-1 text-xs font-medium leading-6 text-slate-500">
                        بعد التأكيد يوصلنا طلبك ويتم التواصل وياك.
                      </p>
                    </div>

                    <div className="rounded-[24px] border border-slate-100 bg-slate-50 p-4">
                      <div className="grid gap-3 sm:grid-cols-2">
                        {[
                          { label: "الاسم", value: formData.name },
                          { label: "الهاتف", value: formData.phone },
                          { label: "الجهاز", value: formData.device },
                          { label: "العطل", value: formData.issueType },
                          { label: "التاريخ", value: formData.date },
                          { label: "الوقت", value: formData.timeSlot },
                        ].map((item) => (
                          <div key={item.label} className="rounded-2xl bg-white p-3">
                            <span className="block text-[10px] font-black text-slate-400">{item.label}</span>
                            <span className="mt-1 block text-sm font-black text-slate-800">{item.value || "غير محدد"}</span>
                          </div>
                        ))}
                      </div>

                      {formData.details && (
                        <div className="mt-3 rounded-2xl bg-white p-3">
                          <span className="block text-[10px] font-black text-slate-400">التفاصيل</span>
                          <span className="mt-1 block text-sm font-bold leading-6 text-slate-700">{formData.details}</span>
                        </div>
                      )}
                    </div>

                    <div className="rounded-[24px] border border-slate-100 bg-white p-4 shadow-sm">
                      <div className="mb-3 flex items-center justify-between gap-2">
                        <span className="inline-flex items-center gap-2 text-sm font-black text-slate-900">
                          <TicketPercent className="h-4 w-4 text-accent" />
                          رمز خصم الصيانة
                        </span>
                        {appliedCoupon && (
                          <button
                            type="button"
                            onClick={() => {
                              clearAppliedCoupon();
                              setCouponMessage(null);
                            }}
                            className="text-[10px] font-black text-rose-500 hover:text-rose-600 cursor-pointer"
                          >
                            إزالة
                          </button>
                        )}
                      </div>

                      {appliedCoupon ? (
                        <div className="flex items-center justify-between rounded-2xl border border-emerald-100 bg-emerald-50 px-4 py-3 text-xs">
                          <span className="font-black text-emerald-700">{appliedCoupon.code}</span>
                          <span className="font-bold text-emerald-700">{appliedCoupon.label}</span>
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
                            className="min-w-0 flex-1 rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-xs font-black uppercase tracking-wide text-left outline-none focus:border-accent focus:bg-white"
                            dir="ltr"
                          />
                          <button
                            type="button"
                            onClick={handleApplyRepairCoupon}
                            className="rounded-2xl bg-slate-950 px-4 py-3 text-xs font-black text-white hover:bg-slate-800 cursor-pointer"
                          >
                            تطبيق
                          </button>
                        </div>
                      )}

                      {couponMessage && (
                        <div className={`mt-2 flex items-center gap-1.5 text-[10px] font-bold ${couponMessage.type === "success" ? "text-emerald-600" : "text-rose-600"}`}>
                          {couponMessage.type === "success" ? <CheckCircle2 className="h-3.5 w-3.5" /> : <AlertCircle className="h-3.5 w-3.5" />}
                          <span>{couponMessage.text}</span>
                        </div>
                      )}
                    </div>

                    <div className="rounded-[22px] border border-sky-100 bg-sky-50 p-4 text-xs font-bold leading-6 text-sky-700">
                      <div className="mb-1 flex items-center gap-2 text-sky-800">
                        <Sparkles className="h-4 w-4" />
                        فحص أوضح وتجربة أسرع
                      </div>
                      سيتم تأكيد الكلفة والمدة بعد التشخيص، ولن تبدأ الصيانة إلا بعد موافقتك.
                    </div>
                  </div>
                )}
              </div>

              <footer className="flex items-center gap-3 border-t border-slate-100 p-4 sm:p-5">
                {step > 1 ? (
                  <button
                    type="button"
                    onClick={goBack}
                    className="inline-flex flex-1 items-center justify-center gap-2 rounded-full border border-slate-200 bg-white px-5 py-3 text-sm font-black text-slate-700 transition-all hover:bg-slate-50 active:scale-[0.99] cursor-pointer sm:flex-none"
                  >
                    <ArrowRight className="h-4 w-4" />
                    رجوع
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={onClose}
                    className="inline-flex flex-1 items-center justify-center rounded-full border border-slate-200 bg-white px-5 py-3 text-sm font-black text-slate-700 transition-all hover:bg-slate-50 active:scale-[0.99] cursor-pointer sm:flex-none"
                  >
                    إلغاء
                  </button>
                )}

                {step < bookingSteps.length ? (
                  <button
                    type="button"
                    onClick={goNext}
                    className="inline-flex flex-[1.5] items-center justify-center gap-2 rounded-full bg-slate-950 px-6 py-3 text-sm font-black text-white shadow-md transition-all hover:bg-slate-800 active:scale-[0.99] cursor-pointer"
                  >
                    التالي
                    <ArrowLeft className="h-4 w-4" />
                  </button>
                ) : (
                  <button
                    type="submit"
                    className="inline-flex flex-[1.5] items-center justify-center gap-2 rounded-full bg-accent px-6 py-3 text-sm font-black text-white shadow-md transition-all hover:bg-accent-hover active:scale-[0.99] cursor-pointer"
                  >
                    <CheckCircle2 className="h-4 w-4" />
                    تأكيد الحجز
                  </button>
                )}
              </footer>
            </main>
          </form>
        )}
      </div>
    </div>
  );
}
