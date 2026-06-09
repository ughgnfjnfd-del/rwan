"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useApp, Product, Appointment } from "@/context/AppContext";
import { supabase } from "@/lib/supabase";
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
  Clock,
  Play,
  XCircle,
  ArrowRight,
  LogOut,
  Search,
  FileText,
  AlertCircle,
  Star,
  Mail,
  Phone,
  Globe,
  PlusCircle
} from "lucide-react";

export default function AdminPage() {
  const {
    products,
    appointments,
    addProduct,
    updateProduct,
    deleteProduct,
    updateAppointmentStatus,
    deleteAppointment,
    siteSettings,
    updateSiteSettings
  } = useApp();

  // Authentication States
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loginError, setLoginError] = useState("");
  const [isLoadingAuth, setIsLoadingAuth] = useState(true);

  useEffect(() => {
    // Check active sessions and sets the user
    const checkSession = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      setIsLoggedIn(!!session);
      setIsLoadingAuth(false);
    };
    checkSession();

    // Listen for changes on auth state (logged in, signed out, etc.)
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setIsLoggedIn(!!session);
    });

    return () => subscription.unsubscribe();
  }, []);

  // Tab State: "overview", "products", "repairs", "settings"
  const [activeTab, setActiveTab] = useState<"overview" | "products" | "repairs" | "settings">("overview");

  // Product CRUD States
  const [isProductModalOpen, setIsProductModalOpen] = useState(false);
  const [editingProductId, setEditingProductId] = useState<string | null>(null);
  const [productForm, setProductForm] = useState({
    name: "",
    nameEn: "",
    price: 0,
    discountPrice: 0,
    category: "موبايلات",
    imageType: "preset" as "preset" | "url",
    imagePreset: "iphone",
    imageUrl: "",
    description: "",
    specs: "",
    isPopular: false,
  });

  // Site Settings States
  const [settingsForm, setSettingsForm] = useState({
    email: "",
    phone: "",
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
    }
  });
  
  const [newSocial, setNewSocial] = useState({
    platform: "facebook",
    url: "",
    name: "فيسبوك",
  });

  // Sync settingsForm state when siteSettings loads
  useEffect(() => {
    if (siteSettings) {
      setSettingsForm({
        email: siteSettings.email || "",
        phone: siteSettings.phone || "",
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
        }
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

  const handleSaveSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!settingsForm.email || !settingsForm.phone) {
      alert("يرجى ملء البريد الإلكتروني ورقم الهاتف");
      return;
    }
    
    try {
      await updateSiteSettings(settingsForm);
      alert("تم حفظ إعدادات الموقع بنجاح!");
    } catch (err) {
      console.error(err);
      alert("حدث خطأ أثناء حفظ الإعدادات!");
    }
  };
  const [productSearch, setProductSearch] = useState("");

  // Repair Filter State
  const [repairFilter, setRepairFilter] = useState<"all" | Appointment["status"]>("all");

  // Handle Login Submission
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError("");
    
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      setLoginError("البريد الإلكتروني أو كلمة المرور غير صحيحة!");
    }
  };

  // Handle Logout
  const handleLogout = async () => {
    await supabase.auth.signOut();
  };

  // Open Add Product Form
  const handleOpenAdd = () => {
    setEditingProductId(null);
    setProductForm({
      name: "",
      nameEn: "",
      price: 0,
      discountPrice: 0,
      category: "موبايلات",
      imageType: "preset",
      imagePreset: "iphone",
      imageUrl: "",
      description: "",
      specs: "",
      isPopular: false,
    });
    setIsProductModalOpen(true);
  };

  // Open Edit Product Form
  const handleOpenEdit = (product: Product) => {
    setEditingProductId(product.id);
    const isPreset = ["iphone", "samsung", "cases", "headphones", "earbuds", "cable", "smartwatch", "powerbank", "screen-protector"].includes(product.image) || product.image.startsWith("charger-");
    setProductForm({
      name: product.name,
      nameEn: product.nameEn,
      price: product.price,
      discountPrice: product.discountPrice || 0,
      category: product.category,
      imageType: isPreset ? "preset" : "url",
      imagePreset: isPreset ? product.image : "iphone",
      imageUrl: isPreset ? "" : product.image,
      description: product.description || "",
      specs: product.specs || "",
      isPopular: product.isPopular || false,
    });
    setIsProductModalOpen(true);
  };

  // Save Product (Add or Edit)
  const handleSaveProduct = (e: React.FormEvent) => {
    e.preventDefault();
    if (!productForm.name || !productForm.nameEn || productForm.price <= 0) {
      alert("يرجى ملء جميع الحقول بشكل صحيح");
      return;
    }

    const imageValue = productForm.imageType === "preset" ? productForm.imagePreset : productForm.imageUrl;
    
    if (!imageValue) {
      alert("يرجى إدخال رابط الصورة أو اختيار شكل جرافيكي");
      return;
    }

    const productData = {
      name: productForm.name,
      nameEn: productForm.nameEn,
      price: productForm.price,
      discountPrice: productForm.discountPrice > 0 ? productForm.discountPrice : 0,
      category: productForm.category,
      image: imageValue,
      description: productForm.description,
      specs: productForm.specs,
      isPopular: productForm.isPopular,
    };

    if (editingProductId) {
      updateProduct(editingProductId, productData);
    } else {
      addProduct(productData);
    }
    setIsProductModalOpen(false);
  };

  // Statistics calculations
  const totalProducts = products.length;
  const pendingRepairs = appointments.filter((a) => a.status === "pending").length;
  const activeRepairs = appointments.filter((a) => a.status === "in-progress").length;
  const completedRepairs = appointments.filter((a) => a.status === "completed").length;
  
  // Simulated revenue: 45,000 IQD per completed repair + sum of all products
  const estimatedRevenue = completedRepairs * 45000 + products.reduce((acc, curr) => acc + curr.price * 0.1, 0);

  // Filtered Products List
  const filteredProducts = products.filter((prod) =>
    prod.name.toLowerCase().includes(productSearch.toLowerCase()) ||
    prod.nameEn.toLowerCase().includes(productSearch.toLowerCase()) ||
    prod.category.toLowerCase().includes(productSearch.toLowerCase())
  );

  // Filtered Repairs List
  const filteredRepairs = appointments.filter((appt) =>
    repairFilter === "all" ? true : appt.status === repairFilter
  );

  // --- LOGIN VIEW ---
  if (isLoadingAuth) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4 font-sans text-right" dir="rtl">
        <div className="animate-pulse flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-4 border-accent border-t-transparent rounded-full animate-spin"></div>
          <p className="text-slate-500 font-bold">جاري التحقق من الهوية...</p>
        </div>
      </div>
    );
  }

  if (!isLoggedIn) {
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
            className={`w-full flex items-center gap-3 p-3.5 rounded-xl text-sm font-bold transition-all text-right cursor-pointer ${
              activeTab === "overview"
                ? "bg-[#1a1a1a] text-white shadow-md"
                : "hover:bg-slate-50 text-slate-600"
            }`}
          >
            <TrendingUp className="w-4.5 h-4.5" />
            <span>نظرة عامة وإحصائيات</span>
          </button>

          <button
            onClick={() => setActiveTab("products")}
            className={`w-full flex items-center gap-3 p-3.5 rounded-xl text-sm font-bold transition-all text-right cursor-pointer ${
              activeTab === "products"
                ? "bg-[#1a1a1a] text-white shadow-md"
                : "hover:bg-slate-50 text-slate-600"
            }`}
          >
            <ShoppingBag className="w-4.5 h-4.5" />
            <span>إدارة المنتجات ({totalProducts})</span>
          </button>

          <button
            onClick={() => setActiveTab("repairs")}
            className={`w-full flex items-center gap-3 p-3.5 rounded-xl text-sm font-bold transition-all text-right cursor-pointer ${
              activeTab === "repairs"
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
            className={`w-full flex items-center gap-3 p-3.5 rounded-xl text-sm font-bold transition-all text-right cursor-pointer ${
              activeTab === "settings"
                ? "bg-[#1a1a1a] text-white shadow-md"
                : "hover:bg-slate-50 text-slate-600"
            }`}
          >
            <FileText className="w-4.5 h-4.5" />
            <span>إعدادات الموقع</span>
          </button>
        </aside>

        {/* CMS Display Panel */}
        <section className="lg:col-span-9 bg-white border border-card-border rounded-2xl p-6 sm:p-8 min-h-[500px]">
          
          {/* TAB 1: OVERVIEW */}
          {activeTab === "overview" && (
            <div className="space-y-8">
              <div className="border-b border-slate-100 pb-4">
                <h2 className="text-xl font-extrabold text-[#1a1a1a]">نظرة عامة على المتجر</h2>
                <p className="text-xs text-slate-400">إحصائيات فورية حول المخزن وعمليات الصيانة والطلب</p>
              </div>

              {/* Bento Box Stats */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                
                {/* Stat 1: Total products */}
                <div className="bg-slate-50/50 border border-slate-100 p-5 rounded-2xl space-y-2">
                  <div className="p-2 bg-blue-50 text-blue-500 rounded-lg w-fit">
                    <ShoppingBag className="w-5 h-5" />
                  </div>
                  <div className="text-slate-400 text-[10px] font-bold">إجمالي المنتجات بالمحل</div>
                  <div className="text-2xl font-extrabold text-slate-800">{totalProducts}</div>
                </div>

                {/* Stat 2: Pending Repairs */}
                <div className="bg-slate-50/50 border border-slate-100 p-5 rounded-2xl space-y-2">
                  <div className="p-2 bg-amber-50 text-amber-500 rounded-lg w-fit">
                    <Clock className="w-5 h-5" />
                  </div>
                  <div className="text-slate-400 text-[10px] font-bold">حجوزات صيانة قيد الانتظار</div>
                  <div className="text-2xl font-extrabold text-slate-800">{pendingRepairs}</div>
                </div>

                {/* Stat 3: Active Repairs */}
                <div className="bg-slate-50/50 border border-slate-100 p-5 rounded-2xl space-y-2">
                  <div className="p-2 bg-purple-50 text-purple-500 rounded-lg w-fit">
                    <Play className="w-5 h-5" />
                  </div>
                  <div className="text-slate-400 text-[10px] font-bold">أجهزة قيد الصيانة حالياً</div>
                  <div className="text-2xl font-extrabold text-slate-800">{activeRepairs}</div>
                </div>

                {/* Stat 4: Estimated sales */}
                <div className="bg-slate-50/50 border border-slate-100 p-5 rounded-2xl space-y-2">
                  <div className="p-2 bg-emerald-50 text-emerald-500 rounded-lg w-fit">
                    <TrendingUp className="w-5 h-5" />
                  </div>
                  <div className="text-slate-400 text-[10px] font-bold">العوائد التقديرية</div>
                  <div className="text-sm sm:text-base font-extrabold text-slate-800 truncate">
                    {estimatedRevenue.toLocaleString()} د.ع
                  </div>
                </div>

              </div>

              {/* Quick Table for Repairs */}
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <h3 className="font-extrabold text-sm text-[#1a1a1a]">آخر حجوزات الصيانة الواردة</h3>
                  <button onClick={() => setActiveTab("repairs")} className="text-xs text-accent font-bold hover:underline">
                    عرض الكل ←
                  </button>
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
                          <th className="p-3 text-left">الحالة</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100">
                        {appointments.slice(0, 3).map((appt) => (
                          <tr key={appt.id} className="hover:bg-slate-50/50">
                            <td className="p-3 font-semibold text-slate-800">{appt.name}</td>
                            <td className="p-3 text-slate-600 font-mono">{appt.device}</td>
                            <td className="p-3 text-slate-600">{appt.issueType}</td>
                            <td className="p-3 text-slate-500 font-mono">{appt.date}</td>
                            <td className="p-3 text-left">
                              <span className={`inline-block px-2 py-0.5 rounded text-[10px] font-bold ${
                                appt.status === "pending"
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

          {/* TAB 3: REPAIR APPOINTMENTS */}
          {activeTab === "repairs" && (
            <div className="space-y-6">
              <div className="border-b border-slate-100 pb-4 flex flex-col sm:flex-row justify-between sm:items-center gap-4">
                <div>
                  <h2 className="text-xl font-extrabold text-[#1a1a1a]">إدارة حجوزات صيانة الأجهزة</h2>
                  <p className="text-xs text-slate-400">متابعة الأجهزة المعطلة وتغيير حالة الصيانة وحذف الحجوزات</p>
                </div>

                {/* Filter Selector */}
                <div className="flex gap-1.5 overflow-x-auto pb-1">
                  {(["all", "pending", "in-progress", "completed", "cancelled"] as const).map((filter) => (
                    <button
                      key={filter}
                      onClick={() => setRepairFilter(filter)}
                      className={`text-[10px] font-bold px-3 py-1.5 rounded-lg border transition-all cursor-pointer truncate ${
                        repairFilter === filter
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
                        <th className="p-3">الرمز</th>
                        <th className="p-3">العميل وهاتفه</th>
                        <th className="p-3">الجهاز والمشكلة</th>
                        <th className="p-3">الموعد والتوقيت</th>
                        <th className="p-3">حالة الصيانة</th>
                        <th className="p-3 text-left">الإجراءات</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {filteredRepairs.map((appt) => (
                        <tr key={appt.id} className="hover:bg-slate-50/50">
                          
                          <td className="p-3 font-bold text-slate-400 font-mono">{appt.id}</td>

                          <td className="p-3 space-y-0.5">
                            <div className="font-semibold text-slate-800">{appt.name}</div>
                            <div className="text-[10px] text-slate-400 font-mono">{appt.phone}</div>
                          </td>

                          <td className="p-3 space-y-0.5 max-w-[200px]">
                            <div className="font-semibold text-slate-700 truncate font-mono">{appt.device}</div>
                            <div className="text-[10px] text-slate-400 truncate" title={appt.details}>
                              {appt.issueType} {appt.details && `| ${appt.details}`}
                            </div>
                          </td>

                          <td className="p-3 space-y-0.5">
                            <div className="text-slate-600 font-mono font-bold">{appt.date}</div>
                            <div className="text-[10px] text-slate-400">{appt.timeSlot}</div>
                          </td>

                          <td className="p-3">
                            <span className={`inline-block px-2.5 py-0.5 rounded text-[10px] font-bold ${
                              appt.status === "pending"
                                ? "bg-amber-50 text-amber-600 border border-amber-100"
                                : appt.status === "in-progress"
                                ? "bg-blue-50 text-blue-600 border border-blue-100"
                                : appt.status === "completed"
                                ? "bg-emerald-50 text-emerald-600 border border-emerald-100"
                                : "bg-rose-50 text-rose-600 border border-rose-100"
                            }`}>
                              {appt.status === "pending" && "قيد الانتظار"}
                              {appt.status === "in-progress" && "قيد الصيانة"}
                              {appt.status === "completed" && "مكتملة"}
                              {appt.status === "cancelled" && "ملغاة"}
                            </span>
                          </td>

                          {/* Quick Actions */}
                          <td className="p-3 text-left space-x-1 space-x-reverse flex items-center justify-end">
                            
                            {/* Wrench: Mark In Progress */}
                            {appt.status === "pending" && (
                              <button
                                onClick={() => updateAppointmentStatus(appt.id, "in-progress")}
                                className="p-1 bg-blue-50 text-blue-500 rounded hover:bg-blue-100 transition-colors cursor-pointer"
                                title="بدء الصيانة"
                              >
                                <Play className="w-3.5 h-3.5" />
                              </button>
                            )}

                            {/* Check: Mark Completed */}
                            {(appt.status === "pending" || appt.status === "in-progress") && (
                              <button
                                onClick={() => updateAppointmentStatus(appt.id, "completed")}
                                className="p-1 bg-emerald-50 text-emerald-500 rounded hover:bg-emerald-100 transition-colors cursor-pointer"
                                title="إكمال وتسليم"
                              >
                                <CheckCircle className="w-3.5 h-3.5" />
                              </button>
                            )}

                            {/* Cancel: Mark Cancelled */}
                            {appt.status !== "completed" && appt.status !== "cancelled" && (
                              <button
                                onClick={() => updateAppointmentStatus(appt.id, "cancelled")}
                                className="p-1 bg-rose-50 text-rose-500 rounded hover:bg-rose-100 transition-colors cursor-pointer"
                                title="إلغاء الطلب"
                              >
                                <XCircle className="w-3.5 h-3.5" />
                              </button>
                            )}

                            {/* Trash: Delete booking */}
                            <button
                              onClick={() => {
                                if (confirm("هل تريد إزالة هذا الحجز نهائياً من النظام؟")) {
                                  deleteAppointment(appt.id);
                                }
                              }}
                              className="p-1 text-slate-400 hover:text-rose-500 rounded hover:bg-slate-100 transition-colors cursor-pointer"
                              title="حذف الحجز"
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
                <p className="text-xs text-slate-400">تعديل البريد الإلكتروني، رقم الهاتف، وحسابات التواصل الاجتماعي المعروضة بالموقع</p>
              </div>

              <form onSubmit={handleSaveSettings} className="space-y-6 text-right">
                
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

                {/* Submit Action */}
                <div className="flex justify-end pt-3 border-t border-slate-100">
                  <button
                    type="submit"
                    className="bg-[#1a1a1a] hover:bg-slate-800 text-white font-bold text-xs sm:text-sm px-8 py-3 rounded-xl shadow-md transition-all cursor-pointer hover:scale-[1.01]"
                  >
                    حفظ إعدادات الموقع
                  </button>
                </div>

              </form>
            </div>
          )}

        </section>

      </main>

      {/* --- ADD/EDIT PRODUCT MODAL (BENTO DESIGN) --- */}
      {isProductModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="fixed inset-0 bg-black/40 backdrop-blur-sm" onClick={() => setIsProductModalOpen(false)} />
          
          <div className="relative z-50 w-full max-w-md bg-white rounded-2xl border border-card-border p-6 shadow-2xl space-y-4">
            
            <div className="flex justify-between items-center border-b border-slate-100 pb-3">
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

            <form onSubmit={handleSaveProduct} className="space-y-4 text-right">
              
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
                    <option value="ملحقات">ملحقات</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-700">نوع الصورة</label>
                  <select
                    value={productForm.imageType}
                    onChange={(e) => setProductForm({ ...productForm, imageType: e.target.value as "preset" | "url" })}
                    className="w-full text-xs border border-slate-200 rounded-xl px-3 py-2 bg-slate-50 focus:outline-none focus:border-accent cursor-pointer"
                  >
                    <option value="preset">شكل جرافيكي افتراضي (Preset)</option>
                    <option value="url">رابط صورة مخصصة (Image URL)</option>
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
              ) : (
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
                <label className="text-xs font-semibold text-slate-700">المواصفات الفنية (كل ميزة في سطر منفصل)</label>
                <textarea
                  value={productForm.specs}
                  onChange={(e) => setProductForm({ ...productForm, specs: e.target.value })}
                  placeholder="مثال:&#10;قوة شحن 120 واط&#10;منفذ شحن USB-C&#10;حماية ضد التماس الكهربائي"
                  rows={3}
                  className="w-full text-xs border border-slate-200 rounded-xl px-3 py-2 bg-slate-50 focus:outline-none focus:border-accent resize-none font-mono"
                />
              </div>

              {/* Price */}
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

              {/* Discount Price */}
              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-700">سعر العرض/الخصم (بالدينار العراقي IQD - اختياري)</label>
                <input
                  type="number"
                  value={productForm.discountPrice || ""}
                  onChange={(e) => setProductForm({ ...productForm, discountPrice: parseInt(e.target.value) || 0 })}
                  placeholder="اتركه فارغاً أو 0 إذا لم يكن هناك خصم..."
                  className="w-full text-xs border border-slate-200 rounded-xl px-3 py-2 bg-slate-50 focus:outline-none focus:border-accent font-mono"
                />
                <p className="text-[10px] text-slate-400">إذا تم إدخال سعر خصم أقل من السعر الأصلي، سيظهر المنتج كـ "عرض مميز" تلقائياً.</p>
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

              {/* Action Buttons */}
              <div className="flex gap-3 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsProductModalOpen(false)}
                  className="flex-1 border border-slate-200 text-slate-600 font-bold py-2 rounded-xl text-xs cursor-pointer text-center"
                >
                  إلغاء
                </button>
                <button
                  type="submit"
                  className="flex-1 bg-accent hover:bg-accent-hover text-white font-bold py-2 rounded-xl text-xs shadow-md cursor-pointer text-center"
                >
                  حفظ البيانات
                </button>
              </div>

            </form>
          </div>
        </div>
      )}

    </div>
  );
}
