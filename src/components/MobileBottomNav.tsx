"use client";

import React, { useState, useEffect, useRef, useCallback } from "react";
import { Home, Grid, Wrench, ShoppingBag, MessageCircle } from "lucide-react";
import Link from "next/link";
import { useApp } from "@/context/AppContext";

export default function MobileBottomNav() {
  const [activeTab, setActiveTab] = useState("home");
  const [isVisible, setIsVisible] = useState(true);
  const lastScrollYRef = useRef(0);
  const tickingRef = useRef(false);
  const catOffsetRef = useRef(500);
  const repOffsetRef = useRef(1500);
  const { siteSettings, cartItems } = useApp();

  const totalItems = cartItems?.reduce((acc, curr) => acc + curr.quantity, 0) || 0;

  const updateOffsets = useCallback(() => {
    const catEl = document.getElementById("categories");
    const repEl = document.getElementById("repair");
    if (catEl) catOffsetRef.current = catEl.offsetTop - 300;
    if (repEl) repOffsetRef.current = repEl.offsetTop - 300;
  }, []);

  useEffect(() => {
    // Initial offset calculation after a short delay to ensure DOM is ready
    const timer = setTimeout(updateOffsets, 1000);
    window.addEventListener("resize", updateOffsets);

    const handleScroll = () => {
      if (!tickingRef.current) {
        window.requestAnimationFrame(() => {
          const currentScrollY = window.scrollY;
          const lastY = lastScrollYRef.current;

          // Only update visibility if it actually changed
          const shouldHide = currentScrollY > lastY && currentScrollY > 100;
          setIsVisible(prev => {
            const next = !shouldHide;
            return prev === next ? prev : next;
          });

          lastScrollYRef.current = currentScrollY;

          // Determine active tab based on scroll position
          let newTab: string;
          if (currentScrollY < catOffsetRef.current) {
            newTab = "home";
          } else if (currentScrollY < repOffsetRef.current) {
            newTab = "categories";
          } else {
            newTab = "repair";
          }

          setActiveTab(prev => prev === newTab ? prev : newTab);

          tickingRef.current = false;
        });
        tickingRef.current = true;
      }
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => {
      clearTimeout(timer);
      window.removeEventListener("scroll", handleScroll);
      window.removeEventListener("resize", updateOffsets);
    };
  }, [updateOffsets]);

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

  // Pre-calculate bubble position index
  const activeIndex = navItems.findIndex(item => item.id === activeTab);
  const showBubble = activeTab !== 'whatsapp' && activeTab !== 'cart';

  return (
    <div
      className={`md:hidden fixed bottom-4 inset-x-0 z-40 px-4 ${isVisible ? "translate-y-0" : "translate-y-28"
        }`}
      style={{
        transition: "transform 0.4s cubic-bezier(0.25, 0.46, 0.45, 0.94)",
        willChange: "transform",
      }}
    >
      <div
        className="bg-white/90 backdrop-blur-3xl border border-slate-200/50 shadow-[0_8px_32px_rgba(0,0,0,0.12)] rounded-full flex items-center justify-between relative overflow-visible h-16"
        style={{ willChange: "auto" }}
      >

        {/* Animated active background bubble */}
        <div
          className="absolute h-[calc(100%-12px)] top-[6px] bg-[#1a1a1a] rounded-full shadow-md"
          style={{
            width: `calc(20% - 12px)`,
            right: `calc(20% * ${activeIndex} + 6px)`,
            opacity: showBubble ? 1 : 0,
            transition: "right 0.45s cubic-bezier(0.34, 1.56, 0.64, 1), opacity 0.3s ease",
            willChange: "right, opacity",
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
              className={`relative z-10 flex flex-1 flex-col items-center justify-center gap-1 cursor-pointer h-full ${isWhatsApp ? "-translate-y-6" : ""}`}
              style={{
                transition: "color 0.25s ease",
              }}
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
                      className={`w-5 h-5 ${isActive ? "text-white mb-0.5" : "text-slate-500"
                        }`}
                      strokeWidth={isActive ? 2.5 : 2}
                      style={{
                        transition: "color 0.25s ease, transform 0.25s ease",
                        transform: isActive ? "scale(1.1)" : "scale(1)",
                      }}
                    />
                    {item.id === "cart" && totalItems > 0 && (
                      <span className="absolute -top-1.5 -right-2 flex h-[18px] min-w-[18px] px-1 items-center justify-center rounded-full bg-rose-500 text-[10px] font-black text-white shadow-sm border border-white">
                        {totalItems}
                      </span>
                    )}
                  </div>
                  <span
                    className={`text-[9.5px] font-black tracking-wider ${isActive ? "text-white opacity-100" : "text-slate-500 opacity-80"
                      }`}
                    style={{
                      transition: "color 0.25s ease, opacity 0.25s ease",
                    }}
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
