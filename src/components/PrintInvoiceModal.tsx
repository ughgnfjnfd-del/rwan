"use client";

import React, { useState, useEffect } from "react";
import {
  Printer,
  X,
  Receipt,
  Truck,
  Sparkles,
  Scissors,
  MapPin,
  Phone,
  ShieldCheck,
  Tag
} from "lucide-react";
import { Order, Appointment, SiteSettings, useApp } from "@/context/AppContext";

export type PrintableDataType =
  | { type: "order"; data: Order }
  | { type: "repair"; data: Appointment }
  | { type: "manual"; data: Order };

interface PrintInvoiceModalProps {
  isOpen: boolean;
  onClose: () => void;
  printableData: PrintableDataType | null;
  siteSettings?: SiteSettings;
}

/**
 * High-precision vector SVG Barcode generator for clean crisp scanning (Code 128 pattern)
 */
function BarcodeSVG({ value }: { value: string }) {
  const hash = value.split("").reduce((acc, char, idx) => acc + char.charCodeAt(0) * (idx + 1) * 7, 19);
  const bars: { width: number; isBlack: boolean }[] = [
    { width: 3, isBlack: true },
    { width: 1, isBlack: false },
    { width: 2, isBlack: true },
    { width: 2, isBlack: false },
  ];

  for (let i = 0; i < value.length; i++) {
    const code = value.charCodeAt(i) + i * 3;
    const w1 = (code % 3) + 1;
    const w2 = ((code >> 1) % 3) + 1;
    const w3 = ((code >> 2) % 2) + 1;
    bars.push({ width: w1, isBlack: true });
    bars.push({ width: w2, isBlack: false });
    bars.push({ width: w3, isBlack: true });
    bars.push({ width: 1, isBlack: false });
  }

  bars.push(
    { width: 2, isBlack: true },
    { width: 1, isBlack: false },
    { width: 3, isBlack: true }
  );

  let currentX = 0;
  const barElements = bars.map((bar, index) => {
    const el = bar.isBlack ? (
      <rect
        key={index}
        x={currentX}
        y="0"
        width={bar.width}
        height="40"
        fill="#000000"
      />
    ) : null;
    currentX += bar.width;
    return el;
  });

  return (
    <div className="flex flex-col items-center">
      <svg
        viewBox={`0 0 ${currentX} 40`}
        className="w-48 h-10 sm:h-11"
        preserveAspectRatio="none"
      >
        {barElements}
      </svg>
      <span className="font-mono text-[10px] font-bold tracking-widest text-slate-800 uppercase mt-0.5" dir="ltr">
        *{value}*
      </span>
    </div>
  );
}

/**
 * High-precision Dynamic QR Code generator for live device tracking
 */
function DynamicQRCode({ url, size = 60 }: { url: string; size?: number }) {
  const qrApiUrl = `https://api.qrserver.com/v1/create-qr-code/?size=${size * 2}x${size * 2}&format=svg&data=${encodeURIComponent(url)}`;
  return (
    <div className="flex flex-col items-center">
      <div className="bg-white p-0.5 border border-slate-900 rounded-xs shadow-2xs flex items-center justify-center">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={qrApiUrl}
          alt="QR Code"
          width={size}
          height={size}
          className="object-contain"
          style={{ width: `${size}px`, height: `${size}px` }}
        />
      </div>
    </div>
  );
}

