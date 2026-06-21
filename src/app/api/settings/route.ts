import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";

export const dynamic = "force-dynamic";

type SettingRow = {
  key: string;
  value: unknown;
};

const isRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === "object" && value !== null;

const readString = (value: unknown, fallback = "") =>
  typeof value === "string" ? value : fallback;

export async function GET() {
  try {
    const { data, error } = await supabase
      .from("site_settings")
      .select("key,value")
      .in("key", ["contact", "socials", "shipping", "promo_banner", "partner_site"]);

    if (error) {
      return NextResponse.json(
        { error: "Failed to load settings" },
        { status: 500 }
      );
    }

    const byKey = new Map<string, unknown>(
      ((data || []) as SettingRow[]).map((setting) => [setting.key, setting.value])
    );

    const contact = byKey.get("contact");
    const shipping = byKey.get("shipping");
    const partnerSite = byKey.get("partner_site");

    const response = NextResponse.json({
      settings: {
        email: isRecord(contact) ? readString(contact.email) : "",
        phone: isRecord(contact) ? readString(contact.phone) : "",
        socials: Array.isArray(byKey.get("socials")) ? byKey.get("socials") : [],
        shippingFee: isRecord(shipping) ? readString(shipping.fee) : "",
        promoBanner: isRecord(byKey.get("promo_banner")) ? byKey.get("promo_banner") : null,
        partnerSite: {
          name: isRecord(partnerSite) ? readString(partnerSite.name) : "",
          url: isRecord(partnerSite) ? readString(partnerSite.url) : "",
        },
      },
    });

    response.headers.set("Cache-Control", "no-store");
    return response;
  } catch (error) {
    console.error("Error in settings API:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
