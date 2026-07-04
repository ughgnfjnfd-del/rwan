"use client";

import React, { useState, useEffect } from "react";
import { Home, Grid, Wrench, ShoppingBag, MessageCircle } from "lucide-react";
import Link from "next/link";
import { useApp } from "@/context/AppContext";

export default function MobileBottomNav() {
  const [activeTab, setActiveTab] = useState("home");
  const [isVisible, setIsVisible] = useState(true);
  const [lastScrollY, setLastScrollY] = useState(0);
  const { siteSettings, cartItems } = useApp();

  const totalItems = cartItems?.reduce((acc, curr) => acc + curr.quantity, 0) || 0;

  useEffect(() => {
    let ticking = false;
    let catOffset = 500;
    let repOffset = 1500;

    const updateOffsets = () => {
      const catEl = document.getElementById("categories");
      const repEl = document.getElementById("repair");
      if (catEl) catOffset = catEl.offsetTop - 300;
      if (repEl) repOffset = repEl.offsetTop - 300;
    };

    // Initial offset calculation after a short delay to ensure DOM is ready
    setTimeout(updateOffsets, 1000);
    window.addEventListener("resize", updateOffsets);

    const handleScroll = () => {
      if (!ticking) {
        window.requestAnimationFrame(() => {
          const currentScrollY = window.scrollY;
          
          if (currentScrollY > lastScrollY && currentScrollY > 100) {
            setIsVisible(false);
          } else {
            setIsVisible(true);
          }
          
          setLastScrollY(currentScrollY);
          
          if (currentScrollY < catOffset) setActiveTab("home");
          else if (currentScrollY >= catOffset && currentScrollY < repOffset) setActiveTab("categories");
          else if (currentScrollY >= repOffset) setActiveTab("repair");
          
          ticking = false;
        });
        ticking = true;
      }
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => {
      window.removeEventListener("scroll", handleScroll);
      window.removeEventListener("resize", updateOffsets);
    };
  }, [lastScrollY]);

  const navItems = [
    { id: "home", label: "الرئيسية", icon: Home, href: "#" },
    { id: "categories", label: "الأقسام", icon: Grid, href: "#categories" },
    { id: "whatsapp", label: "", icon: MessageCircle, href: `https://wa.me/${siteSettings?.phone?.replace(/[^\d+]/g, '') || ''}` },
    { id: "cart", label: "السلة", icon: ShoppingBag, href: "#" },
    { id: "repair", label: "الصيانة", icon: Wrench, href: "#repair" },
  ];

  const handleNavClick = (id: string, e: React.MouseEvent) => {
    if (id === "cart") {
      e.preventDefault();
      window.dispatchEvent(new Event("open-cart"));
    } else if (id === "whatsapp") {
      // Allow default link behavior
    } else {
      setActiveTab(id);
      // Smooth scroll manually to avoid instant jump & URL hash change
      e.preventDefault();
      if (id === "home") window.scrollTo({ top: 0, behavior: "smooth" });
      else {
        const el = document.getElementById(id);
        if (el) window.scrollTo({ top: el.offsetTop - 80, behavior: "smooth" });
      }
    }
  };

  return (
    <div 
      className={`md:hidden fixed bottom-4 inset-x-0 z-40 px-4 transition-transform duration-500 ease-in-out ${
        isVisible ? "translate-y-0" : "translate-y-28"
      }`}
    >
      <div className="bg-white/90 backdrop-blur-3xl border border-slate-200/50 shadow-[0_8px_32px_rgba(0,0,0,0.12)] rounded-full flex items-center justify-between relative overflow-visible h-16">
        
        {/* Animated active background bubble - Mathematically centered */}
        <div 
          className="absolute h-[calc(100%-12px)] top-[6px] bg-[#1a1a1a] rounded-full transition-all duration-500 ease-[cubic-bezier(0.34,1.56,0.64,1)] shadow-md"
          style={{ 
            width: `calc(20% - 12px)`, 
            right: `calc(20% * ${navItems.findIndex(item => item.id === activeTab)} + 6px)`,
            opacity: activeTab === 'whatsapp' || activeTab === 'cart' ? 0 : 1
          }}
        />

        {navItems.map((item) => {
          const isActive = activeTab === item.id;
          const isWhatsApp = item.id === "whatsapp";
          const Icon = item.icon;
          
          return (
            <Link
              key={item.id}
              href={item.href}
              target={isWhatsApp ? "_blank" : "_self"}
              onClick={(e) => handleNavClick(item.id, e)}
              className={`relative z-10 flex flex-1 flex-col items-center justify-center gap-1 cursor-pointer transition-colors duration-300 h-full ${isWhatsApp ? "-translate-y-6" : ""}`}
            >
              {isWhatsApp ? (
                <div className="relative w-[60px] h-[60px] bg-gradient-to-tr from-emerald-500 to-emerald-400 rounded-full flex items-center justify-center shadow-xl shadow-emerald-500/40 text-white border-4 border-[#fcfcfc]">
                  <span className="absolute inset-0 rounded-full animate-ping bg-emerald-400 opacity-20 -z-10"></span>
                  <Icon className="w-7 h-7 animate-pulse" />
                </div>
              ) : (
                <>
                  <div className="relative">
                    <Icon 
                      className={`w-5 h-5 transition-all duration-300 ${
                        isActive ? "text-white scale-110 mb-0.5" : "text-slate-500"
                      }`} 
                      strokeWidth={isActive ? 2.5 : 2}
                    />
                    {item.id === "cart" && totalItems > 0 && (
                      <span className="absolute -top-1.5 -right-2 flex h-[18px] min-w-[18px] px-1 items-center justify-center rounded-full bg-rose-500 text-[10px] font-black text-white shadow-sm border border-white">
                        {totalItems}
                      </span>
                    )}
                  </div>
                  <span 
                    className={`text-[9.5px] font-black tracking-wider transition-all duration-300 ${
                      isActive ? "text-white opacity-100" : "text-slate-500 opacity-80"
                    }`}
                  >
                    {item.label}
                  </span>
                </>
              )}
            </Link>
          );
        })}
      </div>
    </div>
  );
}