export default function PrintInvoiceModal({
  isOpen,
  onClose,
  printableData,
  siteSettings: propSiteSettings,
}: PrintInvoiceModalProps) {
  // Always obtain live context settings so any update in admin immediately reflects
  const { siteSettings: contextSiteSettings } = useApp();
  const effectiveSettings = propSiteSettings || contextSiteSettings;

  // Default to A5 shipping label/waybill
  const [printFormat, setPrintFormat] = useState<"a5" | "thermal">("a5");
  const [courierName, setCourierName] = useState("شركة التوصيل السريع");
  const [customNote, setCustomNote] = useState("يرجى فحص الطلب والتأكد منه عند الاستلام بحضور المندوب.");

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

  if (!isOpen || !printableData) return null;

  const handlePrint = () => {
    const printRoot = document.getElementById("printable-invoice-root");
    if (!printRoot) {
      window.print();
      return;
    }

    // Remove any previous print iframe if it exists
    const existingIframe = document.getElementById("invoice-print-iframe");
    if (existingIframe) {
      existingIframe.remove();
    }

    const iframe = document.createElement("iframe");
    iframe.id = "invoice-print-iframe";
    iframe.style.position = "fixed";
    iframe.style.right = "0";
    iframe.style.bottom = "0";
    iframe.style.width = "0";
    iframe.style.height = "0";
    iframe.style.border = "0";
    iframe.style.visibility = "hidden";
    document.body.appendChild(iframe);

    const doc = iframe.contentWindow?.document;
    if (!doc) {
      window.print();
      return;
    }

    // Collect all stylesheets and style tags
    let stylesHtml = "";
    document.querySelectorAll("style, link[rel='stylesheet']").forEach((node) => {
      stylesHtml += node.outerHTML;
    });

    const isThermal = printFormat === "thermal";

    doc.open();
    doc.write(`
      <!DOCTYPE html>
      <html dir="rtl" lang="ar">
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1">
          <title>فاتورة - ${invoiceNumber}</title>
          ${stylesHtml}
          <style>
            @page {
              size: ${isThermal ? "80mm auto" : "A5 portrait, A4 portrait"};
              margin: ${isThermal ? "1mm" : "4mm"};
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
              font-family: system-ui, -apple-system, 'Cairo', 'Segoe UI', Roboto, sans-serif;
              width: 100% !important;
              min-height: 100% !important;
              overflow: visible !important;
            }
            .print-wrapper {
              display: flex;
              justify-content: center;
              align-items: flex-start;
              width: 100%;
              padding: ${isThermal ? "0" : "4px"};
              margin: 0 auto;
            }
          </style>
        </head>
        <body>
          <div class="print-wrapper">
            ${printRoot.innerHTML}
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
        console.error("Print error:", e);
        window.print();
      } finally {
        setTimeout(() => {
          iframe.remove();
        }, 2500);
      }
    }, 300);
  };

  // Real store address and phone from live siteSettings
  const storeAddress = effectiveSettings?.address || "العراق، الناصرية، الصالحية، شارع التقاعد، قرب  التقاعد";
  const storeShortAddress = effectiveSettings?.address || "الناصرية - الصالحية، شارع التقاعد";
  const storePhone = effectiveSettings?.phone || "0771 165 0096";

  // Normalization helper to unify Orders, Repairs, and Manual items
  const isRepair = printableData.type === "repair";
  const repairData = isRepair ? (printableData.data as Appointment) : null;
  const trackingCode = isRepair ? (repairData?.trackingCode || repairData?.id || "RWN-R") : "";

  const invoiceNumber =
    printableData.type === "order"
      ? printableData.data.orderNumber
      : printableData.type === "repair"
      ? trackingCode || printableData.data.id
      : printableData.data.orderNumber;

  const currentDomain = typeof window !== "undefined" ? window.location.origin : "https://alrwan-center.com";
  const trackingUrl = isRepair
    ? `${currentDomain}/track?code=${encodeURIComponent(trackingCode || invoiceNumber)}`
    : `${currentDomain}/track?order=${encodeURIComponent(invoiceNumber)}`;

  const customerName =
    printableData.type === "order"
      ? printableData.data.customerName
      : printableData.type === "repair"
      ? printableData.data.name
      : printableData.data.customerName;

  const customerPhone =
    printableData.type === "order"
      ? printableData.data.customerPhone
      : printableData.type === "repair"
      ? printableData.data.phone
      : printableData.data.customerPhone;

  const customerAddress =
    printableData.type === "order"
      ? printableData.data.customerAddress
      : printableData.type === "repair"
      ? "استلام مباشر من مركز الصيانة"
      : printableData.data.customerAddress;

  const invoiceDate =
    printableData.type === "order"
      ? new Date(printableData.data.createdAt).toLocaleDateString("ar-IQ", {
          year: "numeric",
          month: "2-digit",
          day: "2-digit",
          hour: "2-digit",
          minute: "2-digit",
        })
      : printableData.type === "repair"
      ? `${printableData.data.date} (${printableData.data.timeSlot})`
      : printableData.data.createdAt
      ? new Date(printableData.data.createdAt).toLocaleDateString("ar-IQ", {
          year: "numeric",
          month: "2-digit",
          day: "2-digit",
          hour: "2-digit",
          minute: "2-digit",
        })
      : new Date().toLocaleDateString("ar-IQ");

  const itemsList =
    printableData.type === "order"
      ? printableData.data.items.map((item) => {
          const specs = [
            item.selectedStorage,
            item.selectedColor ? item.selectedColor.name : null,
            item.selectedPort ? `منفذ ${item.selectedPort}` : null,
          ]
            .filter(Boolean)
            .join(" - ");
          return {
            name: item.productName,
            specs,
            qty: item.quantity,
            price: item.price,
            total: item.price * item.quantity,
          };
        })
      : printableData.type === "repair"
      ? [
          {
            name: `صيانة جهاز: ${printableData.data.device}`,
            specs: `العطل: ${printableData.data.issueType}${
              printableData.data.details ? ` (${printableData.data.details})` : ""
            }`,
            qty: 1,
            price: printableData.data.cost || 0,
            total: printableData.data.cost || 0,
          },
        ]
      : printableData.data.items.map((item) => ({
          name: item.productName,
          specs: item.selectedStorage || "",
          qty: item.quantity,
          price: item.price,
          total: item.price * item.quantity,
        }));

  const subtotal =
    printableData.type === "order" || printableData.type === "manual"
      ? printableData.data.subtotal
      : 0;

  const shippingFee =
    printableData.type === "order" || printableData.type === "manual"
      ? printableData.data.shippingFee
      : 0;

  const discountAmount =
    printableData.type === "order" || printableData.type === "manual"
      ? printableData.data.discountAmount
      : 0;

  const grandTotal =
    printableData.type === "order" || printableData.type === "manual"
      ? printableData.data.totalAmount
      : 0;

  return (
    <div className="print-modal-overlay fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 print:p-0">
      
      {/* Dark Overlay (NO-PRINT) */}
      <div
        className="no-print fixed inset-0 bg-black/75 backdrop-blur-xs transition-opacity"
        onClick={onClose}
      />

      {/* Main Modal Shell (NO-PRINT styles around scroll area) */}
      <div className="print-modal-shell relative z-50 w-full max-w-4xl bg-slate-900 rounded-3xl border border-slate-700 shadow-2xl flex flex-col h-[92vh] overflow-hidden text-right print:h-auto print:max-w-none print:w-full print:bg-white print:border-none print:rounded-none print:shadow-none" dir="rtl">
        
        {/* Modal Top Control Bar (NO-PRINT) */}
        <div className="no-print bg-slate-950 px-4 sm:px-6 py-3 border-b border-slate-800 flex flex-wrap items-center justify-between gap-3 flex-shrink-0">
          
          <div className="flex items-center gap-3">
            <div className="p-2 bg-sky-500/10 border border-sky-500/30 rounded-xl text-sky-400">
              <Printer className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-extrabold text-sm sm:text-base text-white">
                {isRepair ? "طباعة إيصال استلام وضمان الصيانة المعتمد" : "طباعة الفواتير وبوالص الشحن الرسمية"}
              </h3>
              <p className="text-[11px] text-slate-400 font-mono">
                كود التتبع: {invoiceNumber}
              </p>
            </div>
          </div>

          {/* Format Selector (A5 Waybill Sticker vs 80mm Thermal) */}
          <div className="flex items-center bg-slate-800 p-1 rounded-xl border border-slate-700">
            <button
              onClick={() => setPrintFormat("a5")}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                printFormat === "a5"
                  ? "bg-sky-500 text-slate-950 shadow-md"
                  : "text-slate-300 hover:text-white"
              }`}
            >
              <Tag className="w-3.5 h-3.5" />
              <span>{isRepair ? "إيصال A5 (شامل QR التتبع)" : "بوليصة وملصق A5"}</span>
            </button>
            <button
              onClick={() => setPrintFormat("thermal")}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                printFormat === "thermal"
                  ? "bg-sky-500 text-slate-950 shadow-md"
                  : "text-slate-300 hover:text-white"
              }`}
            >
              <Receipt className="w-3.5 h-3.5" />
              <span>حراري 80mm</span>
            </button>
          </div>

          {/* Actions */}
          <div className="flex items-center gap-2 mr-auto sm:mr-0">
            <button
              onClick={handlePrint}
              className="bg-emerald-500 hover:bg-emerald-600 text-white font-extrabold text-xs sm:text-sm px-5 py-2.5 rounded-xl shadow-lg shadow-emerald-500/20 flex items-center gap-2 transition-all hover:scale-105 active:scale-95 cursor-pointer"
            >
              <Printer className="w-4 h-4" />
              <span>طباعة الآن (Print)</span>
            </button>
            <button
              onClick={onClose}
              className="p-2 text-slate-400 hover:text-white rounded-xl hover:bg-slate-800 transition-colors cursor-pointer"
              title="إغلاق"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Customization Toolbar (NO-PRINT) */}
        {!isRepair && (
          <div className="no-print bg-slate-50 border-b border-slate-200 px-6 py-2.5 flex flex-wrap items-center gap-4 text-xs text-slate-800">
            <div className="flex items-center gap-2">
              <span className="text-slate-500 font-bold">اسم شركة التوصيل:</span>
              <input
                type="text"
                value={courierName}
                onChange={(e) => setCourierName(e.target.value)}
                className="bg-white border border-slate-300 rounded-lg px-2.5 py-1 text-slate-800 font-semibold focus:outline-none focus:border-sky-500 text-xs w-44"
                placeholder="مثال: شركة التوصيل السريع"
              />
            </div>
            <div className="flex items-center gap-2 flex-1 min-w-[200px]">
              <span className="text-slate-500 font-bold">ملاحظة أسفل الوصل:</span>
              <input
                type="text"
                value={customNote}
                onChange={(e) => setCustomNote(e.target.value)}
                className="bg-white border border-slate-300 rounded-lg px-2.5 py-1 text-slate-800 font-semibold focus:outline-none focus:border-sky-500 text-xs flex-1"
              />
            </div>
          </div>
        )}

        {/* Scrollable Preview Area */}
        <div className="print-modal-scroll flex-1 overflow-y-auto p-3 sm:p-6 bg-slate-200/60 flex justify-center items-start">
          
          {/* PRINTABLE ROOT ELEMENT */}
          <div id="printable-invoice-root" className="w-full flex justify-center">
            
            {/* ======================================================== */}
            {/* 1. A5 SHIPPING WAYBILL & INVOICE LAYOUT (148mm x 210mm)  */}
            {/* ======================================================== */}
            {printFormat === "a5" && (
              <div className="w-[148mm] min-h-0 max-w-full bg-white text-slate-900 p-4 sm:p-5 font-sans shadow-xl print:shadow-none print:p-3 border border-slate-300 print:border-none mx-auto flex flex-col justify-between rounded-lg print:rounded-none">
                
                <div className="space-y-3">
                  
                  {/* Top Corporate Header */}
                  <div className="flex items-start justify-between border-b-2 border-slate-900 pb-3 gap-2">
                    
                    {/* Brand Info */}
                    <div className="space-y-1 max-w-[62%]">
                      <div className="flex items-center gap-2">
                        <span className="text-xl font-black text-slate-950 tracking-tight whitespace-nowrap">مركز الروان</span>
                        <span className="text-[10px] bg-slate-900 text-white font-bold px-2 py-0.5 rounded-full whitespace-nowrap">
                          Al-Rwan Center
                        </span>
                      </div>
                      <p className="text-[10px] text-slate-500 font-bold">
                        المركز المعتمد للأجهزة الذكية والإكسسوارات والصيانة
                      </p>
                      <div className="flex flex-wrap items-center gap-x-2.5 gap-y-1 text-[10px] text-slate-700 pt-0.5">
                        <span className="inline-flex items-center gap-1 font-bold whitespace-nowrap bg-slate-100 px-1.5 py-0.5 rounded border border-slate-200">
                          <Phone className="w-3 h-3 text-sky-600 flex-shrink-0" />
                          <strong dir="ltr" className="font-mono whitespace-nowrap text-[10px] tracking-wide">{storePhone}</strong>
                        </span>
                        <span className="inline-flex items-center gap-1 font-sans text-slate-600 text-[9.5px]">
                          <MapPin className="w-3 h-3 text-rose-500 flex-shrink-0" />
                          <span className="leading-tight">{storeShortAddress}</span>
                        </span>
                      </div>
                    </div>

                    {/* Invoice Badge & Barcode */}
                    <div className="text-left space-y-1 flex flex-col items-end flex-shrink-0">
                      <div className="inline-flex items-center gap-1 px-2.5 py-0.5 bg-slate-100 border border-slate-300 rounded text-[10px] font-black text-slate-800 whitespace-nowrap">
                        <ShieldCheck className="w-3 h-3 text-emerald-600" />
                        <span>{isRepair ? "إيصال وضمان صيانة معتمد" : "بوليصة شحن معتمدة"}</span>
                      </div>
                      <BarcodeSVG value={invoiceNumber} />
                    </div>

                  </div>

                  {/* Metadata Bar (Compact 4-col) */}
                  <div className="grid grid-cols-4 gap-2 bg-slate-50 border border-slate-200 rounded-lg p-2 text-[10px]">
                    <div>
                      <span className="text-[9px] text-slate-400 font-bold block">
                        {isRepair ? "كود التتبع / الإيصال:" : "رقم البوليصة:"}
                      </span>
                      <strong className="font-mono text-slate-900 font-bold text-[10px]">{invoiceNumber}</strong>
                    </div>
                    <div>
                      <span className="text-[9px] text-slate-400 font-bold block">
                        {isRepair ? "تاريخ الاستلام:" : "التاريخ:"}
                      </span>
                      <span className="font-bold text-slate-800 text-[10px]">{invoiceDate}</span>
                    </div>
                    <div>
                      <span className="text-[9px] text-slate-400 font-bold block">
                        {isRepair ? "حالة الفحص:" : "طريقة الدفع:"}
                      </span>
                      <span className="font-bold text-slate-800 text-[10px]">
                        {isRepair
                          ? repairData?.status === "ready"
                            ? "جاهز للاستلام "
                            : repairData?.status === "in-progress"
                            ? "قيد الصيانة "
                            : repairData?.status === "diagnosing"
                            ? "قيد الفحص "
                            : "مسجل بالمركز "
                          : "الدفع عند الاستلام (COD)"}
                      </span>
                    </div>
                    <div>
                      <span className="text-[9px] text-slate-400 font-bold block">
                        {isRepair ? "نوع الخدمة:" : "شركة التوصيل:"}
                      </span>
                      <span className="font-bold text-sky-700 text-[10px] truncate block">
                        {isRepair ? "صيانة أجهزة معتمدة" : courierName}
                      </span>
                    </div>
                  </div>

                  {/* 2-Column Sender & Receiver Cards */}
                  <div className="grid grid-cols-2 gap-2.5">
                    
                    {/* Consignee / Receiver Card */}
                    <div className="border-2 border-slate-900 bg-slate-50/90 p-2.5 rounded-lg space-y-1.5">
                      <div className="flex items-center justify-between border-b border-slate-200 pb-1">
                        <span className="text-[11px] font-black text-slate-900 flex items-center gap-1">
                          <Truck className="w-3.5 h-3.5 text-sky-600" />
                          {isRepair ? "بيانات صاحب الجهاز (العميل)" : "بيانات الزبون (المستلم)"}
                        </span>
                        <span className="text-[9px] bg-slate-900 text-white font-bold px-1.5 py-0.2 rounded">
                          {isRepair ? "العميل" : "المستلم"}
                        </span>
                      </div>
                      <div className="space-y-0.5 text-[10px]">
                        <div className="flex justify-between items-center">
                          <span className="text-slate-500 font-bold whitespace-nowrap">الاسم:</span>
                          <strong className="text-slate-900 text-[11px] truncate max-w-[135px]">{customerName}</strong>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-slate-500 font-bold whitespace-nowrap">الهاتف:</span>
                          <strong className="font-mono text-slate-950 font-bold text-xs whitespace-nowrap" dir="ltr">{customerPhone}</strong>
                        </div>
                        <div className="flex justify-between items-start">
                          <span className="text-slate-500 font-bold flex-shrink-0 whitespace-nowrap">
                            {isRepair ? "نوع الاستلام:" : "العنوان:"}
                          </span>
                          <strong className="text-slate-900 text-right leading-tight max-w-[130px] font-sans">{customerAddress}</strong>
                        </div>
                      </div>
                    </div>

                    {/* Sender Info Card */}
                    <div className="border border-slate-200 bg-white p-2.5 rounded-lg space-y-1.5">
                      <div className="flex items-center justify-between border-b border-slate-200 pb-1">
                        <span className="text-[11px] font-black text-slate-800 flex items-center gap-1">
                          <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                          المرسل (المركز)
                        </span>
                        <span className="text-[9px] bg-slate-100 text-slate-700 font-bold px-1.5 py-0.2 rounded border border-slate-200">
                          المركز
                        </span>
                      </div>
                      <div className="space-y-0.5 text-[10px] text-slate-600">
                        <div className="flex justify-between items-center">
                          <span className="text-slate-400 font-bold whitespace-nowrap">الجهة:</span>
                          <strong className="text-slate-800 text-[10px]">مركز الروان للصيانة</strong>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-slate-400 font-bold whitespace-nowrap">خدمة العملاء:</span>
                          <strong className="font-mono text-slate-800 text-[10px] whitespace-nowrap" dir="ltr">{storePhone}</strong>
                        </div>
                        <div className="flex justify-between items-start">
                          <span className="text-slate-400 font-bold flex-shrink-0 whitespace-nowrap">الفرع:</span>
                          <span className="text-slate-800 text-right leading-tight max-w-[125px] font-medium">{storeShortAddress}</span>
                        </div>
                      </div>
                    </div>

                  </div>

                  {/* Items / Repair Table */}
                  <div className="border border-slate-200 rounded-lg overflow-hidden">
                    <table className="w-full text-[10px] text-right">
                      <thead className="bg-slate-900 text-white font-bold">
                        <tr>
                          <th className="p-1.5 w-6 text-center">#</th>
                          <th className="p-1.5">
                            {isRepair ? "الجهاز وتوصيف العطل" : "اسم المادة / المنتج والمواصفات"}
                          </th>
                          <th className="p-1.5 w-12 text-center">الكمية</th>
                          <th className="p-1.5 w-20 text-left">
                            {isRepair ? "التكلفة" : "السعر"}
                          </th>
                          <th className="p-1.5 w-24 text-left">المجموع</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-200">
                        {itemsList.map((item, idx) => (
                          <tr key={idx} className={idx % 2 === 0 ? "bg-white" : "bg-slate-50/50"}>
                            <td className="p-1.5 text-center font-bold text-slate-400">{idx + 1}</td>
                            <td className="p-1.5">
                              <strong className="text-slate-900 block text-[10px]">{item.name}</strong>
                              {item.specs && (
                                <span className="text-[9px] text-slate-500 block">{item.specs}</span>
                              )}
                            </td>
                            <td className="p-1.5 text-center font-bold font-mono text-slate-800">
                              {item.qty}
                            </td>
                            <td className="p-1.5 text-left font-mono text-slate-700" dir="ltr">
                              {item.price > 0 ? `${item.price.toLocaleString()} د.ع` : "تحدد بعد الفحص"}
                            </td>
                            <td className="p-1.5 text-left font-mono font-bold text-slate-900" dir="ltr">
                              {item.total > 0 ? `${item.total.toLocaleString()} د.ع` : "---"}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>

                  {/* Financial Breakdown / Live Repair QR Tracking Box */}
                  {isRepair ? (
                    <div className="grid grid-cols-2 gap-3 items-center pt-1">
                      
                      {/* Left: Real Dynamic QR Code Tracking Box */}
                      <div className="bg-sky-50/80 border border-sky-200 rounded-lg p-2.5 flex items-center gap-3 text-right">
                        <DynamicQRCode url={trackingUrl} size={54} />
                        <div className="space-y-0.5">
                          <strong className="text-slate-900 text-[10px] block font-black">
                            تتبع مراحل صيانة جهازك مباشرة 
                          </strong>
                          <p className="text-[8.5px] text-slate-600 leading-tight">
                            امسح الرمز بكاميرا الهاتف أو ادخل كود التتبع:
                          </p>
                          <div className="font-mono text-[10px] font-black text-sky-700" dir="ltr">
                            {trackingCode}
                          </div>
                        </div>
                      </div>

                      {/* Right: Repair Terms & Guarantee */}
                      <div className="bg-slate-50 border border-slate-200 rounded-lg p-2.5 space-y-1 text-[9px] text-slate-600">
                        <strong className="text-slate-900 block text-[10px]">شروط وضمان الاستلام:</strong>
                        <p className="leading-tight">• يرجى إبراز هذا الوصل عند استلام الجهاز من المركز.</p>
                        <p className="leading-tight">• يلتزم المركز بتوفير قطع أصلية مع فحص شامل وضمان معتمد.</p>
                        {repairData?.estimatedReady && (
                          <p className="text-sky-700 font-bold">• الموعد المتوقع: {repairData.estimatedReady}</p>
                        )}
                      </div>

                    </div>
                  ) : (
                    <div className="grid grid-cols-2 gap-3 items-start pt-1">
                      
                      {/* Left: Notes & Conditions */}
                      <div className="text-[9px] text-slate-500 space-y-1 bg-slate-50 p-2.5 rounded-lg border border-slate-200">
                        <strong className="text-slate-800 block text-[10px]">ملاحظات وضمان التوصيل:</strong>
                        <p className="leading-tight text-slate-700 font-bold">{customNote}</p>
                        <p className="leading-tight text-[8.5px] text-slate-400">
                          • يرجى فحص الطلب والتأكد من سلامة المغلف والمواصفات عند الاستلام من المندوب.
                        </p>
                      </div>

                      {/* Right: Totals Box */}
                      <div className="bg-white border-2 border-slate-900 rounded-lg p-2.5 space-y-1.5 shadow-2xs">
                        <div className="flex justify-between text-[10px] text-slate-600">
                          <span>المجموع الفرعي:</span>
                          <span className="font-mono font-bold" dir="ltr">{subtotal.toLocaleString()} د.ع</span>
                        </div>
                        {discountAmount > 0 && (
                          <div className="flex justify-between text-[10px] text-emerald-600 font-bold">
                            <span>الخصم:</span>
                            <span className="font-mono" dir="ltr">-{discountAmount.toLocaleString()} د.ع</span>
                          </div>
                        )}
                        <div className="flex justify-between text-[10px] text-slate-600">
                          <span>أجور التوصيل:</span>
                          <span className="font-mono font-bold" dir="ltr">
                            {shippingFee > 0 ? `${shippingFee.toLocaleString()} د.ع` : "مجاني"}
                          </span>
                        </div>
                        <div className="border-t-2 border-slate-900 pt-1.5 flex justify-between items-center bg-slate-950 text-white p-2 rounded">
                          <span className="text-[10px] font-black text-slate-200">المطلوب تحصيله (COD):</span>
                          <strong className="text-sm font-black text-white font-mono" dir="ltr">
                            {grandTotal.toLocaleString()} د.ع
                          </strong>
                        </div>
                      </div>

                    </div>
                  )}

                </div>

                {/* Bottom Cut-Out Courier Delivery Stub / Receipt Stub */}
                <div className="mt-3 pt-2.5 border-t-2 border-dashed border-slate-400 relative">
                  
                  {/* Scissors cut indicator */}
                  <div className="absolute -top-2.5 left-1/2 -translate-x-1/2 bg-white px-2 flex items-center gap-1 text-[9px] font-bold text-slate-500">
                    <Scissors className="w-3 h-3 text-slate-400" />
                    <span>{isRepair ? "قسيمة استلام وتسليم الصيانة" : "قسيمة تسليم المندوب (يُقص ويسلم للسائق)"}</span>
                  </div>

                  <div className="grid grid-cols-4 gap-2 items-center bg-slate-50 p-2 rounded-lg border border-slate-200 text-[10px]">
                    <div>
                      <span className="text-[9px] text-slate-400 block font-bold">
                        {isRepair ? "العميل:" : "المستلم:"}
                      </span>
                      <strong className="text-slate-900 block truncate">{customerName}</strong>
                      <div className="font-mono text-[9px] text-slate-600 whitespace-nowrap" dir="ltr">{customerPhone}</div>
                    </div>
                    <div>
                      <span className="text-[9px] text-slate-400 block font-bold">
                        {isRepair ? "كود التتبع:" : "المبلغ للتحصيل:"}
                      </span>
                      <strong className="text-xs font-black text-slate-950 font-mono" dir="ltr">
                        {isRepair ? trackingCode : `${grandTotal.toLocaleString()} د.ع`}
                      </strong>
                    </div>
                    <div>
                      <span className="text-[9px] text-slate-400 block font-bold">
                        {isRepair ? "توقيع العميل:" : "توقيع المستلم:"}
                      </span>
                      <div className="h-5 border-b border-slate-300 mt-0.5"></div>
                    </div>
                    <div>
                      <span className="text-[9px] text-slate-400 block font-bold">
                        {isRepair ? "توقيع المهندس:" : "توقيع المندوب:"}
                      </span>
                      <div className="h-5 border-b border-slate-300 mt-0.5"></div>
                    </div>
                  </div>

                  <div className="flex justify-between items-center text-[8.5px] text-slate-400 pt-1 font-medium">
                    <span>مركز الروان للهواتف الذكية والصيانة • {storeShortAddress}</span>
                    <span className="font-mono">Ref: {invoiceNumber}</span>
                  </div>

                </div>

              </div>
            )}

            {/* ======================================================== */}
            {/* 2. THERMAL 80MM RECEIPT LAYOUT                           */}
            {/* ======================================================== */}
            {printFormat === "thermal" && (
              <div className="w-[80mm] max-w-full bg-white text-black p-4 font-mono text-[11px] leading-snug shadow-xl print:shadow-none print:p-2 border border-slate-300 print:border-none mx-auto">
                
                {/* Store Header */}
                <div className="text-center space-y-1 pb-3 border-b-2 border-dashed border-black">
                  <div className="font-black text-base tracking-wide font-sans">مركز الروان</div>
                  <div className="text-[10px] font-sans font-bold text-slate-600">Al-Rwan Mobile & Repair</div>
                  <div className="text-[10px] flex items-center justify-center gap-1 font-sans">
                    <span>هاتف:</span>
                    <span dir="ltr" className="font-mono font-bold whitespace-nowrap">{storePhone}</span>
                  </div>
                  <div className="text-[9px] text-slate-700 font-sans font-medium">{storeShortAddress}</div>
                </div>

                {/* Document Type & Barcode */}
                <div className="py-2.5 text-center space-y-1.5 border-b border-dashed border-black">
                  <div className="inline-block bg-black text-white px-2.5 py-0.5 text-[10px] font-bold rounded-sm font-sans">
                    {isRepair ? "إيصال استلام وحجز صيانة" : "فاتورة بيع وبوليصة شحن"}
                  </div>
                  <BarcodeSVG value={invoiceNumber} />
                  <div className="text-[9px] text-slate-600 pt-0.5 font-sans">التاريخ: {invoiceDate}</div>
                  {isRepair && (
                    <div className="text-[10px] font-bold text-slate-900 pt-0.5">
                      كود التتبع: <strong className="font-mono">{trackingCode}</strong>
                    </div>
                  )}
                </div>

                {/* Customer Details Box */}
                <div className="py-2.5 border-b border-dashed border-black space-y-1 text-right font-sans">
                  <div className="flex justify-between items-center">
                    <span className="font-bold whitespace-nowrap">العميل:</span>
                    <span className="font-bold">{customerName}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="font-bold whitespace-nowrap">الهاتف:</span>
                    <span dir="ltr" className="font-mono font-bold whitespace-nowrap">{customerPhone}</span>
                  </div>
                  <div className="flex justify-between items-start">
                    <span className="font-bold whitespace-nowrap">العنوان:</span>
                    <span className="max-w-[140px] truncate text-left">{customerAddress}</span>
                  </div>
                  {!isRepair && courierName && (
                    <div className="flex justify-between text-[10px] text-slate-700">
                      <span>التوصيل عبر:</span>
                      <span className="font-bold">{courierName}</span>
                    </div>
                  )}
                </div>

                {/* Items List */}
                <div className="py-2.5 border-b-2 border-dashed border-black">
                  <table className="w-full text-right font-sans">
                    <thead>
                      <tr className="border-b border-black text-[10px] font-black">
                        <th className="pb-1">{isRepair ? "الجهاز / العطل" : "المنتج / الوصف"}</th>
                        <th className="pb-1 text-center">الكمية</th>
                        <th className="pb-1 text-left">{isRepair ? "الكلفة" : "السعر"}</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-dashed divide-slate-300">
                      {itemsList.map((item, idx) => (
                        <tr key={idx} className="align-top">
                          <td className="py-1 pr-0.5">
                            <div className="font-bold text-[10px]">{item.name}</div>
                            {item.specs && <div className="text-[9px] text-slate-600">{item.specs}</div>}
                          </td>
                          <td className="py-1 text-center font-bold font-mono">x{item.qty}</td>
                          <td className="py-1 text-left font-bold font-mono" dir="ltr">
                            {item.total > 0 ? `${item.total.toLocaleString()}` : "---"}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {/* Totals Summary */}
                {!isRepair && (
                  <div className="py-2.5 border-b-2 border-dashed border-black space-y-1 font-sans">
                    <div className="flex justify-between text-[10px]">
                      <span>المجموع الفرعي:</span>
                      <span dir="ltr" className="font-mono">{subtotal.toLocaleString()} د.ع</span>
                    </div>
                    {discountAmount > 0 && (
                      <div className="flex justify-between text-[10px] text-emerald-700 font-bold">
                        <span>الخصم:</span>
                        <span dir="ltr" className="font-mono">-{discountAmount.toLocaleString()} د.ع</span>
                      </div>
                    )}
                    <div className="flex justify-between text-[10px]">
                      <span>أجور التوصيل:</span>
                      <span dir="ltr" className="font-mono">{shippingFee > 0 ? `${shippingFee.toLocaleString()} د.ع` : "مجاني"}</span>
                    </div>
                    
                    {/* Big Highlighted Box for COD Amount */}
                    <div className="mt-2 bg-black text-white p-2 text-center rounded">
                      <div className="text-[9px] uppercase tracking-wider font-bold text-slate-300">المبلغ المطلوب تحصيله (COD)</div>
                      <div className="text-base font-black tracking-wider font-mono" dir="ltr">
                        {grandTotal.toLocaleString()} د.ع
                      </div>
                    </div>
                  </div>
                )}

                {/* Footer Notes & Dynamic QR Code */}
                <div className="pt-3 text-center space-y-2 font-sans">
                  <div className="flex justify-center">
                    <DynamicQRCode url={trackingUrl} size={64} />
                  </div>
                  <p className="text-[9px] text-slate-800 leading-tight font-bold">
                    {isRepair
                      ? `امسح الكود لمتابعة حالة الجهاز • كود: ${trackingCode}`
                      : customNote}
                  </p>
                  <p className="text-[8px] text-slate-500">
                    شكراً لتعاملكم مع مركز الروان • {storeShortAddress}
                  </p>
                  <div className="text-[8px] text-slate-400 font-mono tracking-widest pt-1">
                    ================================
                  </div>
                </div>

              </div>
            )}

          </div>

        </div>

      </div>

    </div>
  );
}
