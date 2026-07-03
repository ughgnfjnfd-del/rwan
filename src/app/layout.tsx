import type { Metadata } from "next";
import { Cairo } from "next/font/google";
import { AppProvider } from "@/context/AppContext";
import "./globals.css";

const cairo = Cairo({
  subsets: ["arabic", "latin"],
  weight: ["300", "400", "500", "600", "700", "800", "900"],
  variable: "--font-cairo",
});

export const metadata: Metadata = {
  title: " مركز الروان | Rwan Center - الهواتف والملحقات ومركز الصيانة المعتمد",
  description: "مركز الروان المعتمد لبيع أحدث الهواتف الذكية والملحقات وتقديم خدمات صيانة فورية وضمان معتمد.",
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
      <body className="min-h-full flex flex-col font-sans bg-[#fcfcfc] text-[#1a1a1a]">
        <AppProvider>{children}</AppProvider>
      </body>
    </html>
  );
}
