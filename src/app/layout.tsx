import type { Metadata } from "next";
import { Cairo } from "next/font/google";
import { AppProvider } from "@/context/AppContext";
import "./globals.css";
import PWAInstallPrompt from "@/components/PWAInstallPrompt";
import MobileBottomNav from "@/components/MobileBottomNav";

const cairo = Cairo({
  subsets: ["arabic", "latin"],
  weight: ["300", "400", "500", "600", "700", "800", "900"],
  variable: "--font-cairo",
});

export const metadata: Metadata = {
  title: " مركز الروان |Al-Rwan Center - الهواتف والملحقات ومركز الصيانة المعتمد",
  description: "مركز الروان المعتمد لبيع أحدث الهواتف الذكية والملحقات وتقديم خدمات صيانة فورية وضمان معتمد.",
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "مركز الروان",
  },
};

export const viewport = {
  themeColor: "#0a0a0a",
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="ar"
      dir="rtl"
      className={`${cairo.variable} h-full antialiased`}
    >
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `
              if ('serviceWorker' in navigator) {
                window.addEventListener('load', function() {
                  navigator.serviceWorker.register('/sw.js').catch(function(err) {
                    console.log('ServiceWorker registration failed: ', err);
                  });
                });
              }
            `,
          }}
        />
      </head>
      <body className="min-h-full flex flex-col font-sans bg-[#fcfcfc] text-[#1a1a1a] pb-24 md:pb-0">
        <AppProvider>
          {children}
          <MobileBottomNav />
        </AppProvider>
        <PWAInstallPrompt />
      </body>
    </html>
  );
}
