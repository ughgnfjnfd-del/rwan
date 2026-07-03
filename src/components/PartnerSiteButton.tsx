"use client";

import { useEffect, useMemo, useState } from "react";
import { Monitor } from "lucide-react";
import { PartnerSiteSettings, useApp } from "@/context/AppContext";

type PartnerSiteButtonVariant = "desktop" | "mobile" | "header-premium";

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
        className="flex items-center gap-3 p-3 mt-2 rounded-xl border border-sky-100 bg-sky-50 text-sky-700 shadow-sm transition-all duration-200 hover:bg-sky-100 active:scale-[0.98] font-bold md:hidden"
      >
        <Monitor className="h-5 w-5" />
        <span>{label}</span>
      </a>
    );
  }

  if (variant === "header-premium") {
    return (
      <a
        href={href}
        target="_blank"
        rel="noopener noreferrer"
        title={label}
        className="group relative inline-flex items-center justify-center overflow-hidden rounded-full p-0.5 font-bold transition-all hover:scale-105"
      >
        <span className="absolute inset-0 bg-gradient-to-r from-sky-400 via-blue-500 to-sky-400 opacity-70 group-hover:opacity-100 animate-pulse"></span>
        <div className="relative flex items-center gap-1.5 rounded-full bg-white px-2.5 py-1.5 sm:px-3 sm:py-1.5 text-[10px] sm:text-xs text-slate-800 transition-all group-hover:bg-transparent group-hover:text-white">
          <Monitor className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
          <span className="whitespace-nowrap">{label}</span>
        </div>
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
