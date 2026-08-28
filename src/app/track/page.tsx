"use client";

import React, { useState, useEffect, useMemo, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import {
  Search,
  Wrench,
  Truck,
  CheckCircle2,
  AlertCircle,
  Phone,
  MapPin,
  MessageCircle,
  Sparkles,
  Smartphone,
  ShieldCheck,
  Package,
  ArrowRight,
  RefreshCw,
  QrCode
} from "lucide-react";
import { useApp, RepairStatus } from "@/context/AppContext";

const REPAIR_STEPS = [
  {
    id: "pending",
    title: "تم الاستلام",
    subtitle: "تسجيل بيانات الجهاز وتحديد العطل",
    icon: Package,
    percentage: 15,
  },
  {
    id: "diagnosing",
    title: "قيد الفحص والتشخيص",
    subtitle: "فحص الدوائر الإلكترونية والقطع",
    icon: Search,
    percentage: 35,
  },
  {
    id: "in-progress",
    title: "قيد الصيانة والإصلاح",
    subtitle: "استبدال القطع والعمل الفني",
    icon: Wrench,
    percentage: 65,
  },
  {
    id: "testing",
    title: "الفحص النهائي والجودة",
    subtitle: "اختبار الشحن والشاشة والوظائف",
    icon: ShieldCheck,
    percentage: 85,
  },
  {
    id: "ready",
    title: "جاهز للاستلام",
    subtitle: "الجهاز جاهز بانتظارك في المركز",
    icon: CheckCircle2,
    percentage: 100,
  },
];

function getStepIndex(status: RepairStatus): number {
  switch (status) {
    case "pending":
      return 0;
    case "diagnosing":
      return 1;
    case "in-progress":
      return 2;
    case "testing":
      return 3;
    case "ready":
      return 4;
    case "completed":
      return 5;
    case "cancelled":
      return -1;
    default:
      return 0;
  }
}

function getStatusBadge(status: RepairStatus) {
  switch (status) {
    case "pending":
      return {
        label: "بانتظار الفحص",
        color: "bg-amber-500/10 text-amber-500 border-amber-500/20",
        dot: "bg-amber-500",
      };
    case "diagnosing":
      return {
        label: "قيد التشخيص الفني",
        color: "bg-purple-500/10 text-purple-400 border-purple-500/20",
        dot: "bg-purple-500 animate-pulse",
      };
    case "in-progress":
      return {
        label: "قيد الصيانة والعمل",
        color: "bg-sky-500/10 text-sky-400 border-sky-500/20",
        dot: "bg-sky-500 animate-pulse",
      };
    case "testing":
      return {
        label: "قيد اختبار الجودة",
        color: "bg-indigo-500/10 text-indigo-400 border-indigo-500/20",
        dot: "bg-indigo-500 animate-pulse",
      };
    case "ready":
      return {
        label: "جاهز للاستلام الآن",
        color: "bg-emerald-500/20 text-emerald-400 border-emerald-500/40 shadow-lg shadow-emerald-500/10",
        dot: "bg-emerald-400 animate-ping",
      };
    case "completed":
      return {
        label: "تم التسليم بنجاح",
        color: "bg-slate-500/10 text-slate-400 border-slate-500/20",
        dot: "bg-slate-500",
      };
    case "cancelled":
      return {
        label: "ملغي / تعذر الإصلاح",
        color: "bg-rose-500/10 text-rose-400 border-rose-500/20",
        dot: "bg-rose-500",
      };
  }
}

function TrackingContent() {
  const searchParams = useSearchParams();
  const { appointments, orders, siteSettings, refreshAppointments, refreshOrders } = useApp();

  const [searchType, setSearchType] = useState<"repair" | "order">("repair");
  const [searchQuery, setSearchQuery] = useState("");
  const [hasSearched, setHasSearched] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const handleManualRefresh = async () => {
    setIsRefreshing(true);
    try {
      if (refreshAppointments) await refreshAppointments();
      if (refreshOrders) await refreshOrders();
    } catch (e) {
      console.error(e);
    } finally {
      setTimeout(() => setIsRefreshing(false), 500);
    }
  };

  // Background Auto-Refresh Polling (Every 20 seconds + on Tab Visibility / Window Focus)
  useEffect(() => {
    const triggerSync = () => {
      if (refreshAppointments) refreshAppointments();
      if (refreshOrders) refreshOrders();
    };

    // Auto-poll interval
    const interval = setInterval(triggerSync, 20000);

    // Visibility and focus listeners
    const handleVisibility = () => {
      if (document.visibilityState === "visible") {
        triggerSync();
      }
    };

    document.addEventListener("visibilitychange", handleVisibility);
    window.addEventListener("focus", triggerSync);

    return () => {
      clearInterval(interval);
      document.removeEventListener("visibilitychange", handleVisibility);
      window.removeEventListener("focus", triggerSync);
    };
  }, [refreshAppointments, refreshOrders]);

  // Read URL params automatically on mount
  useEffect(() => {
    const codeParam = searchParams.get("code") || searchParams.get("id") || searchParams.get("track");
    const orderParam = searchParams.get("order");
    const phoneParam = searchParams.get("phone");

    if (codeParam) {
      setSearchType("repair");
      setSearchQuery(codeParam);
      setHasSearched(true);
    } else if (orderParam) {
      setSearchType("order");
      setSearchQuery(orderParam);
      setHasSearched(true);
    } else if (phoneParam) {
      setSearchQuery(phoneParam);
      setHasSearched(true);
    }
  }, [searchParams]);

  // Filter Matching Repairs
  const matchedRepairs = useMemo(() => {
    if (!searchQuery.trim()) return [];
    const query = searchQuery.trim().toLowerCase();
    const cleanNumQuery = query.replace(/\D/g, "");

    return appointments.filter((appt) => {
      const matchId = (appt.id || "").toLowerCase().includes(query);
      const matchTrack = (appt.trackingCode || "").toLowerCase().includes(query);
      const matchDevice = (appt.device || "").toLowerCase().includes(query);
      const matchName = (appt.name || "").toLowerCase().includes(query);
      
      const apptPhone = (appt.phone || "").replace(/\D/g, "");
      const matchPhone = cleanNumQuery.length >= 4 && (apptPhone.includes(cleanNumQuery) || cleanNumQuery.includes(apptPhone));

      return matchId || matchTrack || matchDevice || matchName || matchPhone;
    });
  }, [appointments, searchQuery]);

  // Filter Matching Orders
  const matchedOrders = useMemo(() => {
    if (!searchQuery.trim()) return [];
    const query = searchQuery.trim().toLowerCase();
    const cleanNumQuery = query.replace(/\D/g, "");

    return orders.filter((order) => {
      const matchId = (order.id || "").toLowerCase().includes(query);
      const matchOrderNum = (order.orderNumber || "").toLowerCase().includes(query);
      const matchName = (order.customerName || "").toLowerCase().includes(query);
      
      const orderPhone = (order.customerPhone || "").replace(/\D/g, "");
      const matchPhone = cleanNumQuery.length >= 4 && (orderPhone.includes(cleanNumQuery) || cleanNumQuery.includes(orderPhone));

      return matchId || matchOrderNum || matchName || matchPhone;
    });
  }, [orders, searchQuery]);

  const [selectedRepairId, setSelectedRepairId] = useState<string | null>(null);

  // Set selected repair when matches change
  useEffect(() => {
    if (matchedRepairs.length > 0) {
      if (!selectedRepairId || !matchedRepairs.some(r => r.id === selectedRepairId)) {
        setSelectedRepairId(matchedRepairs[0].id);
      }
    } else {
      setSelectedRepairId(null);
    }
  }, [matchedRepairs, selectedRepairId]);

  const activeRepair = useMemo(() => {
    return matchedRepairs.find((r) => r.id === selectedRepairId) || matchedRepairs[0] || null;
  }, [matchedRepairs, selectedRepairId]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;
    setHasSearched(true);
  };

  const storePhone = siteSettings?.phone || "0771 165 0096";
  const storeAddress = siteSettings?.address || "العراق، الناصرية، الصالحية، شارع التقاعد، قرب دائرة التقاعد";
  const cleanStorePhone = storePhone.replace(/[^0-9+]/g, "");

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 py-8 px-4 sm:px-6 lg:px-8 selection:bg-sky-500/20 selection:text-sky-300">
      
      {/* Top Header / Breadcrumbs & Live Sync Bar */}
      <div className="max-w-5xl mx-auto mb-8 flex items-center justify-between flex-wrap gap-3">
        <Link
          href="/"
          className="inline-flex items-center gap-2 text-xs font-bold text-slate-400 hover:text-white bg-slate-900 border border-slate-800 px-3.5 py-2 rounded-xl transition-colors"
        >
          <ArrowRight className="w-4 h-4" />
          <span>العودة للرئيسية</span>
        </Link>
        <div className="flex items-center gap-2.5">
          <div className="flex items-center gap-2 bg-slate-900/80 border border-slate-800 px-3 py-2 rounded-xl text-xs">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
            <span className="text-[11px] font-bold text-slate-300">مزامنة حية وتحديث تلقائي</span>
          </div>
          <button
            type="button"
            onClick={handleManualRefresh}
            className="inline-flex items-center gap-1.5 text-xs font-bold text-sky-400 hover:text-white bg-sky-950/60 hover:bg-sky-900/60 border border-sky-800/60 px-3 py-2 rounded-xl transition-all cursor-pointer"
            title="تحديث الحالة الآن"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isRefreshing ? "animate-spin text-sky-300" : ""}`} />
            <span>{isRefreshing ? "جاري التحديث..." : "تحديث الآن"}</span>
          </button>
        </div>
      </div>

      {/* Main Container */}
      <div className="max-w-5xl mx-auto space-y-8">
        
        {/* Title Hero */}
        <div className="text-center space-y-3">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-sky-500/10 border border-sky-500/30 text-sky-400 text-xs font-extrabold shadow-inner">
            <Sparkles className="w-3.5 h-3.5" />
            <span>نظام تتبع الصيانة والأجهزة الذكي</span>
          </div>
          <h1 className="text-2xl sm:text-4xl font-black tracking-tight text-white">
            تتبع حالة جهازك وطلبك لحظة بلحظة
          </h1>
          <p className="text-sm sm:text-base text-slate-400 max-w-xl mx-auto">
            أدخل كود التتبع الموجود في الإيصال أو رقم هاتفك لمعرفة المرحلة التي وصل إليها جهازك وتقرير الفني.
          </p>
        </div>

        {/* Search Box Card */}
        <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-4 sm:p-6 shadow-2xl backdrop-blur-md">
          
          {/* Type Toggle Tabs */}
          <div className="flex items-center justify-center gap-2 mb-6 bg-slate-950 p-1.5 rounded-2xl border border-slate-800/80 max-w-md mx-auto">
            <button
              onClick={() => {
                setSearchType("repair");
              }}
              className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-xs sm:text-sm font-extrabold transition-all cursor-pointer ${
                searchType === "repair"
                  ? "bg-sky-500 text-slate-950 shadow-md shadow-sky-500/20"
                  : "text-slate-400 hover:text-white"
              }`}
            >
              <Wrench className="w-4 h-4" />
              <span>تتبع صيانة الأجهزة</span>
            </button>
            <button
              onClick={() => {
                setSearchType("order");
              }}
              className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-xs sm:text-sm font-extrabold transition-all cursor-pointer ${
                searchType === "order"
                  ? "bg-sky-500 text-slate-950 shadow-md shadow-sky-500/20"
                  : "text-slate-400 hover:text-white"
              }`}
            >
              <Truck className="w-4 h-4" />
              <span>تتبع طلبات التوصيل</span>
            </button>
          </div>

          {/* Search Form */}
          <form onSubmit={handleSearchSubmit} className="max-w-2xl mx-auto flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  setHasSearched(true);
                }}
                placeholder={
                  searchType === "repair"
                    ? "أدخل كود التتبع (مثال: RWN-R7421) أو رقم هاتفك..."
                    : "أدخل رقم الطلب (مثال: RWN-72352) أو رقم هاتفك..."
                }
                className="w-full bg-slate-950 border border-slate-700 focus:border-sky-500 rounded-2xl py-3.5 pr-11 pl-4 text-sm font-medium text-white placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-sky-500/20 transition-all text-right"
              />
              <Search className="w-5 h-5 text-slate-400 absolute right-4 top-1/2 -translate-y-1/2" />
            </div>
            <button
              type="submit"
              className="bg-sky-500 hover:bg-sky-400 active:scale-95 text-slate-950 font-black text-sm px-6 py-3.5 rounded-2xl shadow-lg shadow-sky-500/20 flex items-center justify-center gap-2 transition-all cursor-pointer whitespace-nowrap"
            >
              <Search className="w-4 h-4" />
              <span>بحث عن الحالة</span>
            </button>
          </form>

          {/* Quick Helper Tips */}
          <div className="mt-4 flex flex-wrap items-center justify-center gap-4 text-[11px] text-slate-400 text-center">
            <span className="flex items-center gap-1.5">
              <QrCode className="w-3.5 h-3.5 text-sky-400" />
              <span>يمكنك مسح كود QR الموجود على الإيصال المطبوع مباشرة</span>
            </span>
            <span className="hidden sm:inline">•</span>
            <span className="flex items-center gap-1.5">
              <Phone className="w-3.5 h-3.5 text-emerald-400" />
              <span>البحث برقم الهاتف يعرض جميع أجهزتك الحالية</span>
            </span>
          </div>

        </div>

        {/* ======================================================== */}
        {/* REPAIR TRACKING RESULTS                                 */}
        {/* ======================================================== */}
        {searchType === "repair" && (
          <div className="space-y-6">
            
            {hasSearched && matchedRepairs.length === 0 && (
              <div className="bg-slate-900 border border-slate-800 rounded-3xl p-8 sm:p-12 text-center space-y-4">
                <div className="w-16 h-16 bg-rose-500/10 border border-rose-500/30 rounded-2xl flex items-center justify-center mx-auto text-rose-400">
                  <AlertCircle className="w-8 h-8" />
                </div>
                <div className="space-y-1">
                  <h3 className="text-lg font-black text-white">لم يتم العثور على جهاز مطابق</h3>
                  <p className="text-xs sm:text-sm text-slate-400 max-w-md mx-auto">
                    تأكد من كتابة كود التتبع أو رقم الهاتف المسجل بشكل صحيح عند تسليم الجهاز للمركز.
                  </p>
                </div>
                <div className="pt-2 flex flex-wrap justify-center gap-3">
                  <button
                    onClick={() => setSearchQuery("")}
                    className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-white rounded-xl text-xs font-bold transition-all"
                  >
                    مسح البحث
                  </button>
                  <a
                    href={`https://wa.me/${cleanStorePhone}?text=${encodeURIComponent("مرحباً مركز الروان، أود الاستفسار عن حالة جهازي المسجل للصيانة.")}`}
                    target="_blank"
                    rel="noreferrer"
                    className="px-4 py-2 bg-emerald-500/20 border border-emerald-500/40 text-emerald-400 rounded-xl text-xs font-bold hover:bg-emerald-500/30 transition-all flex items-center gap-1.5"
                  >
                    <MessageCircle className="w-4 h-4" />
                    <span>تواصل مع الدعم الفني</span>
                  </a>
                </div>
              </div>
            )}

            {/* Multiple Devices Switcher Tabs if customer has more than 1 device */}
            {matchedRepairs.length > 1 && (
              <div className="space-y-2">
                <span className="text-xs font-bold text-slate-400 block">
                  أجهزتك المسجلة في المركز ({matchedRepairs.length} أجهزة):
                </span>
                <div className="flex flex-wrap gap-2">
                  {matchedRepairs.map((item) => {
                    const isSelected = item.id === (activeRepair?.id || "");
                    const badge = getStatusBadge(item.status);
                    return (
                      <button
                        key={item.id}
                        onClick={() => setSelectedRepairId(item.id)}
                        className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-extrabold border transition-all cursor-pointer ${
                          isSelected
                            ? "bg-sky-500/20 border-sky-500 text-sky-300 shadow-md"
                            : "bg-slate-900 border-slate-800 text-slate-400 hover:text-white"
                        }`}
                      >
                        <Smartphone className="w-4 h-4 text-sky-400" />
                        <span>{item.device}</span>
                        <span className={`text-[10px] px-2 py-0.5 rounded-full border ${badge.color}`}>
                          {badge.label}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Active Repair Card */}
            {activeRepair && (
              <div className="space-y-6">
                
                {/* Ready Status Alert Header if Ready for Pickup */}
                {activeRepair.status === "ready" && (
                  <div className="bg-gradient-to-r from-emerald-950/80 via-emerald-900/60 to-emerald-950/80 border-2 border-emerald-500/60 rounded-3xl p-5 sm:p-6 shadow-2xl shadow-emerald-500/10 flex flex-col sm:flex-row items-center justify-between gap-4 text-right">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 rounded-2xl bg-emerald-500 flex items-center justify-center text-slate-950 shadow-lg shadow-emerald-500/30 flex-shrink-0">
                        <CheckCircle2 className="w-7 h-7" />
                      </div>
                      <div className="space-y-0.5">
                        <h3 className="text-base sm:text-lg font-black text-white">
                          جهازك تم إصلاحه وجاهز للاستلام الآن
                        </h3>
                        <p className="text-xs text-emerald-200">
                          تم اجتياز جميع الفحوصات الفنية بنجاح. يمكنك التفضل بزيارة مركز الروان لاستلام جهازك.
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <a
                        href={`https://wa.me/${cleanStorePhone}?text=${encodeURIComponent(`مرحباً مركز الروان، بخصوص جهازي (${activeRepair.device}) كود التتبع: ${activeRepair.trackingCode || activeRepair.id}، سأحضر لاستلامه.`)}`}
                        target="_blank"
                        rel="noreferrer"
                        className="bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black text-xs px-4 py-2.5 rounded-xl transition-all shadow-md flex items-center gap-1.5 whitespace-nowrap"
                      >
                        <MessageCircle className="w-4 h-4" />
                        <span>تأكيد موعد الحضور</span>
                      </a>
                    </div>
                  </div>
                )}

                {/* Main Progress Tracker Box */}
                <div className="bg-slate-900 border border-slate-800 rounded-3xl p-5 sm:p-8 shadow-2xl space-y-8">
                  
                  {/* Top Bar with Device Name & Tracking Code */}
                  <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-800 pb-6">
                    <div className="flex items-center gap-3.5">
                      <div className="w-12 h-12 rounded-2xl bg-sky-500/10 border border-sky-500/30 flex items-center justify-center text-sky-400 shadow-inner">
                        <Smartphone className="w-6 h-6" />
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <h2 className="text-lg sm:text-xl font-black text-white">
                            {activeRepair.device}
                          </h2>
                          <span className={`text-xs font-bold px-2.5 py-0.5 rounded-full border ${getStatusBadge(activeRepair.status).color}`}>
                            {getStatusBadge(activeRepair.status).label}
                          </span>
                        </div>
                        <div className="flex flex-wrap items-center gap-3 text-xs text-slate-400 font-mono mt-0.5">
                          <span>كود التتبع: <strong className="text-sky-400 font-bold">{activeRepair.trackingCode || activeRepair.id}</strong></span>
                          <span>•</span>
                          <span>تاريخ التسجيل: {activeRepair.date || new Date(activeRepair.createdAt).toLocaleDateString("ar-IQ")}</span>
                        </div>
                      </div>
                    </div>

                    {/* Progress Percentage Badge */}
                    <div className="text-left bg-slate-950 px-4 py-2.5 rounded-2xl border border-slate-800">
                      <span className="text-[10px] text-slate-500 font-bold block">نسبة الإنجاز</span>
                      <strong className="text-lg font-black font-mono text-sky-400">
                        {activeRepair.status === "completed" || activeRepair.status === "ready"
                          ? "100%"
                          : activeRepair.status === "testing"
                          ? "85%"
                          : activeRepair.status === "in-progress"
                          ? "65%"
                          : activeRepair.status === "diagnosing"
                          ? "35%"
                          : "15%"}
                      </strong>
                    </div>
                  </div>

                  {/* Visual Stepper Bar */}
                  <div className="space-y-6">
                    <div className="relative">
                      
                      {/* Connector Line */}
                      <div className="hidden md:block absolute top-1/2 left-0 right-0 h-1.5 bg-slate-800 -translate-y-1/2 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-gradient-to-r from-sky-500 via-emerald-500 to-emerald-400 transition-all duration-700"
                          style={{
                            width:
                              activeRepair.status === "ready" || activeRepair.status === "completed"
                                ? "100%"
                                : activeRepair.status === "testing"
                                ? "85%"
                                : activeRepair.status === "in-progress"
                                ? "60%"
                                : activeRepair.status === "diagnosing"
                                ? "30%"
                                : "10%",
                          }}
                        />
                      </div>

                      {/* Steps Grid */}
                      <div className="grid grid-cols-1 md:grid-cols-5 gap-4 relative z-10">
                        {REPAIR_STEPS.map((step, idx) => {
                          const currentIdx = getStepIndex(activeRepair.status);
                          const isDone = currentIdx > idx || activeRepair.status === "completed";
                          const isCurrent = currentIdx === idx && activeRepair.status !== "completed";
                          const StepIcon = step.icon;

                          return (
                            <div
                              key={step.id}
                              className={`p-4 rounded-2xl border transition-all flex md:flex-col items-center gap-3.5 text-right md:text-center ${
                                isCurrent
                                  ? "bg-sky-500/10 border-sky-500 shadow-lg shadow-sky-500/10 ring-2 ring-sky-500/20"
                                  : isDone
                                  ? "bg-slate-950/80 border-emerald-500/40 text-slate-200"
                                  : "bg-slate-950/40 border-slate-800/60 opacity-60"
                              }`}
                            >
                              <div
                                className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 transition-all ${
                                  isCurrent
                                    ? "bg-sky-500 text-slate-950 shadow-md shadow-sky-500/30 scale-110"
                                    : isDone
                                    ? "bg-emerald-500 text-slate-950 shadow-md shadow-emerald-500/20"
                                    : "bg-slate-800 text-slate-500"
                                }`}
                              >
                                {isDone ? (
                                  <CheckCircle2 className="w-5 h-5" />
                                ) : (
                                  <StepIcon className="w-5 h-5" />
                                )}
                              </div>
                              <div className="space-y-0.5 flex-1 md:flex-none">
                                <h4
                                  className={`text-xs font-black ${
                                    isCurrent ? "text-sky-400" : isDone ? "text-white" : "text-slate-400"
                                  }`}
                                >
                                  {step.title}
                                </h4>
                                <p className="text-[10px] text-slate-500 leading-tight">
                                  {step.subtitle}
                                </p>
                              </div>
                            </div>
                          );
                        })}
                      </div>

                    </div>
                  </div>

                  {/* 3-Column Info Overview Cards */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-2">
                    
                    {/* Reported Issue & Diagnostics */}
                    <div className="bg-slate-950/70 border border-slate-800/80 rounded-2xl p-4 space-y-2">
                      <div className="flex items-center gap-2 text-xs font-bold text-slate-400">
                        <AlertCircle className="w-4 h-4 text-amber-400" />
                        <span>العطل المشخص:</span>
                      </div>
                      <p className="text-sm font-black text-white">{activeRepair.issueType}</p>
                      {activeRepair.details && (
                        <p className="text-xs text-slate-400 bg-slate-900/80 p-2.5 rounded-xl border border-slate-800 leading-relaxed">
                          {activeRepair.details}
                        </p>
                      )}
                    </div>

                    {/* Technician Live Notes */}
                    <div className="bg-slate-950/70 border border-slate-800/80 rounded-2xl p-4 space-y-2">
                      <div className="flex items-center gap-2 text-xs font-bold text-slate-400">
                        <Wrench className="w-4 h-4 text-sky-400" />
                        <span>تقرير مهندس الصيانة:</span>
                      </div>
                      {activeRepair.techNotes ? (
                        <p className="text-xs font-bold text-sky-200 bg-sky-950/30 border border-sky-800/50 p-2.5 rounded-xl leading-relaxed">
                          {activeRepair.techNotes}
                        </p>
                      ) : (
                        <p className="text-xs text-slate-500 italic p-2">
                          جاري استكمال الفحص وتحديث التقرير الفني من قبل الورشة...
                        </p>
                      )}
                    </div>

                    {/* Cost & Ready Date */}
                    <div className="bg-slate-950/70 border border-slate-800/80 rounded-2xl p-4 space-y-3">
                      <div className="flex justify-between items-center text-xs">
                        <span className="text-slate-400 font-bold">التكلفة المقدرة:</span>
                        <strong className="text-white font-mono font-bold" dir="ltr">
                          {activeRepair.cost && activeRepair.cost > 0
                            ? `${activeRepair.cost.toLocaleString()} د.ع`
                            : "يحدد بعد الفحص"}
                        </strong>
                      </div>
                      <div className="flex justify-between items-center text-xs">
                        <span className="text-slate-400 font-bold">موعد الاستلام المتوقع:</span>
                        <strong className="text-sky-400 font-bold">
                          {activeRepair.estimatedReady || "خلال 24-48 ساعة"}
                        </strong>
                      </div>
                      <div className="flex justify-between items-center text-xs border-t border-slate-800/80 pt-2 text-[10px] text-slate-400">
                        <span>الضمان:</span>
                        <span className="text-emerald-400 font-bold">ضمان فحص وقطع أصلية</span>
                      </div>
                    </div>

                  </div>

                  {/* Actions & Support Buttons Bar */}
                  <div className="border-t border-slate-800 pt-6 flex flex-wrap items-center justify-between gap-4">
                    <div className="space-y-0.5">
                      <div className="flex items-center gap-1.5 text-xs text-slate-300 font-bold">
                        <MapPin className="w-3.5 h-3.5 text-rose-400" />
                        <span>{storeAddress}</span>
                      </div>
                      <div className="text-[11px] text-slate-400">
                        أوقات العمل: يومياً من 3:00 مساءً حتى 12:00 ليلاً
                      </div>
                    </div>

                    <div className="flex flex-wrap items-center gap-2.5">
                      <a
                        href={`https://wa.me/${cleanStorePhone}?text=${encodeURIComponent(`مرحباً مركز الروان، استفسار عن حالة جهازي (${activeRepair.device}) - كود التتبع: ${activeRepair.trackingCode || activeRepair.id}`)}`}
                        target="_blank"
                        rel="noreferrer"
                        className="bg-emerald-600 hover:bg-emerald-500 text-white font-extrabold text-xs px-4 py-2.5 rounded-xl shadow-lg shadow-emerald-600/20 flex items-center gap-2 transition-all cursor-pointer"
                      >
                        <MessageCircle className="w-4 h-4" />
                        <span>استفسار عبر واتساب</span>
                      </a>
                      <a
                        href={`tel:${cleanStorePhone}`}
                        className="bg-slate-800 hover:bg-slate-700 text-white font-bold text-xs px-4 py-2.5 rounded-xl transition-all flex items-center gap-2 cursor-pointer"
                      >
                        <Phone className="w-4 h-4" />
                        <span>اتصال بالمركز</span>
                      </a>
                    </div>
                  </div>

                </div>

              </div>
            )}

          </div>
        )}

        {/* ======================================================== */}
        {/* ORDER TRACKING RESULTS                                  */}
        {/* ======================================================== */}
        {searchType === "order" && (
          <div className="space-y-6">
            
            {hasSearched && matchedOrders.length === 0 && (
              <div className="bg-slate-900 border border-slate-800 rounded-3xl p-8 sm:p-12 text-center space-y-4">
                <div className="w-16 h-16 bg-rose-500/10 border border-rose-500/30 rounded-2xl flex items-center justify-center mx-auto text-rose-400">
                  <AlertCircle className="w-8 h-8" />
                </div>
                <div className="space-y-1">
                  <h3 className="text-lg font-black text-white">لم يتم العثور على طلب مطابق</h3>
                  <p className="text-xs sm:text-sm text-slate-400 max-w-md mx-auto">
                    تأكد من كتابة رقم الطلب (مثال: RWN-72352) أو رقم الهاتف المستخدم عند إتمام الطلب.
                  </p>
                </div>
              </div>
            )}

            {matchedOrders.map((order) => {
              const statusColors: Record<string, { label: string; color: string }> = {
                pending: { label: "بانتظار المعالجة والتحضير", color: "bg-amber-500/10 text-amber-400 border-amber-500/20" },
                confirmed: { label: "تم تأكيد الطلب وتجهيزه", color: "bg-sky-500/10 text-sky-400 border-sky-500/20" },
                shipping: { label: "قيد التوصيل مع المندوب", color: "bg-purple-500/10 text-purple-400 border-purple-500/20" },
                delivered: { label: "تم التسليم بنجاح", color: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20" },
                cancelled: { label: "ملغي", color: "bg-rose-500/10 text-rose-400 border-rose-500/20" },
              };
              const badge = statusColors[order.status] || { label: order.status, color: "bg-slate-800 text-slate-400" };

              return (
                <div key={order.id} className="bg-slate-900 border border-slate-800 rounded-3xl p-5 sm:p-8 shadow-2xl space-y-6">
                  <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-800 pb-4">
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="text-lg font-black text-white">طلب رقم: {order.orderNumber}</h3>
                        <span className={`text-xs font-bold px-2.5 py-0.5 rounded-full border ${badge.color}`}>
                          {badge.label}
                        </span>
                      </div>
                      <p className="text-xs text-slate-400 mt-1">
                        تاريخ الطلب: {new Date(order.createdAt).toLocaleDateString("ar-IQ", { year: "numeric", month: "2-digit", day: "2-digit", hour: "2-digit", minute: "2-digit" })}
                      </p>
                    </div>

                    <div className="bg-slate-950 px-4 py-2 rounded-xl border border-slate-800 text-right">
                      <span className="text-[10px] text-slate-500 block">المبلغ المطلوب (COD)</span>
                      <strong className="text-sm font-black font-mono text-emerald-400" dir="ltr">
                        {order.totalAmount.toLocaleString()} د.ع
                      </strong>
                    </div>
                  </div>

                  {/* Customer and Delivery Info */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs bg-slate-950/60 p-4 rounded-2xl border border-slate-800">
                    <div>
                      <span className="text-slate-500 font-bold block">المستلم:</span>
                      <strong className="text-white text-sm">{order.customerName}</strong>
                      <div className="font-mono text-slate-400" dir="ltr">{order.customerPhone}</div>
                    </div>
                    <div>
                      <span className="text-slate-500 font-bold block">عنوان التوصيل:</span>
                      <strong className="text-slate-300 leading-tight block">{order.customerAddress}</strong>
                    </div>
                  </div>

                  {/* Products in Order */}
                  <div className="space-y-2">
                    <h4 className="text-xs font-bold text-slate-400">المنتجات في الطلب:</h4>
                    <div className="divide-y divide-slate-800 bg-slate-950/40 rounded-2xl border border-slate-800 overflow-hidden">
                      {order.items.map((item, idx) => (
                        <div key={idx} className="p-3 flex items-center justify-between text-xs">
                          <div>
                            <strong className="text-white block">{item.productName}</strong>
                            <span className="text-[10px] text-slate-500">
                              {[item.selectedStorage, item.selectedColor?.name, item.selectedPort].filter(Boolean).join(" • ")}
                            </span>
                          </div>
                          <div className="text-left font-mono font-bold">
                            <span className="text-slate-400 mr-2">x{item.quantity}</span>
                            <span className="text-white" dir="ltr">{(item.price * item.quantity).toLocaleString()} د.ع</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                </div>
              );
            })}

          </div>
        )}

      </div>

    </div>
  );
}

export default function TrackPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-slate-950 flex items-center justify-center text-white">
          <div className="flex items-center gap-3">
            <RefreshCw className="w-5 h-5 text-sky-400 animate-spin" />
            <span className="text-sm font-bold">جاري تحميل نظام التتبع...</span>
          </div>
        </div>
      }
    >
      <TrackingContent />
    </Suspense>
  );
}
