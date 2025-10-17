"use client";

import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { getSettingsManager, DEFAULT_SETTINGS, type Locale } from "@/app/setting/settings";
import zhCNMessages from "../../locales/zh-CN.json";
import zhTWMessages from "../../locales/zh-TW.json";
import enUSMessages from "../../locales/en-US.json";

export { type Locale } from "@/app/setting/settings";

// 语言列表和映射
const LOCALES: Locale[] = ["zh-CN", "zh-TW", "en-US"];
const MESSAGES_MAP: Record<Locale, Record<string, unknown>> = {
  "zh-CN": zhCNMessages,
  "zh-TW": zhTWMessages,
  "en-US": enUSMessages,
};

export const localeInfo: Record<Locale, { name: string; flag: string }> = {
  "zh-CN": { name: "简体中文", flag: "🇨🇳" },
  "zh-TW": { name: "繁體中文", flag: "🇹🇼" },
  "en-US": { name: "English", flag: "🇺🇸" },
};

interface I18nContextType {
  locale: Locale;
  setLocale: (locale: Locale) => void;
  t: (key: string) => string;
}

const I18nContext = createContext<I18nContextType | undefined>(undefined);

export function I18nProvider({ children }: { children: ReactNode }) {
  const [locale, setLocale] = useState<Locale>(DEFAULT_SETTINGS.locale);

  useEffect(() => {
    const getBrowserLocale = (): Locale => {
      if (typeof window === "undefined") return DEFAULT_SETTINGS.locale;

      const browserLang = navigator.language || navigator.languages?.[0];
      // 完全匹配或前缀匹配
      return LOCALES.find((locale) => browserLang === locale || browserLang?.startsWith(locale.split("-")[0])) || DEFAULT_SETTINGS.locale;
    };

    const hasSavedSettings = typeof window !== "undefined" && localStorage.getItem("appSettings") !== null;

    // 有设置用设置，无设置用浏览器语言
    const targetLocale = hasSavedSettings ? getSettingsManager().getSettings().locale : getBrowserLocale();

    // 首次访问时保存浏览器语言到设置
    if (!hasSavedSettings) {
      getSettingsManager().updateSettings({ locale: targetLocale });
    }

    setLocale(targetLocale);
    // 监听设置变更
    const handleSettingsChange = () => {
      setLocale(getSettingsManager().getSettings().locale);
    };
    if (typeof window !== "undefined") {
      window.addEventListener("settingsChange", handleSettingsChange);
      return () => window.removeEventListener("settingsChange", handleSettingsChange);
    }
  }, []);

  const messages = MESSAGES_MAP[locale] || MESSAGES_MAP[DEFAULT_SETTINGS.locale];

  // 文本翻译方法
  const t = (key: string): string => {
    const result = key.split(".").reduce<unknown>((obj, k) => {
      return obj && typeof obj === "object" && k in obj ? (obj as Record<string, unknown>)[k] : key;
    }, messages);
    return typeof result === "string" ? result : key;
  };

  // 更新语言设置
  const updateLocale = (newLocale: Locale) => {
    if (LOCALES.includes(newLocale)) {
      getSettingsManager().updateSettings({ locale: newLocale });
    }
  };

  return <I18nContext.Provider value={{ locale, setLocale: updateLocale, t }}>{children}</I18nContext.Provider>;
}

export function useI18n() {
  const context = useContext(I18nContext);
  if (!context) {
    throw new Error("useI18n must be used within an I18nProvider");
  }
  return context;
}
