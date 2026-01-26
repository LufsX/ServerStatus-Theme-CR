import type { Metadata } from "next";
import "./globals.css";
import { ThemeProvider } from "next-themes";
import { I18nProvider } from "@/lib/i18n/context";
import { ThemeInitializer } from "@/app/components/ThemeInitializer";

export const metadata: Metadata = {
  title: "Server Status",
  description: "实时监控各个服务器状态",
  icons: {
    icon: "./favicon.ico",
  },
  manifest: "/manifest.json",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="zh-CN" className="h-full" suppressHydrationWarning>
      <body className="antialiased min-h-full bg-gray-50 dark:bg-black">
        <ThemeProvider attribute="class" defaultTheme="system">
          <I18nProvider>
            <ThemeInitializer>{children}</ThemeInitializer>
          </I18nProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
