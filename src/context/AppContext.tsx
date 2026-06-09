"use client";

import React, { createContext, useContext, useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";

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
}

// Database Helpers & Mappers
const mapDBProduct = (dbProd: any): Product => ({
  id: dbProd.id,
  name: dbProd.name,
  nameEn: dbProd.nameen || dbProd.nameEn || "",
  price: dbProd.price,
  discountPrice: dbProd.discount_price || undefined,
  image: dbProd.image,
  category: dbProd.category,
  description: dbProd.description || "",
  specs: dbProd.specs || "",
  isPopular: dbProd.is_popular || dbProd.isPopular || false
});

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
  return dbProd;
};

const mapDBAppointment = (dbAppt: any): Appointment => ({
  id: dbAppt.id,
  name: dbAppt.name,
  phone: dbAppt.phone,
  device: dbAppt.device,
  issueType: dbAppt.issuetype || dbAppt.issueType || "",
  details: dbAppt.details || "",
  date: dbAppt.date,
  timeSlot: dbAppt.timeslot || dbAppt.timeSlot || "",
  status: dbAppt.status,
  createdAt: dbAppt.createdat || dbAppt.createdAt || new Date().toISOString()
});

const mapLocalAppointmentToDB = (appt: any) => {
  const dbAppt: any = {};
  if (appt.id !== undefined) dbAppt.id = appt.id;
  if (appt.name !== undefined) dbAppt.name = appt.name;
  if (appt.phone !== undefined) dbAppt.phone = appt.phone;
  if (appt.device !== undefined) dbAppt.device = appt.device;
  if (appt.issueType !== undefined) dbAppt.issuetype = appt.issueType;
  if (appt.details !== undefined) dbAppt.details = appt.details;
  if (appt.date !== undefined) dbAppt.date = appt.date;
  if (appt.timeSlot !== undefined) dbAppt.timeslot = appt.timeSlot;
  if (appt.status !== undefined) dbAppt.status = appt.status;
  if (appt.createdAt !== undefined) dbAppt.createdat = appt.createdAt;
  return dbAppt;
};

export interface CartItem {
  product: Product;
  quantity: number;
}

export interface Appointment {
  id: string;
  name: string;
  phone: string;
  device: string;
  issueType: string;
  details?: string;
  date: string;
  timeSlot: string;
  status: "pending" | "in-progress" | "completed" | "cancelled";
  createdAt: string;
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

export interface SiteSettings {
  email: string;
  phone: string;
  socials: Array<{ platform: string; url: string; name: string }>;
  shippingFee: string;
  promoBanner: PromoBanner;
}

interface AppContextType {
  products: Product[];
  appointments: Appointment[];
  cartItems: CartItem[];
  wishlist: string[];
  siteSettings: SiteSettings;
  addProduct: (product: Omit<Product, "id">) => void;
  updateProduct: (id: string, product: Partial<Product>) => void;
  deleteProduct: (id: string) => void;
  addAppointment: (appointment: Omit<Appointment, "id" | "status" | "createdAt">) => void;
  updateAppointmentStatus: (id: string, status: Appointment["status"]) => void;
  deleteAppointment: (id: string) => void;
  addToCart: (product: Product) => void;
  removeFromCart: (productId: string) => void;
  updateCartQuantity: (productId: string, quantity: number) => void;
  clearCart: () => void;
  toggleWishlist: (productId: string) => void;
  updateSiteSettings: (settings: Partial<SiteSettings>) => Promise<void>;
  isInitialized: boolean;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export function AppProvider({ children }: { children: React.ReactNode }) {
  const [products, setProducts] = useState<Product[]>([]);
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [siteSettings, setSiteSettings] = useState<SiteSettings>({
    email: "support@mobileworld.com",
    phone: "0771 165 0096",
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
    }
  });
  const [wishlist, setWishlist] = useState<string[]>([]);
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
          
          setSiteSettings((prev) => ({
            email: contactObj?.email || prev.email,
            phone: contactObj?.phone || prev.phone,
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
            }
          }));
        }

        // Fetch appointments
        const { data: apptsData, error: apptsError } = await supabase
          .from("appointments")
          .select("*")
          .order('createdat', { ascending: false });
        
        if (apptsError) throw apptsError;
        if (apptsData) setAppointments(apptsData.map(mapDBAppointment));

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
    
    // Optimistic UI Update
    const updated = [product, ...products];
    setProducts(updated);

    // Supabase Update
    const { error } = await supabase.from("products").insert([mapLocalProductToDB(product)]);
    if (error) {
      console.error("Error adding product to Supabase", error);
      // Revert in real app, keeping simple here
    }
  };

  const updateProduct = async (id: string, updatedFields: Partial<Product>) => {
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
    }
  };

  const deleteProduct = async (id: string) => {
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
    }
  };

  // Appointment Actions
  const addAppointment = async (newAppt: Omit<Appointment, "id" | "status" | "createdAt">) => {
    const appt: Appointment = {
      ...newAppt,
      id: `booking-${Math.floor(1000 + Math.random() * 9000)}`,
      status: "pending",
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
  };

  const updateAppointmentStatus = async (id: string, status: Appointment["status"]) => {
    // Optimistic UI Update
    const updated = appointments.map((appt) =>
      appt.id === id ? { ...appt, status } : appt
    );
    setAppointments(updated);

    // Supabase Update
    const { error } = await supabase
      .from("appointments")
      .update({ status })
      .eq("id", id);
      
    if (error) {
      console.error("Error updating appointment in Supabase", error);
    }
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

  // Cart Actions (LocalStorage only)
  const addToCart = (product: Product) => {
    let updated: CartItem[];
    const existing = cartItems.find((item) => item.product.id === product.id);
    if (existing) {
      updated = cartItems.map((item) =>
        item.product.id === product.id
          ? { ...item, quantity: item.quantity + 1 }
          : item
      );
    } else {
      updated = [...cartItems, { product, quantity: 1 }];
    }
    setCartItems(updated);
    saveCartToStorage(updated);
  };

  const removeFromCart = (productId: string) => {
    const updated = cartItems.filter((item) => item.product.id !== productId);
    setCartItems(updated);
    saveCartToStorage(updated);
  };

  const updateCartQuantity = (productId: string, quantity: number) => {
    if (quantity <= 0) {
      removeFromCart(productId);
      return;
    }
    const updated = cartItems.map((item) =>
      item.product.id === productId ? { ...item, quantity } : item
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
    if (updated.email !== undefined || updated.phone !== undefined) {
      const contactVal = {
        email: updated.email !== undefined ? updated.email : siteSettings.email,
        phone: updated.phone !== undefined ? updated.phone : siteSettings.phone,
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
  };

  return (
    <AppContext.Provider
      value={{
        products,
        appointments,
        cartItems,
        siteSettings,
        addProduct,
        updateProduct,
        deleteProduct,
        addAppointment,
        updateAppointmentStatus,
        deleteAppointment,
        addToCart,
        removeFromCart,
        updateCartQuantity,
        clearCart,
        wishlist,
        toggleWishlist,
        updateSiteSettings,
        isInitialized,
      }}
    >
      {children}
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
