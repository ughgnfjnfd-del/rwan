"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useApp, Product, Appointment, Order, OrderStatus, RepairStatus, SlideItem, MarqueeSettings, FlashSale, PromoPopUp, ProductBundle, PremiumShowcase, DEFAULT_PREMIUM_SHOWCASE, GalleryShowcase, DEFAULT_GALLERY_SHOWCASE, isMobileProduct } from "@/context/AppContext";
import { supabase, deleteImageFromSupabase } from "@/lib/supabase";
import ProductMockup from "@/components/ProductMockup";
import PrintInvoiceModal, { PrintableDataType } from "@/components/PrintInvoiceModal";
import { matchProduct } from "@/lib/search";
import {
  Lock,
  User,
  ShoppingBag,
  Wrench,
  TrendingUp,
  Plus,
  Trash2,
  Edit2,
  CheckCircle,
  CheckCircle2,
  Clock,
  Play,
  XCircle,
  ArrowRight,
  LogOut,
  Search,
  FileText,
  AlertCircle,
  Flame,
  Star,
  Mail,
  Phone,
  Globe,
  PlusCircle,
  Upload,
  ArrowUp,
  ArrowDown,
  Sparkles,
  TicketPercent,
  Gift,
  BarChart2,
  Copy,
  Monitor,
  Smartphone,
  Percent,
  Calculator,
  Printer,
  Truck,
  Package,
  PackageCheck,
  Receipt,
  MessageCircle,
  ExternalLink,
  QrCode,
  Share2
} from "lucide-react";

// Preset storage capacities for mobile phones
const PRESET_STORAGES = ["128GB", "256GB", "512GB", "1TB"];

// Preset phone colors for 1-click addition
const PRESET_PHONE_COLORS = [
  { name: "أسود تيتانيوم", hex: "#1f2022" },
  { name: "أبيض ناصع", hex: "#f5f5f7" },
  { name: "تيتانيوم طبيعي", hex: "#9a958e" },
  { name: "أزرق ليلي", hex: "#2d3b4e" },
  { name: "ذهبي صحراوي", hex: "#d4af37" },
  { name: "بنفسجي داكن", hex: "#483c46" },
  { name: "أخضر زيتي", hex: "#4e5851" },
  { name: "وردي ناعم", hex: "#f9d8d6" },
  { name: "فضي كلاسيكي", hex: "#e2e4e6" },
];

// Helper function to compress and resize images on client side
const compressAndResizeImage = (file: File, maxWidth = 800, maxHeight = 800, quality = 0.8): Promise<Blob> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = (event) => {
      const img = new Image();
      img.src = event.target?.result as string;
      img.onload = () => {
        const canvas = document.createElement("canvas");
        let width = img.width;
        let height = img.height;

        // Resize calculation
        if (width > height) {
          if (width > maxWidth) {
            height = Math.round((height * maxWidth) / width);
            width = maxWidth;
          }
        } else {
          if (height > maxHeight) {
            width = Math.round((width * maxHeight) / height);
            height = maxHeight;
          }
        }

        canvas.width = width;
        canvas.height = height;

        const ctx = canvas.getContext("2d");
        if (!ctx) {
          reject(new Error("Failed to get 2D canvas context"));
          return;
        }

        ctx.drawImage(img, 0, 0, width, height);
        canvas.toBlob(
          (blob) => {
            if (blob) {
              resolve(blob);
            } else {
              reject(new Error("Canvas compression returned null blob"));
            }
          },
          file.type === "image/png" ? "image/png" : "image/webp",
          quality
        );
      };
      img.onerror = (err) => reject(err);
    };
    reader.onerror = (err) => reject(err);
  });
};

