import { createClient } from '@supabase/supabase-js';

// Intercept console.error to suppress Next.js Dev Overlay for GoTrue/Supabase Auth refresh token issues
if (typeof window !== 'undefined') {
  const originalConsoleError = console.error;
  console.error = (...args: any[]) => {
    const errorStr = args.map(arg => {
      if (arg && typeof arg === 'object') {
        try {
          return arg.message || JSON.stringify(arg);
        } catch {
          return String(arg);
        }
      }
      return String(arg);
    }).join(' ');

    if (errorStr.includes('AuthApiError') && errorStr.includes('Refresh Token')) {
      // Quietly catch/suppress to prevent Next.js dev overlay from interrupting the user
      return;
    }
    originalConsoleError(...args);
  };
}

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  console.warn('Supabase credentials are not provided. Please set NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY in your .env.local file.');
}

export const supabase = createClient(
  supabaseUrl || 'https://placeholder.supabase.co',
  supabaseAnonKey || 'placeholder'
);

export const deleteImageFromSupabase = async (url: string) => {
  if (!url || !url.includes("/storage/v1/object/public/products/")) return;
  try {
    const marker = "/storage/v1/object/public/products/";
    const index = url.indexOf(marker);
    if (index !== -1) {
      const filePath = decodeURIComponent(url.substring(index + marker.length));
      const { error } = await supabase.storage.from("products").remove([filePath]);
      if (error) {
        console.error("Error removing file from Supabase Storage:", error);
      } else {
        console.log("Successfully removed old image from Supabase Storage:", filePath);
      }
    }
  } catch (err) {
    console.error("Failed to delete old image from storage:", err);
  }
};


