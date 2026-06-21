"use client";

import { useEffect, useMemo, useState } from "react";
import { Monitor } from "lucide-react";
import { PartnerSiteSettings, useApp } from "@/context/AppContext";

type PartnerSiteButtonVariant = "desktop" | "mobile";

interface PartnerSiteButtonProps {
  variant?: PartnerSiteButtonVariant;
}

interface SettingsApiResponse {
  settings?: {
    partnerSite?: Partial<PartnerSiteSettings> | null;
  };
}

const normalizePartnerSite = (
  value: Partial<PartnerSiteSettings> | null | undefined
): PartnerSiteSettings => ({
  name: typeof value?.name === "string" ? value.name : "",
  url: typeof value?.url === "string" ? value.url : "",
});

const getExternalHref = (url: string) => {
  const trimmedUrl = url.trim();
  if (!trimmedUrl) return "";
  return /^https?:\/\//i.test(trimmedUrl) ? trimmedUrl : `https://${trimmedUrl}`;
};

export default function PartnerSiteButton({ variant = "desktop" }: PartnerSiteButtonProps) {
  const { siteSettings } = useApp();
  const [apiPartnerSite, setApiPartnerSite] = useState<PartnerSiteSettings | null>(null);

  useEffect(() => {
    let isMounted = true;

    const loadPartnerSite = async () => {
      try {
        const response = await fetch("/api/settings", { cache: "no-store" });
        if (!response.ok) return;

        const data = (await response.json()) as SettingsApiResponse;
        if (isMounted && data.settings?.partnerSite) {
          setApiPartnerSite(normalizePartnerSite(data.settings.partnerSite));
        }
      } catch (error) {
        console.error("Failed to load partner site settings:", error);
      }
    };

    loadPartnerSite();

    return () => {
      isMounted = false;
    };
  }, []);

  const partnerSite = useMemo(() => {
    const apiSettings = normalizePartnerSite(apiPartnerSite);
    if (apiSettings.url.trim()) return apiSettings;
    return normalizePartnerSite(siteSettings.partnerSite);
  }, [apiPartnerSite, siteSettings.partnerSite]);

  const href = getExternalHref(partnerSite.url);
  if (!href) return null;

  const label = partnerSite.name.trim() || "PC Builds";

  if (variant === "mobile") {
    return (
      <a
        href={href}
        target="_blank"
        rel="noopener noreferrer"
        aria-label={label}
        title={label}
        className="inline-flex md:hidden h-10 w-10 items-center justify-center rounded-full border border-sky-200 bg-sky-50 text-sky-700 shadow-sm transition-all duration-200 hover:bg-sky-100 hover:text-sky-800 active:scale-95"
      >
        <Monitor className="h-4.5 w-4.5" />
        <span className="sr-only">{label}</span>
      </a>
    );
  }

  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      title={label}
      className="hidden md:inline-flex max-w-[190px] items-center gap-2 rounded-full border border-sky-200 bg-sky-50 px-3.5 py-2 text-xs font-black text-sky-700 shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:border-sky-300 hover:bg-sky-100 hover:text-sky-800 hover:shadow-md"
    >
      <Monitor className="h-4 w-4 flex-shrink-0" />
      <span className="truncate">{label}</span>
    </a>
  );
}
