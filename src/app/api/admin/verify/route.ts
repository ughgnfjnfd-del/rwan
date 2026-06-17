import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

export async function POST(request: Request) {
  try {
    const { token } = await request.json();

    if (!token) {
      return NextResponse.json({ isAdmin: false, error: "Token is required" }, { status: 400 });
    }

    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

    if (!supabaseUrl || !supabaseAnonKey) {
      return NextResponse.json({ isAdmin: false, error: "Supabase not configured" }, { status: 500 });
    }

    // Create a supabase client with the user's token to verify authenticity
    const supabase = createClient(supabaseUrl, supabaseAnonKey, {
      auth: {
        persistSession: false,
        autoRefreshToken: false,
      }
    });

    // Get the user details using their JWT token
    const { data: { user }, error } = await supabase.auth.getUser(token);

    if (error || !user) {
      return NextResponse.json({ isAdmin: false, error: "Invalid token" }, { status: 401 });
    }

    // Check if user email is in the allowed admin list
    const allowedEmailsStr = process.env.ALLOWED_ADMIN_EMAILS || "admin@mobileworld.com,admin@rwan.com";
    const allowedEmails = allowedEmailsStr.split(",").map(e => e.trim().toLowerCase());

    if (user.email && allowedEmails.includes(user.email.toLowerCase())) {
      return NextResponse.json({ isAdmin: true });
    }

    return NextResponse.json({ isAdmin: false, error: "Not authorized as admin" }, { status: 403 });
  } catch (err: any) {
    console.error("Error in admin verification API:", err);
    return NextResponse.json({ isAdmin: false, error: "Internal server error" }, { status: 500 });
  }
}
