"use client";

import React, { createContext, useContext, useState, useEffect } from "react";
import { supabase, deleteImageFromSupabase } from "@/lib/supabase";
import { CheckCircle2, ShoppingBag, X } from "lucide-react";
import ProductMockup from "@/components/ProductMockup";

// Helper to check if a product is a mobile device
export const isMobileProduct = (product: Product | { category?: string } | null | undefined): boolean => {
  if (!product || !product.category) return false;
  const cat = product.category.trim().toLowerCase();
  return (
    cat === "موبايلات" ||
    cat === "موبايل" ||
    cat === "هواتف" ||
    cat === "هاتف" ||
    cat === "mobiles" ||
    cat === "mobile" ||
    cat === "phones" ||
    cat === "phone"
  );
};

// Types
export interface Product {
  id: string;
  name: string;
  nameEn: string;
  price: number;
  discountPrice?: number | null;
  image: string;
  category: string;
  description?: string;
  specs?: string;
  isPopular?: boolean;
  colors?: Array<{ name: string; hex: string; image?: string | null }> | null;
  storages?: string[] | null;
  rating?: number | null;
  reviewsCount?: number | null;
  ports?: string[] | null;
  isOutOfStock?: boolean;
}

// Database Helpers & Mappers
const mapDBProduct = (dbProd: any): Product => {
  let storagesList: string[] | null = null;
  const rawStorage = dbProd.storage !== undefined && dbProd.storage !== null ? dbProd.storage : dbProd.storages;
  if (rawStorage) {
    if (Array.isArray(rawStorage)) {
      storagesList = rawStorage;
    } else if (typeof rawStorage === 'string') {
      try {
        const parsed = JSON.parse(rawStorage);
        if (Array.isArray(parsed)) {
          storagesList = parsed;
        } else {
          storagesList = rawStorage.split(',').map((s: string) => s.trim()).filter(Boolean);
        }
      } catch {
        storagesList = rawStorage.split(',').map((s: string) => s.trim()).filter(Boolean);
      }
    }
  }

  return {
    id: dbProd.id,
    name: dbProd.name,
    nameEn: dbProd.nameen || dbProd.nameEn || "",
    price: dbProd.price,
    discountPrice: dbProd.discount_price || undefined,
    image: dbProd.image,
    category: dbProd.category,
    description: dbProd.description || "",
    specs: dbProd.specs || "",
    isPopular: dbProd.is_popular || dbProd.isPopular || false,
    colors: dbProd.colors || null,
    storages: storagesList,
    rating: dbProd.rating !== undefined && dbProd.rating !== null ? Number(dbProd.rating) : 5,
    reviewsCount: dbProd.reviews_count !== undefined && dbProd.reviews_count !== null ? Number(dbProd.reviews_count) : 24,
    ports: dbProd.ports || null,
    isOutOfStock: dbProd.is_out_of_stock || dbProd.isOutOfStock || false,
  };
};

const mapLocalProductToDB = (prod: Partial<Product>) => {
  const dbProd: any = {};
  if (prod.id !== undefined) dbProd.id = prod.id;
  if (prod.name !== undefined) dbProd.name = prod.name;
  if (prod.nameEn !== undefined) dbProd.nameen = prod.nameEn;
  if (prod.price !== undefined) dbProd.price = prod.price;
  if (prod.discountPrice !== undefined) {
    dbProd.discount_price = (prod.discountPrice === null || prod.discountPrice === 0) ? 0 : prod.discountPrice;
  }
  if (prod.image !== undefined) dbProd.image = prod.image;
  if (prod.category !== undefined) dbProd.category = prod.category;
  if (prod.description !== undefined) dbProd.description = prod.description;
  if (prod.specs !== undefined) dbProd.specs = prod.specs;
  if (prod.isPopular !== undefined) dbProd.is_popular = prod.isPopular;
  if (prod.colors !== undefined) dbProd.colors = prod.colors;
  if (prod.storages !== undefined) {
    dbProd.storage = Array.isArray(prod.storages) ? prod.storages.join(", ") : prod.storages;
  }
  if (prod.rating !== undefined) dbProd.rating = prod.rating;
  if (prod.reviewsCount !== undefined) dbProd.reviews_count = prod.reviewsCount;
  if (prod.ports !== undefined) dbProd.ports = prod.ports;
  if (prod.isOutOfStock !== undefined) dbProd.is_out_of_stock = prod.isOutOfStock;
  return dbProd;
};

const mapDBAppointment = (dbAppt: any): Appointment => {
  let techNotes = dbAppt.technotes || dbAppt.techNotes || "";
  let cost = dbAppt.cost !== undefined ? Number(dbAppt.cost) : undefined;
  let estimatedReady = dbAppt.estimatedready || dbAppt.estimatedReady || "";
  let trackingCode = dbAppt.trackingcode || dbAppt.trackingCode || "";
  let detailsText = dbAppt.details || "";

  if (typeof detailsText === "string" && detailsText.startsWith("__TRACK_META__:")) {
    try {
      const parsed = JSON.parse(detailsText.replace("__TRACK_META__:", ""));
      detailsText = parsed.details || "";
      if (!techNotes) techNotes = parsed.techNotes || "";
      if (cost === undefined && parsed.cost !== undefined) cost = parsed.cost;
      if (!estimatedReady) estimatedReady = parsed.estimatedReady || "";
      if (!trackingCode) trackingCode = parsed.trackingCode || "";
    } catch (e) {
      // Ignore parse error and keep detailsText
    }
  }

  const idStr = String(dbAppt.id || "");
  if (!trackingCode) {
    const cleanNum = idStr.replace(/\D/g, "").slice(-4) || String(Math.abs(idStr.split("").reduce((a, c) => a + c.charCodeAt(0), 1000))).slice(-4);
    trackingCode = `RWN-R${cleanNum.padStart(4, "0")}`;
  }

  return {
    id: dbAppt.id,
    trackingCode,
    name: dbAppt.name,
    phone: dbAppt.phone,
    device: dbAppt.device,
    issueType: dbAppt.issuetype || dbAppt.issueType || "",
    details: detailsText,
    techNotes,
    cost,
    estimatedReady,
    date: dbAppt.date,
    timeSlot: dbAppt.timeslot || dbAppt.timeSlot || "",
    status: dbAppt.status || "pending",
    createdAt: dbAppt.createdat || dbAppt.createdAt || new Date().toISOString()
  };
};

const mapLocalAppointmentToDB = (appt: any) => {
  const dbAppt: any = {};
  if (appt.id !== undefined) dbAppt.id = appt.id;
  if (appt.name !== undefined) dbAppt.name = appt.name;
  if (appt.phone !== undefined) dbAppt.phone = appt.phone;
  if (appt.device !== undefined) dbAppt.device = appt.device;
  if (appt.issueType !== undefined) dbAppt.issuetype = appt.issueType;
  if (appt.date !== undefined) dbAppt.date = appt.date;
  if (appt.timeSlot !== undefined) dbAppt.timeslot = appt.timeSlot;
  if (appt.status !== undefined) dbAppt.status = appt.status;
  if (appt.createdAt !== undefined) dbAppt.createdat = appt.createdAt;

  const metaObj = {
    details: appt.details || "",
    techNotes: appt.techNotes || "",
    cost: appt.cost,
    estimatedReady: appt.estimatedReady || "",
    trackingCode: appt.trackingCode || ""
  };
  dbAppt.details = `__TRACK_META__:${JSON.stringify(metaObj)}`;

  return dbAppt;
};

export interface CartItem {
  product: Product;
  quantity: number;
  selectedColor?: { name: string; hex: string; image?: string | null } | null;
  selectedPort?: string | null;
  selectedStorage?: string | null;
}

export interface OrderItem {
  productId: string;
  productName: string;
  price: number;
  quantity: number;
  selectedColor?: { name: string; hex: string; image?: string | null } | null;
  selectedPort?: string | null;
  selectedStorage?: string | null;
}

export type OrderStatus = "pending" | "preparing" | "shipping" | "delivered" | "cancelled";

