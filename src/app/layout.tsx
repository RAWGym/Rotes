import type { Metadata, Viewport } from "next";
import "./globals.css";
import { RegisterServiceWorker } from "@/components/register-service-worker";
import { QueryProvider } from "@/components/providers/query-provider";

export const metadata: Metadata = {
  title: "Rotes",
  description: "Премиальный цифровой планер: задачи, цели, события и заметки в одном месте",
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "Rotes",
  },
  icons: {
    icon: "/icons/icon-192.png",
    apple: "/icons/icon-192.png",
  },
};

export const viewport: Viewport = {
  themeColor: "#F8F4EF",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ru" className="h-full antialiased">
      <body className="min-h-full flex flex-col">
        <QueryProvider>
          <RegisterServiceWorker />
          {children}
        </QueryProvider>
      </body>
    </html>
  );
}
