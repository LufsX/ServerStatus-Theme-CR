"use client";

import { useCallback, useEffect } from "react";
import { useSettings, type ColorScheme, type BorderStyle } from "@/app/setting/settings";

/**
 * 颜色配置接口
 * Color configuration interface for theme color schemes
 */
export interface ColorConfig {
  primary: string;           // 主色
  primaryHover: string;      // 悬停色
  primaryLight: string;      // 浅色背景
  primaryDark: string;       // 深色模式主色
  primaryDarkHover: string;  // 深色模式悬停色
  primaryDarkLight: string;  // 深色模式浅色背景
}

/**
 * 边框圆角配置接口
 * Border radius configuration interface
 */
export interface BorderRadiusConfig {
  none: string;
  sm: string;
  md: string;
  lg: string;
  full: string;
}

/**
 * 5 种色调配置
 * 5 color scheme configurations
 */
export const COLOR_SCHEMES: Record<ColorScheme, ColorConfig> = {
  blue: {
    primary: "#3b82f6",
    primaryHover: "#2563eb",
    primaryLight: "#dbeafe",
    primaryDark: "#60a5fa",
    primaryDarkHover: "#3b82f6",
    primaryDarkLight: "#1e3a5f",
  },
  green: {
    primary: "#22c55e",
    primaryHover: "#16a34a",
    primaryLight: "#dcfce7",
    primaryDark: "#4ade80",
    primaryDarkHover: "#22c55e",
    primaryDarkLight: "#14532d",
  },
  purple: {
    primary: "#a855f7",
    primaryHover: "#9333ea",
    primaryLight: "#f3e8ff",
    primaryDark: "#c084fc",
    primaryDarkHover: "#a855f7",
    primaryDarkLight: "#3b0764",
  },
  orange: {
    primary: "#f97316",
    primaryHover: "#ea580c",
    primaryLight: "#ffedd5",
    primaryDark: "#fb923c",
    primaryDarkHover: "#f97316",
    primaryDarkLight: "#431407",
  },
  rose: {
    primary: "#f43f5e",
    primaryHover: "#e11d48",
    primaryLight: "#ffe4e6",
    primaryDark: "#fb7185",
    primaryDarkHover: "#f43f5e",
    primaryDarkLight: "#4c0519",
  },
};

/**
 * 边框风格配置
 * Border style configurations: rounded (圆润) and sharp (硬朗)
 */
export const BORDER_STYLES: Record<BorderStyle, BorderRadiusConfig> = {
  rounded: {
    none: "0",
    sm: "0.125rem",   // 2px
    md: "0.375rem",   // 6px
    lg: "0.5rem",     // 8px
    full: "9999px",
  },
  sharp: {
    none: "0",
    sm: "0",
    md: "0",
    lg: "0",
    full: "0",
  },
};

/**
 * 获取所有可用的色调选项
 * Get all available color scheme options
 */
export function getColorSchemeOptions(): ColorScheme[] {
  return Object.keys(COLOR_SCHEMES) as ColorScheme[];
}

/**
 * 获取所有可用的边框风格选项
 * Get all available border style options
 */
export function getBorderStyleOptions(): BorderStyle[] {
  return Object.keys(BORDER_STYLES) as BorderStyle[];
}

/**
 * 将 HEX 颜色转换为 RGB 值
 * Convert HEX color to RGB values
 */
function hexToRgb(hex: string): string {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  if (!result) return "0, 0, 0";
  return `${parseInt(result[1], 16)}, ${parseInt(result[2], 16)}, ${parseInt(result[3], 16)}`;
}

/**
 * 检测当前是否为深色模式
 * Check if current theme is dark mode
 */
function isDarkMode(): boolean {
  if (typeof window === "undefined") return false;
  return document.documentElement.classList.contains("dark");
}

/**
 * 应用主题到 CSS 变量
 * Apply theme to CSS variables on document root
 * @param colorScheme - 色调方案
 * @param borderStyle - 边框风格
 */
export function applyTheme(colorScheme: ColorScheme, borderStyle: BorderStyle): void {
  // SSR 兼容性检查
  if (typeof window === "undefined") return;

  const root = document.documentElement;
  const colors = COLOR_SCHEMES[colorScheme];
  const radii = BORDER_STYLES[borderStyle];
  const dark = isDarkMode();

  // 根据当前主题模式设置颜色变量
  const primary = dark ? colors.primaryDark : colors.primary;
  const primaryHover = dark ? colors.primaryDarkHover : colors.primaryHover;
  const primaryLight = dark ? colors.primaryDarkLight : colors.primaryLight;
  const primaryRgb = hexToRgb(primary);

  root.style.setProperty("--color-primary", primary);
  root.style.setProperty("--color-primary-hover", primaryHover);
  root.style.setProperty("--color-primary-light", primaryLight);
  root.style.setProperty("--color-primary-rgb", primaryRgb);

  // 设置圆角变量 - Set border radius variables
  root.style.setProperty("--radius-sm", radii.sm);
  root.style.setProperty("--radius-md", radii.md);
  root.style.setProperty("--radius-lg", radii.lg);
  root.style.setProperty("--radius-full", radii.full);
}

// 存储当前色调方案，用于主题切换时重新应用
let currentColorScheme: ColorScheme = "blue";
let currentBorderStyle: BorderStyle = "rounded";

/**
 * 主题定制 Hook
 * Theme customization hook for managing color scheme and border style
 */
export function useThemeCustomization() {
  const { settings, updateSettings } = useSettings();

  // 更新存储的当前设置
  currentColorScheme = settings.colorScheme;
  currentBorderStyle = settings.borderStyle;

  // 应用主题的回调函数
  const applyCurrentTheme = useCallback(() => {
    applyTheme(settings.colorScheme, settings.borderStyle);
  }, [settings.colorScheme, settings.borderStyle]);

  // 在设置变化时应用主题
  useEffect(() => {
    applyCurrentTheme();
  }, [applyCurrentTheme]);

  // 监听深色/浅色模式切换
  useEffect(() => {
    const observer = new MutationObserver((mutations) => {
      mutations.forEach((mutation) => {
        if (mutation.attributeName === "class") {
          // 主题模式变化时重新应用颜色
          applyTheme(currentColorScheme, currentBorderStyle);
        }
      });
    });

    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ["class"],
    });

    return () => observer.disconnect();
  }, []);

  // 设置色调方案
  const setColorScheme = useCallback(
    (scheme: ColorScheme) => {
      updateSettings({ colorScheme: scheme });
    },
    [updateSettings]
  );

  // 设置边框风格
  const setBorderStyle = useCallback(
    (style: BorderStyle) => {
      updateSettings({ borderStyle: style });
    },
    [updateSettings]
  );

  return {
    colorScheme: settings.colorScheme,
    borderStyle: settings.borderStyle,
    setColorScheme,
    setBorderStyle,
  };
}