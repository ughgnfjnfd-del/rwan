import { createClient } from '@supabase/supabase-js';

// Intercept console.error to suppress Next.js Dev Overlay for GoTrue/Supabase Auth refresh token issues
if (typeof window !== 'undefined') {
  const originalConsoleError = console.error;
  console.error = (...args: any[]) => {
    const errorStr = args.map(arg => {
      if (arg && typeof arg === 'object') {
        try {
          return arg.message || JSON.stringify(arg);
        } catch (_) {
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