export interface Order {
  id: string;
  orderNumber: string;
  customerName: string;
  customerPhone: string;
  customerAddress: string;
  items: OrderItem[];
  subtotal: number;
  shippingFee: number;
  couponCode?: string | null;
  discountAmount: number;
  totalAmount: number;
  status: OrderStatus;
  notes?: string;
  createdAt: string;
}

const mapDBOrder = (dbOrder: any): Order => {
  let parsedItems: OrderItem[] = [];
  if (typeof dbOrder.items === "string") {
    try {
      parsedItems = JSON.parse(dbOrder.items);
    } catch {
      parsedItems = [];
    }
  } else if (Array.isArray(dbOrder.items)) {
    parsedItems = dbOrder.items;
  }

  return {
    id: dbOrder.id,
    orderNumber: dbOrder.order_number || dbOrder.orderNumber || `RWN-${dbOrder.id?.slice(0, 5) || "0000"}`,
    customerName: dbOrder.customer_name || dbOrder.customerName || "",
    customerPhone: dbOrder.customer_phone || dbOrder.customerPhone || "",
    customerAddress: dbOrder.customer_address || dbOrder.customerAddress || "",
    items: parsedItems,
    subtotal: Number(dbOrder.subtotal) || 0,
    shippingFee: Number(dbOrder.shipping_fee ?? dbOrder.shippingFee) || 0,
    couponCode: dbOrder.coupon_code || dbOrder.couponCode || null,
    discountAmount: Number(dbOrder.discount_amount ?? dbOrder.discountAmount) || 0,
    totalAmount: Number(dbOrder.total_amount ?? dbOrder.totalAmount) || 0,
    status: dbOrder.status || "pending",
    notes: dbOrder.notes || "",
    createdAt: dbOrder.created_at || dbOrder.createdAt || new Date().toISOString(),
  };
};

const mapLocalOrderToDB = (order: Order) => ({
  id: order.id,
  order_number: order.orderNumber,
  customer_name: order.customerName,
  customer_phone: order.customerPhone,
  customer_address: order.customerAddress,
  items: JSON.stringify(order.items),
  subtotal: order.subtotal,
  shipping_fee: order.shippingFee,
  coupon_code: order.couponCode || null,
  discount_amount: order.discountAmount,
  total_amount: order.totalAmount,
  status: order.status,
  notes: order.notes || "",
  created_at: order.createdAt,
});

export type RepairStatus =
  | "pending"
  | "diagnosing"
  | "in-progress"
  | "testing"
  | "ready"
  | "completed"
  | "cancelled";

export interface Appointment {
  id: string;
  trackingCode?: string;
  name: string;
  phone: string;
  device: string;
  issueType: string;
  details?: string;
  techNotes?: string;
  cost?: number;
  estimatedReady?: string;
  date: string;
  timeSlot: string;
  status: RepairStatus;
  createdAt: string;
}

export type CouponAppliesTo = "store" | "repair" | "both";
export type CouponDiscountType = "percent" | "fixed";

export interface CouponCampaign {
  id: string;
  name: string;
  description: string;
  source: string;
  medium: string;
  campaign: string;
  isActive: boolean;
  startsAt: string;
  endsAt: string;
  landingTitle: string;
  landingSubtitle: string;
  qrNote: string;
  createdAt: string;
}

export interface CouponCode {
  id: string;
  campaignId: string;
  code: string;
  discountType: CouponDiscountType;
  discountValue: number;
  appliesTo: CouponAppliesTo;
  minOrderAmount: number;
  maxUses: number;
  usedCount: number;
  scanCount: number;
  isActive: boolean;
  expiresAt: string;
  createdAt: string;
  lastUsedAt?: string;
}

export interface AppliedCoupon {
  code: string;
  discountAmount: number;
  label: string;
  appliesTo: CouponAppliesTo;
  campaignId: string;
}

export interface CouponValidationResult {
  isValid: boolean;
  message: string;
  coupon?: CouponCode;
  discountAmount: number;
  label: string;
}

export interface PromoBanner {
  isEnabled: boolean;
  badge: string;
  title: string;
  description: string;
  buttonText: string;
  buttonLink: string;
  bgStyle: string;
}

export interface PartnerSiteSettings {
  name: string;
  url: string;
}

export interface SiteSettings {
  email: string;
  phone: string;
  address?: string;
  socials: Array<{ platform: string; url: string; name: string }>;
  shippingFee: string;
  promoBanner: PromoBanner;
  partnerSite: PartnerSiteSettings;
  logo: { url: string };
}

export interface SlideItem {
  id: string;
  tabLabel: string;
  badge: string;
  title: string;
  titleAccent: string;
  description: string;
  btnText: string;
  btnLink?: string;
  actionType: "link" | "repair";
  bgStyle: string;
  theme: "dark" | "light";
  graphicType: "macbook" | "iphone" | "repair" | "accessories" | "custom" | "product";
  customImageUrl?: string;
  productId?: string;
}

export interface MarqueeSettings {
  isEnabled: boolean;
  items: string[];
}

export interface FlashSale {
  isEnabled: boolean;
  productId: string;
  discountPrice: number;
  endTime: string;
  stockLimit: number;
  initialStock: number;
}

export interface ProductBundle {
  id: string;
  title: string;
  description: string;
  productIds: string[];
  price: number;
  bgStyle: string;
}

export interface PromoPopUp {
  isEnabled: boolean;
  title: string;
  description: string;
  imageUrl: string;
  btnText: string;
  btnLink: string;
}

export interface PremiumShowcase {
  isEnabled: boolean;
  badge: string;
  title: string;
  subtitle: string;
  heroProductId: string;
  productIds: string[];
  ctaText: string;
  theme: "titanium" | "aqua" | "blush";
}

export const DEFAULT_PREMIUM_SHOWCASE: PremiumShowcase = {
  isEnabled: true,
  badge: "العروض الأقوى",
  title: "عروض الروان المميزة",
  subtitle: "منتجات مختارة بعروض قوية وتجربة عرض مرتبة مثل واجهات المتاجر العالمية.",
  heroProductId: "",
  productIds: [],
  ctaText: "شاهد العرض",
  theme: "titanium",
};

export interface GalleryItem {
  id: string;
  productId: string;
  imageUrl: string;
}

export interface GalleryShowcase {
  isEnabled: boolean;
  title: string;
  subtitle: string;
  items: GalleryItem[];
}

export const DEFAULT_GALLERY_SHOWCASE: GalleryShowcase = {
  isEnabled: true,
  title: "أحدث المنتجات. ألقِ نظرة على ما هو جديد الآن.",
  subtitle: "استكشف أحدث الأجهزة والملحقات المميزة المضافة حديثاً في المركز.",
  items: [],
};