export default function AdminPage() {
  const {
    products,
    appointments,
    orders,
    addProduct,
    updateProduct,
    deleteProduct,
    updateAppointmentStatus,
    updateAppointmentDetails,
    deleteAppointment,
    addAppointment,
    addOrder,
    updateOrderStatus,
    deleteOrder,
    siteSettings,
    updateSiteSettings,
    heroSlides,
    updateHeroSlides,
    marqueeSettings,
    updateMarqueeSettings,
    flashSale,
    updateFlashSale,
    productBundles,
    updateProductBundles,
    promoPopUp,
    updatePromoPopUp,
    premiumShowcase,
    updatePremiumShowcase,
    couponCampaigns,
    couponCodes,
    updateCoupons,
    galleryShowcase,
    updateGalleryShowcase,
  } = useApp();

  // Authentication States
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loginError, setLoginError] = useState("");
  const [isLoadingAuth, setIsLoadingAuth] = useState(true);
  const [isAdminVerified, setIsAdminVerified] = useState(false);
  const [isVerifyingAdmin, setIsVerifyingAdmin] = useState(false);

  // Slides States
  const [isSlideModalOpen, setIsSlideModalOpen] = useState(false);
  const [editingSlideId, setEditingSlideId] = useState<string | null>(null);
  const [selectedSlideFile, setSelectedSlideFile] = useState<File | null>(null);
  const [slideImagePreview, setSlideImagePreview] = useState<string | null>(null);
  const [isUploadingSlide, setIsUploadingSlide] = useState(false);

  const [slideForm, setSlideForm] = useState<Omit<SlideItem, "id">>({
    tabLabel: "",
    badge: "",
    title: "",
    titleAccent: "",
    description: "",
    btnText: "",
    btnLink: "",
    actionType: "link",
    bgStyle: "from-[#F3F4F6] via-[#E5E7EB] to-[#DBEAFE] text-slate-900",
    theme: "light",
    graphicType: "macbook",
    customImageUrl: "",
    productId: ""
  });

  const handleOpenAddSlide = () => {
    setEditingSlideId(null);
    setSelectedSlideFile(null);
    setSlideImagePreview(null);
    setSlideForm({
      tabLabel: "",
      badge: "",
      title: "",
      titleAccent: "",
      description: "",
      btnText: "",
      btnLink: "",
      actionType: "link",
      bgStyle: "from-[#F3F4F6] via-[#E5E7EB] to-[#DBEAFE] text-slate-900",
      theme: "light",
      graphicType: "macbook",
      customImageUrl: "",
      productId: ""
    });
    setIsSlideModalOpen(true);
  };

  const handleOpenEditSlide = (slide: SlideItem) => {
    setEditingSlideId(slide.id);
    setSelectedSlideFile(null);
    setSlideImagePreview(slide.customImageUrl || null);
    setSlideForm({
      tabLabel: slide.tabLabel,
      badge: slide.badge,
      title: slide.title,
      titleAccent: slide.titleAccent,
      description: slide.description,
      btnText: slide.btnText,
      btnLink: slide.btnLink || "",
      actionType: slide.actionType,
      bgStyle: slide.bgStyle,
      theme: slide.theme,
      graphicType: slide.graphicType,
      customImageUrl: slide.customImageUrl || "",
      productId: slide.productId || ""
    });
    setIsSlideModalOpen(true);
  };

  const handleSaveSlide = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!slideForm.tabLabel || !slideForm.title || !slideForm.btnText) {
      alert("يرجى ملء جميع الحقول المطلوبة");
      return;
    }

    const oldSlide = heroSlides.find((s) => s.id === editingSlideId);
    const oldImageUrl = oldSlide?.customImageUrl;
    let customImageValue = slideForm.graphicType === "custom" ? (slideForm.customImageUrl || "") : "";
    let newlyUploadedSlideImageUrl = "";

    if (slideForm.graphicType === "custom" && selectedSlideFile) {
      setIsUploadingSlide(true);
      try {
        const compressedBlob = await compressAndResizeImage(selectedSlideFile, 1600, 1600, 0.95);
        const fileExtension = selectedSlideFile.name.split('.').pop() || 'jpg';
        const cleanName = selectedSlideFile.name.replace(/[^a-zA-Z0-9]/g, '_').substring(0, 20);
        const filePath = `slides/${Date.now()}-${cleanName}.${fileExtension}`;

        const { data, error: uploadError } = await supabase.storage
          .from("products")
          .upload(filePath, compressedBlob, {
            contentType: `image/${fileExtension === 'png' ? 'png' : 'jpeg'}`,
            cacheControl: "3600",
            upsert: false
          });

        if (uploadError) throw uploadError;

        const { data: { publicUrl } } = supabase.storage
          .from("products")
          .getPublicUrl(filePath);

        customImageValue = publicUrl;
        newlyUploadedSlideImageUrl = publicUrl;
      } catch (error: any) {
        console.error("Error uploading slide image:", error);
        alert(`حدث خطأ أثناء رفع الصورة: ${error.message || error}`);
        setIsUploadingSlide(false);
        return;
      } finally {
        setIsUploadingSlide(false);
      }
    }

    const slideData: SlideItem = {
      id: editingSlideId || `slide-${Date.now()}`,
      tabLabel: slideForm.tabLabel,
      badge: slideForm.badge,
      title: slideForm.title,
      titleAccent: slideForm.titleAccent,
      description: slideForm.description,
      btnText: slideForm.btnText,
      btnLink: slideForm.btnLink,
      actionType: slideForm.actionType,
      bgStyle: slideForm.bgStyle,
      theme: slideForm.theme,
      graphicType: slideForm.graphicType,
      customImageUrl: customImageValue,
      productId: slideForm.productId
    };

    let updatedSlides: SlideItem[];
    if (editingSlideId) {
      updatedSlides = heroSlides.map((s) => (s.id === editingSlideId ? slideData : s));
    } else {
      updatedSlides = [...heroSlides, slideData];
    }

    try {
      await updateHeroSlides(updatedSlides);
      setIsSlideModalOpen(false);

      // Clean up the previous uploaded slide image when it is replaced, removed, or no longer used.
      if (oldImageUrl && oldImageUrl !== customImageValue) {
        await deleteImageFromSupabase(oldImageUrl);
      }
    } catch (err: any) {
      if (newlyUploadedSlideImageUrl) {
        await deleteImageFromSupabase(newlyUploadedSlideImageUrl);
      }
      alert(`حدث خطأ أثناء حفظ الشريحة: ${err.message || err}`);
    }
  };

  const handleDeleteSlide = async (id: string) => {
    if (confirm("هل أنت متأكد من حذف هذه الشريحة الإعلانية؟")) {
      const slideToDelete = heroSlides.find((s) => s.id === id);
      const oldImageUrl = slideToDelete?.customImageUrl;

      const updatedSlides = heroSlides.filter((s) => s.id !== id);
      try {
        await updateHeroSlides(updatedSlides);
        if (oldImageUrl) {
          await deleteImageFromSupabase(oldImageUrl);
        }
      } catch (err: any) {
        alert(`حدث خطأ أثناء حذف الشريحة: ${err.message || err}`);
      }
    }
  };

  const handleMoveSlide = async (index: number, direction: "up" | "down") => {
    const targetIndex = direction === "up" ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= heroSlides.length) return;

    const updated = [...heroSlides];
    const temp = updated[index];
    updated[index] = updated[targetIndex];
    updated[targetIndex] = temp;

    try {
      await updateHeroSlides(updated);
    } catch (err: any) {
      alert(`حدث خطأ أثناء تغيير ترتيب الشرائح: ${err.message || err}`);
    }
  };

  const verifyAdminLive = async (token: string) => {
    setIsVerifyingAdmin(true);
    try {
      const res = await fetch("/api/admin/verify", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ token }),
      });
      const data = await res.json();
      if (data.isAdmin) {
        setIsAdminVerified(true);
      } else {
        setIsAdminVerified(false);
        setLoginError("حسابك غير مصرح له بالدخول كمسؤول!");
        await supabase.auth.signOut();
      }
    } catch (e) {
      console.error("Error verifying admin status:", e);
      setIsAdminVerified(false);
    } finally {
      setIsVerifyingAdmin(false);
    }
  };

  useEffect(() => {
    // Check active sessions and sets the user
    const checkSession = async () => {
      try {
        const { data: { session }, error } = await supabase.auth.getSession();
        if (error || !session) {
          if (error?.message?.includes("Refresh Token")) {
            await supabase.auth.signOut().catch(() => { });
          }
          setIsLoggedIn(false);
          setIsAdminVerified(false);
        } else {
          setIsLoggedIn(true);
          await verifyAdminLive(session.access_token);
        }
      } catch (err) {
        setIsLoggedIn(false);
        setIsAdminVerified(false);
      } finally {
        setIsLoadingAuth(false);
      }
    };
    checkSession();

    // Listen for changes on auth state (logged in, signed out, etc.)
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setIsLoggedIn(!!session);
      if (!session) {
        setIsAdminVerified(false);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  // Tab State: "overview", "products", "devices", "orders", "repairs", "settings", "flash", "slides", "premium", "bundles", "coupons" | "gallery"
  const [activeTab, setActiveTab] = useState<"overview" | "products" | "devices" | "orders" | "repairs" | "settings" | "flash" | "slides" | "premium" | "bundles" | "coupons" | "gallery">("overview");

  // Orders & Invoice Printing States
  const [orderFilter, setOrderFilter] = useState<"all" | OrderStatus>("all");
  const [orderSearch, setOrderSearch] = useState("");
  const [isPrintModalOpen, setIsPrintModalOpen] = useState(false);
  const [printableData, setPrintableData] = useState<PrintableDataType | null>(null);

  // Quick Manual Invoice States
  const [isManualInvoiceModalOpen, setIsManualInvoiceModalOpen] = useState(false);
  const [manualInvoiceForm, setManualInvoiceForm] = useState({
    customerName: "",
    customerPhone: "",
    customerAddress: "",
    shippingFee: 0,
    discountAmount: 0,
    notes: "يرجى فحص الطلب والتأكد منه عند الاستلام بحضور المندوب.",
    items: [{ name: "", quantity: 1, price: 0, details: "" }],
  });

  const handlePrintOrder = (order: Order) => {
    setPrintableData({ type: "order", data: order });
    setIsPrintModalOpen(true);
  };

  const handlePrintRepair = (appt: Appointment) => {
    setPrintableData({ type: "repair", data: appt });
    setIsPrintModalOpen(true);
  };

  // Repair Tracking & Diagnostics Modal State
  const [editingRepairAppt, setEditingRepairAppt] = useState<Appointment | null>(null);
  const [isRepairDetailModalOpen, setIsRepairDetailModalOpen] = useState(false);

  const handleOpenRepairModal = (appt: Appointment) => {
    setEditingRepairAppt({ ...appt });
    setIsRepairDetailModalOpen(true);
  };

  const handleSaveRepairDetails = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingRepairAppt) return;
    await updateAppointmentDetails(editingRepairAppt.id, editingRepairAppt);
    setIsRepairDetailModalOpen(false);
    alert("تم تحديث بيانات وبطاقة التتبع الفني بنجاح.");
  };

  const handleSendRepairWhatsApp = (appt: Appointment) => {
    const currentOrigin = typeof window !== "undefined" ? window.location.origin : "https://alrwan-center.com";
    const trackCode = appt.trackingCode || appt.id;
    const trackUrl = `${currentOrigin}/track?code=${encodeURIComponent(trackCode)}`;

    const statusLabels: Record<string, string> = {
      pending: "تم استلام الجهاز وبانتظار الفحص",
      diagnosing: "قيد التشخيص والفحص الفني المجهري",
      "in-progress": "قيد الصيانة واستبدال القطع",
      testing: "قيد الفحص النهائي واختبار الجودة",
      ready: "جهازكم جاهز للاستلام الآن في المركز",
      completed: "تم التسليم بنجاح وتفعيل الضمان",
      cancelled: "تم إلغاء طلب الصيانة",
    };

    const statusText = statusLabels[appt.status] || appt.status;
    const costText = appt.cost && appt.cost > 0 ? `\nالتكلفة المعتمدة: ${appt.cost.toLocaleString()} د.ع` : "";
    const notesText = appt.techNotes ? `\nتقرير الفني: ${appt.techNotes}` : "";
    const readyText = appt.estimatedReady ? `\nموعد الاستلام المتوقع: ${appt.estimatedReady}` : "";

    const message = `مرحباً ${appt.name}\nنحيطكم علماً بتحديث حالة صيانة جهازكم (${appt.device}) لدى مركز الروان للصيانة:\n\nالمرحلة الحالية: *${statusText}*${costText}${notesText}${readyText}\n\nلمتابعة مراحل الصيانة مباشرة عبر موقعنا:\n${trackUrl}\n\nشكراً لتعاملكم مع مركز الروان.`;

    const cleanPhone = appt.phone.replace(/[^0-9+]/g, "").replace(/^0/, "964");
    window.open(`https://wa.me/${cleanPhone}?text=${encodeURIComponent(message)}`, "_blank");
  };

  const handleCopyTrackLink = (appt: Appointment) => {
    const currentOrigin = typeof window !== "undefined" ? window.location.origin : "https://alrwan-center.com";
    const trackCode = appt.trackingCode || appt.id;
    const trackUrl = `${currentOrigin}/track?code=${encodeURIComponent(trackCode)}`;
    navigator.clipboard.writeText(trackUrl);
    alert(`تم نسخ رابط التتبع بنجاح:\n${trackUrl}`);
  };

  // In-Store POS & Manual Invoice State
  const [productSearchQuery, setProductSearchQuery] = useState("");
  const [showProductPicker, setShowProductPicker] = useState(false);

  const handleOpenManualInvoice = () => {
    setManualInvoiceForm({
      customerName: "",
      customerPhone: "",
      customerAddress: "استلام مباشر من المحل",
      shippingFee: 0,
      discountAmount: 0,
      notes: "شكراً لتعاملكم مع مركز الروان - ضمان وفحص معتمد.",
      items: [{ name: "", quantity: 1, price: 0, details: "" }],
    });
    setProductSearchQuery("");
    setShowProductPicker(false);
    setIsManualInvoiceModalOpen(true);
  };

  const handleQuickFillWalkinCustomer = () => {
    setManualInvoiceForm((prev) => ({
      ...prev,
      customerName: "زبون مباشر",
      customerPhone: "07700000000",
      customerAddress: "شراء مباشر من المركز",
    }));
  };

  const handleSelectProductForManualInvoice = (prod: Product) => {
    const defaultPrice = (prod.discountPrice && prod.discountPrice > 0) ? prod.discountPrice : prod.price;
    const defaultDetails = prod.category === "موبايلات" ? "أصلي مع الضمان" : (prod.category || "");
    
    setManualInvoiceForm((prev) => {
      const existingItems = prev.items.filter((it) => it.name.trim() !== "");
      return {
        ...prev,
        items: [
          ...existingItems,
          {
            name: prod.name,
            quantity: 1,
            price: defaultPrice,
            details: defaultDetails,
          },
        ],
      };
    });
    setShowProductPicker(false);
    setProductSearchQuery("");
  };

  const handleAddManualItem = () => {
    setManualInvoiceForm((prev) => ({
      ...prev,
      items: [...prev.items, { name: "", quantity: 1, price: 0, details: "" }],
    }));
  };

  const handleRemoveManualItem = (idx: number) => {
    if (manualInvoiceForm.items.length <= 1) return;
    setManualInvoiceForm((prev) => ({
      ...prev,
      items: prev.items.filter((_, i) => i !== idx),
    }));
  };

  const handleManualItemChange = (idx: number, field: string, value: any) => {
    const updatedItems = [...manualInvoiceForm.items];
    updatedItems[idx] = { ...updatedItems[idx], [field]: value };
    setManualInvoiceForm((prev) => ({ ...prev, items: updatedItems }));
  };

  const handleSaveManualInvoice = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!manualInvoiceForm.customerName.trim() || !manualInvoiceForm.customerPhone.trim()) {
      alert("يرجى إدخال اسم العميل ورقم الهاتف على الأقل.");
      return;
    }

    const validItems = manualInvoiceForm.items.filter(i => i.name.trim());
    if (validItems.length === 0) {
      alert("يرجى إضافة مادة أو منتج واحد على الأقل في الفاتورة وتحديد السعر.");
      return;
    }

    const subtotal = validItems.reduce((s, i) => s + (Number(i.price) || 0) * (Number(i.quantity) || 1), 0);
    const totalAmount = Math.max(0, subtotal - (Number(manualInvoiceForm.discountAmount) || 0)) + (Number(manualInvoiceForm.shippingFee) || 0);

    const created = await addOrder({
      customerName: manualInvoiceForm.customerName.trim(),
      customerPhone: manualInvoiceForm.customerPhone.trim(),
      customerAddress: manualInvoiceForm.customerAddress.trim() || "استلام مباشر من المحل",
      items: validItems.map((i) => ({
        productId: `pos-${Date.now()}-${Math.random().toString(36).slice(2, 5)}`,
        productName: i.name.trim(),
        price: Number(i.price) || 0,
        quantity: Number(i.quantity) || 1,
        selectedStorage: i.details || null,
      })),
      subtotal,
      shippingFee: Number(manualInvoiceForm.shippingFee) || 0,
      discountAmount: Number(manualInvoiceForm.discountAmount) || 0,
      totalAmount,
      status: "delivered",
      notes: manualInvoiceForm.notes,
    });

    setIsManualInvoiceModalOpen(false);
    setPrintableData({ type: "order", data: created });
    setIsPrintModalOpen(true);
  };

  // In-Store Repair Intake & Invoice Modal State
  const [isManualRepairModalOpen, setIsManualRepairModalOpen] = useState(false);
  const [manualRepairForm, setManualRepairForm] = useState({
    name: "",
    phone: "",
    device: "",
    issueType: "صيانة عامة وفحص",
    details: "تم استلام الجهاز بحالة طبيعية بدون ملحقات.",
    techNotes: "بانتظار الفحص والتشخيص الفني في المركز.",
    cost: 0,
    estimatedReady: "اليوم خلال ساعتين",
    status: "pending" as Appointment["status"],
  });

  const handleOpenManualRepair = () => {
    setManualRepairForm({
      name: "",
      phone: "",
      device: "",
      issueType: "صيانة عامة وفحص",
      details: "تم استلام الجهاز بحالة طبيعية بدون ملحقات.",
      techNotes: "بانتظار الفحص والتشخيص الفني في المركز.",
      cost: 0,
      estimatedReady: "اليوم خلال ساعتين",
      status: "pending",
    });
    setIsManualRepairModalOpen(true);
  };

  const handleQuickFillRepairCustomer = () => {
    setManualRepairForm((prev) => ({
      ...prev,
      name: "زبون صيانة مباشر",
      phone: "07700000000",
    }));
  };

  const handleSaveManualRepair = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!manualRepairForm.name.trim() || !manualRepairForm.phone.trim()) {
      alert("يرجى إدخال اسم الزبون ورقم الهاتف.");
      return;
    }
    if (!manualRepairForm.device.trim()) {
      alert("يرجى إدخال نوع وموديل الجهاز المراد صيانته.");
      return;
    }

    const todayStr = new Date().toISOString().split("T")[0];
    const createdAppt = await addAppointment({
      name: manualRepairForm.name.trim(),
      phone: manualRepairForm.phone.trim(),
      device: manualRepairForm.device.trim(),
      issueType: manualRepairForm.issueType || "صيانة عامة وفحص",
      details: manualRepairForm.details.trim(),
      techNotes: manualRepairForm.techNotes.trim(),
      cost: Number(manualRepairForm.cost) || 0,
      estimatedReady: manualRepairForm.estimatedReady.trim(),
      status: manualRepairForm.status,
      date: todayStr,
      timeSlot: "استلام مباشر من المركز",
    });

    setIsManualRepairModalOpen(false);
    setPrintableData({ type: "repair", data: createdAppt });
    setIsPrintModalOpen(true);
  };

  // Coupon/Campaign Management States
  const [selectedCampaignId, setSelectedCampaignId] = useState<string | null>(null);
  const [isCampaignModalOpen, setIsCampaignModalOpen] = useState(false);
  const [editingCampaignId, setEditingCampaignId] = useState<string | null>(null);
  const [campaignForm, setCampaignForm] = useState({
    name: "",
    description: "",
    source: "qr",
    medium: "print",
    campaign: "promo_2026",
    isActive: true,
    startsAt: "",
    endsAt: "",
    landingTitle: "مبروك! حصلت على هدية خاصة",
    landingSubtitle: "عرض خاص وموثق لزبائن مركز الروان المميزين.",
    qrNote: "امسح الرمز للحصول على العرض الفوري",
  });

  const [isCodeModalOpen, setIsCodeModalOpen] = useState(false);
  const [codeForm, setCodeForm] = useState({
    code: "",
    discountType: "fixed" as "fixed" | "percent",
    discountValue: 0,
    appliesTo: "both" as "store" | "repair" | "both",
    minOrderAmount: 0,
    maxUses: 1,
    isActive: true,
    expiresAt: "",
  });

  const generateRandomCode = (prefix = "RWAN") => {
    const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
    let code = "";
    for (let i = 0; i < 4; i++) {
      code += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return `${prefix}-${code}`;
  };

  const handleSaveCampaign = (e: React.FormEvent) => {
    e.preventDefault();
    if (!campaignForm.name) {
      alert("يرجى كتابة اسم الحملة");
      return;
    }

    const campaignId = editingCampaignId || `camp-${Date.now()}`;
    const newCampaignData = {
      id: campaignId,
      name: campaignForm.name,
      description: campaignForm.description,
      source: campaignForm.source,
      medium: campaignForm.medium,
      campaign: campaignForm.campaign,
      isActive: campaignForm.isActive,
      startsAt: campaignForm.startsAt ? new Date(campaignForm.startsAt).toISOString() : "",
      endsAt: campaignForm.endsAt ? new Date(campaignForm.endsAt).toISOString() : "",
      landingTitle: campaignForm.landingTitle,
      landingSubtitle: campaignForm.landingSubtitle,
      qrNote: campaignForm.qrNote,
      createdAt: editingCampaignId
        ? (couponCampaigns.find(c => c.id === editingCampaignId)?.createdAt || new Date().toISOString())
        : new Date().toISOString(),
    };

    let nextCampaigns;
    if (editingCampaignId) {
      nextCampaigns = couponCampaigns.map(c => c.id === editingCampaignId ? newCampaignData : c);
    } else {
      nextCampaigns = [...couponCampaigns, newCampaignData];
    }

    updateCoupons(nextCampaigns, couponCodes);
    setIsCampaignModalOpen(false);
    setSelectedCampaignId(campaignId);
  };

  const handleSaveCode = (e: React.FormEvent) => {
    e.preventDefault();
    if (!codeForm.code || codeForm.discountValue <= 0) {
      alert("يرجى كتابة الكود وقيمة الخصم بشكل صحيح");
      return;
    }

    if (codeForm.discountType === "percent" && (codeForm.discountValue <= 0 || codeForm.discountValue > 100)) {
      alert("يرجى إدخال نسبة مئوية صحيحة بين 1% و 100%");
      return;
    }

    const cleanCode = codeForm.code.trim().toUpperCase();
    const isDuplicate = couponCodes.some(c => c.code.toUpperCase() === cleanCode);
    if (isDuplicate) {
      alert(`الرمز "${cleanCode}" موجود بالفعل. يرجى اختيار رمز فريد.`);
      return;
    }

    const newCodeData = {
      id: `code-${Date.now()}`,
      campaignId: selectedCampaignId!,
      code: cleanCode,
      discountType: codeForm.discountType,
      discountValue: codeForm.discountValue,
      appliesTo: codeForm.appliesTo,
      minOrderAmount: codeForm.minOrderAmount,
      maxUses: codeForm.maxUses,
      usedCount: 0,
      scanCount: 0,
      isActive: codeForm.isActive,
      expiresAt: codeForm.expiresAt ? new Date(codeForm.expiresAt).toISOString() : "",
      createdAt: new Date().toISOString(),
    };

    const nextCodes = [...couponCodes, newCodeData];
    updateCoupons(couponCampaigns, nextCodes);
    setIsCodeModalOpen(false);
  };

  // Product CRUD States
  const [isProductModalOpen, setIsProductModalOpen] = useState(false);
  const [editingProductId, setEditingProductId] = useState<string | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);

  const [productForm, setProductForm] = useState({
    name: "",
    nameEn: "",
    price: 0,
    discountPrice: 0,
    category: "موبايلات",
    imageType: "preset" as "preset" | "url" | "upload",
    imagePreset: "iphone",
    imageUrl: "",
    description: "",
    specs: "",
    isPopular: false,
    isOutOfStock: false,
    rating: 5,
    reviewsCount: 24,
    ports: [] as string[],
    storages: [] as string[],
  });

  const [productColors, setProductColors] = useState<Array<{ name: string; hex: string; image?: string | null; file?: File | null }>>([]);

  // Site Settings States
  const [settingsForm, setSettingsForm] = useState({
    email: "",
    phone: "",
    address: "العراق، الناصرية، الصالحية، شارع التقاعد، قرب دائرة التقاعد",
    socials: [] as Array<{ platform: string; url: string; name: string }>,
    shippingFee: "",
    promoBanner: {
      isEnabled: false,
      badge: "خصم 50%",
      title: "عرض خاص ومحدود",
      description: "احصل على أفضل خصم أو صيانة لهاتفك الآن!",
      buttonText: "احجز الآن",
      buttonLink: "#repair",
      bgStyle: "glass-rose"
    },
    partnerSite: {
      name: "",
      url: ""
    },
    logo: { url: "" }
  });

  const [logoFile, setLogoFile] = useState<File | null>(null);
  const [logoPreview, setLogoPreview] = useState<string | null>(null);
  const [isUploadingLogo, setIsUploadingLogo] = useState(false);

  useEffect(() => {
    if (siteSettings) {
      setSettingsForm(prev => ({
        ...prev,
        ...siteSettings,
        logo: siteSettings.logo || { url: "" }
      }));
      setLogoPreview(siteSettings.logo?.url || null);
    }
  }, [siteSettings]);

  const [newSocial, setNewSocial] = useState({
    platform: "facebook",
    url: "",
    name: "فيسبوك",
  });

  // Infinite Marquee States
  const [marqueeForm, setMarqueeForm] = useState<MarqueeSettings>({
    isEnabled: false,
    items: []
  });
  const [newMarqueeItem, setNewMarqueeItem] = useState("");
  const [isSavingAllSettings, setIsSavingAllSettings] = useState(false);

  useEffect(() => {
    if (marqueeSettings) {
      setMarqueeForm(marqueeSettings);
    }
  }, [marqueeSettings]);

  const handleAddMarqueeItem = () => {
    if (!newMarqueeItem.trim()) return;
    setMarqueeForm({
      ...marqueeForm,
      items: [...marqueeForm.items, newMarqueeItem.trim()]
    });
    setNewMarqueeItem("");
  };

  const handleRemoveMarqueeItem = (idx: number) => {
    setMarqueeForm({
      ...marqueeForm,
      items: marqueeForm.items.filter((_, i) => i !== idx)
    });
  };

  const handleSaveAllSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!settingsForm.email || !settingsForm.phone) {
      alert("يرجى ملء البريد الإلكتروني ورقم الهاتف");
      return;
    }

    setIsSavingAllSettings(true);
    let finalLogoUrl = settingsForm.logo?.url || "";

    if (logoFile) {
      setIsUploadingLogo(true);
      try {
        const compressedBlob = await compressAndResizeImage(logoFile, 800, 800, 0.95);
        const fileExtension = logoFile.name.split('.').pop() || 'png';
        const cleanName = logoFile.name.replace(/[^a-zA-Z0-9]/g, '_').substring(0, 20);
        const filePath = `logo/${Date.now()}-${cleanName}.${fileExtension}`;

        const { error: uploadError } = await supabase.storage
          .from("products")
          .upload(filePath, compressedBlob, {
            contentType: `image/${fileExtension === 'png' ? 'png' : 'jpeg'}`,
            cacheControl: "3600",
            upsert: false
          });

        if (uploadError) throw uploadError;

        const { data: { publicUrl } } = supabase.storage
          .from("products")
          .getPublicUrl(filePath);

        finalLogoUrl = publicUrl;

        // Delete old logo if it exists
        if (settingsForm.logo?.url && settingsForm.logo.url !== finalLogoUrl) {
          await deleteImageFromSupabase(settingsForm.logo.url).catch(console.error);
        }
      } catch (error: any) {
        console.error("Error uploading logo:", error);
        alert(`حدث خطأ أثناء رفع الشعار: ${error.message || error}`);
        setIsSavingAllSettings(false);
        setIsUploadingLogo(false);
        return;
      }
    }

    try {
      const finalSettings = { ...settingsForm, logo: { url: finalLogoUrl } };
      await updateSiteSettings(finalSettings);
      await updateMarqueeSettings(marqueeForm);
      await updatePromoPopUp(promoPopUpForm);
      alert("تم حفظ كافة إعدادات الموقع بنجاح! 💾✨");
    } catch (err: any) {
      console.error(err);
      alert(`حدث خطأ أثناء حفظ الإعدادات: ${err.message || err}`);
    } finally {
      setIsSavingAllSettings(false);
      setIsUploadingLogo(false);
      setLogoFile(null);
    }
  };

  // Promo Pop-Up States
  const [promoPopUpForm, setPromoPopUpForm] = useState<PromoPopUp>({
    isEnabled: false,
    title: "",
    description: "",
    imageUrl: "",
    btnText: "",
    btnLink: ""
  });

  useEffect(() => {
    if (promoPopUp) {
      setPromoPopUpForm(promoPopUp);
    }
  }, [promoPopUp]);



  // Premium Showcase States
  const [premiumShowcaseForm, setPremiumShowcaseForm] = useState<PremiumShowcase>(DEFAULT_PREMIUM_SHOWCASE);

  const openPremiumShowcaseTab = () => {
    setPremiumShowcaseForm({
      ...DEFAULT_PREMIUM_SHOWCASE,
      ...premiumShowcase,
      productIds: Array.isArray(premiumShowcase.productIds) ? premiumShowcase.productIds : [],
    });
    setActiveTab("premium");
  };

  const handleTogglePremiumProduct = (productId: string) => {
    setPremiumShowcaseForm((prev) => {
      const isSelected = prev.productIds.includes(productId);
      const productIds = isSelected
        ? prev.productIds.filter((id) => id !== productId)
        : [...prev.productIds, productId];

      return {
        ...prev,
        heroProductId: isSelected && prev.heroProductId === productId ? "" : prev.heroProductId,
        productIds,
      };
    });
  };

  const handleSavePremiumShowcase = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const selectedIds = premiumShowcaseForm.heroProductId
        ? [premiumShowcaseForm.heroProductId, ...premiumShowcaseForm.productIds]
        : premiumShowcaseForm.productIds;

      await updatePremiumShowcase({
        ...premiumShowcaseForm,
        productIds: Array.from(new Set(selectedIds)),
      });
      alert("تم حفظ إعدادات العروض المميزة بنجاح!");
    } catch (err) {
      alert(`حدث خطأ أثناء حفظ العروض المميزة: ${err instanceof Error ? err.message : String(err)}`);
    }
  };

  // Gallery Showcase States
  const [galleryShowcaseForm, setGalleryShowcaseForm] = useState<GalleryShowcase>(DEFAULT_GALLERY_SHOWCASE);
  const [newGalleryProductId, setNewGalleryProductId] = useState("");
  const [newGalleryImageFile, setNewGalleryImageFile] = useState<File | null>(null);
  const [newGalleryImagePreview, setNewGalleryImagePreview] = useState<string | null>(null);
  const [isUploadingGalleryImage, setIsUploadingGalleryImage] = useState(false);

  const handleAddGalleryItem = async () => {
    if (!newGalleryProductId) {
      alert("يرجى اختيار المنتج المرتبط بالكارت أولاً.");
      return;
    }
    if (!newGalleryImageFile) {
      alert("يرجى اختيار ملف الصورة لرفعها.");
      return;
    }

    setIsUploadingGalleryImage(true);
    try {
      // Compress and resize image to 1200x1500 for optimal marquee performance
      const compressedBlob = await compressAndResizeImage(newGalleryImageFile, 1200, 1500, 0.95);
      const fileExtension = newGalleryImageFile.name.split('.').pop() || 'jpg';
      const cleanName = newGalleryImageFile.name.replace(/[^a-zA-Z0-9]/g, '_').substring(0, 20);
      const filePath = `gallery/${Date.now()}-${cleanName}.${fileExtension}`;

      // Upload to Supabase Storage products bucket
      const { data, error: uploadError } = await supabase.storage
        .from("products")
        .upload(filePath, compressedBlob, {
          contentType: `image/${fileExtension === 'png' ? 'png' : 'jpeg'}`,
          cacheControl: "3600",
          upsert: false
        });

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from("products")
        .getPublicUrl(filePath);

      const newItem = {
        id: `gallery-item-${Date.now()}`,
        productId: newGalleryProductId,
        imageUrl: publicUrl,
      };

      setGalleryShowcaseForm((prev) => ({
        ...prev,
        items: [...(prev.items || []), newItem],
      }));

      // Reset item inputs
      setNewGalleryProductId("");
      setNewGalleryImageFile(null);
      setNewGalleryImagePreview(null);
    } catch (err: any) {
      console.error("Error uploading gallery image:", err);
      alert(`حدث خطأ أثناء رفع الصورة: ${err.message || err}`);
    } finally {
      setIsUploadingGalleryImage(false);
    }
  };

  const handleDeleteGalleryItem = async (itemId: string, imageUrl: string) => {
    if (confirm("هل أنت متأكد من حذف هذا الكارت من المعرض؟")) {
      setGalleryShowcaseForm((prev) => ({
        ...prev,
        items: (prev.items || []).filter((item) => item.id !== itemId),
      }));

      // Delete from storage
      try {
        await deleteImageFromSupabase(imageUrl);
      } catch (err) {
        console.error("Failed to remove image from Supabase:", err);
      }
    }
  };

  const handleSaveGalleryShowcase = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await updateGalleryShowcase(galleryShowcaseForm);
      alert("تم حفظ إعدادات معرض الصور الأحدث بنجاح! 🖼️✨");
    } catch (err) {
      alert(`حدث خطأ أثناء حفظ إعدادات معرض الصور: ${err instanceof Error ? err.message : String(err)}`);
    }
  };

  useEffect(() => {
    if (galleryShowcase) {
      setGalleryShowcaseForm({
        isEnabled: galleryShowcase.isEnabled ?? true,
        title: galleryShowcase.title || "",
        subtitle: galleryShowcase.subtitle || "",
        items: Array.isArray(galleryShowcase.items) ? galleryShowcase.items : [],
      });
    }
  }, [galleryShowcase]);

  // Flash Sale States
  const [flashSaleForm, setFlashSaleForm] = useState<FlashSale>({
    isEnabled: false,
    productId: "",
    discountPrice: 0,
    endTime: "",
    stockLimit: 0,
    initialStock: 0
  });

  useEffect(() => {
    if (flashSale) {
      const localEndTime = flashSale.endTime ? new Date(flashSale.endTime).toISOString().slice(0, 16) : "";
      setFlashSaleForm({
        ...flashSale,
        endTime: localEndTime,
        productId: flashSale.productId || "",
        discountPrice: flashSale.discountPrice || 0,
        stockLimit: flashSale.stockLimit || 0,
        initialStock: flashSale.initialStock || 0,
        isEnabled: flashSale.isEnabled || false
      });
    }
  }, [flashSale]);

  const handleSaveFlashSale = async (e: React.FormEvent) => {
    e.preventDefault();

    if (flashSaleForm.isEnabled) {
      if (!flashSaleForm.productId) {
        alert("يرجى اختيار المنتج أولاً");
        return;
      }
      if (!flashSaleForm.endTime || flashSaleForm.discountPrice <= 0 || flashSaleForm.initialStock <= 0) {
        alert("يرجى إدخال سعر الصفقة، وقت الانتهاء، وكمية العرض بشكل صحيح");
        return;
      }
    }

    try {
      const isoEndTime = flashSaleForm.endTime ? new Date(flashSaleForm.endTime).toISOString() : "";
      await updateFlashSale({
        ...flashSaleForm,
        endTime: isoEndTime,
        stockLimit: Math.min(Math.max(flashSaleForm.stockLimit || 0, 0), Math.max(flashSaleForm.initialStock || 0, 0)),
      });
      alert("تم حفظ إعدادات العرض الخاطف بنجاح! 🔥");
    } catch (err: any) {
      alert(`حدث خطأ أثناء الحفظ: ${err.message || err}`);
    }
  };

  // Bundles CRUD States
  const [isBundleModalOpen, setIsBundleModalOpen] = useState(false);
  const [editingBundleId, setEditingBundleId] = useState<string | null>(null);
  const [bundleForm, setBundleForm] = useState<Omit<ProductBundle, "id">>({
    title: "",
    description: "",
    productIds: [],
    price: 0,
    bgStyle: "from-[#312E81] via-[#1E1B4B] to-[#090533]"
  });

  const handleOpenAddBundle = () => {
    setEditingBundleId(null);
    setBundleForm({
      title: "",
      description: "",
      productIds: [],
      price: 0,
      bgStyle: "from-[#312E81] via-[#1E1B4B] to-[#090533]"
    });
    setIsBundleModalOpen(true);
  };

  const handleOpenEditBundle = (bundle: ProductBundle) => {
    setEditingBundleId(bundle.id);
    setBundleForm({
      title: bundle.title,
      description: bundle.description,
      productIds: bundle.productIds || [],
      price: bundle.price || 0,
      bgStyle: bundle.bgStyle || "from-[#312E81] via-[#1E1B4B] to-[#090533]"
    });
    setIsBundleModalOpen(true);
  };

  const handleSaveBundle = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!bundleForm.title || bundleForm.productIds.length < 2 || bundleForm.price <= 0) {
      alert("يرجى إدخال اسم الحزمة، واختيار منتجين على الأقل، وتحديد السعر");
      return;
    }

    const bundleData: ProductBundle = {
      id: editingBundleId || `bundle-${Date.now()}`,
      title: bundleForm.title,
      description: bundleForm.description,
      productIds: bundleForm.productIds,
      price: bundleForm.price,
      bgStyle: bundleForm.bgStyle
    };

    let updatedBundles: ProductBundle[];
    if (editingBundleId) {
      updatedBundles = productBundles.map((b) => (b.id === editingBundleId ? bundleData : b));
    } else {
      updatedBundles = [...productBundles, bundleData];
    }

    try {
      await updateProductBundles(updatedBundles);
      setIsBundleModalOpen(false);
    } catch (err: any) {
      alert(`حدث خطأ أثناء حفظ الحزمة: ${err.message || err}`);
    }
  };

  const handleDeleteBundle = async (id: string) => {
    if (confirm("هل أنت متأكد من حذف هذه الحزمة الترويجية؟")) {
      const updated = productBundles.filter((b) => b.id !== id);
      try {
        await updateProductBundles(updated);
      } catch (err: any) {
        alert(`حدث خطأ أثناء حذف الحزمة: ${err.message || err}`);
      }
    }
  };


  // Sync settingsForm state when siteSettings loads
  useEffect(() => {
    if (siteSettings) {
      setSettingsForm({
        email: siteSettings.email || "",
        phone: siteSettings.phone || "",
        address: siteSettings.address || "العراق، الناصرية، الصالحية، شارع التقاعد، قرب دائرة التقاعد",
        socials: siteSettings.socials || [],
        shippingFee: siteSettings.shippingFee || "مجاني",
        promoBanner: siteSettings.promoBanner || {
          isEnabled: false,
          badge: "خصم 50%",
          title: "عرض خاص ومحدود",
          description: "احصل على أفضل خصم أو صيانة لهاتفك الآن!",
          buttonText: "احجز الآن",
          buttonLink: "#repair",
          bgStyle: "glass-rose"
        },
        partnerSite: siteSettings.partnerSite || {
          name: "",
          url: ""
        },
        logo: siteSettings.logo || { url: "", file: null }
      });
    }
  }, [siteSettings]);

  const handlePlatformChange = (platform: string) => {
    let name = "فيسبوك";
    if (platform === "instagram") name = "إنستغرام";
    else if (platform === "twitter") name = "تويتر";
    else if (platform === "whatsapp") name = "واتساب";
    else if (platform === "tiktok") name = "تيك توك";
    else if (platform === "telegram") name = "تيليجرام";
    else if (platform === "youtube") name = "يوتيوب";
    else if (platform === "custom") name = "موقع مخصص";

    setNewSocial({ platform, url: "", name });
  };

  const handleAddSocial = () => {
    if (!newSocial.url.trim()) {
      alert("يرجى إدخال رابط الحساب");
      return;
    }
    setSettingsForm((prev) => ({
      ...prev,
      socials: [...prev.socials, newSocial],
    }));
    setNewSocial((prev) => ({ ...prev, url: "" }));
  };

  const handleRemoveSocial = (index: number) => {
    setSettingsForm((prev) => ({
      ...prev,
      socials: prev.socials.filter((_, i) => i !== index),
    }));
  };


  const [productSearch, setProductSearch] = useState("");

  // Repair Filter State
  const [repairFilter, setRepairFilter] = useState<"all" | Appointment["status"]>("all");

  // Handle Login Submission
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError("");

    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      setLoginError("البريد الإلكتروني أو كلمة المرور غير صحيحة!");
    } else if (data.session) {
      await verifyAdminLive(data.session.access_token);
    }
  };

  // Handle Logout
  const handleLogout = async () => {
    await supabase.auth.signOut();
  };

  // Open Add Product Form (General)
  const handleOpenAdd = () => {
    setEditingProductId(null);
    setSelectedFile(null);
    setImagePreview(null);
    setProductForm({
      name: "",
      nameEn: "",
      price: 0,
      discountPrice: 0,
      category: "ملحقات",
      imageType: "preset",
      imagePreset: "headphones",
      imageUrl: "",
      description: "",
      specs: "",
      isPopular: false,
      isOutOfStock: false,
      rating: 5,
      reviewsCount: 24,
      ports: [],
      storages: [],
    });
    setProductColors([]);
    setIsProductModalOpen(true);
  };

  // Open Add Mobile Device Form (Dedicated for Smart Devices)
  const handleOpenAddDevice = () => {
    setEditingProductId(null);
    setSelectedFile(null);
    setImagePreview(null);
    setProductForm({
      name: "",
      nameEn: "",
      price: 0,
      discountPrice: 0,
      category: "موبايلات",
      imageType: "preset",
      imagePreset: "iphone",
      imageUrl: "",
      description: "هاتف ذكي أصلي بأعلى مواصفات وأداء فائق مع ضمان مركز الروان المعتمد.",
      specs: "شاشة Super Retina OLED عالية الدقة\nمعالج فائق السرعة والكفاءة\nنظام كاميرات احترافي متطور\nبطارية تدوم طوال اليوم\nشحن سريع وضمان استبدال معتمد",
      isPopular: true,
      isOutOfStock: false,
      rating: 5,
      reviewsCount: 36,
      ports: [],
      storages: ["128GB", "256GB", "512GB"],
    });
    setProductColors([
      { name: "أسود تيتانيوم", hex: "#1f2022", image: null, file: null },
      { name: "تيتانيوم طبيعي", hex: "#9a958e", image: null, file: null },
      { name: "أبيض ناصع", hex: "#f5f5f7", image: null, file: null },
    ]);
    setIsProductModalOpen(true);
  };

  // Open Edit Product Form
  const handleOpenEdit = (product: Product) => {
    setEditingProductId(product.id);
    setSelectedFile(null);
    const isPreset = ["iphone", "samsung", "cases", "headphones", "earbuds", "cable", "smartwatch", "powerbank", "screen-protector"].includes(product.image) || product.image.startsWith("charger-");

    // Set current image preview for custom images
    setImagePreview(isPreset ? null : product.image);

    const isMobile = isMobileProduct(product);

    setProductForm({
      name: product.name,
      nameEn: product.nameEn,
      price: product.price,
      discountPrice: isMobile ? 0 : (product.discountPrice || 0),
      category: product.category,
      imageType: isPreset ? "preset" : "upload",
      imagePreset: isPreset ? product.image : "iphone",
      imageUrl: isPreset ? "" : product.image,
      description: product.description || "",
      specs: product.specs || "",
      isPopular: product.isPopular || false,
      isOutOfStock: product.isOutOfStock || false,
      rating: product.rating !== undefined && product.rating !== null ? product.rating : 5,
      reviewsCount: product.reviewsCount !== undefined && product.reviewsCount !== null ? product.reviewsCount : 24,
      ports: product.ports || [],
      storages: product.storages || (isMobile ? ["128GB", "256GB", "512GB"] : []),
    });
    setProductColors(product.colors || []);
    setIsProductModalOpen(true);
  };

  // Save Product (Add or Edit)
  const handleSaveProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!productForm.name || !productForm.nameEn || productForm.price <= 0) {
      alert("يرجى ملء جميع الحقول بشكل صحيح");
      return;
    }

    let imageValue = "";

    if (productForm.imageType === "preset") {
      imageValue = productForm.imagePreset;
    } else if (productForm.imageType === "url") {
      imageValue = productForm.imageUrl;
      if (!imageValue) {
        alert("يرجى إدخال رابط الصورة");
        return;
      }
    } else if (productForm.imageType === "upload") {
      if (selectedFile) {
        setIsUploading(true);
        try {
          // Compress image to JPEG quality 0.8 and max 800px width/height
          const compressedBlob = await compressAndResizeImage(selectedFile, 800, 800, 0.8);

          // Generate a clean safe unique filename
          const fileExtension = selectedFile.name.split('.').pop() || 'jpg';
          const cleanName = selectedFile.name.replace(/[^a-zA-Z0-9]/g, '_').substring(0, 20);
          const filePath = `${Date.now()}-${cleanName}.${fileExtension}`;

          // Upload to Supabase Storage
          const { error: uploadError } = await supabase.storage
            .from("products")
            .upload(filePath, compressedBlob, {
              contentType: `image/${fileExtension === 'png' ? 'png' : 'jpeg'}`,
              cacheControl: "3600",
              upsert: false
            });

          if (uploadError) {
            throw uploadError;
          }

          // Get the public URL of the uploaded image
          const { data: { publicUrl } } = supabase.storage
            .from("products")
            .getPublicUrl(filePath);

          imageValue = publicUrl;
        } catch (error: any) {
          console.error("Error uploading image:", error);
          alert(`حدث خطأ أثناء رفع الصورة: ${error.message || error.details || "يرجى التأكد من إنشاء Storage Bucket باسم 'products' وجعلها عامة (Public) في Supabase."}`);
          setIsUploading(false);
          return;
        } finally {
          setIsUploading(false);
        }
      } else if (editingProductId && imagePreview) {
        // Keep existing custom image URL
        imageValue = imagePreview;
      } else {
        alert("يرجى اختيار صورة للرفع");
        return;
      }
    }

    if (!imageValue) {
      alert("يرجى إدخال رابط الصورة أو اختيار شكل جرافيكي");
      return;
    }

    // Upload color-specific images if any
    const finalColors = [];
    for (const color of productColors) {
      let colorImage = color.image || null;
      if (color.file) {
        setIsUploading(true);
        try {
          const compressedBlob = await compressAndResizeImage(color.file, 800, 800, 0.8);
          const fileExtension = color.file.name.split('.').pop() || 'jpg';
          const cleanName = color.file.name.replace(/[^a-zA-Z0-9]/g, '_').substring(0, 20);
          const filePath = `color-${Date.now()}-${cleanName}.${fileExtension}`;

          const { error: uploadError } = await supabase.storage
            .from("products")
            .upload(filePath, compressedBlob, {
              contentType: `image/${fileExtension === 'png' ? 'png' : 'jpeg'}`,
              cacheControl: "3600",
              upsert: false
            });

          if (uploadError) throw uploadError;

          const { data: { publicUrl } } = supabase.storage
            .from("products")
            .getPublicUrl(filePath);

          colorImage = publicUrl;
        } catch (error: any) {
          console.error("Error uploading color image:", error);
          alert(`حدث خطأ أثناء رفع صورة اللون ${color.name}: ${error.message || error}`);
          setIsUploading(false);
          return;
        } finally {
          setIsUploading(false);
        }
      }
      finalColors.push({
        name: color.name,
        hex: color.hex,
        image: colorImage
      });
    }

    const isMobile = productForm.category === "موبايلات";

    const productData = {
      name: productForm.name,
      nameEn: productForm.nameEn,
      price: productForm.price,
      // Mobiles are strictly sold at standard price with NO discounts
      discountPrice: isMobile ? 0 : (productForm.discountPrice > 0 ? productForm.discountPrice : 0),
      category: productForm.category,
      image: imageValue,
      description: productForm.description,
      specs: productForm.specs,
      isPopular: productForm.isPopular,
      isOutOfStock: productForm.isOutOfStock,
      colors: finalColors,
      storages: isMobile ? (productForm.storages || []) : (productForm.storages || []),
      rating: productForm.rating,
      reviewsCount: productForm.reviewsCount,
      ports: productForm.ports,
    };

    try {
      if (editingProductId) {
        await updateProduct(editingProductId, productData);
      } else {
        await addProduct(productData);
      }
      setIsProductModalOpen(false);
    } catch (err: any) {
      console.error("Error saving product:", err);
      alert(`حدث خطأ أثناء حفظ المنتج: ${err.message || err}`);
    }
  };

  // Statistics calculations
  const totalProducts = products.length;
  const pendingRepairs = appointments.filter((a) => a.status === "pending").length;
  const activeRepairs = appointments.filter((a) => a.status === "in-progress").length;
  const completedRepairs = appointments.filter((a) => a.status === "completed").length;

  const totalOrdersCount = orders.length;
  const pendingOrdersCount = orders.filter((o) => o.status === "pending").length;
  const preparingOrdersCount = orders.filter((o) => o.status === "preparing").length;
  const shippingOrdersCount = orders.filter((o) => o.status === "shipping").length;
  const deliveredOrdersCount = orders.filter((o) => o.status === "delivered").length;
  const cancelledOrdersCount = orders.filter((o) => o.status === "cancelled").length;
  const totalDeliveredRevenue = orders
    .filter((o) => o.status === "delivered")
    .reduce((acc, curr) => acc + (curr.totalAmount || 0), 0);

  // Filtered Orders List
  const filteredOrders = orders.filter((order) => {
    const matchesFilter = orderFilter === "all" ? true : order.status === orderFilter;
    if (!matchesFilter) return false;
    if (!orderSearch.trim()) return true;
    const query = orderSearch.trim().toLowerCase();
    const orderNum = (order.orderNumber || "").toLowerCase();
    const custName = (order.customerName || "").toLowerCase();
    const custPhone = (order.customerPhone || "").toLowerCase();
    const custAddr = (order.customerAddress || "").toLowerCase();
    const hasItemMatch = order.items && order.items.some((i) => (i.productName || "").toLowerCase().includes(query));
    return (
      orderNum.includes(query) ||
      custName.includes(query) ||
      custPhone.includes(query) ||
      custAddr.includes(query) ||
      hasItemMatch
    );
  });

  // Simulated revenue: 45,000 IQD per completed repair + sum of all products + delivered orders
  const estimatedRevenue = completedRepairs * 45000 + totalDeliveredRevenue + products.reduce((acc, curr) => acc + curr.price * 0.1, 0);

  // Filtered Products List
  const filteredProducts = products.filter((prod) =>
    matchProduct(prod, productSearch)
  );

  const premiumCandidateProducts = [...products].sort((a, b) => {
    const aSavings = a.discountPrice && a.discountPrice > 0 ? a.price - a.discountPrice : 0;
    const bSavings = b.discountPrice && b.discountPrice > 0 ? b.price - b.discountPrice : 0;
    return bSavings - aSavings || Number(Boolean(b.isPopular)) - Number(Boolean(a.isPopular));
  });
  const selectedPremiumHero = products.find((product) => product.id === premiumShowcaseForm.heroProductId);
  const selectedFlashProduct = products.find((product) => product.id === flashSaleForm.productId);
  const selectedFlashImageIsPreset = selectedFlashProduct
    ? ["iphone", "samsung", "cases", "headphones", "earbuds", "cable", "smartwatch", "powerbank", "screen-protector"].includes(selectedFlashProduct.image) || selectedFlashProduct.image.startsWith("charger-")
    : false;
  const flashPreviewPrice = flashSaleForm.discountPrice || selectedFlashProduct?.discountPrice || selectedFlashProduct?.price || 0;
  const flashPreviewDiscount = selectedFlashProduct && flashPreviewPrice > 0
    ? Math.max(0, Math.round((1 - (flashPreviewPrice / selectedFlashProduct.price)) * 100))
    : 0;
  const flashPreviewStockPercent = Math.max(
    4,
    Math.min(100, ((flashSaleForm.stockLimit || 0) / Math.max(flashSaleForm.initialStock || 1, 1)) * 100)
  );

  // Filtered Repairs List
  const filteredRepairs = appointments.filter((appt) =>
    repairFilter === "all" ? true : appt.status === repairFilter
  );

  // --- LOGIN VIEW ---
  if (isLoadingAuth || isVerifyingAdmin) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4 font-sans text-right" dir="rtl">
        <div className="animate-pulse flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-4 border-accent border-t-transparent rounded-full animate-spin"></div>
          <p className="text-slate-500 font-bold">جاري التحقق من الهوية والصلاحيات...</p>
        </div>
      </div>
    );
  }

  if (!isLoggedIn || !isAdminVerified) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4 font-sans text-right" dir="rtl">
        <div className="w-full max-w-md bg-white border border-card-border rounded-2xl p-8 shadow-xl space-y-6">

          {/* Logo & Header */}
          <div className="text-center space-y-2">
            <div className="text-accent text-3xl font-extrabold flex justify-center gap-1.5 items-center">
              <span>لوحة التحكم CMS</span>
            </div>
            <p className="text-xs text-slate-400">سجل الدخول لإدارة منتجات وحجوزات متجر مركز الروان</p>
          </div>

          {loginError && (
            <div className="p-3 bg-rose-50 border border-rose-100 text-rose-600 text-xs rounded-xl flex items-center gap-2">
              <AlertCircle className="w-4 h-4 flex-shrink-0" />
              <span>{loginError}</span>
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleLogin} className="space-y-4">
            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-700 flex items-center gap-1.5">
                <User className="w-3.5 h-3.5 text-slate-400" />
                البريد الإلكتروني
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="admin@example.com"
                className="w-full text-sm border border-slate-200 rounded-xl px-4 py-2.5 bg-slate-50/50 focus:outline-none focus:border-accent"
                required
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-700 flex items-center gap-1.5">
                <Lock className="w-3.5 h-3.5 text-slate-400" />
                كلمة المرور
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="كلمة المرور (admin)"
                className="w-full text-sm border border-slate-200 rounded-xl px-4 py-2.5 bg-slate-50/50 focus:outline-none focus:border-accent"
                required
              />
            </div>

            <button
              type="submit"
              className="w-full bg-[#1a1a1a] hover:bg-slate-800 text-white font-bold py-3 rounded-xl transition-all shadow-md cursor-pointer text-sm"
            >
              تسجيل الدخول
            </button>
          </form>

          <div className="text-center pt-2">
            <Link href="/" className="text-xs text-slate-400 hover:text-accent transition-colors flex items-center justify-center gap-1.5">
              <ArrowRight className="w-3.5 h-3.5" />
              <span>العودة لصفحة المتجر الرئيسية</span>
            </Link>
          </div>

        </div>
      </div>
    );
  }

  // --- DASHBOARD VIEW ---
  return (
    <div className="min-h-screen bg-slate-50/50 flex flex-col font-sans text-right" dir="rtl">

      {/* Admin Nav Header */}
      <header className="sticky top-0 z-40 bg-white border-b border-card-border shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">

          <div className="flex items-center gap-4">
            <div>
              <span className="block text-base font-extrabold text-[#1a1a1a]">لوحة إدارة المحتوى (CMS)</span>
              <span className="block text-[10px] font-bold text-slate-400 uppercase font-mono tracking-wide">Mobile World Panel</span>
            </div>
            <span className="bg-emerald-50 text-emerald-600 border border-emerald-100 font-extrabold text-[10px] px-2 py-0.5 rounded-full">
              متصل
            </span>
          </div>

          <div className="flex items-center gap-4">
            <Link
              href="/"
              className="text-xs text-slate-600 hover:text-accent font-bold transition-colors flex items-center gap-1"
            >
              <ArrowRight className="w-4 h-4" />
              <span>عرض المتجر</span>
            </Link>
            <button
              onClick={handleLogout}
              className="p-2 text-slate-400 hover:text-rose-500 rounded-full hover:bg-rose-50 transition-colors cursor-pointer"
              title="تسجيل خروج"
            >
              <LogOut className="w-4.5 h-4.5" />
            </button>
          </div>

        </div>
      </header>

      {/* Content Body */}
      <main className="flex-grow max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">

        {/* Navigation Sidebar (CMS Tabs) */}
        <aside className="lg:col-span-3 bg-white border border-card-border p-4 rounded-2xl space-y-2">
          <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider px-2 mb-3">التبويبات الرئيسية</h3>

          <button
            onClick={() => setActiveTab("overview")}
            className={`w-full flex items-center gap-3 p-3.5 rounded-xl text-sm font-bold transition-all text-right cursor-pointer ${activeTab === "overview"
              ? "bg-[#1a1a1a] text-white shadow-md"
              : "hover:bg-slate-50 text-slate-600"
              }`}
          >
            <TrendingUp className="w-4.5 h-4.5" />
            <span>نظرة عامة وإحصائيات</span>
          </button>

          <button
            onClick={() => setActiveTab("products")}
            className={`w-full flex items-center gap-3 p-3.5 rounded-xl text-sm font-bold transition-all text-right cursor-pointer ${activeTab === "products"
              ? "bg-[#1a1a1a] text-white shadow-md"
              : "hover:bg-slate-50 text-slate-600"
              }`}
          >
            <ShoppingBag className="w-4.5 h-4.5" />
            <span>إدارة المنتجات العامة ({totalProducts})</span>
          </button>

          <button
            onClick={() => setActiveTab("devices")}
            className={`w-full flex items-center gap-3 p-3.5 rounded-xl text-sm font-bold transition-all text-right cursor-pointer ${activeTab === "devices"
              ? "bg-[#1a1a1a] text-white shadow-md"
              : "hover:bg-slate-50 text-slate-600"
              }`}
          >
            <Smartphone className="w-4.5 h-4.5 text-sky-400" />
            <span>إدارة وإضافة الأجهزة ({products.filter(p => isMobileProduct(p)).length})</span>
          </button>

          <button
            onClick={() => setActiveTab("orders")}
            className={`w-full flex items-center gap-3 p-3.5 rounded-xl text-sm font-bold transition-all text-right cursor-pointer ${activeTab === "orders"
              ? "bg-[#1a1a1a] text-white shadow-md"
              : "hover:bg-slate-50 text-slate-600"
              }`}
          >
            <Truck className="w-4.5 h-4.5 text-emerald-500" />
            <span>طلبات الشراء والتوصيل ({orders.length})</span>
            {pendingOrdersCount > 0 && (
              <span className="mr-auto bg-emerald-500 text-white font-extrabold text-[9px] w-4.5 h-4.5 rounded-full flex items-center justify-center">
                {pendingOrdersCount}
              </span>
            )}
          </button>

          <button
            onClick={() => setActiveTab("repairs")}
            className={`w-full flex items-center gap-3 p-3.5 rounded-xl text-sm font-bold transition-all text-right cursor-pointer ${activeTab === "repairs"
              ? "bg-[#1a1a1a] text-white shadow-md"
              : "hover:bg-slate-50 text-slate-600"
              }`}
          >
            <Wrench className="w-4.5 h-4.5" />
            <span>حجوزات الصيانة ({appointments.length})</span>
            {pendingRepairs > 0 && (
              <span className="mr-auto bg-rose-500 text-white font-extrabold text-[9px] w-4.5 h-4.5 rounded-full flex items-center justify-center">
                {pendingRepairs}
              </span>
            )}
          </button>

          <button
            onClick={() => setActiveTab("settings")}
            className={`w-full flex items-center gap-3 p-3.5 rounded-xl text-sm font-bold transition-all text-right cursor-pointer ${activeTab === "settings"
              ? "bg-[#1a1a1a] text-white shadow-md"
              : "hover:bg-slate-50 text-slate-600"
              }`}
          >
            <FileText className="w-4.5 h-4.5" />
            <span>إعدادات الموقع</span>
          </button>

          <button
            onClick={() => setActiveTab("flash")}
            className={`w-full flex items-center gap-3 p-3.5 rounded-xl text-sm font-bold transition-all text-right cursor-pointer ${activeTab === "flash"
              ? "bg-[#1a1a1a] text-white shadow-md"
              : "hover:bg-slate-50 text-slate-600"
              }`}
          >
            <Flame className="w-4.5 h-4.5" />
            <span>الصفقة الخاطفة</span>
            {flashSale.isEnabled && (
              <span className="mr-auto rounded-full bg-red-500 px-2 py-0.5 text-[9px] font-black text-white">
                فعالة
              </span>
            )}
          </button>

          <button
            onClick={() => setActiveTab("slides")}
            className={`w-full flex items-center gap-3 p-3.5 rounded-xl text-sm font-bold transition-all text-right cursor-pointer ${activeTab === "slides"
              ? "bg-[#1a1a1a] text-white shadow-md"
              : "hover:bg-slate-50 text-slate-600"
              }`}
          >
            <Star className="w-4.5 h-4.5" />
            <span>الشرائح الإعلانية ({heroSlides.length})</span>
          </button>

          <button
            onClick={openPremiumShowcaseTab}
            className={`w-full flex items-center gap-3 p-3.5 rounded-xl text-sm font-bold transition-all text-right cursor-pointer ${activeTab === "premium"
              ? "bg-[#1a1a1a] text-white shadow-md"
              : "hover:bg-slate-50 text-slate-600"
              }`}
          >
            <Sparkles className="w-4.5 h-4.5" />
            <span>العروض المميزة ({premiumShowcase.productIds.length})</span>
          </button>

          <button
            onClick={() => setActiveTab("gallery")}
            className={`w-full flex items-center gap-3 p-3.5 rounded-xl text-sm font-bold transition-all text-right cursor-pointer ${activeTab === "gallery"
              ? "bg-[#1a1a1a] text-white shadow-md"
              : "hover:bg-slate-50 text-slate-600"
              }`}
          >
            <Sparkles className="w-4.5 h-4.5 text-sky-500" />
            <span>معرض الصور الأحدث ({galleryShowcase?.items?.length || 0})</span>
            {galleryShowcase?.isEnabled && (
              <span className="mr-auto rounded-full bg-emerald-500 px-2 py-0.5 text-[9px] font-black text-white">
                مفعل
              </span>
            )}
          </button>

          <button
            onClick={() => setActiveTab("bundles")}
            className={`w-full flex items-center gap-3 p-3.5 rounded-xl text-sm font-bold transition-all text-right cursor-pointer ${activeTab === "bundles"
              ? "bg-[#1a1a1a] text-white shadow-md"
              : "hover:bg-slate-50 text-slate-600"
              }`}
          >
            <ShoppingBag className="w-4.5 h-4.5" />
            <span>حزم التوفير ({productBundles.length})</span>
          </button>

          <button
            onClick={() => setActiveTab("coupons")}
            className={`w-full flex items-center gap-3 p-3.5 rounded-xl text-sm font-bold transition-all text-right cursor-pointer ${activeTab === "coupons"
              ? "bg-[#1a1a1a] text-white shadow-md"
              : "hover:bg-slate-50 text-slate-600"
              }`}
          >
            <TicketPercent className="w-4.5 h-4.5" />
            <span>كوبونات وحملات الخصم ({couponCampaigns.length})</span>
          </button>
        </aside>

        {/* CMS Display Panel */}
        <section className="lg:col-span-9 bg-white border border-card-border rounded-2xl p-6 sm:p-8 min-h-[500px]">

          {/* TAB 1: OVERVIEW */}
          {/* TAB 1: OVERVIEW */}
          {activeTab === "overview" && (
            <div className="space-y-8">
              <div className="border-b border-slate-100 pb-4">
                <h2 className="text-xl font-extrabold text-[#1a1a1a]">نظرة عامة على المتجر والمركز</h2>
                <p className="text-xs text-slate-400">إحصائيات فورية حول المخزن وعمليات الصيانة والطلبات والمبيعات</p>
              </div>

              {/* Bento Box Stats */}
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">

                {/* Stat 1: Total products */}
                <div className="bg-slate-50/50 border border-slate-100 p-5 rounded-2xl space-y-2">
                  <div className="p-2 bg-blue-50 text-blue-500 rounded-lg w-fit">
                    <ShoppingBag className="w-5 h-5" />
                  </div>
                  <div className="text-slate-400 text-[10px] font-bold">إجمالي المنتجات والأجهزة</div>
                  <div className="text-2xl font-extrabold text-slate-800">{totalProducts}</div>
                </div>

                {/* Stat 2: Orders Count */}
                <div className="bg-slate-50/50 border border-slate-100 p-5 rounded-2xl space-y-2">
                  <div className="p-2 bg-emerald-50 text-emerald-600 rounded-lg w-fit flex items-center justify-between w-full">
                    <Truck className="w-5 h-5" />
                    {pendingOrdersCount > 0 && (
                      <span className="bg-emerald-500 text-white text-[9px] font-black px-2 py-0.5 rounded-full">
                        {pendingOrdersCount} جديد
                      </span>
                    )}
                  </div>
                  <div className="text-slate-400 text-[10px] font-bold">إجمالي طلبات الشراء</div>
                  <div className="text-2xl font-extrabold text-slate-800">{totalOrdersCount}</div>
                </div>

                {/* Stat 3: Pending & Active Repairs */}
                <div className="bg-slate-50/50 border border-slate-100 p-5 rounded-2xl space-y-2">
                  <div className="p-2 bg-amber-50 text-amber-500 rounded-lg w-fit flex items-center justify-between w-full">
                    <Wrench className="w-5 h-5" />
                    {pendingRepairs > 0 && (
                      <span className="bg-amber-500 text-white text-[9px] font-black px-2 py-0.5 rounded-full">
                        {pendingRepairs} انتظار
                      </span>
                    )}
                  </div>
                  <div className="text-slate-400 text-[10px] font-bold">حجوزات الصيانة</div>
                  <div className="text-2xl font-extrabold text-slate-800">{appointments.length}</div>
                </div>

                {/* Stat 4: Estimated sales */}
                <div className="bg-slate-50/50 border border-slate-100 p-5 rounded-2xl space-y-2">
                  <div className="p-2 bg-purple-50 text-purple-600 rounded-lg w-fit">
                    <TrendingUp className="w-5 h-5" />
                  </div>
                  <div className="text-slate-400 text-[10px] font-bold">العوائد والمبيعات</div>
                  <div className="text-sm sm:text-base font-extrabold text-slate-800 truncate font-mono">
                    {estimatedRevenue.toLocaleString()} د.ع
                  </div>
                </div>

              </div>

              {/* Quick Table 1: Latest Orders */}
              <div className="space-y-4">
                <div className="flex justify-between items-center flex-wrap gap-2">
                  <div className="flex items-center gap-2">
                    <Truck className="w-4 h-4 text-emerald-600" />
                    <h3 className="font-extrabold text-sm text-[#1a1a1a]">آخر طلبات الشراء والتوصيل</h3>
                  </div>
                  <div className="flex items-center gap-3">
                    <button
                      onClick={handleOpenManualInvoice}
                      className="bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-xs px-3 py-1.5 rounded-xl shadow-2xs flex items-center gap-1.5 transition-all cursor-pointer"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      <span>فاتورة زبون محل</span>
                    </button>
                    <button onClick={() => setActiveTab("orders")} className="text-xs text-accent font-bold hover:underline cursor-pointer">
                      عرض كافة الطلبات ({orders.length}) ←
                    </button>
                  </div>
                </div>

                {orders.length === 0 ? (
                  <div className="p-8 border border-dashed border-slate-200 rounded-xl text-center text-xs text-slate-400">
                    لا توجد طلبات شراء مسجلة حالياً.
                  </div>
                ) : (
                  <div className="overflow-x-auto border border-card-border rounded-xl">
                    <table className="w-full text-xs text-right">
                      <thead className="bg-slate-50 text-slate-500 font-bold border-b border-card-border">
                        <tr>
                          <th className="p-3">رقم الطلب</th>
                          <th className="p-3">العميل والهاتف</th>
                          <th className="p-3">المواد المطلوبة</th>
                          <th className="p-3">المبلغ الإجمالي</th>
                          <th className="p-3">الحالة</th>
                          <th className="p-3 text-left">طباعة</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100">
                        {orders.slice(0, 4).map((order) => (
                          <tr key={order.id} className="hover:bg-slate-50/50">
                            <td className="p-3 font-mono font-bold text-slate-900">{order.orderNumber}</td>
                            <td className="p-3">
                              <div className="font-bold text-slate-800">{order.customerName}</div>
                              <div className="text-[10px] text-slate-400 font-mono" dir="ltr">{order.customerPhone}</div>
                            </td>
                            <td className="p-3 max-w-[200px] truncate text-slate-600">
                              {order.items?.map((i) => `${i.productName} (x${i.quantity})`).join(", ")}
                            </td>
                            <td className="p-3 font-bold font-mono text-slate-850" dir="ltr">
                              {order.totalAmount.toLocaleString()} د.ع
                            </td>
                            <td className="p-3">
                              <span className={`inline-block px-2 py-0.5 rounded text-[10px] font-bold ${
                                order.status === "pending"
                                  ? "bg-amber-50 text-amber-600 border border-amber-100"
                                  : order.status === "preparing"
                                  ? "bg-blue-50 text-blue-600 border border-blue-100"
                                  : order.status === "shipping"
                                  ? "bg-purple-50 text-purple-600 border border-purple-100"
                                  : order.status === "delivered"
                                  ? "bg-emerald-50 text-emerald-600 border border-emerald-100"
                                  : "bg-rose-50 text-rose-600 border border-rose-100"
                              }`}>
                                {order.status === "pending" && "جديد"}
                                {order.status === "preparing" && "تجهيز"}
                                {order.status === "shipping" && "توصيل"}
                                {order.status === "delivered" && "مكتمل"}
                                {order.status === "cancelled" && "ملغي"}
                              </span>
                            </td>
                            <td className="p-3 text-left">
                              <button
                                onClick={() => handlePrintOrder(order)}
                                className="p-1.5 bg-sky-50 hover:bg-sky-100 text-sky-600 rounded-lg transition-colors cursor-pointer inline-flex items-center gap-1 font-bold text-[10px]"
                                title="طباعة الفاتورة والبوليصة"
                              >
                                <Printer className="w-3.5 h-3.5" />
                                <span>طباعة</span>
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>

              {/* Quick Table 2: Repairs */}
              <div className="space-y-4">
                <div className="flex justify-between items-center flex-wrap gap-2">
                  <div className="flex items-center gap-2">
                    <Wrench className="w-4 h-4 text-sky-600" />
                    <h3 className="font-extrabold text-sm text-[#1a1a1a]">آخر حجوزات وعمليات الصيانة</h3>
                  </div>
                  <div className="flex items-center gap-3">
                    <button
                      onClick={handleOpenManualRepair}
                      className="bg-sky-600 hover:bg-sky-700 text-white font-extrabold text-xs px-3 py-1.5 rounded-xl shadow-2xs flex items-center gap-1.5 transition-all cursor-pointer"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      <span>وصل صيانة جديد</span>
                    </button>
                    <button onClick={() => setActiveTab("repairs")} className="text-xs text-accent font-bold hover:underline cursor-pointer">
                      عرض الكل ({appointments.length}) ←
                    </button>
                  </div>
                </div>

                {appointments.length === 0 ? (
                  <div className="p-8 border border-dashed border-slate-200 rounded-xl text-center text-xs text-slate-400">
                    لا توجد حجوزات صيانة مسجلة حالياً.
                  </div>
                ) : (
                  <div className="overflow-x-auto border border-card-border rounded-xl">
                    <table className="w-full text-xs text-right">
                      <thead className="bg-slate-50 text-slate-500 font-bold border-b border-card-border">
                        <tr>
                          <th className="p-3">العميل</th>
                          <th className="p-3">الجهاز</th>
                          <th className="p-3">المشكلة</th>
                          <th className="p-3">التاريخ</th>
                          <th className="p-3">الحالة</th>
                          <th className="p-3 text-left">وصل صيانة</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100">
                        {appointments.slice(0, 3).map((appt) => (
                          <tr key={appt.id} className="hover:bg-slate-50/50">
                            <td className="p-3 font-semibold text-slate-800">{appt.name}</td>
                            <td className="p-3 text-slate-600 font-mono">{appt.device}</td>
                            <td className="p-3 text-slate-600">{appt.issueType}</td>
                            <td className="p-3 text-slate-500 font-mono">{appt.date}</td>
                            <td className="p-3">
                              <span className={`inline-block px-2 py-0.5 rounded text-[10px] font-bold ${appt.status === "pending"
                                ? "bg-amber-50 text-amber-600 border border-amber-100"
                                : appt.status === "in-progress"
                                  ? "bg-blue-50 text-blue-600 border border-blue-100"
                                  : appt.status === "completed"
                                    ? "bg-emerald-50 text-emerald-600 border border-emerald-100"
                                    : "bg-rose-50 text-rose-600 border border-rose-100"
                                }`}>
                                {appt.status === "pending" && "انتظار"}
                                {appt.status === "in-progress" && "صيانة"}
                                {appt.status === "completed" && "مكتمل"}
                                {appt.status === "cancelled" && "ملغى"}
                              </span>
                            </td>
                            <td className="p-3 text-left">
                              <button
                                onClick={() => handlePrintRepair(appt)}
                                className="p-1.5 bg-sky-50 hover:bg-sky-100 text-sky-600 rounded-lg transition-colors cursor-pointer inline-flex items-center gap-1 font-bold text-[10px]"
                                title="طباعة إيصال استلام الصيانة"
                              >
                                <Printer className="w-3.5 h-3.5" />
                                <span>وصل</span>
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>

            </div>
          )}

          {/* TAB 2: PRODUCTS MANAGEMENT */}
          {activeTab === "products" && (
            <div className="space-y-6">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-slate-100 pb-4">
                <div>
                  <h2 className="text-xl font-extrabold text-[#1a1a1a]">إدارة مخزن المنتجات</h2>
                  <p className="text-xs text-slate-400">إضافة وتحديث وحذف الهواتف والملحقات المعروضة في المتجر</p>
                </div>

                <button
                  onClick={handleOpenAdd}
                  className="bg-accent hover:bg-accent-hover text-white text-xs font-bold px-4 py-2.5 rounded-xl transition-all shadow-md flex items-center gap-1.5 cursor-pointer"
                >
                  <Plus className="w-4 h-4" />
                  إضافة منتج جديد
                </button>
              </div>

              {/* Search bar inside products CMS */}
              <div className="relative w-full max-w-sm">
                <input
                  type="text"
                  placeholder="ابحث بالاسم أو القسم..."
                  value={productSearch}
                  onChange={(e) => setProductSearch(e.target.value)}
                  className="w-full text-xs bg-slate-50 border border-slate-200 rounded-xl py-2.5 pl-4 pr-10 focus:outline-none focus:border-accent"
                />
                <Search className="w-4 h-4 text-slate-400 absolute left-auto right-3 top-1/2 -translate-y-1/2" />
              </div>

              {/* Products Table */}
              {filteredProducts.length === 0 ? (
                <div className="p-12 border border-dashed border-slate-200 rounded-xl text-center text-slate-400 text-xs">
                  لا توجد منتجات تطابق البحث حالياً.
                </div>
              ) : (
                <div className="overflow-x-auto border border-card-border rounded-xl">
                  <table className="w-full text-xs text-right">
                    <thead className="bg-slate-50 text-slate-500 font-bold border-b border-card-border">
                      <tr>
                        <th className="p-3 w-16">المعاينة</th>
                        <th className="p-3">الاسم (عربي)</th>
                        <th className="p-3">الاسم (EN)</th>
                        <th className="p-3">القسم</th>
                        <th className="p-3">السعر</th>
                        <th className="p-3 text-left">التحكم</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {filteredProducts.map((prod) => (
                        <tr key={prod.id} className="hover:bg-slate-50/50">

                          {/* Mini render of CSS Mockup preview or custom image */}
                          <td className="p-3">
                            <div className="w-10 h-10 bg-slate-100 rounded border border-slate-200 flex items-center justify-center text-[7px] text-slate-400 select-none uppercase overflow-hidden font-bold">
                              {(prod.image && (prod.image.startsWith("http://") || prod.image.startsWith("https://") || prod.image.startsWith("/") || prod.image.includes("."))) ? (
                                <img src={prod.image} alt="" className="w-full h-full object-cover rounded" />
                              ) : (
                                prod.image
                              )}
                            </div>
                          </td>

                          <td className="p-3 font-semibold text-slate-800">{prod.name}</td>
                          <td className="p-3 text-slate-600 font-mono">{prod.nameEn}</td>
                          <td className="p-3">
                            <span className="bg-slate-100 text-slate-600 px-2 py-0.5 rounded font-bold text-[10px]">
                              {prod.category}
                            </span>
                            {prod.isPopular && (
                              <span className="mr-1.5 bg-amber-50 text-amber-600 border border-amber-200 px-1.5 py-0.5 rounded text-[9px] font-extrabold inline-flex items-center gap-0.5">
                                <Star className="w-2.5 h-2.5 fill-amber-500 text-amber-500" />
                                شائع
                              </span>
                            )}
                          </td>
                          <td className="p-3 font-semibold text-slate-700 font-mono">
                            {prod.price.toLocaleString()} د.ع
                          </td>

                          {/* Control buttons */}
                          <td className="p-3 text-left space-x-1 space-x-reverse">
                            <button
                              onClick={() => handleOpenEdit(prod)}
                              className="p-1.5 text-slate-500 hover:text-accent hover:bg-slate-100 rounded-lg transition-colors cursor-pointer"
                              title="تعديل المنتج"
                            >
                              <Edit2 className="w-3.5 h-3.5" />
                            </button>
                            <button
                              onClick={() => {
                                if (confirm(`هل أنت متأكد من حذف المنتج: ${prod.name}؟`)) {
                                  deleteProduct(prod.id);
                                }
                              }}
                              className="p-1.5 text-slate-400 hover:text-rose-500 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer"
                              title="حذف المنتج"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </td>

                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}

            </div>
          )}

          {/* TAB: SMART DEVICES MANAGEMENT */}
          {activeTab === "devices" && (
            <div className="space-y-6">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-slate-100 pb-4">
                <div>
                  <div className="flex items-center gap-2">
                    <Smartphone className="w-6 h-6 text-sky-500" />
                    <h2 className="text-xl font-extrabold text-[#1a1a1a]">إدارة وإضافة الهواتف الذكية والأجهزة</h2>
                  </div>
                  <p className="text-xs text-slate-400 mt-1">
                    قسم مخصص لإضافة الهواتف الذكية مع خيارات الذاكرة (128GB, 256GB, 512GB, 1TB) وتخصيص الألوان بسهولة. (ملاحظة: الهواتف لا تشملها الخصومات)
                  </p>
                </div>

                <button
                  onClick={handleOpenAddDevice}
                  className="bg-sky-600 hover:bg-sky-700 text-white text-xs font-bold px-4 py-2.5 rounded-xl transition-all shadow-md flex items-center gap-1.5 cursor-pointer"
                >
                  <Plus className="w-4 h-4" />
                  + إضافة هاتف ذكي جديد
                </button>
              </div>

              {/* Devices quick stats */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="bg-sky-50/60 border border-sky-100 p-4 rounded-2xl">
                  <span className="text-[10px] font-bold text-sky-600 block">إجمالي أجهزة الموبايل المعروضة</span>
                  <span className="text-2xl font-black text-sky-900">{products.filter(p => isMobileProduct(p)).length} هاتف</span>
                </div>
                <div className="bg-emerald-50/60 border border-emerald-100 p-4 rounded-2xl">
                  <span className="text-[10px] font-bold text-emerald-600 block">سعات التخزين المدعومة</span>
                  <span className="text-xs font-bold text-emerald-900 mt-1 block">128GB • 256GB • 512GB • 1TB</span>
                </div>
                <div className="bg-amber-50/60 border border-amber-100 p-4 rounded-2xl">
                  <span className="text-[10px] font-bold text-amber-600 block">سياسة الخصم المعتمدة</span>
                  <span className="text-xs font-bold text-amber-900 mt-1 block">أجهزة الموبايل غير مشمولة بالخصومات</span>
                </div>
              </div>

              {/* Search bar inside devices CMS */}
              <div className="relative w-full max-w-sm">
                <input
                  type="text"
                  placeholder="ابحث عن هاتف بالاسم..."
                  value={productSearch}
                  onChange={(e) => setProductSearch(e.target.value)}
                  className="w-full text-xs bg-slate-50 border border-slate-200 rounded-xl py-2.5 pl-4 pr-10 focus:outline-none focus:border-accent"
                />
                <Search className="w-4 h-4 text-slate-400 absolute left-auto right-3 top-1/2 -translate-y-1/2" />
              </div>

              {/* Devices Table */}
              {products.filter(p => isMobileProduct(p) && matchProduct(p, productSearch)).length === 0 ? (
                <div className="p-12 border border-dashed border-slate-200 rounded-xl text-center text-slate-400 text-xs space-y-3">
                  <Smartphone className="w-10 h-10 mx-auto text-slate-300" />
                  <p>لا توجد هواتف ذكية مضافة حالياً تطابق البحث.</p>
                  <button
                    onClick={handleOpenAddDevice}
                    className="bg-[#1a1a1a] hover:bg-slate-800 text-white text-xs font-bold px-4 py-2 rounded-xl transition-all inline-flex items-center gap-1 cursor-pointer"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    إضافة أول هاتف ذكي
                  </button>
                </div>
              ) : (
                <div className="overflow-x-auto border border-card-border rounded-xl">
                  <table className="w-full text-xs text-right">
                    <thead className="bg-slate-50 text-slate-500 font-bold border-b border-card-border">
                      <tr>
                        <th className="p-3 w-16">المعاينة</th>
                        <th className="p-3">اسم الجهاز</th>
                        <th className="p-3">سعات التخزين</th>
                        <th className="p-3">الألوان المتاحة</th>
                        <th className="p-3">السعر الأصلي</th>
                        <th className="p-3 text-left">التحكم</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {products
                        .filter(p => isMobileProduct(p) && matchProduct(p, productSearch))
                        .map((prod) => (
                          <tr key={prod.id} className="hover:bg-slate-50/50">
                            <td className="p-3">
                              <div className="w-10 h-10 bg-slate-100 rounded border border-slate-200 flex items-center justify-center text-[7px] text-slate-400 select-none uppercase overflow-hidden font-bold">
                                {(prod.image && (prod.image.startsWith("http://") || prod.image.startsWith("https://") || prod.image.startsWith("/") || prod.image.includes("."))) ? (
                                  <img src={prod.image} alt="" className="w-full h-full object-cover rounded" />
                                ) : (
                                  <ProductMockup image={prod.image} name={prod.name} sizeClass="w-6 aspect-[9/18]" />
                                )}
                              </div>
                            </td>

                            <td className="p-3">
                              <div className="font-bold text-slate-850">{prod.name}</div>
                              <div className="text-[10px] text-slate-400 font-mono">{prod.nameEn}</div>
                            </td>

                            <td className="p-3">
                              {prod.storages && prod.storages.length > 0 ? (
                                <div className="flex flex-wrap gap-1">
                                  {prod.storages.map(st => (
                                    <span key={st} className="bg-sky-50 border border-sky-100 text-sky-700 px-1.5 py-0.5 rounded text-[10px] font-black">
                                      {st}
                                    </span>
                                  ))}
                                </div>
                              ) : (
                                <span className="text-[10px] text-slate-400">غير محدد</span>
                              )}
                            </td>

                            <td className="p-3">
                              {prod.colors && prod.colors.length > 0 ? (
                                <div className="flex flex-wrap items-center gap-1">
                                  {prod.colors.map((c, i) => (
                                    <span
                                      key={i}
                                      className="inline-block w-3.5 h-3.5 rounded-full border border-black/10 shadow-2xs"
                                      style={{ backgroundColor: c.hex }}
                                      title={c.name}
                                    />
                                  ))}
                                  <span className="text-[10px] text-slate-500 mr-1 font-bold">
                                    ({prod.colors.length} ألوان)
                                  </span>
                                </div>
                              ) : (
                                <span className="text-[10px] text-slate-400">لون افتراضي</span>
                              )}
                            </td>

                            <td className="p-3 font-semibold text-slate-700 font-mono">
                              {prod.price.toLocaleString()} د.ع
                            </td>

                            <td className="p-3 text-left space-x-1 space-x-reverse">
                              <button
                                onClick={() => handleOpenEdit(prod)}
                                className="p-1.5 text-slate-500 hover:text-accent hover:bg-slate-100 rounded-lg transition-colors cursor-pointer"
                                title="تعديل الجهاز"
                              >
                                <Edit2 className="w-3.5 h-3.5" />
                              </button>
                              <button
                                onClick={() => {
                                  if (confirm(`هل أنت متأكد من حذف الجهاز: ${prod.name}؟`)) {
                                    deleteProduct(prod.id);
                                  }
                                }}
                                className="p-1.5 text-slate-400 hover:text-rose-500 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer"
                                title="حذف الجهاز"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </td>
                          </tr>
                        ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}

          {/* TAB 3: ORDERS MANAGEMENT & PRINTING */}
          {activeTab === "orders" && (
            <div className="space-y-6">
              
              {/* Header & Actions */}
              <div className="border-b border-slate-100 pb-4 flex flex-col sm:flex-row justify-between sm:items-center gap-4">
                <div>
                  <h2 className="text-xl font-extrabold text-[#1a1a1a]">إدارة ومتابعة طلبات الشراء والتوصيل</h2>
                  <p className="text-xs text-slate-400">
                    متابعة وتحديث حالات طلبات الزبائن، والطباعة الفورية للفواتير الحرارية 80mm وبوالص الشحن الرسمية A4
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={handleOpenManualInvoice}
                    className="bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-xs px-4 py-2.5 rounded-xl shadow-sm flex items-center gap-2 transition-all cursor-pointer"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>إنشاء فاتورة مبيعات مباشرة (زبون محل)</span>
                  </button>
                </div>
              </div>

              {/* Search & Filter Bar */}
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
                
                {/* Status Chips */}
                <div className="flex gap-1.5 overflow-x-auto pb-1">
                  {(["all", "pending", "preparing", "shipping", "delivered", "cancelled"] as const).map((filter) => {
                    const count =
                      filter === "all"
                        ? orders.length
                        : orders.filter((o) => o.status === filter).length;
                    return (
                      <button
                        key={filter}
                        onClick={() => setOrderFilter(filter)}
                        className={`text-[10px] font-bold px-3 py-1.5 rounded-lg border transition-all cursor-pointer truncate flex items-center gap-1.5 ${
                          orderFilter === filter
                            ? "bg-[#1a1a1a] border-[#1a1a1a] text-white shadow-sm"
                            : "bg-white border-slate-200 text-slate-600 hover:bg-slate-50"
                        }`}
                      >
                        <span>
                          {filter === "all" && "الكل"}
                          {filter === "pending" && "جديد قيد الانتظار"}
                          {filter === "preparing" && "قيد التجهيز"}
                          {filter === "shipping" && "جاري التوصيل"}
                          {filter === "delivered" && "تم التسليم"}
                          {filter === "cancelled" && "ملغي"}
                        </span>
                        <span
                          className={`text-[9px] px-1.5 py-0.2 rounded-full font-mono font-black ${
                            orderFilter === filter
                              ? "bg-white/20 text-white"
                              : "bg-slate-100 text-slate-600"
                          }`}
                        >
                          {count}
                        </span>
                      </button>
                    );
                  })}
                </div>

                {/* Search Input */}
                <div className="relative min-w-[240px]">
                  <Search className="w-4 h-4 text-slate-400 absolute right-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    value={orderSearch}
                    onChange={(e) => setOrderSearch(e.target.value)}
                    placeholder="بحث برقم الطلب، العميل، الهاتف، أو المنتج..."
                    className="w-full text-xs pr-9 pl-4 py-2 bg-slate-50/50 border border-slate-200 rounded-xl focus:outline-none focus:border-accent focus:bg-white transition-all font-sans"
                  />
                  {orderSearch && (
                    <button
                      onClick={() => setOrderSearch("")}
                      className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                    >
                      <XCircle className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>

              </div>

              {/* Orders Table */}
              {filteredOrders.length === 0 ? (
                <div className="p-12 border border-dashed border-slate-200 rounded-2xl text-center space-y-3">
                  <div className="w-12 h-12 bg-slate-100 rounded-full flex items-center justify-center mx-auto text-slate-400">
                    <Truck className="w-6 h-6" />
                  </div>
                  <div className="text-sm font-bold text-slate-700">لا توجد طلبات شراء مطابقة للبحث أو التصفية</div>
                  <p className="text-xs text-slate-400 max-w-sm mx-auto">
                    يمكنك إنشاء فاتورة يدوية سريعة لزبائن المحل أو انتظار الطلبات الواردة من المتجر الإلكتروني.
                  </p>
                </div>
              ) : (
                <div className="overflow-x-auto border border-card-border rounded-xl shadow-xs">
                  <table className="w-full text-xs text-right">
                    <thead className="bg-slate-50 text-slate-500 font-bold border-b border-card-border">
                      <tr>
                        <th className="p-3 w-28">رقم الطلب</th>
                        <th className="p-3">بيانات الزبون</th>
                        <th className="p-3">المواد والمنتجات</th>
                        <th className="p-3 w-32">المبلغ الصافي</th>
                        <th className="p-3 w-36">حالة الطلب</th>
                        <th className="p-3 w-32 text-left">الإجراءات</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {filteredOrders.map((order) => (
                        <tr key={order.id} className="hover:bg-slate-50/50">
                          
                          {/* Order Number & Date */}
                          <td className="p-3 align-top space-y-1">
                            <span className="inline-block bg-slate-900 text-white font-mono font-bold text-[10px] px-2 py-0.5 rounded">
                              {order.orderNumber}
                            </span>
                            <div className="text-[10px] text-slate-400 font-mono">
                              {new Date(order.createdAt).toLocaleDateString("ar-IQ", {
                                month: "numeric",
                                day: "numeric",
                                hour: "2-digit",
                                minute: "2-digit",
                              })}
                            </div>
                            {order.couponCode && (
                              <span className="inline-flex items-center gap-1 text-[9px] bg-emerald-50 text-emerald-700 border border-emerald-200 px-1.5 py-0.5 rounded font-mono font-bold">
                                <TicketPercent className="w-3 h-3" />
                                {order.couponCode}
                              </span>
                            )}
                          </td>

                          {/* Customer Info */}
                          <td className="p-3 align-top space-y-0.5">
                            <strong className="text-slate-900 block text-xs">{order.customerName}</strong>
                            <div className="text-slate-500 font-mono text-[11px]" dir="ltr">
                              {order.customerPhone}
                            </div>
                            <div className="text-[10px] text-slate-400 max-w-[200px] truncate" title={order.customerAddress}>
                              📍 {order.customerAddress}
                            </div>
                          </td>

                          {/* Items List */}
                          <td className="p-3 align-top">
                            <div className="space-y-1 max-h-24 overflow-y-auto pr-1">
                              {order.items?.map((item, idx) => (
                                <div key={idx} className="text-slate-700 flex items-center justify-between gap-2 border-b border-dashed border-slate-100 pb-0.5">
                                  <span className="font-semibold text-[11px] truncate max-w-[180px]">
                                    • {item.productName}
                                    {item.selectedStorage ? ` [${item.selectedStorage}]` : ""}
                                    {item.selectedColor ? ` (${item.selectedColor.name})` : ""}
                                    {item.selectedPort ? ` (منفذ: ${item.selectedPort})` : ""}
                                  </span>
                                  <span className="font-mono text-slate-400 font-bold text-[10px] flex-shrink-0">
                                    x{item.quantity}
                                  </span>
                                </div>
                              ))}
                            </div>
                          </td>

                          {/* Price & Summary */}
                          <td className="p-3 align-top space-y-0.5 font-mono">
                            <strong className="text-slate-950 font-bold text-sm block" dir="ltr">
                              {order.totalAmount.toLocaleString()} د.ع
                            </strong>
                            <div className="text-[10px] text-slate-400">
                              توصيل: {order.shippingFee > 0 ? `${order.shippingFee.toLocaleString()} د.ع` : "مجاني"}
                            </div>
                            {order.discountAmount > 0 && (
                              <div className="text-[10px] text-emerald-600">
                                خصم: -{order.discountAmount.toLocaleString()} د.ع
                              </div>
                            )}
                          </td>

                          {/* Status Selector */}
                          <td className="p-3 align-top">
                            <select
                              value={order.status}
                              onChange={(e) => updateOrderStatus(order.id, e.target.value as OrderStatus)}
                              className={`text-[11px] font-bold px-2.5 py-1 rounded-lg border focus:outline-none cursor-pointer w-full ${
                                order.status === "pending"
                                  ? "bg-amber-50 text-amber-700 border-amber-200"
                                  : order.status === "preparing"
                                  ? "bg-blue-50 text-blue-700 border-blue-200"
                                  : order.status === "shipping"
                                  ? "bg-purple-50 text-purple-700 border-purple-200"
                                  : order.status === "delivered"
                                  ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                                  : "bg-rose-50 text-rose-700 border-rose-200"
                              }`}
                            >
                              <option value="pending">قيد الانتظار</option>
                              <option value="preparing">قيد التجهيز</option>
                              <option value="shipping">جاري التوصيل</option>
                              <option value="delivered">تم التسليم</option>
                              <option value="cancelled">ملغي</option>
                            </select>
                          </td>

                          {/* Actions */}
                          <td className="p-3 align-top text-left">
                            <div className="flex items-center justify-end gap-1.5">
                              {/* Print Invoice Button */}
                              <button
                                onClick={() => handlePrintOrder(order)}
                                className="bg-sky-50 hover:bg-sky-100 text-sky-700 border border-sky-200 font-bold px-2.5 py-1.5 rounded-lg flex items-center gap-1 transition-all cursor-pointer text-[11px]"
                                title="طباعة الفاتورة وبوليصة الشحن"
                              >
                                <Printer className="w-3.5 h-3.5" />
                                <span>طباعة</span>
                              </button>

                              {/* Delete button */}
                              <button
                                onClick={() => {
                                  if (confirm(`هل أنت متأكد من حذف الطلب رقم ${order.orderNumber}؟`)) {
                                    deleteOrder(order.id);
                                  }
                                }}
                                className="p-1.5 text-slate-400 hover:text-rose-500 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer"
                                title="حذف الطلب"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          </td>

                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}

            </div>
          )}

          {/* TAB 4: REPAIR APPOINTMENTS & INTAKE */}
          {activeTab === "repairs" && (
            <div className="space-y-6">
              
              {/* Repairs Header & Actions */}
              <div className="border-b border-slate-100 pb-4 flex flex-col sm:flex-row justify-between sm:items-center gap-4">
                <div>
                  <h2 className="text-xl font-extrabold text-[#1a1a1a]">إدارة ومتابعة صيانة الأجهزة</h2>
                  <p className="text-xs text-slate-400">متابعة مراحل الصيانة وتحديث التقارير الفنية وطباعة إيصالات الاستلام مع باركود و QR التتبع</p>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={handleOpenManualRepair}
                    className="bg-sky-600 hover:bg-sky-700 text-white font-extrabold text-xs px-4 py-2.5 rounded-xl shadow-sm flex items-center gap-2 transition-all cursor-pointer"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>إنشاء وصل صيانة مباشر (زبون محل)</span>
                  </button>
                </div>
              </div>

              {/* Filter Selector Bar */}
              <div className="flex items-center justify-between gap-3 overflow-x-auto pb-1">
                <div className="flex gap-1.5">
                  {(["all", "pending", "in-progress", "completed", "cancelled"] as const).map((filter) => (
                    <button
                      key={filter}
                      onClick={() => setRepairFilter(filter)}
                      className={`text-[10px] font-bold px-3 py-1.5 rounded-lg border transition-all cursor-pointer truncate ${repairFilter === filter
                        ? "bg-[#1a1a1a] border-[#1a1a1a] text-white"
                        : "bg-white border-slate-200 text-slate-600 hover:bg-slate-50"
                        }`}
                    >
                      {filter === "all" && "الكل"}
                      {filter === "pending" && "قيد الانتظار"}
                      {filter === "in-progress" && "قيد الصيانة"}
                      {filter === "completed" && "مكتملة"}
                      {filter === "cancelled" && "ملغاة"}
                    </button>
                  ))}
                </div>
              </div>

              {/* Table of repairs */}
              {filteredRepairs.length === 0 ? (
                <div className="p-12 border border-dashed border-slate-200 rounded-xl text-center text-slate-400 text-xs">
                  لا توجد طلبات وحجوزات صيانة مطابقة حالياً.
                </div>
              ) : (
                <div className="overflow-x-auto border border-card-border rounded-xl">
                  <table className="w-full text-xs text-right">
                    <thead className="bg-slate-50 text-slate-500 font-bold border-b border-card-border">
                      <tr>
                        <th className="p-3">كود التتبع / الإيصال</th>
                        <th className="p-3">العميل ورقم الهاتف</th>
                        <th className="p-3">الجهاز والعطل</th>
                        <th className="p-3">الكلفة والتقرير</th>
                        <th className="p-3">مرحلة الصيانة الحالية</th>
                        <th className="p-3 text-left">إجراءات التتبع والإيصال</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {filteredRepairs.map((appt) => (
                        <tr key={appt.id} className="hover:bg-slate-50/50 transition-colors">

                          {/* Tracking Code */}
                          <td className="p-3">
                            <div className="flex items-center gap-1.5">
                              <span className="font-bold text-sky-600 font-mono bg-sky-50 px-2 py-0.5 rounded border border-sky-100">
                                {appt.trackingCode || appt.id}
                              </span>
                              <button
                                onClick={() => handleCopyTrackLink(appt)}
                                className="p-1 text-slate-400 hover:text-sky-600 transition-colors"
                                title="نسخ رابط التتبع للزبون"
                              >
                                <Copy className="w-3 h-3" />
                              </button>
                            </div>
                            <div className="text-[10px] text-slate-400 font-mono mt-0.5">{appt.date}</div>
                          </td>

                          {/* Customer */}
                          <td className="p-3 space-y-0.5">
                            <div className="font-bold text-slate-800">{appt.name}</div>
                            <div className="text-[10px] text-slate-500 font-mono" dir="ltr">{appt.phone}</div>
                          </td>

                          {/* Device & Issue */}
                          <td className="p-3 space-y-0.5 max-w-[200px]">
                            <div className="font-bold text-slate-800 truncate">{appt.device}</div>
                            <div className="text-[10px] text-amber-600 font-semibold truncate" title={appt.details}>
                              {appt.issueType} {appt.details && `| ${appt.details}`}
                            </div>
                          </td>

                          {/* Cost & Notes */}
                          <td className="p-3 space-y-0.5 max-w-[170px]">
                            <div className="font-mono font-bold text-slate-800" dir="ltr">
                              {appt.cost && appt.cost > 0 ? `${appt.cost.toLocaleString()} د.ع` : "يحدد بعد الفحص"}
                            </div>
                            <div className="text-[10px] text-slate-500 truncate" title={appt.techNotes}>
                              {appt.techNotes || "لا توجد ملاحظات فنية بعد"}
                            </div>
                          </td>

                          {/* Live Status Stage Pill */}
                          <td className="p-3">
                            <select
                              value={appt.status}
                              onChange={(e) => updateAppointmentStatus(appt.id, e.target.value as Appointment["status"])}
                              className={`text-[10px] font-bold px-2.5 py-1 rounded-lg border focus:outline-none cursor-pointer ${
                                appt.status === "pending"
                                  ? "bg-amber-50 text-amber-700 border-amber-200"
                                  : appt.status === "diagnosing"
                                  ? "bg-purple-50 text-purple-700 border-purple-200"
                                  : appt.status === "in-progress"
                                  ? "bg-sky-50 text-sky-700 border-sky-200"
                                  : appt.status === "testing"
                                  ? "bg-indigo-50 text-indigo-700 border-indigo-200"
                                  : appt.status === "ready"
                                  ? "bg-emerald-100 text-emerald-800 border-emerald-300 font-black animate-pulse"
                                  : appt.status === "completed"
                                  ? "bg-slate-100 text-slate-700 border-slate-200"
                                  : "bg-rose-50 text-rose-700 border-rose-200"
                              }`}
                            >
                              <option value="pending">تم الاستلام (بانتظار الفحص)</option>
                              <option value="diagnosing">قيد التشخيص والفحص</option>
                              <option value="in-progress">قيد الصيانة والعمل</option>
                              <option value="testing">الفحص النهائي واختبار الجودة</option>
                              <option value="ready">جاهز للاستلام بالمحل</option>
                              <option value="completed">تم التسليم بنجاح</option>
                              <option value="cancelled">ملغي / تعذر الإصلاح</option>
                            </select>
                          </td>

                          {/* Action Buttons */}
                          <td className="p-3 text-left space-x-1 space-x-reverse flex items-center justify-end">

                            {/* Open Repair Detail / Tech Editor Modal */}
                            <button
                              onClick={() => handleOpenRepairModal(appt)}
                              className="p-1.5 bg-sky-50 text-sky-700 hover:bg-sky-100 rounded-lg transition-colors cursor-pointer"
                              title="تعديل تقرير الفني والكلفة وموعد الاستلام"
                            >
                              <Edit2 className="w-3.5 h-3.5" />
                            </button>

                            {/* Send WhatsApp Status to Customer */}
                            <button
                              onClick={() => handleSendRepairWhatsApp(appt)}
                              className="p-1.5 bg-emerald-50 text-emerald-600 hover:bg-emerald-100 rounded-lg transition-colors cursor-pointer"
                              title="إرسال إشعار تحديث الحالة عبر واتساب للزبون"
                            >
                              <MessageCircle className="w-3.5 h-3.5" />
                            </button>

                            {/* Copy Tracking Link */}
                            <button
                              onClick={() => handleCopyTrackLink(appt)}
                              className="p-1.5 bg-slate-100 text-slate-600 hover:bg-slate-200 rounded-lg transition-colors cursor-pointer"
                              title="نسخ رابط التتبع المباشر"
                            >
                              <Share2 className="w-3.5 h-3.5" />
                            </button>

                            {/* Print Repair Receipt with Live QR */}
                            <button
                              onClick={() => handlePrintRepair(appt)}
                              className="p-1.5 bg-slate-100 text-slate-700 hover:bg-slate-200 rounded-lg transition-colors cursor-pointer"
                              title="طباعة إيصال استلام وضمان صيانة مع كود التتبع"
                            >
                              <Printer className="w-3.5 h-3.5" />
                            </button>

                            {/* Trash: Delete Appointment */}
                            <button
                              onClick={() => deleteAppointment(appt.id)}
                              className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer"
                              title="حذف الحجز نهائياً"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}

          {/* TAB 4: SITE SETTINGS */}
          {activeTab === "settings" && (
            <div className="space-y-6">
              <div className="border-b border-slate-100 pb-4">
                <h2 className="text-xl font-extrabold text-[#1a1a1a]">إعدادات الموقع ومعلومات الاتصال</h2>
                <p className="text-xs text-slate-400">تعديل البريد الإلكتروني، رقم الهاتف، أجور التوصيل، حسابات التواصل، شريط الإعلانات، والعرض المنبثق</p>
              </div>

              <form onSubmit={handleSaveAllSettings} className="space-y-6 text-right">

                {/* Logo Section */}
                <div className="bg-slate-50/50 border border-slate-100 rounded-2xl p-5 space-y-4">
                  <h3 className="font-extrabold text-sm text-slate-800 flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-accent" />
                    شعار الموقع (Logo)
                  </h3>

                  <div className="flex flex-col sm:flex-row items-center gap-6">
                    <div className="w-32 h-32 rounded-2xl border-2 border-dashed border-slate-300 bg-white flex flex-col items-center justify-center relative overflow-hidden group">
                      {logoPreview ? (
                        <>
                          <img src={logoPreview} alt="Logo Preview" className="w-full h-full object-contain p-2" />
                          <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                            <Trash2
                              className="w-6 h-6 text-white cursor-pointer hover:text-rose-400"
                              onClick={() => {
                                setLogoPreview(null);
                                setLogoFile(null);
                                setSettingsForm({ ...settingsForm, logo: { url: "" } });
                              }}
                            />
                          </div>
                        </>
                      ) : (
                        <div className="text-center text-slate-400">
                          <Upload className="w-8 h-8 mx-auto mb-2 opacity-50" />
                          <span className="text-[10px] font-bold block">رفع الشعار</span>
                          <span className="text-[9px] font-medium block mt-1">الأبعاد المقترحة: 512x512</span>
                        </div>
                      )}
                      <input
                        type="file"
                        accept="image/png, image/jpeg, image/svg+xml, image/webp"
                        onChange={(e) => {
                          const file = e.target.files?.[0];
                          if (file) {
                            setLogoFile(file);
                            setLogoPreview(URL.createObjectURL(file));
                          }
                        }}
                        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                        title="اختر صورة للشعار"
                      />
                    </div>

                    <div className="flex-1 space-y-2 text-right">
                      <p className="text-xs font-bold text-slate-700">قم برفع شعار للموقع بدقة عالية</p>
                      <p className="text-[10px] text-slate-500 leading-relaxed">
                        يُفضل استخدام صورة بصيغة PNG بخلفية شفافة. سيظهر هذا الشعار في ترويسة الموقع بدلاً من النص الافتراضي، ليعطي مظهراً احترافياً وأنيقاً. المقاس الموصى به: 200x60 بكسل أو ما يعادله.
                      </p>
                    </div>
                  </div>
                </div>

                {/* Contact Info Section */}
                <div className="bg-slate-50/50 border border-slate-100 rounded-2xl p-5 space-y-4">
                  <h3 className="font-extrabold text-sm text-slate-800 flex items-center gap-2">
                    <Phone className="w-4 h-4 text-accent" />
                    معلومات الاتصال الأساسية
                  </h3>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* Phone Input */}
                    <div className="space-y-1">
                      <label className="text-xs font-semibold text-slate-700">رقم الهاتف (الذي يظهر للعملاء) *</label>
                      <input
                        type="text"
                        value={settingsForm.phone}
                        onChange={(e) => setSettingsForm({ ...settingsForm, phone: e.target.value })}
                        placeholder="مثال: 0773 165 0096"
                        className="w-full text-xs border border-slate-200 rounded-xl px-3 py-2.5 bg-white focus:outline-none focus:border-accent font-mono text-left"
                        dir="ltr"
                        required
                      />
                      <p className="text-[10px] text-slate-400">سيتم عرضه بتنسيق LTR تلقائياً لمنع ظهور الرقم مقلوباً.</p>
                    </div>

                    {/* Email Input */}
                    <div className="space-y-1">
                      <label className="text-xs font-semibold text-slate-700">البريد الإلكتروني *</label>
                      <input
                        type="email"
                        value={settingsForm.email}
                        onChange={(e) => setSettingsForm({ ...settingsForm, email: e.target.value })}
                        placeholder="example@domain.com"
                        className="w-full text-xs border border-slate-200 rounded-xl px-3 py-2.5 bg-white focus:outline-none focus:border-accent font-mono text-left"
                        dir="ltr"
                        required
                      />
                    </div>

                    {/* Address Input */}
                    <div className="space-y-1 md:col-span-2">
                      <label className="text-xs font-semibold text-slate-700">عنوان وموقع المركز (الذي يظهر في الفواتير وبوالص الشحن) *</label>
                      <input
                        type="text"
                        value={settingsForm.address || ""}
                        onChange={(e) => setSettingsForm({ ...settingsForm, address: e.target.value })}
                        placeholder="مثال: العراق، الناصرية، الصالحية، شارع التقاعد، قرب دائرة التقاعد"
                        className="w-full text-xs border border-slate-200 rounded-xl px-3 py-2.5 bg-white focus:outline-none focus:border-accent text-right"
                      />
                      <p className="text-[10px] text-slate-400">سيتم اعتماده كعنوان رسمي للمرسل في بوالص الشحن وفواتير الـ A5 والحرارية.</p>
                    </div>

                    {/* Shipping Fee Input */}
                    <div className="space-y-1 md:col-span-2">
                      <label className="text-xs font-semibold text-slate-700">أجور التوصيل (اكتب "مجاني" للتوصيل المجاني، أو رقماً للأجور الفعالة) *</label>
                      <input
                        type="text"
                        value={settingsForm.shippingFee}
                        onChange={(e) => setSettingsForm({ ...settingsForm, shippingFee: e.target.value })}
                        placeholder="مثال: 5000 أو مجاني"
                        className="w-full text-xs border border-slate-200 rounded-xl px-3 py-2.5 bg-white focus:outline-none focus:border-accent text-right"
                        required
                      />
                      <p className="text-[10px] text-slate-400">يمكنك كتابة رقم مثل "5000" ليتم احتسابه كـ 5,000 د.ع في الفاتورة، أو كتابة "مجاني" ليكون التوصيل مجاناً.</p>
                    </div>
                  </div>
                </div>

                {/* Partner Site Link Section */}
                <div className="bg-sky-50/50 border border-sky-100 rounded-2xl p-5 space-y-4">
                  <h3 className="font-extrabold text-sm text-slate-800 flex items-center gap-2">
                    <Monitor className="w-4 h-4 text-sky-600" />
                    ربط موقع الشريك
                  </h3>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <label className="text-xs font-semibold text-slate-700">اسم الموقع الآخر</label>
                      <input
                        type="text"
                        value={settingsForm.partnerSite.name}
                        onChange={(e) => setSettingsForm({
                          ...settingsForm,
                          partnerSite: { ...settingsForm.partnerSite, name: e.target.value }
                        })}
                        placeholder="قسم تجميعات الـ PC والشاشات"
                        className="w-full text-xs border border-slate-200 rounded-xl px-3 py-2.5 bg-white focus:outline-none focus:border-sky-500 text-right"
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="text-xs font-semibold text-slate-700">رابط الموقع الآخر (URL)</label>
                      <input
                        type="text"
                        value={settingsForm.partnerSite.url}
                        onChange={(e) => setSettingsForm({
                          ...settingsForm,
                          partnerSite: { ...settingsForm.partnerSite, url: e.target.value }
                        })}
                        placeholder="https://example.com"
                        className="w-full text-xs border border-slate-200 rounded-xl px-3 py-2.5 bg-white focus:outline-none focus:border-sky-500 font-mono text-left"
                        dir="ltr"
                      />
                      <p className="text-[10px] text-slate-400">سيظهر الزر في الشريط العلوي فقط عند إدخال رابط صحيح.</p>
                    </div>
                  </div>
                </div>

                {/* Promo Banner Section */}
                <div className="bg-slate-50/50 border border-slate-100 rounded-2xl p-5 space-y-4">
                  <div className="flex justify-between items-center border-b border-slate-200/60 pb-2">
                    <h3 className="font-extrabold text-sm text-slate-800 flex items-center gap-2">
                      <Star className="w-4 h-4 text-rose-500 fill-rose-500" />
                      قسم العروض الترويجية المميزة (Promo Banner)
                    </h3>
                    <div className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        id="promoEnabled"
                        checked={settingsForm.promoBanner?.isEnabled || false}
                        onChange={(e) => setSettingsForm({
                          ...settingsForm,
                          promoBanner: { ...settingsForm.promoBanner, isEnabled: e.target.checked }
                        })}
                        className="w-4 h-4 text-accent border-slate-300 rounded focus:ring-accent cursor-pointer"
                      />
                      <label htmlFor="promoEnabled" className="text-xs font-bold text-slate-700 cursor-pointer select-none">
                        تفعيل القسم الترويجي بالموقع
                      </label>
                    </div>
                  </div>

                  {settingsForm.promoBanner?.isEnabled && (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {/* Badge */}
                      <div className="space-y-1">
                        <label className="text-xs font-semibold text-slate-700">شارة العرض (مثال: خصم 50% أو عرض محدود) *</label>
                        <input
                          type="text"
                          value={settingsForm.promoBanner.badge}
                          onChange={(e) => setSettingsForm({
                            ...settingsForm,
                            promoBanner: { ...settingsForm.promoBanner, badge: e.target.value }
                          })}
                          placeholder="مثال: عرض صيانة خاص"
                          className="w-full text-xs border border-slate-200 rounded-xl px-3 py-2.5 bg-white focus:outline-none focus:border-accent text-right"
                          required
                        />
                      </div>

                      {/* BG Style selection */}
                      <div className="space-y-1">
                        <label className="text-xs font-semibold text-slate-700">نمط ومظهر الخلفية المميز *</label>
                        <select
                          value={settingsForm.promoBanner.bgStyle}
                          onChange={(e) => setSettingsForm({
                            ...settingsForm,
                            promoBanner: { ...settingsForm.promoBanner, bgStyle: e.target.value }
                          })}
                          className="w-full text-xs border border-slate-200 rounded-xl px-3 py-2 bg-white focus:outline-none focus:border-accent cursor-pointer"
                        >
                          <option value="glass-rose">ناري متوهج (وردي / برتقالي)</option>
                          <option value="glass-blue">تكنو حديث (أزرق / سماوي)</option>
                          <option value="glass-emerald">زمردي فاخر (أخضر / منت)</option>
                          <option value="glass-amber">ذهبي ملكي (أصفر / ذهبي)</option>
                          <option value="glass-dark">فخامة داكنة (أسود / رمادي)</option>
                        </select>
                      </div>

                      {/* Title */}
                      <div className="space-y-1 md:col-span-2">
                        <label className="text-xs font-semibold text-slate-700">عنوان العرض الرئيسي (خط عريض ملفت) *</label>
                        <input
                          type="text"
                          value={settingsForm.promoBanner.title}
                          onChange={(e) => setSettingsForm({
                            ...settingsForm,
                            promoBanner: { ...settingsForm.promoBanner, title: e.target.value }
                          })}
                          placeholder="مثال: عرض الصيانة الشامل - تصليح فوري بخصم 30%"
                          className="w-full text-xs border border-slate-200 rounded-xl px-3 py-2.5 bg-white focus:outline-none focus:border-accent text-right"
                          required
                        />
                      </div>

                      {/* Description */}
                      <div className="space-y-1 md:col-span-2">
                        <label className="text-xs font-semibold text-slate-700">وصف العرض والخدمات (التفاصيل والضمان بالتفصيل) *</label>
                        <textarea
                          value={settingsForm.promoBanner.description}
                          onChange={(e) => setSettingsForm({
                            ...settingsForm,
                            promoBanner: { ...settingsForm.promoBanner, description: e.target.value }
                          })}
                          placeholder="اكتب تفاصيل مقنعة ومبهرة لجذب الزوار..."
                          rows={3}
                          className="w-full text-xs border border-slate-200 rounded-xl px-3 py-2.5 bg-white focus:outline-none focus:border-accent text-right resize-none"
                          required
                        />
                      </div>

                      {/* Button Text */}
                      <div className="space-y-1">
                        <label className="text-xs font-semibold text-slate-700">نص زر الإجراء *</label>
                        <input
                          type="text"
                          value={settingsForm.promoBanner.buttonText}
                          onChange={(e) => setSettingsForm({
                            ...settingsForm,
                            promoBanner: { ...settingsForm.promoBanner, buttonText: e.target.value }
                          })}
                          placeholder="مثال: احجز صيانة الآن"
                          className="w-full text-xs border border-slate-200 rounded-xl px-3 py-2.5 bg-white focus:outline-none focus:border-accent text-right"
                          required
                        />
                      </div>

                      {/* Button Link */}
                      <div className="space-y-1">
                        <label className="text-xs font-semibold text-slate-700">رابط توجيه الزر (URL أو معرف قسم بالموقع كـ #repair) *</label>
                        <input
                          type="text"
                          value={settingsForm.promoBanner.buttonLink}
                          onChange={(e) => setSettingsForm({
                            ...settingsForm,
                            promoBanner: { ...settingsForm.promoBanner, buttonLink: e.target.value }
                          })}
                          placeholder="مثال: #repair أو رابط خارجي"
                          className="w-full text-xs border border-slate-200 rounded-xl px-3 py-2.5 bg-white focus:outline-none focus:border-accent text-left font-mono"
                          dir="ltr"
                          required
                        />
                      </div>
                    </div>
                  )}
                </div>

                {/* Socials Section */}
                <div className="bg-slate-50/50 border border-slate-100 rounded-2xl p-5 space-y-4">
                  <h3 className="font-extrabold text-sm text-slate-800 flex items-center gap-2">
                    <Globe className="w-4 h-4 text-accent" />
                    حسابات التواصل الاجتماعي
                  </h3>

                  {/* List of current socials */}
                  <div className="space-y-2">
                    {settingsForm.socials.length === 0 ? (
                      <div className="p-4 border border-dashed border-slate-200 rounded-xl text-center text-xs text-slate-400">
                        لم يتم إضافة أي حساب تواصل بعد.
                      </div>
                    ) : (
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                        {settingsForm.socials.map((social, index) => (
                          <div key={index} className="flex justify-between items-center bg-white border border-slate-150 p-3 rounded-xl">
                            <div className="text-right flex-1">
                              <span className="font-bold text-xs text-slate-800 block">{social.name}</span>
                              <span className="text-[10px] text-slate-400 truncate max-w-[240px] block font-mono text-left" dir="ltr">{social.url}</span>
                            </div>
                            <button
                              type="button"
                              onClick={() => handleRemoveSocial(index)}
                              className="text-xs font-bold text-rose-500 hover:text-rose-700 p-1 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer mr-2"
                            >
                              حذف
                            </button>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Add social account form block */}
                  <div className="border-t border-slate-200/60 pt-4 space-y-3">
                    <h4 className="font-bold text-xs text-slate-700">إضافة حساب تواصل جديد:</h4>
                    <div className="flex flex-col sm:flex-row gap-3 items-end">
                      <div className="flex-1 space-y-1 w-full text-right">
                        <label className="text-[11px] font-semibold text-slate-500">المنصة</label>
                        <select
                          value={newSocial.platform}
                          onChange={(e) => handlePlatformChange(e.target.value)}
                          className="w-full text-xs border border-slate-200 rounded-xl px-3 py-2 bg-white focus:outline-none focus:border-accent cursor-pointer"
                        >
                          <option value="facebook">فيسبوك (Facebook)</option>
                          <option value="instagram">إنستغرام (Instagram)</option>
                          <option value="whatsapp">واتساب (WhatsApp)</option>
                          <option value="tiktok">تيك توك (TikTok)</option>
                          <option value="telegram">تيليجرام (Telegram)</option>
                          <option value="youtube">يوتيوب (YouTube)</option>
                          <option value="custom">رابط مخصص (Custom)</option>
                        </select>
                      </div>

                      {newSocial.platform === "custom" && (
                        <div className="flex-1 space-y-1 w-full text-right">
                          <label className="text-[11px] font-semibold text-slate-500">اسم المنصة المخصصة</label>
                          <input
                            type="text"
                            value={newSocial.name}
                            onChange={(e) => setNewSocial({ ...newSocial, name: e.target.value })}
                            placeholder="مثال: لينكد إن"
                            className="w-full text-xs border border-slate-200 rounded-xl px-3 py-2 bg-white focus:outline-none focus:border-accent"
                          />
                        </div>
                      )}

                      <div className="flex-[2] space-y-1 w-full text-right">
                        <label className="text-[11px] font-semibold text-slate-500">رابط الحساب (URL) *</label>
                        <input
                          type="text"
                          value={newSocial.url}
                          onChange={(e) => setNewSocial({ ...newSocial, url: e.target.value })}
                          placeholder="https://facebook.com/rawancenter"
                          className="w-full text-xs border border-slate-200 rounded-xl px-3 py-2 bg-white focus:outline-none focus:border-accent font-mono text-left"
                          dir="ltr"
                        />
                      </div>

                      <button
                        type="button"
                        onClick={handleAddSocial}
                        className="bg-accent hover:bg-accent-hover text-white text-xs font-bold px-4 py-2 rounded-xl transition-all shadow-xs flex items-center justify-center gap-1.5 cursor-pointer h-fit w-full sm:w-auto"
                      >
                        <PlusCircle className="w-4 h-4" />
                        إضافة
                      </button>
                    </div>
                  </div>

                </div>

                {/* --- Infinite Marquee Settings Section --- */}
                <div className="bg-slate-50/50 border border-slate-100 rounded-2xl p-5 space-y-4 text-right">
                  <div className="flex justify-between items-center border-b border-slate-200/60 pb-2">
                    <h3 className="font-extrabold text-sm text-slate-800 flex items-center gap-2">
                      <Globe className="w-4 h-4 text-accent" />
                      إعدادات شريط الإعلانات المتحرك (Marquee Ticker)
                    </h3>
                    <div className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        id="marqueeEnabled"
                        checked={marqueeForm.isEnabled}
                        onChange={(e) => setMarqueeForm({ ...marqueeForm, isEnabled: e.target.checked })}
                        className="w-4 h-4 text-accent border-slate-300 rounded focus:ring-accent cursor-pointer"
                      />
                      <label htmlFor="marqueeEnabled" className="text-xs font-bold text-slate-700 cursor-pointer select-none">
                        تفعيل شريط الإعلانات أعلى الصفحة
                      </label>
                    </div>
                  </div>

                  {marqueeForm.isEnabled && (
                    <div className="space-y-4 animate-fade-in">
                      <div className="space-y-2">
                        <label className="text-xs font-semibold text-slate-700">الجمل الإعلانية الحالية:</label>
                        {marqueeForm.items.length === 0 ? (
                          <div className="p-3 border border-dashed border-slate-200 rounded-xl text-center text-xs text-slate-400">
                            لا توجد جمل إعلانية حالياً.
                          </div>
                        ) : (
                          <div className="space-y-1.5">
                            {marqueeForm.items.map((item, index) => (
                              <div key={index} className="flex justify-between items-center bg-white border border-slate-150 p-2.5 rounded-xl">
                                <span className="text-xs text-slate-700 font-medium">{item}</span>
                                <button
                                  type="button"
                                  onClick={() => handleRemoveMarqueeItem(index)}
                                  className="text-[10px] font-bold text-rose-500 hover:text-rose-700 p-1 hover:bg-rose-50 rounded"
                                >
                                  حذف
                                </button>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>

                      <div className="flex gap-2 items-end pt-2 border-t border-slate-100">
                        <div className="flex-1 space-y-1">
                          <label className="text-[10px] font-semibold text-slate-500">أضف جملة إعلانية جديدة (مع إيموجي للتجميل):</label>
                          <input
                            type="text"
                            value={newMarqueeItem}
                            onChange={(e) => setNewMarqueeItem(e.target.value)}
                            placeholder="مثال: 🚚 توصيل مجاني وسريع لكافة المحافظات"
                            className="w-full text-xs border border-slate-200 rounded-xl px-3 py-2 bg-white focus:outline-none focus:border-accent"
                          />
                        </div>
                        <button
                          type="button"
                          onClick={handleAddMarqueeItem}
                          className="bg-[#1a1a1a] hover:bg-slate-800 text-white text-xs font-bold px-4 py-2 rounded-xl transition-all h-fit cursor-pointer"
                        >
                          إضافة
                        </button>
                      </div>
                    </div>
                  )}
                </div>

                {/* --- Exit Intent / Promo Pop-Up Section --- */}
                <div className="bg-slate-50/50 border border-slate-100 rounded-2xl p-5 space-y-4 text-right">
                  <div className="flex justify-between items-center border-b border-slate-200/60 pb-2">
                    <h3 className="font-extrabold text-sm text-slate-800 flex items-center gap-2">
                      <Star className="w-4 h-4 text-rose-500 fill-rose-500" />
                      العرض المنبثق الترويجي للزوار (Promo Pop-up)
                    </h3>
                    <div className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        id="promoPopUpEnabled"
                        checked={promoPopUpForm.isEnabled}
                        onChange={(e) => setPromoPopUpForm({ ...promoPopUpForm, isEnabled: e.target.checked })}
                        className="w-4 h-4 text-accent border-slate-350 rounded focus:ring-accent cursor-pointer"
                      />
                      <label htmlFor="promoPopUpEnabled" className="text-xs font-bold text-slate-700 cursor-pointer select-none">
                        تفعيل العرض المنبثق
                      </label>
                    </div>
                  </div>

                  {promoPopUpForm.isEnabled && (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 animate-fade-in">
                      {/* Title */}
                      <div className="space-y-1">
                        <label className="text-xs font-semibold text-slate-700">عنوان العرض الرئيسي *</label>
                        <input
                          type="text"
                          value={promoPopUpForm.title}
                          onChange={(e) => setPromoPopUpForm({ ...promoPopUpForm, title: e.target.value })}
                          placeholder="مثال: خصم 10% على أول صيانة!"
                          className="w-full text-xs border border-slate-200 rounded-xl px-3 py-2.5 bg-white focus:outline-none focus:border-accent"
                          required
                        />
                      </div>

                      {/* Image URL */}
                      <div className="space-y-1">
                        <label className="text-xs font-semibold text-slate-700">رابط صورة تسويقية (اختياري)</label>
                        <input
                          type="url"
                          value={promoPopUpForm.imageUrl}
                          onChange={(e) => setPromoPopUpForm({ ...promoPopUpForm, imageUrl: e.target.value })}
                          placeholder="https://example.com/banner.png"
                          className="w-full text-xs border border-slate-200 rounded-xl px-3 py-2.5 bg-white focus:outline-none focus:border-accent font-mono text-left"
                          dir="ltr"
                        />
                      </div>

                      {/* Description */}
                      <div className="space-y-1 md:col-span-2">
                        <label className="text-xs font-semibold text-slate-700">وصف العرض والتعليمات *</label>
                        <textarea
                          value={promoPopUpForm.description}
                          onChange={(e) => setPromoPopUpForm({ ...promoPopUpForm, description: e.target.value })}
                          placeholder="اكتب تفاصيل مقنعة ومبهرة لجذب الزوار..."
                          rows={2}
                          className="w-full text-xs border border-slate-200 rounded-xl px-3 py-2.5 bg-white focus:outline-none focus:border-accent text-right resize-none"
                          required
                        />
                      </div>

                      {/* Button Text */}
                      <div className="space-y-1">
                        <label className="text-xs font-semibold text-slate-700">نص زر التوجيه *</label>
                        <input
                          type="text"
                          value={promoPopUpForm.btnText}
                          onChange={(e) => setPromoPopUpForm({ ...promoPopUpForm, btnText: e.target.value })}
                          placeholder="مثال: احجز الآن"
                          className="w-full text-xs border border-slate-200 rounded-xl px-3 py-2.5 bg-white focus:outline-none focus:border-accent"
                          required
                        />
                      </div>

                      {/* Button Link */}
                      <div className="space-y-1">
                        <label className="text-xs font-semibold text-slate-700">رابط زر التوجيه *</label>
                        <input
                          type="text"
                          value={promoPopUpForm.btnLink}
                          onChange={(e) => setPromoPopUpForm({ ...promoPopUpForm, btnLink: e.target.value })}
                          placeholder="مثال: #repair أو رابط خارجي"
                          className="w-full text-xs border border-slate-200 rounded-xl px-3 py-2.5 bg-white focus:outline-none focus:border-accent font-mono text-left"
                          dir="ltr"
                          required
                        />
                      </div>
                    </div>
                  )}
                </div>

                {/* Sticky consolidated save button bar */}
                <div className="sticky bottom-4 z-20 bg-white/85 backdrop-blur-md border border-slate-200/80 p-4 rounded-2xl shadow-lg flex flex-col sm:flex-row items-center justify-between gap-3 text-right">
                  <button
                    type="submit"
                    disabled={isSavingAllSettings}
                    className="w-full sm:w-auto bg-[#1a1a1a] hover:bg-slate-800 disabled:bg-slate-350 text-white font-extrabold text-xs px-8 py-3.5 rounded-xl transition-all shadow-md cursor-pointer hover:scale-[1.01] active:scale-[0.99] flex items-center justify-center gap-1.5"
                  >
                    {isSavingAllSettings ? "جاري حفظ الإعدادات..." : "حفظ كافة إعدادات الموقع بالكامل"}
                  </button>
                  <span className="text-xs font-bold text-slate-500">يرجى حفظ التغييرات لتطبيقها فورياً على جميع زوار المتجر</span>
                </div>

              </form>

            </div>
          )}

          {/* TAB 5: FLASH SALE MANAGEMENT */}
          {activeTab === "flash" && (
            <form onSubmit={handleSaveFlashSale} className="space-y-6 text-right" dir="rtl">
              <div className="flex flex-col gap-4 border-b border-slate-100 pb-4 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <h2 className="text-xl font-extrabold text-[#1a1a1a]">إدارة الصفقة الخاطفة</h2>
                  <p className="text-xs text-slate-400">تحكم بقسم “خصم استثنائي ومحدود” المعروض في الصفحة الرئيسية بتصميمه الجديد.</p>
                </div>

                <label className="flex cursor-pointer items-center gap-2 rounded-xl border border-red-100 bg-red-50 px-4 py-2.5 text-xs font-bold text-red-700">
                  <input
                    type="checkbox"
                    checked={flashSaleForm.isEnabled}
                    onChange={(e) => setFlashSaleForm({ ...flashSaleForm, isEnabled: e.target.checked })}
                    className="h-4 w-4 cursor-pointer rounded border-red-200 text-red-600 focus:ring-red-500"
                  />
                  تفعيل الصفقة بالصفحة الرئيسية
                </label>
              </div>

              <div className="grid gap-5 xl:grid-cols-[1fr_0.92fr]">
                <div className="space-y-4 rounded-3xl border border-slate-200 bg-slate-50 p-4 sm:p-5">
                  <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                    <div className="space-y-1 md:col-span-2">
                      <label className="text-xs font-semibold text-slate-700">المنتج المشمول في الصفقة *</label>
                      <select
                        value={flashSaleForm.productId}
                        onChange={(e) => {
                          const product = products.find((item) => item.id === e.target.value);
                          setFlashSaleForm({
                            ...flashSaleForm,
                            productId: e.target.value,
                            discountPrice: product?.discountPrice || flashSaleForm.discountPrice,
                          });
                        }}
                        className="w-full cursor-pointer rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-xs focus:border-accent focus:outline-none"
                      >
                        <option value="">اختر المنتج الذي يظهر بالصفقة</option>
                        {products.map((product) => (
                          <option key={product.id} value={product.id}>
                            {product.name} - {product.price.toLocaleString()} د.ع
                          </option>
                        ))}
                      </select>
                    </div>

                    <div className="space-y-1.5">
                      <div className="flex justify-between items-center">
                        <label className="text-xs font-semibold text-slate-700">سعر الصفقة المخفض الجديد (د.ع) *</label>
                        {selectedFlashProduct && (
                          <span className="text-[10px] text-slate-400 font-mono">
                            السعر الأصلي: {selectedFlashProduct.price.toLocaleString()} د.ع
                          </span>
                        )}
                      </div>

                      {/* Quick percentage buttons for flash sale */}
                      {selectedFlashProduct && selectedFlashProduct.price > 0 && (
                        <div className="flex flex-wrap items-center gap-1.5 p-2 bg-slate-50 border border-slate-200 rounded-xl">
                          <span className="text-[10px] font-bold text-slate-500 ml-1">حساب سريع بالنسبة:</span>
                          {[10, 15, 20, 25, 30, 40, 50, 60, 70].map((pct) => (
                            <button
                              key={pct}
                              type="button"
                              onClick={() => {
                                const newPrice = Math.round(selectedFlashProduct.price * (1 - pct / 100));
                                setFlashSaleForm({ ...flashSaleForm, discountPrice: newPrice });
                              }}
                              className="px-2 py-0.5 rounded-md bg-white border border-slate-200 hover:border-accent text-slate-700 text-[10px] font-bold transition-all shadow-2xs cursor-pointer hover:bg-slate-100"
                            >
                              -{pct}%
                            </button>
                          ))}
                        </div>
                      )}

                      <input
                        type="number"
                        value={flashSaleForm.discountPrice || ""}
                        onChange={(e) => setFlashSaleForm({ ...flashSaleForm, discountPrice: parseInt(e.target.value) || 0 })}
                        placeholder="مثال: 24000"
                        className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 font-mono text-xs focus:border-accent focus:outline-none"
                      />

                      {selectedFlashProduct && flashSaleForm.discountPrice > 0 && selectedFlashProduct.price > flashSaleForm.discountPrice && (
                        <div className="flex justify-between items-center text-[10px] font-bold text-emerald-700 bg-emerald-50 border border-emerald-100 p-2 rounded-lg">
                          <span>نسبة الخصم المحسوبة: {Math.round((1 - flashSaleForm.discountPrice / selectedFlashProduct.price) * 100)}%</span>
                          <span>توفير للزبون: {(selectedFlashProduct.price - flashSaleForm.discountPrice).toLocaleString()} د.ع</span>
                        </div>
                      )}
                    </div>

                    <div className="space-y-1">
                      <label className="text-xs font-semibold text-slate-700">تاريخ ووقت انتهاء الصفقة *</label>
                      <input
                        type="datetime-local"
                        value={flashSaleForm.endTime}
                        onChange={(e) => setFlashSaleForm({ ...flashSaleForm, endTime: e.target.value })}
                        className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-left font-mono text-xs focus:border-accent focus:outline-none"
                        dir="ltr"
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="text-xs font-semibold text-slate-700">كمية العرض الكلية *</label>
                      <input
                        type="number"
                        min={0}
                        value={flashSaleForm.initialStock || ""}
                        onChange={(e) => setFlashSaleForm({ ...flashSaleForm, initialStock: parseInt(e.target.value) || 0 })}
                        placeholder="مثال: 10"
                        className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 font-mono text-xs focus:border-accent focus:outline-none"
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="text-xs font-semibold text-slate-700">الكمية المتبقية الآن *</label>
                      <input
                        type="number"
                        min={0}
                        value={flashSaleForm.stockLimit || ""}
                        onChange={(e) => setFlashSaleForm({ ...flashSaleForm, stockLimit: parseInt(e.target.value) || 0 })}
                        placeholder="مثال: 2"
                        className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 font-mono text-xs focus:border-accent focus:outline-none"
                      />
                    </div>
                  </div>

                  <div className="rounded-2xl border border-slate-200 bg-white p-4">
                    <div className="mb-2 flex items-center justify-between text-[11px] font-black">
                      <span className="text-red-600">الكمية المتبقية: {flashSaleForm.stockLimit || 0}</span>
                      <span className="text-slate-400">من أصل {flashSaleForm.initialStock || 0}</span>
                    </div>
                    <div className="h-3 overflow-hidden rounded-full bg-slate-100">
                      <div
                        className="h-full rounded-full bg-gradient-to-l from-red-600 via-orange-400 to-sky-400 transition-all duration-300"
                        style={{ width: `${flashPreviewStockPercent}%` }}
                      />
                    </div>
                  </div>

                  <div className="flex flex-col gap-3 border-t border-slate-200 pt-4 sm:flex-row">
                    <button
                      type="button"
                      onClick={() => setFlashSaleForm({
                        isEnabled: false,
                        productId: "",
                        discountPrice: 0,
                        endTime: "",
                        stockLimit: 0,
                        initialStock: 0,
                      })}
                      className="rounded-xl border border-slate-200 bg-white px-5 py-2.5 text-xs font-bold text-slate-600 hover:bg-slate-50 cursor-pointer"
                    >
                      تفريغ الإعدادات
                    </button>
                    <button
                      type="submit"
                      className="rounded-xl bg-[#1a1a1a] px-5 py-2.5 text-xs font-bold text-white shadow-md hover:bg-slate-800 cursor-pointer"
                    >
                      حفظ الصفقة الخاطفة
                    </button>
                  </div>
                </div>

                <div className="overflow-hidden rounded-3xl border border-red-100 bg-[linear-gradient(135deg,#ffffff_0%,#fff6f6_45%,#eef8ff_100%)] p-4 shadow-sm">
                  <div className="mb-4 flex items-center justify-between gap-3">
                    <span className="inline-flex items-center gap-1.5 rounded-full border border-red-200 bg-white px-3 py-1.5 text-[10px] font-black text-red-600">
                      <Flame className="h-3.5 w-3.5 fill-red-500 text-red-500" />
                      معاينة التصميم الجديد
                    </span>
                    {flashSaleForm.isEnabled ? (
                      <span className="rounded-full bg-emerald-50 px-3 py-1 text-[10px] font-black text-emerald-700">فعال</span>
                    ) : (
                      <span className="rounded-full bg-slate-100 px-3 py-1 text-[10px] font-black text-slate-500">متوقف</span>
                    )}
                  </div>

                  {selectedFlashProduct ? (
                    <div className="space-y-4">
                      <div className="relative flex h-64 items-center justify-center rounded-[28px] border border-white bg-white/85 shadow-inner">
                        <div className="absolute bottom-5 h-12 w-[74%] rounded-[100%] bg-slate-300/40 blur-xl" />
                        <div className="absolute inset-x-8 bottom-6 h-2 rounded-full bg-gradient-to-l from-red-500 via-sky-400 to-amber-300" />
                        {selectedFlashImageIsPreset ? (
                          <div className="relative z-10 scale-[2]">
                            <ProductMockup image={selectedFlashProduct.image} name={selectedFlashProduct.name} sizeClass="w-24 aspect-[9/18]" />
                          </div>
                        ) : (
                          <img
                            src={selectedFlashProduct.image}
                            alt={selectedFlashProduct.name}
                            className="relative z-10 max-h-[88%] max-w-[88%] rounded-2xl object-contain drop-shadow-[0_22px_32px_rgba(15,23,42,0.18)]"
                          />
                        )}
                      </div>

                      <div className="rounded-2xl border border-slate-200 bg-white p-4">
                        <div className="mb-2 flex flex-wrap items-center gap-2">
                          <span className="rounded-full bg-slate-950 px-3 py-1 text-[10px] font-black text-white">{selectedFlashProduct.category}</span>
                          <span className="rounded-full bg-red-50 px-3 py-1 text-[10px] font-black text-red-600">خصم {flashPreviewDiscount}%</span>
                        </div>
                        <h3 className="truncate text-lg font-black text-slate-950">{selectedFlashProduct.name}</h3>
                        <div className="mt-3 flex items-end gap-2">
                          <span className="font-mono text-xs font-black text-slate-400 line-through">
                            {selectedFlashProduct.price.toLocaleString()} د.ع
                          </span>
                          <strong className="font-mono text-2xl font-black text-slate-950">
                            {flashPreviewPrice.toLocaleString()} د.ع
                          </strong>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="flex h-[420px] items-center justify-center rounded-3xl border border-dashed border-red-200 bg-white/70 text-center text-xs font-bold text-slate-400">
                      اختر منتجاً حتى تظهر معاينة الصفقة الجديدة هنا.
                    </div>
                  )}
                </div>
              </div>
            </form>
          )}

          {/* TAB 6: BANNER SLIDES MANAGEMENT */}
          {activeTab === "slides" && (
            <div className="space-y-6 text-right" dir="rtl">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-slate-100 pb-4">
                <div>
                  <h2 className="text-xl font-extrabold text-[#1a1a1a]">إدارة الشرائح الإعلانية (Hero Slides)</h2>
                  <p className="text-xs text-slate-400">إضافة وتعديل وحذف وترتيب الشرائح الإعلانية المعروضة في واجهة المتجر الرئيسية</p>
                </div>

                <button
                  onClick={handleOpenAddSlide}
                  className="bg-[#1a1a1a] hover:bg-slate-800 text-white text-xs font-bold px-4 py-2.5 rounded-xl transition-all shadow-md flex items-center gap-1.5 cursor-pointer"
                >
                  <Plus className="w-4 h-4" />
                  إضافة شريحة جديدة
                </button>
              </div>

              {heroSlides.length === 0 ? (
                <div className="p-12 border border-dashed border-slate-200 rounded-xl text-center text-slate-400 text-xs animate-fade-in">
                  لا توجد شرائح إعلانية مضافة حالياً. اضغط على الزر أعلاه لإضافة أول شريحة.
                </div>
              ) : (
                <div className="grid grid-cols-1 gap-4">
                  {heroSlides.map((slide, idx) => (
                    <div key={slide.id} className="border border-slate-250/50 rounded-2xl bg-white p-4 flex flex-col md:flex-row justify-between items-start md:items-center gap-4 hover:border-slate-350 hover:shadow-md transition-all duration-200">

                      {/* Left: Move and edit controls */}
                      <div className="flex items-center gap-2 w-full md:w-auto order-3 md:order-1 justify-end md:justify-start">
                        {/* Move Up */}
                        <button
                          type="button"
                          onClick={() => handleMoveSlide(idx, "up")}
                          disabled={idx === 0}
                          className="p-1.5 border border-slate-200 bg-white rounded-lg text-slate-500 hover:bg-slate-150 disabled:opacity-30 disabled:hover:bg-white cursor-pointer"
                          title="تحريك للأعلى"
                        >
                          <ArrowUp className="w-4 h-4" />
                        </button>
                        {/* Move Down */}
                        <button
                          type="button"
                          onClick={() => handleMoveSlide(idx, "down")}
                          disabled={idx === heroSlides.length - 1}
                          className="p-1.5 border border-slate-200 bg-white rounded-lg text-slate-500 hover:bg-slate-150 disabled:opacity-30 disabled:hover:bg-white cursor-pointer"
                          title="تحريك للأسفل"
                        >
                          <ArrowDown className="w-4 h-4" />
                        </button>

                        <div className="w-[1px] h-6 bg-slate-200 mx-1"></div>

                        {/* Edit */}
                        <button
                          type="button"
                          onClick={() => handleOpenEditSlide(slide)}
                          className="bg-white hover:bg-slate-100 text-slate-700 border border-slate-200 text-xs font-bold px-3 py-1.5 rounded-lg flex items-center gap-1 cursor-pointer"
                        >
                          <Edit2 className="w-3 h-3" />
                          تعديل
                        </button>

                        {/* Delete */}
                        <button
                          type="button"
                          onClick={() => handleDeleteSlide(slide.id)}
                          className="bg-rose-50 hover:bg-rose-100 text-rose-600 border border-rose-200/50 text-xs font-bold px-3 py-1.5 rounded-lg flex items-center gap-1 cursor-pointer"
                        >
                          <Trash2 className="w-3 h-3" />
                          حذف
                        </button>
                      </div>

                      {/* Center: Badge and details */}
                      <div className="flex-1 space-y-1 text-right w-full order-2 md:order-2">
                        <div className="flex items-center gap-2 justify-start flex-wrap">
                          <span className="bg-[#1a1a1a]/10 text-[#1a1a1a] text-[10px] font-extrabold px-2.5 py-0.5 rounded-full">
                            {slide.tabLabel}
                          </span>
                          {slide.badge && (
                            <span className="bg-amber-50 text-amber-700 border border-amber-200/40 text-[10px] font-semibold px-2 py-0.5 rounded-full">
                              شارة: {slide.badge}
                            </span>
                          )}
                          <span className="bg-slate-100 text-slate-650 text-[10px] font-semibold px-2 py-0.5 rounded-full">
                            الشكل: {
                              slide.graphicType === "macbook" ? "MacBook" :
                                slide.graphicType === "iphone" ? "iPhone" :
                                  slide.graphicType === "repair" ? "صيانة" :
                                    slide.graphicType === "accessories" ? "ملحقات" :
                                      slide.graphicType === "product" ? "صورة منتج" : "صورة مخصصة"
                            }
                          </span>
                          <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${slide.theme === 'dark' ? 'bg-slate-900 text-white' : 'bg-slate-100 text-slate-700'}`}>
                            السمة: {slide.theme === 'dark' ? 'داكنة' : 'فاتحة'}
                          </span>
                        </div>
                        <h3 className="font-extrabold text-sm text-slate-800 pt-1">{slide.title}</h3>
                        <p className="text-xs text-accent font-extrabold">{slide.titleAccent}</p>
                        <p className="text-[11px] text-slate-400 line-clamp-2 leading-relaxed">{slide.description}</p>
                      </div>

                      {/* Right: Background preview / graphic icon preview */}
                      <div className="w-16 h-16 rounded-xl border border-slate-200 overflow-hidden flex items-center justify-center bg-slate-100 relative shadow-inner order-1 md:order-3 flex-shrink-0">
                        {slide.graphicType === "custom" && slide.customImageUrl ? (
                          <img src={slide.customImageUrl} alt="" className="w-full h-full object-cover" />
                        ) : slide.graphicType === "product" ? (
                          (() => {
                            const product = products.find((p) => p.id === slide.productId);
                            if (product) {
                              const isPreset = ["iphone", "samsung", "cases", "headphones", "earbuds", "cable", "smartwatch", "powerbank", "screen-protector"].includes(product.image) || product.image.startsWith("charger-");
                              if (!isPreset) {
                                return <img src={product.image} alt="" className="w-full h-full object-cover" />;
                              } else {
                                return (
                                  <span className="text-xl font-bold uppercase text-slate-450">
                                    {
                                      product.image === "iphone" || product.image === "samsung" ? "📱" :
                                        product.image === "headphones" || product.image === "earbuds" ? "🎧" : "📦"
                                    }
                                  </span>
                                );
                              }
                            }
                            return <span className="text-xl font-bold uppercase text-slate-450">📦</span>;
                          })()
                        ) : (
                          <span className="text-xl font-bold uppercase text-slate-450">
                            {
                              slide.graphicType === "macbook" ? "💻" :
                                slide.graphicType === "iphone" ? "📱" :
                                  slide.graphicType === "repair" ? "🛠️" : "🎧"
                            }
                          </span>
                        )}
                        <div
                          className="absolute bottom-0 inset-x-0 h-1.5"
                          style={{
                            background: slide.bgStyle.includes("from-[")
                              ? `linear-gradient(to right, ${slide.bgStyle.split(" ")[0].replace("from-[", "").replace("]", "")}, ${slide.bgStyle.split(" ").slice(-2)[0].replace("to-[", "").replace("]", "")})`
                              : '#eee'
                          }}
                        ></div>
                      </div>

                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* TAB 6: PREMIUM SHOWCASE MANAGEMENT */}
          {activeTab === "premium" && (
            <form onSubmit={handleSavePremiumShowcase} className="space-y-6 text-right" dir="rtl">
              <div className="flex flex-col gap-4 border-b border-slate-100 pb-4 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <h2 className="text-xl font-extrabold text-[#1a1a1a]">إدارة واجهة العروض المميزة</h2>
                  <p className="text-xs text-slate-400">تحكم بالمنتج الرئيسي والمنتجات المختارة في قسم العرض الاحترافي بالصفحة الرئيسية.</p>
                </div>

                <label className="flex cursor-pointer items-center gap-2 rounded-xl border border-slate-200 bg-slate-50 px-4 py-2.5 text-xs font-bold text-slate-700">
                  <input
                    type="checkbox"
                    checked={premiumShowcaseForm.isEnabled}
                    onChange={(e) => setPremiumShowcaseForm({ ...premiumShowcaseForm, isEnabled: e.target.checked })}
                    className="h-4 w-4 cursor-pointer rounded border-slate-300 text-accent focus:ring-accent"
                  />
                  تفعيل القسم
                </label>
              </div>

              <div className="grid gap-4 lg:grid-cols-2">
                <div className="space-y-2">
                  <label className="text-xs font-semibold text-slate-700">الشارة الصغيرة</label>
                  <input
                    type="text"
                    value={premiumShowcaseForm.badge}
                    onChange={(e) => setPremiumShowcaseForm({ ...premiumShowcaseForm, badge: e.target.value })}
                    placeholder="مثال: العروض الأقوى"
                    className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-xs focus:border-accent focus:outline-none"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-semibold text-slate-700">عنوان القسم</label>
                  <input
                    type="text"
                    value={premiumShowcaseForm.title}
                    onChange={(e) => setPremiumShowcaseForm({ ...premiumShowcaseForm, title: e.target.value })}
                    placeholder="مثال: عروض الروان المميزة"
                    className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-xs focus:border-accent focus:outline-none"
                  />
                </div>

                <div className="space-y-2 lg:col-span-2">
                  <label className="text-xs font-semibold text-slate-700">الوصف المختصر</label>
                  <textarea
                    value={premiumShowcaseForm.subtitle}
                    onChange={(e) => setPremiumShowcaseForm({ ...premiumShowcaseForm, subtitle: e.target.value })}
                    rows={3}
                    placeholder="اكتب وصف تسويقي قصير يظهر تحت العنوان..."
                    className="w-full resize-none rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-xs leading-6 focus:border-accent focus:outline-none"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-semibold text-slate-700">نص زر العرض</label>
                  <input
                    type="text"
                    value={premiumShowcaseForm.ctaText}
                    onChange={(e) => setPremiumShowcaseForm({ ...premiumShowcaseForm, ctaText: e.target.value })}
                    placeholder="شاهد العرض"
                    className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-xs focus:border-accent focus:outline-none"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-semibold text-slate-700">ستايل العرض</label>
                  <select
                    value={premiumShowcaseForm.theme}
                    onChange={(e) => setPremiumShowcaseForm({ ...premiumShowcaseForm, theme: e.target.value as PremiumShowcase["theme"] })}
                    className="w-full cursor-pointer rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-xs focus:border-accent focus:outline-none"
                  >
                    <option value="titanium">Titanium Studio - فاتح وراقي</option>
                    <option value="aqua">Aqua Clean - سماوي ونظيف</option>
                    <option value="blush">Blush Offer - عرض ناعم</option>
                  </select>
                </div>

                <div className="space-y-2 lg:col-span-2">
                  <label className="text-xs font-semibold text-slate-700">أول منتج يبدأ منه الدوران</label>
                  <select
                    value={premiumShowcaseForm.heroProductId}
                    onChange={(e) => {
                      const nextHeroProductId = e.target.value;
                      setPremiumShowcaseForm((prev) => ({
                        ...prev,
                        heroProductId: nextHeroProductId,
                        productIds: nextHeroProductId && !prev.productIds.includes(nextHeroProductId)
                          ? [nextHeroProductId, ...prev.productIds]
                          : prev.productIds,
                      }));
                    }}
                    className="w-full cursor-pointer rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-xs focus:border-accent focus:outline-none"
                  >
                    <option value="">اختيار تلقائي من المنتجات المحددة</option>
                    {products.map((product) => (
                      <option key={product.id} value={product.id}>
                        {product.name} - {(product.discountPrice || product.price).toLocaleString()} د.ع
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="rounded-3xl border border-slate-200 bg-gradient-to-l from-slate-50 via-white to-sky-50 p-5">
                <div className="grid gap-4 lg:grid-cols-[1fr_260px] lg:items-center">
                  <div className="space-y-2">
                    <span className="inline-flex w-fit items-center gap-1.5 rounded-full border border-slate-200 bg-white px-3 py-1 text-[10px] font-black text-slate-700">
                      <Sparkles className="h-3.5 w-3.5 text-accent" />
                      {premiumShowcaseForm.badge || "العروض الأقوى"}
                    </span>
                    <h3 className="text-2xl font-black text-slate-950">{premiumShowcaseForm.title || "عروض الروان المميزة"}</h3>
                    <p className="text-xs font-medium leading-6 text-slate-500">{premiumShowcaseForm.subtitle || "سيظهر هنا وصف القسم في الصفحة الرئيسية."}</p>
                  </div>

                  <div className="rounded-2xl border border-white bg-white/80 p-4 shadow-sm">
                    <span className="block text-[10px] font-black text-slate-400">يبدأ العرض من</span>
                    <strong className="mt-1 block truncate text-sm font-extrabold text-slate-900">
                      {selectedPremiumHero?.name || "سيتم اختياره تلقائياً"}
                    </strong>
                    <span className="mt-2 block text-[10px] font-bold text-slate-400">
                      منتجات الدوران المختارة: {premiumShowcaseForm.productIds.length}
                    </span>
                  </div>
                </div>
              </div>

              <div className="space-y-3">
                <div className="flex flex-col gap-1 sm:flex-row sm:items-end sm:justify-between">
                  <div>
                    <h3 className="text-sm font-extrabold text-slate-900">اختر منتجات الدوران داخل القسم</h3>
                    <p className="text-[11px] text-slate-400">كل منتج تختاره يصعد للواجهة الرئيسية بالتتابع، وإذا تركتها فارغة يعرض الموقع أقوى المنتجات المخفضة.</p>
                  </div>
                  <button
                    type="button"
                    onClick={() => setPremiumShowcaseForm({ ...premiumShowcaseForm, productIds: [] })}
                    className="w-fit rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-[11px] font-bold text-slate-500 hover:bg-slate-50 cursor-pointer"
                  >
                    مسح الاختيارات
                  </button>
                </div>

                {premiumCandidateProducts.length === 0 ? (
                  <div className="rounded-2xl border border-dashed border-slate-200 p-10 text-center text-xs text-slate-400">
                    لا توجد منتجات حالياً.
                  </div>
                ) : (
                  <div className="grid max-h-[360px] gap-3 overflow-y-auto rounded-2xl border border-slate-200 bg-slate-50 p-3 md:grid-cols-2">
                    {premiumCandidateProducts.map((product) => {
                      const isSelected = premiumShowcaseForm.productIds.includes(product.id);
                      const hasDiscount = Boolean(product.discountPrice && product.discountPrice > 0 && product.discountPrice < product.price);
                      const discountPercent = hasDiscount ? Math.round((1 - ((product.discountPrice || product.price) / product.price)) * 100) : 0;

                      return (
                        <button
                          key={product.id}
                          type="button"
                          onClick={() => handleTogglePremiumProduct(product.id)}
                          className={`flex items-center gap-3 rounded-xl border p-3 text-right transition-all cursor-pointer ${isSelected
                            ? "border-accent bg-white shadow-sm ring-1 ring-accent/20"
                            : "border-slate-200 bg-white hover:border-slate-300"
                            }`}
                        >
                          <input
                            type="checkbox"
                            checked={isSelected}
                            readOnly
                            className="h-4 w-4 flex-shrink-0 rounded border-slate-300 text-accent"
                          />
                          <div className="min-w-0 flex-1">
                            <span className="block truncate text-xs font-extrabold text-slate-900">{product.name}</span>
                            <span className="mt-1 block truncate font-mono text-[10px] font-bold text-slate-400">
                              {(product.discountPrice || product.price).toLocaleString()} د.ع | {product.category}
                            </span>
                          </div>
                          {hasDiscount && (
                            <span className="rounded-full bg-rose-50 px-2 py-1 text-[10px] font-black text-rose-600">
                              خصم {discountPercent}%
                            </span>
                          )}
                        </button>
                      );
                    })}
                  </div>
                )}
              </div>

              <div className="flex flex-col gap-3 border-t border-slate-100 pt-4 sm:flex-row">
                <button
                  type="button"
                  onClick={() => setPremiumShowcaseForm(DEFAULT_PREMIUM_SHOWCASE)}
                  className="rounded-xl border border-slate-200 bg-white px-5 py-2.5 text-xs font-bold text-slate-600 hover:bg-slate-50 cursor-pointer"
                >
                  إرجاع الافتراضي
                </button>
                <button
                  type="submit"
                  className="rounded-xl bg-[#1a1a1a] px-5 py-2.5 text-xs font-bold text-white shadow-md hover:bg-slate-800 cursor-pointer"
                >
                  حفظ واجهة العروض المميزة
                </button>
              </div>
            </form>
          )}

          {/* TAB 10: GALLERY SHOWCASE MANAGEMENT */}
          {activeTab === "gallery" && (
            <form onSubmit={handleSaveGalleryShowcase} className="space-y-8 text-right" dir="rtl">
              <div className="flex flex-col gap-4 border-b border-slate-100 pb-4 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <h2 className="text-xl font-extrabold text-[#1a1a1a]">إدارة معرض الصور الأحدث (Gallery Showcase)</h2>
                  <p className="text-xs text-slate-400">تحكم بالصور المخصصة المعروضة في شريط المعرض اللانهائي المتحرك بالصفحة الرئيسية.</p>
                </div>

                <label className="flex cursor-pointer items-center gap-2 rounded-xl border border-slate-200 bg-slate-50 px-4 py-2.5 text-xs font-bold text-slate-700">
                  <input
                    type="checkbox"
                    checked={galleryShowcaseForm.isEnabled}
                    onChange={(e) => setGalleryShowcaseForm({ ...galleryShowcaseForm, isEnabled: e.target.checked })}
                    className="h-4 w-4 cursor-pointer rounded border-slate-300 text-accent focus:ring-accent"
                  />
                  تفعيل القسم بالرئيسية
                </label>
              </div>

              {/* Title & Subtitle inputs */}
              <div className="grid gap-4 lg:grid-cols-2">
                <div className="space-y-2">
                  <label className="text-xs font-semibold text-slate-700">عنوان القسم</label>
                  <input
                    type="text"
                    value={galleryShowcaseForm.title}
                    onChange={(e) => setGalleryShowcaseForm({ ...galleryShowcaseForm, title: e.target.value })}
                    placeholder="مثال: الأحدث. ألقِ نظرة على ما هو جديد الآن."
                    className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-xs focus:border-accent focus:outline-none"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-semibold text-slate-700">الوصف المختصر</label>
                  <input
                    type="text"
                    value={galleryShowcaseForm.subtitle}
                    onChange={(e) => setGalleryShowcaseForm({ ...galleryShowcaseForm, subtitle: e.target.value })}
                    placeholder="مثال: استكشف أحدث الأجهزة والملحقات المميزة المضافة حديثاً في المركز."
                    className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-xs focus:border-accent focus:outline-none"
                  />
                </div>
              </div>

              {/* Add New Gallery Item Section */}
              <div className="rounded-3xl border border-slate-200 bg-slate-50/50 p-5 space-y-4">
                <h3 className="text-sm font-extrabold text-slate-900 flex items-center gap-1">
                  <Plus className="w-4 h-4 text-sky-500" />
                  إضافة كارت جديد إلى المعرض
                </h3>

                <div className="grid gap-4 md:grid-cols-2">

                  {/* Select Associated Product */}
                  <div className="space-y-2">
                    <label className="text-xs font-semibold text-slate-700">المنتج المرتبط بالكارت</label>
                    <select
                      value={newGalleryProductId}
                      onChange={(e) => setNewGalleryProductId(e.target.value)}
                      className="w-full cursor-pointer rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-xs focus:border-accent focus:outline-none"
                    >
                      <option value="">-- اختر المنتج --</option>
                      {products.map((p) => (
                        <option key={p.id} value={p.id}>
                          {p.name} ({p.category})
                        </option>
                      ))}
                    </select>
                    <span className="block text-[10px] text-slate-400">عندما يضغط العميل على هذا الكارت، سينتقل تلقائياً لصفحة هذا المنتج.</span>
                  </div>

                  {/* Upload Custom Image File */}
                  <div className="space-y-2">
                    <label className="text-xs font-semibold text-slate-700">الصورة المخصصة للكارت (الأبعاد المفضلة 4:5)</label>

                    <div className="relative">
                      {newGalleryImagePreview ? (
                        <div className="relative w-32 aspect-[4/5] rounded-2xl border border-slate-200 overflow-hidden bg-white group">
                          <img
                            src={newGalleryImagePreview}
                            alt="Preview"
                            className="w-full h-full object-cover"
                          />
                          <button
                            type="button"
                            onClick={() => {
                              setNewGalleryImageFile(null);
                              setNewGalleryImagePreview(null);
                            }}
                            className="absolute top-1 right-1 p-1 bg-red-500 text-white rounded-full hover:bg-red-600 transition-colors shadow cursor-pointer z-10"
                            title="إزالة الصورة"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      ) : (
                        <div className="border-2 border-dashed border-slate-200 rounded-xl p-4 bg-white hover:bg-slate-50 transition-colors flex flex-col items-center justify-center cursor-pointer relative group min-h-[110px]">
                          <input
                            type="file"
                            accept="image/*"
                            onChange={(e) => {
                              const file = e.target.files?.[0];
                              if (file) {
                                setNewGalleryImageFile(file);
                                setNewGalleryImagePreview(URL.createObjectURL(file));
                              }
                            }}
                            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                          />
                          <Upload className="w-6 h-6 text-slate-400 group-hover:text-accent transition-colors mb-1" />
                          <span className="text-[10px] font-bold text-slate-500">اختر صورة مخصصة لرفعها</span>
                          <span className="text-[9px] text-slate-400 mt-0.5 block text-center leading-tight">الأبعاد المقترحة: 1080x1080</span>
                          <span className="text-[8px] text-slate-400 mt-0.5">JPG, PNG بنسبة 4:5 (مثل 800×1000)</span>
                        </div>
                      )}
                    </div>
                  </div>

                </div>

                <div className="flex justify-end pt-2">
                  <button
                    type="button"
                    onClick={handleAddGalleryItem}
                    disabled={isUploadingGalleryImage || !newGalleryProductId || !newGalleryImageFile}
                    className="rounded-xl bg-[#1a1a1a] px-5 py-2.5 text-xs font-bold text-white shadow hover:bg-slate-800 disabled:opacity-50 disabled:cursor-not-allowed transition-all cursor-pointer flex items-center gap-1.5"
                  >
                    {isUploadingGalleryImage ? (
                      <>
                        <Clock className="w-3.5 h-3.5 animate-spin" />
                        جاري رفع الصورة...
                      </>
                    ) : (
                      <>
                        <PlusCircle className="w-3.5 h-3.5" />
                        إضافة الكارت إلى قائمة المعرض
                      </>
                    )}
                  </button>
                </div>
              </div>

              {/* Configured Gallery Items Grid */}
              <div className="space-y-3">
                <h3 className="text-sm font-extrabold text-slate-900">الكروت الحالية بالمعرض ({galleryShowcaseForm.items?.length || 0})</h3>

                {(!galleryShowcaseForm.items || galleryShowcaseForm.items.length === 0) ? (
                  <div className="rounded-2xl border border-dashed border-slate-200 p-10 text-center text-xs text-slate-400 bg-slate-50/20">
                    لم تقم بإضافة أي كروت مخصصة للمعرض حالياً. قم بإضافة كروت باستخدام النموذج أعلاه.
                  </div>
                ) : (
                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
                    {galleryShowcaseForm.items.map((item) => {
                      const linkedProd = products.find(p => p.id === item.productId);
                      return (
                        <div
                          key={item.id}
                          className="relative aspect-[4/5] rounded-2xl border border-slate-200 bg-white overflow-hidden shadow-sm group hover:border-rose-300 hover:shadow-md transition-all duration-300"
                        >
                          {/* Image */}
                          <img
                            src={item.imageUrl}
                            alt="Gallery showcase card"
                            className="w-full h-full object-cover"
                          />

                          {/* Card details overlay (hover) */}
                          <div className="absolute inset-0 bg-slate-950/70 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col justify-between p-3 text-right">
                            <button
                              type="button"
                              onClick={() => handleDeleteGalleryItem(item.id, item.imageUrl)}
                              className="self-start p-1.5 bg-rose-600 hover:bg-rose-700 text-white rounded-lg transition-colors cursor-pointer"
                              title="حذف الكارت"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>

                            <div className="min-w-0">
                              <span className="block text-[8px] font-bold text-slate-400">المنتج المرتبط:</span>
                              <p className="text-[10px] font-black text-white truncate" title={linkedProd?.name}>
                                {linkedProd?.name || "منتج غير معروف"}
                              </p>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>

              {/* Form Save Button */}
              <div className="flex justify-end border-t border-slate-100 pt-4">
                <button
                  type="submit"
                  className="rounded-xl bg-[#1a1a1a] px-6 py-3 text-xs font-bold text-white shadow-md hover:bg-slate-800 transition-colors cursor-pointer"
                >
                  حفظ إعدادات معرض الصور
                </button>
              </div>
            </form>
          )}

          {/* TAB 7: PRODUCT BUNDLES MANAGEMENT */}
          {activeTab === "bundles" && (
            <div className="space-y-6 text-right" dir="rtl">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-slate-100 pb-4">
                <div>
                  <h2 className="text-xl font-extrabold text-[#1a1a1a]">إدارة حزم الصفقات الترويجية (Bundles)</h2>
                  <p className="text-xs text-slate-400">دمج وتجميع منتجات المتجر في مجموعات تسويقية واحدة بخصم خاص</p>
                </div>

                <button
                  onClick={handleOpenAddBundle}
                  className="bg-[#1a1a1a] hover:bg-slate-800 text-white text-xs font-bold px-4 py-2.5 rounded-xl transition-all shadow-md flex items-center gap-1.5 cursor-pointer"
                >
                  <Plus className="w-4 h-4" />
                  إنشاء حزمة جديدة
                </button>
              </div>

              {productBundles.length === 0 ? (
                <div className="p-12 border border-dashed border-slate-200 rounded-xl text-center text-slate-400 text-xs animate-fade-in">
                  لا توجد حزم صفقات مضافة حالياً. اضغط على الزر أعلاه لإنشاء أول حزمة ترويجية.
                </div>
              ) : (
                <div className="grid grid-cols-1 gap-4">
                  {productBundles.map((bundle) => (
                    <div key={bundle.id} className="border border-slate-200 rounded-2xl bg-white p-4 flex flex-col md:flex-row justify-between items-start md:items-center gap-4 hover:border-slate-350 hover:shadow-md transition-all duration-200">

                      {/* Left: Controls */}
                      <div className="flex items-center gap-2 w-full md:w-auto order-3 md:order-1 justify-end md:justify-start">
                        <button
                          type="button"
                          onClick={() => handleOpenEditBundle(bundle)}
                          className="bg-white hover:bg-slate-100 text-slate-700 border border-slate-200 text-xs font-bold px-3 py-1.5 rounded-lg flex items-center gap-1 cursor-pointer"
                        >
                          <Edit2 className="w-3 h-3" />
                          تعديل
                        </button>

                        <button
                          type="button"
                          onClick={() => handleDeleteBundle(bundle.id)}
                          className="bg-rose-50 hover:bg-rose-100 text-rose-600 border border-rose-200/50 text-xs font-bold px-3 py-1.5 rounded-lg flex items-center gap-1 cursor-pointer"
                        >
                          <Trash2 className="w-3 h-3" />
                          حذف
                        </button>
                      </div>

                      {/* Center: Details */}
                      <div className="flex-1 space-y-1 text-right w-full order-2 md:order-2">
                        <div className="flex items-center gap-2 justify-start flex-wrap">
                          <span className="bg-[#1a1a1a]/10 text-[#1a1a1a] text-[10px] font-extrabold px-2.5 py-0.5 rounded-full">
                            حزمة: {bundle.productIds.length} منتجات
                          </span>
                          <span className="bg-emerald-50 text-emerald-700 border border-emerald-100 text-[10px] font-semibold px-2 py-0.5 rounded-full">
                            سعر السلة: {bundle.price.toLocaleString()} د.ع
                          </span>
                        </div>
                        <h3 className="font-extrabold text-sm text-slate-800 pt-1">{bundle.title}</h3>
                        <p className="text-[11px] text-slate-400 line-clamp-2 leading-relaxed">{bundle.description}</p>
                      </div>

                      {/* Right: Color banner preview */}
                      <div className={`w-16 h-16 rounded-xl border border-white/10 overflow-hidden flex items-center justify-center bg-gradient-to-br ${bundle.bgStyle} shadow order-1 md:order-3 flex-shrink-0`}>
                        <ShoppingBag className="w-6 h-6 text-white" />
                      </div>

                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* TAB 8: COUPONS & MARKETING CAMPAIGNS */}
          {activeTab === "coupons" && (
            <div className="space-y-6 text-right" dir="rtl">

              {/* Header */}
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-slate-100 pb-4">
                <div>
                  <h2 className="text-xl font-extrabold text-[#1a1a1a]">حملات التسويق والكوبونات</h2>
                  <p className="text-xs text-slate-400">تتبع الزيارات من بطاقات الـ QR وحملات فيسبوك/تيك توك، وإنشاء خصومات مخصصة للمتجر أو الصيانة</p>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    setEditingCampaignId(null);
                    setCampaignForm({
                      name: "",
                      description: "",
                      source: "qr",
                      medium: "print",
                      campaign: "promo_2026",
                      isActive: true,
                      startsAt: "",
                      endsAt: "",
                      landingTitle: "مبروك! حصلت على هدية خاصة",
                      landingSubtitle: "عرض خاص وموثق لزبائن مركز الروان المميزين.",
                      qrNote: "امسح الرمز للحصول على العرض الفوري",
                    });
                    setIsCampaignModalOpen(true);
                  }}
                  className="bg-[#1a1a1a] hover:bg-slate-800 text-white text-xs font-bold px-4 py-2.5 rounded-xl transition-all shadow-md flex items-center gap-1.5 cursor-pointer"
                >
                  <Plus className="w-4 h-4" />
                  إنشاء حملة تسويقية جديدة
                </button>
              </div>

              {/* Top Stats Grid */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="bg-slate-50 border border-slate-100 p-4 rounded-xl">
                  <span className="block text-[10px] font-bold text-slate-400">إجمالي الحملات</span>
                  <strong className="text-xl font-mono font-black text-slate-800">{couponCampaigns.length}</strong>
                </div>
                <div className="bg-slate-50 border border-slate-100 p-4 rounded-xl">
                  <span className="block text-[10px] font-bold text-slate-400">رموز الخصم الفعالة</span>
                  <strong className="text-xl font-mono font-black text-slate-800">
                    {couponCodes.filter(c => c.isActive).length}
                  </strong>
                </div>
                <div className="bg-slate-50 border border-slate-100 p-4 rounded-xl">
                  <span className="block text-[10px] font-bold text-slate-400">إجمالي مسحات QR</span>
                  <strong className="text-xl font-mono font-black text-slate-800">
                    {couponCodes.reduce((acc, c) => acc + (c.scanCount || 0), 0)}
                  </strong>
                </div>
                <div className="bg-slate-50 border border-slate-100 p-4 rounded-xl">
                  <span className="block text-[10px] font-bold text-slate-400">مرات الاستخدام الناجحة</span>
                  <strong className="text-xl font-mono font-black text-slate-800">
                    {couponCodes.reduce((acc, c) => acc + (c.usedCount || 0), 0)}
                  </strong>
                </div>
              </div>

              {/* Content Split */}
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">

                {/* Campaigns List Column */}
                <div className="lg:col-span-5 space-y-4">
                  <h3 className="font-extrabold text-sm text-slate-850">قائمة الحملات التسويقية</h3>

                  {couponCampaigns.length === 0 ? (
                    <div className="p-8 border border-dashed border-slate-200 rounded-xl text-center text-xs text-slate-450">
                      لا توجد حملات تسويقية مضافة حالياً.
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {couponCampaigns.map((cam) => {
                        const isSelected = selectedCampaignId === cam.id;
                        const camCodes = couponCodes.filter(c => c.campaignId === cam.id);
                        return (
                          <div
                            key={cam.id}
                            onClick={() => setSelectedCampaignId(cam.id)}
                            className={`p-4 rounded-xl border transition-all cursor-pointer text-right space-y-2 relative group ${isSelected
                              ? "bg-slate-900 border-slate-900 text-white shadow-md"
                              : "bg-white border-slate-200 hover:border-slate-350"
                              }`}
                          >
                            <div className="flex justify-between items-start">
                              <h4 className="font-black text-xs sm:text-sm">{cam.name}</h4>
                              <span className={`text-[9px] font-bold px-2 py-0.5 rounded-full ${cam.isActive
                                ? isSelected ? "bg-emerald-500/20 text-emerald-300" : "bg-emerald-50 text-emerald-600"
                                : isSelected ? "bg-white/10 text-white/50" : "bg-slate-150 text-slate-400"
                                }`}>
                                {cam.isActive ? "نشط" : "متوقف"}
                              </span>
                            </div>
                            <p className={`text-[11px] leading-relaxed line-clamp-2 ${isSelected ? "text-slate-300" : "text-slate-500"
                              }`}>
                              {cam.description || "لا يوجد وصف للحملة."}
                            </p>
                            <div className="flex justify-between items-center text-[10px] border-t pt-2 mt-2 border-slate-150/10">
                              <span className={isSelected ? "text-slate-400" : "text-slate-500"}>
                                الرموز: {camCodes.length} | مسحات: {camCodes.reduce((acc, c) => acc + (c.scanCount || 0), 0)}
                              </span>

                              {/* Edit / Delete Buttons */}
                              <div className="flex gap-2">
                                <button
                                  type="button"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    setEditingCampaignId(cam.id);
                                    setCampaignForm({
                                      name: cam.name,
                                      description: cam.description,
                                      source: cam.source,
                                      medium: cam.medium,
                                      campaign: cam.campaign,
                                      isActive: cam.isActive,
                                      startsAt: cam.startsAt ? new Date(cam.startsAt).toISOString().slice(0, 16) : "",
                                      endsAt: cam.endsAt ? new Date(cam.endsAt).toISOString().slice(0, 16) : "",
                                      landingTitle: cam.landingTitle,
                                      landingSubtitle: cam.landingSubtitle,
                                      qrNote: cam.qrNote,
                                    });
                                    setIsCampaignModalOpen(true);
                                  }}
                                  className={`p-1 rounded hover:bg-white/10 ${isSelected ? "text-white" : "text-slate-500"
                                    }`}
                                  title="تعديل الحملة"
                                >
                                  <Edit2 className="w-3.5 h-3.5" />
                                </button>
                                <button
                                  type="button"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    if (confirm(`هل أنت متأكد من حذف الحملة "${cam.name}"؟ سيتم حذف جميع الأكواد المرتبطة بها.`)) {
                                      const nextCampaigns = couponCampaigns.filter(c => c.id !== cam.id);
                                      const nextCodes = couponCodes.filter(c => c.campaignId !== cam.id);
                                      updateCoupons(nextCampaigns, nextCodes);
                                      if (selectedCampaignId === cam.id) {
                                        setSelectedCampaignId(null);
                                      }
                                    }
                                  }}
                                  className={`p-1 rounded hover:bg-rose-500/10 ${isSelected ? "text-rose-300" : "text-rose-500"
                                    }`}
                                  title="حذف الحملة"
                                >
                                  <Trash2 className="w-3.5 h-3.5" />
                                </button>
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>

                {/* Codes List Column */}
                <div className="lg:col-span-7 space-y-4">
                  <div className="flex justify-between items-center">
                    <h3 className="font-extrabold text-sm text-slate-850">
                      {selectedCampaignId
                        ? `رموز الخصم للحملة: ${couponCampaigns.find(c => c.id === selectedCampaignId)?.name}`
                        : "اختر حملة تسويقية لعرض وإدارة الأكواد"}
                    </h3>
                    {selectedCampaignId && (
                      <button
                        type="button"
                        onClick={() => {
                          setCodeForm({
                            code: generateRandomCode(),
                            discountType: "fixed",
                            discountValue: 5000,
                            appliesTo: "both",
                            minOrderAmount: 0,
                            maxUses: 1,
                            isActive: true,
                            expiresAt: "",
                          });
                          setIsCodeModalOpen(true);
                        }}
                        className="bg-accent hover:bg-accent-hover text-white text-[11px] font-bold px-3.5 py-2 rounded-xl transition-all shadow-sm flex items-center gap-1 cursor-pointer"
                      >
                        <Plus className="w-3.5 h-3.5" />
                        إضافة رمز خصم جديد
                      </button>
                    )}
                  </div>

                  {!selectedCampaignId ? (
                    <div className="p-16 border border-dashed border-slate-200 bg-slate-50/50 rounded-2xl text-center text-xs text-slate-400">
                      يرجى تحديد إحدى الحملات من القائمة اليمنى لعرض أكواد الخصم التابعة لها.
                    </div>
                  ) : (
                    (() => {
                      const selectedCamCodes = couponCodes.filter(c => c.campaignId === selectedCampaignId);
                      const selectedCam = couponCampaigns.find(c => c.id === selectedCampaignId)!;
                      return (
                        <div className="space-y-4">

                          {/* QR / UTM Info Quick Card */}
                          <div className="bg-slate-50 border border-slate-200 p-4 rounded-xl text-xs space-y-2 leading-relaxed">
                            <div className="font-bold text-slate-700">تتبع UTM لروابط الحملة:</div>
                            <div className="font-mono text-slate-500 bg-white border px-3 py-1.5 rounded-lg select-all text-left truncate" dir="ltr">
                              {`${window.location.origin}/promo/` + `{الرمز}?utm_source=${selectedCam.source}&utm_medium=${selectedCam.medium}&utm_campaign=${selectedCam.campaign}`}
                            </div>
                            <div className="text-[10px] text-slate-400">
                              عند طباعة الكروت أو نشر الإعلانات، استخدم رابط صفحة الهبوط هذا. مسح الـ QR سيفتح صفحة هدية مميزة ويملأ الكوبون تلقائياً بالسلة وبالصيانة.
                            </div>
                          </div>

                          {selectedCamCodes.length === 0 ? (
                            <div className="p-12 border border-dashed border-slate-200 bg-white rounded-2xl text-center text-xs text-slate-400">
                              لا توجد رموز خصم مضافة لهذه الحملة بعد. اضغط على الزر أعلاه لإضافة كود.
                            </div>
                          ) : (
                            <div className="overflow-x-auto border border-card-border rounded-xl">
                              <table className="w-full text-xs text-right">
                                <thead className="bg-slate-50 text-slate-500 font-bold border-b border-card-border">
                                  <tr>
                                    <th className="p-3">الرمز</th>
                                    <th className="p-3">الخصم</th>
                                    <th className="p-3">يطبق على</th>
                                    <th className="p-3">الاستخدام / المسح</th>
                                    <th className="p-3">حالة الكود</th>
                                    <th className="p-3 text-left">إجراءات</th>
                                  </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-100 bg-white">
                                  {selectedCamCodes.map((c) => (
                                    <tr key={c.id} className="hover:bg-slate-50/50">
                                      <td className="p-3 font-mono font-black text-slate-900 tracking-wider">
                                        {c.code}
                                      </td>
                                      <td className="p-3 font-bold text-slate-700">
                                        {c.discountType === "percent" ? `${c.discountValue}%` : `${c.discountValue.toLocaleString()} د.ع`}
                                      </td>
                                      <td className="p-3 text-slate-500">
                                        {c.appliesTo === "store" ? "المتجر" : c.appliesTo === "repair" ? "الصيانة" : "الاثنين"}
                                      </td>
                                      <td className="p-3 text-slate-650 font-mono">
                                        استخدام: {c.usedCount || 0} / {c.maxUses > 0 ? c.maxUses : "∞"} | مسح: {c.scanCount || 0}
                                      </td>
                                      <td className="p-3">
                                        <span className={`inline-block px-2 py-0.5 rounded text-[10px] font-bold ${c.isActive ? "bg-emerald-50 text-emerald-600 border border-emerald-100" : "bg-rose-50 text-rose-600 border border-rose-100"
                                          }`}>
                                          {c.isActive ? "فعال" : "متوقف"}
                                        </span>
                                      </td>
                                      <td className="p-3 text-left flex justify-end gap-2 items-center">
                                        <button
                                          type="button"
                                          onClick={() => {
                                            const fullPromoLink = `${window.location.origin}/promo/${c.code}?utm_source=${selectedCam.source}&utm_medium=${selectedCam.medium}&utm_campaign=${selectedCam.campaign}`;
                                            navigator.clipboard.writeText(fullPromoLink);
                                            alert(`تم نسخ رابط تفعيل الكوبون للرمز ${c.code} بنجاح! يمكن استخدامه لإنشاء كود الـ QR.`);
                                          }}
                                          className="p-1.5 text-slate-500 hover:text-sky-600 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer"
                                          title="نسخ الرابط لتوليد QR"
                                        >
                                          <Copy className="w-3.5 h-3.5" />
                                        </button>
                                        <button
                                          type="button"
                                          onClick={() => {
                                            if (confirm(`هل أنت متأكد من حذف الرمز "${c.code}"؟`)) {
                                              const nextCodes = couponCodes.filter(item => item.id !== c.id);
                                              updateCoupons(couponCampaigns, nextCodes);
                                            }
                                          }}
                                          className="p-1.5 text-slate-400 hover:text-rose-500 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer"
                                          title="حذف الرمز"
                                        >
                                          <Trash2 className="w-3.5 h-3.5" />
                                        </button>
                                      </td>
                                    </tr>
                                  ))}
                                </tbody>
                              </table>
                            </div>
                          )}
                        </div>
                      );
                    })()
                  )}
                </div>
              </div>
            </div>
          )}

        </section>

      </main>

      {/* --- ADD/EDIT PRODUCT MODAL (BENTO DESIGN - FIXED SCROLL) --- */}
      {isProductModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="fixed inset-0 bg-black/40 backdrop-blur-sm" onClick={() => setIsProductModalOpen(false)} />

          <div className="relative z-50 w-full max-w-md bg-white rounded-2xl border border-card-border p-6 shadow-2xl flex flex-col max-h-[90vh] overflow-hidden gap-4">

            <div className="flex justify-between items-center border-b border-slate-100 pb-3 flex-shrink-0">
              <h3 className="font-extrabold text-base text-slate-800">
                {editingProductId ? "تعديل بيانات المنتج" : "إضافة منتج جديد للمخزن"}
              </h3>
              <button
                onClick={() => setIsProductModalOpen(false)}
                className="p-1 rounded-full hover:bg-slate-100 text-slate-400 cursor-pointer"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSaveProduct} className="space-y-4 text-right overflow-y-auto flex-1 pl-1 pr-1 py-1">

              {/* Product Name AR */}
              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-700">اسم المنتج بالعربية *</label>
                <input
                  type="text"
                  value={productForm.name}
                  onChange={(e) => setProductForm({ ...productForm, name: e.target.value })}
                  placeholder="مثال: سماعات ايربودز ماكس"
                  className="w-full text-xs border border-slate-200 rounded-xl px-3 py-2 bg-slate-50 focus:outline-none focus:border-accent"
                  required
                />
              </div>

              {/* Product Name EN */}
              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-700">اسم المنتج بالإنجليزية *</label>
                <input
                  type="text"
                  value={productForm.nameEn}
                  onChange={(e) => setProductForm({ ...productForm, nameEn: e.target.value })}
                  placeholder="مثال: AirPods Max"
                  className="w-full text-xs border border-slate-200 rounded-xl px-3 py-2 bg-slate-50 focus:outline-none focus:border-accent font-mono text-left"
                  dir="ltr"
                  required
                />
              </div>

              {/* Category & Image Type selection */}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-700">القسم</label>
                  <select
                    value={productForm.category}
                    onChange={(e) => setProductForm({ ...productForm, category: e.target.value })}
                    className="w-full text-xs border border-slate-200 rounded-xl px-3 py-2 bg-slate-50 focus:outline-none focus:border-accent cursor-pointer"
                  >
                    <option value="موبايلات">موبايلات</option>
                    <option value="كفرات">كفرات</option>
                    <option value="سماعات">سماعات</option>
                    <option value="شواحن">شواحن</option>
                    <option value="كابلات">كابلات</option>
                    <option value="ملحقات">ملحقات</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-700">نوع الصورة</label>
                  <select
                    value={productForm.imageType}
                    onChange={(e) => setProductForm({ ...productForm, imageType: e.target.value as "preset" | "url" | "upload" })}
                    className="w-full text-xs border border-slate-200 rounded-xl px-3 py-2 bg-slate-50 focus:outline-none focus:border-accent cursor-pointer"
                  >
                    <option value="preset">شكل جرافيكي افتراضي (Preset)</option>
                    <option value="url">رابط صورة مخصصة (Image URL)</option>
                    <option value="upload">رفع صورة من الجهاز (Upload File)</option>
                  </select>
                </div>
              </div>

              {/* Conditional Image Source Input */}
              {productForm.imageType === "preset" ? (
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-700">المظهر الجرافيكي (Preset)</label>
                  <select
                    value={productForm.imagePreset}
                    onChange={(e) => setProductForm({ ...productForm, imagePreset: e.target.value })}
                    className="w-full text-xs border border-slate-200 rounded-xl px-3 py-2 bg-slate-50 focus:outline-none focus:border-accent cursor-pointer"
                  >
                    <option value="iphone">iPhone Mockup (هاتف آيفون)</option>
                    <option value="samsung">Galaxy Mockup (هاتف سامسونج)</option>
                    <option value="cases">Cases Mockup (حقيبة حماية)</option>
                    <option value="charger-10w">Charger 10W (شاحن 10 واط)</option>
                    <option value="charger-15w">Charger 15W (شاحن 15 واط)</option>
                    <option value="charger-20w">Charger 20W (شاحن 20 واط)</option>
                    <option value="charger-45w">Charger 45W (شاحن 45 واط)</option>
                    <option value="charger-65w">Charger 65W (شاحن 65 واط)</option>
                    <option value="charger-120w">Charger 120W (شاحن 120 واط)</option>
                    <option value="headphones">Headphones (سماعة رأس)</option>
                    <option value="earbuds">Earbuds (سماعات أذن لاسلكية)</option>
                    <option value="cable">Cable (كابل شحن مضفر)</option>
                    <option value="smartwatch">Smartwatch (ساعة ذكية)</option>
                    <option value="powerbank">Power Bank (خازن طاقة)</option>
                    <option value="screen-protector">Screen Protector (لاصق حماية زجاجي)</option>
                  </select>
                </div>
              ) : productForm.imageType === "url" ? (
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-700">رابط الصورة المخصصة *</label>
                  <input
                    type="url"
                    value={productForm.imageUrl}
                    onChange={(e) => setProductForm({ ...productForm, imageUrl: e.target.value })}
                    placeholder="https://example.com/image.png"
                    className="w-full text-xs border border-slate-200 rounded-xl px-3 py-2 bg-slate-50 focus:outline-none focus:border-accent font-mono text-left"
                    dir="ltr"
                    required
                  />
                </div>
              ) : (
                <div className="space-y-2">
                  <label className="text-xs font-semibold text-slate-700">رفع صورة من جهازك *</label>
                  <div className="border-2 border-dashed border-slate-200 rounded-xl p-4 bg-slate-50/50 hover:bg-slate-50 transition-colors flex flex-col items-center justify-center cursor-pointer relative group">
                    <input
                      type="file"
                      accept="image/*"
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) {
                          setSelectedFile(file);
                          const reader = new FileReader();
                          reader.onloadend = () => {
                            setImagePreview(reader.result as string);
                          };
                          reader.readAsDataURL(file);
                        }
                      }}
                      className="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
                    />
                    <Upload className="w-8 h-8 text-slate-400 group-hover:text-accent transition-colors mb-2" />
                    <span className="text-xs text-slate-500 font-medium">اسحب الصورة هنا أو اضغط للتصفح</span>
                    <span className="text-[10px] text-slate-400 mt-1">يدعم PNG, JPG, WebP (سيتم تصغيرها وضغطها تلقائياً)</span>
                    <span className="text-[10px] font-bold text-slate-500 mt-0.5">الأبعاد المقترحة: 1080x1080</span>
                  </div>

                  {imagePreview && (
                    <div className="flex items-center gap-3 bg-slate-50 border border-slate-200 p-2 rounded-xl mt-2 relative">
                      <div className="w-12 h-12 rounded border border-slate-200 overflow-hidden flex-shrink-0 bg-white">
                        <img src={imagePreview} alt="Preview" className="w-full h-full object-cover" />
                      </div>
                      <div className="flex-1 text-right min-w-0">
                        <span className="block text-xs font-bold text-slate-700 truncate">
                          {selectedFile ? selectedFile.name : "الصورة الحالية للمنتج"}
                        </span>
                        <span className="block text-[10px] text-slate-400 font-mono">
                          {selectedFile ? `${(selectedFile.size / (1024 * 1024)).toFixed(2)} MB` : "رابط سحابي"}
                        </span>
                      </div>
                      <button
                        type="button"
                        onClick={() => {
                          setSelectedFile(null);
                          setImagePreview(null);
                        }}
                        className="p-1 hover:bg-rose-50 text-rose-500 rounded-lg transition-colors cursor-pointer"
                        title="إزالة الصورة"
                      >
                        ✕
                      </button>
                    </div>
                  )}
                </div>
              )}

              {/* Description */}
              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-700">وصف المنتج</label>
                <textarea
                  value={productForm.description}
                  onChange={(e) => setProductForm({ ...productForm, description: e.target.value })}
                  placeholder="اكتب وصفاً جذاباً للمنتج..."
                  rows={3}
                  className="w-full text-xs border border-slate-200 rounded-xl px-3 py-2 bg-slate-50 focus:outline-none focus:border-accent resize-none"
                />
              </div>

              {/* Specifications */}
              <div className="space-y-1">
                <div className="flex justify-between items-center">
                  <label className="text-xs font-semibold text-slate-700">المواصفات الفنية (كل ميزة في سطر منفصل)</label>
                  {productForm.category === "موبايلات" && (
                    <button
                      type="button"
                      onClick={() => {
                        setProductForm({
                          ...productForm,
                          specs: "شاشة Super Retina OLED عالية الدقة والسطوع\nمعالج رائد فائق السرعة والأداء\nنظام كاميرات احترافي متطور مع تصوير ليلي فائق\nبطارية تدوم طوال اليوم مع شحن سريع\nمقاومة للماء والغبار وضمان استبدال معتمد",
                        });
                      }}
                      className="text-[10px] text-sky-600 hover:underline font-bold"
                    >
                      + إدراج قالب مواصفات هاتف
                    </button>
                  )}
                </div>
                <textarea
                  value={productForm.specs}
                  onChange={(e) => setProductForm({ ...productForm, specs: e.target.value })}
                  placeholder="مثال:&#10;شاشة OLED فائقة الوضوح&#10;شحن سريع 45 واط&#10;كاميرا احترافية بدقة 50 ميجابكسل"
                  rows={3}
                  className="w-full text-xs border border-slate-200 rounded-xl px-3 py-2 bg-slate-50 focus:outline-none focus:border-accent resize-none font-mono"
                />
              </div>

              {/* Storage Capacities Selector (Always active for mobiles, optional for other items) */}
              <div className="space-y-2 border border-slate-200 rounded-xl p-3.5 bg-slate-50">
                <div className="flex justify-between items-center">
                  <div>
                    <label className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                      <Smartphone className="w-3.5 h-3.5 text-sky-500" />
                      خيارات الذاكرة والتخزين (128GB, 256GB, 512GB, 1TB)
                    </label>
                    <span className="text-[10px] text-slate-400 block mt-0.5">حدد السعات المتاحة ليتمكن العميل من اختيارها عند الشراء</span>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      const all = PRESET_STORAGES;
                      const allSelected = all.every((s) => productForm.storages?.includes(s));
                      setProductForm({
                        ...productForm,
                        storages: allSelected ? [] : all,
                      });
                    }}
                    className="text-[10px] text-accent hover:underline font-bold"
                  >
                    {PRESET_STORAGES.every((s) => productForm.storages?.includes(s)) ? "إلغاء الكل" : "تحديد كافة السعات"}
                  </button>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-1">
                  {PRESET_STORAGES.map((storage) => {
                    const isSelected = productForm.storages?.includes(storage) || false;
                    return (
                      <button
                        type="button"
                        key={storage}
                        onClick={() => {
                          const current = productForm.storages || [];
                          const next = isSelected ? current.filter((s) => s !== storage) : [...current, storage];
                          setProductForm({ ...productForm, storages: next });
                        }}
                        className={`py-2 px-3 rounded-xl border text-xs font-black transition-all cursor-pointer flex flex-col items-center justify-center gap-0.5 ${
                          isSelected
                            ? "bg-[#1a1a1a] text-white border-[#1a1a1a] shadow-sm scale-[1.02]"
                            : "bg-white text-slate-700 border-slate-200 hover:bg-slate-100 hover:border-slate-300"
                        }`}
                      >
                        <span>{storage}</span>
                        <span className="text-[9px] font-normal opacity-80">
                          {storage === "1TB" ? "1 تيرابايت" : `${storage.replace("GB", "")} جيجابايت`}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Price Section */}
              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-700">سعر المنتج الأصلي (بالدينار العراقي IQD) *</label>
                <input
                  type="number"
                  value={productForm.price || ""}
                  onChange={(e) => setProductForm({ ...productForm, price: parseInt(e.target.value) || 0 })}
                  placeholder="سعر المنتج الأصلي بالعراقي..."
                  className="w-full text-xs border border-slate-200 rounded-xl px-3 py-2 bg-slate-50 focus:outline-none focus:border-accent font-mono"
                  required
                />
              </div>

              {/* Discount Price or Mobile Discount Exemption Notice */}
              {productForm.category === "موبايلات" ? (
                <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl text-xs text-amber-900 flex items-start gap-2.5">
                  <AlertCircle className="w-4 h-4 text-amber-600 flex-shrink-0 mt-0.5" />
                  <div>
                    <span className="font-bold block">أجهزة الموبايل غير مشمولة بالخصومات</span>
                    <span className="text-[10px] text-amber-700 block mt-0.5">
                      تُباع كافة أجهزة الهواتف بالسعر الأصلي ولا تسري عليها أكواد أو عروض التخفيض.
                    </span>
                  </div>
                </div>
              ) : (
                <div className="space-y-2.5 border border-slate-200 rounded-xl p-3.5 bg-slate-50">
                  <div className="flex justify-between items-center">
                    <label className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                      <TicketPercent className="w-3.5 h-3.5 text-accent" />
                      تحديد الخصم للمنتج (بالنسبة المئوية أو بالسعر المباشر)
                    </label>
                    {productForm.discountPrice > 0 && (
                      <button
                        type="button"
                        onClick={() => setProductForm({ ...productForm, discountPrice: 0 })}
                        className="text-[10px] text-rose-500 hover:underline font-bold cursor-pointer"
                      >
                        إلغاء الخصم
                      </button>
                    )}
                  </div>

                  {/* Quick percentage buttons */}
                  {productForm.price > 0 && (
                    <div className="space-y-1.5 bg-white p-2.5 rounded-xl border border-slate-200">
                      <span className="text-[10px] font-bold text-slate-500 block">اختيار نسبة خصم سريعة بضغطة زر:</span>
                      <div className="flex flex-wrap gap-1.5">
                        {[5, 10, 15, 20, 25, 30, 40, 50].map((pct) => {
                          const calculatedPrice = Math.round(productForm.price * (1 - pct / 100));
                          const isSelected = productForm.discountPrice === calculatedPrice;
                          return (
                            <button
                              key={pct}
                              type="button"
                              onClick={() => setProductForm({ ...productForm, discountPrice: calculatedPrice })}
                              className={`px-2.5 py-1 rounded-lg text-[10px] font-bold border transition-all cursor-pointer ${
                                isSelected
                                  ? "bg-[#1a1a1a] text-white border-[#1a1a1a] shadow-xs"
                                  : "bg-slate-50 hover:bg-slate-100 text-slate-700 border-slate-200"
                              }`}
                            >
                              خصم {pct}%
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  )}

                  {/* Direct input and live feedback */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div className="space-y-1">
                      <label className="text-[11px] font-semibold text-slate-700">سعر العرض بعد الخصم (د.ع)</label>
                      <input
                        type="number"
                        value={productForm.discountPrice || ""}
                        onChange={(e) => setProductForm({ ...productForm, discountPrice: parseInt(e.target.value) || 0 })}
                        placeholder="اتركه فارغاً إذا لم يكن هناك خصم..."
                        className="w-full text-xs border border-slate-200 rounded-xl px-3 py-2 bg-white focus:outline-none focus:border-accent font-mono"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-[11px] font-semibold text-slate-700">أو اكتب نسبة الخصم المئوية (%)</label>
                      <div className="relative">
                        <input
                          type="number"
                          min={1}
                          max={99}
                          value={
                            productForm.price > 0 && productForm.discountPrice > 0 && productForm.discountPrice < productForm.price
                              ? Math.round((1 - productForm.discountPrice / productForm.price) * 100)
                              : ""
                          }
                          onChange={(e) => {
                            const pct = parseInt(e.target.value) || 0;
                            if (pct > 0 && pct < 100 && productForm.price > 0) {
                              setProductForm({
                                ...productForm,
                                discountPrice: Math.round(productForm.price * (1 - pct / 100)),
                              });
                            } else if (pct === 0) {
                              setProductForm({ ...productForm, discountPrice: 0 });
                            }
                          }}
                          placeholder="مثال: 15"
                          className="w-full text-xs border border-slate-200 rounded-xl px-3 py-2 bg-white focus:outline-none focus:border-accent font-mono pr-7"
                        />
                        <Percent className="w-3.5 h-3.5 text-slate-400 absolute right-2.5 top-1/2 -translate-y-1/2" />
                      </div>
                    </div>
                  </div>

                  {productForm.price > 0 && productForm.discountPrice > 0 && productForm.discountPrice < productForm.price && (
                    <div className="flex justify-between items-center text-[10px] font-bold text-emerald-800 bg-emerald-50/90 border border-emerald-200 p-2.5 rounded-xl font-mono">
                      <span>✓ نسبة الخصم: {Math.round((1 - productForm.discountPrice / productForm.price) * 100)}%</span>
                      <span>توفير للزبون: {(productForm.price - productForm.discountPrice).toLocaleString()} د.ع</span>
                      <span className="text-slate-600">يدفع الزبون: {productForm.discountPrice.toLocaleString()} د.ع</span>
                    </div>
                  )}
                </div>
              )}

              {/* Rating and Reviews Count */}
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-700">التقييم (مثال: 4.8) *</label>
                  <input
                    type="number"
                    step="0.1"
                    min="1"
                    max="5"
                    value={productForm.rating}
                    onChange={(e) => setProductForm({ ...productForm, rating: parseFloat(e.target.value) || 5 })}
                    className="w-full text-xs border border-slate-200 rounded-xl px-3 py-2 bg-slate-50 focus:outline-none focus:border-accent font-mono"
                    required
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-700">عدد التقييمات (مثال: 24) *</label>
                  <input
                    type="number"
                    min="0"
                    value={productForm.reviewsCount}
                    onChange={(e) => setProductForm({ ...productForm, reviewsCount: parseInt(e.target.value) || 0 })}
                    className="w-full text-xs border border-slate-200 rounded-xl px-3 py-2 bg-slate-50 focus:outline-none focus:border-accent font-mono"
                    required
                  />
                </div>
              </div>

              {/* Ports Selection Section (for accessories) */}
              {productForm.category !== "موبايلات" && (
                <div className="space-y-2.5 border border-slate-200 rounded-xl p-3 bg-slate-50">
                  <label className="text-xs font-bold text-slate-700 block">المنافذ المتوفرة للمنتج (Charging Ports)</label>
                  <div className="grid grid-cols-3 gap-2">
                    {[
                      { key: "مايكرو (Micro USB)", label: "مايكرو" },
                      { key: "تايب سي (Type-C)", label: "تايب سي" },
                      { key: "لايتنينغ (Lightning)", label: "لايتنينغ" }
                    ].map((portItem) => {
                      const isChecked = productForm.ports?.includes(portItem.key) || false;
                      return (
                        <label
                          key={portItem.key}
                          className={`flex items-center justify-center gap-1.5 p-2 rounded-lg border text-[11px] font-bold cursor-pointer select-none transition-all duration-200 ${isChecked
                            ? "bg-[#1a1a1a] border-[#1a1a1a] text-white shadow-xs"
                            : "bg-white border-slate-200 text-slate-600 hover:bg-slate-50"
                            }`}
                        >
                          <input
                            type="checkbox"
                            checked={isChecked}
                            onChange={(e) => {
                              const currentPorts = productForm.ports || [];
                              const updatedPorts = e.target.checked
                                ? [...currentPorts, portItem.key]
                                : currentPorts.filter((p) => p !== portItem.key);
                              setProductForm({ ...productForm, ports: updatedPorts });
                            }}
                            className="hidden"
                          />
                          <span>{portItem.label}</span>
                        </label>
                      );
                    })}
                  </div>
                  <p className="text-[9px] text-slate-400">حدد المنافذ إذا كان المنتج يحتوي على أكثر من خيار للعميل (مثل الشواحن أو الكيبلات أو السماعات).</p>
                </div>
              )}

              {/* Colors Selection Section - with Easy 1-Click Palette */}
              <div className="space-y-3 border border-slate-200 rounded-xl p-3 bg-slate-50">
                <div className="flex justify-between items-center">
                  <label className="text-xs font-bold text-slate-700">خيارات الألوان المتاحة ({productColors.length})</label>
                  {productColors.length > 0 && (
                    <button
                      type="button"
                      onClick={() => setProductColors([])}
                      className="text-[10px] text-rose-500 hover:underline font-bold cursor-pointer"
                    >
                      مسح كافة الألوان
                    </button>
                  )}
                </div>

                {/* 1-Click Quick Preset Palette */}
                <div className="p-2.5 bg-white border border-slate-200 rounded-xl space-y-2">
                  <span className="text-[10px] font-bold text-slate-600 block">ألوان جاهزة شائعة (إضافة سريعة بضغطة زر واحدة):</span>
                  <div className="flex flex-wrap gap-1.5">
                    {PRESET_PHONE_COLORS.map((preset) => {
                      const alreadyAdded = productColors.some((c) => c.name === preset.name);
                      return (
                        <button
                          key={preset.name}
                          type="button"
                          onClick={() => {
                            if (!alreadyAdded) {
                              setProductColors([
                                ...productColors,
                                { name: preset.name, hex: preset.hex, image: null, file: null },
                              ]);
                            }
                          }}
                          disabled={alreadyAdded}
                          className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[10px] font-bold border transition-all ${
                            alreadyAdded
                              ? "bg-slate-100 border-slate-200 text-slate-400 cursor-not-allowed opacity-60"
                              : "bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100 hover:border-slate-400 cursor-pointer shadow-2xs"
                          }`}
                        >
                          <span
                            className="w-2.5 h-2.5 rounded-full border border-black/15 shadow-2xs"
                            style={{ backgroundColor: preset.hex }}
                          />
                          <span>{preset.name}</span>
                          <span className="text-[9px] font-bold">{alreadyAdded ? "✓" : "+"}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Manual Custom Color Button */}
                <div className="flex justify-between items-center">
                  <button
                    type="button"
                    onClick={() => setProductColors([...productColors, { name: "", hex: "#1a1a1a", image: null, file: null }])}
                    className="text-[10px] bg-slate-800 hover:bg-black text-white px-3 py-1.5 rounded-lg font-bold transition-colors flex items-center gap-1 cursor-pointer"
                  >
                    <Plus className="w-3 h-3" />
                    إضافة لون يدوي مخصص
                  </button>
                </div>

                {productColors.length === 0 ? (
                  <p className="text-[10px] text-slate-400 text-center py-2">لا توجد ألوان مضافة لهذا المنتج بعد. اضغط على أي لون أعلاه لإضافته.</p>
                ) : (
                  <div className="space-y-2.5 max-h-48 overflow-y-auto pr-1">
                    {productColors.map((color, index) => (
                      <div key={index} className="flex items-center gap-2 bg-white p-2 bg-slate-50/50 rounded-xl border border-slate-200 shadow-xs relative">
                        {/* Color Picker */}
                        <div className="relative w-8 h-8 rounded-full border border-slate-200 overflow-hidden flex-shrink-0 cursor-pointer shadow-sm">
                          <input
                            type="color"
                            value={color.hex}
                            onChange={(e) => {
                              const updated = [...productColors];
                              updated[index].hex = e.target.value;
                              setProductColors(updated);
                            }}
                            className="absolute inset-0 opacity-0 cursor-pointer w-full h-full scale-150"
                          />
                          <div className="w-full h-full" style={{ backgroundColor: color.hex }} />
                        </div>

                        {/* Color Name */}
                        <input
                          type="text"
                          value={color.name}
                          onChange={(e) => {
                            const updated = [...productColors];
                            updated[index].name = e.target.value;
                            setProductColors(updated);
                          }}
                          placeholder="اسم اللون (مثال: أسود تيتانيوم)"
                          className="flex-1 text-[11px] border border-slate-200 rounded-lg px-2 py-1.5 focus:outline-none focus:border-accent bg-slate-50/50"
                          required
                        />

                        {/* Hex display */}
                        <span className="text-[9px] font-mono text-slate-400 uppercase select-none w-12 text-center">
                          {color.hex}
                        </span>

                        {/* Color Image Upload */}
                        <div className="relative w-8 h-8 rounded-lg border border-slate-200 flex items-center justify-center bg-slate-50 hover:bg-slate-100 transition-colors cursor-pointer overflow-hidden flex-shrink-0" title="رفع صورة مخصصة للون (1080x1080)">
                          {color.file || color.image ? (
                            <img
                              src={color.file ? URL.createObjectURL(color.file) : color.image || ""}
                              alt="Preview"
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <Upload className="w-3.5 h-3.5 text-slate-400" />
                          )}
                          <input
                            type="file"
                            accept="image/*"
                            onChange={(e) => {
                              const file = e.target.files?.[0];
                              if (file) {
                                const updated = [...productColors];
                                updated[index].file = file;
                                setProductColors(updated);
                              }
                            }}
                            className="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
                          />
                        </div>

                        {/* Remove Button */}
                        <button
                          type="button"
                          onClick={() => {
                            const updated = productColors.filter((_, i) => i !== index);
                            setProductColors(updated);
                          }}
                          className="text-rose-500 hover:bg-rose-50 p-1.5 rounded-lg transition-colors cursor-pointer"
                          title="حذف هذا اللون"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Is Popular Checkbox */}
              <div className="flex items-center gap-2 border border-slate-200 rounded-xl p-3 bg-slate-50">
                <input
                  type="checkbox"
                  id="isPopular"
                  checked={productForm.isPopular}
                  onChange={(e) => setProductForm({ ...productForm, isPopular: e.target.checked })}
                  className="w-4 h-4 text-accent border-slate-350 rounded focus:ring-accent cursor-pointer"
                />
                <label htmlFor="isPopular" className="text-xs font-semibold text-slate-700 cursor-pointer select-none">
                  عرض هذا المنتج كـ "منتج شائع" (Popular Product) في الشاشة الرئيسية
                </label>
              </div>

              {/* Is Out Of Stock Checkbox */}
              <div className="flex items-center gap-2 border border-red-100 rounded-xl p-3 bg-red-50">
                <input
                  type="checkbox"
                  id="isOutOfStock"
                  checked={productForm.isOutOfStock}
                  onChange={(e) => setProductForm({ ...productForm, isOutOfStock: e.target.checked })}
                  className="w-4 h-4 text-red-500 border-red-300 rounded focus:ring-red-500 cursor-pointer"
                />
                <label htmlFor="isOutOfStock" className="text-xs font-semibold text-red-700 cursor-pointer select-none">
                  المنتج نفذ من المخزون (لن يتمكن العميل من إضافته للسلة)
                </label>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-3 pt-3 border-t border-slate-100 flex-shrink-0">
                <button
                  type="button"
                  onClick={() => setIsProductModalOpen(false)}
                  className="flex-1 border border-slate-200 text-slate-600 font-bold py-2 rounded-xl text-xs cursor-pointer text-center"
                >
                  إلغاء
                </button>
                <button
                  type="submit"
                  disabled={isUploading}
                  className="flex-1 bg-accent hover:bg-accent-hover text-white font-bold py-2 rounded-xl text-xs shadow-md cursor-pointer text-center flex items-center justify-center gap-1.5 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isUploading ? (
                    <>
                      <span className="w-3 h-3 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                      جاري الحفظ...
                    </>
                  ) : (
                    "حفظ البيانات"
                  )}
                </button>
              </div>

            </form>
          </div>
        </div>
      )}

      {/* --- ADD/EDIT SLIDE MODAL (FIXED SCROLL) --- */}
      {isSlideModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="fixed inset-0 bg-black/40 backdrop-blur-sm" onClick={() => setIsSlideModalOpen(false)} />

          <div className="relative z-50 w-full max-w-md bg-white rounded-2xl border border-card-border p-6 shadow-2xl flex flex-col max-h-[90vh] overflow-hidden gap-4">

            <div className="flex justify-between items-center border-b border-slate-100 pb-3 flex-shrink-0">
              <h3 className="font-extrabold text-base text-slate-800">
                {editingSlideId ? "تعديل بيانات الشريحة الإعلانية" : "إضافة شريحة إعلانية جديدة"}
              </h3>
              <button
                type="button"
                onClick={() => setIsSlideModalOpen(false)}
                className="p-1 rounded-full hover:bg-slate-100 text-slate-400 cursor-pointer"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSaveSlide} className="space-y-4 text-right overflow-y-auto flex-1 pl-1 pr-1 py-1">

              {/* Tab Label */}
              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-700">اسم التبويب السفلي *</label>
                <input
                  type="text"
                  value={slideForm.tabLabel}
                  onChange={(e) => setSlideForm({ ...slideForm, tabLabel: e.target.value })}
                  placeholder="مثال: MacBook M5"
                  className="w-full text-xs border border-slate-200 rounded-xl px-3 py-2 bg-slate-50 focus:outline-none focus:border-accent"
                  required
                />
              </div>

              {/* Badge */}
              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-700">شارة العرض (Badge)</label>
                <input
                  type="text"
                  value={slideForm.badge}
                  onChange={(e) => setSlideForm({ ...slideForm, badge: e.target.value })}
                  placeholder="مثال: جديد وحصري"
                  className="w-full text-xs border border-slate-200 rounded-xl px-3 py-2 bg-slate-50 focus:outline-none focus:border-accent"
                />
              </div>

              {/* Title */}
              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-700">العنوان الرئيسي العريض *</label>
                <input
                  type="text"
                  value={slideForm.title}
                  onChange={(e) => setSlideForm({ ...slideForm, title: e.target.value })}
                  placeholder="مثال: MacBook Air M5"
                  className="w-full text-xs border border-slate-200 rounded-xl px-3 py-2 bg-slate-50 focus:outline-none focus:border-accent"
                  required
                />
              </div>

              {/* Title Accent */}
              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-700">العنوان الملون الفرعي *</label>
                <input
                  type="text"
                  value={slideForm.titleAccent}
                  onChange={(e) => setSlideForm({ ...slideForm, titleAccent: e.target.value })}
                  placeholder="مثال: بقوة شريحة M5 الثورية"
                  className="w-full text-xs border border-slate-200 rounded-xl px-3 py-2 bg-slate-50 focus:outline-none focus:border-accent"
                  required
                />
              </div>

              {/* Description */}
              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-700">الوصف الكامل للإعلان *</label>
                <textarea
                  value={slideForm.description}
                  onChange={(e) => setSlideForm({ ...slideForm, description: e.target.value })}
                  placeholder="اكتب تفاصيل مقنعة للإعلان تظهر للزوار..."
                  rows={3}
                  className="w-full text-xs border border-slate-200 rounded-xl px-3 py-2 bg-slate-50 focus:outline-none focus:border-accent resize-none"
                  required
                />
              </div>

              {/* Button Text */}
              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-700">نص الزر الإجرائي *</label>
                <input
                  type="text"
                  value={slideForm.btnText}
                  onChange={(e) => setSlideForm({ ...slideForm, btnText: e.target.value })}
                  placeholder="مثال: احجز الآن"
                  className="w-full text-xs border border-slate-200 rounded-xl px-3 py-2 bg-slate-50 focus:outline-none focus:border-accent"
                  required
                />
              </div>

              {/* Action Type & Theme */}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-700">نوع الإجراء</label>
                  <select
                    value={slideForm.actionType}
                    onChange={(e) => setSlideForm({ ...slideForm, actionType: e.target.value as "link" | "repair" })}
                    className="w-full text-xs border border-slate-200 rounded-xl px-3 py-2 bg-slate-50 focus:outline-none focus:border-accent cursor-pointer"
                  >
                    <option value="link">توجيه لرابط بالموقع (Link)</option>
                    <option value="repair">فتح نافذة حجز صيانة (Repair)</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-700">نمط السمة العامة</label>
                  <select
                    value={slideForm.theme}
                    onChange={(e) => setSlideForm({ ...slideForm, theme: e.target.value as "dark" | "light" })}
                    className="w-full text-xs border border-slate-200 rounded-xl px-3 py-2 bg-slate-50 focus:outline-none focus:border-accent cursor-pointer"
                  >
                    <option value="light">نصوص داكنة وخلفية فاتحة (Light)</option>
                    <option value="dark">نصوص بيضاء وخلفية داكنة (Dark)</option>
                  </select>
                </div>
              </div>

              {/* Button Link - only shown if actionType is link */}
              {slideForm.actionType === "link" && (
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-700">رابط الزر (#products للقسم أو URL كامل) *</label>
                  <input
                    type="text"
                    value={slideForm.btnLink}
                    onChange={(e) => setSlideForm({ ...slideForm, btnLink: e.target.value })}
                    placeholder="مثال: #products"
                    className="w-full text-xs border border-slate-200 rounded-xl px-3 py-2 bg-slate-50 focus:outline-none focus:border-accent font-mono text-left"
                    dir="ltr"
                    required
                  />
                </div>
              )}

              {/* BG style selection */}
              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-700">شكل ولون خلفية المنزلق التدرجية *</label>
                <select
                  value={slideForm.bgStyle}
                  onChange={(e) => setSlideForm({ ...slideForm, bgStyle: e.target.value })}
                  className="w-full text-xs border border-slate-200 rounded-xl px-3 py-2 bg-slate-50 focus:outline-none focus:border-accent cursor-pointer"
                >
                  <option value="from-[#F3F4F6] via-[#E5E7EB] to-[#DBEAFE] text-slate-900">فضي / رمادي (Light Theme)</option>
                  <option value="from-[#EFF6FF] via-[#E0F2FE] to-[#FEF3C7] text-slate-800">سماوي / ذهبي رقيق (Light Theme)</option>
                  <option value="from-[#111827] via-[#1F2937] to-[#030712] text-white">تيتانيوم داكن (Dark Theme)</option>
                  <option value="from-[#1E293B] via-[#0F172A] to-[#020617] text-white">أزرق داكن ليلي (Dark Theme)</option>
                  <option value="from-[#312E81] via-[#1E1B4B] to-[#090533] text-white">نيلي بنفسجي (Dark Theme)</option>
                </select>
              </div>

              {/* Graphic Type */}
              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-700">نوع الشكل التوضيحي الجانبي</label>
                <select
                  value={slideForm.graphicType}
                  onChange={(e) => setSlideForm({ ...slideForm, graphicType: e.target.value as any })}
                  className="w-full text-xs border border-slate-200 rounded-xl px-3 py-2 bg-slate-50 focus:outline-none focus:border-accent cursor-pointer"
                >
                  <option value="macbook">MacBook M5 CSS Mockup</option>
                  <option value="iphone">iPhone 16 Pro CSS Mockup</option>
                  <option value="repair">Certified Repair Floating Visual</option>
                  <option value="accessories">Premium Accessories Box Visual</option>
                  <option value="product">صورة منتج من المتجر (Product Image)</option>
                  <option value="custom">تحميل صورة خاصة بالكامل (Custom Image)</option>
                </select>
              </div>

              {/* Product selection - only shown if graphicType is product */}
              {slideForm.graphicType === "product" && (
                <div className="space-y-1 animate-fade-in">
                  <label className="text-xs font-semibold text-slate-700">اختر المنتج لعرضه في البانر *</label>
                  <select
                    value={slideForm.productId || ""}
                    onChange={(e) => setSlideForm({ ...slideForm, productId: e.target.value })}
                    className="w-full text-xs border border-slate-200 rounded-xl px-3 py-2 bg-slate-50 focus:outline-none focus:border-accent cursor-pointer"
                    required
                  >
                    <option value="">-- اختر المنتج من المخزن --</option>
                    {products.map((p) => (
                      <option key={p.id} value={p.id}>
                        {p.name} ({p.nameEn})
                      </option>
                    ))}
                  </select>
                </div>
              )}

              {/* Custom Image Upload / URL - only shown if graphicType is custom */}
              {slideForm.graphicType === "custom" && (
                <div className="space-y-3 pt-1 border-t border-slate-100">
                  <div className="grid grid-cols-2 gap-4 items-end">
                    <div className="space-y-1 col-span-2">
                      <label className="text-xs font-semibold text-slate-700">رابط صورة مباشرة (اختياري)</label>
                      <input
                        type="url"
                        value={slideForm.customImageUrl}
                        onChange={(e) => setSlideForm({ ...slideForm, customImageUrl: e.target.value })}
                        placeholder="https://example.com/slide-banner.png"
                        className="w-full text-xs border border-slate-200 rounded-xl px-3 py-2 bg-slate-50 focus:outline-none focus:border-accent font-mono text-left"
                        dir="ltr"
                      />
                    </div>
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs font-semibold text-slate-700">أو رفع صورة من جهازك</label>
                    <div className="border-2 border-dashed border-slate-200 rounded-xl p-3 bg-slate-50/50 hover:bg-slate-50 transition-colors flex flex-col items-center justify-center cursor-pointer relative group">
                      <input
                        type="file"
                        accept="image/*"
                        onChange={(e) => {
                          const file = e.target.files?.[0];
                          if (file) {
                            setSelectedSlideFile(file);
                            const reader = new FileReader();
                            reader.onloadend = () => {
                              setSlideImagePreview(reader.result as string);
                            };
                            reader.readAsDataURL(file);
                          }
                        }}
                        className="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
                      />
                      <Upload className="w-6 h-6 text-slate-400 group-hover:text-accent transition-colors mb-1" />
                      <span className="text-[11px] text-slate-500 font-medium">اختر ملف صورة من جهازك</span>
                      <span className="text-[9px] text-slate-400 mt-0.5 block text-center leading-tight">الأبعاد المقترحة: 1080x1080 (بخلفية شفافة)</span>
                    </div>

                    {slideImagePreview && (
                      <div className="flex items-center gap-3 bg-slate-50 border border-slate-200 p-2 rounded-xl mt-2 relative">
                        <div className="w-12 h-12 rounded border border-slate-200 overflow-hidden flex-shrink-0 bg-white">
                          <img src={slideImagePreview} alt="Preview" className="w-full h-full object-cover" />
                        </div>
                        <div className="flex-1 text-right min-w-0">
                          <span className="block text-xs font-bold text-slate-700 truncate">
                            {selectedSlideFile ? selectedSlideFile.name : "الصورة المخصصة الحالية"}
                          </span>
                        </div>
                        <button
                          type="button"
                          onClick={() => {
                            setSelectedSlideFile(null);
                            setSlideImagePreview(null);
                          }}
                          className="p-1 hover:bg-rose-50 text-rose-500 rounded-lg transition-colors cursor-pointer"
                        >
                          ✕
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Action Buttons */}
              <div className="flex gap-3 pt-3 border-t border-slate-100 flex-shrink-0">
                <button
                  type="button"
                  onClick={() => setIsSlideModalOpen(false)}
                  className="flex-1 border border-slate-200 text-slate-600 font-bold py-2 rounded-xl text-xs cursor-pointer text-center"
                >
                  إلغاء
                </button>
                <button
                  type="submit"
                  disabled={isUploadingSlide}
                  className="flex-1 bg-accent hover:bg-accent-hover text-white font-bold py-2 rounded-xl text-xs shadow-md cursor-pointer text-center flex items-center justify-center gap-1.5 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isUploadingSlide ? (
                    <>
                      <span className="w-3 h-3 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                      جاري الرفع...
                    </>
                  ) : (
                    "حفظ الشريحة"
                  )}
                </button>
              </div>

            </form>
          </div>
        </div>
      )}

      {/* --- ADD/EDIT CAMPAIGN MODAL (CMS) --- */}
      {isCampaignModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="fixed inset-0 bg-black/40 backdrop-blur-sm" onClick={() => setIsCampaignModalOpen(false)} />

          <div className="relative z-50 w-full max-w-md bg-white rounded-2xl border border-card-border p-6 shadow-2xl flex flex-col max-h-[90vh] overflow-hidden gap-4" dir="rtl">

            <div className="flex justify-between items-center border-b border-slate-100 pb-3 flex-shrink-0">
              <h3 className="font-extrabold text-base text-slate-800">
                {editingCampaignId ? "تعديل تفاصيل الحملة التسويقية" : "إنشاء حملة تسويقية جديدة"}
              </h3>
              <button
                type="button"
                onClick={() => setIsCampaignModalOpen(false)}
                className="p-1 rounded-full hover:bg-slate-100 text-slate-400 cursor-pointer"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSaveCampaign} className="space-y-4 text-right overflow-y-auto flex-1 pl-1 pr-1 py-1 animate-fade-in">

              {/* Name */}
              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-700">اسم الحملة *</label>
                <input
                  type="text"
                  value={campaignForm.name}
                  onChange={(e) => setCampaignForm({ ...campaignForm, name: e.target.value })}
                  placeholder="مثال: حملة افتتاح المتجر"
                  className="w-full text-xs border border-slate-200 rounded-xl px-3 py-2 bg-slate-50 focus:outline-none focus:border-accent"
                  required
                />
              </div>

              {/* Description */}
              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-700">الوصف التسويقي للحملة</label>
                <textarea
                  value={campaignForm.description}
                  onChange={(e) => setCampaignForm({ ...campaignForm, description: e.target.value })}
                  placeholder="وصف تفصيلي للحملة وأماكن توزيع الكروت..."
                  rows={2}
                  className="w-full text-xs border border-slate-200 rounded-xl px-3 py-2 bg-slate-50 focus:outline-none focus:border-accent resize-none"
                />
              </div>

              {/* UTM Parameters Grid */}
              <div className="bg-slate-50 p-3 rounded-xl border border-slate-200 space-y-3">
                <div className="font-bold text-[11px] text-slate-700">معلمات التتبع UTM (لربط التحليلات):</div>
                <div className="grid grid-cols-3 gap-2">
                  <div className="space-y-1">
                    <label className="text-[10px] text-slate-500 block">المصدر (Source) *</label>
                    <input
                      type="text"
                      value={campaignForm.source}
                      onChange={(e) => setCampaignForm({ ...campaignForm, source: e.target.value })}
                      placeholder="qr, facebook"
                      className="w-full text-[10px] font-mono text-left border border-slate-200 rounded-lg px-2 py-1.5 bg-white focus:outline-none"
                      required
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] text-slate-500 block">الوسيط (Medium) *</label>
                    <input
                      type="text"
                      value={campaignForm.medium}
                      onChange={(e) => setCampaignForm({ ...campaignForm, medium: e.target.value })}
                      placeholder="print, social"
                      className="w-full text-[10px] font-mono text-left border border-slate-200 rounded-lg px-2 py-1.5 bg-white focus:outline-none"
                      required
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] text-slate-500 block">الحملة (Campaign) *</label>
                    <input
                      type="text"
                      value={campaignForm.campaign}
                      onChange={(e) => setCampaignForm({ ...campaignForm, campaign: e.target.value })}
                      placeholder="promo_22"
                      className="w-full text-[10px] font-mono text-left border border-slate-200 rounded-lg px-2 py-1.5 bg-white focus:outline-none"
                      required
                    />
                  </div>
                </div>
              </div>

              {/* Landing Page Custom Text */}
              <div className="bg-sky-50/50 p-3 rounded-xl border border-sky-100 space-y-3">
                <div className="font-bold text-[11px] text-sky-800">نصوص صفحة الهبوط الترويجية للـ QR:</div>
                <div className="space-y-2">
                  <div className="space-y-1">
                    <label className="text-[10px] text-slate-500 block">عنوان الصفحة الرئيسي *</label>
                    <input
                      type="text"
                      value={campaignForm.landingTitle}
                      onChange={(e) => setCampaignForm({ ...campaignForm, landingTitle: e.target.value })}
                      placeholder="مبروك! حصلت على هدية خاصة"
                      className="w-full text-xs border border-slate-200 rounded-lg px-2.5 py-1.5 bg-white focus:outline-none"
                      required
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] text-slate-500 block">عنوان الصفحة الفرعي *</label>
                    <input
                      type="text"
                      value={campaignForm.landingSubtitle}
                      onChange={(e) => setCampaignForm({ ...campaignForm, landingSubtitle: e.target.value })}
                      placeholder="اضغط على الزر لتفعيل الخصم في حسابك..."
                      className="w-full text-xs border border-slate-200 rounded-lg px-2.5 py-1.5 bg-white focus:outline-none"
                      required
                    />
                  </div>
                </div>
              </div>

              {/* Dates */}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-700">تاريخ البدء</label>
                  <input
                    type="datetime-local"
                    value={campaignForm.startsAt}
                    onChange={(e) => setCampaignForm({ ...campaignForm, startsAt: e.target.value })}
                    className="w-full text-xs border border-slate-200 rounded-xl px-3 py-2 bg-slate-50 focus:outline-none font-mono text-left"
                    dir="ltr"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-700">تاريخ الانتهاء</label>
                  <input
                    type="datetime-local"
                    value={campaignForm.endsAt}
                    onChange={(e) => setCampaignForm({ ...campaignForm, endsAt: e.target.value })}
                    className="w-full text-xs border border-slate-200 rounded-xl px-3 py-2 bg-slate-50 focus:outline-none font-mono text-left"
                    dir="ltr"
                  />
                </div>
              </div>

              {/* Active Toggle */}
              <label className="flex cursor-pointer items-center gap-2 rounded-xl border border-slate-200 bg-slate-50 px-4 py-2.5 text-xs font-bold text-slate-700 select-none">
                <input
                  type="checkbox"
                  checked={campaignForm.isActive}
                  onChange={(e) => setCampaignForm({ ...campaignForm, isActive: e.target.checked })}
                  className="h-4 w-4 cursor-pointer rounded border-slate-350 text-accent focus:ring-accent"
                />
                تفعيل الحملة وتنشيط صفحاتها الترويجية فوراً
              </label>

              {/* Action Buttons */}
              <div className="flex gap-3 pt-3 border-t border-slate-100 flex-shrink-0">
                <button
                  type="button"
                  onClick={() => setIsCampaignModalOpen(false)}
                  className="flex-1 border border-slate-200 text-slate-600 font-bold py-2 rounded-xl text-xs cursor-pointer text-center"
                >
                  إلغاء
                </button>
                <button
                  type="submit"
                  className="flex-1 bg-[#1a1a1a] hover:bg-slate-855 text-white font-bold py-2 rounded-xl text-xs shadow-md cursor-pointer text-center"
                >
                  حفظ الحملة
                </button>
              </div>

            </form>
          </div>
        </div>
      )}

      {/* --- ADD COUPON CODE MODAL (SINGLE GENERATOR) --- */}
      {isCodeModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="fixed inset-0 bg-black/40 backdrop-blur-sm" onClick={() => setIsCodeModalOpen(false)} />

          <div className="relative z-50 w-full max-w-md bg-white rounded-2xl border border-card-border p-6 shadow-2xl flex flex-col max-h-[90vh] overflow-hidden gap-4" dir="rtl">

            <div className="flex justify-between items-center border-b border-slate-100 pb-3 flex-shrink-0">
              <h3 className="font-extrabold text-base text-slate-800">
                إضافة رمز خصم جديد للحملة
              </h3>
              <button
                type="button"
                onClick={() => setIsCodeModalOpen(false)}
                className="p-1 rounded-full hover:bg-slate-100 text-slate-400 cursor-pointer"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSaveCode} className="space-y-4 text-right overflow-y-auto flex-1 pl-1 pr-1 py-1 animate-fade-in">

              {/* Code */}
              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-700 flex justify-between items-center">
                  <span>رمز الخصم (الكوبون) *</span>
                  <button
                    type="button"
                    onClick={() => setCodeForm({ ...codeForm, code: generateRandomCode() })}
                    className="text-[10px] text-accent hover:underline font-bold"
                  >
                    توليد رمز عشوائي
                  </button>
                </label>
                <input
                  type="text"
                  value={codeForm.code}
                  onChange={(e) => setCodeForm({ ...codeForm, code: e.target.value.toUpperCase() })}
                  placeholder="مثال: RWAN-A7K2"
                  className="w-full text-xs font-mono text-left border border-slate-200 rounded-xl px-3 py-2 bg-slate-50 focus:outline-none focus:border-accent tracking-widest uppercase font-black"
                  dir="ltr"
                  required
                />
              </div>

              {/* Discount Type Selector Cards */}
              <div className="space-y-2">
                <label className="text-xs font-semibold text-slate-700">نوع وطريقة احتساب الخصم *</label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setCodeForm({ ...codeForm, discountType: "percent", discountValue: codeForm.discountType === "percent" ? codeForm.discountValue : 10 })}
                    className={`p-3 rounded-xl border text-right transition-all cursor-pointer flex flex-col gap-1 ${
                      codeForm.discountType === "percent"
                        ? "bg-emerald-50/80 border-emerald-500 text-emerald-950 shadow-xs ring-1 ring-emerald-500"
                        : "bg-white border-slate-200 text-slate-600 hover:bg-slate-50"
                    }`}
                  >
                    <div className="flex items-center gap-1.5 font-black text-xs text-emerald-700">
                      <Percent className="w-4 h-4" />
                      <span>نسبة مئوية (%)</span>
                    </div>
                    <span className="text-[10px] text-slate-500 leading-tight">
                      يتم خصم نسبة من مجموع الفاتورة (مثال: 10% أو 25%)
                    </span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setCodeForm({ ...codeForm, discountType: "fixed", discountValue: codeForm.discountType === "fixed" ? codeForm.discountValue : 5000 })}
                    className={`p-3 rounded-xl border text-right transition-all cursor-pointer flex flex-col gap-1 ${
                      codeForm.discountType === "fixed"
                        ? "bg-sky-50/80 border-sky-500 text-sky-950 shadow-xs ring-1 ring-sky-500"
                        : "bg-white border-slate-200 text-slate-600 hover:bg-slate-50"
                    }`}
                  >
                    <div className="flex items-center gap-1.5 font-black text-xs text-sky-700">
                      <TicketPercent className="w-4 h-4" />
                      <span>مبلغ مالي ثابت (د.ع)</span>
                    </div>
                    <span className="text-[10px] text-slate-500 leading-tight">
                      يتم خصم مبلغ محدد بالدينار (مثال: 5,000 د.ع)
                    </span>
                  </button>
                </div>
              </div>

              {/* Discount Value with Quick Buttons and Live Calculation */}
              {codeForm.discountType === "percent" ? (
                <div className="space-y-2.5 border border-emerald-200 bg-emerald-50/40 p-3.5 rounded-xl">
                  <div className="flex justify-between items-center">
                    <label className="text-xs font-bold text-emerald-900 flex items-center gap-1.5">
                      <Percent className="w-3.5 h-3.5 text-emerald-600" />
                      نسبة الخصم المئوية (من 1% إلى 100%) *
                    </label>
                    <span className="text-[10px] font-bold text-emerald-700">
                      {codeForm.discountValue ? `خصم ${codeForm.discountValue}%` : "حدد النسبة"}
                    </span>
                  </div>

                  {/* Preset Percent Chips */}
                  <div className="space-y-1 bg-white p-2.5 rounded-xl border border-emerald-100">
                    <span className="text-[10px] font-bold text-slate-500 block">اختر نسبة جاهزة بضغطة زر:</span>
                    <div className="flex flex-wrap gap-1.5">
                      {[5, 10, 15, 20, 25, 30, 40, 50, 70].map((pct) => (
                        <button
                          key={pct}
                          type="button"
                          onClick={() => setCodeForm({ ...codeForm, discountValue: pct })}
                          className={`px-2.5 py-1 rounded-lg text-[10px] font-black border transition-all cursor-pointer ${
                            codeForm.discountValue === pct
                              ? "bg-emerald-600 text-white border-emerald-600 shadow-2xs scale-105"
                              : "bg-slate-50 hover:bg-slate-100 text-slate-700 border-slate-200"
                          }`}
                        >
                          {pct}%
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Input field */}
                  <div className="relative">
                    <input
                      type="number"
                      min={1}
                      max={100}
                      value={codeForm.discountValue || ""}
                      onChange={(e) => setCodeForm({ ...codeForm, discountValue: Math.min(100, Math.max(0, parseInt(e.target.value) || 0)) })}
                      placeholder="اكتب النسبة هنا مثلاً: 15"
                      className="w-full text-xs font-mono border border-emerald-300 rounded-xl px-3 py-2.5 bg-white focus:outline-none focus:border-emerald-600 pr-8 font-bold"
                      required
                    />
                    <span className="absolute right-3 top-1/2 -translate-y-1/2 font-black text-emerald-700 text-xs select-none">
                      %
                    </span>
                  </div>

                  {/* Live Simulation Card */}
                  {codeForm.discountValue > 0 && (
                    <div className="space-y-1.5 pt-1">
                      <span className="text-[10px] font-bold text-emerald-800 block flex items-center gap-1">
                        <Calculator className="w-3.5 h-3.5" />
                        معاينة الحساب التلقائي للفواتير ({codeForm.discountValue}%):
                      </span>
                      <div className="grid grid-cols-3 gap-1.5 font-mono text-[10px]">
                        <div className="bg-white p-2 rounded-lg border border-emerald-100 text-center">
                          <span className="text-[9px] text-slate-400 block">طلب 25,000 د.ع</span>
                          <span className="text-emerald-700 font-black block mt-0.5">
                            خصم {Math.round(25000 * codeForm.discountValue / 100).toLocaleString()} د.ع
                          </span>
                          <span className="text-[8px] text-slate-500 block">يدفع: {Math.max(0, 25000 - Math.round(25000 * codeForm.discountValue / 100)).toLocaleString()} د.ع</span>
                        </div>
                        <div className="bg-white p-2 rounded-lg border border-emerald-100 text-center">
                          <span className="text-[9px] text-slate-400 block">طلب 50,000 د.ع</span>
                          <span className="text-emerald-700 font-black block mt-0.5">
                            خصم {Math.round(50000 * codeForm.discountValue / 100).toLocaleString()} د.ع
                          </span>
                          <span className="text-[8px] text-slate-500 block">يدفع: {Math.max(0, 50000 - Math.round(50000 * codeForm.discountValue / 100)).toLocaleString()} د.ع</span>
                        </div>
                        <div className="bg-white p-2 rounded-lg border border-emerald-100 text-center">
                          <span className="text-[9px] text-slate-400 block">طلب 100,000 د.ع</span>
                          <span className="text-emerald-700 font-black block mt-0.5">
                            خصم {Math.round(100000 * codeForm.discountValue / 100).toLocaleString()} د.ع
                          </span>
                          <span className="text-[8px] text-slate-500 block">يدفع: {Math.max(0, 100000 - Math.round(100000 * codeForm.discountValue / 100)).toLocaleString()} د.ع</span>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <div className="space-y-2.5 border border-sky-200 bg-sky-50/40 p-3.5 rounded-xl">
                  <div className="flex justify-between items-center">
                    <label className="text-xs font-bold text-sky-900 flex items-center gap-1.5">
                      <TicketPercent className="w-3.5 h-3.5 text-sky-600" />
                      مبلغ الخصم المالي الثابت (بالدينار العراقي) *
                    </label>
                    <span className="text-[10px] font-bold text-sky-700">
                      {codeForm.discountValue ? `${codeForm.discountValue.toLocaleString()} د.ع` : "حدد المبلغ"}
                    </span>
                  </div>

                  {/* Preset Amount Chips */}
                  <div className="space-y-1 bg-white p-2.5 rounded-xl border border-sky-100">
                    <span className="text-[10px] font-bold text-slate-500 block">اختر مبالغ شائعة بضغطة زر:</span>
                    <div className="flex flex-wrap gap-1.5">
                      {[2500, 5000, 10000, 15000, 20000, 25000, 50000].map((amt) => (
                        <button
                          key={amt}
                          type="button"
                          onClick={() => setCodeForm({ ...codeForm, discountValue: amt })}
                          className={`px-2.5 py-1 rounded-lg text-[10px] font-black border transition-all cursor-pointer ${
                            codeForm.discountValue === amt
                              ? "bg-sky-600 text-white border-sky-600 shadow-2xs scale-105"
                              : "bg-slate-50 hover:bg-slate-100 text-slate-700 border-slate-200"
                          }`}
                        >
                          {amt.toLocaleString()} د.ع
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Input field */}
                  <div className="relative">
                    <input
                      type="number"
                      value={codeForm.discountValue || ""}
                      onChange={(e) => setCodeForm({ ...codeForm, discountValue: parseInt(e.target.value) || 0 })}
                      placeholder="مثال: 5000"
                      className="w-full text-xs font-mono border border-sky-300 rounded-xl px-3 py-2.5 bg-white focus:outline-none focus:border-sky-600 pl-12 font-bold"
                      required
                    />
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 font-black text-sky-700 text-xs select-none">
                      د.ع
                    </span>
                  </div>

                  {codeForm.discountValue > 0 && (
                    <div className="bg-white p-2 rounded-lg border border-sky-100 text-[10px] text-sky-900 font-medium flex items-center gap-1.5">
                      <span>✓ سيتم خصم مبلغ ثابت قدره <strong className="font-bold font-mono">{codeForm.discountValue.toLocaleString()} د.ع</strong> من الفاتورة المؤهلة.</span>
                    </div>
                  )}
                </div>
              )}

              {/* Applies To */}
              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-700">مكان تطبيق الكوبون *</label>
                <select
                  value={codeForm.appliesTo}
                  onChange={(e) => setCodeForm({ ...codeForm, appliesTo: e.target.value as "store" | "repair" | "both" })}
                  className="w-full text-xs border border-slate-200 rounded-xl px-3 py-2 bg-slate-50 focus:outline-none cursor-pointer"
                >
                  <option value="both">المتجر وخدمات الصيانة معاً (Both)</option>
                  <option value="store">شراء المنتجات فقط (Store)</option>
                  <option value="repair">حجز الصيانة فقط (Repair)</option>
                </select>
              </div>

              {/* Limits */}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-700">الحد الأدنى للطلب (د.ع)</label>
                  <input
                    type="number"
                    value={codeForm.minOrderAmount || ""}
                    onChange={(e) => setCodeForm({ ...codeForm, minOrderAmount: parseInt(e.target.value) || 0 })}
                    placeholder="0 لعدم وجود حد أدنى"
                    className="w-full text-xs border border-slate-200 rounded-xl px-3 py-2 bg-slate-50 focus:outline-none font-mono"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-700">الحد الأقصى للاستخدام</label>
                  <input
                    type="number"
                    value={codeForm.maxUses || ""}
                    onChange={(e) => setCodeForm({ ...codeForm, maxUses: parseInt(e.target.value) || 0 })}
                    placeholder="1 للاستخدام لمرة واحدة"
                    className="w-full text-xs border border-slate-200 rounded-xl px-3 py-2 bg-slate-50 focus:outline-none font-mono"
                  />
                  <span className="text-[10px] text-slate-400 block mt-0.5">الكوبون معد افتراضياً للاستخدام لمرة واحدة فقط.</span>
                </div>
              </div>

              {/* Expiry Date */}
              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-700">تاريخ انتهاء صلاحية الكود</label>
                <input
                  type="datetime-local"
                  value={codeForm.expiresAt}
                  onChange={(e) => setCodeForm({ ...codeForm, expiresAt: e.target.value })}
                  className="w-full text-xs border border-slate-200 rounded-xl px-3 py-2 bg-slate-50 focus:outline-none font-mono text-left"
                  dir="ltr"
                />
              </div>

              {/* Active Toggle */}
              <label className="flex cursor-pointer items-center gap-2 rounded-xl border border-slate-200 bg-slate-50 px-4 py-2.5 text-xs font-bold text-slate-700 select-none">
                <input
                  type="checkbox"
                  checked={codeForm.isActive}
                  onChange={(e) => setCodeForm({ ...codeForm, isActive: e.target.checked })}
                  className="h-4 w-4 cursor-pointer rounded border-slate-350 text-accent focus:ring-accent"
                />
                تنشيط الرمز فوراً للاستخدام
              </label>

              {/* Action Buttons */}
              <div className="flex gap-3 pt-3 border-t border-slate-100 flex-shrink-0">
                <button
                  type="button"
                  onClick={() => setIsCodeModalOpen(false)}
                  className="flex-1 border border-slate-200 text-slate-600 font-bold py-2 rounded-xl text-xs cursor-pointer text-center"
                >
                  إلغاء
                </button>
                <button
                  type="submit"
                  className="flex-1 bg-[#1a1a1a] hover:bg-slate-850 text-white font-bold py-2 rounded-xl text-xs shadow-md cursor-pointer text-center"
                >
                  حفظ الرمز
                </button>
              </div>

            </form>
          </div>
        </div>
      )}

      {/* IN-STORE REPAIR INTAKE & INVOICE MODAL */}
      {isManualRepairModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs" dir="rtl">
          <div className="bg-white rounded-3xl max-w-2xl w-full p-6 shadow-2xl border border-slate-200 text-right space-y-4 max-h-[92vh] flex flex-col">
            
            {/* Modal Header */}
            <div className="flex justify-between items-center border-b border-slate-100 pb-3 flex-shrink-0">
              <div className="flex items-center gap-3">
                <div className="p-2.5 bg-sky-500/10 border border-sky-500/20 rounded-2xl text-sky-600">
                  <Wrench className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-extrabold text-base text-slate-900">إنشاء وصل واستلام صيانة (زبون المحل)</h3>
                  <p className="text-[11px] text-slate-400">إصدار وطباعة إيصال استلام وفحص معتمد مع باركود ورمز QR التتبع المباشر للزبون</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsManualRepairModalOpen(false)}
                className="p-1.5 rounded-full hover:bg-slate-100 text-slate-400 hover:text-slate-600 transition-colors cursor-pointer"
              >
                <XCircle className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveManualRepair} className="space-y-4 overflow-y-auto flex-1 pl-1 pr-1 py-1">
              
              {/* Quick Actions & Presets */}
              <div className="bg-slate-50 p-2.5 rounded-2xl border border-slate-200/80 flex flex-wrap items-center justify-between gap-2">
                <span className="text-xs font-bold text-slate-600">إجراءات سريعة:</span>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={handleQuickFillRepairCustomer}
                    className="text-xs bg-white border border-slate-200 hover:border-slate-300 text-slate-700 font-bold px-3 py-1.5 rounded-xl transition-all shadow-2xs cursor-pointer flex items-center gap-1.5"
                  >
                    <User className="w-3.5 h-3.5 text-sky-600" />
                    <span>تعبئة زبون مباشر</span>
                  </button>
                </div>
              </div>

              {/* Customer Info Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-700">اسم صاحب الجهاز *</label>
                  <input
                    type="text"
                    value={manualRepairForm.name}
                    onChange={(e) => setManualRepairForm({ ...manualRepairForm, name: e.target.value })}
                    placeholder="مثال: علي محمد"
                    className="w-full text-xs border border-slate-200 rounded-xl px-3 py-2.5 bg-slate-50 focus:outline-none focus:border-sky-500 font-bold"
                    required
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-700">رقم هاتف الزبون للتواصل والتتبع *</label>
                  <input
                    type="text"
                    value={manualRepairForm.phone}
                    onChange={(e) => setManualRepairForm({ ...manualRepairForm, phone: e.target.value })}
                    placeholder="مثال: 0773 000 0000"
                    className="w-full text-xs font-mono text-left border border-slate-200 rounded-xl px-3 py-2.5 bg-slate-50 focus:outline-none focus:border-sky-500 font-bold"
                    dir="ltr"
                    required
                  />
                </div>
              </div>

              {/* Device & Issue Section */}
              <div className="space-y-3 border-t border-slate-100 pt-3">
                
                {/* Device Model & Quick Chips */}
                <div className="space-y-1.5">
                  <div className="flex justify-between items-center">
                    <label className="text-xs font-bold text-slate-800">نوع وموديل الجهاز *</label>
                    <span className="text-[10px] text-slate-400">انقر للاختيار السريع:</span>
                  </div>
                  <input
                    type="text"
                    value={manualRepairForm.device}
                    onChange={(e) => setManualRepairForm({ ...manualRepairForm, device: e.target.value })}
                    placeholder="مثال: iPhone 15 Pro Max أو Galaxy S24 Ultra"
                    className="w-full text-xs border border-slate-200 rounded-xl px-3 py-2.5 bg-slate-50 focus:outline-none focus:border-sky-500 font-bold"
                    required
                  />
                  <div className="flex flex-wrap gap-1.5 pt-1">
                    {["iPhone 15 Pro Max", "iPhone 14 Pro", "iPhone 13", "iPhone 12", "Galaxy S24 Ultra", "Galaxy S23", "Redmi Note 13", "iPad Pro", "Apple Watch"].map((preset) => (
                      <button
                        key={preset}
                        type="button"
                        onClick={() => setManualRepairForm({ ...manualRepairForm, device: preset })}
                        className="text-[10px] bg-slate-100 hover:bg-sky-50 hover:text-sky-700 border border-slate-200 px-2 py-0.5 rounded-lg transition-colors cursor-pointer"
                      >
                        {preset}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Issue Type & Stage */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label className="text-xs font-semibold text-slate-700">نوع العطل / الخدمة المطلوبة</label>
                    <select
                      value={manualRepairForm.issueType}
                      onChange={(e) => setManualRepairForm({ ...manualRepairForm, issueType: e.target.value })}
                      className="w-full text-xs border border-slate-200 rounded-xl px-3 py-2.5 bg-slate-50 focus:outline-none focus:border-sky-500 font-bold"
                    >
                      <option value="تبديل شاشة أصلية">تبديل شاشة أصلية مع الضمان</option>
                      <option value="استبدال بطارية أصلية">استبدال بطارية أصلية مع الفحص</option>
                      <option value="صيانة آيسي الشحن والبورد">صيانة آيسي الشحن والبورد</option>
                      <option value="معالجة وتنظيف سوائل وماء">معالجة وتنظيف سوائل وماء</option>
                      <option value="تبديل زجاج الظهر / الكاميرا">تبديل زجاج الظهر / الكاميرا</option>
                      <option value="سوفتوير وفك قفل وبرمجة">سوفتوير وفك قفل وبرمجة</option>
                      <option value="صيانة عامة وفحص شامل">صيانة عامة وفحص شامل</option>
                    </select>
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs font-semibold text-slate-700">مرحلة الاستلام الأولية</label>
                    <select
                      value={manualRepairForm.status}
                      onChange={(e) => setManualRepairForm({ ...manualRepairForm, status: e.target.value as Appointment["status"] })}
                      className="w-full text-xs border border-slate-200 rounded-xl px-3 py-2.5 bg-slate-50 focus:outline-none focus:border-sky-500 font-bold"
                    >
                      <option value="pending">1. تم الاستلام (بانتظار الفحص)</option>
                      <option value="diagnosing">2. قيد التشخيص والفحص الفني</option>
                      <option value="in-progress">3. قيد الصيانة واستبدال القطع</option>
                      <option value="testing">4. الفحص النهائي واختبار الجودة</option>
                      <option value="ready">5. جاهز للاستلام بالمحل</option>
                    </select>
                  </div>
                </div>

                {/* Accessories & Intake Condition */}
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-700">الملحقات المسلمة وحالة الجهاز عند الاستلام</label>
                  <input
                    type="text"
                    value={manualRepairForm.details}
                    onChange={(e) => setManualRepairForm({ ...manualRepairForm, details: e.target.value })}
                    placeholder="مثال: تم استلام الجهاز بدون شاحن، البصمة تعمل، لا يوجد كسر خلفي"
                    className="w-full text-xs border border-slate-200 rounded-xl px-3 py-2.5 bg-slate-50 focus:outline-none focus:border-sky-500"
                  />
                </div>

              </div>

              {/* Financials & Ready Time */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 border-t border-slate-100 pt-3">
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-700">التكلفة المتفق عليها / المعتمدة (د.ع)</label>
                  <input
                    type="number"
                    value={manualRepairForm.cost || ""}
                    onChange={(e) => setManualRepairForm({ ...manualRepairForm, cost: parseInt(e.target.value) || 0 })}
                    placeholder="0 (تحدد بعد الفحص)"
                    className="w-full text-xs font-mono text-left border border-slate-200 rounded-xl px-3 py-2.5 bg-slate-50 focus:outline-none focus:border-sky-500 font-bold"
                    dir="ltr"
                  />
                  <span className="text-[10px] text-slate-400 block">اتركه 0 إذا كانت الكلفة تحدد لاحقاً بعد الفحص.</span>
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-700">موعد الاستلام المتوقع للزبون</label>
                  <input
                    type="text"
                    value={manualRepairForm.estimatedReady}
                    onChange={(e) => setManualRepairForm({ ...manualRepairForm, estimatedReady: e.target.value })}
                    placeholder="مثال: اليوم الساعة 6:00 مساءً"
                    className="w-full text-xs border border-slate-200 rounded-xl px-3 py-2.5 bg-slate-50 focus:outline-none focus:border-sky-500 font-bold"
                  />
                  <span className="text-[10px] text-slate-400 block">يظهر للزبون في صفحة التتبع عبر الـ QR.</span>
                </div>
              </div>

              {/* Tech Notes */}
              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-700">تقرير وملاحظات الفني الأولية</label>
                <textarea
                  rows={2}
                  value={manualRepairForm.techNotes}
                  onChange={(e) => setManualRepairForm({ ...manualRepairForm, techNotes: e.target.value })}
                  placeholder="ملاحظات مهندس الصيانة حول الجهاز..."
                  className="w-full text-xs border border-slate-200 rounded-xl p-3 bg-slate-50 focus:outline-none focus:border-sky-500"
                />
              </div>

              {/* Action Buttons */}
              <div className="flex gap-3 pt-3 border-t border-slate-100 flex-shrink-0">
                <button
                  type="button"
                  onClick={() => setIsManualRepairModalOpen(false)}
                  className="flex-1 border border-slate-200 text-slate-600 font-bold py-2.5 rounded-xl text-xs cursor-pointer text-center"
                >
                  إلغاء
                </button>
                <button
                  type="submit"
                  className="flex-1 bg-sky-600 hover:bg-sky-700 text-white font-bold py-2.5 rounded-xl text-xs shadow-md cursor-pointer text-center flex items-center justify-center gap-2"
                >
                  <Printer className="w-4 h-4" />
                  <span>حفظ وإصدار إيصال الصيانة للطباعة</span>
                </button>
              </div>

            </form>
          </div>
        </div>
      )}

      {/* IN-STORE POS & MANUAL INVOICE MODAL */}
      {isManualInvoiceModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs" dir="rtl">
          <div className="bg-white rounded-3xl max-w-2xl w-full p-6 shadow-2xl border border-slate-200 text-right space-y-4 max-h-[92vh] flex flex-col">
            
            {/* Modal Header */}
            <div className="flex justify-between items-center border-b border-slate-100 pb-3 flex-shrink-0">
              <div className="flex items-center gap-3">
                <div className="p-2.5 bg-emerald-500/10 border border-emerald-500/20 rounded-2xl text-emerald-600">
                  <Receipt className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-extrabold text-base text-slate-900">إنشاء فاتورة مبيعات مباشرة (زبون المحل)</h3>
                  <p className="text-[11px] text-slate-400">إصدار وطباعة فاتورة معتمدة مع الباركود ورمز التتبع للمبيعات المباشرة داخل المحل</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsManualInvoiceModalOpen(false)}
                className="p-1.5 rounded-full hover:bg-slate-100 text-slate-400 hover:text-slate-600 transition-colors cursor-pointer"
              >
                <XCircle className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveManualInvoice} className="space-y-4 overflow-y-auto flex-1 pl-1 pr-1 py-1">
              
              {/* Quick Actions Bar */}
              <div className="bg-slate-50 p-2.5 rounded-2xl border border-slate-200/80 flex flex-wrap items-center justify-between gap-2">
                <span className="text-xs font-bold text-slate-600">إجراءات سريعة:</span>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={handleQuickFillWalkinCustomer}
                    className="text-xs bg-white border border-slate-200 hover:border-slate-300 text-slate-700 font-bold px-3 py-1.5 rounded-xl transition-all shadow-2xs cursor-pointer flex items-center gap-1.5"
                  >
                    <User className="w-3.5 h-3.5 text-sky-600" />
                    <span>تعبئة سريعة (زبون مباشر)</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setShowProductPicker(!showProductPicker)}
                    className="text-xs bg-sky-50 border border-sky-200 hover:bg-sky-100 text-sky-800 font-bold px-3 py-1.5 rounded-xl transition-all shadow-2xs cursor-pointer flex items-center gap-1.5"
                  >
                    <ShoppingBag className="w-3.5 h-3.5 text-sky-600" />
                    <span>اختيار من منتجات المتجر</span>
                  </button>
                </div>
              </div>

              {/* In-Store Product Picker Dropdown Search */}
              {showProductPicker && (
                <div className="bg-slate-900 text-white p-3.5 rounded-2xl space-y-2.5 shadow-xl animate-in fade-in zoom-in-95 duration-200">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-slate-300">ابحث واختر منتج لإضافته للفاتورة مباشرة:</span>
                    <button
                      type="button"
                      onClick={() => setShowProductPicker(false)}
                      className="text-slate-400 hover:text-white text-xs"
                    >
                      إغلاق
                    </button>
                  </div>
                  <div className="relative">
                    <input
                      type="text"
                      value={productSearchQuery}
                      onChange={(e) => setProductSearchQuery(e.target.value)}
                      placeholder="ابحث بالاسم، الموديل، أو الفئة..."
                      className="w-full bg-slate-950 border border-slate-700 text-white rounded-xl py-2 pr-9 pl-3 text-xs focus:outline-none focus:border-sky-500"
                    />
                    <Search className="w-4 h-4 text-slate-400 absolute right-3 top-1/2 -translate-y-1/2" />
                  </div>
                  <div className="max-h-48 overflow-y-auto divide-y divide-slate-800 rounded-xl bg-slate-950 border border-slate-800">
                    {products
                      .filter((p) =>
                        !productSearchQuery.trim() ||
                        p.name.toLowerCase().includes(productSearchQuery.toLowerCase()) ||
                        p.category.toLowerCase().includes(productSearchQuery.toLowerCase())
                      )
                      .slice(0, 8)
                      .map((prod) => (
                        <div
                          key={prod.id}
                          onClick={() => handleSelectProductForManualInvoice(prod)}
                          className="p-2.5 hover:bg-slate-800/80 flex items-center justify-between text-xs cursor-pointer transition-colors"
                        >
                          <div>
                            <strong className="text-white block font-bold">{prod.name}</strong>
                            <span className="text-[10px] text-slate-400">{prod.category}</span>
                          </div>
                          <div className="text-left font-mono font-bold text-sky-400" dir="ltr">
                            {(prod.discountPrice || prod.price).toLocaleString()} د.ع
                          </div>
                        </div>
                      ))}
                  </div>
                </div>
              )}

              {/* Customer Info Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-700">اسم الزبون *</label>
                  <input
                    type="text"
                    value={manualInvoiceForm.customerName}
                    onChange={(e) => setManualInvoiceForm({ ...manualInvoiceForm, customerName: e.target.value })}
                    placeholder="مثال: زبون مباشر أو علي محمد"
                    className="w-full text-xs border border-slate-200 rounded-xl px-3 py-2 bg-slate-50 focus:outline-none focus:border-sky-500 font-bold"
                    required
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-700">رقم الهاتف *</label>
                  <input
                    type="text"
                    value={manualInvoiceForm.customerPhone}
                    onChange={(e) => setManualInvoiceForm({ ...manualInvoiceForm, customerPhone: e.target.value })}
                    placeholder="مثال: 07700000000"
                    className="w-full text-xs font-mono text-left border border-slate-200 rounded-xl px-3 py-2 bg-slate-50 focus:outline-none focus:border-sky-500 font-bold"
                    dir="ltr"
                    required
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-700">نوع الشراء / العنوان</label>
                  <input
                    type="text"
                    value={manualInvoiceForm.customerAddress}
                    onChange={(e) => setManualInvoiceForm({ ...manualInvoiceForm, customerAddress: e.target.value })}
                    placeholder="مثال: استلام مباشر من المحل"
                    className="w-full text-xs border border-slate-200 rounded-xl px-3 py-2 bg-slate-50 focus:outline-none focus:border-sky-500"
                  />
                </div>
              </div>

              {/* Items Section */}
              <div className="space-y-3 border-t border-slate-100 pt-3">
                <div className="flex justify-between items-center">
                  <label className="text-xs font-bold text-slate-800">قائمة المواد والمنتجات المباعة</label>
                  <button
                    type="button"
                    onClick={handleAddManualItem}
                    className="text-xs text-sky-700 font-bold hover:underline flex items-center gap-1 cursor-pointer"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>إضافة مادة أخرى</span>
                  </button>
                </div>

                <div className="space-y-2">
                  {manualInvoiceForm.items.map((item, idx) => (
                    <div key={idx} className="bg-slate-50 p-3 rounded-2xl border border-slate-200 grid grid-cols-12 gap-2 items-center text-xs">
                      <div className="col-span-5 space-y-0.5">
                        <span className="text-[10px] text-slate-400 font-bold">اسم المادة / المنتج</span>
                        <input
                          type="text"
                          value={item.name}
                          onChange={(e) => handleManualItemChange(idx, "name", e.target.value)}
                          placeholder="مثال: شاحن Anker 20W أصلي"
                          className="w-full text-xs border border-slate-200 bg-white rounded-lg px-2.5 py-1.5 focus:outline-none focus:border-sky-500 font-bold"
                          required
                        />
                      </div>
                      <div className="col-span-3 space-y-0.5">
                        <span className="text-[10px] text-slate-400 font-bold">المواصفات / اللون</span>
                        <input
                          type="text"
                          value={item.details}
                          onChange={(e) => handleManualItemChange(idx, "details", e.target.value)}
                          placeholder="مثال: أسود / 256GB"
                          className="w-full text-xs border border-slate-200 bg-white rounded-lg px-2.5 py-1.5 focus:outline-none focus:border-sky-500"
                        />
                      </div>
                      <div className="col-span-1 space-y-0.5">
                        <span className="text-[10px] text-slate-400 font-bold">العدد</span>
                        <input
                          type="number"
                          min="1"
                          value={item.quantity}
                          onChange={(e) => handleManualItemChange(idx, "quantity", parseInt(e.target.value) || 1)}
                          className="w-full text-xs font-mono text-center border border-slate-200 bg-white rounded-lg px-1.5 py-1.5 focus:outline-none focus:border-sky-500 font-bold"
                          required
                        />
                      </div>
                      <div className="col-span-2 space-y-0.5">
                        <span className="text-[10px] text-slate-400 font-bold">السعر (د.ع)</span>
                        <input
                          type="number"
                          value={item.price || ""}
                          onChange={(e) => handleManualItemChange(idx, "price", parseInt(e.target.value) || 0)}
                          placeholder="25000"
                          className="w-full text-xs font-mono text-left border border-slate-200 bg-white rounded-lg px-2 py-1.5 focus:outline-none focus:border-sky-500 font-bold"
                          dir="ltr"
                          required
                        />
                      </div>
                      <div className="col-span-1 text-left pt-3.5">
                        {manualInvoiceForm.items.length > 1 && (
                          <button
                            type="button"
                            onClick={() => handleRemoveManualItem(idx)}
                            className="p-1.5 text-slate-400 hover:text-rose-500 rounded-lg hover:bg-rose-50 transition-colors cursor-pointer"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Financial & Notes Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 border-t border-slate-100 pt-3">
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-700">أجور التوصيل (د.ع)</label>
                  <input
                    type="number"
                    value={manualInvoiceForm.shippingFee || ""}
                    onChange={(e) => setManualInvoiceForm({ ...manualInvoiceForm, shippingFee: parseInt(e.target.value) || 0 })}
                    placeholder="0"
                    className="w-full text-xs font-mono text-left border border-slate-200 rounded-xl px-3 py-2 bg-slate-50 focus:outline-none font-bold"
                    dir="ltr"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-700">قيمة الخصم المباشر (د.ع)</label>
                  <input
                    type="number"
                    value={manualInvoiceForm.discountAmount || ""}
                    onChange={(e) => setManualInvoiceForm({ ...manualInvoiceForm, discountAmount: parseInt(e.target.value) || 0 })}
                    placeholder="0"
                    className="w-full text-xs font-mono text-left border border-slate-200 rounded-xl px-3 py-2 bg-slate-50 focus:outline-none font-bold"
                    dir="ltr"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-700">ملاحظات الفاتورة</label>
                <input
                  type="text"
                  value={manualInvoiceForm.notes}
                  onChange={(e) => setManualInvoiceForm({ ...manualInvoiceForm, notes: e.target.value })}
                  placeholder="ملاحظات أو شروط ضمان خاصة..."
                  className="w-full text-xs border border-slate-200 rounded-xl px-3 py-2 bg-slate-50 focus:outline-none"
                />
              </div>

              {/* Action Buttons */}
              <div className="flex gap-3 pt-3 border-t border-slate-100 flex-shrink-0">
                <button
                  type="button"
                  onClick={() => setIsManualInvoiceModalOpen(false)}
                  className="flex-1 border border-slate-200 text-slate-600 font-bold py-2.5 rounded-xl text-xs cursor-pointer text-center"
                >
                  إلغاء
                </button>
                <button
                  type="submit"
                  className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-2.5 rounded-xl text-xs shadow-md cursor-pointer text-center flex items-center justify-center gap-2"
                >
                  <Printer className="w-4 h-4" />
                  <span>حفظ وطباعة الفاتورة 🖨️</span>
                </button>
              </div>

            </form>
          </div>
        </div>
      )}

      {/* Repair Tracking & Diagnostics Modal */}
      {isRepairDetailModalOpen && editingRepairAppt && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs" dir="rtl">
          <div className="bg-white rounded-3xl max-w-xl w-full p-6 shadow-2xl border border-slate-200 text-right space-y-5 max-h-[90vh] overflow-y-auto">
            
            {/* Modal Header */}
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-3">
                <div className="p-2.5 bg-sky-500/10 border border-sky-500/20 rounded-2xl text-sky-600">
                  <Wrench className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-extrabold text-base text-slate-900">
                    إدارة تقرير وتتبع صيانة الجهاز
                  </h3>
                  <div className="flex items-center gap-2 text-xs text-slate-500 font-mono mt-0.5">
                    <span>كود التتبع: <strong className="text-sky-600 font-bold">{editingRepairAppt.trackingCode || editingRepairAppt.id}</strong></span>
                  </div>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsRepairDetailModalOpen(false)}
                className="p-2 text-slate-400 hover:text-slate-600 rounded-xl hover:bg-slate-100 transition-colors cursor-pointer"
              >
                <XCircle className="w-5 h-5" />
              </button>
            </div>

            {/* Quick Customer & Device Summary */}
            <div className="bg-slate-50 border border-slate-200/80 rounded-2xl p-3.5 grid grid-cols-2 gap-3 text-xs">
              <div>
                <span className="text-slate-400 font-bold block">العميل:</span>
                <strong className="text-slate-800 font-bold">{editingRepairAppt.name}</strong>
                <div className="font-mono text-slate-600" dir="ltr">{editingRepairAppt.phone}</div>
              </div>
              <div>
                <span className="text-slate-400 font-bold block">الجهاز:</span>
                <strong className="text-slate-800 font-bold">{editingRepairAppt.device}</strong>
                <div className="text-amber-600 font-bold truncate">{editingRepairAppt.issueType}</div>
              </div>
            </div>

            {/* Edit Form */}
            <form onSubmit={handleSaveRepairDetails} className="space-y-4">
              
              {/* Status Stage Selector */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4 text-sky-600" />
                  <span>مرحلة الصيانة المباشرة (تظهر للزبون عند التتبع):</span>
                </label>
                <select
                  value={editingRepairAppt.status}
                  onChange={(e) =>
                    setEditingRepairAppt({
                      ...editingRepairAppt,
                      status: e.target.value as Appointment["status"],
                    })
                  }
                  className="w-full text-xs font-bold border border-slate-200 rounded-xl px-3 py-2.5 bg-slate-50 focus:outline-none focus:border-sky-500"
                >
                  <option value="pending">1. تم الاستلام (بانتظار الفحص والتشخيص)</option>
                  <option value="diagnosing">2. قيد الفحص والتشخيص الفني المجهري</option>
                  <option value="in-progress">3. قيد الصيانة واستبدال القطع</option>
                  <option value="testing">4. الفحص النهائي واختبار الجودة والشحن</option>
                  <option value="ready">5. جاهز للاستلام بالمحل</option>
                  <option value="completed">6. تم التسليم للزبون وتفعيل الضمان</option>
                  <option value="cancelled">7. ملغي / تعذر الإصلاح</option>
                </select>
              </div>

              {/* Technician Live Report / Notes */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
                  <Wrench className="w-4 h-4 text-sky-600" />
                  <span>تقرير مهندس الصيانة (يظهر في صفحة التتبع للزبون):</span>
                </label>
                <textarea
                  rows={3}
                  value={editingRepairAppt.techNotes || ""}
                  onChange={(e) =>
                    setEditingRepairAppt({
                      ...editingRepairAppt,
                      techNotes: e.target.value,
                    })
                  }
                  placeholder="مثال: تم فحص البورد وتحديد الخلل في آيسي الشحن، جاري استبدال القطعة الأصلية وإجراء الاختبار النهائي..."
                  className="w-full text-xs border border-slate-200 rounded-xl p-3 bg-slate-50 focus:outline-none focus:border-sky-500 leading-relaxed font-sans"
                />
              </div>

              {/* Cost & Estimated Ready Row */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-700">التكلفة المعتمدة (د.ع):</label>
                  <input
                    type="number"
                    value={editingRepairAppt.cost || ""}
                    onChange={(e) =>
                      setEditingRepairAppt({
                        ...editingRepairAppt,
                        cost: parseInt(e.target.value) || 0,
                      })
                    }
                    placeholder="مثال: 25000"
                    className="w-full text-xs font-mono font-bold border border-slate-200 rounded-xl px-3 py-2.5 bg-slate-50 focus:outline-none focus:border-sky-500"
                    dir="ltr"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-700">موعد الاستلام المتوقع:</label>
                  <input
                    type="text"
                    value={editingRepairAppt.estimatedReady || ""}
                    onChange={(e) =>
                      setEditingRepairAppt({
                        ...editingRepairAppt,
                        estimatedReady: e.target.value,
                      })
                    }
                    placeholder="مثال: اليوم الساعة 6:00 مساءً"
                    className="w-full text-xs font-bold border border-slate-200 rounded-xl px-3 py-2.5 bg-slate-50 focus:outline-none focus:border-sky-500"
                  />
                </div>
              </div>

              {/* Fault Details / Custom Description */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700">تفاصيل العطل والملحقات المسلمة مع الجهاز:</label>
                <input
                  type="text"
                  value={editingRepairAppt.details || ""}
                  onChange={(e) =>
                    setEditingRepairAppt({
                      ...editingRepairAppt,
                      details: e.target.value,
                    })
                  }
                  placeholder="مثال: تم استلام الجهاز بدون شاحن، الكاميرا الخلفية تعمل بشكل طبيعي"
                  className="w-full text-xs border border-slate-200 rounded-xl px-3 py-2.5 bg-slate-50 focus:outline-none focus:border-sky-500"
                />
              </div>

              {/* Quick Communication & Actions Bar */}
              <div className="bg-slate-50 p-3 rounded-2xl border border-slate-200/80 flex flex-wrap items-center justify-between gap-2 text-xs">
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => handleSendRepairWhatsApp(editingRepairAppt)}
                    className="px-3 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-bold flex items-center gap-1.5 transition-all shadow-sm cursor-pointer"
                  >
                    <MessageCircle className="w-3.5 h-3.5" />
                    <span>إرسال واتساب للزبون</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => handleCopyTrackLink(editingRepairAppt)}
                    className="px-3 py-2 bg-slate-200 hover:bg-slate-300 text-slate-800 rounded-xl font-bold flex items-center gap-1.5 transition-all cursor-pointer"
                  >
                    <Copy className="w-3.5 h-3.5" />
                    <span>نسخ رابط التتبع</span>
                  </button>
                </div>

                <button
                  type="button"
                  onClick={() => {
                    handlePrintRepair(editingRepairAppt);
                  }}
                  className="px-3 py-2 bg-sky-100 hover:bg-sky-200 text-sky-800 rounded-xl font-bold flex items-center gap-1.5 transition-all cursor-pointer"
                >
                  <Printer className="w-3.5 h-3.5" />
                  <span>طباعة الإيصال والـ QR</span>
                </button>
              </div>

              {/* Modal Save & Close Buttons */}
              <div className="flex gap-3 pt-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsRepairDetailModalOpen(false)}
                  className="flex-1 border border-slate-200 text-slate-600 font-bold py-2.5 rounded-xl text-xs cursor-pointer text-center"
                >
                  إلغاء
                </button>
                <button
                  type="submit"
                  className="flex-1 bg-sky-600 hover:bg-sky-700 text-white font-bold py-2.5 rounded-xl text-xs shadow-md cursor-pointer text-center flex items-center justify-center gap-2"
                >
                  <CheckCircle className="w-4 h-4" />
                  <span>حفظ التحديثات ونشر التتبع</span>
                </button>
              </div>

            </form>

          </div>
        </div>
      )}

      {/* Printable Invoice & Waybill Modal */}
      <PrintInvoiceModal
        isOpen={isPrintModalOpen}
        onClose={() => setIsPrintModalOpen(false)}
        printableData={printableData}
        siteSettings={siteSettings}
      />

    </div>
  );
}
