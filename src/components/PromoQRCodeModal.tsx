"use client";

import React, { useState, useEffect, useMemo, useRef } from "react";
import {
  X,
  QrCode,
  Download,
  Printer,
  Copy,
  Check,
  Sparkles,
  Gift,
  Tag,
  Share2,
  ExternalLink,
  ShieldCheck,
  Smartphone,
  Layers,
  FileDown
} from "lucide-react";
import QRCode from "qrcode";
import JsBarcode from "jsbarcode";
import { CouponCode, CouponCampaign, useApp } from "@/context/AppContext";

interface PromoQRCodeModalProps {
  isOpen: boolean;
  onClose: () => void;
  coupon: CouponCode | null;
  campaign?: CouponCampaign | null;
}

/**
 * 100% Offline Vector SVG QR Code
 */
function VectorQRCode({ url, size = 160 }: { url: string; size?: number }) {
  const qrSvgData = useMemo(() => {
    try {
      const qr = QRCode.create(url || "https://alrwan-center.com", {
        errorCorrectionLevel: "H",
      });
      const moduleCount = qr.modules.size;
      const margin = 1;
      const viewBoxSize = moduleCount + margin * 2;

      let path = "";
      for (let r = 0; r < moduleCount; r++) {
        for (let c = 0; c < moduleCount; c++) {
          if (qr.modules.get(r, c)) {
            path += `M${c + margin},${r + margin}h1v1h-1z `;
          }
        }
      }
      return { path, viewBoxSize };
    } catch (e) {
      console.error("QR generation error:", e);
      return null;
    }
  }, [url]);

  if (!qrSvgData) return null;

  return (
    <svg
      viewBox={`0 0 ${qrSvgData.viewBoxSize} ${qrSvgData.viewBoxSize}`}
      width={size}
      height={size}
      shapeRendering="crispEdges"
      className="object-contain max-w-full"
    >
      <rect width="100%" height="100%" fill="#ffffff" />
      <path d={qrSvgData.path} fill="#0f172a" />
    </svg>
  );
}

/**
 * Code 128 Barcode for Promo Code
 */
function VectorBarcode({ value }: { value: string }) {
  const svgRef = useRef<SVGSVGElement | null>(null);

  useEffect(() => {
    if (svgRef.current && value) {
      try {
        JsBarcode(svgRef.current, value, {
          format: "CODE128",
          width: 1.8,
          height: 42,
          displayValue: true,
          font: "monospace",
          fontSize: 11,
          fontOptions: "bold",
          margin: 4,
          background: "transparent",
        });
      } catch (e) {
        console.error("Barcode error:", e);
      }
    }
  }, [value]);

  return (
    <div className="flex flex-col items-center">
      <svg ref={svgRef} className="max-w-full h-12 overflow-visible" />
    </div>
  );
}

