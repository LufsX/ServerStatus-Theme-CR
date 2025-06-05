import type { Metadata } from "next";
import "./globals.css";
import { ThemeProvider } from "next-themes";

export const metadata: Metadata = {
  title: "Server Status",
  description: "实时监控各个服务器状态",
  icons: {
    icon: "./favicon.ico",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="zh-CN" className="h-full" suppressHydrationWarning>
      <body className="antialiased min-h-full bg-gray-50 dark:bg-gray-900">
        <ThemeProvider attribute="class" defaultTheme="system">
          {children}
        </ThemeProvider>
      </body>
    </html>
  );
}
