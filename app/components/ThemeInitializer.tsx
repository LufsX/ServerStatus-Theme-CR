"use client";

import { useThemeCustomization } from "@/lib/theme";

/**
 * 主题初始化组件
 * Theme initializer component that applies theme settings on application load
 * 
 * This component uses the useThemeCustomization hook to ensure theme CSS variables
 * are applied immediately when the application loads. It restores previously saved
 * theme settings from localStorage.
 */
export function ThemeInitializer({ children }: { children: React.ReactNode }) {
  // 使用主题定制 Hook，它会在 useEffect 中自动应用主题
  useThemeCustomization();

  return <>{children}</>;
}