export default function PromoQRCodeModal({
  isOpen,
  onClose,
  coupon,
  campaign: propCampaign,
}: PromoQRCodeModalProps) {
  const { couponCampaigns, siteSettings } = useApp();
  const [activeTab, setActiveTab] = useState<"card" | "qr_only" | "barcode_only">("card");
  const [cardTheme, setCardTheme] = useState<"dark" | "white">("dark");
  const [copiedLink, setCopiedLink] = useState(false);
  const [copiedCode, setCopiedCode] = useState(false);
  const [isGeneratingImg, setIsGeneratingImg] = useState(false);

  const campaign = propCampaign || (coupon ? couponCampaigns.find((c) => c.id === coupon.campaignId) : null);

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

  if (!isOpen || !coupon) return null;

  const currentDomain = typeof window !== "undefined" ? window.location.origin : "https://alrwan-center.com";
  const utmParams = campaign
    ? `?utm_source=${encodeURIComponent(campaign.source || "promo_qr")}&utm_medium=${encodeURIComponent(campaign.medium || "qr_card")}&utm_campaign=${encodeURIComponent(campaign.campaign || "special_offer")}`
    : "";
  const promoUrl = `${currentDomain}/promo/${encodeURIComponent(coupon.code)}${utmParams}`;

  const discountText =
    coupon.discountType === "percent"
      ? `خصم ${coupon.discountValue}%`
      : `خصم ${coupon.discountValue.toLocaleString()} د.ع`;

  const appliesToText =
    coupon.appliesTo === "store"
      ? "المتجر والمنتجات"
      : coupon.appliesTo === "repair"
      ? "خدمات الصيانة"
      : "المتجر والصيانة معاً";

  const storeName = "مركز الروان";
  const storePhone = siteSettings?.phone || "0771 165 0096";

  const handleCopyLink = () => {
    navigator.clipboard.writeText(promoUrl);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2000);
  };

  const handleCopyCode = () => {
    navigator.clipboard.writeText(coupon.code);
    setCopiedCode(true);
    setTimeout(() => setCopiedCode(false), 2000);
  };

  // Download Standalone High-Res QR Code PNG (1024x1024)
  const handleDownloadQRPNG = () => {
    setIsGeneratingImg(true);
    try {
      const qr = QRCode.create(promoUrl, { errorCorrectionLevel: "H" });
      const moduleCount = qr.modules.size;
      const canvasSize = 1024;
      const padding = 80;
      const cellSize = Math.floor((canvasSize - padding * 2) / moduleCount);
      const actualGridSize = cellSize * moduleCount;
      const offsetX = (canvasSize - actualGridSize) / 2;
      const offsetY = 70;

      const canvas = document.createElement("canvas");
      canvas.width = canvasSize;
      canvas.height = canvasSize + 140;
      const ctx = canvas.getContext("2d");
      if (!ctx) return;

      // Clean white background with rounded corners
      ctx.fillStyle = "#ffffff";
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // Border outline
      ctx.strokeStyle = "#e2e8f0";
      ctx.lineWidth = 6;
      ctx.strokeRect(10, 10, canvas.width - 20, canvas.height - 20);

      // Draw QR modules
      ctx.fillStyle = "#0f172a";
      for (let r = 0; r < moduleCount; r++) {
        for (let c = 0; c < moduleCount; c++) {
          if (qr.modules.get(r, c)) {
            ctx.fillRect(offsetX + c * cellSize, offsetY + r * cellSize, cellSize, cellSize);
          }
        }
      }

      // Draw Header Text (Store Name)
      ctx.fillStyle = "#0284c7";
      ctx.font = "bold 32px 'Segoe UI', Tahoma, sans-serif";
      ctx.textAlign = "center";
      ctx.fillText(storeName + " - Al-Rwan Center", canvasSize / 2, 50);

      // Draw Footer Text (Coupon Code & Discount)
      ctx.fillStyle = "#0f172a";
      ctx.font = "bold 36px monospace";
      ctx.fillText(coupon.code, canvasSize / 2, canvasSize + 55);

      ctx.fillStyle = "#16a34a";
      ctx.font = "bold 28px 'Segoe UI', Tahoma, sans-serif";
      ctx.fillText(`${discountText} (${appliesToText})`, canvasSize / 2, canvasSize + 100);

      const a = document.createElement("a");
      a.href = canvas.toDataURL("image/png");
      a.download = `QR-${coupon.code}.png`;
      a.click();
    } catch (err) {
      console.error("Failed to generate QR PNG:", err);
    } finally {
      setIsGeneratingImg(false);
    }
  };

  // Download Luxury Gift Card PNG (1200x675 HD)
  const handleDownloadCardPNG = () => {
    setIsGeneratingImg(true);
    try {
      const width = 1200;
      const height = 675;
      const canvas = document.createElement("canvas");
      canvas.width = width;
      canvas.height = height;
      const ctx = canvas.getContext("2d");
      if (!ctx) return;

      const isDark = cardTheme === "dark";

      // 1. Background Gradient
      const grad = ctx.createLinearGradient(0, 0, width, height);
      if (isDark) {
        grad.addColorStop(0, "#0b0f19");
        grad.addColorStop(0.5, "#111827");
        grad.addColorStop(1, "#030712");
      } else {
        grad.addColorStop(0, "#f8fafc");
        grad.addColorStop(0.5, "#ffffff");
        grad.addColorStop(1, "#f1f5f9");
      }
      ctx.fillStyle = grad;
      ctx.fillRect(0, 0, width, height);

      // 2. Decorative glowing accent borders
      ctx.strokeStyle = isDark ? "#38bdf8" : "#0284c7";
      ctx.lineWidth = 8;
      ctx.strokeRect(16, 16, width - 32, height - 32);

      // Inner thin gold/cyan border
      ctx.strokeStyle = isDark ? "rgba(255,255,255,0.15)" : "rgba(0,0,0,0.08)";
      ctx.lineWidth = 2;
      ctx.strokeRect(28, 28, width - 56, height - 56);

      // 3. Right Section: QR Code Box
      const qrBoxSize = 340;
      const qrX = width - qrBoxSize - 70;
      const qrY = (height - qrBoxSize) / 2 - 10;

      // QR White Container
      ctx.fillStyle = "#ffffff";
      ctx.fillRect(qrX, qrY, qrBoxSize, qrBoxSize);
      ctx.strokeStyle = isDark ? "#38bdf8" : "#cbd5e1";
      ctx.lineWidth = 4;
      ctx.strokeRect(qrX, qrY, qrBoxSize, qrBoxSize);

      // Render QR
      const qr = QRCode.create(promoUrl, { errorCorrectionLevel: "H" });
      const moduleCount = qr.modules.size;
      const qrPad = 24;
      const cellSize = Math.floor((qrBoxSize - qrPad * 2) / moduleCount);
      const gridActual = cellSize * moduleCount;
      const qOffsetX = qrX + (qrBoxSize - gridActual) / 2;
      const qOffsetY = qrY + (qrBoxSize - gridActual) / 2;

      ctx.fillStyle = "#0f172a";
      for (let r = 0; r < moduleCount; r++) {
        for (let c = 0; c < moduleCount; c++) {
          if (qr.modules.get(r, c)) {
            ctx.fillRect(qOffsetX + c * cellSize, qOffsetY + r * cellSize, cellSize, cellSize);
          }
        }
      }

      // Text under QR
      ctx.fillStyle = isDark ? "#94a3b8" : "#64748b";
      ctx.font = "bold 20px 'Segoe UI', Tahoma, sans-serif";
      ctx.textAlign = "center";
      ctx.fillText("امسح الرمز بكاميرا هاتفك للخصم", qrX + qrBoxSize / 2, qrY + qrBoxSize + 35);

      // 4. Left Section: Texts & Brand (RTL-aware positions)
      // Store Branding Header
      ctx.textAlign = "right";
      ctx.fillStyle = isDark ? "#ffffff" : "#0f172a";
      ctx.font = "bold 44px 'Segoe UI', Tahoma, sans-serif";
      ctx.fillText(storeName, qrX - 50, 110);

      ctx.fillStyle = isDark ? "#38bdf8" : "#0284c7";
      ctx.font = "bold 22px monospace";
      ctx.fillText("AL-RWAN CENTER • VIP GIFT CARD", qrX - 50, 145);

      // Giant Discount Highlight Box
      const badgeY = 180;
      ctx.fillStyle = isDark ? "rgba(56, 189, 248, 0.15)" : "#e0f2fe";
      ctx.fillRect(80, badgeY, qrX - 130, 130);
      ctx.strokeStyle = isDark ? "#38bdf8" : "#0284c7";
      ctx.lineWidth = 3;
      ctx.strokeRect(80, badgeY, qrX - 130, 130);

      ctx.fillStyle = isDark ? "#38bdf8" : "#0369a1";
      ctx.font = "900 64px 'Segoe UI', Tahoma, sans-serif";
      ctx.fillText(discountText, qrX - 70, badgeY + 80);

      ctx.fillStyle = isDark ? "#f8fafc" : "#334155";
      ctx.font = "bold 24px 'Segoe UI', Tahoma, sans-serif";
      ctx.fillText(`يطبق على: ${appliesToText}`, qrX - 70, badgeY + 115);

      // Promo Code Box
      const codeY = 340;
      ctx.fillStyle = isDark ? "#1e293b" : "#f1f5f9";
      ctx.fillRect(80, codeY, qrX - 130, 90);
      ctx.strokeStyle = isDark ? "#475569" : "#cbd5e1";
      ctx.lineWidth = 2;
      ctx.strokeRect(80, codeY, qrX - 130, 90);

      ctx.fillStyle = isDark ? "#94a3b8" : "#64748b";
      ctx.font = "bold 20px 'Segoe UI', Tahoma, sans-serif";
      ctx.fillText("رمز الكوبون (Coupon Code):", qrX - 100, codeY + 35);

      ctx.fillStyle = isDark ? "#ffffff" : "#0f172a";
      ctx.font = "900 40px monospace";
      ctx.fillText(coupon.code, qrX - 100, codeY + 75);

      // Footer Notes
      ctx.fillStyle = isDark ? "#64748b" : "#94a3b8";
      ctx.font = "18px 'Segoe UI', Tahoma, sans-serif";
      ctx.fillText(`• ساري عند الشراء أونلاين أو الحجز في المركز | هاتف: ${storePhone}`, qrX - 50, 480);
      ctx.fillText(`• الحملة: ${campaign?.name || "عرض خاص"}`, qrX - 50, 510);

      const a = document.createElement("a");
      a.href = canvas.toDataURL("image/png");
      a.download = `Voucher-${coupon.code}.png`;
      a.click();
    } catch (err) {
      console.error("Failed to generate Card PNG:", err);
    } finally {
      setIsGeneratingImg(false);
    }
  };

  // Direct Print Promo Card using the offline iframe printer
  const handlePrintCard = () => {
    const cardEl = document.getElementById("printable-promo-card");
    if (!cardEl) return;

    const existingIframe = document.getElementById("promo-print-iframe");
    if (existingIframe) existingIframe.remove();

    const iframe = document.createElement("iframe");
    iframe.id = "promo-print-iframe";
    iframe.style.position = "fixed";
    iframe.style.width = "0";
    iframe.style.height = "0";
    iframe.style.border = "0";
    iframe.style.visibility = "hidden";
    document.body.appendChild(iframe);

    const doc = iframe.contentWindow?.document;
    if (!doc) return;

    let stylesHtml = "";
    document.querySelectorAll("style, link[rel='stylesheet']").forEach((node) => {
      stylesHtml += node.outerHTML;
    });

    doc.open();
    doc.write(`
      <!DOCTYPE html>
      <html dir="rtl" lang="ar">
        <head>
          <meta charset="utf-8">
          <title>بطاقة خصم - ${coupon.code}</title>
          ${stylesHtml}
          <style>
            @page {
              size: A6 landscape, A5 landscape;
              margin: 4mm;
            }
            *, *::before, *::after {
              box-sizing: border-box !important;
              -webkit-print-color-adjust: exact !important;
              print-color-adjust: exact !important;
            }
            html, body {
              margin: 0 !important;
              padding: 0 !important;
              background: #ffffff !important;
              color: #000000 !important;
              font-family: system-ui, -apple-system, 'Cairo', Roboto, sans-serif;
              display: flex;
              justify-content: center;
              align-items: center;
              min-height: 100vh;
            }
            .print-card-box {
              width: 100%;
              max-width: 600px;
              border: 2px solid #0f172a;
              border-radius: 16px;
              padding: 20px;
              background: #ffffff !important;
              color: #0f172a !important;
            }
            svg {
              max-width: 100%;
              display: block;
            }
          </style>
        </head>
        <body>
          <div class="print-card-box">
            ${cardEl.innerHTML}
          </div>
        </body>
      </html>
    `);
    doc.close();

    setTimeout(() => {
      try {
        iframe.contentWindow?.focus();
        iframe.contentWindow?.print();
      } catch (e) {
        console.error("Promo print error:", e);
      } finally {
        setTimeout(() => iframe.remove(), 2500);
      }
    }, 250);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 overflow-y-auto" dir="rtl">
      {/* Backdrop */}
      <div className="fixed inset-0 bg-black/60 backdrop-blur-md transition-opacity" onClick={onClose} />

      {/* Modal Shell */}
      <div className="relative z-50 w-full max-w-2xl bg-white rounded-3xl border border-slate-200 shadow-2xl overflow-hidden flex flex-col my-auto animate-in fade-in zoom-in-95 duration-200">
        
        {/* Modal Header */}
        <div className="p-4 sm:p-5 border-b border-slate-100 flex items-center justify-between bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 text-white flex-shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-sky-500/20 border border-sky-400/30 flex items-center justify-center text-sky-400 shadow-inner">
              <QrCode className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-extrabold text-base sm:text-lg text-white">
                  باركود وكوبون الخصم الترويجي
                </h3>
                <span className="bg-sky-500/20 border border-sky-400/30 text-sky-300 font-mono text-[11px] font-bold px-2 py-0.5 rounded-md">
                  {coupon.code}
                </span>
              </div>
              <p className="text-[11px] text-slate-300">
                توليد فوري للباركود وQR الخصم للحملات الإعلانية وطباعة كروت الهدايا
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 text-slate-300 hover:text-white flex items-center justify-center transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Navigation Tabs & Theme Toggle */}
        <div className="p-3 bg-slate-50 border-b border-slate-200 flex flex-wrap items-center justify-between gap-2 text-xs">
          <div className="flex items-center gap-1.5 bg-white p-1 rounded-xl border border-slate-200 shadow-xs">
            <button
              type="button"
              onClick={() => setActiveTab("card")}
              className={`px-3 py-1.5 rounded-lg font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                activeTab === "card"
                  ? "bg-slate-900 text-white shadow-xs"
                  : "text-slate-600 hover:text-slate-900 hover:bg-slate-50"
              }`}
            >
              <Gift className="w-3.5 h-3.5" />
              <span>بطاقة الخصم (VIP Card)</span>
            </button>
            <button
              type="button"
              onClick={() => setActiveTab("qr_only")}
              className={`px-3 py-1.5 rounded-lg font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                activeTab === "qr_only"
                  ? "bg-slate-900 text-white shadow-xs"
                  : "text-slate-600 hover:text-slate-900 hover:bg-slate-50"
              }`}
            >
              <QrCode className="w-3.5 h-3.5" />
              <span>رمز QR فقط</span>
            </button>
            <button
              type="button"
              onClick={() => setActiveTab("barcode_only")}
              className={`px-3 py-1.5 rounded-lg font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                activeTab === "barcode_only"
                  ? "bg-slate-900 text-white shadow-xs"
                  : "text-slate-600 hover:text-slate-900 hover:bg-slate-50"
              }`}
            >
              <Tag className="w-3.5 h-3.5" />
              <span>باركود خطي (Code 128)</span>
            </button>
          </div>

          {activeTab === "card" && (
            <div className="flex items-center gap-1 bg-white p-1 rounded-xl border border-slate-200 text-[11px]">
              <span className="text-slate-400 font-bold px-1.5">الستايل:</span>
              <button
                type="button"
                onClick={() => setCardTheme("dark")}
                className={`px-2 py-1 rounded-md font-bold transition-all cursor-pointer ${
                  cardTheme === "dark" ? "bg-slate-900 text-white" : "text-slate-600 hover:bg-slate-100"
                }`}
              >
                داكن ملكي 🌙
              </button>
              <button
                type="button"
                onClick={() => setCardTheme("white")}
                className={`px-2 py-1 rounded-md font-bold transition-all cursor-pointer ${
                  cardTheme === "white" ? "bg-sky-600 text-white" : "text-slate-600 hover:bg-slate-100"
                }`}
              >
                أبيض طباعة ☀️
              </button>
            </div>
          )}
        </div>

        {/* Modal Body */}
        <div className="p-5 overflow-y-auto max-h-[65vh] space-y-5 bg-slate-100/60">
          
          {/* TAB 1: LUXURY VIP PROMO CARD PREVIEW */}
          {activeTab === "card" && (
            <div className="space-y-3">
              <div
                id="printable-promo-card"
                className={`w-full rounded-2xl p-5 sm:p-6 transition-all shadow-xl relative overflow-hidden border ${
                  cardTheme === "dark"
                    ? "bg-gradient-to-br from-slate-950 via-slate-900 to-indigo-950 text-white border-sky-500/30"
                    : "bg-white text-slate-900 border-slate-300"
                }`}
              >
                {/* Decorative background accents */}
                {cardTheme === "dark" && (
                  <>
                    <div className="absolute -top-24 -right-24 w-60 h-60 bg-sky-500/10 rounded-full blur-3xl pointer-events-none" />
                    <div className="absolute -bottom-24 -left-24 w-60 h-60 bg-purple-500/10 rounded-full blur-3xl pointer-events-none" />
                  </>
                )}

                <div className="relative z-10 grid grid-cols-1 sm:grid-cols-12 gap-5 items-center">
                  
                  {/* Left Column (Details & Code) */}
                  <div className="sm:col-span-7 space-y-3 text-right">
                    
                    {/* Brand */}
                    <div className="flex items-center justify-between border-b pb-2.5 border-current/10">
                      <div>
                        <strong className="block text-sm font-black tracking-tight">{storeName}</strong>
                        <span className="block text-[9.5px] font-mono opacity-70 tracking-wider">AL-RWAN CENTER VIP VOUCHER</span>
                      </div>
                      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 text-[10px] font-black rounded-full bg-sky-500/15 border border-sky-400/30 text-sky-400">
                        <Sparkles className="w-3 h-3" />
                        بطاقة هدية معتمدة
                      </span>
                    </div>

                    {/* Giant Discount Value */}
                    <div className={`p-3 rounded-xl border ${
                      cardTheme === "dark"
                        ? "bg-sky-500/10 border-sky-500/25 text-sky-300"
                        : "bg-sky-50 border-sky-200 text-sky-800"
                    }`}>
                      <div className="text-[10px] font-bold opacity-80">قيمة الخصم الترويجي:</div>
                      <div className="text-2xl sm:text-3xl font-black font-sans leading-tight">
                        {discountText}
                      </div>
                      <div className="text-[10px] font-semibold opacity-90 mt-0.5">
                        يطبق على: {appliesToText}
                      </div>
                    </div>

                    {/* Coupon Code Strip */}
                    <div className={`p-2.5 rounded-xl border flex items-center justify-between ${
                      cardTheme === "dark"
                        ? "bg-slate-900/80 border-slate-800"
                        : "bg-slate-50 border-slate-200"
                    }`}>
                      <div>
                        <span className="text-[9.5px] opacity-60 block font-bold">كود الكوبون:</span>
                        <strong className="font-mono text-base font-black tracking-widest block" dir="ltr">
                          {coupon.code}
                        </strong>
                      </div>
                      <button
                        type="button"
                        onClick={handleCopyCode}
                        className="px-2.5 py-1 rounded-lg bg-sky-600 hover:bg-sky-500 text-white text-[10px] font-bold flex items-center gap-1 transition-all cursor-pointer shadow-xs"
                      >
                        {copiedCode ? <Check className="w-3 h-3 text-emerald-300" /> : <Copy className="w-3 h-3" />}
                        <span>{copiedCode ? "تم النسخ" : "نسخ الكود"}</span>
                      </button>
                    </div>

                    {/* Linear Barcode for Scanners */}
                    <div className="pt-1 flex flex-col items-center sm:items-start">
                      <VectorBarcode value={coupon.code} />
                    </div>

                  </div>

                  {/* Right Column (Live Vector QR Code) */}
                  <div className="sm:col-span-5 flex flex-col items-center justify-center p-3 rounded-2xl bg-white text-slate-900 border border-slate-200 shadow-inner">
                    <VectorQRCode url={promoUrl} size={150} />
                    <div className="text-center mt-2 space-y-0.5">
                      <strong className="block text-[10.5px] font-black text-slate-800">
                        امسح الرمز بكاميرا الهاتف
                      </strong>
                      <p className="text-[9px] text-slate-500 leading-tight">
                        يفتح صفحة الهدية ويطبق الخصم تلقائياً
                      </p>
                    </div>
                  </div>

                </div>

                {/* Footer notes */}
                <div className="mt-4 pt-2 border-t border-current/10 flex flex-wrap justify-between items-center text-[9px] opacity-70">
                  <span>الحملة: {campaign?.name || "عرض خاص"}</span>
                  <span>الاستخدام: {coupon.usedCount || 0} / {coupon.maxUses > 0 ? coupon.maxUses : "∞"} | المسح: {coupon.scanCount || 0}</span>
                  <span>هاتف: {storePhone}</span>
                </div>

              </div>
            </div>
          )}

          {/* TAB 2: STANDALONE QR CODE */}
          {activeTab === "qr_only" && (
            <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-md flex flex-col items-center text-center space-y-4 max-w-sm mx-auto">
              <div className="p-3 bg-slate-50 border-2 border-dashed border-slate-300 rounded-2xl">
                <VectorQRCode url={promoUrl} size={220} />
              </div>
              <div className="space-y-1">
                <div className="font-mono text-lg font-black text-slate-900 tracking-wider" dir="ltr">
                  {coupon.code}
                </div>
                <div className="text-xs font-bold text-sky-700">
                  {discountText} • {appliesToText}
                </div>
                <p className="text-[11px] text-slate-400">
                  كود QR عالي الجودة والدقة جاهز للاستخدام في التصاميم والملصقات ومواقع التواصل
                </p>
              </div>
            </div>
          )}

          {/* TAB 3: STANDALONE BARCODE */}
          {activeTab === "barcode_only" && (
            <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-md flex flex-col items-center text-center space-y-4 max-w-md mx-auto">
              <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl w-full flex justify-center">
                <VectorBarcode value={coupon.code} />
              </div>
              <div className="space-y-1">
                <div className="text-xs font-bold text-slate-700">
                  باركود قياسي (Code 128) متوافق مع قارئات الباركود الليزرية والكاشير
                </div>
                <p className="text-[11px] text-slate-400">
                  يمكن مسحه مباشرة بجهاز قارئ الباركود في المحل للبحث وتطبيق الخصم فوراً
                </p>
              </div>
            </div>
          )}

          {/* Direct Promo Link Bar */}
          <div className="bg-white p-3.5 rounded-2xl border border-slate-200 shadow-xs space-y-1.5 text-xs">
            <div className="flex justify-between items-center text-slate-600 font-bold">
              <span>رابط التفعيل المباشر للعميل (Landing Promo URL):</span>
              <a
                href={promoUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="text-sky-600 hover:underline inline-flex items-center gap-1 text-[11px]"
              >
                <span>معاينة الرابط</span>
                <ExternalLink className="w-3 h-3" />
              </a>
            </div>
            <div className="flex items-center gap-2">
              <input
                type="text"
                readOnly
                value={promoUrl}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-[11px] font-mono text-slate-700 select-all"
                dir="ltr"
              />
              <button
                type="button"
                onClick={handleCopyLink}
                className="px-3.5 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-[11px] flex items-center gap-1.5 flex-shrink-0 transition-all cursor-pointer shadow-xs"
              >
                {copiedLink ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copiedLink ? "تم النسخ" : "نسخ"}</span>
              </button>
            </div>
          </div>

        </div>

        {/* Modal Footer (Action Buttons) */}
        <div className="p-4 bg-white border-t border-slate-100 flex flex-wrap items-center justify-between gap-2.5 flex-shrink-0">
          
          <div className="flex flex-wrap items-center gap-2">
            
            {/* Download High-Res Card Image PNG */}
            <button
              type="button"
              disabled={isGeneratingImg}
              onClick={handleDownloadCardPNG}
              className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-sky-600 to-indigo-600 hover:from-sky-500 hover:to-indigo-500 text-white font-bold text-xs flex items-center gap-2 shadow-md shadow-sky-500/20 transition-all cursor-pointer disabled:opacity-50"
            >
              <Download className="w-4 h-4" />
              <span>تحميل كرت الخصم (صورة HD)</span>
            </button>

            {/* Download Standalone QR Code PNG */}
            <button
              type="button"
              disabled={isGeneratingImg}
              onClick={handleDownloadQRPNG}
              className="px-3.5 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold text-xs flex items-center gap-1.5 transition-all cursor-pointer disabled:opacity-50"
            >
              <FileDown className="w-4 h-4 text-sky-600" />
              <span>تحميل QR كصورة PNG</span>
            </button>

            {/* Direct Print Card Button */}
            <button
              type="button"
              onClick={handlePrintCard}
              className="px-3.5 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold text-xs flex items-center gap-1.5 transition-all cursor-pointer"
            >
              <Printer className="w-4 h-4 text-slate-700" />
              <span>طباعة الكرت فوراً</span>
            </button>

          </div>

          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-600 font-bold text-xs transition-colors cursor-pointer"
          >
            إغلاق
          </button>

        </div>

      </div>
    </div>
  );
}
