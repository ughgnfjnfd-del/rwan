"use client";

import React, { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import PartnerSiteButton from "@/components/PartnerSiteButton";
import {
  Scale,
  ShieldCheck,
  Wrench,
  Truck,
  ArrowRight,
  Menu,
  X,
  BookOpen
} from "lucide-react";

interface PolicyLayoutProps {
  children: React.ReactNode;
}

export default function PoliciesLayout({ children }: PolicyLayoutProps) {
  const pathname = usePathname();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  // Policy Menu Items
  const menuItems = [
    {
      name: "سياسة الاسترجاع والتبديل",
      href: "/policies/return",
      icon: Scale,
      color: "text-amber-500 bg-amber-50"
    },
    {
      name: "تفاصيل ضمان الأجهزة والقطع",
      href: "/policies/warranty",
      icon: ShieldCheck,
      color: "text-emerald-500 bg-emerald-50"
    },
    {
      name: "شروط حجز موعد الصيانة",
      href: "/policies/repair-terms",
      icon: Wrench,
      color: "text-blue-500 bg-blue-50"
    },
    {
      name: "خدمة التوصيل والشحن",
      href: "/policies/shipping",
      icon: Truck,
      color: "text-purple-500 bg-purple-50"
    }
  ];

  return (
    <div className="min-h-screen bg-white text-[#1a1a1a] flex flex-col font-sans">
      
      {/* Policy Header */}
      <header className="sticky top-0 z-40 bg-white/80 backdrop-blur-md border-b border-card-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
          
          {/* Logo */}
          <Link href="/" className="flex items-center gap-3">
            <div className="text-right">
              <span className="block text-lg sm:text-xl font-extrabold tracking-tight text-[#1a1a1a]">
                مركز الروان
              </span>
              <span className="block text-[10px] sm:text-xs font-semibold tracking-wider text-slate-400 uppercase -mt-1 font-mono">
                Al-Rwan Center
              </span>
            </div>
            <div className="w-1.5 h-8 bg-accent rounded-full"></div>
          </Link>

          {/* Links back to home page */}
          <nav className="hidden md:flex items-center gap-8 text-sm font-semibold text-slate-600">
            <Link href="/" className="hover:text-accent transition-colors">الرئيسية</Link>
            <Link href="/#categories" className="hover:text-accent transition-colors">موبايلات</Link>
            <Link href="/#categories" className="hover:text-accent transition-colors">ملحقات</Link>
            <Link href="/#repair" className="hover:text-accent transition-colors">صيانة</Link>
            <PartnerSiteButton />
          </nav>

          {/* Return button */}
          <div className="flex items-center gap-4">
            <Link
              href="/"
              className="text-xs bg-slate-50 hover:bg-slate-100 text-[#1a1a1a] border border-slate-200 font-bold px-4 py-2 rounded-xl transition-all flex items-center gap-1.5"
            >
              <ArrowRight className="w-3.5 h-3.5" />
              <span>العودة للمتجر</span>
            </Link>

            <PartnerSiteButton variant="mobile" />

            {/* Mobile menu trigger */}
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="p-2 md:hidden rounded-full hover:bg-slate-50 border border-slate-100 transition-colors"
            >
              {isMobileMenuOpen ? <X className="w-4 h-4 text-slate-600" /> : <Menu className="w-4 h-4 text-slate-600" />}
            </button>
          </div>

        </div>
      </header>

      {/* Mobile nav drawer */}
      {isMobileMenuOpen && (
        <div className="fixed inset-0 z-30 bg-black/40 backdrop-blur-sm md:hidden" onClick={() => setIsMobileMenuOpen(false)}>
          <div className="w-3/4 max-w-sm bg-white h-full p-6 shadow-2xl flex flex-col space-y-6 animate-in slide-in-from-right duration-200" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between border-b border-card-border pb-4">
              <div>
                <span className="block text-md font-extrabold">مركز الروان</span>
                <span className="block text-[9px] font-bold text-slate-400 uppercase font-mono">Al-Rwan Center</span>
              </div>
              <button onClick={() => setIsMobileMenuOpen(false)} className="p-1 rounded-full hover:bg-slate-100 text-slate-400">
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <nav className="flex flex-col gap-4 text-base font-bold text-slate-700">
              <Link href="/" onClick={() => setIsMobileMenuOpen(false)} className="hover:text-accent">الرئيسية</Link>
              <div className="border-t border-slate-100 my-2 pt-2"></div>
              <div className="text-xs font-semibold text-slate-400 mb-2">أقسام السياسات والضمان:</div>
              {menuItems.map((item) => {
                const IconComponent = item.icon;
                const isActive = pathname === item.href;
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={() => setIsMobileMenuOpen(false)}
                    className={`flex items-center gap-2.5 p-2 rounded-xl text-sm font-bold transition-all ${
                      isActive
                        ? "bg-accent/10 text-accent"
                        : "hover:bg-slate-50 text-slate-600"
                    }`}
                  >
                    <IconComponent className="w-4.5 h-4.5" />
                    <span>{item.name}</span>
                  </Link>
                );
              })}
            </nav>
          </div>
        </div>
      )}

      {/* Subpage Container */}
      <main className="flex-grow max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full">
        
        {/* Title / Breadcrumbs */}
        <div className="mb-8 text-right space-y-2">
          <div className="flex items-center justify-start gap-1.5 text-xs text-slate-400 font-semibold">
            <Link href="/" className="hover:text-slate-600 transition-colors">المتجر الرئيسي</Link>
            <span>/</span>
            <span className="text-slate-600">السياسات والضمان</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-[#1a1a1a] flex items-center gap-2">
            <BookOpen className="w-6 h-6 text-accent" />
            مرجع السياسات وحقوق العملاء
          </h1>
          <p className="text-xs sm:text-sm text-slate-500">
            نهدف في مركز الروان إلى تقديم خدمة شفافة وموثوقة، تفضل بقراءة شروطنا وأحكامنا المعتمدة.
          </p>
        </div>

        {/* Content Layout Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* Sidebar - Right on Desktop (RTL layout) */}
          <aside className="lg:col-span-4 bg-slate-50 border border-card-border p-4 rounded-2xl space-y-2.5 lg:sticky lg:top-24">
            <h3 className="font-extrabold text-xs text-slate-400 uppercase tracking-wider mb-3 px-2">
              قائمة السياسات
            </h3>
            <div className="space-y-1">
              {menuItems.map((item) => {
                const IconComponent = item.icon;
                const isActive = pathname === item.href;
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={`flex items-center justify-between p-3.5 rounded-xl text-xs sm:text-sm font-bold transition-all duration-200 group ${
                      isActive
                        ? "bg-white border border-card-border shadow-sm text-accent ring-1 ring-accent/10"
                        : "hover:bg-white/60 text-slate-600 hover:text-[#1a1a1a]"
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div className={`p-1.5 rounded-lg ${item.color} group-hover:scale-105 transition-transform duration-200`}>
                        <IconComponent className="w-4 h-4" />
                      </div>
                      <span>{item.name}</span>
                    </div>
                    <span className={`text-[10px] transition-transform duration-200 ${isActive ? "translate-x-0 font-bold" : "opacity-0 group-hover:opacity-100 -translate-x-1"}`}>
                      ←
                    </span>
                  </Link>
                );
              })}
            </div>
            
            <div className="p-3 bg-accent/5 border border-accent/10 rounded-xl mt-4">
              <p className="text-[10px] text-slate-500 leading-relaxed text-right">
                هل لديك استفسار إضافي لم تتم الإجابة عليه؟ تواصل مع قسم الدعم الفني مباشرة على الرقم <strong className="text-slate-800" dir="ltr">0773 165 0096</strong>.
              </p>
            </div>
          </aside>

          {/* Active Page Content - Left on Desktop */}
          <div className="lg:col-span-8 bg-white border border-card-border rounded-2xl p-6 sm:p-8 min-h-[400px]">
            {children}
          </div>

        </div>

      </main>

      {/* Simplified Footer */}
      <footer className="bg-slate-50 border-t border-card-border py-8 mt-12 text-center text-xs text-slate-400">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-4">
          <div className="flex justify-center gap-6 font-semibold text-slate-500">
            <Link href="/" className="hover:text-accent transition-colors">الرئيسية للمتجر</Link>
            <Link href="/#categories" className="hover:text-accent transition-colors">الأقسام</Link>
            <Link href="/#repair" className="hover:text-accent transition-colors">حجز الصيانة</Link>
          </div>
          <div>
            &copy; {new Date().getFullYear()} مركز الروان (Al-Rwan Center). جميع الحقوق محفوظة.
          </div>
        </div>
      </footer>

    </div>
  );
}