interface AppContextType {
  products: Product[];
  appointments: Appointment[];
  cartItems: CartItem[];
  wishlist: string[];
  siteSettings: SiteSettings;
  heroSlides: SlideItem[];
  marqueeSettings: MarqueeSettings;
  flashSale: FlashSale;
  productBundles: ProductBundle[];
  promoPopUp: PromoPopUp;
  premiumShowcase: PremiumShowcase;
  couponCampaigns: CouponCampaign[];
  couponCodes: CouponCode[];
  appliedCoupon: AppliedCoupon | null;
  addProduct: (product: Omit<Product, "id">) => void;
  updateProduct: (id: string, product: Partial<Product>) => void;
  deleteProduct: (id: string) => void;
  addAppointment: (appointment: Omit<Appointment, "id" | "status" | "createdAt"> & { status?: Appointment["status"]; trackingCode?: string }) => Promise<Appointment>;
  updateAppointmentStatus: (id: string, status: Appointment["status"]) => void;
  updateAppointmentDetails: (id: string, updates: Partial<Appointment>) => Promise<void>;
  getRepairByTrackingCode: (query: string) => Appointment | undefined;
  getRepairsByPhone: (phone: string) => Appointment[];
  deleteAppointment: (id: string) => void;
  addToCart: (
    product: Product,
    selectedColor?: { name: string; hex: string; image?: string | null } | null,
    selectedPort?: string | null,
    selectedStorage?: string | null
  ) => void;
  removeFromCart: (
    productId: string,
    selectedColorName?: string | null,
    selectedPort?: string | null,
    selectedStorage?: string | null
  ) => void;
  updateCartQuantity: (
    productId: string,
    quantity: number,
    selectedColorName?: string | null,
    selectedPort?: string | null,
    selectedStorage?: string | null
  ) => void;
  clearCart: () => void;
  toggleWishlist: (productId: string) => void;
  updateSiteSettings: (settings: Partial<SiteSettings>) => Promise<void>;
  updateHeroSlides: (slides: SlideItem[]) => Promise<void>;
  updateMarqueeSettings: (settings: MarqueeSettings) => Promise<void>;
  updateFlashSale: (sale: FlashSale) => Promise<void>;
  updateProductBundles: (bundles: ProductBundle[]) => Promise<void>;
  updatePromoPopUp: (popup: PromoPopUp) => Promise<void>;
  updatePremiumShowcase: (settings: PremiumShowcase) => Promise<void>;
  updateCoupons: (campaigns: CouponCampaign[], codes: CouponCode[]) => Promise<void>;
  applyCoupon: (code: string, appliesTo: CouponAppliesTo, subtotal?: number, eligibleSubtotal?: number) => CouponValidationResult;
  validateCoupon: (code: string, appliesTo: CouponAppliesTo, subtotal?: number, eligibleSubtotal?: number) => CouponValidationResult;
  validateCouponLive: (code: string, appliesTo: CouponAppliesTo, subtotal?: number, eligibleSubtotal?: number) => Promise<CouponValidationResult>;
  clearAppliedCoupon: () => void;
  recordCouponScan: (code: string) => Promise<void>;
  recordCouponUse: (code: string, appliesTo: CouponAppliesTo, subtotal?: number) => Promise<void>;
  addBundleToCart: (productIds: string[]) => void;
  galleryShowcase: GalleryShowcase;
  updateGalleryShowcase: (settings: GalleryShowcase) => Promise<void>;
  orders: Order[];
  addOrder: (order: Omit<Order, "id" | "orderNumber" | "createdAt"> & { orderNumber?: string }) => Promise<Order>;
  updateOrderStatus: (id: string, status: OrderStatus) => Promise<void>;
  deleteOrder: (id: string) => Promise<void>;
  isInitialized: boolean;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export function AppProvider({ children }: { children: React.ReactNode }) {
  const [products, setProducts] = useState<Product[]>([]);
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [siteSettings, setSiteSettings] = useState<SiteSettings>({
    email: "support@mobileworld.com",
    phone: "0771 165 0096",
    address: "العراق، الناصرية، الصالحية، شارع التقاعد، قرب دائرة التقاعد",
    socials: [
      { platform: "facebook", url: "#", name: "فيسبوك" },
      { platform: "instagram", url: "#", name: "إنستغرام" },
      { platform: "whatsapp", url: "#", name: "واتساب" }
    ],
    shippingFee: "مجاني",
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
  const [heroSlides, setHeroSlides] = useState<SlideItem[]>([]);
  const [wishlist, setWishlist] = useState<string[]>([]);

  // Premium Toast Notification State
  const [toast, setToast] = useState<{
    isOpen: boolean;
    message: string;
    productName?: string;
    productImage?: string;
  } | null>(null);

  const triggerToast = (productName: string, productImage: string, message: string) => {
    setToast({
      isOpen: true,
      message,
      productName,
      productImage,
    });
  };

  useEffect(() => {
    if (toast?.isOpen) {
      const timer = setTimeout(() => {
        setToast((prev) => prev ? { ...prev, isOpen: false } : null);
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [toast]);
  const [marqueeSettings, setMarqueeSettings] = useState<MarqueeSettings>({
    isEnabled: false,
    items: [
      "🚚 توصيل سريع ومجاني لكافة محافظات العراق عند الشراء بأكثر من 50 ألف د.ع",
      "🔧 صيانة فورية معتمدة بضمان حقيقي يصل إلى 3 أيام",
      "✨ خصومات تصل إلى 25% على الملحقات والشواحن الأصلية"
    ]
  });
  const [flashSale, setFlashSale] = useState<FlashSale>({
    isEnabled: false,
    productId: "",
    discountPrice: 0,
    endTime: new Date(Date.now() + 8 * 3600000).toISOString(),
    stockLimit: 5,
    initialStock: 10
  });
  const [productBundles, setProductBundles] = useState<ProductBundle[]>([]);
  const [premiumShowcase, setPremiumShowcase] = useState<PremiumShowcase>(DEFAULT_PREMIUM_SHOWCASE);
  const [galleryShowcase, setGalleryShowcase] = useState<GalleryShowcase>(DEFAULT_GALLERY_SHOWCASE);
  const [couponCampaigns, setCouponCampaigns] = useState<CouponCampaign[]>([]);
  const [couponCodes, setCouponCodes] = useState<CouponCode[]>([]);
  const [appliedCoupon, setAppliedCoupon] = useState<AppliedCoupon | null>(null);
  const [promoPopUp, setPromoPopUp] = useState<PromoPopUp>({
    isEnabled: false,
    title: "مرحباً بك في مركز الروان!",
    description: "احصل على خصم فوري بقيمة 10% على صيانة جهازك الأول عند الحجز الآن.",
    imageUrl: "",
    btnText: "احجز صيانة الآن",
    btnLink: "#repair"
  });
  const [isInitialized, setIsInitialized] = useState(false);

  // Load from Supabase & LocalStorage
  useEffect(() => {
    const fetchInitialData = async () => {
      try {
        // Fetch products
        const { data: productsData, error: productsError } = await supabase
          .from("products")
          .select("*")
          .order('created_at', { ascending: false });

        if (productsError) throw productsError;
        if (productsData) setProducts(productsData.map(mapDBProduct));

        // Fetch site settings
        const { data: settingsData, error: settingsError } = await supabase
          .from("site_settings")
          .select("*");

        if (!settingsError && settingsData) {
          const contactObj = settingsData.find((s: any) => s.key === "contact")?.value;
          const socialsObj = settingsData.find((s: any) => s.key === "socials")?.value;
          const shippingObj = settingsData.find((s: any) => s.key === "shipping")?.value;
          const promoBannerObj = settingsData.find((s: any) => s.key === "promo_banner")?.value;
          const partnerSiteObj = settingsData.find((s: any) => s.key === "partner_site")?.value;
          const logoObj = settingsData.find((s: any) => s.key === "logo")?.value;
          const heroSlidesObj = settingsData.find((s: any) => s.key === "hero_slides")?.value;

          setSiteSettings((prev) => ({
            email: contactObj?.email || prev.email,
            phone: contactObj?.phone || prev.phone,
            address: contactObj?.address || prev.address,
            socials: Array.isArray(socialsObj) ? socialsObj : prev.socials,
            shippingFee: shippingObj?.fee !== undefined ? shippingObj.fee : prev.shippingFee,
            promoBanner: {
              isEnabled: promoBannerObj?.isEnabled !== undefined ? promoBannerObj.isEnabled : prev.promoBanner.isEnabled,
              badge: promoBannerObj?.badge || prev.promoBanner.badge,
              title: promoBannerObj?.title || prev.promoBanner.title,
              description: promoBannerObj?.description || prev.promoBanner.description,
              buttonText: promoBannerObj?.buttonText || prev.promoBanner.buttonText,
              buttonLink: promoBannerObj?.buttonLink || prev.promoBanner.buttonLink,
              bgStyle: promoBannerObj?.bgStyle || prev.promoBanner.bgStyle,
            },
            partnerSite: {
              name: typeof partnerSiteObj?.name === "string" ? partnerSiteObj.name : prev.partnerSite.name,
              url: typeof partnerSiteObj?.url === "string" ? partnerSiteObj.url : prev.partnerSite.url,
            },
            logo: {
              url: typeof logoObj?.url === "string" ? logoObj.url : prev.logo.url,
            }
          }));

          if (heroSlidesObj && Array.isArray(heroSlidesObj)) {
            setHeroSlides(heroSlidesObj);
          } else {
            setHeroSlides([]);
          }

          const marqueeObj = settingsData.find((s: any) => s.key === "marquee_settings")?.value;
          const flashSaleObj = settingsData.find((s: any) => s.key === "flash_sale")?.value;
          const bundlesObj = settingsData.find((s: any) => s.key === "product_bundles")?.value;
          const promoPopUpObj = settingsData.find((s: any) => s.key === "promo_popup")?.value;
          const premiumShowcaseObj = settingsData.find((s: { key: string; value: unknown }) => s.key === "premium_showcase")?.value as Partial<PremiumShowcase> | undefined;
          const galleryShowcaseObj = settingsData.find((s: any) => s.key === "gallery_showcase")?.value as Partial<GalleryShowcase> | undefined;
          const couponMarketingObj = settingsData.find((s: any) => s.key === "coupon_marketing")?.value;

          if (marqueeObj) setMarqueeSettings(marqueeObj);
          if (flashSaleObj) setFlashSale(flashSaleObj);
          if (Array.isArray(bundlesObj)) setProductBundles(bundlesObj);
          if (promoPopUpObj) setPromoPopUp(promoPopUpObj);
          if (couponMarketingObj) {
            if (Array.isArray(couponMarketingObj.campaigns)) setCouponCampaigns(couponMarketingObj.campaigns);
            if (Array.isArray(couponMarketingObj.codes)) setCouponCodes(couponMarketingObj.codes);
          }
          if (premiumShowcaseObj) {
            const premiumTheme = premiumShowcaseObj.theme;
            const theme: PremiumShowcase["theme"] = premiumTheme === "titanium" || premiumTheme === "aqua" || premiumTheme === "blush"
              ? premiumTheme
              : DEFAULT_PREMIUM_SHOWCASE.theme;

            setPremiumShowcase({
              ...DEFAULT_PREMIUM_SHOWCASE,
              ...premiumShowcaseObj,
              heroProductId: typeof premiumShowcaseObj.heroProductId === "string" ? premiumShowcaseObj.heroProductId : "",
              productIds: Array.isArray(premiumShowcaseObj.productIds) ? premiumShowcaseObj.productIds : [],
              theme,
            });
          }

          if (galleryShowcaseObj) {
            setGalleryShowcase({
              ...DEFAULT_GALLERY_SHOWCASE,
              ...galleryShowcaseObj,
              items: Array.isArray(galleryShowcaseObj.items) ? galleryShowcaseObj.items : [],
            });
          }
        } else {
          setHeroSlides([]);
        }

        // Fetch appointments
        const { data: apptsData, error: apptsError } = await supabase
          .from("appointments")
          .select("*")
          .order('createdat', { ascending: false });

        if (apptsError) throw apptsError;
        if (apptsData) setAppointments(apptsData.map(mapDBAppointment));

        // Fetch Orders
        try {
          const { data: ordersData, error: ordersError } = await supabase
            .from("orders")
            .select("*")
            .order("created_at", { ascending: false });

          if (!ordersError && ordersData && ordersData.length > 0) {
            const mappedOrders = ordersData.map(mapDBOrder);
            setOrders(mappedOrders);
            if (typeof window !== "undefined") {
              localStorage.setItem("mw_orders", JSON.stringify(mappedOrders));
            }
          } else {
            const storedOrders = localStorage.getItem("mw_orders");
            if (storedOrders) {
              setOrders(JSON.parse(storedOrders));
            }
          }
        } catch {
          const storedOrders = localStorage.getItem("mw_orders");
          if (storedOrders) {
            setOrders(JSON.parse(storedOrders));
          }
        }

        // Load Cart from LocalStorage
        const storedCart = localStorage.getItem("mw_cart");
        if (storedCart) {
          setCartItems(JSON.parse(storedCart));
        }

        // Load Wishlist from LocalStorage
        const storedWishlist = localStorage.getItem("mw_wishlist");
        if (storedWishlist) {
          setWishlist(JSON.parse(storedWishlist));
        }

        const storedCoupon = localStorage.getItem("mw_applied_coupon");
        if (storedCoupon) {
          setAppliedCoupon(JSON.parse(storedCoupon));
        }
      } catch (e) {
        console.error("Error fetching data from Supabase", e);
      } finally {
        setIsInitialized(true);
      }
    };

    fetchInitialData();
  }, []);

  // Save Cart to LocalStorage helper
  const saveCartToStorage = (data: CartItem[]) => {
    if (typeof window !== "undefined") {
      localStorage.setItem("mw_cart", JSON.stringify(data));
    }
  };

  // Product Actions
  const addProduct = async (newProduct: Omit<Product, "id">) => {
    const product: Product = {
      ...newProduct,
      id: `prod-${Date.now()}`,
    };

    const previousProducts = products;
    // Optimistic UI Update
    const updated = [product, ...products];
    setProducts(updated);

    // Supabase Update
    const dbPayload = mapLocalProductToDB(product);
    const { error } = await supabase.from("products").insert([dbPayload]);
    if (error) {
      console.error("Error adding product to Supabase", error);
      alert(`حدث خطأ أثناء إضافة المنتج إلى قاعدة البيانات: ${error.message || error.details || "يرجى التحقق من الاتصال والصلاحيات."}`);
      setProducts(previousProducts);
      throw error;
    }
  };

  const updateProduct = async (id: string, updatedFields: Partial<Product>) => {
    const oldProduct = products.find((p) => p.id === id);
    const oldImage = oldProduct?.image;
    const newImage = updatedFields.image;

    // Optimistic UI Update
    const updated = products.map((prod) =>
      prod.id === id ? { ...prod, ...updatedFields } : prod
    );
    setProducts(updated);

    // Supabase Update
    const dbPayload = mapLocalProductToDB(updatedFields);
    const { data, error } = await supabase
      .from("products")
      .update(dbPayload)
      .eq("id", id)
      .select();

    if (error) {
      console.error("Error updating product in Supabase", error);
      alert(`حدث خطأ أثناء تحديث المنتج في قاعدة البيانات: ${error.message || error.details}`);
    } else if (!data || data.length === 0) {
      console.warn("Product update did not match any row or was blocked by RLS policies.");
      alert("لم يتم تحديث المنتج في قاعدة البيانات. قد يكون ذلك بسبب انتهاء صلاحية الجلسة أو قيود الحماية (RLS). يرجى إعادة تسجيل الدخول.");
    } else {
      // Delete the old custom image if the image has changed
      if (oldImage && newImage && oldImage !== newImage) {
        await deleteImageFromSupabase(oldImage);
      }
    }
  };

  const deleteProduct = async (id: string) => {
    // Find image URL before deleting
    const productToDelete = products.find((p) => p.id === id);
    const oldImage = productToDelete?.image;

    // Optimistic UI Update
    const updated = products.filter((prod) => prod.id !== id);
    setProducts(updated);

    // Remove from cart
    const updatedCart = cartItems.filter((item) => item.product.id !== id);
    setCartItems(updatedCart);
    saveCartToStorage(updatedCart);

    // Supabase Update
    const { error } = await supabase.from("products").delete().eq("id", id);
    if (error) {
      console.error("Error deleting product from Supabase", error);
    } else if (oldImage) {
      await deleteImageFromSupabase(oldImage);
    }
  };

  // Appointment Actions
  const addAppointment = async (newAppt: Omit<Appointment, "id" | "status" | "createdAt"> & { status?: Appointment["status"]; trackingCode?: string }): Promise<Appointment> => {
    const randomSuffix = Math.floor(1000 + Math.random() * 9000);
    const trackingCode = newAppt.trackingCode || `RWN-R${randomSuffix}`;
    const appt: Appointment = {
      ...newAppt,
      id: `rep-${Date.now().toString().slice(-4)}${randomSuffix}`,
      trackingCode,
      status: newAppt.status || "pending",
      createdAt: new Date().toISOString(),
    };

    // Optimistic UI Update
    const updated = [appt, ...appointments];
    setAppointments(updated);

    // Supabase Update
    const { error } = await supabase.from("appointments").insert([mapLocalAppointmentToDB(appt)]);
    if (error) {
      console.error("Error adding appointment to Supabase", error);
    }
    return appt;
  };

  const updateAppointmentStatus = async (id: string, status: Appointment["status"]) => {
    // Optimistic UI Update
    const updated = appointments.map((appt) =>
      appt.id === id ? { ...appt, status } : appt
    );
    setAppointments(updated);

    const target = updated.find((a) => a.id === id);
    if (target) {
      const dbPayload = mapLocalAppointmentToDB(target);
      const { error } = await supabase
        .from("appointments")
        .update(dbPayload)
        .eq("id", id);

      if (error) {
        console.error("Error updating appointment in Supabase", error);
      }
    }
  };

  const updateAppointmentDetails = async (id: string, updates: Partial<Appointment>) => {
    const updated = appointments.map((appt) =>
      appt.id === id ? { ...appt, ...updates } : appt
    );
    setAppointments(updated);

    const target = updated.find((a) => a.id === id);
    if (target) {
      const dbPayload = mapLocalAppointmentToDB(target);
      const { error } = await supabase
        .from("appointments")
        .update(dbPayload)
        .eq("id", id);

      if (error) {
        console.error("Error updating appointment details in Supabase", error);
      }
    }
  };

  const getRepairByTrackingCode = (query: string): Appointment | undefined => {
    if (!query) return undefined;
    const cleanQuery = query.trim().toLowerCase().replace(/[^a-z0-9]/g, "");
    if (!cleanQuery) return undefined;
    return appointments.find((appt) => {
      const idMatch = (appt.id || "").toLowerCase().replace(/[^a-z0-9]/g, "").includes(cleanQuery);
      const trackMatch = (appt.trackingCode || "").toLowerCase().replace(/[^a-z0-9]/g, "").includes(cleanQuery);
      return idMatch || trackMatch;
    });
  };

  const getRepairsByPhone = (phone: string): Appointment[] => {
    if (!phone) return [];
    const cleanPhone = phone.replace(/\D/g, "");
    if (cleanPhone.length < 4) return [];
    return appointments.filter((appt) => {
      const apptPhone = (appt.phone || "").replace(/\D/g, "");
      return apptPhone.includes(cleanPhone) || cleanPhone.includes(apptPhone);
    });
  };

  const deleteAppointment = async (id: string) => {
    // Optimistic UI Update
    const updated = appointments.filter((appt) => appt.id !== id);
    setAppointments(updated);

    // Supabase Update
    const { error } = await supabase.from("appointments").delete().eq("id", id);
    if (error) {
      console.error("Error deleting appointment from Supabase", error);
    }
  };

  // Order Actions
  const addOrder = async (
    newOrder: Omit<Order, "id" | "orderNumber" | "createdAt"> & { orderNumber?: string }
  ): Promise<Order> => {
    const orderNumber = newOrder.orderNumber || `RWN-${Math.floor(10000 + Math.random() * 90000)}`;
    const order: Order = {
      ...newOrder,
      id: `order-${Date.now()}`,
      orderNumber,
      createdAt: new Date().toISOString(),
    };

    const updated = [order, ...orders];
    setOrders(updated);
    if (typeof window !== "undefined") {
      localStorage.setItem("mw_orders", JSON.stringify(updated));
    }

    try {
      await supabase.from("orders").insert([mapLocalOrderToDB(order)]);
    } catch (e) {
      console.warn("Could not insert order into Supabase orders table (fallback active):", e);
    }

    return order;
  };

  const updateOrderStatus = async (id: string, status: OrderStatus) => {
    const updated = orders.map((o) => (o.id === id ? { ...o, status } : o));
    setOrders(updated);
    if (typeof window !== "undefined") {
      localStorage.setItem("mw_orders", JSON.stringify(updated));
    }

    try {
      await supabase.from("orders").update({ status }).eq("id", id);
    } catch (e) {
      console.warn("Could not update order status in Supabase:", e);
    }
  };

  const deleteOrder = async (id: string) => {
    const updated = orders.filter((o) => o.id !== id);
    setOrders(updated);
    if (typeof window !== "undefined") {
      localStorage.setItem("mw_orders", JSON.stringify(updated));
    }

    try {
      await supabase.from("orders").delete().eq("id", id);
    } catch (e) {
      console.warn("Could not delete order from Supabase:", e);
    }
  };

  // Cart Actions (LocalStorage only)
  const addToCart = (
    product: Product,
    selectedColor?: { name: string; hex: string; image?: string | null } | null,
    selectedPort?: string | null,
    selectedStorage?: string | null
  ) => {
    let updated: CartItem[];
    const existing = cartItems.find((item) =>
      item.product.id === product.id &&
      (!selectedColor || item.selectedColor?.name === selectedColor.name) &&
      (!selectedPort || item.selectedPort === selectedPort) &&
      (!selectedStorage || item.selectedStorage === selectedStorage)
    );
    if (existing) {
      updated = cartItems.map((item) =>
        item.product.id === product.id &&
          (!selectedColor || item.selectedColor?.name === selectedColor.name) &&
          (!selectedPort || item.selectedPort === selectedPort) &&
          (!selectedStorage || item.selectedStorage === selectedStorage)
          ? { ...item, quantity: item.quantity + 1 }
          : item
      );
    } else {
      updated = [
        ...cartItems,
        {
          product,
          quantity: 1,
          selectedColor: selectedColor || null,
          selectedPort: selectedPort || null,
          selectedStorage: selectedStorage || null,
        },
      ];
    }
    setCartItems(updated);
    saveCartToStorage(updated);
    triggerToast(product.name, product.image, "تمت إضافة المنتج إلى السلة بنجاح!");
  };

  const removeFromCart = (
    productId: string,
    selectedColorName?: string | null,
    selectedPort?: string | null,
    selectedStorage?: string | null
  ) => {
    const updated = cartItems.filter((item) =>
      !(
        item.product.id === productId &&
        (!selectedColorName || item.selectedColor?.name === selectedColorName) &&
        (!selectedPort || item.selectedPort === selectedPort) &&
        (!selectedStorage || item.selectedStorage === selectedStorage)
      )
    );
    setCartItems(updated);
    saveCartToStorage(updated);
  };

  const updateCartQuantity = (
    productId: string,
    quantity: number,
    selectedColorName?: string | null,
    selectedPort?: string | null,
    selectedStorage?: string | null
  ) => {
    if (quantity <= 0) {
      removeFromCart(productId, selectedColorName, selectedPort, selectedStorage);
      return;
    }
    const updated = cartItems.map((item) =>
      item.product.id === productId &&
        (!selectedColorName || item.selectedColor?.name === selectedColorName) &&
        (!selectedPort || item.selectedPort === selectedPort) &&
        (!selectedStorage || item.selectedStorage === selectedStorage)
        ? { ...item, quantity }
        : item
    );
    setCartItems(updated);
    saveCartToStorage(updated);
  };

  const clearCart = () => {
    setCartItems([]);
    saveCartToStorage([]);
  };

  // Wishlist actions
  const toggleWishlist = (productId: string) => {
    const updated = wishlist.includes(productId)
      ? wishlist.filter((id) => id !== productId)
      : [...wishlist, productId];
    setWishlist(updated);
    if (typeof window !== "undefined") {
      localStorage.setItem("mw_wishlist", JSON.stringify(updated));
    }
  };

  // Site Settings update action
  const updateSiteSettings = async (updated: Partial<SiteSettings>) => {
    // Optimistic UI Update
    const newSettings = { ...siteSettings, ...updated };
    setSiteSettings(newSettings);

    // Update Supabase
    if (updated.email !== undefined || updated.phone !== undefined || updated.address !== undefined) {
      const contactVal = {
        email: updated.email !== undefined ? updated.email : siteSettings.email,
        phone: updated.phone !== undefined ? updated.phone : siteSettings.phone,
        address: updated.address !== undefined ? updated.address : (siteSettings.address || "العراق، الناصرية، الصالحية، شارع التقاعد، قرب دائرة التقاعد"),
      };
      const { error } = await supabase
        .from("site_settings")
        .upsert({ key: "contact", value: contactVal });
      if (error) console.error("Error updating contact settings in Supabase", error);
    }

    if (updated.socials !== undefined) {
      const { error } = await supabase
        .from("site_settings")
        .upsert({ key: "socials", value: updated.socials });
      if (error) console.error("Error updating socials settings in Supabase", error);
    }

    if (updated.shippingFee !== undefined) {
      const { error } = await supabase
        .from("site_settings")
        .upsert({ key: "shipping", value: { fee: updated.shippingFee } });
      if (error) console.error("Error updating shipping settings in Supabase", error);
    }

    if (updated.promoBanner !== undefined) {
      const { error } = await supabase
        .from("site_settings")
        .upsert({ key: "promo_banner", value: updated.promoBanner });
      if (error) console.error("Error updating promo banner settings in Supabase", error);
    }

    if (updated.partnerSite !== undefined) {
      const { error } = await supabase
        .from("site_settings")
        .upsert({ key: "partner_site", value: updated.partnerSite });
      if (error) {
        console.error("Error updating partner site settings in Supabase", error);
        throw error;
      }
    }

    if (updated.logo !== undefined) {
      const { error } = await supabase
        .from("site_settings")
        .upsert({ key: "logo", value: updated.logo });
      if (error) {
        console.error("Error updating logo settings in Supabase", error);
        throw error;
      }
    }
  };

  // Hero Slides update action
  const updateHeroSlides = async (updatedSlides: SlideItem[]) => {
    setHeroSlides(updatedSlides);

    // Update Supabase
    const { error } = await supabase
      .from("site_settings")
      .upsert({ key: "hero_slides", value: updatedSlides });

    if (error) {
      console.error("Error updating hero slides in Supabase", error);
      throw error;
    }
  };

  const updateMarqueeSettings = async (settings: MarqueeSettings) => {
    setMarqueeSettings(settings);
    const { error } = await supabase
      .from("site_settings")
      .upsert({ key: "marquee_settings", value: settings });
    if (error) console.error("Error updating marquee settings in Supabase", error);
  };

  const updateFlashSale = async (sale: FlashSale) => {
    setFlashSale(sale);
    const { error } = await supabase
      .from("site_settings")
      .upsert({ key: "flash_sale", value: sale });
    if (error) console.error("Error updating flash sale settings in Supabase", error);
  };

  const updateProductBundles = async (bundles: ProductBundle[]) => {
    setProductBundles(bundles);
    const { error } = await supabase
      .from("site_settings")
      .upsert({ key: "product_bundles", value: bundles });
    if (error) console.error("Error updating product bundles in Supabase", error);
  };

  const updatePromoPopUp = async (popup: PromoPopUp) => {
    setPromoPopUp(popup);
    const { error } = await supabase
      .from("site_settings")
      .upsert({ key: "promo_popup", value: popup });
    if (error) console.error("Error updating promo popup settings in Supabase", error);
  };

  const updatePremiumShowcase = async (settings: PremiumShowcase) => {
    const normalizedSettings: PremiumShowcase = {
      ...DEFAULT_PREMIUM_SHOWCASE,
      ...settings,
      heroProductId: settings.heroProductId || "",
      productIds: Array.from(new Set((settings.productIds || []).filter(Boolean))),
    };

    setPremiumShowcase(normalizedSettings);

    const { data: updatedRows, error: updateError } = await supabase
      .from("site_settings")
      .update({ value: normalizedSettings })
      .eq("key", "premium_showcase")
      .select("key");

    if (updateError) {
      console.error("Error updating premium showcase settings in Supabase", updateError);
      throw updateError;
    }

    if (!updatedRows || updatedRows.length === 0) {
      const { error: insertError } = await supabase
        .from("site_settings")
        .insert({ key: "premium_showcase", value: normalizedSettings });

      if (insertError) {
        console.error("Error inserting premium showcase settings in Supabase", insertError);
        throw insertError;
      }
    }
  };

  const updateGalleryShowcase = async (settings: GalleryShowcase) => {
    const normalizedSettings: GalleryShowcase = {
      ...DEFAULT_GALLERY_SHOWCASE,
      ...settings,
      items: Array.isArray(settings.items) ? settings.items.filter(item => item.productId && item.imageUrl) : [],
    };

    setGalleryShowcase(normalizedSettings);

    const { error } = await supabase
      .from("site_settings")
      .upsert({ key: "gallery_showcase", value: normalizedSettings });

    if (error) {
      console.error("Error updating gallery showcase settings in Supabase", error);
      throw error;
    }
  };

  const persistCouponData = async (campaigns: CouponCampaign[], codes: CouponCode[]) => {
    const { error } = await supabase
      .from("site_settings")
      .upsert({
        key: "coupon_marketing",
        value: {
          campaigns,
          codes,
          updatedAt: new Date().toISOString(),
        },
      });

    if (error) {
      console.error("Error updating coupon marketing settings in Supabase", error);
    }
  };

  const updateCoupons = async (campaigns: CouponCampaign[], codes: CouponCode[]) => {
    setCouponCampaigns(campaigns);
    setCouponCodes(codes);
    await persistCouponData(campaigns, codes);
  };

  const getCouponLabel = (coupon: CouponCode) => (
    coupon.discountType === "percent"
      ? `خصم ${coupon.discountValue}%`
      : `خصم ${coupon.discountValue.toLocaleString()} د.ع`
  );

  const calculateCouponDiscount = (coupon: CouponCode, subtotal = 0, eligibleSubtotal?: number) => {
    const baseAmount = eligibleSubtotal !== undefined ? eligibleSubtotal : subtotal;
    if (baseAmount <= 0) return 0;
    if (coupon.discountType === "percent") {
      return Math.min(baseAmount, Math.round(baseAmount * (coupon.discountValue / 100)));
    }

    return Math.min(baseAmount, coupon.discountValue);
  };

  const validateCoupon = (rawCode: string, appliesTo: CouponAppliesTo, subtotal = 0, eligibleSubtotal?: number): CouponValidationResult => {
    const normalizedCode = rawCode.trim().toUpperCase();
    const coupon = couponCodes.find((item) => item.code.toUpperCase() === normalizedCode);

    if (!coupon) {
      return {
        isValid: false,
        message: "رمز الخصم غير موجود.",
        discountAmount: 0,
        label: "",
      };
    }

    const campaign = couponCampaigns.find((item) => item.id === coupon.campaignId);
    const now = Date.now();
    const couponExpiry = coupon.expiresAt ? new Date(coupon.expiresAt).getTime() : 0;
    const campaignStarts = campaign?.startsAt ? new Date(campaign.startsAt).getTime() : 0;
    const campaignEnds = campaign?.endsAt ? new Date(campaign.endsAt).getTime() : 0;

    if (!coupon.isActive || (campaign && !campaign.isActive)) {
      return {
        isValid: false,
        message: "هذا الرمز غير فعال حالياً.",
        coupon,
        discountAmount: 0,
        label: getCouponLabel(coupon),
      };
    }

    if (campaignStarts && now < campaignStarts) {
      return {
        isValid: false,
        message: "الحملة لم تبدأ بعد.",
        coupon,
        discountAmount: 0,
        label: getCouponLabel(coupon),
      };
    }

    if ((couponExpiry && now > couponExpiry) || (campaignEnds && now > campaignEnds)) {
      return {
        isValid: false,
        message: "انتهت صلاحية رمز الخصم.",
        coupon,
        discountAmount: 0,
        label: getCouponLabel(coupon),
      };
    }

    if (coupon.maxUses > 0 && coupon.usedCount >= coupon.maxUses) {
      return {
        isValid: false,
        message: "عذراً، تم استخدام هذا الكوبون بالكامل ولا يمكن استخدامه مجدداً.",
        coupon,
        discountAmount: 0,
        label: getCouponLabel(coupon),
      };
    }

    // Prevent reuse of the same coupon code on the same device
    if (typeof window !== "undefined") {
      try {
        const usedCoupons = JSON.parse(localStorage.getItem("mw_used_coupons") || "[]");
        if (Array.isArray(usedCoupons) && usedCoupons.includes(normalizedCode)) {
          return {
            isValid: false,
            message: "لقد قمت باستخدام هذا الرمز مسبقاً على هذا الجهاز.",
            coupon,
            discountAmount: 0,
            label: getCouponLabel(coupon),
          };
        }
      } catch (e) {
        console.error("Error checking used coupons from localStorage", e);
      }
    }

    if (appliesTo !== "both" && coupon.appliesTo !== "both" && coupon.appliesTo !== appliesTo) {
      return {
        isValid: false,
        message: appliesTo === "store" ? "هذا الرمز مخصص للصيانة فقط." : "هذا الرمز مخصص للمتجر فقط.",
        coupon,
        discountAmount: 0,
        label: getCouponLabel(coupon),
      };
    }

    if (coupon.minOrderAmount > 0 && subtotal > 0 && subtotal < coupon.minOrderAmount) {
      return {
        isValid: false,
        message: `هذا الرمز يحتاج طلباً بقيمة ${coupon.minOrderAmount.toLocaleString()} د.ع أو أكثر.`,
        coupon,
        discountAmount: 0,
        label: getCouponLabel(coupon),
      };
    }

    // If eligibleSubtotal is provided and equals 0 (e.g. only mobile phones in cart), discounts do NOT apply to mobiles
    if (appliesTo !== "repair" && eligibleSubtotal !== undefined && eligibleSubtotal <= 0 && subtotal > 0) {
      return {
        isValid: false,
        message: "عذراً، كوبونات الخصم لا تشمل أجهزة الموبايل (تشمل الملحقات وخدمات الصيانة فقط).",
        coupon,
        discountAmount: 0,
        label: getCouponLabel(coupon),
      };
    }

    const discountAmount = calculateCouponDiscount(coupon, subtotal, eligibleSubtotal);

    return {
      isValid: true,
      message: "تم تطبيق رمز الخصم بنجاح.",
      coupon,
      discountAmount,
      label: getCouponLabel(coupon),
    };
  };

  const applyCoupon = (rawCode: string, appliesTo: CouponAppliesTo, subtotal = 0, eligibleSubtotal?: number): CouponValidationResult => {
    const result = validateCoupon(rawCode, appliesTo, subtotal, eligibleSubtotal);

    if (result.isValid && result.coupon) {
      const nextAppliedCoupon: AppliedCoupon = {
        code: result.coupon.code,
        campaignId: result.coupon.campaignId,
        appliesTo: result.coupon.appliesTo,
        discountAmount: result.discountAmount,
        label: result.label,
      };

      setAppliedCoupon(nextAppliedCoupon);
      if (typeof window !== "undefined") {
        localStorage.setItem("mw_applied_coupon", JSON.stringify(nextAppliedCoupon));
      }
    }

    return result;
  };

  const clearAppliedCoupon = () => {
    setAppliedCoupon(null);
    if (typeof window !== "undefined") {
      localStorage.removeItem("mw_applied_coupon");
    }
  };

  const recordCouponScan = async (rawCode: string) => {
    const normalizedCode = rawCode.trim().toUpperCase();
    if (!normalizedCode) return;

    const nextCodes = couponCodes.map((coupon) =>
      coupon.code.toUpperCase() === normalizedCode
        ? { ...coupon, scanCount: (coupon.scanCount || 0) + 1 }
        : coupon
    );

    setCouponCodes(nextCodes);
    await persistCouponData(couponCampaigns, nextCodes);
  };

  const validateCouponLive = async (rawCode: string, appliesTo: CouponAppliesTo, subtotal = 0, eligibleSubtotal?: number): Promise<CouponValidationResult> => {
    try {
      const { data: settingsData, error } = await supabase
        .from("site_settings")
        .select("*")
        .eq("key", "coupon_marketing")
        .single();

      if (!error && settingsData && settingsData.value) {
        const couponMarketingObj = settingsData.value;
        let freshCampaigns = couponCampaigns;
        let freshCodes = couponCodes;

        if (Array.isArray(couponMarketingObj.campaigns)) {
          freshCampaigns = couponMarketingObj.campaigns;
          setCouponCampaigns(freshCampaigns);
        }
        if (Array.isArray(couponMarketingObj.codes)) {
          freshCodes = couponMarketingObj.codes;
          setCouponCodes(freshCodes);
        }

        const normalizedCode = rawCode.trim().toUpperCase();
        const coupon = freshCodes.find((item) => item.code.toUpperCase() === normalizedCode);

        if (!coupon) {
          return {
            isValid: false,
            message: "رمز الخصم غير موجود.",
            discountAmount: 0,
            label: "",
          };
        }

        const campaign = freshCampaigns.find((item) => item.id === coupon.campaignId);
        const now = Date.now();
        const couponExpiry = coupon.expiresAt ? new Date(coupon.expiresAt).getTime() : 0;
        const campaignStarts = campaign?.startsAt ? new Date(campaign.startsAt).getTime() : 0;
        const campaignEnds = campaign?.endsAt ? new Date(campaign.endsAt).getTime() : 0;

        if (!coupon.isActive || (campaign && !campaign.isActive)) {
          return {
            isValid: false,
            message: "هذا الرمز غير فعال حالياً.",
            coupon,
            discountAmount: 0,
            label: getCouponLabel(coupon),
          };
        }

        if (campaignStarts && now < campaignStarts) {
          return {
            isValid: false,
            message: "الحملة لم تبدأ بعد.",
            coupon,
            discountAmount: 0,
            label: getCouponLabel(coupon),
          };
        }

        if ((couponExpiry && now > couponExpiry) || (campaignEnds && now > campaignEnds)) {
          return {
            isValid: false,
            message: "انتهت صلاحية رمز الخصم.",
            coupon,
            discountAmount: 0,
            label: getCouponLabel(coupon),
          };
        }

        if (coupon.maxUses > 0 && coupon.usedCount >= coupon.maxUses) {
          return {
            isValid: false,
            message: "عذراً، تم استخدام هذا الكوبون بالكامل ولا يمكن استخدامه مجدداً.",
            coupon,
            discountAmount: 0,
            label: getCouponLabel(coupon),
          };
        }

        if (typeof window !== "undefined") {
          try {
            const usedCoupons = JSON.parse(localStorage.getItem("mw_used_coupons") || "[]");
            if (Array.isArray(usedCoupons) && usedCoupons.includes(normalizedCode)) {
              return {
                isValid: false,
                message: "لقد قمت باستخدام هذا الرمز مسبقاً على هذا الجهاز.",
                coupon,
                discountAmount: 0,
                label: getCouponLabel(coupon),
              };
            }
          } catch (e) {
            console.error("Error checking used coupons from localStorage", e);
          }
        }

        if (appliesTo !== "both" && coupon.appliesTo !== "both" && coupon.appliesTo !== appliesTo) {
          return {
            isValid: false,
            message: appliesTo === "store" ? "هذا الرمز مخصص للصيانة فقط." : "هذا الرمز مخصص للمتجر فقط.",
            coupon,
            discountAmount: 0,
            label: getCouponLabel(coupon),
          };
        }

        if (coupon.minOrderAmount > 0 && subtotal > 0 && subtotal < coupon.minOrderAmount) {
          return {
            isValid: false,
            message: `هذا الرمز يحتاج طلباً بقيمة ${coupon.minOrderAmount.toLocaleString()} د.ع أو أكثر.`,
            coupon,
            discountAmount: 0,
            label: getCouponLabel(coupon),
          };
        }

        // If eligibleSubtotal is provided and equals 0 (e.g. only mobile phones in cart), discounts do NOT apply to mobiles
        if (appliesTo !== "repair" && eligibleSubtotal !== undefined && eligibleSubtotal <= 0 && subtotal > 0) {
          return {
            isValid: false,
            message: "عذراً، كوبونات الخصم لا تشمل أجهزة الموبايل (تشمل الملحقات وخدمات الصيانة فقط).",
            coupon,
            discountAmount: 0,
            label: getCouponLabel(coupon),
          };
        }

        const discountAmount = calculateCouponDiscount(coupon, subtotal, eligibleSubtotal);

        return {
          isValid: true,
          message: "تم تطبيق رمز الخصم بنجاح.",
          coupon,
          discountAmount,
          label: getCouponLabel(coupon),
        };
      }
    } catch (e) {
      console.error("Error fetching live coupon data from Supabase:", e);
    }

    return validateCoupon(rawCode, appliesTo, subtotal);
  };

  const recordCouponUse = async (rawCode: string, appliesTo: CouponAppliesTo, subtotal = 0) => {
    let latestCampaigns = couponCampaigns;
    let latestCodes = couponCodes;
    try {
      const { data: settingsData, error } = await supabase
        .from("site_settings")
        .select("*")
        .eq("key", "coupon_marketing")
        .single();
      if (!error && settingsData && settingsData.value) {
        if (Array.isArray(settingsData.value.campaigns)) latestCampaigns = settingsData.value.campaigns;
        if (Array.isArray(settingsData.value.codes)) latestCodes = settingsData.value.codes;
      }
    } catch (e) {
      console.error("Error fetching latest coupons in recordCouponUse:", e);
    }

    const normalizedCode = rawCode.trim().toUpperCase();
    const coupon = latestCodes.find((item) => item.code.toUpperCase() === normalizedCode);
    if (!coupon || !coupon.isActive) return;

    if (coupon.maxUses > 0 && coupon.usedCount >= coupon.maxUses) {
      console.warn("Coupon is already fully used in recordCouponUse.");
      return;
    }

    if (typeof window !== "undefined") {
      try {
        const usedCoupons = JSON.parse(localStorage.getItem("mw_used_coupons") || "[]");
        if (Array.isArray(usedCoupons) && !usedCoupons.includes(normalizedCode)) {
          usedCoupons.push(normalizedCode);
          localStorage.setItem("mw_used_coupons", JSON.stringify(usedCoupons));
        }
      } catch (e) {
        console.error("Error saving used coupon to localStorage", e);
      }
    }

    const nextCodes = latestCodes.map((item) =>
      item.code.toUpperCase() === normalizedCode
        ? {
          ...item,
          usedCount: (item.usedCount || 0) + 1,
          lastUsedAt: new Date().toISOString(),
        }
        : item
    );

    setCouponCampaigns(latestCampaigns);
    setCouponCodes(nextCodes);
    clearAppliedCoupon();
    await persistCouponData(latestCampaigns, nextCodes);
  };

  useEffect(() => {
    if (!isInitialized || couponCodes.length === 0 || typeof window === "undefined") return;

    const url = new URL(window.location.href);
    const couponFromQuery = url.searchParams.get("coupon") || url.searchParams.get("code");
    const couponFromPath = url.pathname.startsWith("/promo/")
      ? decodeURIComponent(url.pathname.split("/promo/")[1]?.split("/")[0] || "")
      : "";
    const incomingCode = (couponFromQuery || couponFromPath).trim().toUpperCase();

    if (!incomingCode) return;

    const scanKey = `mw_coupon_scan_${incomingCode}`;
    if (!sessionStorage.getItem(scanKey)) {
      sessionStorage.setItem(scanKey, "1");
      void recordCouponScan(incomingCode);
    }

    const result = applyCoupon(incomingCode, "both", 0);
    if (result.isValid) {
      triggerToast(incomingCode, "cases", "تم حفظ رمز الخصم وسيظهر تلقائياً عند الشراء أو حجز الصيانة.");
    }
    // URL coupon capture should only react when coupons finish loading.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isInitialized, couponCodes.length]);

  const addBundleToCart = (productIds: string[]) => {
    let newCartItems = [...cartItems];

    productIds.forEach((pid) => {
      const product = products.find((p) => p.id === pid);
      if (product) {
        const existingIndex = newCartItems.findIndex((item) => item.product.id === product.id);
        if (existingIndex > -1) {
          newCartItems[existingIndex] = {
            ...newCartItems[existingIndex],
            quantity: newCartItems[existingIndex].quantity + 1
          };
        } else {
          newCartItems.push({ product, quantity: 1 });
        }
      }
    });

    setCartItems(newCartItems);
    saveCartToStorage(newCartItems);
    triggerToast("الحزمة الترويجية المميزة", "cases", "تمت إضافة كافة منتجات الحزمة إلى السلة بنجاح! 📦✨");
  };

  return (
    <AppContext.Provider
      value={{
        products,
        appointments,
        orders,
        cartItems,
        siteSettings,
        heroSlides,
        marqueeSettings,
        flashSale,
        productBundles,
        promoPopUp,
        premiumShowcase,
        couponCampaigns,
        couponCodes,
        appliedCoupon,
        addProduct,
        updateProduct,
        deleteProduct,
        addAppointment,
        updateAppointmentStatus,
        updateAppointmentDetails,
        getRepairByTrackingCode,
        getRepairsByPhone,
        deleteAppointment,
        addOrder,
        updateOrderStatus,
        deleteOrder,
        addToCart,
        removeFromCart,
        updateCartQuantity,
        clearCart,
        wishlist,
        toggleWishlist,
        updateSiteSettings,
        updateHeroSlides,
        updateMarqueeSettings,
        updateFlashSale,
        updateProductBundles,
        updatePromoPopUp,
        updatePremiumShowcase,
        updateGalleryShowcase,
        updateCoupons,
        galleryShowcase,
        applyCoupon,
        validateCoupon,
        validateCouponLive,
        clearAppliedCoupon,
        recordCouponScan,
        recordCouponUse,
        addBundleToCart,
        isInitialized,
      }}
    >
      {children}
      <ToastNotification toast={toast} onClose={() => setToast(null)} />
    </AppContext.Provider>
  );
}

export function useApp() {
  const context = useContext(AppContext);
  if (context === undefined) {
    throw new Error("useApp must be used within an AppProvider");
  }
  return context;
}

// Toast Notification Component
function ToastNotification({
  toast,
  onClose
}: {
  toast: { isOpen: boolean; message: string; productName?: string; productImage?: string } | null;
  onClose: () => void;
}) {
  if (!toast || !toast.isOpen) return null;

  // Helper to resolve preset images just like main app
  const isPreset = (img: string) => [
    "iphone", "samsung", "cases", "headphones", "earbuds", "cable", "smartwatch", "powerbank", "screen-protector"
  ].includes(img) || img.startsWith("charger-");

  return (
    <div className="fixed top-6 left-4 right-4 md:left-auto md:right-6 md:w-96 z-[9999] bg-white/95 backdrop-blur-md border border-slate-200/80 rounded-2xl shadow-2xl p-4 flex items-center gap-3.5 transition-all duration-300 animate-slide-down text-right" dir="rtl">

      {/* Product visual */}
      <div className="w-12 h-12 rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-center p-1 overflow-hidden flex-shrink-0">
        {toast.productImage ? (
          isPreset(toast.productImage) ? (
            <div className="scale-75">
              <ProductMockup image={toast.productImage} name={toast.productName || ""} sizeClass="w-8 aspect-[9/18]" />
            </div>
          ) : (
            <img src={toast.productImage} alt={toast.productName} className="w-full h-full object-contain mix-blend-multiply" />
          )
        ) : (
          <ShoppingBag className="w-5 h-5 text-emerald-500" />
        )}
      </div>

      {/* Text Info */}
      <div className="flex-1 min-w-0">
        <h4 className="text-[11px] font-black text-emerald-600 flex items-center gap-1">
          <CheckCircle2 className="w-3.5 h-3.5" />
          <span>تمت الإضافة للسلة بنجاح</span>
        </h4>
        <p className="text-xs font-bold text-slate-800 truncate mt-0.5" title={toast.productName}>
          {toast.productName}
        </p>
        <p className="text-[10px] text-slate-400 mt-0.5">{toast.message}</p>
      </div>

      {/* Close button */}
      <button
        onClick={onClose}
        className="w-7 h-7 rounded-lg hover:bg-slate-100 flex items-center justify-center text-slate-400 hover:text-slate-600 transition-colors cursor-pointer"
      >
        <X className="w-4 h-4" />
      </button>

    </div>
  );
}
